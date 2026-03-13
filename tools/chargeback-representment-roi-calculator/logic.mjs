export const DEFAULT_INPUT = {
  disputedOrdersPerMonth: 180,
  averageOrderValue: 92,
  chargebackFeePerCase: 18,
  currentWinRatePct: 18,
  projectedWinRatePct: 36,
  evidencePrepCostPerCase: 7.5,
  vendorFeePct: 22,
  platformFeePct: 4,
  monthlySoftwareCost: 399,
  analystHoursPerMonth: 22,
  analystHourlyCost: 28,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['disputedOrdersPerMonth', 1, 1_000_000],
    ['averageOrderValue', 0.01, 1_000_000],
    ['chargebackFeePerCase', 0, 10_000],
    ['currentWinRatePct', 0, 100],
    ['projectedWinRatePct', 0, 100],
    ['evidencePrepCostPerCase', 0, 10_000],
    ['vendorFeePct', 0, 99],
    ['platformFeePct', 0, 99],
    ['monthlySoftwareCost', 0, 1_000_000],
    ['analystHoursPerMonth', 0, 10_000],
    ['analystHourlyCost', 0, 10_000],
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

  if (Number(input.projectedWinRatePct) < Number(input.currentWinRatePct)) {
    return { valid: false, message: 'projectedWinRatePct must be greater than or equal to currentWinRatePct.' };
  }

  if (Number(input.vendorFeePct) + Number(input.platformFeePct) >= 100) {
    return { valid: false, message: 'vendorFeePct + platformFeePct must be below 100.' };
  }

  return { valid: true, message: '' };
}

export function calculateRepresentmentRoi(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const disputedOrdersPerMonth = Number(input.disputedOrdersPerMonth);
  const averageOrderValue = Number(input.averageOrderValue);
  const chargebackFeePerCase = Number(input.chargebackFeePerCase);
  const currentWinRatePct = Number(input.currentWinRatePct);
  const projectedWinRatePct = Number(input.projectedWinRatePct);
  const evidencePrepCostPerCase = Number(input.evidencePrepCostPerCase);
  const vendorFeePct = Number(input.vendorFeePct);
  const platformFeePct = Number(input.platformFeePct);
  const monthlySoftwareCost = Number(input.monthlySoftwareCost);
  const analystHoursPerMonth = Number(input.analystHoursPerMonth);
  const analystHourlyCost = Number(input.analystHourlyCost);

  const currentWinRate = currentWinRatePct / 100;
  const projectedWinRate = projectedWinRatePct / 100;
  const vendorFeeRate = vendorFeePct / 100;
  const platformFeeRate = platformFeePct / 100;

  const grossValuePerWin = averageOrderValue + chargebackFeePerCase;
  const currentWins = disputedOrdersPerMonth * currentWinRate;
  const projectedWins = disputedOrdersPerMonth * projectedWinRate;
  const incrementalWins = projectedWins - currentWins;

  const currentRecoveredRevenue = currentWins * grossValuePerWin;
  const projectedRecoveredRevenue = projectedWins * grossValuePerWin;
  const incrementalRecoveredRevenue = incrementalWins * grossValuePerWin;

  const evidenceCost = projectedWins * evidencePrepCostPerCase;
  const vendorFeeCost = incrementalRecoveredRevenue * vendorFeeRate;
  const platformFeeCost = incrementalRecoveredRevenue * platformFeeRate;
  const laborCost = analystHoursPerMonth * analystHourlyCost;
  const fixedCost = monthlySoftwareCost + laborCost;
  const totalProgramCost = evidenceCost + vendorFeeCost + platformFeeCost + fixedCost;

  const netLift = incrementalRecoveredRevenue - totalProgramCost;
  const roiPct = totalProgramCost > 0 ? (netLift / totalProgramCost) * 100 : 0;

  const retentionRateAfterFees = 1 - vendorFeeRate - platformFeeRate;
  const breakEvenIncrementalRecoveredRevenue = retentionRateAfterFees > 0
    ? (fixedCost + evidenceCost) / retentionRateAfterFees
    : Number.POSITIVE_INFINITY;
  const breakEvenIncrementalWins = Number.isFinite(breakEvenIncrementalRecoveredRevenue)
    ? breakEvenIncrementalRecoveredRevenue / grossValuePerWin
    : Number.POSITIVE_INFINITY;
  const breakEvenProjectedWins = currentWins + breakEvenIncrementalWins;
  const breakEvenProjectedWinRatePct = Number.isFinite(breakEvenProjectedWins)
    ? (breakEvenProjectedWins / disputedOrdersPerMonth) * 100
    : Number.POSITIVE_INFINITY;

  const paybackMonths = netLift > 0 ? totalProgramCost / netLift : Number.POSITIVE_INFINITY;

  const status =
    netLift > 0 && roiPct >= 75 ? 'strong'
      : netLift > 0 ? 'balanced'
        : 'risky';

  return {
    inputs: {
      disputedOrdersPerMonth,
      averageOrderValue,
      chargebackFeePerCase,
      currentWinRatePct,
      projectedWinRatePct,
      evidencePrepCostPerCase,
      vendorFeePct,
      platformFeePct,
      monthlySoftwareCost,
      analystHoursPerMonth,
      analystHourlyCost,
    },
    grossValuePerWin: round2(grossValuePerWin),
    currentWins: round2(currentWins),
    projectedWins: round2(projectedWins),
    incrementalWins: round2(incrementalWins),
    currentRecoveredRevenue: round2(currentRecoveredRevenue),
    projectedRecoveredRevenue: round2(projectedRecoveredRevenue),
    incrementalRecoveredRevenue: round2(incrementalRecoveredRevenue),
    evidenceCost: round2(evidenceCost),
    vendorFeeCost: round2(vendorFeeCost),
    platformFeeCost: round2(platformFeeCost),
    laborCost: round2(laborCost),
    fixedCost: round2(fixedCost),
    totalProgramCost: round2(totalProgramCost),
    netLift: round2(netLift),
    roiPct: round2(roiPct),
    breakEvenIncrementalRecoveredRevenue: Number.isFinite(breakEvenIncrementalRecoveredRevenue)
      ? round2(breakEvenIncrementalRecoveredRevenue)
      : Number.POSITIVE_INFINITY,
    breakEvenProjectedWinRatePct: Number.isFinite(breakEvenProjectedWinRatePct)
      ? round2(breakEvenProjectedWinRatePct)
      : Number.POSITIVE_INFINITY,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
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

  return [
    '[Chargeback Representment ROI Summary]',
    `Current recovered revenue: ${money.format(result.currentRecoveredRevenue)}`,
    `Projected recovered revenue: ${money.format(result.projectedRecoveredRevenue)}`,
    `Incremental recovered revenue: ${money.format(result.incrementalRecoveredRevenue)}`,
    `Total program cost: ${money.format(result.totalProgramCost)}`,
    `Net lift: ${money.format(result.netLift)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Break-even projected win rate: ${Number.isFinite(result.breakEvenProjectedWinRatePct) ? `${num.format(result.breakEvenProjectedWinRatePct)}%` : '∞'}`,
    `Payback period: ${Number.isFinite(result.paybackMonths) ? `${num.format(result.paybackMonths)} months` : 'No payback under current assumptions'}`,
    `Status: ${result.status}`,
  ].join('\n');
}
