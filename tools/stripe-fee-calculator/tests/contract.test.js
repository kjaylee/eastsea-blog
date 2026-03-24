const test = require('node:test');
const assert = require('node:assert/strict');
const { loadStripeCompute } = require('./_load-compute');

const { computeForward, computeReverse } = loadStripeCompute();

function approx(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

test('standard card forward on $100', () => {
  const result = computeForward(100, 'standard');
  approx(result.fee, 3.2, 'fee');
  approx(result.net, 96.8, 'net');
  approx(result.effectiveRate, 0.032, 'effectiveRate');
});

test('international card forward on $200', () => {
  const result = computeForward(200, 'international');
  approx(result.fee, 9.1, 'fee');
  approx(result.net, 190.9, 'net');
  approx(result.effectiveRate, 0.0455, 'effectiveRate');
});

test('stripe link forward on $50', () => {
  const result = computeForward(50, 'link');
  approx(result.fee, 1.5, 'fee');
  approx(result.net, 48.5, 'net');
  approx(result.effectiveRate, 0.03, 'effectiveRate');
});

test('ACH forward caps fee at $5', () => {
  const result = computeForward(1000, 'ach');
  approx(result.fee, 5, 'fee');
  approx(result.net, 995, 'net');
  approx(result.effectiveRate, 0.005, 'effectiveRate');
});

test('standard reverse for target net $100', () => {
  const result = computeReverse(100, 'standard');
  approx(result.charge, 103.3, 'charge');
  approx(result.fee, 3.3, 'fee');
  approx(result.net, 100, 'net');
});

test('ACH reverse above cap region adds exactly $5', () => {
  const result = computeReverse(5000, 'ach');
  approx(result.charge, 5005, 'charge');
  approx(result.fee, 5, 'fee');
  approx(result.net, 5000, 'net');
});
