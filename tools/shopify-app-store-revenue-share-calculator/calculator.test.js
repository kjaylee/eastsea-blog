const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const calculator = require('./calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('TC-01 baseline stays fully inside the 0% share band', () => {
  const outcome = calculator.calculate({
    ytdRecognizedRevenueBeforeMonth: 780000,
    monthlyGrossAppRevenue: 85000,
    refundRatePct: 3.5,
    processingFeeRatePct: 2.9,
    taxReserveRatePct: 12,
    monthlyOperatingCost: 9000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  assert.equal(outcome.ok, true);
  approx(outcome.result.refundAmount, 2975);
  approx(outcome.result.recognizedRevenue, 82025);
  approx(outcome.result.zeroShareRecognizedRevenue, 82025);
  approx(outcome.result.sharedRecognizedRevenue, 0);
  approx(outcome.result.revenueShareFee, 0);
  approx(outcome.result.processingFees, 2465);
  approx(outcome.result.taxReserve, 9843);
  approx(outcome.result.totalCost, 24283);
  approx(outcome.result.monthlyTakeHome, 60717);
  approx(outcome.result.runwayBeforeMonth, 220000);
  approx(outcome.result.breakEvenMonthlyRevenue, 10972.93343087052, 1e-9);
  assert.equal(outcome.result.band, 'within-threshold');
});

test('TC-02 current month can partially cross into the 15% share band', () => {
  const outcome = calculator.calculate({
    ytdRecognizedRevenueBeforeMonth: 980000,
    monthlyGrossAppRevenue: 60000,
    refundRatePct: 5,
    processingFeeRatePct: 3,
    taxReserveRatePct: 10,
    monthlyOperatingCost: 12000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  assert.equal(outcome.ok, true);
  approx(outcome.result.recognizedRevenue, 57000);
  approx(outcome.result.zeroShareRecognizedRevenue, 20000);
  approx(outcome.result.sharedRecognizedRevenue, 37000);
  approx(outcome.result.revenueShareFee, 5550);
  approx(outcome.result.processingFees, 1800);
  approx(outcome.result.taxReserve, 5700);
  approx(outcome.result.totalCost, 28050);
  approx(outcome.result.monthlyTakeHome, 31950);
  approx(outcome.result.blendedRevenueShareRatePct, 9.7368421053, 1e-9);
  assert.equal(outcome.result.band, 'crosses-threshold');
});

test('TC-03 when already above threshold the full month takes revenue share', () => {
  const outcome = calculator.calculate({
    ytdRecognizedRevenueBeforeMonth: 1200000,
    monthlyGrossAppRevenue: 40000,
    refundRatePct: 4,
    processingFeeRatePct: 2.9,
    taxReserveRatePct: 12,
    monthlyOperatingCost: 10000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  assert.equal(outcome.ok, true);
  approx(outcome.result.recognizedRevenue, 38400);
  approx(outcome.result.zeroShareRecognizedRevenue, 0);
  approx(outcome.result.sharedRecognizedRevenue, 38400);
  approx(outcome.result.revenueShareFee, 5760);
  approx(outcome.result.processingFees, 1160);
  approx(outcome.result.taxReserve, 4608);
  approx(outcome.result.totalCost, 23128);
  approx(outcome.result.monthlyTakeHome, 16872);
  approx(outcome.result.breakEvenMonthlyRevenue, 14885.382554331645, 1e-9);
  assert.equal(outcome.result.band, 'above-threshold');
});

test('TC-04 break-even can land before threshold is exhausted', () => {
  const value = calculator.computeBreakEvenMonthlyGross({
    ytdRecognizedRevenueBeforeMonth: 500000,
    monthlyGrossAppRevenue: 0,
    refundRatePct: 4,
    processingFeeRatePct: 2.9,
    taxReserveRatePct: 12,
    monthlyOperatingCost: 8000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  approx(value, 9806.32507967639, 1e-9);
});

test('TC-05 break-even can require revenue above threshold crossover', () => {
  const value = calculator.computeBreakEvenMonthlyGross({
    ytdRecognizedRevenueBeforeMonth: 990000,
    monthlyGrossAppRevenue: 0,
    refundRatePct: 4,
    processingFeeRatePct: 2.9,
    taxReserveRatePct: 12,
    monthlyOperatingCost: 50000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  approx(value, 72194.10538850848, 1e-9);
});

test('TC-06 impossible break-even returns null', () => {
  const value = calculator.computeBreakEvenMonthlyGross({
    ytdRecognizedRevenueBeforeMonth: 1100000,
    monthlyGrossAppRevenue: 0,
    refundRatePct: 20,
    processingFeeRatePct: 8,
    taxReserveRatePct: 80,
    monthlyOperatingCost: 5000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  });

  assert.equal(value, null);
});

test('TC-07 validation rejects impossible tax-plus-share combinations', () => {
  const outcome = calculator.calculate({
    taxReserveRatePct: 90,
    revenueShareRatePct: 15,
  });

  assert.equal(outcome.ok, false);
  assert.match(outcome.errors.join(' '), /must stay below 100/);
});

test('TC-08 page exposes exact-match title and primary labels', () => {
  assert.match(html, /<title>Shopify App Store Revenue Share Calculator \| Shopify 앱스토어 수익 배분 계산기<\/title>/);
  assert.match(html, /Monthly gross app revenue/);
  assert.match(html, /Break-even monthly gross revenue/);
  assert.match(html, /Shopify Fee Calculator/);
});
