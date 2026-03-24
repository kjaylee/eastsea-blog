const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

// TC-01 baseline profitable order
test('TC-01 baseline profitable order', () => {
  const { result, error } = calculate({
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 18,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 50.00);
  approx(result.poshmarkFee, 10.00);
  approx(result.payoutAfterPoshmarkFee, 40.00);
  approx(result.sellerCostTotal, 18.50);
  approx(result.netProfit, 21.50);
  assert.ok(result.breakEvenListPrice !== null && result.breakEvenListPrice < 50,
    'break-even should be finite and below list price');
});

// TC-02 low-ticket order uses flat fee under $15
test('TC-02 low-ticket order uses flat $2.95 fee under $15', () => {
  const { result, error } = calculate({
    listPrice: 12,
    offerDiscountPct: 0,
    itemCost: 2,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 12.00);
  approx(result.poshmarkFee, 2.95);
  assert.ok(result.effectivePoshmarkFeeRatePct > 20,
    'effective fee rate should exceed 20% for low-ticket items');
});

// TC-03 offer discount changes realized sale and fee outcome
test('TC-03 offer discount changes realized sale price and fee', () => {
  const { result, error } = calculate({
    listPrice: 60,
    offerDiscountPct: 20,
    itemCost: 20,
    sellerShippingDiscount: 2,
    packagingCost: 0.5,
    otherCost: 1
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 48.00);
  approx(result.poshmarkFee, 9.60);
  approx(result.payoutAfterPoshmarkFee, 38.40);
  approx(result.sellerCostTotal, 23.50);
  approx(result.netProfit, 14.90);
});

// TC-04 seller shipping discount reduces profit deterministically
test('TC-04 seller shipping discount reduces profit by exact amount', () => {
  const base = {
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 18,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  };
  const withShipping = { ...base, sellerShippingDiscount: 4.99 };

  const r1 = calculate(base, { lang: 'en' }).result;
  const r2 = calculate(withShipping, { lang: 'en' }).result;

  approx(r1.netProfit - r2.netProfit, 4.99, 0.01);
});

// TC-05 invalid inputs are rejected
test('TC-05 invalid inputs are rejected', () => {
  const base = {
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 18,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  };

  const badCases = [
    { ...base, listPrice: -1 },
    { ...base, packagingCost: -0.5 },
    { ...base, offerDiscountPct: 110 },
    { ...base, listPrice: 10, offerDiscountPct: 100 }  // realized <= 0
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-06 break-even can be unreachable
test('TC-06 break-even returns null when unreachable inside search window', () => {
  // Extreme costs so profit never turns positive
  const { result, error } = calculate({
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 99999,
    sellerShippingDiscount: 0,
    packagingCost: 0,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenListPrice, null);
});

// TC-07 max offer discount is computable for profitable listings
test('TC-07 max offer discount is finite and valid', () => {
  const { result, error } = calculate({
    listPrice: 80,
    offerDiscountPct: 0,
    itemCost: 20,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.maxOfferDiscountPct !== null, 'maxOfferDiscountPct should not be null');
  assert.ok(result.maxOfferDiscountPct < 100, 'maxOfferDiscountPct should be below 100');

  // Verify: applying a discount above the max should yield negative profit
  const overMax = calculate({
    listPrice: 80,
    offerDiscountPct: result.maxOfferDiscountPct + 1,
    itemCost: 20,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  }, { lang: 'en' }).result;

  assert.ok(overMax.netProfit < 0, 'exceeding maxOfferDiscountPct should yield negative profit');
});

// TC-08 summary includes all required decision-ready fields
test('TC-08 summary includes all required fields', () => {
  const { result, error } = calculate({
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 18,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /List price:.*50/);
  assert.match(result.summary, /Realized sale price:.*50/);
  assert.match(result.summary, /Poshmark fee:.*10/);
  assert.match(result.summary, /Payout after fee:.*40/);
  assert.match(result.summary, /Net profit:.*21/);
  assert.match(result.summary, /Break-even list price:/);
  assert.match(result.summary, /Max offer discount before loss:/);
});

// DEFAULTS export check
test('DEFAULTS export has expected shape', () => {
  assert.ok(typeof DEFAULTS.listPrice === 'number');
  assert.ok(typeof DEFAULTS.offerDiscountPct === 'number');
  assert.ok(typeof DEFAULTS.itemCost === 'number');
  assert.equal(DEFAULTS.listPrice, 50);
  assert.equal(DEFAULTS.itemCost, 18);
  assert.equal(DEFAULTS.packagingCost, 0.5);
});

// $15 fee cliff boundary check
test('fee cliff: $14.99 uses flat $2.95, $15.00 uses 20%', () => {
  const r1 = calculate({
    listPrice: 14.99, offerDiscountPct: 0,
    itemCost: 0, sellerShippingDiscount: 0, packagingCost: 0, otherCost: 0
  }, { lang: 'en' }).result;
  const r2 = calculate({
    listPrice: 15, offerDiscountPct: 0,
    itemCost: 0, sellerShippingDiscount: 0, packagingCost: 0, otherCost: 0
  }, { lang: 'en' }).result;

  approx(r1.poshmarkFee, 2.95);
  approx(r2.poshmarkFee, 3.00); // 15 * 0.20
});
