(function (root) {
  const PLAN_PRESETS = [
    {
      id: 'free',
      feeRatePct: 9,
      monthlyCost: 0,
      label: { en: 'Free', ko: 'Free' }
    },
    {
      id: 'creator-monthly',
      feeRatePct: 9,
      monthlyCost: 10,
      label: { en: 'Creator monthly', ko: 'Creator 월간' }
    },
    {
      id: 'creator-annual',
      feeRatePct: 9,
      monthlyCost: 100 / 12,
      label: { en: 'Creator annual', ko: 'Creator 연간' }
    },
    {
      id: 'creator-plus-monthly',
      feeRatePct: 0,
      monthlyCost: 30,
      label: { en: 'Creator Plus monthly', ko: 'Creator Plus 월간' }
    },
    {
      id: 'creator-plus-annual',
      feeRatePct: 0,
      monthlyCost: 300 / 12,
      label: { en: 'Creator Plus annual', ko: 'Creator Plus 연간' }
    },
    {
      id: 'creator-max-monthly',
      feeRatePct: 0,
      monthlyCost: 90,
      label: { en: 'Creator Max monthly', ko: 'Creator Max 월간' }
    },
    {
      id: 'creator-max-annual',
      feeRatePct: 0,
      monthlyCost: 900 / 12,
      label: { en: 'Creator Max annual', ko: 'Creator Max 연간' }
    },
    {
      id: 'custom',
      feeRatePct: null,
      monthlyCost: null,
      label: { en: 'Custom plan', ko: '커스텀 플랜' }
    }
  ];

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe',
      ratePct: 2.9,
      flatFee: 0.3,
      label: { en: 'Stripe · 2.9% + $0.30', ko: 'Stripe · 2.9% + $0.30' }
    },
    {
      id: 'paypal-us',
      ratePct: 3.49,
      flatFee: 0.49,
      label: { en: 'PayPal US · 3.49% + $0.49', ko: 'PayPal 미국 · 3.49% + $0.49' }
    },
    {
      id: 'custom',
      ratePct: null,
      flatFee: null,
      label: { en: 'Custom processor', ko: '커스텀 결제 수수료' }
    }
  ];

  const STANDARD_PLAN_IDS = PLAN_PRESETS.filter((preset) => preset.id !== 'custom').map((preset) => preset.id);

  const DEFAULTS = {
    monthlyGrossSales: 4000,
    successfulSales: 80,
    refundRatePct: 2,
    affiliateShareRatePct: 15,
    planPreset: 'free',
    customPlanFeeRatePct: 9,
    customPlanMonthlyCost: 0,
    processorPreset: 'stripe',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.3,
    otherMonthlyCost: 250,
    desiredMonthlyNetProfit: 2000
  };

  const TEXT = {
    en: {
      pageTitle: 'Beacons Fee Calculator',
      pageSubtitle: 'Model Beacons store take-home with 9% seller-fee plans, 0% paid plans, processor fees, refunds, and affiliate-share drag.',
      assumptions: 'Current public defaults reviewed on March 27, 2026: Free and Creator use 9% seller fees, Creator Plus and Creator Max use 0% seller fees. Refunds and affiliate settlements are approximations.',
      inputTitle: 'Inputs',
      resultsTitle: 'Results',
      summaryTitle: 'Summary',
      notesTitle: 'Assumptions',
      comparisonTitle: 'Plan comparison',
      monthlyGrossSales: 'Monthly gross sales',
      successfulSales: 'Successful sales',
      refundRatePct: 'Refund rate (%)',
      affiliateShareRatePct: 'Affiliate share (%)',
      planPreset: 'Beacons plan',
      customPlanFeeRatePct: 'Custom Beacons fee (%)',
      customPlanMonthlyCost: 'Custom monthly plan cost',
      processorPreset: 'Processor preset',
      customProcessorRatePct: 'Custom processor rate (%)',
      customProcessorFlatFee: 'Custom processor flat fee',
      otherMonthlyCost: 'Other monthly costs',
      desiredMonthlyNetProfit: 'Target monthly net profit',
      refundHint: 'Approximate the share of gross sales later refunded.',
      affiliateHint: 'Optional affiliate payout share on recognized sales.',
      planHint: 'Annual presets are converted to monthly-equivalent cost.',
      calculate: 'Recalculate',
      reset: 'Reset',
      copy: 'Copy summary',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Copy manually.',
      waiting: 'Enter valid inputs to estimate Beacons take-home.',
      profitable: 'This scenario is profitable under the current plan.',
      unprofitable: 'This scenario loses money. Re-check pricing, fees, or costs.',
      invalid: 'Please review your inputs.',
      gross: 'Monthly gross sales must be greater than zero.',
      sales: 'Successful sales must be greater than zero.',
      refund: 'Refund rate must be 0 or above and below 100%.',
      affiliate: 'Affiliate share must be 0 or above and below 100%.',
      plan: 'Unsupported Beacons plan preset.',
      planFee: 'Custom Beacons fee must be 0 or above and below 100%.',
      planCost: 'Custom monthly plan cost must be 0 or above.',
      processor: 'Unsupported processor preset.',
      processorRate: 'Custom processor rate must be 0 or above and below 100%.',
      processorFlat: 'Custom processor flat fee must be 0 or above.',
      otherCost: 'Other monthly costs must be 0 or above.',
      target: 'Target monthly net profit must be 0 or above.',
      monthlyNetProfit: 'Monthly net profit',
      takeHomeRate: 'Take-home rate',
      breakEvenGrossSales: 'Break-even gross sales',
      requiredGrossForTargetNet: 'Gross needed for target net',
      beaconsFees: 'Beacons fees',
      processorFees: 'Processor fees',
      refundLoss: 'Refund loss',
      affiliatePayout: 'Affiliate payout',
      monthlyPlanCost: 'Monthly plan cost',
      recognizedSales: 'Recognized sales',
      annualizedNetProfit: 'Annualized net profit',
      averageOrderValue: 'Average order value',
      payoutBeforeFixedCosts: 'Payout before fixed costs',
      note1: 'Beacons fees apply to recognized sales after affiliate-share drag in this estimator.',
      note2: 'Processor fixed fees scale with your current average order value.',
      note3: 'Taxes, VAT/GST, chargebacks, and payout timing are out of scope.',
      note4: 'Validate current Beacons terms before using this for pricing decisions.',
      comparePlan: 'Plan',
      compareFee: 'Seller fee',
      compareCost: 'Monthly cost',
      compareNet: 'Net profit',
      compareDrag: 'Effective drag',
      summaryHeading: '[Beacons Fee Calculator Summary]',
      currentPlan: 'Current plan',
      processorLabel: 'Processor',
      na: 'N/A',
      language: '한국어'
    },
    ko: {
      pageTitle: '비컨스 수수료 계산기',
      pageSubtitle: 'Beacons 스토어의 9% 판매 수수료 플랜, 0% 유료 플랜, 결제 수수료, 환불, 제휴 정산을 함께 반영해 실제 실수령액을 계산합니다.',
      assumptions: '2026-03-27 기준 공개 요금 가정: Free/Creator는 9% seller fee, Creator Plus/Creator Max는 0% seller fee로 계산합니다. 환불과 제휴 정산은 추정치입니다.',
      inputTitle: '입력값',
      resultsTitle: '결과',
      summaryTitle: '요약',
      notesTitle: '가정 및 주의사항',
      comparisonTitle: '플랜 비교',
      monthlyGrossSales: '월 총매출',
      successfulSales: '성공 주문 수',
      refundRatePct: '환불률 (%)',
      affiliateShareRatePct: '제휴 정산 비율 (%)',
      planPreset: 'Beacons 플랜',
      customPlanFeeRatePct: '커스텀 Beacons 수수료 (%)',
      customPlanMonthlyCost: '커스텀 월 플랜 비용',
      processorPreset: '결제 수수료 프리셋',
      customProcessorRatePct: '커스텀 결제 수수료율 (%)',
      customProcessorFlatFee: '커스텀 건당 고정 수수료',
      otherMonthlyCost: '기타 월 고정비',
      desiredMonthlyNetProfit: '목표 월 순이익',
      refundHint: '나중에 환불되는 매출 비중을 대략 입력합니다.',
      affiliateHint: '인정 매출 기준으로 빠져나가는 제휴 정산 비율입니다.',
      planHint: '연간 플랜은 월 환산 비용으로 계산합니다.',
      calculate: '다시 계산',
      reset: '초기화',
      copy: '요약 복사',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 쓸 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 값을 넣으면 Beacons 실수령액이 계산됩니다.',
      profitable: '현재 가정에서는 이 플랜이 흑자입니다.',
      unprofitable: '현재 가정에서는 적자입니다. 가격, 수수료, 고정비를 다시 확인하세요.',
      invalid: '입력값을 확인해주세요.',
      gross: '월 총매출은 0보다 커야 합니다.',
      sales: '성공 주문 수는 0보다 커야 합니다.',
      refund: '환불률은 0 이상 100 미만이어야 합니다.',
      affiliate: '제휴 정산 비율은 0 이상 100 미만이어야 합니다.',
      plan: '지원하지 않는 Beacons 플랜 프리셋입니다.',
      planFee: '커스텀 Beacons 수수료는 0 이상 100 미만이어야 합니다.',
      planCost: '커스텀 월 플랜 비용은 0 이상이어야 합니다.',
      processor: '지원하지 않는 결제 수수료 프리셋입니다.',
      processorRate: '커스텀 결제 수수료율은 0 이상 100 미만이어야 합니다.',
      processorFlat: '커스텀 건당 고정 수수료는 0 이상이어야 합니다.',
      otherCost: '기타 월 고정비는 0 이상이어야 합니다.',
      target: '목표 월 순이익은 0 이상이어야 합니다.',
      monthlyNetProfit: '월 순이익',
      takeHomeRate: '실수령 비율',
      breakEvenGrossSales: '손익분기 월매출',
      requiredGrossForTargetNet: '목표 순이익 달성 필요 월매출',
      beaconsFees: 'Beacons 수수료',
      processorFees: '결제 처리 수수료',
      refundLoss: '환불 손실',
      affiliatePayout: '제휴 정산액',
      monthlyPlanCost: '월 플랜 비용',
      recognizedSales: '인정 매출',
      annualizedNetProfit: '연 환산 순이익',
      averageOrderValue: '평균 주문 금액',
      payoutBeforeFixedCosts: '고정비 차감 전 정산액',
      note1: '이 계산기는 제휴 정산 후 남은 인정 매출에 Beacons 수수료가 붙는다고 가정합니다.',
      note2: '결제 고정 수수료는 현재 평균 주문 금액을 유지한다고 보고 확장 계산합니다.',
      note3: '세금, VAT/GST, 차지백, 정산 시차는 범위 밖입니다.',
      note4: '실제 의사결정 전에는 현재 Beacons 약관과 요금을 다시 확인하세요.',
      comparePlan: '플랜',
      compareFee: '판매 수수료',
      compareCost: '월 비용',
      compareNet: '순이익',
      compareDrag: '실효 차감률',
      summaryHeading: '[비컨스 수수료 계산기 요약]',
      currentPlan: '현재 플랜',
      processorLabel: '결제 수수료',
      na: 'N/A',
      language: 'English'
    }
  };

  const planMap = Object.fromEntries(PLAN_PRESETS.map((preset) => [preset.id, preset]));
  const processorMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function normalizeInput(input) {
    return {
      monthlyGrossSales: Number(input.monthlyGrossSales),
      successfulSales: Number(input.successfulSales),
      refundRatePct: Number(input.refundRatePct),
      affiliateShareRatePct: Number(input.affiliateShareRatePct),
      planPreset: input.planPreset || DEFAULTS.planPreset,
      customPlanFeeRatePct: Number(input.customPlanFeeRatePct),
      customPlanMonthlyCost: Number(input.customPlanMonthlyCost),
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: Number(input.customProcessorRatePct),
      customProcessorFlatFee: Number(input.customProcessorFlatFee),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlanPreset(input) {
    return planMap[input.planPreset] || null;
  }

  function getProcessorPreset(input) {
    return processorMap[input.processorPreset] || null;
  }

  function resolvePlan(input) {
    const preset = getPlanPreset(input);
    if (!preset) return null;
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        feeRatePct: input.customPlanFeeRatePct,
        monthlyCost: input.customPlanMonthlyCost,
        label: preset.label
      };
    }
    return {
      id: preset.id,
      feeRatePct: preset.feeRatePct,
      monthlyCost: preset.monthlyCost,
      label: preset.label
    };
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input);
    if (!preset) return null;
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        ratePct: input.customProcessorRatePct,
        flatFee: input.customProcessorFlatFee,
        label: preset.label
      };
    }
    return {
      id: preset.id,
      ratePct: preset.ratePct,
      flatFee: preset.flatFee,
      label: preset.label
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) return t.gross;
    if (!Number.isFinite(input.successfulSales) || input.successfulSales <= 0) return t.sales;
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) return t.refund;
    if (!Number.isFinite(input.affiliateShareRatePct) || input.affiliateShareRatePct < 0 || input.affiliateShareRatePct >= 100) return t.affiliate;
    if (!getPlanPreset(input)) return t.plan;
    if (!Number.isFinite(input.customPlanFeeRatePct) || input.customPlanFeeRatePct < 0 || input.customPlanFeeRatePct >= 100) return t.planFee;
    if (!Number.isFinite(input.customPlanMonthlyCost) || input.customPlanMonthlyCost < 0) return t.planCost;
    if (!getProcessorPreset(input)) return t.processor;
    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) return t.processorRate;
    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) return t.processorFlat;
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) return t.otherCost;
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) return t.target;
    return '';
  }

  function evaluateScenario(input, overrides) {
    const plan = overrides && overrides.plan ? overrides.plan : resolvePlan(input);
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);
    const gross = input.monthlyGrossSales;
    const sales = input.successfulSales;
    const refundRate = input.refundRatePct / 100;
    const affiliateRate = input.affiliateShareRatePct / 100;
    const beaconsFeeRate = plan.feeRatePct / 100;
    const processorRate = processor.ratePct / 100;
    const averageOrderValue = sales > 0 ? gross / sales : 0;
    const refundLoss = gross * refundRate;
    const recognizedSales = gross - refundLoss;
    const affiliatePayout = recognizedSales * affiliateRate;
    const beaconsFeeBase = Math.max(recognizedSales - affiliatePayout, 0);
    const beaconsFees = beaconsFeeBase * beaconsFeeRate;
    const processorFees = recognizedSales * processorRate + sales * processor.flatFee;
    const payoutBeforeFixedCosts = recognizedSales - affiliatePayout - beaconsFees - processorFees;
    const monthlyNetProfit = payoutBeforeFixedCosts - plan.monthlyCost - input.otherMonthlyCost;
    const annualizedNetProfit = monthlyNetProfit * 12;
    const effectiveDragRate = gross > 0
      ? (refundLoss + affiliatePayout + beaconsFees + processorFees + plan.monthlyCost) / gross
      : 0;
    const takeHomeRate = gross > 0 ? monthlyNetProfit / gross : 0;
    const flatFeeRate = averageOrderValue > 0 ? processor.flatFee / averageOrderValue : Number.POSITIVE_INFINITY;
    const recognizedRate = 1 - refundRate;
    const contributionMarginRate = recognizedRate * (1 - affiliateRate - ((1 - affiliateRate) * beaconsFeeRate) - processorRate) - flatFeeRate;

    return {
      planId: plan.id,
      planLabel: plan.label,
      planFeeRatePct: plan.feeRatePct,
      monthlyPlanCost: plan.monthlyCost,
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      averageOrderValue,
      refundLoss,
      recognizedSales,
      affiliatePayout,
      beaconsFeeBase,
      beaconsFees,
      processorFees,
      payoutBeforeFixedCosts,
      monthlyNetProfit,
      annualizedNetProfit,
      effectiveDragRate,
      takeHomeRate,
      contributionMarginRate
    };
  }

  function findRequiredGrossForNet(input, targetNet, overrides) {
    const scenario = evaluateScenario(input, overrides);
    if (!Number.isFinite(scenario.averageOrderValue) || scenario.averageOrderValue <= 0) {
      return null;
    }
    if (!Number.isFinite(scenario.contributionMarginRate) || scenario.contributionMarginRate <= 0) {
      return null;
    }
    return (scenario.monthlyPlanCost + input.otherMonthlyCost + targetNet) / scenario.contributionMarginRate;
  }

  function formatMoney(value, lang) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, digits) {
    if (!Number.isFinite(value)) return 'N/A';
    return `${round(value * 100, digits)}%`;
  }

  function buildComparisonRows(input) {
    return STANDARD_PLAN_IDS.map((id) => {
      const preset = planMap[id];
      const plan = {
        id: preset.id,
        feeRatePct: preset.feeRatePct,
        monthlyCost: preset.monthlyCost,
        label: preset.label
      };
      const scenario = evaluateScenario(input, { plan });
      return {
        id,
        label: preset.label,
        feeRatePct: round2(preset.feeRatePct),
        monthlyCost: round2(preset.monthlyCost),
        monthlyNetProfit: round2(scenario.monthlyNetProfit),
        effectiveDragRatePct: round2(scenario.effectiveDragRate * 100)
      };
    });
  }

  function buildSummary(result, input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const breakEvenText = result.breakEvenGrossSales == null ? t.na : formatMoney(result.breakEvenGrossSales, lang);
    const requiredText = result.requiredGrossForTargetNet == null ? t.na : formatMoney(result.requiredGrossForTargetNet, lang);
    return [
      t.summaryHeading,
      `${t.currentPlan}: ${result.planLabel[lang]}`,
      `${t.processorLabel}: ${result.processorLabel[lang]}`,
      `${t.monthlyGrossSales}: ${formatMoney(input.monthlyGrossSales, lang)}`,
      `${t.beaconsFees}: ${formatMoney(result.beaconsFees, lang)}`,
      `${t.processorFees}: ${formatMoney(result.processorFees, lang)}`,
      `${t.refundLoss}: ${formatMoney(result.refundLoss, lang)}`,
      `${t.affiliatePayout}: ${formatMoney(result.affiliatePayout, lang)}`,
      `${t.monthlyPlanCost}: ${formatMoney(result.monthlyPlanCost, lang)}`,
      `${t.monthlyNetProfit}: ${formatMoney(result.monthlyNetProfit, lang)}`,
      `${t.breakEvenGrossSales}: ${breakEvenText}`,
      `${t.requiredGrossForTargetNet}: ${requiredText}`
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = options && options.lang === 'ko' ? 'ko' : 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const scenario = evaluateScenario(normalized);
    const breakEvenGrossSales = findRequiredGrossForNet(normalized, 0);
    const requiredGrossForTargetNet = findRequiredGrossForNet(normalized, normalized.desiredMonthlyNetProfit);
    const targetGap = requiredGrossForTargetNet == null
      ? null
      : Math.max(requiredGrossForTargetNet - normalized.monthlyGrossSales, 0);

    const result = {
      ...scenario,
      averageOrderValue: round2(scenario.averageOrderValue),
      refundLoss: round2(scenario.refundLoss),
      recognizedSales: round2(scenario.recognizedSales),
      affiliatePayout: round2(scenario.affiliatePayout),
      beaconsFeeBase: round2(scenario.beaconsFeeBase),
      beaconsFees: round2(scenario.beaconsFees),
      processorFees: round2(scenario.processorFees),
      payoutBeforeFixedCosts: round2(scenario.payoutBeforeFixedCosts),
      monthlyNetProfit: round2(scenario.monthlyNetProfit),
      annualizedNetProfit: round2(scenario.annualizedNetProfit),
      effectiveDragRatePct: round2(scenario.effectiveDragRate * 100),
      takeHomeRatePct: round2(scenario.takeHomeRate * 100),
      monthlyPlanCost: round2(scenario.monthlyPlanCost),
      breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales),
      requiredGrossForTargetNet: requiredGrossForTargetNet == null ? null : round2(requiredGrossForTargetNet),
      targetGap: targetGap == null ? null : round2(targetGap),
      comparisonRows: buildComparisonRows(normalized)
    };
    result.summary = buildSummary(result, normalized, lang);

    return { result, error: '' };
  }

  function bindDom() {
    if (!root.document) return;

    const refs = {
      langBtn: document.getElementById('langBtn'),
      calcBtn: document.getElementById('calcBtn'),
      resetBtn: document.getElementById('resetBtn'),
      copyBtn: document.getElementById('copyBtn'),
      error: document.getElementById('error'),
      status: document.getElementById('status'),
      summary: document.getElementById('summary'),
      comparisonBody: document.getElementById('comparisonBody'),
      monthlyGrossSales: document.getElementById('monthlyGrossSales'),
      successfulSales: document.getElementById('successfulSales'),
      refundRatePct: document.getElementById('refundRatePct'),
      affiliateShareRatePct: document.getElementById('affiliateShareRatePct'),
      planPreset: document.getElementById('planPreset'),
      customPlanFeeRatePct: document.getElementById('customPlanFeeRatePct'),
      customPlanMonthlyCost: document.getElementById('customPlanMonthlyCost'),
      processorPreset: document.getElementById('processorPreset'),
      customProcessorRatePct: document.getElementById('customProcessorRatePct'),
      customProcessorFlatFee: document.getElementById('customProcessorFlatFee'),
      otherMonthlyCost: document.getElementById('otherMonthlyCost'),
      desiredMonthlyNetProfit: document.getElementById('desiredMonthlyNetProfit'),
      monthlyNetProfit: document.getElementById('monthlyNetProfit'),
      takeHomeRate: document.getElementById('takeHomeRate'),
      breakEvenGrossSales: document.getElementById('breakEvenGrossSales'),
      requiredGrossForTargetNet: document.getElementById('requiredGrossForTargetNet'),
      beaconsFees: document.getElementById('beaconsFees'),
      processorFees: document.getElementById('processorFees'),
      refundLoss: document.getElementById('refundLoss'),
      affiliatePayout: document.getElementById('affiliatePayout'),
      monthlyPlanCost: document.getElementById('monthlyPlanCost'),
      recognizedSales: document.getElementById('recognizedSales'),
      annualizedNetProfit: document.getElementById('annualizedNetProfit'),
      averageOrderValue: document.getElementById('averageOrderValue'),
      payoutBeforeFixedCosts: document.getElementById('payoutBeforeFixedCosts')
    };

    let currentLang = 'en';

    function inputValue() {
      return {
        monthlyGrossSales: refs.monthlyGrossSales.value,
        successfulSales: refs.successfulSales.value,
        refundRatePct: refs.refundRatePct.value,
        affiliateShareRatePct: refs.affiliateShareRatePct.value,
        planPreset: refs.planPreset.value,
        customPlanFeeRatePct: refs.customPlanFeeRatePct.value,
        customPlanMonthlyCost: refs.customPlanMonthlyCost.value,
        processorPreset: refs.processorPreset.value,
        customProcessorRatePct: refs.customProcessorRatePct.value,
        customProcessorFlatFee: refs.customProcessorFlatFee.value,
        otherMonthlyCost: refs.otherMonthlyCost.value,
        desiredMonthlyNetProfit: refs.desiredMonthlyNetProfit.value
      };
    }

    function applyText() {
      const t = TEXT[currentLang];
      document.querySelectorAll('[data-i18n]').forEach((node) => {
        const key = node.getAttribute('data-i18n');
        if (t[key]) node.textContent = t[key];
      });
      refs.langBtn.textContent = t.language;
      syncSelectLabels();
    }

    function syncSelectLabels() {
      PLAN_PRESETS.forEach((preset) => {
        const option = refs.planPreset.querySelector(`option[value="${preset.id}"]`);
        if (option) option.textContent = preset.label[currentLang];
      });
      PROCESSOR_PRESETS.forEach((preset) => {
        const option = refs.processorPreset.querySelector(`option[value="${preset.id}"]`);
        if (option) option.textContent = preset.label[currentLang];
      });
    }

    function updateCustomVisibility() {
      const planCustom = refs.planPreset.value === 'custom';
      const processorCustom = refs.processorPreset.value === 'custom';
      refs.customPlanFeeRatePct.disabled = !planCustom;
      refs.customPlanMonthlyCost.disabled = !planCustom;
      refs.customProcessorRatePct.disabled = !processorCustom;
      refs.customProcessorFlatFee.disabled = !processorCustom;
    }

    function setEmptyState() {
      const t = TEXT[currentLang];
      refs.status.textContent = t.waiting;
      refs.status.className = 'status';
      refs.summary.value = '';
      refs.comparisonBody.innerHTML = '';
      ['monthlyNetProfit', 'takeHomeRate', 'breakEvenGrossSales', 'requiredGrossForTargetNet', 'beaconsFees', 'processorFees', 'refundLoss', 'affiliatePayout', 'monthlyPlanCost', 'recognizedSales', 'annualizedNetProfit', 'averageOrderValue', 'payoutBeforeFixedCosts'].forEach((key) => {
        refs[key].textContent = '—';
      });
    }

    function render() {
      updateCustomVisibility();
      const t = TEXT[currentLang];
      const { result, error } = calculate(inputValue(), { lang: currentLang });
      if (error) {
        refs.error.textContent = error;
        refs.error.classList.add('show');
        setEmptyState();
        return;
      }

      refs.error.classList.remove('show');
      refs.error.textContent = '';

      refs.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit, currentLang);
      refs.takeHomeRate.textContent = `${result.takeHomeRatePct}%`;
      refs.breakEvenGrossSales.textContent = result.breakEvenGrossSales == null ? t.na : formatMoney(result.breakEvenGrossSales, currentLang);
      refs.requiredGrossForTargetNet.textContent = result.requiredGrossForTargetNet == null ? t.na : formatMoney(result.requiredGrossForTargetNet, currentLang);
      refs.beaconsFees.textContent = formatMoney(result.beaconsFees, currentLang);
      refs.processorFees.textContent = formatMoney(result.processorFees, currentLang);
      refs.refundLoss.textContent = formatMoney(result.refundLoss, currentLang);
      refs.affiliatePayout.textContent = formatMoney(result.affiliatePayout, currentLang);
      refs.monthlyPlanCost.textContent = formatMoney(result.monthlyPlanCost, currentLang);
      refs.recognizedSales.textContent = formatMoney(result.recognizedSales, currentLang);
      refs.annualizedNetProfit.textContent = formatMoney(result.annualizedNetProfit, currentLang);
      refs.averageOrderValue.textContent = formatMoney(result.averageOrderValue, currentLang);
      refs.payoutBeforeFixedCosts.textContent = formatMoney(result.payoutBeforeFixedCosts, currentLang);
      refs.summary.value = result.summary;

      refs.status.textContent = result.monthlyNetProfit >= 0 ? t.profitable : t.unprofitable;
      refs.status.className = `status ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;

      refs.comparisonBody.innerHTML = result.comparisonRows.map((row) => {
        const isCurrent = row.id === refs.planPreset.value ? ' current-row' : '';
        return `<tr class="${isCurrent.trim()}"><td>${row.label[currentLang]}</td><td>${row.feeRatePct}%</td><td>${formatMoney(row.monthlyCost, currentLang)}</td><td>${formatMoney(row.monthlyNetProfit, currentLang)}</td><td>${row.effectiveDragRatePct}%</td></tr>`;
      }).join('');
    }

    function reset() {
      Object.keys(DEFAULTS).forEach((key) => {
        if (refs[key]) refs[key].value = DEFAULTS[key];
      });
      updateCustomVisibility();
      render();
    }

    refs.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyText();
      render();
    });
    refs.calcBtn.addEventListener('click', render);
    refs.resetBtn.addEventListener('click', reset);
    refs.copyBtn.addEventListener('click', async () => {
      const t = TEXT[currentLang];
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.textContent = t.copied;
        refs.status.className = 'status good';
      } catch (error) {
        refs.status.textContent = t.copyFail;
        refs.status.className = 'status warn';
      }
    });

    [refs.monthlyGrossSales, refs.successfulSales, refs.refundRatePct, refs.affiliateShareRatePct, refs.planPreset, refs.customPlanFeeRatePct, refs.customPlanMonthlyCost, refs.processorPreset, refs.customProcessorRatePct, refs.customProcessorFlatFee, refs.otherMonthlyCost, refs.desiredMonthlyNetProfit].forEach((el) => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });

    applyText();
    reset();
  }

  const exported = {
    PLAN_PRESETS,
    PROCESSOR_PRESETS,
    DEFAULTS,
    STANDARD_PLAN_IDS,
    resolvePlan,
    resolveProcessor,
    evaluateScenario,
    findRequiredGrossForNet,
    calculate,
    formatPercent,
    formatMoney,
    round2,
    round4
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  } else {
    root.BeaconsFeeCalculator = exported;
  }

  if (root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', bindDom);
    } else {
      bindDom();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
