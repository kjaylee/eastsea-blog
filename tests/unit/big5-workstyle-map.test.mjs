import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DOMINANT_TIE_ORDER,
  QUESTIONS,
  createNeutralResponses,
  validateResponses,
  calculateWorkstyleMap,
  buildSummary,
} from '../../tools/big5-workstyle-map/logic.mjs';

describe('big5 workstyle map logic', () => {
  it('tc_l_01_validate_rejects_wrong_length', () => {
    const validation = validateResponses([1, 2, 3]);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /must contain/);
  });

  it('tc_l_02_validate_rejects_non_integer_response', () => {
    const responses = createNeutralResponses();
    responses[4] = 2.5;
    const validation = validateResponses(responses);
    assert.equal(validation.valid, false);
    assert.match(validation.message, /integer/);
  });

  it('tc_l_03_tie_uses_dominant_priority_order', () => {
    const responses = createNeutralResponses();
    const result = calculateWorkstyleMap(responses);
    assert.equal(result.dominantTrait, DOMINANT_TIE_ORDER[0]);
    assert.equal(result.secondaryTrait, DOMINANT_TIE_ORDER[1]);
  });

  it('tc_l_04_reverse_scoring_changes_trait_direction', () => {
    const indexOfQ06 = QUESTIONS.findIndex((question) => question.id === 'q06');
    const highOpenness = createNeutralResponses();
    const lowOpenness = createNeutralResponses();

    highOpenness[indexOfQ06] = 1;
    lowOpenness[indexOfQ06] = 5;

    const highResult = calculateWorkstyleMap(highOpenness);
    const lowResult = calculateWorkstyleMap(lowOpenness);

    assert.ok(highResult.traits.raw.O > lowResult.traits.raw.O);
  });

  it('tc_l_05_high_conscientious_profile_maps_precision_architect', () => {
    const responses = createNeutralResponses();
    const indexMap = Object.fromEntries(QUESTIONS.map((question, index) => [question.id, index]));

    responses[indexMap.q02] = 5;
    responses[indexMap.q07] = 1;
    responses[indexMap.q12] = 5;

    const result = calculateWorkstyleMap(responses);

    assert.equal(result.dominantTrait, 'C');
    assert.equal(result.archetype.key, 'precision-architect');
    assert.ok(result.indices.overallScore >= 0);
    assert.ok(result.indices.overallScore <= 100);
  });

  it('tc_l_06_summary_contains_archetype_and_offer', () => {
    const result = calculateWorkstyleMap(createNeutralResponses());
    const summary = buildSummary(result, 'en-US');
    assert.match(summary, /Big5 Workstyle Map Result:/);
    assert.match(summary, /Premium offer:/);
    assert.match(summary, /Overall/);
  });
});

