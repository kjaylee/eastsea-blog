const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

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

test('summary includes required clipboard fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Unit price: 35\.00 × 1/);
  assert.match(result.summary, /Etsy fee total: 4\.25/);
  assert.match(result.summary, /Payout after Etsy fees: 35\.74/);
  assert.match(result.summary, /Net profit: 18\.74/);
  assert.match(result.summary, /Net margin: 46\.86%/);
  assert.match(result.summary, /Break-even unit price: 14\.29/);
  assert.match(result.summary, /Max discount before loss: 59\.17%/);
});

test('TC-11 exact-match fee copy exists in HTML', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  assert.match(html, /Etsy Fee Calculator/);
  assert.match(html, /listing fee/i);
  assert.match(html, /6\.5%/);
  assert.match(html, /payment processing/i);
  assert.match(html, /Offsite Ads/);
  assert.match(html, /\/tools\/etsy-fee-profit-calculator\//);
});

test('TC-12 discovery integration exists exactly once for exact-match slug', () => {
  const toolDir = __dirname;
  const repoRoot = path.resolve(toolDir, '..', '..');
  const targetSlug = 'etsy-fee-calculator';
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const toolsList = fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8');

  assert.equal((htmlIndex.match(/href="etsy-fee-calculator\//g) || []).length, 1, 'index.html should link to the Etsy fee slug exactly once');
  assert.equal((markdownIndex.match(/\.\/etsy-fee-calculator\//g) || []).length, 1, 'index.md should link to the Etsy fee slug exactly once');
  assert.equal((toolsList.match(/\/tools\/etsy-fee-calculator\//g) || []).length, 1, '_data/tools-list.json should contain the Etsy fee URL exactly once');

  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const matches = manifest.tools.filter((entry) => entry.slug === targetSlug);
  assert.equal(matches.length, 1, 'manifest.json should contain exactly one Etsy fee manifest entry');
  assert.equal(matches[0].url, '/tools/etsy-fee-calculator/');

  const toolEntries = fs.readdirSync(path.join(repoRoot, 'tools'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name === targetSlug);
  assert.equal(toolEntries.length, 1, 'tools/ should contain exactly one Etsy fee directory');
});

test('TC-13 manifest size matches on-disk folder size', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const entry = manifest.tools.find((item) => item.slug === 'etsy-fee-calculator');
  assert.ok(entry, 'manifest entry missing for etsy-fee-calculator');

  const toolRoot = path.join(repoRoot, 'tools', 'etsy-fee-calculator');
  const files = fs.readdirSync(toolRoot);
  const actualSize = files.reduce((sum, file) => sum + fs.statSync(path.join(toolRoot, file)).size, 0);

  assert.equal(entry.size, actualSize, 'manifest size should match the current tool folder size');
});
