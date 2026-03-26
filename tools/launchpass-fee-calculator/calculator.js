(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.LaunchPassFeeCalculator = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PROCESSOR_PRESETS = [
    {
      id: 'domestic',
      ratePct: 2.9,
      flatFee: 0.30,
      label: {
        en: 'Stripe domestic cards · 2.9% + $0.30',
        ko: 'Stripe 국내 카드 · 2.9% + $0.30'
      }
    },
    {
      id: 'international',
      ratePct: 4.4,
      flatFee: 0.30,
      label: {
        en: 'Stripe international cards · 4.4% + $0.30',
        ko: 'Stripe 해외 카드 · 4.4% + $0.30'
      }
    },
    {
      id: 'custom',
      ratePct: null,
      flatFee: null,
      label: {
        en: 'Custom processor fees',
        ko: '커스텀 처리 수수료'
      }
    }
  ];

  const presetMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    monthlyGrossSales: 4900,
    successfulCharges: 100,
    refundRatePct: 2,
    launchPassMonthlyFee: 29,
    launchPassTransactionRatePct: 3.5,
    processorPreset: 'domestic',
    customProcessorRatePct: 3.7,
    customProcessorFlatFee: 0.45,
    otherMonthlyCost: 120,
    desiredMonthlyNetProfit: 4000,
    currency: 'USD'
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      gross: 'Monthly gross sales must be greater than zero.',
      charges: 'Successful charges must be a whole number greater than zero.',
      refundRate: 'Refund rate must be 0 or above and below 100%.',
      launchPassMonthlyFee: 'LaunchPass monthly fee must be 0 or above.',
      launchPassTransactionRatePct: 'LaunchPass transaction fee must be 0 or above and below 100%.',
      preset: 'Unsupported processor preset.',
      customProcessorRatePct: 'Custom processor rate must be 0 or above and below 100%.',
      customProcessorFlatFee: 'Custom processor flat fee must be 0 or above.',
      otherMonthlyCost: 'Other monthly cost must be 0 or above.',
      desiredMonthlyNetProfit: 'Desired monthly net profit must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid LaunchPass assumptions to calculate take-home.',
      statusGood: 'This LaunchPass setup is profitable under the current assumptions.',
      statusWarn: 'This LaunchPass setup is underwater. Re-check pricing, refunds, or fee assumptions.',
      targetHit: 'Current gross already clears the target net threshold.',
      targetMiss: 'Current gross is below the target net threshold.',
      summaryTitle: '[LaunchPass Fee Calculator Summary]',
      grossLabel: 'Monthly gross sales',
      chargesLabel: 'Successful charges',
      avgChargeLabel: 'Average charge amount',
      refundLossLabel: 'Refund loss',
      launchPassMonthlyFeeLabel: 'LaunchPass monthly fee',
      launchPassTransactionFeesLabel: 'LaunchPass transaction fees',
      processorLabel: 'Processor preset',
      processorFeesLabel: 'Stripe processing fees',
      takeHomeAfterPlatformLabel: 'Take-home after platform fees',
      netProfitLabel: 'Monthly net profit',
      breakEvenGrossLabel: 'Break-even monthly gross sales',
      breakEvenChargesLabel: 'Break-even successful charges',
      targetGrossLabel: 'Required monthly gross for target net',
      targetChargesLabel: 'Required successful charges for target net',
      targetGapLabel: 'Additional gross needed for target',
      targetBufferLabel: 'Gross buffer above target',
      note: 'Defaults mirror current public LaunchPass baselines at build time: $29/month, 3.5% per transaction, and Stripe domestic 2.9% + $0.30. LaunchPass docs also state that refunded payments still lose both Stripe fees and LaunchPass fees. Update these fields if you have a discounted rate or different processor terms.',
      na: 'N/A'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      gross: '월 총매출은 0보다 커야 합니다.',
      charges: '성공 결제 건수는 0보다 큰 정수여야 합니다.',
      refundRate: '환불률은 0 이상 100 미만이어야 합니다.',
      launchPassMonthlyFee: 'LaunchPass 월 요금은 0 이상이어야 합니다.',
      launchPassTransactionRatePct: 'LaunchPass 거래 수수료율은 0 이상 100 미만이어야 합니다.',
      preset: '지원하지 않는 처리 수수료 프리셋입니다.',
      customProcessorRatePct: '커스텀 처리 수수료율은 0 이상 100 미만이어야 합니다.',
      customProcessorFlatFee: '커스텀 고정 수수료는 0 이상이어야 합니다.',
      otherMonthlyCost: '기타 월 고정비는 0 이상이어야 합니다.',
      desiredMonthlyNetProfit: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 LaunchPass 가정을 넣으면 실수령액이 계산됩니다.',
      statusGood: '현재 가정에서는 LaunchPass 운영이 흑자입니다.',
      statusWarn: '현재 가정에서는 LaunchPass 운영이 적자입니다. 가격, 환불, 수수료를 다시 점검하세요.',
      targetHit: '현재 매출이면 목표 순이익 구간을 넘깁니다.',
      targetMiss: '현재 매출이면 목표 순이익 구간에 아직 못 미칩니다.',
      summaryTitle: '[LaunchPass 수수료 계산기 요약]',
      grossLabel: '월 총매출',
      chargesLabel: '성공 결제 건수',
      avgChargeLabel: '평균 결제금액',
      refundLossLabel: '환불 손실',
      launchPassMonthlyFeeLabel: 'LaunchPass 월 요금',
      launchPassTransactionFeesLabel: 'LaunchPass 거래 수수료',
      processorLabel: '결제 처리 프리셋',
      processorFeesLabel: 'Stripe 처리 수수료',
      takeHomeAfterPlatformLabel: '플랫폼 차감 후 실수령',
      netProfitLabel: '월 순이익',
      breakEvenGrossLabel: '손익분기 월매출',
      breakEvenChargesLabel: '손익분기 결제 건수',
      targetGrossLabel: '목표 순이익 달성 필요 월매출',
      targetChargesLabel: '목표 순이익 달성 필요 결제 건수',
      targetGapLabel: '목표까지 추가 필요 매출',
      targetBufferLabel: '목표 초과 매출 버퍼',
      note: '기본값은 도구 제작 시점의 LaunchPass 공개 기준을 반영합니다: 월 $29, 거래당 3.5%, Stripe 국내 카드 2.9% + $0.30. LaunchPass 문서상 환불이 발생해도 Stripe 수수료와 LaunchPass 수수료는 돌려받지 못합니다. 할인 요율이나 다른 결제 조건이 있으면 직접 수정하세요.',
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

  function toNumber(value, fallback) {
    if (value == null || value === '') {
      return fallback;
    }
    return Number(value);
  }

  function normalizeInput(input) {
    return {
      monthlyGrossSales: toNumber(input.monthlyGrossSales, DEFAULTS.monthlyGrossSales),
      successfulCharges: toNumber(input.successfulCharges, DEFAULTS.successfulCharges),
      refundRatePct: toNumber(input.refundRatePct, DEFAULTS.refundRatePct),
      launchPassMonthlyFee: toNumber(input.launchPassMonthlyFee, DEFAULTS.launchPassMonthlyFee),
      launchPassTransactionRatePct: toNumber(input.launchPassTransactionRatePct, DEFAULTS.launchPassTransactionRatePct),
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: toNumber(input.customProcessorRatePct, DEFAULTS.customProcessorRatePct),
      customProcessorFlatFee: toNumber(input.customProcessorFlatFee, DEFAULTS.customProcessorFlatFee),
      otherMonthlyCost: toNumber(input.otherMonthlyCost, DEFAULTS.otherMonthlyCost),
      desiredMonthlyNetProfit: toNumber(input.desiredMonthlyNetProfit, DEFAULTS.desiredMonthlyNetProfit),
      currency: input.currency || DEFAULTS.currency
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

    if (!Number.isFinite(input.successfulCharges) || input.successfulCharges <= 0 || !Number.isInteger(input.successfulCharges)) {
      return t.charges;
    }

    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refundRate;
    }

    if (!Number.isFinite(input.launchPassMonthlyFee) || input.launchPassMonthlyFee < 0) {
      return t.launchPassMonthlyFee;
    }

    if (!Number.isFinite(input.launchPassTransactionRatePct) || input.launchPassTransactionRatePct < 0 || input.launchPassTransactionRatePct >= 100) {
      return t.launchPassTransactionRatePct;
    }

    if (!getProcessorPreset(input)) {
      return t.preset;
    }

    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      return t.customProcessorRatePct;
    }

    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      return t.customProcessorFlatFee;
    }

    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.otherMonthlyCost;
    }

    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.desiredMonthlyNetProfit;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);
    const gross = input.monthlyGrossSales;
    const charges = input.successfulCharges;
    const refundRate = input.refundRatePct / 100;
    const launchPassRate = input.launchPassTransactionRatePct / 100;
    const processorRate = processor.ratePct / 100;
    const averageChargeAmount = gross / charges;
    const refundLoss = gross * refundRate;
    const launchPassTransactionFees = gross * launchPassRate;
    const processorFees = gross * processorRate + charges * processor.flatFee;
    const feeDragTotal = refundLoss + input.launchPassMonthlyFee + launchPassTransactionFees + processorFees;
    const takeHomeAfterPlatform = gross - feeDragTotal;
    const monthlyNetProfit = takeHomeAfterPlatform - input.otherMonthlyCost;
    const annualizedNetProfit = monthlyNetProfit * 12;
    const effectiveFeeRate = gross > 0 ? feeDragTotal / gross : 0;
    const netMargin = gross > 0 ? monthlyNetProfit / gross : 0;
    const flatFeeRate = averageChargeAmount > 0 ? processor.flatFee / averageChargeAmount : Number.POSITIVE_INFINITY;
    const contributionMarginRate = 1 - refundRate - launchPassRate - processorRate - flatFeeRate;

    return {
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      averageChargeAmount,
      refundLoss,
      launchPassMonthlyFee: input.launchPassMonthlyFee,
      launchPassTransactionFees,
      processorFees,
      feeDragTotal,
      takeHomeAfterPlatform,
      monthlyNetProfit,
      annualizedNetProfit,
      effectiveFeeRate,
      netMargin,
      contributionMarginRate
    };
  }

  function findRequiredGross(input, targetNet, overrides) {
    const scenario = evaluateScenario(input, overrides);
    if (!Number.isFinite(scenario.averageChargeAmount) || scenario.averageChargeAmount <= 0) {
      return null;
    }
    if (!Number.isFinite(scenario.contributionMarginRate) || scenario.contributionMarginRate <= 0) {
      return null;
    }

    const fixedCostBase = input.launchPassMonthlyFee + input.otherMonthlyCost + targetNet;
    return fixedCostBase / scenario.contributionMarginRate;
  }

  function formatMoney(value, currency, lang) {
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).na;
    }

    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || DEFAULTS.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).na;
    }

    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function buildComparisonRows(input, lang) {
    return PROCESSOR_PRESETS.map((preset) => {
      const processor = preset.id === 'custom'
        ? {
            id: preset.id,
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

      const rowScenario = evaluateScenario(input, { processor });

      return {
        id: preset.id,
        label: processor.label[lang] || processor.label.en,
        netProfit: round2(rowScenario.monthlyNetProfit),
        effectiveFeeRatePct: round2(rowScenario.effectiveFeeRate * 100),
        takeHomeAfterPlatform: round2(rowScenario.takeHomeAfterPlatform)
      };
    });
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const currency = result.inputs.currency;

    return [
      t.summaryTitle,
      `${t.grossLabel}: ${formatMoney(result.monthlyGrossSales, currency, lang)}`,
      `${t.chargesLabel}: ${result.successfulCharges}`,
      `${t.avgChargeLabel}: ${formatMoney(result.averageChargeAmount, currency, lang)}`,
      `${t.refundLossLabel}: ${formatMoney(result.refundLoss, currency, lang)}`,
      `${t.launchPassMonthlyFeeLabel}: ${formatMoney(result.launchPassMonthlyFee, currency, lang)}`,
      `${t.launchPassTransactionFeesLabel}: ${formatMoney(result.launchPassTransactionFees, currency, lang)}`,
      `${t.processorLabel}: ${result.processorLabel}`,
      `${t.processorFeesLabel}: ${formatMoney(result.processorFees, currency, lang)}`,
      `${t.takeHomeAfterPlatformLabel}: ${formatMoney(result.takeHomeAfterPlatform, currency, lang)}`,
      `${t.netProfitLabel}: ${formatMoney(result.monthlyNetProfit, currency, lang)}`,
      `${t.breakEvenGrossLabel}: ${formatMoney(result.breakEvenGrossSales, currency, lang)}`,
      `${t.breakEvenChargesLabel}: ${result.breakEvenSuccessfulCharges == null ? t.na : result.breakEvenSuccessfulCharges.toFixed(2)}`,
      `${t.targetGrossLabel}: ${formatMoney(result.requiredGrossForTargetNet, currency, lang)}`,
      `${t.targetChargesLabel}: ${result.requiredSuccessfulChargesForTargetNet == null ? t.na : result.requiredSuccessfulChargesForTargetNet.toFixed(2)}`,
      `${t.targetGapLabel}: ${formatMoney(result.targetGapGross, currency, lang)}`,
      `${t.targetBufferLabel}: ${formatMoney(result.targetGrossBuffer, currency, lang)}`
    ].join('\n');
  }

  function calculate(rawInput, opts) {
    const lang = opts && opts.lang ? opts.lang : 'en';
    const t = TEXT[lang] || TEXT.en;
    const input = normalizeInput(rawInput || {});
    const error = validate(input, lang);

    if (error) {
      return { result: null, error };
    }

    const scenario = evaluateScenario(input);
    const breakEvenGrossSales = findRequiredGross(input, 0);
    const requiredGrossForTargetNet = findRequiredGross(input, input.desiredMonthlyNetProfit);
    const breakEvenSuccessfulCharges = breakEvenGrossSales == null ? null : breakEvenGrossSales / scenario.averageChargeAmount;
    const requiredSuccessfulChargesForTargetNet = requiredGrossForTargetNet == null ? null : requiredGrossForTargetNet / scenario.averageChargeAmount;
    const targetGapGross = requiredGrossForTargetNet == null ? null : Math.max(requiredGrossForTargetNet - input.monthlyGrossSales, 0);
    const targetGrossBuffer = requiredGrossForTargetNet == null ? null : Math.max(input.monthlyGrossSales - requiredGrossForTargetNet, 0);
    const comparisonRows = buildComparisonRows(input, lang);

    const result = {
      inputs: input,
      processorLabel: scenario.processorLabel[lang] || scenario.processorLabel.en,
      monthlyGrossSales: round2(input.monthlyGrossSales),
      successfulCharges: input.successfulCharges,
      averageChargeAmount: round2(scenario.averageChargeAmount),
      refundLoss: round2(scenario.refundLoss),
      launchPassMonthlyFee: round2(scenario.launchPassMonthlyFee),
      launchPassTransactionFees: round2(scenario.launchPassTransactionFees),
      processorFees: round2(scenario.processorFees),
      feeDragTotal: round2(scenario.feeDragTotal),
      takeHomeAfterPlatform: round2(scenario.takeHomeAfterPlatform),
      monthlyNetProfit: round2(scenario.monthlyNetProfit),
      annualizedNetProfit: round2(scenario.annualizedNetProfit),
      effectiveFeeRatePct: round2(scenario.effectiveFeeRate * 100),
      netMarginPct: round2(scenario.netMargin * 100),
      contributionMarginRatePct: Number.isFinite(scenario.contributionMarginRate)
        ? round2(scenario.contributionMarginRate * 100)
        : null,
      breakEvenGrossSales: breakEvenGrossSales == null ? null : round2(breakEvenGrossSales),
      breakEvenSuccessfulCharges: breakEvenSuccessfulCharges == null ? null : round2(breakEvenSuccessfulCharges),
      requiredGrossForTargetNet: requiredGrossForTargetNet == null ? null : round2(requiredGrossForTargetNet),
      requiredSuccessfulChargesForTargetNet: requiredSuccessfulChargesForTargetNet == null ? null : round2(requiredSuccessfulChargesForTargetNet),
      targetGapGross: targetGapGross == null ? null : round2(targetGapGross),
      targetGrossBuffer: targetGrossBuffer == null ? null : round2(targetGrossBuffer),
      comparisonRows,
      note: t.note,
      statusTone: scenario.monthlyNetProfit >= 0 ? 'good' : 'warn',
      targetStatus: targetGapGross == null || targetGapGross <= 0 ? 'hit' : 'miss'
    };

    result.summary = buildSummary(result, lang);

    return { result, error: '' };
  }

  return {
    DEFAULTS,
    PROCESSOR_PRESETS,
    TEXT,
    normalizeInput,
    getProcessorPreset,
    resolveProcessor,
    validate,
    evaluateScenario,
    findRequiredGross,
    formatMoney,
    formatPercent,
    calculate
  };
}));
