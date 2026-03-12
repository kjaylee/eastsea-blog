const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

function comparisonByPlan(result, plan) {
  return result.comparisons.find((item) => item.candidatePlan === plan);
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('TC-01 Basic plan + Shopify Payments baseline', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'shopify-payments',
    ordersPerMonth: 100,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 5000);
  approx(result.processingFee, 175);
  approx(result.thirdPartyTransactionFee, 0);
  approx(result.monthlyPlanFee, 39);
  approx(result.totalShopifyFees, 214);
  approx(result.netAfterFees, 4786);
  approx(result.effectiveFeeRatePercent, 4.28);
  approx(result.feePerOrder, 2.14);
  assert.equal(result.comparisons.length, 0);
  assert.match(result.comparisonNote, /not applicable/i);
});

test('TC-02 Basic plan + third-party provider baseline', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'third-party',
    ordersPerMonth: 100,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 5000);
  approx(result.processingFee, 175);
  approx(result.thirdPartyTransactionFee, 100);
  approx(result.monthlyPlanFee, 39);
  approx(result.totalShopifyFees, 314);
  approx(result.netAfterFees, 4686);
  approx(result.effectiveFeeRatePercent, 6.28);
  approx(result.feePerOrder, 3.14);

  const grow = comparisonByPlan(result, 'Grow');
  const advanced = comparisonByPlan(result, 'Advanced');
  assert.ok(grow);
  assert.ok(advanced);
  approx(grow.breakEvenMonthlyGross, 6600);
  assert.equal(grow.breakEvenMonthlyOrders, 132);
  approx(advanced.breakEvenMonthlyGross, 25714.285714285714);
  assert.equal(advanced.breakEvenMonthlyOrders, 515);
});

test('TC-03 Grow plan + third-party provider baseline', () => {
  const { result, error } = calculate({
    selectedPlan: 'Grow',
    paymentMode: 'third-party',
    ordersPerMonth: 100,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 5000);
  approx(result.processingFee, 175);
  approx(result.thirdPartyTransactionFee, 50);
  approx(result.monthlyPlanFee, 105);
  approx(result.totalShopifyFees, 330);
  approx(result.netAfterFees, 4670);
  approx(result.effectiveFeeRatePercent, 6.6);
  approx(result.feePerOrder, 3.3);
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].candidatePlan, 'Advanced');
  approx(result.comparisons[0].breakEvenMonthlyGross, 73500);
  assert.equal(result.comparisons[0].breakEvenMonthlyOrders, 1470);
});

test('TC-04 Advanced plan + third-party provider baseline', () => {
  const { result, error } = calculate({
    selectedPlan: 'Advanced',
    paymentMode: 'third-party',
    ordersPerMonth: 100,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 5000);
  approx(result.processingFee, 175);
  approx(result.thirdPartyTransactionFee, 30);
  approx(result.monthlyPlanFee, 399);
  approx(result.totalShopifyFees, 604);
  approx(result.netAfterFees, 4396);
  approx(result.effectiveFeeRatePercent, 12.08);
  approx(result.feePerOrder, 6.04);
  assert.equal(result.comparisons.length, 0);
});

test('TC-05 zero orders still charges monthly plan fee', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'shopify-payments',
    ordersPerMonth: 0,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 0);
  approx(result.processingFee, 0);
  approx(result.thirdPartyTransactionFee, 0);
  approx(result.totalShopifyFees, 39);
  approx(result.netAfterFees, -39);
  approx(result.effectiveFeeRatePercent, 0);
  approx(result.feePerOrder, 0);
  assert.ok(Number.isFinite(result.netAfterFees));
});

test('TC-06 zero AOV blocks break-even order output', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'third-party',
    ordersPerMonth: 100,
    averageOrderValue: 0,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 0);
  approx(result.processingFee, 30);
  approx(result.thirdPartyTransactionFee, 0);
  approx(result.totalShopifyFees, 69);
  approx(result.netAfterFees, -69);
  approx(result.effectiveFeeRatePercent, 0);
  approx(result.feePerOrder, 0.69);
  const grow = comparisonByPlan(result, 'Grow');
  assert.ok(grow);
  approx(grow.breakEvenMonthlyGross, 6600);
  assert.equal(grow.breakEvenMonthlyOrders, null);
});

test('TC-07 decimal rounding integrity keeps full precision internally', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'third-party',
    ordersPerMonth: 37,
    averageOrderValue: 27.45,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 1015.65);
  approx(result.processingFee, 40.55385);
  approx(result.thirdPartyTransactionFee, 20.313);
  approx(result.totalShopifyFees, 99.86685);
  approx(result.netAfterFees, 915.78315);
  approx(result.effectiveFeeRate, 0.0983280165411313, 1e-12);
  approx(result.feePerOrder, 2.699104054054054, 1e-12);
  assert.equal(result.display.monthlyGross, '1015.65');
  assert.equal(result.display.processingFee, '40.55');
  assert.equal(result.display.thirdPartyTransactionFee, '20.31');
  assert.equal(result.display.totalShopifyFees, '99.87');
  assert.equal(result.display.netAfterFees, '915.78');
  assert.equal(result.display.effectiveFeeRate, '9.83%');
  assert.equal(result.display.feePerOrder, '2.70');
});

test('TC-08 negative and non-numeric inputs sanitize to zero', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'third-party',
    ordersPerMonth: -5,
    averageOrderValue: 'abc',
    processingRatePercent: -2,
    fixedFeePerOrder: -0.3,
    basicPlanFee: -39
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 0);
  approx(result.processingFee, 0);
  approx(result.thirdPartyTransactionFee, 0);
  approx(result.totalShopifyFees, 0);
  approx(result.netAfterFees, 0);
  approx(result.effectiveFeeRatePercent, 0);
  approx(result.feePerOrder, 0);
  assert.ok(Number.isFinite(result.totalShopifyFees));
});

test('TC-09 break-even should not use lower-plan comparisons', () => {
  const { result, error } = calculate({
    selectedPlan: 'Grow',
    paymentMode: 'third-party',
    ordersPerMonth: 250,
    averageOrderValue: 40
  });

  assert.equal(error, '');
  assert.equal(result.comparisons.some((item) => item.candidatePlan === 'Basic'), false);
  assert.equal(result.comparisons.every((item) => item.candidatePlan === 'Advanced'), true);
});

test('TC-10 comparison logic uses same operational assumptions', () => {
  const { result, error } = calculate({
    selectedPlan: 'Basic',
    paymentMode: 'third-party',
    ordersPerMonth: 200,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3
  });

  assert.equal(error, '');
  approx(result.monthlyGross, 10000);
  approx(result.processingFee, 350);
  approx(result.totalShopifyFees, 589);
  const grow = comparisonByPlan(result, 'Grow');
  const advanced = comparisonByPlan(result, 'Advanced');
  approx(grow.candidatePlanTotalShopifyFees, 555);
  approx(advanced.candidatePlanTotalShopifyFees, 809);
  assert.equal(grow.cheaperAtCurrentVolume, true);
  assert.equal(advanced.cheaperAtCurrentVolume, false);
});

test('TC-11/12/13/14 required labels, assumption note, and topic scope exist in page', () => {
  const requiredLabels = [
    'Plan',
    'Payment mode',
    'Orders per month',
    'Average order value',
    'Processing rate',
    'Fixed fee per order',
    'Monthly gross sales',
    'Total Shopify-related fees',
    'Net after fees',
    'Effective fee rate'
  ];

  requiredLabels.forEach((label) => {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  assert.match(html, /country or region/i);
  assert.match(html, /payment-method mix/i);
  assert.match(html, /Shopify pricing may change/i);
  assert.match(html, /results are estimates/i);
  assert.match(html, /merchant/i);
  assert.doesNotMatch(html, /Shopify App Store developer/i);
  assert.doesNotMatch(html, /COGS/i);
  assert.doesNotMatch(html, /ad spend/i);
  assert.doesNotMatch(html, /inventory/i);
  assert.doesNotMatch(html, /fulfillment/i);
});
