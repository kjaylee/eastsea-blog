(function (root) {
  const DEFAULTS = {
    transactionCount: 120,
    averageSupportAmount: 10,
    refundRatePct: 0,
    coverCardFeeFromSupporters: false,
    processorFeeCoveredBySupportersPct: 0,
    platformFeeRatePct: 5,
    processingRatePct: 2.9,
    processingFixedFee: 0.3,
    payoutRatePct: 0.5,
    rewardCostPerTransaction: 0,
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 1000,
    currency: 'USD'
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      transactionCount: 'Transaction count must be a whole number that is 0 or greater.',
      averageSupportAmount: 'Average support amount must be 0 or greater.',
      refundRatePct: 'Refund rate must be 0 or above and below 100%.',
      platformFeeRatePct: 'Platform fee must be 0 or above and below 100%.',
      processingRatePct: 'Processing rate must be 0 or above and below 100%.',
      processingFixedFee: 'Processing fixed fee must be 0 or above.',
      payoutRatePct: 'Payout fee must be 0 or above and below 100%.',
      rewardCostPerTransaction: 'Reward cost per transaction must be 0 or above.',
      otherMonthlyCost: 'Other monthly cost must be 0 or above.',
      desiredMonthlyNetProfit: 'Desired monthly net profit must be 0 or above.',
      waiting: 'Enter your monthly support assumptions to see the Buy Me a Coffee take-home math.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy the summary manually.',
      statusGood: 'Under these assumptions, Buy Me a Coffee stays profitable.',
      statusWarn: 'Under these assumptions, your pricing is underwater. Re-check fees, refunds, and fixed costs.',
      currentScenarioLabel: 'Current scenario',
      alternateScenarioLabel: 'Alternate scenario',
      creatorCovers: 'Creator covers card fees',
      supporterCovers: 'Supporters cover card fees',
      na: 'N/A',
      summaryTitle: '[Buy Me a Coffee Fee Calculator Summary]',
      note: 'Defaults reflect public Buy Me a Coffee help docs at the time this tool was built: 5% platform fee, Stripe card processing baseline 2.9% + $0.30, and 0.5% payout drag. Verify your own live rates before making pricing decisions.'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      transactionCount: '월 거래 건수는 0 이상의 정수여야 합니다.',
      averageSupportAmount: '평균 후원 금액은 0 이상이어야 합니다.',
      refundRatePct: '환불률은 0 이상 100 미만이어야 합니다.',
      platformFeeRatePct: '플랫폼 수수료율은 0 이상 100 미만이어야 합니다.',
      processingRatePct: '카드 처리 수수료율은 0 이상 100 미만이어야 합니다.',
      processingFixedFee: '고정 카드 수수료는 0 이상이어야 합니다.',
      payoutRatePct: '정산 수수료율은 0 이상 100 미만이어야 합니다.',
      rewardCostPerTransaction: '거래당 보상 원가는 0 이상이어야 합니다.',
      otherMonthlyCost: '월 고정비는 0 이상이어야 합니다.',
      desiredMonthlyNetProfit: '목표 월 순이익은 0 이상이어야 합니다.',
      waiting: '월 후원 가정을 입력하면 Buy Me a Coffee 순수령액이 계산됩니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 쓸 수 없어 수동 복사가 필요합니다.',
      statusGood: '현재 가정에서는 Buy Me a Coffee 운영이 흑자입니다.',
      statusWarn: '현재 가정에서는 적자입니다. 가격, 환불, 수수료, 고정비를 다시 점검하세요.',
      currentScenarioLabel: '현재 시나리오',
      alternateScenarioLabel: '대체 시나리오',
      creatorCovers: '크리에이터가 카드 수수료 부담',
      supporterCovers: '후원자가 카드 수수료 부담',
      na: '해당 없음',
      summaryTitle: '[Buy Me a Coffee 수수료 계산기 요약]',
      note: '기본값은 도구 제작 시점의 Buy Me a Coffee 공개 안내를 반영합니다: 5% 플랫폼 수수료, Stripe 카드 처리 기준 2.9% + $0.30, 그리고 0.5% payout drag. 실제 요율은 계정과 국가에 따라 달라질 수 있으니 반드시 직접 확인하세요.'
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
    const processorFeeCoveredBySupportersPct = input.processorFeeCoveredBySupportersPct == null
      ? (toBoolean(input.coverCardFeeFromSupporters) ? 100 : 0)
      : Number(input.processorFeeCoveredBySupportersPct);

    const coverCardFeeFromSupporters = input.coverCardFeeFromSupporters == null
      ? processorFeeCoveredBySupportersPct >= 100
      : toBoolean(input.coverCardFeeFromSupporters);

    return {
      transactionCount: Number(input.transactionCount),
      averageSupportAmount: Number(input.averageSupportAmount),
      refundRatePct: Number(input.refundRatePct),
      coverCardFeeFromSupporters,
      processorFeeCoveredBySupportersPct,
      platformFeeRatePct: Number(input.platformFeeRatePct),
      processingRatePct: Number(input.processingRatePct),
      processingFixedFee: Number(input.processingFixedFee),
      payoutRatePct: Number(input.payoutRatePct),
      rewardCostPerTransaction: Number(input.rewardCostPerTransaction),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function getScenarioMode(input) {
    return input.coverCardFeeFromSupporters || input.processorFeeCoveredBySupportersPct >= 100
      ? 'supporterCovers'
      : 'creatorCovers';
  }

  function scenarioLabel(mode, lang) {
    const t = TEXT[lang] || TEXT.en;
    return mode === 'supporterCovers' ? t.supporterCovers : t.creatorCovers;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.transactionCount) || input.transactionCount < 0 || !Number.isInteger(input.transactionCount)) {
      return t.transactionCount;
    }
    if (!Number.isFinite(input.averageSupportAmount) || input.averageSupportAmount < 0) {
      return t.averageSupportAmount;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refundRatePct;
    }
    if (!Number.isFinite(input.platformFeeRatePct) || input.platformFeeRatePct < 0 || input.platformFeeRatePct >= 100) {
      return t.platformFeeRatePct;
    }
    if (!Number.isFinite(input.processingRatePct) || input.processingRatePct < 0 || input.processingRatePct >= 100) {
      return t.processingRatePct;
    }
    if (!Number.isFinite(input.processingFixedFee) || input.processingFixedFee < 0) {
      return t.processingFixedFee;
    }
    if (!Number.isFinite(input.payoutRatePct) || input.payoutRatePct < 0 || input.payoutRatePct >= 100) {
      return t.payoutRatePct;
    }
    if (!Number.isFinite(input.rewardCostPerTransaction) || input.rewardCostPerTransaction < 0) {
      return t.rewardCostPerTransaction;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.otherMonthlyCost;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.desiredMonthlyNetProfit;
    }

    return '';
  }

  function calculateScenario(input, mode) {
    const count = input.transactionCount;
    const avg = input.averageSupportAmount;
    const refundRate = input.refundRatePct / 100;
    const platformRate = input.platformFeeRatePct / 100;
    const processingRate = input.processingRatePct / 100;
    const payoutRate = input.payoutRatePct / 100;
    const grossBillings = count * avg;
    const refundLossTotal = grossBillings * refundRate;
    const platformFeeTotal = grossBillings * platformRate;
    const rewardCosts = count * input.rewardCostPerTransaction;

    let supporterChargeTotal = grossBillings;
    let processorCardFeeGross = grossBillings * processingRate + count * input.processingFixedFee;
    let processorCardFeeOffset = 0;
    let processorCardFeeNet = processorCardFeeGross;

    if (mode === 'supporterCovers') {
      supporterChargeTotal = processingRate >= 1 ? Number.POSITIVE_INFINITY : (grossBillings + count * input.processingFixedFee) / (1 - processingRate);
      processorCardFeeGross = supporterChargeTotal * processingRate + count * input.processingFixedFee;
      processorCardFeeOffset = processorCardFeeGross;
      processorCardFeeNet = 0;
    }

    const creatorBalanceBeforePayout = grossBillings - refundLossTotal - platformFeeTotal - processorCardFeeNet;
    const payoutFeeTotal = Math.max(creatorBalanceBeforePayout, 0) * payoutRate;
    const takeHomeAfterFees = creatorBalanceBeforePayout - payoutFeeTotal;
    const variableCostTotal = rewardCosts;
    const netAfterCosts = takeHomeAfterFees - variableCostTotal - input.otherMonthlyCost;
    const takeHomeBeforeOperatingCosts = takeHomeAfterFees;
    const monthlyNetProfit = netAfterCosts;
    const extraSupporterCharge = supporterChargeTotal - grossBillings;
    const effectiveTakeHomeRatePct = grossBillings > 0 ? (netAfterCosts / grossBillings) * 100 : 0;
    const effectiveCreatorFeeDragPct = grossBillings > 0 ? ((grossBillings - takeHomeAfterFees) / grossBillings) * 100 : 0;
    const perTransactionTakeHomeAfterCosts = count > 0 ? netAfterCosts / count : 0;
    const postPayoutUnitContribution = count > 0 ? (netAfterCosts + input.otherMonthlyCost) / count : 0;

    return {
      mode,
      scenarioLabel: scenarioLabel(mode, 'en'),
      grossBillings,
      creatorPricedGrossSupport: grossBillings,
      supporterChargeTotal,
      extraSupporterCharge,
      refundLossTotal,
      platformFeeTotal,
      processorCardFeeGross,
      processorCardFeeOffset,
      processorCardFeeNet,
      creatorBalanceBeforePayout,
      payoutFeeTotal,
      takeHomeAfterFees,
      takeHomeBeforeOperatingCosts,
      variableCostTotal,
      rewardCosts,
      netAfterCosts,
      monthlyNetProfit,
      effectiveTakeHomeRatePct,
      effectiveCreatorFeeDragPct,
      perTransactionTakeHomeAfterCosts,
      postPayoutUnitContribution
    };
  }

  function calculateAverageSupportRequired(input, mode, desiredMonthlyNetProfit) {
    const count = input.transactionCount;
    if (count === 0) {
      return null;
    }

    const refundRate = input.refundRatePct / 100;
    const platformRate = input.platformFeeRatePct / 100;
    const processingRate = input.processingRatePct / 100;
    const payoutRate = input.payoutRatePct / 100;
    const rewardCosts = count * input.rewardCostPerTransaction;
    const desired = Number(desiredMonthlyNetProfit) || 0;

    let denominator;
    let numerator;

    if (mode === 'supporterCovers') {
      denominator = count * (1 - refundRate - platformRate) * (1 - payoutRate);
      numerator = desired + input.otherMonthlyCost + rewardCosts;
    } else {
      denominator = count * (1 - refundRate - platformRate - processingRate) * (1 - payoutRate);
      numerator = desired + input.otherMonthlyCost + rewardCosts + count * input.processingFixedFee * (1 - payoutRate);
    }

    if (!Number.isFinite(denominator) || denominator <= 0) {
      return null;
    }

    return numerator / denominator;
  }

  function calculateBreakEvenTransactionCount(input, mode) {
    const avg = input.averageSupportAmount;
    const refundRate = input.refundRatePct / 100;
    const platformRate = input.platformFeeRatePct / 100;
    const processingRate = input.processingRatePct / 100;
    const payoutRate = input.payoutRatePct / 100;
    let unitContribution;

    if (mode === 'supporterCovers') {
      unitContribution = avg * (1 - refundRate - platformRate) * (1 - payoutRate) - input.rewardCostPerTransaction;
    } else {
      unitContribution = (avg * (1 - refundRate - platformRate - processingRate) - input.processingFixedFee) * (1 - payoutRate) - input.rewardCostPerTransaction;
    }

    if (!Number.isFinite(unitContribution) || unitContribution <= 0) {
      return null;
    }

    return input.otherMonthlyCost / unitContribution;
  }

  function roundScenarioValues(scenario) {
    return {
      ...scenario,
      grossBillings: round2(scenario.grossBillings),
      creatorPricedGrossSupport: round2(scenario.creatorPricedGrossSupport),
      supporterChargeTotal: round2(scenario.supporterChargeTotal),
      extraSupporterCharge: round2(scenario.extraSupporterCharge),
      refundLossTotal: round2(scenario.refundLossTotal),
      platformFeeTotal: round2(scenario.platformFeeTotal),
      processorCardFeeGross: round2(scenario.processorCardFeeGross),
      processorCardFeeOffset: round2(scenario.processorCardFeeOffset),
      processorCardFeeNet: round2(scenario.processorCardFeeNet),
      creatorBalanceBeforePayout: round2(scenario.creatorBalanceBeforePayout),
      payoutFeeTotal: round2(scenario.payoutFeeTotal),
      takeHomeAfterFees: round2(scenario.takeHomeAfterFees),
      takeHomeBeforeOperatingCosts: round2(scenario.takeHomeBeforeOperatingCosts),
      variableCostTotal: round2(scenario.variableCostTotal),
      rewardCosts: round2(scenario.rewardCosts),
      netAfterCosts: round2(scenario.netAfterCosts),
      monthlyNetProfit: round2(scenario.monthlyNetProfit),
      effectiveTakeHomeRatePct: round2(scenario.effectiveTakeHomeRatePct),
      effectiveCreatorFeeDragPct: round2(scenario.effectiveCreatorFeeDragPct),
      perTransactionTakeHomeAfterCosts: round2(scenario.perTransactionTakeHomeAfterCosts),
      postPayoutUnitContribution: round4(scenario.postPayoutUnitContribution)
    };
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

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const currency = result.inputs.currency;

    return [
      t.summaryTitle,
      `${lang === 'ko' ? '월 거래 건수' : 'Monthly transaction count'}: ${result.inputs.transactionCount}`,
      `${lang === 'ko' ? '평균 후원 금액' : 'Average support amount'}: ${formatMoney(result.inputs.averageSupportAmount, lang, currency)}`,
      `${lang === 'ko' ? '환불률' : 'Refund rate'}: ${formatPercent(result.inputs.refundRatePct, lang)}`,
      `${lang === 'ko' ? '카드 수수료 부담' : 'Card fee coverage'}: ${result.currentScenarioLabel}`,
      `${lang === 'ko' ? '총 청구액' : 'Gross support volume'}: ${formatMoney(result.grossBillings, lang, currency)}`,
      `${lang === 'ko' ? '실제 후원자 결제총액' : 'Actual supporter charge total'}: ${formatMoney(result.supporterChargeTotal, lang, currency)}`,
      `${lang === 'ko' ? '플랫폼 수수료' : 'Platform fees'}: ${formatMoney(result.platformFeeTotal, lang, currency)}`,
      `${lang === 'ko' ? '카드 처리 수수료' : 'Processing fees'}: ${formatMoney(result.processorCardFeeGross, lang, currency)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLossTotal, lang, currency)}`,
      `${lang === 'ko' ? '정산 수수료' : 'Payout fees'}: ${formatMoney(result.payoutFeeTotal, lang, currency)}`,
      `${lang === 'ko' ? '보상 원가' : 'Reward costs'}: ${formatMoney(result.rewardCosts, lang, currency)}`,
      `${lang === 'ko' ? '월 순이익' : 'Monthly net profit'}: ${formatMoney(result.monthlyNetProfit, lang, currency)}`,
      `${lang === 'ko' ? '실효 순수익률' : 'Effective take-home rate'}: ${formatPercent(result.effectiveTakeHomeRatePct, lang)}`,
      `${lang === 'ko' ? '손익분기 평균 후원 금액' : 'Break-even average support amount'}: ${result.breakEvenAverageSupportAmount == null ? t.na : formatMoney(result.breakEvenAverageSupportAmount, lang, currency)}`,
      `${lang === 'ko' ? '목표 순이익 달성 평균 후원 금액' : 'Required average support for target net'}: ${result.targetAverageSupportAmount == null ? t.na : formatMoney(result.targetAverageSupportAmount, lang, currency)}`,
      `${lang === 'ko' ? '대체 시나리오 월 순이익' : 'Alternate scenario monthly net'}: ${formatMoney(result.alternateScenario.monthlyNetProfit, lang, currency)}`,
      `${lang === 'ko' ? '대체 시나리오 대비 순이익 차이' : 'Net delta vs alternate'}: ${formatMoney(result.netProfitDeltaVsAlternate, lang, currency)}`,
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

    const currentMode = getScenarioMode(normalized);
    const alternateMode = currentMode === 'supporterCovers' ? 'creatorCovers' : 'supporterCovers';
    const currentScenario = roundScenarioValues(calculateScenario(normalized, currentMode));
    const alternateScenario = roundScenarioValues(calculateScenario(normalized, alternateMode));

    const result = {
      inputs: normalized,
      currentMode,
      alternateMode,
      currentScenarioLabel: scenarioLabel(currentMode, lang),
      alternateScenarioLabel: scenarioLabel(alternateMode, lang),
      ...currentScenario,
      breakEvenAverageSupportAmount: null,
      breakEvenAverageSupport: null,
      targetAverageSupportAmount: null,
      requiredAverageSupportForTargetNet: null,
      breakEvenMonthlyTransactions: null,
      breakEvenTransactionCount: null,
      alternateScenario,
      netProfitDeltaVsAlternate: round2(currentScenario.monthlyNetProfit - alternateScenario.monthlyNetProfit)
    };

    const breakEvenAverage = calculateAverageSupportRequired(normalized, currentMode, 0);
    const targetAverage = calculateAverageSupportRequired(normalized, currentMode, normalized.desiredMonthlyNetProfit);
    const breakEvenTransactions = calculateBreakEvenTransactionCount(normalized, currentMode);

    result.breakEvenAverageSupportAmount = breakEvenAverage == null ? null : round2(breakEvenAverage);
    result.breakEvenAverageSupport = result.breakEvenAverageSupportAmount;
    result.targetAverageSupportAmount = targetAverage == null ? null : round2(targetAverage);
    result.requiredAverageSupportForTargetNet = result.targetAverageSupportAmount;
    result.breakEvenMonthlyTransactions = breakEvenTransactions == null ? null : round2(breakEvenTransactions);
    result.breakEvenTransactionCount = result.breakEvenMonthlyTransactions;
    result.summary = buildSummary(result, { lang });

    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    TEXT,
    normalizeInput,
    validate,
    getScenarioMode,
    scenarioLabel,
    calculateScenario,
    calculateAverageSupportRequired,
    calculateBreakEvenTransactionCount,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BuyMeACoffeeFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    en: {
      pageTitle: 'Buy Me a Coffee Fee Calculator | 바이미어커피 수수료 계산기',
      title: 'Buy Me a Coffee Fee Calculator',
      subtitle: 'Model real creator take-home after the 5% platform fee, Stripe 2.9% + $0.30 card processing, 0.5% payout drag, refunds, reward costs, and fixed monthly overhead.',
      disclaimer: 'Defaults reflect public Buy Me a Coffee documentation and can change. Use this as a planning model, not a billing statement.',
      back: '← Tools',
      lang: 'KR',
      inputs: 'Inputs',
      assumptions: 'Assumptions & interpretation',
      results: 'Key KPIs',
      detail: 'Calculation detail',
      comparison: 'Current vs alternate scenario',
      summary: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      transactionCount: 'Monthly transactions',
      averageSupportAmount: 'Average support amount',
      refundRatePct: 'Refund rate (%)',
      coverCardFeeFromSupporters: 'Supporters cover card fees',
      coverHint: 'Turn this on when supporters pay the processor drag so you still receive the intended support amount after card fees.',
      platformFeeRatePct: 'Platform fee (%)',
      processingRatePct: 'Card processing rate (%)',
      processingFixedFee: 'Card processing fixed fee',
      payoutRatePct: 'Payout fee (%)',
      rewardCostPerTransaction: 'Reward / fulfillment cost per transaction',
      otherMonthlyCost: 'Fixed monthly cost',
      desiredMonthlyNetProfit: 'Target monthly net profit',
      assumption1: 'Default baseline: 5% platform fee, 2.9% + $0.30 card processing, 0.5% payout drag.',
      assumption2: 'Refunds reduce kept volume before payout and operating-cost math.',
      assumption3: 'When supporters cover card fees, this tool reverse-prices the supporter charge so the creator still receives the intended support amount after processing.',
      assumption4: 'Break-even math holds the current monthly transaction count constant and solves for the average support amount required.',
      kpiGross: 'Gross support volume',
      kpiNet: 'Monthly net profit',
      kpiBreakEven: 'Break-even average support',
      kpiTarget: 'Average support for target net',
      kpiKeepRate: 'Effective take-home rate',
      kpiDelta: 'Net delta vs alternate',
      detailSupporterChargeTotal: 'Actual supporter charge total',
      detailRefundLoss: 'Refund loss',
      detailPlatformFees: 'Platform fees',
      detailProcessingFees: 'Processing fees',
      detailPayoutFees: 'Payout fees',
      detailRewardCosts: 'Reward costs',
      detailPerTxn: 'Net profit per transaction',
      detailBreakEvenTxn: 'Break-even transactions',
      tableScenario: 'Scenario',
      tableSupporterCharge: 'Supporter charge total',
      tableNetProfit: 'Monthly net profit',
      tableBreakEven: 'Break-even average support',
      tableTarget: 'Target average support',
      tableDelta: 'Delta vs current',
      empty: 'Valid inputs will render the take-home model here.'
    },
    ko: {
      pageTitle: 'Buy Me a Coffee Fee Calculator | 바이미어커피 수수료 계산기',
      title: 'Buy Me a Coffee 수수료 계산기',
      subtitle: '5% 플랫폼 수수료, Stripe 2.9% + $0.30 카드 처리비, 0.5% payout drag, 환불, 보상 원가, 월 고정비를 반영해 실제 순수익을 계산합니다.',
      disclaimer: '기본값은 공개 문서를 기준으로 한 planning model이며 실제 요율은 바뀔 수 있습니다. 청구 명세서 대신 의사결정용으로 사용하세요.',
      back: '← Tools',
      lang: 'EN',
      inputs: '입력값',
      assumptions: '가정 및 해석',
      results: '핵심 KPI',
      detail: '세부 계산',
      comparison: '현재 vs 대체 시나리오',
      summary: '복사용 요약',
      copy: '요약 복사',
      reset: '기본값 복원',
      transactionCount: '월 거래 건수',
      averageSupportAmount: '평균 후원 금액',
      refundRatePct: '환불률 (%)',
      coverCardFeeFromSupporters: '후원자가 카드 수수료 부담',
      coverHint: '체크하면 후원자가 카드 처리 수수료를 부담해도 크리에이터는 의도한 후원 금액을 그대로 받는 구조로 계산합니다.',
      platformFeeRatePct: '플랫폼 수수료 (%)',
      processingRatePct: '카드 처리 수수료율 (%)',
      processingFixedFee: '카드 처리 고정 수수료',
      payoutRatePct: '정산 수수료 (%)',
      rewardCostPerTransaction: '거래당 보상/이행 원가',
      otherMonthlyCost: '월 고정비',
      desiredMonthlyNetProfit: '목표 월 순이익',
      assumption1: '기본 가정: 5% 플랫폼 수수료, 2.9% + $0.30 카드 처리비, 0.5% payout drag.',
      assumption2: '환불은 payout 및 운영비 계산 전에 실제 보전 매출을 줄이는 것으로 처리합니다.',
      assumption3: '후원자가 카드 수수료를 부담하는 경우, 카드 수수료를 통과시켜도 크리에이터가 원래 후원 금액을 받도록 후원자 결제총액을 역산합니다.',
      assumption4: '손익분기 계산은 현재 월 거래 건수를 고정하고 필요한 평균 후원 금액을 역산합니다.',
      kpiGross: '총 후원 매출',
      kpiNet: '월 순이익',
      kpiBreakEven: '손익분기 평균 후원 금액',
      kpiTarget: '목표 순이익용 평균 후원 금액',
      kpiKeepRate: '실효 순수익률',
      kpiDelta: '대체 시나리오 대비 순이익 차이',
      detailSupporterChargeTotal: '실제 후원자 결제총액',
      detailRefundLoss: '환불 손실',
      detailPlatformFees: '플랫폼 수수료',
      detailProcessingFees: '카드 처리 수수료',
      detailPayoutFees: '정산 수수료',
      detailRewardCosts: '보상 원가',
      detailPerTxn: '거래당 순이익',
      detailBreakEvenTxn: '손익분기 거래 수',
      tableScenario: '시나리오',
      tableSupporterCharge: '후원자 결제총액',
      tableNetProfit: '월 순이익',
      tableBreakEven: '손익분기 평균 후원 금액',
      tableTarget: '목표 평균 후원 금액',
      tableDelta: '현재 대비 차이',
      empty: '유효한 입력값을 넣으면 순수익 모델이 표시됩니다.'
    }
  };

  const fieldIds = [
    'transactionCount',
    'averageSupportAmount',
    'refundRatePct',
    'platformFeeRatePct',
    'processingRatePct',
    'processingFixedFee',
    'payoutRatePct',
    'rewardCostPerTransaction',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit'
  ];

  const checkboxIds = ['coverCardFeeFromSupporters'];

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
    coverHint: document.getElementById('coverHint'),
    alternateScenario: document.getElementById('alternateScenario')
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
    'grossBillings',
    'monthlyNetProfit',
    'breakEvenAverageSupportAmount',
    'targetAverageSupportAmount',
    'effectiveTakeHomeRatePct',
    'netProfitDeltaVsAlternate',
    'supporterChargeTotal',
    'refundLossTotal',
    'platformFeeTotal',
    'processorCardFeeGross',
    'payoutFeeTotal',
    'rewardCosts',
    'perTransactionTakeHomeAfterCosts',
    'breakEvenMonthlyTransactions'
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
      transactionCount: getInputValue('transactionCount'),
      averageSupportAmount: getInputValue('averageSupportAmount'),
      refundRatePct: getInputValue('refundRatePct'),
      coverCardFeeFromSupporters: els.coverCardFeeFromSupporters.checked,
      processorFeeCoveredBySupportersPct: els.coverCardFeeFromSupporters.checked ? 100 : 0,
      platformFeeRatePct: getInputValue('platformFeeRatePct'),
      processingRatePct: getInputValue('processingRatePct'),
      processingFixedFee: getInputValue('processingFixedFee'),
      payoutRatePct: getInputValue('payoutRatePct'),
      rewardCostPerTransaction: getInputValue('rewardCostPerTransaction'),
      otherMonthlyCost: getInputValue('otherMonthlyCost'),
      desiredMonthlyNetProfit: getInputValue('desiredMonthlyNetProfit'),
      currency: 'USD'
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (checkboxIds.includes(key)) {
        els[key].checked = Boolean(value);
      } else if (fieldIds.includes(key)) {
        setInputValue(key, value);
      }
    });
    els.coverCardFeeFromSupporters.checked = Boolean(DEFAULTS.coverCardFeeFromSupporters);
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
    els.coverHint.textContent = ui.coverHint;

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

    document.getElementById('assumption1').textContent = ui.assumption1;
    document.getElementById('assumption2').textContent = ui.assumption2;
    document.getElementById('assumption3').textContent = ui.assumption3;
    document.getElementById('assumption4').textContent = ui.assumption4;

    document.querySelector('[data-kpi="grossBillings"]').textContent = ui.kpiGross;
    document.querySelector('[data-kpi="monthlyNetProfit"]').textContent = ui.kpiNet;
    document.querySelector('[data-kpi="breakEvenAverageSupportAmount"]').textContent = ui.kpiBreakEven;
    document.querySelector('[data-kpi="targetAverageSupportAmount"]').textContent = ui.kpiTarget;
    document.querySelector('[data-kpi="effectiveTakeHomeRatePct"]').textContent = ui.kpiKeepRate;
    document.querySelector('[data-kpi="netProfitDeltaVsAlternate"]').textContent = ui.kpiDelta;

    document.querySelector('[data-detail="supporterChargeTotal"]').textContent = ui.detailSupporterChargeTotal;
    document.querySelector('[data-detail="refundLossTotal"]').textContent = ui.detailRefundLoss;
    document.querySelector('[data-detail="platformFeeTotal"]').textContent = ui.detailPlatformFees;
    document.querySelector('[data-detail="processorCardFeeGross"]').textContent = ui.detailProcessingFees;
    document.querySelector('[data-detail="payoutFeeTotal"]').textContent = ui.detailPayoutFees;
    document.querySelector('[data-detail="rewardCosts"]').textContent = ui.detailRewardCosts;
    document.querySelector('[data-detail="perTransactionTakeHomeAfterCosts"]').textContent = ui.detailPerTxn;
    document.querySelector('[data-detail="breakEvenMonthlyTransactions"]').textContent = ui.detailBreakEvenTxn;

    document.getElementById('tableScenario').textContent = ui.tableScenario;
    document.getElementById('tableSupporterCharge').textContent = ui.tableSupporterCharge;
    document.getElementById('tableNetProfit').textContent = ui.tableNetProfit;
    document.getElementById('tableBreakEven').textContent = ui.tableBreakEven;
    document.getElementById('tableTarget').textContent = ui.tableTarget;
    document.getElementById('tableDelta').textContent = ui.tableDelta;
  }

  function formatNullableMoney(value, currency) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatMoney(value, currentLang, currency);
  }

  function formatNullablePercent(value) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatPercent(value, currentLang);
  }

  function renderScenarioRow(result, mode, isCurrent) {
    const t = TEXT[currentLang] || TEXT.en;
    const scenario = mode === result.currentMode ? result : result.alternateScenario;
    const breakEven = calculateAverageSupportRequired(result.inputs, mode, 0);
    const targetAverage = calculateAverageSupportRequired(result.inputs, mode, result.inputs.desiredMonthlyNetProfit);
    const delta = isCurrent ? 0 : scenario.monthlyNetProfit - result.monthlyNetProfit;

    return `
      <tr>
        <td>${isCurrent ? t.currentScenarioLabel : t.alternateScenarioLabel}<br><strong>${scenarioLabel(mode, currentLang)}</strong></td>
        <td>${formatMoney(scenario.supporterChargeTotal, currentLang, result.inputs.currency)}</td>
        <td class="${scenario.monthlyNetProfit >= 0 ? 'good' : 'warn'}">${formatMoney(scenario.monthlyNetProfit, currentLang, result.inputs.currency)}</td>
        <td>${breakEven == null ? t.na : formatMoney(round2(breakEven), currentLang, result.inputs.currency)}</td>
        <td>${targetAverage == null ? t.na : formatMoney(round2(targetAverage), currentLang, result.inputs.currency)}</td>
        <td>${isCurrent ? '—' : formatMoney(round2(delta), currentLang, result.inputs.currency)}</td>
      </tr>
    `;
  }

  function clearOutputs() {
    [
      'grossBillings',
      'monthlyNetProfit',
      'breakEvenAverageSupportAmount',
      'targetAverageSupportAmount',
      'effectiveTakeHomeRatePct',
      'netProfitDeltaVsAlternate',
      'supporterChargeTotal',
      'refundLossTotal',
      'platformFeeTotal',
      'processorCardFeeGross',
      'payoutFeeTotal',
      'rewardCosts',
      'perTransactionTakeHomeAfterCosts',
      'breakEvenMonthlyTransactions'
    ].forEach((id) => {
      if (els[id]) {
        els[id].textContent = '—';
      }
    });
    els.summary.value = '';
    els.alternateScenario.innerHTML = '';
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
      els.emptyState.hidden = false;
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.resultsContent.hidden = false;
    els.emptyState.hidden = true;
    els.status.textContent = result.monthlyNetProfit >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;

    const currency = result.inputs.currency;

    els.grossBillings.textContent = formatMoney(result.grossBillings, currentLang, currency);
    els.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit, currentLang, currency);
    els.breakEvenAverageSupportAmount.textContent = formatNullableMoney(result.breakEvenAverageSupportAmount, currency);
    els.targetAverageSupportAmount.textContent = formatNullableMoney(result.targetAverageSupportAmount, currency);
    els.effectiveTakeHomeRatePct.textContent = formatNullablePercent(result.effectiveTakeHomeRatePct);
    els.netProfitDeltaVsAlternate.textContent = formatMoney(result.netProfitDeltaVsAlternate, currentLang, currency);
    els.supporterChargeTotal.textContent = formatMoney(result.supporterChargeTotal, currentLang, currency);
    els.refundLossTotal.textContent = formatMoney(result.refundLossTotal, currentLang, currency);
    els.platformFeeTotal.textContent = formatMoney(result.platformFeeTotal, currentLang, currency);
    els.processorCardFeeGross.textContent = formatMoney(result.processorCardFeeGross, currentLang, currency);
    els.payoutFeeTotal.textContent = formatMoney(result.payoutFeeTotal, currentLang, currency);
    els.rewardCosts.textContent = formatMoney(result.rewardCosts, currentLang, currency);
    els.perTransactionTakeHomeAfterCosts.textContent = formatMoney(result.perTransactionTakeHomeAfterCosts, currentLang, currency);
    els.breakEvenMonthlyTransactions.textContent = result.breakEvenMonthlyTransactions == null ? t.na : new Intl.NumberFormat(currentLang === 'ko' ? 'ko-KR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.breakEvenMonthlyTransactions);
    els.summary.value = result.summary;
    els.alternateScenario.innerHTML = renderScenarioRow(result, result.currentMode, true) + renderScenarioRow(result, result.alternateMode, false);
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      els[id].addEventListener('input', render);
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
      } catch (error) {
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
