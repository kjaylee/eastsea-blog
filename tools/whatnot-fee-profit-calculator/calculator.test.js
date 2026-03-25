const test   = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

const BASE = {
  salePrice:             50,
  sellerCouponAmount:    0,
  commissionProfile:     'all-other-categories',
  buyerShippingPaid:     5.5,
  buyerTax:              3.2,
  itemCost:              18,
  sellerShippingSubsidy: 0,
  packagingCost:         0.75,
  otherCost:             0
};

// TC-WN-01 — Default scenario acceptance check
test('TC-WN-01 default scenario — commissionFee=4.00, processingFee≈2.00, payoutAfterFees=44.00', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  approx(result.finalSalePrice,    50.00);
  approx(result.commissionFee,      4.00);
  // buyerOrderTotal=58.7 → 58.7*0.029+0.30=2.0023
  approx(result.processingFee,      2.00, 0.02);
  approx(result.totalPlatformFees,  6.00, 0.03);
  approx(result.payoutAfterFees,   44.00, 0.03);
  assert.ok(result.netProfit > 0, 'net profit should be positive');
  assert.ok(result.breakEvenSalePrice !== null && result.breakEvenSalePrice < 50,
    'break-even should be finite and below sale price');
});

// TC-WN-02 — coins-money-limited under $1,500 cap
test('TC-WN-02 coins-money-limited under $1500 applies 4% flat', () => {
  const { result, error } = calculate({ ...BASE, salePrice: 100, commissionProfile: 'coins-money-limited' }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 4.00); // 100 * 0.04
  approx(result.finalSalePrice, 100.00);
});

// TC-WN-03 — coins-money-limited over $1,500 cap (commission capped at 60.00)
test('TC-WN-03 coins-money-limited over $1500 caps at $1500 basis', () => {
  const { result, error } = calculate({ ...BASE, salePrice: 2000, commissionProfile: 'coins-money-limited' }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 60.00); // min(2000,1500)*0.04 = 60.00
});

// TC-WN-04 — promo-categories-over-1500-limited under $1,500 applies 8%
test('TC-WN-04 promo-categories-over-1500-limited under $1500 applies 8%', () => {
  const { result, error } = calculate({ ...BASE, salePrice: 1000, commissionProfile: 'promo-categories-over-1500-limited' }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 80.00); // 1000 * 0.08
});

// TC-WN-05 — promo-categories-over-1500-limited over $1,500 cap (capped at 120.00)
test('TC-WN-05 promo-categories-over-1500-limited over $1500 caps at $1500 basis', () => {
  const { result, error } = calculate({ ...BASE, salePrice: 2000, commissionProfile: 'promo-categories-over-1500-limited' }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 120.00); // min(2000,1500)*0.08 = 120.00
});

// TC-WN-06 — seller coupon reduces finalSalePrice
test('TC-WN-06 seller coupon reduces finalSalePrice and fees proportionally', () => {
  // Same salePrice, different coupon amounts → different finalSalePrice and profit
  const noCoupon  = calculate({ ...BASE, salePrice: 60 }, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, salePrice: 60, sellerCouponAmount: 10 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.finalSalePrice, 50.00);
  approx(result.commissionFee,   4.00); // 50 * 0.08
  assert.ok(result.netProfit < noCoupon.netProfit, 'coupon reduces profit versus no-coupon same-sale-price baseline');
});

// TC-WN-07 — processing fee uses buyerOrderTotal (includes shipping + tax)
test('TC-WN-07 processing fee is based on buyerOrderTotal not just finalSalePrice', () => {
  const noExtras  = calculate({ ...BASE, buyerShippingPaid: 0, buyerTax: 0 }, { lang: 'en' }).result;
  const withExtras = calculate(BASE, { lang: 'en' }).result;

  // With extras: buyerOrderTotal is higher → processingFee is higher
  assert.ok(withExtras.processingFee > noExtras.processingFee,
    'adding buyer shipping + tax should increase processing fee');
});

// TC-WN-08 — maxSellerCouponAmount bounds
test('TC-WN-08 maxSellerCouponAmount is bounded and accurate', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.maxSellerCouponAmount !== null, 'maxSellerCouponAmount should not be null');
  assert.ok(result.maxSellerCouponAmount >= 0 && result.maxSellerCouponAmount < 50,
    'maxSellerCouponAmount should be in [0, salePrice)');

  // At max coupon, profit should be near zero or positive
  const atMax = calculate({ ...BASE, sellerCouponAmount: result.maxSellerCouponAmount }, { lang: 'en' }).result;
  assert.ok(atMax.netProfit >= -0.05, 'at max coupon profit should be near zero or positive');
});

// TC-WN-09 — break-even unreachable with extreme costs
test('TC-WN-09 breakEvenSalePrice returns null when unreachable', () => {
  const { result, error } = calculate({
    salePrice:             25,
    sellerCouponAmount:    0,
    commissionProfile:     'all-other-categories',
    buyerShippingPaid:     0,
    buyerTax:              0,
    itemCost:              2000000,
    sellerShippingSubsidy: 100000,
    packagingCost:         10000,
    otherCost:             10000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null);
  assert.ok(result.netProfit < 0, 'net profit should be negative');
});

// TC-WN-10 — invalid inputs are rejected
test('TC-WN-10 invalid inputs are rejected', () => {
  const badCases = [
    { ...BASE, salePrice: -1 },
    { ...BASE, itemCost: -5 },
    { ...BASE, sellerCouponAmount: -1 },
    { ...BASE, commissionProfile: 'unknown-profile' },
    { ...BASE, salePrice: 10, sellerCouponAmount: 10 }  // finalSalePrice = 0
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-WN-11 — summary includes required fields
test('TC-WN-11 summary includes all required fields', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Sale price:.*50/);
  assert.match(result.summary, /Final sale price:.*50/);
  assert.match(result.summary, /Commission profile:.*all-other-categories/);
  assert.match(result.summary, /Commission fee:/);
  assert.match(result.summary, /Total platform fees:/);
  assert.match(result.summary, /Payout after fees:/);
  assert.match(result.summary, /Net profit:/);
  assert.match(result.summary, /Break-even sale price:/);
  assert.match(result.summary, /Max seller coupon:/);
});

// TC-WN-12 — DEFAULTS shape check
test('TC-WN-12 DEFAULTS export has expected shape', () => {
  assert.ok(typeof DEFAULTS.salePrice === 'number');
  assert.ok(typeof DEFAULTS.sellerCouponAmount === 'number');
  assert.ok(typeof DEFAULTS.commissionProfile === 'string');
  assert.equal(DEFAULTS.salePrice, 50);
  assert.equal(DEFAULTS.itemCost, 18);
  assert.equal(DEFAULTS.commissionProfile, 'all-other-categories');
});

// TC-WN-13 — Korean language returns localized strings
test('TC-WN-13 Korean language returns localized strings', () => {
  const { result, error } = calculate(BASE, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.summary, /Whatnot 수수료·순이익 요약/);
  assert.ok(result.status.includes('플러스') || result.status.includes('마이너스'));
});
