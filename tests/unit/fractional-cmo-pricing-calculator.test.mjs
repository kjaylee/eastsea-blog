import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const calc = require('../../tools/fractional-cmo-pricing-calculator/calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('fractional cmo pricing calculator', () => {
  it('tc_fcmo_01 default baseline scenario remains deterministic', () => {
    const { result, error } = calc.calculate(calc.DEFAULT_INPUTS);

    assert.equal(error, '');
    approx(result.seniorBaseHours, 24);
    approx(result.bufferedSeniorHours, 28.32);
    approx(result.bufferedSupportHours, 8.72);
    approx(result.totalDeliveryHours, 37.04);
    approx(result.monthlyDeliveryCost, 6729.2);
    approx(result.breakEvenRetainer, 6937.32, 0.01);
    approx(result.recommendedRetainer, 10043.58, 0.01);
    approx(result.suggestedOnboardingFee, 3134.33, 0.01);
    approx(result.contractValue, 63395.82, 0.01);
    approx(result.currentOperatingMarginPct, -25.35, 0.01);
    approx(result.netRealizedHourlyRate, 263.02, 0.01);
  });

  it('tc_fcmo_02 alternate higher-scope scenario computes correct values', () => {
    const { result, error } = calc.calculate({
      currentRetainer: 8500,
      strategyHours: 12,
      leadershipHours: 8,
      channelReviewHours: 12,
      supportHours: 14,
      seniorRate: 190,
      supportRate: 70,
      toolBudget: 600,
      overhead: 1200,
      scopeBufferPct: 20,
      paymentFeePct: 2.9,
      targetMarginPct: 32,
      onboardingHours: 16,
      contractMonths: 9,
    });

    assert.equal(error, '');
    approx(result.monthlyDeliveryCost, 10174, 0.01);
    approx(result.recommendedRetainer, 15628.26, 0.01);
    approx(result.suggestedOnboardingFee, 4669.74, 0.01);
    approx(result.contractValue, 145324.12, 0.01);
    assert.ok(result.recommendedRetainer > result.breakEvenRetainer);
  });

  it('tc_fcmo_03 validation rejects invalid inputs', () => {
    const invalidCases = [
      { currentRetainer: 0 },
      { strategyHours: -1 },
      { seniorRate: 0 },
      { contractMonths: 0 },
      { strategyHours: 0, leadershipHours: 0, channelReviewHours: 0 },
    ];

    invalidCases.forEach((input) => {
      const { result, error } = calc.calculate(input);
      assert.equal(result, null);
      assert.notEqual(error, '');
    });
  });

  it('tc_fcmo_04 impossible pricing state returns user-facing error', () => {
    const { result, error } = calc.calculate({
      paymentFeePct: 20,
      targetMarginPct: 80,
    });

    assert.equal(result, null);
    assert.match(error, /below 100%/i);
  });

  it('tc_fcmo_05 summary contains decision-ready fields', () => {
    const { result, error } = calc.calculate(calc.DEFAULT_INPUTS);
    assert.equal(error, '');
    assert.match(result.summary, /\[Fractional CMO Pricing Plan\]/);
    assert.match(result.summary, /Recommended Monthly Retainer:/);
    assert.match(result.summary, /Suggested Onboarding Fee:/);
    assert.match(result.summary, /Estimated Contract Value/);
    assert.match(result.summary, /Tier Ladder:/);
  });

  it('tc_fcmo_06 html scaffold has required anchors', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/fractional-cmo-pricing-calculator/index.html'), 'utf8');
    for (const token of [
      'id="currentRetainer"',
      'id="recommendedRetainer"',
      'id="summary"',
      '/assets/analytics.js',
      './calculator.js',
      './app.js',
    ]) {
      assert.ok(html.includes(token), token);
    }
  });

  it('tc_fcmo_07 catalog wiring remains exact-once', () => {
    const slug = 'fractional-cmo-pricing-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(/href="fractional-cmo-pricing-calculator\//g) || []).length, 1, 'index.html exact-once');
    assert.equal((indexMd.match(/\]\(\.\/fractional-cmo-pricing-calculator\/\)/g) || []).length, 1, 'index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  });
});
