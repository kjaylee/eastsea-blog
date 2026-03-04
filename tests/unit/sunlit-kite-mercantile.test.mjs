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
} from '../../games/sunlit-kite-mercantile/logic.mjs';

describe('sunlit-kite-mercantile logic', () => {
  it('tc_skm_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.contract, 'market');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_skm_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_skm_03_lane_movement_clamps_bounds_and_counts_moves', () => {
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
    assert.ok(s.runMoves >= 2);
  });

  it('tc_skm_04_collecting_basket_updates_run_value_and_cargo', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [{ lane: 1, y: 0.87, kind: 'basket', tier: 3 }]);
    s = stepRun(s, 30, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.ok(s.runValue >= 36);
    assert.equal(s.runCargo[3], 1);

    const settled = settleRun(s, false);
    assert.equal(settled.phase, 'dock');
    assert.equal(settled.inventory[3], 1);
    assert.ok(settled.coins > 0);
  });

  it('tc_skm_05_three_crow_hits_force_crash_settlement', () => {
    let s = startRun(createInitialState());
    s = withInjectedTokens(s, [
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
      { lane: 1, y: 0.88, kind: 'crow', tier: 0 },
    ]);

    s = stepRun(s, 10, () => 0.5);
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 2);
    assert.equal(s.contract, 'market');
  });

  it('tc_skm_06_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 3, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 3);
  });

  it('tc_skm_07_contract_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 80 });
    premium = chooseContract(premium, 'hotel');
    assert.equal(premium.coins, 25);
    assert.equal(premium.contract, 'hotel');

    premium = startRun(premium);
    premium.runValue = 200;
    const settledPremium = settleRun(premium, false);

    let control = startRun(createInitialState());
    control.runValue = 200;
    const settledControl = settleRun(control, false);

    assert.ok(settledPremium.lastPayout > settledControl.lastPayout);

    const snap = getEconomySnapshot(settledPremium);
    assert.equal(snap.contract, 'market');
  });

  it('tc_skm_08_tailwind_tax_reduces_payout_after_excessive_swaps', () => {
    let taxed = startRun(createInitialState());
    taxed.runValue = 240;
    taxed.runMoves = 8;
    const taxedSettled = settleRun(taxed, false);

    let clean = startRun(createInitialState());
    clean.runValue = 240;
    clean.runMoves = 2;
    const cleanSettled = settleRun(clean, false);

    assert.ok(taxedSettled.lastPayout < cleanSettled.lastPayout);
    assert.equal(taxedSettled.lastBreakdown.taxed, true);
  });
});
