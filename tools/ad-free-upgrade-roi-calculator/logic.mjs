export const DEFAULT_INPUT = {
  mau: 250000,
  adExposureRatePct: 68,
  adRevenuePerUser: 1.65,
  adFreePrice: 4.99,
  attachRatePct: 3.2,
  platformFeePct: 15,
  serviceCostPerSubscriber: 0.35,
  monthlyProgramCost: 1800,
  oneTimeSetupCost: 9000,
  analysisMonths: 12,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const roundInt = (n) => Math.round(n);

export function validateInputs(input) {
  const checks = [
    ['mau', 1, 1_000_000_000],
    ['adExposureRatePct', 0, 100],
    ['adRevenuePerUser', 0, 1000],
    ['adFreePrice', 0, 1000],
    ['attachRatePct', 0, 100],
    ['platformFeePct', 0, 50],
    ['serviceCostPerSubscriber', 0, 1000],
    ['monthlyProgramCost', 0, 100_000_000],
    ['oneTimeSetupCost', 0, 200_000_000],
    ['analysisMonths', 1, 60],
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

  return { valid: true, message: '' };
}

export function calculateAdFreeUpgradeROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const mau = Number(input.mau);
  const adExposureRatePct = Number(input.adExposureRatePct);
  const adRevenuePerUser = Number(input.adRevenuePerUser);
  const adFreePrice = Number(input.adFreePrice);
  const attachRatePct = Number(input.attachRatePct);
  const platformFeePct = Number(input.platformFeePct);
  const serviceCostPerSubscriber = Number(input.serviceCostPerSubscriber);
  const monthlyProgramCost = Number(input.monthlyProgramCost);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);
  const analysisMonths = Number(input.analysisMonths);

  const adExposureRate = adExposureRatePct / 100;
  const attachRate = attachRatePct / 100;
  const platformFeeRate = platformFeePct / 100;

  const adExposedUsers = mau * adExposureRate;
  const adFreeSubscribers = adExposedUsers * attachRate;

  const netSubscriptionPrice = adFreePrice * (1 - platformFeeRate);
  const netContributionPerSubscriber = netSubscriptionPrice - adRevenuePerUser - serviceCostPerSubscriber;

  const grossSubscriptionRevenue = adFreeSubscribers * netSubscriptionPrice;
  const lostAdRevenue = adFreeSubscribers * adRevenuePerUser;
  const serviceCost = adFreeSubscribers * serviceCostPerSubscriber;

  const netMonthlyBenefit = grossSubscriptionRevenue - lostAdRevenue - serviceCost - monthlyProgramCost;
  const periodNetBenefit = netMonthlyBenefit * analysisMonths - oneTimeSetupCost;

  const roiPct = oneTimeSetupCost > 0
    ? (periodNetBenefit / oneTimeSetupCost) * 100
    : (periodNetBenefit > 0 ? Number.POSITIVE_INFINITY : 0);

  const paybackMonths = netMonthlyBenefit > 0
    ? (oneTimeSetupCost > 0 ? oneTimeSetupCost / netMonthlyBenefit : 0)
    : Number.POSITIVE_INFINITY;

  const breakEvenAttachRatePct = netContributionPerSubscriber > 0 && adExposedUsers > 0
    ? (monthlyProgramCost / (adExposedUsers * netContributionPerSubscriber)) * 100
    : Number.POSITIVE_INFINITY;

  const status = netMonthlyBenefit > 0
    ? (roiPct >= 50 ? 'strong' : 'watch')
    : 'weak';

  return {
    inputs: {
      mau,
      adExposureRatePct,
      adRevenuePerUser,
      adFreePrice,
      attachRatePct,
      platformFeePct,
      serviceCostPerSubscriber,
      monthlyProgramCost,
      oneTimeSetupCost,
      analysisMonths,
    },
    adExposedUsers: roundInt(adExposedUsers),
    adFreeSubscribers: round2(adFreeSubscribers),
    netSubscriptionPrice: round2(netSubscriptionPrice),
    netContributionPerSubscriber: round2(netContributionPerSubscriber),
    grossSubscriptionRevenue: round2(grossSubscriptionRevenue),
    lostAdRevenue: round2(lostAdRevenue),
    serviceCost: round2(serviceCost),
    netMonthlyBenefit: round2(netMonthlyBenefit),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: round2(roiPct),
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenAttachRatePct: Number.isFinite(breakEvenAttachRatePct)
      ? round2(breakEvenAttachRatePct)
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

  const roiText = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  const paybackText = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  const breakEvenText = Number.isFinite(result.breakEvenAttachRatePct)
    ? `${num.format(result.breakEvenAttachRatePct)}%`
    : 'Not reachable';

  return [
    'Ad-free upgrade ROI snapshot',
    `- Ad-exposed MAU: ${num.format(result.adExposedUsers)} (attach ${num.format(result.inputs.attachRatePct)}% → ${num.format(result.adFreeSubscribers)} subs)`,
    `- Net subscription price: ${money.format(result.netSubscriptionPrice)} | Lost ad ARPU: ${money.format(result.inputs.adRevenuePerUser)} | Service cost: ${money.format(result.inputs.serviceCostPerSubscriber)}`,
    `- Net contribution / sub: ${money.format(result.netContributionPerSubscriber)}`,
    `- Net monthly benefit: ${money.format(result.netMonthlyBenefit)} (program cost included)`,
    `- Period net benefit (${num.format(result.inputs.analysisMonths)} months): ${money.format(result.periodNetBenefit)}`,
    `- ROI: ${roiText} | Payback: ${paybackText} | Break-even attach rate: ${breakEvenText}`,
  ].join('\n');
}
