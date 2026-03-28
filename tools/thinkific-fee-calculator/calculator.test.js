const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  CONSTANTS,
  PLAN_PRESETS,
  PROCESSOR_PRESETS,
  DEFAULTS,
  resolvePlanMonthlyCost,
  computeThirdPartyGatewayFee,
  evaluateScenario,
  findGrossThreshold,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  planTier: 'basic',
  billingMode: 'monthly',
  ordersPerMonth: 40,
  averageOrderValue: 150,
  paymentSetup: 'third-party-gateway',
  processorPreset: 'us-card',
  processingVariableRatePct: 2.9,
  processingFixedFee: 0.30,
  isSubscriptionOrPaymentPlan: false,
  applySalesTaxVatSolutionFee: false,
  refundRatePct: 3,
  yearToDateThirdPartySales: 0,
  otherMonthlyCosts: 300,
  desiredMonthlyNetProfit: 4000
};

test('TC-TH-01 baseline Basic + third-party scenario', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.monthlyGrossSales, 6000);
  approx(result.selectedPlanCost, 49);
  approx(result.refundLoss, 180);
  approx(result.processingFees, 186);
  approx(result.thirdPartyGatewayFee, 300);
  approx(result.takeHomeAfterPlatformAndPayments, 5285);
  approx(result.monthlyNetProfit, 4985);
  approx(result.effectiveTakeRatePct, 11.9167, 0.0001);
  assert.equal(result.breakEvenOrders, 3);
  assert.equal(result.requiredOrdersForTargetNet, 33);
});

test('TC-TH-02 Basic → Start threshold flips recommendation', () => {
  const { result } = calculate({
    ...baseline,
    planTier: 'basic',
    ordersPerMonth: 30,
    averageOrderValue: 200,
    refundRatePct: 0,
    otherMonthlyCosts: 0,
    desiredMonthlyNetProfit: 0
  }, { lang: 'en' });

  const basic = result.comparisonRows.find((row) => row.planId === 'basic');
  const start = result.comparisonRows.find((row) => row.planId === 'start');
  assert.ok(start.monthlyNetProfit > basic.monthlyNetProfit);
  assert.equal(result.recommendedPlanId, 'start');
});

test('TC-TH-03 below-threshold scenario keeps Basic as winner', () => {
  const { result } = calculate({
    ...baseline,
    ordersPerMonth: 10,
    averageOrderValue: 100,
    refundRatePct: 0,
    otherMonthlyCosts: 0,
    desiredMonthlyNetProfit: 0
  }, { lang: 'en' });

  const basic = result.comparisonRows.find((row) => row.planId === 'basic');
  const start = result.comparisonRows.find((row) => row.planId === 'start');
  assert.ok(basic.monthlyNetProfit > start.monthlyNetProfit);
  assert.equal(result.recommendedPlanId, 'basic');
});

test('TC-TH-04 Start → Grow threshold is respected', () => {
  const { result } = calculate({
    ...baseline,
    planTier: 'start',
    ordersPerMonth: 60,
    averageOrderValue: 200,
    refundRatePct: 0,
    otherMonthlyCosts: 0,
    desiredMonthlyNetProfit: 0
  }, { lang: 'en' });

  const start = result.comparisonRows.find((row) => row.planId === 'start');
  const grow = result.comparisonRows.find((row) => row.planId === 'grow');
  assert.ok(grow.monthlyNetProfit > start.monthlyNetProfit);
  assert.equal(result.recommendedPlanId, 'grow');
});

test('TC-TH-05 Thinkific Payments removes extra gateway fee', () => {
  const { result } = calculate({
    ...baseline,
    paymentSetup: 'thinkific-payments',
    planTier: 'basic'
  }, { lang: 'en' });

  assert.equal(result.thirdPartyGatewayFee, 0);
  assert.equal(result.thresholds.basicToStartGrossThreshold, null);
  assert.equal(result.thresholds.startToGrowGrossThreshold, null);
});

test('TC-TH-06 partial $1M cap crossing', () => {
  const gateway = computeThirdPartyGatewayFee({
    ...baseline,
    planTier: 'start',
    ordersPerMonth: 50,
    averageOrderValue: 200,
    yearToDateThirdPartySales: 998000
  }, 10000, PLAN_PRESETS.start);

  approx(gateway.remainingCapBeforeCurrentMonth, 2000);
  approx(gateway.feeExposedGross, 2000);
  approx(gateway.thirdPartyGatewayFee, 40);
  approx(gateway.remainingCapAfterCurrentMonth, 0);
});

test('TC-TH-07 already above cap', () => {
  const { result } = calculate({
    ...baseline,
    yearToDateThirdPartySales: CONSTANTS.SALES_CAP_USD
  }, { lang: 'en' });

  assert.equal(result.thirdPartyGatewayFee, 0);
  assert.equal(result.feeExposedGross, 0);
  assert.equal(result.remainingCapAfterCurrentMonth, 0);
});

test('TC-TH-08 subscription surcharge applies only on Thinkific Payments', () => {
  const thirdParty = evaluateScenario({
    ...baseline,
    isSubscriptionOrPaymentPlan: true
  });
  const native = evaluateScenario({
    ...baseline,
    paymentSetup: 'thinkific-payments',
    isSubscriptionOrPaymentPlan: true
  });

  approx(thirdParty.effectiveProcessingVariableRatePct, 2.9);
  approx(native.effectiveProcessingVariableRatePct, 3.6);
});

test('TC-TH-09 sales-tax solution fee toggle adds 0.5%', () => {
  const withTax = evaluateScenario({
    ...baseline,
    paymentSetup: 'thinkific-payments',
    applySalesTaxVatSolutionFee: true
  });

  approx(withTax.effectiveProcessingVariableRatePct, 3.4);
});

test('TC-TH-10 annual billing lowers fixed-plan drag', () => {
  assert.equal(resolvePlanMonthlyCost('basic', 'monthly'), 49);
  assert.equal(resolvePlanMonthlyCost('basic', 'annual'), 36);
});

test('TC-TH-11 contribution guard returns null on impossible economics', () => {
  const { result } = calculate({
    ...baseline,
    ordersPerMonth: 1,
    averageOrderValue: 10,
    paymentSetup: 'thinkific-payments',
    processorPreset: 'custom',
    processingVariableRatePct: 90,
    processingFixedFee: 10,
    refundRatePct: 9
  }, { lang: 'en' });

  assert.equal(result.breakEvenOrders, null);
  assert.equal(result.requiredOrdersForTargetNet, null);
});

test('TC-TH-12 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...baseline, averageOrderValue: -1 },
    { ...baseline, ordersPerMonth: 0 },
    { ...baseline, ordersPerMonth: 1.5 },
    { ...baseline, planTier: 'plus' },
    { ...baseline, paymentSetup: 'cash' },
    { ...baseline, yearToDateThirdPartySales: -1 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, otherMonthlyCosts: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-TH-13 summary text is decision-ready', () => {
  const { result } = calculate(baseline, { lang: 'en' });

  assert.match(result.summary, /\[Thinkific Fee Calculator Summary\]/);
  assert.match(result.summary, /Plan: Basic/);
  assert.match(result.summary, /Monthly gross sales:/);
  assert.match(result.summary, /Payment setup:/);
  assert.match(result.summary, /Extra Thinkific gateway fee:/);
  assert.match(result.summary, /Monthly net profit:/);
  assert.match(result.summary, /Upgrade thresholds:/);
});

test('TC-TH-14 HTML scaffold anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  [
    'rel="canonical"',
    '/assets/analytics.js',
    'comparisonTableBody',
    'summary',
    './calculator.js',
    'planTier',
    'billingMode',
    'ordersPerMonth',
    'averageOrderValue',
    'paymentSetup',
    'processorPreset',
    'yearToDateThirdPartySales'
  ].forEach((token) => {
    assert.ok(html.includes(token), token);
  });

  assert.match(html, /Thinkific Fee Calculator/);
  assert.match(html, /\$1,000,000 annual cap logic/);
  assert.match(html, /Thinkific Payments vs third-party gateway/);
});

test('TC-TH-15 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'thinkific-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});

test('TC-TH-16 related-link cluster coherence', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  ['teachable-fee-calculator', 'kajabi-fee-calculator', 'skool-fee-calculator'].forEach((slug) => {
    assert.ok(html.includes(`/tools/${slug}/`), slug);
  });
});

test('helper exports stay callable', () => {
  assert.equal(DEFAULTS.planTier, 'basic');
  assert.equal(PROCESSOR_PRESETS['us-card'].variableRatePct, 2.9);
  approx(findGrossThreshold('basic', 'start', 'monthly', 'third-party-gateway'), 1666.67, 0.01);
  approx(findGrossThreshold('start', 'grow', 'monthly', 'third-party-gateway'), 10000, 0.01);
});
