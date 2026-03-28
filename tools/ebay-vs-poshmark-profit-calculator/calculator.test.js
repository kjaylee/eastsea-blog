const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULT_INPUTS,
  validateInputs,
  findEbaySoldPriceForTargetNet,
  findPoshmarkListPriceForTargetNet,
  getRealizedSalePrice,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-EVP-01 default baseline favors eBay with deterministic outputs', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'ebay');
  approx(result.realizedSalePrice, 43.2);
  approx(result.ebay.ebayFeeTotal, 9.57);
  approx(result.ebay.payoutAfterEbayFees, 41.58);
  approx(result.ebay.netProfit, 20.38);
  approx(result.poshmark.poshmarkFee, 8.64);
  approx(result.poshmark.payoutAfterPoshmarkFee, 34.56);
  approx(result.poshmark.netProfit, 19.56);
  approx(result.winnerDelta, 0.82);
  approx(result.priceNeededOnEbayToMatchPoshmark, 42.19);
  approx(result.priceNeededOnPoshmarkToMatchEbay, 49.13);
});

test('TC-EVP-02 Poshmark wins when eBay promoted rate gets heavy', () => {
  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    ebayPromotedRatePct: 12,
    poshmarkSellerShippingDiscount: 0,
  });

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'poshmark');
  assert.ok(result.poshmark.netProfit > result.ebay.netProfit);
});

test('TC-EVP-03 tie scenario is detected within epsilon', () => {
  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    ebayPromotedRatePct: 4.476,
  });

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'tie');
  approx(result.winnerDelta, 0, 0.02);
});

test('TC-EVP-04 reverse solvers remain deterministic', () => {
  const normalized = validateInputs(DEFAULT_INPUTS).input;
  approx(findEbaySoldPriceForTargetNet(normalized, 19.56), 42.19);
  approx(findPoshmarkListPriceForTargetNet(normalized, 20.38), 49.13);
});

test('TC-EVP-05 invalid inputs are rejected', () => {
  const invalid = [
    { ...DEFAULT_INPUTS, listPrice: -1 },
    { ...DEFAULT_INPUTS, offerDiscountPct: 101 },
    { ...DEFAULT_INPUTS, ebaySalesTaxRatePct: -1 },
    { ...DEFAULT_INPUTS, ebayCategoryPreset: 'unknown' },
    { ...DEFAULT_INPUTS, listPrice: 10, offerDiscountPct: 100 },
  ];

  invalid.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-EVP-06 summary contains decision-ready payout lines', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  assert.match(result.summary, /\[eBay vs Poshmark Profit Summary\]/);
  assert.match(result.summary, /Winner: eBay by \$0\.82/);
  assert.match(result.summary, /eBay payout after fees: \$41\.58/);
  assert.match(result.summary, /Poshmark payout after fee: \$34\.56/);
  assert.match(result.summary, /eBay sold price needed to match Poshmark: \$42\.19/);
  assert.match(result.summary, /Poshmark list price needed to match eBay: \$49\.13/);
});

test('TC-EVP-07 realized sale helper is deterministic', () => {
  approx(getRealizedSalePrice(48, 10), 43.2);
});

test('TC-EVP-08 HTML scaffold contains required anchors and sibling scripts', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'eBay vs Poshmark Profit Calculator',
    'link rel="canonical" href="https://eastsea.monster/tools/ebay-vs-poshmark-profit-calculator/"',
    '/assets/analytics.js',
    '../ebay-fee-profit-calculator/calculator.js',
    '../poshmark-fee-profit-calculator/calculator.js',
    'id="winner"',
    'id="summary"',
    '/tools/ebay-fee-profit-calculator/',
    '/tools/poshmark-fee-profit-calculator/',
    'eBay payout after fees',
    'Poshmark payout after fee',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-EVP-09 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'ebay-vs-poshmark-profit-calculator';
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
