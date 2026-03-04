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
  choosePlan,
  getEconomySnapshot,
} from '../../games/terrace-seed-graft/logic.mjs';

describe('terrace-seed-graft logic', () => {
  it('tc_tsg_01_initial_state_defaults', () => {
    const s = createInitialState();
    assert.equal(s.phase, 'dock');
    assert.equal(s.day, 1);
    assert.equal(s.coins, 0);
    assert.equal(s.gems, 0);
    assert.equal(s.route, 'local');
    assert.equal(s.plan, 'reedplum');
    assert.equal(s.inventory[1], 0);
  });

  it('tc_tsg_02_start_run_initializes_runtime_fields', () => {
    const s = startRun(createInitialState());
    assert.equal(s.phase, 'run');
    assert.equal(s.lane, 1);
    assert.equal(s.hull, 3);
    assert.equal(s.mode, 1);
    assert.ok(s.remainingMs > 0);
  });

  it('tc_tsg_03_lane_movement_clamps_bounds', () => {
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

  it('tc_tsg_04_toggle_stance_switches_clip_bind', () => {
    let s = startRun(createInitialState());
    assert.equal(s.mode, 1);

    s = toggleMode(s);
    assert.equal(s.mode, -1);

    s = toggleMode(s);
    assert.equal(s.mode, 1);
  });

  it('tc_tsg_05_matching_pod_collects_value_species_log', () => {
    let s = startRun(createInitialState());

    s = withInjectedTokens(s, [{ lane: s.lane, y: 0.88, kind: 'crate', tier: 3, phase: 1, species: 'tea' }]);
    s = stepRun(s, 10, () => 0.9);

    assert.equal(s.phase, 'run');
    assert.equal(s.runValue, 39);
    assert.equal(s.runCargo[3], 1);
    assert.equal(s.runCollectCount, 1);
    assert.deepEqual(s.runSpeciesLog, ['tea']);
  });

  it('tc_tsg_06_mismatch_or_hazard_causes_damage', () => {
    let mismatch = startRun(createInitialState());
    mismatch = withInjectedTokens(mismatch, [{ lane: mismatch.lane, y: 0.88, kind: 'crate', tier: 2, phase: -1, species: 'plum' }]);
    mismatch = stepRun(mismatch, 10, () => 0.9);

    assert.equal(mismatch.hull, 2);
    assert.equal(mismatch.runCargo[2], 0);

    let hazard = startRun(createInitialState());
    hazard = withInjectedTokens(hazard, [{ lane: hazard.lane, y: 0.88, kind: 'hazard', tier: 0, phase: 0 }]);
    hazard = stepRun(hazard, 10, () => 0.9);
    assert.equal(hazard.hull, 2);
  });

  it('tc_tsg_07_merge_promotes_highest_available_pair', () => {
    const base = createInitialState({ inventory: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 } });
    const merged = mergeBestPair(base);

    assert.equal(merged.inventory[2], 0);
    assert.equal(merged.inventory[3], 1);
    assert.equal(merged.inventory[1], 4);
  });

  it('tc_tsg_08_route_cost_and_multiplier_affect_payout', () => {
    let premium = createInitialState({ coins: 140 });
    premium = chooseRoute(premium, 'canal');
    assert.equal(premium.route, 'canal');
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

  it('tc_tsg_09_graft_exact_reverse_and_wilt_penalty', () => {
    let exact = createInitialState();
    exact = choosePlan(exact, 'reedplum');
    exact = startRun(exact);
    exact.runValue = 300;
    exact.runCollectCount = 5;
    exact.runSpeciesLog = ['reed', 'plum', 'tea', 'reed', 'plum'];
    const exactSettled = settleRun(exact, false);

    let reverse = createInitialState();
    reverse = choosePlan(reverse, 'reedplum');
    reverse = startRun(reverse);
    reverse.runValue = 300;
    reverse.runCollectCount = 4;
    reverse.runSpeciesLog = ['plum', 'reed', 'tea'];
    const reverseSettled = settleRun(reverse, false);

    let wilt = createInitialState();
    wilt = startRun(wilt);
    wilt.runValue = 300;
    wilt.runCollectCount = 4;
    wilt.runSpeciesLog = ['tea', 'tea', 'tea'];
    const wiltSettled = settleRun(wilt, false);

    assert.equal(exactSettled.lastBreakdown.exactPairs, 2);
    assert.equal(exactSettled.lastBreakdown.reversePairs, 0);
    assert.equal(exactSettled.lastBreakdown.patternMultiplier, 1.24);

    assert.equal(reverseSettled.lastBreakdown.exactPairs, 0);
    assert.equal(reverseSettled.lastBreakdown.reversePairs, 1);
    assert.equal(reverseSettled.lastBreakdown.patternMultiplier, 1.05);

    assert.equal(wiltSettled.lastBreakdown.wilt, true);
    assert.equal(wiltSettled.lastBreakdown.patternMultiplier, 0.76);
  });
});
