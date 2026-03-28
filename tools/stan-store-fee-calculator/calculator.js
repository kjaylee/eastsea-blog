(function (root) {
  const PLAN_PRESETS = {
    creator: { fee: 29, label: { en: 'Creator · $29/mo', ko: 'Creator · $29/월' } },
    pro: { fee: 99, label: { en: 'Creator Pro · $99/mo', ko: 'Creator Pro · $99/월' } }
  };

  const PAYMENT_PRESETS = {
    standard: { baseRatePct: 2.9, flatFee: 0.3, label: { en: 'Standard card', ko: '일반 카드' } },
    afterpay: { baseRatePct: 6.0, flatFee: 0.3, label: { en: 'Afterpay', ko: 'Afterpay' } },
    klarna: { baseRatePct: 5.99, flatFee: 0.3, label: { en: 'Klarna', ko: 'Klarna' } }
  };

  const CONSTANTS = {
    STAN_TRANSACTION_FEE_PCT: 0,
    INTERNATIONAL_SURCHARGE_PCT: 1.5,
    RECURRING_SURCHARGE_PCT: 0.5,
    FX_SURCHARGE_PCT: 1,
    PAYOUT_RATE_PCT: 0.25,
    PAYOUT_FIXED_FEE: 0.25,
    PAYOUT_MINIMUM_FEE: 1,
    CURRENCY: 'USD'
  };

  const DEFAULTS = {
    monthlyGrossSales: 8000,
    monthlyOrders: 120,
    refundRatePct: 2,
    planTier: 'creator',
    paymentMethod: 'standard',
    internationalCustomers: false,
    recurringPayments: false,
    currencyMismatch: false,
    monthlyPayoutCount: 4,
    otherMonthlyCost: 500,
    desiredMonthlyNetProfit: 3000
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      gross: 'Monthly gross sales must be greater than zero.',
      orders: 'Monthly orders must be a whole number greater than zero.',
      refund: 'Refund rate must be 0 or above and below 100%.',
      plan: 'Unsupported Stan plan tier.',
      method: 'Unsupported payment-method preset.',
      payouts: 'Monthly payout count must be a whole number greater than zero.',
      other: 'Other monthly cost must be 0 or above.',
      target: 'Desired monthly net profit must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to model Stan take-home.',
      statusGood: 'Under these assumptions, your Stan store is profitable.',
      statusWarn: 'Under these assumptions, your Stan economics are underwater. Re-check fees, refunds, or pricing.',
      na: 'N/A',
      summaryTitle: '[Stan Store Fee Calculator Summary]',
      note: 'Scope note: Stan transaction fee is modeled as 0%. This v1 covers US Stripe standard / Afterpay / Klarna paths only, excludes PayPal, and uses public payout-fee guidance with a per-payout minimum.'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      gross: '월 총매출은 0보다 커야 합니다.',
      orders: '월 주문 수는 0보다 큰 정수여야 합니다.',
      refund: '환불률은 0 이상 100 미만이어야 합니다.',
      plan: '지원하지 않는 Stan 플랜입니다.',
      method: '지원하지 않는 결제 프리셋입니다.',
      payouts: '월 정산 횟수는 0보다 큰 정수여야 합니다.',
      other: '기타 월 고정비는 0 이상이어야 합니다.',
      target: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 Stan 순수익이 계산됩니다.',
      statusGood: '현재 가정에서는 Stan 스토어 운영이 흑자입니다.',
      statusWarn: '현재 가정에서는 Stan 경제성이 적자입니다. 수수료, 환불, 가격을 다시 점검하세요.',
      na: '해당 없음',
      summaryTitle: '[Stan Store 수수료 계산기 요약]',
      note: '범위 메모: Stan 플랫폼 거래 수수료는 0%로 모델링했습니다. 이 v1은 미국 Stripe standard / Afterpay / Klarna만 다루며 PayPal은 제외합니다. 정산 수수료는 payout별 최소 수수료를 반영한 공개 가이드를 사용합니다.'
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

  function toBoolean(value) {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
  }

  function normalizeInput(input) {
    return {
      monthlyGrossSales: Number(input.monthlyGrossSales),
      monthlyOrders: Number(input.monthlyOrders),
      refundRatePct: Number(input.refundRatePct),
      planTier: input.planTier || DEFAULTS.planTier,
      paymentMethod: input.paymentMethod || DEFAULTS.paymentMethod,
      internationalCustomers: toBoolean(input.internationalCustomers),
      recurringPayments: toBoolean(input.recurringPayments),
      currencyMismatch: toBoolean(input.currencyMismatch),
      monthlyPayoutCount: Number(input.monthlyPayoutCount),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlanPreset(input) {
    return PLAN_PRESETS[input.planTier] || null;
  }

  function getPaymentPreset(input) {
    return PAYMENT_PRESETS[input.paymentMethod] || null;
  }

  function getProcessorRatePct(input, paymentPreset) {
    let rate = paymentPreset.baseRatePct;
    if (input.internationalCustomers) rate += CONSTANTS.INTERNATIONAL_SURCHARGE_PCT;
    if (input.recurringPayments) rate += CONSTANTS.RECURRING_SURCHARGE_PCT;
    if (input.currencyMismatch) rate += CONSTANTS.FX_SURCHARGE_PCT;
    return rate;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) {
      return t.gross;
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders <= 0 || !Number.isInteger(input.monthlyOrders)) {
      return t.orders;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refund;
    }
    if (!getPlanPreset(input)) {
      return t.plan;
    }
    if (!getPaymentPreset(input)) {
      return t.method;
    }
    if (!Number.isFinite(input.monthlyPayoutCount) || input.monthlyPayoutCount <= 0 || !Number.isInteger(input.monthlyPayoutCount)) {
      return t.payouts;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.other;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.target;
    }
    return '';
  }

  function evaluateCore(input, overrides) {
    const gross = overrides && overrides.gross != null ? Number(overrides.gross) : input.monthlyGrossSales;
    const orders = overrides && overrides.orders != null ? Number(overrides.orders) : input.monthlyOrders;
    const planPreset = getPlanPreset(input);
    const paymentPreset = overrides && overrides.paymentPreset ? overrides.paymentPreset : getPaymentPreset(input);
    const processorRatePct = getProcessorRatePct(input, paymentPreset);
    const refundLoss = gross * (input.refundRatePct / 100);
    const processorFees = gross * (processorRatePct / 100) + orders * paymentPreset.flatFee;
    const prePayoutBalance = gross - refundLoss - processorFees;
    const perPayoutAmount = input.monthlyPayoutCount > 0 ? prePayoutBalance / input.monthlyPayoutCount : 0;
    const payoutFeeEach = prePayoutBalance > 0
      ? Math.max((perPayoutAmount * (CONSTANTS.PAYOUT_RATE_PCT / 100)) + CONSTANTS.PAYOUT_FIXED_FEE, CONSTANTS.PAYOUT_MINIMUM_FEE)
      : 0;
    const payoutFees = payoutFeeEach * input.monthlyPayoutCount;
    const takeHomeAfterStanCosts = gross - refundLoss - processorFees - payoutFees - planPreset.fee;
    const monthlyNetProfit = takeHomeAfterStanCosts - input.otherMonthlyCost;
    const effectiveFeeRatePct = gross > 0
      ? ((processorFees + payoutFees + planPreset.fee) / gross) * 100
      : 0;

    return {
      gross,
      orders,
      planFee: planPreset.fee,
      paymentLabel: paymentPreset.label,
      processorRatePct,
      processorFees,
      refundLoss,
      prePayoutBalance,
      perPayoutAmount,
      payoutFeeEach,
      payoutFees,
      takeHomeAfterStanCosts,
      monthlyNetProfit,
      averageOrderValue: orders > 0 ? gross / orders : null,
      effectiveFeeRatePct,
      annualizedNetProfit: monthlyNetProfit * 12
    };
  }

  function findRequiredGross(input, targetNet, paymentPreset) {
    const baselineAverageOrderValue = input.monthlyGrossSales / input.monthlyOrders;
    if (!Number.isFinite(baselineAverageOrderValue) || baselineAverageOrderValue <= 0) {
      return null;
    }

    const target = Number(targetNet) || 0;
    const maxIterations = 80;
    const tolerance = 0.005;
    let low = 0;
    let high = Math.max(input.monthlyGrossSales, baselineAverageOrderValue);

    while (evaluateCore(input, {
      gross: high,
      orders: high / baselineAverageOrderValue,
      paymentPreset
    }).monthlyNetProfit < target) {
      high *= 2;
      if (high > 1e9) {
        return null;
      }
    }

    for (let i = 0; i < maxIterations; i += 1) {
      const mid = (low + high) / 2;
      const result = evaluateCore(input, {
        gross: mid,
        orders: mid / baselineAverageOrderValue,
        paymentPreset
      });
      if (Math.abs(result.monthlyNetProfit - target) <= tolerance) {
        return mid;
      }
      if (result.monthlyNetProfit >= target) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function buildComparisonRows(input, lang) {
    return Object.entries(PAYMENT_PRESETS).map(([id, preset]) => {
      const evaluated = evaluateCore(input, { paymentPreset: preset });
      const breakEven = findRequiredGross(input, 0, preset);
      return {
        id,
        label: preset.label[lang] || preset.label.en,
        processorRatePct: round2(evaluated.processorRatePct),
        processorFees: round2(evaluated.processorFees),
        payoutFees: round2(evaluated.payoutFees),
        monthlyNetProfit: round2(evaluated.monthlyNetProfit),
        breakEvenMonthlyGrossSales: breakEven == null ? null : round2(breakEven)
      };
    });
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: CONSTANTS.CURRENCY,
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
      `${lang === 'ko' ? 'Stan 거래 수수료' : 'Stan transaction fee'}: 0.00%`,
      `${lang === 'ko' ? '플랜' : 'Plan tier'}: ${result.planLabel}`,
      `${lang === 'ko' ? '결제 프리셋' : 'Payment preset'}: ${result.paymentLabel}`,
      `${lang === 'ko' ? '월 총매출' : 'Monthly gross sales'}: ${formatMoney(result.inputs.monthlyGrossSales, lang)}`,
      `${lang === 'ko' ? '월 주문 수' : 'Monthly orders'}: ${result.inputs.monthlyOrders}`,
      `${lang === 'ko' ? '평균 주문 금액' : 'Average order value'}: ${formatMoney(result.averageOrderValue, lang)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLoss, lang)}`,
      `${lang === 'ko' ? '결제 처리 수수료' : 'Processor fees'}: ${formatMoney(result.processorFees, lang)}`,
      `${lang === 'ko' ? '정산 수수료' : 'Payout fees'}: ${formatMoney(result.payoutFees, lang)}`,
      `${lang === 'ko' ? '플랜 비용' : 'Plan fee'}: ${formatMoney(result.planFee, lang)}`,
      `${lang === 'ko' ? 'Stan 비용 차감 후 실수령액' : 'Take-home after Stan costs'}: ${formatMoney(result.takeHomeAfterStanCosts, lang)}`,
      `${lang === 'ko' ? '월 순이익' : 'Monthly net profit'}: ${formatMoney(result.monthlyNetProfit, lang)}`,
      `${lang === 'ko' ? '실효 수수료율' : 'Effective fee rate'}: ${formatPercent(result.effectiveFeeRatePct, lang)}`,
      `${lang === 'ko' ? '손익분기 월매출' : 'Break-even monthly gross'}: ${result.breakEvenMonthlyGrossSales == null ? t.na : formatMoney(result.breakEvenMonthlyGrossSales, lang)}`,
      `${lang === 'ko' ? '목표 순이익용 필요 월매출' : 'Gross needed for target net'}: ${result.requiredMonthlyGrossForTargetNet == null ? t.na : formatMoney(result.requiredMonthlyGrossForTargetNet, lang)}`,
      t.note
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const planPreset = getPlanPreset(normalized);
    const paymentPreset = getPaymentPreset(normalized);
    const evaluated = evaluateCore(normalized, { paymentPreset });
    const breakEvenMonthlyGrossSales = findRequiredGross(normalized, 0, paymentPreset);
    const requiredMonthlyGrossForTargetNet = findRequiredGross(normalized, normalized.desiredMonthlyNetProfit, paymentPreset);
    const targetGap = requiredMonthlyGrossForTargetNet == null
      ? null
      : Math.max(requiredMonthlyGrossForTargetNet - normalized.monthlyGrossSales, 0);

    const result = {
      inputs: normalized,
      planLabel: planPreset.label[lang] || planPreset.label.en,
      paymentLabel: paymentPreset.label[lang] || paymentPreset.label.en,
      stanTransactionFeePct: 0,
      planFee: round2(evaluated.planFee),
      processorRatePct: round2(evaluated.processorRatePct),
      processorFees: round2(evaluated.processorFees),
      refundLoss: round2(evaluated.refundLoss),
      payoutFees: round2(evaluated.payoutFees),
      takeHomeAfterStanCosts: round2(evaluated.takeHomeAfterStanCosts),
      monthlyNetProfit: round2(evaluated.monthlyNetProfit),
      annualizedNetProfit: round2(evaluated.annualizedNetProfit),
      averageOrderValue: round2(evaluated.averageOrderValue),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRatePct),
      breakEvenMonthlyGrossSales: breakEvenMonthlyGrossSales == null ? null : round2(breakEvenMonthlyGrossSales),
      requiredMonthlyGrossForTargetNet: requiredMonthlyGrossForTargetNet == null ? null : round2(requiredMonthlyGrossForTargetNet),
      targetGap: targetGap == null ? null : round2(targetGap),
      comparisonRows: buildComparisonRows(normalized, lang)
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    PLAN_PRESETS,
    PAYMENT_PRESETS,
    CONSTANTS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPlanPreset,
    getPaymentPreset,
    getProcessorRatePct,
    validate,
    evaluateCore,
    findRequiredGross,
    buildComparisonRows,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.StanStoreFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    en: {
      pageTitle: 'Stan Store Fee Calculator | 스탠 스토어 수수료 계산기',
      title: 'Stan Store Fee Calculator',
      subtitle: 'Estimate what a Stan creator actually keeps after Creator vs Creator Pro plan fees, US Stripe standard / Afterpay / Klarna fees, payout drag, refunds, and fixed monthly costs.',
      disclaimer: 'Stan’s transaction fee is modeled as 0%. This v1 focuses on US Stripe-based sales only and excludes PayPal. Use it as a planning model, not a billing statement.',
      back: '← Tools',
      lang: 'KR',
      inputHeader: 'Inputs',
      assumptionHeader: 'Assumptions & interpretation',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      comparisonHeader: 'Stripe method comparison',
      summaryHeader: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: 'Valid inputs will render KPI cards and a payment-method comparison table here.',
      monthlyGrossSales: 'Monthly gross sales',
      monthlyOrders: 'Monthly orders',
      refundRatePct: 'Refund rate (%)',
      planTier: 'Plan tier',
      paymentMethod: 'Payment method preset',
      monthlyPayoutCount: 'Monthly payout count',
      payoutHint: 'Payout fee is modeled per payout event: 0.25% + $0.25, minimum $1 each.',
      otherMonthlyCost: 'Other monthly fixed cost',
      desiredMonthlyNetProfit: 'Desired monthly net profit',
      internationalCustomers: 'International customers',
      internationalHint: 'Adds Stripe’s public +1.5% international customer surcharge.',
      recurringPayments: 'Recurring payments',
      recurringHint: 'Adds the public +0.5% recurring-payment drag.',
      currencyMismatch: 'Currency mismatch',
      currencyHint: 'Adds the public +1% payout/currency-conversion surcharge.',
      assumption1: 'Stan transaction fee is modeled as 0%, but plan cost still applies: Creator $29/mo or Creator Pro $99/mo.',
      assumption2: 'US Stripe presets are modeled from public Stan help docs: standard 2.9% + $0.30, Afterpay 6.0% + $0.30, Klarna 5.99% + $0.30.',
      assumption3: 'Payout fees are charged per payout event at 0.25% + $0.25 with a $1 minimum, so payout cadence matters.',
      assumption4: 'PayPal and non-US country presets are intentionally excluded from this v1 slice.',
      kpiTakeHome: 'Take-home after Stan costs',
      kpiNetProfit: 'Monthly net profit',
      kpiEffectiveFee: 'Effective fee rate',
      kpiBreakEven: 'Break-even monthly gross',
      kpiTarget: 'Gross needed for target net',
      kpiAov: 'Average order value',
      detailStanFee: 'Stan transaction fee',
      detailPlanFee: 'Plan fee',
      detailProcessorRate: 'Processor rate',
      detailProcessorFees: 'Processor fees',
      detailPayoutFees: 'Payout fees',
      detailRefundLoss: 'Refund loss',
      detailAnnualized: 'Annualized net profit',
      detailTargetGap: 'Additional gross needed vs current',
      comparisonMethod: 'Method',
      comparisonRate: 'Rate',
      comparisonProcessorFees: 'Processor fees',
      comparisonPayoutFees: 'Payout fees',
      comparisonNetProfit: 'Net profit',
      comparisonBreakEven: 'Break-even gross'
    },
    ko: {
      pageTitle: 'Stan Store Fee Calculator | 스탠 스토어 수수료 계산기',
      title: 'Stan Store 수수료 계산기',
      subtitle: 'Creator / Creator Pro 월 플랜 비용, 미국 Stripe standard / Afterpay / Klarna 수수료, 정산 드래그, 환불, 월 고정비를 반영해 Stan 실수령액을 계산합니다.',
      disclaimer: 'Stan 플랫폼 거래 수수료는 0%로 모델링했습니다. 이 v1은 미국 Stripe 기반 판매만 다루며 PayPal은 제외합니다. 청구 명세서가 아니라 planning model로 사용하세요.',
      back: '← Tools',
      lang: 'EN',
      inputHeader: '입력값',
      assumptionHeader: '가정 및 해석',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      comparisonHeader: 'Stripe 결제수단 비교',
      summaryHeader: '복사용 요약',
      copy: '요약 복사',
      reset: '기본값 복원',
      resultsEmpty: '유효한 입력값을 넣으면 KPI 카드와 결제수단 비교표가 표시됩니다.',
      monthlyGrossSales: '월 총매출',
      monthlyOrders: '월 주문 수',
      refundRatePct: '환불률 (%)',
      planTier: '플랜',
      paymentMethod: '결제 프리셋',
      monthlyPayoutCount: '월 정산 횟수',
      payoutHint: '정산 수수료는 payout마다 0.25% + $0.25, 최소 $1로 계산합니다.',
      otherMonthlyCost: '기타 월 고정비',
      desiredMonthlyNetProfit: '목표 월 순이익',
      internationalCustomers: '해외 고객',
      internationalHint: 'Stripe 공개 해외 고객 surcharge +1.5%를 더합니다.',
      recurringPayments: '반복 결제',
      recurringHint: '공개 반복 결제 추가 드래그 +0.5%를 더합니다.',
      currencyMismatch: '통화 불일치',
      currencyHint: '공개 환전/통화 변환 surcharge +1%를 더합니다.',
      assumption1: 'Stan 거래 수수료는 0%로 모델링하지만, Creator $29/월 또는 Creator Pro $99/월 플랜 비용은 반영합니다.',
      assumption2: '미국 Stripe 프리셋은 Stan 공개 도움말 기준입니다: standard 2.9% + $0.30, Afterpay 6.0% + $0.30, Klarna 5.99% + $0.30.',
      assumption3: '정산 수수료는 payout별 0.25% + $0.25, 최소 $1이므로 정산 횟수에 따라 달라집니다.',
      assumption4: 'PayPal과 비미국 국가 프리셋은 이번 v1 범위에서 제외했습니다.',
      kpiTakeHome: 'Stan 비용 차감 후 실수령액',
      kpiNetProfit: '월 순이익',
      kpiEffectiveFee: '실효 수수료율',
      kpiBreakEven: '손익분기 월매출',
      kpiTarget: '목표 순이익용 필요 월매출',
      kpiAov: '평균 주문 금액',
      detailStanFee: 'Stan 거래 수수료',
      detailPlanFee: '플랜 비용',
      detailProcessorRate: '결제 처리 수수료율',
      detailProcessorFees: '결제 처리 수수료',
      detailPayoutFees: '정산 수수료',
      detailRefundLoss: '환불 손실',
      detailAnnualized: '연환산 순이익',
      detailTargetGap: '현재 대비 목표 매출 추가 필요분',
      comparisonMethod: '수단',
      comparisonRate: '요율',
      comparisonProcessorFees: '결제 수수료',
      comparisonPayoutFees: '정산 수수료',
      comparisonNetProfit: '순이익',
      comparisonBreakEven: '손익분기 월매출'
    }
  };

  const fieldIds = [
    'monthlyGrossSales',
    'monthlyOrders',
    'refundRatePct',
    'planTier',
    'paymentMethod',
    'monthlyPayoutCount',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit'
  ];
  const checkboxIds = ['internationalCustomers', 'recurringPayments', 'currencyMismatch'];

  const els = {
    htmlTitle: document.querySelector('title'),
    backLink: document.getElementById('backLink'),
    langBtn: document.getElementById('langBtn'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    disclaimer: document.getElementById('disclaimer'),
    inputHeader: document.getElementById('inputHeader'),
    assumptionHeader: document.getElementById('assumptionHeader'),
    resultsHeader: document.getElementById('resultsHeader'),
    detailHeader: document.getElementById('detailHeader'),
    comparisonHeader: document.getElementById('comparisonHeader'),
    summaryHeader: document.getElementById('summaryHeader'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    resultsContent: document.getElementById('resultsContent'),
    payoutHint: document.getElementById('payoutHint'),
    internationalHint: document.getElementById('internationalHint'),
    recurringHint: document.getElementById('recurringHint'),
    currencyHint: document.getElementById('currencyHint'),
    assumption1: document.getElementById('assumption1'),
    assumption2: document.getElementById('assumption2'),
    assumption3: document.getElementById('assumption3'),
    assumption4: document.getElementById('assumption4'),
    comparisonBody: document.getElementById('comparisonBody')
  };

  fieldIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });
  checkboxIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });

  [
    'takeHomeAfterStanCosts',
    'monthlyNetProfit',
    'effectiveFeeRatePct',
    'breakEvenMonthlyGrossSales',
    'requiredMonthlyGrossForTargetNet',
    'averageOrderValue',
    'stanTransactionFeePct',
    'planFee',
    'processorRatePct',
    'processorFees',
    'payoutFees',
    'refundLoss',
    'annualizedNetProfit',
    'targetGap'
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  let currentLang = 'en';

  function getInputValue(id) {
    return els[id].value;
  }

  function setInputValue(id, value) {
    els[id].value = value;
  }

  function collectInput() {
    return {
      monthlyGrossSales: getInputValue('monthlyGrossSales'),
      monthlyOrders: getInputValue('monthlyOrders'),
      refundRatePct: getInputValue('refundRatePct'),
      planTier: getInputValue('planTier'),
      paymentMethod: getInputValue('paymentMethod'),
      internationalCustomers: els.internationalCustomers.checked,
      recurringPayments: els.recurringPayments.checked,
      currencyMismatch: els.currencyMismatch.checked,
      monthlyPayoutCount: getInputValue('monthlyPayoutCount'),
      otherMonthlyCost: getInputValue('otherMonthlyCost'),
      desiredMonthlyNetProfit: getInputValue('desiredMonthlyNetProfit')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (checkboxIds.includes(key)) {
        els[key].checked = Boolean(value);
      } else {
        setInputValue(key, value);
      }
    });
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.langBtn.textContent = ui.lang;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.inputHeader.textContent = ui.inputHeader;
    els.assumptionHeader.textContent = ui.assumptionHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.comparisonHeader.textContent = ui.comparisonHeader;
    els.summaryHeader.textContent = ui.summaryHeader;
    els.resultsEmpty.textContent = ui.resultsEmpty;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.payoutHint.textContent = ui.payoutHint;
    els.internationalHint.textContent = ui.internationalHint;
    els.recurringHint.textContent = ui.recurringHint;
    els.currencyHint.textContent = ui.currencyHint;

    fieldIds.forEach((id) => {
      if (els[`l_${id}`]) {
        els[`l_${id}`].textContent = ui[id];
      }
    });
    checkboxIds.forEach((id) => {
      if (els[`l_${id}`]) {
        els[`l_${id}`].textContent = ui[id];
      }
    });

    els.planTier.querySelector('option[value="creator"]').textContent = PLAN_PRESETS.creator.label[currentLang] || PLAN_PRESETS.creator.label.en;
    els.planTier.querySelector('option[value="pro"]').textContent = PLAN_PRESETS.pro.label[currentLang] || PLAN_PRESETS.pro.label.en;
    els.paymentMethod.querySelector('option[value="standard"]').textContent = `${PAYMENT_PRESETS.standard.label[currentLang] || PAYMENT_PRESETS.standard.label.en} · 2.9% + $0.30`;
    els.paymentMethod.querySelector('option[value="afterpay"]').textContent = `${PAYMENT_PRESETS.afterpay.label[currentLang] || PAYMENT_PRESETS.afterpay.label.en} · 6.0% + $0.30`;
    els.paymentMethod.querySelector('option[value="klarna"]').textContent = `${PAYMENT_PRESETS.klarna.label[currentLang] || PAYMENT_PRESETS.klarna.label.en} · 5.99% + $0.30`;

    els.assumption1.textContent = ui.assumption1;
    els.assumption2.textContent = ui.assumption2;
    els.assumption3.textContent = ui.assumption3;
    els.assumption4.textContent = ui.assumption4;

    document.querySelector('[data-kpi="takeHomeAfterStanCosts"]').textContent = ui.kpiTakeHome;
    document.querySelector('[data-kpi="monthlyNetProfit"]').textContent = ui.kpiNetProfit;
    document.querySelector('[data-kpi="effectiveFeeRatePct"]').textContent = ui.kpiEffectiveFee;
    document.querySelector('[data-kpi="breakEvenMonthlyGrossSales"]').textContent = ui.kpiBreakEven;
    document.querySelector('[data-kpi="requiredMonthlyGrossForTargetNet"]').textContent = ui.kpiTarget;
    document.querySelector('[data-kpi="averageOrderValue"]').textContent = ui.kpiAov;

    document.querySelector('[data-detail="stanTransactionFeePct"]').textContent = ui.detailStanFee;
    document.querySelector('[data-detail="planFee"]').textContent = ui.detailPlanFee;
    document.querySelector('[data-detail="processorRatePct"]').textContent = ui.detailProcessorRate;
    document.querySelector('[data-detail="processorFees"]').textContent = ui.detailProcessorFees;
    document.querySelector('[data-detail="payoutFees"]').textContent = ui.detailPayoutFees;
    document.querySelector('[data-detail="refundLoss"]').textContent = ui.detailRefundLoss;
    document.querySelector('[data-detail="annualizedNetProfit"]').textContent = ui.detailAnnualized;
    document.querySelector('[data-detail="targetGap"]').textContent = ui.detailTargetGap;

    document.getElementById('comparisonMethod').textContent = ui.comparisonMethod;
    document.getElementById('comparisonRate').textContent = ui.comparisonRate;
    document.getElementById('comparisonProcessorFees').textContent = ui.comparisonProcessorFees;
    document.getElementById('comparisonPayoutFees').textContent = ui.comparisonPayoutFees;
    document.getElementById('comparisonNetProfit').textContent = ui.comparisonNetProfit;
    document.getElementById('comparisonBreakEven').textContent = ui.comparisonBreakEven;
  }

  function clearOutputs() {
    [
      'takeHomeAfterStanCosts',
      'monthlyNetProfit',
      'effectiveFeeRatePct',
      'breakEvenMonthlyGrossSales',
      'requiredMonthlyGrossForTargetNet',
      'averageOrderValue',
      'stanTransactionFeePct',
      'planFee',
      'processorRatePct',
      'processorFees',
      'payoutFees',
      'refundLoss',
      'annualizedNetProfit',
      'targetGap'
    ].forEach((id) => {
      if (els[id]) {
        els[id].textContent = '—';
      }
    });
    els.summary.value = '';
    els.comparisonBody.innerHTML = '';
  }

  function formatNullableMoney(value) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatMoney(value, currentLang);
  }

  function formatNullablePercent(value) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatPercent(value, currentLang);
  }

  function renderComparison(rows) {
    const t = TEXT[currentLang] || TEXT.en;
    els.comparisonBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.label}</td>
        <td>${formatPercent(row.processorRatePct, currentLang)}</td>
        <td>${formatMoney(row.processorFees, currentLang)}</td>
        <td>${formatMoney(row.payoutFees, currentLang)}</td>
        <td class="${row.monthlyNetProfit >= 0 ? 'good' : 'warn'}">${formatMoney(row.monthlyNetProfit, currentLang)}</td>
        <td>${row.breakEvenMonthlyGrossSales == null ? t.na : formatMoney(row.breakEvenMonthlyGrossSales, currentLang)}</td>
      </tr>
    `).join('');
  }

  function render() {
    const t = TEXT[currentLang] || TEXT.en;
    const { result, error } = calculate(collectInput(), { lang: currentLang });

    if (error) {
      els.error.textContent = error || t.invalid;
      els.error.classList.add('show');
      els.status.textContent = t.waiting;
      els.status.className = 'status';
      els.resultsContent.hidden = true;
      els.resultsEmpty.hidden = false;
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.resultsContent.hidden = false;
    els.resultsEmpty.hidden = true;
    els.status.textContent = result.monthlyNetProfit >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;

    els.takeHomeAfterStanCosts.textContent = formatMoney(result.takeHomeAfterStanCosts, currentLang);
    els.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit, currentLang);
    els.effectiveFeeRatePct.textContent = formatPercent(result.effectiveFeeRatePct, currentLang);
    els.breakEvenMonthlyGrossSales.textContent = formatNullableMoney(result.breakEvenMonthlyGrossSales);
    els.requiredMonthlyGrossForTargetNet.textContent = formatNullableMoney(result.requiredMonthlyGrossForTargetNet);
    els.averageOrderValue.textContent = formatMoney(result.averageOrderValue, currentLang);
    els.stanTransactionFeePct.textContent = formatPercent(result.stanTransactionFeePct, currentLang);
    els.planFee.textContent = formatMoney(result.planFee, currentLang);
    els.processorRatePct.textContent = formatPercent(result.processorRatePct, currentLang);
    els.processorFees.textContent = formatMoney(result.processorFees, currentLang);
    els.payoutFees.textContent = formatMoney(result.payoutFees, currentLang);
    els.refundLoss.textContent = formatMoney(result.refundLoss, currentLang);
    els.annualizedNetProfit.textContent = formatMoney(result.annualizedNetProfit, currentLang);
    els.targetGap.textContent = formatNullableMoney(result.targetGap);
    els.summary.value = result.summary;
    renderComparison(result.comparisonRows);
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      const eventName = els[id].tagName === 'SELECT' ? 'change' : 'input';
      els[id].addEventListener(eventName, render);
    });
    checkboxIds.forEach((id) => {
      els[id].addEventListener('change', render);
    });

    els.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      renderStaticText();
      render();
    });

    els.copyBtn.addEventListener('click', async () => {
      try {
        if (!els.summary.value) {
          render();
        }
        await navigator.clipboard.writeText(els.summary.value);
        els.status.textContent = TEXT[currentLang].copied;
        els.status.className = 'status good';
      } catch (_error) {
        els.status.textContent = TEXT[currentLang].copyFail;
        els.status.className = 'status warn';
      }
    });

    els.resetBtn.addEventListener('click', () => {
      applyDefaults();
      renderStaticText();
      render();
    });
  }

  applyDefaults();
  renderStaticText();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
