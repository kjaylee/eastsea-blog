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
} from '../../games/orchard-signal-caravan/logic.mjs';

describe('orchard-signal-caravan logic', () => {
  it('tc_osc_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'village');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_osc_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
    assert.equal(s.runTierHistory.length, 0);
  });

  it('tc_osc_03_lane_movement_clamps_bounds', () => {
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

  it('tc_osc_04_collecting_crate_updates_run_value_and_history', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [{ lane: 1, y: 0.87, kind: 'crate', tier: 3 }]);
    s = stepRun(s, 30, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.ok(s.runValue >= 39);
    assert.equal(s.runCargo[3], 1);
    assert.deepEqual(s.runTierHistory, [3]);
  });

  it('tc_osc_05_three_wolf_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'wolf', tier: 0 },
      { lane: 1, y: 0.88, kind: 'wolf', tier: 0 },
      { lane: 1, y: 0.88, kind: 'wolf', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'village');
  });

  it('tc_osc_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_osc_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 100 });
    premium = chooseContract(premium, 'guild');
    assert.equal(premium.coins, 40);
    assert.equal(premium.contract, 'guild');

    premium = startRun(premium);
    premium.runValue = 220;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 220;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.contract, 'village');
  });

  it('tc_osc_08_signal_chain_bonus_and_monotony_penalty_applied', () => {
    let chain = startRun(createInitialState());
    chain.runValue = 240;
    chain.runHarvestCount = 3;
    chain.runTierHistory = [1, 2, 3];
    const chainSettled = settleRun(chain, false);

    let monotony = startRun(createInitialState());
    monotony.runValue = 240;
    monotony.runHarvestCount = 3;
    monotony.runTierHistory = [2, 2, 2];
    const monotonySettled = settleRun(monotony, false);

    let neutral = startRun(createInitialState());
    neutral.runValue = 240;
    neutral.runHarvestCount = 3;
    neutral.runTierHistory = [1, 3, 2];
    const neutralSettled = settleRun(neutral, false);

    assert.ok(chainSettled.lastPayout > neutralSettled.lastPayout);
    assert.ok(monotonySettled.lastPayout < neutralSettled.lastPayout);
    assert.equal(chainSettled.lastBreakdown.signalChain, true);
    assert.equal(monotonySettled.lastBreakdown.monotonyPenalty, true);
  });
});
