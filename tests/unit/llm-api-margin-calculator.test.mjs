import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateLlmMargin,
  buildSummary,
} from '../../tools/llm-api-margin-calculator/logic.mjs';

describe('llm api margin calculator logic', () => {
  it('tc_l_01_validation_rejects_out_of_range_percentage', () => {
    const bad = { ...DEFAULT_INPUT, cacheHitRatePct: 97 };
    const validation = validateInputs(bad);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /cacheHitRatePct/);
  });

  it('tc_l_02_higher_price_increases_operating_profit', () => {
    const base = calculateLlmMargin({ ...DEFAULT_INPUT, subscriptionPricePerUser: 29 });
    const higher = calculateLlmMargin({ ...DEFAULT_INPUT, subscriptionPricePerUser: 39 });
    assert.ok(higher.operatingProfit > base.operatingProfit);
  });

  it('tc_l_03_higher_cache_hit_reduces_input_token_cost', () => {
    const lowCache = calculateLlmMargin({ ...DEFAULT_INPUT, cacheHitRatePct: 5 });
    const highCache = calculateLlmMargin({ ...DEFAULT_INPUT, cacheHitRatePct: 60 });
    assert.ok(highCache.inputTokenCost < lowCache.inputTokenCost);
  });

  it('tc_l_04_zero_payment_fee_makes_net_equal_gross', () => {
    const result = calculateLlmMargin({ ...DEFAULT_INPUT, paymentFeePct: 0 });
    assert.equal(result.netRevenueAfterFees, result.grossRevenue);
  });

  it('tc_l_05_break_even_price_positive_for_valid_scenario', () => {
    const result = calculateLlmMargin(DEFAULT_INPUT);
    assert.ok(result.breakEvenPricePerUser > 0);
    assert.ok(Number.isFinite(result.breakEvenPricePerUser));
  });

  it('tc_l_06_summary_contains_key_fields', () => {
    const result = calculateLlmMargin(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US', 'USD');
    assert.match(summary, /Gross Revenue:/);
    assert.match(summary, /Operating Profit:/);
    assert.match(summary, /Break-even Price per User:/);
  });
});
