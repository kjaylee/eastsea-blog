const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS } = require('./calculator.js');

// TC-DC-01: Baseline profitable transaction (default values)
test('TC-DC-01: baseline profitable transaction', () => {
  const { result, error } = calculate({
    itemPrice: 25,
    costOfGoods: 8,
    shippingCharged: 5,
    shippingCost: 4,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  });
  assert.equal(error, '');
  assert.ok(result !== null);
  // grossRevenue = 25 + 5 = 30
  assert.equal(result.grossRevenue, 30.00);
  // discogsSellerFee = max(25 * 0.08, 0.10) = max(2.00, 0.10) = 2.00
  assert.equal(result.discogsSellerFee, 2.00);
  // processingFees = 30 * 0.035 + 0.50 = 1.05 + 0.50 = 1.55
  assert.equal(result.processingFees, 1.55);
  // totalFees = 2.00 + 1.55 = 3.55
  assert.equal(result.totalFees, 3.55);
  // shippingProfit = 5 - 4 = 1.00
  assert.equal(result.shippingProfit, 1.00);
  // totalCosts = 8 + 4 + 3.55 = 15.55
  assert.equal(result.totalCosts, 15.55);
  // netProfit = 30 - 15.55 = 14.45
  assert.equal(result.netProfit, 14.45);
  assert.ok(result.profitMarginPct > 0);
  assert.ok(result.effectiveFeeRatePct > 0);
});

// TC-DC-02: Minimum seller fee applies when item price is very low
test('TC-DC-02: minimum seller fee of $0.10 applies', () => {
  const { result, error } = calculate({
    itemPrice: 0.50,   // 8% = $0.04, below minimum
    costOfGoods: 0,
    shippingCharged: 0,
    shippingCost: 0,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 0
  });
  assert.equal(error, '');
  // fee = max(0.50*0.08, 0.10) = max(0.04, 0.10) = 0.10
  assert.equal(result.discogsSellerFee, 0.10);
});

// TC-DC-03: Shipping profit and loss calculation
test('TC-DC-03: shipping loss reflected in shippingProfit', () => {
  const { result, error } = calculate({
    itemPrice: 20,
    costOfGoods: 5,
    shippingCharged: 3,
    shippingCost: 6,   // paying more than charged
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 0
  });
  assert.equal(error, '');
  assert.equal(result.shippingProfit, -3.00);
});

// TC-DC-04: requiredSalesForTarget calculation
test('TC-DC-04: requiredSalesForTarget computed correctly', () => {
  const { result, error } = calculate({
    itemPrice: 25,
    costOfGoods: 8,
    shippingCharged: 5,
    shippingCost: 4,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  });
  assert.equal(error, '');
  // netProfit = 14.45, need ceil(500/14.45) = ceil(34.60) = 35
  assert.equal(result.requiredSalesForTarget, 35);
});

// TC-DC-05: requiredSalesForTarget is null when profit is zero/negative
test('TC-DC-05: requiredSalesForTarget null when no profit', () => {
  const { result, error } = calculate({
    itemPrice: 1,
    costOfGoods: 100,
    shippingCharged: 0,
    shippingCost: 0,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  });
  assert.equal(error, '');
  assert.equal(result.requiredSalesForTarget, null);
  assert.ok(result.netProfit < 0);
});

// TC-DC-06: Invalid inputs rejected
test('TC-DC-06: invalid inputs return error', () => {
  const cases = [
    { itemPrice: 0, costOfGoods: 5, shippingCharged: 0, shippingCost: 0, sellerFeePct: 8, processingFeePct: 3.5, processingFixedFee: 0.5, numberOfSales: 1, targetMonthlyProfit: 0 },
    { itemPrice: -5, costOfGoods: 5, shippingCharged: 0, shippingCost: 0, sellerFeePct: 8, processingFeePct: 3.5, processingFixedFee: 0.5, numberOfSales: 1, targetMonthlyProfit: 0 },
    { itemPrice: 10, costOfGoods: -1, shippingCharged: 0, shippingCost: 0, sellerFeePct: 8, processingFeePct: 3.5, processingFixedFee: 0.5, numberOfSales: 1, targetMonthlyProfit: 0 },
    { itemPrice: 10, costOfGoods: 0, shippingCharged: 0, shippingCost: 0, sellerFeePct: 110, processingFeePct: 3.5, processingFixedFee: 0.5, numberOfSales: 1, targetMonthlyProfit: 0 },
    { itemPrice: 10, costOfGoods: 0, shippingCharged: 0, shippingCost: 0, sellerFeePct: 8, processingFeePct: 3.5, processingFixedFee: 0.5, numberOfSales: 0, targetMonthlyProfit: 0 }
  ];
  for (const input of cases) {
    const { result, error } = calculate(input);
    assert.ok(error.length > 0, `Expected error for input: ${JSON.stringify(input)}`);
    assert.equal(result, null);
  }
});

// TC-DC-07: High-value record transaction
test('TC-DC-07: high-value vinyl record transaction', () => {
  const { result, error } = calculate({
    itemPrice: 200,
    costOfGoods: 50,
    shippingCharged: 15,
    shippingCost: 12,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 10,
    targetMonthlyProfit: 1000
  });
  assert.equal(error, '');
  // grossRevenue = 200 + 15 = 215
  assert.equal(result.grossRevenue, 215.00);
  // discogsSellerFee = max(200*0.08, 0.10) = 16.00
  assert.equal(result.discogsSellerFee, 16.00);
  // processingFees = 215*0.035 + 0.50 = 7.525 + 0.50 = 8.025 -> round2 = 8.03 (actually: 7.525+0.5=8.025 rounds to 8.03? let's verify)
  // Math.round((8.025 + 1e-10)*100)/100 = Math.round(802.5)/100 = 803/100 = 8.03
  assert.equal(result.processingFees, 8.03);
  assert.ok(result.netProfit > 0);
});

// TC-DC-08: DEFAULTS export is correct
test('TC-DC-08: DEFAULTS export has correct structure', () => {
  assert.ok(typeof DEFAULTS.itemPrice === 'number');
  assert.ok(typeof DEFAULTS.costOfGoods === 'number');
  assert.ok(typeof DEFAULTS.shippingCharged === 'number');
  assert.ok(typeof DEFAULTS.shippingCost === 'number');
  assert.equal(DEFAULTS.sellerFeePct, 8);
  assert.equal(DEFAULTS.processingFeePct, 3.5);
  assert.equal(DEFAULTS.processingFixedFee, 0.50);
});

// TC-DC-09: Summary text contains required fields
test('TC-DC-09: summary text contains key metrics', () => {
  const { result, error } = calculate({
    itemPrice: 25,
    costOfGoods: 8,
    shippingCharged: 5,
    shippingCost: 4,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  });
  assert.equal(error, '');
  const s = result.summary;
  assert.ok(s.includes('Gross revenue'));
  assert.ok(s.includes('Net profit'));
  assert.ok(s.includes('Profit margin'));
  assert.ok(s.includes('Sales needed'));
});

// TC-DC-10: Zero shipping case (digital-only or pickup)
test('TC-DC-10: zero shipping scenario', () => {
  const { result, error } = calculate({
    itemPrice: 10,
    costOfGoods: 3,
    shippingCharged: 0,
    shippingCost: 0,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 5,
    targetMonthlyProfit: 50
  });
  assert.equal(error, '');
  // grossRevenue = 10
  assert.equal(result.grossRevenue, 10.00);
  assert.equal(result.shippingProfit, 0.00);
  // discogsSellerFee = max(10*0.08, 0.10) = 0.80
  assert.equal(result.discogsSellerFee, 0.80);
});
