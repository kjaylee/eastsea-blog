export const DEFAULT_INPUT = {
  avgVideoViews: 42000,
  avgStoryViews: 16000,
  engagementRatePct: 3.8,
  packageVideos: 3,
  packageStories: 4,
  benchmarkCpm: 26000,
  productionCostPerVideo: 220000,
  revisionCostPerRound: 35000,
  revisionsPerVideo: 1,
  usageMonths: 2,
  usageFeePerMonthPerVideo: 90000,
  whitelistingPct: 18,
  agencyFeePct: 15,
  targetMarginPct: 35,
  expectedSales: 240,
  grossProfitPerSale: 18000,
};

export function validateInputs(input) {
  const checks = [
    ['avgVideoViews', 1, 2_000_000],
    ['avgStoryViews', 0, 2_000_000],
    ['engagementRatePct', 0, 100],
    ['packageVideos', 1, 20],
    ['packageStories', 0, 30],
    ['benchmarkCpm', 0, 500_000],
    ['productionCostPerVideo', 0, 50_000_000],
    ['revisionCostPerRound', 0, 10_000_000],
    ['revisionsPerVideo', 0, 10],
    ['usageMonths', 0, 36],
    ['usageFeePerMonthPerVideo', 0, 10_000_000],
    ['whitelistingPct', 0, 200],
    ['agencyFeePct', 0, 95],
    ['targetMarginPct', 0, 90],
    ['expectedSales', 0, 5_000_000],
    ['grossProfitPerSale', 0, 10_000_000],
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

  if (Number(input.agencyFeePct) >= 100) {
    return { valid: false, message: 'agencyFeePct must be below 100.' };
  }

  return { valid: true, message: '' };
}

const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export function calculatePackageQuote(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const avgVideoViews = Number(input.avgVideoViews);
  const avgStoryViews = Number(input.avgStoryViews);
  const engagementRatePct = Number(input.engagementRatePct);
  const packageVideos = Number(input.packageVideos);
  const packageStories = Number(input.packageStories);
  const benchmarkCpm = Number(input.benchmarkCpm);
  const productionCostPerVideo = Number(input.productionCostPerVideo);
  const revisionCostPerRound = Number(input.revisionCostPerRound);
  const revisionsPerVideo = Number(input.revisionsPerVideo);
  const usageMonths = Number(input.usageMonths);
  const usageFeePerMonthPerVideo = Number(input.usageFeePerMonthPerVideo);
  const whitelistingPct = Number(input.whitelistingPct);
  const agencyFeePct = Number(input.agencyFeePct);
  const targetMarginPct = Number(input.targetMarginPct);
  const expectedSales = Number(input.expectedSales);
  const grossProfitPerSale = Number(input.grossProfitPerSale);

  const totalVideoViews = avgVideoViews * packageVideos;
  const storyWeightedViews = avgStoryViews * packageStories * 0.6;
  const totalReachViews = totalVideoViews + storyWeightedViews;
  const estimatedEngagements = totalVideoViews * (engagementRatePct / 100);

  const reachValue = (totalReachViews / 1000) * benchmarkCpm;
  const productionCost = productionCostPerVideo * packageVideos;
  const revisionCost = revisionCostPerRound * revisionsPerVideo * packageVideos;
  const creatorHardCost = productionCost + revisionCost;

  const marginFloor = creatorHardCost / (1 - targetMarginPct / 100);
  const baseSubtotal = Math.max(reachValue, marginFloor);

  const usageFee = usageMonths * usageFeePerMonthPerVideo * packageVideos;
  const whitelistingFee = baseSubtotal * (whitelistingPct / 100);
  const creatorSubtotal = baseSubtotal + usageFee + whitelistingFee;

  const quoteToBrand = creatorSubtotal / (1 - agencyFeePct / 100);
  const creatorTakeHome = quoteToBrand * (1 - agencyFeePct / 100);

  const effectiveCpm = totalReachViews > 0 ? (quoteToBrand / totalReachViews) * 1000 : 0;
  const grossProfitProjection = expectedSales * grossProfitPerSale;
  const projectedBrandRoi = quoteToBrand > 0 ? grossProfitProjection / quoteToBrand : 0;

  const status = projectedBrandRoi >= 1.5 ? 'strong' : projectedBrandRoi >= 1 ? 'balanced' : 'risky';

  return {
    inputs: {
      avgVideoViews,
      avgStoryViews,
      engagementRatePct,
      packageVideos,
      packageStories,
      benchmarkCpm,
      productionCostPerVideo,
      revisionCostPerRound,
      revisionsPerVideo,
      usageMonths,
      usageFeePerMonthPerVideo,
      whitelistingPct,
      agencyFeePct,
      targetMarginPct,
      expectedSales,
      grossProfitPerSale,
    },
    totalVideoViews: round(totalVideoViews),
    storyWeightedViews: round(storyWeightedViews),
    totalReachViews: round(totalReachViews),
    estimatedEngagements: round(estimatedEngagements),
    reachValue: round(reachValue),
    productionCost: round(productionCost),
    revisionCost: round(revisionCost),
    creatorHardCost: round(creatorHardCost),
    marginFloor: round(marginFloor),
    baseSubtotal: round(baseSubtotal),
    usageFee: round(usageFee),
    whitelistingFee: round(whitelistingFee),
    creatorSubtotal: round(creatorSubtotal),
    quoteToBrand: round(quoteToBrand),
    creatorTakeHome: round(creatorTakeHome),
    effectiveCpm: round(effectiveCpm),
    grossProfitProjection: round(grossProfitProjection),
    projectedBrandRoi: round(projectedBrandRoi),
    status,
  };
}

export function buildSummary(result, locale = 'ko-KR') {
  const krw = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return [
    '[UGC Creator Package Quote Summary]',
    `Total Reach Views: ${num.format(result.totalReachViews)}`,
    `Estimated Engagements: ${num.format(result.estimatedEngagements)}`,
    `Recommended Quote to Brand: ${krw.format(result.quoteToBrand)}`,
    `Creator Take-home: ${krw.format(result.creatorTakeHome)}`,
    `Effective CPM: ${krw.format(result.effectiveCpm)}`,
    `Projected Brand ROI (gross profit / quote): ${num.format(result.projectedBrandRoi)}x`,
    `Status: ${result.status}`,
  ].join('\n');
}
