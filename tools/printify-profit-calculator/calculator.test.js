const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  calculateScenario,
  calculateRequiredRetail,
  calculatePremiumBreakEven,
  buildComparison,
  calculate,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-PRINTIFY-01 free plan baseline matches formula contract', () => {
  const result = calculateScenario({
    retailPrice: 24.99,
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'free',
    premiumDiscountPct: 20,
  });

  approx(result.gross, 24.99);
  approx(result.effectiveProductCost, 10);
  approx(result.storefrontFee, 1.82435);
  approx(result.totalSellerCost, 15.82435);
  approx(result.netProfit, 9.16565);
  approx(result.marginPct, 36.68, 0.01);
});

test('TC-PRINTIFY-02 premium branch applies discount and increases profit', () => {
  const result = calculateScenario({
    retailPrice: 24.99,
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'premium',
    premiumDiscountPct: 20,
  });

  approx(result.effectiveProductCost, 8);
  approx(result.storefrontFee, 1.82435);
  approx(result.totalSellerCost, 13.82435);
  approx(result.netProfit, 11.16565);
  approx(result.marginPct, 44.68, 0.01);
});

test('TC-PRINTIFY-03 customer-paid shipping lifts gross and margin', () => {
  const result = calculateScenario({
    retailPrice: 24.99,
    customerShippingCharge: 4.99,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'free',
    premiumDiscountPct: 20,
  });

  approx(result.gross, 29.98);
  approx(result.storefrontFee, 2.1487);
  approx(result.totalSellerCost, 16.1487);
  approx(result.netProfit, 13.8313);
  approx(result.marginPct, 46.14, 0.01);
});

test('TC-PRINTIFY-04 other seller costs are included in total cost', () => {
  const result = calculateScenario({
    retailPrice: 29.99,
    customerShippingCharge: 4.99,
    productCost: 8.77,
    printifyShippingCost: 4.5,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 1.5,
    planMode: 'free',
    premiumDiscountPct: 20,
  });

  approx(result.gross, 34.98);
  approx(result.storefrontFee, 2.4737);
  approx(result.totalSellerCost, 17.2437);
  approx(result.netProfit, 17.7363);
  approx(result.marginPct, 50.70, 0.01);
});

test('TC-PRINTIFY-05 required retail for 40% margin matches free-plan solver', () => {
  const solved = calculateRequiredRetail({
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'free',
    premiumDiscountPct: 20,
    targetMarginPct: 40,
  });

  assert.equal(solved.blocked, false);
  approx(solved.baseCosts, 14.2);
  approx(solved.denominator, 0.535);
  approx(solved.requiredGross, 26.542056, 0.0002);
  approx(solved.requiredRetailPrice, 26.542056, 0.0002);
});

test('TC-PRINTIFY-06 premium solver lowers required retail price', () => {
  const solved = calculateRequiredRetail({
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'premium',
    premiumDiscountPct: 20,
    targetMarginPct: 40,
  });

  assert.equal(solved.blocked, false);
  approx(solved.baseCosts, 12.2);
  approx(solved.requiredRetailPrice, 22.803738, 0.0002);
});

test('TC-PRINTIFY-07 solver returns blocked state when denominator is zero or below', () => {
  const solved = calculateRequiredRetail({
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 65,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'free',
    premiumDiscountPct: 20,
    targetMarginPct: 35,
  });

  assert.equal(solved.blocked, true);
  assert.equal(solved.requiredRetailPrice, null);
  assert.match(solved.error, /no room to solve/i);
});

test('TC-PRINTIFY-08 premium break-even uses $24.99 and $39 plan assumptions', () => {
  const premium = calculatePremiumBreakEven({
    productCost: 10,
    premiumDiscountPct: 20,
  });

  approx(premium.premiumUpliftPerOrder, 2);
  assert.equal(premium.annualBreakEvenOrders, 13);
  assert.equal(premium.monthlyBreakEvenOrders, 20);
  assert.equal(premium.noSavings, false);
});

test('TC-PRINTIFY-09 zero-discount premium shows no-savings state', () => {
  const premium = calculatePremiumBreakEven({
    productCost: 10,
    premiumDiscountPct: 0,
  });

  approx(premium.premiumUpliftPerOrder, 0);
  assert.equal(premium.annualBreakEvenOrders, null);
  assert.equal(premium.monthlyBreakEvenOrders, null);
  assert.equal(premium.noSavings, true);
});

test('TC-PRINTIFY-10 comparison returns free and premium branches deterministically', () => {
  const comparison = buildComparison(DEFAULTS);
  assert.equal(comparison.free.planMode, 'free');
  assert.equal(comparison.premium.planMode, 'premium');
  assert.ok(comparison.premium.netProfit > comparison.free.netProfit);
});

test('TC-PRINTIFY-11 calculate returns decision-ready summary', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /Printify Profit Calculator Summary/);
  assert.match(result.summary, /Required retail price for 40% margin/);
  assert.match(result.summary, /Premium uplift per order vs Free/);
  assert.match(result.summary, /\$24\.99\/mo equivalent/);
  assert.match(result.summary, /\$39\/mo/);
});

test('TC-PRINTIFY-12 validation rejects malformed inputs', () => {
  const invalidCases = [
    { ...DEFAULTS, retailPrice: -1 },
    { ...DEFAULTS, productCost: -1 },
    { ...DEFAULTS, storefrontFeePercent: 101 },
    { ...DEFAULTS, premiumDiscountPct: -1 },
    { ...DEFAULTS, planMode: 'enterprise' },
    { ...DEFAULTS, targetMarginPct: 100 },
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-PRINTIFY-13 HTML contains required Printify, Premium, 40%, and disclaimer copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Printify Profit Calculator',
    'Premium',
    '40%',
    'up to 33%',
    'tax / VAT / customs are excluded',
    '/assets/analytics.js',
    './calculator.js',
    '/tools/etsy-fee-calculator/',
    '/tools/shopify-fee-calculator/',
    '/tools/creator-merch-profit-calculator/',
    '/tools/printful-profit-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-PRINTIFY-14 discovery wiring is exact-once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'printify-profit-calculator';
  const url = `/tools/${slug}/`;
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
