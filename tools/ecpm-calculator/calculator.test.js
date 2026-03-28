const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  CONSTANTS,
  DEFAULTS,
  computeNetRevenue,
  computeRequiredGrossRevenue,
  computeRequiredImpressions,
  buildRevenueLadder,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  mode: 'ecpm',
  grossRevenue: 1250,
  impressions: 500000,
  targetEcpm: 2.75,
  shareRatePct: 0,
  fixedCost: 0,
  currencyLabel: 'USD'
};

test('exports eCPM constants and defaults', () => {
  assert.equal(CONSTANTS.MILL, 1000);
  assert.deepEqual(CONSTANTS.LADDER_IMPRESSIONS, [10000, 100000, 1000000]);
  assert.equal(DEFAULTS.mode, 'ecpm');
  assert.equal(DEFAULTS.currencyLabel, 'USD');
  approx(computeNetRevenue(1250, 20, 100), 900);
  approx(computeRequiredGrossRevenue(2.75, 500000, 20, 100), 1843.75);
  approx(computeRequiredImpressions(900, 2.75), 327272.73);
});

test('TC-EC-01 gross eCPM baseline', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossEcpm, 2.5);
  approx(result.netEcpm, 2.5);
  approx(result.netRevenue, 1250);
});

test('TC-EC-02 net eCPM after revenue share', () => {
  const { result, error } = calculate({ ...baseInput, shareRatePct: 20 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossEcpm, 2.5);
  approx(result.netRevenue, 1000);
  approx(result.netEcpm, 2.0);
});

test('TC-EC-03 net eCPM after share and fixed cost', () => {
  const { result, error } = calculate({ ...baseInput, shareRatePct: 20, fixedCost: 100 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netRevenue, 900);
  approx(result.netEcpm, 1.8);
});

test('TC-EC-04 reverse solve revenue from target eCPM', () => {
  const { result, error } = calculate({
    ...baseInput,
    mode: 'revenue',
    impressions: 750000,
    targetEcpm: 3.2
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.requiredGrossRevenue, 2400);
  approx(result.requiredNetRevenue, 2400);
});

test('TC-EC-05 reverse solve impressions from current revenue', () => {
  const { result, error } = calculate({
    ...baseInput,
    mode: 'impressions',
    grossRevenue: 1800,
    targetEcpm: 4.5
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.requiredImpressions, 400000);
});

test('TC-EC-06 revenue ladder outputs use net eCPM', () => {
  const { result, error } = calculate({
    ...baseInput,
    grossRevenue: 3400,
    impressions: 1000000,
    targetEcpm: 2.5
  }, { lang: 'en' });

  assert.equal(error, '');
  const ladder = buildRevenueLadder(result.netEcpm);
  approx(ladder[0].revenue, 34);
  approx(ladder[1].revenue, 340);
  approx(ladder[2].revenue, 3400);
});

test('TC-EC-07 target-gap indicator shows below target', () => {
  const { result, error } = calculate({
    ...baseInput,
    grossRevenue: 2100,
    impressions: 1000000,
    targetEcpm: 2.75
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netEcpm, 2.1);
  approx(result.targetGap, -0.65);
  assert.equal(result.targetStatus, 'below');
});

test('TC-EC-08 validation rejects zero impressions', () => {
  const { result, error } = calculate({ ...baseInput, impressions: 0 }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

test('TC-EC-09 validation rejects impossible fee rate', () => {
  const { result, error } = calculate({ ...baseInput, shareRatePct: 100 }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

test('TC-EC-10 reverse solve includes share and fixed-cost assumptions', () => {
  const { result, error } = calculate({
    ...baseInput,
    mode: 'revenue',
    shareRatePct: 20,
    fixedCost: 100,
    targetEcpm: 2.75
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.requiredNetRevenue, 1375);
  approx(result.requiredGrossRevenue, 1843.75);
});

test('TC-EC-11 negative net revenue stays visible and flagged', () => {
  const { result, error } = calculate({
    ...baseInput,
    grossRevenue: 100,
    impressions: 500000,
    targetEcpm: 1,
    shareRatePct: 20,
    fixedCost: 200
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netRevenue, -120);
  approx(result.netEcpm, -0.24);
  assert.equal(result.targetStatus, 'below');
  assert.match(result.status, /negative/i);
});

test('TC-EC-12 summary includes decision-ready outputs', () => {
  const { result, error } = calculate({
    ...baseInput,
    shareRatePct: 20,
    fixedCost: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[eCPM Calculator Summary\]/);
  assert.match(result.summary, /Gross revenue input: USD 1,250\.00/);
  assert.match(result.summary, /Net revenue: USD 900\.00/);
  assert.match(result.summary, /Net eCPM: 1\.80/);
  assert.match(result.summary, /Required gross revenue at current impressions: USD 1,843\.75/);
});

test('TC-EC-13 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['calculatorForm', 'primaryValue', 'ladderBody', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /eCPM Calculator/);
  assert.match(html, /Publisher-side only/);
  assert.match(html, /CPM is what advertisers pay per 1,000 impressions/);
  assert.match(html, /Reverse-solve revenue or impressions/);
});

test('TC-EC-14 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'ecpm-calculator';
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
