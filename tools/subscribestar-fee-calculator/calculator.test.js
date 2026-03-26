const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  computeScenario,
  DEFAULTS,
  PRESETS,
  SERVICE_FEE_RATE,
  INTERNATIONAL_SURCHARGE_RATE
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const slug = 'subscribestar-fee-calculator';
const url = `/tools/${slug}/`;

const baseline = {
  monthlyBilledRevenue: 4500,
  successfulCharges: 320,
  refundRatePct: 2,
  feePreset: 'creator-average',
  customRatePct: 4.99,
  customFlatFee: 0.30,
  internationalSurcharge: false,
  reserveEnabled: true,
  reserveRatePct: 10,
  payoutRatePct: 0,
  payoutFlatFee: 0,
  payoutCount: 1,
  otherMonthlyCost: 250,
  desiredMonthlyCash: 4000
};

test('exports look sane', () => {
  assert.equal(DEFAULTS.feePreset, 'creator-average');
  assert.ok(Array.isArray(PRESETS));
  assert.equal(SERVICE_FEE_RATE, 0.05);
  assert.equal(INTERNATIONAL_SURCHARGE_RATE, 0.035);
});

test('TC-01 baseline creator-covers math', () => {
  const { result, error } = computeScenario(baseline, { lang: 'en' });
  assert.equal(error, '');

  approx(result.platformFee, 225);
  approx(result.processingFee, 320.55);
  approx(result.refundLoss, 90);
  approx(result.balanceBeforeReserve, 3864.45);
  approx(result.reserveHold, 386.45, 0.05);
  approx(result.payoutFees, 0);
  approx(result.cashAvailableNow, 3228.01, 0.05);
  approx(result.economicNet, 3614.45, 0.05);
  approx(result.averageChargeAmount, 14.06, 0.02);
  approx(result.breakEvenGross, 323.46, 0.05);
  approx(result.targetGross, 5498.84, 0.1);
  assert.ok(result.warnings.some((warning) => warning.includes('reserve')));
});

test('TC-02 subscriber-covers zeroes creator-side processing fees', () => {
  const { result, error } = computeScenario({ ...baseline, feePreset: 'subscriber-covers', reserveEnabled: false }, { lang: 'en' });
  assert.equal(error, '');
  approx(result.processingFee, 0);
  approx(result.cashAvailableNow, 3935, 0.05);
  approx(result.effectiveCashKeepRatePct, 87.44, 0.05);
});

test('TC-03 international surcharge adds 3.5 points to creator-side rate', () => {
  const { result, error } = computeScenario({ ...baseline, reserveEnabled: false, internationalSurcharge: true }, { lang: 'en' });
  assert.equal(error, '');
  approx(result.creatorProcessingRatePct, 8.49, 0.001);
  approx(result.processingFee, 478.05, 0.05);
  assert.ok(result.cashAvailableNow < 3614.45);
});

test('TC-04 reserve disabled makes cash-now and economic-net converge when payout drag is zero', () => {
  const { result, error } = computeScenario({ ...baseline, reserveEnabled: false }, { lang: 'en' });
  assert.equal(error, '');
  approx(result.reserveHold, 0);
  approx(result.cashAvailableNow, result.economicNet, 0.001);
});

test('TC-05 payout rate and flat fee reduce cash now', () => {
  const withPayout = computeScenario({ ...baseline, reserveEnabled: false, payoutRatePct: 1.5, payoutFlatFee: 1.25, payoutCount: 2 }, { lang: 'en' });
  assert.equal(withPayout.error, '');
  const base = computeScenario({ ...baseline, reserveEnabled: false }, { lang: 'en' });
  assert.ok(withPayout.result.cashAvailableNow < base.result.cashAvailableNow);
  approx(withPayout.result.payoutFees, 60.47, 0.05);
});

test('TC-06 invalid inputs reject negatives and impossible rates', () => {
  const invalidCases = [
    { ...baseline, monthlyBilledRevenue: -1 },
    { ...baseline, successfulCharges: -1 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, reserveRatePct: 100 },
    { ...baseline, payoutRatePct: -1 },
    { ...baseline, payoutCount: 1.2 }
  ];

  for (const sample of invalidCases) {
    const { result, error } = computeScenario(sample, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  }
});

test('TC-07 zero charges keeps current math but disables break-even targets', () => {
  const { result, error } = computeScenario({ ...baseline, successfulCharges: 0, reserveEnabled: false }, { lang: 'en' });
  assert.equal(error, '');
  assert.equal(result.averageChargeAmount, null);
  assert.equal(result.breakEvenGross, null);
  assert.equal(result.targetGross, null);
});

test('TC-08 scenario table exists and includes core presets', () => {
  const { result, error } = computeScenario(baseline, { lang: 'en' });
  assert.equal(error, '');
  assert.equal(result.scenarioRows.length, 3);
  assert.ok(result.scenarioRows.some((row) => row.id === 'creator-average'));
  assert.ok(result.scenarioRows.some((row) => row.id === 'creator-over-25'));
  assert.ok(result.scenarioRows.some((row) => row.id === 'subscriber-covers'));
});

test('TC-09 summary mentions SubscribeStar and target gross', () => {
  const { result, error } = computeScenario(baseline, { lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /SubscribeStar/i);
  assert.match(result.summary, /Required billed revenue for target cash/i);
});

test('TC-10 Korean summary works', () => {
  const { result, error } = computeScenario(baseline, { lang: 'ko' });
  assert.equal(error, '');
  assert.match(result.summary, /SubscribeStar 수수료 계산기 요약/);
});

test('TC-11 HTML contains expected anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const tokens = [
    'langBtn',
    'monthlyBilledRevenue',
    'successfulCharges',
    'scenarioBody',
    'copySummary',
    'summary',
    './calculator.js',
    '/assets/analytics.js',
    'SubscribeStar Fee Calculator'
  ];

  for (const token of tokens) {
    assert.ok(html.includes(token), `HTML missing ${token}`);
  }
});

test('TC-12 catalog exact-once wiring', () => {
  const repoRoot = path.join(__dirname, '..', '..');
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((htmlIndex.match(new RegExp(`href="${slug}/"`, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((markdownIndex.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
