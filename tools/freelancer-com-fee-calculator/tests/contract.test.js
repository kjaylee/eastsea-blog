const test = require('node:test');
const assert = require('node:assert/strict');
const { compute, solveFixedPriceGrossRequired } = require('../app.js');

function approx(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

test('fixed-price standard fee', () => {
  const result = compute({
    workMode: 'fixed-price',
    awardedAmount: 100,
    releasedAmount: 100,
    bonusAmount: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 0
  });

  approx(result.baseProjectFee, 10, 'baseProjectFee');
  approx(result.totalPlatformFee, 10, 'totalPlatformFee');
  approx(result.payoutBeforeCosts, 90, 'payoutBeforeCosts');
  approx(result.netProfit, 90, 'netProfit');
});

test('fixed-price minimum fee branch', () => {
  const result = compute({
    workMode: 'fixed-price',
    awardedAmount: 30,
    releasedAmount: 30,
    bonusAmount: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 0
  });

  approx(result.baseProjectFee, 5, 'baseProjectFee');
  approx(result.payoutBeforeCosts, 25, 'payoutBeforeCosts');
  approx(result.effectiveFeeRatePct, 16.666666666666664, 'effectiveFeeRatePct');
});

test('fixed-price overage branch', () => {
  const result = compute({
    workMode: 'fixed-price',
    awardedAmount: 100,
    releasedAmount: 150,
    bonusAmount: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 0
  });

  approx(result.overagePayments, 50, 'overagePayments');
  approx(result.overageFee, 5, 'overageFee');
  approx(result.totalPlatformFee, 15, 'totalPlatformFee');
  approx(result.payoutBeforeCosts, 135, 'payoutBeforeCosts');
});

test('hourly branch includes 10% on released and bonus', () => {
  const result = compute({
    workMode: 'hourly',
    awardedAmount: 0,
    releasedAmount: 200,
    bonusAmount: 10,
    subcontractorCost: 0,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 0
  });

  approx(result.baseProjectFee, 20, 'baseProjectFee');
  approx(result.bonusFee, 1, 'bonusFee');
  approx(result.totalPlatformFee, 21, 'totalPlatformFee');
  approx(result.payoutBeforeCosts, 189, 'payoutBeforeCosts');
});

test('seller costs affect net profit', () => {
  const result = compute({
    workMode: 'fixed-price',
    awardedAmount: 100,
    releasedAmount: 100,
    bonusAmount: 0,
    subcontractorCost: 20,
    softwareCost: 10,
    otherCost: 5,
    targetNetProfit: 0
  });

  approx(result.sellerCostTotal, 35, 'sellerCostTotal');
  approx(result.netProfit, 55, 'netProfit');
});

test('fixed-price break-even uses piecewise formula when costs exceed awarded threshold', () => {
  const value = solveFixedPriceGrossRequired(100, 120, 0);
  assert.ok(value > 100, 'break-even should exceed awarded amount');
  approx(value, 133.33333333333334, 'piecewise breakEvenGrossRequired');
});

test('hourly target gross required is cost-plus-target divided by 0.9', () => {
  const result = compute({
    workMode: 'hourly',
    awardedAmount: 0,
    releasedAmount: 0,
    bonusAmount: 0,
    subcontractorCost: 45,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 90
  });

  approx(result.targetGrossRequired, 150, 'targetGrossRequired');
});

test('invalid fixed-price awarded amount returns error', () => {
  const result = compute({
    workMode: 'fixed-price',
    awardedAmount: 0,
    releasedAmount: 100,
    bonusAmount: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    otherCost: 0,
    targetNetProfit: 0
  });

  assert.match(result.error, /Awarded amount/i);
});
