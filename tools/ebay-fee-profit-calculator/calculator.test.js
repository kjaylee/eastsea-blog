const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PRESETS,
  evaluateAtSoldPrice
} = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} ≈ ${expected} (±${tol})`);
}

test('exports and defaults exist', () => {
  assert.equal(typeof calculate, 'function');
  assert.ok(Array.isArray(PRESETS) && PRESETS.length >= 6);
  assert.equal(DEFAULTS.soldPrice, 45);
});

test('TC-EB01 — Baseline most-categories profitable listing', () => {
  const input = {
    soldPrice: 45.00,
    shippingCharged: 7.00,
    salesTaxRatePct: 8.0,
    itemCost: 18.00,
    actualShippingCost: 6.20,
    packagingCost: 0.80,
    categoryPreset: 'most',
    promotedRatePct: 5.0,
    chargeInsertionFee: false
  };

  const { result, error } = calculate(input, { lang: 'en' });
  assert.equal(error, '');
  approx(result.revenueExTax, 52.00);
  approx(result.estimatedSalesTax, 4.16);
  approx(result.transactionTotal, 56.16);
  approx(result.finalValueFee, 7.64);
  approx(result.perOrderFee, 0.40);
  approx(result.promotedListingsFee, 2.81);
  approx(result.ebayFeeTotal, 10.85);
  approx(result.payoutAfterEbayFees, 41.15);
  approx(result.netProfit, 16.15);
  approx(result.netMarginPct, 31.07);
  approx(result.breakEvenSoldPrice, 24.78);
  approx(result.maxPromotedAdRateBeforeLossPct, 33.76);
});

test('TC-EB02 — Sneakers over $150 removes per-order fee', () => {
  const input = {
    soldPrice: 200.00,
    shippingCharged: 10.00,
    salesTaxRatePct: 8.0,
    itemCost: 120.00,
    actualShippingCost: 12.00,
    packagingCost: 1.50,
    categoryPreset: 'sneakers150',
    promotedRatePct: 0.0,
    chargeInsertionFee: false
  };
  const { result, error } = calculate(input, { lang: 'en' });
  assert.equal(error, '');
  approx(result.revenueExTax, 210.00);
  approx(result.estimatedSalesTax, 16.80);
  approx(result.transactionTotal, 226.80);
  approx(result.finalValueFee, 18.14);
  approx(result.perOrderFee, 0.00);
  approx(result.ebayFeeTotal, 18.14);
  approx(result.netProfit, 58.36);
  approx(result.netMarginPct, 27.79);
  approx(result.maxPromotedAdRateBeforeLossPct, 25.73);
});

test('TC-EB03 — Tiered final value fee above threshold', () => {
  const input = {
    soldPrice: 8000.00,
    shippingCharged: 50.00,
    salesTaxRatePct: 0.0,
    itemCost: 3000.00,
    actualShippingCost: 30.00,
    packagingCost: 5.00,
    categoryPreset: 'most',
    promotedRatePct: 0.0,
    chargeInsertionFee: false
  };
  const { result, error } = calculate(input, { lang: 'en' });
  assert.equal(error, '');
  approx(result.revenueExTax, 8050.00);
  approx(result.transactionTotal, 8050.00);
  approx(result.finalValueFee, 1032.93);
  approx(result.perOrderFee, 0.40);
  approx(result.ebayFeeTotal, 1033.33);
  approx(result.netProfit, 3981.67);
});

test('TC-EB04 — Optional insertion fee changes net deterministically', () => {
  const base = {
    soldPrice: 18.00,
    shippingCharged: 4.00,
    salesTaxRatePct: 0.0,
    itemCost: 5.00,
    actualShippingCost: 4.50,
    packagingCost: 0.50,
    categoryPreset: 'media',
    promotedRatePct: 2.0
  };
  const A = calculate({ ...base, chargeInsertionFee: false }, { lang: 'en' }).result;
  const B = calculate({ ...base, chargeInsertionFee: true, insertionFeeAmount: 0.35 }, { lang: 'en' }).result;
  approx(A.netProfit, 7.79);
  approx(B.netProfit, 7.44);
  approx(A.netProfit - B.netProfit, 0.35);
});

test('TC-EB05 — Promoted listings fee can flip profit negative', () => {
  const input = {
    soldPrice: 45.00,
    shippingCharged: 7.00,
    salesTaxRatePct: 8.0,
    itemCost: 18.00,
    actualShippingCost: 6.20,
    packagingCost: 0.80,
    categoryPreset: 'most',
    promotedRatePct: 40.0,
    chargeInsertionFee: false
  };
  const { result, error } = calculate(input, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result.netProfit < 0);
});

test('TC-EB06 — Validation rejects impossible values', () => {
  const badCases = [
    { soldPrice: -1, shippingCharged: 7, salesTaxRatePct: 8, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'most', promotedRatePct: 5 },
    { soldPrice: 10, shippingCharged: -1, salesTaxRatePct: 8, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'most', promotedRatePct: 5 },
    { soldPrice: 10, shippingCharged: 7, salesTaxRatePct: 101, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'most', promotedRatePct: 5 },
    { soldPrice: 10, shippingCharged: 7, salesTaxRatePct: 8, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'custom', customLowRatePct: -1, customThreshold: 0, customOverRatePct: 2, promotedRatePct: 5 },
    { soldPrice: 10, shippingCharged: 7, salesTaxRatePct: 8, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'custom', customLowRatePct: 3, customThreshold: -1, customOverRatePct: 2, promotedRatePct: 5 },
    { soldPrice: 10, shippingCharged: 7, salesTaxRatePct: 8, itemCost: 18, actualShippingCost: 6.2, packagingCost: 0.8, categoryPreset: 'custom', customLowRatePct: 3, customThreshold: 0, customOverRatePct: 120, promotedRatePct: 5 },
  ];
  for (const input of badCases) {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  }
});

test('TC-EB07 — Revenue must be positive', () => {
  const { result, error } = calculate({ soldPrice: 0, shippingCharged: 0, salesTaxRatePct: 0, itemCost: 0, actualShippingCost: 0, packagingCost: 0, categoryPreset: 'most', promotedRatePct: 0 }, { lang: 'en' });
  assert.equal(result, null);
  assert.notEqual(error, '');
});

test('HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of ['langBtn', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /eBay Fee Profit Calculator|eBay 수수료·순이익 계산기/);
});

test('Discovery exact-once wiring across pages', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'ebay-fee-profit-calculator';
  const url = `/tools/${slug}/`;
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});

