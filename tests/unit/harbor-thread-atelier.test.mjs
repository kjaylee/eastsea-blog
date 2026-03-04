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
} from '../../games/harbor-thread-atelier/logic.mjs';

describe('harbor-thread-atelier logic', () => {
  it('tc_hta_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'local');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_hta_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
    assert.equal(s.runTierHistory.length, 0);
  });

  it('tc_hta_03_lane_movement_clamps_bounds', () => {
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

  it('tc_hta_04_collecting_spool_updates_run_value_and_history', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [{ lane: 1, y: 0.87, kind: 'spool', tier: 3 }]);
    s = stepRun(s, 30, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.ok(s.runValue >= 42);
    assert.equal(s.runCargo[3], 1);
    assert.deepEqual(s.runTierHistory, [3]);
  });

  it('tc_hta_05_three_reef_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
      { lane: 1, y: 0.88, kind: 'reef', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'local');
  });

  it('tc_hta_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_hta_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 100 });
    premium = chooseContract(premium, 'boutique');
    assert.equal(premium.coins, 30);
    assert.equal(premium.contract, 'boutique');

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

  it('tc_hta_08_cross_stitch_bonus_and_monotone_penalty_applied', () => {
    let dividend = startRun(createInitialState());
    dividend.runValue = 250;
    dividend.runHarvestCount = 4;
    dividend.runTierHistory = [1, 2, 1, 2];
    const dividendSettled = settleRun(dividend, false);

    let monotone = startRun(createInitialState());
    monotone.runValue = 250;
    monotone.runHarvestCount = 3;
    monotone.runTierHistory = [2, 2, 2];
    const monotoneSettled = settleRun(monotone, false);

    let neutral = startRun(createInitialState());
    neutral.runValue = 250;
    neutral.runHarvestCount = 4;
    neutral.runTierHistory = [1, 2, 3, 3];
    const neutralSettled = settleRun(neutral, false);

    assert.ok(dividendSettled.lastPayout > neutralSettled.lastPayout);
    assert.ok(monotoneSettled.lastPayout < neutralSettled.lastPayout);
    assert.equal(dividendSettled.lastBreakdown.crossStitch, true);
    assert.equal(monotoneSettled.lastBreakdown.monotoneBolt, true);
  });
});
