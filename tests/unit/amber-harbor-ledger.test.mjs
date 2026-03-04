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
} from '../../games/amber-harbor-ledger/logic.mjs';

describe('amber-harbor-ledger logic', () => {
  it('tc_ahl_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.route, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_ahl_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.equal(s.mode, 1);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_ahl_03_lane_movement_clamps_bounds', () => {
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

  it('tc_ahl_04_toggle_mode_switches_breeze_anchor', () => {
    let s = startRun(createInitialState());
    assert.equal(s.mode, 1);

    s = toggleMode(s);
    assert.equal(s.mode, -1);

    s = toggleMode(s);
    assert.equal(s.mode, 1);
  });

  it('tc_ahl_05_matching_parcel_collects_value_and_lane_history', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'parcel', tier: 3, mode: 1 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runValue, 36);
    assert.equal(s.runCargo[3], 1);
    assert.equal(s.runCollectCount, 1);
    assert.deepEqual(s.runLaneHistory, [1]);
  });

  it('tc_ahl_06_mismatch_parcel_causes_damage', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'parcel', tier: 2, mode: -1 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.hull, 2);
    assert.equal(s.runCargo[2], 0);
    assert.equal(s.runValue, 0);
  });

  it('tc_ahl_07_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 3, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 3);
  });

  it('tc_ahl_08_route_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 100 });
    premium = chooseRoute(premium, 'fleet');
    assert.equal(premium.route, 'fleet');
    assert.equal(premium.coins, 30);

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

  it('tc_ahl_09_wake_weave_dividend_and_congestion_toll_applied', () => {
    let bonus = startRun(createInitialState());
    bonus.runValue = 300;
    bonus.runCollectCount = 4;
    bonus.runLaneHistory = [0, 1, 2];
    const bonusSettled = settleRun(bonus, false);

    let penalty = startRun(createInitialState());
    penalty.runValue = 300;
    penalty.runCollectCount = 4;
    penalty.runLaneHistory = [1, 1, 1];
    const penaltySettled = settleRun(penalty, false);

    assert.equal(bonusSettled.lastBreakdown.wakeWeave, true);
    assert.equal(bonusSettled.lastBreakdown.congestion, false);
    assert.equal(bonusSettled.lastBreakdown.patternMultiplier, 1.27);

    assert.equal(penaltySettled.lastBreakdown.wakeWeave, false);
    assert.equal(penaltySettled.lastBreakdown.congestion, true);
    assert.equal(penaltySettled.lastBreakdown.patternMultiplier, 0.74);
  });
});
