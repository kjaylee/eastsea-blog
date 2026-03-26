const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  minimumPrice: 5,
  unitsSold: 100,
  averageExtraPaid: 1.5,
  itchRevenueShareRate: 10,
  paymentProcessorRate: 2.9,
  paymentProcessorFixedFee: 0.3,
  targetNetRevenue: 1000,
  payoutMode: 'direct-to-you'
};

test('exports defaults', () => {
  assert.equal(DEFAULTS.minimumPrice, 5);
  assert.equal(DEFAULTS.unitsSold, 100);
  assert.equal(DEFAULTS.payoutMode, 'direct-to-you');
});

test('TC-I01 baseline official-default-ish scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.averagePaidPrice, 6.5);
  approx(result.grossRevenue, 650);
  approx(result.itchFeeTotal, 65);
  approx(result.processorVariableFee, 18.85);
  approx(result.processorFixedFeeTotal, 30);
  approx(result.totalFees, 113.85);
  approx(result.netRevenue, 536.15);
  approx(result.effectiveTakeRatePct, 17.52);
  approx(result.netRevenuePerSale, 5.36);
  approx(result.requiredMinimumPriceForTargetNet, 10.33);
  assert.equal(result.lowPriceWarning, false);
});

test('TC-I02 open revenue share at 0%', () => {
  const { result, error } = calculate({
    minimumPrice: 2,
    unitsSold: 50,
    averageExtraPaid: 1.5,
    itchRevenueShareRate: 0,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 200,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netRevenue, 154.93);
  approx(result.effectiveTakeRatePct, 11.47);
  approx(result.requiredMinimumPriceForTargetNet, 2.93);
});

test('TC-I03 very low price shows fee drag warning', () => {
  const { result, error } = calculate({
    minimumPrice: 1,
    unitsSold: 20,
    averageExtraPaid: 0,
    itchRevenueShareRate: 10,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 0,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.totalFees, 8.58);
  approx(result.netRevenue, 11.42);
  approx(result.effectiveTakeRatePct, 42.9);
  approx(result.netRevenuePerSale, 0.57);
  assert.equal(result.lowPriceWarning, true);
});

test('TC-I04 pay-what-you-want uplift increases net linearly', () => {
  const a = calculate({
    minimumPrice: 4,
    unitsSold: 120,
    averageExtraPaid: 0,
    itchRevenueShareRate: 10,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 0,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' }).result;
  const b = calculate({
    minimumPrice: 4,
    unitsSold: 120,
    averageExtraPaid: 1.5,
    itchRevenueShareRate: 10,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 0,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' }).result;

  approx(a.netRevenue, 382.08);
  approx(b.netRevenue, 538.86);
  approx(b.netRevenue - a.netRevenue, 156.78);
});

test('TC-I05 custom processor profile', () => {
  const { result, error } = calculate({
    minimumPrice: 8,
    unitsSold: 250,
    averageExtraPaid: 2,
    itchRevenueShareRate: 5,
    paymentProcessorRate: 3.49,
    paymentProcessorFixedFee: 0.49,
    targetNetRevenue: 2000,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.totalFees, 334.75);
  approx(result.netRevenue, 2165.25);
  approx(result.effectiveTakeRatePct, 13.39);
  approx(result.requiredMinimumPriceForTargetNet, 7.28);
});

test('TC-I06 payout mode does not alter v1 math', () => {
  const direct = calculate(baseInput, { lang: 'en' }).result;
  const itch = calculate({ ...baseInput, payoutMode: 'collected-by-itch' }, { lang: 'en' }).result;

  assert.deepEqual(
    {
      averagePaidPrice: direct.averagePaidPrice,
      grossRevenue: direct.grossRevenue,
      totalFees: direct.totalFees,
      netRevenue: direct.netRevenue,
      effectiveTakeRatePct: direct.effectiveTakeRatePct,
      requiredMinimumPriceForTargetNet: direct.requiredMinimumPriceForTargetNet
    },
    {
      averagePaidPrice: itch.averagePaidPrice,
      grossRevenue: itch.grossRevenue,
      totalFees: itch.totalFees,
      netRevenue: itch.netRevenue,
      effectiveTakeRatePct: itch.effectiveTakeRatePct,
      requiredMinimumPriceForTargetNet: itch.requiredMinimumPriceForTargetNet
    }
  );
  assert.match(itch.summary, /does not change the math/);
});

test('TC-I07 validation rejects impossible values', () => {
  const invalidCases = [
    { ...baseInput, minimumPrice: -1 },
    { ...baseInput, unitsSold: -1 },
    { ...baseInput, unitsSold: 10.5 },
    { ...baseInput, itchRevenueShareRate: 101 },
    { ...baseInput, paymentProcessorRate: 101 },
    { ...baseInput, targetNetRevenue: -1 },
    { ...baseInput, payoutMode: 'weird-mode' }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-I08 gross revenue must be positive', () => {
  const { result, error } = calculate({
    minimumPrice: 0,
    unitsSold: 0,
    averageExtraPaid: 0,
    itchRevenueShareRate: 10,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 0,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.match(error, /grossRevenue/);
});

test('TC-I09 denominator rejection for target minimum price', () => {
  const { result, error } = calculate({
    minimumPrice: 5,
    unitsSold: 10,
    averageExtraPaid: 1,
    itchRevenueShareRate: 70,
    paymentProcessorRate: 30,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 100,
    payoutMode: 'direct-to-you'
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.match(error, /denominator <= 0/);
});

test('TC-I10 summary output includes clipboard essentials', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Minimum price: \$5\.00/);
  assert.match(result.summary, /Average paid price: \$6\.50/);
  assert.match(result.summary, /Units sold: 100/);
  assert.match(result.summary, /Total fees: \$113\.85/);
  assert.match(result.summary, /Net revenue: \$536\.15/);
  assert.match(result.summary, /Effective take rate: 17\.52%/);
  assert.match(result.summary, /Payout mode note: Payout mode is explanatory only in v1 and does not change the math\./);
});

test('TC-I11 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'summary', 'copySummary', 'resetDefaults', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Itch\.io Net Revenue Calculator/);
  assert.match(html, /open revenue share/);
  assert.match(html, /2\.9% \+ \$0\.30/);
  assert.match(html, /\$1\.50/);
});

test('TC-I12 discovery integration exists exactly once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'itchio-net-revenue-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
