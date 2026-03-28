'use strict';

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Compute monthly payment using standard amortization formula.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - loan balance
 * @param {number} annualRate - annual interest rate as percentage (e.g. 5 for 5%)
 * @param {number} months - total months
 * @returns {number} monthly payment
 */
function monthlyPayment(principal, annualRate, months) {
  if (months <= 0) return 0;
  if (annualRate === 0) return round2(principal / months);
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, months);
  return round2(principal * r * factor / (factor - 1));
}

/**
 * Calculate refinance comparison metrics.
 * @param {object} opts
 * @param {number} opts.remainingBalance - current remaining loan balance (> 0)
 * @param {number} opts.currentRate      - current annual interest rate (%, 0-30)
 * @param {number} opts.remainingYears   - remaining years on current loan (integer, 1-50)
 * @param {number} opts.newRate          - new annual interest rate (%, 0-30)
 * @param {number} opts.newTermYears     - new loan term in years (integer, 1-50)
 * @param {number} opts.closingCosts     - refinance closing costs (>= 0)
 * @returns {object} result
 */
function calculate({ remainingBalance, currentRate, remainingYears, newRate, newTermYears, closingCosts }) {
  // Validation
  if (typeof remainingBalance !== 'number' || remainingBalance <= 0)
    throw new Error('remainingBalance must be a positive number');
  if (typeof currentRate !== 'number' || currentRate < 0 || currentRate > 30)
    throw new Error('currentRate must be between 0 and 30');
  if (!Number.isInteger(remainingYears) || remainingYears < 1 || remainingYears > 50)
    throw new Error('remainingYears must be an integer between 1 and 50');
  if (typeof newRate !== 'number' || newRate < 0 || newRate > 30)
    throw new Error('newRate must be between 0 and 30');
  if (!Number.isInteger(newTermYears) || newTermYears < 1 || newTermYears > 50)
    throw new Error('newTermYears must be an integer between 1 and 50');
  if (typeof closingCosts !== 'number' || closingCosts < 0)
    throw new Error('closingCosts must be a non-negative number');

  const currentMonths = remainingYears * 12;
  const newMonths = newTermYears * 12;

  const currentMonthlyPayment = monthlyPayment(remainingBalance, currentRate, currentMonths);
  const newMonthlyPayment = monthlyPayment(remainingBalance, newRate, newMonths);
  const monthlySavings = round2(currentMonthlyPayment - newMonthlyPayment);

  // Break-even
  let breakEvenMonths = null;
  if (monthlySavings > 0) {
    breakEvenMonths = closingCosts === 0 ? 0 : Math.ceil(closingCosts / monthlySavings);
  }

  // Total interest
  const currentTotalInterest = round2(currentMonthlyPayment * currentMonths - remainingBalance);
  const newTotalInterest = round2(newMonthlyPayment * newMonths - remainingBalance);
  const totalInterestSaved = round2(currentTotalInterest - newTotalInterest);
  const netSavings = round2(totalInterestSaved - closingCosts);

  // Recommendation
  let recommendation;
  if (monthlySavings <= 0 || netSavings <= 0) {
    recommendation = 'STAY';
  } else if (breakEvenMonths !== null && breakEvenMonths > newMonths * 0.6) {
    recommendation = 'MARGINAL';
  } else {
    recommendation = 'REFINANCE';
  }

  // Year-by-year balance projection for chart
  const currentProjection = [];
  const newProjection = [];

  // Current loan balance progression
  let balCurrent = remainingBalance;
  const rCurrent = currentRate / 100 / 12;
  for (let m = 1; m <= currentMonths; m++) {
    const interest = balCurrent * rCurrent;
    const principal = currentMonthlyPayment - interest;
    balCurrent = Math.max(0, balCurrent - principal);
    if (m % 12 === 0 || m === currentMonths) {
      currentProjection.push({ month: m, balance: round2(balCurrent) });
    }
  }

  // New loan balance progression
  let balNew = remainingBalance;
  const rNew = newRate / 100 / 12;
  for (let m = 1; m <= newMonths; m++) {
    const interest = balNew * rNew;
    const principal = newMonthlyPayment - interest;
    balNew = Math.max(0, balNew - principal);
    if (m % 12 === 0 || m === newMonths) {
      newProjection.push({ month: m, balance: round2(balNew) });
    }
  }

  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySavings,
    breakEvenMonths,
    currentTotalInterest,
    newTotalInterest,
    totalInterestSaved,
    netSavings,
    recommendation,
    currentProjection,
    newProjection,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculate, monthlyPayment, round2 };
}
