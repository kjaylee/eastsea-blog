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
} from '../../games/harvest-lane-broker/logic.mjs';

describe('harvest-lane-broker logic', () => {
  it('tc_hlb_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'street');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_hlb_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_hlb_03_lane_movement_clamps_bounds', () => {
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

  it('tc_hlb_04_collecting_crate_updates_run_value_and_cargo', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [{ lane: 1, y: 0.87, kind: 'crate', tier: 3 }]);
    s = stepRun(s, 30, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.ok(s.runValue >= 42);
    assert.equal(s.runCargo[3], 1);

    const settled = settleRun(s, false);
    assert.equal(settled.phase, 'dock');
    assert.equal(settled.inventory[3], 1);
    assert.ok(settled.coins > 0);
  });

  it('tc_hlb_05_three_crow_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'street');
  });

  it('tc_hlb_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_hlb_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 70 });
    premium = chooseContract(premium, 'brunch');
    assert.equal(premium.coins, 20);
    assert.equal(premium.contract, 'brunch');

    premium = startRun(premium);
    premium.runValue = 200;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 200;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.contract, 'street');
  });

  it('tc_hlb_08_variety_dividend_and_oversupply_penalty_applied', () => {
    let diverse = startRun(createInitialState());
    diverse.runValue = 240;
    diverse.runHarvestCount = 3;
    diverse.runCargo = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 };
    const diverseSettled = settleRun(diverse, false);

    let oversupply = startRun(createInitialState());
    oversupply.runValue = 240;
    oversupply.runHarvestCount = 5;
    oversupply.runCargo = { 1: 5, 2: 0, 3: 0, 4: 0, 5: 0 };
    const oversupplySettled = settleRun(oversupply, false);

    assert.equal(diverseSettled.lastBreakdown.diverse, true);
    assert.equal(diverseSettled.lastBreakdown.oversupply, false);
    assert.equal(diverseSettled.lastBreakdown.diversityMultiplier, 1.22);

    assert.equal(oversupplySettled.lastBreakdown.diverse, false);
    assert.equal(oversupplySettled.lastBreakdown.oversupply, true);
    assert.equal(oversupplySettled.lastBreakdown.diversityMultiplier, 0.78);
  });
});
