const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, presetMap, presets } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  presetId: 'us',
  unitPrice: 35,
  quantity: 1,
  shippingCharged: 4.99,
  buyerExtras: 0,
  taxCollected: 0,
  unitCogs: 12,
  packagingCost: 0.8,
  sellerPostageCost: 4.2,
  etsyAdsSpend: 0,
  processingRate: presetMap.us.rate,
  processingFlat: presetMap.us.flat,
  offsiteRate: 0,
  includeTaxesInOffsiteFee: false,
  includeListingFee: true
};

test('exports required payment presets', () => {
  assert.ok(Array.isArray(presets));
  assert.equal(presetMap.uk.rate, 4);
  assert.equal(presetMap.kr.flat, 0.3);
  assert.ok(presetMap.custom);
});

test('TC-01 US baseline profitable order', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.revenueExTax, 39.99);
  approx(result.listingFee, 0.2);
  approx(result.transactionFee, 2.6);
  approx(result.processingFee, 1.45);
  approx(result.etsyFeeTotal, 4.25);
  approx(result.payoutAfterEtsyFees, 35.74);
  approx(result.netProfit, 18.74);
  approx(result.netMarginPct, 46.86);
  approx(result.breakEvenUnitPrice, 14.29);
  approx(result.maxDiscountPct, 59.17);
});

test('TC-02 multi-quantity listing fee scales with quantity', () => {
  const { result, error } = calculate({
    ...baseInput,
    unitPrice: 28,
    quantity: 3,
    shippingCharged: 6.99,
    unitCogs: 9,
    packagingCost: 1.2,
    sellerPostageCost: 5.5
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.revenueExTax, 90.99);
  approx(result.listingFee, 0.6);
  approx(result.transactionFee, 5.91);
  approx(result.processingFee, 2.98);
  approx(result.etsyFeeTotal, 9.49);
  approx(result.netProfit, 47.8);
});

test('TC-03 Offsite Ads 12% reduces profit materially', () => {
  const { result, error } = calculate({
    ...baseInput,
    offsiteRate: 12
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.offsiteAdsFee, 4.8);
  approx(result.etsyFeeTotal, 9.05);
  approx(result.payoutAfterEtsyFees, 30.94);
  approx(result.netProfit, 13.94);
  approx(result.breakEvenUnitPrice, 17.24);
  approx(result.maxDiscountPct, 50.74);
});

test('TC-04 Offsite Ads fee caps at $100', () => {
  const { result, error } = calculate({
    ...baseInput,
    unitPrice: 1000,
    quantity: 1,
    shippingCharged: 50,
    unitCogs: 400,
    packagingCost: 5,
    sellerPostageCost: 20,
    offsiteRate: 15
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.offsiteAdsFee, 100);
  assert.ok(result.netProfit > 0);
});

test('TC-05 country preset changes processing fee and net profit', () => {
  const us = calculate(baseInput, { lang: 'en' }).result;
  const uk = calculate({
    ...baseInput,
    presetId: 'uk',
    processingRate: presetMap.uk.rate,
    processingFlat: presetMap.uk.flat
  }, { lang: 'en' }).result;
  const kr = calculate({
    ...baseInput,
    presetId: 'kr',
    processingRate: presetMap.kr.rate,
    processingFlat: presetMap.kr.flat
  }, { lang: 'en' }).result;

  approx(us.processingFee, 1.45);
  approx(uk.processingFee, 1.8);
  approx(kr.processingFee, 2.9);
  approx(us.netProfit, 18.74);
  approx(uk.netProfit, 18.39);
  approx(kr.netProfit, 17.29);
});

test('TC-06 manual override beats preset', () => {
  const { result, error } = calculate({
    ...baseInput,
    processingRate: 5,
    processingFlat: 0.1
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processingFee, 2.1);
  approx(result.etsyFeeTotal, 4.9);
  approx(result.netProfit, 18.09);
});

test('TC-07 tax inclusion toggle affects fee base', () => {
  const { result, error } = calculate({
    ...baseInput,
    taxCollected: 3.2,
    offsiteRate: 12,
    includeTaxesInOffsiteFee: true
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.paymentBase, 43.19);
  approx(result.processingFee, 1.55);
  approx(result.offsiteAdsFee, 5.18);
  approx(result.netProfit, 13.46);
});

test('TC-08 listing fee can be treated as sunk cost', () => {
  const { result, error } = calculate({
    ...baseInput,
    includeListingFee: false
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.listingFee, 0);
  approx(result.etsyFeeTotal, 4.05);
  approx(result.netProfit, 18.94);
});

test('TC-09 validation rejects invalid values', () => {
  const invalidCases = [
    { ...baseInput, quantity: 0 },
    { ...baseInput, unitPrice: -1 },
    { ...baseInput, processingRate: 101 },
    { ...baseInput, offsiteRate: 101 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-10 break-even search returns sane fallback', () => {
  const { result, error } = calculate({
    ...baseInput,
    unitPrice: 10,
    shippingCharged: 0,
    unitCogs: 500,
    packagingCost: 50,
    sellerPostageCost: 50,
    processingRate: 100,
    processingFlat: 1000,
    offsiteRate: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenUnitPrice, null);
});

