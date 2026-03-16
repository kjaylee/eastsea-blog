'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const { calculate } = require('./calculator.js');

const BASE = { faceValue: 1000, couponRate: 5, currentPrice: 950, yearsToMaturity: 10, purchasePrice: 950, taxRate: 15, quantity: 10 };

// TC-01: Basic current yield and coupon income
test('TC-01: basic current yield and coupon income', () => {
  const r = calculate(BASE);
  assert.equal(r.currentYield, 5.26);
  assert.equal(r.annualCouponPerBond, 50);
  assert.equal(r.annualCouponIncome, 500);
});

// TC-02: YTM approximation (discount bond)
test('TC-02: YTM approximation', () => {
  const r = calculate(BASE);
  assert.equal(r.ytmApprox, 5.64);
});

// TC-03: After-tax annual income
test('TC-03: after-tax annual income', () => {
  const r = calculate(BASE);
  assert.equal(r.afterTaxAnnualIncome, 425);
  assert.equal(r.afterTaxYield, 4.47);
});

// TC-04: Capital gain (discount bond)
test('TC-04: capital gain on discount bond', () => {
  const r = calculate(BASE);
  assert.equal(r.capitalGainLoss, 500);
  assert.equal(r.totalInvestment, 9500);
});

// TC-05: Total return
test('TC-05: total return', () => {
  const r = calculate(BASE);
  assert.equal(r.totalCouponIncome, 5000);
  assert.equal(r.totalReturn, 5500);
});

// TC-06: Annualized return
test('TC-06: annualized return', () => {
  const r = calculate(BASE);
  assert.equal(r.annualizedReturn, 5.79);
});

// TC-07: Premium bond (price > face value)
test('TC-07: premium bond', () => {
  const r = calculate({ faceValue: 1000, couponRate: 7, currentPrice: 1100, yearsToMaturity: 5, purchasePrice: 1100, taxRate: 20, quantity: 5 });
  assert.equal(r.currentYield, 6.36);
  assert.equal(r.ytmApprox, 4.76);
  assert.equal(r.capitalGainLoss, -500);
  assert.equal(r.bondStatus, 'premium');
  assert.equal(r.annualizedReturn, 4.55);
});

// TC-08: Par bond (price = face value)
test('TC-08: par bond', () => {
  const r = calculate({ faceValue: 1000, couponRate: 4, currentPrice: 1000, yearsToMaturity: 20, purchasePrice: 1000, taxRate: 0, quantity: 1 });
  assert.equal(r.currentYield, 4);
  assert.equal(r.ytmApprox, 4);
  assert.equal(r.capitalGainLoss, 0);
  assert.equal(r.bondStatus, 'par');
});

// TC-09: Zero coupon bond
test('TC-09: zero coupon bond', () => {
  const r = calculate({ faceValue: 1000, couponRate: 0, currentPrice: 600, yearsToMaturity: 10, purchasePrice: 600, taxRate: 15, quantity: 1 });
  assert.equal(r.currentYield, 0);
  assert.equal(r.annualCouponIncome, 0);
  assert.equal(r.capitalGainLoss, 400);
  assert.equal(r.ytmApprox, 5);
});

// TC-10: High coupon, single bond
test('TC-10: high coupon single bond', () => {
  const r = calculate({ faceValue: 5000, couponRate: 8, currentPrice: 4800, yearsToMaturity: 15, purchasePrice: 4800, taxRate: 25, quantity: 1 });
  assert.equal(r.annualCouponPerBond, 400);
  assert.equal(r.currentYield, 8.33);
  assert.equal(r.afterTaxAnnualIncome, 300);
});

// TC-11: Projection year 1 and year 5
test('TC-11: projection cumulative values', () => {
  const r = calculate(BASE);
  assert.equal(r.projections[0].year, 1);
  assert.equal(r.projections[0].cumulative, 500);
  assert.equal(r.projections[0].afterTaxIncome, 425);
  assert.equal(r.projections[4].year, 5);
  assert.equal(r.projections[4].cumulative, 2500);
});

// TC-12: Validation errors
test('TC-12: validation errors', () => {
  assert.throws(() => calculate({ ...BASE, faceValue: -1 }), /faceValue must be a positive number/);
  assert.throws(() => calculate({ ...BASE, yearsToMaturity: 0 }), /yearsToMaturity must be an integer between 1 and 50/);
  assert.throws(() => calculate({ ...BASE, taxRate: 60 }), /taxRate must be between 0 and 50/);
  assert.throws(() => calculate({ ...BASE, quantity: 0 }), /quantity must be an integer between 1 and 10000/);
});
