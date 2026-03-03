import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculatePackageQuote,
  buildSummary,
} from '../../tools/ugc-creator-package-pricing-calculator/logic.mjs';

describe('ugc creator package pricing calculator logic', () => {
  it('tc_l_01_validate_rejects_negative_values', () => {
    const bad = { ...DEFAULT_INPUT, benchmarkCpm: -1 };
    const validation = validateInputs(bad);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /benchmarkCpm/);
  });

  it('tc_l_02_quote_and_takehome_are_positive', () => {
    const result = calculatePackageQuote(DEFAULT_INPUT);
    assert.ok(result.quoteToBrand > 0);
    assert.ok(result.creatorTakeHome > 0);
    assert.ok(result.quoteToBrand >= result.creatorTakeHome);
  });

  it('tc_l_03_zero_agency_fee_makes_quote_equal_takehome', () => {
    const result = calculatePackageQuote({ ...DEFAULT_INPUT, agencyFeePct: 0 });
    assert.equal(result.quoteToBrand, result.creatorTakeHome);
  });

  it('tc_l_04_higher_margin_increases_quote', () => {
    const baseScenario = {
      ...DEFAULT_INPUT,
      benchmarkCpm: 1000,
      productionCostPerVideo: 500000,
      packageVideos: 4,
    };
    const lowMargin = calculatePackageQuote({ ...baseScenario, targetMarginPct: 10 });
    const highMargin = calculatePackageQuote({ ...baseScenario, targetMarginPct: 45 });
    assert.ok(highMargin.quoteToBrand > lowMargin.quoteToBrand);
  });

  it('tc_l_05_summary_contains_key_outputs', () => {
    const result = calculatePackageQuote(DEFAULT_INPUT);
    const summary = buildSummary(result, 'en-US');
    assert.match(summary, /Recommended Quote to Brand:/);
    assert.match(summary, /Creator Take-home:/);
    assert.match(summary, /Projected Brand ROI/);
  });

  it('tc_l_06_status_is_one_of_allowed_values', () => {
    const result = calculatePackageQuote(DEFAULT_INPUT);
    assert.ok(['strong', 'balanced', 'risky'].includes(result.status));
  });
});
