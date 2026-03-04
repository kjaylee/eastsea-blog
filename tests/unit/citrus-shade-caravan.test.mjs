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
} from '../../games/citrus-shade-caravan/logic.mjs';

describe('citrus-shade-caravan logic', () => {
  it('tc_csc_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'stall');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_csc_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
    assert.equal(s.shadeSwapCharge, 0);
  });

  it('tc_csc_03_lane_movement_clamps_bounds', () => {
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

  it('tc_csc_04_alternating_tones_charge_and_double_next_pickup', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [
      { lane: s.lane, y: 0.88, kind: 'crate', tier: 1, tone: 'sun' },
      { lane: s.lane, y: 0.88, kind: 'crate', tier: 1, tone: 'shade' },
      { lane: s.lane, y: 0.88, kind: 'crate', tier: 1, tone: 'sun' },
      { lane: s.lane, y: 0.88, kind: 'crate', tier: 1, tone: 'shade' },
    ]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.shadeSwapCharge, 1);

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'crate', tier: 2, tone: 'sun' }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runCargo[2], 2);
    assert.equal(s.shadeSwapCharge, 0);
    assert.equal(s.shadeSwapConsumed, 1);
  });

  it('tc_csc_05_three_cart_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'cart', tier: 0 },
      { lane: 1, y: 0.88, kind: 'cart', tier: 0 },
      { lane: 1, y: 0.88, kind: 'cart', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'stall');
  });

  it('tc_csc_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_csc_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 130 });
    premium = chooseContract(premium, 'market');
    assert.equal(premium.coins, 50);
    assert.equal(premium.contract, 'market');

    premium = startRun(premium);
    premium.runValue = 240;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 240;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.contract, 'stall');
  });

  it('tc_csc_08_shade_bonus_and_crowd_penalty_applied', () => {
    let shade = startRun(createInitialState());
    shade.shadeSwapConsumed = 1;
    shade.runValue = 300;
    shade.runHarvestCount = 4;
    shade.runLaneCollectHistory = [0, 1, 2, 1];
    const shadeSettled = settleRun(shade, false);

    let crowd = startRun(createInitialState());
    crowd.runValue = 300;
    crowd.runHarvestCount = 4;
    crowd.runLaneCollectHistory = [2, 2, 2, 1];
    const crowdSettled = settleRun(crowd, false);

    assert.equal(shadeSettled.lastBreakdown.shadeSwap, true);
    assert.equal(shadeSettled.lastBreakdown.crowdPenalty, false);
    assert.equal(shadeSettled.lastBreakdown.chainMultiplier, 1.24);

    assert.equal(crowdSettled.lastBreakdown.shadeSwap, false);
    assert.equal(crowdSettled.lastBreakdown.crowdPenalty, true);
    assert.equal(crowdSettled.lastBreakdown.chainMultiplier, 0.84);
  });
});
