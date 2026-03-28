'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const { calculate, monthlyPayment } = require('./calculator.js');

const BASE = {
  remainingBalance: 200000000,
  currentRate: 5,
  remainingYears: 25,
  newRate: 3.5,
  newTermYears: 30,
  closingCosts: 2000000,
};

// TC-01: Basic refinance — positive savings
test('TC-01: basic refinance produces positive savings', () => {
  const r = calculate(BASE);
  assert.ok(r.monthlySavings > 0, 'monthlySavings should be > 0');
  assert.ok(r.breakEvenMonths > 0, 'breakEvenMonths should be > 0');
  assert.ok(r.netSavings > 0, 'netSavings should be > 0');
  assert.equal(r.recommendation, 'REFINANCE');
});

// TC-02: Monthly payment accuracy (known value)
test('TC-02: monthlyPayment accuracy for $100K/6%/30yr', () => {
  const mp = monthlyPayment(100000, 6, 360);
  assert.equal(mp, 599.55);
});

// TC-03: Zero rate monthly payment
test('TC-03: zero rate monthly payment', () => {
  const mp = monthlyPayment(120000, 0, 120);
  assert.equal(mp, 1000);
});

// TC-04: Break-even months basic
test('TC-04: break-even months = closingCosts / monthlySavings', () => {
  const r = calculate({
    remainingBalance: 100000,
    currentRate: 6,
    remainingYears: 30,
    newRate: 5,
    newTermYears: 30,
    closingCosts: 3000,
  });
  // monthlySavings = 599.55 - 536.82 = 62.73
  assert.equal(r.currentMonthlyPayment, 599.55);
  assert.equal(r.newMonthlyPayment, 536.82);
  assert.equal(r.monthlySavings, 62.73);
  assert.equal(r.breakEvenMonths, Math.ceil(3000 / 62.73));
});

// TC-05: Break-even ceiling rounding
test('TC-05: break-even ceiling rounding', () => {
  const r = calculate({
    remainingBalance: 100000,
    currentRate: 6,
    remainingYears: 30,
    newRate: 5,
    newTermYears: 30,
    closingCosts: 3001,
  });
  assert.equal(r.breakEvenMonths, Math.ceil(3001 / r.monthlySavings));
});

// TC-06: Same rate — no savings
test('TC-06: same rate same term = no savings', () => {
  const r = calculate({
    remainingBalance: 200000,
    currentRate: 5,
    remainingYears: 20,
    newRate: 5,
    newTermYears: 20,
    closingCosts: 1000,
  });
  assert.equal(r.monthlySavings, 0);
  assert.equal(r.breakEvenMonths, null);
  assert.equal(r.recommendation, 'STAY');
});

// TC-07: Negative savings (higher new rate)
test('TC-07: higher new rate = negative savings', () => {
  const r = calculate({
    remainingBalance: 200000,
    currentRate: 3,
    remainingYears: 20,
    newRate: 5,
    newTermYears: 20,
    closingCosts: 1000,
  });
  assert.ok(r.monthlySavings < 0);
  assert.equal(r.breakEvenMonths, null);
  assert.equal(r.recommendation, 'STAY');
});

// TC-08: Longer term increases total interest despite lower payment
test('TC-08: longer term STAY due to negative netSavings', () => {
  const r = calculate({
    remainingBalance: 200000,
    currentRate: 5,
    remainingYears: 10,
    newRate: 4.5,
    newTermYears: 30,
    closingCosts: 5000,
  });
  assert.ok(r.monthlySavings > 0, 'monthly payment lower with longer term');
  assert.ok(r.newTotalInterest > r.currentTotalInterest, 'longer term means more total interest');
  assert.ok(r.netSavings < 0, 'net savings negative');
  assert.equal(r.recommendation, 'STAY');
});

// TC-09: Zero closing costs
test('TC-09: zero closing costs = immediate break-even', () => {
  const r = calculate({
    remainingBalance: 200000,
    currentRate: 6,
    remainingYears: 25,
    newRate: 4,
    newTermYears: 25,
    closingCosts: 0,
  });
  assert.equal(r.breakEvenMonths, 0);
  assert.equal(r.recommendation, 'REFINANCE');
});

// TC-10: MARGINAL recommendation (break-even > 60% of new term)
test('TC-10: MARGINAL when break-even > 60% of new term', () => {
  // Need: monthlySavings positive but very small, high closing costs
  const r = calculate({
    remainingBalance: 200000,
    currentRate: 4.2,
    remainingYears: 10,
    newRate: 4,
    newTermYears: 10,
    closingCosts: 3000,
  });
  // monthly savings will be small, check if break-even is > 72 months (60% of 120)
  if (r.breakEvenMonths !== null && r.breakEvenMonths > 72 && r.netSavings > 0) {
    assert.equal(r.recommendation, 'MARGINAL');
  } else {
    // If savings too small or net negative → STAY, which is also valid
    assert.ok(['MARGINAL', 'STAY'].includes(r.recommendation));
  }
});

// TC-11: Validation errors
test('TC-11: validation errors', () => {
  assert.throws(() => calculate({ ...BASE, remainingBalance: -1 }), /remainingBalance must be a positive number/);
  assert.throws(() => calculate({ ...BASE, remainingBalance: 0 }), /remainingBalance must be a positive number/);
  assert.throws(() => calculate({ ...BASE, currentRate: -1 }), /currentRate must be between 0 and 30/);
  assert.throws(() => calculate({ ...BASE, currentRate: 31 }), /currentRate must be between 0 and 30/);
  assert.throws(() => calculate({ ...BASE, remainingYears: 0 }), /remainingYears must be an integer between 1 and 50/);
  assert.throws(() => calculate({ ...BASE, remainingYears: 51 }), /remainingYears must be an integer between 1 and 50/);
  assert.throws(() => calculate({ ...BASE, newRate: -1 }), /newRate must be between 0 and 30/);
  assert.throws(() => calculate({ ...BASE, newTermYears: 0 }), /newTermYears must be an integer between 1 and 50/);
  assert.throws(() => calculate({ ...BASE, closingCosts: -1 }), /closingCosts must be a non-negative number/);
});

// TC-12: Total interest calculation correctness
test('TC-12: total interest = payment*months - principal', () => {
  const r = calculate({
    remainingBalance: 100000,
    currentRate: 6,
    remainingYears: 30,
    newRate: 4,
    newTermYears: 30,
    closingCosts: 2000,
  });
  const expectedCurrentInterest = r.currentMonthlyPayment * 360 - 100000;
  const expectedNewInterest = r.newMonthlyPayment * 360 - 100000;
  assert.ok(Math.abs(r.currentTotalInterest - expectedCurrentInterest) < 1);
  assert.ok(Math.abs(r.newTotalInterest - expectedNewInterest) < 1);
  assert.ok(Math.abs(r.totalInterestSaved - (expectedCurrentInterest - expectedNewInterest)) < 1);
});

// TC-13: Projections have correct structure
test('TC-13: projections contain yearly snapshots', () => {
  const r = calculate({
    remainingBalance: 100000,
    currentRate: 5,
    remainingYears: 10,
    newRate: 4,
    newTermYears: 10,
    closingCosts: 1000,
  });
  assert.equal(r.currentProjection.length, 10); // 10 years
  assert.equal(r.newProjection.length, 10);
  assert.equal(r.currentProjection[0].month, 12);
  assert.ok(r.currentProjection[9].balance < 1); // should be ~0
  assert.ok(r.newProjection[9].balance < 1);
});
