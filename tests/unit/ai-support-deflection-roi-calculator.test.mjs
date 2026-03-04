import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateSupportDeflectionROI,
  buildSummary,
} from '../../tools/ai-support-deflection-roi-calculator/logic.mjs';

describe('ai support deflection roi calculator logic', () => {
  it('tc_s_01_validation_rejects_target_below_current', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      currentDeflectionPct: 35,
      targetDeflectionPct: 20,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /targetDeflectionPct/);
  });

  it('tc_s_02_validation_rejects_non_finite_input', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      monthlyTickets: Number.NaN,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /monthlyTickets/);
  });

  it('tc_s_03_higher_target_deflection_increases_incremental_tickets', () => {
    const low = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, targetDeflectionPct: 24 });
    const high = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, targetDeflectionPct: 45 });

    assert.ok(high.incrementalDeflectedTickets > low.incrementalDeflectedTickets);
    assert.ok(high.laborHoursSaved > low.laborHoursSaved);
  });

  it('tc_s_04_more_tickets_increase_labor_savings', () => {
    const low = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, monthlyTickets: 12000 });
    const high = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, monthlyTickets: 42000 });

    assert.ok(high.grossLaborSavings > low.grossLaborSavings);
  });

  it('tc_s_05_higher_ai_cost_reduces_net_benefit', () => {
    const lowCost = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, aiCostPerDeflectedTicket: 0.05 });
    const highCost = calculateSupportDeflectionROI({ ...DEFAULT_INPUT, aiCostPerDeflectedTicket: 1.3 });

    assert.ok(highCost.totalProgramCost > lowCost.totalProgramCost);
    assert.ok(highCost.netMonthlyBenefit < lowCost.netMonthlyBenefit);
  });

  it('tc_s_06_break_even_is_non_finite_when_ai_cost_exceeds_labor_value', () => {
    const result = calculateSupportDeflectionROI({
      ...DEFAULT_INPUT,
      aiCostPerDeflectedTicket: 15,
      agentHourlyCost: 20,
      avgHandleMinutes: 6,
    });

    assert.equal(Number.isFinite(result.breakEvenTargetDeflectionPct), false);
  });

  it('tc_s_07_summary_contains_board_ready_fields', () => {
    const result = calculateSupportDeflectionROI(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');

    assert.match(summary, /AI Support Deflection ROI Snapshot/);
    assert.match(summary, /Net Monthly Benefit/);
    assert.match(summary, /Payback/);
    assert.match(summary, /Status:/);
  });
});
