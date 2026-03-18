var test = require('node:test');
var assert = require('node:assert/strict');

var calc = require('./calculator.js');
var calculate = calc.calculate;

function approx(actual, expected, tolerance) {
  tolerance = tolerance || 0.01;
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    'expected ' + actual + ' ≈ ' + expected + ' (±' + tolerance + ')'
  );
}

var baseInput = {
  annualSalary: 65000,
  totalEmployees: 100,
  turnoverRate: 15,
  jobPostingCost: 500,
  recruiterFeeRate: 0,
  referralBonus: 0,
  interviewsPerHire: 5,
  hoursPerInterview: 1,
  interviewerHourlyRate: 50,
  backgroundCheckCost: 100,
  trainingCost: 3000,
  adminCost: 500,
  vacancyDays: 40,
  rampUpMonths: 3,
  rampUpProductivity: 50
};

test('TC-01 Baseline $65k, 15% turnover, 100 employees', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  // dailySalary = 65000/260 = 250
  approx(r.separationCost, 500);
  approx(r.recruitmentCost, 500);
  approx(r.selectionCost, 350);    // 5*1*50 + 100
  approx(r.onboardingCost, 3000);
  approx(r.vacancyLoss, 10000);    // 40 * 250
  approx(r.rampUpLoss, 8125);      // 3 * (65000/12) * 0.50
  approx(r.costPerDeparture, 22475);
  assert.equal(r.departures, 15);
  approx(r.annualTurnoverCost, 337125);
  approx(r.salaryMultiple, 0.3458, 0.001);
  approx(r.monthlyCost, 28093.75);
});

test('TC-02 High earner $150k with 20% recruiter fee', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualSalary: 150000,
    recruiterFeeRate: 20
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  // recruitment = 500 + 150000*0.20 + 0 = 30500
  approx(r.recruitmentCost, 30500);
  // dailySalary = 150000/260 ≈ 576.923
  approx(r.vacancyLoss, 23076.92, 0.01);
  // rampUp = 3 * (150000/12) * 0.50 = 3 * 12500 * 0.50 = 18750
  approx(r.rampUpLoss, 18750);
  // total per departure = 500 + 30500 + 350 + 3000 + 23076.92 + 18750 = 76176.92
  approx(r.costPerDeparture, 76176.92, 0.01);
});

test('TC-03 Zero turnover rate — zero departures, $0 cost', function () {
  var out = calculate(Object.assign({}, baseInput, { turnoverRate: 0 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  assert.equal(r.departures, 0);
  approx(r.annualTurnoverCost, 0);
  approx(r.monthlyCost, 0);
});

test('TC-04 No vacancy, no ramp-up — hard costs only', function () {
  var out = calculate(Object.assign({}, baseInput, {
    vacancyDays: 0,
    rampUpMonths: 0
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.vacancyLoss, 0);
  approx(r.rampUpLoss, 0);
  // costPerDeparture = 500 + 500 + 350 + 3000 + 0 + 0 = 4350
  approx(r.costPerDeparture, 4350);
});

test('TC-05 100% turnover — all leave', function () {
  var out = calculate(Object.assign({}, baseInput, { turnoverRate: 100 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  assert.equal(r.departures, 100);
  approx(r.annualTurnoverCost, 22475 * 100);
});

test('TC-06 Validation rejects salary=0', function () {
  var out = calculate(Object.assign({}, baseInput, { annualSalary: 0 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-07 Validation rejects turnover > 100', function () {
  var out = calculate(Object.assign({}, baseInput, { turnoverRate: 101 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-08 Validation rejects totalEmployees < 1', function () {
  var out = calculate(Object.assign({}, baseInput, { totalEmployees: 0 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-09 Summary text contains key fields', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');

  assert.match(out.result.summary, /Annual salary/);
  assert.match(out.result.summary, /65,000\.00/);
  assert.match(out.result.summary, /Cost per departure/);
  assert.match(out.result.summary, /Annual turnover cost/);
  assert.match(out.result.summary, /Salary multiple/);
  assert.match(out.result.summary, /Savings if turnover reduced by 25%/);
  assert.match(out.result.summary, /Savings if turnover reduced by 50%/);
});

test('TC-10 Ramp-up productivity 0% = full salary loss', function () {
  var out = calculate(Object.assign({}, baseInput, { rampUpProductivity: 0 }), { lang: 'en' });
  assert.equal(out.error, '');
  // rampUpLoss = 3 * (65000/12) * 1.0 = 16250
  approx(out.result.rampUpLoss, 16250);
});

test('TC-11 Ramp-up productivity 100% = zero ramp loss', function () {
  var out = calculate(Object.assign({}, baseInput, { rampUpProductivity: 100 }), { lang: 'en' });
  assert.equal(out.error, '');
  approx(out.result.rampUpLoss, 0);
});

test('TC-12 Savings calculations', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.savings25, r.annualTurnoverCost * 0.25);
  approx(r.savings50, r.annualTurnoverCost * 0.50);
});

test('TC-13 Breakdown percentages sum to ~100', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  var total = 0;
  for (var i = 0; i < out.result.breakdown.length; i++) {
    total += out.result.breakdown[i].pct;
  }
  // Allow ±1% due to rounding
  assert.ok(total >= 99 && total <= 101, 'breakdown pct sum ' + total + ' should be ~100');
});

test('TC-14 Korean language output', function () {
  var out = calculate(baseInput, { lang: 'ko' });
  assert.equal(out.error, '');
  assert.match(out.result.summary, /연봉/);
  assert.match(out.result.summary, /이직률/);
  assert.match(out.result.summary, /1인당 이직 비용/);
});

test('TC-15 Validation rejects negative admin cost', function () {
  var out = calculate(Object.assign({}, baseInput, { adminCost: -1 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-16 Validation rejects rampUpMonths > 24', function () {
  var out = calculate(Object.assign({}, baseInput, { rampUpMonths: 25 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});
