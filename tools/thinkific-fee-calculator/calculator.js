(function (root) {
  const CONSTANTS = Object.freeze({
    SALES_CAP_USD: 1000000,
    SUBSCRIPTION_SURCHARGE_PCT: 0.7,
    SALES_TAX_VAT_SOLUTION_PCT: 0.5,
    MONTHS_IN_YEAR: 12,
    CURRENCY: 'USD'
  });

  const PLAN_PRESETS = Object.freeze({
    basic: Object.freeze({
      id: 'basic',
      label: { en: 'Basic', ko: 'Basic' },
      monthlyCost: 49,
      annualMonthlyEquivalent: 36,
      thirdPartyGatewayRatePct: 5
    }),
    start: Object.freeze({
      id: 'start',
      label: { en: 'Start', ko: 'Start' },
      monthlyCost: 99,
      annualMonthlyEquivalent: 74,
      thirdPartyGatewayRatePct: 2
    }),
    grow: Object.freeze({
      id: 'grow',
      label: { en: 'Grow', ko: 'Grow' },
      monthlyCost: 199,
      annualMonthlyEquivalent: 149,
      thirdPartyGatewayRatePct: 1
    })
  });

  const PROCESSOR_PRESETS = Object.freeze({
    'us-card': Object.freeze({
      id: 'us-card',
      variableRatePct: 2.9,
      fixedFee: 0.30,
      label: { en: 'US card · 2.9% + $0.30', ko: '미국 카드 · 2.9% + $0.30' }
    }),
    'uk-card': Object.freeze({
      id: 'uk-card',
      variableRatePct: 1.7,
      fixedFee: 0.20,
      label: { en: 'UK card · 1.7% + £0.20', ko: '영국 카드 · 1.7% + £0.20' }
    }),
    'eea-card': Object.freeze({
      id: 'eea-card',
      variableRatePct: 1.7,
      fixedFee: 0.25,
      label: { en: 'EEA card · 1.7% + €0.25', ko: 'EEA 카드 · 1.7% + €0.25' }
    }),
    custom: Object.freeze({
      id: 'custom',
      variableRatePct: null,
      fixedFee: null,
      label: { en: 'Custom processor', ko: '커스텀 프로세서' }
    })
  });

  const DEFAULTS = Object.freeze({
    planTier: 'basic',
    billingMode: 'monthly',
    ordersPerMonth: 40,
    averageOrderValue: 150,
    paymentSetup: 'third-party-gateway',
    processorPreset: 'us-card',
    processingVariableRatePct: 2.9,
    processingFixedFee: 0.30,
    isSubscriptionOrPaymentPlan: false,
    applySalesTaxVatSolutionFee: false,
    refundRatePct: 3,
    yearToDateThirdPartySales: 0,
    otherMonthlyCosts: 300,
    desiredMonthlyNetProfit: 4000
  });

  const TEXT = Object.freeze({
    en: Object.freeze({
      invalid: 'Please review your inputs.',
      planTier: 'Choose a valid Thinkific plan tier.',
      billingMode: 'Billing mode must be monthly or annual.',
      ordersPerMonth: 'Orders per month must be a whole number greater than zero.',
      averageOrderValue: 'Average order value must be greater than zero.',
      paymentSetup: 'Payment setup must be Thinkific Payments or third-party gateway.',
      processorPreset: 'Choose a valid processor preset.',
      processingVariableRatePct: 'Processing variable rate must be 0 or above and below 100.',
      processingFixedFee: 'Processing fixed fee must be 0 or above.',
      refundRatePct: 'Refund rate must be 0 or above and below 100.',
      yearToDateThirdPartySales: 'Year-to-date third-party sales must be 0 or above.',
      otherMonthlyCosts: 'Other monthly costs must be 0 or above.',
      desiredMonthlyNetProfit: 'Desired monthly net profit must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter assumptions to compare Thinkific take-home.',
      statusGood: 'The selected Thinkific setup stays profitable under these assumptions.',
      statusWarn: 'The selected Thinkific setup is underwater. Re-check price, refunds, or fee structure.',
      summaryTitle: '[Thinkific Fee Calculator Summary]',
      na: 'N/A',
      paymentSetupLabels: {
        'thinkific-payments': 'Thinkific Payments',
        'third-party-gateway': 'Third-party gateway'
      },
      billingModeLabels: {
        monthly: 'Monthly',
        annual: 'Annual monthly-equivalent'
      }
    }),
    ko: Object.freeze({
      invalid: '입력값을 확인해주세요.',
      planTier: '올바른 Thinkific 플랜을 선택해주세요.',
      billingMode: '과금 방식은 monthly 또는 annual 이어야 합니다.',
      ordersPerMonth: '월 주문 수는 1 이상의 정수여야 합니다.',
      averageOrderValue: '평균 주문 금액은 0보다 커야 합니다.',
      paymentSetup: '결제 방식은 Thinkific Payments 또는 third-party gateway 여야 합니다.',
      processorPreset: '올바른 프로세서 프리셋을 선택해주세요.',
      processingVariableRatePct: '변동 수수료율은 0 이상 100 미만이어야 합니다.',
      processingFixedFee: '고정 수수료는 0 이상이어야 합니다.',
      refundRatePct: '환불률은 0 이상 100 미만이어야 합니다.',
      yearToDateThirdPartySales: '연간 누적 third-party 매출은 0 이상이어야 합니다.',
      otherMonthlyCosts: '기타 월 비용은 0 이상이어야 합니다.',
      desiredMonthlyNetProfit: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '가정을 입력하면 Thinkific 실수령 비교가 표시됩니다.',
      statusGood: '현재 가정에서는 선택한 Thinkific 설정이 흑자입니다.',
      statusWarn: '현재 가정에서는 적자입니다. 가격, 환불률, 수수료 구조를 다시 확인하세요.',
      summaryTitle: '[Thinkific 수수료 계산기 요약]',
      na: '해당 없음',
      paymentSetupLabels: {
        'thinkific-payments': 'Thinkific Payments',
        'third-party-gateway': '서드파티 게이트웨이'
      },
      billingModeLabels: {
        monthly: '월 결제',
        annual: '연 결제 월환산'
      }
    })
  });

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
    const source = input || {};
    return {
      planTier: source.planTier || DEFAULTS.planTier,
      billingMode: source.billingMode || DEFAULTS.billingMode,
      ordersPerMonth: Number(source.ordersPerMonth),
      averageOrderValue: Number(source.averageOrderValue),
      paymentSetup: source.paymentSetup || DEFAULTS.paymentSetup,
      processorPreset: source.processorPreset || DEFAULTS.processorPreset,
      processingVariableRatePct: Number(source.processingVariableRatePct),
      processingFixedFee: Number(source.processingFixedFee),
      isSubscriptionOrPaymentPlan: toBoolean(source.isSubscriptionOrPaymentPlan),
      applySalesTaxVatSolutionFee: toBoolean(source.applySalesTaxVatSolutionFee),
      refundRatePct: Number(source.refundRatePct),
      yearToDateThirdPartySales: Number(source.yearToDateThirdPartySales),
      otherMonthlyCosts: Number(source.otherMonthlyCosts),
      desiredMonthlyNetProfit: Number(source.desiredMonthlyNetProfit)
    };
  }

  function toBoolean(value) {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
  }

  function getPlan(planTier) {
    return PLAN_PRESETS[planTier] || null;
  }

  function getProcessorPreset(presetId) {
    return PROCESSOR_PRESETS[presetId] || null;
  }

  function resolvePlanMonthlyCost(planTier, billingMode) {
    const plan = getPlan(planTier);
    if (!plan) {
      return null;
    }
    return billingMode === 'annual' ? plan.annualMonthlyEquivalent : plan.monthlyCost;
  }

  function resolveProcessorConfig(input) {
    const preset = getProcessorPreset(input.processorPreset);
    if (!preset) {
      return null;
    }

    if (preset.id === 'custom') {
      return {
        id: preset.id,
        variableRatePct: input.processingVariableRatePct,
        fixedFee: input.processingFixedFee,
        label: preset.label
      };
    }

    return {
      id: preset.id,
      variableRatePct: preset.variableRatePct,
      fixedFee: preset.fixedFee,
      label: preset.label
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!getPlan(input.planTier)) return t.planTier;
    if (!['monthly', 'annual'].includes(input.billingMode)) return t.billingMode;
    if (!Number.isFinite(input.ordersPerMonth) || input.ordersPerMonth <= 0 || !Number.isInteger(input.ordersPerMonth)) return t.ordersPerMonth;
    if (!Number.isFinite(input.averageOrderValue) || input.averageOrderValue <= 0) return t.averageOrderValue;
    if (!['thinkific-payments', 'third-party-gateway'].includes(input.paymentSetup)) return t.paymentSetup;
    if (!getProcessorPreset(input.processorPreset)) return t.processorPreset;
    if (!Number.isFinite(input.processingVariableRatePct) || input.processingVariableRatePct < 0 || input.processingVariableRatePct >= 100) return t.processingVariableRatePct;
    if (!Number.isFinite(input.processingFixedFee) || input.processingFixedFee < 0) return t.processingFixedFee;
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) return t.refundRatePct;
    if (!Number.isFinite(input.yearToDateThirdPartySales) || input.yearToDateThirdPartySales < 0) return t.yearToDateThirdPartySales;
    if (!Number.isFinite(input.otherMonthlyCosts) || input.otherMonthlyCosts < 0) return t.otherMonthlyCosts;
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) return t.desiredMonthlyNetProfit;

    const processor = resolveProcessorConfig(input);
    if (!processor) return t.processorPreset;
    if (!Number.isFinite(processor.variableRatePct) || processor.variableRatePct < 0 || processor.variableRatePct >= 100) return t.processingVariableRatePct;
    if (!Number.isFinite(processor.fixedFee) || processor.fixedFee < 0) return t.processingFixedFee;

    return '';
  }

  function computeThirdPartyGatewayFee(input, monthlyGrossSales, plan) {
    const remainingCapBeforeCurrentMonth = Math.max(0, CONSTANTS.SALES_CAP_USD - input.yearToDateThirdPartySales);

    if (input.paymentSetup !== 'third-party-gateway') {
      return {
        remainingCapBeforeCurrentMonth: round2(remainingCapBeforeCurrentMonth),
        feeExposedGross: 0,
        remainingCapAfterCurrentMonth: round2(remainingCapBeforeCurrentMonth),
        thirdPartyGatewayRatePctApplied: 0,
        thirdPartyGatewayFee: 0,
        marginalGatewayRatePct: 0
      };
    }

    const feeExposedGross = Math.min(monthlyGrossSales, remainingCapBeforeCurrentMonth);
    const thirdPartyGatewayRatePctApplied = plan.thirdPartyGatewayRatePct;
    const thirdPartyGatewayFee = feeExposedGross * (thirdPartyGatewayRatePctApplied / 100);
    const remainingCapAfterCurrentMonth = Math.max(0, remainingCapBeforeCurrentMonth - monthlyGrossSales);
    const marginalGatewayRatePct = remainingCapBeforeCurrentMonth > 0 ? thirdPartyGatewayRatePctApplied : 0;

    return {
      remainingCapBeforeCurrentMonth: round2(remainingCapBeforeCurrentMonth),
      feeExposedGross: round2(feeExposedGross),
      remainingCapAfterCurrentMonth: round2(remainingCapAfterCurrentMonth),
      thirdPartyGatewayRatePctApplied,
      thirdPartyGatewayFee: round2(thirdPartyGatewayFee),
      marginalGatewayRatePct
    };
  }

  function evaluateScenario(input, overrides) {
    const scenario = normalizeInput({ ...input, ...(overrides || {}) });
    const plan = getPlan(scenario.planTier);
    const processor = resolveProcessorConfig(scenario);

    if (!plan || !processor) {
      return null;
    }

    const monthlyGrossSales = round2(scenario.ordersPerMonth * scenario.averageOrderValue);
    const refundRate = scenario.refundRatePct / 100;
    const refundLoss = round2(monthlyGrossSales * refundRate);
    const selectedPlanCost = round2(resolvePlanMonthlyCost(scenario.planTier, scenario.billingMode));
    const subscriptionSurchargePct = scenario.paymentSetup === 'thinkific-payments' && scenario.isSubscriptionOrPaymentPlan
      ? CONSTANTS.SUBSCRIPTION_SURCHARGE_PCT
      : 0;
    const salesTaxVatSurchargePct = scenario.applySalesTaxVatSolutionFee
      ? CONSTANTS.SALES_TAX_VAT_SOLUTION_PCT
      : 0;
    const effectiveProcessingVariableRatePct = round4(
      processor.variableRatePct + subscriptionSurchargePct + salesTaxVatSurchargePct
    );
    const processingFixedFeeTotal = round2(scenario.ordersPerMonth * processor.fixedFee);
    const processingVariableFees = round2(monthlyGrossSales * (effectiveProcessingVariableRatePct / 100));
    const processingFees = round2(processingVariableFees + processingFixedFeeTotal);

    const gateway = computeThirdPartyGatewayFee(scenario, monthlyGrossSales, plan);
    const takeHomeAfterPlatformAndPayments = round2(
      monthlyGrossSales - refundLoss - selectedPlanCost - gateway.thirdPartyGatewayFee - processingFees
    );
    const monthlyNetProfit = round2(takeHomeAfterPlatformAndPayments - scenario.otherMonthlyCosts);
    const annualizedNetProfit = round2(monthlyNetProfit * CONSTANTS.MONTHS_IN_YEAR);
    const platformAndPaymentDrag = round2(refundLoss + selectedPlanCost + gateway.thirdPartyGatewayFee + processingFees);
    const effectiveTakeRatePct = monthlyGrossSales > 0
      ? round4((platformAndPaymentDrag / monthlyGrossSales) * 100)
      : 0;
    const contributionPerOrder = round4(
      scenario.averageOrderValue * (
        1 - refundRate - (effectiveProcessingVariableRatePct / 100) - (gateway.marginalGatewayRatePct / 100)
      ) - processor.fixedFee
    );

    const breakEvenOrders = contributionPerOrder > 0
      ? Math.ceil((selectedPlanCost + scenario.otherMonthlyCosts) / contributionPerOrder)
      : null;

    const requiredOrdersForTargetNet = contributionPerOrder > 0
      ? Math.ceil((selectedPlanCost + scenario.otherMonthlyCosts + scenario.desiredMonthlyNetProfit) / contributionPerOrder)
      : null;

    return {
      inputs: scenario,
      plan,
      processor,
      monthlyGrossSales,
      refundLoss,
      selectedPlanCost,
      subscriptionSurchargePct,
      salesTaxVatSurchargePct,
      effectiveProcessingVariableRatePct,
      processingFixedFeeTotal,
      processingVariableFees,
      processingFees,
      feeExposedGross: gateway.feeExposedGross,
      remainingCapBeforeCurrentMonth: gateway.remainingCapBeforeCurrentMonth,
      remainingCapAfterCurrentMonth: gateway.remainingCapAfterCurrentMonth,
      thirdPartyGatewayRatePctApplied: gateway.thirdPartyGatewayRatePctApplied,
      thirdPartyGatewayFee: gateway.thirdPartyGatewayFee,
      takeHomeAfterPlatformAndPayments,
      monthlyNetProfit,
      annualizedNetProfit,
      platformAndPaymentDrag,
      effectiveTakeRatePct,
      contributionPerOrder,
      breakEvenOrders,
      requiredOrdersForTargetNet,
      targetOrderGap: requiredOrdersForTargetNet == null ? null : requiredOrdersForTargetNet - scenario.ordersPerMonth
    };
  }

  function buildComparisonRows(input) {
    return Object.keys(PLAN_PRESETS).map(function (planTier) {
      const scenario = evaluateScenario(input, { planTier: planTier });
      return {
        planId: planTier,
        planLabel: scenario.plan.label,
        planCost: scenario.selectedPlanCost,
        extraGatewayRatePct: scenario.inputs.paymentSetup === 'third-party-gateway'
          ? scenario.plan.thirdPartyGatewayRatePct
          : 0,
        processingFees: scenario.processingFees,
        thirdPartyGatewayFee: scenario.thirdPartyGatewayFee,
        takeHomeAfterPlatformAndPayments: scenario.takeHomeAfterPlatformAndPayments,
        monthlyNetProfit: scenario.monthlyNetProfit,
        effectiveTakeRatePct: scenario.effectiveTakeRatePct
      };
    });
  }

  function findGrossThreshold(fromPlanTier, toPlanTier, billingMode, paymentSetup) {
    if (paymentSetup !== 'third-party-gateway') {
      return null;
    }

    const fromPlan = getPlan(fromPlanTier);
    const toPlan = getPlan(toPlanTier);
    if (!fromPlan || !toPlan) {
      return null;
    }

    const fixedDiff = resolvePlanMonthlyCost(toPlanTier, billingMode) - resolvePlanMonthlyCost(fromPlanTier, billingMode);
    const rateDiff = (fromPlan.thirdPartyGatewayRatePct - toPlan.thirdPartyGatewayRatePct) / 100;
    if (!Number.isFinite(rateDiff) || rateDiff <= 0) {
      return null;
    }
    return round2(fixedDiff / rateDiff);
  }

  function recommendPlan(comparisonRows) {
    return comparisonRows.reduce(function (best, row) {
      if (!best || row.monthlyNetProfit > best.monthlyNetProfit) {
        return row;
      }
      return best;
    }, null);
  }

  function buildRecommendationReason(selected, recommended, thresholds, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    const recommendedName = recommended.planLabel[lang] || recommended.planLabel.en;
    const selectedName = selected.plan.label[lang] || selected.plan.label.en;

    if (recommended.planId === selected.inputs.planTier) {
      return lang === 'ko'
        ? `${selectedName} 플랜이 현재 가정에서 가장 높은 월 순이익을 만듭니다.`
        : `${recommendedName} delivers the highest monthly net profit under the current assumptions.`;
    }

    if (selected.inputs.paymentSetup === 'third-party-gateway') {
      const threshold = recommended.planId === 'start'
        ? thresholds.basicToStartGrossThreshold
        : recommended.planId === 'grow'
          ? thresholds.startToGrowGrossThreshold
          : null;

      if (threshold != null) {
        return lang === 'ko'
          ? `${recommendedName} 플랜이 더 높은 월요금에도 불구하고 낮은 third-party gateway fee 덕분에 유리합니다. 현재 월매출 ${formatMoney(selected.monthlyGrossSales, locale)} 이(가) 임계값 ${formatMoney(threshold, locale)} 을 넘었습니다.`
          : `${recommendedName} wins because its lower third-party gateway fee outweighs the higher fixed plan cost. Current monthly gross ${formatMoney(selected.monthlyGrossSales, locale)} is above the ${formatMoney(threshold, locale)} threshold.`;
      }
    }

    return lang === 'ko'
      ? `${recommendedName} 플랜이 ${selectedName} 보다 높은 월 순이익을 만듭니다.`
      : `${recommendedName} produces higher monthly net profit than ${selectedName} under the same assumptions.`;
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    const selectedPlanName = result.plan.label[lang] || result.plan.label.en;
    const paymentSetupLabel = t.paymentSetupLabels[result.inputs.paymentSetup];
    const billingModeLabel = t.billingModeLabels[result.inputs.billingMode];
    const targetOrders = result.requiredOrdersForTargetNet == null ? t.na : String(result.requiredOrdersForTargetNet);
    const breakEvenOrders = result.breakEvenOrders == null ? t.na : String(result.breakEvenOrders);
    const thresholdLine = result.thresholds.basicToStartGrossThreshold == null
      ? (lang === 'ko'
        ? '업그레이드 임계값: Thinkific Payments 사용 시 추가 third-party gateway fee가 없어 gross-threshold 비교가 비활성화됩니다.'
        : 'Upgrade thresholds: Thinkific Payments removes the extra third-party gateway fee, so gross-threshold comparisons are disabled.')
      : (lang === 'ko'
        ? `업그레이드 임계값: Basic→Start ${formatMoney(result.thresholds.basicToStartGrossThreshold, locale)}, Start→Grow ${formatMoney(result.thresholds.startToGrowGrossThreshold, locale)}`
        : `Upgrade thresholds: Basic→Start ${formatMoney(result.thresholds.basicToStartGrossThreshold, locale)}, Start→Grow ${formatMoney(result.thresholds.startToGrowGrossThreshold, locale)}`);

    return [
      t.summaryTitle,
      `Plan: ${selectedPlanName} (${billingModeLabel})`,
      `Monthly gross sales: ${formatMoney(result.monthlyGrossSales, locale)}`,
      `Payment setup: ${paymentSetupLabel}`,
      `Processor assumption: ${result.processor.label[lang] || result.processor.label.en}`,
      `Effective processing variable rate: ${formatPercent(result.effectiveProcessingVariableRatePct, locale)}`,
      `Processing fixed-fee total: ${formatMoney(result.processingFixedFeeTotal, locale)}`,
      `Extra Thinkific gateway fee: ${formatMoney(result.thirdPartyGatewayFee, locale)}`,
      `Fee-exposed gross before $1,000,000 cap: ${formatMoney(result.feeExposedGross, locale)}`,
      `Monthly net profit: ${formatMoney(result.monthlyNetProfit, locale)}`,
      `Break-even orders: ${breakEvenOrders}`,
      `Required orders for target net: ${targetOrders}`,
      `Remaining third-party cap after current month: ${formatMoney(result.remainingCapAfterCurrentMonth, locale)}`,
      thresholdLine,
      `Recommendation: ${result.recommendedPlanLabel[lang] || result.recommendedPlanLabel.en}`,
      `Reason: ${result.recommendationReason}`
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error: error };
    }

    const selected = evaluateScenario(normalized);
    const comparisonRows = buildComparisonRows(normalized);
    const recommended = recommendPlan(comparisonRows);
    const thresholds = {
      basicToStartGrossThreshold: findGrossThreshold('basic', 'start', selected.inputs.billingMode, selected.inputs.paymentSetup),
      startToGrowGrossThreshold: findGrossThreshold('start', 'grow', selected.inputs.billingMode, selected.inputs.paymentSetup)
    };

    const result = {
      ...selected,
      comparisonRows: comparisonRows,
      thresholds: thresholds,
      recommendedPlanId: recommended.planId,
      recommendedPlanLabel: recommended.planLabel
    };

    result.recommendationReason = buildRecommendationReason(selected, recommended, thresholds, lang);
    result.status = result.monthlyNetProfit >= 0
      ? (TEXT[lang] || TEXT.en).statusGood
      : (TEXT[lang] || TEXT.en).statusWarn;
    result.summary = buildSummary(result, lang);

    return { result: result, error: '' };
  }

  function formatMoney(value, locale) {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: CONSTANTS.CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, locale) {
    return new Intl.NumberFormat(locale || 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%';
  }

  const api = {
    CONSTANTS: CONSTANTS,
    PLAN_PRESETS: PLAN_PRESETS,
    PROCESSOR_PRESETS: PROCESSOR_PRESETS,
    DEFAULTS: DEFAULTS,
    normalizeInput: normalizeInput,
    validate: validate,
    getPlan: getPlan,
    getProcessorPreset: getProcessorPreset,
    resolvePlanMonthlyCost: resolvePlanMonthlyCost,
    resolveProcessorConfig: resolveProcessorConfig,
    computeThirdPartyGatewayFee: computeThirdPartyGatewayFee,
    evaluateScenario: evaluateScenario,
    buildComparisonRows: buildComparisonRows,
    findGrossThreshold: findGrossThreshold,
    recommendPlan: recommendPlan,
    calculate: calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.ThinkificFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const fieldIds = [
    'planTier',
    'billingMode',
    'ordersPerMonth',
    'averageOrderValue',
    'paymentSetup',
    'processorPreset',
    'processingVariableRatePct',
    'processingFixedFee',
    'refundRatePct',
    'yearToDateThirdPartySales',
    'otherMonthlyCosts',
    'desiredMonthlyNetProfit'
  ];

  const checkboxIds = [
    'isSubscriptionOrPaymentPlan',
    'applySalesTaxVatSolutionFee'
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function readForm() {
    const payload = {};
    fieldIds.forEach(function (id) {
      payload[id] = $(id).value;
    });
    checkboxIds.forEach(function (id) {
      payload[id] = $(id).checked;
    });
    return payload;
  }

  function fillDefaults() {
    fieldIds.forEach(function (id) {
      const el = $(id);
      el.value = DEFAULTS[id];
    });
    checkboxIds.forEach(function (id) {
      $(id).checked = DEFAULTS[id];
    });
    syncProcessorFields();
  }

  function syncProcessorFields() {
    const presetId = $('processorPreset').value;
    const preset = getProcessorPreset(presetId);
    const variableField = $('processingVariableRatePct');
    const fixedField = $('processingFixedFee');
    const paymentSetup = $('paymentSetup').value;
    const processorHint = $('processorHint');

    if (preset && preset.id !== 'custom') {
      variableField.value = preset.variableRatePct;
      fixedField.value = preset.fixedFee;
      variableField.disabled = true;
      fixedField.disabled = true;
    } else {
      variableField.disabled = false;
      fixedField.disabled = false;
    }

    if (paymentSetup === 'thinkific-payments') {
      processorHint.textContent = 'Thinkific Payments removes the extra third-party gateway fee. Subscription (+0.7%) only applies in this mode.';
    } else {
      processorHint.textContent = 'Third-party gateway mode adds the plan-specific Thinkific fee until the first $1,000,000 of annual sales is exhausted.';
    }
  }

  function renderDetails(result) {
    $('selectedPlanCostValue').textContent = formatMoney(result.selectedPlanCost);
    $('selectedProcessorValue').textContent = result.processor.label.en;
    $('effectiveProcessingRateValue').textContent = formatPercent(result.effectiveProcessingVariableRatePct);
    $('processingFixedFeeTotalValue').textContent = formatMoney(result.processingFixedFeeTotal);
    $('gatewayFeeValue').textContent = formatMoney(result.thirdPartyGatewayFee);
    $('refundLossValue').textContent = formatMoney(result.refundLoss);
    $('remainingCapValue').textContent = formatMoney(result.remainingCapAfterCurrentMonth);
    $('annualizedNetValue').textContent = formatMoney(result.annualizedNetProfit);
    $('targetOrderGapValue').textContent = result.targetOrderGap == null ? 'N/A' : String(result.targetOrderGap);
  }

  function renderComparisonTable(result) {
    const body = $('comparisonTableBody');
    body.innerHTML = '';

    result.comparisonRows.forEach(function (row) {
      const tr = document.createElement('tr');
      if (row.planId === result.recommendedPlanId) {
        tr.className = 'best-row';
      }
      tr.innerHTML = [
        '<td>' + (row.planLabel.en || row.planId) + '</td>',
        '<td>' + formatMoney(row.planCost) + '</td>',
        '<td>' + formatPercent(row.extraGatewayRatePct) + '</td>',
        '<td>' + formatMoney(row.processingFees) + '</td>',
        '<td>' + formatMoney(row.thirdPartyGatewayFee) + '</td>',
        '<td>' + formatMoney(row.takeHomeAfterPlatformAndPayments) + '</td>',
        '<td>' + formatMoney(row.monthlyNetProfit) + '</td>'
      ].join('');
      body.appendChild(tr);
    });
  }

  function setError(message) {
    const box = $('errorBox');
    if (message) {
      box.textContent = message;
      box.classList.add('show');
    } else {
      box.textContent = '';
      box.classList.remove('show');
    }
  }

  function renderThresholds(result) {
    const thresholdText = result.thresholds.basicToStartGrossThreshold == null
      ? 'Thinkific Payments removes the extra gateway fee, so gross upgrade thresholds are not applicable.'
      : 'Basic → Start ' + formatMoney(result.thresholds.basicToStartGrossThreshold) + ' · Start → Grow ' + formatMoney(result.thresholds.startToGrowGrossThreshold);
    $('thresholdNote').textContent = thresholdText;
  }

  function render(result) {
    $('statusText').textContent = result.status;
    $('statusText').className = 'status ' + (result.monthlyNetProfit >= 0 ? 'good' : 'warn');
    $('monthlyGrossSalesValue').textContent = formatMoney(result.monthlyGrossSales);
    $('takeHomeValue').textContent = formatMoney(result.takeHomeAfterPlatformAndPayments);
    $('monthlyNetProfitValue').textContent = formatMoney(result.monthlyNetProfit);
    $('effectiveTakeRateValue').textContent = formatPercent(result.effectiveTakeRatePct);
    $('breakEvenOrdersValue').textContent = result.breakEvenOrders == null ? 'N/A' : String(result.breakEvenOrders);
    $('requiredOrdersValue').textContent = result.requiredOrdersForTargetNet == null ? 'N/A' : String(result.requiredOrdersForTargetNet);
    $('recommendationTitle').textContent = 'Recommended plan: ' + (result.recommendedPlanLabel.en || result.recommendedPlanId);
    $('recommendationBody').textContent = result.recommendationReason;
    $('summary').value = result.summary;

    renderDetails(result);
    renderThresholds(result);
    renderComparisonTable(result);
  }

  function runCalculation() {
    syncProcessorFields();
    const response = calculate(readForm(), { lang: 'en' });
    if (response.error) {
      setError(response.error);
      return;
    }
    setError('');
    render(response.result);
  }

  $('calculateButton').addEventListener('click', runCalculation);
  $('resetButton').addEventListener('click', function () {
    fillDefaults();
    runCalculation();
  });
  $('copyButton').addEventListener('click', async function () {
    const response = calculate(readForm(), { lang: 'en' });
    if (response.error) {
      setError(response.error);
      return;
    }
    try {
      await navigator.clipboard.writeText(response.result.summary);
      $('copyStatus').textContent = TEXT.en.copied;
    } catch (error) {
      $('copyStatus').textContent = TEXT.en.copyFail;
    }
  });

  fieldIds.concat(checkboxIds).forEach(function (id) {
    $(id).addEventListener('input', function () {
      $('copyStatus').textContent = '';
    });
    $(id).addEventListener('change', function () {
      if (id === 'paymentSetup' || id === 'processorPreset') {
        syncProcessorFields();
      }
      runCalculation();
    });
  });

  fillDefaults();
  $('statusText').textContent = TEXT.en.waiting;
  runCalculation();
}(typeof globalThis !== 'undefined' ? globalThis : this));
