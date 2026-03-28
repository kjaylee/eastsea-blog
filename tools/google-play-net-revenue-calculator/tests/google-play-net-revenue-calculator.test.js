const test = require('node:test');
const assert = require('node:assert/strict');
const { compute, validateInput } = require('../calculator.js');

function almostEqual(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected}`);
}

test('standard product below threshold stays at 15%', () => {
  const result = compute({
    grossCustomerSpend: 200000,
    vatRate: 10,
    refundRate: 5,
    productType: 'standard',
    enrolledTier15: true,
    ytdEarnings: 100000,
    thresholdCap: 1000000,
    operatingCost: 10000,
    uaSpend: 20000
  });

  almostEqual(result.upperTierRevenue, 0);
  almostEqual(result.blendedFeeRate, 15);
  assert.ok(Number.isFinite(result.netProfit));
});

test('standard product crossing threshold blends 15% and 30%', () => {
  const result = compute({
    grossCustomerSpend: 800000,
    vatRate: 0,
    refundRate: 0,
    productType: 'standard',
    enrolledTier15: true,
    ytdEarnings: 500000,
    thresholdCap: 1000000,
    operatingCost: 50000,
    uaSpend: 100000
  });

  almostEqual(result.lowerTierRevenue, 500000);
  almostEqual(result.upperTierRevenue, 300000);
  almostEqual(result.googleFeeAmount, 165000);
  almostEqual(result.blendedFeeRate, 20.625);
  almostEqual(result.remainingTierRunway, 0);
});

test('subscription product uses flat 15% regardless of threshold usage', () => {
  const result = compute({
    grossCustomerSpend: 300000,
    vatRate: 0,
    refundRate: 10,
    productType: 'subscription',
    enrolledTier15: false,
    ytdEarnings: 9999999,
    thresholdCap: 1000000,
    operatingCost: 20000,
    uaSpend: 40000
  });

  almostEqual(result.lowerTierRevenue, 270000);
  almostEqual(result.upperTierRevenue, 0);
  almostEqual(result.googleFeeAmount, 40500);
  almostEqual(result.blendedFeeRate, 15);
  assert.equal(result.runwayState, 'not_applicable');
});


test('standard product without 15% enrollment marks runway as disabled', () => {
  const result = compute({
    grossCustomerSpend: 120000,
    vatRate: 0,
    refundRate: 0,
    productType: 'standard',
    enrolledTier15: false,
    ytdEarnings: 0,
    thresholdCap: 1000000,
    operatingCost: 0,
    uaSpend: 0
  });

  almostEqual(result.lowerTierRevenue, 0);
  almostEqual(result.upperTierRevenue, 120000);
  almostEqual(result.googleFeeAmount, 36000);
  assert.equal(result.runwayState, 'tier_disabled');
});

test('validation rejects invalid negative cost', () => {
  const error = validateInput({
    grossCustomerSpend: 100,
    vatRate: 0,
    refundRate: 0,
    productType: 'standard',
    enrolledTier15: true,
    ytdEarnings: 0,
    thresholdCap: 1000000,
    operatingCost: -1,
    uaSpend: 0
  });

  assert.match(error, /Operating cost/);
});

test('validation rejects rates above 100', () => {
  const error = validateInput({
    grossCustomerSpend: 100,
    vatRate: 0,
    refundRate: 120,
    productType: 'standard',
    enrolledTier15: true,
    ytdEarnings: 0,
    thresholdCap: 1000000,
    operatingCost: 0,
    uaSpend: 0
  });

  assert.match(error, /Refund rate/);
});
