const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`
  );
}

// TC-F001: baseline domestic order with defaults
test('TC-F001 baseline domestic order', () => {
  const { result, error } = calculate({}, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result !== null);

  // revenueExTax = 100 + 0 = 100
  approx(result.revenueExTax, 100.00);
  // grossCharge = 100 + 0 = 100
  approx(result.grossCharge, 100.00);
  // stripeVariableFee = 100 * 0.029 = 2.90
  approx(result.stripeVariableFee, 2.90);
  // stripeFlatFee = 0.30
  approx(result.stripeFlatFee, 0.30);
  // totalStripeFees = 2.90 + 0.30 = 3.20
  approx(result.totalStripeFees, 3.20);
  // payoutAfterFees = 100 - 3.20 = 96.80
  approx(result.payoutAfterFees, 96.80);
  // payoutBeforeSellerCosts = 100 - 3.20 = 96.80
  approx(result.payoutBeforeSellerCosts, 96.80);
  // sellerCostTotal = 25 + 5 + 0 = 30
  approx(result.sellerCostTotal, 30.00);
  // netProfit = 96.80 - 30 = 66.80
  approx(result.netProfit, 66.80);
  // break-even must be non-null and less than current sale price
  assert.ok(result.breakEvenSalePrice !== null, 'break-even should be reachable');
  assert.ok(result.breakEvenSalePrice < 100, 'break-even should be below current price');
});

// TC-F002: low-ticket order - fixed fee dominates
test('TC-F002 low-ticket order', () => {
  const { result, error } = calculate({
    salePrice: 2.00,
    shippingCharged: 0,
    taxCollected: 0,
    productCost: 0,
    fulfillmentCost: 0,
    opsCost: 0,
    stripeFeeRate: 2.9,
    stripeFlatFee: 0.30,
    internationalCardRate: 0,
    currencyConversionRate: 0
  }, { lang: 'en' });
  assert.equal(error, '');
  // stripeVariableFee = 2.00 * 0.029 = 0.058
  // totalStripeFees = 0.058 + 0.30 = 0.358
  approx(result.totalStripeFees, 0.36);
  // effective rate = 0.358 / 2.00 * 100 = ~17.9%
  assert.ok(result.effectiveStripeFeeRatePct > 10, 'low-ticket effective rate should be high');
});

// TC-F003: international + FX scenario
test('TC-F003 international + FX scenario', () => {
  const base = calculate({
    salePrice: 100,
    shippingCharged: 0,
    taxCollected: 0,
    productCost: 25,
    fulfillmentCost: 5,
    opsCost: 0,
    stripeFeeRate: 2.9,
    stripeFlatFee: 0.30,
    internationalCardRate: 0,
    currencyConversionRate: 0
  }, { lang: 'en' });

  const intl = calculate({
    salePrice: 100,
    shippingCharged: 0,
    taxCollected: 0,
    productCost: 25,
    fulfillmentCost: 5,
    opsCost: 0,
    stripeFeeRate: 2.9,
    stripeFlatFee: 0.30,
    internationalCardRate: 1.5,
    currencyConversionRate: 1.0
  }, { lang: 'en' });

  assert.equal(base.error, '');
  assert.equal(intl.error, '');

  // intl should have higher fees
  assert.ok(intl.result.totalStripeFees > base.result.totalStripeFees, 'intl fees > domestic fees');
  // internationalFee = 100 * 0.015 = 1.50
  approx(intl.result.internationalFee, 1.50);
  // currencyConversionFee = 100 * 0.01 = 1.00
  approx(intl.result.currencyConversionFee, 1.00);
  // extra fees = 2.50
  approx(intl.result.totalStripeFees - base.result.totalStripeFees, 2.50);
});

// TC-F004: tax not treated as seller revenue
test('TC-F004 tax not treated as seller revenue', () => {
  const { result, error } = calculate({
    salePrice: 100,
    shippingCharged: 0,
    taxCollected: 10,
    productCost: 25,
    fulfillmentCost: 5,
    opsCost: 0,
    stripeFeeRate: 2.9,
    stripeFlatFee: 0.30,
    internationalCardRate: 0,
    currencyConversionRate: 0
  }, { lang: 'en' });
  assert.equal(error, '');
  // grossCharge = 100 + 10 = 110
  approx(result.grossCharge, 110.00);
  // revenueExTax = 100 (no shipping)
  approx(result.revenueExTax, 100.00);
  // grossCharge > revenueExTax
  assert.ok(result.grossCharge > result.revenueExTax, 'grossCharge should exceed revenueExTax');
  // payoutBeforeSellerCosts based on revenueExTax - fees (not grossCharge)
  // stripeVariableFee = 110 * 0.029 = 3.19
  // totalStripeFees = 3.19 + 0.30 = 3.49
  // payoutBeforeSellerCosts = 100 - 3.49 = 96.51
  approx(result.payoutBeforeSellerCosts, 96.51);
  approx(result.payoutAfterFees, 110 - result.totalStripeFees);
});

// TC-F005: validation rejects bad inputs
test('TC-F005 validation', () => {
  const bad = [
    // negative money
    { salePrice: -1, shippingCharged: 0, taxCollected: 0, productCost: 0, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 2.9, stripeFlatFee: 0.30, internationalCardRate: 0, currencyConversionRate: 0 },
    { salePrice: 10, shippingCharged: -1, taxCollected: 0, productCost: 0, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 2.9, stripeFlatFee: 0.30, internationalCardRate: 0, currencyConversionRate: 0 },
    { salePrice: 10, shippingCharged: 0, taxCollected: 0, productCost: -1, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 2.9, stripeFlatFee: 0.30, internationalCardRate: 0, currencyConversionRate: 0 },
    // rate out of range
    { salePrice: 10, shippingCharged: 0, taxCollected: 0, productCost: 0, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 101, stripeFlatFee: 0.30, internationalCardRate: 0, currencyConversionRate: 0 },
    { salePrice: 10, shippingCharged: 0, taxCollected: 0, productCost: 0, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 2.9, stripeFlatFee: 0.30, internationalCardRate: -1, currencyConversionRate: 0 },
    // zero revenue
    { salePrice: 0, shippingCharged: 0, taxCollected: 0, productCost: 0, fulfillmentCost: 0, opsCost: 0, stripeFeeRate: 2.9, stripeFlatFee: 0.30, internationalCardRate: 0, currencyConversionRate: 0 },
  ];
  for (const input of bad) {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `expected null result for: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'expected non-empty error');
  }
});

// TC-F006: unreachable break-even with extreme seller costs
test('TC-F006 unreachable break-even', () => {
  const { result, error } = calculate({
    salePrice: 100,
    shippingCharged: 0,
    taxCollected: 0,
    productCost: 999999,
    fulfillmentCost: 0,
    opsCost: 0,
    stripeFeeRate: 99,
    stripeFlatFee: 0.30,
    internationalCardRate: 0,
    currencyConversionRate: 0
  }, { lang: 'en' });
  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null, 'break-even should be null when unreachable');
});

// TC-F007: summary coverage
test('TC-F007 summary coverage', () => {
  const { result } = calculate({}, { lang: 'en' });
  const s = result.summary;
  assert.ok(s.includes('100'), 'summary should mention sale price');
  assert.ok(s.includes('Revenue ex tax') || s.includes('revenueExTax') || s.includes('100.00'), 'summary should include revenue ex tax');
  assert.ok(s.includes('Gross charge') || s.includes('grossCharge'), 'summary should include gross charge');
  assert.ok(s.includes('Total Stripe fees') || s.includes('totalStripeFees'), 'summary should include total fees');
  assert.ok(s.includes('Net profit') || s.includes('netProfit'), 'summary should include net profit');
  assert.ok(s.includes('Break-even') || s.includes('breakEven'), 'summary should include break-even');
});

// Defaults shape
test('DEFAULTS shape is correct', () => {
  assert.equal(DEFAULTS.salePrice, 100);
  assert.equal(DEFAULTS.stripeFeeRate, 2.9);
  assert.equal(DEFAULTS.stripeFlatFee, 0.30);
  assert.equal(DEFAULTS.internationalCardRate, 0);
  assert.equal(DEFAULTS.currencyConversionRate, 0);
});
