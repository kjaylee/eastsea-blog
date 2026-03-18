'use strict';

/**
 * Sensor presets: { label, labelKo, coc (mm) }
 * Circle of Confusion values from industry standards.
 */
const SENSOR_PRESETS = [
  { id: 'ff',       label: 'Full Frame (36×24mm)',       labelKo: '풀프레임 (36×24mm)',       coc: 0.03 },
  { id: 'apsc-c',   label: 'APS-C Canon (22.3×14.9mm)', labelKo: 'APS-C 캐논 (22.3×14.9mm)', coc: 0.019 },
  { id: 'apsc-s',   label: 'APS-C Sony/Nikon (23.5×15.6mm)', labelKo: 'APS-C 소니/니콘 (23.5×15.6mm)', coc: 0.02 },
  { id: 'm43',      label: 'Micro 4/3 (17.3×13mm)',     labelKo: '마이크로 4/3 (17.3×13mm)',  coc: 0.015 },
  { id: 'mf',       label: 'Medium Format (43.8×32.9mm)', labelKo: '미디엄 포맷 (43.8×32.9mm)', coc: 0.043 },
  { id: '1inch',    label: '1-inch (13.2×8.8mm)',        labelKo: '1인치 (13.2×8.8mm)',       coc: 0.011 },
  { id: 'custom',   label: 'Custom CoC',                 labelKo: '커스텀 CoC',                coc: 0.03 },
];

/**
 * Round to n decimal places.
 */
function roundN(val, n) {
  const f = Math.pow(10, n);
  return Math.round(val * f) / f;
}

/**
 * Calculate depth of field, hyperfocal distance, near/far limits.
 *
 * @param {object} opts
 * @param {string} opts.sensorId       - sensor preset id (from SENSOR_PRESETS)
 * @param {number} opts.focalLength    - focal length in mm (1-2000)
 * @param {number} opts.aperture       - f-number (0.7-128)
 * @param {number} opts.distance       - subject distance in meters (0.01-100000)
 * @param {number} [opts.customCoc]    - custom CoC in mm (only if sensorId='custom')
 * @returns {object} result
 */
function calculate({ sensorId, focalLength, aperture, distance, customCoc }) {
  // Validate sensorId
  const preset = SENSOR_PRESETS.find(p => p.id === sensorId);
  if (!preset) throw new Error('Invalid sensorId');

  // Validate focalLength
  if (typeof focalLength !== 'number' || focalLength < 1 || focalLength > 2000)
    throw new Error('focalLength must be between 1 and 2000 mm');

  // Validate aperture
  if (typeof aperture !== 'number' || aperture < 0.7 || aperture > 128)
    throw new Error('aperture must be between 0.7 and 128');

  // Validate distance (in meters)
  if (typeof distance !== 'number' || distance <= 0 || distance > 100000)
    throw new Error('distance must be a positive number up to 100000 m');

  // Determine CoC
  let coc = preset.coc;
  if (sensorId === 'custom') {
    if (typeof customCoc !== 'number' || customCoc <= 0 || customCoc > 1)
      throw new Error('customCoc must be between 0.001 and 1 mm');
    coc = customCoc;
  }

  // Convert distance to mm for calculation
  const s = distance * 1000; // subject distance in mm
  const f = focalLength;      // focal length in mm
  const N = aperture;         // f-number
  const c = coc;              // circle of confusion in mm

  // Hyperfocal distance: H = f² / (N * c) + f
  const H = (f * f) / (N * c) + f;

  // Near focus limit: Dn = s * (H - f) / (H + s - 2f)
  const nearMm = (s * (H - f)) / (H + s - 2 * f);

  // Far focus limit: Df = s * (H - f) / (H - s)  [if s < H, else infinity]
  let farMm;
  let farIsInfinity = false;
  if (s >= H) {
    farMm = Infinity;
    farIsInfinity = true;
  } else {
    farMm = (s * (H - f)) / (H - s);
  }

  // Convert back to meters
  const nearM = roundN(nearMm / 1000, 4);
  const farM = farIsInfinity ? Infinity : roundN(farMm / 1000, 4);
  const hyperfocalM = roundN(H / 1000, 4);

  // DoF
  const dofM = farIsInfinity ? Infinity : roundN(farM - nearM, 4);

  // In front of subject / behind subject
  const inFrontM = roundN(distance - nearM, 4);
  const behindM = farIsInfinity ? Infinity : roundN(farM - distance, 4);

  // Percentages
  let pctInFront, pctBehind;
  if (farIsInfinity) {
    pctInFront = 0;
    pctBehind = 100;
  } else {
    const total = inFrontM + behindM;
    if (total <= 0) {
      pctInFront = 50;
      pctBehind = 50;
    } else {
      pctInFront = roundN((inFrontM / total) * 100, 1);
      pctBehind = roundN((behindM / total) * 100, 1);
    }
  }

  return {
    sensorId,
    focalLength: f,
    aperture: N,
    distanceM: distance,
    cocMm: roundN(coc, 4),
    hyperfocalM,
    nearM,
    farM,
    farIsInfinity,
    dofM,
    inFrontM,
    behindM,
    pctInFront,
    pctBehind,
  };
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculate, SENSOR_PRESETS, roundN };
}
