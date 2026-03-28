const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PRESETS,
  PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE,
  resolveFeeConfig
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports required GOAT baseline metadata', () => {
  assert.equal(PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.id, 'goat-baseline');
  assert.equal(PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.sellerFeeRatePct, 9.5);
  assert.equal(PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.flatFeeUsd, 5);
  assert.deepEqual(PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.sourceUpdatedDates, ['2025-08-22', '2025-02-26']);
  assert.equal(PRESETS.length, 2);
  assert.equal(DEFAULTS.feePreset, 'goat-baseline');
});

test('TC-GOAT-01 baseline preset computes payout', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossSale, 300);
  approx(result.platformVariableFee, 28.5);
  approx(result.platformFeeTotal, 33.5);
  approx(result.refundLoss, 6);
  approx(result.payoutBeforeSellerCosts, 260.5);
  approx(result.sellerCostTotal, 193.5);
  approx(result.netProfit, 67);
  approx(result.effectiveTakeRatePct, 13.17);
  approx(result.breakEvenListingPrice, 224.29);
  approx(result.requiredListingPriceForTargetNet, 269.49);
});

test('TC-GOAT-02 higher sale price increases payout', () => {
  const base = calculate(DEFAULTS, { lang: 'en' }).result;
  const higher = calculate({ ...DEFAULTS, salePrice: 420 }, { lang: 'en' }).result;

  assert.ok(higher.platformFeeTotal > base.platformFeeTotal);
  assert.ok(higher.payoutBeforeSellerCosts > base.payoutBeforeSellerCosts);
  assert.ok(higher.netProfit > base.netProfit);
});

test('TC-GOAT-03 higher seller costs reduce net and raise break-even', () => {
  const base = calculate(DEFAULTS, { lang: 'en' }).result;
  const costlier = calculate({ ...DEFAULTS, sellerShippingCost: 22, packagingCost: 4.5 }, { lang: 'en' }).result;

  assert.ok(costlier.netProfit < base.netProfit);
  assert.ok(costlier.breakEvenListingPrice > base.breakEvenListingPrice);
});

test('TC-GOAT-04 custom lower fee improves take-home', () => {
  const baseline = calculate(DEFAULTS, { lang: 'en' }).result;
  const custom = calculate({
    ...DEFAULTS,
    feePreset: 'custom',
    sellerFeeRatePct: 7,
    flatFeePerOrder: 2
  }, { lang: 'en' }).result;

  assert.ok(custom.platformFeeTotal < baseline.platformFeeTotal);
  assert.ok(custom.netProfit > baseline.netProfit);
  approx(custom.platformVariableFee, 21);
  approx(custom.platformFeeTotal, 23);
  approx(custom.netProfit, 77.5);
  approx(custom.breakEvenListingPrice, 214.84);
});

test('TC-GOAT-05 refund-loss input reduces payout', () => {
  const noRefund = calculate({ ...DEFAULTS, refundLossRatePct: 0 }, { lang: 'en' }).result;
  const withRefund = calculate(DEFAULTS, { lang: 'en' }).result;

  assert.ok(withRefund.payoutBeforeSellerCosts < noRefund.payoutBeforeSellerCosts);
  assert.ok(withRefund.netProfit < noRefund.netProfit);
  approx(withRefund.refundLoss, 6);
});

test('TC-GOAT-06 reverse solver returns null on invalid margin', () => {
  const { result, error } = calculate({
    ...DEFAULTS,
    feePreset: 'custom',
    sellerFeeRatePct: 80,
    flatFeePerOrder: 5,
    refundLossRatePct: 20
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenListingPrice, null);
  assert.equal(result.requiredListingPriceForTargetNet, null);
  assert.ok(result.netProfit < 0);
});

test('TC-GOAT-07 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...DEFAULTS, salePrice: 0 },
    { ...DEFAULTS, itemCost: -1 },
    { ...DEFAULTS, feePreset: 'missing' },
    { ...DEFAULTS, feePreset: 'custom', sellerFeeRatePct: 101 },
    { ...DEFAULTS, refundLossRatePct: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-GOAT-08 summary contains decision-ready lines', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Sale price: \$300\.00/);
  assert.match(result.summary, /Preset: GOAT US seller in good standing \+ prepaid shipping/);
  assert.match(result.summary, /Platform fee total: \$33\.50/);
  assert.match(result.summary, /Refund \/ return planning loss: \$6\.00/);
  assert.match(result.summary, /Net profit: \$67\.00/);
  assert.match(result.summary, /Break-even listing price: \$224\.29/);
  assert.match(result.summary, /Required listing price for target net: \$269\.49/);
});

test('TC-GOAT-09 page contains required assumption copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'link rel="canonical" href="https://eastsea.monster/tools/goat-fee-calculator/"',
    '/assets/analytics.js',
    'goat-baseline',
    'custom',
    'summary',
    'related-links',
    '9.5% commission + $5 seller fee',
    'August 22, 2025',
    'February 26, 2025'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-GOAT-10 adjacent links favor existing resale tools', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const slug of [
    '/tools/stockx-fee-profit-calculator/',
    '/tools/grailed-fee-profit-calculator/',
    '/tools/mercari-fee-calculator/',
    '/tools/whatnot-seller-fee-calculator/'
  ]) {
    assert.ok(html.includes(slug), slug);
  }
});

test('TC-GOAT-11 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'goat-fee-calculator';
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

test('helper exposes resolved baseline and custom overrides deterministically', () => {
  const baseline = resolveFeeConfig(DEFAULTS);
  const custom = resolveFeeConfig({
    ...DEFAULTS,
    feePreset: 'custom',
    sellerFeeRatePct: 11.25,
    flatFeePerOrder: 8
  });

  assert.equal(baseline.sellerFeeRatePct, 9.5);
  assert.equal(baseline.flatFeePerOrder, 5);
  assert.equal(custom.sellerFeeRatePct, 11.25);
  assert.equal(custom.flatFeePerOrder, 8);
});
