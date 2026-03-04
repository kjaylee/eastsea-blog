import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRetainerPlan,
  buildSummary,
} from '../../tools/ai-retainer-profit-planner/logic.mjs';

describe('ai retainer profit planner logic', () => {
  it('tc_l_01_validation_rejects_invalid_margin', () => {
    const validation = validateInputs({ ...DEFAULT_INPUT, targetMarginPct: 95 });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetMarginPct/);
  });

  it('tc_l_02_higher_margin_target_increases_growth_tier_price', () => {
    const lowMargin = calculateRetainerPlan({ ...DEFAULT_INPUT, targetMarginPct: 35 });
    const highMargin = calculateRetainerPlan({ ...DEFAULT_INPUT, targetMarginPct: 60 });

    assert.ok(highMargin.tiers[1].suggestedPrice > lowMargin.tiers[1].suggestedPrice);
  });

  it('tc_l_03_higher_close_rate_increases_new_clients', () => {
    const conservative = calculateRetainerPlan({ ...DEFAULT_INPUT, closeRatePct: 14 });
    const aggressive = calculateRetainerPlan({ ...DEFAULT_INPUT, closeRatePct: 36 });

    assert.ok(aggressive.newClients > conservative.newClients);
    assert.ok(aggressive.grossMonthlyRevenue > conservative.grossMonthlyRevenue);
  });

  it('tc_l_04_higher_churn_reduces_net_revenue', () => {
    const lowChurn = calculateRetainerPlan({ ...DEFAULT_INPUT, churnRatePct: 3 });
    const highChurn = calculateRetainerPlan({ ...DEFAULT_INPUT, churnRatePct: 25 });

    assert.ok(highChurn.netRevenueAfterChurn < lowChurn.netRevenueAfterChurn);
  });

  it('tc_l_05_break_even_clients_finite_for_default_case', () => {
    const result = calculateRetainerPlan(DEFAULT_INPUT);

    assert.ok(Number.isFinite(result.breakEvenClients));
    assert.ok(result.breakEvenClients > 0);
  });

  it('tc_l_06_summary_contains_tier_stack', () => {
    const result = calculateRetainerPlan(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /AI Retainer Profit Plan/);
    assert.match(summary, /Starter Retainer/);
    assert.match(summary, /Growth Retainer/);
    assert.match(summary, /Scale Retainer/);
  });
});
