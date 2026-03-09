export const DEFAULT_INPUT = {
  monthlyUnitsSold: 1800,
  salePricePerUnit: 32.99,
  landedCostPerUnit: 8.4,
  referralFeePct: 15,
  fbaFulfillmentFeePerUnit: 5.35,
  prepLabelCostPerUnit: 0.65,
  returnRatePct: 6,
  lossPerReturn: 11,
  acosPct: 14,
  monthlyStorageCost: 280,
  monthlyOverhead: 650,
  launchCost: 4200,
  analysisMonths: 12,
  targetNetMarginPct: 12,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyUnitsSold', 1, 5_000_000],
    ['salePricePerUnit', 0.01, 100_000],
    ['landedCostPerUnit', 0, 100_000],
    ['referralFeePct', 0, 50],
    ['fbaFulfillmentFeePerUnit', 0, 100_000],
    ['prepLabelCostPerUnit', 0, 100_000],
    ['returnRatePct', 0, 100],
    ['lossPerReturn', 0, 100_000],
    ['acosPct', 0, 100],
    ['monthlyStorageCost', 0, 1_000_000_000],
    ['monthlyOverhead', 0, 1_000_000_000],
    ['launchCost', 0, 1_000_000_000],
    ['analysisMonths', 1, 60],
    ['targetNetMarginPct', 0, 80],
  ];

  for (const [key, min, max] of checks) {
    const value = Number(input[key]);
    if (!Number.isFinite(value)) {
      return { valid: false, message: `${key} must be a finite number.` };
    }
    if (value < min || value > max) {
      return { valid: false, message: `${key} must be between ${min} and ${max}.` };
    }
  }

  const referralFeePct = Number(input.referralFeePct);
  const acosPct = Number(input.acosPct);
  const targetNetMarginPct = Number(input.targetNetMarginPct);

  if (referralFeePct + acosPct >= 100) {
    return {
      valid: false,
      message: 'referralFeePct + acosPct must stay below 100 to leave room for costs and profit.',
    };
  }

  if (targetNetMarginPct >= 100 - referralFeePct - acosPct) {
    return {
      valid: false,
      message: 'targetNetMarginPct is too high for the current referral fee and ACoS assumptions.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateAmazonFbaProfit(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyUnitsSold = Number(input.monthlyUnitsSold);
  const salePricePerUnit = Number(input.salePricePerUnit);
  const landedCostPerUnit = Number(input.landedCostPerUnit);
  const referralFeePct = Number(input.referralFeePct);
  const fbaFulfillmentFeePerUnit = Number(input.fbaFulfillmentFeePerUnit);
  const prepLabelCostPerUnit = Number(input.prepLabelCostPerUnit);
  const returnRatePct = Number(input.returnRatePct);
  const lossPerReturn = Number(input.lossPerReturn);
  const acosPct = Number(input.acosPct);
  const monthlyStorageCost = Number(input.monthlyStorageCost);
  const monthlyOverhead = Number(input.monthlyOverhead);
  const launchCost = Number(input.launchCost);
  const analysisMonths = Number(input.analysisMonths);
  const targetNetMarginPct = Number(input.targetNetMarginPct);

  const referralFeeRate = referralFeePct / 100;
  const returnRate = returnRatePct / 100;
  const acosRate = acosPct / 100;
  const targetNetMarginRate = targetNetMarginPct / 100;

  const grossRevenue = monthlyUnitsSold * salePricePerUnit;
  const referralFees = grossRevenue * referralFeeRate;
  const adSpend = grossRevenue * acosRate;
  const landedCostTotal = monthlyUnitsSold * landedCostPerUnit;
  const fulfillmentCostTotal = monthlyUnitsSold * fbaFulfillmentFeePerUnit;
  const prepCostTotal = monthlyUnitsSold * prepLabelCostPerUnit;
  const returnReservePerUnit = returnRate * lossPerReturn;
  const returnReserveTotal = monthlyUnitsSold * returnReservePerUnit;
  const fixedMonthlyCost = monthlyStorageCost + monthlyOverhead;

  const variableCostTotal = referralFees + adSpend + landedCostTotal + fulfillmentCostTotal + prepCostTotal + returnReserveTotal;
  const monthlyNetProfit = grossRevenue - variableCostTotal - fixedMonthlyCost;
  const netMarginPct = grossRevenue > 0 ? (monthlyNetProfit / grossRevenue) * 100 : 0;
  const profitPerUnit = monthlyUnitsSold > 0 ? monthlyNetProfit / monthlyUnitsSold : 0;

  const unitContribution = salePricePerUnit * (1 - referralFeeRate - acosRate)
    - landedCostPerUnit
    - fbaFulfillmentFeePerUnit
    - prepLabelCostPerUnit
    - returnReservePerUnit;

  const breakEvenUnits = unitContribution > 0 ? fixedMonthlyCost / unitContribution : Number.POSITIVE_INFINITY;

  const availableForAds = grossRevenue - referralFees - landedCostTotal - fulfillmentCostTotal - prepCostTotal - returnReserveTotal - fixedMonthlyCost;
  const breakEvenAcosPct = grossRevenue > 0
    ? Math.min(100, Math.max(0, (availableForAds / grossRevenue) * 100))
    : 0;

  const totalMonthlyNonPriceCosts = landedCostTotal + fulfillmentCostTotal + prepCostTotal + returnReserveTotal + fixedMonthlyCost;
  const targetPriceDenominator = monthlyUnitsSold * (1 - referralFeeRate - acosRate - targetNetMarginRate);
  const requiredPricePerUnitForTargetMargin = targetPriceDenominator > 0
    ? totalMonthlyNonPriceCosts / targetPriceDenominator
    : Number.POSITIVE_INFINITY;

  const periodNetProfit = (monthlyNetProfit * analysisMonths) - launchCost;
  const totalCostOverPeriod = ((variableCostTotal + fixedMonthlyCost) * analysisMonths) + launchCost;
  const roiPct = totalCostOverPeriod > 0 ? (periodNetProfit / totalCostOverPeriod) * 100 : 0;
  const paybackMonths = launchCost === 0
    ? 0
    : monthlyNetProfit > 0
      ? launchCost / monthlyNetProfit
      : Number.POSITIVE_INFINITY;

  const status = monthlyNetProfit > 0 && netMarginPct >= 12
    ? 'profitable'
    : monthlyNetProfit >= 0
      ? 'tight'
      : 'loss';

  return {
    inputs: {
      monthlyUnitsSold,
      salePricePerUnit,
      landedCostPerUnit,
      referralFeePct,
      fbaFulfillmentFeePerUnit,
      prepLabelCostPerUnit,
      returnRatePct,
      lossPerReturn,
      acosPct,
      monthlyStorageCost,
      monthlyOverhead,
      launchCost,
      analysisMonths,
      targetNetMarginPct,
    },
    grossRevenue: round2(grossRevenue),
    referralFees: round2(referralFees),
    adSpend: round2(adSpend),
    landedCostTotal: round2(landedCostTotal),
    fulfillmentCostTotal: round2(fulfillmentCostTotal),
    prepCostTotal: round2(prepCostTotal),
    returnReserveTotal: round2(returnReserveTotal),
    fixedMonthlyCost: round2(fixedMonthlyCost),
    variableCostTotal: round2(variableCostTotal),
    monthlyNetProfit: round2(monthlyNetProfit),
    netMarginPct: round2(netMarginPct),
    profitPerUnit: round2(profitPerUnit),
    unitContribution: round2(unitContribution),
    breakEvenUnits: Number.isFinite(breakEvenUnits) ? round2(breakEvenUnits) : Number.POSITIVE_INFINITY,
    breakEvenAcosPct: round2(breakEvenAcosPct),
    requiredPricePerUnitForTargetMargin: Number.isFinite(requiredPricePerUnitForTargetMargin)
      ? round2(requiredPricePerUnitForTargetMargin)
      : Number.POSITIVE_INFINITY,
    periodNetProfit: round2(periodNetProfit),
    roiPct: round2(roiPct),
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    status,
  };
}

export function buildSummary(result, locale = 'ko-KR', currency = 'USD') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return [
    '[Amazon FBA 수익 요약]',
    `월 매출: ${money.format(result.grossRevenue)}`,
    `월 순이익: ${money.format(result.monthlyNetProfit)}`,
    `순마진: ${num.format(result.netMarginPct)}%`,
    `개당 이익: ${money.format(result.profitPerUnit)}`,
    `손익분기 판매량: ${Number.isFinite(result.breakEvenUnits) ? num.format(result.breakEvenUnits) + '개' : 'N/A'}`,
    `손익분기 ACoS: ${num.format(result.breakEvenAcosPct)}%`,
    `목표 순마진 달성 판매가: ${Number.isFinite(result.requiredPricePerUnitForTargetMargin) ? money.format(result.requiredPricePerUnitForTargetMargin) : 'N/A'}`,
    `회수기간: ${Number.isFinite(result.paybackMonths) ? num.format(result.paybackMonths) + '개월' : 'N/A'}`,
    `기간 순이익: ${money.format(result.periodNetProfit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `상태: ${result.status}`,
  ].join('\n');
}
