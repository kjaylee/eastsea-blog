(function (root) {
  const MEMBERFUL_MONTHLY_FEE = 49;
  const MEMBERFUL_TRANSACTION_RATE = 0.049;

  const PROCESSOR_PRESETS = [
    {
      id: 'domestic',
      ratePct: 2.9,
      flatFee: 0.3,
      label: { ko: 'Stripe 미국 국내 카드 · 2.9% + $0.30', en: 'Stripe domestic cards · 2.9% + $0.30' }
    },
    {
      id: 'international',
      ratePct: 4.4,
      flatFee: 0.3,
      label: { ko: 'Stripe 해외 카드 · 4.4% + $0.30', en: 'Stripe international cards · 4.4% + $0.30' }
    },
    {
      id: 'custom',
      ratePct: null,
      flatFee: null,
      label: { ko: '커스텀 처리 수수료', en: 'Custom processor fees' }
    }
  ];

  const presetMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    monthlyGrossSales: 5000,
    successfulCharges: 120,
    refundRatePct: 3,
    processorPreset: 'domestic',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.3,
    otherMonthlyCost: 600,
    desiredMonthlyNetProfit: 1000
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      gross: '월 총매출은 0보다 커야 합니다.',
      charges: '성공 결제 건수는 0보다 커야 합니다.',
      refund: '환불률은 0 이상 100 미만이어야 합니다.',
      preset: '지원하지 않는 처리 수수료 프리셋입니다.',
      customRate: '커스텀 처리 수수료율은 0 이상 100 미만이어야 합니다.',
      customFlat: '커스텀 고정 수수료는 0 이상이어야 합니다.',
      otherCost: '기타 월 고정비는 0 이상이어야 합니다.',
      desiredNet: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 Memberful 순수익이 계산됩니다.',
      statusGood: '현재 가정에서는 Memberful 운영이 흑자입니다.',
      statusWarn: '현재 가정에서는 적자입니다. 가격, 환불, 처리 수수료, 고정비를 다시 점검하세요.',
      summaryTitle: '[Memberful 수수료·순이익 요약]',
      presetLabel: '처리 수수료 프리셋',
      monthlyGrossSalesLabel: '월 총매출',
      memberfulFixedLabel: 'Memberful 월 고정비',
      memberfulVariableLabel: 'Memberful 거래 수수료',
      processorFeesLabel: '결제 처리 수수료',
      refundLossLabel: '환불 손실',
      netProfitLabel: '월 순이익',
      breakEvenGrossLabel: '손익분기 월매출',
      targetGrossLabel: '목표 순이익 달성 필요 월매출',
      note: '참고: Memberful 공개 요금은 Standard $49/월 + 4.9% 거래 수수료를 기준으로 모델링했습니다. Stripe 처리 수수료는 국가별로 다를 수 있으며, 기본 프리셋은 Stripe 공개 베이스라인(미국 국내 2.9% + $0.30, 해외 카드 4.4% + $0.30)입니다. 손익분기/목표 매출 계산은 현재 평균 결제금액이 유지된다고 가정합니다.',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      gross: 'Monthly gross sales must be greater than zero.',
      charges: 'Successful charges must be greater than zero.',
      refund: 'Refund rate must be 0 or above and below 100%.',
      preset: 'Unsupported processor preset.',
      customRate: 'Custom processor rate must be 0 or above and below 100%.',
      customFlat: 'Custom flat processor fee must be 0 or above.',
      otherCost: 'Other monthly cost must be 0 or above.',
      desiredNet: 'Desired monthly net profit must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate Memberful take-home.',
      statusGood: 'This Memberful scenario is profitable under the current assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check price, refunds, processor fees, or fixed costs.',
      summaryTitle: '[Memberful Fee & Net Profit Summary]',
      presetLabel: 'Processor preset',
      monthlyGrossSalesLabel: 'Monthly gross sales',
      memberfulFixedLabel: 'Memberful monthly fee',
      memberfulVariableLabel: 'Memberful transaction fees',
      processorFeesLabel: 'Processor fees',
      refundLossLabel: 'Refund loss',
      netProfitLabel: 'Monthly net profit',
      breakEvenGrossLabel: 'Break-even monthly gross sales',
      targetGrossLabel: 'Required monthly gross for target net',
      note: 'Note: this calculator models Memberful public pricing as Standard $49/month + 4.9% transaction fees. Stripe processing varies by country; the default presets use Stripe public baseline pricing (domestic 2.9% + $0.30, international cards 4.4% + $0.30). Break-even and target-gross math assume your current average charge amount stays constant as sales scale.',
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
      monthlyGrossSales: Number(input.monthlyGrossSales),
      successfulCharges: Number(input.successfulCharges),
      refundRatePct: Number(input.refundRatePct),
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: Number(input.customProcessorRatePct),
      customProcessorFlatFee: Number(input.customProcessorFlatFee),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getProcessorPreset(input) {
    return presetMap[input.processorPreset] || null;
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input);
    if (!preset) {
      return null;
    }

    if (preset.id === 'custom') {
      return {
        id: preset.id,
        label: preset.label,
        ratePct: input.customProcessorRatePct,
        flatFee: input.customProcessorFlatFee
      };
    }

    return {
      id: preset.id,
      label: preset.label,
      ratePct: preset.ratePct,
      flatFee: preset.flatFee
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) {
      return t.gross;
    }

    if (!Number.isFinite(input.successfulCharges) || input.successfulCharges <= 0) {
      return t.charges;
    }

    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refund;
    }

    if (!getProcessorPreset(input)) {
      return t.preset;
    }

    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      return t.customRate;
    }

    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      return t.customFlat;
    }

    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.otherCost;
    }

    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.desiredNet;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const processor = overrides && overrides.processor
      ? overrides.processor
      : resolveProcessor(input);
    const gross = input.monthlyGrossSales;
    const charges = input.successfulCharges;
    const refundRate = input.refundRatePct / 100;
    const processorRate = processor.ratePct / 100;
    const avgChargeAmount = charges > 0 ? gross / charges : 0;
    const refundLoss = gross * refundRate;
    const memberfulTransactionFees = gross * MEMBERFUL_TRANSACTION_RATE;
    const processorFees = gross * processorRate + charges * processor.flatFee;
    const takeHomeAfterPlatform = gross - refundLoss - MEMBERFUL_MONTHLY_FEE - memberfulTransactionFees - processorFees;
    const netProfit = takeHomeAfterPlatform - input.otherMonthlyCost;
    const annualizedNetProfit = netProfit * 12;
    const effectiveFeeRate = gross > 0
      ? (MEMBERFUL_MONTHLY_FEE + memberfulTransactionFees + processorFees) / gross
      : 0;
    const flatFeeRate = avgChargeAmount > 0 ? processor.flatFee / avgChargeAmount : Number.POSITIVE_INFINITY;
    const contributionMarginRate = 1 - refundRate - MEMBERFUL_TRANSACTION_RATE - processorRate - flatFeeRate;

    return {
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      refundRate,
      avgChargeAmount,
      refundLoss,
      memberfulFixedFee: MEMBERFUL_MONTHLY_FEE,
      memberfulTransactionFees,
      processorFees,
      takeHomeAfterPlatform,
      netProfit,
      annualizedNetProfit,
      effectiveFeeRate,
      contributionMarginRate
    };
  }

  function findRequiredGrossForNet(input, targetNet, overrides) {
    const scenario = evaluateScenario(input, overrides);
    if (!Number.isFinite(scenario.avgChargeAmount) || scenario.avgChargeAmount <= 0) {
      return null;
    }
    if (!Number.isFinite(scenario.contributionMarginRate) || scenario.contributionMarginRate <= 0) {
      return null;
    }

    const fixedCosts = MEMBERFUL_MONTHLY_FEE + input.otherMonthlyCost + targetNet;
    return fixedCosts / scenario.contributionMarginRate;
  }

  function buildComparisonRows(input, lang) {
    return PROCESSOR_PRESETS.map((preset) => {
      const processor = preset.id === 'custom'
        ? {
            id: 'custom',
            label: preset.label,
            ratePct: input.customProcessorRatePct,
            flatFee: input.customProcessorFlatFee
          }
        : {
            id: preset.id,
            label: preset.label,
            ratePct: preset.ratePct,
            flatFee: preset.flatFee
          };
      const evaluated = evaluateScenario(input, { processor });
      const breakEvenGrossSales = findRequiredGrossForNet(input, 0, { processor });

      return {
        id: processor.id,
        label: processor.label[lang] || processor.label.en,
        processorRatePct: round2(processor.ratePct),
        processorFlatFee: round2(processor.flatFee),
        processorFees: round2(evaluated.processorFees),
        takeHomeAfterPlatform: round2(evaluated.takeHomeAfterPlatform),
        netProfit: round2(evaluated.netProfit),
        effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
        breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales)
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

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.presetLabel}: ${result.processorLabel}`,
      `${t.monthlyGrossSalesLabel}: ${formatMoney(result.inputs.monthlyGrossSales, lang)}`,
      `${t.memberfulFixedLabel}: ${formatMoney(result.memberfulFixedFee, lang)}`,
      `${t.memberfulVariableLabel}: ${formatMoney(result.memberfulTransactionFees, lang)}`,
      `${t.processorFeesLabel}: ${formatMoney(result.processorFees, lang)}`,
      `${t.refundLossLabel}: ${formatMoney(result.refundLoss, lang)}`,
      `${lang === 'ko' ? '플랫폼 비용 차감 후 실수령액' : 'Take-home after platform costs'}: ${formatMoney(result.takeHomeAfterPlatform, lang)}`,
      `${t.netProfitLabel}: ${formatMoney(result.netProfit, lang)}`,
      `${lang === 'ko' ? '연환산 순이익' : 'Annualized net profit'}: ${formatMoney(result.annualizedNetProfit, lang)}`,
      `${lang === 'ko' ? '평균 결제금액' : 'Average charge amount'}: ${formatMoney(result.averageChargeAmount, lang)}`,
      `${lang === 'ko' ? '실효 수수료율' : 'Effective fee rate'}: ${formatPercent(result.effectiveFeeRatePct, lang)}`,
      `${t.breakEvenGrossLabel}: ${result.breakEvenGrossSales == null ? t.na : formatMoney(result.breakEvenGrossSales, lang)}`,
      `${t.targetGrossLabel}: ${result.requiredGrossForTargetNet == null ? t.na : formatMoney(result.requiredGrossForTargetNet, lang)}`,
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

    const processor = resolveProcessor(normalized);
    const evaluated = evaluateScenario(normalized, { processor });
    const breakEvenGrossSales = findRequiredGrossForNet(normalized, 0, { processor });
    const requiredGrossForTargetNet = findRequiredGrossForNet(normalized, normalized.desiredMonthlyNetProfit, { processor });
    const targetGap = requiredGrossForTargetNet == null ? null : Math.max(requiredGrossForTargetNet - normalized.monthlyGrossSales, 0);
    const result = {
      inputs: normalized,
      processorLabel: processor.label[lang] || processor.label.en,
      memberfulFixedFee: round2(evaluated.memberfulFixedFee),
      memberfulTransactionFees: round2(evaluated.memberfulTransactionFees),
      processorFees: round2(evaluated.processorFees),
      refundLoss: round2(evaluated.refundLoss),
      takeHomeAfterPlatform: round2(evaluated.takeHomeAfterPlatform),
      netProfit: round2(evaluated.netProfit),
      annualizedNetProfit: round2(evaluated.annualizedNetProfit),
      averageChargeAmount: round2(evaluated.avgChargeAmount),
      effectiveFeeRate: round4(evaluated.effectiveFeeRate),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
      contributionMarginRate: round4(evaluated.contributionMarginRate),
      contributionMarginRatePct: round2(evaluated.contributionMarginRate * 100),
      breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales),
      requiredGrossForTargetNet: requiredGrossForTargetNet == null ? null : round2(requiredGrossForTargetNet),
      targetGap: targetGap == null ? null : round2(targetGap),
      comparisonRows: buildComparisonRows(normalized, lang)
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    MEMBERFUL_MONTHLY_FEE,
    MEMBERFUL_TRANSACTION_RATE,
    PROCESSOR_PRESETS,
    presetMap,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getProcessorPreset,
    resolveProcessor,
    validate,
    evaluateScenario,
    findRequiredGrossForNet,
    buildComparisonRows,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.MemberfulFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← Tools',
      pageTitle: 'Memberful Fee Calculator | 멤버풀 수수료 계산기',
      title: '멤버풀 수수료 계산기',
      subtitle: 'Memberful Standard $49/월 + 4.9%와 Stripe 처리 수수료, 환불, 기타 고정비를 함께 넣어 실제 월 순이익과 손익분기 매출을 계산합니다.',
      disclaimer: '이 도구는 Memberful 공개 Standard 가격($49/월 + 4.9%)과 Stripe 공개 베이스라인 수수료(미국 국내 2.9% + $0.30, 해외 카드 4.4% + $0.30)를 기반으로 한 planning model입니다. 실제 Stripe 요율은 국가와 결제수단에 따라 달라질 수 있습니다.',
      inputHeader: '입력값',
      assumptionHeader: '가정 및 해석',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      comparisonHeader: '처리 수수료 시나리오 비교',
      summaryHeader: '복사용 요약',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: '유효한 입력값을 넣으면 KPI와 비교표가 표시됩니다.',
      monthlyGrossSales: '월 총매출',
      successfulCharges: '성공 결제 건수',
      refundRatePct: '환불률 (%)',
      processorPreset: '처리 수수료 프리셋',
      customProcessorRatePct: '커스텀 처리 수수료율 (%)',
      customProcessorFlatFee: '커스텀 고정 수수료 ($)',
      otherMonthlyCost: '기타 월 고정비',
      desiredMonthlyNetProfit: '목표 월 순이익',
      assumption1: 'Memberful 플랫폼 비용은 공개 Standard 가격인 $49/월 + 4.9% 거래 수수료로 고정 모델링합니다.',
      assumption2: 'Stripe 프리셋은 공개 베이스라인이며, 해외 카드 프리셋은 국내 카드 2.9% + 1.5% surcharge를 반영합니다.',
      assumption3: '환불은 순매출을 줄이지만, 보수적으로 수수료는 총 성공 결제 기준으로 유지된다고 가정합니다.',
      assumption4: '손익분기/목표 매출 계산은 현재 평균 결제금액이 유지된다고 가정합니다.',
      kpiTakeHome: '플랫폼 비용 차감 후 실수령액',
      kpiNetProfit: '월 순이익',
      kpiBreakEven: '손익분기 월매출',
      kpiTargetGross: '목표 순이익용 월매출',
      kpiAverageCharge: '평균 결제금액',
      kpiEffectiveFee: '실효 수수료율',
      detailMemberfulFixed: 'Memberful 월 고정비',
      detailMemberfulVariable: 'Memberful 거래 수수료',
      detailProcessorFees: '결제 처리 수수료',
      detailRefundLoss: '환불 손실',
      detailAnnualizedNet: '연환산 순이익',
      detailTargetGap: '현재 대비 목표 매출 추가 필요분',
      comparisonPreset: '프리셋',
      comparisonProcessorFees: '처리 수수료',
      comparisonNetProfit: '월 순이익',
      comparisonEffectiveFee: '실효 수수료율',
      comparisonBreakEven: '손익분기 월매출',
      comparisonTakeHome: '실수령액'
    },
    en: {
      back: '← Tools',
      pageTitle: 'Memberful Fee Calculator | 멤버풀 수수료 계산기',
      title: 'Memberful Fee Calculator',
      subtitle: 'Estimate real monthly Memberful take-home using the public Standard $49/month + 4.9% pricing, Stripe processing, refunds, and your other fixed costs.',
      disclaimer: 'This tool is a planning model based on Memberful public Standard pricing ($49/month + 4.9%) and Stripe public baseline fees (domestic 2.9% + $0.30, international cards 4.4% + $0.30). Actual Stripe rates may vary by country and payment method.',
      inputHeader: 'Inputs',
      assumptionHeader: 'Assumptions & interpretation',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      comparisonHeader: 'Processor scenario comparison',
      summaryHeader: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: 'Valid inputs will render KPI cards and the comparison table here.',
      monthlyGrossSales: 'Monthly gross sales',
      successfulCharges: 'Successful charges',
      refundRatePct: 'Refund rate (%)',
      processorPreset: 'Processor preset',
      customProcessorRatePct: 'Custom processor rate (%)',
      customProcessorFlatFee: 'Custom flat fee ($)',
      otherMonthlyCost: 'Other monthly fixed cost',
      desiredMonthlyNetProfit: 'Desired monthly net profit',
      assumption1: 'Memberful platform cost is modeled as the public Standard price: $49/month + 4.9% transaction fees.',
      assumption2: 'Stripe presets use the public baseline pricing, with the international preset modeled as domestic 2.9% plus the published 1.5% international surcharge.',
      assumption3: 'Refunds reduce kept revenue, while fees remain modeled on successful gross charges for conservative planning.',
      assumption4: 'Break-even and target-gross math assume your current average charge amount stays constant as sales scale.',
      kpiTakeHome: 'Take-home after platform costs',
      kpiNetProfit: 'Monthly net profit',
      kpiBreakEven: 'Break-even monthly gross',
      kpiTargetGross: 'Gross needed for target net',
      kpiAverageCharge: 'Average charge amount',
      kpiEffectiveFee: 'Effective fee rate',
      detailMemberfulFixed: 'Memberful monthly fee',
      detailMemberfulVariable: 'Memberful transaction fees',
      detailProcessorFees: 'Processor fees',
      detailRefundLoss: 'Refund loss',
      detailAnnualizedNet: 'Annualized net profit',
      detailTargetGap: 'Additional gross needed vs current',
      comparisonPreset: 'Preset',
      comparisonProcessorFees: 'Processor fees',
      comparisonNetProfit: 'Net profit',
      comparisonEffectiveFee: 'Effective fee rate',
      comparisonBreakEven: 'Break-even gross',
      comparisonTakeHome: 'Take-home'
    }
  };

  const fieldIds = [
    'monthlyGrossSales',
    'successfulCharges',
    'refundRatePct',
    'processorPreset',
    'customProcessorRatePct',
    'customProcessorFlatFee',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit'
  ];

  const currencyKeys = [
    'takeHomeAfterPlatform',
    'netProfit',
    'breakEvenGrossSales',
    'requiredGrossForTargetNet',
    'averageChargeAmount',
    'memberfulFixedFee',
    'memberfulTransactionFees',
    'processorFees',
    'refundLoss',
    'annualizedNetProfit',
    'targetGap'
  ];

  const percentKeys = ['effectiveFeeRatePct'];

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

  [
    'takeHomeAfterPlatform',
    'netProfit',
    'breakEvenGrossSales',
    'requiredGrossForTargetNet',
    'averageChargeAmount',
    'effectiveFeeRatePct',
    'memberfulFixedFee',
    'memberfulTransactionFees',
    'processorFees',
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
      successfulCharges: getInputValue('successfulCharges'),
      refundRatePct: getInputValue('refundRatePct'),
      processorPreset: getInputValue('processorPreset'),
      customProcessorRatePct: getInputValue('customProcessorRatePct'),
      customProcessorFlatFee: getInputValue('customProcessorFlatFee'),
      otherMonthlyCost: getInputValue('otherMonthlyCost'),
      desiredMonthlyNetProfit: getInputValue('desiredMonthlyNetProfit')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function syncCustomProcessorFields() {
    const isCustom = getInputValue('processorPreset') === 'custom';
    els.customProcessorRatePct.disabled = !isCustom;
    els.customProcessorFlatFee.disabled = !isCustom;
    if (!isCustom) {
      const preset = presetMap[getInputValue('processorPreset')] || presetMap.domestic;
      setInputValue('customProcessorRatePct', preset.ratePct);
      setInputValue('customProcessorFlatFee', preset.flatFee);
    }
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
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
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';

    fieldIds.forEach((key) => {
      if (els[`l_${key}`]) {
        els[`l_${key}`].textContent = ui[key];
      }
    });

    PROCESSOR_PRESETS.forEach((preset) => {
      const option = els.processorPreset.querySelector(`option[value="${preset.id}"]`);
      if (option) {
        option.textContent = preset.label[currentLang] || preset.label.en;
      }
    });

    document.querySelector('[data-kpi="takeHomeAfterPlatform"]').textContent = ui.kpiTakeHome;
    document.querySelector('[data-kpi="netProfit"]').textContent = ui.kpiNetProfit;
    document.querySelector('[data-kpi="breakEvenGrossSales"]').textContent = ui.kpiBreakEven;
    document.querySelector('[data-kpi="requiredGrossForTargetNet"]').textContent = ui.kpiTargetGross;
    document.querySelector('[data-kpi="averageChargeAmount"]').textContent = ui.kpiAverageCharge;
    document.querySelector('[data-kpi="effectiveFeeRatePct"]').textContent = ui.kpiEffectiveFee;

    document.querySelector('[data-detail="memberfulFixedFee"]').textContent = ui.detailMemberfulFixed;
    document.querySelector('[data-detail="memberfulTransactionFees"]').textContent = ui.detailMemberfulVariable;
    document.querySelector('[data-detail="processorFees"]').textContent = ui.detailProcessorFees;
    document.querySelector('[data-detail="refundLoss"]').textContent = ui.detailRefundLoss;
    document.querySelector('[data-detail="annualizedNetProfit"]').textContent = ui.detailAnnualizedNet;
    document.querySelector('[data-detail="targetGap"]').textContent = ui.detailTargetGap;

    document.getElementById('comparisonPreset').textContent = ui.comparisonPreset;
    document.getElementById('comparisonProcessorFees').textContent = ui.comparisonProcessorFees;
    document.getElementById('comparisonTakeHome').textContent = ui.comparisonTakeHome;
    document.getElementById('comparisonNetProfit').textContent = ui.comparisonNetProfit;
    document.getElementById('comparisonEffectiveFee').textContent = ui.comparisonEffectiveFee;
    document.getElementById('comparisonBreakEven').textContent = ui.comparisonBreakEven;

    els.assumption1.textContent = ui.assumption1;
    els.assumption2.textContent = ui.assumption2;
    els.assumption3.textContent = ui.assumption3;
    els.assumption4.textContent = ui.assumption4;
  }

  function clearOutputs() {
    currencyKeys.forEach((key) => {
      if (els[key]) {
        els[key].textContent = '—';
      }
    });
    percentKeys.forEach((key) => {
      if (els[key]) {
        els[key].textContent = '—';
      }
    });
    els.summary.value = '';
    els.comparisonBody.innerHTML = '';
  }

  function renderComparison(rows) {
    const t = TEXT[currentLang] || TEXT.en;
    els.comparisonBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.label}</td>
        <td>${formatMoney(row.processorFees, currentLang)}</td>
        <td>${formatMoney(row.takeHomeAfterPlatform, currentLang)}</td>
        <td class="${row.netProfit >= 0 ? 'good' : 'warn'}">${formatMoney(row.netProfit, currentLang)}</td>
        <td>${formatPercent(row.effectiveFeeRatePct, currentLang)}</td>
        <td>${row.breakEvenGrossSales == null ? t.na : formatMoney(row.breakEvenGrossSales, currentLang)}</td>
      </tr>
    `).join('');
  }

  function render() {
    syncCustomProcessorFields();
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
    els.status.textContent = result.netProfit >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.netProfit >= 0 ? 'good' : 'warn'}`;

    currencyKeys.forEach((key) => {
      const value = result[key];
      els[key].textContent = value == null ? t.na : formatMoney(value, currentLang);
    });

    percentKeys.forEach((key) => {
      const value = result[key];
      els[key].textContent = value == null ? t.na : formatPercent(value, currentLang);
    });

    els.summary.value = result.summary;
    renderComparison(result.comparisonRows);
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
      syncCustomProcessorFields();
      renderStaticText();
      render();
    });
  }

  applyDefaults();
  syncCustomProcessorFields();
  renderStaticText();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
