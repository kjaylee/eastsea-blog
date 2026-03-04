export const DEFAULT_INPUT = {
  eligibleMau: 250000,
  currentAttachRate: 4.5,
  targetAttachRate: 6.5,
  battlePassPrice: 12000,
  platformFeePct: 30,
  rewardCostPerBuyer: 1800,
  retentionLiftPct: 0.35,
  profitPerRetainedUser: 3200,
  monthlyOpsCost: 2500000,
  setupCost: 15000000,
  analysisMonths: 12,
  targetPaybackMonths: 8,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['eligibleMau', 1, 100000000],
    ['currentAttachRate', 0, 100],
    ['targetAttachRate', 0, 100],
    ['battlePassPrice', 0.01, 1000000],
    ['platformFeePct', 0, 60],
    ['rewardCostPerBuyer', 0, 200000],
    ['retentionLiftPct', 0, 100],
    ['profitPerRetainedUser', 0, 200000],
    ['monthlyOpsCost', 0, 200000000],
    ['setupCost', 0, 1000000000],
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

  if (Number(input.targetAttachRate) < Number(input.currentAttachRate)) {
    return { valid: false, message: 'targetAttachRate must be >= currentAttachRate.' };
  }

  return { valid: true, message: '' };
}

function computeBreakEvenTargetAttachRate({
  eligibleMau,
  currentAttachRate,
  netPerBuyer,
  setupCost,
  analysisMonths,
  monthlyOpsCost,
  monthlyRetentionValue,
}) {
  if (eligibleMau <= 0) return Number.POSITIVE_INFINITY;
  if (netPerBuyer <= 0) return Number.POSITIVE_INFINITY;

  const requiredIncrementalBuyers = (setupCost / analysisMonths + monthlyOpsCost - monthlyRetentionValue) / netPerBuyer;
  const incrementalBuyers = Math.max(0, requiredIncrementalBuyers);
  const attachDelta = (incrementalBuyers / eligibleMau) * 100;
  const breakEvenAttach = currentAttachRate + attachDelta;

  if (!Number.isFinite(breakEvenAttach) || breakEvenAttach > 100) {
    return Number.POSITIVE_INFINITY;
  }

  return breakEvenAttach;
}

export function calculateBattlePassAttachRateROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const normalized = {
    eligibleMau: Number(input.eligibleMau),
    currentAttachRate: Number(input.currentAttachRate),
    targetAttachRate: Number(input.targetAttachRate),
    battlePassPrice: Number(input.battlePassPrice),
    platformFeePct: Number(input.platformFeePct),
    rewardCostPerBuyer: Number(input.rewardCostPerBuyer),
    retentionLiftPct: Number(input.retentionLiftPct),
    profitPerRetainedUser: Number(input.profitPerRetainedUser),
    monthlyOpsCost: Number(input.monthlyOpsCost),
    setupCost: Number(input.setupCost),
    analysisMonths: Number(input.analysisMonths),
    targetPaybackMonths: Number(input.targetPaybackMonths),
  };

  const attachDeltaPct = (normalized.targetAttachRate - normalized.currentAttachRate) / 100;
  const incrementalBuyers = normalized.eligibleMau * attachDeltaPct;

  const platformFeeRate = normalized.platformFeePct / 100;
  const netPerBuyer = normalized.battlePassPrice * (1 - platformFeeRate) - normalized.rewardCostPerBuyer;

  const incrementalGrossRevenue = incrementalBuyers * normalized.battlePassPrice;
  const platformFees = incrementalGrossRevenue * platformFeeRate;
  const rewardCostTotal = incrementalBuyers * normalized.rewardCostPerBuyer;
  const buyerNetProfit = incrementalBuyers * netPerBuyer;

  const monthlyRetentionValue = normalized.eligibleMau
    * (normalized.retentionLiftPct / 100)
    * normalized.profitPerRetainedUser;

  const monthlyNetLift = buyerNetProfit + monthlyRetentionValue - normalized.monthlyOpsCost;
  const periodNetBenefit = monthlyNetLift * normalized.analysisMonths - normalized.setupCost;

  const roiPct = normalized.setupCost > 0
    ? (periodNetBenefit / normalized.setupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = monthlyNetLift > 0
    ? normalized.setupCost / monthlyNetLift
    : Number.POSITIVE_INFINITY;

  const breakEvenTargetAttachRate = computeBreakEvenTargetAttachRate({
    eligibleMau: normalized.eligibleMau,
    currentAttachRate: normalized.currentAttachRate,
    netPerBuyer,
    setupCost: normalized.setupCost,
    analysisMonths: normalized.analysisMonths,
    monthlyOpsCost: normalized.monthlyOpsCost,
    monthlyRetentionValue,
  });

  const totalInvestment = normalized.setupCost + normalized.monthlyOpsCost * normalized.analysisMonths;

  const status = periodNetBenefit <= 0
    ? 'risky'
    : paybackMonths <= normalized.targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: normalized,
    incrementalBuyers: round2(incrementalBuyers),
    netPerBuyer: round2(netPerBuyer),
    incrementalGrossRevenue: round2(incrementalGrossRevenue),
    platformFees: round2(platformFees),
    rewardCostTotal: round2(rewardCostTotal),
    buyerNetProfit: round2(buyerNetProfit),
    monthlyRetentionValue: round2(monthlyRetentionValue),
    monthlyNetLift: round2(monthlyNetLift),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenTargetAttachRate: Number.isFinite(breakEvenTargetAttachRate)
      ? round2(breakEvenTargetAttachRate)
      : Number.POSITIVE_INFINITY,
    totalInvestment: round2(totalInvestment),
    status,
  };
}

export function buildSummary(result, locale = 'ko-KR', currency = 'KRW') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  const paybackText = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)}개월`
    : '회수 불가';

  const breakEvenText = Number.isFinite(result.breakEvenTargetAttachRate)
    ? `${num.format(result.breakEvenTargetAttachRate)}%`
    : '도달 불가';

  return [
    '[배틀패스 부착률 ROI 요약]',
    `부착률: ${num.format(result.inputs.currentAttachRate)}% → ${num.format(result.inputs.targetAttachRate)}%`,
    `순증 구매자: ${num.format(result.incrementalBuyers)}명`,
    `구매자당 순이익: ${money.format(result.netPerBuyer)}`,
    `월 리텐션 가치: ${money.format(result.monthlyRetentionValue)}`,
    `월 순효과: ${money.format(result.monthlyNetLift)}`,
    `기간 순효과: ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `회수기간: ${paybackText}`,
    `손익분기 부착률: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
