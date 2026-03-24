'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULT_INPUTS, validateInputs } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports defaults and validator', () => {
  assert.equal(DEFAULT_INPUTS.storeVisitors, 18000);
  assert.equal(DEFAULT_INPUTS.monthlyPrice, 9.99);
  assert.equal(validateInputs(DEFAULT_INPUTS, 'en').ok, true);
});

test('TC-01 baseline profitable extension snapshot', () => {
  const { ok, result } = calculate(DEFAULT_INPUTS, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.newInstalls, 2160);
  approx(result.newPaidSubscribers, 211.68);
  approx(result.endingPaidSubscribers, 725.76);
  approx(result.grossMrr, 7250.3424);
  approx(result.netMrr, 2802.2674432);
  approx(result.annualizedNetRunRate, 33627.2093184);
  approx(result.paybackMonths, 6.4233697764, 0.001);
});

test('TC-02 existing paid base with weak acquisition can still go negative', () => {
  const { ok, result } = calculate({
    storeVisitors: 2000,
    visitToInstallRatePct: 4,
    installToTrialRatePct: 12,
    trialToPaidRatePct: 15,
    currentPaidSubscribers: 180,
    monthlyPrice: 7.99,
    monthlyChurnRatePct: 9,
    processingFeeRatePct: 3.4,
    paymentFlatFee: 0.30,
    apiCostPerPaidSubscriber: 0.55,
    supportCostPerPaidSubscriber: 1.1,
    fixedMonthlyCosts: 2400,
    oneTimeBuildCost: 12000,
  }, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.churnedSubscribers, 16.2);
  approx(result.newPaidSubscribers, 1.44);
  approx(result.endingPaidSubscribers, 165.24);
  assert.ok(result.netMrr < 0);
  assert.equal(result.paybackMonths, null);
});

test('TC-03 break-even visitors is feasible with positive funnel and contribution', () => {
  const { ok, result } = calculate({
    ...DEFAULT_INPUTS,
    currentPaidSubscribers: 120,
    fixedMonthlyCosts: 3600,
    storeVisitors: 9000,
    visitToInstallRatePct: 10,
    installToTrialRatePct: 25,
    trialToPaidRatePct: 20,
  }, { lang: 'en' });

  assert.equal(ok, true);
  assert.ok(result.contributionMarginPerPaid > 0);
  assert.ok(result.breakEvenVisitors !== null);
  approx(result.breakEvenVisitors, 64210.3000415945, 0.001);
});

test('TC-04 break-even visitors and payback are not feasible when contribution collapses', () => {
  const { ok, result } = calculate({
    ...DEFAULT_INPUTS,
    visitToInstallRatePct: 0,
    processingFeeRatePct: 97,
    paymentFlatFee: 1.5,
    apiCostPerPaidSubscriber: 4.5,
    supportCostPerPaidSubscriber: 4.7,
    fixedMonthlyCosts: 6000,
  }, { lang: 'en' });

  assert.equal(ok, true);
  assert.ok(result.contributionMarginPerPaid <= 0);
  assert.equal(result.breakEvenVisitors, null);
  assert.equal(result.paybackMonths, null);
});

test('TC-05 validation rejects invalid inputs', () => {
  const { ok, errors } = calculate({
    ...DEFAULT_INPUTS,
    storeVisitors: -1,
    currentPaidSubscribers: 12.5,
    monthlyPrice: 0,
    trialToPaidRatePct: 101,
  }, { lang: 'en' });

  assert.equal(ok, false);
  assert.ok(errors.length >= 4);
});

test('TC-06 summary formatting includes required decision fields', () => {
  const { ok, result } = calculate(DEFAULT_INPUTS, { lang: 'en' });

  assert.equal(ok, true);
  assert.match(result.summary, /\[Chrome Extension Subscription Profit Summary\]/);
  assert.match(result.summary, /Funnel:/);
  assert.match(result.summary, /Ending paid subscribers:/);
  assert.match(result.summary, /Gross MRR:/);
  assert.match(result.summary, /Net MRR:/);
  assert.match(result.summary, /Break-even monthly store visitors:/);
  assert.match(result.summary, /Payback period:/);
});

test('HTML scaffold contains required bilingual controls and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Chrome Extension Subscription Profit Calculator | 크롬 익스텐션 구독 수익 계산기',
    'langBtn',
    'copySummaryBtn',
    'resetDefaultsBtn',
    'summaryOutput',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /browser extension/i);
  assert.match(html, /브라우저 확장 프로그램/);
});

test('catalog wiring exists exactly once across discovery surfaces', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'chrome-extension-subscription-profit-calculator';
  const url = `/tools/${slug}/`;
  const htmlIndex = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const mdIndex = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((htmlIndex.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((mdIndex.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
});
