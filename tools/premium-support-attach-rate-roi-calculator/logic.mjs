export const DEFAULT_INPUT = {
  activeAccounts: 3200,
  currentAttachPct: 11,
  targetAttachPct: 18,
  supportPlanPricePerMonth: 149,
  addOnGrossMarginPct: 76,
  supportDeliveryCostPerAccount: 24,
  churnReductionPct: 1.8,
  avgAccountGrossProfitPerMonth: 210,
  programFixedCostPerMonth: 18000,
  oneTimeSetupCost: 42000,
  analysisMonths: 12,
  targetPaybackMonths: 7,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['activeAccounts', 1, 10_000_000],
    ['currentAttachPct', 0, 100],
    ['targetAttachPct', 0, 100],
    ['supportPlanPricePerMonth', 1, 1_000_000],
    ['addOnGrossMarginPct', 0, 100],
    ['supportDeliveryCostPerAccount', 0, 100_000],
    ['churnReductionPct', 0, 50],
    ['avgAccountGrossProfitPerMonth', 0, 1_000_000],
    ['programFixedCostPerMonth', 0, 10_000_000],
    ['oneTimeSetupCost', 0, 50_000_000],
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

  if (Number(input.targetAttachPct) < Number(input.currentAttachPct)) {
    return {
      valid: false,
      message: 'targetAttachPct must be greater than or equal to currentAttachPct.',
    };
  }

  return { valid: true, message: '' };
}

export function calculatePremiumSupportAttachROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const activeAccounts = Number(input.activeAccounts);
  const currentAttachPct = Number(input.currentAttachPct);
  const targetAttachPct = Number(input.targetAttachPct);
  const supportPlanPricePerMonth = Number(input.supportPlanPricePerMonth);
  const addOnGrossMarginPct = Number(input.addOnGrossMarginPct);
  const supportDeliveryCostPerAccount = Number(input.supportDeliveryCostPerAccount);
  const churnReductionPct = Number(input.churnReductionPct);
  const avgAccountGrossProfitPerMonth = Number(input.avgAccountGrossProfitPerMonth);
  const programFixedCostPerMonth = Number(input.programFixedCostPerMonth);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);
  const analysisMonths = Number(input.analysisMonths);
  const targetPaybackMonths = Number(input.targetPaybackMonths);

  const currentAttachRate = currentAttachPct / 100;
  const targetAttachRate = targetAttachPct / 100;
  const churnReductionRate = churnReductionPct / 100;

  const currentAttachedAccounts = activeAccounts * currentAttachRate;
  const targetAttachedAccounts = activeAccounts * targetAttachRate;
  const incrementalAttachedAccounts = targetAttachedAccounts - currentAttachedAccounts;

  const addOnGrossProfitPerAccount = (supportPlanPricePerMonth * (addOnGrossMarginPct / 100)) - supportDeliveryCostPerAccount;
  const incrementalAddOnGrossProfit = incrementalAttachedAccounts * addOnGrossProfitPerAccount;

  const savedAccountsPerMonth = targetAttachedAccounts * churnReductionRate;
  const retentionGrossProfit = savedAccountsPerMonth * avgAccountGrossProfitPerMonth;

  const totalIncrementalGrossProfit = incrementalAddOnGrossProfit + retentionGrossProfit;
  const netMonthlyBenefit = totalIncrementalGrossProfit - programFixedCostPerMonth;
  const periodNetBenefit = (netMonthlyBenefit * analysisMonths) - oneTimeSetupCost;

  const roiPct = oneTimeSetupCost > 0
    ? (periodNetBenefit / oneTimeSetupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = netMonthlyBenefit > 0
    ? oneTimeSetupCost / netMonthlyBenefit
    : Number.POSITIVE_INFINITY;

  const breakEvenDenominator = addOnGrossProfitPerAccount + (churnReductionRate * avgAccountGrossProfitPerMonth);
  let breakEvenAttachPct = Number.POSITIVE_INFINITY;

  if (activeAccounts > 0 && breakEvenDenominator > 0) {
    const breakEvenRate = ((programFixedCostPerMonth / activeAccounts) + (currentAttachRate * addOnGrossProfitPerAccount)) / breakEvenDenominator;
    breakEvenAttachPct = breakEvenRate * 100;
  }

  const breakEvenIsReachable = Number.isFinite(breakEvenAttachPct) && breakEvenAttachPct <= 100;

  const status = netMonthlyBenefit <= 0
    ? 'risky'
    : paybackMonths <= targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: {
      activeAccounts,
      currentAttachPct,
      targetAttachPct,
      supportPlanPricePerMonth,
      addOnGrossMarginPct,
      supportDeliveryCostPerAccount,
      churnReductionPct,
      avgAccountGrossProfitPerMonth,
      programFixedCostPerMonth,
      oneTimeSetupCost,
      analysisMonths,
      targetPaybackMonths,
    },
    currentAttachedAccounts: round2(currentAttachedAccounts),
    targetAttachedAccounts: round2(targetAttachedAccounts),
    incrementalAttachedAccounts: round2(incrementalAttachedAccounts),
    addOnGrossProfitPerAccount: round2(addOnGrossProfitPerAccount),
    incrementalAddOnGrossProfit: round2(incrementalAddOnGrossProfit),
    savedAccountsPerMonth: round2(savedAccountsPerMonth),
    retentionGrossProfit: round2(retentionGrossProfit),
    totalIncrementalGrossProfit: round2(totalIncrementalGrossProfit),
    netMonthlyBenefit: round2(netMonthlyBenefit),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenAttachPct: breakEvenIsReachable ? round2(breakEvenAttachPct) : Number.POSITIVE_INFINITY,
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

  const breakEvenText = Number.isFinite(result.breakEvenAttachPct)
    ? `${num.format(result.breakEvenAttachPct)}%`
    : 'Not reachable with current economics';

  return [
    '[Premium Support Attach Rate ROI Snapshot]',
    `Active Accounts: ${num.format(result.inputs.activeAccounts)}`,
    `Attach Rate: ${num.format(result.inputs.currentAttachPct)}% -> ${num.format(result.inputs.targetAttachPct)}%`,
    `Incremental Attached Accounts: ${num.format(result.incrementalAttachedAccounts)}`,
    `Net Monthly Benefit: ${money.format(result.netMonthlyBenefit)}`,
    `Period Net Benefit (${num.format(result.inputs.analysisMonths)} months): ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Attach Rate: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
