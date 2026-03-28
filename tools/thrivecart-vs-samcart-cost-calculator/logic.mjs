export const DEFAULT_INPUT = {
  monthlyGrossSales: 6000,
  successfulPayments: 120,
  planningMonths: 12,
  refundRatePct: 3,
  processorRatePct: 2.9,
  processorFlatFee: 0.30,
  otherMonthlyCost: 600,
  targetMonthlyNetProfit: 2500,
  thrivecartUpfrontFee: 495,
  thrivecartAnnualAddonCost: 0,
  samcartMonthlyFee: 79,
  samcartGrowthSurcharge: 0,
  samcartRevenueLiftPct: 0,
};

export const PLATFORM_META = {
  thrivecart: {
    key: 'thrivecart',
    label: 'ThriveCart',
    pricingModel: 'One-time + optional annual add-on',
  },
  samcart: {
    key: 'samcart',
    label: 'SamCart',
    pricingModel: 'Recurring monthly subscription',
  },
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const safeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

export function validateInputs(input = {}) {
  const checks = [
    ['monthlyGrossSales', 0.0000001, 1_000_000_000, false],
    ['successfulPayments', 1, 100_000_000, true],
    ['planningMonths', 1, 600, true],
    ['refundRatePct', 0, 99.9999, false],
    ['processorRatePct', 0, 99.9999, false],
    ['processorFlatFee', 0, 1_000_000, false],
    ['otherMonthlyCost', 0, 1_000_000_000, false],
    ['targetMonthlyNetProfit', 0, 1_000_000_000, false],
    ['thrivecartUpfrontFee', 0, 1_000_000_000, false],
    ['thrivecartAnnualAddonCost', 0, 1_000_000_000, false],
    ['samcartMonthlyFee', 0, 1_000_000_000, false],
    ['samcartGrowthSurcharge', 0, 1_000_000_000, false],
    ['samcartRevenueLiftPct', 0, 10_000, false],
  ];

  for (const [key, min, max, integer] of checks) {
    const value = safeNumber(input?.[key]);
    if (!Number.isFinite(value) || value < min || value > max) {
      return { valid: false, message: `${key} must be between ${min} and ${max}.` };
    }
    if (integer && !Number.isInteger(value)) {
      return { valid: false, message: `${key} must be an integer.` };
    }
  }

  return { valid: true, message: '' };
}

export function normalizeInput(input = {}) {
  const maybeNumber = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return safeNumber(value);
  };

  const normalized = {
    monthlyGrossSales: maybeNumber(input.monthlyGrossSales),
    successfulPayments: maybeNumber(input.successfulPayments),
    planningMonths: maybeNumber(input.planningMonths),
    refundRatePct: maybeNumber(input.refundRatePct),
    processorRatePct: maybeNumber(input.processorRatePct),
    processorFlatFee: maybeNumber(input.processorFlatFee),
    otherMonthlyCost: maybeNumber(input.otherMonthlyCost),
    targetMonthlyNetProfit: maybeNumber(input.targetMonthlyNetProfit),
    thrivecartUpfrontFee: maybeNumber(input.thrivecartUpfrontFee),
    thrivecartAnnualAddonCost: maybeNumber(input.thrivecartAnnualAddonCost),
    samcartMonthlyFee: maybeNumber(input.samcartMonthlyFee),
    samcartGrowthSurcharge: maybeNumber(input.samcartGrowthSurcharge),
    samcartRevenueLiftPct: maybeNumber(input.samcartRevenueLiftPct),
  };

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
}

export function calculateBaseContributionMarginRate(input = {}) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const averagePayment = normalized.monthlyGrossSales / normalized.successfulPayments;
  const refundRate = normalized.refundRatePct / 100;
  const processorRate = normalized.processorRatePct / 100;
  const flatFeeRate = normalized.processorFlatFee / averagePayment;
  const baseContributionMarginRate = 1 - refundRate - processorRate - flatFeeRate;

  return {
    averagePayment: round(averagePayment, 2),
    refundRatePct: round(refundRate * 100, 4),
    processorRatePct: round(processorRate * 100, 4),
    flatFeeRatePct: round(flatFeeRate * 100, 4),
    baseContributionMarginRate: round(baseContributionMarginRate, 6),
    baseContributionMarginRatePct: round(baseContributionMarginRate * 100, 4),
  };
}

export function getBreakEvenMonth(input = {}) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const samcartRecurringMonthly = normalized.samcartMonthlyFee + normalized.samcartGrowthSurcharge;
  const thrivecartMonthlyAnnualizedAddon = normalized.thrivecartAnnualAddonCost / 12;
  const delta = samcartRecurringMonthly - thrivecartMonthlyAnnualizedAddon;

  if (normalized.thrivecartUpfrontFee === 0) return 1;
  if (delta <= 0) return null;

  const month = Math.ceil(normalized.thrivecartUpfrontFee / delta);
  if (month < 1) return 1;
  return month <= normalized.planningMonths ? month : null;
}

export function calculateScenario(input = {}, platformKey = 'thrivecart') {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const platform = PLATFORM_META[platformKey];
  if (!platform) {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  const planningMonths = normalized.planningMonths;
  const liftMultiplier = platformKey === 'samcart'
    ? 1 + (normalized.samcartRevenueLiftPct / 100)
    : 1;

  const margin = calculateBaseContributionMarginRate(normalized);
  const baseContributionMarginRate = margin.baseContributionMarginRate;

  const projectedMonthlyGrossSales = normalized.monthlyGrossSales * liftMultiplier;
  const projectedSuccessfulPayments = normalized.successfulPayments * liftMultiplier;
  const monthlyRefundLoss = projectedMonthlyGrossSales * (normalized.refundRatePct / 100);
  const monthlyProcessorFees = (projectedMonthlyGrossSales * (normalized.processorRatePct / 100))
    + (projectedSuccessfulPayments * normalized.processorFlatFee);

  const totalPlatformCost = platformKey === 'thrivecart'
    ? normalized.thrivecartUpfrontFee + (normalized.thrivecartAnnualAddonCost * (planningMonths / 12))
    : (normalized.samcartMonthlyFee + normalized.samcartGrowthSurcharge) * planningMonths;

  const equivalentMonthlyPlatformCost = totalPlatformCost / planningMonths;
  const monthlyContributionAfterRefundsAndProcessor = projectedMonthlyGrossSales - monthlyRefundLoss - monthlyProcessorFees;
  const monthlyNetAfterPlatform = monthlyContributionAfterRefundsAndProcessor - normalized.otherMonthlyCost - equivalentMonthlyPlatformCost;
  const cumulativeGrossSales = projectedMonthlyGrossSales * planningMonths;
  const cumulativeNetAfterPlatform = monthlyNetAfterPlatform * planningMonths;
  const effectivePlatformCostRatePct = cumulativeGrossSales > 0
    ? (totalPlatformCost / cumulativeGrossSales) * 100
    : 0;

  const requiredBaselineGrossForTargetNet = baseContributionMarginRate > 0
    ? (normalized.otherMonthlyCost + equivalentMonthlyPlatformCost + normalized.targetMonthlyNetProfit)
      / (liftMultiplier * baseContributionMarginRate)
    : null;

  return {
    key: platform.key,
    label: platform.label,
    pricingModel: platform.pricingModel,
    liftMultiplier: round(liftMultiplier, 4),
    upliftRatePct: round((liftMultiplier - 1) * 100, 2),
    projectedMonthlyGrossSales: round(projectedMonthlyGrossSales, 2),
    projectedSuccessfulPayments: round(projectedSuccessfulPayments, 2),
    averagePayment: margin.averagePayment,
    monthlyRefundLoss: round(monthlyRefundLoss, 2),
    monthlyProcessorFees: round(monthlyProcessorFees, 2),
    monthlyContributionAfterRefundsAndProcessor: round(monthlyContributionAfterRefundsAndProcessor, 2),
    totalPlatformCost: round(totalPlatformCost, 2),
    equivalentMonthlyPlatformCost: round(equivalentMonthlyPlatformCost, 2),
    monthlyNetAfterPlatform: round(monthlyNetAfterPlatform, 2),
    cumulativeGrossSales: round(cumulativeGrossSales, 2),
    cumulativeNetAfterPlatform: round(cumulativeNetAfterPlatform, 2),
    effectivePlatformCostRatePct: round(effectivePlatformCostRatePct, 2),
    requiredBaselineGrossForTargetNet: requiredBaselineGrossForTargetNet == null ? null : round(requiredBaselineGrossForTargetNet, 2),
  };
}

export function calculateRequiredSamcartLift(input = {}) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const margin = calculateBaseContributionMarginRate(normalized);
  const thrive = calculateScenario(normalized, 'thrivecart');
  const sam = calculateScenario({ ...normalized, samcartRevenueLiftPct: 0 }, 'samcart');
  const monthlyPlatformDelta = sam.equivalentMonthlyPlatformCost - thrive.equivalentMonthlyPlatformCost;

  if (margin.baseContributionMarginRate <= 0) {
    return {
      monthlyGrossLiftNeeded: null,
      liftPctNeeded: null,
      monthlyPlatformDelta: round(monthlyPlatformDelta, 2),
    };
  }

  const monthlyGrossLiftNeeded = Math.max(0, monthlyPlatformDelta / margin.baseContributionMarginRate);
  const liftPctNeeded = normalized.monthlyGrossSales > 0
    ? (monthlyGrossLiftNeeded / normalized.monthlyGrossSales) * 100
    : null;

  return {
    monthlyGrossLiftNeeded: round(monthlyGrossLiftNeeded, 2),
    liftPctNeeded: liftPctNeeded == null ? null : round(liftPctNeeded, 2),
    monthlyPlatformDelta: round(monthlyPlatformDelta, 2),
  };
}

export function pickWinner(scenarios = []) {
  return scenarios.reduce((best, current) => {
    if (!best) return current;
    if (current.cumulativeNetAfterPlatform > best.cumulativeNetAfterPlatform) return current;
    if (current.cumulativeNetAfterPlatform === best.cumulativeNetAfterPlatform
      && current.totalPlatformCost < best.totalPlatformCost) return current;
    return best;
  }, null);
}

export function calculateComparison(input = {}) {
  const normalized = { ...DEFAULT_INPUT, ...normalizeInput(input) };
  const validation = validateInputs(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const thrivecart = calculateScenario(normalized, 'thrivecart');
  const samcart = calculateScenario(normalized, 'samcart');
  const requiredLift = calculateRequiredSamcartLift(normalized);
  const winner = pickWinner([thrivecart, samcart]);
  const breakEvenMonth = getBreakEvenMonth(normalized);
  const margin = calculateBaseContributionMarginRate(normalized);
  const warnings = [];

  const enteredSamcartLiftGross = normalized.monthlyGrossSales * (normalized.samcartRevenueLiftPct / 100);
  if (requiredLift.monthlyGrossLiftNeeded != null && enteredSamcartLiftGross < requiredLift.monthlyGrossLiftNeeded) {
    warnings.push('Your entered SamCart revenue lift does not yet cover the extra recurring platform cost versus ThriveCart.');
  }
  if (breakEvenMonth == null) {
    warnings.push('Within the selected horizon, SamCart cumulative platform fees do not overtake ThriveCart upfront cost.');
  }
  if (margin.baseContributionMarginRate <= 0) {
    warnings.push('Refund and processor assumptions leave no positive contribution margin, so target-gross planning is unavailable.');
  }
  if (normalized.samcartGrowthSurcharge > 0) {
    warnings.push('SamCart growth surcharge is a user-entered planning assumption because the public fetched pricing snapshot does not expose every revenue-tier step in this run.');
  }

  const result = {
    currency: 'USD',
    inputs: normalized,
    margin,
    thrivecart,
    samcart,
    winner,
    breakEvenMonth,
    requiredLift,
    cumulativeNetDelta: round(samcart.cumulativeNetAfterPlatform - thrivecart.cumulativeNetAfterPlatform, 2),
    cumulativePlatformCostDelta: round(samcart.totalPlatformCost - thrivecart.totalPlatformCost, 2),
    warnings,
    summary: '',
  };

  result.summary = buildSummary(result);
  return result;
}

export function buildSummary(result, locale = 'en-US') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: result.currency || 'USD',
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return [
    '[ThriveCart vs SamCart Cost Calculator Summary]',
    `Planning horizon: ${num.format(result.inputs.planningMonths)} months`,
    `Baseline monthly gross sales: ${money.format(result.inputs.monthlyGrossSales)}`,
    `Successful monthly payments: ${num.format(result.inputs.successfulPayments)}`,
    `ThriveCart upfront fee example: ${money.format(result.inputs.thrivecartUpfrontFee)}`,
    `SamCart base monthly fee: ${money.format(result.inputs.samcartMonthlyFee)}`,
    `Winner by cumulative take-home: ${result.winner.label}`,
    `Break-even month: ${result.breakEvenMonth == null ? 'Not within selected horizon' : result.breakEvenMonth}`,
    `ThriveCart cumulative net: ${money.format(result.thrivecart.cumulativeNetAfterPlatform)}`,
    `SamCart cumulative net: ${money.format(result.samcart.cumulativeNetAfterPlatform)}`,
    `Cumulative net delta (SamCart - ThriveCart): ${money.format(result.cumulativeNetDelta)}`,
    `Required SamCart monthly gross lift: ${result.requiredLift.monthlyGrossLiftNeeded == null ? 'N/A' : money.format(result.requiredLift.monthlyGrossLiftNeeded)}`,
    `Required SamCart lift rate: ${result.requiredLift.liftPctNeeded == null ? 'N/A' : `${num.format(result.requiredLift.liftPctNeeded)}%`}`,
    `ThriveCart target-net baseline gross: ${result.thrivecart.requiredBaselineGrossForTargetNet == null ? 'N/A' : money.format(result.thrivecart.requiredBaselineGrossForTargetNet)}`,
    `SamCart target-net baseline gross: ${result.samcart.requiredBaselineGrossForTargetNet == null ? 'N/A' : money.format(result.samcart.requiredBaselineGrossForTargetNet)}`,
    'Notes: ThriveCart upfront default is an editable market-observed example, not a guaranteed live quote. SamCart growth surcharge is user-editable if your account pricing rises with revenue.',
  ].join('\n');
}
