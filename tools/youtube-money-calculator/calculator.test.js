const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  calculate,
  computeRevenueStack,
  solveRequiredLongformViews
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  monthlyLongformViews: 300000,
  monthlyShortsViews: 1200000,
  monetizedPlaybackRatePct: 42,
  longformRpm: 4.5,
  shortsRpm: 0.08,
  membershipRevenue: 450,
  sponsorshipRevenue: 800,
  affiliateRevenue: 250,
  productionCost: 700,
  softwareCost: 120,
  taxReservePct: 20,
  targetMonthlyTakeHome: 3000,
  currency: 'USD'
};

test('TC-YM-01 baseline creator money stack', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.monetizedLongformViews, 126000);
  approx(result.longformAdRevenue, 567);
  approx(result.shortsAdRevenue, 96);
  approx(result.extraRevenue, 1500);
  approx(result.grossRevenue, 2163);
  approx(result.operatingCost, 820);
  approx(result.taxReserve, 268.6);
  approx(result.monthlyTakeHome, 1074.4);
  approx(result.yearlyTakeHome, 12892.8);
  approx(result.blendedRevenuePerThousandViews, 1.44, 0.01);
  assert.equal(result.breakEvenLongformViews, 0);
  assert.equal(result.targetLongformViews, 1573545);
});

test('TC-YM-02 extra revenue increases gross revenue correctly', () => {
  const base = calculate({ ...baseline, membershipRevenue: 0, sponsorshipRevenue: 0, affiliateRevenue: 0 }, { lang: 'en' }).result;
  const stacked = calculate(baseline, { lang: 'en' }).result;

  approx(stacked.extraRevenue - base.extraRevenue, 1500);
  approx(stacked.grossRevenue - base.grossRevenue, 1500);
});

test('TC-YM-03 tax reserve clamps to zero when pre-tax profit is negative', () => {
  const { result, error } = calculate({
    ...baseline,
    monthlyLongformViews: 1000,
    monthlyShortsViews: 0,
    membershipRevenue: 0,
    sponsorshipRevenue: 0,
    affiliateRevenue: 0,
    productionCost: 100,
    softwareCost: 50,
    taxReservePct: 30
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.preTaxProfit < 0);
  approx(result.taxReserve, 0);
});

test('TC-YM-04 solver returns null when long-form contribution is zero', () => {
  assert.equal(solveRequiredLongformViews({ ...baseline, monetizedPlaybackRatePct: 0 }, 1000), null);
  assert.equal(solveRequiredLongformViews({ ...baseline, longformRpm: 0 }, 1000), null);
});

test('TC-YM-05 break-even and target solver use tax reserve math', () => {
  const noExtras = {
    ...baseline,
    monthlyShortsViews: 0,
    membershipRevenue: 0,
    sponsorshipRevenue: 0,
    affiliateRevenue: 0,
    productionCost: 500,
    softwareCost: 0,
    taxReservePct: 20,
    targetMonthlyTakeHome: 800
  };

  assert.equal(solveRequiredLongformViews(noExtras, 0), 264551);
  assert.equal(solveRequiredLongformViews(noExtras, 800), 793651);
});

test('TC-YM-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, monthlyLongformViews: -1 },
    { ...baseline, monetizedPlaybackRatePct: 101 },
    { ...baseline, taxReservePct: 61 },
    { ...baseline, softwareCost: -10 },
    { ...baseline, targetMonthlyTakeHome: -5 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-YM-07 summary includes exact-match phrase and key outputs', () => {
  const { result } = calculate(baseline, { lang: 'en' });
  assert.match(result.summary, /YouTube money calculator/i);
  assert.match(result.summary, /Monthly take-home:/);
  assert.match(result.summary, /Target long-form views:/);
});

test('TC-YM-08 helper export and defaults are usable', () => {
  const stack = computeRevenueStack(baseline);
  approx(stack.monthlyTakeHome, 1074.4);

  const { result, error } = calculate(DEFAULTS, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result.monthlyTakeHome > 0);
});

test('TC-YM-09 HTML scaffold contains required SEO and UI anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'YouTube Money Calculator',
    'youtube money calculator',
    'monthlyLongformViews',
    'monthlyShortsViews',
    'monetizedPlaybackRatePct',
    'longformRpm',
    'shortsRpm',
    'membershipRevenue',
    'sponsorshipRevenue',
    'affiliateRevenue',
    'productionCost',
    'softwareCost',
    'taxReservePct',
    'targetMonthlyTakeHome',
    'summary',
    'Limitations',
    'Estimates only',
    'not YouTube Analytics',
    '/assets/analytics.js',
    'rel="canonical"',
    'https://eastsea.monster/tools/youtube-money-calculator/',
    '../youtube-ad-revenue-estimator/',
    '../youtube-membership-break-even-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-YM-10 discovery wiring is exact-once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'youtube-money-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(`${slug}/`, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
