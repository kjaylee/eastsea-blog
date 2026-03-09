import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateAmazonFbaProfit,
  buildSummary,
} from '../../tools/amazon-fba-profit-calculator/logic.mjs';

describe('amazon fba profit calculator logic', () => {
  it('tc_l_01_validation_rejects_impossible_fee_stack', () => {
    const bad = { ...DEFAULT_INPUT, referralFeePct: 50, acosPct: 50 };
    const validation = validateInputs(bad);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /below 100/);
  });

  it('tc_l_02_higher_price_increases_monthly_profit', () => {
    const base = calculateAmazonFbaProfit({ ...DEFAULT_INPUT, salePricePerUnit: 32.99 });
    const higher = calculateAmazonFbaProfit({ ...DEFAULT_INPUT, salePricePerUnit: 38.99 });
    assert.ok(higher.monthlyNetProfit > base.monthlyNetProfit);
  });

  it('tc_l_03_higher_acos_reduces_monthly_profit', () => {
    const lowAcos = calculateAmazonFbaProfit({ ...DEFAULT_INPUT, acosPct: 8 });
    const highAcos = calculateAmazonFbaProfit({ ...DEFAULT_INPUT, acosPct: 22 });
    assert.ok(highAcos.monthlyNetProfit < lowAcos.monthlyNetProfit);
    assert.ok(lowAcos.breakEvenAcosPct > 0);
  });

  it('tc_l_04_zero_launch_cost_makes_payback_zero_when_profit_positive', () => {
    const result = calculateAmazonFbaProfit({ ...DEFAULT_INPUT, launchCost: 0, salePricePerUnit: 38.99, acosPct: 10 });
    assert.ok(result.monthlyNetProfit > 0);
    assert.equal(result.paybackMonths, 0);
  });

  it('tc_l_05_summary_contains_key_outputs', () => {
    const result = calculateAmazonFbaProfit(DEFAULT_INPUT);
    const summary = buildSummary(result, 'ko-KR', 'USD');
    assert.match(summary, /월 순이익/);
    assert.match(summary, /손익분기 ACoS/);
    assert.match(summary, /목표 순마진 달성 판매가/);
  });
});
