export const SCENARIOS = {
  professional: {
    key: 'professional',
    label: 'Professional',
    fixedCircleCost: 89,
    includesBusiness: false,
    includesEmailHub: false,
  },
  professionalEmailHub: {
    key: 'professionalEmailHub',
    label: 'Professional + Email Hub',
    fixedCircleCost: 188,
    includesBusiness: false,
    includesEmailHub: true,
  },
  business: {
    key: 'business',
    label: 'Business',
    fixedCircleCost: 199,
    includesBusiness: true,
    includesEmailHub: false,
  },
  businessEmailHub: {
    key: 'businessEmailHub',
    label: 'Business + Email Hub',
    fixedCircleCost: 298,
    includesBusiness: true,
    includesEmailHub: true,
  },
};

export const DEFAULT_INPUT = {
  monthlyGrossSales: 8000,
  successfulPayments: 160,
  refundRatePct: 3,
  processorRatePct: 2.9,
  processorFlatFee: 0.3,
  otherMonthlyCost: 600,
  desiredMonthlyNetProfit: 2500,
  businessLiftPct: 4,
  emailHubLiftPct: 3,
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const safeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

export function validateInputs(input) {
  const checks = [
    ['monthlyGrossSales', 0.0000001, 1_000_000_000],
    ['successfulPayments', 0.0000001, 100_000_000],
    ['refundRatePct', 0, 99.9999],
    ['processorRatePct', 0, 99.9999],
    ['processorFlatFee', 0, 1_000_000],
    ['otherMonthlyCost', 0, 1_000_000_000],
    ['desiredMonthlyNetProfit', 0, 1_000_000_000],
    ['businessLiftPct', 0, 10_000],
    ['emailHubLiftPct', 0, 10_000],
  ];

  for (const [key, min, max] of checks) {
    const value = safeNumber(input?.[key]);
    if (!Number.isFinite(value) || value < min || value > max) {
      return { valid: false, message: `${key} must be between ${min} and ${max}.` };
    }
  }

  return { valid: true, message: '' };
}

export function normalizeInput(input = {}) {
  return {
    monthlyGrossSales: safeNumber(input.monthlyGrossSales),
    successfulPayments: safeNumber(input.successfulPayments),
    refundRatePct: safeNumber(input.refundRatePct),
    processorRatePct: safeNumber(input.processorRatePct),
    processorFlatFee: safeNumber(input.processorFlatFee),
    otherMonthlyCost: safeNumber(input.otherMonthlyCost),
    desiredMonthlyNetProfit: safeNumber(input.desiredMonthlyNetProfit),
    businessLiftPct: safeNumber(input.businessLiftPct),
    emailHubLiftPct: safeNumber(input.emailHubLiftPct),
  };
}

export function getScenarioUpliftRate(input, scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Unsupported scenario: ${scenarioKey}`);
  }
  let pct = 0;
  if (scenario.includesBusiness) pct += Number(input.businessLiftPct) || 0;
  if (scenario.includesEmailHub) pct += Number(input.emailHubLiftPct) || 0;
  return pct / 100;
}

export function calculateBaseContributionMarginRate(input) {
  const gross = Number(input.monthlyGrossSales);
  const payments = Number(input.successfulPayments);
  const avgPayment = gross / payments;
  if (!Number.isFinite(avgPayment) || avgPayment <= 0) {
    return { averagePayment: null, flatFeeRate: null, baseContributionMarginRate: null };
  }

  const refundRate = (Number(input.refundRatePct) || 0) / 100;
  const processorRate = (Number(input.processorRatePct) || 0) / 100;
  const flatFeeRate = (Number(input.processorFlatFee) || 0) / avgPayment;
  const baseContributionMarginRate = 1 - refundRate - processorRate - flatFeeRate;

  return {
    averagePayment: round(avgPayment, 2),
    flatFeeRate: round(flatFeeRate, 6),
    baseContributionMarginRate: round(baseContributionMarginRate, 6),
  };
}

export function calculateScenario(input, scenarioKey) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid Circle pricing input');
  }

  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Unsupported scenario: ${scenarioKey}`);
  }

  const gross = Number(normalized.monthlyGrossSales);
  const payments = Number(normalized.successfulPayments);
  const refundRate = Number(normalized.refundRatePct) / 100;
  const processorRate = Number(normalized.processorRatePct) / 100;
  const processorFlatFee = Number(normalized.processorFlatFee);
  const otherMonthlyCost = Number(normalized.otherMonthlyCost);
  const desiredMonthlyNetProfit = Number(normalized.desiredMonthlyNetProfit);
  const upliftRate = getScenarioUpliftRate(normalized, scenarioKey);
  const growthMultiplier = 1 + upliftRate;
  const { averagePayment, flatFeeRate, baseContributionMarginRate } = calculateBaseContributionMarginRate(normalized);

  const scenarioGross = gross * growthMultiplier;
  const scenarioPayments = payments * growthMultiplier;
  const refundLoss = scenarioGross * refundRate;
  const processorFees = (scenarioGross * processorRate) + (scenarioPayments * processorFlatFee);
  const takeHomeAfterCircle = scenarioGross - refundLoss - processorFees - scenario.fixedCircleCost;
  const monthlyNetProfit = takeHomeAfterCircle - otherMonthlyCost;
  const annualizedNetProfit = monthlyNetProfit * 12;
  const effectiveFeeRatePct = scenarioGross > 0
    ? ((scenario.fixedCircleCost + processorFees) / scenarioGross) * 100
    : 0;

  const planningDenominator = Number.isFinite(baseContributionMarginRate) && baseContributionMarginRate > 0
    ? growthMultiplier * baseContributionMarginRate
    : null;

  const breakEvenBaseGross = planningDenominator
    ? (scenario.fixedCircleCost + otherMonthlyCost) / planningDenominator
    : null;
  const requiredBaseGrossForTargetNet = planningDenominator
    ? (scenario.fixedCircleCost + otherMonthlyCost + desiredMonthlyNetProfit) / planningDenominator
    : null;

  return {
    key: scenario.key,
    label: scenario.label,
    fixedCircleCost: scenario.fixedCircleCost,
    includesBusiness: scenario.includesBusiness,
    includesEmailHub: scenario.includesEmailHub,
    upliftRatePct: round(upliftRate * 100, 2),
    projectedGrossLift: round(gross * upliftRate, 2),
    averagePayment,
    flatFeeRatePct: Number.isFinite(flatFeeRate) ? round(flatFeeRate * 100, 4) : null,
    baseContributionMarginRatePct: Number.isFinite(baseContributionMarginRate) ? round(baseContributionMarginRate * 100, 4) : null,
    projectedGrossSales: round(scenarioGross, 2),
    projectedSuccessfulPayments: round(scenarioPayments, 2),
    refundLoss: round(refundLoss, 2),
    processorFees: round(processorFees, 2),
    takeHomeAfterCircle: round(takeHomeAfterCircle, 2),
    monthlyNetProfit: round(monthlyNetProfit, 2),
    annualizedNetProfit: round(annualizedNetProfit, 2),
    effectiveFeeRatePct: round(effectiveFeeRatePct, 2),
    breakEvenBaseGross: breakEvenBaseGross == null ? null : round(breakEvenBaseGross, 2),
    requiredBaseGrossForTargetNet: requiredBaseGrossForTargetNet == null ? null : round(requiredBaseGrossForTargetNet, 2),
  };
}

export function pickBestScenario(scenarios = []) {
  return scenarios.reduce((best, current) => {
    if (!best) return current;
    if (current.monthlyNetProfit > best.monthlyNetProfit) return current;
    if (current.monthlyNetProfit === best.monthlyNetProfit && current.fixedCircleCost < best.fixedCircleCost) return current;
    return best;
  }, null);
}

export function calculateUpgradeThresholds(input) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid Circle pricing input');
  }

  const { baseContributionMarginRate } = calculateBaseContributionMarginRate(normalized);
  const gross = Number(normalized.monthlyGrossSales);

  if (!Number.isFinite(baseContributionMarginRate) || baseContributionMarginRate <= 0 || !Number.isFinite(gross) || gross <= 0) {
    return {
      businessGrossLiftNeeded: null,
      businessLiftPctNeeded: null,
      emailHubGrossLiftNeeded: null,
      emailHubLiftPctNeeded: null,
      businessPlusEmailGrossLiftNeeded: null,
      businessPlusEmailLiftPctNeeded: null,
    };
  }

  const businessGrossLiftNeeded = (SCENARIOS.business.fixedCircleCost - SCENARIOS.professional.fixedCircleCost) / baseContributionMarginRate;
  const emailHubGrossLiftNeeded = 99 / baseContributionMarginRate;
  const businessPlusEmailGrossLiftNeeded = (SCENARIOS.businessEmailHub.fixedCircleCost - SCENARIOS.professional.fixedCircleCost) / baseContributionMarginRate;

  return {
    businessGrossLiftNeeded: round(businessGrossLiftNeeded, 2),
    businessLiftPctNeeded: round((businessGrossLiftNeeded / gross) * 100, 2),
    emailHubGrossLiftNeeded: round(emailHubGrossLiftNeeded, 2),
    emailHubLiftPctNeeded: round((emailHubGrossLiftNeeded / gross) * 100, 2),
    businessPlusEmailGrossLiftNeeded: round(businessPlusEmailGrossLiftNeeded, 2),
    businessPlusEmailLiftPctNeeded: round((businessPlusEmailGrossLiftNeeded / gross) * 100, 2),
  };
}

export function calculateCirclePricing(input = {}) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid Circle pricing input');
  }

  const scenarios = Object.keys(SCENARIOS).map((key) => calculateScenario(normalized, key));
  const professional = scenarios.find((scenario) => scenario.key === 'professional');
  const thresholds = calculateUpgradeThresholds(normalized);
  const bestScenario = pickBestScenario(scenarios);
  const warnings = [];

  if (bestScenario.key === 'professional') {
    warnings.push('Under your current assumptions, the cheapest fixed Circle stack still wins. Raise the projected Business or Email Hub uplift only if you believe the features will truly add sales.');
  }
  if (thresholds.businessGrossLiftNeeded != null && (normalized.monthlyGrossSales * (normalized.businessLiftPct / 100)) < thresholds.businessGrossLiftNeeded) {
    warnings.push('Your projected Business uplift does not yet cover the extra $110/mo fixed cost versus Professional.');
  }
  if (thresholds.emailHubGrossLiftNeeded != null && (normalized.monthlyGrossSales * (normalized.emailHubLiftPct / 100)) < thresholds.emailHubGrossLiftNeeded) {
    warnings.push('Your projected Email Hub uplift does not yet cover the extra $99/mo add-on cost.');
  }
  if (thresholds.businessGrossLiftNeeded == null) {
    warnings.push('Current refund and processor assumptions leave no positive contribution margin, so break-even planning metrics are unavailable.');
  }

  for (const scenario of scenarios) {
    scenario.netDeltaVsProfessional = round(scenario.monthlyNetProfit - professional.monthlyNetProfit, 2);
  }

  const result = {
    currency: 'USD',
    inputs: normalized,
    scenarios,
    bestScenario,
    thresholds,
    warnings,
    summary: '',
  };

  result.summary = buildSummary(result, 'en-US');
  return result;
}

export function buildSummary(result, locale = 'en-US') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: result.currency || 'USD',
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const best = result.bestScenario;
  const thresholds = result.thresholds;

  return [
    '[Circle.so Pricing Calculator Summary]',
    'Public plan pricing: Professional $89/mo, Business $199/mo, Email Hub +$99/mo',
    `Current monthly gross sales: ${money.format(result.inputs.monthlyGrossSales)}`,
    `Successful monthly payments: ${num.format(result.inputs.successfulPayments)}`,
    `Business uplift assumption: ${num.format(result.inputs.businessLiftPct)}%`,
    `Email Hub uplift assumption: ${num.format(result.inputs.emailHubLiftPct)}%`,
    `Best scenario: ${best.label}`,
    `Projected monthly net profit: ${money.format(best.monthlyNetProfit)}`,
    `Projected gross sales: ${money.format(best.projectedGrossSales)}`,
    `Circle fixed cost: ${money.format(best.fixedCircleCost)}`,
    `Effective fee rate: ${num.format(best.effectiveFeeRatePct)}%`,
    `Break-even base gross: ${best.breakEvenBaseGross == null ? 'N/A' : money.format(best.breakEvenBaseGross)}`,
    `Base gross needed for target net: ${best.requiredBaseGrossForTargetNet == null ? 'N/A' : money.format(best.requiredBaseGrossForTargetNet)}`,
    `Business gross lift needed: ${thresholds.businessGrossLiftNeeded == null ? 'N/A' : money.format(thresholds.businessGrossLiftNeeded)}`,
    `Email Hub gross lift needed: ${thresholds.emailHubGrossLiftNeeded == null ? 'N/A' : money.format(thresholds.emailHubGrossLiftNeeded)}`,
    'Processor fees are editable planning assumptions, not a universal Circle-published transaction rate.',
  ].join('\n');
}
