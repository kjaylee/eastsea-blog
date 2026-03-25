const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

const BASE = {
  salePrice: 45,
  costOfGoods: 15,
  shippingCost: 5,
  sellerPaysShipping: true,
  processingFeePct: 3.3,
  processingFixedFee: 0.30,
  isBoosted: false,
  boostFeePct: 8,
  numberOfSales: 1,
  targetMonthlyProfit: 500
};

// TC-DP-01 — Baseline single sale, seller pays shipping, no boost
// salePrice=45: processingFee = 45*0.033+0.30 = 1.485+0.30 = 1.785 → $1.79
// totalFees = $1.79, shippingCostTotal = $5, totalCosts = 1.79+5+15 = $21.79
// netProfit = 45 - 21.79 = $23.21, profitMarginPct ≈ 51.58%
test('TC-DP-01 baseline single profitable sale (no boost, seller ships)', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossRevenue, 45.00);
  approx(result.processingFee, 1.79, 0.01);
  assert.equal(result.boostFee, 0);
  approx(result.totalFees, 1.79, 0.01);
  approx(result.shippingCostTotal, 5.00);
  approx(result.totalCosts, 21.79, 0.02);
  approx(result.netProfit, 23.21, 0.02);
  approx(result.profitPerItem, 23.21, 0.02);
  assert.ok(result.profitMarginPct > 50, 'margin should be above 50%');
  assert.ok(result.breakEvenSalePrice !== null && result.breakEvenSalePrice < 45, 'break-even below list price');
});

// TC-DP-02 — Buyer pays shipping reduces seller costs
test('TC-DP-02 buyer pays shipping reduces shippingCostTotal to zero', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, sellerPaysShipping: false }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.shippingCostTotal, 0);
  assert.ok(result.netProfit > base.netProfit, 'profit increases when buyer pays shipping');
  approx(result.netProfit - base.netProfit, 5.00, 0.01);
});

// TC-DP-03 — Boosted listing adds 8% fee
// boostFee = 45 * 0.08 = $3.60
test('TC-DP-03 boosted listing adds 8% boost fee', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, isBoosted: true }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.boostFee, 3.60, 0.01);
  assert.ok(result.totalFees > base.totalFees, 'total fees increase with boost');
  assert.ok(result.netProfit < base.netProfit, 'profit decreases with boost fee');
  approx(base.netProfit - result.netProfit, 3.60, 0.01);
});

// TC-DP-04 — Multiple sales scales linearly
test('TC-DP-04 multiple sales scale linearly', () => {
  const single = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, numberOfSales: 10 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossRevenue, single.grossRevenue * 10, 0.01);
  approx(result.netProfit, single.netProfit * 10, 0.05);
  approx(result.profitPerItem, single.profitPerItem, 0.01);
  // margin should be same
  approx(result.profitMarginPct, single.profitMarginPct, 0.01);
});

// TC-DP-05 — requiredSalesForTarget calculation
test('TC-DP-05 requiredSalesForTarget is ceiling of target/profitPerItem', () => {
  const { result, error } = calculate({ ...BASE, targetMonthlyProfit: 500 }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.requiredSalesForTarget !== null, 'requiredSalesForTarget should not be null');
  const expectedMin = Math.floor(500 / result.profitPerItem);
  const expectedMax = Math.ceil(500 / result.profitPerItem);
  assert.ok(result.requiredSalesForTarget >= expectedMin && result.requiredSalesForTarget <= expectedMax + 1,
    `requiredSalesForTarget ${result.requiredSalesForTarget} out of expected range`);
  // Verify: requiredSalesForTarget * profitPerItem >= targetMonthlyProfit
  assert.ok(result.requiredSalesForTarget * result.profitPerItem >= 500 - 0.01, 'should meet monthly target');
});

// TC-DP-06 — Zero profit scenario yields null requiredSalesForTarget
test('TC-DP-06 negative profitPerItem yields null requiredSalesForTarget', () => {
  const { result, error } = calculate({
    ...BASE,
    costOfGoods: 50,
    shippingCost: 5
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.netProfit < 0, 'net profit should be negative');
  assert.equal(result.requiredSalesForTarget, null, 'no target achievable when loss-making');
});

// TC-DP-07 — Break-even returns null when costs exceed maximum searchable price
test('TC-DP-07 break-even returns null with extreme costs', () => {
  const { result, error } = calculate({
    ...BASE,
    costOfGoods: 2000000,
    shippingCost: 100000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null);
  assert.ok(result.netProfit < 0);
});

// TC-DP-08 — Invalid inputs rejected
test('TC-DP-08 invalid inputs are rejected', () => {
  const badCases = [
    { ...BASE, salePrice: -1 },
    { ...BASE, costOfGoods: -5 },
    { ...BASE, processingFeePct: 110 },
    { ...BASE, boostFeePct: -1 },
    { ...BASE, numberOfSales: 0 },
    { ...BASE, numberOfSales: 1.5 },
    { ...BASE, salePrice: 0 }
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-DP-09 — Summary contains expected fields
test('TC-DP-09 summary includes required fields', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Sale price:.*45/);
  assert.match(result.summary, /Gross revenue:/);
  assert.match(result.summary, /Processing fee/);
  assert.match(result.summary, /Boost fee/);
  assert.match(result.summary, /Total fees:/);
  assert.match(result.summary, /Net profit:/);
  assert.match(result.summary, /Break-even sale price:/);
  assert.match(result.summary, /Required sales for monthly target/);
});

// TC-DP-10 — DEFAULTS shape check
test('TC-DP-10 DEFAULTS export has expected shape', () => {
  assert.equal(typeof DEFAULTS.salePrice, 'number');
  assert.equal(typeof DEFAULTS.costOfGoods, 'number');
  assert.equal(typeof DEFAULTS.processingFeePct, 'number');
  assert.equal(typeof DEFAULTS.sellerPaysShipping, 'boolean');
  assert.equal(typeof DEFAULTS.isBoosted, 'boolean');
  assert.equal(DEFAULTS.processingFeePct, 3.3);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);
  assert.equal(DEFAULTS.boostFeePct, 8);
});

// TC-DP-11 — Korean language returns localized strings
test('TC-DP-11 Korean language returns localized strings', () => {
  const { result, error } = calculate(BASE, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.summary, /Depop 수수료·순이익 요약/);
  assert.ok(result.status.includes('플러스') || result.status.includes('마이너스'));
});
