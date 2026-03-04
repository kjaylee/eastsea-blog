const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate } = require('./calculator.js');

test('calculate returns positive monthly net for healthy assumptions', () => {
  const { result, error } = calculate({
    clicks: 280000,
    currentCvr: 2.1,
    targetCvr: 2.7,
    aov: 72000,
    grossMargin: 46,
    commissionRate: 12,
    networkFeeRate: 2.5,
    refundRate: 4,
    monthlyCost: 3800000,
    setupCost: 7000000,
    months: 12
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.monthlyNet > 0);
  assert.ok(result.roi > 0);
  assert.ok(result.incrementalOrders > 0);
});

test('calculate rejects target CVR lower than current CVR', () => {
  const { result, error } = calculate({
    clicks: 100000,
    currentCvr: 3,
    targetCvr: 2,
    aov: 50000,
    grossMargin: 40,
    commissionRate: 10,
    networkFeeRate: 2,
    refundRate: 5,
    monthlyCost: 1000000,
    setupCost: 1000000,
    months: 6
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.match(error, /Target CVR/);
});
