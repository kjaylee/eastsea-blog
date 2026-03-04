export const DEFAULT_INPUT = {
  monthlyLeads: 180,
  discoveryRatePct: 42,
  closeRatePct: 28,
  avgDeliveryHoursPerClient: 18,
  teamCostPerHour: 52,
  toolCostPerClient: 140,
  overheadPerMonth: 6200,
  targetMarginPct: 48,
  riskBufferPct: 12,
  churnRatePct: 8,
  upsellAttachRatePct: 22,
  upsellAmountPerClient: 380,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const roundInt = (n) => Math.round(n);

function priceFromCostAndMargin(cost, marginPct) {
  const margin = marginPct / 100;
  return cost / (1 - margin);
}

export function validateInputs(input) {
  const checks = [
    ['monthlyLeads', 1, 1_000_000],
    ['discoveryRatePct', 0, 100],
    ['closeRatePct', 0, 100],
    ['avgDeliveryHoursPerClient', 1, 500],
    ['teamCostPerHour', 1, 10_000],
    ['toolCostPerClient', 0, 1_000_000],
    ['overheadPerMonth', 0, 100_000_000],
    ['targetMarginPct', 1, 90],
    ['riskBufferPct', 0, 80],
    ['churnRatePct', 0, 80],
    ['upsellAttachRatePct', 0, 100],
    ['upsellAmountPerClient', 0, 1_000_000],
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

  if (Number(input.targetMarginPct) >= 100) {
    return { valid: false, message: 'targetMarginPct must be below 100.' };
  }

  return { valid: true, message: '' };
}

function buildTier({
  name,
  hoursMultiplier,
  toolMultiplier,
  avgDeliveryHoursPerClient,
  teamCostPerHour,
  toolCostPerClient,
  targetMarginPct,
  riskBufferPct,
}) {
  const bufferedHours = avgDeliveryHoursPerClient * hoursMultiplier * (1 + riskBufferPct / 100);
  const cost = bufferedHours * teamCostPerHour + toolCostPerClient * toolMultiplier;
  const price = priceFromCostAndMargin(cost, targetMarginPct);
  return {
    name,
    monthlyHours: round2(bufferedHours),
    deliveryCost: round2(cost),
    suggestedPrice: round2(price),
    contributionPerClient: round2(price - cost),
  };
}

export function calculateRetainerPlan(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyLeads = Number(input.monthlyLeads);
  const discoveryRatePct = Number(input.discoveryRatePct);
  const closeRatePct = Number(input.closeRatePct);
  const avgDeliveryHoursPerClient = Number(input.avgDeliveryHoursPerClient);
  const teamCostPerHour = Number(input.teamCostPerHour);
  const toolCostPerClient = Number(input.toolCostPerClient);
  const overheadPerMonth = Number(input.overheadPerMonth);
  const targetMarginPct = Number(input.targetMarginPct);
  const riskBufferPct = Number(input.riskBufferPct);
  const churnRatePct = Number(input.churnRatePct);
  const upsellAttachRatePct = Number(input.upsellAttachRatePct);
  const upsellAmountPerClient = Number(input.upsellAmountPerClient);

  const discoveryRate = discoveryRatePct / 100;
  const closeRate = closeRatePct / 100;
  const churnRate = churnRatePct / 100;
  const upsellAttachRate = upsellAttachRatePct / 100;

  const qualifiedCalls = monthlyLeads * discoveryRate;
  const newClients = qualifiedCalls * closeRate;

  const growthTier = buildTier({
    name: 'Growth Retainer',
    hoursMultiplier: 1,
    toolMultiplier: 1,
    avgDeliveryHoursPerClient,
    teamCostPerHour,
    toolCostPerClient,
    targetMarginPct,
    riskBufferPct,
  });

  const tiers = [
    buildTier({
      name: 'Starter Retainer',
      hoursMultiplier: 0.65,
      toolMultiplier: 0.85,
      avgDeliveryHoursPerClient,
      teamCostPerHour,
      toolCostPerClient,
      targetMarginPct,
      riskBufferPct,
    }),
    growthTier,
    buildTier({
      name: 'Scale Retainer',
      hoursMultiplier: 1.7,
      toolMultiplier: 1.3,
      avgDeliveryHoursPerClient,
      teamCostPerHour,
      toolCostPerClient,
      targetMarginPct,
      riskBufferPct,
    }),
  ];

  const expectedUpsellPerClient = upsellAttachRate * upsellAmountPerClient;
  const revenuePerClient = growthTier.suggestedPrice + expectedUpsellPerClient;
  const variableCostPerClient = growthTier.deliveryCost;

  const grossMonthlyRevenue = newClients * revenuePerClient;
  const churnLeakage = grossMonthlyRevenue * churnRate;
  const netRevenueAfterChurn = grossMonthlyRevenue - churnLeakage;
  const monthlyVariableCost = newClients * variableCostPerClient;
  const operatingProfit = netRevenueAfterChurn - monthlyVariableCost - overheadPerMonth;
  const operatingMarginPct = netRevenueAfterChurn > 0
    ? (operatingProfit / netRevenueAfterChurn) * 100
    : 0;

  const unitContribution = revenuePerClient * (1 - churnRate) - variableCostPerClient;
  const breakEvenClients = unitContribution > 0
    ? overheadPerMonth / unitContribution
    : Number.POSITIVE_INFINITY;

  const status =
    operatingMarginPct >= 25 ? 'excellent'
      : operatingMarginPct >= 12 ? 'viable'
        : 'fragile';

  return {
    inputs: {
      monthlyLeads,
      discoveryRatePct,
      closeRatePct,
      avgDeliveryHoursPerClient,
      teamCostPerHour,
      toolCostPerClient,
      overheadPerMonth,
      targetMarginPct,
      riskBufferPct,
      churnRatePct,
      upsellAttachRatePct,
      upsellAmountPerClient,
    },
    qualifiedCalls: roundInt(qualifiedCalls),
    newClients: round2(newClients),
    revenuePerClient: round2(revenuePerClient),
    variableCostPerClient: round2(variableCostPerClient),
    expectedUpsellPerClient: round2(expectedUpsellPerClient),
    grossMonthlyRevenue: round2(grossMonthlyRevenue),
    churnLeakage: round2(churnLeakage),
    netRevenueAfterChurn: round2(netRevenueAfterChurn),
    monthlyVariableCost: round2(monthlyVariableCost),
    operatingProfit: round2(operatingProfit),
    operatingMarginPct: round2(operatingMarginPct),
    breakEvenClients: Number.isFinite(breakEvenClients)
      ? round2(breakEvenClients)
      : Number.POSITIVE_INFINITY,
    tiers,
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

  const tierLines = result.tiers
    .map((tier) => `${tier.name}: ${money.format(tier.suggestedPrice)} / mo (Cost ${money.format(tier.deliveryCost)})`)
    .join('\n');

  return [
    '[AI Retainer Profit Plan]',
    `Qualified Calls: ${num.format(result.qualifiedCalls)}`,
    `Projected New Clients: ${num.format(result.newClients)}`,
    `Growth Tier Price: ${money.format(result.tiers[1].suggestedPrice)} / mo`,
    `Net Revenue (after churn): ${money.format(result.netRevenueAfterChurn)}`,
    `Operating Profit: ${money.format(result.operatingProfit)}`,
    `Break-even Clients Needed: ${Number.isFinite(result.breakEvenClients) ? num.format(result.breakEvenClients) : '∞'}`,
    `Status: ${result.status}`,
    'Tier Stack:',
    tierLines,
  ].join('\n');
}
