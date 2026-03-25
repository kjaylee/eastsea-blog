const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

// TC-01 baseline with default values (Basic plan $149/mo)
test('TC-01 baseline default values', () => {
  const { result, error } = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossRevenue, 5000.00);
  approx(result.refundLoss, 0.00);
  // processingFees = 50*0.30 + 5000*0.029 = 15 + 145 = 160
  approx(result.processingFees, 160.00);
  approx(result.kajabiSubscriptionCost, 149.00);
  approx(result.totalCosts, 309.00);
  approx(result.netRevenue, 4691.00);
  approx(result.revenuePerTransaction, 100.00);
  assert.ok(result.netRevenue > 0, 'net revenue should be positive');
});

// TC-02 refund rate reduces net revenue
test('TC-02 5% refund rate increases total costs', () => {
  const base = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  const withRefunds = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 5,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(withRefunds.error, '');
  // refundLoss = 5000 * 0.05 = 250
  approx(withRefunds.result.refundLoss, 250.00);
  assert.ok(
    withRefunds.result.netRevenue < base.result.netRevenue,
    'refunds should lower net revenue'
  );
  approx(withRefunds.result.netRevenue, 4441.00);
});

// TC-03 Growth plan ($199/mo) costs more than Basic
test('TC-03 Growth plan has higher subscription cost', () => {
  const { result, error } = calculate({
    monthlyRevenue: 10000,
    numberOfTransactions: 100,
    kajabiPlanCost: 199,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.kajabiSubscriptionCost, 199.00);
  // processingFees = 100*0.30 + 10000*0.029 = 30 + 290 = 320
  approx(result.processingFees, 320.00);
  approx(result.totalCosts, 519.00);
  approx(result.netRevenue, 9481.00);
});

// TC-04 high transaction volume amplifies fixed fee impact
test('TC-04 high transaction count amplifies fixed per-tx fee', () => {
  const { result, error } = calculate({
    monthlyRevenue: 2000,
    numberOfTransactions: 200,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  // processingFees = 200*0.30 + 2000*0.029 = 60 + 58 = 118
  approx(result.processingFees, 118.00);
  approx(result.totalCosts, 267.00);
  approx(result.netRevenue, 1733.00);
  approx(result.revenuePerTransaction, 10.00);
});

// TC-05 requiredRevenueForTarget is calculable and sensible
test('TC-05 requiredRevenueForTarget exceeds target + fixed costs', () => {
  const { result, error } = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 3000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.requiredRevenueForTarget !== null, 'should have a target revenue');
  // R = (3000 + 50*0.30 + 149) / (1 - 0.029) = 3164 / 0.971 ≈ 3258.50
  approx(result.requiredRevenueForTarget, 3258.50, 1.00);
  assert.ok(result.requiredRevenueForTarget > 3000, 'required revenue must exceed target');
});

// TC-06 breakEvenTransactions is a small positive integer for typical inputs
test('TC-06 breakEvenTransactions is positive and finite', () => {
  const { result, error } = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.breakEvenTransactions !== null, 'break-even should be reachable');
  assert.ok(result.breakEvenTransactions > 0, 'must be positive');
  assert.ok(Number.isInteger(result.breakEvenTransactions), 'must be integer');
  // contributionPerTx = 100*(1-0.029) - 0.30 = 97.1 - 0.30 = 96.80
  // N_be = ceil(149 / 96.80) = ceil(1.54) = 2
  assert.equal(result.breakEvenTransactions, 2);
});

// TC-07 invalid inputs return errors
test('TC-07 invalid inputs return error and null result', () => {
  const cases = [
    { monthlyRevenue: 0, numberOfTransactions: 50 },
    { monthlyRevenue: -100, numberOfTransactions: 50 },
    { monthlyRevenue: 5000, numberOfTransactions: 0 },
    { monthlyRevenue: 5000, numberOfTransactions: 50, processingFeePct: 110 },
    { monthlyRevenue: 5000, numberOfTransactions: 50, refundRatePct: -5 },
    { monthlyRevenue: 5000, numberOfTransactions: 50, targetMonthlyNet: -1 }
  ];

  for (const input of cases) {
    const { result, error } = calculate({
      kajabiPlanCost: 149,
      processingFeePct: 2.9,
      processingFixedFee: 0.30,
      refundRatePct: 0,
      targetMonthlyNet: 0,
      ...input
    }, { lang: 'en' });
    assert.ok(error.length > 0, `expected error for input: ${JSON.stringify(input)}`);
    assert.equal(result, null);
  }
});

// TC-08 Korean language errors
test('TC-08 Korean language validation messages', () => {
  const { result, error } = calculate({
    monthlyRevenue: -1,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'ko' });

  assert.equal(result, null);
  assert.ok(error.includes('월 수익'), `expected Korean error, got: ${error}`);
});

// TC-09 DEFAULTS export shape
test('TC-09 DEFAULTS exports all required fields', () => {
  const keys = [
    'monthlyRevenue', 'numberOfTransactions', 'kajabiPlanCost',
    'processingFeePct', 'processingFixedFee', 'refundRatePct', 'targetMonthlyNet'
  ];
  for (const k of keys) {
    assert.ok(k in DEFAULTS, `DEFAULTS missing key: ${k}`);
    assert.ok(typeof DEFAULTS[k] === 'number', `DEFAULTS.${k} should be number`);
  }
  assert.equal(DEFAULTS.kajabiPlanCost, 149);
  assert.equal(DEFAULTS.processingFeePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);
});

// TC-10 summary contains all key metric strings
test('TC-10 summary text contains required fields', () => {
  const { result } = calculate({
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  const s = result.summary;
  assert.ok(s.includes('Kajabi Revenue Summary'), 'summary missing title');
  assert.ok(s.includes('Net Revenue:'), 'summary missing net revenue');
  assert.ok(s.includes('Processing Fees:'), 'summary missing processing fees');
  assert.ok(s.includes('Break-even Transactions:'), 'summary missing break-even');
});
