export const DEFAULT_INPUT = {
  monthlyTickets: 18500,
  currentDeflectionPct: 12,
  targetDeflectionPct: 38,
  avgHandleMinutes: 9.5,
  agentHourlyCost: 34,
  aiCostPerDeflectedTicket: 0.28,
  implementationCostPerMonth: 4200,
  platformFeePerMonth: 1800,
  qualityReviewCostPerMonth: 950,
  oneTimeSetupCost: 16000,
  targetPaybackMonths: 6,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyTickets', 100, 5_000_000],
    ['currentDeflectionPct', 0, 95],
    ['targetDeflectionPct', 0, 98],
    ['avgHandleMinutes', 1, 120],
    ['agentHourlyCost', 5, 500],
    ['aiCostPerDeflectedTicket', 0, 100],
    ['implementationCostPerMonth', 0, 2_000_000],
    ['platformFeePerMonth', 0, 2_000_000],
    ['qualityReviewCostPerMonth', 0, 1_000_000],
    ['oneTimeSetupCost', 0, 10_000_000],
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

  const currentDeflectionPct = Number(input.currentDeflectionPct);
  const targetDeflectionPct = Number(input.targetDeflectionPct);
  if (targetDeflectionPct < currentDeflectionPct) {
    return {
      valid: false,
      message: 'targetDeflectionPct must be greater than or equal to currentDeflectionPct.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateSupportDeflectionROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyTickets = Number(input.monthlyTickets);
  const currentDeflectionPct = Number(input.currentDeflectionPct);
  const targetDeflectionPct = Number(input.targetDeflectionPct);
  const avgHandleMinutes = Number(input.avgHandleMinutes);
  const agentHourlyCost = Number(input.agentHourlyCost);
  const aiCostPerDeflectedTicket = Number(input.aiCostPerDeflectedTicket);
  const implementationCostPerMonth = Number(input.implementationCostPerMonth);
  const platformFeePerMonth = Number(input.platformFeePerMonth);
  const qualityReviewCostPerMonth = Number(input.qualityReviewCostPerMonth);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);
  const targetPaybackMonths = Number(input.targetPaybackMonths);

  const currentDeflectionRate = currentDeflectionPct / 100;
  const targetDeflectionRate = targetDeflectionPct / 100;

  const currentDeflectedTickets = monthlyTickets * currentDeflectionRate;
  const targetDeflectedTickets = monthlyTickets * targetDeflectionRate;
  const incrementalDeflectedTickets = targetDeflectedTickets - currentDeflectedTickets;

  const laborValuePerDeflectedTicket = (avgHandleMinutes / 60) * agentHourlyCost;
  const laborHoursSaved = incrementalDeflectedTickets * (avgHandleMinutes / 60);
  const grossLaborSavings = incrementalDeflectedTickets * laborValuePerDeflectedTicket;

  const aiVariableCost = targetDeflectedTickets * aiCostPerDeflectedTicket;
  const fixedProgramCost = implementationCostPerMonth + platformFeePerMonth + qualityReviewCostPerMonth;
  const totalProgramCost = aiVariableCost + fixedProgramCost;

  const netMonthlyBenefit = grossLaborSavings - totalProgramCost;
  const annualNetBenefit = netMonthlyBenefit * 12;
  const roiPct = totalProgramCost > 0 ? (netMonthlyBenefit / totalProgramCost) * 100 : 0;

  const paybackMonths = netMonthlyBenefit > 0
    ? oneTimeSetupCost / netMonthlyBenefit
    : Number.POSITIVE_INFINITY;

  const variableSpreadPerTicket = laborValuePerDeflectedTicket - aiCostPerDeflectedTicket;
  let breakEvenTargetDeflectionPct = Number.POSITIVE_INFINITY;
  if (variableSpreadPerTicket > 0 && monthlyTickets > 0) {
    const numerator = (currentDeflectedTickets * laborValuePerDeflectedTicket) + fixedProgramCost;
    const denominator = monthlyTickets * variableSpreadPerTicket;
    breakEvenTargetDeflectionPct = (numerator / denominator) * 100;
  }

  const breakEvenIsReachable = Number.isFinite(breakEvenTargetDeflectionPct) && breakEvenTargetDeflectionPct <= 100;
  const deflectionGapToBreakEvenPct = breakEvenIsReachable
    ? breakEvenTargetDeflectionPct - targetDeflectionPct
    : Number.POSITIVE_INFINITY;

  const status = netMonthlyBenefit <= 0
    ? 'risky'
    : paybackMonths <= targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: {
      monthlyTickets,
      currentDeflectionPct,
      targetDeflectionPct,
      avgHandleMinutes,
      agentHourlyCost,
      aiCostPerDeflectedTicket,
      implementationCostPerMonth,
      platformFeePerMonth,
      qualityReviewCostPerMonth,
      oneTimeSetupCost,
      targetPaybackMonths,
    },
    currentDeflectedTickets: round2(currentDeflectedTickets),
    targetDeflectedTickets: round2(targetDeflectedTickets),
    incrementalDeflectedTickets: round2(incrementalDeflectedTickets),
    laborValuePerDeflectedTicket: round2(laborValuePerDeflectedTicket),
    laborHoursSaved: round2(laborHoursSaved),
    grossLaborSavings: round2(grossLaborSavings),
    aiVariableCost: round2(aiVariableCost),
    fixedProgramCost: round2(fixedProgramCost),
    totalProgramCost: round2(totalProgramCost),
    netMonthlyBenefit: round2(netMonthlyBenefit),
    annualNetBenefit: round2(annualNetBenefit),
    roiPct: round2(roiPct),
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenTargetDeflectionPct: breakEvenIsReachable
      ? round2(breakEvenTargetDeflectionPct)
      : Number.POSITIVE_INFINITY,
    deflectionGapToBreakEvenPct: Number.isFinite(deflectionGapToBreakEvenPct)
      ? round2(deflectionGapToBreakEvenPct)
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
    : 'Not reachable with current assumptions';

  const breakEvenText = Number.isFinite(result.breakEvenTargetDeflectionPct)
    ? `${num.format(result.breakEvenTargetDeflectionPct)}%`
    : 'Not reachable (AI variable cost >= labor value per ticket)';

  return [
    '[AI Support Deflection ROI Snapshot]',
    `Monthly Tickets: ${num.format(result.inputs.monthlyTickets)}`,
    `Current -> Target Deflection: ${num.format(result.inputs.currentDeflectionPct)}% -> ${num.format(result.inputs.targetDeflectionPct)}%`,
    `Incremental Deflected Tickets: ${num.format(result.incrementalDeflectedTickets)}`,
    `Labor Hours Saved: ${num.format(result.laborHoursSaved)} hrs`,
    `Gross Labor Savings: ${money.format(result.grossLaborSavings)}`,
    `Total Program Cost: ${money.format(result.totalProgramCost)}`,
    `Net Monthly Benefit: ${money.format(result.netMonthlyBenefit)}`,
    `Annual Net Benefit: ${money.format(result.annualNetBenefit)}`,
    `Monthly ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Deflection: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
