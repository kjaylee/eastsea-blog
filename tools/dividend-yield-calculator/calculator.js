'use strict';

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate dividend yield, income, yield on cost, and growth projections.
 * @param {object} opts
 * @param {number} opts.sharePrice      - current market price per share
 * @param {number} opts.annualDividend  - annual dividend per share ($)
 * @param {number} opts.shares          - number of shares owned
 * @param {number} opts.purchasePrice   - original purchase price per share ($)
 * @param {number} opts.growthRate      - expected annual dividend growth rate (%)
 * @param {number} opts.years           - projection horizon (integer, 1-30)
 * @param {number} opts.taxRate         - tax rate on dividends (%)
 * @returns {object} result
 */
function calculate({ sharePrice, annualDividend, shares, purchasePrice, growthRate, years, taxRate }) {
  if (typeof sharePrice !== 'number' || sharePrice <= 0)
    throw new Error('sharePrice must be a positive number');
  if (typeof annualDividend !== 'number' || annualDividend < 0)
    throw new Error('annualDividend must be a non-negative number');
  if (!Number.isInteger(shares) || shares < 1)
    throw new Error('shares must be a positive integer');
  if (typeof purchasePrice !== 'number' || purchasePrice <= 0)
    throw new Error('purchasePrice must be a positive number');
  if (typeof growthRate !== 'number' || growthRate < 0 || growthRate > 50)
    throw new Error('growthRate must be between 0 and 50');
  if (!Number.isInteger(years) || years < 1 || years > 30)
    throw new Error('years must be an integer between 1 and 30');
  if (typeof taxRate !== 'number' || taxRate < 0 || taxRate > 50)
    throw new Error('taxRate must be between 0 and 50');

  const dividendYield = sharePrice > 0
    ? round2((annualDividend / sharePrice) * 100)
    : 0;

  const annualIncome          = round2(annualDividend * shares);
  const monthlyIncome         = round2(annualIncome / 12);
  const yieldOnCost           = round2((annualDividend / purchasePrice) * 100);
  const afterTaxAnnualIncome  = round2(annualIncome * (1 - taxRate / 100));
  const afterTaxMonthlyIncome = round2(afterTaxAnnualIncome / 12);

  const totalCostBasis = round2(shares * purchasePrice);
  const currentValue   = round2(shares * sharePrice);
  const capitalGain    = round2(currentValue - totalCostBasis);
  const capitalGainPct = round2((capitalGain / totalCostBasis) * 100);

  const projections = [];
  let cumulative = 0;
  for (let y = 1; y <= years; y++) {
    const divPerShare   = round2(annualDividend * Math.pow(1 + growthRate / 100, y));
    const yearlyIncome  = round2(divPerShare * shares);
    cumulative          = round2(cumulative + yearlyIncome);
    projections.push({
      year: y,
      dividendPerShare: divPerShare,
      annualIncome: yearlyIncome,
      cumulative,
    });
  }

  return {
    dividendYield,
    annualIncome,
    monthlyIncome,
    yieldOnCost,
    afterTaxAnnualIncome,
    afterTaxMonthlyIncome,
    totalCostBasis,
    currentValue,
    capitalGain,
    capitalGainPct,
    projections,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculate, round2 };
}
