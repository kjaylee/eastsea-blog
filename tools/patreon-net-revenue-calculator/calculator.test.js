const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULTS, PLAN_PRESETS, PROCESSING_DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} ≈ ${expected} (±${tol})`);
}

const baseline = {
  monthlyMembers: 800,
  monthlyPrice: 5,
  annualMembersBilled: 40,
  annualPrice: 50,
  oneTimeGrossSales: 1000,
  oneTimeOrders: 50,
  planPreset: 'pro',
  customPlanRatePct: 8,
  standardRatePct: PROCESSING_DEFAULTS.standardRatePct,
  standardFlat: PROCESSING_DEFAULTS.standardFlat,
  microRatePct: PROCESSING_DEFAULTS.microRatePct,
  microFlat: PROCESSING_DEFAULTS.microFlat,
  microThreshold: PROCESSING_DEFAULTS.microThreshold,
  refundRatePct: 2,
  payoutFlat: 0.25,
  payoutPercentPct: 0,
  payoutsPerMonth: 1,
  otherMonthlyCost: 200,
  currency: 'USD'
};

function dollars(n) { return Math.round(n * 100) / 100; }

// Helper to compute the expected processing fees for baseline
function expectedProcessingFees() {
  // monthly (standard): 2.9% + 0.30 over 800 orders of $5
  const m = 4000 * 0.029 + 800 * 0.30; // 116 + 240 = 356
  // annual (standard): 40 orders of $50
  const a = 2000 * 0.029 + 40 * 0.30; // 58 + 12 = 70
  // one-time (standard): 50 orders, $1000 gross
  const o = 1000 * 0.029 + 50 * 0.30; // 29 + 15 = 44
  return dollars(m + a + o); // 470.00
}

const url = '/tools/patreon-net-revenue-calculator/';

test('exports & defaults', () => {
  assert.ok(Array.isArray(PLAN_PRESETS) && PLAN_PRESETS.length >= 3);
  assert.equal(DEFAULTS.planPreset, 'pro');
  assert.equal(PROCESSING_DEFAULTS.microThreshold, 3.00);
});

test('TC-PAT-01 baseline math', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });
  assert.equal(error, '');

  approx(result.totalGross, 7000, 0.5);
  approx(result.platformFees, 560, 0.2);
  approx(result.processingFees, expectedProcessingFees(), 0.2);
  approx(result.refundLoss, 140, 0.1);
  approx(result.payoutFees, 0.25, 0.001);
  approx(result.totalFees, 560 + expectedProcessingFees() + 140 + 0.25 + 200, 0.5);
  approx(result.netRevenue, 7000 - (560 + expectedProcessingFees() + 140 + 0.25 + 200), 0.5);
  approx(result.effectiveFeeRatePct, (result.totalFees / result.totalGross) * 100, 0.05);
});

test('TC-PAT-02 micro tier behavior for low monthly price', () => {
  const lowMonthly = { ...baseline, monthlyPrice: 2.5, oneTimeGrossSales: 0, oneTimeOrders: 0, annualMembersBilled: 0, annualPrice: 0 };
  const { result, error } = calculate(lowMonthly, { lang: 'en' });
  assert.equal(error, '');
  const microProc = 800 * (2.5 * 0.05 + 0.10); // 800 * (0.125 + 0.10) = 180
  approx(result.monthlyProcessing, microProc, 0.2);
});

test('TC-PAT-03 validation rejects impossible inputs', () => {
  const invalids = [
    { ...baseline, monthlyMembers: -1 },
    { ...baseline, monthlyPrice: -0.01 },
    { ...baseline, oneTimeGrossSales: 10, oneTimeOrders: 0 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, payoutPercentPct: 100 },
    { ...baseline, payoutsPerMonth: 40 }
  ];
  for (const input of invalids) {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  }
});

test('TC-PAT-04 payout percent applies to payout base', () => {
  const withPct = { ...baseline, payoutPercentPct: 1 };
  const { result, error } = calculate(withPct, { lang: 'en' });
  assert.equal(error, '');
  // payoutFees = 0.25 + 1% * (gross - platform - processing - refund)
  const base = 7000 - 560 - expectedProcessingFees() - 140;
  approx(result.payoutFees, 0.25 + base * 0.01, 0.5);
});

test('TC-PAT-05 target net solver monotonicity', () => {
  const input = { ...baseline, desiredMonthlyNet: 6000 };
  const { result, error } = calculate(input, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result.requiredGrossForTargetNet > result.totalGross);
});

test('TC-PAT-06 HTML & catalog wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.ok(html.includes('script defer src="./calculator.js"'));
  assert.ok(html.includes('/assets/analytics.js'));

  // index pages already contain the slug exactly once
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  assert.equal((indexHtml.match(/patreon-net-revenue-calculator/g) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(/patreon-net-revenue-calculator/g) || []).length, 1, 'index.md exact-once');

  // After wiring below, these will exist
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  assert.equal(toolsList.filter(e => e.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter(e => e.slug === 'patreon-net-revenue-calculator' && e.url === url).length, 1, 'manifest exact-once');
});

