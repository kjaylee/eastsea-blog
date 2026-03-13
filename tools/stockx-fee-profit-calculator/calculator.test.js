const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  SELLER_LEVELS,
  SELLER_LEVEL_MAP,
  PROCESSING_RATE,
  US_MINIMUM_SELLER_FEE
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  salePrice: 220,
  sellerLevel: 'level-1',
  itemCost: 140,
  shippingToStockx: 14,
  packagingCost: 1.5,
  otherCost: 0
};

test('exports required StockX constants', () => {
  assert.equal(DEFAULTS.salePrice, 220);
  assert.equal(PROCESSING_RATE, 0.03);
  assert.equal(US_MINIMUM_SELLER_FEE, 5);
  assert.equal(SELLER_LEVELS.length, 5);
  assert.equal(SELLER_LEVEL_MAP['level-1'].transactionRatePct, 9);
  assert.equal(SELLER_LEVEL_MAP['level-5'].transactionRatePct, 7);
});

test('TC-SX-01 baseline level-1 profitable order', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.transactionFee, 19.8);
  approx(result.processingFee, 6.6);
  approx(result.stockxFeesBeforeMinimum, 26.4);
  approx(result.minimumFeeAdjustment, 0);
  approx(result.finalStockxFees, 26.4);
  approx(result.payoutAfterFees, 193.6);
  approx(result.netProfit, 38.1);
  approx(result.netMarginPct, 17.32);
  approx(result.effectiveFeeRatePct, 12);
  approx(result.breakEvenSalePrice, 176.7);
  approx(result.maxItemCostBeforeLoss, 178.1);
});

test('TC-SX-02 low-price order triggers the US minimum seller fee floor', () => {
  const { result, error } = calculate({
    salePrice: 20,
    sellerLevel: 'level-1',
    itemCost: 10,
    shippingToStockx: 2,
    packagingCost: 1,
    otherCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.transactionFee, 1.8);
  approx(result.processingFee, 0.6);
  approx(result.stockxFeesBeforeMinimum, 2.4);
  approx(result.minimumFeeAdjustment, 2.6);
  approx(result.finalStockxFees, 5);
  approx(result.payoutAfterFees, 15);
  approx(result.netProfit, 2);
  approx(result.effectiveFeeRatePct, 25);
});

test('TC-SX-03 higher seller levels reduce total fee burden', () => {
  const level1 = calculate(baseInput, { lang: 'en' }).result;
  const level5 = calculate({
    ...baseInput,
    sellerLevel: 'level-5'
  }, { lang: 'en' }).result;

  assert.ok(level5.finalStockxFees < level1.finalStockxFees);
  assert.ok(level5.netProfit > level1.netProfit);
  approx(level5.finalStockxFees, 22);
  approx(level5.netProfit, 42.5);
});

test('TC-SX-04 max item cost before loss is decision-ready', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.maxItemCostBeforeLoss, 178.1);
  assert.ok(result.maxItemCostBeforeLoss > baseInput.itemCost);
});

test('TC-SX-05 break-even can be unreachable', () => {
  const { result, error } = calculate({
    salePrice: 25,
    sellerLevel: 'level-1',
    itemCost: 2000000,
    shippingToStockx: 10000,
    packagingCost: 10000,
    otherCost: 10000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null);
  assert.ok(result.netProfit < 0);
});

test('TC-SX-06 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, salePrice: 0 },
    { ...baseInput, salePrice: -1 },
    { ...baseInput, itemCost: -1 },
    { ...baseInput, shippingToStockx: -1 },
    { ...baseInput, packagingCost: -1 },
    { ...baseInput, otherCost: -1 },
    { ...baseInput, sellerLevel: 'unknown-level' }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-SX-07 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Sale price: \$220\.00/);
  assert.match(result.summary, /Seller level: Level 1 · 9% transaction fee/);
  assert.match(result.summary, /Final StockX fees: \$26\.40/);
  assert.match(result.summary, /Payout after fees: \$193\.60/);
  assert.match(result.summary, /Net profit: \$38\.10/);
  assert.match(result.summary, /Break-even sale price: \$176\.70/);
  assert.match(result.summary, /Max item cost before loss: \$178\.10/);
});

test('TC-SX-08 HTML scaffold has required anchors', () => {
  const toolDir = __dirname;
  const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'salePrice', 'sellerLevel', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /StockX Fee Profit Calculator|StockX 수수료·순이익 계산기/);
});
