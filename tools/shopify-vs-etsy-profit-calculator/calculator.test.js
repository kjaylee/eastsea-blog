const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const calc = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);
}

test('TC1 baseline: Shopify wins at mid volume', () => {
  const r = calc.calculate({
    monthlyOrders: 120,
    productPrice: 48,
    shippingCharged: 6,
    productCost: 16,
    shippingLabelCost: 5,
    etsyTransactionRate: 6.5,
    etsyPaymentRate: 3.0,
    etsyPaymentFixed: 0.25,
    etsyListingFee: 0.20,
    etsyOffsiteAdsRate: 0,
    shopifyPlanCost: 39,
    shopifyPaymentRate: 2.9,
    shopifyPaymentFixed: 0.30,
    shopifyThirdPartyRate: 0,
    shopifyAppsMonthly: 15
  });

  assert.equal(r.error, '');
  const m = r.result.main;
  approx(m.grossRevenue, 6480);
  approx(m.etsyNetProfit, 3290.4);
  approx(m.shopifyNetProfit, 3681.6);
  approx(m.monthlyDelta, 391.2);
  approx(m.annualDelta, 4694.4);
  approx(m.breakEvenOrders, 14.56);
  assert.equal(r.result.verdict, 'shopify-wins');
});

test('TC2 low volume: Etsy wins before break-even', () => {
  const r = calc.calculate({
    monthlyOrders: 8,
    productPrice: 30,
    shippingCharged: 5,
    productCost: 12,
    shippingLabelCost: 4
  });

  assert.equal(r.error, '');
  const m = r.result.main;
  approx(m.etsyNetProfit, 121.76);
  approx(m.shopifyNetProfit, 87.44);
  approx(m.monthlyDelta, -34.32);
  assert.equal(r.result.verdict, 'etsy-wins');
});

test('TC3 Etsy offsite ads widen Shopify advantage', () => {
  const baseline = calc.calculate({ monthlyOrders: 120 });
  const ads = calc.calculate({ monthlyOrders: 120, etsyOffsiteAdsRate: 12 });

  assert.equal(baseline.error, '');
  assert.equal(ads.error, '');
  assert.ok(ads.result.main.monthlyDelta > baseline.result.main.monthlyDelta);
  assert.ok(ads.result.main.breakEvenOrders < baseline.result.main.breakEvenOrders);
});

test('TC4 high Shopify third-party fee removes break-even', () => {
  const r = calc.calculate({ monthlyOrders: 120, shopifyThirdPartyRate: 8 });
  assert.equal(r.error, '');
  assert.equal(r.result.main.breakEvenOrders, null);
  assert.equal(r.result.verdict, 'etsy-wins');
});

test('TC5 validation rejects invalid values', () => {
  assert.ok(calc.calculate({ monthlyOrders: -1 }).error.length > 0);
  assert.ok(calc.calculate({ productPrice: 0 }).error.length > 0);
  assert.ok(calc.calculate({ etsyTransactionRate: 101 }).error.length > 0);
});

test('TC6 scenarios and summary exist', () => {
  const r = calc.calculate({});
  assert.equal(r.error, '');
  assert.equal(r.result.scenarios.length, 4);
  assert.equal(r.result.scenarios[0].orders, 25);
  assert.match(r.result.summary, /Monthly delta/);
  assert.match(r.result.summary, /break-even/i);
});

test('TC7 HTML scaffold matches tool intent', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /<title>Shopify vs Etsy Profit Calculator/i);
  assert.match(html, /<h1>Shopify vs Etsy Profit Calculator/i);
  assert.match(html, /All Tools/);
});
