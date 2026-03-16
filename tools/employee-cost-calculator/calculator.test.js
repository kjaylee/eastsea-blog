const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate } = require('./calculator.js');

function approx(actual, expected, tolerance) {
  tolerance = tolerance || 0.01;
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    'expected ' + actual + ' ≈ ' + expected + ' (±' + tolerance + ')'
  );
}

var baseInput = {
  annualSalary: 75000,
  workingHoursPerWeek: 40,
  paidWeeksPerYear: 52,
  paidTimeOffDays: 15,
  socialSecurityRate: 6.2,
  socialSecurityWageCap: 168600,
  medicareRate: 1.45,
  futaRate: 0.6,
  futaWageCap: 7000,
  sutaRate: 2.7,
  sutaWageCap: 7000,
  healthInsurance: 7500,
  dentalVision: 600,
  retirementMatchRate: 4,
  workersCompRate: 1,
  equipmentCost: 3000,
  officeCost: 5000,
  trainingCost: 1000,
  otherOverhead: 0
};

test('TC-01 Baseline US employee $75k salary', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.socialSecurityTax, 4650);
  approx(r.medicareTax, 1087.50);
  approx(r.futaTax, 42);
  approx(r.sutaTax, 189);
  approx(r.payrollTaxTotal, 5968.50);

  approx(r.retirementMatch, 3000);
  approx(r.workersComp, 750);
  approx(r.benefitsTotal, 11850);

  approx(r.overheadTotal, 9000);
  approx(r.totalAnnualCost, 101818.50);
  approx(r.monthlyCost, 8484.88, 0.01);
  approx(r.productiveHours, 1960);
  approx(r.effectiveHourlyCost, 51.95, 0.01);
  approx(r.overheadMultiplier, 1.3576, 0.001);
});

test('TC-02 High earner above SS wage cap $200k', function () {
  var out = calculate(Object.assign({}, baseInput, { annualSalary: 200000 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.socialSecurityTax, 10453.20);
  approx(r.medicareTax, 2900);
  approx(r.futaTax, 42);
  approx(r.sutaTax, 189);
  approx(r.payrollTaxTotal, 13584.20);

  approx(r.retirementMatch, 8000);
  approx(r.workersComp, 2000);
  approx(r.benefitsTotal, 18100);
  approx(r.totalAnnualCost, 240684.20);
});

test('TC-03 Part-time $20k salary, 20h/wk', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualSalary: 20000,
    workingHoursPerWeek: 20
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.socialSecurityTax, 1240);
  approx(r.medicareTax, 290);
  approx(r.payrollTaxTotal, 1761);

  approx(r.benefitsTotal, 9100);
  approx(r.totalAnnualCost, 39861);

  // productive hours: 52*20 - 15*4 = 1040 - 60 = 980
  approx(r.productiveHours, 980);
  approx(r.effectiveHourlyCost, 40.67, 0.01);
});

test('TC-04 Zero benefits and overhead', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualSalary: 50000,
    healthInsurance: 0,
    dentalVision: 0,
    retirementMatchRate: 0,
    workersCompRate: 0,
    equipmentCost: 0,
    officeCost: 0,
    trainingCost: 0,
    otherOverhead: 0
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  // SS: 50000*0.062=3100, Medicare: 50000*0.0145=725, FUTA: 42, SUTA: 189
  approx(r.payrollTaxTotal, 4056);
  approx(r.benefitsTotal, 0);
  approx(r.overheadTotal, 0);
  approx(r.totalAnnualCost, 54056);
});

test('TC-05 No PTO means more productive hours', function () {
  var out = calculate(Object.assign({}, baseInput, {
    paidTimeOffDays: 0
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.productiveHours, 2080);
  approx(r.totalAnnualCost, 101818.50);
  approx(r.effectiveHourlyCost, 48.95, 0.01);
});

test('TC-06 High state unemployment tax', function () {
  var out = calculate(Object.assign({}, baseInput, {
    sutaRate: 5.4,
    sutaWageCap: 56500
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  // SUTA: 56500*0.054 = 3051
  approx(r.sutaTax, 3051);
  // Tax total: 4650 + 1087.50 + 42 + 3051 = 8830.50
  approx(r.payrollTaxTotal, 8830.50);
});

test('TC-07 No retirement match', function () {
  var out = calculate(Object.assign({}, baseInput, {
    retirementMatchRate: 0
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  approx(r.retirementMatch, 0);
  // Benefits: 7500 + 600 + 0 + 750 = 8850
  approx(r.benefitsTotal, 8850);
  approx(r.totalAnnualCost, 98818.50);
});

test('TC-08 Validation rejects salary=0', function () {
  var out = calculate(Object.assign({}, baseInput, { annualSalary: 0 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-09 Validation rejects negative salary', function () {
  var out = calculate(Object.assign({}, baseInput, { annualSalary: -1 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-10 Validation rejects invalid hours', function () {
  var out1 = calculate(Object.assign({}, baseInput, { workingHoursPerWeek: 0 }), { lang: 'en' });
  assert.equal(out1.result, null);
  assert.notEqual(out1.error, '');

  var out2 = calculate(Object.assign({}, baseInput, { workingHoursPerWeek: 200 }), { lang: 'en' });
  assert.equal(out2.result, null);
  assert.notEqual(out2.error, '');
});

test('TC-11 Summary contains required fields', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');

  assert.match(out.result.summary, /Annual salary/);
  assert.match(out.result.summary, /75,000\.00/);
  assert.match(out.result.summary, /Total annual cost/);
  assert.match(out.result.summary, /101,818\.50/);
  assert.match(out.result.summary, /Monthly cost/);
  assert.match(out.result.summary, /Effective hourly cost/);
  assert.match(out.result.summary, /Overhead multiplier/);
  assert.match(out.result.summary, /Payroll taxes/);
});

test('TC-12 Salary exactly at SS wage cap', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualSalary: 168600
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result;

  // SS: 168600 * 0.062 = 10453.20 (exactly at cap, no excess)
  approx(r.socialSecurityTax, 10453.20);
  approx(r.medicareTax, 2444.70);
});
