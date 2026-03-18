'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const { calculate, SENSOR_PRESETS, roundN } = require('./calculator.js');

const BASE = { sensorId: 'ff', focalLength: 50, aperture: 1.8, distance: 3 };

// ---------- Helper ----------
function approxEqual(actual, expected, tolerance, msg) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${msg}: expected ~${expected}, got ${actual}`
  );
}

// ---------- TC-01: Full Frame 50mm f/1.8 at 3m ----------
test('TC-01: FF 50mm f/1.8 at 3m — near, far, DoF', () => {
  const r = calculate(BASE);
  // Hyperfocal: H = 50^2/(1.8*0.03)+50 = 2500/0.054+50 ≈ 46346mm ≈ 46.35m
  approxEqual(r.hyperfocalM, 46.346, 0.1, 'hyperfocal');
  // Near: 3000*(46296)/(46296+3000-100) = 3000*46296/49196 ≈ 2824mm ≈ 2.824m
  approxEqual(r.nearM, 2.824, 0.05, 'nearM');
  // Far: 3000*(46296)/(46296-3000) ≈ 3208mm ≈ 3.208m
  approxEqual(r.farM, 3.208, 0.05, 'farM');
  // DoF ≈ 0.38m
  approxEqual(r.dofM, 0.384, 0.05, 'dofM');
  assert.equal(r.farIsInfinity, false);
});

// ---------- TC-02: APS-C Canon 35mm f/2.8 at 5m ----------
test('TC-02: APS-C Canon 35mm f/2.8 at 5m', () => {
  const r = calculate({ sensorId: 'apsc-c', focalLength: 35, aperture: 2.8, distance: 5 });
  // CoC=0.019, H = 35^2/(2.8*0.019)+35 = 1225/0.0532+35 ≈ 23060mm ≈ 23.06m
  approxEqual(r.hyperfocalM, 23.06, 0.2, 'hyperfocal');
  assert.equal(r.cocMm, 0.019);
  assert.equal(r.farIsInfinity, false);
  // DoF should be roughly ~2.7m
  assert.ok(r.dofM > 1.5 && r.dofM < 5, `dofM=${r.dofM}`);
});

// ---------- TC-03: Hyperfocal — distance >= H yields far = ∞ ----------
test('TC-03: at hyperfocal distance, far = infinity', () => {
  // FF 50mm f/16: H ≈ 50^2/(16*0.03)+50 = 2500/0.48+50 ≈ 5258mm ≈ 5.26m
  const r = calculate({ sensorId: 'ff', focalLength: 50, aperture: 16, distance: 5.26 });
  assert.equal(r.farIsInfinity, true);
  assert.equal(r.farM, Infinity);
  assert.equal(r.dofM, Infinity);
});

// ---------- TC-04: Beyond hyperfocal (far = ∞) ----------
test('TC-04: beyond hyperfocal', () => {
  const r = calculate({ sensorId: 'ff', focalLength: 50, aperture: 16, distance: 10 });
  assert.equal(r.farIsInfinity, true);
  assert.equal(r.pctBehind, 100);
  assert.ok(r.nearM > 0 && r.nearM < 10, 'near focus should be valid');
});

// ---------- TC-05: Very close distance (macro-like) ----------
test('TC-05: close distance 0.3m, 100mm f/2.8', () => {
  const r = calculate({ sensorId: 'ff', focalLength: 100, aperture: 2.8, distance: 0.3 });
  assert.ok(r.dofM < 0.01, `very shallow DoF expected, got ${r.dofM}`);
  assert.equal(r.farIsInfinity, false);
});

// ---------- TC-06: Telephoto at distance ----------
test('TC-06: 200mm f/5.6 at 50m', () => {
  const r = calculate({ sensorId: 'ff', focalLength: 200, aperture: 5.6, distance: 50 });
  assert.equal(r.farIsInfinity, false);
  // Narrow DoF at this combo
  assert.ok(r.dofM > 0.5 && r.dofM < 30, `dofM=${r.dofM}`);
});

// ---------- TC-07: Micro 4/3 preset ----------
test('TC-07: M43 25mm f/1.4 at 2m', () => {
  const r = calculate({ sensorId: 'm43', focalLength: 25, aperture: 1.4, distance: 2 });
  assert.equal(r.cocMm, 0.015);
  assert.equal(r.sensorId, 'm43');
  assert.ok(r.dofM > 0 && r.dofM < 2, `dofM=${r.dofM}`);
});

// ---------- TC-08: Custom CoC ----------
test('TC-08: custom CoC', () => {
  const r = calculate({ sensorId: 'custom', focalLength: 50, aperture: 2, distance: 5, customCoc: 0.025 });
  assert.equal(r.cocMm, 0.025);
  assert.ok(r.dofM > 0);
});

// ---------- TC-09: Percentage distribution ----------
test('TC-09: in-front/behind percentages sum to ~100', () => {
  const r = calculate(BASE);
  approxEqual(r.pctInFront + r.pctBehind, 100, 0.5, 'pct sum');
  assert.ok(r.pctBehind > r.pctInFront, 'more behind subject than in front');
});

// ---------- TC-10: Validation errors ----------
test('TC-10: invalid sensorId', () => {
  assert.throws(() => calculate({ ...BASE, sensorId: 'invalid' }), /Invalid sensorId/);
});

test('TC-10b: invalid focalLength', () => {
  assert.throws(() => calculate({ ...BASE, focalLength: 0 }), /focalLength/);
  assert.throws(() => calculate({ ...BASE, focalLength: -10 }), /focalLength/);
});

test('TC-10c: invalid aperture', () => {
  assert.throws(() => calculate({ ...BASE, aperture: 0 }), /aperture/);
  assert.throws(() => calculate({ ...BASE, aperture: 200 }), /aperture/);
});

test('TC-10d: invalid distance', () => {
  assert.throws(() => calculate({ ...BASE, distance: 0 }), /distance/);
  assert.throws(() => calculate({ ...BASE, distance: -5 }), /distance/);
});

test('TC-10e: custom CoC without value', () => {
  assert.throws(() => calculate({ sensorId: 'custom', focalLength: 50, aperture: 2, distance: 5 }), /customCoc/);
});

// ---------- TC-11: roundN utility ----------
test('TC-11: roundN function', () => {
  assert.equal(roundN(3.14159, 2), 3.14);
  assert.equal(roundN(3.14159, 4), 3.1416);
  assert.equal(roundN(100, 0), 100);
});

// ---------- TC-12: Medium Format preset ----------
test('TC-12: Medium Format 80mm f/2.8 at 5m', () => {
  const r = calculate({ sensorId: 'mf', focalLength: 80, aperture: 2.8, distance: 5 });
  assert.equal(r.cocMm, 0.043);
  assert.ok(r.dofM > 0);
  assert.equal(r.farIsInfinity, false);
});

// ---------- TC-13: 1-inch sensor ----------
test('TC-13: 1-inch sensor 24mm f/2.8 at 3m', () => {
  const r = calculate({ sensorId: '1inch', focalLength: 24, aperture: 2.8, distance: 3 });
  assert.equal(r.cocMm, 0.011);
  assert.ok(r.dofM > 0);
});

// ---------- TC-14: SENSOR_PRESETS has expected entries ----------
test('TC-14: SENSOR_PRESETS completeness', () => {
  assert.ok(SENSOR_PRESETS.length >= 7, 'at least 7 presets');
  const ids = SENSOR_PRESETS.map(p => p.id);
  ['ff', 'apsc-c', 'apsc-s', 'm43', 'mf', '1inch', 'custom'].forEach(id => {
    assert.ok(ids.includes(id), `missing preset: ${id}`);
  });
});
