const fs = require('node:fs');
const path = require('node:path');
const { loadStripeCompute } = require('./_load-compute');

const toolRoot = path.resolve(__dirname, '..');
const sample = JSON.parse(fs.readFileSync(path.join(toolRoot, 'fixtures', 'sample-input.json'), 'utf8'));
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-output.json'), 'utf8'));
const api = loadStripeCompute();

function approx(actual, expectedValue, key, caseName) {
  if (!Number.isFinite(actual) || Math.abs(actual - expectedValue) > 1e-9) {
    throw new Error(`${caseName}: ${key} expected ${expectedValue}, got ${actual}`);
  }
}

for (const testCase of sample.cases) {
  const fn = testCase.kind === 'reverse' ? api.computeReverse : api.computeForward;
  const actual = fn(testCase.amount, testCase.mode);
  const wanted = expected[testCase.name];
  if (!wanted) {
    throw new Error(`Missing expected output for case: ${testCase.name}`);
  }
  for (const [key, value] of Object.entries(wanted)) {
    approx(Number(actual[key]), Number(value), key, testCase.name);
  }
}

console.log('assert-output: OK');
