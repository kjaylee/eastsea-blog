import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateUgcWhitelistingAttachRateROI,
  buildSummary,
} from '../../tools/ugc-whitelisting-attach-rate-roi-calculator/logic.mjs';

describe('ugc whitelisting attach rate roi calculator logic', () => {
  it('tc_uwar_01_validation_rejects_target_below_current', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      currentAttachRatePct: 35,
      targetAttachRatePct: 20,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetAttachRatePct/);
  });

  it('tc_uwar_02_validation_rejects_non_finite_input', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      monthlyQualifiedDeals: Number.NaN,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /monthlyQualifiedDeals/);
  });

  it('tc_uwar_03_higher_target_attach_rate_increases_incremental_deals_and_benefit', () => {
    const low = calculateUgcWhitelistingAttachRateROI({ ...DEFAULT_INPUT, targetAttachRatePct: 24 });
    const high = calculateUgcWhitelistingAttachRateROI({ ...DEFAULT_INPUT, targetAttachRatePct: 45 });

    assert.ok(high.incrementalWhitelistingDeals > low.incrementalWhitelistingDeals);
    assert.ok(high.incrementalContribution > low.incrementalContribution);
  });

  it('tc_uwar_04_higher_fulfillment_cost_reduces_net_contribution', () => {
    const lowCost = calculateUgcWhitelistingAttachRateROI({
      ...DEFAULT_INPUT,
      rightsFulfillmentCostPerDeal: 70,
      creativeRefreshCostPerDeal: 40,
    });
    const highCost = calculateUgcWhitelistingAttachRateROI({
      ...DEFAULT_INPUT,
      rightsFulfillmentCostPerDeal: 260,
      creativeRefreshCostPerDeal: 180,
    });

    assert.ok(highCost.netContributionPerDeal < lowCost.netContributionPerDeal);
    assert.ok(highCost.netMonthlyBenefit < lowCost.netMonthlyBenefit);
  });

  it('tc_uwar_05_higher_enablement_cost_reduces_net_monthly_benefit', () => {
    const lowFixed = calculateUgcWhitelistingAttachRateROI({ ...DEFAULT_INPUT, monthlyEnablementCost: 900 });
    const highFixed = calculateUgcWhitelistingAttachRateROI({ ...DEFAULT_INPUT, monthlyEnablementCost: 5800 });

    assert.ok(highFixed.netMonthlyBenefit < lowFixed.netMonthlyBenefit);
  });

  it('tc_uwar_06_break_even_non_finite_when_unit_contribution_non_positive', () => {
    const result = calculateUgcWhitelistingAttachRateROI({
      ...DEFAULT_INPUT,
      rightsFeePerDeal: 150,
      platformFeePct: 25,
      rightsFulfillmentCostPerDeal: 180,
      creativeRefreshCostPerDeal: 120,
      incrementalGrossProfitLiftPerDeal: 40,
    });

    assert.equal(Number.isFinite(result.breakEvenTargetAttachRatePct), false);
  });

  it('tc_uwar_07_summary_contains_key_fields', () => {
    const result = calculateUgcWhitelistingAttachRateROI(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /UGC Whitelisting Attach Rate ROI Snapshot/);
    assert.match(summary, /Net Monthly Benefit/);
    assert.match(summary, /Break-even Target Attach Rate/);
    assert.match(summary, /Status:/);
  });
});
