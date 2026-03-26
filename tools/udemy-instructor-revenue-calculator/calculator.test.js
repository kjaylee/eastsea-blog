const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULTS, CHANNEL_RATES } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  instructorPromoNetSales: 4000,
  marketplaceNetSales: 2500,
  partnerNetSales: 800,
  partnerSharePct: 25,
  subscriptionRevenue: 250000,
  subscriptionPoolPct: 15,
  minutesSharePct: 1.2,
  otherMonthlyCost: 300,
  targetMonthlyTakeHome: 6500
};

test('exports required defaults and rates', () => {
  assert.equal(DEFAULTS.instructorPromoNetSales, 4000);
  assert.equal(CHANNEL_RATES.instructorPromoPct, 97);
  assert.equal(CHANNEL_RATES.marketplacePct, 37);
  assert.equal(CHANNEL_RATES.subscriptionPoolPct, 15);
});

test('TC-UDM-01 baseline scenario matches expected math', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.instructorPromoPayout, 3880);
  approx(result.marketplacePayout, 925);
  approx(result.partnerPayout, 200);
  approx(result.subscriptionInstructorPool, 37500);
  approx(result.subscriptionPayout, 450);
  approx(result.totalPayout, 5455);
  approx(result.monthlyTakeHome, 5155);
  approx(result.annualTakeHome, 61860);
  approx(result.blendedPayoutRatePct, 12.18, 0.01);
  approx(result.targetGap, 1345);
  approx(result.requiredExtraInstructorPromoSales, 1386.6, 0.05);
});

test('TC-UDM-02 partner share only changes partner payout contribution', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const updated = calculate({ ...baseline, partnerSharePct: 40 }, { lang: 'en' }).result;

  approx(updated.partnerPayout, 320);
  approx(updated.totalPayout - base.totalPayout, 120);
  approx(updated.monthlyTakeHome - base.monthlyTakeHome, 120);
});

test('TC-UDM-03 subscription math respects pool and minutes share', () => {
  const { result, error } = calculate({
    ...baseline,
    subscriptionRevenue: 100000,
    subscriptionPoolPct: 15,
    minutesSharePct: 2
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.subscriptionInstructorPool, 15000);
  approx(result.subscriptionPayout, 300);
});

test('TC-UDM-04 target helper returns zero extra promo sales when target is met', () => {
  const { result, error } = calculate({ ...baseline, targetMonthlyTakeHome: 5000 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.targetGap, 0);
  approx(result.requiredExtraInstructorPromoSales, 0);
});

test('TC-UDM-05 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseline, instructorPromoNetSales: -1 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, partnerSharePct: 100 },
    { ...baseline, subscriptionPoolPct: -0.1 },
    { ...baseline, minutesSharePct: 100 },
    { ...baseline, targetMonthlyTakeHome: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-UDM-06 HTML scaffold includes required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'instructorPromoNetSales', 'channelBody', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Udemy Instructor Revenue Calculator|유데미 강사 수익 계산기/);
});

test('TC-UDM-07 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'udemy-instructor-revenue-calculator';
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
