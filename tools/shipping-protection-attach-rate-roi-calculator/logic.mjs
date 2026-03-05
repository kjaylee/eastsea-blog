export const DEFAULT_INPUT = {
  monthlyOrders: 12000,
  currentAttachRatePct: 2.2,
  targetAttachRatePct: 5.5,
  protectionPrice: 2.4,
  claimRatePct: 0.8,
  avgClaimPayout: 18,
  paymentFeePct: 3,
  supportCostPerClaim: 1.2,
  platformFeePerOrder: 0.2,
  monthlyPlatformFee: 500,
  oneTimeSetupCost: 6000,
  analysisMonths: 12,
  targetPaybackMonths: 4,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyOrders', 1, 10000000],
    ['currentAttachRatePct', 0, 100],
    ['targetAttachRatePct', 0, 100],
    ['protectionPrice', 0.01, 1000],
    ['claimRatePct', 0, 50],
    ['avgClaimPayout', 0, 100000],
    ['paymentFeePct', 0, 20],
    ['supportCostPerClaim', 0, 1000],
    ['platformFeePerOrder', 0, 50],
    ['monthlyPlatformFee', 0, 1000000],
    ['oneTimeSetupCost', 0, 50000000],
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

function buildMonthlyScenario({
  monthlyOrders,
  attachRatePct,
  protectionPrice,
  claimRatePct,
  avgClaimPayout,
  paymentFeePct,
  supportCostPerClaim,
  platformFeePerOrder,
  monthlyPlatformFee,
}) {
  const attachRate = attachRatePct / 100;
  const claimRate = claimRatePct / 100;
  const paymentFeeRate = paymentFeePct / 100;

  const protectedOrders = monthlyOrders * attachRate;
  const revenue = protectedOrders * protectionPrice;
  const paymentFees = revenue * paymentFeeRate;
  const claims = protectedOrders * claimRate;
  const claimCost = claims * avgClaimPayout;
  const supportCost = claims * supportCostPerClaim;
  const platformVariable = protectedOrders * platformFeePerOrder;
  const platformCost = platformVariable + monthlyPlatformFee;
  const monthlyNet = revenue - paymentFees - claimCost - supportCost - platformCost;

  return {
    protectedOrders,
    revenue,
    paymentFees,
    claims,
    claimCost,
    supportCost,
    platformCost,
    monthlyNet,
  };
}

function incrementalBenefit(input, targetAttachRatePct) {
  const current = buildMonthlyScenario({
    ...input,
    attachRatePct: Number(input.currentAttachRatePct),
  });

  const target = buildMonthlyScenario({
    ...input,
    attachRatePct: Number(targetAttachRatePct),
  });

  const incrementalMonthlyNet = target.monthlyNet - current.monthlyNet;
  return (incrementalMonthlyNet * Number(input.analysisMonths)) - Number(input.oneTimeSetupCost);
}

function findBreakEvenAttachRate(input) {
  const currentAttach = Number(input.currentAttachRatePct);
  const setupCost = Number(input.oneTimeSetupCost);
  const benefitAtCurrent = incrementalBenefit(input, currentAttach);

  if (setupCost === 0 && benefitAtCurrent >= 0) {
    return currentAttach;
  }

  const bestBenefit = incrementalBenefit(input, 100);
  if (bestBenefit < 0) {
    return Number.POSITIVE_INFINITY;
  }

  let low = currentAttach;
  let high = 100;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const benefit = incrementalBenefit(input, mid);

    if (benefit >= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
}

export function calculateShippingProtectionAttachRateROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const normalized = {
    monthlyOrders: Number(input.monthlyOrders),
    currentAttachRatePct: Number(input.currentAttachRatePct),
    targetAttachRatePct: Number(input.targetAttachRatePct),
    protectionPrice: Number(input.protectionPrice),
    claimRatePct: Number(input.claimRatePct),
    avgClaimPayout: Number(input.avgClaimPayout),
    paymentFeePct: Number(input.paymentFeePct),
    supportCostPerClaim: Number(input.supportCostPerClaim),
    platformFeePerOrder: Number(input.platformFeePerOrder),
    monthlyPlatformFee: Number(input.monthlyPlatformFee),
    oneTimeSetupCost: Number(input.oneTimeSetupCost),
    analysisMonths: Number(input.analysisMonths),
    targetPaybackMonths: Number(input.targetPaybackMonths),
  };

  const current = buildMonthlyScenario({
    ...normalized,
    attachRatePct: normalized.currentAttachRatePct,
  });
  const target = buildMonthlyScenario({
    ...normalized,
    attachRatePct: normalized.targetAttachRatePct,
  });

  const incrementalProtectedOrders = target.protectedOrders - current.protectedOrders;
  const incrementalRevenue = target.revenue - current.revenue;
  const incrementalClaimCost = target.claimCost - current.claimCost;
  const incrementalProcessingFees = target.paymentFees - current.paymentFees;
  const incrementalPlatformSupportCost = (target.supportCost + target.platformCost)
    - (current.supportCost + current.platformCost);
  const incrementalMonthlyNet = target.monthlyNet - current.monthlyNet;

  const periodNetBenefit = (incrementalMonthlyNet * normalized.analysisMonths)
    - normalized.oneTimeSetupCost;

  const roiPct = normalized.oneTimeSetupCost > 0
    ? (periodNetBenefit / normalized.oneTimeSetupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = incrementalMonthlyNet > 0
    ? normalized.oneTimeSetupCost / incrementalMonthlyNet
    : Number.POSITIVE_INFINITY;

  const breakEvenTargetAttachRatePct = findBreakEvenAttachRate(normalized);

  const status = periodNetBenefit <= 0
    ? 'risky'
    : paybackMonths <= normalized.targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: normalized,
    currentMonthlyNet: round2(current.monthlyNet),
    targetMonthlyNet: round2(target.monthlyNet),
    incrementalProtectedOrders: round2(incrementalProtectedOrders),
    incrementalRevenue: round2(incrementalRevenue),
    incrementalClaimCost: round2(incrementalClaimCost),
    incrementalProcessingFees: round2(incrementalProcessingFees),
    incrementalPlatformSupportCost: round2(incrementalPlatformSupportCost),
    incrementalMonthlyNet: round2(incrementalMonthlyNet),
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
    : 'Not reachable (even 100% attach rate does not cover setup cost)';

  return [
    '[Shipping Protection Attach Rate ROI Snapshot]',
    `Attach Rate: ${num.format(result.inputs.currentAttachRatePct)}% -> ${num.format(result.inputs.targetAttachRatePct)}%`,
    `Incremental Protected Orders / Month: ${num.format(result.incrementalProtectedOrders)}`,
    `Incremental Monthly Net Lift: ${money.format(result.incrementalMonthlyNet)}`,
    `Period Net Benefit: ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Attach Rate: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
