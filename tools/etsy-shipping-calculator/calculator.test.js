const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, carrierMap, CARRIERS, calcDimensionalWeightOz, lookupRate } = require('./calculator.js');

function approx(actual, expected, tolerance) {
  tolerance = tolerance || 0.01;
  assert.ok(Math.abs(actual - expected) <= tolerance, 'expected ' + actual + ' ≈ ' + expected + ' (±' + tolerance + ')');
}

const baseInput = {
  packageWeightOz: 12,
  lengthIn: 10,
  widthIn: 8,
  heightIn: 4,
  carrier: 'usps-priority',
  zone: 5,
  itemPrice: 35,
  quantity: 1,
  shippingCharged: null
};

test('TC-01 USPS Priority Mail baseline Zone 5, 12 oz', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  // dims 10*8*4=320, 320/166=1.93 => ceil=2 oz dim weight; actual 12 wins
  assert.equal(out.result.billableWeightOz, 12);
  assert.equal(out.result.usedDimensional, false);
  approx(out.result.estimatedShippingCost, 9.45);
  approx(out.result.etsyShippingFee, 0.61);
  approx(out.result.totalShippingExpense, 10.06);
});

test('TC-02 Dimensional weight exceeds actual weight', function () {
  var out = calculate({
    packageWeightOz: 8,
    lengthIn: 18,
    widthIn: 14,
    heightIn: 12,
    carrier: 'usps-priority',
    zone: 5,
    itemPrice: 35,
    quantity: 1,
    shippingCharged: null
  }, { lang: 'en' });
  assert.equal(out.error, '');
  // dim = ceil(18*14*12 / 166) = ceil(3024/166) = ceil(18.22) = 19
  assert.equal(out.result.perItemDimWeightOz, 19);
  assert.equal(out.result.billableWeightOz, 19);
  assert.equal(out.result.usedDimensional, true);
});

test('TC-03 USPS First Class light package', function () {
  var out = calculate({
    packageWeightOz: 4,
    lengthIn: 6,
    widthIn: 4,
    heightIn: 2,
    carrier: 'usps-first-class',
    zone: 3,
    itemPrice: 15,
    quantity: 1,
    shippingCharged: null
  }, { lang: 'en' });
  assert.equal(out.error, '');
  assert.equal(out.result.billableWeightOz, 4);
  // First Class 4oz zone 3 rate = 3.90
  approx(out.result.estimatedShippingCost, 3.90);
});

test('TC-04 UPS Ground uses 139 dim factor, actual weight wins', function () {
  var out = calculate({
    packageWeightOz: 16,
    lengthIn: 12,
    widthIn: 10,
    heightIn: 8,
    carrier: 'ups-ground',
    zone: 5,
    itemPrice: 50,
    quantity: 1,
    shippingCharged: null
  }, { lang: 'en' });
  assert.equal(out.error, '');
  // dim = ceil(960/139) = ceil(6.91) = 7; actual 16 wins
  assert.equal(out.result.billableWeightOz, 16);
  assert.equal(out.result.usedDimensional, false);
});

test('TC-05 FedEx Ground dimensional weight dominates', function () {
  var out = calculate({
    packageWeightOz: 8,
    lengthIn: 20,
    widthIn: 16,
    heightIn: 12,
    carrier: 'fedex-ground',
    zone: 4,
    itemPrice: 45,
    quantity: 1,
    shippingCharged: null
  }, { lang: 'en' });
  assert.equal(out.error, '');
  // dim = ceil(3840/139) = ceil(27.63) = 28; 28 > 8
  assert.equal(out.result.perItemDimWeightOz, 28);
  assert.equal(out.result.billableWeightOz, 28);
  assert.equal(out.result.usedDimensional, true);
});

test('TC-06 Etsy 6.5% transaction fee on specified shipping charge', function () {
  var out = calculate({
    ...baseInput,
    shippingCharged: 10.00
  }, { lang: 'en' });
  assert.equal(out.error, '');
  approx(out.result.etsyShippingFee, 0.65);
});

test('TC-07 Free shipping profit impact', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  // freeShippingProfitImpact = -(9.45 + round2(9.45*0.065)) = -(9.45 + 0.61) = -10.06
  approx(out.result.freeShippingProfitImpact, -10.06);
});

test('TC-08 Suggested shipping price covers cost plus fee', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  // suggested = 9.45 / (1 - 0.065) = 9.45 / 0.935 = 10.1069... => 10.11
  approx(out.result.suggestedShippingPrice, 10.11);
});

test('TC-09 Multi-quantity order scales weight', function () {
  var out = calculate({
    ...baseInput,
    quantity: 3
  }, { lang: 'en' });
  assert.equal(out.error, '');
  // 3 * 12 = 36 oz total actual; dim = 2*3=6; actual wins
  assert.equal(out.result.billableWeightOz, 36);
  // 36 oz falls in the 32-48 tier for usps-priority zone 5: 13.45
  approx(out.result.estimatedShippingCost, 13.45);
});

test('TC-10 Validation rejects invalid inputs', function () {
  var cases = [
    { ...baseInput, packageWeightOz: 0 },
    { ...baseInput, packageWeightOz: -1 },
    { ...baseInput, zone: 0 },
    { ...baseInput, zone: 10 },
    { ...baseInput, lengthIn: 0 },
    { ...baseInput, quantity: 0 }
  ];
  cases.forEach(function (input) {
    var out = calculate(input, { lang: 'en' });
    assert.equal(out.result, null);
    assert.notEqual(out.error, '');
  });
});

test('TC-11 Zone 1 vs Zone 9 rate difference', function () {
  var z1 = calculate({ ...baseInput, zone: 1 }, { lang: 'en' });
  var z9 = calculate({ ...baseInput, zone: 9 }, { lang: 'en' });
  assert.equal(z1.error, '');
  assert.equal(z9.error, '');
  assert.ok(z9.result.estimatedShippingCost > z1.result.estimatedShippingCost,
    'Zone 9 should cost more than Zone 1');
  // Zone 1: 7.75, Zone 9: 12.30
  approx(z1.result.estimatedShippingCost, 7.75);
  approx(z9.result.estimatedShippingCost, 12.30);
});

test('TC-12 Summary contains required fields', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  assert.match(out.result.summary, /Billable weight/);
  assert.match(out.result.summary, /12 oz/);
  assert.match(out.result.summary, /Estimated shipping cost/);
  assert.match(out.result.summary, /Etsy shipping fee/);
  assert.match(out.result.summary, /Total shipping expense/);
  assert.match(out.result.summary, /Suggested shipping price/);
  assert.match(out.result.summary, /Free shipping profit impact/);
});
