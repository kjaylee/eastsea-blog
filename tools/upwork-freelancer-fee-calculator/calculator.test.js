const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

// TC-01 baseline single contract with 10% fee, no extras
test('TC-01 baseline single contract', () => {
  const { result, error } = calculate({
    contractValue: 500,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossEarnings, 500.00);
  approx(result.upworkFee, 50.00);
  approx(result.currencyConversionFee, 0.00);
  approx(result.totalFees, 50.00);
  approx(result.freelancerPlusCost, 0.00);
  approx(result.netTakeHome, 450.00);
  approx(result.effectiveFeeRatePct, 10.00);
  approx(result.netPerContract, 450.00);
  assert.equal(result.requiredContractsForTarget, 0);
});

// TC-02 multiple contracts scale gross earnings correctly
test('TC-02 multiple contracts scale linearly', () => {
  const { result, error } = calculate({
    contractValue: 200,
    numberOfContracts: 5,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossEarnings, 1000.00);
  approx(result.upworkFee, 100.00);
  approx(result.netTakeHome, 900.00);
  approx(result.netPerContract, 180.00);
});

// TC-03 currency conversion fee stacks on top of Upwork fee
test('TC-03 currency conversion fee applied after Upwork fee', () => {
  const { result, error } = calculate({
    contractValue: 1000,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 2,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossEarnings, 1000.00);
  approx(result.upworkFee, 100.00);
  // 2% of afterUpworkFee (900) = 18
  approx(result.currencyConversionFee, 18.00);
  approx(result.totalFees, 118.00);
  approx(result.netTakeHome, 882.00);
});

// TC-04 Freelancer Plus subscription reduces net take-home
test('TC-04 Freelancer Plus monthly cost deducted', () => {
  const base = {
    contractValue: 500,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  };
  const withPlus = { ...base, freelancerPlusMonthlyCost: 14.99 };

  const r1 = calculate(base, { lang: 'en' }).result;
  const r2 = calculate(withPlus, { lang: 'en' }).result;

  approx(r1.netTakeHome - r2.netTakeHome, 14.99, 0.01);
  approx(r2.netTakeHome, 435.01, 0.01);
});

// TC-05 requiredContractsForTarget computed correctly
test('TC-05 required contracts for target monthly net', () => {
  const { result, error } = calculate({
    contractValue: 300,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 1000
  }, { lang: 'en' });

  assert.equal(error, '');
  // netPerContract = 300 * 0.9 = 270, ceil(1000/270) = 4
  assert.equal(result.requiredContractsForTarget, 4);
});

// TC-06 invalid inputs are rejected
test('TC-06 invalid inputs rejected', () => {
  const base = {
    contractValue: 500,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  };

  const badCases = [
    { ...base, contractValue: 0 },
    { ...base, contractValue: -100 },
    { ...base, numberOfContracts: 0 },
    { ...base, upworkFeePct: -5 },
    { ...base, upworkFeePct: 105 },
    { ...base, currencyConversionPct: -1 },
    { ...base, freelancerPlusMonthlyCost: -1 },
    { ...base, targetMonthlyNet: -500 }
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-07 summary contains all key fields
test('TC-07 summary includes all required fields', () => {
  const { result, error } = calculate({
    contractValue: 500,
    numberOfContracts: 2,
    upworkFeePct: 10,
    currencyConversionPct: 1,
    freelancerPlusMonthlyCost: 14.99,
    targetMonthlyNet: 800
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Gross earnings:/);
  assert.match(result.summary, /Upwork fee/);
  assert.match(result.summary, /Currency conversion fee/);
  assert.match(result.summary, /Total fees:/);
  assert.match(result.summary, /Freelancer Plus cost:/);
  assert.match(result.summary, /Net take-home:/);
  assert.match(result.summary, /Effective fee rate:/);
  assert.match(result.summary, /Net per contract:/);
  assert.match(result.summary, /Contracts needed/);
});

// TC-08 effective fee rate reflects all deductions
test('TC-08 effective fee rate accounts for Plus subscription', () => {
  const { result } = calculate({
    contractValue: 1000,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 100,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  // upworkFee=100, plus=100, total deductions=200 out of 1000 = 20%
  approx(result.effectiveFeeRatePct, 20.00);
  approx(result.netTakeHome, 800.00);
});

// TC-09 Korean locale returns translated status
test('TC-09 Korean locale returns Korean status text', () => {
  const { result, error } = calculate({
    contractValue: 500,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  }, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.status, /플러스/);
  assert.match(result.summary, /Upwork 프리랜서/);
});

// DEFAULTS export check
test('DEFAULTS export has expected shape', () => {
  assert.equal(typeof DEFAULTS.contractValue, 'number');
  assert.equal(typeof DEFAULTS.numberOfContracts, 'number');
  assert.equal(typeof DEFAULTS.upworkFeePct, 'number');
  assert.equal(DEFAULTS.contractValue, 500);
  assert.equal(DEFAULTS.upworkFeePct, 10);
  assert.equal(DEFAULTS.numberOfContracts, 1);
});
