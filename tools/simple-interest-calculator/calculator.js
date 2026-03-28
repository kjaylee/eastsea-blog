/**
 * Simple Interest Calculator — pure logic module
 *
 * Core formula: I = P × R × T / 100
 * Where: P = principal, R = annual rate (%), T = time in years
 *
 * Also solves for any missing variable given the other three.
 */

function calcInterest(principal, rate, years) {
  if (!isFinite(principal) || !isFinite(rate) || !isFinite(years))
    return { error: 'Invalid input' };
  if (principal < 0 || rate < 0 || years < 0)
    return { error: 'Values must be non-negative' };
  const interest = principal * rate * years / 100;
  const total = principal + interest;
  return { interest, total, principal, rate, years, error: null };
}

function solveForPrincipal(interest, rate, years) {
  if (!isFinite(interest) || !isFinite(rate) || !isFinite(years))
    return { error: 'Invalid input' };
  if (rate <= 0 || years <= 0)
    return { error: 'Rate and time must be positive' };
  if (interest < 0) return { error: 'Interest must be non-negative' };
  const principal = (interest * 100) / (rate * years);
  return { principal, error: null };
}

function solveForRate(principal, interest, years) {
  if (!isFinite(principal) || !isFinite(interest) || !isFinite(years))
    return { error: 'Invalid input' };
  if (principal <= 0 || years <= 0)
    return { error: 'Principal and time must be positive' };
  if (interest < 0) return { error: 'Interest must be non-negative' };
  const rate = (interest * 100) / (principal * years);
  return { rate, error: null };
}

function solveForTime(principal, rate, interest) {
  if (!isFinite(principal) || !isFinite(rate) || !isFinite(interest))
    return { error: 'Invalid input' };
  if (principal <= 0 || rate <= 0)
    return { error: 'Principal and rate must be positive' };
  if (interest < 0) return { error: 'Interest must be non-negative' };
  const years = (interest * 100) / (principal * rate);
  return { years, error: null };
}

function yearlySchedule(principal, rate, years) {
  if (!isFinite(principal) || !isFinite(rate) || !isFinite(years))
    return { error: 'Invalid input' };
  if (principal < 0 || rate < 0 || years < 0)
    return { error: 'Values must be non-negative' };
  const maxYears = Math.min(Math.ceil(years), 100);
  const annualInterest = principal * rate / 100;
  const schedule = [];
  for (let y = 1; y <= maxYears; y++) {
    const factor = y <= years ? 1 : (years - Math.floor(years));
    const yearInterest = y <= Math.floor(years) ? annualInterest : annualInterest * (years - Math.floor(years));
    const cumInterest = y <= Math.floor(years)
      ? annualInterest * y
      : annualInterest * Math.floor(years) + annualInterest * (years - Math.floor(years));
    schedule.push({
      year: y,
      interest: y <= Math.floor(years) ? annualInterest : annualInterest * (years - Math.floor(years)),
      cumInterest,
      balance: principal + cumInterest
    });
  }
  return { schedule, error: null };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcInterest, solveForPrincipal, solveForRate, solveForTime, yearlySchedule };
}
