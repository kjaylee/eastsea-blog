const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PLANS,
  PROCESSOR_PRESETS,
  resolveProcessor,
  getPlanMonthlyFee
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('exports Stan plans and processor presets', () => {
  assert.equal(DEFAULTS.planBillingPeriod, 'monthly');
  assert.equal(PLANS.length, 2);
  assert.equal(PROCESSOR_PRESETS.length, 7);
  assert.equal(resolveProcessor('stripe-standard', 1, 1).ratePct, 2.9);
  assert.equal(resolveProcessor('custom', 4.5, 0.65).flatFee, 0.65);
  approx(getPlanMonthlyFee('creator', 'monthly'), 29);
  approx(getPlanMonthlyFee('creator-pro', 'annual'), 79);
});

test('TC-STAN-01 default baseline favors Creator Pro when uplift is meaningful', () => {
  const { result, error } = calculate(DEFAULTS);

  assert.equal(error, '');
  approx(result.creator.monthlyNetProfit, 6510.2);
  approx(result.creatorPro.monthlyNetProfit, 7801.97);
  approx(result.deltaMonthlyNetProfit, 1291.77);
  approx(result.deltaAnnualNetProfit, 15501.24);
  approx(result.creator.processorFees, 244.8);
  approx(result.creatorPro.processorFees, 346.88);
  approx(result.breakEvenIncrementalGrossSales, 129.6);
  assert.equal(result.breakEvenIncrementalOrders, 2);
  assert.equal(result.recommendedPlanId, 'creator-pro');
});

test('TC-STAN-02 no Pro lift keeps Creator ahead', () => {
  const { result, error } = calculate({
    ...DEFAULTS,
    proOrderLiftPct: 0,
    proAovLiftPct: 0,
    proPaymentPlanSharePct: 0,
    paymentPlanPreset: 'stripe-standard'
  });

  assert.equal(error, '');
  approx(result.creator.monthlyNetProfit, 6510.2);
  approx(result.creatorPro.monthlyNetProfit, 6440.2);
  approx(result.deltaMonthlyNetProfit, -70);
  approx(result.deltaAnnualNetProfit, -840);
  approx(result.breakEvenIncrementalGrossSales, 120);
  assert.equal(result.breakEvenIncrementalOrders, 2);
  assert.equal(result.recommendedPlanId, 'creator');
});

test('TC-STAN-03 annual billing lowers the upgrade hurdle', () => {
  const { result, error } = calculate({
    ...DEFAULTS,
    planBillingPeriod: 'annual',
    proOrderLiftPct: 0,
    proAovLiftPct: 0,
    proPaymentPlanSharePct: 0,
    paymentPlanPreset: 'stripe-standard'
  });

  assert.equal(error, '');
  approx(result.creator.monthlyNetProfit, 6514.2);
  approx(result.creatorPro.monthlyNetProfit, 6460.2);
  approx(result.planFeeGap, 54);
  approx(result.deltaMonthlyNetProfit, -54);
  approx(result.breakEvenIncrementalGrossSales, 60);
  assert.equal(result.breakEvenIncrementalOrders, 1);
});

test('TC-STAN-04 impossible contribution returns null target thresholds', () => {
  const { result, error } = calculate({
    ...DEFAULTS,
    standardProcessorPreset: 'custom',
    customStandardProcessorRatePct: 95,
    customStandardProcessorFlatFee: 40,
    paymentPlanPreset: 'custom',
    customPaymentPlanRatePct: 95,
    customPaymentPlanFlatFee: 40,
    proOrderLiftPct: 0,
    proAovLiftPct: 0,
    proPaymentPlanSharePct: 0
  });

  assert.equal(error, '');
  assert.equal(result.creator.requiredOrdersForTarget, null);
  assert.equal(result.creatorPro.requiredOrdersForTarget, null);
  assert.equal(result.breakEvenIncrementalOrders, null);
  assert.ok(result.creator.contributionPerOrder < 0);
});

test('TC-STAN-05 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...DEFAULTS, averageOrderValue: 0 },
    { ...DEFAULTS, monthlyOrders: -1 },
    { ...DEFAULTS, refundRatePct: 100 },
    { ...DEFAULTS, standardProcessorPreset: 'missing' },
    { ...DEFAULTS, paymentPlanPreset: 'missing' },
    { ...DEFAULTS, customStandardProcessorRatePct: 100 },
    { ...DEFAULTS, customPaymentPlanFlatFee: -0.01 },
    { ...DEFAULTS, otherMonthlyCost: -1 },
    { ...DEFAULTS, desiredMonthlyNetProfit: -1 },
    { ...DEFAULTS, proPaymentPlanSharePct: 100 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-STAN-06 summary includes decision-ready outputs', () => {
  const { result, error } = calculate(DEFAULTS);

  assert.equal(error, '');
  assert.match(result.summary, /\[Stan Store Fee Calculator Summary\]/);
  assert.match(result.summary, /Billing period: monthly/);
  assert.match(result.summary, /Creator monthly net: \$6,510\.20/);
  assert.match(result.summary, /Creator Pro monthly net: \$7,801\.97/);
  assert.match(result.summary, /Monthly delta \(Pro - Creator\): \$1,291\.77/);
  assert.match(result.summary, /Recommended plan under these assumptions: Creator Pro/);
});

test('TC-STAN-07 html contains required product and fee tokens', () => {
  for (const token of [
    'Stan Store Fee Calculator',
    'Creator vs Creator Pro',
    'Stripe standard · 2.9% + $0.30',
    'Afterpay · 6.0% + $0.30',
    'Copy summary',
    'summary',
    '/assets/analytics.js',
    'script defer src="./calculator.js"'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-STAN-08 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'stan-store-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
