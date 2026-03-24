(function (root) {
  const PLANS = [
    {
      id: 'free',
      transactionRatePct: 5,
      monthlyFee: 0,
      label: { en: 'Free', ko: 'Free' }
    },
    {
      id: 'plus',
      transactionRatePct: 2,
      monthlyFee: 29,
      label: { en: 'Plus', ko: 'Plus' }
    },
    {
      id: 'pro',
      transactionRatePct: 0,
      monthlyFee: 99,
      label: { en: 'Pro', ko: 'Pro' }
    }
  ];

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe-domestic',
      ratePct: 2.9,
      flatFee: 0.30,
      label: { en: 'Stripe baseline · 2.9% + $0.30', ko: 'Stripe 기본값 · 2.9% + $0.30' }
    },
    {
      id: 'paypal-usd',
      ratePct: 2.99,
      flatFee: 0.49,
      label: { en: 'PayPal USD baseline · 2.99% + $0.49', ko: 'PayPal USD 기본값 · 2.99% + $0.49' }
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
    averageOrderValue: 30,
    monthlyOrders: 120,
    refundRatePct: 2,
    planId: 'plus',
    processorPreset: 'stripe-domestic',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.30,
    otherMonthlyCost: 300,
    desiredMonthlyNetProfit: 2000
  };

  const TEXT = {
    en: {
      summaryTitle: '[Payhip Fee Calculator Summary]',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate Payhip take-home.',
      invalid: 'Please review your inputs.',
      status: 'At this sales level, {plan} keeps the most under pure Payhip plan pricing.',
      averageOrderValue: 'Average order value',
      monthlyOrders: 'Monthly orders',
      refundRatePct: 'Refund rate',
      currentPlan: 'Current plan',
      processorPreset: 'Processor preset',
      grossSales: 'Monthly gross sales',
      refundLoss: 'Refund loss',
      payhipTransactionFees: 'Payhip transaction fees',
      payhipMonthlyFee: 'Payhip monthly fee',
      processorFees: 'Processor fees',
      netBeforeFixedCosts: 'Net before fixed monthly costs',
      monthlyNetProfit: 'Monthly net profit',
      takeHomePerOrderBeforeFixed: 'Take-home / order before fixed costs',
      netProfitPerOrder: 'Net profit / order',
      allInCostRate: 'All-in cost rate',
      breakEvenPrice: 'Break-even price',
      breakEvenGrossSales: 'Break-even gross sales',
      requiredPriceForTargetNet: 'Required price for target net',
      requiredGrossSalesForTargetNet: 'Required gross for target net',
      recommendedPlan: 'Recommended plan',
      upgradeThresholds: 'Upgrade thresholds',
      note: 'Official Payhip help-center pricing used here: Free 5%, Plus $29/month + 2%, Pro $99/month + 0%. Stripe/PayPal fees are separate processor assumptions. PayPal fixed fees vary by currency; the preset here is a USD planning baseline.',
      invalidAverageOrderValue: 'Average order value must be greater than zero.',
      invalidMonthlyOrders: 'Monthly orders must be an integer greater than zero.',
      invalidRefundRate: 'Refund rate must be 0 or above and below 100%.',
      invalidPlan: 'Unsupported Payhip plan.',
      invalidPreset: 'Unsupported processor preset.',
      invalidCustomRate: 'Custom processor rate must be 0 or above and below 100%.',
      invalidCustomFlat: 'Custom processor flat fee must be 0 or above.',
      invalidOtherMonthlyCost: 'Other monthly cost must be 0 or above.',
      invalidDesiredNet: 'Desired monthly net profit must be 0 or above.',
      na: 'N/A',
      thresholdLabels: {
        freeToPlus: 'Free → Plus',
        freeToPro: 'Free → Pro',
        plusToPro: 'Plus → Pro'
      }
    },
    ko: {
      summaryTitle: '[Payhip 수수료 계산기 요약]',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 Payhip 실수령액이 계산됩니다.',
      invalid: '입력값을 확인해주세요.',
      status: '현재 매출 구간에서는 순수 Payhip 요금 기준으로 {plan} 플랜이 가장 많이 남깁니다.',
      averageOrderValue: '평균 판매가',
      monthlyOrders: '월 주문 수',
      refundRatePct: '환불률',
      currentPlan: '현재 플랜',
      processorPreset: '결제 수수료 프리셋',
      grossSales: '월 총매출',
      refundLoss: '환불 손실',
      payhipTransactionFees: 'Payhip 거래 수수료',
      payhipMonthlyFee: 'Payhip 월 구독비',
      processorFees: '결제 처리 수수료',
      netBeforeFixedCosts: '월 고정비 차감 전 순액',
      monthlyNetProfit: '월 순이익',
      takeHomePerOrderBeforeFixed: '고정비 전 주문당 실수령',
      netProfitPerOrder: '주문당 순이익',
      allInCostRate: '올인 비용률',
      breakEvenPrice: '손익분기 판매가',
      breakEvenGrossSales: '손익분기 월매출',
      requiredPriceForTargetNet: '목표 순이익 달성 판매가',
      requiredGrossSalesForTargetNet: '목표 순이익 달성 월매출',
      recommendedPlan: '추천 플랜',
      upgradeThresholds: '업그레이드 손익분기 매출',
      note: '공식 Payhip 도움말 기준 요금: Free 5%, Plus 월 $29 + 2%, Pro 월 $99 + 0%. Stripe/PayPal 수수료는 Payhip와 별개인 결제 처리 가정입니다. PayPal 고정 수수료는 통화별로 달라질 수 있어 여기서는 USD planning baseline으로만 사용합니다.',
      invalidAverageOrderValue: '평균 판매가는 0보다 커야 합니다.',
      invalidMonthlyOrders: '월 주문 수는 1 이상의 정수여야 합니다.',
      invalidRefundRate: '환불률은 0 이상 100 미만이어야 합니다.',
      invalidPlan: '지원하지 않는 Payhip 플랜입니다.',
      invalidPreset: '지원하지 않는 결제 수수료 프리셋입니다.',
      invalidCustomRate: '커스텀 수수료율은 0 이상 100 미만이어야 합니다.',
      invalidCustomFlat: '커스텀 고정 수수료는 0 이상이어야 합니다.',
      invalidOtherMonthlyCost: '기타 월 고정비는 0 이상이어야 합니다.',
      invalidDesiredNet: '목표 월 순이익은 0 이상이어야 합니다.',
      na: 'N/A',
      thresholdLabels: {
        freeToPlus: 'Free → Plus',
        freeToPro: 'Free → Pro',
        plusToPro: 'Plus → Pro'
      }
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalizeInput(input) {
    return {
      averageOrderValue: Number(input.averageOrderValue),
      monthlyOrders: Number(input.monthlyOrders),
      refundRatePct: Number(input.refundRatePct),
      planId: input.planId || DEFAULTS.planId,
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: Number(input.customProcessorRatePct),
      customProcessorFlatFee: Number(input.customProcessorFlatFee),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlan(input) {
    return planMap[input.planId] || null;
  }

  function getProcessorPreset(input) {
    return processorPresetMap[input.processorPreset] || null;
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

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.averageOrderValue) || input.averageOrderValue <= 0) {
      return t.invalidAverageOrderValue;
    }

    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders <= 0 || !Number.isInteger(input.monthlyOrders)) {
      return t.invalidMonthlyOrders;
    }

    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.invalidRefundRate;
    }

    if (!getPlan(input)) {
      return t.invalidPlan;
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
      return t.invalidOtherMonthlyCost;
    }

    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.invalidDesiredNet;
    }

    return '';
  }

  function safeDivide(numerator, denominator) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  function getContributionDenominator(plan, processor, input) {
    return 1 - (input.refundRatePct / 100) - (plan.transactionRatePct / 100) - (processor.ratePct / 100);
  }

  function evaluatePlan(input, overrides) {
    const plan = overrides && overrides.plan ? overrides.plan : getPlan(input);
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);

    const grossSales = input.averageOrderValue * input.monthlyOrders;
    const refundLoss = grossSales * (input.refundRatePct / 100);
    const payhipTransactionFees = grossSales * (plan.transactionRatePct / 100);
    const processorVariableFees = grossSales * (processor.ratePct / 100);
    const processorFixedFees = input.monthlyOrders * processor.flatFee;
    const processorFees = processorVariableFees + processorFixedFees;
    const netBeforeFixedCosts = grossSales - refundLoss - payhipTransactionFees - processorFees;
    const monthlyNetProfit = netBeforeFixedCosts - plan.monthlyFee - input.otherMonthlyCost;
    const takeHomePerOrderBeforeFixed = safeDivide(netBeforeFixedCosts, input.monthlyOrders);
    const netProfitPerOrder = safeDivide(monthlyNetProfit, input.monthlyOrders);
    const allInCostRate = safeDivide(refundLoss + payhipTransactionFees + processorFees + plan.monthlyFee, grossSales);

    const denominator = getContributionDenominator(plan, processor, input);
    const reverseBaseNumerator = plan.monthlyFee + input.otherMonthlyCost + (input.monthlyOrders * processor.flatFee);
    const targetNumerator = reverseBaseNumerator + input.desiredMonthlyNetProfit;

    const breakEvenPrice = denominator > 0
      ? reverseBaseNumerator / (input.monthlyOrders * denominator)
      : null;
    const breakEvenGrossSales = breakEvenPrice == null ? null : breakEvenPrice * input.monthlyOrders;
    const requiredPriceForTargetNet = denominator > 0
      ? targetNumerator / (input.monthlyOrders * denominator)
      : null;
    const requiredGrossSalesForTargetNet = requiredPriceForTargetNet == null ? null : requiredPriceForTargetNet * input.monthlyOrders;

    return {
      planId: plan.id,
      planLabel: plan.label,
      planTransactionRatePct: plan.transactionRatePct,
      planMonthlyFee: plan.monthlyFee,
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      grossSales,
      refundLoss,
      payhipTransactionFees,
      processorVariableFees,
      processorFixedFees,
      processorFees,
      netBeforeFixedCosts,
      monthlyNetProfit,
      takeHomePerOrderBeforeFixed,
      netProfitPerOrder,
      allInCostRate,
      contributionDenominator: denominator,
      breakEvenPrice,
      breakEvenGrossSales,
      requiredPriceForTargetNet,
      requiredGrossSalesForTargetNet
    };
  }

  function buildUpgradeThresholds(lang) {
    const t = TEXT[lang] || TEXT.en;
    return [
      {
        id: 'free-to-plus',
        label: t.thresholdLabels.freeToPlus,
        grossSales: round2((29 - 0) / ((5 - 2) / 100))
      },
      {
        id: 'free-to-pro',
        label: t.thresholdLabels.freeToPro,
        grossSales: round2((99 - 0) / ((5 - 0) / 100))
      },
      {
        id: 'plus-to-pro',
        label: t.thresholdLabels.plusToPro,
        grossSales: round2((99 - 29) / ((2 - 0) / 100))
      }
    ];
  }

  function buildComparisonRows(input, lang) {
    return PLANS.map((plan) => {
      const evaluated = evaluatePlan(input, { plan, processor: resolveProcessor(input) });
      return {
        id: plan.id,
        label: plan.label[lang] || plan.label.en,
        payhipCostTotal: round2(evaluated.planMonthlyFee + evaluated.payhipTransactionFees),
        processorFees: round2(evaluated.processorFees),
        monthlyNetProfit: round2(evaluated.monthlyNetProfit),
        takeHomePerOrderBeforeFixed: evaluated.takeHomePerOrderBeforeFixed == null ? null : round2(evaluated.takeHomePerOrderBeforeFixed),
        requiredPriceForTargetNet: evaluated.requiredPriceForTargetNet == null ? null : round2(evaluated.requiredPriceForTargetNet)
      };
    });
  }

  function chooseBestPlan(rows) {
    if (!rows.length) {
      return null;
    }

    return rows.slice().sort((a, b) => {
      if (b.monthlyNetProfit !== a.monthlyNetProfit) {
        return b.monthlyNetProfit - a.monthlyNetProfit;
      }
      return a.payhipCostTotal - b.payhipCostTotal;
    })[0];
  }

  function formatMoney(value, lang) {
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).na;
    }

    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
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

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.currentPlan}: ${result.planLabel}`,
      `${t.processorPreset}: ${result.processorLabel}`,
      `${t.averageOrderValue}: ${formatMoney(result.inputs.averageOrderValue, lang)}`,
      `${t.monthlyOrders}: ${result.inputs.monthlyOrders}`,
      `${t.grossSales}: ${formatMoney(result.grossSales, lang)}`,
      `${t.refundLoss}: ${formatMoney(result.refundLoss, lang)}`,
      `${t.payhipTransactionFees}: ${formatMoney(result.payhipTransactionFees, lang)}`,
      `${t.payhipMonthlyFee}: ${formatMoney(result.planMonthlyFee, lang)}`,
      `${t.processorFees}: ${formatMoney(result.processorFees, lang)}`,
      `${t.monthlyNetProfit}: ${formatMoney(result.monthlyNetProfit, lang)}`,
      `${t.takeHomePerOrderBeforeFixed}: ${formatMoney(result.takeHomePerOrderBeforeFixed, lang)}`,
      `${t.breakEvenPrice}: ${formatMoney(result.breakEvenPrice, lang)}`,
      `${t.requiredPriceForTargetNet}: ${formatMoney(result.requiredPriceForTargetNet, lang)}`,
      `${t.recommendedPlan}: ${result.recommendedPlanLabel}`,
      `${t.thresholdLabels.freeToPlus}: ${formatMoney(result.upgradeThresholds[0].grossSales, lang)}`,
      `${t.thresholdLabels.freeToPro}: ${formatMoney(result.upgradeThresholds[1].grossSales, lang)}`,
      `${t.thresholdLabels.plusToPro}: ${formatMoney(result.upgradeThresholds[2].grossSales, lang)}`,
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

    const plan = getPlan(normalized);
    const processor = resolveProcessor(normalized);
    const evaluated = evaluatePlan(normalized, { plan, processor });
    const comparisonRows = buildComparisonRows(normalized, lang);
    const bestPlan = chooseBestPlan(comparisonRows);
    const recommendedPlanLabel = bestPlan ? bestPlan.label : (plan.label[lang] || plan.label.en);
    const upgradeThresholds = buildUpgradeThresholds(lang);

    const result = {
      inputs: normalized,
      planLabel: plan.label[lang] || plan.label.en,
      planId: plan.id,
      planTransactionRatePct: round2(plan.transactionRatePct),
      planMonthlyFee: round2(evaluated.planMonthlyFee),
      processorLabel: processor.label[lang] || processor.label.en,
      processorId: processor.id,
      processorRatePct: round2(processor.ratePct),
      processorFlatFee: round2(processor.flatFee),
      grossSales: round2(evaluated.grossSales),
      refundLoss: round2(evaluated.refundLoss),
      payhipTransactionFees: round2(evaluated.payhipTransactionFees),
      processorVariableFees: round2(evaluated.processorVariableFees),
      processorFixedFees: round2(evaluated.processorFixedFees),
      processorFees: round2(evaluated.processorFees),
      netBeforeFixedCosts: round2(evaluated.netBeforeFixedCosts),
      monthlyNetProfit: round2(evaluated.monthlyNetProfit),
      takeHomePerOrderBeforeFixed: evaluated.takeHomePerOrderBeforeFixed == null ? null : round2(evaluated.takeHomePerOrderBeforeFixed),
      netProfitPerOrder: evaluated.netProfitPerOrder == null ? null : round2(evaluated.netProfitPerOrder),
      allInCostRatePct: evaluated.allInCostRate == null ? null : round2(evaluated.allInCostRate * 100),
      breakEvenPrice: evaluated.breakEvenPrice == null ? null : round2(evaluated.breakEvenPrice),
      breakEvenGrossSales: evaluated.breakEvenGrossSales == null ? null : round2(evaluated.breakEvenGrossSales),
      requiredPriceForTargetNet: evaluated.requiredPriceForTargetNet == null ? null : round2(evaluated.requiredPriceForTargetNet),
      requiredGrossSalesForTargetNet: evaluated.requiredGrossSalesForTargetNet == null ? null : round2(evaluated.requiredGrossSalesForTargetNet),
      comparisonRows,
      recommendedPlanId: bestPlan ? bestPlan.id : plan.id,
      recommendedPlanLabel,
      upgradeThresholds
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  function initDom() {
    if (!root.document) {
      return;
    }

    const state = { lang: 'en' };
    const form = document.getElementById('calculatorForm');
    if (!form) {
      return;
    }

    const langBtn = document.getElementById('langBtn');
    const processorPreset = document.getElementById('processorPreset');
    const customFields = document.getElementById('customProcessorFields');
    const errorBox = document.getElementById('errorBox');
    const statusText = document.getElementById('statusText');
    const summary = document.getElementById('summary');
    const comparisonBody = document.getElementById('comparisonBody');
    const thresholdBody = document.getElementById('thresholdBody');

    const moneyTargets = {
      grossSales: document.getElementById('grossSalesValue'),
      monthlyNetProfit: document.getElementById('monthlyNetProfitValue'),
      takeHomePerOrderBeforeFixed: document.getElementById('takeHomePerOrderValue'),
      payhipTransactionFees: document.getElementById('payhipTransactionFeesValue'),
      planMonthlyFee: document.getElementById('payhipMonthlyFeeValue'),
      processorFees: document.getElementById('processorFeesValue'),
      refundLoss: document.getElementById('refundLossValue'),
      netBeforeFixedCosts: document.getElementById('netBeforeFixedValue'),
      netProfitPerOrder: document.getElementById('netProfitPerOrderValue'),
      breakEvenPrice: document.getElementById('breakEvenPriceValue'),
      breakEvenGrossSales: document.getElementById('breakEvenGrossValue'),
      requiredPriceForTargetNet: document.getElementById('requiredPriceValue'),
      requiredGrossSalesForTargetNet: document.getElementById('requiredGrossValue')
    };

    const textTargets = {
      recommendedPlanLabel: document.getElementById('recommendedPlanValue')
    };

    const percentTargets = {
      allInCostRatePct: document.getElementById('allInCostRateValue')
    };

    function getFormData() {
      return {
        averageOrderValue: form.averageOrderValue.value,
        monthlyOrders: form.monthlyOrders.value,
        refundRatePct: form.refundRatePct.value,
        planId: form.planId.value,
        processorPreset: form.processorPreset.value,
        customProcessorRatePct: form.customProcessorRatePct.value,
        customProcessorFlatFee: form.customProcessorFlatFee.value,
        otherMonthlyCost: form.otherMonthlyCost.value,
        desiredMonthlyNetProfit: form.desiredMonthlyNetProfit.value
      };
    }

    function syncCustomFields() {
      customFields.hidden = processorPreset.value !== 'custom';
    }

    function setError(message) {
      errorBox.textContent = message;
      errorBox.classList.toggle('show', Boolean(message));
    }

    function renderComparison(rows) {
      comparisonBody.innerHTML = rows.map((row) => `
        <tr>
          <td>${row.label}</td>
          <td>${formatMoney(row.payhipCostTotal, state.lang)}</td>
          <td>${formatMoney(row.processorFees, state.lang)}</td>
          <td>${formatMoney(row.monthlyNetProfit, state.lang)}</td>
          <td>${formatMoney(row.takeHomePerOrderBeforeFixed, state.lang)}</td>
          <td>${formatMoney(row.requiredPriceForTargetNet, state.lang)}</td>
        </tr>
      `).join('');
    }

    function renderThresholds(rows) {
      thresholdBody.innerHTML = rows.map((row) => `
        <tr>
          <td>${row.label}</td>
          <td>${formatMoney(row.grossSales, state.lang)}</td>
        </tr>
      `).join('');
    }

    function clearOutputs() {
      const t = TEXT[state.lang] || TEXT.en;
      Object.values(moneyTargets).forEach((node) => { if (node) { node.textContent = t.na; } });
      Object.values(percentTargets).forEach((node) => { if (node) { node.textContent = t.na; } });
      Object.values(textTargets).forEach((node) => { if (node) { node.textContent = t.na; } });
      comparisonBody.innerHTML = '';
      thresholdBody.innerHTML = '';
      summary.value = '';
    }

    function render() {
      syncCustomFields();
      const { result, error } = calculate(getFormData(), { lang: state.lang });
      const t = TEXT[state.lang] || TEXT.en;

      if (error) {
        setError(error);
        statusText.textContent = t.invalid;
        clearOutputs();
        return;
      }

      setError('');
      statusText.textContent = t.status.replace('{plan}', result.recommendedPlanLabel);
      Object.entries(moneyTargets).forEach(([key, node]) => {
        if (node) {
          node.textContent = formatMoney(result[key], state.lang);
        }
      });
      Object.entries(percentTargets).forEach(([key, node]) => {
        if (node) {
          node.textContent = formatPercent(result[key], state.lang);
        }
      });
      textTargets.recommendedPlanLabel.textContent = result.recommendedPlanLabel;
      renderComparison(result.comparisonRows);
      renderThresholds(result.upgradeThresholds);
      summary.value = result.summary;
    }

    function resetForm() {
      Object.entries(DEFAULTS).forEach(([key, value]) => {
        if (form[key]) {
          form[key].value = value;
        }
      });
      syncCustomFields();
      setError('');
      statusText.textContent = (TEXT[state.lang] || TEXT.en).waiting;
      clearOutputs();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      resetForm();
      render();
    });

    document.getElementById('copyBtn').addEventListener('click', async function () {
      const t = TEXT[state.lang] || TEXT.en;
      try {
        if (!summary.value) {
          render();
        }
        await navigator.clipboard.writeText(summary.value);
        statusText.textContent = t.copied;
      } catch (error) {
        statusText.textContent = t.copyFail;
      }
    });

    processorPreset.addEventListener('change', function () {
      syncCustomFields();
      render();
    });

    ['averageOrderValue', 'monthlyOrders', 'refundRatePct', 'customProcessorRatePct', 'customProcessorFlatFee', 'otherMonthlyCost', 'desiredMonthlyNetProfit', 'planId'].forEach((name) => {
      form[name].addEventListener('input', render);
      form[name].addEventListener('change', render);
    });

    langBtn.addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'ko' : 'en';
      langBtn.textContent = state.lang === 'en' ? '한국어 요약' : 'English Summary';
      render();
    });

    langBtn.textContent = '한국어 요약';
    resetForm();
    render();
  }

  const api = {
    PLANS,
    PROCESSOR_PRESETS,
    DEFAULTS,
    TEXT,
    getPlan,
    getProcessorPreset,
    resolveProcessor,
    validate,
    evaluatePlan,
    buildComparisonRows,
    buildUpgradeThresholds,
    chooseBestPlan,
    calculate,
    formatMoney,
    formatPercent,
    round2,
    getContributionDenominator
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PayhipFeeCalculator = api;
  }

  if (root.document) {
    root.addEventListener('DOMContentLoaded', initDom);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
