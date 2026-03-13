import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRollingReserve,
  buildSummary,
} from '../../tools/rolling-reserve-cashflow-calculator/logic.mjs';

describe('rolling reserve cashflow calculator logic', () => {
  it('tc_l1_validation_rejects_non_positive_processed_volume', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      monthlyProcessedVolume: 0,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /monthlyProcessedVolume/);
  });

  it('tc_l2_validation_rejects_impossible_combined_rate', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      processingFeeRate: 60,
      refundRate: 30,
      chargebackLossRate: 15,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /must stay below 100/);
  });

  it('tc_l3_reference_case_matches_expected_outputs', () => {
    const result = calculateRollingReserve({
      monthlyProcessedVolume: 50000,
      processingFeeRate: 2.9,
      refundRate: 3,
      chargebackLossRate: 0.6,
      reserveRate: 10,
      reserveHoldMonths: 4,
      monthlyFixedCost: 1200,
      annualCostOfCapitalRate: 12,
      analysisMonths: 12,
    });

    assert.equal(result.monthlyReserveWithheld, 5000);
    assert.equal(result.totalReserveReleased, 40000);
    assert.equal(result.endingReserveBalance, 20000);
    assert.equal(result.steadyStateReserveBalance, 20000);
    assert.equal(result.currentMonthCashAfterReserve, 40550);
    assert.equal(result.steadyStateMonthlyCash, 45550);
    assert.equal(result.periodNetCashAfterFixedCost, 526600);
    assert.equal(result.annualFinancingCostAtSteadyState, 2400);
    assert.equal(result.breakEvenProcessedVolume, 1288.94);
  });

  it('tc_l4_short_analysis_period_has_no_releases', () => {
    const result = calculateRollingReserve({
      ...DEFAULT_INPUT,
      analysisMonths: 3,
      reserveHoldMonths: 6,
    });

    assert.equal(result.totalReserveReleased, 0);
    assert.equal(result.endingReserveBalance, result.monthlyReserveWithheld * 3);
  });

  it('tc_l5_non_positive_contribution_returns_infinite_break_even', () => {
    const result = calculateRollingReserve({
      ...DEFAULT_INPUT,
      processingFeeRate: 55,
      refundRate: 20,
      chargebackLossRate: 10,
      reserveRate: 50,
      reserveHoldMonths: 12,
      annualCostOfCapitalRate: 40,
      monthlyFixedCost: 500,
    });

    assert.equal(result.breakEvenProcessedVolume, Number.POSITIVE_INFINITY);
  });

  it('tc_l6_summary_contains_key_fields', () => {
    const summary = buildSummary(calculateRollingReserve(DEFAULT_INPUT), 'en-US', 'USD');

    assert.match(summary, /Rolling Reserve Cashflow Snapshot/);
    assert.match(summary, /Current Month Cash After Reserve/);
    assert.match(summary, /Steady-state Reserve Balance/);
    assert.match(summary, /Break-even Processed Volume/);
  });
});
