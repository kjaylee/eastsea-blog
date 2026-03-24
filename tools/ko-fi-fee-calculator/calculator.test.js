const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('./calculator.js');

function scenario(overrides = {}) {
  return calc.calculateScenario(Object.assign({}, calc.DEFAULT_INPUTS, overrides));
}

test('free one-off tip applies 0% Ko-fi service fee', () => {
  const { result, error } = scenario({
    creatorMode: 'free',
    paymentType: 'oneOffTip',
    averagePaymentAmount: 10,
    successfulTransactions: 10,
    refundRatePct: 0,
    processorRatePct: 3,
    processorFixedFee: 0.30,
    fxFeeRatePct: 0,
    targetNetIncome: '',
  });

  assert.equal(error, '');
  assert.equal(result.serviceFeeRatePct, 0);
  assert.equal(result.grossVolume, 100);
  assert.equal(result.koFiServiceFee, 0);
  assert.equal(result.processorVariableFee, 3);
  assert.equal(result.processorFixedFeeTotal, 3);
  assert.equal(result.totalFees, 6);
  assert.equal(result.netTakeHome, 94);
});

test('contributor one-off tip applies 5% Ko-fi service fee', () => {
  const { result, error } = scenario({
    creatorMode: 'contributor',
    paymentType: 'oneOffTip',
    averagePaymentAmount: 10,
    successfulTransactions: 10,
    refundRatePct: 0,
    processorRatePct: 3,
    processorFixedFee: 0.30,
    fxFeeRatePct: 0,
    targetNetIncome: '',
  });

  assert.equal(error, '');
  assert.equal(result.serviceFeeRatePct, 5);
  assert.equal(result.koFiServiceFee, 5);
  assert.equal(result.totalFees, 11);
  assert.equal(result.netTakeHome, 89);
});

test('free membership tier applies 5% service fee and shows recurring caveat', () => {
  const { result, error } = scenario({
    creatorMode: 'free',
    paymentType: 'membershipTier',
    averagePaymentAmount: 12,
    successfulTransactions: 20,
    targetNetIncome: '',
  });

  assert.equal(error, '');
  assert.equal(result.serviceFeeRatePct, 5);
  assert.equal(result.showRecurringCaveat, true);
});

test('comparison helper returns expected delta for one-off tips', () => {
  const { result, error } = calc.calculateComparison({
    paymentType: 'oneOffTip',
    averagePaymentAmount: 10,
    successfulTransactions: 10,
    refundRatePct: 0,
    processorRatePct: 3,
    processorFixedFee: 0.30,
    fxFeeRatePct: 0,
    targetNetIncome: '',
  });

  assert.equal(error, '');
  assert.equal(result.free.netTakeHome, 94);
  assert.equal(result.contributor.netTakeHome, 89);
  assert.equal(result.deltaContributorMinusFree, -5);
  assert.equal(result.betterMode, 'free');
});

test('invalid input is rejected', () => {
  const { error } = scenario({
    paymentType: 'notReal',
    successfulTransactions: -1,
  });

  assert.match(error, /paymentType is invalid/);
  assert.match(error, /successfulTransactions must be an integer/);
});

test('impossible reverse calculation returns null transaction target', () => {
  const { result, error } = scenario({
    creatorMode: 'contributor',
    paymentType: 'shopSale',
    averagePaymentAmount: 1,
    successfulTransactions: 10,
    refundRatePct: 0,
    processorRatePct: 96,
    processorFixedFee: 1,
    fxFeeRatePct: 10,
    targetNetIncome: 500,
  });

  assert.equal(error, '');
  assert.equal(result.requiredSuccessfulTransactions, null);
  assert.equal(result.requiredAveragePaymentAmount, null);
});

test('summary includes key lines', () => {
  const { result } = scenario({
    creatorMode: 'free',
    paymentType: 'oneOffTip',
    averagePaymentAmount: 10,
    successfulTransactions: 10,
    targetNetIncome: 100,
  });
  const { result: comparison } = calc.calculateComparison({
    creatorMode: 'free',
    paymentType: 'oneOffTip',
    averagePaymentAmount: 10,
    successfulTransactions: 10,
    targetNetIncome: 100,
  });
  const text = calc.buildSummary(result, comparison);
  assert.match(text, /Ko-fi Fee Calculator Summary/);
  assert.match(text, /Gross volume:/);
  assert.match(text, /Net take-home:/);
  assert.match(text, /Free vs Contributor net delta:/);
});

test('recurring caveat helper only flags monthly tips and memberships', () => {
  assert.equal(calc.shouldShowRecurringCaveat('monthlyTip'), true);
  assert.equal(calc.shouldShowRecurringCaveat('membershipTier'), true);
  assert.equal(calc.shouldShowRecurringCaveat('oneOffTip'), false);
});

test('processor preset baselines are exposed', () => {
  const stripe = calc.getProcessorPreset('stripe');
  const paypal = calc.getProcessorPreset('paypal');
  assert.deepEqual(stripe, { ratePct: 3.0, fixedFee: 0.30, label: 'Stripe baseline' });
  assert.deepEqual(paypal, { ratePct: 3.49, fixedFee: 0.49, label: 'PayPal baseline' });
});
