const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  solveProductPrice,
  computeOrderMetrics,
  getMonthlyFixedCosts
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  productPrice: 35,
  shippingChargedToBuyer: 6,
  giftWrapChargedToBuyer: 0,
  materialCost: 10,
  packagingCost: 2,
  shippingCost: 5,
  adCostPerOrder: 3,
  monthlyOrders: 40,
  includeFirstMonthProfessionalFee: false,
  firstMonthProfessionalFee: 39.99,
  otherMonthlyCost: 80,
  targetMonthlyNet: 1000,
  currency: 'USD'
};

test('TC-AH-01 baseline order economics', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.buyerChargeBasis, 41);
  approx(result.referralFeePerOrder, 6.15);
  approx(result.effectiveReferralRatePct, 15);
  approx(result.variableCostPerOrder, 20);
  approx(result.netProfitPerOrder, 14.85);
  approx(result.monthlyFixedCosts, 80);
  approx(result.monthlyNetProfit, 514);
  assert.equal(result.requiredMonthlyOrders, 73);
  approx(result.breakEvenProductPrice, 19.88, 0.02);
  approx(result.targetProductPrice, 49.29, 0.02);
});

test('TC-AH-02 first-month fee is optional and subtracts dollar-for-dollar', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const firstMonth = calculate({ ...baseline, includeFirstMonthProfessionalFee: true }, { lang: 'en' }).result;

  approx(firstMonth.monthlyFixedCosts - base.monthlyFixedCosts, 39.99);
  approx(base.monthlyNetProfit - firstMonth.monthlyNetProfit, 39.99);
});

test('TC-AH-03 minimum referral fee floor works', () => {
  const { result, error } = calculate({
    productPrice: 1,
    shippingChargedToBuyer: 0,
    giftWrapChargedToBuyer: 0,
    materialCost: 0,
    packagingCost: 0,
    shippingCost: 0,
    adCostPerOrder: 0,
    monthlyOrders: 1,
    includeFirstMonthProfessionalFee: false,
    firstMonthProfessionalFee: 39.99,
    otherMonthlyCost: 0,
    targetMonthlyNet: 0,
    currency: 'USD'
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.buyerChargeBasis, 1);
  approx(result.referralFeePerOrder, 0.30);
  approx(result.effectiveReferralRatePct, 30);
  approx(result.netProfitPerOrder, 0.70);
});

test('TC-AH-04 more buyer-paid shipping increases fee basis', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const higherShipping = calculate({ ...baseline, shippingChargedToBuyer: 10 }, { lang: 'en' }).result;

  assert.ok(higherShipping.buyerChargeBasis > base.buyerChargeBasis);
  assert.ok(higherShipping.referralFeePerOrder > base.referralFeePerOrder);
  assert.ok(higherShipping.netProfitPerOrder > base.netProfitPerOrder);
});

test('TC-AH-05 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, productPrice: 0 },
    { ...baseline, materialCost: -1 },
    { ...baseline, monthlyOrders: 0 },
    { ...baseline, monthlyOrders: 1.5 },
    { ...baseline, targetMonthlyNet: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('helper functions stay callable', () => {
  const metrics = computeOrderMetrics(baseline);
  approx(metrics.buyerChargeBasis, 41);
  approx(getMonthlyFixedCosts(baseline), 80);
  approx(solveProductPrice(baseline, 0), 19.88, 0.02);
});

test('DEFAULTS export is valid', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result.monthlyNetProfit > 0);
});

test('HTML scaffold contains required anchors and official copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'productPrice',
    'shippingChargedToBuyer',
    'giftWrapChargedToBuyer',
    'materialCost',
    'packagingCost',
    'shippingCost',
    'adCostPerOrder',
    'monthlyOrders',
    'includeFirstMonthProfessionalFee',
    'firstMonthProfessionalFee',
    'otherMonthlyCost',
    'targetMonthlyNet',
    'summary',
    '/assets/analytics.js',
    'amazon handmade fee calculator',
    'rel="canonical"'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Amazon Handmade Fee Calculator/);
  assert.match(html, /15% of the buyer charge basis or \$0\.30 minimum/);
  assert.match(html, /product price \+ shipping charged to buyer \+ gift-wrap charged to buyer/);
  assert.match(html, /https:\/\/eastsea\.monster\/tools\/amazon-handmade-fee-calculator\//);
});

test('TC-AH-06 discovery exact-once wiring and corrected copy', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'amazon-handmade-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');

  assert.match(indexMd, /\$0\.30 minimum fee/);
  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.match(listEntry.description, /\$0\.30 minimum fee/);
});
