import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateAgencyMargin,
  buildSummary,
} from '../../tools/white-label-agency-margin-calculator/logic.mjs';

describe('white-label agency margin calculator logic', () => {
  it('tc_l_01_validation_rejects_low_utilization', () => {
    const validation = validateInputs({ ...DEFAULT_INPUT, teamUtilizationPct: 10 });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /teamUtilizationPct/);
  });

  it('tc_l_02_validation_rejects_impossible_margin_plus_fee', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      paymentFeePct: 18,
      targetMarginPct: 83,
    });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetMarginPct plus paymentFeePct/);
  });

  it('tc_l_03_more_scope_creep_increases_recommended_retainer', () => {
    const low = calculateAgencyMargin({ ...DEFAULT_INPUT, scopeCreepPct: 5 });
    const high = calculateAgencyMargin({ ...DEFAULT_INPUT, scopeCreepPct: 35 });

    assert.ok(high.totalMonthlyCost > low.totalMonthlyCost);
    assert.ok(high.recommendedRetainer > low.recommendedRetainer);
  });

  it('tc_l_04_more_revisions_increase_cost_stack', () => {
    const low = calculateAgencyMargin({ ...DEFAULT_INPUT, revisionsPerMonth: 2 });
    const high = calculateAgencyMargin({ ...DEFAULT_INPUT, revisionsPerMonth: 16 });

    assert.ok(high.revisionHours > low.revisionHours);
    assert.ok(high.totalMonthlyCost > low.totalMonthlyCost);
  });

  it('tc_l_05_higher_utilization_reduces_needed_price', () => {
    const lowUtil = calculateAgencyMargin({ ...DEFAULT_INPUT, teamUtilizationPct: 58 });
    const highUtil = calculateAgencyMargin({ ...DEFAULT_INPUT, teamUtilizationPct: 88 });

    assert.ok(highUtil.effectiveCostPerHour < lowUtil.effectiveCostPerHour);
    assert.ok(highUtil.recommendedRetainer < lowUtil.recommendedRetainer);
  });

  it('tc_l_06_break_even_retainer_is_finite_for_default_case', () => {
    const result = calculateAgencyMargin(DEFAULT_INPUT);

    assert.ok(Number.isFinite(result.breakEvenRetainer));
    assert.ok(result.breakEvenRetainer > 0);
  });

  it('tc_l_07_summary_contains_decision_ready_fields', () => {
    const result = calculateAgencyMargin(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /White-Label Agency Margin Plan/);
    assert.match(summary, /Break-even Retainer/);
    assert.match(summary, /Recommended Retainer/);
    assert.match(summary, /Status:/);
  });
});
