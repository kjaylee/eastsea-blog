// Home Affordability Calculator — Core Functions (Node.js testable)
'use strict';

/**
 * Monthly payment factor: monthly payment per $1 of loan.
 * M = r*(1+r)^n / ((1+r)^n - 1)
 */
function monthlyPaymentFactor(annualRate, termYears) {
  const n = termYears * 12;
  if (annualRate === 0) return 1 / n;
  const r = annualRate / 12;
  const pow = Math.pow(1 + r, n);
  return (r * pow) / (pow - 1);
}

/**
 * Loan amount from a given monthly P&I payment.
 */
function loanFromPayment(monthlyPayment, annualRate, termYears) {
  if (monthlyPayment <= 0) return 0;
  return monthlyPayment / monthlyPaymentFactor(annualRate, termYears);
}

/**
 * Monthly P&I payment from loan amount.
 */
function paymentFromLoan(loanAmount, annualRate, termYears) {
  if (loanAmount <= 0) return 0;
  return loanAmount * monthlyPaymentFactor(annualRate, termYears);
}

/** DTI ratio presets by loan type. */
const DTI_LIMITS = {
  conventional: { frontEnd: 0.28, backEnd: 0.36 },
  fha:          { frontEnd: 0.31, backEnd: 0.43 },
  va:           { frontEnd: null, backEnd: 0.41 }
};

function round2(n) { return Math.round(n * 100) / 100; }
function round4(n) { return Math.round(n * 10000) / 10000; }

/**
 * Main affordability calculation.
 *
 * @param {Object} p
 * @param {number} p.annualIncome      — gross annual household income
 * @param {number} p.monthlyDebts      — existing monthly debt payments
 * @param {number} p.downPayment       — cash for down payment
 * @param {number} p.interestRate      — annual mortgage rate (decimal, e.g. 0.065)
 * @param {number} p.loanTermYears     — 15 | 20 | 25 | 30
 * @param {string} p.loanType          — 'conventional' | 'fha' | 'va'
 * @param {number} p.propertyTaxRate   — annual rate (decimal, e.g. 0.012)
 * @param {number} p.annualInsurance   — annual premium in dollars
 * @param {number} p.monthlyHOA        — monthly HOA fee
 * @param {number} p.pmiRate           — annual PMI rate (decimal, e.g. 0.005)
 * @returns {Object} result
 */
function calculateAffordability(p) {
  const {
    annualIncome    = 80000,
    monthlyDebts    = 500,
    downPayment     = 40000,
    interestRate    = 0.065,
    loanTermYears   = 30,
    loanType        = 'conventional',
    propertyTaxRate = 0.012,
    annualInsurance = 1500,
    monthlyHOA      = 0,
    pmiRate         = 0.005
  } = p;

  const monthlyInsurance = annualInsurance / 12;

  // Edge: zero / negative income
  if (annualIncome <= 0) {
    return {
      maxHomePrice: downPayment, maxLoan: 0,
      monthlyPI: 0, monthlyTax: 0, monthlyInsurance: round2(monthlyInsurance),
      monthlyHOA, monthlyPMI: 0, totalMonthly: 0,
      frontEndDTI: 0, backEndDTI: 0,
      warning: 'Zero income — max price equals down payment only.'
    };
  }

  const grossMonthly = annualIncome / 12;
  const limits = DTI_LIMITS[loanType] || DTI_LIMITS.conventional;

  const frontEndMax = limits.frontEnd !== null
    ? grossMonthly * limits.frontEnd
    : Infinity;
  const backEndMax = grossMonthly * limits.backEnd - monthlyDebts;

  // Debts too high
  if (backEndMax <= 0) {
    return {
      maxHomePrice: downPayment, maxLoan: 0,
      monthlyPI: 0, monthlyTax: 0, monthlyInsurance: round2(monthlyInsurance),
      monthlyHOA, monthlyPMI: 0, totalMonthly: 0,
      frontEndDTI: 0, backEndDTI: round4(monthlyDebts / grossMonthly),
      warning: 'Your current debts may be too high to qualify.'
    };
  }

  const effectiveMax = Math.min(frontEndMax, backEndMax);
  const available = effectiveMax - monthlyInsurance - monthlyHOA;

  if (available <= 0) {
    return {
      maxHomePrice: downPayment, maxLoan: 0,
      monthlyPI: 0, monthlyTax: 0, monthlyInsurance: round2(monthlyInsurance),
      monthlyHOA, monthlyPMI: 0,
      totalMonthly: round2(monthlyInsurance + monthlyHOA),
      frontEndDTI: round4((monthlyInsurance + monthlyHOA) / grossMonthly),
      backEndDTI: round4((monthlyInsurance + monthlyHOA + monthlyDebts) / grossMonthly),
      warning: 'Insurance and HOA exceed maximum housing payment.'
    };
  }

  const M = monthlyPaymentFactor(interestRate, loanTermYears);
  const taxMo = propertyTaxRate / 12;    // monthly tax rate per $ of home price
  const pmiMo = pmiRate / 12;            // monthly PMI rate per $ of home price

  // Analytical solve — no PMI first
  // available = L*M + (L + dp)*taxMo  →  L = (available - dp*taxMo) / (M + taxMo)
  let maxLoan = (available - downPayment * taxMo) / (M + taxMo);
  let maxHomePrice = maxLoan + downPayment;
  let needsPMI = false;

  // PMI check (VA exempt)
  if (loanType !== 'va' && downPayment < 0.2 * maxHomePrice && maxLoan > 0) {
    // Re-solve with PMI included
    // available = L*M + (L+dp)*(taxMo+pmiMo)
    // L = (available - dp*(taxMo+pmiMo)) / (M + taxMo + pmiMo)
    const loanWithPMI = (available - downPayment * (taxMo + pmiMo)) / (M + taxMo + pmiMo);
    const priceWithPMI = loanWithPMI + downPayment;

    if (loanWithPMI > 0 && downPayment < 0.2 * priceWithPMI) {
      needsPMI = true;
      maxLoan = loanWithPMI;
      maxHomePrice = priceWithPMI;
    }
    // else: PMI resolved itself (rare edge), keep non-PMI answer
  }

  // Clamp
  if (maxLoan < 0) { maxLoan = 0; maxHomePrice = downPayment; }

  // Compute actual breakdown
  const monthlyPI  = maxLoan > 0 ? maxLoan * M : 0;
  const monthlyTax = maxHomePrice * propertyTaxRate / 12;
  const monthlyPMI = needsPMI ? maxHomePrice * pmiRate / 12 : 0;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA + monthlyPMI;

  const frontEndDTI = totalMonthly / grossMonthly;
  const backEndDTI  = (totalMonthly + monthlyDebts) / grossMonthly;

  let warning = null;
  if (maxHomePrice <= downPayment) {
    warning = 'Cannot afford more than down payment with current parameters.';
  }

  return {
    maxHomePrice:    Math.round(maxHomePrice),
    maxLoan:         Math.round(maxLoan),
    monthlyPI:       round2(monthlyPI),
    monthlyTax:      round2(monthlyTax),
    monthlyInsurance:round2(monthlyInsurance),
    monthlyHOA:      round2(monthlyHOA),
    monthlyPMI:      round2(monthlyPMI),
    totalMonthly:    round2(totalMonthly),
    frontEndDTI:     round4(frontEndDTI),
    backEndDTI:      round4(backEndDTI),
    warning
  };
}

/**
 * Side-by-side comparison for Conventional / FHA / VA.
 */
function compareAllLoanTypes(p) {
  return {
    conventional: calculateAffordability({ ...p, loanType: 'conventional' }),
    fha:          calculateAffordability({ ...p, loanType: 'fha', pmiRate: 0.0085 }),
    va:           calculateAffordability({ ...p, loanType: 'va' })
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    monthlyPaymentFactor,
    loanFromPayment,
    paymentFromLoan,
    calculateAffordability,
    compareAllLoanTypes,
    DTI_LIMITS,
    round2,
    round4
  };
}
