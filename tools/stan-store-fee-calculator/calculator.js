(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.StanStoreFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PLAN_OPTIONS = [
    {
      id: 'creator-monthly',
      title: 'Creator monthly',
      tier: 'Creator',
      cadence: 'Monthly',
      monthlyEquivalentFee: 29,
      annualCommitment: 348
    },
    {
      id: 'creator-annual',
      title: 'Creator annual',
      tier: 'Creator',
      cadence: 'Annual',
      monthlyEquivalentFee: 25,
      annualCommitment: 300
    },
    {
      id: 'creator-pro-monthly',
      title: 'Creator Pro monthly',
      tier: 'Creator Pro',
      cadence: 'Monthly',
      monthlyEquivalentFee: 99,
      annualCommitment: 1188
    },
    {
      id: 'creator-pro-annual',
      title: 'Creator Pro annual',
      tier: 'Creator Pro',
      cadence: 'Annual',
      monthlyEquivalentFee: 79,
      annualCommitment: 948
    }
  ];

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe-standard',
      title: 'Stripe standard',
      baseRatePct: 2.9,
      flatFee: 0.3,
      internationalFeePct: 1.5,
      recurringFeePct: 0.5
    },
    {
      id: 'stripe-afterpay',
      title: 'Stripe Afterpay',
      baseRatePct: 6,
      flatFee: 0.3,
      internationalFeePct: 1.5,
      recurringFeePct: 0
    },
    {
      id: 'stripe-klarna',
      title: 'Stripe Klarna',
      baseRatePct: 5.99,
      flatFee: 0.3,
      internationalFeePct: 1.5,
      recurringFeePct: 0
    },
    {
      id: 'paypal-usd',
      title: 'PayPal USD baseline',
      baseRatePct: 3.49,
      flatFee: 0.49,
      internationalFeePct: 1.5,
      recurringFeePct: 0
    },
    {
      id: 'custom',
      title: 'Custom processor',
      baseRatePct: null,
      flatFee: null,
      internationalFeePct: null,
      recurringFeePct: null
    }
  ];

  const CREATOR_ANNUAL_SAVINGS = 48;
  const CREATOR_PRO_ANNUAL_SAVINGS = 240;
  const CREATOR_ANNUAL_BREAK_EVEN_MONTHS = 300 / 29;
  const CREATOR_PRO_ANNUAL_BREAK_EVEN_MONTHS = 948 / 99;

  const DEFAULTS = {
    selectedPlanId: 'creator-monthly',
    averageOrderValue: 75,
    monthlyOrders: 40,
    refundRatePct: 3,
    processorPreset: 'stripe-standard',
    internationalSharePct: 10,
    recurringSharePct: 20,
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.3,
    customInternationalFeePct: 1.5,
    customRecurringFeePct: 0.5,
    otherMonthlyCost: 250,
    desiredMonthlyNetProfit: 2000
  };

  const planMap = Object.fromEntries(PLAN_OPTIONS.map((plan) => [plan.id, plan]));
  const processorMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const normalized = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getPlan(id) {
    return planMap[id] || null;
  }

  function getProcessorPreset(id) {
    return processorMap[id] || null;
  }

  function normalizeInput(rawInput) {
    const merged = Object.assign({}, DEFAULTS, rawInput || {});
    return {
      selectedPlanId: merged.selectedPlanId,
      averageOrderValue: toNumber(merged.averageOrderValue),
      monthlyOrders: toNumber(merged.monthlyOrders),
      refundRatePct: toNumber(merged.refundRatePct),
      processorPreset: merged.processorPreset,
      internationalSharePct: toNumber(merged.internationalSharePct),
      recurringSharePct: toNumber(merged.recurringSharePct),
      customProcessorRatePct: toNumber(merged.customProcessorRatePct),
      customProcessorFlatFee: toNumber(merged.customProcessorFlatFee),
      customInternationalFeePct: toNumber(merged.customInternationalFeePct),
      customRecurringFeePct: toNumber(merged.customRecurringFeePct),
      otherMonthlyCost: toNumber(merged.otherMonthlyCost),
      desiredMonthlyNetProfit: toNumber(merged.desiredMonthlyNetProfit)
    };
  }

  function validate(input) {
    const errors = [];

    if (!getPlan(input.selectedPlanId)) {
      errors.push('selectedPlanId must match a supported Stan plan.');
    }
    if (!Number.isFinite(input.averageOrderValue) || input.averageOrderValue <= 0) {
      errors.push('averageOrderValue must be greater than 0.');
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders <= 0 || !Number.isInteger(input.monthlyOrders)) {
      errors.push('monthlyOrders must be an integer greater than 0.');
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      errors.push('refundRatePct must be between 0 and 99.99.');
    }
    if (!getProcessorPreset(input.processorPreset)) {
      errors.push('processorPreset must match a supported preset.');
    }
    if (!Number.isFinite(input.internationalSharePct) || input.internationalSharePct < 0 || input.internationalSharePct > 100) {
      errors.push('internationalSharePct must be between 0 and 100.');
    }
    if (!Number.isFinite(input.recurringSharePct) || input.recurringSharePct < 0 || input.recurringSharePct > 100) {
      errors.push('recurringSharePct must be between 0 and 100.');
    }
    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      errors.push('customProcessorRatePct must be between 0 and below 100.');
    }
    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      errors.push('customProcessorFlatFee must be at least 0.');
    }
    if (!Number.isFinite(input.customInternationalFeePct) || input.customInternationalFeePct < 0 || input.customInternationalFeePct >= 100) {
      errors.push('customInternationalFeePct must be between 0 and below 100.');
    }
    if (!Number.isFinite(input.customRecurringFeePct) || input.customRecurringFeePct < 0 || input.customRecurringFeePct >= 100) {
      errors.push('customRecurringFeePct must be between 0 and below 100.');
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      errors.push('otherMonthlyCost must be at least 0.');
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      errors.push('desiredMonthlyNetProfit must be at least 0.');
    }

    return errors;
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input.processorPreset);
    if (!preset) {
      return null;
    }

    const baseRatePct = preset.id === 'custom' ? input.customProcessorRatePct : preset.baseRatePct;
    const flatFee = preset.id === 'custom' ? input.customProcessorFlatFee : preset.flatFee;
    const internationalFeePct = preset.id === 'custom' ? input.customInternationalFeePct : preset.internationalFeePct;
    const recurringFeePct = preset.id === 'custom' ? input.customRecurringFeePct : preset.recurringFeePct;

    const effectiveRatePct = baseRatePct
      + (input.internationalSharePct / 100) * internationalFeePct
      + (input.recurringSharePct / 100) * recurringFeePct;

    return {
      id: preset.id,
      title: preset.title,
      baseRatePct: round(baseRatePct, 6),
      flatFee: round(flatFee, 6),
      internationalFeePct: round(internationalFeePct, 6),
      recurringFeePct: round(recurringFeePct, 6),
      effectiveRatePct: round(effectiveRatePct, 6)
    };
  }

  function findRequiredPrice(input, targetNet, plan, processor) {
    const marginFactor = 1 - (input.refundRatePct / 100) - (processor.effectiveRatePct / 100);
    if (marginFactor <= 0) {
      return null;
    }
    const denominator = input.monthlyOrders * marginFactor;
    if (denominator <= 0) {
      return null;
    }
    const numerator = targetNet + plan.monthlyEquivalentFee + input.otherMonthlyCost + (input.monthlyOrders * processor.flatFee);
    return numerator / denominator;
  }

  function findRequiredOrders(input, targetNet, plan, processor) {
    const marginFactor = 1 - (input.refundRatePct / 100) - (processor.effectiveRatePct / 100);
    const contributionPerOrder = (input.averageOrderValue * marginFactor) - processor.flatFee;
    if (contributionPerOrder <= 0) {
      return null;
    }
    return (targetNet + plan.monthlyEquivalentFee + input.otherMonthlyCost) / contributionPerOrder;
  }

  function evaluatePlan(input, plan, processor) {
    const grossSales = input.averageOrderValue * input.monthlyOrders;
    const refundLoss = grossSales * (input.refundRatePct / 100);
    const processorVariableFees = grossSales * (processor.effectiveRatePct / 100);
    const processorFixedFees = input.monthlyOrders * processor.flatFee;
    const totalProcessorFees = processorVariableFees + processorFixedFees;
    const netBeforeOtherCosts = grossSales - refundLoss - totalProcessorFees - plan.monthlyEquivalentFee;
    const monthlyNetProfit = netBeforeOtherCosts - input.otherMonthlyCost;
    const marginFactor = 1 - (input.refundRatePct / 100) - (processor.effectiveRatePct / 100);
    const contributionPerOrder = (input.averageOrderValue * marginFactor) - processor.flatFee;
    const allInCostRatePct = grossSales > 0
      ? ((refundLoss + totalProcessorFees + plan.monthlyEquivalentFee) / grossSales) * 100
      : 0;

    return {
      planId: plan.id,
      title: plan.title,
      tier: plan.tier,
      cadence: plan.cadence,
      planMonthlyFee: round2(plan.monthlyEquivalentFee),
      annualCommitment: round2(plan.annualCommitment),
      grossSales: round2(grossSales),
      refundLoss: round2(refundLoss),
      processorVariableFees: round2(processorVariableFees),
      processorFixedFees: round2(processorFixedFees),
      totalProcessorFees: round2(totalProcessorFees),
      netBeforeOtherCosts: round2(netBeforeOtherCosts),
      monthlyNetProfit: round2(monthlyNetProfit),
      annualizedNetProfit: round2(monthlyNetProfit * 12),
      takeHomePerOrder: round2(netBeforeOtherCosts / input.monthlyOrders),
      netProfitPerOrder: round2(monthlyNetProfit / input.monthlyOrders),
      allInCostRatePct: round(allInCostRatePct, 4),
      contributionPerOrder: round(contributionPerOrder, 6),
      breakEvenPrice: roundMaybe(findRequiredPrice(input, 0, plan, processor)),
      requiredPriceForTargetNet: roundMaybe(findRequiredPrice(input, input.desiredMonthlyNetProfit, plan, processor)),
      breakEvenOrders: roundMaybe(findRequiredOrders(input, 0, plan, processor)),
      requiredOrdersForTargetNet: roundMaybe(findRequiredOrders(input, input.desiredMonthlyNetProfit, plan, processor))
    };
  }

  function roundMaybe(value) {
    return value == null ? null : round2(value);
  }

  function findBestPlan(comparisonRows) {
    return comparisonRows.slice().sort((a, b) => {
      if (b.monthlyNetProfit !== a.monthlyNetProfit) {
        return b.monthlyNetProfit - a.monthlyNetProfit;
      }
      return a.planMonthlyFee - b.planMonthlyFee;
    })[0];
  }

  function buildUpgradeLift(fromPlanId, toPlanId, comparisonRows, input) {
    const fromPlan = comparisonRows.find((row) => row.planId === fromPlanId);
    const toPlan = comparisonRows.find((row) => row.planId === toPlanId);
    if (!fromPlan || !toPlan) {
      return null;
    }
    const feeGap = round2(toPlan.planMonthlyFee - fromPlan.planMonthlyFee);
    if (feeGap <= 0) {
      return {
        feeGap,
        extraOrdersNeeded: 0,
        extraGrossNeeded: 0
      };
    }
    if (!(fromPlan.contributionPerOrder > 0)) {
      return {
        feeGap,
        extraOrdersNeeded: null,
        extraGrossNeeded: null
      };
    }
    const extraOrdersNeeded = feeGap / fromPlan.contributionPerOrder;
    return {
      feeGap,
      extraOrdersNeeded: round2(extraOrdersNeeded),
      extraGrossNeeded: round2(extraOrdersNeeded * input.averageOrderValue)
    };
  }

  function buildSummary(result) {
    const selected = result.selectedScenario;
    const processor = result.processor;
    const bestPlan = result.bestPlan;
    const monthlyLift = result.creatorProMonthlyLift;
    const annualLift = result.creatorProAnnualLift;

    return [
      '[Stan Store Fee Calculator Summary]',
      'Selected plan: ' + selected.title,
      'Processor preset: ' + processor.title,
      'Average order value: ' + formatCurrency(result.input.averageOrderValue),
      'Monthly orders: ' + formatNumber(result.input.monthlyOrders),
      'Monthly gross sales: ' + formatCurrency(selected.grossSales),
      'Refund loss: ' + formatCurrency(selected.refundLoss),
      'Processor fees: ' + formatCurrency(selected.totalProcessorFees),
      'Stan monthly-equivalent fee: ' + formatCurrency(selected.planMonthlyFee),
      'Monthly net profit: ' + formatCurrency(selected.monthlyNetProfit),
      'Break-even price: ' + formatMaybeCurrency(selected.breakEvenPrice),
      'Required price for target net: ' + formatMaybeCurrency(selected.requiredPriceForTargetNet),
      'Best plan under current assumptions: ' + bestPlan.title + ' (' + formatCurrency(bestPlan.monthlyNetProfit) + ')',
      'Creator annual saves: ' + formatCurrency(result.creatorAnnualSavings) + ' per year',
      'Creator Pro annual saves: ' + formatCurrency(result.creatorProAnnualSavings) + ' per year',
      'Creator Pro monthly uplift needed: ' + formatMaybeCurrency(monthlyLift.extraGrossNeeded),
      'Creator Pro annual uplift needed: ' + formatMaybeCurrency(annualLift.extraGrossNeeded),
      'Note: Stan takes 0% transaction fees, but processor fees and refunds still reduce take-home.',
      'Note: PayPal fixed fees vary by currency; the built-in PayPal option is a USD planning baseline.'
    ].join('\n');
  }

  function calculate(rawInput) {
    const input = normalizeInput(rawInput);
    const errors = validate(input);
    if (errors.length) {
      return { result: null, error: errors.join(' '), errors };
    }

    const processor = resolveProcessor(input);
    const comparisonRows = PLAN_OPTIONS.map((plan) => evaluatePlan(input, plan, processor));
    const selectedScenario = comparisonRows.find((row) => row.planId === input.selectedPlanId);
    const bestPlan = findBestPlan(comparisonRows);
    const creatorProMonthlyLift = buildUpgradeLift('creator-monthly', 'creator-pro-monthly', comparisonRows, input);
    const creatorProAnnualLift = buildUpgradeLift('creator-annual', 'creator-pro-annual', comparisonRows, input);

    const result = {
      input,
      processor,
      comparisonRows,
      selectedScenario,
      bestPlan,
      creatorAnnualSavings: CREATOR_ANNUAL_SAVINGS,
      creatorProAnnualSavings: CREATOR_PRO_ANNUAL_SAVINGS,
      creatorAnnualBreakEvenMonths: round(CREATOR_ANNUAL_BREAK_EVEN_MONTHS, 2),
      creatorProAnnualBreakEvenMonths: round(CREATOR_PRO_ANNUAL_BREAK_EVEN_MONTHS, 2),
      creatorProMonthlyLift,
      creatorProAnnualLift
    };

    result.summary = buildSummary(result);
    return { result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatMaybeCurrency(value) {
    return value == null ? 'N/A' : formatCurrency(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%';
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
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

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const form = document.getElementById('calculatorForm');
    if (!form) {
      return;
    }

    const fields = Array.from(form.querySelectorAll('[data-field]'));
    const refs = {
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      customFields: document.getElementById('customFields'),
      selectedNet: document.getElementById('selectedNet'),
      bestPlan: document.getElementById('bestPlan'),
      breakEvenPrice: document.getElementById('breakEvenPrice'),
      proLift: document.getElementById('proLift'),
      feeStack: document.getElementById('feeStack'),
      perOrderNet: document.getElementById('perOrderNet'),
      annualNote: document.getElementById('annualNote'),
      comparisonBody: document.getElementById('comparisonBody'),
      summary: document.getElementById('summary'),
      copyStatus: document.getElementById('copyStatus')
    };

    function setDefaults() {
      fields.forEach((field) => {
        const key = field.getAttribute('data-field');
        field.value = String(DEFAULTS[key]);
      });
      syncCustomFields();
    }

    function readInput() {
      const raw = {};
      fields.forEach((field) => {
        raw[field.getAttribute('data-field')] = field.value;
      });
      return raw;
    }

    function syncCustomFields() {
      const isCustom = form.querySelector('[data-field="processorPreset"]').value === 'custom';
      refs.customFields.hidden = !isCustom;
    }

    function render() {
      syncCustomFields();
      const { result, error } = calculate(readInput());

      if (error) {
        refs.errorBox.hidden = false;
        refs.errorText.textContent = error;
        refs.selectedNet.textContent = 'Enter valid inputs';
        refs.bestPlan.textContent = 'Waiting for a valid scenario';
        refs.breakEvenPrice.textContent = 'N/A';
        refs.proLift.textContent = 'N/A';
        refs.feeStack.textContent = 'N/A';
        refs.perOrderNet.textContent = 'N/A';
        refs.annualNote.textContent = 'Annual-plan notes appear after a valid calculation.';
        refs.comparisonBody.innerHTML = '';
        refs.summary.value = '';
        return;
      }

      refs.errorBox.hidden = true;
      refs.errorText.textContent = '';

      const selected = result.selectedScenario;
      refs.selectedNet.textContent = formatCurrency(selected.monthlyNetProfit);
      refs.bestPlan.textContent = result.bestPlan.title + ' leaves ' + formatCurrency(result.bestPlan.monthlyNetProfit) + ' / month';
      refs.breakEvenPrice.textContent = formatMaybeCurrency(selected.breakEvenPrice);
      refs.proLift.textContent = formatMaybeCurrency(result.creatorProMonthlyLift.extraGrossNeeded);
      refs.feeStack.textContent = formatCurrency(selected.refundLoss + selected.totalProcessorFees + selected.planMonthlyFee);
      refs.perOrderNet.textContent = formatCurrency(selected.netProfitPerOrder);
      refs.annualNote.textContent = 'Creator annual saves ' + formatCurrency(result.creatorAnnualSavings)
        + '/year and breaks even at ' + formatNumber(result.creatorAnnualBreakEvenMonths)
        + ' months. Creator Pro annual saves ' + formatCurrency(result.creatorProAnnualSavings)
        + '/year and breaks even at ' + formatNumber(result.creatorProAnnualBreakEvenMonths) + ' months.';

      refs.comparisonBody.innerHTML = result.comparisonRows.map((row) => {
        const isBest = row.planId === result.bestPlan.planId;
        const isSelected = row.planId === selected.planId;
        return '<tr>'
          + '<td><strong>' + escapeHtml(row.title) + '</strong>' + (isBest ? ' <span class="pill best">Best</span>' : '') + (isSelected ? ' <span class="pill selected">Selected</span>' : '') + '</td>'
          + '<td>' + formatCurrency(row.planMonthlyFee) + '</td>'
          + '<td>' + formatCurrency(row.totalProcessorFees) + '</td>'
          + '<td>' + formatCurrency(row.monthlyNetProfit) + '</td>'
          + '<td>' + formatCurrency(row.netProfitPerOrder) + '</td>'
          + '<td>' + formatPercent(row.allInCostRatePct) + '</td>'
          + '</tr>';
      }).join('');

      refs.summary.value = result.summary;
    }

    form.addEventListener('input', render);
    document.getElementById('resetBtn').addEventListener('click', function () {
      setDefaults();
      refs.copyStatus.textContent = '';
      render();
    });
    document.getElementById('copySummaryBtn').addEventListener('click', async function () {
      if (!refs.summary.value) {
        refs.copyStatus.textContent = 'Nothing to copy yet.';
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        refs.copyStatus.textContent = 'Clipboard unavailable. Copy manually.';
      }
    });

    setDefaults();
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
    PLAN_OPTIONS,
    PROCESSOR_PRESETS,
    DEFAULTS,
    CREATOR_ANNUAL_SAVINGS,
    CREATOR_PRO_ANNUAL_SAVINGS,
    CREATOR_ANNUAL_BREAK_EVEN_MONTHS,
    CREATOR_PRO_ANNUAL_BREAK_EVEN_MONTHS,
    getPlan,
    getProcessorPreset,
    resolveProcessor,
    findRequiredPrice,
    findRequiredOrders,
    calculate,
    formatCurrency,
    formatPercent,
    formatNumber
  };
});
