export const DEFAULT_INPUT = {
  startingMembers: 2400,
  monthlyNewMembers: 260,
  monthlyMembershipFee: 12,
  currentMonthlyChurnPct: 7.5,
  targetMonthlyChurnPct: 5.8,
  paymentFeePct: 4.5,
  supportCostPerMember: 1.1,
  monthlyRetentionProgramCost: 6200,
  oneTimeSetupCost: 14000,
  analysisMonths: 12,
  targetPaybackMonths: 7,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['startingMembers', 1, 10000000],
    ['monthlyNewMembers', 0, 10000000],
    ['monthlyMembershipFee', 0.01, 10000],
    ['currentMonthlyChurnPct', 0, 60],
    ['targetMonthlyChurnPct', 0, 60],
    ['paymentFeePct', 0, 30],
    ['supportCostPerMember', 0, 1000],
    ['monthlyRetentionProgramCost', 0, 50000000],
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

  if (Number(input.targetMonthlyChurnPct) > Number(input.currentMonthlyChurnPct)) {
    return {
      valid: false,
      message: 'targetMonthlyChurnPct must be less than or equal to currentMonthlyChurnPct.',
    };
  }

  return { valid: true, message: '' };
}

function simulateScenario({
  startingMembers,
  monthlyNewMembers,
  monthlyMembershipFee,
  churnPct,
  paymentFeePct,
  supportCostPerMember,
  monthlyProgramCost,
  analysisMonths,
}) {
  const churnRate = churnPct / 100;
  const paymentFeeRate = paymentFeePct / 100;

  let activeMembers = startingMembers;
  let totalRevenue = 0;
  let totalVariableCost = 0;
  let totalProgramCost = 0;
  let totalNet = 0;

  for (let month = 1; month <= analysisMonths; month += 1) {
    activeMembers += monthlyNewMembers;

    const revenue = activeMembers * monthlyMembershipFee;
    const variableCost = activeMembers * ((monthlyMembershipFee * paymentFeeRate) + supportCostPerMember);
    const net = revenue - variableCost - monthlyProgramCost;

    totalRevenue += revenue;
    totalVariableCost += variableCost;
    totalProgramCost += monthlyProgramCost;
    totalNet += net;

    const churnedMembers = activeMembers * churnRate;
    activeMembers = Math.max(0, activeMembers - churnedMembers);
  }

  return {
    endingMembers: activeMembers,
    totalRevenue,
    totalVariableCost,
    totalProgramCost,
    totalNet,
  };
}

function incrementalNetBeforeSetup(input, candidateTargetChurnPct) {
  const shared = {
    startingMembers: Number(input.startingMembers),
    monthlyNewMembers: Number(input.monthlyNewMembers),
    monthlyMembershipFee: Number(input.monthlyMembershipFee),
    paymentFeePct: Number(input.paymentFeePct),
    supportCostPerMember: Number(input.supportCostPerMember),
    analysisMonths: Number(input.analysisMonths),
  };

  const current = simulateScenario({
    ...shared,
    churnPct: Number(input.currentMonthlyChurnPct),
    monthlyProgramCost: 0,
  });

  const target = simulateScenario({
    ...shared,
    churnPct: candidateTargetChurnPct,
    monthlyProgramCost: Number(input.monthlyRetentionProgramCost),
  });

  return target.totalNet - current.totalNet;
}

function findBreakEvenTargetChurnPct(input) {
  const currentChurn = Number(input.currentMonthlyChurnPct);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);

  const requiredLift = oneTimeSetupCost;
  const bestLift = incrementalNetBeforeSetup(input, 0);
  if (bestLift < requiredLift) {
    return Number.POSITIVE_INFINITY;
  }

  let low = 0;
  let high = currentChurn;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const lift = incrementalNetBeforeSetup(input, mid);

    if (lift >= requiredLift) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
}

export function calculateCreatorMembershipChurnReductionROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const normalized = {
    startingMembers: Number(input.startingMembers),
    monthlyNewMembers: Number(input.monthlyNewMembers),
    monthlyMembershipFee: Number(input.monthlyMembershipFee),
    currentMonthlyChurnPct: Number(input.currentMonthlyChurnPct),
    targetMonthlyChurnPct: Number(input.targetMonthlyChurnPct),
    paymentFeePct: Number(input.paymentFeePct),
    supportCostPerMember: Number(input.supportCostPerMember),
    monthlyRetentionProgramCost: Number(input.monthlyRetentionProgramCost),
    oneTimeSetupCost: Number(input.oneTimeSetupCost),
    analysisMonths: Number(input.analysisMonths),
    targetPaybackMonths: Number(input.targetPaybackMonths),
  };

  const shared = {
    startingMembers: normalized.startingMembers,
    monthlyNewMembers: normalized.monthlyNewMembers,
    monthlyMembershipFee: normalized.monthlyMembershipFee,
    paymentFeePct: normalized.paymentFeePct,
    supportCostPerMember: normalized.supportCostPerMember,
    analysisMonths: normalized.analysisMonths,
  };

  const current = simulateScenario({
    ...shared,
    churnPct: normalized.currentMonthlyChurnPct,
    monthlyProgramCost: 0,
  });

  const target = simulateScenario({
    ...shared,
    churnPct: normalized.targetMonthlyChurnPct,
    monthlyProgramCost: normalized.monthlyRetentionProgramCost,
  });

  const incrementalRevenue = target.totalRevenue - current.totalRevenue;
  const incrementalVariableCost = target.totalVariableCost - current.totalVariableCost;
  const incrementalProgramCost = target.totalProgramCost - current.totalProgramCost;
  const incrementalNetBeforeSetup = target.totalNet - current.totalNet;
  const periodNetBenefit = incrementalNetBeforeSetup - normalized.oneTimeSetupCost;
  const averageMonthlyNetLift = incrementalNetBeforeSetup / normalized.analysisMonths;

  const roiPct = normalized.oneTimeSetupCost > 0
    ? (periodNetBenefit / normalized.oneTimeSetupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = averageMonthlyNetLift > 0
    ? normalized.oneTimeSetupCost / averageMonthlyNetLift
    : Number.POSITIVE_INFINITY;

  const breakEvenTargetChurnPct = findBreakEvenTargetChurnPct(normalized);

  const status = periodNetBenefit <= 0
    ? 'risky'
    : paybackMonths <= normalized.targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: normalized,
    currentEndingMembers: round2(current.endingMembers),
    targetEndingMembers: round2(target.endingMembers),
    retainedMemberDelta: round2(target.endingMembers - current.endingMembers),
    incrementalRevenue: round2(incrementalRevenue),
    incrementalVariableCost: round2(incrementalVariableCost),
    incrementalProgramCost: round2(incrementalProgramCost),
    incrementalNetBeforeSetup: round2(incrementalNetBeforeSetup),
    averageMonthlyNetLift: round2(averageMonthlyNetLift),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenTargetChurnPct: Number.isFinite(breakEvenTargetChurnPct)
      ? round2(breakEvenTargetChurnPct)
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

  const breakEvenText = Number.isFinite(result.breakEvenTargetChurnPct)
    ? `${num.format(result.breakEvenTargetChurnPct)}%`
    : 'Not reachable (even near-zero churn does not cover setup cost)';

  return [
    '[Creator Membership Churn Reduction ROI Snapshot]',
    `Churn: ${num.format(result.inputs.currentMonthlyChurnPct)}% -> ${num.format(result.inputs.targetMonthlyChurnPct)}%`,
    `Retained Member Delta (end of period): ${num.format(result.retainedMemberDelta)}`,
    `Incremental Revenue (${num.format(result.inputs.analysisMonths)}m): ${money.format(result.incrementalRevenue)}`,
    `Incremental Net Before Setup: ${money.format(result.incrementalNetBeforeSetup)}`,
    `Period Net Benefit: ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Churn: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
