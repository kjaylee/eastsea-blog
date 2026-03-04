import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateApiCreditPackBreakageROI,
  buildSummary,
} from '../../tools/api-credit-pack-breakage-roi-calculator/logic.mjs';

describe('api credit pack breakage roi calculator logic', () => {
  it('tc_acpb_01_validation_rejects_target_below_current', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      currentAdoptionPct: 19,
      targetAdoptionPct: 14,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetAdoptionPct/);
  });

  it('tc_acpb_02_validation_rejects_non_finite_input', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      monthlyActiveCustomers: Number.NaN,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /monthlyActiveCustomers/);
  });

  it('tc_acpb_03_higher_target_adoption_increases_incremental_buyers', () => {
    const low = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, targetAdoptionPct: 11 });
    const high = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, targetAdoptionPct: 22 });

    assert.ok(high.incrementalBuyers > low.incrementalBuyers);
    assert.ok(high.incrementalContribution > low.incrementalContribution);
  });

  it('tc_acpb_04_higher_breakage_improves_net_contribution_per_buyer', () => {
    const low = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, breakagePct: 2 });
    const high = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, breakagePct: 28 });

    assert.ok(high.netContributionPerBuyer > low.netContributionPerBuyer);
    assert.ok(high.netMonthlyBenefit > low.netMonthlyBenefit);
  });

  it('tc_acpb_05_higher_program_cost_reduces_net_monthly_benefit', () => {
    const lowFixed = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, monthlyProgramCost: 7000 });
    const highFixed = calculateApiCreditPackBreakageROI({ ...DEFAULT_INPUT, monthlyProgramCost: 23000 });

    assert.ok(highFixed.netMonthlyBenefit < lowFixed.netMonthlyBenefit);
  });

  it('tc_acpb_06_break_even_non_finite_when_unit_contribution_is_negative', () => {
    const result = calculateApiCreditPackBreakageROI({
      ...DEFAULT_INPUT,
      pricePerCredit: 0.0002,
      deliveryCostPerCredit: 0.0003,
      breakagePct: 0,
      expiryLiabilityReservePct: 20,
      supportCostPerBuyer: 90,
    });

    assert.equal(Number.isFinite(result.breakEvenTargetAdoptionPct), false);
  });

  it('tc_acpb_07_summary_contains_key_fields', () => {
    const result = calculateApiCreditPackBreakageROI(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /API Credit Pack Breakage ROI Snapshot/);
    assert.match(summary, /Net Monthly Benefit/);
    assert.match(summary, /Break-even Target Adoption/);
    assert.match(summary, /Status:/);
  });
});
