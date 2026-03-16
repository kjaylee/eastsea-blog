'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const { calculate } = require('./calculator.js');

const BASE = { sharePrice: 150, annualDividend: 6, shares: 100, purchasePrice: 120, growthRate: 5, years: 10, taxRate: 15 };

// TC-01: Basic dividend yield
test('TC-01: basic dividend yield', () => {
  const r = calculate(BASE);
  assert.equal(r.dividendYield, 4);
  assert.equal(r.annualIncome, 600);
  assert.equal(r.monthlyIncome, 50);
});

// TC-02: Yield on cost
test('TC-02: yield on cost', () => {
  const r = calculate(BASE);
  assert.equal(r.yieldOnCost, 5);
});

// TC-03: After-tax income
test('TC-03: after-tax income', () => {
  const r = calculate(BASE);
  assert.equal(r.afterTaxAnnualIncome, 510);
  assert.equal(r.afterTaxMonthlyIncome, 42.5);
});

// TC-04: Capital gain calculation
test('TC-04: capital gain', () => {
  const r = calculate(BASE);
  assert.equal(r.totalCostBasis, 12000);
  assert.equal(r.currentValue, 15000);
  assert.equal(r.capitalGain, 3000);
  assert.equal(r.capitalGainPct, 25);
});

// TC-05: Zero dividend
test('TC-05: zero dividend', () => {
  const r = calculate({ sharePrice: 100, annualDividend: 0, shares: 50, purchasePrice: 80, growthRate: 0, years: 5, taxRate: 15 });
  assert.equal(r.dividendYield, 0);
  assert.equal(r.annualIncome, 0);
  assert.equal(r.monthlyIncome, 0);
});

// TC-06: High yield stock
test('TC-06: high yield stock', () => {
  const r = calculate({ sharePrice: 20, annualDividend: 2, shares: 500, purchasePrice: 25, growthRate: 3, years: 5, taxRate: 20 });
  assert.equal(r.dividendYield, 10);
  assert.equal(r.annualIncome, 1000);
  assert.equal(r.yieldOnCost, 8);
});

// TC-07: Zero tax rate
test('TC-07: zero tax rate', () => {
  const r = calculate({ sharePrice: 50, annualDividend: 2.50, shares: 200, purchasePrice: 50, growthRate: 5, years: 10, taxRate: 0 });
  assert.equal(r.afterTaxAnnualIncome, 500);
});

// TC-08: Projection year 1 dividend growth
test('TC-08: projection year 1', () => {
  const r = calculate(BASE);
  const p = r.projections[0];
  assert.equal(p.year, 1);
  assert.equal(p.dividendPerShare, 6.3);
  assert.equal(p.annualIncome, 630);
  assert.equal(p.cumulative, 630);
});

// TC-09: Projection year 2
test('TC-09: projection year 2', () => {
  const r = calculate(BASE);
  const p = r.projections[1];
  assert.equal(p.year, 2);
  assert.equal(p.dividendPerShare, 6.62);
  assert.equal(p.annualIncome, 662);
  assert.equal(p.cumulative, 1292);
});

// TC-10: Projection year 10
test('TC-10: projection year 10', () => {
  const r = calculate(BASE);
  const p = r.projections[9];
  assert.equal(p.year, 10);
  assert.equal(p.dividendPerShare, 9.77);
});

// TC-11: Single share, penny dividend
test('TC-11: penny dividend', () => {
  const r = calculate({ sharePrice: 1000, annualDividend: 0.01, shares: 1, purchasePrice: 950, growthRate: 0, years: 1, taxRate: 0 });
  assert.equal(r.dividendYield, 0);
  assert.equal(r.annualIncome, 0.01);
  assert.equal(r.monthlyIncome, 0);
});

// TC-12: Capital loss scenario
test('TC-12: capital loss', () => {
  const r = calculate({ sharePrice: 40, annualDividend: 3, shares: 100, purchasePrice: 60, growthRate: 2, years: 5, taxRate: 15 });
  assert.equal(r.capitalGain, -2000);
  assert.equal(r.capitalGainPct, -33.33);
});
