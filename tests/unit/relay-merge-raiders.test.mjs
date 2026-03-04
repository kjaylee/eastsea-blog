import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  startWave,
  moveLane,
  withInjectedTokens,
  stepWave,
  mergeBestPair,
  settleWave,
  activateSponsorBoost,
  buyPremiumPass,
  getEconomySnapshot,
} from '../../games/relay-merge-raiders/logic.mjs';

describe('relay-merge-raiders logic', () => {
  it('tc_rmr_01_initial_state_defaults', () => {
    const state = createInitialState();
    assert.equal(state.phase, 'dock');
    assert.equal(state.wave, 1);
    assert.equal(state.coins, 0);
    assert.equal(state.gems, 0);
    assert.equal(state.inventory[1], 0);
  });

  it('tc_rmr_02_start_wave_sets_phase_and_timer', () => {
    const state = startWave(createInitialState());
    assert.equal(state.phase, 'wave');
    assert.ok(state.remainingMs > 0);
    assert.equal(state.shield, 3);
  });

  it('tc_rmr_03_move_lane_clamps_left_right_bounds', () => {
    let state = startWave(createInitialState());
    state = moveLane(state, -1);
    state = moveLane(state, -1);
    state = moveLane(state, -1);
    assert.equal(state.lane, 0);

    state = moveLane(state, 1);
    state = moveLane(state, 1);
    state = moveLane(state, 1);
    state = moveLane(state, 1);
    assert.equal(state.lane, 2);
  });

  it('tc_rmr_04_salvage_collision_increases_run_value_and_inventory_after_settle', () => {
    let state = startWave(createInitialState());
    state = withInjectedTokens(state, [{ lane: 1, y: 0.87, kind: 'salvage', tier: 3 }]);

    state = stepWave(state, 30, () => 0.95);

    assert.equal(state.phase, 'wave');
    assert.ok(state.runValue >= 30);
    assert.equal(state.runCargo[3], 1);

    const settled = settleWave(state, false);
    assert.equal(settled.phase, 'dock');
    assert.equal(settled.inventory[3], 1);
    assert.ok(settled.coins > 0);
  });

  it('tc_rmr_05_three_mine_hits_force_crash_settlement', () => {
    let state = startWave(createInitialState());
    state = withInjectedTokens(state, [
      { lane: 1, y: 0.88, kind: 'mine', tier: 0 },
      { lane: 1, y: 0.88, kind: 'mine', tier: 0 },
      { lane: 1, y: 0.88, kind: 'mine', tier: 0 },
    ]);

    state = stepWave(state, 10, () => 0.5);

    assert.equal(state.phase, 'dock');
    assert.equal(state.wave, 2);
    assert.equal(state.sponsorActive, false);
  });

  it('tc_rmr_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 2, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 2);
  });

  it('tc_rmr_07_sponsor_and_premium_increase_settled_wave_revenue', () => {
    let base = createInitialState({ gems: 10, coins: 220, inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    base = buyPremiumPass(base);
    base = activateSponsorBoost(base);
    base = startWave(base);
    base.runValue = 220;

    const boosted = settleWave(base, false);

    let plain = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    plain = startWave(plain);
    plain.runValue = 220;
    const control = settleWave(plain, false);

    assert.ok(boosted.lastWaveRevenue > control.lastWaveRevenue);

    const snap = getEconomySnapshot(boosted);
    assert.equal(snap.premiumPass, true);
    assert.ok(snap.coins >= boosted.coins - 1);
  });
});
