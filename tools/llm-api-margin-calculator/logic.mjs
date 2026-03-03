export const DEFAULT_INPUT = {
  monthlyActiveUsers: 3200,
  requestsPerUserPerMonth: 40,
  avgInputTokensPerRequest: 1800,
  avgOutputTokensPerRequest: 650,
  cacheHitRatePct: 28,
  retryRatePct: 6,
  modelInputCostPer1M: 3,
  modelOutputCostPer1M: 15,
  infraCostPerRequest: 0.0009,
  subscriptionPricePerUser: 29,
  paymentFeePct: 3.2,
  supportCostPerUser: 1.8,
  fixedMonthlyCost: 18000,
  targetContributionMarginPct: 55,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const roundInt = (n) => Math.round(n);

export function validateInputs(input) {
  const checks = [
    ['monthlyActiveUsers', 1, 50_000_000],
    ['requestsPerUserPerMonth', 1, 100_000],
    ['avgInputTokensPerRequest', 1, 200_000],
    ['avgOutputTokensPerRequest', 1, 200_000],
    ['cacheHitRatePct', 0, 95],
    ['retryRatePct', 0, 100],
    ['modelInputCostPer1M', 0, 10_000],
    ['modelOutputCostPer1M', 0, 10_000],
    ['infraCostPerRequest', 0, 100],
    ['subscriptionPricePerUser', 0.01, 1_000_000],
    ['paymentFeePct', 0, 50],
    ['supportCostPerUser', 0, 100_000],
    ['fixedMonthlyCost', 0, 1_000_000_000],
    ['targetContributionMarginPct', 0, 95],
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

  if (Number(input.targetContributionMarginPct) >= 100) {
    return { valid: false, message: 'targetContributionMarginPct must be below 100.' };
  }

  return { valid: true, message: '' };
}

export function calculateLlmMargin(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyActiveUsers = Number(input.monthlyActiveUsers);
  const requestsPerUserPerMonth = Number(input.requestsPerUserPerMonth);
  const avgInputTokensPerRequest = Number(input.avgInputTokensPerRequest);
  const avgOutputTokensPerRequest = Number(input.avgOutputTokensPerRequest);
  const cacheHitRatePct = Number(input.cacheHitRatePct);
  const retryRatePct = Number(input.retryRatePct);
  const modelInputCostPer1M = Number(input.modelInputCostPer1M);
  const modelOutputCostPer1M = Number(input.modelOutputCostPer1M);
  const infraCostPerRequest = Number(input.infraCostPerRequest);
  const subscriptionPricePerUser = Number(input.subscriptionPricePerUser);
  const paymentFeePct = Number(input.paymentFeePct);
  const supportCostPerUser = Number(input.supportCostPerUser);
  const fixedMonthlyCost = Number(input.fixedMonthlyCost);
  const targetContributionMarginPct = Number(input.targetContributionMarginPct);

  const paymentFeeRate = paymentFeePct / 100;
  const cacheHitRate = cacheHitRatePct / 100;
  const retryRate = retryRatePct / 100;

  const baseRequests = monthlyActiveUsers * requestsPerUserPerMonth;
  const billableRequests = baseRequests * (1 + retryRate);

  const effectiveInputTokens = billableRequests * avgInputTokensPerRequest * (1 - cacheHitRate);
  const effectiveOutputTokens = billableRequests * avgOutputTokensPerRequest;

  const inputTokenCost = (effectiveInputTokens / 1_000_000) * modelInputCostPer1M;
  const outputTokenCost = (effectiveOutputTokens / 1_000_000) * modelOutputCostPer1M;
  const totalModelCost = inputTokenCost + outputTokenCost;

  const infraCost = billableRequests * infraCostPerRequest;
  const supportCost = monthlyActiveUsers * supportCostPerUser;
  const variableCostTotal = totalModelCost + infraCost + supportCost;

  const grossRevenue = monthlyActiveUsers * subscriptionPricePerUser;
  const paymentFees = grossRevenue * paymentFeeRate;
  const netRevenueAfterFees = grossRevenue - paymentFees;

  const contributionProfit = netRevenueAfterFees - variableCostTotal;
  const contributionMarginPct = netRevenueAfterFees > 0
    ? (contributionProfit / netRevenueAfterFees) * 100
    : 0;

  const operatingProfit = contributionProfit - fixedMonthlyCost;
  const operatingMarginPct = netRevenueAfterFees > 0
    ? (operatingProfit / netRevenueAfterFees) * 100
    : 0;

  const perUserNetRevenue = netRevenueAfterFees / monthlyActiveUsers;
  const perUserVariableCost = variableCostTotal / monthlyActiveUsers;

  const breakEvenPricePerUser = (variableCostTotal + fixedMonthlyCost)
    / (monthlyActiveUsers * (1 - paymentFeeRate));

  const unitContributionAtCurrentPrice = perUserNetRevenue - perUserVariableCost;
  const breakEvenUsersAtCurrentPrice = unitContributionAtCurrentPrice > 0
    ? fixedMonthlyCost / unitContributionAtCurrentPrice
    : Number.POSITIVE_INFINITY;

  const requiredNetRevenueForTarget = variableCostTotal / (1 - targetContributionMarginPct / 100);
  const requiredGrossRevenueForTarget = requiredNetRevenueForTarget / (1 - paymentFeeRate);
  const requiredPricePerUserForTarget = requiredGrossRevenueForTarget / monthlyActiveUsers;

  const status =
    operatingMarginPct >= 20 ? 'strong'
      : operatingMarginPct >= 5 ? 'balanced'
        : 'risky';

  return {
    inputs: {
      monthlyActiveUsers,
      requestsPerUserPerMonth,
      avgInputTokensPerRequest,
      avgOutputTokensPerRequest,
      cacheHitRatePct,
      retryRatePct,
      modelInputCostPer1M,
      modelOutputCostPer1M,
      infraCostPerRequest,
      subscriptionPricePerUser,
      paymentFeePct,
      supportCostPerUser,
      fixedMonthlyCost,
      targetContributionMarginPct,
    },
    baseRequests: roundInt(baseRequests),
    billableRequests: roundInt(billableRequests),
    effectiveInputTokens: roundInt(effectiveInputTokens),
    effectiveOutputTokens: roundInt(effectiveOutputTokens),
    inputTokenCost: round2(inputTokenCost),
    outputTokenCost: round2(outputTokenCost),
    totalModelCost: round2(totalModelCost),
    infraCost: round2(infraCost),
    supportCost: round2(supportCost),
    variableCostTotal: round2(variableCostTotal),
    grossRevenue: round2(grossRevenue),
    paymentFees: round2(paymentFees),
    netRevenueAfterFees: round2(netRevenueAfterFees),
    contributionProfit: round2(contributionProfit),
    contributionMarginPct: round2(contributionMarginPct),
    operatingProfit: round2(operatingProfit),
    operatingMarginPct: round2(operatingMarginPct),
    perUserNetRevenue: round2(perUserNetRevenue),
    perUserVariableCost: round2(perUserVariableCost),
    breakEvenPricePerUser: round2(breakEvenPricePerUser),
    breakEvenUsersAtCurrentPrice: Number.isFinite(breakEvenUsersAtCurrentPrice)
      ? round2(breakEvenUsersAtCurrentPrice)
      : Number.POSITIVE_INFINITY,
    requiredPricePerUserForTarget: round2(requiredPricePerUserForTarget),
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
    '[LLM API Margin Summary]',
    `Gross Revenue: ${money.format(result.grossRevenue)}`,
    `Net Revenue (after payment fees): ${money.format(result.netRevenueAfterFees)}`,
    `Token Cost (Input + Output): ${money.format(result.totalModelCost)}`,
    `Variable Cost Total: ${money.format(result.variableCostTotal)}`,
    `Contribution Margin: ${num.format(result.contributionMarginPct)}%`,
    `Operating Profit: ${money.format(result.operatingProfit)}`,
    `Break-even Price per User: ${money.format(result.breakEvenPricePerUser)}`,
    `Required Price for Target Margin: ${money.format(result.requiredPricePerUserForTarget)}`,
    `Status: ${result.status}`,
  ].join('\n');
}
