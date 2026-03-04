import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculatePremiumSupportAttachROI,
  buildSummary,
} from '../../tools/premium-support-attach-rate-roi-calculator/logic.mjs';

describe('premium support attach rate roi calculator logic', () => {
  it('tc_p_01_validation_rejects_target_below_current', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      currentAttachPct: 22,
      targetAttachPct: 15,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetAttachPct/);
  });

  it('tc_p_02_validation_rejects_non_finite_input', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      activeAccounts: Number.NaN,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /activeAccounts/);
  });

  it('tc_p_03_higher_target_attach_increases_incremental_accounts', () => {
    const low = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, targetAttachPct: 13 });
    const high = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, targetAttachPct: 24 });

    assert.ok(high.incrementalAttachedAccounts > low.incrementalAttachedAccounts);
    assert.ok(high.incrementalAddOnGrossProfit > low.incrementalAddOnGrossProfit);
  });

  it('tc_p_04_higher_fixed_cost_reduces_net_benefit', () => {
    const lowFixed = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, programFixedCostPerMonth: 9000 });
    const highFixed = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, programFixedCostPerMonth: 27000 });

    assert.ok(highFixed.netMonthlyBenefit < lowFixed.netMonthlyBenefit);
  });

  it('tc_p_05_higher_churn_reduction_increases_retention_profit', () => {
    const low = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, churnReductionPct: 0.4 });
    const high = calculatePremiumSupportAttachROI({ ...DEFAULT_INPUT, churnReductionPct: 3.2 });

    assert.ok(high.retentionGrossProfit > low.retentionGrossProfit);
    assert.ok(high.netMonthlyBenefit > low.netMonthlyBenefit);
  });

  it('tc_p_06_break_even_non_finite_when_unit_economics_invalid', () => {
    const result = calculatePremiumSupportAttachROI({
      ...DEFAULT_INPUT,
      supportPlanPricePerMonth: 25,
      addOnGrossMarginPct: 20,
      supportDeliveryCostPerAccount: 40,
      churnReductionPct: 0,
      avgAccountGrossProfitPerMonth: 0,
    });

    assert.equal(Number.isFinite(result.breakEvenAttachPct), false);
  });

  it('tc_p_07_summary_contains_key_fields', () => {
    const result = calculatePremiumSupportAttachROI(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /Premium Support Attach Rate ROI Snapshot/);
    assert.match(summary, /Net Monthly Benefit/);
    assert.match(summary, /Break-even Attach Rate/);
    assert.match(summary, /Status:/);
  });
});
