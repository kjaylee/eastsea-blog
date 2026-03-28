'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULT_INPUTS, THRESHOLD, validateInputs } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports defaults and threshold contract', () => {
  assert.equal(THRESHOLD, 1000000);
  assert.equal(DEFAULT_INPUTS.monthlyGrossRevenue, 25000);
  assert.equal(DEFAULT_INPUTS.amortizationMonths, 12);
  assert.equal(validateInputs(DEFAULT_INPUTS, 'en').ok, true);
});

test('TC-01 below-threshold month stays in 0% band', () => {
  const { ok, result } = calculate(DEFAULT_INPUTS, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.zeroShareBandRevenue, 25000);
  approx(result.fifteenShareBandRevenue, 0);
  approx(result.shopifyRevenueShareFee, 0);
  approx(result.processingFeeAmount, 725);
  approx(result.recognizedRevenueAfterRefunds, 24250);
  approx(result.taxReserveAmount, 3637.5);
  approx(result.amortizedOneTimeCost, 1.5833333333, 0.0001);
  approx(result.totalCost, 6164.0833333333, 0.001);
  approx(result.monthlyNetProfit, 18085.9166666667, 0.001);
  approx(result.effectiveTakeHomeRatePct, 72.3436666667, 0.0001);
  approx(result.breakEvenMonthlyGrossRevenue, 2277.6021489886, 0.001);
  assert.equal(result.bandState, 'inside');
});

test('TC-02 crossing-threshold month splits 0% and 15% bands', () => {
  const { ok, result } = calculate({
    monthlyGrossRevenue: 120000,
    lifetimeGrossBeforeMonth: 950000,
    refundRate: 2,
    processingFeeRate: 2.9,
    taxReserveRate: 18,
    supportToolingCost: 3500,
    oneTimeRegistrationCost: 19,
    amortizationMonths: 12,
  }, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.zeroShareBandRevenue, 50000);
  approx(result.fifteenShareBandRevenue, 70000);
  approx(result.shopifyRevenueShareFee, 10500);
  approx(result.processingFeeAmount, 3480);
  approx(result.recognizedRevenueAfterRefunds, 117600);
  approx(result.taxReserveAmount, 21168);
  approx(result.totalCost, 38649.5833333333, 0.001);
  approx(result.monthlyNetProfit, 78950.4166666667, 0.001);
  approx(result.effectiveTakeHomeRatePct, 65.7920138889, 0.0001);
  approx(result.breakEvenMonthlyGrossRevenue, 4541.6126249459, 0.001);
  assert.equal(result.bandState, 'crossing');
});

test('TC-03 already above threshold charges 15% on all gross', () => {
  const { ok, result } = calculate({
    monthlyGrossRevenue: 40000,
    lifetimeGrossBeforeMonth: 1200000,
    refundRate: 4,
    processingFeeRate: 2.9,
    taxReserveRate: 12,
    supportToolingCost: 2200,
    oneTimeRegistrationCost: 19,
    amortizationMonths: 12,
  }, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.zeroShareBandRevenue, 0);
  approx(result.fifteenShareBandRevenue, 40000);
  approx(result.shopifyRevenueShareFee, 6000);
  approx(result.processingFeeAmount, 1160);
  approx(result.recognizedRevenueAfterRefunds, 38400);
  approx(result.taxReserveAmount, 4608);
  approx(result.totalCost, 13969.5833333333, 0.001);
  approx(result.monthlyNetProfit, 24430.4166666667, 0.001);
  approx(result.effectiveTakeHomeRatePct, 61.0760416667, 0.0001);
  approx(result.breakEvenMonthlyGrossRevenue, 3330.6858295008, 0.001);
  assert.equal(result.bandState, 'above');
});

test('TC-04 invalid input is rejected', () => {
  const { ok, errors, result } = calculate({
    ...DEFAULT_INPUTS,
    monthlyGrossRevenue: -1,
    lifetimeGrossBeforeMonth: -2,
    refundRate: 101,
    processingFeeRate: 101,
    taxReserveRate: 101,
    amortizationMonths: 0,
  }, { lang: 'en' });

  assert.equal(ok, false);
  assert.equal(result, null);
  assert.ok(errors.length >= 6);
});

test('TC-05 break-even becomes not feasible when net factor is non-positive', () => {
  const { ok, result } = calculate({
    monthlyGrossRevenue: 10000,
    lifetimeGrossBeforeMonth: 1500000,
    refundRate: 30,
    processingFeeRate: 25,
    taxReserveRate: 35,
    supportToolingCost: 1500,
    oneTimeRegistrationCost: 19,
    amortizationMonths: 12,
  }, { lang: 'en' });

  assert.equal(ok, true);
  approx(result.shopifyRevenueShareFee, 1500);
  approx(result.processingFeeAmount, 2500);
  approx(result.recognizedRevenueAfterRefunds, 7000);
  approx(result.taxReserveAmount, 2450);
  approx(result.monthlyNetProfit, -951.5833333333, 0.001);
  assert.equal(result.breakEvenMonthlyGrossRevenue, Infinity);
});

test('TC-06 summary contains decision-ready fields', () => {
  const { ok, result } = calculate(DEFAULT_INPUTS, { lang: 'en' });

  assert.equal(ok, true);
  assert.match(result.summary, /\[Shopify App Store Revenue Share Summary\]/);
  assert.match(result.summary, /Monthly gross revenue:/);
  assert.match(result.summary, /Lifetime gross before month:/);
  assert.match(result.summary, /Band split:/);
  assert.match(result.summary, /Shopify revenue-share fee:/);
  assert.match(result.summary, /Recognized revenue after refunds:/);
  assert.match(result.summary, /Total monthly cost:/);
  assert.match(result.summary, /Monthly net profit:/);
  assert.match(result.summary, /Break-even monthly gross revenue:/);
});

test('HTML scaffold contains required bilingual controls and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Shopify App Store Revenue Share Calculator | Shopify 앱스토어 수익 배분 계산기',
    'langBtn',
    'copySummaryBtn',
    'resetDefaultsBtn',
    'summaryOutput',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Shopify App Store developer/i);
  assert.match(html, /Shopify 앱스토어/);
});

test('catalog wiring exists exactly once across discovery surfaces', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'shopify-app-store-revenue-share-calculator';
  const url = `/tools/${slug}/`;
  const htmlIndex = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((htmlIndex.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
});
