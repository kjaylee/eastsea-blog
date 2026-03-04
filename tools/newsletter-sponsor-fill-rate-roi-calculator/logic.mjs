export const DEFAULT_INPUT = {
  issuesPerMonth: 8,
  adSlotsPerIssue: 2,
  currentFillRatePct: 52,
  targetFillRatePct: 78,
  avgSponsorFeePerSlot: 600,
  deliveryCostPerFilledSlot: 75,
  monthlySalesOpsCost: 700,
  monthlyToolingCost: 120,
  oneTimeSetupCost: 900,
  analysisMonths: 12,
  targetPaybackMonths: 4,
};

export function validateInputs(input) {
  const mustBePositiveInt = ['issuesPerMonth', 'adSlotsPerIssue', 'analysisMonths', 'targetPaybackMonths'];
  for (const key of mustBePositiveInt) {
    if (!Number.isFinite(input[key]) || input[key] <= 0) {
      return { valid: false, message: `${key} must be greater than 0` };
    }
  }

  const rates = ['currentFillRatePct', 'targetFillRatePct'];
  for (const key of rates) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > 100) {
      return { valid: false, message: `${key} must be between 0 and 100` };
    }
  }

  const nonNegative = [
    'avgSponsorFeePerSlot',
    'deliveryCostPerFilledSlot',
    'monthlySalesOpsCost',
    'monthlyToolingCost',
    'oneTimeSetupCost',
  ];

  for (const key of nonNegative) {
    if (!Number.isFinite(input[key]) || input[key] < 0) {
      return { valid: false, message: `${key} must be 0 or more` };
    }
  }

  if (input.targetFillRatePct < input.currentFillRatePct) {
    return { valid: false, message: 'targetFillRatePct should be greater than or equal to currentFillRatePct' };
  }

  return { valid: true, message: '' };
}

function safeDivide(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return Infinity;
  return numerator / denominator;
}

export function calculateNewsletterSponsorFillRateROI(input) {
  const months = input.analysisMonths;
  const slotsPerMonth = input.issuesPerMonth * input.adSlotsPerIssue;
  const totalSlots = slotsPerMonth * months;

  const currentRate = input.currentFillRatePct / 100;
  const targetRate = input.targetFillRatePct / 100;

  const currentFilledSlots = totalSlots * currentRate;
  const targetFilledSlots = totalSlots * targetRate;
  const incrementalFilledSlots = targetFilledSlots - currentFilledSlots;

  const currentRevenue = currentFilledSlots * input.avgSponsorFeePerSlot;
  const targetRevenue = targetFilledSlots * input.avgSponsorFeePerSlot;
  const incrementalRevenue = targetRevenue - currentRevenue;

  const incrementalVariableCost = incrementalFilledSlots * input.deliveryCostPerFilledSlot;
  const incrementalFixedCost = (input.monthlySalesOpsCost + input.monthlyToolingCost) * months;

  const incrementalNetBeforeSetup = incrementalRevenue - incrementalVariableCost - incrementalFixedCost;
  const periodNetBenefit = incrementalNetBeforeSetup - input.oneTimeSetupCost;

  const totalInvestment = incrementalVariableCost + incrementalFixedCost + input.oneTimeSetupCost;
  const roiPct = totalInvestment > 0 ? (periodNetBenefit / totalInvestment) * 100 : Infinity;

  const averageMonthlyNetLift = periodNetBenefit / months;

  const monthlyIncrementalContribution =
    (slotsPerMonth * (targetRate - currentRate) * (input.avgSponsorFeePerSlot - input.deliveryCostPerFilledSlot)) -
    input.monthlySalesOpsCost -
    input.monthlyToolingCost;

  const paybackMonths = monthlyIncrementalContribution > 0
    ? safeDivide(input.oneTimeSetupCost, monthlyIncrementalContribution)
    : Infinity;

  const contributionPerSlot = input.avgSponsorFeePerSlot - input.deliveryCostPerFilledSlot;
  const breakEvenFillRatePct = contributionPerSlot > 0
    ? (currentRate + safeDivide(incrementalFixedCost + input.oneTimeSetupCost, totalSlots * contributionPerSlot)) * 100
    : Infinity;

  let status = 'bad';
  if (periodNetBenefit > 0 && paybackMonths <= input.targetPaybackMonths) {
    status = 'strong';
  } else if (periodNetBenefit > 0) {
    status = 'watch';
  }

  return {
    ...input,
    totalSlots,
    slotsPerMonth,
    currentFilledSlots,
    targetFilledSlots,
    incrementalFilledSlots,
    currentRevenue,
    targetRevenue,
    incrementalRevenue,
    incrementalVariableCost,
    incrementalFixedCost,
    incrementalNetBeforeSetup,
    periodNetBenefit,
    totalInvestment,
    roiPct,
    averageMonthlyNetLift,
    monthlyIncrementalContribution,
    paybackMonths,
    breakEvenFillRatePct,
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
    : 'No payback';

  const breakEvenText = Number.isFinite(result.breakEvenFillRatePct)
    ? `${num.format(result.breakEvenFillRatePct)}%`
    : 'Not reachable';

  const roiText = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';

  return [
    'Newsletter Sponsor Fill Rate ROI Summary',
    `- Inventory: ${num.format(result.issuesPerMonth)} issues/month × ${num.format(result.adSlotsPerIssue)} slots`,
    `- Fill rate: ${num.format(result.currentFillRatePct)}% → ${num.format(result.targetFillRatePct)}%`,
    `- Incremental filled slots: ${num.format(result.incrementalFilledSlots)}`,
    `- Incremental revenue: ${money.format(result.incrementalRevenue)}`,
    `- Period net benefit: ${money.format(result.periodNetBenefit)}`,
    `- ROI: ${roiText}`,
    `- Payback: ${paybackText}`,
    `- Break-even fill rate: ${breakEvenText}`,
  ].join('\n');
}
