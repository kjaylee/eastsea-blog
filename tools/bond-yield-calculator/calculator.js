'use strict';

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate bond yield metrics: current yield, YTM approximation, total return, and projections.
 * @param {object} opts
 * @param {number} opts.faceValue       - bond par/face value ($)
 * @param {number} opts.couponRate      - annual coupon rate (%)
 * @param {number} opts.currentPrice    - current market price ($)
 * @param {number} opts.yearsToMaturity - years until bond matures (integer, 1-50)
 * @param {number} opts.purchasePrice   - price paid for the bond ($)
 * @param {number} opts.taxRate         - tax rate on interest income (%)
 * @param {number} opts.quantity        - number of bonds held (integer, 1-10000)
 * @returns {object} result
 */
function calculate({ faceValue, couponRate, currentPrice, yearsToMaturity, purchasePrice, taxRate, quantity }) {
  if (typeof faceValue !== 'number' || faceValue <= 0)
    throw new Error('faceValue must be a positive number');
  if (typeof couponRate !== 'number' || couponRate < 0 || couponRate > 30)
    throw new Error('couponRate must be between 0 and 30');
  if (typeof currentPrice !== 'number' || currentPrice <= 0)
    throw new Error('currentPrice must be a positive number');
  if (!Number.isInteger(yearsToMaturity) || yearsToMaturity < 1 || yearsToMaturity > 50)
    throw new Error('yearsToMaturity must be an integer between 1 and 50');
  if (typeof purchasePrice !== 'number' || purchasePrice <= 0)
    throw new Error('purchasePrice must be a positive number');
  if (typeof taxRate !== 'number' || taxRate < 0 || taxRate > 50)
    throw new Error('taxRate must be between 0 and 50');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)
    throw new Error('quantity must be an integer between 1 and 10000');

  const annualCouponPerBond = round2(faceValue * couponRate / 100);
  const annualCouponIncome  = round2(annualCouponPerBond * quantity);

  const currentYield = currentPrice > 0
    ? round2((annualCouponPerBond / currentPrice) * 100)
    : 0;

  // YTM approximation formula
  const ytmApprox = round2(
    ((annualCouponPerBond + (faceValue - currentPrice) / yearsToMaturity) /
     ((faceValue + currentPrice) / 2)) * 100
  );

  const afterTaxAnnualIncome = round2(annualCouponIncome * (1 - taxRate / 100));
  const afterTaxYield        = round2(currentYield * (1 - taxRate / 100));

  const totalInvestment  = round2(purchasePrice * quantity);
  const capitalGainLoss  = round2((faceValue - purchasePrice) * quantity);
  const totalCouponIncome = round2(annualCouponIncome * yearsToMaturity);
  const totalReturn      = round2(totalCouponIncome + capitalGainLoss);
  const annualizedReturn = totalInvestment > 0
    ? round2((totalReturn / totalInvestment) / yearsToMaturity * 100)
    : 0;

  // Bond status
  let bondStatus = 'par';
  if (currentPrice < faceValue) bondStatus = 'discount';
  else if (currentPrice > faceValue) bondStatus = 'premium';

  // Year-by-year projection (coupon is fixed for bonds)
  const projections = [];
  let cumulative = 0;
  for (let y = 1; y <= yearsToMaturity; y++) {
    cumulative = round2(cumulative + annualCouponIncome);
    const afterTax = round2(annualCouponIncome * (1 - taxRate / 100));
    projections.push({
      year: y,
      annualIncome: annualCouponIncome,
      afterTaxIncome: afterTax,
      cumulative,
    });
  }

  return {
    annualCouponPerBond,
    annualCouponIncome,
    currentYield,
    ytmApprox,
    afterTaxAnnualIncome,
    afterTaxYield,
    totalInvestment,
    capitalGainLoss,
    totalCouponIncome,
    totalReturn,
    annualizedReturn,
    bondStatus,
    projections,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculate, round2 };
}
