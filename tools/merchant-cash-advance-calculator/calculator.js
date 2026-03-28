(function (root) {
  const COLLECTION_MODES = {
    holdback: 'holdback',
    fixedDaily: 'fixedDaily'
  };

  const DEFAULTS = {
    advanceAmount: 50000,
    factorRate: 1.32,
    collectionMode: COLLECTION_MODES.holdback,
    termBusinessDays: 130,
    holdbackPct: 12,
    averageMonthlyCardSales: 90000,
    businessDaysPerMonth: 21,
    originationFeePct: 3,
    fixedClosingFee: 495,
    targetPayoffMonths: 6
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      advanceAmount: 'Advance amount must be greater than zero.',
      factorRate: 'Factor rate must be above 1.00 and below 3.00.',
      collectionMode: 'Unsupported collection mode.',
      termBusinessDays: 'Term business days must be greater than zero for fixed-daily mode.',
      holdbackPct: 'Holdback percentage must be above 0 and below 100.',
      averageMonthlyCardSales: 'Average monthly card sales must be greater than zero.',
      businessDaysPerMonth: 'Business days per month must be greater than zero.',
      originationFeePct: 'Origination fee percent must be 0 or above and below 100.',
      fixedClosingFee: 'Fixed closing fee must be 0 or above.',
      targetPayoffMonths: 'Target payoff months must be greater than zero.',
      netFundedCash: 'Upfront fees cannot exceed the quoted advance amount.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid offer inputs to evaluate the MCA burden.',
      statusWarn: 'This offer is expensive. Check net cash received, APR approximation, and sales coverage before signing.',
      statusCaution: 'The quote is viable only if your card volume stays resilient. Pressure-test downside sales scenarios.',
      statusGood: 'Current sales appear to cover this offer, but the approximate APR still deserves scrutiny.',
      summaryTitle: '[Merchant Cash Advance Summary]',
      modeLabel: 'Collection mode',
      advanceAmountLabel: 'Advance amount',
      factorRateLabel: 'Factor rate',
      totalPaybackLabel: 'Total payback',
      financeChargeLabel: 'Financing fee',
      originationFeeLabel: 'Upfront fees',
      netFundedCashLabel: 'Net funded cash',
      dailyRemittanceLabel: 'Daily remittance',
      monthlyRemittanceLabel: 'Monthly remittance',
      payoffMonthsLabel: 'Estimated payoff months',
      aprGrossLabel: 'Approx APR on quoted advance',
      aprNetLabel: 'Approx APR on net cash',
      salesNeededLabel: 'Monthly sales needed for target payoff',
      targetGapLabel: 'Target gap vs current monthly sales',
      note: 'APR here is approximate and only intended to compare offers. Actual MCA remittance timing and fees can differ by contract.',
      na: 'N/A',
      modeHoldback: 'Holdback % of card sales',
      modeFixedDaily: 'Fixed daily ACH / fixed business-day term'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      advanceAmount: '선지급 금액은 0보다 커야 합니다.',
      factorRate: '팩터레이트는 1.00 초과 3.00 미만이어야 합니다.',
      collectionMode: '지원하지 않는 회수 방식입니다.',
      termBusinessDays: '고정 일일 상환 모드에서는 영업일 수가 0보다 커야 합니다.',
      holdbackPct: '홀드백 비율은 0 초과 100 미만이어야 합니다.',
      averageMonthlyCardSales: '월 카드매출은 0보다 커야 합니다.',
      businessDaysPerMonth: '월 영업일 수는 0보다 커야 합니다.',
      originationFeePct: '개설 수수료율은 0 이상 100 미만이어야 합니다.',
      fixedClosingFee: '고정 마감 수수료는 0 이상이어야 합니다.',
      targetPayoffMonths: '목표 상환 개월 수는 0보다 커야 합니다.',
      netFundedCash: '선취 수수료가 선지급 금액을 초과할 수 없습니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 오퍼 값을 입력하면 MCA 부담을 계산합니다.',
      statusWarn: '이 오퍼는 매우 비쌉니다. 실제 입금액, APR 추정치, 매출 커버력을 먼저 확인하세요.',
      statusCaution: '현재 매출이 유지되어야 버틸 수 있는 수준입니다. 다운사이드 매출 시나리오까지 점검하세요.',
      statusGood: '현재 매출 기준으로는 감당 가능해 보이지만, APR 추정치는 여전히 엄격하게 봐야 합니다.',
      summaryTitle: '[Merchant Cash Advance 요약]',
      modeLabel: '회수 방식',
      advanceAmountLabel: '선지급 금액',
      factorRateLabel: '팩터레이트',
      totalPaybackLabel: '총 상환액',
      financeChargeLabel: '금융 비용',
      originationFeeLabel: '선취 수수료',
      netFundedCashLabel: '실수령 현금',
      dailyRemittanceLabel: '일평균 회수액',
      monthlyRemittanceLabel: '월 회수액',
      payoffMonthsLabel: '예상 상환 개월',
      aprGrossLabel: '명목 선지급 기준 추정 APR',
      aprNetLabel: '실수령 기준 추정 APR',
      salesNeededLabel: '목표 상환기간 달성 필요 월매출',
      targetGapLabel: '현재 월매출 대비 부족분',
      note: '여기서의 APR은 오퍼 비교용 근사치입니다. 실제 MCA 계약의 회수 주기·추가 수수료·휴일 처리 방식은 다를 수 있습니다.',
      na: 'N/A',
      modeHoldback: '카드매출 홀드백 %',
      modeFixedDaily: '고정 일일 ACH / 고정 영업일 상환'
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
      advanceAmount: Number(input.advanceAmount),
      factorRate: Number(input.factorRate),
      collectionMode: input.collectionMode || DEFAULTS.collectionMode,
      termBusinessDays: Number(input.termBusinessDays),
      holdbackPct: Number(input.holdbackPct),
      averageMonthlyCardSales: Number(input.averageMonthlyCardSales),
      businessDaysPerMonth: Number(input.businessDaysPerMonth),
      originationFeePct: Number(input.originationFeePct),
      fixedClosingFee: Number(input.fixedClosingFee),
      targetPayoffMonths: Number(input.targetPayoffMonths)
    };
  }

  function isValidMode(mode) {
    return mode === COLLECTION_MODES.holdback || mode === COLLECTION_MODES.fixedDaily;
  }

  function modeLabel(mode, lang) {
    const t = TEXT[lang] || TEXT.en;
    return mode === COLLECTION_MODES.fixedDaily ? t.modeFixedDaily : t.modeHoldback;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.advanceAmount) || input.advanceAmount <= 0) {
      return t.advanceAmount;
    }
    if (!Number.isFinite(input.factorRate) || input.factorRate <= 1 || input.factorRate >= 3) {
      return t.factorRate;
    }
    if (!isValidMode(input.collectionMode)) {
      return t.collectionMode;
    }
    if (input.collectionMode === COLLECTION_MODES.fixedDaily && (!Number.isFinite(input.termBusinessDays) || input.termBusinessDays <= 0)) {
      return t.termBusinessDays;
    }
    if (!Number.isFinite(input.holdbackPct) || input.holdbackPct <= 0 || input.holdbackPct >= 100) {
      return t.holdbackPct;
    }
    if (!Number.isFinite(input.averageMonthlyCardSales) || input.averageMonthlyCardSales <= 0) {
      return t.averageMonthlyCardSales;
    }
    if (!Number.isFinite(input.businessDaysPerMonth) || input.businessDaysPerMonth <= 0) {
      return t.businessDaysPerMonth;
    }
    if (!Number.isFinite(input.originationFeePct) || input.originationFeePct < 0 || input.originationFeePct >= 100) {
      return t.originationFeePct;
    }
    if (!Number.isFinite(input.fixedClosingFee) || input.fixedClosingFee < 0) {
      return t.fixedClosingFee;
    }
    if (!Number.isFinite(input.targetPayoffMonths) || input.targetPayoffMonths <= 0) {
      return t.targetPayoffMonths;
    }

    const upfrontFees = input.advanceAmount * (input.originationFeePct / 100) + input.fixedClosingFee;
    if (upfrontFees >= input.advanceAmount) {
      return t.netFundedCash;
    }

    return '';
  }

  function evaluateScenario(input) {
    const holdbackRate = input.holdbackPct / 100;
    const totalPayback = input.advanceAmount * input.factorRate;
    const financeCharge = totalPayback - input.advanceAmount;
    const originationFee = input.advanceAmount * (input.originationFeePct / 100) + input.fixedClosingFee;
    const netFundedCash = input.advanceAmount - originationFee;

    let dailyRemittance;
    let weeklyRemittance;
    let monthlyRemittance;
    let estimatedBusinessDays;
    let estimatedPayoffMonths;
    let holdbackEquivalentPct;

    if (input.collectionMode === COLLECTION_MODES.fixedDaily) {
      estimatedBusinessDays = input.termBusinessDays;
      estimatedPayoffMonths = estimatedBusinessDays / input.businessDaysPerMonth;
      dailyRemittance = totalPayback / estimatedBusinessDays;
      weeklyRemittance = dailyRemittance * 5;
      monthlyRemittance = dailyRemittance * input.businessDaysPerMonth;
      holdbackEquivalentPct = monthlyRemittance / input.averageMonthlyCardSales * 100;
    } else {
      monthlyRemittance = input.averageMonthlyCardSales * holdbackRate;
      dailyRemittance = monthlyRemittance / input.businessDaysPerMonth;
      weeklyRemittance = dailyRemittance * 5;
      estimatedPayoffMonths = totalPayback / monthlyRemittance;
      estimatedBusinessDays = estimatedPayoffMonths * input.businessDaysPerMonth;
      holdbackEquivalentPct = input.holdbackPct;
    }

    const approxAprGrossPct = financeCharge / input.advanceAmount / (estimatedBusinessDays / 365) * 100;
    const approxAprNetPct = (totalPayback - netFundedCash) / netFundedCash / (estimatedBusinessDays / 365) * 100;
    const monthlySalesNeededForTarget = totalPayback / input.targetPayoffMonths / holdbackRate;
    const targetGap = Math.max(monthlySalesNeededForTarget - input.averageMonthlyCardSales, 0);
    const coverageRatioPct = input.averageMonthlyCardSales / monthlySalesNeededForTarget * 100;

    return {
      holdbackRate,
      totalPayback,
      financeCharge,
      originationFee,
      netFundedCash,
      dailyRemittance,
      weeklyRemittance,
      monthlyRemittance,
      estimatedBusinessDays,
      estimatedPayoffMonths,
      holdbackEquivalentPct,
      approxAprGrossPct,
      approxAprNetPct,
      monthlySalesNeededForTarget,
      targetGap,
      coverageRatioPct
    };
  }

  function buildPlannerRows(input, scenario) {
    const holdbackRate = scenario.holdbackRate;
    const horizons = Array.from(new Set([3, 6, 9, 12, round2(input.targetPayoffMonths)])).sort((a, b) => a - b);

    return horizons.map((months) => {
      const monthlySalesNeeded = scenario.totalPayback / months / holdbackRate;
      const dailyRemittanceNeeded = (scenario.totalPayback / months) / input.businessDaysPerMonth;
      const coveragePct = input.averageMonthlyCardSales / monthlySalesNeeded * 100;
      return {
        months: round2(months),
        monthlySalesNeeded: round2(monthlySalesNeeded),
        dailyRemittanceNeeded: round2(dailyRemittanceNeeded),
        coveragePct: round2(coveragePct)
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

  function formatNumber(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.modeLabel}: ${result.modeLabel}`,
      `${t.advanceAmountLabel}: ${formatMoney(result.inputs.advanceAmount, lang)}`,
      `${t.factorRateLabel}: ${formatNumber(result.inputs.factorRate, lang)}`,
      `${t.totalPaybackLabel}: ${formatMoney(result.totalPayback, lang)}`,
      `${t.financeChargeLabel}: ${formatMoney(result.financeCharge, lang)}`,
      `${t.originationFeeLabel}: ${formatMoney(result.originationFee, lang)}`,
      `${t.netFundedCashLabel}: ${formatMoney(result.netFundedCash, lang)}`,
      `${t.dailyRemittanceLabel}: ${formatMoney(result.dailyRemittance, lang)}`,
      `${t.monthlyRemittanceLabel}: ${formatMoney(result.monthlyRemittance, lang)}`,
      `${t.payoffMonthsLabel}: ${formatNumber(result.estimatedPayoffMonths, lang)}`,
      `${t.aprGrossLabel}: ${formatPercent(result.approxAprGrossPct, lang)}`,
      `${t.aprNetLabel}: ${formatPercent(result.approxAprNetPct, lang)}`,
      `${t.salesNeededLabel}: ${formatMoney(result.monthlySalesNeededForTarget, lang)}`,
      `${t.targetGapLabel}: ${formatMoney(result.targetGap, lang)}`,
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

    const scenario = evaluateScenario(normalized);
    const plannerRows = buildPlannerRows(normalized, scenario);
    const result = {
      inputs: normalized,
      modeLabel: modeLabel(normalized.collectionMode, lang),
      totalPayback: round2(scenario.totalPayback),
      financeCharge: round2(scenario.financeCharge),
      originationFee: round2(scenario.originationFee),
      netFundedCash: round2(scenario.netFundedCash),
      dailyRemittance: round2(scenario.dailyRemittance),
      weeklyRemittance: round2(scenario.weeklyRemittance),
      monthlyRemittance: round2(scenario.monthlyRemittance),
      estimatedBusinessDays: round2(scenario.estimatedBusinessDays),
      estimatedPayoffMonths: round2(scenario.estimatedPayoffMonths),
      holdbackEquivalentPct: round2(scenario.holdbackEquivalentPct),
      approxAprGrossPct: round2(scenario.approxAprGrossPct),
      approxAprNetPct: round2(scenario.approxAprNetPct),
      monthlySalesNeededForTarget: round2(scenario.monthlySalesNeededForTarget),
      targetGap: round2(scenario.targetGap),
      coverageRatioPct: round2(scenario.coverageRatioPct),
      plannerRows
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    COLLECTION_MODES,
    DEFAULTS,
    TEXT,
    normalizeInput,
    validate,
    evaluateScenario,
    buildPlannerRows,
    buildSummary,
    calculate,
    modeLabel
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.MerchantCashAdvanceCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    en: {
      back: '← Tools',
      pageTitle: 'Merchant Cash Advance Calculator | MCA Factor Rate & Holdback Estimator',
      title: 'Merchant Cash Advance Calculator',
      subtitle: 'Stress-test factor-rate offers with fixed-daily or holdback remittance, net funded cash after upfront fees, approximate APR, and the monthly card sales needed to clear the advance safely.',
      disclaimer: 'APR shown here is an approximation for comparison only. Merchant cash advances are not traditional amortizing loans, and actual remittance timing can change with weekends, holidays, split funding, and contract-specific fees.',
      chip1Eyebrow: 'Decision lens',
      chip1Text: 'How much cash do you really receive after upfront fees?',
      chip2Eyebrow: 'Pressure test',
      chip2Text: 'Can your monthly card sales carry the remittance without crushing cash flow?',
      chip3Eyebrow: 'Target horizon',
      chip3Text: 'How much sales volume would you need to clear the advance faster?',
      inputHeader: 'Offer inputs',
      resultsHeader: 'Key outputs',
      detailHeader: 'Remittance detail',
      plannerHeader: 'Target payoff planner',
      summaryHeader: 'Copy-ready summary',
      assumptionHeader: 'Assumptions & interpretation',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: 'Valid inputs will render the decision KPIs, remittance detail, and target-sales planner here.',
      modeNoteHoldback: 'Holdback mode estimates payoff from average monthly card sales. If sales soften, payoff stretches and the APR approximation changes with it.',
      modeNoteFixed: 'Fixed-daily mode uses the business-day term for payoff. Holdback % is still used for the target-sales planner so you can see what sales volume would be needed to clear faster.',
      advanceAmount: 'Advance amount',
      factorRate: 'Factor rate',
      collectionMode: 'Collection mode',
      termBusinessDays: 'Term business days',
      holdbackPct: 'Holdback percentage (%)',
      averageMonthlyCardSales: 'Average monthly card sales',
      businessDaysPerMonth: 'Business days per month',
      originationFeePct: 'Origination fee (%)',
      fixedClosingFee: 'Fixed closing fee',
      targetPayoffMonths: 'Target payoff months',
      assumption1: 'Total payback is modeled as advance amount × factor rate.',
      assumption2: 'Net funded cash subtracts origination and fixed closing fees from the quoted advance.',
      assumption3: 'Approximate APR is a comparison aid only; MCA contracts do not amortize like standard loans.',
      assumption4: 'Target monthly sales math uses the selected holdback percentage, even if your current quote is fixed daily.',
      kpiTotalPayback: 'Total payback',
      kpiNetFundedCash: 'Net funded cash',
      kpiApproxAprGrossPct: 'Approx APR on quoted advance',
      kpiApproxAprNetPct: 'Approx APR on net cash',
      kpiEstimatedPayoffMonths: 'Estimated payoff months',
      kpiMonthlySalesNeededForTarget: 'Monthly sales needed for target',
      detailFinanceCharge: 'Financing fee',
      detailOriginationFee: 'Upfront fees',
      detailDailyRemittance: 'Daily remittance',
      detailWeeklyRemittance: 'Weekly remittance',
      detailMonthlyRemittance: 'Monthly remittance',
      detailEstimatedBusinessDays: 'Estimated business days',
      detailHoldbackEquivalentPct: 'Holdback-equivalent burden',
      detailTargetGap: 'Target gap vs current monthly sales',
      plannerMonths: 'Horizon',
      plannerSales: 'Sales needed / month',
      plannerDaily: 'Avg remittance / day',
      plannerCoverage: 'Current sales coverage',
      plannerMonthsSuffix: 'months'
    },
    ko: {
      back: '← Tools',
      pageTitle: 'Merchant Cash Advance Calculator | MCA 팩터레이트 계산기',
      title: 'Merchant Cash Advance Calculator',
      subtitle: '팩터레이트 오퍼를 고정 일일 회수 또는 홀드백 구조로 넣어 실제 실수령 현금, 추정 APR, 월매출 부담, 목표 상환기간 달성 필요 매출을 빠르게 확인합니다.',
      disclaimer: '여기 표시되는 APR은 비교용 근사치입니다. Merchant Cash Advance는 전통적인 원리금균등 대출이 아니며, 실제 회수 타이밍은 휴일·주말·split funding·계약별 수수료에 따라 달라질 수 있습니다.',
      chip1Eyebrow: '판단 포인트',
      chip1Text: '선취 수수료를 떼고 나면 실제로 손에 들어오는 현금이 얼마인지.',
      chip2Eyebrow: '압박 테스트',
      chip2Text: '현재 카드매출로 이 회수 부담을 버틸 수 있는지.',
      chip3Eyebrow: '목표 기간',
      chip3Text: '더 빨리 털어내려면 월매출이 얼마나 필요할지.',
      inputHeader: '오퍼 입력값',
      resultsHeader: '핵심 출력값',
      detailHeader: '회수 부담 세부값',
      plannerHeader: '목표 상환 플래너',
      summaryHeader: '복사용 요약',
      assumptionHeader: '가정 및 해석',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: '유효한 입력값을 넣으면 KPI, 회수 부담 상세, 목표 매출 플래너가 표시됩니다.',
      modeNoteHoldback: '홀드백 모드는 월 카드매출을 기준으로 상환기간을 추정합니다. 매출이 줄면 상환기간과 APR 근사치가 함께 악화됩니다.',
      modeNoteFixed: '고정 일일 회수 모드는 영업일 기준 기간을 그대로 사용합니다. 다만 목표 상환 플래너는 현재 홀드백 비율을 이용해 필요한 월매출을 계산합니다.',
      advanceAmount: '선지급 금액',
      factorRate: '팩터레이트',
      collectionMode: '회수 방식',
      termBusinessDays: '상환 영업일 수',
      holdbackPct: '홀드백 비율 (%)',
      averageMonthlyCardSales: '평균 월 카드매출',
      businessDaysPerMonth: '월 영업일 수',
      originationFeePct: '개설 수수료율 (%)',
      fixedClosingFee: '고정 마감 수수료',
      targetPayoffMonths: '목표 상환 개월 수',
      assumption1: '총 상환액은 선지급 금액 × 팩터레이트로 계산합니다.',
      assumption2: '실수령 현금은 선지급 금액에서 개설 수수료와 고정 마감 수수료를 뺀 값입니다.',
      assumption3: '추정 APR은 비교용일 뿐이며, MCA 계약은 일반 대출처럼 상환 구조가 일정하지 않습니다.',
      assumption4: '목표 월매출 계산은 현재 오퍼가 고정 일일 회수여도 선택한 홀드백 비율을 기준으로 합니다.',
      kpiTotalPayback: '총 상환액',
      kpiNetFundedCash: '실수령 현금',
      kpiApproxAprGrossPct: '명목 선지급 기준 추정 APR',
      kpiApproxAprNetPct: '실수령 기준 추정 APR',
      kpiEstimatedPayoffMonths: '예상 상환 개월',
      kpiMonthlySalesNeededForTarget: '목표 달성 필요 월매출',
      detailFinanceCharge: '금융 비용',
      detailOriginationFee: '선취 수수료',
      detailDailyRemittance: '일평균 회수액',
      detailWeeklyRemittance: '주간 회수액',
      detailMonthlyRemittance: '월 회수액',
      detailEstimatedBusinessDays: '예상 영업일 수',
      detailHoldbackEquivalentPct: '홀드백 환산 부담률',
      detailTargetGap: '현재 월매출 대비 부족분',
      plannerMonths: '기간',
      plannerSales: '필요 월매출',
      plannerDaily: '일평균 회수액',
      plannerCoverage: '현재 매출 커버율',
      plannerMonthsSuffix: '개월'
    }
  };

  const inputIds = [
    'advanceAmount',
    'factorRate',
    'collectionMode',
    'termBusinessDays',
    'holdbackPct',
    'averageMonthlyCardSales',
    'businessDaysPerMonth',
    'originationFeePct',
    'fixedClosingFee',
    'targetPayoffMonths'
  ];

  const moneyKeys = [
    'totalPayback',
    'netFundedCash',
    'financeCharge',
    'originationFee',
    'dailyRemittance',
    'weeklyRemittance',
    'monthlyRemittance',
    'monthlySalesNeededForTarget',
    'targetGap'
  ];

  const percentKeys = ['approxAprGrossPct', 'approxAprNetPct', 'holdbackEquivalentPct'];
  const numberKeys = ['estimatedPayoffMonths', 'estimatedBusinessDays'];

  const els = {
    htmlTitle: document.querySelector('title'),
    backLink: document.getElementById('backLink'),
    langBtn: document.getElementById('langBtn'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    disclaimer: document.getElementById('disclaimer'),
    chip1Eyebrow: document.getElementById('chip1Eyebrow'),
    chip1Text: document.getElementById('chip1Text'),
    chip2Eyebrow: document.getElementById('chip2Eyebrow'),
    chip2Text: document.getElementById('chip2Text'),
    chip3Eyebrow: document.getElementById('chip3Eyebrow'),
    chip3Text: document.getElementById('chip3Text'),
    inputHeader: document.getElementById('inputHeader'),
    resultsHeader: document.getElementById('resultsHeader'),
    detailHeader: document.getElementById('detailHeader'),
    plannerHeader: document.getElementById('plannerHeader'),
    summaryHeader: document.getElementById('summaryHeader'),
    assumptionHeader: document.getElementById('assumptionHeader'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    modeNote: document.getElementById('modeNote'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    resultsContent: document.getElementById('resultsContent'),
    assumption1: document.getElementById('assumption1'),
    assumption2: document.getElementById('assumption2'),
    assumption3: document.getElementById('assumption3'),
    assumption4: document.getElementById('assumption4'),
    plannerBody: document.getElementById('plannerBody'),
    plannerMonths: document.getElementById('plannerMonths'),
    plannerSales: document.getElementById('plannerSales'),
    plannerDaily: document.getElementById('plannerDaily'),
    plannerCoverage: document.getElementById('plannerCoverage')
  };

  inputIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });

  [
    'totalPayback',
    'netFundedCash',
    'approxAprGrossPct',
    'approxAprNetPct',
    'estimatedPayoffMonths',
    'monthlySalesNeededForTarget',
    'financeCharge',
    'originationFee',
    'dailyRemittance',
    'weeklyRemittance',
    'monthlyRemittance',
    'estimatedBusinessDays',
    'holdbackEquivalentPct',
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
      advanceAmount: getInputValue('advanceAmount'),
      factorRate: getInputValue('factorRate'),
      collectionMode: getInputValue('collectionMode'),
      termBusinessDays: getInputValue('termBusinessDays'),
      holdbackPct: getInputValue('holdbackPct'),
      averageMonthlyCardSales: getInputValue('averageMonthlyCardSales'),
      businessDaysPerMonth: getInputValue('businessDaysPerMonth'),
      originationFeePct: getInputValue('originationFeePct'),
      fixedClosingFee: getInputValue('fixedClosingFee'),
      targetPayoffMonths: getInputValue('targetPayoffMonths')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.chip1Eyebrow.textContent = ui.chip1Eyebrow;
    els.chip1Text.textContent = ui.chip1Text;
    els.chip2Eyebrow.textContent = ui.chip2Eyebrow;
    els.chip2Text.textContent = ui.chip2Text;
    els.chip3Eyebrow.textContent = ui.chip3Eyebrow;
    els.chip3Text.textContent = ui.chip3Text;
    els.inputHeader.textContent = ui.inputHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.plannerHeader.textContent = ui.plannerHeader;
    els.summaryHeader.textContent = ui.summaryHeader;
    els.assumptionHeader.textContent = ui.assumptionHeader;
    els.resultsEmpty.textContent = ui.resultsEmpty;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';

    inputIds.forEach((key) => {
      if (els[`l_${key}`]) {
        els[`l_${key}`].textContent = ui[key];
      }
    });

    els.collectionMode.querySelector(`option[value="${COLLECTION_MODES.holdback}"]`).textContent = TEXT[currentLang].modeHoldback;
    els.collectionMode.querySelector(`option[value="${COLLECTION_MODES.fixedDaily}"]`).textContent = TEXT[currentLang].modeFixedDaily;

    document.querySelector('[data-kpi="totalPayback"]').textContent = ui.kpiTotalPayback;
    document.querySelector('[data-kpi="netFundedCash"]').textContent = ui.kpiNetFundedCash;
    document.querySelector('[data-kpi="approxAprGrossPct"]').textContent = ui.kpiApproxAprGrossPct;
    document.querySelector('[data-kpi="approxAprNetPct"]').textContent = ui.kpiApproxAprNetPct;
    document.querySelector('[data-kpi="estimatedPayoffMonths"]').textContent = ui.kpiEstimatedPayoffMonths;
    document.querySelector('[data-kpi="monthlySalesNeededForTarget"]').textContent = ui.kpiMonthlySalesNeededForTarget;

    document.querySelector('[data-detail="financeCharge"]').textContent = ui.detailFinanceCharge;
    document.querySelector('[data-detail="originationFee"]').textContent = ui.detailOriginationFee;
    document.querySelector('[data-detail="dailyRemittance"]').textContent = ui.detailDailyRemittance;
    document.querySelector('[data-detail="weeklyRemittance"]').textContent = ui.detailWeeklyRemittance;
    document.querySelector('[data-detail="monthlyRemittance"]').textContent = ui.detailMonthlyRemittance;
    document.querySelector('[data-detail="estimatedBusinessDays"]').textContent = ui.detailEstimatedBusinessDays;
    document.querySelector('[data-detail="holdbackEquivalentPct"]').textContent = ui.detailHoldbackEquivalentPct;
    document.querySelector('[data-detail="targetGap"]').textContent = ui.detailTargetGap;

    els.plannerMonths.textContent = ui.plannerMonths;
    els.plannerSales.textContent = ui.plannerSales;
    els.plannerDaily.textContent = ui.plannerDaily;
    els.plannerCoverage.textContent = ui.plannerCoverage;

    els.assumption1.textContent = ui.assumption1;
    els.assumption2.textContent = ui.assumption2;
    els.assumption3.textContent = ui.assumption3;
    els.assumption4.textContent = ui.assumption4;
  }

  function updateModeNote() {
    const ui = UI_TEXT[currentLang];
    els.modeNote.textContent = getInputValue('collectionMode') === COLLECTION_MODES.fixedDaily
      ? ui.modeNoteFixed
      : ui.modeNoteHoldback;
  }

  function clearOutputs() {
    [...moneyKeys, ...percentKeys, ...numberKeys].forEach((key) => {
      if (els[key]) {
        els[key].textContent = '—';
      }
    });
    els.summary.value = '';
    els.plannerBody.innerHTML = '';
  }

  function renderPlanner(rows) {
    const ui = UI_TEXT[currentLang];
    els.plannerBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${formatNumber(row.months, currentLang)} ${ui.plannerMonthsSuffix}</td>
        <td>${formatMoney(row.monthlySalesNeeded, currentLang)}</td>
        <td>${formatMoney(row.dailyRemittanceNeeded, currentLang)}</td>
        <td class="${row.coveragePct >= 100 ? 'good' : 'warn'}">${formatPercent(row.coveragePct, currentLang)}</td>
      </tr>
    `).join('');
  }

  function render() {
    updateModeNote();
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

    if (result.approxAprNetPct >= 90 || result.coverageRatioPct < 90) {
      els.status.textContent = t.statusWarn;
      els.status.className = 'status warn';
    } else if (result.approxAprNetPct >= 60 || result.coverageRatioPct < 110) {
      els.status.textContent = t.statusCaution;
      els.status.className = 'status warn';
    } else {
      els.status.textContent = t.statusGood;
      els.status.className = 'status good';
    }

    moneyKeys.forEach((key) => {
      els[key].textContent = formatMoney(result[key], currentLang);
    });
    percentKeys.forEach((key) => {
      els[key].textContent = formatPercent(result[key], currentLang);
    });
    numberKeys.forEach((key) => {
      els[key].textContent = formatNumber(result[key], currentLang);
    });

    els.summary.value = result.summary;
    renderPlanner(result.plannerRows);
  }

  function bindEvents() {
    inputIds.forEach((id) => {
      const eventName = els[id].tagName === 'SELECT' ? 'change' : 'input';
      els[id].addEventListener(eventName, render);
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
