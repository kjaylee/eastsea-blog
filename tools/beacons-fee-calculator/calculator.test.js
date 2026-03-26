const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  PLAN_PRESETS,
  PROCESSOR_PRESETS,
  DEFAULTS,
  resolvePlan,
  resolveProcessor,
  findRequiredGrossForNet,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  monthlyGrossSales: 4000,
  successfulSales: 80,
  refundRatePct: 2,
  affiliateShareRatePct: 15,
  planPreset: 'free',
  customPlanFeeRatePct: 9,
  customPlanMonthlyCost: 0,
  processorPreset: 'stripe',
  customProcessorRatePct: 2.9,
  customProcessorFlatFee: 0.3,
  otherMonthlyCost: 250,
  desiredMonthlyNetProfit: 2000
};

test('exports required Beacons constants and presets', () => {
  assert.equal(DEFAULTS.monthlyGrossSales, 4000);
  assert.equal(PLAN_PRESETS.length, 8);
  assert.equal(PROCESSOR_PRESETS.length, 3);
  assert.equal(resolvePlan(baseInput).feeRatePct, 9);
  assert.equal(resolvePlan({ ...baseInput, planPreset: 'creator-plus-monthly' }).monthlyCost, 30);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'paypal-us' }).flatFee, 0.49);
});

test('TC-BE-01 baseline Free + Stripe scenario matches expected math', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.refundLoss, 80);
  approx(result.recognizedSales, 3920);
  approx(result.affiliatePayout, 588);
  approx(result.beaconsFees, 299.88);
  approx(result.processorFees, 137.68);
  approx(result.payoutBeforeFixedCosts, 2894.44);
  approx(result.monthlyNetProfit, 2644.44);
  approx(result.annualizedNetProfit, 31733.28);
  approx(result.averageOrderValue, 50);
  approx(result.takeHomeRatePct, 66.11);
  approx(result.effectiveDragRatePct, 27.64);
  approx(result.breakEvenGrossSales, 345.49);
  approx(result.requiredGrossForTargetNet, 3109.41, 0.02);
});

test('TC-BE-02 Creator Plus monthly beats Free at this sales level', () => {
  const free = calculate(baseInput, { lang: 'en' }).result;
  const plus = calculate({ ...baseInput, planPreset: 'creator-plus-monthly' }, { lang: 'en' }).result;

  assert.ok(plus.monthlyNetProfit > free.monthlyNetProfit);
  approx(plus.beaconsFees, 0);
  approx(plus.monthlyNetProfit, 2914.32);
});

test('TC-BE-03 annual preset improves on monthly plan cost', () => {
  const creatorMonthly = calculate({ ...baseInput, planPreset: 'creator-monthly' }, { lang: 'en' }).result;
  const creatorAnnual = calculate({ ...baseInput, planPreset: 'creator-annual' }, { lang: 'en' }).result;

  assert.ok(creatorAnnual.monthlyNetProfit > creatorMonthly.monthlyNetProfit);
  approx(creatorAnnual.monthlyPlanCost, 8.33, 0.01);
});

test('TC-BE-04 custom processor override changes fee drag deterministically', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 4.2,
    customProcessorFlatFee: 0.6
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processorFees, 212.64);
  approx(result.monthlyNetProfit, 2569.48);
});

test('TC-BE-05 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, monthlyGrossSales: 0 },
    { ...baseInput, successfulSales: 0 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, affiliateShareRatePct: 100 },
    { ...baseInput, planPreset: 'missing' },
    { ...baseInput, processorPreset: 'missing' },
    { ...baseInput, customPlanMonthlyCost: -1 },
    { ...baseInput, customProcessorFlatFee: -0.01 },
    { ...baseInput, otherMonthlyCost: -1 },
    { ...baseInput, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-BE-06 non-positive contribution margin returns null break-even fields', () => {
  const { result, error } = calculate({
    ...baseInput,
    planPreset: 'custom',
    customPlanFeeRatePct: 95,
    customPlanMonthlyCost: 400,
    processorPreset: 'custom',
    customProcessorRatePct: 90,
    customProcessorFlatFee: 2
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenGrossSales, null);
  assert.equal(result.requiredGrossForTargetNet, null);
  assert.ok(result.monthlyNetProfit < 0);
});

test('TC-BE-07 summary includes key decision fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[Beacons Fee Calculator Summary\]/);
  assert.match(result.summary, /Current plan: Free/);
  assert.match(result.summary, /Processor: Stripe/);
  assert.match(result.summary, /Beacons fees: \$299\.88/);
  assert.match(result.summary, /Monthly net profit: \$2,644\.44/);
});

test('TC-BE-08 comparison rows cover standard Beacons plans', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 7);
  assert.deepEqual(result.comparisonRows.slice(0, 3).map((row) => row.id), ['free', 'creator-monthly', 'creator-annual']);
});

test('TC-BE-09 helper break-even function matches calculate output', () => {
  const breakEven = findRequiredGrossForNet(baseInput, 0);
  const { result } = calculate(baseInput, { lang: 'en' });
  approx(result.breakEvenGrossSales, breakEven, 0.01);
});

test('TC-BE-10 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'planPreset', 'processorPreset', 'comparisonBody', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Beacons Fee Calculator|비컨스 수수료 계산기/);
});

test('TC-BE-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'beacons-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
