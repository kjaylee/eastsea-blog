export const DEFAULT_INPUT = {
  monthlyOrders: 5200,
  baseAov: 46000,
  exposureRate: 72,
  takeRate: 6.5,
  crossSellPrice: 15000,
  crossSellCogs: 4800,
  fulfillmentCost: 1200,
  refundRate: 4,
  toolCost: 280000,
  opsCost: 350000,
  setupCost: 1600000,
  analysisMonths: 12,
  targetPaybackMonths: 6,
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const checks = [
    ['monthlyOrders', 1, 20000000],
    ['baseAov', 0, 100000000],
    ['exposureRate', 0, 100],
    ['takeRate', 0, 100],
    ['crossSellPrice', 1, 100000000],
    ['crossSellCogs', 0, 100000000],
    ['fulfillmentCost', 0, 100000000],
    ['refundRate', 0, 100],
    ['toolCost', 0, 300000000],
    ['opsCost', 0, 300000000],
    ['setupCost', 0, 800000000],
    ['analysisMonths', 1, 60],
    ['targetPaybackMonths', 1, 60],
  ];

  for (const [key, min, max] of checks) {
    const value = Number(input[key]);
    if (!Number.isFinite(value)) {
      return { valid: false, message: `${key}는 숫자여야 합니다.` };
    }
    if (value < min || value > max) {
      return { valid: false, message: `${key}는 ${min}~${max} 범위여야 합니다.` };
    }
  }

  if (Number(input.crossSellCogs) + Number(input.fulfillmentCost) > Number(input.crossSellPrice) * 2) {
    return {
      valid: false,
      message: '원가+처리비가 판매가 대비 과도합니다. 입력값을 확인하세요.',
    };
  }

  return { valid: true, message: '' };
}

export function calculateCrossSellRecommendationROI(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const monthlyOrders = Number(input.monthlyOrders);
  const baseAov = Number(input.baseAov);
  const exposureRate = Number(input.exposureRate);
  const takeRate = Number(input.takeRate);
  const crossSellPrice = Number(input.crossSellPrice);
  const crossSellCogs = Number(input.crossSellCogs);
  const fulfillmentCost = Number(input.fulfillmentCost);
  const refundRate = Number(input.refundRate);
  const toolCost = Number(input.toolCost);
  const opsCost = Number(input.opsCost);
  const setupCost = Number(input.setupCost);
  const analysisMonths = Number(input.analysisMonths);
  const targetPaybackMonths = Number(input.targetPaybackMonths);

  const exposureRatio = exposureRate / 100;
  const takeRatio = takeRate / 100;
  const refundRatio = refundRate / 100;

  const exposureOrders = monthlyOrders * exposureRatio;
  const crossSellUnits = exposureOrders * takeRatio;
  const refundedUnits = crossSellUnits * refundRatio;

  const grossCrossSellRevenue = crossSellUnits * crossSellPrice;
  const refundAmount = refundedUnits * crossSellPrice;
  const netCrossSellRevenue = grossCrossSellRevenue - refundAmount;

  const variableCost = crossSellUnits * (crossSellCogs + fulfillmentCost);
  const contribution = netCrossSellRevenue - variableCost;

  const fixedCost = toolCost + opsCost;
  const netMonthlyProfit = contribution - fixedCost;
  const periodNetBenefit = (netMonthlyProfit * analysisMonths) - setupCost;

  const roiPct = setupCost > 0
    ? (periodNetBenefit / setupCost) * 100
    : periodNetBenefit >= 0
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;

  const paybackMonths = netMonthlyProfit > 0
    ? setupCost / netMonthlyProfit
    : Number.POSITIVE_INFINITY;

  const aovLift = monthlyOrders > 0 ? netCrossSellRevenue / monthlyOrders : 0;
  const newAov = baseAov + aovLift;

  const perUnitContribution = crossSellPrice * (1 - refundRatio) - (crossSellCogs + fulfillmentCost);
  let breakEvenTakeRate = Number.POSITIVE_INFINITY;
  if (perUnitContribution > 0 && exposureOrders > 0) {
    const breakEvenUnits = fixedCost / perUnitContribution;
    const breakEven = (breakEvenUnits / exposureOrders) * 100;
    if (Number.isFinite(breakEven) && breakEven <= 100) {
      breakEvenTakeRate = breakEven;
    }
  }

  const status = netMonthlyProfit <= 0
    ? 'risky'
    : paybackMonths <= targetPaybackMonths
      ? 'strong'
      : 'watch';

  return {
    inputs: {
      monthlyOrders,
      baseAov,
      exposureRate,
      takeRate,
      crossSellPrice,
      crossSellCogs,
      fulfillmentCost,
      refundRate,
      toolCost,
      opsCost,
      setupCost,
      analysisMonths,
      targetPaybackMonths,
    },
    exposureOrders: round2(exposureOrders),
    crossSellUnits: round2(crossSellUnits),
    refundedUnits: round2(refundedUnits),
    netCrossSellRevenue: round2(netCrossSellRevenue),
    contribution: round2(contribution),
    fixedCost: round2(fixedCost),
    netMonthlyProfit: round2(netMonthlyProfit),
    periodNetBenefit: round2(periodNetBenefit),
    roiPct: Number.isFinite(roiPct) ? round2(roiPct) : roiPct,
    paybackMonths: Number.isFinite(paybackMonths) ? round2(paybackMonths) : Number.POSITIVE_INFINITY,
    aovLift: round2(aovLift),
    newAov: round2(newAov),
    breakEvenTakeRate: Number.isFinite(breakEvenTakeRate) ? round2(breakEvenTakeRate) : Number.POSITIVE_INFINITY,
    perUnitContribution: round2(perUnitContribution),
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

  const breakEvenText = Number.isFinite(result.breakEvenTakeRate)
    ? `${num.format(result.breakEvenTakeRate)}%`
    : '도달 불가';

  return [
    '[Cross-sell Recommendation ROI 요약]',
    `월 주문수: ${num.format(result.inputs.monthlyOrders)}건`,
    `노출률/부착률: ${num.format(result.inputs.exposureRate)}% / ${num.format(result.inputs.takeRate)}%`,
    `순크로스셀 매출: ${money.format(result.netCrossSellRevenue)}`,
    `월 순이익: ${money.format(result.netMonthlyProfit)}`,
    `기간 순이익 (${num.format(result.inputs.analysisMonths)}개월): ${money.format(result.periodNetBenefit)}`,
    `ROI: ${Number.isFinite(result.roiPct) ? num.format(result.roiPct) + '%' : '∞'}`,
    `회수기간: ${paybackText}`,
    `손익분기 부착률: ${breakEvenText}`,
    `AOV: ${money.format(result.inputs.baseAov)} → ${money.format(result.newAov)}`,
  ].join('\n');
}
