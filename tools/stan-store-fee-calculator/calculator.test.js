const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PLAN_PRESETS,
  PAYMENT_PRESETS,
  CONSTANTS,
  getProcessorRatePct,
  findRequiredGross
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  monthlyGrossSales: 8000,
  monthlyOrders: 120,
  refundRatePct: 2,
  planTier: 'creator',
  paymentMethod: 'standard',
  internationalCustomers: false,
  recurringPayments: false,
  currencyMismatch: false,
  monthlyPayoutCount: 4,
  otherMonthlyCost: 500,
  desiredMonthlyNetProfit: 3000
};

test('exports expected presets and defaults', () => {
  assert.equal(DEFAULTS.monthlyGrossSales, 8000);
  assert.equal(PLAN_PRESETS.creator.fee, 29);
  assert.equal(PLAN_PRESETS.pro.fee, 99);
  assert.equal(PAYMENT_PRESETS.standard.baseRatePct, 2.9);
  assert.equal(PAYMENT_PRESETS.afterpay.baseRatePct, 6.0);
  assert.equal(PAYMENT_PRESETS.klarna.baseRatePct, 5.99);
  assert.equal(CONSTANTS.STAN_TRANSACTION_FEE_PCT, 0);
});

test('TC-ST-01 baseline Creator + standard-card scenario', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.planFee, 29);
  approx(result.processorRatePct, 2.9);
  approx(result.processorFees, 268);
  approx(result.refundLoss, 160);
  approx(result.payoutFees, 19.93);
  approx(result.takeHomeAfterStanCosts, 7523.07);
  approx(result.monthlyNetProfit, 7023.07);
  approx(result.effectiveFeeRatePct, 3.96);
  approx(result.averageOrderValue, 66.67);
});

test('TC-ST-02 Pro tier reduces profit by exactly $70', () => {
  const creator = calculate(baseline, { lang: 'en' }).result;
  const pro = calculate({ ...baseline, planTier: 'pro' }, { lang: 'en' }).result;

  approx(pro.planFee - creator.planFee, 70);
  approx(creator.monthlyNetProfit - pro.monthlyNetProfit, 70);
});

test('TC-ST-03 Afterpay and Klarna increase processor drag', () => {
  const standard = calculate(baseline, { lang: 'en' }).result;
  const afterpay = calculate({ ...baseline, paymentMethod: 'afterpay' }, { lang: 'en' }).result;
  const klarna = calculate({ ...baseline, paymentMethod: 'klarna' }, { lang: 'en' }).result;

  assert.ok(afterpay.processorFees > standard.processorFees);
  assert.ok(klarna.processorFees > standard.processorFees);
  assert.ok(afterpay.processorFees > klarna.processorFees);
  assert.ok(afterpay.monthlyNetProfit < klarna.monthlyNetProfit);
});

test('TC-ST-04 payout minimum floor works', () => {
  const { result, error } = calculate({
    ...baseline,
    monthlyGrossSales: 20,
    monthlyOrders: 1,
    refundRatePct: 0,
    monthlyPayoutCount: 4,
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.payoutFees, 4);
  approx(result.processorFees, 0.88);
});

test('TC-ST-05 surcharge toggles accumulate correctly', () => {
  const rate = getProcessorRatePct({
    ...baseline,
    internationalCustomers: true,
    recurringPayments: true,
    currencyMismatch: true
  }, PAYMENT_PRESETS.standard);

  approx(rate, 5.9);
});

test('TC-ST-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, monthlyGrossSales: 0 },
    { ...baseline, monthlyOrders: 0 },
    { ...baseline, monthlyOrders: 1.5 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, planTier: 'vip' },
    { ...baseline, paymentMethod: 'paypal' },
    { ...baseline, monthlyPayoutCount: 0 },
    { ...baseline, monthlyPayoutCount: 2.2 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-ST-07 solver returns higher gross for higher target', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.breakEvenMonthlyGrossSales > 0);
  assert.ok(result.requiredMonthlyGrossForTargetNet > result.breakEvenMonthlyGrossSales);
  approx(result.breakEvenMonthlyGrossSales, findRequiredGross(baseline, 0, PAYMENT_PRESETS.standard), 0.01);
});

test('TC-ST-08 comparison table covers all Stripe presets', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 3);
  assert.deepEqual(result.comparisonRows.map((row) => row.id), ['standard', 'afterpay', 'klarna']);
});

test('TC-ST-09 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Stan transaction fee: 0\.00%/);
  assert.match(result.summary, /Plan tier: Creator/);
  assert.match(result.summary, /Payment preset: Standard card/);
  assert.match(result.summary, /Monthly gross sales: \$8,000\.00/);
  assert.match(result.summary, /Processor fees: \$268\.00/);
  assert.match(result.summary, /Payout fees: \$19\.93/);
  assert.match(result.summary, /Monthly net profit: \$7,023\.07/);
});

test('TC-ST-10 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'monthlyGrossSales',
    'monthlyOrders',
    'planTier',
    'paymentMethod',
    'monthlyPayoutCount',
    'internationalCustomers',
    'recurringPayments',
    'currencyMismatch',
    'comparisonBody',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Stan Store Fee Calculator|스탠 스토어 수수료 계산기/);
});

test('TC-ST-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'stan-store-fee-calculator';
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
