(function (root) {
  const DEFAULTS = {
    streamsPerMonth: 8,
    averageViewersPerStream: 18000,
    payingViewerRatePct: 1.4,
    messagesPerPayingViewer: 1.25,
    averageSuperChatAmount: 4.5,
    creatorSharePct: 70,
    refundRatePct: 1.5,
    withholdingTaxPct: 0,
    otherMonthlyCost: 450,
    targetMonthlyNet: 9000,
    currency: 'USD'
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      heroTitle: 'YouTube Super Chat Revenue Calculator',
      heroSubtitle: 'Estimate monthly Super Chat take-home from live views, paid-message behavior, creator share, refunds, and operating costs without leaving the browser.',
      heroNote: 'This tool is an editable planning model. Creator share, withholding, refunds, and payout rules can vary by market, channel setup, and policy changes.',
      inputTitle: 'Inputs',
      streamsPerMonthLabel: 'Streams per month',
      averageViewersPerStreamLabel: 'Average live views per stream',
      payingViewerRatePctLabel: 'Paying viewer rate (%)',
      messagesPerPayingViewerLabel: 'Paid messages per paying viewer',
      averageSuperChatAmountLabel: 'Average Super Chat amount',
      currencyLabel: 'Currency',
      creatorSharePctLabel: 'Creator share (%)',
      creatorShareHint: 'Editable so you can model channel-specific or policy-updated payout assumptions.',
      refundRatePctLabel: 'Refund or reversal rate (%)',
      withholdingTaxPctLabel: 'Withholding tax (%)',
      otherMonthlyCostLabel: 'Monthly live-stream costs',
      targetMonthlyNetLabel: 'Target monthly net',
      targetMonthlyNetHint: 'Used to backsolve the average paid-message size or paying-viewer rate required to hit your target.',
      copyCta: 'Copy summary',
      resetCta: 'Reset defaults',
      kpiTitle: 'Key KPIs',
      monthlyLiveViewsLabel: 'Monthly live views',
      grossFanSpendLabel: 'Gross fan spend',
      monthlyNetLabel: 'Monthly net after costs',
      monthlyPayingViewersLabel: 'Monthly paying viewers',
      monthlyPaidMessagesLabel: 'Monthly paid messages',
      takeHomePerStreamLabel: 'Take-home per stream',
      detailTitle: 'Breakdown',
      creatorShareBeforeAdjustmentsLabel: 'Creator share before adjustments',
      platformShareLossLabel: 'Platform share withheld',
      refundLossLabel: 'Refund or reversal loss',
      withholdingTaxLabel: 'Withholding tax',
      takeHomeBeforeCostsLabel: 'Take-home before operating costs',
      takeHomePerThousandViewsLabel: 'Take-home per 1,000 live views',
      effectiveTakeHomeRatePctLabel: 'Effective take-home rate',
      breakEvenPaidMessagesLabel: 'Break-even paid messages',
      breakEvenPayingViewerRatePctLabel: 'Break-even paying viewer rate',
      targetAverageSuperChatAmountLabel: 'Target average Super Chat amount',
      targetPayingViewerRatePctLabel: 'Target paying viewer rate',
      summaryLabel: 'Shareable summary',
      streamsPerMonth: 'Streams per month must be a whole number that is 1 or greater.',
      averageViewersPerStream: 'Average viewers per stream must be 0 or greater.',
      payingViewerRatePct: 'Paying viewer rate must be 0 or above and below 100%.',
      messagesPerPayingViewer: 'Paid messages per paying viewer must be 0 or greater.',
      averageSuperChatAmount: 'Average Super Chat amount must be 0 or greater.',
      creatorSharePct: 'Creator share must be above 0 and up to 100%.',
      refundRatePct: 'Refund/reversal rate must be 0 or above and below 100%.',
      withholdingTaxPct: 'Withholding tax must be 0 or above and below 100%.',
      otherMonthlyCost: 'Other monthly live-stream costs must be 0 or greater.',
      targetMonthlyNet: 'Target monthly net must be 0 or greater.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter your monthly live-stream assumptions to estimate YouTube Super Chat take-home.',
      statusGood: 'Current Super Chat assumptions stay above your operating-cost line.',
      statusWarn: 'Current assumptions do not cover your monthly live-stream costs yet.',
      summaryTitle: '[YouTube Super Chat Revenue Summary]',
      na: 'N/A'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      heroTitle: '유튜브 슈퍼챗 수익 계산기',
      heroSubtitle: '라이브 조회수, 유료 메시지 행동, 정산 비율, 환불, 운영비를 넣어 월 슈퍼챗 순수익을 브라우저에서 바로 추정합니다.',
      heroNote: '이 계산기는 계획용 추정 모델입니다. 정산 비율, 원천징수, 환불, 지급 규칙은 국가·채널 설정·정책 변경에 따라 달라질 수 있습니다.',
      inputTitle: '입력값',
      streamsPerMonthLabel: '월 라이브 횟수',
      averageViewersPerStreamLabel: '회당 평균 라이브 조회수',
      payingViewerRatePctLabel: '결제 시청자 비율 (%)',
      messagesPerPayingViewerLabel: '결제 시청자 1인당 유료 메시지 수',
      averageSuperChatAmountLabel: '평균 슈퍼챗 금액',
      currencyLabel: '통화',
      creatorSharePctLabel: '크리에이터 정산 비율 (%)',
      creatorShareHint: '정책 변경이나 채널별 정산 차이를 반영할 수 있도록 직접 수정 가능합니다.',
      refundRatePctLabel: '환불·정산 취소율 (%)',
      withholdingTaxPctLabel: '원천징수율 (%)',
      otherMonthlyCostLabel: '월 라이브 운영비',
      targetMonthlyNetLabel: '목표 월 순수익',
      targetMonthlyNetHint: '목표 달성을 위해 필요한 평균 슈퍼챗 금액이나 결제 시청자 비율을 역산합니다.',
      copyCta: '요약 복사',
      resetCta: '기본값 복원',
      kpiTitle: '핵심 KPI',
      monthlyLiveViewsLabel: '월 라이브 조회수',
      grossFanSpendLabel: '팬 총 결제액',
      monthlyNetLabel: '운영비 차감 후 월 순수익',
      monthlyPayingViewersLabel: '월 결제 시청자 수',
      monthlyPaidMessagesLabel: '월 유료 메시지 수',
      takeHomePerStreamLabel: '회당 순수익',
      detailTitle: '상세 내역',
      creatorShareBeforeAdjustmentsLabel: '환불 전 크리에이터 몫',
      platformShareLossLabel: '플랫폼 몫',
      refundLossLabel: '환불·취소 손실',
      withholdingTaxLabel: '원천징수',
      takeHomeBeforeCostsLabel: '운영비 전 실수령액',
      takeHomePerThousandViewsLabel: '조회수 1,000회당 순수익',
      effectiveTakeHomeRatePctLabel: '실효 실수령률',
      breakEvenPaidMessagesLabel: '손익분기 유료 메시지 수',
      breakEvenPayingViewerRatePctLabel: '손익분기 결제 시청자 비율',
      targetAverageSuperChatAmountLabel: '목표 달성 평균 슈퍼챗 금액',
      targetPayingViewerRatePctLabel: '목표 달성 결제 시청자 비율',
      summaryLabel: '공유용 요약',
      streamsPerMonth: '월 라이브 횟수는 1 이상의 정수여야 합니다.',
      averageViewersPerStream: '회당 평균 라이브 시청수는 0 이상이어야 합니다.',
      payingViewerRatePct: '결제 시청자 비율은 0 이상 100 미만이어야 합니다.',
      messagesPerPayingViewer: '결제 시청자 1인당 유료 메시지 수는 0 이상이어야 합니다.',
      averageSuperChatAmount: '평균 슈퍼챗 금액은 0 이상이어야 합니다.',
      creatorSharePct: '크리에이터 정산 비율은 0 초과 100 이하여야 합니다.',
      refundRatePct: '환불/정산 취소율은 0 이상 100 미만이어야 합니다.',
      withholdingTaxPct: '원천징수율은 0 이상 100 미만이어야 합니다.',
      otherMonthlyCost: '기타 월 운영비는 0 이상이어야 합니다.',
      targetMonthlyNet: '목표 월 순수익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '월 라이브 가정을 입력하면 유튜브 슈퍼챗 순수익을 추정합니다.',
      statusGood: '현재 가정이라면 슈퍼챗 수익이 월 운영비를 커버합니다.',
      statusWarn: '현재 가정이라면 아직 월 운영비를 커버하지 못합니다.',
      summaryTitle: '[유튜브 슈퍼챗 수익 요약]',
      na: '해당 없음'
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
      streamsPerMonth: Number(input.streamsPerMonth),
      averageViewersPerStream: Number(input.averageViewersPerStream),
      payingViewerRatePct: Number(input.payingViewerRatePct),
      messagesPerPayingViewer: Number(input.messagesPerPayingViewer),
      averageSuperChatAmount: Number(input.averageSuperChatAmount),
      creatorSharePct: Number(input.creatorSharePct),
      refundRatePct: Number(input.refundRatePct),
      withholdingTaxPct: Number(input.withholdingTaxPct),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      targetMonthlyNet: Number(input.targetMonthlyNet),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.streamsPerMonth) || input.streamsPerMonth < 1 || !Number.isInteger(input.streamsPerMonth)) {
      return t.streamsPerMonth;
    }
    if (!Number.isFinite(input.averageViewersPerStream) || input.averageViewersPerStream < 0) {
      return t.averageViewersPerStream;
    }
    if (!Number.isFinite(input.payingViewerRatePct) || input.payingViewerRatePct < 0 || input.payingViewerRatePct >= 100) {
      return t.payingViewerRatePct;
    }
    if (!Number.isFinite(input.messagesPerPayingViewer) || input.messagesPerPayingViewer < 0) {
      return t.messagesPerPayingViewer;
    }
    if (!Number.isFinite(input.averageSuperChatAmount) || input.averageSuperChatAmount < 0) {
      return t.averageSuperChatAmount;
    }
    if (!Number.isFinite(input.creatorSharePct) || input.creatorSharePct <= 0 || input.creatorSharePct > 100) {
      return t.creatorSharePct;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refundRatePct;
    }
    if (!Number.isFinite(input.withholdingTaxPct) || input.withholdingTaxPct < 0 || input.withholdingTaxPct >= 100) {
      return t.withholdingTaxPct;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.otherMonthlyCost;
    }
    if (!Number.isFinite(input.targetMonthlyNet) || input.targetMonthlyNet < 0) {
      return t.targetMonthlyNet;
    }

    return '';
  }

  function getNetFactor(input) {
    return (input.creatorSharePct / 100) * (1 - (input.refundRatePct / 100)) * (1 - (input.withholdingTaxPct / 100));
  }

  function calculateBreakEvenPaidMessages(input) {
    const netFactor = getNetFactor(input);
    const perMessageNet = input.averageSuperChatAmount * netFactor;
    if (!Number.isFinite(perMessageNet) || perMessageNet <= 0) {
      return null;
    }
    return input.otherMonthlyCost / perMessageNet;
  }

  function calculateTargetAverageSuperChatAmount(input) {
    const monthlyLiveViews = input.streamsPerMonth * input.averageViewersPerStream;
    const monthlyPaidMessages = monthlyLiveViews * (input.payingViewerRatePct / 100) * input.messagesPerPayingViewer;
    const netFactor = getNetFactor(input);
    if (!Number.isFinite(monthlyPaidMessages) || monthlyPaidMessages <= 0 || !Number.isFinite(netFactor) || netFactor <= 0) {
      return null;
    }
    return (input.targetMonthlyNet + input.otherMonthlyCost) / (monthlyPaidMessages * netFactor);
  }

  function calculateTargetPayingViewerRatePct(input) {
    const monthlyLiveViews = input.streamsPerMonth * input.averageViewersPerStream;
    const netFactor = getNetFactor(input);
    const denominator = monthlyLiveViews * input.messagesPerPayingViewer * input.averageSuperChatAmount * netFactor;
    if (!Number.isFinite(denominator) || denominator <= 0) {
      return null;
    }
    return ((input.targetMonthlyNet + input.otherMonthlyCost) / denominator) * 100;
  }

  function formatMoney(value, lang, currency) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function formatPercent(value, lang) {
    return `${formatNumber(value, lang, 2)}%`;
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const currency = result.inputs.currency;

    const lines = [
      t.summaryTitle,
      `${t.streamsPerMonthLabel}: ${result.inputs.streamsPerMonth}`,
      `${t.averageViewersPerStreamLabel}: ${formatNumber(result.inputs.averageViewersPerStream, lang, 0)}`,
      `${t.payingViewerRatePctLabel}: ${formatPercent(result.inputs.payingViewerRatePct, lang)}`,
      `${t.messagesPerPayingViewerLabel}: ${formatNumber(result.inputs.messagesPerPayingViewer, lang, 2)}`,
      `${t.averageSuperChatAmountLabel}: ${formatMoney(result.inputs.averageSuperChatAmount, lang, currency)}`,
      `${t.monthlyLiveViewsLabel}: ${formatNumber(result.monthlyLiveViews, lang, 0)}`,
      `${t.monthlyPayingViewersLabel}: ${formatNumber(result.monthlyPayingViewers, lang, 2)}`,
      `${t.monthlyPaidMessagesLabel}: ${formatNumber(result.monthlyPaidMessages, lang, 2)}`,
      `${t.grossFanSpendLabel}: ${formatMoney(result.grossFanSpend, lang, currency)}`,
      `${t.creatorShareBeforeAdjustmentsLabel}: ${formatMoney(result.creatorShareBeforeAdjustments, lang, currency)}`,
      `${t.refundLossLabel}: ${formatMoney(result.refundLoss, lang, currency)}`,
      `${t.withholdingTaxLabel}: ${formatMoney(result.withholdingTax, lang, currency)}`,
      `${t.takeHomeBeforeCostsLabel}: ${formatMoney(result.takeHomeBeforeCosts, lang, currency)}`,
      `${t.monthlyNetLabel}: ${formatMoney(result.monthlyNet, lang, currency)}`,
      `${t.breakEvenPaidMessagesLabel}: ${result.breakEvenPaidMessages == null ? t.na : formatNumber(result.breakEvenPaidMessages, lang, 2)}`,
      `${t.breakEvenPayingViewerRatePctLabel}: ${result.breakEvenPayingViewerRatePct == null ? t.na : formatPercent(result.breakEvenPayingViewerRatePct, lang)}`,
      `${t.targetAverageSuperChatAmountLabel}: ${result.targetAverageSuperChatAmount == null ? t.na : formatMoney(result.targetAverageSuperChatAmount, lang, currency)}`,
      `${t.targetPayingViewerRatePctLabel}: ${result.targetPayingViewerRatePct == null ? t.na : formatPercent(result.targetPayingViewerRatePct, lang)}`
    ];

    return lines.join('\n');
  }

  function calculate(input, options) {
    const lang = options && options.lang ? options.lang : 'en';
    const merged = { ...DEFAULTS, ...input };
    const normalized = normalizeInput(merged);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const monthlyLiveViews = normalized.streamsPerMonth * normalized.averageViewersPerStream;
    const monthlyPayingViewers = monthlyLiveViews * (normalized.payingViewerRatePct / 100);
    const monthlyPaidMessages = monthlyPayingViewers * normalized.messagesPerPayingViewer;
    const grossFanSpend = monthlyPaidMessages * normalized.averageSuperChatAmount;
    const creatorShareBeforeAdjustments = grossFanSpend * (normalized.creatorSharePct / 100);
    const platformShareLoss = grossFanSpend - creatorShareBeforeAdjustments;
    const refundLoss = creatorShareBeforeAdjustments * (normalized.refundRatePct / 100);
    const revenueAfterRefunds = creatorShareBeforeAdjustments - refundLoss;
    const withholdingTax = Math.max(revenueAfterRefunds, 0) * (normalized.withholdingTaxPct / 100);
    const takeHomeBeforeCosts = revenueAfterRefunds - withholdingTax;
    const monthlyNet = takeHomeBeforeCosts - normalized.otherMonthlyCost;
    const takeHomePerStream = normalized.streamsPerMonth > 0 ? monthlyNet / normalized.streamsPerMonth : null;
    const takeHomePerThousandViews = monthlyLiveViews > 0 ? monthlyNet / (monthlyLiveViews / 1000) : null;
    const effectiveTakeHomeRatePct = grossFanSpend > 0 ? (takeHomeBeforeCosts / grossFanSpend) * 100 : 0;
    const breakEvenPaidMessages = calculateBreakEvenPaidMessages(normalized);
    const breakEvenPayingViewerRatePct = (
      breakEvenPaidMessages == null || monthlyLiveViews <= 0 || normalized.messagesPerPayingViewer <= 0
    ) ? null : (breakEvenPaidMessages / (monthlyLiveViews * normalized.messagesPerPayingViewer)) * 100;
    const targetAverageSuperChatAmount = calculateTargetAverageSuperChatAmount(normalized);
    const targetPayingViewerRatePct = calculateTargetPayingViewerRatePct(normalized);

    const result = {
      inputs: normalized,
      monthlyLiveViews: round2(monthlyLiveViews),
      monthlyPayingViewers: round4(monthlyPayingViewers),
      monthlyPaidMessages: round4(monthlyPaidMessages),
      grossFanSpend: round2(grossFanSpend),
      platformShareLoss: round2(platformShareLoss),
      creatorShareBeforeAdjustments: round2(creatorShareBeforeAdjustments),
      refundLoss: round2(refundLoss),
      withholdingTax: round2(withholdingTax),
      takeHomeBeforeCosts: round2(takeHomeBeforeCosts),
      monthlyNet: round2(monthlyNet),
      takeHomePerStream: takeHomePerStream == null ? null : round2(takeHomePerStream),
      takeHomePerThousandViews: takeHomePerThousandViews == null ? null : round2(takeHomePerThousandViews),
      effectiveTakeHomeRatePct: round4(effectiveTakeHomeRatePct),
      breakEvenPaidMessages: breakEvenPaidMessages == null ? null : round4(breakEvenPaidMessages),
      breakEvenPayingViewerRatePct: breakEvenPayingViewerRatePct == null ? null : round4(breakEvenPayingViewerRatePct),
      targetAverageSuperChatAmount: targetAverageSuperChatAmount == null ? null : round4(targetAverageSuperChatAmount),
      targetPayingViewerRatePct: targetPayingViewerRatePct == null ? null : round4(targetPayingViewerRatePct),
      status: monthlyNet >= 0 ? 'good' : 'warn'
    };

    result.summary = buildSummary(result, lang);

    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    TEXT,
    calculate,
    getNetFactor,
    calculateBreakEvenPaidMessages,
    calculateTargetAverageSuperChatAmount,
    calculateTargetPayingViewerRatePct
  };

  root.YouTubeSuperChatRevenueCalculator = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (!root.document) {
    return;
  }

  const fieldIds = [
    'streamsPerMonth',
    'averageViewersPerStream',
    'payingViewerRatePct',
    'messagesPerPayingViewer',
    'averageSuperChatAmount',
    'creatorSharePct',
    'refundRatePct',
    'withholdingTaxPct',
    'otherMonthlyCost',
    'targetMonthlyNet',
    'currency'
  ];

  const els = Object.fromEntries(fieldIds.map((id) => [id, root.document.getElementById(id)]));
  [
    'langBtn',
    'copyBtn',
    'resetBtn',
    'error',
    'status',
    'summary',
    'resultsContent',
    'resultsEmpty',
    'monthlyLiveViews',
    'monthlyPayingViewers',
    'monthlyPaidMessages',
    'grossFanSpend',
    'monthlyNet',
    'takeHomePerStream',
    'creatorShareBeforeAdjustments',
    'platformShareLoss',
    'refundLoss',
    'withholdingTax',
    'takeHomeBeforeCosts',
    'takeHomePerThousandViews',
    'effectiveTakeHomeRatePct',
    'breakEvenPaidMessages',
    'breakEvenPayingViewerRatePct',
    'targetAverageSuperChatAmount',
    'targetPayingViewerRatePct'
  ].forEach((id) => {
    els[id] = root.document.getElementById(id);
  });

  let currentLang = 'en';

  function applyDefaults() {
    fieldIds.forEach((id) => {
      if (els[id]) {
        els[id].value = DEFAULTS[id];
      }
    });
  }

  function collectInput() {
    const input = {};
    fieldIds.forEach((id) => {
      input[id] = els[id].value;
    });
    return input;
  }

  function renderStaticText() {
    root.document.documentElement.lang = currentLang;
    root.document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const t = TEXT[currentLang] || TEXT.en;
      if (t[key]) {
        node.textContent = t[key];
      }
    });
    if (els.langBtn) {
      els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';
    }
  }

  function formatNullableMoney(value, currency) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatMoney(value, currentLang, currency);
  }

  function formatNullableNumber(value) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatNumber(value, currentLang, 2);
  }

  function formatNullablePercent(value) {
    const t = TEXT[currentLang] || TEXT.en;
    return value == null ? t.na : formatPercent(value, currentLang);
  }

  function clearOutputs() {
    [
      'monthlyLiveViews',
      'monthlyPayingViewers',
      'monthlyPaidMessages',
      'grossFanSpend',
      'monthlyNet',
      'takeHomePerStream',
      'creatorShareBeforeAdjustments',
      'platformShareLoss',
      'refundLoss',
      'withholdingTax',
      'takeHomeBeforeCosts',
      'takeHomePerThousandViews',
      'effectiveTakeHomeRatePct',
      'breakEvenPaidMessages',
      'breakEvenPayingViewerRatePct',
      'targetAverageSuperChatAmount',
      'targetPayingViewerRatePct'
    ].forEach((id) => {
      if (els[id]) {
        els[id].textContent = '—';
      }
    });
    els.summary.value = '';
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
    els.status.textContent = result.monthlyNet >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.monthlyNet >= 0 ? 'good' : 'warn'}`;

    const currency = result.inputs.currency;
    els.monthlyLiveViews.textContent = formatNumber(result.monthlyLiveViews, currentLang, 0);
    els.monthlyPayingViewers.textContent = formatNumber(result.monthlyPayingViewers, currentLang, 2);
    els.monthlyPaidMessages.textContent = formatNumber(result.monthlyPaidMessages, currentLang, 2);
    els.grossFanSpend.textContent = formatMoney(result.grossFanSpend, currentLang, currency);
    els.monthlyNet.textContent = formatMoney(result.monthlyNet, currentLang, currency);
    els.takeHomePerStream.textContent = formatNullableMoney(result.takeHomePerStream, currency);
    els.creatorShareBeforeAdjustments.textContent = formatMoney(result.creatorShareBeforeAdjustments, currentLang, currency);
    els.platformShareLoss.textContent = formatMoney(result.platformShareLoss, currentLang, currency);
    els.refundLoss.textContent = formatMoney(result.refundLoss, currentLang, currency);
    els.withholdingTax.textContent = formatMoney(result.withholdingTax, currentLang, currency);
    els.takeHomeBeforeCosts.textContent = formatMoney(result.takeHomeBeforeCosts, currentLang, currency);
    els.takeHomePerThousandViews.textContent = formatNullableMoney(result.takeHomePerThousandViews, currency);
    els.effectiveTakeHomeRatePct.textContent = formatPercent(result.effectiveTakeHomeRatePct, currentLang);
    els.breakEvenPaidMessages.textContent = formatNullableNumber(result.breakEvenPaidMessages);
    els.breakEvenPayingViewerRatePct.textContent = formatNullablePercent(result.breakEvenPayingViewerRatePct);
    els.targetAverageSuperChatAmount.textContent = formatNullableMoney(result.targetAverageSuperChatAmount, currency);
    els.targetPayingViewerRatePct.textContent = formatNullablePercent(result.targetPayingViewerRatePct);
    els.summary.value = result.summary;
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
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
