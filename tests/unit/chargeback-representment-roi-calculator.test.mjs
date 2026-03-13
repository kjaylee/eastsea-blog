import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRepresentmentRoi,
  buildSummary,
} from '../../tools/chargeback-representment-roi-calculator/logic.mjs';

describe('chargeback representment roi calculator logic', () => {
  it('tc_l_01_validation_rejects_projected_win_rate_below_current', () => {
    const validation = validateInputs({ ...DEFAULT_INPUT, currentWinRatePct: 40, projectedWinRatePct: 35 });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /projectedWinRatePct/);
  });

  it('tc_l_02_validation_rejects_impossible_fee_stack', () => {
    const validation = validateInputs({ ...DEFAULT_INPUT, vendorFeePct: 80, platformFeePct: 20 });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /vendorFeePct \+ platformFeePct/);
  });

  it('tc_l_03_higher_projected_win_rate_increases_incremental_recovery', () => {
    const low = calculateRepresentmentRoi({ ...DEFAULT_INPUT, projectedWinRatePct: 28 });
    const high = calculateRepresentmentRoi({ ...DEFAULT_INPUT, projectedWinRatePct: 42 });
    assert.ok(high.incrementalRecoveredRevenue > low.incrementalRecoveredRevenue);
    assert.ok(high.incrementalWins > low.incrementalWins);
  });

  it('tc_l_04_higher_software_cost_decreases_net_lift_and_roi', () => {
    const lowCost = calculateRepresentmentRoi({ ...DEFAULT_INPUT, monthlySoftwareCost: 199 });
    const highCost = calculateRepresentmentRoi({ ...DEFAULT_INPUT, monthlySoftwareCost: 999 });
    assert.ok(highCost.netLift < lowCost.netLift);
    assert.ok(highCost.roiPct < lowCost.roiPct);
  });

  it('tc_l_05_higher_order_value_improves_recovery_and_net_lift', () => {
    const base = calculateRepresentmentRoi({ ...DEFAULT_INPUT, averageOrderValue: 70 });
    const higher = calculateRepresentmentRoi({ ...DEFAULT_INPUT, averageOrderValue: 120 });
    assert.ok(higher.grossValuePerWin > base.grossValuePerWin);
    assert.ok(higher.netLift > base.netLift);
  });

  it('tc_l_06_default_scenario_is_finite_and_positive', () => {
    const result = calculateRepresentmentRoi(DEFAULT_INPUT);
    assert.ok(result.projectedRecoveredRevenue > 0);
    assert.ok(result.totalProgramCost > 0);
    assert.ok(Number.isFinite(result.breakEvenProjectedWinRatePct));
  });

  it('tc_l_07_summary_contains_core_business_fields', () => {
    const result = calculateRepresentmentRoi(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');
    assert.match(summary, /Net lift:/);
    assert.match(summary, /ROI:/);
    assert.match(summary, /Break-even projected win rate:/);
  });
});
