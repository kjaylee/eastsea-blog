const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('./app.js');

const SUMMARY_KEYS = ["grossBillings", "creatorPayoutBeforeLosses", "creatorPayoutAfterLosses", "effectiveCreatorShare", "monthlyNetAfterCosts", "annualizedNetAfterCosts", "upliftVsComparison", "breakEvenPaidEquivalentSubs"];

test('compute(DEFAULTS) succeeds and exposes summary keys', () => {
  const result = app.compute(app.DEFAULTS);
  assert.equal(result.error, '');
  for (const key of SUMMARY_KEYS) {
    assert.ok(Object.prototype.hasOwnProperty.call(result, key), key + ' missing from result');
  }
});

test('summaryText includes the first summary label', () => {
  const result = app.compute(app.DEFAULTS);
  const text = app.summaryText(result);
  assert.match(text, /Gross subscription billings/);
});

test('invalid input returns a validation error', () => {
  const invalid = { ...app.DEFAULTS, "monthlySubs": -1 };
  const result = app.compute(invalid);
  assert.notEqual(result.error, '');
  assert.match(result.error, /Monthly recurring subscribers/);
});
