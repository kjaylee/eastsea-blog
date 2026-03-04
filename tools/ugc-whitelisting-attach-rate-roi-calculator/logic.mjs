export const DEFAULT_INPUT = {
  monthlyQualifiedDeals: 120,
  currentAttachRatePct: 18,
  targetAttachRatePct: 34,
  rightsFeePerDeal: 900,
  platformFeePct: 8,
  rightsFulfillmentCostPerDeal: 120,
  creativeRefreshCostPerDeal: 60,
  incrementalGrossProfitLiftPerDeal: 350,
  monthlyEnablementCost: 2200,
  oneTimeSetupCost: 6500,
  analysisMonths: 12,
  targetPaybackMonths: 4,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyQualifiedDeals', 1, 10000000],
    ['currentAttachRatePct', 0, 100],
    ['targetAttachRatePct', 0, 100],
    ['rightsFeePerDeal', 0, 1000000],
    ['platformFeePct', 0, 95],
    ['rightsFulfillmentCostPerDeal', 0, 1000000],
    ['creativeRefreshCostPerDeal', 0, 1000000],
    ['incrementalGrossProfitLiftPerDeal', 0, 2000000],
    ['monthlyEnablementCost', 0, 50000000],
    ['oneTimeSetupCost', 0, 200000000],
    ['analysisMonths', 1, 60],
    ['targetPaybackMonths', 1, 60],
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

  if (Number(input.targetAttachRatePct) < Number(input.currentAttachRatePct)) {
    return {
      valid: false,
      message: 'targetAttachRatePct must be greater than or equal to currentAttachRatePct.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateUgcWhitelistingAttachRateROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyQualifiedDeals = Number(input.monthlyQualifiedDeals);
  const currentAttachRatePct = Number(input.currentAttachRatePct);
  const targetAttachRatePct = Number(input.targetAttachRatePct);
  const rightsFeePerDeal = Number(input.rightsFeePerDeal);
  const platformFeePct = Number(input.platformFeePct);
  const rightsFulfillmentCostPerDeal = Number(input.rightsFulfillmentCostPerDeal);
  const creativeRefreshCostPerDeal = Number(input.creativeRefreshCostPerDeal);
  const incrementalGrossProfitLiftPerDeal = Number(input.incrementalGrossProfitLiftPerDeal);
  const monthlyEnablementCost = Number(input.monthlyEnablementCost);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);
  const analysisMonths = Number(input.analysisMonths);
  const targetPaybackMonths = Number(input.targetPaybackMonths);

  const currentRate = currentAttachRatePct / 100;
  const targetRate = targetAttachRatePct / 100;
  const platformFeeRate = platformFeePct / 100;

  const currentWhitelistingDeals = monthlyQualifiedDeals * currentRate;
  const targetWhitelistingDeals = monthlyQualifiedDeals * targetRate;
  const incrementalWhitelistingDeals = targetWhitelistingDeals - currentWhitelistingDeals;

  const platformFeePerDeal = rightsFeePerDeal * platformFeeRate;
  const netRightsRevenuePerDeal = rightsFeePerDeal - platformFeePerDeal;
  const netContributionPerDeal = netRightsRevenuePerDeal
    + incrementalGrossProfitLiftPerDeal
    - rightsFulfillmentCostPerDeal
    - creativeRefreshCostPerDeal;

  const incrementalContribution = incrementalWhitelistingDeals * netContributionPerDeal;
  const netMonthlyBenefit = incrementalContribution - monthlyEnablementCost;
  const periodNetBenefit = (netMonthlyBenefit * analysisMonths) - oneTimeSetupCost;

  const roiPct = oneTimeSetupCost > 0
    ? (periodNetBenefit / oneTimeSetupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = netMonthlyBenefit > 0
    ? oneTimeSetupCost / netMonthlyBenefit
    : Number.POSITIVE_INFINITY;

  let breakEvenTargetAttachRatePct = Number.POSITIVE_INFINITY;
  if (netContributionPerDeal > 0 && monthlyQualifiedDeals > 0) {
    const requiredIncrementalDeals = monthlyEnablementCost / netContributionPerDeal;
    const breakEven = currentAttachRatePct + ((requiredIncrementalDeals / monthlyQualifiedDeals) * 100);
    if (Number.isFinite(breakEven) && breakEven <= 100) {
      breakEvenTargetAttachRatePct = breakEven;
    }
  }

  const status = netMonthlyBenefit <= 0
    ? 'risky'
    : paybackMonths <= targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: {
      monthlyQualifiedDeals,
      currentAttachRatePct,
      targetAttachRatePct,
      rightsFeePerDeal,
      platformFeePct,
      rightsFulfillmentCostPerDeal,
      creativeRefreshCostPerDeal,
      incrementalGrossProfitLiftPerDeal,
      monthlyEnablementCost,
      oneTimeSetupCost,
      analysisMonths,
      targetPaybackMonths,
    },
    currentWhitelistingDeals: round2(currentWhitelistingDeals),
    targetWhitelistingDeals: round2(targetWhitelistingDeals),
    incrementalWhitelistingDeals: round2(incrementalWhitelistingDeals),
    platformFeePerDeal: round2(platformFeePerDeal),
    netRightsRevenuePerDeal: round2(netRightsRevenuePerDeal),
    netContributionPerDeal: round2(netContributionPerDeal),
    incrementalContribution: round2(incrementalContribution),
    netMonthlyBenefit: round2(netMonthlyBenefit),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenTargetAttachRatePct: Number.isFinite(breakEvenTargetAttachRatePct)
      ? round2(breakEvenTargetAttachRatePct)
      : Number.POSITIVE_INFINITY,
    status,
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
    : 'No payback under current assumptions';

  const breakEvenText = Number.isFinite(result.breakEvenTargetAttachRatePct)
    ? `${num.format(result.breakEvenTargetAttachRatePct)}%`
    : 'Not reachable with current assumptions';

  return [
    '[UGC Whitelisting Attach Rate ROI Snapshot]',
    `Attach Rate: ${num.format(result.inputs.currentAttachRatePct)}% -> ${num.format(result.inputs.targetAttachRatePct)}%`,
    `Incremental Whitelisting Deals: ${num.format(result.incrementalWhitelistingDeals)}`,
    `Net Contribution / Whitelisting Deal: ${money.format(result.netContributionPerDeal)}`,
    `Net Monthly Benefit: ${money.format(result.netMonthlyBenefit)}`,
    `Period Net Benefit (${num.format(result.inputs.analysisMonths)} months): ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Attach Rate: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
