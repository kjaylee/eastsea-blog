export const DEFAULT_INPUT = {
  monthlyActiveCustomers: 1800,
  currentAdoptionPct: 8,
  targetAdoptionPct: 15,
  avgCreditsPerBuyer: 120000,
  pricePerCredit: 0.0025,
  deliveryCostPerCredit: 0.0008,
  breakagePct: 12,
  expiryLiabilityReservePct: 4,
  supportCostPerBuyer: 35,
  monthlyProgramCost: 14000,
  oneTimeSetupCost: 28000,
  analysisMonths: 12,
  targetPaybackMonths: 6,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyActiveCustomers', 1, 10000000],
    ['currentAdoptionPct', 0, 100],
    ['targetAdoptionPct', 0, 100],
    ['avgCreditsPerBuyer', 1, 1000000000],
    ['pricePerCredit', 0.000001, 100],
    ['deliveryCostPerCredit', 0, 100],
    ['breakagePct', 0, 95],
    ['expiryLiabilityReservePct', 0, 100],
    ['supportCostPerBuyer', 0, 1000000],
    ['monthlyProgramCost', 0, 50000000],
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

  if (Number(input.targetAdoptionPct) < Number(input.currentAdoptionPct)) {
    return {
      valid: false,
      message: 'targetAdoptionPct must be greater than or equal to currentAdoptionPct.',
    };
  }

  if (Number(input.deliveryCostPerCredit) > Number(input.pricePerCredit) * 2) {
    return {
      valid: false,
      message: 'deliveryCostPerCredit is unrealistically high compared to pricePerCredit.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateApiCreditPackBreakageROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyActiveCustomers = Number(input.monthlyActiveCustomers);
  const currentAdoptionPct = Number(input.currentAdoptionPct);
  const targetAdoptionPct = Number(input.targetAdoptionPct);
  const avgCreditsPerBuyer = Number(input.avgCreditsPerBuyer);
  const pricePerCredit = Number(input.pricePerCredit);
  const deliveryCostPerCredit = Number(input.deliveryCostPerCredit);
  const breakagePct = Number(input.breakagePct);
  const expiryLiabilityReservePct = Number(input.expiryLiabilityReservePct);
  const supportCostPerBuyer = Number(input.supportCostPerBuyer);
  const monthlyProgramCost = Number(input.monthlyProgramCost);
  const oneTimeSetupCost = Number(input.oneTimeSetupCost);
  const analysisMonths = Number(input.analysisMonths);
  const targetPaybackMonths = Number(input.targetPaybackMonths);

  const currentRate = currentAdoptionPct / 100;
  const targetRate = targetAdoptionPct / 100;
  const breakageRate = breakagePct / 100;
  const reserveRate = expiryLiabilityReservePct / 100;

  const currentBuyers = monthlyActiveCustomers * currentRate;
  const targetBuyers = monthlyActiveCustomers * targetRate;
  const incrementalBuyers = targetBuyers - currentBuyers;

  const grossRevenuePerBuyer = avgCreditsPerBuyer * pricePerCredit;
  const consumedCreditsPerBuyer = avgCreditsPerBuyer * (1 - breakageRate);
  const deliveryCostPerBuyer = consumedCreditsPerBuyer * deliveryCostPerCredit;
  const liabilityReservePerBuyer = grossRevenuePerBuyer * reserveRate;
  const netContributionPerBuyer = grossRevenuePerBuyer
    - deliveryCostPerBuyer
    - liabilityReservePerBuyer
    - supportCostPerBuyer;

  const currentMonthlyContribution = currentBuyers * netContributionPerBuyer;
  const targetMonthlyContribution = targetBuyers * netContributionPerBuyer;
  const incrementalContribution = targetMonthlyContribution - currentMonthlyContribution;

  const netMonthlyBenefit = incrementalContribution - monthlyProgramCost;
  const periodNetBenefit = (netMonthlyBenefit * analysisMonths) - oneTimeSetupCost;

  const roiPct = oneTimeSetupCost > 0
    ? (periodNetBenefit / oneTimeSetupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = netMonthlyBenefit > 0
    ? oneTimeSetupCost / netMonthlyBenefit
    : Number.POSITIVE_INFINITY;

  let breakEvenTargetAdoptionPct = Number.POSITIVE_INFINITY;
  if (netContributionPerBuyer > 0 && monthlyActiveCustomers > 0) {
    const requiredIncrementalBuyers = monthlyProgramCost / netContributionPerBuyer;
    const breakEven = currentAdoptionPct + ((requiredIncrementalBuyers / monthlyActiveCustomers) * 100);
    if (Number.isFinite(breakEven) && breakEven <= 100) {
      breakEvenTargetAdoptionPct = breakEven;
    }
  }

  const status = netMonthlyBenefit <= 0
    ? 'risky'
    : paybackMonths <= targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: {
      monthlyActiveCustomers,
      currentAdoptionPct,
      targetAdoptionPct,
      avgCreditsPerBuyer,
      pricePerCredit,
      deliveryCostPerCredit,
      breakagePct,
      expiryLiabilityReservePct,
      supportCostPerBuyer,
      monthlyProgramCost,
      oneTimeSetupCost,
      analysisMonths,
      targetPaybackMonths,
    },
    currentBuyers: round2(currentBuyers),
    targetBuyers: round2(targetBuyers),
    incrementalBuyers: round2(incrementalBuyers),
    grossRevenuePerBuyer: round2(grossRevenuePerBuyer),
    consumedCreditsPerBuyer: round2(consumedCreditsPerBuyer),
    deliveryCostPerBuyer: round2(deliveryCostPerBuyer),
    liabilityReservePerBuyer: round2(liabilityReservePerBuyer),
    netContributionPerBuyer: round2(netContributionPerBuyer),
    currentMonthlyContribution: round2(currentMonthlyContribution),
    targetMonthlyContribution: round2(targetMonthlyContribution),
    incrementalContribution: round2(incrementalContribution),
    netMonthlyBenefit: round2(netMonthlyBenefit),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    breakEvenTargetAdoptionPct: Number.isFinite(breakEvenTargetAdoptionPct)
      ? round2(breakEvenTargetAdoptionPct)
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

  const breakEvenText = Number.isFinite(result.breakEvenTargetAdoptionPct)
    ? `${num.format(result.breakEvenTargetAdoptionPct)}%`
    : 'Not reachable with current assumptions';

  return [
    '[API Credit Pack Breakage ROI Snapshot]',
    `Adoption: ${num.format(result.inputs.currentAdoptionPct)}% -> ${num.format(result.inputs.targetAdoptionPct)}%`,
    `Incremental Buyers: ${num.format(result.incrementalBuyers)}`,
    `Net Contribution / Buyer: ${money.format(result.netContributionPerBuyer)}`,
    `Net Monthly Benefit: ${money.format(result.netMonthlyBenefit)}`,
    `Period Net Benefit (${num.format(result.inputs.analysisMonths)} months): ${money.format(result.periodNetBenefit)}`,
    `ROI: ${num.format(result.roiPct)}%`,
    `Payback: ${paybackText}`,
    `Break-even Target Adoption: ${breakEvenText}`,
    `Status: ${result.status}`,
  ].join('\n');
}
