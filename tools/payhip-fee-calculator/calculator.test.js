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
  buildUpgradeThresholds,
  getContributionDenominator
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  averageOrderValue: 30,
  monthlyOrders: 120,
  refundRatePct: 2,
  planId: 'plus',
  processorPreset: 'stripe-domestic',
  customProcessorRatePct: 2.9,
  customProcessorFlatFee: 0.30,
  otherMonthlyCost: 300,
  desiredMonthlyNetProfit: 2000
};

test('exports Payhip plans and processor presets', () => {
  assert.equal(DEFAULTS.planId, 'plus');
  assert.equal(PLANS.length, 3);
  assert.equal(PROCESSOR_PRESETS.length, 3);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'paypal-usd' }).flatFee, 0.49);
});

test('TC-PH-01 baseline Plus + Stripe scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossSales, 3600);
  approx(result.refundLoss, 72);
  approx(result.payhipTransactionFees, 72);
  approx(result.planMonthlyFee, 29);
  approx(result.processorFees, 140.4);
  approx(result.netBeforeFixedCosts, 3315.6);
  approx(result.monthlyNetProfit, 2986.6);
  approx(result.takeHomePerOrderBeforeFixed, 27.63);
  approx(result.netProfitPerOrder, 24.89);
  approx(result.allInCostRatePct, 8.71);
  approx(result.breakEvenPrice, 3.27);
  approx(result.breakEvenGrossSales, 392.05);
  approx(result.requiredPriceForTargetNet, 21.17);
  approx(result.requiredGrossSalesForTargetNet, 2540.29);
});

test('TC-PH-02 Free plan earns less than Plus at baseline gross', () => {
  const { result, error } = calculate({ ...baseInput, planId: 'free' }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.payhipTransactionFees, 180);
  approx(result.planMonthlyFee, 0);
  approx(result.monthlyNetProfit, 2907.6);
  assert.ok(result.monthlyNetProfit < calculate(baseInput, { lang: 'en' }).result.monthlyNetProfit);
});

test('TC-PH-03 Pro wins above Plus-to-Pro threshold', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.recommendedPlanId, 'pro');
  const comparisonMap = Object.fromEntries(result.comparisonRows.map((row) => [row.id, row]));
  assert.ok(comparisonMap.pro.monthlyNetProfit > comparisonMap.plus.monthlyNetProfit);
  approx(comparisonMap.pro.monthlyNetProfit, 2988.6);
});

test('TC-PH-04 low gross recommends Free', () => {
  const { result, error } = calculate({
    ...baseInput,
    averageOrderValue: 20,
    monthlyOrders: 40
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.grossSales, 800);
  assert.equal(result.recommendedPlanId, 'free');
});

test('TC-PH-05 custom processor makes target price rise', () => {
  const stripe = calculate(baseInput, { lang: 'en' }).result;
  const custom = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 4.1,
    customProcessorFlatFee: 0.60
  }, { lang: 'en' }).result;

  assert.ok(custom.processorFees > stripe.processorFees);
  assert.ok(custom.requiredPriceForTargetNet > stripe.requiredPriceForTargetNet);
  approx(custom.processorFees, 219.6);
  approx(custom.monthlyNetProfit, 2907.4);
  approx(custom.requiredPriceForTargetNet, 21.77);
});

test('TC-PH-06 reverse price returns null when contribution denominator <= 0', () => {
  const { result, error } = calculate({
    ...baseInput,
    planId: 'free',
    processorPreset: 'custom',
    refundRatePct: 50,
    customProcessorRatePct: 49,
    customProcessorFlatFee: 20
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(getContributionDenominator({ transactionRatePct: 5 }, { ratePct: 49 }, { refundRatePct: 50 }), -0.04, 0.000001);
  assert.equal(result.breakEvenPrice, null);
  assert.equal(result.requiredPriceForTargetNet, null);
});

test('TC-PH-07 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...baseInput, averageOrderValue: 0 },
    { ...baseInput, monthlyOrders: 0 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, planId: 'missing' },
    { ...baseInput, processorPreset: 'missing' },
    { ...baseInput, customProcessorRatePct: 100 },
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

test('TC-PH-08 summary includes decision ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[Payhip Fee Calculator Summary\]/);
  assert.match(result.summary, /Current plan: Plus/);
  assert.match(result.summary, /Monthly gross sales: \$3,600\.00/);
  assert.match(result.summary, /Payhip transaction fees: \$72\.00/);
  assert.match(result.summary, /Processor fees: \$140\.40/);
  assert.match(result.summary, /Monthly net profit: \$2,986\.60/);
  assert.match(result.summary, /Free → Plus: \$966\.67/);
  assert.match(result.summary, /Plus → Pro: \$3,500\.00/);
});

test('TC-PH-09 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'summary', 'comparisonBody', 'thresholdBody', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Payhip Fee Calculator/);
  assert.match(html, /Free = 5%/);
  assert.match(html, /Plus = \$29\/month \+ 2%/);
  assert.match(html, /Pro = \$99\/month \+ 0%/);
});

test('TC-PH-10 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'payhip-fee-calculator';
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

test('upgrade thresholds expose expected constants', () => {
  const rows = buildUpgradeThresholds('en');
  assert.deepEqual(rows.map((row) => row.id), ['free-to-plus', 'free-to-pro', 'plus-to-pro']);
  approx(rows[0].grossSales, 966.67);
  approx(rows[1].grossSales, 1980);
  approx(rows[2].grossSales, 3500);
});
