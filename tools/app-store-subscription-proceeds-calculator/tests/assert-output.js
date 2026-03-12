const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sample = JSON.parse(fs.readFileSync(path.join(root, 'fixtures', 'sample-input.json'), 'utf8'));
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-output.json'), 'utf8'));
const startMarker = '/* TESTABLE_COMPUTE_START */';
const endMarker = '/* TESTABLE_COMPUTE_END */';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);
if (start === -1 || end === -1 || end <= start) throw new Error('TESTABLE_COMPUTE block not found');
const computeSource = html.slice(start + startMarker.length, end).trim();
const ctx = { result: null };
vm.createContext(ctx);
vm.runInContext(computeSource + '; result = compute(' + JSON.stringify(sample) + ');', ctx);
const actual = ctx.result;
const keys = Object.keys(expected);
for (const key of keys) {
  if (!(key in actual)) throw new Error('Missing key: ' + key);
  const a = Number(actual[key]);
  const b = Number(expected[key]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 1e-9) {
    throw new Error('Mismatch for ' + key + ': expected ' + b + ', got ' + a);
  }
}
console.log('assert-output: OK');
