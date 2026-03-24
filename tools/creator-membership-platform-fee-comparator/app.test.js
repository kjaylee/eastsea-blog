const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('./calculator.js');

function near(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const defaultFixture = {
  membershipPrice: 10,
  activeMembers: 100,
  refundRate: 5,
  directOpsCost: 29,
  appStoreSmallBusiness: false,
  appStoreLongTermSharePct: 20,
  directStripeFeeRate: 2.9,
  directStripeFixedFee: 0.30,
  patreonPlatformFeeRate: 10,
  patreonProcessingFeeRate: 2.9,
  patreonProcessingFixedFee: 0.30,
  substackPlatformFeeRate: 10,
  substackProcessingFeeRate: 2.9,
  substackProcessingFixedFee: 0.30,
  substackRecurringBillingFeeRate: 0.7,
};

test('default scenario matches golden outputs', () => {
  const out = calc.calculateAll(defaultFixture);
  assert.equal(out.ok, true);
  near(out.grossMonthlyBillings, 1000.00);
  near(out.refundedBillings, 50.00);
  near(out.netBillingsAfterRefunds, 950.00);
  near(out.directNetTakeHome, 863.45);
  near(out.patreonNetTakeHome, 797.45);
  near(out.substackNetTakeHome, 790.80);
  near(out.appStoreEffectiveCommissionRate, 27.00);
  near(out.appStoreNetTakeHome, 693.50);
  assert.equal(out.bestPlatform, 'directStripe');
  near(out.patreonDeltaVsDirect, -66.00);
  near(out.substackDeltaVsDirect, -72.65);
  near(out.appStoreDeltaVsDirect, -169.95);
  near(out.patreonPriceToMatchDirect, 10.80);
  near(out.substackPriceToMatchDirect, 10.89);
  near(out.appStorePriceToMatchDirect, 12.45);
});

test('App Store Small Business mode overrides long-term share math', () => {
  const out = calc.calculateAll({
    ...defaultFixture,
    appStoreSmallBusiness: true,
    appStoreLongTermSharePct: 20,
  });
  assert.equal(out.ok, true);
  near(out.appStoreEffectiveCommissionRate, 15.00);
  near(out.appStoreNetTakeHome, 807.50);
});

test('App Store long-term share affects effective commission when Small Business is off', () => {
  const low = calc.calculateAll({
    ...defaultFixture,
    appStoreSmallBusiness: false,
    appStoreLongTermSharePct: 0,
  });
  const high = calc.calculateAll({
    ...defaultFixture,
    appStoreSmallBusiness: false,
    appStoreLongTermSharePct: 100,
  });
  near(low.appStoreEffectiveCommissionRate, 30.00);
  near(high.appStoreEffectiveCommissionRate, 15.00);
  assert.ok(high.appStoreNetTakeHome > low.appStoreNetTakeHome);
});

test('refunds reduce every platform billable base while fixed fees remain constant', () => {
  const noRefunds = calc.calculateAll({ ...defaultFixture, refundRate: 0 });
  const withRefunds = calc.calculateAll({ ...defaultFixture, refundRate: 10 });
  assert.ok(withRefunds.netBillingsAfterRefunds < noRefunds.netBillingsAfterRefunds);
  assert.ok(withRefunds.directNetTakeHome < noRefunds.directNetTakeHome);
  near(noRefunds.platforms.directStripe.fixedFeePerTxn, withRefunds.platforms.directStripe.fixedFeePerTxn);
});

test('low-ticket scenario can crown Patreon when App Store long-term share is zero', () => {
  const out = calc.calculateAll({
    ...defaultFixture,
    membershipPrice: 2,
    activeMembers: 100,
    refundRate: 0,
    appStoreLongTermSharePct: 0,
  });
  near(out.directNetTakeHome, 135.20);
  near(out.patreonNetTakeHome, 144.20);
  near(out.substackNetTakeHome, 142.80);
  near(out.appStoreNetTakeHome, 140.00);
  assert.equal(out.bestPlatform, 'patreon');
});

test('price-to-match is above current price when a platform under-earns vs direct', () => {
  const out = calc.calculateAll(defaultFixture);
  assert.ok(out.patreonPriceToMatchDirect > out.input.membershipPrice);
  assert.ok(out.substackPriceToMatchDirect > out.input.membershipPrice);
  assert.ok(out.appStorePriceToMatchDirect > out.input.membershipPrice);
  assert.ok(out.patreonRequiredPriceLiftPct > 0);
  assert.ok(out.substackRequiredPriceLiftPct > 0);
  assert.ok(out.appStoreRequiredPriceLiftPct > 0);
});

test('price-to-match can be below current price when Patreon out-earns direct', () => {
  const out = calc.calculateAll({
    ...defaultFixture,
    membershipPrice: 2,
    activeMembers: 100,
    refundRate: 0,
    appStoreLongTermSharePct: 0,
  });
  assert.ok(out.patreonPriceToMatchDirect < out.input.membershipPrice);
  assert.ok(out.patreonRequiredPriceLiftPct < 0);
});

test('validation rejects impossible values', () => {
  const out = calc.calculateAll({
    ...defaultFixture,
    membershipPrice: 0,
    activeMembers: -1,
    refundRate: 120,
    directOpsCost: -5,
  });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' | '), /membershipPrice/);
  assert.match(out.errors.join(' | '), /activeMembers/);
  assert.match(out.errors.join(' | '), /refundRate/);
  assert.match(out.errors.join(' | '), /directOpsCost/);
});
