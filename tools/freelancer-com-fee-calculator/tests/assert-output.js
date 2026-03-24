const fs = require('node:fs');
const path = require('node:path');
const { compute } = require('../app.js');

const root = path.join(__dirname, '..');
const sample = JSON.parse(fs.readFileSync(path.join(root, 'fixtures', 'sample-input.json'), 'utf8'));
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-output.json'), 'utf8'));
const actual = compute(sample);

if (actual.error) {
  throw new Error('Unexpected compute error: ' + actual.error);
}

for (const key of Object.keys(expected)) {
  if (!(key in actual)) throw new Error('Missing key: ' + key);
  const a = Number(actual[key]);
  const b = Number(expected[key]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 1e-9) {
    throw new Error(`Mismatch for ${key}: expected ${b}, got ${a}`);
  }
}

console.log('assert-output: OK');
