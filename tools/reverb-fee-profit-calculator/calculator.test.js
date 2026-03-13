const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  SELLER_PROGRAMS,
  SELLER_PROGRAM_MAP,
  SELLING_FEE_RATE
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  listPrice: 850,
  offerDiscountPct: 0,
  buyerShippingCharged: 35,
  buyerSalesTax: 0,
  sellerProgram: 'standard',
  extraPlatformFees: 0,
  itemCost: 500,
  sellerShippingCost: 26,
  packagingCost: 5,
  otherCost: 0
};

test('exports required Reverb constants', () => {
  assert.equal(DEFAULTS.listPrice, 850);
  assert.equal(SELLING_FEE_RATE, 0.05);
  assert.equal(SELLER_PROGRAMS.length, 2);
  assert.equal(SELLER_PROGRAM_MAP.standard.processingRatePct, 3.19);
  assert.equal(SELLER_PROGRAM_MAP.preferred.processingRatePct, 2.99);
});

test('TC-RV-01 baseline standard seller order', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.realizedSalePrice, 850);
  approx(result.sellingFeeBase, 885);
  approx(result.orderTotalForProcessing, 885);
  approx(result.reverbSellingFee, 44.25);
  approx(result.paymentProcessingFee, 28.72);
  approx(result.totalPlatformFees, 72.97);
  approx(result.payoutAfterFees, 812.03);
  approx(result.sellerCostTotal, 531);
  approx(result.netProfit, 281.03);
  approx(result.netMarginPct, 31.75);
  approx(result.effectiveFeeRatePct, 8.25);
  approx(result.breakEvenListPrice, 543.9, 0.02);
  approx(result.maxOfferDiscountPct, 36.01, 0.02);
});

test('TC-RV-02 preferred seller lowers processing burden', () => {
  const standard = calculate(baseInput, { lang: 'en' }).result;
  const preferred = calculate({ ...baseInput, sellerProgram: 'preferred' }, { lang: 'en' }).result;

  assert.ok(preferred.paymentProcessingFee < standard.paymentProcessingFee);
  assert.ok(preferred.totalPlatformFees < standard.totalPlatformFees);
  assert.ok(preferred.netProfit > standard.netProfit);
  approx(preferred.paymentProcessingFee, 26.95);
  approx(preferred.totalPlatformFees, 71.2);
  approx(preferred.netProfit, 282.8);
});

test('TC-RV-03 extra platform fees hit payout directly', () => {
  const base = calculate(baseInput, { lang: 'en' }).result;
  const withExtra = calculate({ ...baseInput, extraPlatformFees: 22 }, { lang: 'en' }).result;

  approx(withExtra.totalPlatformFees - base.totalPlatformFees, 22);
  approx(base.payoutAfterFees - withExtra.payoutAfterFees, 22);
  approx(base.netProfit - withExtra.netProfit, 22);
});

test('TC-RV-04 offer discount compresses profit', () => {
  const noDiscount = calculate(baseInput, { lang: 'en' }).result;
  const discounted = calculate({ ...baseInput, offerDiscountPct: 15 }, { lang: 'en' }).result;

  assert.ok(discounted.realizedSalePrice < noDiscount.realizedSalePrice);
  assert.ok(discounted.reverbSellingFee < noDiscount.reverbSellingFee);
  assert.ok(discounted.netProfit < noDiscount.netProfit);
  approx(discounted.realizedSalePrice, 722.5);
  approx(discounted.netProfit, 163.97);
});

test('TC-RV-05 max offer discount is bounded and meaningful', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.maxOfferDiscountPct > 0);
  assert.ok(result.maxOfferDiscountPct < 100);

  const below = calculate({ ...baseInput, offerDiscountPct: result.maxOfferDiscountPct - 0.2 }, { lang: 'en' }).result;
  const above = calculate({ ...baseInput, offerDiscountPct: result.maxOfferDiscountPct + 0.2 }, { lang: 'en' }).result;

  assert.ok(below.netProfit >= -0.05);
  assert.ok(above.netProfit <= 0.5);
});

test('TC-RV-06 break-even can be unreachable', () => {
  const { result, error } = calculate({
    listPrice: 100,
    offerDiscountPct: 0,
    buyerShippingCharged: 20,
    buyerSalesTax: 10,
    sellerProgram: 'standard',
    extraPlatformFees: 100,
    itemCost: 2000000,
    sellerShippingCost: 100000,
    packagingCost: 10000,
    otherCost: 10000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenListPrice, null);
  assert.ok(result.netProfit < 0);
});

test('TC-RV-07 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, listPrice: 0 },
    { ...baseInput, listPrice: -1 },
    { ...baseInput, buyerShippingCharged: -1 },
    { ...baseInput, buyerSalesTax: -1 },
    { ...baseInput, extraPlatformFees: -1 },
    { ...baseInput, itemCost: -1 },
    { ...baseInput, sellerShippingCost: -1 },
    { ...baseInput, packagingCost: -1 },
    { ...baseInput, otherCost: -1 },
    { ...baseInput, offerDiscountPct: 100 },
    { ...baseInput, offerDiscountPct: -1 },
    { ...baseInput, sellerProgram: 'unknown-program' }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-RV-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /List price: \$850\.00/);
  assert.match(result.summary, /Realized sale price: \$850\.00/);
  assert.match(result.summary, /Seller program: Standard seller · 3\.19% \+ \$0\.49/);
  assert.match(result.summary, /Total platform fees: \$72\.97/);
  assert.match(result.summary, /Payout after fees: \$812\.03/);
  assert.match(result.summary, /Net profit: \$281\.03/);
  assert.match(result.summary, /Break-even list price: \$543\.90/);
  assert.match(result.summary, /Max offer discount before loss: 36\.01%/);
});

test('TC-RV-09 HTML scaffold has required anchors', () => {
  const toolDir = __dirname;
  const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'listPrice', 'sellerProgram', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Reverb Fee Profit Calculator|Reverb 수수료·순이익 계산기/);
});