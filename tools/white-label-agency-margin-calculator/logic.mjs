export const DEFAULT_INPUT = {
  currentRetainerPrice: 6800,
  plannedHoursPerMonth: 92,
  blendedTeamCostPerHour: 46,
  teamUtilizationPct: 72,
  revisionsPerMonth: 7,
  hoursPerRevision: 1.8,
  scopeCreepPct: 14,
  toolingCostPerMonth: 620,
  managementOverheadPerMonth: 1450,
  paymentFeePct: 2.9,
  targetMarginPct: 28,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['currentRetainerPrice', 1, 1_000_000],
    ['plannedHoursPerMonth', 1, 800],
    ['blendedTeamCostPerHour', 1, 10_000],
    ['teamUtilizationPct', 20, 100],
    ['revisionsPerMonth', 0, 500],
    ['hoursPerRevision', 0, 24],
    ['scopeCreepPct', 0, 300],
    ['toolingCostPerMonth', 0, 1_000_000],
    ['managementOverheadPerMonth', 0, 1_000_000],
    ['paymentFeePct', 0, 40],
    ['targetMarginPct', 0, 90],
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

  const paymentFeeRate = Number(input.paymentFeePct) / 100;
  const targetMarginRate = Number(input.targetMarginPct) / 100;
  if (targetMarginRate + paymentFeeRate >= 1) {
    return {
      valid: false,
      message: 'targetMarginPct plus paymentFeePct must stay below 100%.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateAgencyMargin(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const currentRetainerPrice = Number(input.currentRetainerPrice);
  const plannedHoursPerMonth = Number(input.plannedHoursPerMonth);
  const blendedTeamCostPerHour = Number(input.blendedTeamCostPerHour);
  const teamUtilizationPct = Number(input.teamUtilizationPct);
  const revisionsPerMonth = Number(input.revisionsPerMonth);
  const hoursPerRevision = Number(input.hoursPerRevision);
  const scopeCreepPct = Number(input.scopeCreepPct);
  const toolingCostPerMonth = Number(input.toolingCostPerMonth);
  const managementOverheadPerMonth = Number(input.managementOverheadPerMonth);
  const paymentFeePct = Number(input.paymentFeePct);
  const targetMarginPct = Number(input.targetMarginPct);

  const utilizationRate = teamUtilizationPct / 100;
  const paymentFeeRate = paymentFeePct / 100;
  const targetMarginRate = targetMarginPct / 100;

  const revisionHours = revisionsPerMonth * hoursPerRevision;
  const scopeCreepHours = (plannedHoursPerMonth + revisionHours) * (scopeCreepPct / 100);
  const totalDeliveryHours = plannedHoursPerMonth + revisionHours + scopeCreepHours;

  const effectiveCostPerHour = blendedTeamCostPerHour / utilizationRate;
  const laborCost = totalDeliveryHours * effectiveCostPerHour;
  const totalMonthlyCost = laborCost + toolingCostPerMonth + managementOverheadPerMonth;

  const breakEvenRetainer = totalMonthlyCost / (1 - paymentFeeRate);
  const recommendedRetainer = totalMonthlyCost / (1 - paymentFeeRate - targetMarginRate);

  const currentPaymentFees = currentRetainerPrice * paymentFeeRate;
  const currentNetAfterFees = currentRetainerPrice - currentPaymentFees;
  const currentOperatingProfit = currentNetAfterFees - totalMonthlyCost;
  const currentOperatingMarginPct = currentRetainerPrice > 0
    ? (currentOperatingProfit / currentRetainerPrice) * 100
    : 0;

  const priceDelta = recommendedRetainer - currentRetainerPrice;
  const marginGapPct = targetMarginPct - currentOperatingMarginPct;

  const status = currentOperatingMarginPct >= targetMarginPct + 3
    ? 'strong'
    : currentOperatingMarginPct >= targetMarginPct - 3
      ? 'balanced'
      : 'risky';

  return {
    inputs: {
      currentRetainerPrice,
      plannedHoursPerMonth,
      blendedTeamCostPerHour,
      teamUtilizationPct,
      revisionsPerMonth,
      hoursPerRevision,
      scopeCreepPct,
      toolingCostPerMonth,
      managementOverheadPerMonth,
      paymentFeePct,
      targetMarginPct,
    },
    revisionHours: round2(revisionHours),
    scopeCreepHours: round2(scopeCreepHours),
    totalDeliveryHours: round2(totalDeliveryHours),
    effectiveCostPerHour: round2(effectiveCostPerHour),
    laborCost: round2(laborCost),
    totalMonthlyCost: round2(totalMonthlyCost),
    breakEvenRetainer: round2(breakEvenRetainer),
    recommendedRetainer: round2(recommendedRetainer),
    currentPaymentFees: round2(currentPaymentFees),
    currentNetAfterFees: round2(currentNetAfterFees),
    currentOperatingProfit: round2(currentOperatingProfit),
    currentOperatingMarginPct: round2(currentOperatingMarginPct),
    marginGapPct: round2(marginGapPct),
    priceDelta: round2(priceDelta),
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
    '[White-Label Agency Margin Plan]',
    `Current Retainer: ${money.format(result.inputs.currentRetainerPrice)}`,
    `Total Delivery Hours (incl. revisions + creep): ${num.format(result.totalDeliveryHours)}`,
    `Modeled Monthly Cost: ${money.format(result.totalMonthlyCost)}`,
    `Break-even Retainer (after fees): ${money.format(result.breakEvenRetainer)}`,
    `Recommended Retainer @ ${num.format(result.inputs.targetMarginPct)}% margin: ${money.format(result.recommendedRetainer)}`,
    `Current Operating Margin: ${num.format(result.currentOperatingMarginPct)}%`,
    `Margin Gap to Target: ${num.format(result.marginGapPct)} pts`,
    `Price Delta vs Current: ${money.format(result.priceDelta)}`,
    `Status: ${result.status}`,
  ].join('\n');
}
