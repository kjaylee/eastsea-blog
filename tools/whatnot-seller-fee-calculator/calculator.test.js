const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PRESETS,
  PROCESSING_RATE,
  PROCESSING_FLAT,
  resolveCommissionRatePct
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  salePrice: 50,
  commissionPreset: 'standard',
  commissionRatePct: 8,
  buyerShipping: 8.2,
  buyerTax: 3.5,
  itemCost: 18,
  sellerShippingSubsidy: 0,
  packagingCost: 1.25,
  otherCost: 0
};

test('exports required Whatnot constants and presets', () => {
  assert.equal(DEFAULTS.salePrice, 50);
  assert.equal(PROCESSING_RATE, 0.029);
  assert.equal(PROCESSING_FLAT, 0.3);
  assert.equal(PRESETS.length, 4);
  assert.equal(resolveCommissionRatePct({ commissionPreset: 'standard', commissionRatePct: 99 }), 8);
  assert.equal(resolveCommissionRatePct({ commissionPreset: 'electronics', commissionRatePct: 99 }), 5);
  assert.equal(resolveCommissionRatePct({ commissionPreset: 'coins-money', commissionRatePct: 99 }), 4);
  assert.equal(resolveCommissionRatePct({ commissionPreset: 'custom', commissionRatePct: 12.5 }), 12.5);
});

test('TC-WN-01 baseline standard order', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 4);
  approx(result.processingBase, 61.7);
  approx(result.processingFee, 2.09);
  approx(result.whatnotFeeTotal, 6.09);
  approx(result.payoutAfterFees, 43.91);
  approx(result.sellerCostTotal, 19.25);
  approx(result.totalCost, 25.34);
  approx(result.netProfit, 24.66);
  approx(result.netMarginPct, 49.32);
  approx(result.effectiveFeeRatePct, 12.18);
  approx(result.breakEvenSalePrice, 22.32);
  approx(result.maxSellerShippingSubsidyBeforeLoss, 24.66);
  approx(result.maxItemCostBeforeLoss, 42.66);
});

test('TC-WN-02 electronics preset lowers fees and lifts profit', () => {
  const standard = calculate(baseInput, { lang: 'en' }).result;
  const electronics = calculate({ ...baseInput, commissionPreset: 'electronics' }, { lang: 'en' }).result;

  assert.ok(electronics.whatnotFeeTotal < standard.whatnotFeeTotal);
  assert.ok(electronics.netProfit > standard.netProfit);
  approx(electronics.commissionFee, 2.5);
  approx(electronics.whatnotFeeTotal, 4.59);
  approx(electronics.netProfit, 26.16);
});

test('TC-WN-03 coins-money preset lowers fees further', () => {
  const electronics = calculate({ ...baseInput, commissionPreset: 'electronics' }, { lang: 'en' }).result;
  const coins = calculate({ ...baseInput, commissionPreset: 'coins-money' }, { lang: 'en' }).result;

  assert.ok(coins.whatnotFeeTotal < electronics.whatnotFeeTotal);
  assert.ok(coins.netProfit > electronics.netProfit);
  approx(coins.commissionFee, 2);
  approx(coins.whatnotFeeTotal, 4.09);
  approx(coins.netProfit, 26.66);
});

test('TC-WN-04 custom commission overrides preset math', () => {
  const { result, error } = calculate({ ...baseInput, commissionPreset: 'custom', commissionRatePct: 10 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.commissionFee, 5);
  approx(result.whatnotFeeTotal, 7.09);
  approx(result.netProfit, 23.66);
  approx(result.breakEvenSalePrice, 22.84);
});

test('TC-WN-05 seller shipping subsidy reduces profit dollar-for-dollar', () => {
  const baseline = calculate(baseInput, { lang: 'en' }).result;
  const subsidized = calculate({ ...baseInput, sellerShippingSubsidy: 5 }, { lang: 'en' }).result;

  approx(subsidized.netProfit, baseline.netProfit - 5);
  approx(subsidized.maxSellerShippingSubsidyBeforeLoss, 24.66);
  approx(subsidized.maxItemCostBeforeLoss, 37.66);
});

test('TC-WN-06 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, salePrice: 0 },
    { ...baseInput, salePrice: -1 },
    { ...baseInput, buyerShipping: -1 },
    { ...baseInput, buyerTax: -1 },
    { ...baseInput, itemCost: -1 },
    { ...baseInput, sellerShippingSubsidy: -1 },
    { ...baseInput, packagingCost: -1 },
    { ...baseInput, otherCost: -1 },
    { ...baseInput, commissionPreset: 'missing' },
    { ...baseInput, commissionPreset: 'custom', commissionRatePct: 100 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-WN-07 break-even returns null when denominator is impossible', () => {
  const { result, error } = calculate({ ...baseInput, commissionPreset: 'custom', commissionRatePct: 98 }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null);
  assert.ok(result.netProfit < 0);
});

test('TC-WN-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Sold price: \$50\.00/);
  assert.match(result.summary, /Fee preset: Standard selling · 8% commission/);
  assert.match(result.summary, /Whatnot fee total: \$6\.09/);
  assert.match(result.summary, /Payout after fees: \$43\.91/);
  assert.match(result.summary, /Net profit: \$24\.66/);
  assert.match(result.summary, /Break-even sale price: \$22\.32/);
  assert.match(result.summary, /Max seller shipping subsidy before loss: \$24\.66/);
});

test('TC-WN-09 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'commissionPreset', 'commissionRatePct', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Whatnot Seller Fee Calculator|Whatnot 셀러 수수료 계산기/);
});

test('TC-WN-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'whatnot-seller-fee-calculator';
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
