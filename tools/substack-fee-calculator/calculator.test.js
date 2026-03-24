const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULT_INPUTS,
  cycleMonths,
  validateInputs,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('TC-SF-00 exports defaults and helpers', () => {
  assert.equal(DEFAULT_INPUTS.billingCycle, 'monthly');
  assert.equal(DEFAULT_INPUTS.pricePerSubscriber, 8);
  assert.equal(DEFAULT_INPUTS.recurringBillingFeeRatePct, 0.7);
  assert.equal(cycleMonths('monthly'), 1);
  assert.equal(cycleMonths('annual'), 12);
});

test('TC-SF-01 monthly baseline', () => {
  const { result, error } = calculate({
    billingCycle: 'monthly',
    pricePerSubscriber: 8,
    activePaidSubscribers: 500,
    refundRatePct: 4,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
    targetMonthlyNetIncome: 5000,
  });

  assert.equal(error, '');
  approx(result.grossBillings, 4000);
  approx(result.refundedBillings, 160);
  approx(result.netBillingsAfterRefunds, 3840);
  approx(result.substackPlatformFee, 384);
  approx(result.processorVariableFee, 111.36);
  approx(result.processorFixedFeeTotal, 150);
  approx(result.recurringBillingFee, 26.88);
  approx(result.totalFees, 672.24);
  approx(result.netTakeHomePerCycle, 3167.76);
  approx(result.monthlyEquivalentNetTakeHome, 3167.76);
  approx(result.effectiveFeeRatePct, 16.806);
  assert.equal(result.requiredPaidSubscribers, 790);
});

test('TC-SF-02 annual baseline converts to monthly-equivalent', () => {
  const { result, error } = calculate({
    billingCycle: 'annual',
    pricePerSubscriber: 80,
    activePaidSubscribers: 500,
    refundRatePct: 4,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
    targetMonthlyNetIncome: 5000,
  });

  assert.equal(error, '');
  approx(result.grossBillings, 40000);
  approx(result.totalFees, 5372.4);
  approx(result.netTakeHomePerCycle, 33027.6);
  approx(result.monthlyEquivalentNetTakeHome, 2752.3, 0.0001);
  assert.equal(result.requiredPaidSubscribers, 909);
});

test('TC-SF-03 zero subscribers yields zero current fees but target math still works', () => {
  const { result, error } = calculate({
    billingCycle: 'monthly',
    pricePerSubscriber: 8,
    activePaidSubscribers: 0,
    refundRatePct: 4,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
    targetMonthlyNetIncome: 5000,
  });

  assert.equal(error, '');
  approx(result.grossBillings, 0);
  approx(result.totalFees, 0);
  approx(result.netTakeHomePerCycle, 0);
  approx(result.monthlyEquivalentNetTakeHome, 0);
  approx(result.effectiveFeeRatePct, 0);
  assert.equal(result.requiredPaidSubscribers, 790);
});

test('TC-SF-04 invalid price is rejected', () => {
  const { result, error } = calculate({
    pricePerSubscriber: 0,
  });

  assert.equal(result, null);
  assert.match(error, /pricePerSubscriber/);
});

test('TC-SF-05 invalid refund is rejected', () => {
  const monthly = validateInputs({ refundRatePct: 100, pricePerSubscriber: 8, activePaidSubscribers: 1, processingFixedFee: 0, targetMonthlyNetIncome: 0 });
  const negative = validateInputs({ refundRatePct: -1, pricePerSubscriber: 8, activePaidSubscribers: 1, processingFixedFee: 0, targetMonthlyNetIncome: 0 });

  assert.equal(monthly.ok, false);
  assert.equal(negative.ok, false);
});

test('TC-SF-06 impossible contribution returns null required subscribers', () => {
  const { result, error } = calculate({
    billingCycle: 'monthly',
    pricePerSubscriber: 1,
    activePaidSubscribers: 10,
    refundRatePct: 0,
    substackPlatformFeeRatePct: 60,
    processingFeeRatePct: 40,
    processingFixedFee: 1,
    recurringBillingFeeRatePct: 5,
    targetMonthlyNetIncome: 1000,
  });

  assert.equal(error, '');
  assert.equal(result.requiredPaidSubscribers, null);
  assert.ok(result.netContributionPerSubscriberPerCycle <= 0);
});

test('TC-SF-07 summary includes decision-ready fields', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  assert.match(result.summary, /Billing cycle: monthly/);
  assert.match(result.summary, /Price per subscriber: \$8\.00/);
  assert.match(result.summary, /Active paid subscribers: 500/);
  assert.match(result.summary, /Total fees: \$672\.24/);
  assert.match(result.summary, /Net take-home per cycle: \$3,167\.76/);
  assert.match(result.summary, /Required paid subscribers.*790/);
});

test('TC-SF-08 html contains required labels and guidance', () => {
  for (const token of [
    'Substack Fee Calculator | 서브스택 수수료 계산기',
    'Billing cycle',
    'Price per subscriber',
    'Active paid subscribers',
    'Recurring billing fee (%)',
    'Target monthly net income',
    'Copy summary',
    'planning model',
    '/assets/analytics.js',
    'script defer src="./calculator.js"'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SF-09 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'substack-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
