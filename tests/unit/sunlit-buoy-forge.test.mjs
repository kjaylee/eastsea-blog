import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  startRun,
  moveLane,
  withInjectedTokens,
  stepRun,
  settleRun,
  mergeBestPair,
  chooseCharter,
  getEconomySnapshot,
} from '../../games/sunlit-buoy-forge/logic.mjs';

describe('sunlit-buoy-forge logic', () => {
  it('tc_sbf_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.charter, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_sbf_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
    assert.equal(s.wakeEchoCharges, 0);
  });

  it('tc_sbf_03_lane_movement_clamps_and_wake_echo_charge', () => {
    let s = startRun(createInitialState());

    s = moveLane(s, -1);
    s = moveLane(s, -1);
    s = moveLane(s, -1);
    assert.equal(s.lane, 0);

    s = moveLane(s, 1);
    s = moveLane(s, -1);
    s = moveLane(s, 1);
    s = moveLane(s, -1);

    assert.equal(s.wakeEchoCharges, 1);
  });

  it('tc_sbf_04_wake_echo_doubles_next_core_pickup', () => {
    let s = startRun(createInitialState());
    s = moveLane(s, 1);
    s = moveLane(s, -1);
    s = moveLane(s, 1);
    s = moveLane(s, -1);

    assert.equal(s.wakeEchoCharges, 1);

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'core', tier: 2 }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runCargo[2], 2);
    assert.equal(s.runValue, 48);
    assert.equal(s.wakeEchoCharges, 0);
  });

  it('tc_sbf_05_three_reef_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.charter, 'local');
  });

  it('tc_sbf_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_sbf_07_charter_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 100 });
    premium = chooseCharter(premium, 'coast');
    assert.equal(premium.coins, 30);
    assert.equal(premium.charter, 'coast');

    premium = startRun(premium);
    premium.runValue = 220;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 220;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.charter, 'local');
  });

  it('tc_sbf_08_wake_bonus_and_drag_tax_applied', () => {
    let wake = startRun(createInitialState());
    wake.wakeEchoConsumed = 1;
    wake.runValue = 300;
    wake.runHarvestCount = 4;
    wake.runLaneCollectHistory = [0, 1, 2, 3];
    const wakeSettled = settleRun(wake, false);

    let drag = startRun(createInitialState());
    drag.runValue = 300;
    drag.runHarvestCount = 4;
    drag.runLaneCollectHistory = [2, 2, 2, 1];
    const dragSettled = settleRun(drag, false);

    assert.equal(wakeSettled.lastBreakdown.wakeEcho, true);
    assert.equal(wakeSettled.lastBreakdown.dragTax, false);
    assert.equal(wakeSettled.lastBreakdown.chainMultiplier, 1.26);

    assert.equal(dragSettled.lastBreakdown.wakeEcho, false);
    assert.equal(dragSettled.lastBreakdown.dragTax, true);
    assert.equal(dragSettled.lastBreakdown.chainMultiplier, 0.82);
  });
});
