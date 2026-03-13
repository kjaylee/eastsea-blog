export const DEFAULT_INPUT = Object.freeze({
  monthlyProcessedVolume: 50000,
  processingFeeRate: 2.9,
  refundRate: 3,
  chargebackLossRate: 0.6,
  reserveRate: 10,
  reserveHoldMonths: 4,
  monthlyFixedCost: 1200,
  annualCostOfCapitalRate: 12,
  analysisMonths: 12,
});

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeInput(input = {}) {
  return {
    monthlyProcessedVolume: toNumber(input.monthlyProcessedVolume),
    processingFeeRate: toNumber(input.processingFeeRate),
    refundRate: toNumber(input.refundRate),
    chargebackLossRate: toNumber(input.chargebackLossRate),
    reserveRate: toNumber(input.reserveRate),
    reserveHoldMonths: toNumber(input.reserveHoldMonths),
    monthlyFixedCost: toNumber(input.monthlyFixedCost),
    annualCostOfCapitalRate: toNumber(input.annualCostOfCapitalRate),
    analysisMonths: toNumber(input.analysisMonths),
  };
}

export function validateInputs(input = {}) {
  const values = normalizeInput(input);

  if (!Number.isFinite(values.monthlyProcessedVolume) || values.monthlyProcessedVolume <= 0) {
    return { valid: false, values, message: 'monthlyProcessedVolume must be greater than 0.' };
  }

  const boundedRates = [
    ['processingFeeRate', values.processingFeeRate],
    ['refundRate', values.refundRate],
    ['chargebackLossRate', values.chargebackLossRate],
    ['reserveRate', values.reserveRate],
    ['annualCostOfCapitalRate', values.annualCostOfCapitalRate],
  ];

  for (const [field, rate] of boundedRates) {
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return { valid: false, values, message: `${field} must be between 0 and 100.` };
    }
  }

  if (!Number.isFinite(values.monthlyFixedCost) || values.monthlyFixedCost < 0) {
    return { valid: false, values, message: 'monthlyFixedCost must be 0 or greater.' };
  }

  if (!Number.isInteger(values.reserveHoldMonths) || values.reserveHoldMonths < 1) {
    return { valid: false, values, message: 'reserveHoldMonths must be an integer greater than or equal to 1.' };
  }

  if (!Number.isInteger(values.analysisMonths) || values.analysisMonths < 1) {
    return { valid: false, values, message: 'analysisMonths must be an integer greater than or equal to 1.' };
  }

  const combinedRate = values.processingFeeRate + values.refundRate + values.chargebackLossRate;
  if (combinedRate >= 100) {
    return { valid: false, values, message: 'processingFeeRate + refundRate + chargebackLossRate must stay below 100.' };
  }

  return { valid: true, values, message: '' };
}

export function calculateRollingReserve(input = {}) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const v = validation.values;
  const feeRate = v.processingFeeRate / 100;
  const refundRate = v.refundRate / 100;
  const chargebackRate = v.chargebackLossRate / 100;
  const reserveRate = v.reserveRate / 100;
  const annualCostOfCapital = v.annualCostOfCapitalRate / 100;

  const netRateBeforeReserve = 1 - feeRate - refundRate - chargebackRate;
  const monthlyNetBeforeReserve = v.monthlyProcessedVolume * netRateBeforeReserve;
  const monthlyReserveWithheld = v.monthlyProcessedVolume * reserveRate;
  const maturedMonths = Math.max(v.analysisMonths - v.reserveHoldMonths, 0);
  const totalReserveWithheld = monthlyReserveWithheld * v.analysisMonths;
  const totalReserveReleased = monthlyReserveWithheld * maturedMonths;
  const endingReserveBalance = monthlyReserveWithheld * Math.min(v.analysisMonths, v.reserveHoldMonths);
  const steadyStateReserveBalance = monthlyReserveWithheld * v.reserveHoldMonths;
  const currentMonthCashAfterReserve = monthlyNetBeforeReserve - monthlyReserveWithheld - v.monthlyFixedCost;
  const steadyStateMonthlyCash = monthlyNetBeforeReserve - v.monthlyFixedCost;
  const periodNetCashAfterFixedCost =
    (monthlyNetBeforeReserve * v.analysisMonths) -
    totalReserveWithheld +
    totalReserveReleased -
    (v.monthlyFixedCost * v.analysisMonths);
  const annualFinancingCostAtSteadyState = steadyStateReserveBalance * annualCostOfCapital;
  const monthlyContributionAfterReserveFinancingRate =
    netRateBeforeReserve - (reserveRate * v.reserveHoldMonths * annualCostOfCapital / 12);
  const breakEvenProcessedVolume = monthlyContributionAfterReserveFinancingRate > 0
    ? v.monthlyFixedCost / monthlyContributionAfterReserveFinancingRate
    : Number.POSITIVE_INFINITY;

  return {
    monthlyProcessedVolume: round2(v.monthlyProcessedVolume),
    processingFeeRate: round2(v.processingFeeRate),
    refundRate: round2(v.refundRate),
    chargebackLossRate: round2(v.chargebackLossRate),
    reserveRate: round2(v.reserveRate),
    reserveHoldMonths: v.reserveHoldMonths,
    monthlyFixedCost: round2(v.monthlyFixedCost),
    annualCostOfCapitalRate: round2(v.annualCostOfCapitalRate),
    analysisMonths: v.analysisMonths,
    netRateBeforeReserve: round2(netRateBeforeReserve * 100),
    monthlyNetBeforeReserve: round2(monthlyNetBeforeReserve),
    monthlyReserveWithheld: round2(monthlyReserveWithheld),
    maturedMonths,
    totalReserveWithheld: round2(totalReserveWithheld),
    totalReserveReleased: round2(totalReserveReleased),
    endingReserveBalance: round2(endingReserveBalance),
    steadyStateReserveBalance: round2(steadyStateReserveBalance),
    currentMonthCashAfterReserve: round2(currentMonthCashAfterReserve),
    steadyStateMonthlyCash: round2(steadyStateMonthlyCash),
    periodNetCashAfterFixedCost: round2(periodNetCashAfterFixedCost),
    annualFinancingCostAtSteadyState: round2(annualFinancingCostAtSteadyState),
    monthlyContributionAfterReserveFinancingRate: round2(monthlyContributionAfterReserveFinancingRate * 100),
    breakEvenProcessedVolume: Number.isFinite(breakEvenProcessedVolume) ? round2(breakEvenProcessedVolume) : Number.POSITIVE_INFINITY,
  };
}

function formatMoney(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildSummary(result, locale = 'en-US', currency = 'USD') {
  const breakEven = Number.isFinite(result.breakEvenProcessedVolume)
    ? formatMoney(result.breakEvenProcessedVolume, locale, currency)
    : 'Non-finite';

  return [
    'Rolling Reserve Cashflow Snapshot',
    `Processed Volume: ${formatMoney(result.monthlyProcessedVolume, locale, currency)}/mo`,
    `Net Before Reserve: ${formatMoney(result.monthlyNetBeforeReserve, locale, currency)}/mo`,
    `Reserve Withheld: ${formatMoney(result.monthlyReserveWithheld, locale, currency)}/mo`,
    `Current Month Cash After Reserve: ${formatMoney(result.currentMonthCashAfterReserve, locale, currency)}`,
    `Steady-state Monthly Cash: ${formatMoney(result.steadyStateMonthlyCash, locale, currency)}`,
    `Reserve Released During Analysis: ${formatMoney(result.totalReserveReleased, locale, currency)}`,
    `Ending Reserve Balance: ${formatMoney(result.endingReserveBalance, locale, currency)}`,
    `Steady-state Reserve Balance: ${formatMoney(result.steadyStateReserveBalance, locale, currency)}`,
    `Annual Financing Cost at Steady State: ${formatMoney(result.annualFinancingCostAtSteadyState, locale, currency)}`,
    `Break-even Processed Volume: ${breakEven}`,
    `Net Before Reserve Rate: ${formatNumber(result.netRateBeforeReserve, locale)}%`,
    `Contribution After Reserve Financing: ${formatNumber(result.monthlyContributionAfterReserveFinancingRate, locale)}%`,
    `Reserve Hold / Analysis: ${formatNumber(result.reserveHoldMonths, locale)} mo / ${formatNumber(result.analysisMonths, locale)} mo`,
  ].join('\n');
}
