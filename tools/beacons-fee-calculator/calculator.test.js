const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  calculate,
  DEFAULTS,
  PLAN_PRESETS,
  CONSTANTS,
  findRequiredGross
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  monthlyGrossSales: 5000,
  monthlyOrders: 80,
  refundRatePct: 2,
  planTier: 'creator',
  averageVariableCostPerOrder: 12,
  otherMonthlyCost: 300,
  desiredMonthlyNetProfit: 2500
};

test('exports expected presets and defaults', () => {
  assert.equal(DEFAULTS.monthlyGrossSales, 5000);
  assert.equal(PLAN_PRESETS.free.monthlyFee, 0);
  assert.equal(PLAN_PRESETS.creator.monthlyFee, 10);
  assert.equal(PLAN_PRESETS.creatorPlus.beaconsFeePct, 0);
  assert.equal(PLAN_PRESETS.creatorMax.monthlyFee, 90);
  assert.equal(CONSTANTS.STRIPE_RATE_PCT, 2.9);
  assert.equal(CONSTANTS.STRIPE_FIXED_FEE, 0.3);
});

test('TC-BC-01 baseline Creator scenario', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.monthlyPlanFee, 10);
  approx(result.beaconsFeePct, 9);
  approx(result.beaconsFees, 450);
  approx(result.stripeFees, 169);
  approx(result.refundLoss, 100);
  approx(result.variableCostTotal, 960);
  approx(result.takeHomeAfterPlatformCosts, 3311);
  approx(result.monthlyNetProfit, 3011);
  approx(result.effectiveFeeRatePct, 31.78);
  approx(result.averageOrderValue, 62.5);
});

test('TC-BC-02 Free beats Creator by exactly $10 at same sales', () => {
  const creator = calculate(baseline, { lang: 'en' }).result;
  const free = calculate({ ...baseline, planTier: 'free' }, { lang: 'en' }).result;

  approx(creator.monthlyPlanFee - free.monthlyPlanFee, 10);
  approx(free.monthlyNetProfit - creator.monthlyNetProfit, 10);
});

test('TC-BC-03 Creator Plus removes the 9% platform fee', () => {
  const creator = calculate(baseline, { lang: 'en' }).result;
  const plus = calculate({ ...baseline, planTier: 'creatorPlus' }, { lang: 'en' }).result;

  approx(plus.monthlyPlanFee, 30);
  approx(plus.beaconsFeePct, 0);
  approx(plus.beaconsFees, 0);
  approx(plus.monthlyNetProfit - creator.monthlyNetProfit, 430);
});

test('TC-BC-04 Creator Max keeps 0% but adds higher fixed cost', () => {
  const plus = calculate({ ...baseline, planTier: 'creatorPlus' }, { lang: 'en' }).result;
  const max = calculate({ ...baseline, planTier: 'creatorMax' }, { lang: 'en' }).result;

  approx(max.beaconsFeePct, 0);
  approx(max.monthlyPlanFee, 90);
  approx(plus.monthlyNetProfit - max.monthlyNetProfit, 60);
});

test('TC-BC-05 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, monthlyGrossSales: 0 },
    { ...baseline, monthlyOrders: 0 },
    { ...baseline, monthlyOrders: 1.5 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, planTier: 'vip' },
    { ...baseline, averageVariableCostPerOrder: -1 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-BC-06 solver returns a higher gross for a higher target', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.breakEvenMonthlyGrossSales > 0);
  assert.ok(result.requiredMonthlyGrossForTargetNet > result.breakEvenMonthlyGrossSales);
  approx(result.breakEvenMonthlyGrossSales, findRequiredGross(baseline, 0, PLAN_PRESETS.creator), 0.01);
});

test('TC-BC-07 comparison table covers all Beacons plans', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 4);
  assert.deepEqual(result.comparisonRows.map((row) => row.id), ['free', 'creator', 'creatorPlus', 'creatorMax']);
  assert.equal(result.comparisonRows[0].beaconsFeePct, 9);
  assert.equal(result.comparisonRows[1].beaconsFeePct, 9);
  assert.equal(result.comparisonRows[2].beaconsFeePct, 0);
  assert.equal(result.comparisonRows[3].beaconsFeePct, 0);
});

test('TC-BC-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Plan tier: Creator/);
  assert.match(result.summary, /Beacons fee rate: 9\.00%/);
  assert.match(result.summary, /Monthly gross sales: \$5,000\.00/);
  assert.match(result.summary, /Beacons fees: \$450\.00/);
  assert.match(result.summary, /Stripe fees: \$169\.00/);
  assert.match(result.summary, /Monthly net profit: \$3,011\.00/);
});

test('TC-BC-09 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'monthlyGrossSales',
    'monthlyOrders',
    'refundRatePct',
    'planTier',
    'averageVariableCostPerOrder',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit',
    'comparisonBody',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Beacons Fee Calculator \| 비컨스 수수료 계산기/);
});

test('TC-BC-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'beacons-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  let manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  if (!manifest.tools.some((entry) => entry.slug === slug && entry.url === url)) {
    execFileSync('bash', ['scripts/build-manifests.sh'], { cwd: root, stdio: 'ignore' });
    manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  }

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
