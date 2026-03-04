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
  chooseContract,
  getEconomySnapshot,
} from '../../games/lantern-loom-bazaar/logic.mjs';

describe('lantern-loom-bazaar logic', () => {
  it('tc_llb_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.route, 'local');
    assert.equal(s.contract, 'sunleafwave');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_llb_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.equal(s.mode, 1);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_llb_03_lane_movement_clamps_bounds', () => {
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

  it('tc_llb_04_toggle_phase_switches_dawn_dusk', () => {
    let s = startRun(createInitialState());
    assert.equal(s.mode, 1);

    s = toggleMode(s);
    assert.equal(s.mode, -1);

    s = toggleMode(s);
    assert.equal(s.mode, 1);
  });

  it('tc_llb_05_matching_crate_collects_value_symbol_log', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'crate', tier: 3, phase: 1, symbol: 'wave' }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runValue, 42);
    assert.equal(s.runCargo[3], 1);
    assert.equal(s.runCollectCount, 1);
    assert.deepEqual(s.runSymbolLog, ['wave']);
  });

  it('tc_llb_06_mismatch_or_hazard_causes_damage', () => {
    let mismatch = startRun(createInitialState());
    mismatch = withInjectedTokens(mismatch, [{ lane: mismatch.lane, y: 0.88, kind: 'crate', tier: 2, phase: -1, symbol: 'leaf' }]);
    mismatch = stepRun(mismatch, 10, () => 0.9);

    assert.equal(mismatch.hull, 2);
    assert.equal(mismatch.runCargo[2], 0);

    let hazard = startRun(createInitialState());
    hazard = withInjectedTokens(hazard, [{ lane: hazard.lane, y: 0.88, kind: 'hazard', tier: 0, phase: 0 }]);
    hazard = stepRun(hazard, 10, () => 0.9);
    assert.equal(hazard.hull, 2);
  });

  it('tc_llb_07_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_llb_08_route_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 130 });
    premium = chooseRoute(premium, 'guild');
    assert.equal(premium.route, 'guild');
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

  it('tc_llb_09_contract_exact_reverse_and_tangle_penalty', () => {
    let exact = createInitialState();
    exact = chooseContract(exact, 'sunleafwave');
    exact = startRun(exact);
    exact.runValue = 300;
    exact.runCollectCount = 4;
    exact.runSymbolLog = ['sun', 'leaf', 'wave'];
    const exactSettled = settleRun(exact, false);

    let reverse = createInitialState();
    reverse = chooseContract(reverse, 'sunleafwave');
    reverse = startRun(reverse);
    reverse.runValue = 300;
    reverse.runCollectCount = 4;
    reverse.runSymbolLog = ['wave', 'leaf', 'sun'];
    const reverseSettled = settleRun(reverse, false);

    let tangle = createInitialState();
    tangle = startRun(tangle);
    tangle.runValue = 300;
    tangle.runCollectCount = 4;
    tangle.runSymbolLog = ['leaf', 'leaf', 'leaf'];
    const tangleSettled = settleRun(tangle, false);

    assert.equal(exactSettled.lastBreakdown.exact, true);
    assert.equal(exactSettled.lastBreakdown.reverse, false);
    assert.equal(exactSettled.lastBreakdown.patternMultiplier, 1.42);

    assert.equal(reverseSettled.lastBreakdown.exact, false);
    assert.equal(reverseSettled.lastBreakdown.reverse, true);
    assert.equal(reverseSettled.lastBreakdown.patternMultiplier, 1.18);

    assert.equal(tangleSettled.lastBreakdown.tangle, true);
    assert.equal(tangleSettled.lastBreakdown.patternMultiplier, 0.74);
  });
});
