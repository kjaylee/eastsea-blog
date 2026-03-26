(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.StanStoreFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PLANS = [
    {
      id: 'creator',
      label: 'Creator',
      monthlyFee: 29,
      annualFee: 300
    },
    {
      id: 'creator-pro',
      label: 'Creator Pro',
      monthlyFee: 99,
      annualFee: 948
    }
  ];

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe-standard',
      label: 'Stripe standard · 2.9% + $0.30',
      ratePct: 2.9,
      flatFee: 0.30
    },
    {
      id: 'stripe-recurring',
      label: 'Stripe recurring baseline · 3.4% + $0.30',
      ratePct: 3.4,
      flatFee: 0.30
    },
    {
      id: 'stripe-international',
      label: 'Stripe international card baseline · 4.4% + $0.30',
      ratePct: 4.4,
      flatFee: 0.30
    },
    {
      id: 'paypal-standard',
      label: 'PayPal standard baseline · 3.49% + $0.49',
      ratePct: 3.49,
      flatFee: 0.49
    },
    {
      id: 'afterpay',
      label: 'Afterpay on Stan Pro · 6.0% + $0.30',
      ratePct: 6.0,
      flatFee: 0.30
    },
    {
      id: 'klarna',
      label: 'Klarna on Stan Pro · 5.99% + $0.30',
      ratePct: 5.99,
      flatFee: 0.30
    },
    {
      id: 'custom',
      label: 'Custom processor',
      ratePct: null,
      flatFee: null
    }
  ];

  const planMap = Object.fromEntries(PLANS.map(function (plan) {
    return [plan.id, plan];
  }));
  const processorMap = Object.fromEntries(PROCESSOR_PRESETS.map(function (preset) {
    return [preset.id, preset];
  }));

  const DEFAULTS = {
    planBillingPeriod: 'monthly',
    averageOrderValue: 60,
    monthlyOrders: 120,
    refundRatePct: 3,
    standardProcessorPreset: 'stripe-standard',
    paymentPlanPreset: 'afterpay',
    customStandardProcessorRatePct: 2.9,
    customStandardProcessorFlatFee: 0.30,
    customPaymentPlanRatePct: 6.0,
    customPaymentPlanFlatFee: 0.30,
    otherMonthlyCost: 200,
    desiredMonthlyNetProfit: 5000,
    proOrderLiftPct: 12,
    proAovLiftPct: 8,
    proPaymentPlanSharePct: 20
  };

  function round(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().replace(/,/g, '');
      if (!normalized) return NaN;
      return Number(normalized);
    }
    return Number(value);
  }

  function normalizeInput(rawInput) {
    const source = Object.assign({}, DEFAULTS, rawInput || {});
    return {
      planBillingPeriod: source.planBillingPeriod,
      averageOrderValue: toNumber(source.averageOrderValue),
      monthlyOrders: toNumber(source.monthlyOrders),
      refundRatePct: toNumber(source.refundRatePct),
      standardProcessorPreset: source.standardProcessorPreset,
      paymentPlanPreset: source.paymentPlanPreset,
      customStandardProcessorRatePct: toNumber(source.customStandardProcessorRatePct),
      customStandardProcessorFlatFee: toNumber(source.customStandardProcessorFlatFee),
      customPaymentPlanRatePct: toNumber(source.customPaymentPlanRatePct),
      customPaymentPlanFlatFee: toNumber(source.customPaymentPlanFlatFee),
      otherMonthlyCost: toNumber(source.otherMonthlyCost),
      desiredMonthlyNetProfit: toNumber(source.desiredMonthlyNetProfit),
      proOrderLiftPct: toNumber(source.proOrderLiftPct),
      proAovLiftPct: toNumber(source.proAovLiftPct),
      proPaymentPlanSharePct: toNumber(source.proPaymentPlanSharePct)
    };
  }

  function resolveProcessor(presetId, customRatePct, customFlatFee) {
    const preset = processorMap[presetId];
    if (!preset) {
      return null;
    }
    if (preset.id !== 'custom') {
      return {
        id: preset.id,
        label: preset.label,
        ratePct: preset.ratePct,
        flatFee: preset.flatFee
      };
    }
    return {
      id: 'custom',
      label: preset.label,
      ratePct: customRatePct,
      flatFee: customFlatFee
    };
  }

  function getPlanMonthlyFee(planId, billingPeriod) {
    const plan = planMap[planId];
    if (!plan) {
      return null;
    }
    if (billingPeriod === 'annual') {
      return plan.annualFee / 12;
    }
    return plan.monthlyFee;
  }

  function validate(input) {
    const errors = [];

    if (input.planBillingPeriod !== 'monthly' && input.planBillingPeriod !== 'annual') {
      errors.push('planBillingPeriod must be monthly or annual.');
    }
    if (!Number.isFinite(input.averageOrderValue) || input.averageOrderValue <= 0) {
      errors.push('averageOrderValue must be greater than 0.');
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders < 0 || !Number.isInteger(input.monthlyOrders)) {
      errors.push('monthlyOrders must be an integer at least 0.');
    }
    [
      ['refundRatePct', input.refundRatePct],
      ['proOrderLiftPct', input.proOrderLiftPct],
      ['proAovLiftPct', input.proAovLiftPct],
      ['proPaymentPlanSharePct', input.proPaymentPlanSharePct]
    ].forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0 || entry[1] >= 100) {
        errors.push(entry[0] + ' must be between 0 and below 100.');
      }
    });
    if (!processorMap[input.standardProcessorPreset]) {
      errors.push('standardProcessorPreset is unsupported.');
    }
    if (!processorMap[input.paymentPlanPreset]) {
      errors.push('paymentPlanPreset is unsupported.');
    }
    [
      ['customStandardProcessorRatePct', input.customStandardProcessorRatePct],
      ['customPaymentPlanRatePct', input.customPaymentPlanRatePct]
    ].forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0 || entry[1] >= 100) {
        errors.push(entry[0] + ' must be between 0 and below 100.');
      }
    });
    [
      ['customStandardProcessorFlatFee', input.customStandardProcessorFlatFee],
      ['customPaymentPlanFlatFee', input.customPaymentPlanFlatFee],
      ['otherMonthlyCost', input.otherMonthlyCost],
      ['desiredMonthlyNetProfit', input.desiredMonthlyNetProfit]
    ].forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0) {
        errors.push(entry[0] + ' must be at least 0.');
      }
    });

    const standardProcessor = resolveProcessor(
      input.standardProcessorPreset,
      input.customStandardProcessorRatePct,
      input.customStandardProcessorFlatFee
    );
    const paymentPlanProcessor = resolveProcessor(
      input.paymentPlanPreset,
      input.customPaymentPlanRatePct,
      input.customPaymentPlanFlatFee
    );
    if (!standardProcessor || !Number.isFinite(standardProcessor.ratePct) || !Number.isFinite(standardProcessor.flatFee)) {
      errors.push('standard processor settings are invalid.');
    }
    if (!paymentPlanProcessor || !Number.isFinite(paymentPlanProcessor.ratePct) || !Number.isFinite(paymentPlanProcessor.flatFee)) {
      errors.push('payment plan processor settings are invalid.');
    }
    if (errors.length) {
      return { ok: false, errors: errors };
    }

    return {
      ok: true,
      errors: [],
      standardProcessor: standardProcessor,
      paymentPlanProcessor: paymentPlanProcessor
    };
  }

  function computeFeeForBucket(grossSales, orders, processor) {
    const variableFee = grossSales * (processor.ratePct / 100);
    const fixedFee = orders * processor.flatFee;
    return {
      variableFee: variableFee,
      fixedFee: fixedFee,
      totalFee: variableFee + fixedFee
    };
  }

  function buildScenario(planId, input, standardProcessor, paymentPlanProcessor) {
    const refundRate = input.refundRatePct / 100;
    const isPro = planId === 'creator-pro';
    const orders = isPro
      ? input.monthlyOrders * (1 + (input.proOrderLiftPct / 100))
      : input.monthlyOrders;
    const averageOrderValue = isPro
      ? input.averageOrderValue * (1 + (input.proAovLiftPct / 100))
      : input.averageOrderValue;
    const paymentPlanShare = isPro ? (input.proPaymentPlanSharePct / 100) : 0;
    const standardShare = 1 - paymentPlanShare;
    const grossSales = orders * averageOrderValue;
    const refundedSales = grossSales * refundRate;
    const recognizedSales = grossSales - refundedSales;

    const standardOrders = orders * standardShare;
    const paymentPlanOrders = orders * paymentPlanShare;
    const standardGrossSales = grossSales * standardShare;
    const paymentPlanGrossSales = grossSales * paymentPlanShare;

    const standardFees = computeFeeForBucket(standardGrossSales, standardOrders, standardProcessor);
    const paymentPlanFees = computeFeeForBucket(paymentPlanGrossSales, paymentPlanOrders, paymentPlanProcessor);
    const processorFees = standardFees.totalFee + paymentPlanFees.totalFee;
    const stanSubscriptionFee = getPlanMonthlyFee(planId, input.planBillingPeriod);
    const contributionBeforeFixed = recognizedSales - processorFees;
    const monthlyNetProfit = contributionBeforeFixed - stanSubscriptionFee - input.otherMonthlyCost;
    const effectiveTakeRatePct = grossSales > 0
      ? ((refundedSales + processorFees + stanSubscriptionFee + input.otherMonthlyCost) / grossSales) * 100
      : 0;
    const takeHomePerOrder = orders > 0 ? monthlyNetProfit / orders : 0;

    const blendedVariableRatePct = (standardProcessor.ratePct * standardShare) + (paymentPlanProcessor.ratePct * paymentPlanShare);
    const blendedFlatFee = (standardProcessor.flatFee * standardShare) + (paymentPlanProcessor.flatFee * paymentPlanShare);
    const contributionPerOrder = (averageOrderValue * (1 - refundRate)) - (averageOrderValue * (blendedVariableRatePct / 100)) - blendedFlatFee;
    const requiredOrdersForTarget = contributionPerOrder > 0
      ? Math.ceil((stanSubscriptionFee + input.otherMonthlyCost + input.desiredMonthlyNetProfit) / contributionPerOrder)
      : null;
    const requiredGrossSalesForTarget = requiredOrdersForTarget == null
      ? null
      : requiredOrdersForTarget * averageOrderValue;

    return {
      id: planId,
      label: planMap[planId].label,
      monthlyStanFee: round2(stanSubscriptionFee),
      orders: round(orders, 4),
      averageOrderValue: round2(averageOrderValue),
      paymentPlanSharePct: round2(paymentPlanShare * 100),
      grossSales: round2(grossSales),
      refundedSales: round2(refundedSales),
      recognizedSales: round2(recognizedSales),
      standardGrossSales: round2(standardGrossSales),
      paymentPlanGrossSales: round2(paymentPlanGrossSales),
      standardProcessorVariableFee: round2(standardFees.variableFee),
      standardProcessorFixedFee: round2(standardFees.fixedFee),
      standardProcessorTotalFee: round2(standardFees.totalFee),
      paymentPlanProcessorVariableFee: round2(paymentPlanFees.variableFee),
      paymentPlanProcessorFixedFee: round2(paymentPlanFees.fixedFee),
      paymentPlanProcessorTotalFee: round2(paymentPlanFees.totalFee),
      processorFees: round2(processorFees),
      contributionBeforeFixed: round2(contributionBeforeFixed),
      monthlyNetProfit: round2(monthlyNetProfit),
      effectiveTakeRatePct: round2(effectiveTakeRatePct),
      takeHomePerOrder: round2(takeHomePerOrder),
      blendedVariableRatePct: round2(blendedVariableRatePct),
      blendedFlatFee: round2(blendedFlatFee),
      contributionPerOrder: round2(contributionPerOrder),
      requiredOrdersForTarget: requiredOrdersForTarget,
      requiredGrossSalesForTarget: requiredGrossSalesForTarget == null ? null : round2(requiredGrossSalesForTarget)
    };
  }

  function calculate(rawInput) {
    const input = normalizeInput(rawInput);
    const validation = validate(input);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const creator = buildScenario('creator', input, validation.standardProcessor, validation.paymentPlanProcessor);
    const creatorPro = buildScenario('creator-pro', input, validation.standardProcessor, validation.paymentPlanProcessor);
    const deltaMonthlyNetProfit = creatorPro.monthlyNetProfit - creator.monthlyNetProfit;
    const deltaAnnualNetProfit = deltaMonthlyNetProfit * 12;
    const breakEvenIncrementalOrders = creatorPro.contributionPerOrder > 0
      ? Math.ceil((creatorPro.monthlyStanFee - creator.monthlyStanFee) / creatorPro.contributionPerOrder)
      : null;
    const breakEvenIncrementalGrossSales = breakEvenIncrementalOrders == null
      ? null
      : round2(breakEvenIncrementalOrders * creatorPro.averageOrderValue);
    const recommendedPlanId = deltaMonthlyNetProfit >= 0 ? 'creator-pro' : 'creator';
    const result = {
      input: input,
      standardProcessor: validation.standardProcessor,
      paymentPlanProcessor: validation.paymentPlanProcessor,
      creator: creator,
      creatorPro: creatorPro,
      deltaMonthlyNetProfit: round2(deltaMonthlyNetProfit),
      deltaAnnualNetProfit: round2(deltaAnnualNetProfit),
      breakEvenIncrementalOrders: breakEvenIncrementalOrders,
      breakEvenIncrementalGrossSales: breakEvenIncrementalGrossSales,
      planFeeGap: round2(creatorPro.monthlyStanFee - creator.monthlyStanFee),
      recommendedPlanId: recommendedPlanId,
      recommendedPlanLabel: planMap[recommendedPlanId].label
    };
    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function buildSummary(result) {
    return [
      '[Stan Store Fee Calculator Summary]',
      'Billing period: ' + result.input.planBillingPeriod,
      'Standard checkout processor: ' + result.standardProcessor.label,
      'Payment-plan processor: ' + result.paymentPlanProcessor.label,
      'Current monthly orders: ' + result.input.monthlyOrders,
      'Current average order value: ' + formatCurrency(result.input.averageOrderValue),
      'Creator monthly net: ' + formatCurrency(result.creator.monthlyNetProfit),
      'Creator Pro monthly net: ' + formatCurrency(result.creatorPro.monthlyNetProfit),
      'Monthly delta (Pro - Creator): ' + formatCurrency(result.deltaMonthlyNetProfit),
      'Annual delta (Pro - Creator): ' + formatCurrency(result.deltaAnnualNetProfit),
      'Pro break-even incremental orders: ' + (result.breakEvenIncrementalOrders == null ? 'N/A' : result.breakEvenIncrementalOrders),
      'Pro break-even incremental gross sales: ' + (result.breakEvenIncrementalGrossSales == null ? 'N/A' : formatCurrency(result.breakEvenIncrementalGrossSales)),
      'Recommended plan under these assumptions: ' + result.recommendedPlanLabel,
      'Stan platform fee assumption: 0% transaction fee, flat subscription only.',
      'Source note: Stan fee article updated August 19, 2025; Creator vs Creator Pro article updated September 15, 2025.'
    ].join('\n');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%';
  }

  function formatInteger(value) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setVisibility(element, visible) {
    if (!element) return;
    element.style.display = visible ? '' : 'none';
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      form: document.getElementById('calculatorForm'),
      averageOrderValue: document.getElementById('averageOrderValue'),
      monthlyOrders: document.getElementById('monthlyOrders'),
      refundRatePct: document.getElementById('refundRatePct'),
      planBillingPeriod: document.getElementById('planBillingPeriod'),
      standardProcessorPreset: document.getElementById('standardProcessorPreset'),
      paymentPlanPreset: document.getElementById('paymentPlanPreset'),
      customStandardProcessorRatePct: document.getElementById('customStandardProcessorRatePct'),
      customStandardProcessorFlatFee: document.getElementById('customStandardProcessorFlatFee'),
      customPaymentPlanRatePct: document.getElementById('customPaymentPlanRatePct'),
      customPaymentPlanFlatFee: document.getElementById('customPaymentPlanFlatFee'),
      otherMonthlyCost: document.getElementById('otherMonthlyCost'),
      desiredMonthlyNetProfit: document.getElementById('desiredMonthlyNetProfit'),
      proOrderLiftPct: document.getElementById('proOrderLiftPct'),
      proAovLiftPct: document.getElementById('proAovLiftPct'),
      proPaymentPlanSharePct: document.getElementById('proPaymentPlanSharePct'),
      error: document.getElementById('error'),
      recommendedPlan: document.getElementById('recommendedPlan'),
      creatorMonthlyNet: document.getElementById('creatorMonthlyNet'),
      creatorProMonthlyNet: document.getElementById('creatorProMonthlyNet'),
      deltaMonthly: document.getElementById('deltaMonthly'),
      deltaAnnual: document.getElementById('deltaAnnual'),
      creatorStanFee: document.getElementById('creatorStanFee'),
      creatorProcessorFees: document.getElementById('creatorProcessorFees'),
      creatorNet: document.getElementById('creatorNet'),
      creatorRequiredGross: document.getElementById('creatorRequiredGross'),
      proStanFee: document.getElementById('proStanFee'),
      proProcessorFees: document.getElementById('proProcessorFees'),
      proNet: document.getElementById('proNet'),
      proRequiredGross: document.getElementById('proRequiredGross'),
      creatorOrders: document.getElementById('creatorOrders'),
      creatorAov: document.getElementById('creatorAov'),
      creatorTakeRate: document.getElementById('creatorTakeRate'),
      proOrders: document.getElementById('proOrders'),
      proAov: document.getElementById('proAov'),
      proTakeRate: document.getElementById('proTakeRate'),
      breakEvenOrders: document.getElementById('breakEvenOrders'),
      breakEvenGross: document.getElementById('breakEvenGross'),
      proPaymentMix: document.getElementById('proPaymentMix'),
      summary: document.getElementById('summary'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      resetBtn: document.getElementById('resetBtn'),
      standardCustomFields: document.getElementById('standardCustomFields'),
      paymentPlanCustomFields: document.getElementById('paymentPlanCustomFields')
    };

    function collectInput() {
      return {
        averageOrderValue: refs.averageOrderValue.value,
        monthlyOrders: refs.monthlyOrders.value,
        refundRatePct: refs.refundRatePct.value,
        planBillingPeriod: refs.planBillingPeriod.value,
        standardProcessorPreset: refs.standardProcessorPreset.value,
        paymentPlanPreset: refs.paymentPlanPreset.value,
        customStandardProcessorRatePct: refs.customStandardProcessorRatePct.value,
        customStandardProcessorFlatFee: refs.customStandardProcessorFlatFee.value,
        customPaymentPlanRatePct: refs.customPaymentPlanRatePct.value,
        customPaymentPlanFlatFee: refs.customPaymentPlanFlatFee.value,
        otherMonthlyCost: refs.otherMonthlyCost.value,
        desiredMonthlyNetProfit: refs.desiredMonthlyNetProfit.value,
        proOrderLiftPct: refs.proOrderLiftPct.value,
        proAovLiftPct: refs.proAovLiftPct.value,
        proPaymentPlanSharePct: refs.proPaymentPlanSharePct.value
      };
    }

    function updatePresetVisibility() {
      setVisibility(refs.standardCustomFields, refs.standardProcessorPreset.value === 'custom');
      setVisibility(refs.paymentPlanCustomFields, refs.paymentPlanPreset.value === 'custom');
    }

    function render() {
      updatePresetVisibility();
      const payload = collectInput();
      const computed = calculate(payload);

      if (computed.error) {
        refs.error.textContent = computed.error;
        refs.error.hidden = false;
        return;
      }

      refs.error.hidden = true;
      const result = computed.result;
      refs.recommendedPlan.textContent = result.recommendedPlanLabel;
      refs.creatorMonthlyNet.textContent = formatCurrency(result.creator.monthlyNetProfit);
      refs.creatorProMonthlyNet.textContent = formatCurrency(result.creatorPro.monthlyNetProfit);
      refs.deltaMonthly.textContent = formatCurrency(result.deltaMonthlyNetProfit);
      refs.deltaAnnual.textContent = formatCurrency(result.deltaAnnualNetProfit);

      refs.creatorStanFee.textContent = formatCurrency(result.creator.monthlyStanFee);
      refs.creatorProcessorFees.textContent = formatCurrency(result.creator.processorFees);
      refs.creatorNet.textContent = formatCurrency(result.creator.monthlyNetProfit);
      refs.creatorRequiredGross.textContent = result.creator.requiredGrossSalesForTarget == null ? 'N/A' : formatCurrency(result.creator.requiredGrossSalesForTarget);
      refs.creatorOrders.textContent = formatInteger(result.creator.orders);
      refs.creatorAov.textContent = formatCurrency(result.creator.averageOrderValue);
      refs.creatorTakeRate.textContent = formatPercent(result.creator.effectiveTakeRatePct);

      refs.proStanFee.textContent = formatCurrency(result.creatorPro.monthlyStanFee);
      refs.proProcessorFees.textContent = formatCurrency(result.creatorPro.processorFees);
      refs.proNet.textContent = formatCurrency(result.creatorPro.monthlyNetProfit);
      refs.proRequiredGross.textContent = result.creatorPro.requiredGrossSalesForTarget == null ? 'N/A' : formatCurrency(result.creatorPro.requiredGrossSalesForTarget);
      refs.proOrders.textContent = formatInteger(result.creatorPro.orders);
      refs.proAov.textContent = formatCurrency(result.creatorPro.averageOrderValue);
      refs.proTakeRate.textContent = formatPercent(result.creatorPro.effectiveTakeRatePct);
      refs.proPaymentMix.textContent = formatPercent(result.creatorPro.paymentPlanSharePct);

      refs.breakEvenOrders.textContent = result.breakEvenIncrementalOrders == null ? 'N/A' : formatInteger(result.breakEvenIncrementalOrders);
      refs.breakEvenGross.textContent = result.breakEvenIncrementalGrossSales == null ? 'N/A' : formatCurrency(result.breakEvenIncrementalGrossSales);
      refs.summary.value = result.summary;
    }

    refs.form.addEventListener('input', render);
    refs.form.addEventListener('change', render);

    refs.copySummaryBtn.addEventListener('click', async function () {
      const text = refs.summary.value;
      if (!text) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          refs.copySummaryBtn.textContent = 'Copied';
          window.setTimeout(function () {
            refs.copySummaryBtn.textContent = 'Copy summary';
          }, 1400);
        }
      } catch (error) {
        refs.copySummaryBtn.textContent = 'Copy failed';
        window.setTimeout(function () {
          refs.copySummaryBtn.textContent = 'Copy summary';
        }, 1600);
      }
    });

    refs.resetBtn.addEventListener('click', function () {
      Object.keys(DEFAULTS).forEach(function (key) {
        const el = refs[key];
        if (el) {
          el.value = DEFAULTS[key];
        }
      });
      render();
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    PLANS: PLANS,
    PROCESSOR_PRESETS: PROCESSOR_PRESETS,
    DEFAULTS: DEFAULTS,
    normalizeInput: normalizeInput,
    resolveProcessor: resolveProcessor,
    getPlanMonthlyFee: getPlanMonthlyFee,
    buildScenario: buildScenario,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    escapeHtml: escapeHtml
  };
});
