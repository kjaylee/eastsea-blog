(function (root) {
  const YEARLY_DISCOUNT = 0.2;

  const PLANS = [
    {
      id: 'basic',
      monthlyFee: 29,
      transactionRatePct: 4,
      memberCap: 1000,
      label: { en: 'Basic', ko: 'Basic' }
    },
    {
      id: 'professional',
      monthlyFee: 49,
      transactionRatePct: 2,
      memberCap: 5000,
      label: { en: 'Professional', ko: 'Professional' }
    },
    {
      id: 'business',
      monthlyFee: 99,
      transactionRatePct: 0.9,
      memberCap: null,
      capLabel: { en: '10,000+ Members', ko: '10,000+ 멤버' },
      label: { en: 'Business', ko: 'Business' }
    },
    {
      id: 'established',
      monthlyFee: 499,
      transactionRatePct: 0,
      memberCap: null,
      capLabel: { en: '10,000+ Members', ko: '10,000+ 멤버' },
      label: { en: 'Established', ko: 'Established' }
    }
  ];

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe-domestic',
      ratePct: 2.9,
      flatFee: 0.30,
      label: { en: 'Stripe domestic · 2.9% + $0.30', ko: 'Stripe 국내 카드 · 2.9% + $0.30' }
    },
    {
      id: 'custom',
      ratePct: null,
      flatFee: null,
      label: { en: 'Custom processor', ko: '커스텀 결제 수수료' }
    }
  ];

  const planMap = Object.fromEntries(PLANS.map((plan) => [plan.id, plan]));
  const processorPresetMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    billingMode: 'monthly',
    activeMembers: 1800,
    monthlyGrossSales: 6000,
    successfulCharges: 150,
    planId: 'professional',
    refundRatePct: 2,
    processorPreset: 'stripe-domestic',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.30,
    otherMonthlyCost: 400,
    desiredMonthlyNetProfit: 3000
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      invalidBillingMode: 'Unsupported billing mode.',
      invalidActiveMembers: 'Active members must be an integer greater than zero.',
      invalidGross: 'Monthly gross sales must be greater than zero.',
      invalidCharges: 'Successful charges must be an integer greater than zero.',
      invalidPlan: 'Unsupported Memberstack plan.',
      invalidRefund: 'Refund rate must be 0 or above and below 100%.',
      invalidPreset: 'Unsupported processor preset.',
      invalidCustomRate: 'Custom processor rate must be 0 or above and below 100%.',
      invalidCustomFlat: 'Custom processor flat fee must be 0 or above.',
      invalidOtherCost: 'Other monthly cost must be 0 or above.',
      invalidDesiredNet: 'Desired monthly net profit must be 0 or above.',
      summaryTitle: '[Memberstack Fee Calculator Summary]',
      waiting: 'Enter valid inputs to compare Memberstack take-home across plans.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      na: 'N/A',
      billingModeLabels: {
        monthly: 'Monthly',
        yearly: 'Yearly 20% OFF'
      },
      comparisonEligibilityEligible: 'Eligible',
      comparisonEligibilityOverCap: 'Over cap',
      comparisonEligibilityOpen: '10,000+',
      thresholdLabels: {
        'basic-to-professional': 'Basic → Professional',
        'professional-to-business': 'Professional → Business',
        'business-to-established': 'Business → Established'
      },
      note: 'Models Memberstack public pricing as Basic $29 / 4%, Professional $49 / 2%, Business $99 / 0.9%, Established $499 / 0%. Yearly mode uses a 20% discount monthly equivalent. Stripe domestic 2.9% + $0.30 is a planning default only.'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      invalidBillingMode: '지원하지 않는 과금 모드입니다.',
      invalidActiveMembers: '활성 멤버 수는 1 이상의 정수여야 합니다.',
      invalidGross: '월 총매출은 0보다 커야 합니다.',
      invalidCharges: '성공 결제 건수는 1 이상의 정수여야 합니다.',
      invalidPlan: '지원하지 않는 Memberstack 플랜입니다.',
      invalidRefund: '환불률은 0 이상 100 미만이어야 합니다.',
      invalidPreset: '지원하지 않는 결제 수수료 프리셋입니다.',
      invalidCustomRate: '커스텀 수수료율은 0 이상 100 미만이어야 합니다.',
      invalidCustomFlat: '커스텀 고정 수수료는 0 이상이어야 합니다.',
      invalidOtherCost: '기타 월 고정비는 0 이상이어야 합니다.',
      invalidDesiredNet: '목표 월 순이익은 0 이상이어야 합니다.',
      summaryTitle: '[Memberstack 수수료 계산기 요약]',
      waiting: '유효한 입력값을 넣으면 Memberstack 플랜별 실수령 비교가 표시됩니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      na: 'N/A',
      billingModeLabels: {
        monthly: '월간 결제',
        yearly: '연간 결제 (20% OFF 월환산)'
      },
      comparisonEligibilityEligible: '사용 가능',
      comparisonEligibilityOverCap: '멤버 수 초과',
      comparisonEligibilityOpen: '10,000+',
      thresholdLabels: {
        'basic-to-professional': 'Basic → Professional',
        'professional-to-business': 'Professional → Business',
        'business-to-established': 'Business → Established'
      },
      note: 'Memberstack 공개 요금 Basic $29 / 4%, Professional $49 / 2%, Business $99 / 0.9%, Established $499 / 0%를 기준으로 계산합니다. 연간 결제는 월환산 20% 할인 가정이며, Stripe 기본값 2.9% + $0.30은 planning용 기준치입니다.'
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
      billingMode: input.billingMode || DEFAULTS.billingMode,
      activeMembers: Number(input.activeMembers),
      monthlyGrossSales: Number(input.monthlyGrossSales),
      successfulCharges: Number(input.successfulCharges),
      planId: input.planId || DEFAULTS.planId,
      refundRatePct: Number(input.refundRatePct),
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: Number(input.customProcessorRatePct),
      customProcessorFlatFee: Number(input.customProcessorFlatFee),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlan(inputOrId) {
    const id = typeof inputOrId === 'string' ? inputOrId : inputOrId.planId;
    return planMap[id] || null;
  }

  function getProcessorPreset(inputOrId) {
    const id = typeof inputOrId === 'string' ? inputOrId : inputOrId.processorPreset;
    return processorPresetMap[id] || null;
  }

  function getBillingMultiplier(billingMode) {
    return billingMode === 'yearly' ? 1 - YEARLY_DISCOUNT : 1;
  }

  function getPlanMonthlyFee(planOrId, billingMode) {
    const plan = typeof planOrId === 'string' ? getPlan(planOrId) : planOrId;
    if (!plan) {
      return null;
    }
    return round2(plan.monthlyFee * getBillingMultiplier(billingMode));
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input);
    if (!preset) {
      return null;
    }

    if (preset.id === 'custom') {
      return {
        id: preset.id,
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

  function getCapStatus(plan, activeMembers, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(plan.memberCap) || plan.memberCap == null) {
      return {
        eligible: true,
        capLabel: plan.capLabel ? (plan.capLabel[lang] || plan.capLabel.en) : t.comparisonEligibilityOpen,
        statusLabel: t.comparisonEligibilityOpen,
        headroomMembers: null,
        overByMembers: 0
      };
    }

    if (activeMembers <= plan.memberCap) {
      return {
        eligible: true,
        capLabel: new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(plan.memberCap),
        statusLabel: t.comparisonEligibilityEligible,
        headroomMembers: plan.memberCap - activeMembers,
        overByMembers: 0
      };
    }

    return {
      eligible: false,
      capLabel: new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(plan.memberCap),
      statusLabel: t.comparisonEligibilityOverCap,
      headroomMembers: 0,
      overByMembers: activeMembers - plan.memberCap
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!['monthly', 'yearly'].includes(input.billingMode)) {
      return t.invalidBillingMode;
    }
    if (!Number.isFinite(input.activeMembers) || input.activeMembers <= 0 || !Number.isInteger(input.activeMembers)) {
      return t.invalidActiveMembers;
    }
    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) {
      return t.invalidGross;
    }
    if (!Number.isFinite(input.successfulCharges) || input.successfulCharges <= 0 || !Number.isInteger(input.successfulCharges)) {
      return t.invalidCharges;
    }
    if (!getPlan(input)) {
      return t.invalidPlan;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.invalidRefund;
    }
    if (!getProcessorPreset(input)) {
      return t.invalidPreset;
    }
    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      return t.invalidCustomRate;
    }
    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      return t.invalidCustomFlat;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.invalidOtherCost;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.invalidDesiredNet;
    }

    return '';
  }

  function getContributionDenominator(plan, processor, input) {
    const gross = input.monthlyGrossSales;
    const charges = input.successfulCharges;
    const averageChargeAmount = charges > 0 ? gross / charges : 0;
    if (!Number.isFinite(averageChargeAmount) || averageChargeAmount <= 0) {
      return Number.NaN;
    }

    return 1
      - input.refundRatePct / 100
      - plan.transactionRatePct / 100
      - processor.ratePct / 100
      - processor.flatFee / averageChargeAmount;
  }

  function evaluateScenario(input, overrides) {
    const plan = overrides && overrides.plan ? overrides.plan : getPlan(input);
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);
    const billingMode = overrides && overrides.billingMode ? overrides.billingMode : input.billingMode;
    const gross = input.monthlyGrossSales;
    const charges = input.successfulCharges;
    const refundRate = input.refundRatePct / 100;
    const averageChargeAmount = charges > 0 ? gross / charges : 0;
    const fixedFee = getPlanMonthlyFee(plan, billingMode);
    const variableFee = gross * (plan.transactionRatePct / 100);
    const processorFees = gross * (processor.ratePct / 100) + charges * processor.flatFee;
    const refundLoss = gross * refundRate;
    const takeHomeAfterPlatform = gross - refundLoss - fixedFee - variableFee - processorFees;
    const netProfit = takeHomeAfterPlatform - input.otherMonthlyCost;
    const effectiveFeeRate = gross > 0 ? (fixedFee + variableFee + processorFees) / gross : 0;
    const contributionDenominator = getContributionDenominator(plan, processor, input);
    const capStatus = getCapStatus(plan, input.activeMembers, (overrides && overrides.lang) || 'en');

    return {
      plan,
      processor,
      billingMode,
      averageChargeAmount,
      fixedFee,
      variableFee,
      processorFees,
      refundLoss,
      takeHomeAfterPlatform,
      netProfit,
      annualizedNetProfit: netProfit * 12,
      effectiveFeeRate,
      contributionDenominator,
      capStatus
    };
  }

  function findRequiredGrossForNet(input, targetNet, overrides) {
    const plan = overrides && overrides.plan ? overrides.plan : getPlan(input);
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);
    const billingMode = overrides && overrides.billingMode ? overrides.billingMode : input.billingMode;
    const denominator = getContributionDenominator(plan, processor, input);
    if (!Number.isFinite(denominator) || denominator <= 0) {
      return null;
    }

    const fixedCost = getPlanMonthlyFee(plan, billingMode) + input.otherMonthlyCost + targetNet;
    return fixedCost / denominator;
  }

  function buildComparisonRows(input, lang) {
    return PLANS.map((plan) => {
      const evaluated = evaluateScenario(input, { plan, lang });
      const breakEvenGrossSales = findRequiredGrossForNet(input, 0, { plan });
      return {
        id: plan.id,
        label: plan.label[lang] || plan.label.en,
        memberCapLabel: evaluated.capStatus.capLabel,
        eligible: evaluated.capStatus.eligible,
        eligibilityLabel: evaluated.capStatus.statusLabel,
        headroomMembers: evaluated.capStatus.headroomMembers,
        overByMembers: evaluated.capStatus.overByMembers,
        fixedFee: round2(evaluated.fixedFee),
        transactionRatePct: round2(plan.transactionRatePct),
        variableFee: round2(evaluated.variableFee),
        processorFees: round2(evaluated.processorFees),
        refundLoss: round2(evaluated.refundLoss),
        netProfit: round2(evaluated.netProfit),
        takeHomeAfterPlatform: round2(evaluated.takeHomeAfterPlatform),
        effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
        breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales)
      };
    });
  }

  function recommendPlan(comparisonRows) {
    const eligibleRows = comparisonRows.filter((row) => row.eligible);
    if (!eligibleRows.length) {
      return null;
    }
    return eligibleRows.reduce((best, row) => (row.netProfit > best.netProfit ? row : best));
  }

  function buildUpgradeThresholds(billingMode, lang) {
    const t = TEXT[lang] || TEXT.en;
    const pairs = [
      ['basic', 'professional'],
      ['professional', 'business'],
      ['business', 'established']
    ];

    return pairs.map(([fromId, toId]) => {
      const from = getPlan(fromId);
      const to = getPlan(toId);
      const fixedDelta = getPlanMonthlyFee(to, billingMode) - getPlanMonthlyFee(from, billingMode);
      const rateDelta = (from.transactionRatePct - to.transactionRatePct) / 100;
      const grossSales = rateDelta > 0 ? fixedDelta / rateDelta : null;
      const key = `${fromId}-to-${toId}`;
      return {
        id: key,
        label: t.thresholdLabels[key] || key,
        fromLabel: from.label[lang] || from.label.en,
        toLabel: to.label[lang] || to.label.en,
        fixedDelta: round2(fixedDelta),
        rateDeltaPct: round2((from.transactionRatePct - to.transactionRatePct)),
        grossSales: grossSales == null ? null : round2(grossSales)
      };
    });
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

  function formatInteger(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale).format(value);
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const recommended = result.recommendedPlan ? result.recommendedPlan.label : t.na;
    return [
      t.summaryTitle,
      `${lang === 'ko' ? '과금 모드' : 'Billing mode'}: ${t.billingModeLabels[result.inputs.billingMode]}`,
      `${lang === 'ko' ? '활성 멤버 수' : 'Active members'}: ${formatInteger(result.inputs.activeMembers, lang)}`,
      `${lang === 'ko' ? '현재 플랜' : 'Current plan'}: ${result.currentPlanLabel}`,
      `${lang === 'ko' ? '월 총매출' : 'Monthly gross sales'}: ${formatMoney(result.inputs.monthlyGrossSales, lang)}`,
      `${lang === 'ko' ? '성공 결제 건수' : 'Successful charges'}: ${formatInteger(result.inputs.successfulCharges, lang)}`,
      `${lang === 'ko' ? 'Memberstack 월 구독비' : 'Memberstack monthly fee'}: ${formatMoney(result.fixedFee, lang)}`,
      `${lang === 'ko' ? 'Memberstack 거래 수수료' : 'Memberstack transaction fees'}: ${formatMoney(result.variableFee, lang)}`,
      `${lang === 'ko' ? 'Processor fees' : 'Processor fees'}: ${formatMoney(result.processorFees, lang)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLoss, lang)}`,
      `${lang === 'ko' ? '월 순이익' : 'Monthly net profit'}: ${formatMoney(result.netProfit, lang)}`,
      `${lang === 'ko' ? '실효 수수료율' : 'Effective fee rate'}: ${formatPercent(result.effectiveFeeRatePct, lang)}`,
      `${lang === 'ko' ? '추천 플랜' : 'Recommended plan'}: ${recommended}`,
      `${lang === 'ko' ? '손익분기 월매출' : 'Break-even monthly gross'}: ${result.breakEvenGrossSales == null ? t.na : formatMoney(result.breakEvenGrossSales, lang)}`,
      `${lang === 'ko' ? '목표 순이익용 월매출' : 'Gross needed for target net'}: ${result.requiredGrossForTargetNet == null ? t.na : formatMoney(result.requiredGrossForTargetNet, lang)}`,
      `${t.thresholdLabels['basic-to-professional']}: ${formatMoney(result.upgradeThresholds[0].grossSales, lang)}`,
      `${t.thresholdLabels['professional-to-business']}: ${formatMoney(result.upgradeThresholds[1].grossSales, lang)}`,
      `${t.note}`
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const plan = getPlan(normalized);
    const processor = resolveProcessor(normalized);
    const evaluated = evaluateScenario(normalized, { plan, processor, lang });
    const comparisonRows = buildComparisonRows(normalized, lang);
    const recommendedPlan = recommendPlan(comparisonRows);
    const breakEvenGrossSales = findRequiredGrossForNet(normalized, 0, { plan, processor });
    const requiredGrossForTargetNet = findRequiredGrossForNet(normalized, normalized.desiredMonthlyNetProfit, { plan, processor });
    const targetGap = requiredGrossForTargetNet == null ? null : Math.max(requiredGrossForTargetNet - normalized.monthlyGrossSales, 0);
    const upgradeThresholds = buildUpgradeThresholds(normalized.billingMode, lang);

    const result = {
      inputs: normalized,
      currentPlanLabel: plan.label[lang] || plan.label.en,
      billingModeLabel: (TEXT[lang] || TEXT.en).billingModeLabels[normalized.billingMode],
      processorLabel: processor.label[lang] || processor.label.en,
      fixedFee: round2(evaluated.fixedFee),
      variableFee: round2(evaluated.variableFee),
      processorFees: round2(evaluated.processorFees),
      refundLoss: round2(evaluated.refundLoss),
      takeHomeAfterPlatform: round2(evaluated.takeHomeAfterPlatform),
      netProfit: round2(evaluated.netProfit),
      annualizedNetProfit: round2(evaluated.annualizedNetProfit),
      averageChargeAmount: round2(evaluated.averageChargeAmount),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
      capEligible: evaluated.capStatus.eligible,
      capStatusLabel: evaluated.capStatus.statusLabel,
      capLabel: evaluated.capStatus.capLabel,
      headroomMembers: evaluated.capStatus.headroomMembers,
      overByMembers: evaluated.capStatus.overByMembers,
      breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales),
      requiredGrossForTargetNet: requiredGrossForTargetNet == null ? null : round2(requiredGrossForTargetNet),
      targetGap: targetGap == null ? null : round2(targetGap),
      comparisonRows,
      recommendedPlan,
      upgradeThresholds
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    YEARLY_DISCOUNT,
    PLANS,
    PROCESSOR_PRESETS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPlan,
    getProcessorPreset,
    getBillingMultiplier,
    getPlanMonthlyFee,
    resolveProcessor,
    getCapStatus,
    validate,
    getContributionDenominator,
    evaluateScenario,
    findRequiredGrossForNet,
    buildComparisonRows,
    recommendPlan,
    buildUpgradeThresholds,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.MemberstackFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI = {
    en: {
      pageTitle: 'Memberstack Fee Calculator | 멤버스택 수수료 계산기',
      title: 'Memberstack Fee Calculator',
      subtitle: 'Estimate Memberstack Basic, Professional, Business, and Established take-home with refunds, Stripe processing, and monthly fixed costs.',
      disclaimer: 'Models public Memberstack pricing: Basic $29 / 4%, Professional $49 / 2%, Business $99 / 0.9%, Established $499 / 0%. Yearly mode uses a 20% discount monthly equivalent. Stripe domestic 2.9% + $0.30 is a planning baseline.',
      inputHeader: 'Inputs',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      comparisonHeader: 'Plan comparison',
      thresholdHeader: 'Upgrade thresholds',
      summaryHeader: 'Copy-ready summary',
      assumptionsHeader: 'Assumptions',
      assumptions: [
        'Memberstack pricing uses the public monthly fees and published transaction rates.',
        'Yearly mode applies a 20% discount as a monthly equivalent; it does not model annual cash timing.',
        'Stripe domestic 2.9% + $0.30 is the default processor assumption; actual fees vary by region and payment method.',
        'Recommendations only consider plans that are eligible for the entered active-member count.'
      ],
      labels: {
        billingMode: 'Billing mode',
        activeMembers: 'Active members',
        monthlyGrossSales: 'Monthly gross sales',
        successfulCharges: 'Successful charges',
        planId: 'Current plan',
        refundRatePct: 'Refund rate (%)',
        processorPreset: 'Processor preset',
        customProcessorRatePct: 'Custom processor rate (%)',
        customProcessorFlatFee: 'Custom processor flat fee ($)',
        otherMonthlyCost: 'Other monthly fixed cost',
        desiredMonthlyNetProfit: 'Desired monthly net profit'
      },
      buttons: { copy: 'Copy Summary', reset: 'Reset Defaults', lang: '한국어' },
      kpis: {
        recommendedPlan: 'Recommended plan',
        netProfit: 'Monthly net profit',
        breakEvenGrossSales: 'Break-even monthly gross',
        requiredGrossForTargetNet: 'Gross for target net'
      },
      details: {
        monthlyGrossSales: 'Monthly gross sales',
        fixedFee: 'Memberstack monthly fee',
        variableFee: 'Memberstack transaction fees',
        processorFees: 'Processor fees',
        refundLoss: 'Refund loss',
        annualizedNetProfit: 'Annualized net profit',
        averageChargeAmount: 'Average charge amount',
        effectiveFeeRatePct: 'Effective fee rate',
        capStatus: 'Member-cap status',
        targetGap: 'Additional gross needed vs current'
      },
      comparison: {
        plan: 'Plan',
        cap: 'Cap',
        eligibility: 'Eligibility',
        netProfit: 'Net profit',
        effectiveFeeRatePct: 'Take rate',
        breakEvenGrossSales: 'Break-even',
        fixedFee: 'Fixed fee'
      },
      thresholds: {
        pair: 'Upgrade',
        fixedDelta: 'Extra fixed cost',
        rateDeltaPct: 'Fee-rate savings',
        grossSales: 'Break-even monthly gross'
      },
      statusPrefix: 'Current-plan status',
      capEligible: 'Eligible',
      capOver: 'Over cap',
      na: 'N/A'
    },
    ko: {
      pageTitle: 'Memberstack Fee Calculator | 멤버스택 수수료 계산기',
      title: '멤버스택 수수료 계산기',
      subtitle: 'Memberstack Basic, Professional, Business, Established의 공개 요금과 Stripe 처리 수수료, 환불, 고정비를 합산해 실제 월 순이익을 비교합니다.',
      disclaimer: '공개 Memberstack 요금 Basic $29 / 4%, Professional $49 / 2%, Business $99 / 0.9%, Established $499 / 0%를 기준으로 계산합니다. 연간 결제는 20% 할인 월환산이며, Stripe 기본값 2.9% + $0.30은 planning 기준입니다.',
      inputHeader: '입력값',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      comparisonHeader: '플랜 비교',
      thresholdHeader: '업그레이드 손익분기',
      summaryHeader: '복사용 요약',
      assumptionsHeader: '가정',
      assumptions: [
        'Memberstack 공개 월 구독비와 거래 수수료율만 사용합니다.',
        '연간 결제 모드는 20% 할인 월환산이며, 연간 현금흐름 타이밍까지는 모델링하지 않습니다.',
        'Stripe 국내 카드 2.9% + $0.30을 기본값으로 두되 실제 수수료는 국가·결제수단에 따라 달라질 수 있습니다.',
        '추천 플랜은 입력한 활성 멤버 수 기준으로 사용 가능한 플랜만 대상으로 합니다.'
      ],
      labels: {
        billingMode: '과금 모드',
        activeMembers: '활성 멤버 수',
        monthlyGrossSales: '월 총매출',
        successfulCharges: '성공 결제 건수',
        planId: '현재 플랜',
        refundRatePct: '환불률 (%)',
        processorPreset: '결제 수수료 프리셋',
        customProcessorRatePct: '커스텀 수수료율 (%)',
        customProcessorFlatFee: '커스텀 고정 수수료 ($)',
        otherMonthlyCost: '기타 월 고정비',
        desiredMonthlyNetProfit: '목표 월 순이익'
      },
      buttons: { copy: '요약 복사', reset: '기본값 복원', lang: 'EN' },
      kpis: {
        recommendedPlan: '추천 플랜',
        netProfit: '월 순이익',
        breakEvenGrossSales: '손익분기 월매출',
        requiredGrossForTargetNet: '목표 순이익용 월매출'
      },
      details: {
        monthlyGrossSales: '월 총매출',
        fixedFee: 'Memberstack 월 구독비',
        variableFee: 'Memberstack 거래 수수료',
        processorFees: '결제 처리 수수료',
        refundLoss: '환불 손실',
        annualizedNetProfit: '연환산 순이익',
        averageChargeAmount: '평균 결제금액',
        effectiveFeeRatePct: '실효 수수료율',
        capStatus: '멤버 캡 상태',
        targetGap: '현재 대비 추가 필요 매출'
      },
      comparison: {
        plan: '플랜',
        cap: '캡',
        eligibility: '사용 가능 여부',
        netProfit: '월 순이익',
        effectiveFeeRatePct: '차감률',
        breakEvenGrossSales: '손익분기',
        fixedFee: '고정비'
      },
      thresholds: {
        pair: '업그레이드',
        fixedDelta: '추가 고정비',
        rateDeltaPct: '수수료율 절감',
        grossSales: '손익분기 월매출'
      },
      statusPrefix: '현재 플랜 상태',
      capEligible: '사용 가능',
      capOver: '멤버 수 초과',
      na: 'N/A'
    }
  };

  const els = {
    titleTag: document.querySelector('title'),
    langBtn: document.getElementById('langBtn'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    disclaimer: document.getElementById('disclaimer'),
    inputHeader: document.getElementById('inputHeader'),
    resultsHeader: document.getElementById('resultsHeader'),
    detailHeader: document.getElementById('detailHeader'),
    comparisonHeader: document.getElementById('comparisonHeader'),
    thresholdHeader: document.getElementById('thresholdHeader'),
    summaryHeader: document.getElementById('summaryHeader'),
    assumptionsHeader: document.getElementById('assumptionsHeader'),
    assumptionsList: document.getElementById('assumptionsList'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    comparisonBody: document.getElementById('comparisonBody'),
    thresholdBody: document.getElementById('thresholdBody'),
    fields: {
      billingMode: document.getElementById('billingMode'),
      activeMembers: document.getElementById('activeMembers'),
      monthlyGrossSales: document.getElementById('monthlyGrossSales'),
      successfulCharges: document.getElementById('successfulCharges'),
      planId: document.getElementById('planId'),
      refundRatePct: document.getElementById('refundRatePct'),
      processorPreset: document.getElementById('processorPreset'),
      customProcessorRatePct: document.getElementById('customProcessorRatePct'),
      customProcessorFlatFee: document.getElementById('customProcessorFlatFee'),
      otherMonthlyCost: document.getElementById('otherMonthlyCost'),
      desiredMonthlyNetProfit: document.getElementById('desiredMonthlyNetProfit')
    },
    labels: Array.from(document.querySelectorAll('[data-label]')),
    kpis: {
      recommendedPlan: document.getElementById('kpiRecommendedPlan'),
      netProfit: document.getElementById('kpiNetProfit'),
      breakEvenGrossSales: document.getElementById('kpiBreakEvenGrossSales'),
      requiredGrossForTargetNet: document.getElementById('kpiRequiredGrossForTargetNet')
    },
    details: {
      monthlyGrossSales: document.getElementById('detailMonthlyGrossSales'),
      fixedFee: document.getElementById('detailFixedFee'),
      variableFee: document.getElementById('detailVariableFee'),
      processorFees: document.getElementById('detailProcessorFees'),
      refundLoss: document.getElementById('detailRefundLoss'),
      annualizedNetProfit: document.getElementById('detailAnnualizedNetProfit'),
      averageChargeAmount: document.getElementById('detailAverageChargeAmount'),
      effectiveFeeRatePct: document.getElementById('detailEffectiveFeeRatePct'),
      capStatus: document.getElementById('detailCapStatus'),
      targetGap: document.getElementById('detailTargetGap')
    }
  };

  let currentLang = 'en';

  function applyStaticText() {
    const ui = UI[currentLang];
    const t = TEXT[currentLang];
    if (els.titleTag) els.titleTag.textContent = ui.pageTitle;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.inputHeader.textContent = ui.inputHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.comparisonHeader.textContent = ui.comparisonHeader;
    els.thresholdHeader.textContent = ui.thresholdHeader;
    els.summaryHeader.textContent = ui.summaryHeader;
    els.assumptionsHeader.textContent = ui.assumptionsHeader;
    els.copyBtn.textContent = ui.buttons.copy;
    els.resetBtn.textContent = ui.buttons.reset;
    els.langBtn.textContent = ui.buttons.lang;

    els.labels.forEach((label) => {
      const key = label.dataset.label;
      if (ui.labels[key]) {
        label.textContent = ui.labels[key];
      }
    });

    Array.from(els.fields.billingMode.options).forEach((option) => {
      option.textContent = t.billingModeLabels[option.value] || option.value;
    });

    Array.from(els.fields.planId.options).forEach((option) => {
      const plan = getPlan(option.value);
      if (plan) {
        option.textContent = plan.label[currentLang] || plan.label.en;
      }
    });

    Array.from(els.fields.processorPreset.options).forEach((option) => {
      const preset = getProcessorPreset(option.value);
      if (preset) {
        option.textContent = preset.label[currentLang] || preset.label.en;
      }
    });

    document.getElementById('kpiRecommendedPlanLabel').textContent = ui.kpis.recommendedPlan;
    document.getElementById('kpiNetProfitLabel').textContent = ui.kpis.netProfit;
    document.getElementById('kpiBreakEvenGrossSalesLabel').textContent = ui.kpis.breakEvenGrossSales;
    document.getElementById('kpiRequiredGrossForTargetNetLabel').textContent = ui.kpis.requiredGrossForTargetNet;

    Object.keys(ui.details).forEach((key) => {
      const labelEl = document.getElementById(`detailLabel-${key}`);
      if (labelEl) {
        labelEl.textContent = ui.details[key];
      }
    });

    document.getElementById('comparisonPlanLabel').textContent = ui.comparison.plan;
    document.getElementById('comparisonCapLabel').textContent = ui.comparison.cap;
    document.getElementById('comparisonEligibilityLabel').textContent = ui.comparison.eligibility;
    document.getElementById('comparisonNetProfitLabel').textContent = ui.comparison.netProfit;
    document.getElementById('comparisonEffectiveFeeLabel').textContent = ui.comparison.effectiveFeeRatePct;
    document.getElementById('comparisonBreakEvenLabel').textContent = ui.comparison.breakEvenGrossSales;
    document.getElementById('comparisonFixedFeeLabel').textContent = ui.comparison.fixedFee;

    document.getElementById('thresholdPairLabel').textContent = ui.thresholds.pair;
    document.getElementById('thresholdFixedDeltaLabel').textContent = ui.thresholds.fixedDelta;
    document.getElementById('thresholdRateDeltaLabel').textContent = ui.thresholds.rateDeltaPct;
    document.getElementById('thresholdGrossLabel').textContent = ui.thresholds.grossSales;

    els.assumptionsList.innerHTML = '';
    ui.assumptions.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      els.assumptionsList.appendChild(li);
    });
  }

  function setDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (els.fields[key]) {
        els.fields[key].value = value;
      }
    });
  }

  function getInput() {
    return {
      billingMode: els.fields.billingMode.value,
      activeMembers: els.fields.activeMembers.value,
      monthlyGrossSales: els.fields.monthlyGrossSales.value,
      successfulCharges: els.fields.successfulCharges.value,
      planId: els.fields.planId.value,
      refundRatePct: els.fields.refundRatePct.value,
      processorPreset: els.fields.processorPreset.value,
      customProcessorRatePct: els.fields.customProcessorRatePct.value,
      customProcessorFlatFee: els.fields.customProcessorFlatFee.value,
      otherMonthlyCost: els.fields.otherMonthlyCost.value,
      desiredMonthlyNetProfit: els.fields.desiredMonthlyNetProfit.value
    };
  }

  function setDetailValue(id, value) {
    if (els.details[id]) {
      els.details[id].textContent = value;
    }
  }

  function renderComparisonRows(rows) {
    els.comparisonBody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.label}</td>
        <td>${row.memberCapLabel}</td>
        <td>${row.eligibilityLabel}${row.eligible && row.headroomMembers != null ? ` · +${formatInteger(row.headroomMembers, currentLang)}` : (!row.eligible && row.overByMembers ? ` · +${formatInteger(row.overByMembers, currentLang)}` : '')}</td>
        <td>${formatMoney(row.netProfit, currentLang)}</td>
        <td>${formatPercent(row.effectiveFeeRatePct, currentLang)}</td>
        <td>${row.breakEvenGrossSales == null ? UI[currentLang].na : formatMoney(row.breakEvenGrossSales, currentLang)}</td>
        <td>${formatMoney(row.fixedFee, currentLang)}</td>
      `;
      els.comparisonBody.appendChild(tr);
    });
  }

  function renderThresholdRows(rows) {
    els.thresholdBody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.label}</td>
        <td>${formatMoney(row.fixedDelta, currentLang)}</td>
        <td>${formatPercent(row.rateDeltaPct, currentLang)}</td>
        <td>${row.grossSales == null ? UI[currentLang].na : formatMoney(row.grossSales, currentLang)}</td>
      `;
      els.thresholdBody.appendChild(tr);
    });
  }

  function render() {
    applyStaticText();
    const { result, error } = calculate(getInput(), { lang: currentLang });
    const ui = UI[currentLang];
    const t = TEXT[currentLang];

    if (error) {
      els.error.textContent = error;
      els.error.style.display = 'block';
      els.status.textContent = t.waiting;
      els.summary.value = '';
      Object.values(els.kpis).forEach((el) => { el.textContent = ui.na; });
      Object.keys(els.details).forEach((key) => setDetailValue(key, ui.na));
      els.comparisonBody.innerHTML = '';
      els.thresholdBody.innerHTML = '';
      return;
    }

    els.error.style.display = 'none';
    els.status.textContent = `${ui.statusPrefix}: ${result.capStatusLabel} · ${result.currentPlanLabel}`;
    els.kpis.recommendedPlan.textContent = result.recommendedPlan ? result.recommendedPlan.label : ui.na;
    els.kpis.netProfit.textContent = formatMoney(result.netProfit, currentLang);
    els.kpis.breakEvenGrossSales.textContent = result.breakEvenGrossSales == null ? ui.na : formatMoney(result.breakEvenGrossSales, currentLang);
    els.kpis.requiredGrossForTargetNet.textContent = result.requiredGrossForTargetNet == null ? ui.na : formatMoney(result.requiredGrossForTargetNet, currentLang);

    setDetailValue('monthlyGrossSales', formatMoney(result.inputs.monthlyGrossSales, currentLang));
    setDetailValue('fixedFee', formatMoney(result.fixedFee, currentLang));
    setDetailValue('variableFee', formatMoney(result.variableFee, currentLang));
    setDetailValue('processorFees', formatMoney(result.processorFees, currentLang));
    setDetailValue('refundLoss', formatMoney(result.refundLoss, currentLang));
    setDetailValue('annualizedNetProfit', formatMoney(result.annualizedNetProfit, currentLang));
    setDetailValue('averageChargeAmount', formatMoney(result.averageChargeAmount, currentLang));
    setDetailValue('effectiveFeeRatePct', formatPercent(result.effectiveFeeRatePct, currentLang));
    setDetailValue('capStatus', `${result.capStatusLabel} · ${result.capLabel}`);
    setDetailValue('targetGap', result.targetGap == null ? ui.na : formatMoney(result.targetGap, currentLang));

    renderComparisonRows(result.comparisonRows);
    renderThresholdRows(result.upgradeThresholds);
    els.summary.value = result.summary;
  }

  Object.values(els.fields).forEach((field) => {
    field.addEventListener('input', render);
    field.addEventListener('change', render);
  });

  els.langBtn.addEventListener('click', function () {
    currentLang = currentLang === 'en' ? 'ko' : 'en';
    render();
  });

  els.resetBtn.addEventListener('click', function () {
    setDefaults();
    render();
  });

  els.copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(els.summary.value);
      els.status.textContent = TEXT[currentLang].copied;
    } catch (error) {
      els.status.textContent = TEXT[currentLang].copyFail;
    }
  });

  setDefaults();
  render();
})(typeof globalThis !== 'undefined' ? globalThis : window);
