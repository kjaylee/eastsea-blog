const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const calc = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

test('default publisher scenario matches golden outputs', () => {
  const result = calc.calculateScenario(calc.DEFAULTS);

  assert.equal(result.ok, true);
  approx(result.monthlyRecurringGross, 1980);
  approx(result.annualMonthlyEquivalentGross, 450);
  approx(result.grossMonthlyEquivalentRevenue, 3030);
  approx(result.estimatedTransactionCount, 245, 0.0001);
  approx(result.refundLoss, 60.6);
  approx(result.processorVariableFees, 87.87);
  approx(result.processorFixedFees, 73.5);
  approx(result.processorTotalFees, 161.37);
  approx(result.ghostMonthlyCost, 29);
  approx(result.netTakeHome, 2629.03);
  approx(result.effectiveTakeHomePct, 86.7667, 0.0002);
  approx(result.breakEvenGrossMonthlyRevenue, 193.15, 0.05);
  approx(result.targetGrossMonthlyRevenue, 3430.25, 0.05);
  assert.equal(result.requiredPaidMembersForTarget, 327);
  assert.equal(result.additionalPaidMembersNeeded, 47);
});

test('self-hosted preset removes Ghost monthly plan cost', () => {
  const result = calc.calculateScenario({
    ...calc.DEFAULTS,
    planPreset: 'selfHosted',
  });

  assert.equal(result.ok, true);
  approx(result.ghostMonthlyCost, 0);
  approx(result.netTakeHome, 2658.03);
  assert.match(result.summary, /Self-hosted Ghost/);
  assert.ok(result.warnings.some((warning) => warning.includes('hosting')));
});

test('Ghost(Pro) Starter blocks paid memberships and tips', () => {
  const result = calc.calculateScenario({
    ...calc.DEFAULTS,
    planPreset: 'starter',
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Starter does not support paid subscriptions or tips/);
});

test('custom monthly cost is used when preset is custom', () => {
  const result = calc.calculateScenario({
    ...calc.DEFAULTS,
    planPreset: 'custom',
    customMonthlyCost: 85,
  });

  assert.equal(result.ok, true);
  approx(result.ghostMonthlyCost, 85);
  approx(result.netTakeHome, 2573.03);
});

test('one-time revenue requires one-time payment count', () => {
  const result = calc.calculateScenario({
    ...calc.DEFAULTS,
    oneTimeRevenue: 300,
    oneTimePayments: 0,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /one-time payments must be at least 1/i);
});

test('negative contribution margin nulls break-even outputs', () => {
  const result = calc.calculateScenario({
    ...calc.DEFAULTS,
    monthlyPrice: 1,
    monthlyMembers: 20,
    annualPrice: 12,
    annualMembers: 0,
    oneTimeRevenue: 0,
    oneTimePayments: 0,
    processorRatePct: 10,
    processorFixedFee: 1.5,
    refundRatePct: 20,
    otherMonthlyCosts: 50,
  });

  assert.equal(result.ok, true);
  assert.equal(result.breakEvenGrossMonthlyRevenue, null);
  assert.equal(result.targetGrossMonthlyRevenue, null);
  assert.equal(result.requiredPaidMembersForTarget, null);
  assert.equal(result.health, 'bad');
});

test('summary contains target and take-home fields', () => {
  const result = calc.calculateScenario(calc.DEFAULTS);

  assert.equal(result.ok, true);
  assert.match(result.summary, /Net take-home/);
  assert.match(result.summary, /Required gross for target/);
  assert.match(result.summary, /Paid members needed for target/);
});

test('discovery exact-once wiring is present after catalog updates', () => {
  const slug = 'ghost-membership-fee-calculator';
  const url = '/tools/ghost-membership-fee-calculator/';
  const repoRoot = path.join(__dirname, '..', '..');
  const indexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(
    manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length,
    1,
    'manifest exact-once'
  );
});
