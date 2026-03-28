const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  computeBandcampFee,
  computeProcessorFee,
  solvePriceForTargetNet
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  saleAmount: 12,
  tier: 'standard15',
  paymentMethod: 'creditCard',
  trailingTwelveMonthSales: 2400,
  sellerCost: 1.5,
  targetNet: 8,
  currency: 'USD'
};

test('TC-BC-01 baseline credit-card digital sale', () => {
  const { result, error } = calculate(baseline);
  assert.equal(error, '');
  approx(result.bandcampFeeBasis, 12);
  approx(result.bandcampFee, 1.8);
  approx(result.processorFee, 0.56);
  approx(result.totalFees, 2.36);
  approx(result.payoutAfterFees, 9.64);
  approx(result.netAfterSellerCost, 8.14);
  approx(result.effectiveFeeRatePct, 19.7, 0.02);
  approx(result.salesRemainingToReducedTier, 2600);
});

test('TC-BC-02 reduced tier lowers revenue share', () => {
  const base = calculate(baseline).result;
  const reduced = calculate({ ...baseline, tier: 'reduced10' }).result;
  approx(reduced.bandcampFee, 1.2);
  approx(reduced.netAfterSellerCost - base.netAfterSellerCost, 0.6);
});

test('TC-BC-03 small transaction uses alternate processor rate', () => {
  const { result, error } = calculate({
    saleAmount: 5,
    tier: 'standard15',
    paymentMethod: 'giftCard',
    trailingTwelveMonthSales: 0,
    sellerCost: 0,
    targetNet: 1,
    currency: 'USD'
  });
  assert.equal(error, '');
  approx(result.processorFee, 0.30);
  assert.equal(result.usesAlternateProcessorRate, true);
  assert.match(result.processorLabel, /5% \+ \$0\.05/);
});

test('TC-BC-04 first-$100 Bandcamp fee cap applies', () => {
  const { result, error } = calculate({
    saleAmount: 150,
    tier: 'standard15',
    paymentMethod: 'creditCard',
    trailingTwelveMonthSales: 6000,
    sellerCost: 0,
    targetNet: 100,
    currency: 'USD'
  });
  assert.equal(error, '');
  approx(result.bandcampFeeBasis, 100);
  approx(result.bandcampFee, 15.00);
  approx(result.processorFee, 3.60);
});

test('TC-BC-05 reverse solver identity', () => {
  const current = calculate(baseline).result;
  const solved = solvePriceForTargetNet({ ...baseline }, current.netAfterSellerCost);
  approx(solved, baseline.saleAmount, 0.02);
});

test('TC-BC-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, saleAmount: 0 },
    { ...baseline, tier: 'nope' },
    { ...baseline, paymentMethod: 'cash' },
    { ...baseline, trailingTwelveMonthSales: -1 },
    { ...baseline, sellerCost: -0.01 },
    { ...baseline, targetNet: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('helper exports stay callable', () => {
  const fee = computeBandcampFee(baseline);
  const processor = computeProcessorFee(12, 'creditCard');
  approx(fee.fee, 1.8);
  approx(processor.fee, 0.564, 0.001);
});

test('DEFAULTS export is valid', () => {
  const { result, error } = calculate(DEFAULTS);
  assert.equal(error, '');
  assert.ok(result.netAfterSellerCost > 0);
});

test('TC-BC-08 HTML scaffold contains required anchors and Bandcamp-specific copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'saleAmount',
    'tier',
    'paymentMethod',
    'trailingTwelveMonthSales',
    'sellerCost',
    'targetNet',
    'summary',
    '/assets/analytics.js',
    'Bandcamp Fee Calculator',
    'rel="canonical"'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /digital sales/i);
  assert.match(html, /first <strong>\$100<\/strong> Bandcamp fee cap/i);
  assert.match(html, /under <strong>\$8\.07<\/strong>/i);
  assert.match(html, /https:\/\/eastsea\.monster\/tools\/bandcamp-fee-calculator\//);
});

test('TC-BC-07 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'bandcamp-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');

  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.match(listEntry.title, /Bandcamp Fee Calculator/);
  assert.match(listEntry.description, /digital sales/i);
  assert.match(listEntry.description, /15%\/10%/);
});
