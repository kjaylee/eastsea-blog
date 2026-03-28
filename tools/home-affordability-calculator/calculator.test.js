// Home Affordability Calculator — Test Suite (Node.js built-in test runner)
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  monthlyPaymentFactor,
  loanFromPayment,
  paymentFromLoan,
  calculateAffordability,
  compareAllLoanTypes,
  DTI_LIMITS
} = require('./calculator.js');

/* ─── Helper ─── */
function between(val, lo, hi, msg) {
  assert.ok(val >= lo && val <= hi,
    `${msg}: expected ${val} in [${lo}, ${hi}]`);
}

/* ─── Unit: monthlyPaymentFactor ─── */
describe('monthlyPaymentFactor', () => {
  it('6.5% 30yr ≈ 0.00632', () => {
    const M = monthlyPaymentFactor(0.065, 30);
    between(M, 0.00630, 0.00635, 'M factor');
  });
  it('0% rate degrades gracefully (no divide-by-zero)', () => {
    const M = monthlyPaymentFactor(0, 30);
    assert.ok(M > 0 && isFinite(M));
    // 0% → payment = principal / n, so factor = 1/(360)
    between(M, 0.00277, 0.00278, 'M at 0%');
  });
  it('7% 30yr ≈ 0.00665', () => {
    const M = monthlyPaymentFactor(0.07, 30);
    between(M, 0.00664, 0.00667, 'M at 7%');
  });
});

/* ─── Unit: loanFromPayment / paymentFromLoan round-trip ─── */
describe('loan ↔ payment round-trip', () => {
  it('$1000/mo at 6.5% 30yr → loan → back to $1000', () => {
    const loan = loanFromPayment(1000, 0.065, 30);
    const pay  = paymentFromLoan(loan, 0.065, 30);
    between(pay, 999.99, 1000.01, 'round-trip payment');
  });
});

/* ─── TC-1: Basic Conventional Loan ─── */
describe('TC-1: Basic Conventional ($100K, $0 debt, $60K down, 6.5%, 30yr)', () => {
  const r = calculateAffordability({
    annualIncome: 100000, monthlyDebts: 0, downPayment: 60000,
    interestRate: 0.065, loanTermYears: 30, loanType: 'conventional',
    propertyTaxRate: 0.012, annualInsurance: 1500, monthlyHOA: 0, pmiRate: 0.005
  });

  it('max home price in reasonable range', () => {
    between(r.maxHomePrice, 300000, 350000, 'maxHomePrice');
  });
  it('front-end DTI ≤ 28%', () => {
    assert.ok(r.frontEndDTI <= 0.2801, `frontEndDTI ${r.frontEndDTI}`);
  });
  it('back-end DTI ≤ 36% (no debts)', () => {
    assert.ok(r.backEndDTI <= 0.3601, `backEndDTI ${r.backEndDTI}`);
  });
  it('PMI applies (down < 20% of price)', () => {
    assert.ok(r.monthlyPMI > 0, 'PMI should be positive');
    assert.ok(60000 < 0.2 * r.maxHomePrice, 'down < 20%');
  });
  it('no warning', () => {
    assert.equal(r.warning, null);
  });
});

/* ─── TC-2: FHA Loan with Existing Debts ─── */
describe('TC-2: FHA ($60K income, $500 debt, $15K down, 7%, 30yr)', () => {
  const r = calculateAffordability({
    annualIncome: 60000, monthlyDebts: 500, downPayment: 15000,
    interestRate: 0.07, loanTermYears: 30, loanType: 'fha',
    propertyTaxRate: 0.015, annualInsurance: 1200, monthlyHOA: 200, pmiRate: 0.0085
  });

  it('max home price in range', () => {
    between(r.maxHomePrice, 130000, 180000, 'maxHomePrice');
  });
  it('front-end DTI ≤ 31%', () => {
    assert.ok(r.frontEndDTI <= 0.3101, `frontEndDTI ${r.frontEndDTI}`);
  });
  it('back-end DTI ≤ 43%', () => {
    assert.ok((r.totalMonthly + 500) / 5000 <= 0.4301,
      `backEndDTI ${r.backEndDTI}`);
  });
  it('PMI applies', () => {
    assert.ok(r.monthlyPMI > 0);
  });
});

/* ─── TC-3: VA Loan (no front-end, no PMI) ─── */
describe('TC-3: VA ($80K income, $300 debt, $0 down, 6%, 30yr)', () => {
  const r = calculateAffordability({
    annualIncome: 80000, monthlyDebts: 300, downPayment: 0,
    interestRate: 0.06, loanTermYears: 30, loanType: 'va',
    propertyTaxRate: 0.01, annualInsurance: 1200, monthlyHOA: 0, pmiRate: 0
  });

  it('max home price in range', () => {
    between(r.maxHomePrice, 330000, 400000, 'maxHomePrice');
  });
  it('no PMI for VA', () => {
    assert.equal(r.monthlyPMI, 0);
  });
  it('no front-end constraint (VA)', () => {
    // For VA, only back-end matters — front-end can exceed 28%
    const grossMo = 80000 / 12;
    const backEndActual = (r.totalMonthly + 300) / grossMo;
    assert.ok(backEndActual <= 0.4101, `VA backEnd ${backEndActual}`);
  });
});

/* ─── TC-4: Down Payment > 20% (no PMI) ─── */
describe('TC-4: High down payment ($120K income, $800 debt, $100K down, 6.5%, 30yr)', () => {
  const r = calculateAffordability({
    annualIncome: 120000, monthlyDebts: 800, downPayment: 100000,
    interestRate: 0.065, loanTermYears: 30, loanType: 'conventional',
    propertyTaxRate: 0.012, annualInsurance: 2000, monthlyHOA: 0, pmiRate: 0.005
  });

  it('max home price in range', () => {
    between(r.maxHomePrice, 380000, 500000, 'maxHomePrice');
  });
  it('no PMI when dp > 20%', () => {
    const ratio = 100000 / r.maxHomePrice;
    if (ratio >= 0.2) {
      assert.equal(r.monthlyPMI, 0, 'PMI should be 0');
    }
    // If ratio < 0.2, PMI is expected — either way is valid
  });
});

/* ─── TC-5: Very High Debt ─── */
describe('TC-5: Very high debt ($50K income, $2000 debt, $10K down)', () => {
  const r = calculateAffordability({
    annualIncome: 50000, monthlyDebts: 2000, downPayment: 10000,
    interestRate: 0.065, loanTermYears: 30, loanType: 'conventional',
    propertyTaxRate: 0.012, annualInsurance: 1500, monthlyHOA: 0, pmiRate: 0.005
  });

  it('should produce warning or very low price', () => {
    const hasWarning = r.warning !== null;
    const lowPrice   = r.maxHomePrice <= 10000;
    assert.ok(hasWarning || lowPrice,
      `Expected warning or low price, got price=${r.maxHomePrice} warning=${r.warning}`);
  });
});

/* ─── TC-6: Zero Interest Rate ─── */
describe('TC-6: Zero interest rate', () => {
  it('does not throw or produce NaN', () => {
    const r = calculateAffordability({
      annualIncome: 80000, monthlyDebts: 0, downPayment: 40000,
      interestRate: 0, loanTermYears: 30, loanType: 'conventional',
      propertyTaxRate: 0.012, annualInsurance: 1500, monthlyHOA: 0, pmiRate: 0.005
    });
    assert.ok(isFinite(r.maxHomePrice), 'maxHomePrice is finite');
    assert.ok(r.maxHomePrice > 40000, 'price > dp');
    assert.ok(isFinite(r.totalMonthly), 'totalMonthly is finite');
  });
});

/* ─── TC-7: Zero Income ─── */
describe('TC-7: Zero income', () => {
  const r = calculateAffordability({
    annualIncome: 0, monthlyDebts: 0, downPayment: 50000,
    interestRate: 0.065, loanTermYears: 30, loanType: 'conventional'
  });

  it('max price = down payment', () => {
    assert.equal(r.maxHomePrice, 50000);
  });
  it('max loan = 0', () => {
    assert.equal(r.maxLoan, 0);
  });
  it('has warning', () => {
    assert.ok(r.warning && r.warning.length > 0);
  });
});

/* ─── Comparison ─── */
describe('compareAllLoanTypes', () => {
  const cmp = compareAllLoanTypes({
    annualIncome: 80000, monthlyDebts: 400, downPayment: 30000,
    interestRate: 0.065, loanTermYears: 30,
    propertyTaxRate: 0.012, annualInsurance: 1500, monthlyHOA: 0, pmiRate: 0.005
  });

  it('returns all three loan types', () => {
    assert.ok(cmp.conventional);
    assert.ok(cmp.fha);
    assert.ok(cmp.va);
  });
  it('FHA allows higher price than conventional (more lenient DTI)', () => {
    assert.ok(cmp.fha.maxHomePrice >= cmp.conventional.maxHomePrice,
      `FHA ${cmp.fha.maxHomePrice} >= Conv ${cmp.conventional.maxHomePrice}`);
  });
  it('VA has no PMI', () => {
    assert.equal(cmp.va.monthlyPMI, 0);
  });
});

/* ─── DTI_LIMITS sanity ─── */
describe('DTI_LIMITS', () => {
  it('conventional 28/36', () => {
    assert.equal(DTI_LIMITS.conventional.frontEnd, 0.28);
    assert.equal(DTI_LIMITS.conventional.backEnd, 0.36);
  });
  it('FHA 31/43', () => {
    assert.equal(DTI_LIMITS.fha.frontEnd, 0.31);
    assert.equal(DTI_LIMITS.fha.backEnd, 0.43);
  });
  it('VA null/41', () => {
    assert.equal(DTI_LIMITS.va.frontEnd, null);
    assert.equal(DTI_LIMITS.va.backEnd, 0.41);
  });
});
