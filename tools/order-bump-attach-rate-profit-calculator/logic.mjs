export const DEFAULT_INPUT = {
  monthlyOrders: 8500,
  currentAttachRatePct: 3,
  targetAttachRatePct: 6.5,
  bumpPrice: 18,
  bumpUnitCost: 6,
  fulfillmentCostPerBump: 1.5,
  refundRatePct: 1.8,
  paymentFeePct: 2.9,
  supportCostPerRefund: 2.5,
  monthlyToolCost: 300,
  oneTimeSetupCost: 2500,
  analysisMonths: 12,
  targetPaybackMonths: 3,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyOrders', 1, 10000000],
    ['currentAttachRatePct', 0, 100],
    ['targetAttachRatePct', 0, 100],
    ['bumpPrice', 0.01, 5000],
    ['bumpUnitCost', 0, 5000],
    ['fulfillmentCostPerBump', 0, 500],
    ['refundRatePct', 0, 50],
    ['paymentFeePct', 0, 20],
    ['supportCostPerRefund', 0, 1000],
    ['monthlyToolCost', 0, 100000],
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
  bumpPrice,
  bumpUnitCost,
  fulfillmentCostPerBump,
  refundRatePct,
  paymentFeePct,
  supportCostPerRefund,
  monthlyToolCost,
}) {
  const attachRate = attachRatePct / 100;
  const refundRate = refundRatePct / 100;
  const paymentFeeRate = paymentFeePct / 100;

  const bumpOrders = monthlyOrders * attachRate;
  const grossRevenue = bumpOrders * bumpPrice;
  const refunds = bumpOrders * refundRate;
  const refundLoss = refunds * bumpPrice;
  const paymentFees = grossRevenue * paymentFeeRate;
  const productCost = bumpOrders * bumpUnitCost;
  const fulfillmentCost = bumpOrders * fulfillmentCostPerBump;
  const supportCost = refunds * supportCostPerRefund;
  const monthlyNet = (grossRevenue - refundLoss)
    - paymentFees
    - productCost
    - fulfillmentCost
    - supportCost
    - monthlyToolCost;

  return {
    bumpOrders,
    grossRevenue,
    refundLoss,
    paymentFees,
    productCost,
    fulfillmentCost,
    supportCost,
    monthlyNet,
  };
}

function incrementalBenefit(input, targetAttachRatePct) {
  const current = buildMonthlyScenario({
    ...input,
    attachRatePct: Number(input.currentAttachRatePct),
    monthlyToolCost: 0,
  });

  const target = buildMonthlyScenario({
    ...input,
    attachRatePct: Number(targetAttachRatePct),
    monthlyToolCost: Number(input.monthlyToolCost),
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

export function calculateOrderBumpAttachRateProfit(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const normalized = {
    monthlyOrders: Number(input.monthlyOrders),
    currentAttachRatePct: Number(input.currentAttachRatePct),
    targetAttachRatePct: Number(input.targetAttachRatePct),
    bumpPrice: Number(input.bumpPrice),
    bumpUnitCost: Number(input.bumpUnitCost),
    fulfillmentCostPerBump: Number(input.fulfillmentCostPerBump),
    refundRatePct: Number(input.refundRatePct),
    paymentFeePct: Number(input.paymentFeePct),
    supportCostPerRefund: Number(input.supportCostPerRefund),
    monthlyToolCost: Number(input.monthlyToolCost),
    oneTimeSetupCost: Number(input.oneTimeSetupCost),
    analysisMonths: Number(input.analysisMonths),
    targetPaybackMonths: Number(input.targetPaybackMonths),
  };

  const current = buildMonthlyScenario({
    ...normalized,
    attachRatePct: normalized.currentAttachRatePct,
    monthlyToolCost: 0,
  });
  const target = buildMonthlyScenario({
    ...normalized,
    attachRatePct: normalized.targetAttachRatePct,
    monthlyToolCost: normalized.monthlyToolCost,
  });

  const incrementalBumpOrders = target.bumpOrders - current.bumpOrders;
  const incrementalGrossRevenue = target.grossRevenue - current.grossRevenue;
  const incrementalRefundLoss = target.refundLoss - current.refundLoss;
  const incrementalCogsFulfillmentCost = (target.productCost + target.fulfillmentCost)
    - (current.productCost + current.fulfillmentCost);
  const incrementalProcessingSupportToolCost = (target.paymentFees + target.supportCost + target.monthlyToolCost)
    - (current.paymentFees + current.supportCost + current.monthlyToolCost);
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
    incrementalBumpOrders: round2(incrementalBumpOrders),
    incrementalGrossRevenue: round2(incrementalGrossRevenue),
    incrementalRefundLoss: round2(incrementalRefundLoss),
    incrementalCogsFulfillmentCost: round2(incrementalCogsFulfillmentCost),
    incrementalProcessingSupportToolCost: round2(incrementalProcessingSupportToolCost),
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
    '[Order Bump Attach Rate Profit Snapshot]',
    `Attach Rate: ${num.format(result.inputs.currentAttachRatePct)}% -> ${num.format(result.inputs.targetAttachRatePct)}%`,
    `Incremental Bump Orders / Month: ${num.format(result.incrementalBumpOrders)}`,
    `Incremental Monthly Net Lift: ${money.format(result.incrementalMonthlyNet)}`,
    `Period Net Benefit: ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Attach Rate: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
