(function (root) {
  const MODE_PRESETS = {
    personalGoods: {
      key: 'personalGoods',
      ratePct: 2.99,
      fixedFee: 0,
      title: 'Personal goods & services',
      titleKo: '개인 계정 상품·서비스 결제',
      note: 'Official Venmo fee for personal-account payments marked as goods and services.'
    },
    businessProfile: {
      key: 'businessProfile',
      ratePct: 1.9,
      fixedFee: 0.10,
      title: 'Business profile',
      titleKo: '비즈니스 프로필',
      note: 'Official Venmo business profile rate except Tap to Pay.'
    },
    businessTapToPay: {
      key: 'businessTapToPay',
      ratePct: 2.29,
      fixedFee: 0.09,
      title: 'Business profile Tap to Pay',
      titleKo: '비즈니스 프로필 Tap to Pay',
      note: 'Official Venmo Tap to Pay business-profile rate.'
    },
    charityProfile: {
      key: 'charityProfile',
      ratePct: 1.9,
      fixedFee: 0.10,
      title: 'Charity profile',
      titleKo: '자선단체 프로필',
      note: 'Official Venmo charity profile rate.'
    }
  };

  const DEFAULTS = {
    receivingMode: 'personalGoods',
    transactionCount: 80,
    averagePaymentAmount: 45,
    refundRatePct: 2,
    transferMethod: 'standard',
    transferCount: 1,
    otherMonthlyCost: 120,
    desiredMonthlyNetProfit: 4000,
    currency: 'USD'
  };

  const TRANSFER_SETTINGS = {
    standard: { ratePct: 0, minFee: 0, maxFee: 0 },
    instant: { ratePct: 1.75, minFee: 0.25, maxFee: 25 }
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      receivingMode: 'Choose a supported receiving mode.',
      transactionCount: 'Monthly payment count must be a whole number that is 0 or greater.',
      averagePaymentAmount: 'Average payment amount must be 0 or greater.',
      refundRatePct: 'Refund rate must be 0 or above and below 100%.',
      transferMethod: 'Transfer method must be standard or instant.',
      transferCount: 'Transfer count must be a whole number that is 0 or greater.',
      otherMonthlyCost: 'Fixed monthly cost must be 0 or greater.',
      desiredMonthlyNetProfit: 'Target monthly net profit must be 0 or greater.',
      waiting: 'Enter your Venmo assumptions to see take-home math.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy the summary manually.',
      statusGood: 'Under these assumptions, the selected Venmo flow stays profitable.',
      statusWarn: 'Under these assumptions, fee drag and fixed cost push the scenario underwater.',
      na: 'N/A',
      summaryTitle: '[Venmo Fee Calculator Summary]',
      assumptionNote: 'Defaults reflect Venmo public fee tables at build time: personal goods 2.99%, business 1.9% + $0.10, Tap to Pay 2.29% + $0.09, charity 1.9% + $0.10, and instant transfer 1.75% with a $0.25 minimum and $25 maximum per transfer. Refunds are modeled conservatively without fee reversals.'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      receivingMode: '지원되는 수취 유형을 선택해주세요.',
      transactionCount: '월 결제 건수는 0 이상의 정수여야 합니다.',
      averagePaymentAmount: '평균 결제 금액은 0 이상이어야 합니다.',
      refundRatePct: '환불률은 0 이상 100 미만이어야 합니다.',
      transferMethod: '정산 방식은 standard 또는 instant 여야 합니다.',
      transferCount: '월 정산 횟수는 0 이상의 정수여야 합니다.',
      otherMonthlyCost: '월 고정비는 0 이상이어야 합니다.',
      desiredMonthlyNetProfit: '목표 월 순이익은 0 이상이어야 합니다.',
      waiting: 'Venmo 가정을 입력하면 실수령 계산이 표시됩니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      statusGood: '현재 가정에서는 선택한 Venmo 수취 방식이 흑자입니다.',
      statusWarn: '현재 가정에서는 수수료와 고정비 때문에 적자입니다.',
      na: '해당 없음',
      summaryTitle: '[Venmo 수수료 계산기 요약]',
      assumptionNote: '기본값은 도구 제작 시점의 Venmo 공개 수수료표를 반영합니다: 개인 상품·서비스 2.99%, 비즈니스 1.9% + $0.10, Tap to Pay 2.29% + $0.09, 자선단체 1.9% + $0.10, 즉시 정산 1.75%(건당 최소 $0.25, 최대 $25). 환불은 수수료 환급이 없다는 보수적 가정으로 처리합니다.'
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeInput(input) {
    return {
      receivingMode: input.receivingMode || DEFAULTS.receivingMode,
      transactionCount: Number(input.transactionCount),
      averagePaymentAmount: Number(input.averagePaymentAmount),
      refundRatePct: Number(input.refundRatePct),
      transferMethod: input.transferMethod || DEFAULTS.transferMethod,
      transferCount: Number(input.transferCount),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!MODE_PRESETS[input.receivingMode]) {
      return t.receivingMode;
    }
    if (!Number.isFinite(input.transactionCount) || input.transactionCount < 0 || !Number.isInteger(input.transactionCount)) {
      return t.transactionCount;
    }
    if (!Number.isFinite(input.averagePaymentAmount) || input.averagePaymentAmount < 0) {
      return t.averagePaymentAmount;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refundRatePct;
    }
    if (!TRANSFER_SETTINGS[input.transferMethod]) {
      return t.transferMethod;
    }
    if (!Number.isFinite(input.transferCount) || input.transferCount < 0 || !Number.isInteger(input.transferCount)) {
      return t.transferCount;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.otherMonthlyCost;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.desiredMonthlyNetProfit;
    }

    return '';
  }

  function getModeMeta(modeKey, lang) {
    const mode = MODE_PRESETS[modeKey];
    if (!mode) {
      return null;
    }
    return {
      ...mode,
      label: lang === 'ko' ? mode.titleKo : mode.title
    };
  }

  function calculateTransferFees(balanceBeforeTransfer, transferMethod, transferCount) {
    if (transferMethod !== 'instant' || transferCount <= 0 || balanceBeforeTransfer <= 0) {
      return {
        transferFeeTotal: 0,
        perTransferGross: transferCount > 0 ? balanceBeforeTransfer / transferCount : 0,
        transferFeePerTransfer: 0
      };
    }

    const settings = TRANSFER_SETTINGS.instant;
    const perTransferGross = balanceBeforeTransfer / transferCount;
    const transferFeePerTransfer = clamp(perTransferGross * (settings.ratePct / 100), settings.minFee, settings.maxFee);
    return {
      transferFeeTotal: transferFeePerTransfer * transferCount,
      perTransferGross,
      transferFeePerTransfer
    };
  }

  function calculateScenario(input, modeKey) {
    const mode = MODE_PRESETS[modeKey || input.receivingMode];
    const grossVolume = input.transactionCount * input.averagePaymentAmount;
    const refundLossTotal = grossVolume * (input.refundRatePct / 100);
    const successfulVolume = grossVolume - refundLossTotal;
    const venmoFeeTotal = grossVolume * (mode.ratePct / 100) + input.transactionCount * mode.fixedFee;
    const balanceBeforeTransfer = successfulVolume - venmoFeeTotal;
    const transfer = calculateTransferFees(Math.max(balanceBeforeTransfer, 0), input.transferMethod, input.transferCount);
    const takeHomeBeforeFixedCost = balanceBeforeTransfer - transfer.transferFeeTotal;
    const monthlyNetProfit = takeHomeBeforeFixedCost - input.otherMonthlyCost;
    const effectiveFeeRatePct = grossVolume > 0 ? ((grossVolume - takeHomeBeforeFixedCost) / grossVolume) * 100 : 0;
    const effectiveVenmoFeeRatePct = grossVolume > 0 ? (venmoFeeTotal / grossVolume) * 100 : 0;
    const averageNetPerPayment = input.transactionCount > 0 ? monthlyNetProfit / input.transactionCount : 0;

    return {
      modeKey: mode.key,
      modeLabel: mode.title,
      modeLabelKo: mode.titleKo,
      grossVolume,
      refundLossTotal,
      successfulVolume,
      venmoFeeTotal,
      balanceBeforeTransfer,
      transferFeeTotal: transfer.transferFeeTotal,
      transferFeePerTransfer: transfer.transferFeePerTransfer,
      perTransferGross: transfer.perTransferGross,
      takeHomeBeforeFixedCost,
      monthlyNetProfit,
      effectiveFeeRatePct,
      effectiveVenmoFeeRatePct,
      averageNetPerPayment
    };
  }

  function findRequiredAveragePayment(input, modeKey, targetNet) {
    if (input.transactionCount <= 0) {
      return null;
    }

    const desired = Number(targetNet);
    if (!Number.isFinite(desired) || desired < 0) {
      return null;
    }

    const base = { ...input };
    let low = 0;
    let high = Math.max(base.averagePaymentAmount || 1, 1);
    let guard = 0;

    while (calculateScenario({ ...base, averagePaymentAmount: high }, modeKey).monthlyNetProfit < desired && guard < 80) {
      high *= 2;
      guard += 1;
      if (high > 1e9) {
        return null;
      }
    }

    for (let i = 0; i < 80; i += 1) {
      const mid = (low + high) / 2;
      const net = calculateScenario({ ...base, averagePaymentAmount: mid }, modeKey).monthlyNetProfit;
      if (net >= desired) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function findBreakEvenTransactionCount(input, modeKey) {
    if (input.averagePaymentAmount <= 0) {
      return null;
    }

    const base = { ...input, transactionCount: 0 };
    if (calculateScenario({ ...base, transactionCount: 0 }, modeKey).monthlyNetProfit >= 0) {
      return 0;
    }

    let low = 0;
    let high = Math.max(input.transactionCount || 1, 1);
    let guard = 0;

    while (calculateScenario({ ...base, transactionCount: high }, modeKey).monthlyNetProfit < 0 && guard < 80) {
      high *= 2;
      guard += 1;
      if (high > 1e7) {
        return null;
      }
    }

    while (low + 1 < high) {
      const mid = Math.floor((low + high) / 2);
      const net = calculateScenario({ ...base, transactionCount: mid }, modeKey).monthlyNetProfit;
      if (net >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function buildComparisonRows(input) {
    return Object.keys(MODE_PRESETS).map((modeKey) => {
      const scenario = calculateScenario(input, modeKey);
      return {
        modeKey,
        ...scenario,
        breakEvenTransactionCount: findBreakEvenTransactionCount(input, modeKey),
        targetAveragePaymentAmount: findRequiredAveragePayment(input, modeKey, input.desiredMonthlyNetProfit)
      };
    });
  }

  function formatMoney(value, lang, currency) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
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

  function roundScenarioValues(result) {
    return {
      ...result,
      grossVolume: round2(result.grossVolume),
      refundLossTotal: round2(result.refundLossTotal),
      successfulVolume: round2(result.successfulVolume),
      venmoFeeTotal: round2(result.venmoFeeTotal),
      balanceBeforeTransfer: round2(result.balanceBeforeTransfer),
      transferFeeTotal: round2(result.transferFeeTotal),
      transferFeePerTransfer: round2(result.transferFeePerTransfer),
      perTransferGross: round2(result.perTransferGross),
      takeHomeBeforeFixedCost: round2(result.takeHomeBeforeFixedCost),
      monthlyNetProfit: round2(result.monthlyNetProfit),
      effectiveFeeRatePct: round2(result.effectiveFeeRatePct),
      effectiveVenmoFeeRatePct: round2(result.effectiveVenmoFeeRatePct),
      averageNetPerPayment: round2(result.averageNetPerPayment)
    };
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const modeMeta = getModeMeta(result.inputs.receivingMode, lang);
    return [
      t.summaryTitle,
      `${lang === 'ko' ? '수취 방식' : 'Receiving mode'}: ${modeMeta.label}`,
      `${lang === 'ko' ? '월 결제 건수' : 'Monthly payment count'}: ${result.inputs.transactionCount}`,
      `${lang === 'ko' ? '평균 결제 금액' : 'Average payment amount'}: ${formatMoney(result.inputs.averagePaymentAmount, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '환불률' : 'Refund rate'}: ${formatPercent(result.inputs.refundRatePct, lang)}`,
      `${lang === 'ko' ? '정산 방식' : 'Transfer method'}: ${result.inputs.transferMethod}`,
      `${lang === 'ko' ? '월 총 결제액' : 'Gross payment volume'}: ${formatMoney(result.grossVolume, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLossTotal, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? 'Venmo 거래 수수료' : 'Venmo transaction fees'}: ${formatMoney(result.venmoFeeTotal, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '정산 수수료' : 'Transfer fees'}: ${formatMoney(result.transferFeeTotal, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '고정비 전 실수령' : 'Take-home before fixed cost'}: ${formatMoney(result.takeHomeBeforeFixedCost, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '월 순이익' : 'Monthly net profit'}: ${formatMoney(result.monthlyNetProfit, lang, result.inputs.currency)}`,
      `${lang === 'ko' ? '실효 수수료율' : 'Effective fee rate'}: ${formatPercent(result.effectiveFeeRatePct, lang)}`,
      `${lang === 'ko' ? '손익분기 결제 건수' : 'Break-even payment count'}: ${result.breakEvenTransactionCount == null ? t.na : result.breakEvenTransactionCount}`,
      `${lang === 'ko' ? '목표 순이익용 평균 결제 금액' : 'Required average payment for target net'}: ${result.targetAveragePaymentAmount == null ? t.na : formatMoney(result.targetAveragePaymentAmount, lang, result.inputs.currency)}`,
      t.assumptionNote
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const current = roundScenarioValues(calculateScenario(normalized, normalized.receivingMode));
    const comparisonRows = buildComparisonRows(normalized).map(roundScenarioValues);
    const breakEvenTransactionCount = findBreakEvenTransactionCount(normalized, normalized.receivingMode);
    const targetAveragePaymentAmount = findRequiredAveragePayment(normalized, normalized.receivingMode, normalized.desiredMonthlyNetProfit);

    const result = {
      inputs: normalized,
      ...current,
      breakEvenTransactionCount,
      targetAveragePaymentAmount: targetAveragePaymentAmount == null ? null : round2(targetAveragePaymentAmount),
      comparisonRows,
      summary: ''
    };

    result.summary = buildSummary(result, lang);
    return { result, error: '' };
  }

  const api = {
    MODE_PRESETS,
    DEFAULTS,
    TRANSFER_SETTINGS,
    TEXT,
    normalizeInput,
    validate,
    getModeMeta,
    calculateTransferFees,
    calculateScenario,
    findRequiredAveragePayment,
    findBreakEvenTransactionCount,
    buildComparisonRows,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.VenmoFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    en: {
      pageTitle: 'Venmo Fee Calculator | 벤모 수수료 계산기',
      title: 'Venmo Fee Calculator',
      subtitle: 'Model Venmo take-home for personal goods & services, business profiles, Tap to Pay, and charity profiles — including instant transfer fee drag.',
      disclaimer: 'Built from Venmo public fee tables. Use it as a planning model; confirm your live account details before pricing or fundraising decisions.',
      back: '← Tools',
      lang: 'KR',
      inputs: 'Inputs',
      assumptions: 'Assumptions & interpretation',
      results: 'Key KPIs',
      detail: 'Calculation detail',
      comparison: 'Mode comparison',
      summary: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      receivingMode: 'Receiving mode',
      transactionCount: 'Monthly payment count',
      averagePaymentAmount: 'Average payment amount',
      refundRatePct: 'Refund rate (%)',
      transferMethod: 'Transfer method',
      transferCount: 'Transfer count per month',
      otherMonthlyCost: 'Fixed monthly cost',
      desiredMonthlyNetProfit: 'Target monthly net profit',
      standard: 'Standard transfer',
      instant: 'Instant transfer',
      note1: 'Personal goods & services fees are modeled at the official 2.99% rate.',
      note2: 'Business profile fees use 1.9% + $0.10, while Tap to Pay uses 2.29% + $0.09.',
      note3: 'Instant transfer uses the public 1.75% fee with a $0.25 minimum and $25 maximum per transfer.',
      note4: 'Refunds are modeled conservatively as lost revenue without fee reversals.',
      kpiGross: 'Gross volume',
      kpiNet: 'Monthly net profit',
      kpiFees: 'Total fee drag',
      kpiBreakEven: 'Break-even payment count',
      kpiTarget: 'Average payment for target net',
      kpiRate: 'Effective fee rate',
      detailRefunds: 'Refund loss',
      detailVenmoFees: 'Venmo fees',
      detailTransferFees: 'Transfer fees',
      detailPreFixed: 'Take-home before fixed cost',
      detailSuccessful: 'Successful volume after refunds',
      detailPerTransfer: 'Fee per transfer',
      detailPerPayment: 'Net per payment',
      detailPerTransferGross: 'Average balance per transfer',
      tableMode: 'Mode',
      tableFee: 'Venmo fees',
      tableTransfer: 'Transfer fees',
      tableNet: 'Monthly net',
      tableBreakEven: 'Break-even count',
      tableTarget: 'Target avg payment',
      empty: 'Valid inputs will render the Venmo take-home model here.'
    },
    ko: {
      pageTitle: 'Venmo Fee Calculator | 벤모 수수료 계산기',
      title: 'Venmo 수수료 계산기',
      subtitle: '개인 상품·서비스 결제, 비즈니스 프로필, Tap to Pay, 자선단체 프로필별 Venmo 실수령액과 즉시 정산 수수료 부담을 계산합니다.',
      disclaimer: 'Venmo 공개 수수료표 기반 planning model입니다. 실제 계정 요율과 정책은 반드시 직접 확인하세요.',
      back: '← 도구 목록',
      lang: 'EN',
      inputs: '입력값',
      assumptions: '가정 및 해석',
      results: '핵심 KPI',
      detail: '세부 계산',
      comparison: '수취 방식 비교',
      summary: '복사용 요약',
      copy: '요약 복사',
      reset: '기본값 복원',
      receivingMode: '수취 방식',
      transactionCount: '월 결제 건수',
      averagePaymentAmount: '평균 결제 금액',
      refundRatePct: '환불률 (%)',
      transferMethod: '정산 방식',
      transferCount: '월 정산 횟수',
      otherMonthlyCost: '월 고정비',
      desiredMonthlyNetProfit: '목표 월 순이익',
      standard: '일반 정산',
      instant: '즉시 정산',
      note1: '개인 상품·서비스 결제는 공식 2.99% 수수료로 계산합니다.',
      note2: '비즈니스 프로필은 1.9% + $0.10, Tap to Pay는 2.29% + $0.09를 사용합니다.',
      note3: '즉시 정산은 공개 수수료인 1.75%를 적용하되 건당 최소 $0.25, 최대 $25를 반영합니다.',
      note4: '환불은 수수료 환급이 없다는 보수적 가정으로 손실 처리합니다.',
      kpiGross: '월 총 결제액',
      kpiNet: '월 순이익',
      kpiFees: '총 수수료 부담',
      kpiBreakEven: '손익분기 결제 건수',
      kpiTarget: '목표 순이익용 평균 결제 금액',
      kpiRate: '실효 수수료율',
      detailRefunds: '환불 손실',
      detailVenmoFees: 'Venmo 거래 수수료',
      detailTransferFees: '정산 수수료',
      detailPreFixed: '고정비 전 실수령',
      detailSuccessful: '환불 후 실제 보전 매출',
      detailPerTransfer: '건당 정산 수수료',
      detailPerPayment: '결제 1건당 순이익',
      detailPerTransferGross: '정산 1회당 평균 잔액',
      tableMode: '수취 방식',
      tableFee: 'Venmo 수수료',
      tableTransfer: '정산 수수료',
      tableNet: '월 순이익',
      tableBreakEven: '손익분기 건수',
      tableTarget: '목표 평균 결제 금액',
      empty: '유효한 입력값을 넣으면 Venmo 실수령 모델이 표시됩니다.'
    }
  };

  const fieldIds = [
    'receivingMode',
    'transactionCount',
    'averagePaymentAmount',
    'refundRatePct',
    'transferMethod',
    'transferCount',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit'
  ];

  const els = {
    titleNode: document.querySelector('title'),
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
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    emptyState: document.getElementById('resultsEmpty'),
    resultsContent: document.getElementById('resultsContent'),
    summary: document.getElementById('summary'),
    comparisonBody: document.getElementById('comparisonBody')
  };

  fieldIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });

  [
    'grossVolume',
    'monthlyNetProfit',
    'totalFeeDrag',
    'breakEvenTransactionCount',
    'targetAveragePaymentAmount',
    'effectiveFeeRatePct',
    'refundLossTotal',
    'venmoFeeTotal',
    'transferFeeTotal',
    'takeHomeBeforeFixedCost',
    'successfulVolume',
    'transferFeePerTransfer',
    'averageNetPerPayment',
    'perTransferGross'
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  let currentLang = 'en';

  function setInputValue(id, value) {
    els[id].value = value;
  }

  function collectInput() {
    return {
      receivingMode: els.receivingMode.value,
      transactionCount: els.transactionCount.value,
      averagePaymentAmount: els.averagePaymentAmount.value,
      refundRatePct: els.refundRatePct.value,
      transferMethod: els.transferMethod.value,
      transferCount: els.transferCount.value,
      otherMonthlyCost: els.otherMonthlyCost.value,
      desiredMonthlyNetProfit: els.desiredMonthlyNetProfit.value,
      currency: 'USD'
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (els[key]) {
        setInputValue(key, value);
      }
    });
  }

  function populateSelects() {
    const modeOptions = Object.values(MODE_PRESETS).map((mode) => `
      <option value="${mode.key}">${currentLang === 'ko' ? mode.titleKo : mode.title}</option>
    `).join('');
    els.receivingMode.innerHTML = modeOptions;

    const ui = UI_TEXT[currentLang];
    els.transferMethod.innerHTML = `
      <option value="standard">${ui.standard}</option>
      <option value="instant">${ui.instant}</option>
    `;
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.titleNode.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.langBtn.textContent = ui.lang;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.inputHeader.textContent = ui.inputs;
    els.assumptionHeader.textContent = ui.assumptions;
    els.resultsHeader.textContent = ui.results;
    els.detailHeader.textContent = ui.detail;
    els.comparisonHeader.textContent = ui.comparison;
    els.summaryHeader.textContent = ui.summary;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.emptyState.textContent = ui.empty;

    fieldIds.forEach((id) => {
      if (els[`l_${id}`]) {
        els[`l_${id}`].textContent = ui[id];
      }
    });

    document.getElementById('note1').textContent = ui.note1;
    document.getElementById('note2').textContent = ui.note2;
    document.getElementById('note3').textContent = ui.note3;
    document.getElementById('note4').textContent = ui.note4;

    document.querySelector('[data-kpi="grossVolume"]').textContent = ui.kpiGross;
    document.querySelector('[data-kpi="monthlyNetProfit"]').textContent = ui.kpiNet;
    document.querySelector('[data-kpi="totalFeeDrag"]').textContent = ui.kpiFees;
    document.querySelector('[data-kpi="breakEvenTransactionCount"]').textContent = ui.kpiBreakEven;
    document.querySelector('[data-kpi="targetAveragePaymentAmount"]').textContent = ui.kpiTarget;
    document.querySelector('[data-kpi="effectiveFeeRatePct"]').textContent = ui.kpiRate;

    document.querySelector('[data-detail="refundLossTotal"]').textContent = ui.detailRefunds;
    document.querySelector('[data-detail="venmoFeeTotal"]').textContent = ui.detailVenmoFees;
    document.querySelector('[data-detail="transferFeeTotal"]').textContent = ui.detailTransferFees;
    document.querySelector('[data-detail="takeHomeBeforeFixedCost"]').textContent = ui.detailPreFixed;
    document.querySelector('[data-detail="successfulVolume"]').textContent = ui.detailSuccessful;
    document.querySelector('[data-detail="transferFeePerTransfer"]').textContent = ui.detailPerTransfer;
    document.querySelector('[data-detail="averageNetPerPayment"]').textContent = ui.detailPerPayment;
    document.querySelector('[data-detail="perTransferGross"]').textContent = ui.detailPerTransferGross;

    document.getElementById('tableMode').textContent = ui.tableMode;
    document.getElementById('tableFee').textContent = ui.tableFee;
    document.getElementById('tableTransfer').textContent = ui.tableTransfer;
    document.getElementById('tableNet').textContent = ui.tableNet;
    document.getElementById('tableBreakEven').textContent = ui.tableBreakEven;
    document.getElementById('tableTarget').textContent = ui.tableTarget;
  }

  function formatNullableMoney(value, currency) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatMoney(value, currentLang, currency);
  }

  function formatNullableNumber(value) {
    const t = TEXT[currentLang] || TEXT.en;
    if (value == null) {
      return t.na;
    }
    return new Intl.NumberFormat(currentLang === 'ko' ? 'ko-KR' : 'en-US', { maximumFractionDigits: 0 }).format(value);
  }

  function clearOutputs() {
    [
      'grossVolume',
      'monthlyNetProfit',
      'totalFeeDrag',
      'breakEvenTransactionCount',
      'targetAveragePaymentAmount',
      'effectiveFeeRatePct',
      'refundLossTotal',
      'venmoFeeTotal',
      'transferFeeTotal',
      'takeHomeBeforeFixedCost',
      'successfulVolume',
      'transferFeePerTransfer',
      'averageNetPerPayment',
      'perTransferGross'
    ].forEach((id) => {
      els[id].textContent = '—';
    });
    els.comparisonBody.innerHTML = '';
    els.summary.value = '';
  }

  function renderComparison(rows, selectedMode, currency) {
    const locale = currentLang === 'ko' ? 'ko-KR' : 'en-US';
    return rows.map((row) => {
      const meta = getModeMeta(row.modeKey, currentLang);
      return `
        <tr>
          <td>${row.modeKey === selectedMode ? '<strong>' : ''}${meta.label}${row.modeKey === selectedMode ? '</strong>' : ''}</td>
          <td>${formatMoney(row.venmoFeeTotal, currentLang, currency)}</td>
          <td>${formatMoney(row.transferFeeTotal, currentLang, currency)}</td>
          <td class="${row.monthlyNetProfit >= 0 ? 'good' : 'warn'}">${formatMoney(row.monthlyNetProfit, currentLang, currency)}</td>
          <td>${formatNullableNumber(row.breakEvenTransactionCount)}</td>
          <td>${formatNullableMoney(row.targetAveragePaymentAmount, currency)}</td>
        </tr>
      `;
    }).join('');
  }

  function render() {
    const uiText = TEXT[currentLang] || TEXT.en;
    const { result, error } = calculate(collectInput(), { lang: currentLang });

    if (error) {
      els.error.textContent = error || uiText.invalid;
      els.error.classList.add('show');
      els.status.textContent = uiText.waiting;
      els.status.className = 'status';
      els.resultsContent.hidden = true;
      els.emptyState.hidden = false;
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.resultsContent.hidden = false;
    els.emptyState.hidden = true;
    els.status.textContent = result.monthlyNetProfit >= 0 ? uiText.statusGood : uiText.statusWarn;
    els.status.className = `status ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;

    const currency = result.inputs.currency;
    const totalFeeDrag = round2(result.venmoFeeTotal + result.transferFeeTotal + result.refundLossTotal);

    els.grossVolume.textContent = formatMoney(result.grossVolume, currentLang, currency);
    els.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit, currentLang, currency);
    els.totalFeeDrag.textContent = formatMoney(totalFeeDrag, currentLang, currency);
    els.breakEvenTransactionCount.textContent = formatNullableNumber(result.breakEvenTransactionCount);
    els.targetAveragePaymentAmount.textContent = formatNullableMoney(result.targetAveragePaymentAmount, currency);
    els.effectiveFeeRatePct.textContent = formatPercent(result.effectiveFeeRatePct, currentLang);
    els.refundLossTotal.textContent = formatMoney(result.refundLossTotal, currentLang, currency);
    els.venmoFeeTotal.textContent = formatMoney(result.venmoFeeTotal, currentLang, currency);
    els.transferFeeTotal.textContent = formatMoney(result.transferFeeTotal, currentLang, currency);
    els.takeHomeBeforeFixedCost.textContent = formatMoney(result.takeHomeBeforeFixedCost, currentLang, currency);
    els.successfulVolume.textContent = formatMoney(result.successfulVolume, currentLang, currency);
    els.transferFeePerTransfer.textContent = formatMoney(result.transferFeePerTransfer, currentLang, currency);
    els.averageNetPerPayment.textContent = formatMoney(result.averageNetPerPayment, currentLang, currency);
    els.perTransferGross.textContent = formatMoney(result.perTransferGross, currentLang, currency);
    els.comparisonBody.innerHTML = renderComparison(result.comparisonRows, result.inputs.receivingMode, currency);
    els.summary.value = result.summary;
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      els[id].addEventListener('input', render);
      els[id].addEventListener('change', render);
    });

    els.langBtn.addEventListener('click', () => {
      const currentValues = collectInput();
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      populateSelects();
      renderStaticText();
      Object.entries(currentValues).forEach(([key, value]) => {
        if (els[key]) {
          els[key].value = value;
        }
      });
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
      } catch (error) {
        els.status.textContent = TEXT[currentLang].copyFail;
        els.status.className = 'status warn';
      }
    });

    els.resetBtn.addEventListener('click', () => {
      applyDefaults();
      populateSelects();
      renderStaticText();
      render();
    });
  }

  populateSelects();
  applyDefaults();
  renderStaticText();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
