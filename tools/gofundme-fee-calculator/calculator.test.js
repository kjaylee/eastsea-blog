const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const calc = require('./calculator.js');

function run(overrides = {}) {
  return calc.calculate(Object.assign({}, calc.DEFAULT_INPUTS, overrides));
}

function approx(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`);
}

test('baseline one-time scenario matches public fee math', () => {
  const { result, error } = run({
    donationCount: 50,
    averageDonationAmount: 40,
    recurringMonthlyDonation: false,
    transactionFeeRatePct: 2.9,
    transactionFixedFee: 0.30,
    recurringDonorFeePct: 5,
    campaignCosts: 150,
    targetNetAmount: 3000,
  });

  assert.equal(error, '');
  assert.equal(result.grossDonations, 2000);
  assert.equal(result.transactionFees, 73);
  assert.equal(result.organizerNetBeforeCosts, 1927);
  assert.equal(result.campaignNetAfterCosts, 1777);
  assert.equal(result.donorExtraRecurringFee, 0);
  assert.equal(result.donorCheckoutTotal, 2000);
  approx(result.effectiveOrganizerFeeRatePct, 3.65, 1e-9);
  approx(result.breakEvenAverageDonation, 3.398558, 1e-6);
  approx(result.targetAverageDonation, 65.190525, 1e-6);
});

test('recurring mode increases donor checkout without changing organizer fee math', () => {
  const { result, error } = run({
    donationCount: 50,
    averageDonationAmount: 40,
    recurringMonthlyDonation: true,
    recurringDonorFeePct: 5,
    campaignCosts: 150,
  });

  assert.equal(error, '');
  assert.equal(result.organizerNetBeforeCosts, 1927);
  assert.equal(result.campaignNetAfterCosts, 1777);
  assert.equal(result.donorExtraRecurringFee, 100);
  assert.equal(result.donorCheckoutTotal, 2100);
});

test('campaign costs reduce final net dollar-for-dollar', () => {
  const low = run({ campaignCosts: 150 }).result.campaignNetAfterCosts;
  const high = run({ campaignCosts: 350 }).result.campaignNetAfterCosts;
  approx(low - high, 200, 1e-9);
});

test('zero donations returns safe outputs', () => {
  const { result, error } = run({ donationCount: 0, averageDonationAmount: 40, campaignCosts: 25 });
  assert.equal(error, '');
  assert.equal(result.grossDonations, 0);
  assert.equal(result.transactionFees, 0);
  assert.equal(result.campaignNetAfterCosts, -25);
  assert.equal(result.breakEvenAverageDonation, null);
  assert.equal(result.targetAverageDonation, null);
});

test('invalid inputs are rejected', () => {
  const { error } = run({
    donationCount: -1,
    averageDonationAmount: -10,
    transactionFeeRatePct: 100,
    transactionFixedFee: -1,
    recurringDonorFeePct: 100,
    campaignCosts: -1,
    targetNetAmount: -1,
  });

  assert.match(error, /donationCount must be an integer/);
  assert.match(error, /averageDonationAmount must be at least 0/);
  assert.match(error, /transactionFeeRatePct must be between 0 and less than 100/);
  assert.match(error, /transactionFixedFee must be at least 0/);
  assert.match(error, /recurringDonorFeePct must be between 0 and less than 100/);
});

test('summary includes key decision fields', () => {
  const { result } = run({ recurringMonthlyDonation: true });
  const text = result.summary;
  assert.match(text, /Donation count \/ 후원 건수:/);
  assert.match(text, /Gross donations \/ 총 모금액:/);
  assert.match(text, /Transaction fees \/ 결제 수수료:/);
  assert.match(text, /Campaign net after costs \/ 비용 후 순모금액:/);
  assert.match(text, /Donor checkout total \/ 후원자 결제 총액:/);
  assert.match(text, /Break-even average donation \/ 손익분기 평균 후원액:/);
});

test('required HTML anchors are present', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'donationCount',
    'averageDonationAmount',
    'recurringMonthlyDonation',
    'transactionFeeRatePct',
    'transactionFixedFee',
    'recurringDonorFeePct',
    'campaignCosts',
    'targetNetAmount',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
  ]) {
    assert.match(html, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('manifest contains slug exactly once after rebuild', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'gofundme-fee-calculator';
  const manifest = fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8');
  assert.equal(manifest.split(`"slug": "${slug}"`).length - 1, 1);
});
