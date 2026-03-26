'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULT_INPUTS, validateInputs } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, 'expected ' + actual + ' ≈ ' + expected + ' (±' + tolerance + ')');
}

test('exports defaults and validator', () => {
  assert.equal(DEFAULT_INPUTS.monthlyMembers, 320);
  assert.equal(DEFAULT_INPUTS.annualMembers, 80);
  assert.equal(validateInputs(DEFAULT_INPUTS, 'en').ok, true);
});

test('TC-01 baseline mixed Ghost membership economics', () => {
  const response = calculate(DEFAULT_INPUTS, { lang: 'en' });
  assert.equal(response.ok, true);

  const result = response.result;
  approx(result.grossMonthlyEquivalent, 3480);
  approx(result.refundDrag, 69.6);
  approx(result.keptAfterRefunds, 3410.4);
  approx(result.stripeVariableFees, 98.9016, 0.001);
  approx(result.stripeFixedFees, 98);
  approx(result.supportCost, 240);
  approx(result.totalCosts, 537.5016, 0.001);
  approx(result.netMonthlyEquivalent, 2942.4984, 0.001);
  approx(result.annualizedNetRunRate, 35309.9808, 0.001);
  approx(result.effectiveCostRatePct, 15.4454482759, 0.001);
  approx(result.monthlyMemberContribution, 7.66422, 0.001);
  approx(result.annualMemberContributionMonthlyEquivalent, 6.51185, 0.001);
  assert.equal(result.membersToCoverGhostPlan, 5);
  assert.equal(result.activeMembersForTargetNet, 408);
});

test('TC-02 annual-heavy mix keeps positive contribution and lowers fixed-fee drag', () => {
  const response = calculate({
    monthlyMembers: 120,
    annualMembers: 240,
    monthlyPrice: 10,
    annualPrice: 96,
    ghostPlanCost: 39,
    stripeFeeRatePct: 2.9,
    stripeFixedFee: 0.30,
    refundRatePct: 1.5,
    supportCostPerMember: 0.75,
    targetMonthlyNetIncome: 2500
  }, { lang: 'en' });

  assert.equal(response.ok, true);
  const result = response.result;
  assert.ok(result.annualMemberContributionMonthlyEquivalent > 0);
  assert.ok(result.monthlyMemberContribution > result.annualMemberContributionMonthlyEquivalent);
  assert.ok(result.stripeFixedFees < (120 + 240) * 0.30);
  assert.ok(result.activeMembersForTargetNet < result.totalActiveMembers);
});

test('TC-03 validation rejects invalid inputs', () => {
  const response = calculate({
    monthlyMembers: -1,
    annualMembers: 3.5,
    monthlyPrice: 0,
    annualPrice: -10,
    ghostPlanCost: -1,
    stripeFeeRatePct: 101,
    stripeFixedFee: -0.1,
    refundRatePct: 100,
    supportCostPerMember: -5,
    targetMonthlyNetIncome: -100
  }, { lang: 'en' });

  assert.equal(response.ok, false);
  assert.ok(response.errors.length >= 8);
});

test('TC-04 impossible economics nulls target and break-even outputs', () => {
  const response = calculate({
    monthlyMembers: 40,
    annualMembers: 10,
    monthlyPrice: 2,
    annualPrice: 12,
    ghostPlanCost: 49,
    stripeFeeRatePct: 20,
    stripeFixedFee: 1.5,
    refundRatePct: 25,
    supportCostPerMember: 2.5,
    targetMonthlyNetIncome: 500
  }, { lang: 'en' });

  assert.equal(response.ok, true);
  const result = response.result;
  assert.ok(result.monthlyMemberContribution <= 0);
  assert.equal(result.membersToCoverGhostPlan, null);
  assert.equal(result.activeMembersForTargetNet, null);
  assert.ok(result.netMonthlyEquivalent < 0);
});

test('TC-05 summary contains required decision fields', () => {
  const response = calculate(DEFAULT_INPUTS, { lang: 'en' });
  assert.equal(response.ok, true);
  const summary = response.result.summary;

  assert.match(summary, /\[Ghost Membership Revenue Summary\]/);
  assert.match(summary, /Monthly-equivalent gross:/);
  assert.match(summary, /Monthly-equivalent net:/);
  assert.match(summary, /Annualized net run-rate:/);
  assert.match(summary, /Members to cover Ghost plan:/);
  assert.match(summary, /Active members needed for target monthly net:/);
});

test('TC-06 HTML scaffold contains required Ghost UI and scripts', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Ghost Membership Revenue Calculator | Ghost 멤버십 수익 계산기',
    'langBtn',
    'copySummaryBtn',
    'resetDefaultsBtn',
    'summaryOutput',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Ghost/i);
  assert.match(html, /멤버십/);
});

test('TC-07 catalog wiring exists exactly once across discovery surfaces', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'ghost-membership-revenue-calculator';
  const url = '/tools/' + slug + '/';
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
});
