(function (root) {
  const OVERAGE_RATE = 0.02;

  const PLANS = [
    {
      id: 'starter',
      cap: 10000,
      monthlyPrice: 29,
      annualPrice: 264,
      label: { ko: 'Starter', en: 'Starter' },
      featureNote: {
        ko: '기본 기능 중심',
        en: 'Core features'
      }
    },
    {
      id: 'business',
      cap: 50000,
      monthlyPrice: 79,
      annualPrice: 708,
      label: { ko: 'Business', en: 'Business' },
      featureNote: {
        ko: '업셀·장바구니 이탈·제휴 포함',
        en: 'Includes upsells, cart abandonment, affiliate marketing'
      }
    },
    {
      id: 'premium',
      cap: 200000,
      monthlyPrice: 159,
      annualPrice: 1428,
      label: { ko: 'Premium', en: 'Premium' },
      featureNote: {
        ko: '우선 지원·고급 옵션 포함',
        en: 'Includes priority support and advanced options'
      }
    }
  ];

  const PROCESSORS = [
    {
      id: 'stripe',
      ratePct: 2.9,
      flat: 0.3,
      label: { ko: 'Stripe (미국 기준 2.9% + $0.30)', en: 'Stripe (US baseline 2.9% + $0.30)' }
    },
    {
      id: 'paypal-us',
      ratePct: 2.9,
      flat: 0.3,
      label: { ko: 'PayPal US (2.9% + $0.30)', en: 'PayPal US (2.9% + $0.30)' }
    },
    {
      id: 'paypal-intl',
      ratePct: 3.4,
      flat: 0.3,
      label: { ko: 'PayPal Intl 평균 (3.4% + $0.30)', en: 'PayPal Intl avg (3.4% + $0.30)' }
    },
    {
      id: 'custom',
      ratePct: 2.9,
      flat: 0.3,
      label: { ko: '사용자 지정', en: 'Custom' }
    }
  ];

  const planMap = Object.fromEntries(PLANS.map((plan) => [plan.id, plan]));
  const processorMap = Object.fromEntries(PROCESSORS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    planId: 'starter',
    billingCycle: 'annual',
    annualGrossSales: 8000,
    ordersPerYear: 200,
    refundRatePct: 5,
    deliveryCostPerOrder: 1,
    otherAnnualCost: 500,
    processorId: 'stripe',
    processorRatePct: 2.9,
    processorFlat: 0.3
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      plan: '지원하지 않는 Sellfy 플랜입니다.',
      billing: '과금 주기는 monthly 또는 annual 이어야 합니다.',
      processor: '지원하지 않는 결제 처리기 프리셋입니다.',
      orders: '연간 주문 수는 1 이상의 정수여야 합니다.',
      gross: '연간 총매출은 0보다 커야 합니다.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      percent: '환불률과 결제 수수료율은 0 이상 100 미만이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 접근이 불가해 수동 복사가 필요합니다.',
      waiting: '유효한 값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서는 순이익이 플러스입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 플랜·매출·주문·비용을 다시 점검하세요.',
      summaryTitle: '[Sellfy 요금제 수익 요약]',
      recommendationCostOnly: '추천 플랜은 비용 기준이며 기능 차이는 별도 검토가 필요합니다.',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      plan: 'Unsupported Sellfy plan.',
      billing: 'Billing cycle must be monthly or annual.',
      processor: 'Unsupported processor preset.',
      orders: 'Orders per year must be an integer greater than or equal to 1.',
      gross: 'Annual gross sales must be greater than zero.',
      money: 'All money fields must be zero or above.',
      percent: 'Refund rate and processor rate must be between 0 and 100.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid values to calculate results.',
      statusGood: 'Net profit is positive under the current assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check plan, sales, orders, or costs.',
      summaryTitle: '[Sellfy Pricing Summary]',
      recommendationCostOnly: 'Recommended plan is cost-based only; feature fit is not modeled.',
      na: 'N/A'
    }
  };

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
      planId: input.planId || DEFAULTS.planId,
      billingCycle: input.billingCycle || DEFAULTS.billingCycle,
      annualGrossSales: Number(input.annualGrossSales),
      ordersPerYear: Number(input.ordersPerYear),
      refundRatePct: Number(input.refundRatePct),
      deliveryCostPerOrder: Number(input.deliveryCostPerOrder),
      otherAnnualCost: Number(input.otherAnnualCost),
      processorId: input.processorId || DEFAULTS.processorId,
      processorRatePct: Number(input.processorRatePct),
      processorFlat: Number(input.processorFlat)
    };
  }

  function getPlan(input) {
    return planMap[input.planId] || null;
  }

  function getProcessorPreset(input) {
    return processorMap[input.processorId] || null;
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input);
    if (!preset) {
      return null;
    }
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        ratePct: input.processorRatePct,
        flat: input.processorFlat,
        label: preset.label
      };
    }
    return preset;
  }

  function getAnnualSubscriptionCost(plan, billingCycle) {
    if (billingCycle === 'annual') {
      return plan.annualPrice;
    }
    return plan.monthlyPrice * 12;
  }

  function formatBillingLabel(billingCycle, lang) {
    if (billingCycle === 'annual') {
      return lang === 'ko' ? '연간 결제' : 'Annual billing';
    }
    return lang === 'ko' ? '월간 결제' : 'Monthly billing';
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.annualGrossSales,
      input.deliveryCostPerOrder,
      input.otherAnnualCost,
      input.processorFlat
    ];

    if (!getPlan(input)) {
      return t.plan;
    }

    if (!['monthly', 'annual'].includes(input.billingCycle)) {
      return t.billing;
    }

    if (!getProcessorPreset(input)) {
      return t.processor;
    }

    if (!Number.isInteger(input.ordersPerYear) || input.ordersPerYear < 1) {
      return t.orders;
    }

    if (!Number.isFinite(input.annualGrossSales) || input.annualGrossSales <= 0) {
      return t.gross;
    }

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }

    if (
      !Number.isFinite(input.refundRatePct) ||
      !Number.isFinite(input.processorRatePct) ||
      input.refundRatePct < 0 || input.refundRatePct >= 100 ||
      input.processorRatePct < 0 || input.processorRatePct >= 100
    ) {
      return t.percent;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const plan = (overrides && overrides.plan) || getPlan(input);
    const processor = resolveProcessor(input);
    const gross = overrides && overrides.annualGrossSales != null ? Number(overrides.annualGrossSales) : input.annualGrossSales;
    const refundRate = input.refundRatePct / 100;
    const processorRate = processor.ratePct / 100;
    const subscriptionCost = getAnnualSubscriptionCost(plan, input.billingCycle);
    const refundLoss = gross * refundRate;
    const processorPercentFee = gross * processorRate;
    const processorFlatFee = input.ordersPerYear * processor.flat;
    const processorFees = processorPercentFee + processorFlatFee;
    const overageFee = Math.max(gross - plan.cap, 0) * OVERAGE_RATE;
    const deliveryCostTotal = input.ordersPerYear * input.deliveryCostPerOrder;
    const takeHomeAfterPlatform = gross - refundLoss - processorFees - subscriptionCost - overageFee;
    const netProfit = takeHomeAfterPlatform - deliveryCostTotal - input.otherAnnualCost;
    const averageOrderValue = gross / input.ordersPerYear;
    const monthlyNetProfit = netProfit / 12;
    const effectiveSellfyCostRate = gross > 0 ? (subscriptionCost + overageFee) / gross : 0;
    const effectiveProcessorCostRate = gross > 0 ? processorFees / gross : 0;
    const capHeadroom = plan.cap - gross;
    const capUsageRate = gross > 0 ? gross / plan.cap : 0;

    return {
      plan,
      processor,
      gross,
      subscriptionCost,
      refundLoss,
      processorPercentFee,
      processorFlatFee,
      processorFees,
      overageFee,
      deliveryCostTotal,
      takeHomeAfterPlatform,
      netProfit,
      monthlyNetProfit,
      averageOrderValue,
      effectiveSellfyCostRate,
      effectiveProcessorCostRate,
      capHeadroom,
      capUsageRate
    };
  }

  function findBreakEvenGrossSales(input) {
    const plan = getPlan(input);
    const processor = resolveProcessor(input);
    const refundRate = input.refundRatePct / 100;
    const processorRate = processor.ratePct / 100;
    const fixedCost =
      (input.ordersPerYear * processor.flat) +
      getAnnualSubscriptionCost(plan, input.billingCycle) +
      (input.ordersPerYear * input.deliveryCostPerOrder) +
      input.otherAnnualCost;

    const denominatorNoOverage = 1 - refundRate - processorRate;
    if (!Number.isFinite(denominatorNoOverage) || denominatorNoOverage <= 0) {
      return null;
    }

    const solutionNoOverage = fixedCost / denominatorNoOverage;
    if (solutionNoOverage <= plan.cap) {
      return solutionNoOverage;
    }

    const denominatorWithOverage = 1 - refundRate - processorRate - OVERAGE_RATE;
    if (!Number.isFinite(denominatorWithOverage) || denominatorWithOverage <= 0) {
      return null;
    }

    const solutionWithOverage = (fixedCost - (plan.cap * OVERAGE_RATE)) / denominatorWithOverage;
    if (!Number.isFinite(solutionWithOverage)) {
      return null;
    }

    return solutionWithOverage > plan.cap ? solutionWithOverage : plan.cap;
  }

  function getNextPlan(plan) {
    const index = PLANS.findIndex((entry) => entry.id === plan.id);
    if (index === -1 || index === PLANS.length - 1) {
      return null;
    }
    return PLANS[index + 1];
  }

  function findNextPlanBreakEvenSales(input) {
    const plan = getPlan(input);
    const nextPlan = getNextPlan(plan);
    if (!nextPlan) {
      return null;
    }

    const currentCost = getAnnualSubscriptionCost(plan, input.billingCycle);
    const nextCost = getAnnualSubscriptionCost(nextPlan, input.billingCycle);
    const delta = nextCost - currentCost;
    if (delta <= 0) {
      return plan.cap;
    }
    return plan.cap + (delta / OVERAGE_RATE);
  }

  function comparePlans(input) {
    const comparison = PLANS.map((plan) => {
      const evaluated = evaluateScenario(input, { plan, annualGrossSales: input.annualGrossSales });
      return {
        planId: plan.id,
        planLabel: plan.label,
        featureNote: plan.featureNote,
        cap: plan.cap,
        subscriptionCost: round2(evaluated.subscriptionCost),
        overageFee: round2(evaluated.overageFee),
        platformCost: round2(evaluated.subscriptionCost + evaluated.overageFee),
        netProfit: round2(evaluated.netProfit),
        headroom: round2(evaluated.capHeadroom)
      };
    });

    let recommended = comparison[0];
    comparison.forEach((entry) => {
      if (entry.netProfit > recommended.netProfit) {
        recommended = entry;
      }
    });

    return {
      rows: comparison,
      recommendedPlanId: recommended.planId
    };
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${lang === 'ko' ? '선택 플랜' : 'Selected plan'}: ${result.planLabel} · ${result.billingLabel}`,
      `${lang === 'ko' ? '연간 총매출' : 'Annual gross sales'}: ${formatMoney(result.annualGrossSales, lang)}`,
      `${lang === 'ko' ? '연간 주문 수' : 'Orders per year'}: ${result.ordersPerYear}`,
      `${lang === 'ko' ? '평균 주문금액' : 'Average order value'}: ${formatMoney(result.averageOrderValue, lang)}`,
      `${lang === 'ko' ? 'Sellfy 구독비' : 'Sellfy subscription cost'}: ${formatMoney(result.subscriptionCost, lang)}`,
      `${lang === 'ko' ? '결제 처리 수수료' : 'Processor fees'}: ${formatMoney(result.processorFees, lang)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLoss, lang)}`,
      `${lang === 'ko' ? '초과매출 수수료' : 'Overage fee'}: ${formatMoney(result.overageFee, lang)}`,
      `${lang === 'ko' ? '플랫폼 비용 차감 후 수령액' : 'Take-home after platform costs'}: ${formatMoney(result.takeHomeAfterPlatform, lang)}`,
      `${lang === 'ko' ? '순이익' : 'Net profit'}: ${formatMoney(result.netProfit, lang)}`,
      `${lang === 'ko' ? '월 평균 순이익' : 'Monthly net profit'}: ${formatMoney(result.monthlyNetProfit, lang)}`,
      `${lang === 'ko' ? '비용 기준 추천 플랜' : 'Cost-based recommended plan'}: ${result.recommendedPlanLabel}`,
      (TEXT[lang] || TEXT.en).recommendationCostOnly
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const processor = resolveProcessor(normalized);
    if (processor && normalized.processorId !== 'custom') {
      normalized.processorRatePct = processor.ratePct;
      normalized.processorFlat = processor.flat;
    }

    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateScenario(normalized);
    const comparison = comparePlans(normalized);
    const breakEvenGrossSales = findBreakEvenGrossSales(normalized);
    const nextPlanBreakEvenSales = findNextPlanBreakEvenSales(normalized);
    const recommendedRow = comparison.rows.find((row) => row.planId === comparison.recommendedPlanId);
    const plan = getPlan(normalized);
    const processorPreset = resolveProcessor(normalized);

    const result = {
      inputs: normalized,
      planLabel: plan.label[lang] || plan.label.en,
      billingLabel: formatBillingLabel(normalized.billingCycle, lang),
      processorLabel: processorPreset.label[lang] || processorPreset.label.en,
      annualGrossSales: round2(evaluated.gross),
      ordersPerYear: normalized.ordersPerYear,
      averageOrderValue: round2(evaluated.averageOrderValue),
      subscriptionCost: round2(evaluated.subscriptionCost),
      refundLoss: round2(evaluated.refundLoss),
      processorPercentFee: round2(evaluated.processorPercentFee),
      processorFlatFee: round2(evaluated.processorFlatFee),
      processorFees: round2(evaluated.processorFees),
      overageFee: round2(evaluated.overageFee),
      deliveryCostTotal: round2(evaluated.deliveryCostTotal),
      takeHomeAfterPlatform: round2(evaluated.takeHomeAfterPlatform),
      netProfit: round2(evaluated.netProfit),
      monthlyNetProfit: round2(evaluated.monthlyNetProfit),
      effectiveSellfyCostRate: round4(evaluated.effectiveSellfyCostRate),
      effectiveSellfyCostRatePct: round2(evaluated.effectiveSellfyCostRate * 100),
      effectiveProcessorCostRate: round4(evaluated.effectiveProcessorCostRate),
      effectiveProcessorCostRatePct: round2(evaluated.effectiveProcessorCostRate * 100),
      capHeadroom: round2(evaluated.capHeadroom),
      capUsageRate: round4(evaluated.capUsageRate),
      capUsageRatePct: round2(evaluated.capUsageRate * 100),
      breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales),
      nextPlanBreakEvenSales: nextPlanBreakEvenSales == null ? null : round2(nextPlanBreakEvenSales),
      comparison,
      recommendedPlanId: comparison.recommendedPlanId,
      recommendedPlanLabel: recommendedRow ? (recommendedRow.planLabel[lang] || recommendedRow.planLabel.en) : plan.label[lang] || plan.label.en
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    OVERAGE_RATE,
    PLANS,
    PROCESSORS,
    planMap,
    processorMap,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPlan,
    getProcessorPreset,
    resolveProcessor,
    getAnnualSubscriptionCost,
    validate,
    evaluateScenario,
    findBreakEvenGrossSales,
    findNextPlanBreakEvenSales,
    comparePlans,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.SellfyPricingCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← Tools',
      title: 'Sellfy 요금제 수익 계산기',
      subtitle: 'Sellfy Starter / Business / Premium의 구독비, 결제 수수료, 환불, 2% 초과매출 수수료를 반영해 실제 남는 돈을 계산합니다.',
      disclaimer: '가정: Sellfy 자체 transaction fee는 없고, 플랜 구독비 + 결제 처리 수수료 + 문서상 2% overage planning model을 적용합니다. 추천 플랜은 비용 기준이며 기능 적합성은 별도 검토가 필요합니다.',
      inputHeader: '입력값',
      resultHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      compareHeader: '플랜 비교',
      summaryHeader: '복사용 요약',
      copy: '요약 복사',
      reset: '기본값 복원',
      l_planId: 'Sellfy 플랜',
      l_billingCycle: '과금 주기',
      l_annualGrossSales: '연간 총매출',
      l_ordersPerYear: '연간 주문 수',
      l_refundRatePct: '환불률 (%)',
      l_deliveryCostPerOrder: '주문당 배송/전달 원가',
      l_otherAnnualCost: '기타 연간 고정비',
      l_processorId: '결제 처리기',
      l_processorRatePct: '커스텀 수수료율 (%)',
      l_processorFlat: '커스텀 건당 고정 수수료',
      k_subscriptionCost: 'Sellfy 구독비',
      k_processorFees: '결제 수수료',
      k_overageFee: '초과매출 수수료',
      k_takeHomeAfterPlatform: '플랫폼 비용 차감 후 수령액',
      k_netProfit: '순이익',
      k_monthlyNetProfit: '월 평균 순이익',
      k_breakEvenGrossSales: '손익분기 연매출',
      k_nextPlanBreakEvenSales: '다음 플랜이 더 싸지는 매출',
      d_refundLoss: '환불 손실',
      d_averageOrderValue: '평균 주문금액',
      d_deliveryCostTotal: '총 배송/전달 원가',
      d_effectiveSellfyCostRatePct: 'Sellfy 실효 비용률',
      d_effectiveProcessorCostRatePct: '결제 실효 비용률',
      d_capHeadroom: '매출 캡 여유/초과',
      d_capUsageRatePct: '캡 사용률',
      d_processorPercentFee: '비율 결제 수수료',
      d_processorFlatFee: '고정 결제 수수료',
      comparePlan: '플랜',
      compareCap: '연매출 캡',
      compareSubscription: '구독비',
      compareOverage: '초과매출 수수료',
      compareNet: '순이익',
      compareRecommended: '추천',
      recommendedYes: '추천',
      recommendedNo: '',
      annual: '연간 결제',
      monthly: '월간 결제',
      waiting: TEXT.ko.waiting,
      statusGood: TEXT.ko.statusGood,
      statusWarn: TEXT.ko.statusWarn,
      invalid: TEXT.ko.invalid,
      costOnly: TEXT.ko.recommendationCostOnly,
      noNextPlan: '상위 플랜 없음',
      na: TEXT.ko.na,
      capPositive: '캡 여유',
      capNegative: '캡 초과'
    },
    en: {
      back: '← Tools',
      title: 'Sellfy Pricing Calculator',
      subtitle: 'Estimate what you keep on Sellfy after plan cost, processor fees, refunds, and the documented 2% overage planning model.',
      disclaimer: 'Assumption: Sellfy charges no native transaction fee; this calculator models plan subscription cost + processor fees + a deterministic 2% overage planning model from the docs. Recommendation is cost-based only and does not model feature fit.',
      inputHeader: 'Inputs',
      resultHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      compareHeader: 'Plan comparison',
      summaryHeader: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      l_planId: 'Sellfy plan',
      l_billingCycle: 'Billing cycle',
      l_annualGrossSales: 'Annual gross sales',
      l_ordersPerYear: 'Orders per year',
      l_refundRatePct: 'Refund rate (%)',
      l_deliveryCostPerOrder: 'Delivery / fulfillment cost per order',
      l_otherAnnualCost: 'Other annual fixed cost',
      l_processorId: 'Processor preset',
      l_processorRatePct: 'Custom processor rate (%)',
      l_processorFlat: 'Custom flat fee per order',
      k_subscriptionCost: 'Sellfy subscription cost',
      k_processorFees: 'Processor fees',
      k_overageFee: 'Overage fee',
      k_takeHomeAfterPlatform: 'Take-home after platform costs',
      k_netProfit: 'Net profit',
      k_monthlyNetProfit: 'Monthly net profit',
      k_breakEvenGrossSales: 'Break-even annual gross sales',
      k_nextPlanBreakEvenSales: 'Revenue where next plan becomes cheaper',
      d_refundLoss: 'Refund loss',
      d_averageOrderValue: 'Average order value',
      d_deliveryCostTotal: 'Total delivery / fulfillment cost',
      d_effectiveSellfyCostRatePct: 'Effective Sellfy cost rate',
      d_effectiveProcessorCostRatePct: 'Effective processor cost rate',
      d_capHeadroom: 'Cap headroom / overflow',
      d_capUsageRatePct: 'Cap usage rate',
      d_processorPercentFee: 'Percent processor fee',
      d_processorFlatFee: 'Flat processor fee',
      comparePlan: 'Plan',
      compareCap: 'Annual cap',
      compareSubscription: 'Subscription',
      compareOverage: 'Overage',
      compareNet: 'Net profit',
      compareRecommended: 'Recommended',
      recommendedYes: 'Recommended',
      recommendedNo: '',
      annual: 'Annual billing',
      monthly: 'Monthly billing',
      waiting: TEXT.en.waiting,
      statusGood: TEXT.en.statusGood,
      statusWarn: TEXT.en.statusWarn,
      invalid: TEXT.en.invalid,
      costOnly: TEXT.en.recommendationCostOnly,
      noNextPlan: 'No higher plan',
      na: TEXT.en.na,
      capPositive: 'Cap headroom',
      capNegative: 'Over cap'
    }
  };

  function initBrowser() {
    const $ = (id) => document.getElementById(id);
    const refs = {
      langBtn: $('langBtn'),
      backLink: $('backLink'),
      title: $('titleText'),
      subtitle: $('subtitleText'),
      disclaimer: $('disclaimerText'),
      inputHeader: $('inputHeader'),
      resultHeader: $('resultHeader'),
      detailHeader: $('detailHeader'),
      compareHeader: $('compareHeader'),
      summaryHeader: $('summaryHeader'),
      planId: $('planId'),
      billingCycle: $('billingCycle'),
      annualGrossSales: $('annualGrossSales'),
      ordersPerYear: $('ordersPerYear'),
      refundRatePct: $('refundRatePct'),
      deliveryCostPerOrder: $('deliveryCostPerOrder'),
      otherAnnualCost: $('otherAnnualCost'),
      processorId: $('processorId'),
      processorRatePct: $('processorRatePct'),
      processorFlat: $('processorFlat'),
      processorCustomWrap: $('processorCustomWrap'),
      error: $('error'),
      status: $('status'),
      copyBtn: $('copyBtn'),
      resetBtn: $('resetBtn'),
      summary: $('summary'),
      comparisonBody: $('comparisonBody'),
      comparisonNote: $('comparisonNote')
    };

    if (!refs.langBtn) {
      return;
    }

    const resultKeys = [
      'subscriptionCost',
      'processorFees',
      'overageFee',
      'takeHomeAfterPlatform',
      'netProfit',
      'monthlyNetProfit',
      'breakEvenGrossSales',
      'nextPlanBreakEvenSales',
      'refundLoss',
      'averageOrderValue',
      'deliveryCostTotal',
      'effectiveSellfyCostRatePct',
      'effectiveProcessorCostRatePct',
      'capHeadroom',
      'capUsageRatePct',
      'processorPercentFee',
      'processorFlatFee'
    ];

    resultKeys.forEach((key) => {
      refs[key] = $(key);
    });

    let lang = 'en';

    function t(key) {
      return UI_TEXT[lang][key] || key;
    }

    function populateSelects() {
      const currentPlan = refs.planId.value || DEFAULTS.planId;
      refs.planId.innerHTML = PLANS.map((plan) => `<option value="${plan.id}">${plan.label[lang] || plan.label.en}</option>`).join('');
      refs.planId.value = currentPlan;

      const currentProcessor = refs.processorId.value || DEFAULTS.processorId;
      refs.processorId.innerHTML = PROCESSORS.map((processor) => `<option value="${processor.id}">${processor.label[lang] || processor.label.en}</option>`).join('');
      refs.processorId.value = currentProcessor;

      const currentBilling = refs.billingCycle.value || DEFAULTS.billingCycle;
      refs.billingCycle.innerHTML = [
        `<option value="annual">${t('annual')}</option>`,
        `<option value="monthly">${t('monthly')}</option>`
      ].join('');
      refs.billingCycle.value = currentBilling;
    }

    function applyLabels() {
      document.documentElement.lang = lang;
      refs.langBtn.textContent = lang === 'en' ? 'KR' : 'EN';
      refs.backLink.textContent = t('back');
      refs.title.textContent = t('title');
      refs.subtitle.textContent = t('subtitle');
      refs.disclaimer.textContent = t('disclaimer');
      refs.inputHeader.textContent = t('inputHeader');
      refs.resultHeader.textContent = t('resultHeader');
      refs.detailHeader.textContent = t('detailHeader');
      refs.compareHeader.textContent = t('compareHeader');
      refs.summaryHeader.textContent = t('summaryHeader');
      refs.copyBtn.textContent = t('copy');
      refs.resetBtn.textContent = t('reset');
      refs.comparisonNote.textContent = t('costOnly');

      [
        'planId',
        'billingCycle',
        'annualGrossSales',
        'ordersPerYear',
        'refundRatePct',
        'deliveryCostPerOrder',
        'otherAnnualCost',
        'processorId',
        'processorRatePct',
        'processorFlat'
      ].forEach((id) => {
        const label = $('l_' + id);
        if (label) {
          label.textContent = t('l_' + id);
        }
      });

      [
        'subscriptionCost',
        'processorFees',
        'overageFee',
        'takeHomeAfterPlatform',
        'netProfit',
        'monthlyNetProfit',
        'breakEvenGrossSales',
        'nextPlanBreakEvenSales',
        'refundLoss',
        'averageOrderValue',
        'deliveryCostTotal',
        'effectiveSellfyCostRatePct',
        'effectiveProcessorCostRatePct',
        'capHeadroom',
        'capUsageRatePct',
        'processorPercentFee',
        'processorFlatFee'
      ].forEach((id) => {
        const label = $('k_' + id) || $('d_' + id);
        if (label) {
          const prefix = $('k_' + id) ? 'k_' : 'd_';
          label.textContent = t(prefix + id);
        }
      });

      $('comparePlan').textContent = t('comparePlan');
      $('compareCap').textContent = t('compareCap');
      $('compareSubscription').textContent = t('compareSubscription');
      $('compareOverage').textContent = t('compareOverage');
      $('compareNet').textContent = t('compareNet');
      $('compareRecommended').textContent = t('compareRecommended');
      populateSelects();
    }

    function money(value) {
      return formatMoney(value, lang);
    }

    function pct(value) {
      return formatPercent(value, lang);
    }

    function syncProcessorPreset(force) {
      const processor = processorMap[refs.processorId.value] || processorMap.stripe;
      const isCustom = processor.id === 'custom';
      refs.processorCustomWrap.classList.toggle('hidden', !isCustom);
      refs.processorRatePct.disabled = !isCustom;
      refs.processorFlat.disabled = !isCustom;
      if (!isCustom || force) {
        refs.processorRatePct.value = processor.ratePct;
        refs.processorFlat.value = processor.flat.toFixed(2);
      }
    }

    function readValues() {
      return {
        planId: refs.planId.value,
        billingCycle: refs.billingCycle.value,
        annualGrossSales: Number(refs.annualGrossSales.value),
        ordersPerYear: Number(refs.ordersPerYear.value),
        refundRatePct: Number(refs.refundRatePct.value),
        deliveryCostPerOrder: Number(refs.deliveryCostPerOrder.value),
        otherAnnualCost: Number(refs.otherAnnualCost.value),
        processorId: refs.processorId.value,
        processorRatePct: Number(refs.processorRatePct.value),
        processorFlat: Number(refs.processorFlat.value)
      };
    }

    function setDefaults() {
      refs.planId.value = DEFAULTS.planId;
      refs.billingCycle.value = DEFAULTS.billingCycle;
      refs.annualGrossSales.value = DEFAULTS.annualGrossSales;
      refs.ordersPerYear.value = DEFAULTS.ordersPerYear;
      refs.refundRatePct.value = DEFAULTS.refundRatePct;
      refs.deliveryCostPerOrder.value = DEFAULTS.deliveryCostPerOrder;
      refs.otherAnnualCost.value = DEFAULTS.otherAnnualCost;
      refs.processorId.value = DEFAULTS.processorId;
      refs.processorRatePct.value = DEFAULTS.processorRatePct;
      refs.processorFlat.value = DEFAULTS.processorFlat.toFixed(2);
      syncProcessorPreset(true);
    }

    function renderComparison(result) {
      refs.comparisonBody.innerHTML = result.comparison.rows.map((row) => {
        const isRecommended = row.planId === result.recommendedPlanId;
        const rec = isRecommended ? t('recommendedYes') : t('recommendedNo');
        return `<tr${isRecommended ? ' class="recommended"' : ''}>
          <td>${row.planLabel[lang] || row.planLabel.en}</td>
          <td>${money(row.cap)}</td>
          <td>${money(row.subscriptionCost)}</td>
          <td>${money(row.overageFee)}</td>
          <td>${money(row.netProfit)}</td>
          <td>${rec}</td>
        </tr>`;
      }).join('');
    }

    function render() {
      syncProcessorPreset(false);
      const { result, error } = calculate(readValues(), { lang });
      refs.error.classList.toggle('show', Boolean(error));
      refs.error.textContent = error;

      if (error) {
        refs.status.textContent = t('invalid');
        refs.summary.value = '';
        resultKeys.forEach((key) => {
          if (refs[key]) {
            refs[key].textContent = '—';
          }
        });
        refs.comparisonBody.innerHTML = '';
        return;
      }

      refs.status.textContent = result.netProfit >= 0 ? t('statusGood') : t('statusWarn');
      refs.subscriptionCost.textContent = money(result.subscriptionCost);
      refs.processorFees.textContent = money(result.processorFees);
      refs.overageFee.textContent = money(result.overageFee);
      refs.takeHomeAfterPlatform.textContent = money(result.takeHomeAfterPlatform);
      refs.netProfit.textContent = money(result.netProfit);
      refs.monthlyNetProfit.textContent = money(result.monthlyNetProfit);
      refs.breakEvenGrossSales.textContent = result.breakEvenGrossSales == null ? t('na') : money(result.breakEvenGrossSales);
      refs.nextPlanBreakEvenSales.textContent = result.nextPlanBreakEvenSales == null ? t('noNextPlan') : money(result.nextPlanBreakEvenSales);
      refs.refundLoss.textContent = money(result.refundLoss);
      refs.averageOrderValue.textContent = money(result.averageOrderValue);
      refs.deliveryCostTotal.textContent = money(result.deliveryCostTotal);
      refs.effectiveSellfyCostRatePct.textContent = pct(result.effectiveSellfyCostRatePct);
      refs.effectiveProcessorCostRatePct.textContent = pct(result.effectiveProcessorCostRatePct);
      refs.capHeadroom.textContent = `${result.capHeadroom >= 0 ? t('capPositive') : t('capNegative')}: ${money(Math.abs(result.capHeadroom))}`;
      refs.capUsageRatePct.textContent = pct(result.capUsageRatePct);
      refs.processorPercentFee.textContent = money(result.processorPercentFee);
      refs.processorFlatFee.textContent = money(result.processorFlatFee);
      refs.summary.value = result.summary;
      renderComparison(result);
    }

    refs.langBtn.addEventListener('click', () => {
      lang = lang === 'en' ? 'ko' : 'en';
      applyLabels();
      render();
    });

    refs.processorId.addEventListener('change', () => {
      syncProcessorPreset(true);
      render();
    });

    [
      refs.planId,
      refs.billingCycle,
      refs.annualGrossSales,
      refs.ordersPerYear,
      refs.refundRatePct,
      refs.deliveryCostPerOrder,
      refs.otherAnnualCost,
      refs.processorRatePct,
      refs.processorFlat
    ].forEach((element) => {
      element.addEventListener('input', render);
      element.addEventListener('change', render);
    });

    refs.copyBtn.addEventListener('click', async () => {
      if (!refs.summary.value.trim()) {
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.textContent = TEXT[lang].copied;
      } catch (error) {
        refs.status.textContent = TEXT[lang].copyFail;
      }
    });

    refs.resetBtn.addEventListener('click', () => {
      setDefaults();
      render();
    });

    applyLabels();
    setDefaults();
    refs.status.textContent = t('waiting');
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
