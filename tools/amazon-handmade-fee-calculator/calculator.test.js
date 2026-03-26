const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const calc = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-AH-01 baseline 15 percent referral fee scenario', () => {
  const { result, error } = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: true,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.referralFee, 5.25);
  approx(result.orderRevenue, 41);
  approx(result.payoutAfterAmazonFee, 35.75);
  approx(result.sellerCostPerOrder, 20.75);
  approx(result.netProfitPerOrder, 15);
  approx(result.monthlyNetProfit, 560.01);
  approx(result.effectiveReferralRatePct, 15);
  assert.equal(result.paybackOrders, 3);
});

test('TC-AH-02 minimum fee floor binds under low prices', () => {
  const { result, error } = calc.calculate({
    itemPrice: 5,
    shippingCharged: 0,
    monthlyOrders: 10,
    itemCost: 1,
    packagingCost: 0.5,
    shippingCost: 0.5,
    adCostPerOrder: 0,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: false,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 10
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.referralFee, 1);
  approx(result.netProfitPerOrder, 2);
  approx(result.monthlyNetProfit, 20);
  approx(result.effectiveReferralRatePct, 20);
  approx(result.breakEvenItemPrice, 3);
});

test('TC-AH-03 first month fee drag lowers monthly profit only', () => {
  const withoutFirstMonth = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: false,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' }).result;

  const withFirstMonth = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: true,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' }).result;

  approx(withoutFirstMonth.monthlyNetProfit - withFirstMonth.monthlyNetProfit, 39.99);
  assert.equal(withFirstMonth.paybackOrders, 3);
});

test('TC-AH-04 ongoing monthly fee override drops monthly net exactly', () => {
  const base = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: false,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' }).result;

  const withOngoing = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: false,
    ongoingMonthlyFee: 25,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' }).result;

  approx(base.monthlyNetProfit - withOngoing.monthlyNetProfit, 25);
});

test('TC-AH-05 break-even and target-price outputs are deterministic', () => {
  const { result, error } = calc.calculate({
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: true,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.breakEvenItemPrice, 17.35, 0.03);
  approx(result.requiredItemPriceForTargetMonthlyNet, 47.94, 0.03);
  assert.ok(result.requiredItemPriceForTargetMonthlyNet > result.itemPrice);
});

test('TC-AH-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { itemPrice: 0, monthlyOrders: 10 },
    { itemPrice: 10, monthlyOrders: -1 },
    { itemPrice: 10, monthlyOrders: 1.5 },
    { itemPrice: 10, monthlyOrders: 10, itemCost: -1 },
    { itemPrice: 10, monthlyOrders: 10, targetMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calc.calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-AH-07 html includes required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Amazon Handmade Fee Calculator',
    '/assets/analytics.js',
    'langBtn',
    'includeFirstMonthProfessionalFee',
    'script defer src="./calculator.js"',
    'targetMonthlyNetProfit'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-AH-08 summary contains decision-ready fields', () => {
  const { result, error } = calc.calculate(calc.DEFAULTS, { lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /Item price:/);
  assert.match(result.summary, /Referral fee \/ order:/);
  assert.match(result.summary, /Net profit \/ order:/);
  assert.match(result.summary, /Monthly net profit:/);
  assert.match(result.summary, /Break-even item price:/);
});

test('TC-AH-09 discovery exact once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'amazon-handmade-fee-calculator';
  const url = `/tools/${slug}/`;
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});

test('TC-AH-10 manifest size matches folder size', () => {
  const root = path.join(__dirname, '..', '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const entry = manifest.tools.find((item) => item.slug === 'amazon-handmade-fee-calculator');
  assert.ok(entry, 'manifest entry missing');

  const dir = path.join(root, 'tools', 'amazon-handmade-fee-calculator');
  const actualSize = fs.readdirSync(dir).reduce((sum, file) => sum + fs.statSync(path.join(dir, file)).size, 0);
  assert.equal(entry.size, actualSize);
});
