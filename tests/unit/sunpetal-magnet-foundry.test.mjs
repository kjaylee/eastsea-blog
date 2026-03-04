import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  startRun,
  moveLane,
  togglePolarity,
  withInjectedTokens,
  stepRun,
  settleRun,
  mergeBestPair,
  chooseRoute,
  getEconomySnapshot,
} from '../../games/sunpetal-magnet-foundry/logic.mjs';

describe('sunpetal-magnet-foundry logic', () => {
  it('tc_smf_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.route, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_smf_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.equal(s.polarity, 1);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_smf_03_lane_movement_clamps_bounds', () => {
    let s = startRun(createInitialState());

    s = moveLane(s, -1);
    s = moveLane(s, -1);
    s = moveLane(s, -1);
    assert.equal(s.lane, 0);

    s = moveLane(s, 1);
    s = moveLane(s, 1);
    s = moveLane(s, 1);
    assert.equal(s.lane, 2);
  });

  it('tc_smf_04_toggle_polarity_switches_n_and_s', () => {
    let s = startRun(createInitialState());
    assert.equal(s.polarity, 1);

    s = togglePolarity(s);
    assert.equal(s.polarity, -1);

    s = togglePolarity(s);
    assert.equal(s.polarity, 1);
  });

  it('tc_smf_05_matching_core_collects_value_and_history', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'core', tier: 3, polarity: 1 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runValue, 39);
    assert.equal(s.runCargo[3], 1);
    assert.equal(s.runCollectCount, 1);
    assert.deepEqual(s.runPolarityHistory, [1]);
  });

  it('tc_smf_06_mismatch_core_causes_shock_damage', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'core', tier: 2, polarity: -1 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.hull, 2);
    assert.equal(s.runCargo[2], 0);
    assert.equal(s.runValue, 0);
  });

  it('tc_smf_07_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 3, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 3);
  });

  it('tc_smf_08_route_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 120 });
    premium = chooseRoute(premium, 'bazaar');
    assert.equal(premium.route, 'bazaar');
    assert.equal(premium.coins, 40);

    premium = startRun(premium);
    premium.runValue = 220;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 220;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.route, 'local');
  });

  it('tc_smf_09_prism_flip_dividend_and_static_drag_applied', () => {
    let bonus = startRun(createInitialState());
    bonus.runValue = 300;
    bonus.runCollectCount = 4;
    bonus.runPolarityHistory = [1, -1, 1, -1];
    const bonusSettled = settleRun(bonus, false);

    let penalty = startRun(createInitialState());
    penalty.runValue = 300;
    penalty.runCollectCount = 4;
    penalty.runPolarityHistory = [1, 1, 1, -1];
    const penaltySettled = settleRun(penalty, false);

    assert.equal(bonusSettled.lastBreakdown.prismFlip, true);
    assert.equal(bonusSettled.lastBreakdown.staticDrag, false);
    assert.equal(bonusSettled.lastBreakdown.patternMultiplier, 1.29);

    assert.equal(penaltySettled.lastBreakdown.prismFlip, false);
    assert.equal(penaltySettled.lastBreakdown.staticDrag, true);
    assert.equal(penaltySettled.lastBreakdown.patternMultiplier, 0.78);
  });
});
