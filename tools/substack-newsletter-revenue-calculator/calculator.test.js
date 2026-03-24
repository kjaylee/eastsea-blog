const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  calculate,
  validate,
} = require('./calculator.js');

function approx(actual, expected, tol = 0.02) { // allow ±2 cents or percent decimals
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} ≈ ${expected} (±${tol})`);
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// TC-SN-00 exports & defaults
test('TC-SN-00 defaults', () => {
  assert.equal(DEFAULTS.paidSubscribers, 1000);
  assert.equal(DEFAULTS.annualSharePct, 35);
  assert.equal(DEFAULTS.monthlyPrice, 8);
  assert.equal(DEFAULTS.annualPrice, 80);
  assert.equal(DEFAULTS.substackPlatformFeeRatePct, 10);
  assert.equal(DEFAULTS.processingFeeRatePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);
  assert.equal(DEFAULTS.recurringBillingFeeRatePct, 0.7);
});

// TC-SN-01 baseline mixed billing snapshot
test('TC-SN-01 baseline', () => {
  const { result, error } = calculate({
    derivePaidFromAudience: false,
    paidSubscribers: 1000,
    annualSharePct: 35,
    monthlyPrice: 8,
    annualPrice: 80,
    foundingMembers: 20,
    foundingPrice: 150,
    refundRatePct: 2,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
  });
  assert.equal(error, '');
  approx(result.monthlyPaid, 650, 0.000001);
  approx(result.annualPaid, 350, 0.000001);
  approx(result.grossEq, 7783.333333, 0.01);
  approx(result.refundLossEq, 155.666667, 0.01);
  approx(result.platformFeeEq, 762.766667, 0.02);
  approx(result.processorVarFeeEq, 221.202333, 0.02);
  approx(result.recurringFeeEq, 51.678667, 0.02);
  approx(result.fixedFeeEq, 204.25, 0.001);
  approx(result.totalFeesExRefundEq, 1239.897667, 0.03);
  approx(result.netEq, 6387.769, 0.05);
  approx(result.effectiveFeeRatePct, 15.93, 0.05);
});

// TC-SN-02 derive from audience
test('TC-SN-02 derive from audience', () => {
  const { result, error } = calculate({
    derivePaidFromAudience: true,
    audienceSize: 50000,
    paidConversionRatePct: 2,
    annualSharePct: 35,
    monthlyPrice: 8,
    annualPrice: 80,
    foundingMembers: 20,
    foundingPrice: 150,
    refundRatePct: 2,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
  });
  assert.equal(error, '');
  approx(result.grossEq, 7783.333333, 0.01);
});

// TC-SN-03 validation guards
test('TC-SN-03 validation guards', () => {
  const badRate = validate({ refundRatePct: 101 });
  const badFixed = validate({ processingFixedFee: -1 });
  const badCount = validate({ paidSubscribers: 1.1 });
  assert.equal(badRate.ok, false);
  assert.equal(badFixed.ok, false);
  assert.equal(badCount.ok, false);
});

// TC-SN-04 HTML includes
test('TC-SN-04 html includes', () => {
  for (const token of [
    'Substack Newsletter Revenue Calculator',
    '/assets/analytics.js',
    'script defer src="./calculator.js"',
    'Gross (monthly‑equiv)',
    'Net take‑home',
    'Effective fee rate',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

// TC-SN-05 discovery exact-once wiring
test('TC-SN-05 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'substack-newsletter-revenue-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((e) => e.slug === slug && e.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((e) => e.url === url).length, 1, 'tools-list exact-once');
});
