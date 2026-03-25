const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS, PLAN_PRESETS } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`
  );
}

// Case 1 — Mover plan baseline
test('Case 1 mover plan baseline', () => {
  const { result, error } = calculate({
    monthlyRevenue:        1000,
    numberOfTransactions:  20,
    planPreset:            'mover',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      500
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result !== null);

  // grossRevenue = 1000
  approx(result.grossRevenue, 1000.00);
  // podiaTransactionFee = 1000 * 5% = 50
  approx(result.podiaTransactionFee, 50.00);
  // processingFees = 1000 * 2.9% + 20 * 0.30 = 29 + 6 = 35
  approx(result.processingFees, 35.00);
  // planCost = 39
  approx(result.planCost, 39.00);
  // totalCosts = 50 + 35 + 39 = 124
  approx(result.totalCosts, 124.00);
  // netIncome = 1000 - 124 = 876
  approx(result.netIncome, 876.00);
  // effectiveCostRatePct = 124/1000 * 100 = 12.4
  approx(result.effectiveCostRatePct, 12.40, 0.05);
  // revenuePerTransaction = 1000 / 20 = 50
  approx(result.revenuePerTransaction, 50.00);
});

// Case 2 — Starter plan: higher transaction fee
test('Case 2 starter plan at same revenue', () => {
  const { result, error } = calculate({
    monthlyRevenue:        1000,
    numberOfTransactions:  20,
    planPreset:            'starter',
    planMonthlyCost:       9,
    podiaTransactionFeePct: 8,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      500
  }, { lang: 'en' });

  assert.equal(error, '');
  // podiaTransactionFee = 1000 * 8% = 80
  approx(result.podiaTransactionFee, 80.00);
  // processingFees = 1000 * 2.9% + 20 * 0.30 = 35
  approx(result.processingFees, 35.00);
  // planCost = 9
  approx(result.planCost, 9.00);
  // totalCosts = 80 + 35 + 9 = 124
  approx(result.totalCosts, 124.00);
  // netIncome = 1000 - 124 = 876
  approx(result.netIncome, 876.00);
});

// Case 3 — Shaker plan: no transaction fee, high fixed cost
test('Case 3 shaker plan zero transaction fee', () => {
  const { result, error } = calculate({
    monthlyRevenue:        1000,
    numberOfTransactions:  20,
    planPreset:            'shaker',
    planMonthlyCost:       89,
    podiaTransactionFeePct: 0,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      500
  }, { lang: 'en' });

  assert.equal(error, '');
  // podiaTransactionFee = 0 (Shaker has 0%)
  approx(result.podiaTransactionFee, 0.00);
  // processingFees = 29 + 6 = 35
  approx(result.processingFees, 35.00);
  // planCost = 89
  approx(result.planCost, 89.00);
  // totalCosts = 0 + 35 + 89 = 124
  approx(result.totalCosts, 124.00);
  // netIncome = 876 same as others at this revenue, interesting coincidence
  approx(result.netIncome, 876.00);
});

// Case 4 — Break-even revenue calculation
test('Case 4 break-even revenue is analytically correct', () => {
  // mover: 5% podia + 2.9% processing + $0.30 fixed + $39 plan
  // denom = 1 - 0.05 - 0.029 = 0.921
  // fixedCosts = 10 * 0.30 + 39 = 3 + 39 = 42
  // breakEven = 42 / 0.921 ≈ 45.60
  const { result, error } = calculate({
    monthlyRevenue:        200,
    numberOfTransactions:  10,
    planPreset:            'mover',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.breakEvenRevenue !== null, 'breakEvenRevenue should be computable');
  approx(result.breakEvenRevenue, 45.60, 0.10);

  // Verify: at breakEvenRevenue, netIncome ≈ 0
  const atBreakEven = calculate({
    monthlyRevenue:        result.breakEvenRevenue,
    numberOfTransactions:  10,
    planPreset:            'mover',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      0
  });
  approx(atBreakEven.result.netIncome, 0, 0.02);
});

// Case 5 — Best plan recommendation switches at high volume
test('Case 5 best plan recommendation at high revenue favors shaker', () => {
  // At very high revenue the 0% Shaker beats the 5%/8% others
  const { result } = calculate({
    monthlyRevenue:        10000,
    numberOfTransactions:  100,
    planPreset:            'custom',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      0
  });
  assert.equal(result.bestPlanRecommendation, 'shaker',
    'At $10k revenue, Shaker (0% tx fee) should be best');
});

// Case 6 — Required revenue for target net
test('Case 6 required revenue for target net', () => {
  // mover: denom = 0.921, target=500
  // fixedCosts = 20 * 0.30 + 39 = 45
  // required = (500 + 45) / 0.921 ≈ 591.75
  const { result, error } = calculate({
    monthlyRevenue:        1000,
    numberOfTransactions:  20,
    planPreset:            'mover',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      500
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.requiredRevenueForTarget !== null);
  approx(result.requiredRevenueForTarget, 591.75, 0.10);
});

// Case 7 — Validation rejects bad inputs
test('Case 7 validation rejects bad inputs', () => {
  const badInputs = [
    // monthlyRevenue = 0
    { monthlyRevenue: 0,  numberOfTransactions: 20, planPreset: 'mover', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // numberOfTransactions = 0
    { monthlyRevenue: 500, numberOfTransactions: 0, planPreset: 'mover', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // fractional transactions
    { monthlyRevenue: 500, numberOfTransactions: 1.5, planPreset: 'mover', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // unknown preset
    { monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'unknown', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // podiaTransactionFeePct = -1
    { monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'custom', planMonthlyCost: 39, podiaTransactionFeePct: -1, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // processingFeePct = 101
    { monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'mover', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 101, processingFixedFee: 0.30, targetMonthlyNet: 0 },
    // negative targetMonthlyNet
    { monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'mover', planMonthlyCost: 39, podiaTransactionFeePct: 5, processingFeePct: 2.9, processingFixedFee: 0.30, targetMonthlyNet: -1 },
  ];

  for (const inp of badInputs) {
    const { result, error } = calculate(inp, { lang: 'en' });
    assert.equal(result, null, `expected null result for: ${JSON.stringify(inp)}`);
    assert.notEqual(error, '', 'expected non-empty error message');
  }
});

// Case 8 — Preset sync behavior
test('Case 8 preset sync populates planMonthlyCost and podiaTransactionFeePct', () => {
  const mover = calculate({ monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'mover' });
  assert.equal(mover.error, '');
  approx(mover.result.podiaTransactionFee, 500 * 0.05);
  approx(mover.result.planCost, 39);

  const shaker = calculate({ monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'shaker' });
  assert.equal(shaker.error, '');
  approx(shaker.result.podiaTransactionFee, 0);
  approx(shaker.result.planCost, 89);

  const starter = calculate({ monthlyRevenue: 500, numberOfTransactions: 10, planPreset: 'starter' });
  assert.equal(starter.error, '');
  approx(starter.result.podiaTransactionFee, 500 * 0.08);
  approx(starter.result.planCost, 9);
});

// Case 9 — DEFAULTS and PLAN_PRESETS shape
test('Case 9 DEFAULTS and PLAN_PRESETS shape', () => {
  assert.equal(DEFAULTS.planPreset, 'mover');
  assert.equal(DEFAULTS.planMonthlyCost, 39);
  assert.equal(DEFAULTS.podiaTransactionFeePct, 5);
  assert.equal(DEFAULTS.processingFeePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);

  assert.equal(PLAN_PRESETS['starter'].monthlyCost, 9);
  assert.equal(PLAN_PRESETS['starter'].transactionFeePct, 8);
  assert.equal(PLAN_PRESETS['mover'].monthlyCost, 39);
  assert.equal(PLAN_PRESETS['mover'].transactionFeePct, 5);
  assert.equal(PLAN_PRESETS['shaker'].monthlyCost, 89);
  assert.equal(PLAN_PRESETS['shaker'].transactionFeePct, 0);
  assert.equal(PLAN_PRESETS['custom'].monthlyCost, null);
  assert.equal(PLAN_PRESETS['custom'].transactionFeePct, null);
});

// Case 10 — Summary contains key fields
test('Case 10 summary contains key fields', () => {
  const { result } = calculate({}, { lang: 'en' });
  const s = result.summary;
  assert.ok(s.includes('Podia'), 'summary should reference Podia');
  assert.ok(s.includes('Gross revenue') || s.includes('grossRevenue'), 'summary should include gross revenue');
  assert.ok(s.includes('Net income') || s.includes('netIncome'), 'summary should include net income');
  assert.ok(s.includes('Break-even revenue'), 'summary should include break-even');
  assert.ok(s.includes('Best plan'), 'summary should include plan recommendation');
});
