export const DEFAULT_INPUT = {
  monthlySessions: 120000,
  baselineConvPct: 2.1,
  targetConvPct: 3.4,
  aov: 48,
  grossMarginPct: 55,
  discountPct: 15,
  offerSharePct: 55,
  extraFulfillmentCost: 1.2,
  monthlyPromoCost: 6500,
  setupCost: 12000,
  analysisMonths: 6,
  targetPaybackMonths: 4,
};

export function validateInputs(input) {
  const requiredNumber = [
    'monthlySessions',
    'baselineConvPct',
    'targetConvPct',
    'aov',
    'grossMarginPct',
    'discountPct',
    'offerSharePct',
    'extraFulfillmentCost',
    'monthlyPromoCost',
    'setupCost',
    'analysisMonths',
    'targetPaybackMonths',
  ];

  for (const key of requiredNumber) {
    if (!Number.isFinite(input[key])) {
      return { valid: false, message: `${key} must be a valid number.` };
    }
  }

  if (input.monthlySessions < 1) {
    return { valid: false, message: 'Monthly sessions must be at least 1.' };
  }

  if (input.aov <= 0) {
    return { valid: false, message: 'Average order value must be greater than 0.' };
  }

  if (input.analysisMonths < 1) {
    return { valid: false, message: 'Analysis months must be at least 1.' };
  }

  if (input.targetPaybackMonths < 1) {
    return { valid: false, message: 'Target payback months must be at least 1.' };
  }

  const pctFields = [
    'baselineConvPct',
    'targetConvPct',
    'grossMarginPct',
    'discountPct',
    'offerSharePct',
  ];

  for (const key of pctFields) {
    if (input[key] < 0 || input[key] > 100) {
      return { valid: false, message: 'Percent values must be between 0 and 100.' };
    }
  }

  const nonNegative = ['extraFulfillmentCost', 'monthlyPromoCost', 'setupCost'];
  for (const key of nonNegative) {
    if (input[key] < 0) {
      return { valid: false, message: 'Cost values must be 0 or greater.' };
    }
  }

  return { valid: true };
}

export function calculateLimitedTimeOfferProfit(input) {
  const baselineConv = input.baselineConvPct / 100;
  const targetConv = input.targetConvPct / 100;
  const grossMargin = input.grossMarginPct / 100;
  const discount = input.discountPct / 100;
  const offerShare = input.offerSharePct / 100;

  const baselineOrders = input.monthlySessions * baselineConv;
  const targetOrders = input.monthlySessions * targetConv;
  const offerOrders = targetOrders * offerShare;
  const nonOfferOrders = targetOrders - offerOrders;

  const cogs = input.aov * (1 - grossMargin);
  const profitPerNonOffer = input.aov - cogs;
  const profitPerOffer = input.aov * (1 - discount) - cogs;

  const targetGrossProfit = (nonOfferOrders * profitPerNonOffer) + (offerOrders * profitPerOffer);
  const monthlyOfferFulfillmentCost = offerOrders * input.extraFulfillmentCost;
  const targetNetMonthly = targetGrossProfit - monthlyOfferFulfillmentCost - input.monthlyPromoCost;
  const baselineNetMonthly = baselineOrders * profitPerNonOffer;
  const monthlyNetLift = targetNetMonthly - baselineNetMonthly;
  const periodNetBenefit = (monthlyNetLift * input.analysisMonths) - input.setupCost;

  const totalProgramCost = input.setupCost + (input.monthlyPromoCost + monthlyOfferFulfillmentCost) * input.analysisMonths;
  const roiPct = totalProgramCost > 0 ? (periodNetBenefit / totalProgramCost) * 100 : Infinity;
  const paybackMonths = monthlyNetLift > 0 ? input.setupCost / monthlyNetLift : Infinity;

  const avgSellingPrice = input.aov * (1 - discount * offerShare);
  const netContributionPerOrder = targetOrders > 0
    ? (targetGrossProfit - monthlyOfferFulfillmentCost) / targetOrders
    : 0;

  const denom = input.monthlySessions * (profitPerNonOffer - offerShare * (input.aov * discount + input.extraFulfillmentCost));
  const breakEvenTargetConvPct = denom > 0
    ? ((input.monthlyPromoCost + baselineOrders * profitPerNonOffer) / denom) * 100
    : Infinity;

  return {
    baselineOrders,
    targetOrders,
    offerOrders,
    avgSellingPrice,
    netContributionPerOrder,
    monthlyOfferFulfillmentCost,
    baselineNetMonthly,
    targetNetMonthly,
    monthlyNetLift,
    periodNetBenefit,
    roiPct,
    paybackMonths,
    breakEvenTargetConvPct,
  };
}

export function buildSummary(result, locale = 'en-US', currency = 'USD') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  const paybackText = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  const roiText = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  const breakEvenText = Number.isFinite(result.breakEvenTargetConvPct)
    ? `${num.format(result.breakEvenTargetConvPct)}%`
    : 'Not reachable';

  return [
    '[Limited-time Offer Profit Summary]',
    `Baseline monthly net: ${money.format(result.baselineNetMonthly)}`,
    `Offer monthly net: ${money.format(result.targetNetMonthly)}`,
    `Monthly net lift: ${money.format(result.monthlyNetLift)}`,
    `Period net benefit: ${money.format(result.periodNetBenefit)}`,
    `ROI: ${roiText}`,
    `Payback: ${paybackText}`,
    `Break-even target conversion: ${breakEvenText}`,
  ].join('\n');
}
