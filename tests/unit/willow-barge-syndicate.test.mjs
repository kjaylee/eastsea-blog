import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  startRun,
  moveLane,
  toggleMode,
  withInjectedTokens,
  stepRun,
  settleRun,
  mergeBestPair,
  chooseRoute,
  getEconomySnapshot,
} from '../../games/willow-barge-syndicate/logic.mjs';

describe('willow-barge-syndicate logic', () => {
  it('tc_wbs_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.route, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_wbs_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.equal(s.mode, 1);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_wbs_03_lane_movement_clamps_bounds', () => {
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

  it('tc_wbs_04_toggle_mode_switches_sun_shadow', () => {
    let s = startRun(createInitialState());
    assert.equal(s.mode, 1);

    s = toggleMode(s);
    assert.equal(s.mode, -1);

    s = toggleMode(s);
    assert.equal(s.mode, 1);
  });

  it('tc_wbs_05_matching_crate_collects_value_and_pattern_log', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'crate', tier: 3, mode: 1 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runValue, 39);
    assert.equal(s.runCargo[3], 1);
    assert.equal(s.runCollectCount, 1);
    assert.deepEqual(s.runPatternLog, [{ lane: 1, mode: 1 }]);
  });

  it('tc_wbs_06_mismatch_or_debris_causes_damage', () => {
    let mismatch = startRun(createInitialState());
    mismatch = withInjectedTokens(mismatch, [{ lane: mismatch.lane, y: 0.88, kind: 'crate', tier: 2, mode: -1 }]);
    mismatch = stepRun(mismatch, 10, () => 0.9);

    assert.equal(mismatch.hull, 2);
    assert.equal(mismatch.runCargo[2], 0);

    let debris = startRun(createInitialState());
    debris = withInjectedTokens(debris, [{ lane: debris.lane, y: 0.88, kind: 'debris', tier: 0, mode: 0 }]);
    debris = stepRun(debris, 10, () => 0.9);
    assert.equal(debris.hull, 2);
  });

  it('tc_wbs_07_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_wbs_08_route_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 120 });
    premium = chooseRoute(premium, 'trader');
    assert.equal(premium.route, 'trader');
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

  it('tc_wbs_09_canal_relay_bonus_and_silt_lock_penalty_applied', () => {
    let bonus = startRun(createInitialState());
    bonus.runValue = 300;
    bonus.runCollectCount = 4;
    bonus.runPatternLog = [
      { lane: 0, mode: 1 },
      { lane: 1, mode: -1 },
      { lane: 2, mode: 1 },
    ];
    const bonusSettled = settleRun(bonus, false);

    let penalty = startRun(createInitialState());
    penalty.runValue = 300;
    penalty.runCollectCount = 4;
    penalty.runPatternLog = [
      { lane: 1, mode: 1 },
      { lane: 1, mode: -1 },
      { lane: 1, mode: 1 },
    ];
    const penaltySettled = settleRun(penalty, false);

    assert.equal(bonusSettled.lastBreakdown.relay, true);
    assert.equal(bonusSettled.lastBreakdown.silt, false);
    assert.equal(bonusSettled.lastBreakdown.patternMultiplier, 1.34);

    assert.equal(penaltySettled.lastBreakdown.relay, false);
    assert.equal(penaltySettled.lastBreakdown.silt, true);
    assert.equal(penaltySettled.lastBreakdown.patternMultiplier, 0.72);
  });
});
