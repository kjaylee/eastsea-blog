const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance) {
  tolerance = tolerance || 0.02;
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    'expected ' + actual + ' ≈ ' + expected + ' (±' + tolerance + ')'
  );
}

var baseInput = {
  annualGrossWages: 75000,
  numberOfEmployees: 1,
  socialSecurityRate: 6.2,
  socialSecurityWageBase: 176100,
  medicareRate: 1.45,
  additionalMedicareRate: 0.9,
  additionalMedicareThreshold: 200000,
  futaRate: 0.6,
  futaWageBase: 7000,
  sutaRate: 2.7,
  sutaWageBase: 7000
};

test('TC-01 Baseline $75,000 salary', function () {
  var out = calculate(baseInput, { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  // SS: 75000 * 0.062 = 4650
  approx(r.employeeSocialSecurity, 4650.00);
  approx(r.employerSocialSecurity, 4650.00);
  // Medicare: 75000 * 0.0145 = 1087.50
  approx(r.employeeMedicare, 1087.50);
  approx(r.employerMedicare, 1087.50);
  // Additional Medicare: 0 (below threshold)
  approx(r.employeeAdditionalMedicare, 0);
  // FUTA: 7000 * 0.006 = 42
  approx(r.futaTax, 42.00);
  // SUTA: 7000 * 0.027 = 189
  approx(r.sutaTax, 189.00);
  // Total employee: 4650 + 1087.50 = 5737.50
  approx(r.totalEmployeeTax, 5737.50);
  // Total employer: 4650 + 1087.50 + 42 + 189 = 5968.50
  approx(r.totalEmployerTax, 5968.50);
  // Total payroll: 5737.50 + 5968.50 = 11706.00
  approx(r.totalPayrollTax, 11706.00);
  // Net: 75000 - 5737.50 = 69262.50
  approx(r.netTakeHome, 69262.50);
});

test('TC-02 High earner $250,000 (above SS wage base and Medicare threshold)', function () {
  var out = calculate(Object.assign({}, baseInput, { annualGrossWages: 250000 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  // SS: min(250000, 176100) * 0.062 = 176100 * 0.062 = 10918.20
  approx(r.employeeSocialSecurity, 10918.20);
  approx(r.employerSocialSecurity, 10918.20);
  // Medicare: 250000 * 0.0145 = 3625.00
  approx(r.employeeMedicare, 3625.00);
  // Additional Medicare: (250000 - 200000) * 0.009 = 450.00
  approx(r.employeeAdditionalMedicare, 450.00);
  // Total employee: 10918.20 + 3625 + 450 = 14993.20
  approx(r.totalEmployeeTax, 14993.20);
  // Total employer: 10918.20 + 3625 + 42 + 189 = 14774.20
  approx(r.totalEmployerTax, 14774.20);
});

test('TC-03 Minimum wage $15,080', function () {
  var out = calculate(Object.assign({}, baseInput, { annualGrossWages: 15080 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  // SS: 15080 * 0.062 = 934.96
  approx(r.employeeSocialSecurity, 934.96);
  // Medicare: 15080 * 0.0145 = 218.66
  approx(r.employeeMedicare, 218.66);
  approx(r.employeeAdditionalMedicare, 0);
  // FUTA: 7000 * 0.006 = 42
  approx(r.futaTax, 42.00);
  // SUTA: 7000 * 0.027 = 189
  approx(r.sutaTax, 189.00);
});

test('TC-04 Exactly at SS wage base ($176,100)', function () {
  var out = calculate(Object.assign({}, baseInput, { annualGrossWages: 176100 }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  // SS: 176100 * 0.062 = 10918.20
  approx(r.employeeSocialSecurity, 10918.20);
  approx(r.employerSocialSecurity, 10918.20);
  // Medicare: 176100 * 0.0145 = 2553.45
  approx(r.employeeMedicare, 2553.45);
  // Additional Medicare: 0 (176100 < 200000)
  approx(r.employeeAdditionalMedicare, 0);
});

test('TC-05 Multiple employees (3 at $50,000)', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualGrossWages: 50000,
    numberOfEmployees: 3
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  var a = out.result.annual;
  // Per-employee SS: 50000 * 0.062 = 3100
  approx(r.employeeSocialSecurity, 3100.00);
  // Per-employee total employee: 3100 + 725 = 3825
  approx(r.totalEmployeeTax, 3825.00);
  // Per-employee total employer: 3100 + 725 + 42 + 189 = 4056
  approx(r.totalEmployerTax, 4056.00);
  // Annual totals x3
  approx(a.totalPayrollTax, (3825 + 4056) * 3, 0.1);
  approx(a.totalCostToEmployer, (50000 + 4056) * 3, 0.1);
});

test('TC-06 Custom SUTA rate (5.4% on $10,000 base)', function () {
  var out = calculate(Object.assign({}, baseInput, {
    sutaRate: 5.4,
    sutaWageBase: 10000
  }), { lang: 'en' });
  assert.equal(out.error, '');
  // SUTA: 10000 * 0.054 = 540
  approx(out.result.perEmployee.sutaTax, 540.00);
});

test('TC-07 Zero FUTA/SUTA rates', function () {
  var out = calculate(Object.assign({}, baseInput, {
    futaRate: 0,
    sutaRate: 0
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  approx(r.futaTax, 0);
  approx(r.sutaTax, 0);
  // Employer tax = SS + Medicare only: 4650 + 1087.50 = 5737.50
  approx(r.totalEmployerTax, 5737.50);
});

test('TC-08 Wages exactly at additional Medicare threshold ($200,000)', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualGrossWages: 200000
  }), { lang: 'en' });
  assert.equal(out.error, '');
  // At exactly threshold, no additional Medicare
  approx(out.result.perEmployee.employeeAdditionalMedicare, 0);
});

test('TC-09 Wages just above Medicare threshold ($200,001)', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualGrossWages: 200001
  }), { lang: 'en' });
  assert.equal(out.error, '');
  // Additional Medicare: 1 * 0.009 = 0.01 (rounded)
  approx(out.result.perEmployee.employeeAdditionalMedicare, 0.01);
});

test('TC-10 Validation rejects negative wages', function () {
  var out = calculate(Object.assign({}, baseInput, { annualGrossWages: -1000 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-11 Validation rejects zero employees', function () {
  var out = calculate(Object.assign({}, baseInput, { numberOfEmployees: 0 }), { lang: 'en' });
  assert.equal(out.result, null);
  assert.notEqual(out.error, '');
});

test('TC-12 Very high salary $1,000,000', function () {
  var out = calculate(Object.assign({}, baseInput, {
    annualGrossWages: 1000000
  }), { lang: 'en' });
  assert.equal(out.error, '');
  var r = out.result.perEmployee;
  // SS capped: 176100 * 0.062 = 10918.20
  approx(r.employeeSocialSecurity, 10918.20);
  // Medicare: 1000000 * 0.0145 = 14500
  approx(r.employeeMedicare, 14500.00);
  // Additional Medicare: (1000000 - 200000) * 0.009 = 7200
  approx(r.employeeAdditionalMedicare, 7200.00);
  // Total employee: 10918.20 + 14500 + 7200 = 32618.20
  approx(r.totalEmployeeTax, 32618.20);
  // Net: 1000000 - 32618.20 = 967381.80
  approx(r.netTakeHome, 967381.80);
  // FUTA still capped at 7000: 42
  approx(r.futaTax, 42.00);
  // Effective employee rate: 32618.20 / 1000000 * 100 = 3.26%
  approx(r.effectiveEmployeeRate, 3.26);
});
