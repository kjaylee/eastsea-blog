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
  listPrice: 180,
  offerDiscountPct: 0,
  paymentProfile: 'stripe-onboarded-domestic',
  itemCost: 70,
  shippingCost: 12,
  packagingCost: 0.75,
  otherCost: 0
};

// TC-GR-01 — Stripe-onboarded domestic baseline
test('TC-GR-01 baseline profitable (stripe-onboarded-domestic)', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 180.00);
  approx(result.grailedCommission, 16.20);
  // 180 * 0.0349 + 0.49 = 6.282 + 0.49 = 6.772
  approx(result.processingFee, 6.77, 0.01);
  approx(result.totalPlatformFees, 22.97, 0.03);
  approx(result.sellerCostTotal, 82.75);
  assert.ok(result.netProfit > 0, 'net profit should be positive');
  assert.ok(result.breakEvenListPrice !== null && result.breakEvenListPrice < 180,
    'break-even should be finite and below list price');
});

// TC-GR-02 — International Stripe-onboarded increases fee
test('TC-GR-02 international increases processing fee', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, paymentProfile: 'stripe-onboarded-international' }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.processingFee > base.processingFee, 'international fee should exceed domestic');
  assert.ok(result.totalPlatformFees > base.totalPlatformFees, 'total fees should be higher');
  assert.ok(result.netProfit < base.netProfit, 'net profit should decrease');
});

// TC-GR-03 — Not-onboarded domestic: higher flat fee
test('TC-GR-03 not-onboarded-domestic raises flat fee to $0.99', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, paymentProfile: 'not-onboarded-domestic' }, { lang: 'en' });

  assert.equal(error, '');
  // flat diff = 0.99 - 0.49 = 0.50
  approx(result.processingFee - base.processingFee, 0.50, 0.01);
  assert.ok(result.netProfit < base.netProfit, 'net profit should decrease');
});

// TC-GR-04 — Offer discount 15% compresses profit
test('TC-GR-04 offer discount 15% compresses profit', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, offerDiscountPct: 15 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 153.00);
  assert.ok(result.grailedCommission < base.grailedCommission, 'commission should decrease');
  assert.ok(result.netProfit < base.netProfit, 'net profit should decrease');
});

// TC-GR-05 — maxOfferDiscountPct bounds
test('TC-GR-05 maxOfferDiscountPct is bounded and accurate', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.maxOfferDiscountPct !== null, 'maxOfferDiscountPct should not be null');
  assert.ok(result.maxOfferDiscountPct > 0 && result.maxOfferDiscountPct < 100,
    'maxOfferDiscountPct should be between 0 and 100');

  // Applying max discount should still yield >= 0 profit
  const atMax = calculate({ ...BASE, offerDiscountPct: result.maxOfferDiscountPct }, { lang: 'en' }).result;
  assert.ok(atMax.netProfit >= -0.05, 'at max discount profit should be near zero or positive');

  // One percent above max should yield negative
  const overMax = calculate({ ...BASE, offerDiscountPct: result.maxOfferDiscountPct + 1 }, { lang: 'en' }).result;
  assert.ok(overMax.netProfit < 0, 'exceeding max discount should yield negative profit');
});

// TC-GR-06 — Break-even unreachable with extreme costs
test('TC-GR-06 break-even returns null when unreachable', () => {
  const { result, error } = calculate({
    listPrice: 25,
    offerDiscountPct: 0,
    paymentProfile: 'not-onboarded-international',
    itemCost: 2000000,
    shippingCost: 100000,
    packagingCost: 10000,
    otherCost: 10000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenListPrice, null);
  assert.ok(result.netProfit < 0, 'net profit should be negative');
});

// TC-GR-07 — Invalid inputs are rejected
test('TC-GR-07 invalid inputs are rejected', () => {
  const badCases = [
    { ...BASE, listPrice: -1 },
    { ...BASE, itemCost: -5 },
    { ...BASE, offerDiscountPct: 110 },
    { ...BASE, paymentProfile: 'unknown-profile' },
    { ...BASE, listPrice: 10, offerDiscountPct: 100 }  // realized <= 0
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-GR-08 — Summary includes required decision-ready fields
test('TC-GR-08 summary includes all required fields', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /List price:.*180/);
  assert.match(result.summary, /Realized sale price:.*180/);
  assert.match(result.summary, /Payment profile:.*stripe-onboarded-domestic/);
  assert.match(result.summary, /Total platform fees:/);
  assert.match(result.summary, /Payout after fees:/);
  assert.match(result.summary, /Net profit:/);
  assert.match(result.summary, /Break-even list price:/);
  assert.match(result.summary, /Max offer discount before loss:/);
});

// DEFAULTS shape check
test('DEFAULTS export has expected shape', () => {
  assert.ok(typeof DEFAULTS.listPrice === 'number');
  assert.ok(typeof DEFAULTS.offerDiscountPct === 'number');
  assert.ok(typeof DEFAULTS.paymentProfile === 'string');
  assert.equal(DEFAULTS.listPrice, 180);
  assert.equal(DEFAULTS.itemCost, 70);
  assert.equal(DEFAULTS.paymentProfile, 'stripe-onboarded-domestic');
});

// non-stripe-country-default uses 4.99% + $0.49
test('non-stripe-country-default uses 4.99% + $0.49 same as stripe-intl but different profile', () => {
  const { result, error } = calculate({ ...BASE, paymentProfile: 'non-stripe-country-default' }, { lang: 'en' });
  const intl = calculate({ ...BASE, paymentProfile: 'stripe-onboarded-international' }, { lang: 'en' }).result;

  assert.equal(error, '');
  // same rate/flat as stripe-onboarded-international
  approx(result.processingFee, intl.processingFee, 0.01);
});

// KO language test
test('Korean language returns localized strings', () => {
  const { result, error } = calculate(BASE, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.summary, /Grailed 수수료·순이익 요약/);
  assert.ok(result.status.includes('플러스') || result.status.includes('마이너스'));
});
