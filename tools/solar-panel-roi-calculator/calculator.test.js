/* Solar Panel ROI Calculator — Unit Tests */
const { calculate } = require('./calculator.js');

const DEFAULTS = {
  systemSizeKw: 6, costPerWatt: 2.80, sunHoursPerDay: 5,
  degradationRate: 0.5, lifespanYears: 25, monthlyBill: 150,
  electricityRate: 0.15, annualRateIncrease: 3,
  federalTaxCredit: 30, stateIncentive: 0,
  loanInterestRate: 0, loanTermYears: 0
};

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fail++; console.error('  ❌ ' + msg); }
}

function assertClose(a, b, tolerance, msg) {
  const diff = Math.abs(a - b);
  assert(diff <= tolerance, msg + ' (got ' + a + ', expected ~' + b + ', tol ' + tolerance + ')');
}

/* Test 1: Total system cost */
console.log('Test 1: Total system cost');
(function () {
  const r = calculate(DEFAULTS);
  // 6kW * 1000 * $2.80 = $16,800
  assert(r.totalCost === 16800, 'Total cost = $16,800');
})();

/* Test 2: Federal tax credit */
console.log('Test 2: Federal tax credit');
(function () {
  const r = calculate(DEFAULTS);
  // 30% of $16,800 = $5,040
  assert(r.federalCredit === 5040, 'Federal credit = $5,040');
  // Net cost = $16,800 - $5,040 = $11,760
  assert(r.netCost === 11760, 'Net cost = $11,760');
})();

/* Test 3: Year 1 production */
console.log('Test 3: Year 1 production');
(function () {
  const r = calculate(DEFAULTS);
  // 6kW * 5 hours * 365 = 10,950 kWh
  assert(r.year1Production === 10950, 'Year 1 production = 10,950 kWh');
})();

/* Test 4: Year 1 savings */
console.log('Test 4: Year 1 savings');
(function () {
  const r = calculate(DEFAULTS);
  // 10,950 kWh * $0.15 = $1,642.50, but capped at annual bill = $1,800
  // So savings = $1,642 (rounded)
  assertClose(r.year1Savings, 1642, 1, 'Year 1 savings ~$1,642');
})();

/* Test 5: Payback period exists within 25 years */
console.log('Test 5: Payback period');
(function () {
  const r = calculate(DEFAULTS);
  assert(r.paybackYear !== null, 'Payback achieved within lifespan');
  assert(r.paybackYear > 0 && r.paybackYear <= 25, 'Payback year is between 1-25');
  // Net cost $11,760, ~$1,642/yr year 1 growing 3%/yr → ~7 years
  assert(r.paybackYear >= 5 && r.paybackYear <= 10, 'Payback ~7 years for defaults');
})();

/* Test 6: ROI is positive with defaults */
console.log('Test 6: ROI positive');
(function () {
  const r = calculate(DEFAULTS);
  assert(r.roi > 0, 'ROI is positive');
  assert(r.netSavings > 0, 'Net savings is positive');
})();

/* Test 7: Degradation reduces later years */
console.log('Test 7: Degradation effect');
(function () {
  const r = calculate(DEFAULTS);
  assert(r.yearly[0].production > r.yearly[24].production, 'Year 25 production < Year 1');
  // 0.5% degradation over 24 years: factor = (1-0.005)^24 ≈ 0.8868
  const expectedY25 = Math.round(10950 * Math.pow(0.995, 24));
  assertClose(r.yearly[24].production, expectedY25, 2, 'Year 25 production matches degradation formula');
})();

/* Test 8: Loan calculation */
console.log('Test 8: Loan calculation');
(function () {
  const p = Object.assign({}, DEFAULTS, { loanInterestRate: 5, loanTermYears: 15 });
  const r = calculate(p);
  assert(r.hasLoan === true, 'Loan detected');
  assert(r.monthlyPayment > 0, 'Monthly payment > 0');
  assert(r.totalInterest > 0, 'Total interest > 0');
  // Monthly payment for $11,760 at 5% over 15 years ≈ $93
  assertClose(r.monthlyPayment, 93, 5, 'Monthly payment ~$93');
})();

/* Test 9: State incentive reduces net cost */
console.log('Test 9: State incentive');
(function () {
  const p = Object.assign({}, DEFAULTS, { stateIncentive: 2000 });
  const r = calculate(p);
  assert(r.netCost === 9760, 'Net cost with $2000 state incentive = $9,760');
  // Should have shorter payback
  const baseline = calculate(DEFAULTS);
  assert(r.paybackYear < baseline.paybackYear, 'Payback shorter with state incentive');
})();

/* Test 10: Bill cap — savings never exceed actual bill */
console.log('Test 10: Bill cap');
(function () {
  const p = Object.assign({}, DEFAULTS, { systemSizeKw: 20, monthlyBill: 50 });
  const r = calculate(p);
  // Annual bill = $600, production 20*5*365=36,500 kWh * $0.15 = $5,475
  // Should be capped at $600
  assert(r.year1Savings === 600, 'Year 1 savings capped at annual bill ($600)');
})();

/* Test 11: Yearly table has correct length */
console.log('Test 11: Table length');
(function () {
  const r = calculate(DEFAULTS);
  assert(r.yearly.length === 25, '25 yearly rows');
  const p30 = Object.assign({}, DEFAULTS, { lifespanYears: 30 });
  const r30 = calculate(p30);
  assert(r30.yearly.length === 30, '30 yearly rows for 30-year lifespan');
})();

/* Test 12: Net cost floor at 0 */
console.log('Test 12: Net cost floor');
(function () {
  const p = Object.assign({}, DEFAULTS, { federalTaxCredit: 90, stateIncentive: 5000 });
  const r = calculate(p);
  assert(r.netCost === 0, 'Net cost floored at $0 when credits exceed cost');
})();

/* ── Results ── */
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
