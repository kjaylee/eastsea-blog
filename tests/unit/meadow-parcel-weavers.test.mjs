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
  chooseContract,
  getEconomySnapshot,
} from '../../games/meadow-parcel-weavers/logic.mjs';

describe('meadow-parcel-weavers logic', () => {
  it('tc_mpw_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_mpw_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
    assert.equal(s.runTierHistory.length, 0);
    assert.equal(s.runLaneHistory.length, 0);
  });

  it('tc_mpw_03_lane_movement_clamps_bounds', () => {
    let s = startRun(createInitialState());
    s = moveLane(s, -1);
    s = moveLane(s, -1);
    s = moveLane(s, -1);
    assert.equal(s.lane, 0);

    s = moveLane(s, 1);
    s = moveLane(s, 1);
    s = moveLane(s, 1);
    s = moveLane(s, 1);
    assert.equal(s.lane, 2);
  });

  it('tc_mpw_04_collecting_parcel_updates_value_and_lane_history', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [{ lane: 1, y: 0.87, kind: 'parcel', tier: 3 }]);
    s = stepRun(s, 30, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.ok(s.runValue >= 42);
    assert.equal(s.runCargo[3], 1);
    assert.deepEqual(s.runTierHistory, [3]);
    assert.deepEqual(s.runLaneHistory, [1]);
  });

  it('tc_mpw_05_three_puddle_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'puddle', tier: 0 },
      { lane: 1, y: 0.88, kind: 'puddle', tier: 0 },
      { lane: 1, y: 0.88, kind: 'puddle', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'local');
  });

  it('tc_mpw_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_mpw_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 100 });
    premium = chooseContract(premium, 'market');
    assert.equal(premium.coins, 30);
    assert.equal(premium.contract, 'market');

    premium = startRun(premium);
    premium.runValue = 220;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 220;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.contract, 'local');
  });

  it('tc_mpw_08_ribbon_arc_bonus_and_route_rut_penalty_applied', () => {
    let dividend = startRun(createInitialState());
    dividend.runValue = 250;
    dividend.runHarvestCount = 4;
    dividend.runLaneHistory = [0, 1, 2, 2];
    const dividendSettled = settleRun(dividend, false);

    let rut = startRun(createInitialState());
    rut.runValue = 250;
    rut.runHarvestCount = 3;
    rut.runLaneHistory = [1, 1, 1];
    const rutSettled = settleRun(rut, false);

    let neutral = startRun(createInitialState());
    neutral.runValue = 250;
    neutral.runHarvestCount = 3;
    neutral.runLaneHistory = [0, 1, 1];
    const neutralSettled = settleRun(neutral, false);

    assert.ok(dividendSettled.lastPayout > neutralSettled.lastPayout);
    assert.ok(rutSettled.lastPayout < neutralSettled.lastPayout);
    assert.equal(dividendSettled.lastBreakdown.ribbonArc, true);
    assert.equal(rutSettled.lastBreakdown.routeRut, true);
  });
});
