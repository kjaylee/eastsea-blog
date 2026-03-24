(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SubstackFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    billingCycle: 'monthly',
    pricePerSubscriber: 8,
    activePaidSubscribers: 500,
    refundRatePct: 4,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
    targetMonthlyNetIncome: 5000,
  };

  const VALID_BILLING_CYCLES = new Set(['monthly', 'annual']);

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function cycleMonths(billingCycle) {
    return billingCycle === 'annual' ? 12 : 1;
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    if (!VALID_BILLING_CYCLES.has(source.billingCycle)) {
      errors.push('billingCycle must be monthly or annual.');
    } else {
      values.billingCycle = source.billingCycle;
    }

    const pricePerSubscriber = toFiniteNumber(source.pricePerSubscriber);
    if (pricePerSubscriber == null || !(pricePerSubscriber > 0)) {
      errors.push('pricePerSubscriber must be greater than 0.');
    } else {
      values.pricePerSubscriber = pricePerSubscriber;
    }

    const activePaidSubscribers = toFiniteNumber(source.activePaidSubscribers);
    if (activePaidSubscribers == null || activePaidSubscribers < 0 || !Number.isInteger(activePaidSubscribers)) {
      errors.push('activePaidSubscribers must be an integer at least 0.');
    } else {
      values.activePaidSubscribers = activePaidSubscribers;
    }

    [
      ['refundRatePct', 0, 99.99],
      ['substackPlatformFeeRatePct', 0, 100],
      ['processingFeeRatePct', 0, 100],
      ['recurringBillingFeeRatePct', 0, 100],
    ].forEach(function (entry) {
      const field = entry[0];
      const min = entry[1];
      const max = entry[2];
      const value = toFiniteNumber(source[field]);
      if (value == null || value < min || value > max) {
        errors.push(field + ' must be between ' + min + ' and ' + max + '.');
      } else {
        values[field] = value;
      }
    });

    const processingFixedFee = toFiniteNumber(source.processingFixedFee);
    if (processingFixedFee == null || processingFixedFee < 0) {
      errors.push('processingFixedFee must be at least 0.');
    } else {
      values.processingFixedFee = processingFixedFee;
    }

    const targetMonthlyNetIncome = toFiniteNumber(source.targetMonthlyNetIncome);
    if (targetMonthlyNetIncome == null || targetMonthlyNetIncome < 0) {
      errors.push('targetMonthlyNetIncome must be at least 0.');
    } else {
      values.targetMonthlyNetIncome = targetMonthlyNetIncome;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function buildSummary(result) {
    return [
      '[Substack Fee Calculator Summary]',
      'Billing cycle: ' + result.input.billingCycle,
      'Price per subscriber: ' + formatCurrency(result.input.pricePerSubscriber),
      'Active paid subscribers: ' + result.input.activePaidSubscribers,
      'Gross billings: ' + formatCurrency(result.grossBillings),
      'Refunded billings: ' + formatCurrency(result.refundedBillings),
      'Net billings after refunds: ' + formatCurrency(result.netBillingsAfterRefunds),
      'Substack platform fee: ' + formatCurrency(result.substackPlatformFee),
      'Processor variable fee: ' + formatCurrency(result.processorVariableFee),
      'Processor fixed fees: ' + formatCurrency(result.processorFixedFeeTotal),
      'Recurring billing fee: ' + formatCurrency(result.recurringBillingFee),
      'Total fees: ' + formatCurrency(result.totalFees),
      'Net take-home per cycle: ' + formatCurrency(result.netTakeHomePerCycle),
      'Monthly-equivalent take-home: ' + formatCurrency(result.monthlyEquivalentNetTakeHome),
      'Effective fee rate: ' + formatPercent(result.effectiveFeeRatePct),
      'Required paid subscribers for target monthly net income: ' + (result.requiredPaidSubscribers == null ? 'N/A' : result.requiredPaidSubscribers),
      'Note: default fee inputs are editable because published Substack billing-fee snippets have varied over time.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const months = cycleMonths(input.billingCycle);
    const refundKeepFactor = 1 - (input.refundRatePct / 100);
    const variableFeeRate = (
      input.substackPlatformFeeRatePct +
      input.processingFeeRatePct +
      input.recurringBillingFeeRatePct
    ) / 100;

    const grossBillings = input.pricePerSubscriber * input.activePaidSubscribers;
    const refundedBillings = grossBillings * (input.refundRatePct / 100);
    const netBillingsAfterRefunds = grossBillings - refundedBillings;
    const substackPlatformFee = netBillingsAfterRefunds * (input.substackPlatformFeeRatePct / 100);
    const processorVariableFee = netBillingsAfterRefunds * (input.processingFeeRatePct / 100);
    const processorFixedFeeTotal = input.activePaidSubscribers * input.processingFixedFee;
    const recurringBillingFee = netBillingsAfterRefunds * (input.recurringBillingFeeRatePct / 100);
    const totalFees = substackPlatformFee + processorVariableFee + processorFixedFeeTotal + recurringBillingFee;
    const netTakeHomePerCycle = netBillingsAfterRefunds - totalFees;
    const monthlyEquivalentNetTakeHome = netTakeHomePerCycle / months;
    const effectiveFeeRate = grossBillings > 0 ? totalFees / grossBillings : 0;
    const netContributionPerSubscriberPerCycle = (input.pricePerSubscriber * refundKeepFactor * (1 - variableFeeRate)) - input.processingFixedFee;
    const targetNetPerCycle = input.targetMonthlyNetIncome * months;
    const requiredPaidSubscribers = netContributionPerSubscriberPerCycle > 0
      ? Math.ceil(targetNetPerCycle / netContributionPerSubscriberPerCycle)
      : null;

    const result = {
      input: input,
      cycleMonths: months,
      refundKeepFactor: roundTo(refundKeepFactor, 6),
      variableFeeRate: roundTo(variableFeeRate, 6),
      grossBillings: roundTo(grossBillings, 6),
      refundedBillings: roundTo(refundedBillings, 6),
      netBillingsAfterRefunds: roundTo(netBillingsAfterRefunds, 6),
      substackPlatformFee: roundTo(substackPlatformFee, 6),
      processorVariableFee: roundTo(processorVariableFee, 6),
      processorFixedFeeTotal: roundTo(processorFixedFeeTotal, 6),
      recurringBillingFee: roundTo(recurringBillingFee, 6),
      totalFees: roundTo(totalFees, 6),
      netTakeHomePerCycle: roundTo(netTakeHomePerCycle, 6),
      monthlyEquivalentNetTakeHome: roundTo(monthlyEquivalentNetTakeHome, 6),
      effectiveFeeRate: roundTo(effectiveFeeRate, 12),
      effectiveFeeRatePct: roundTo(effectiveFeeRate * 100, 6),
      netContributionPerSubscriberPerCycle: roundTo(netContributionPerSubscriberPerCycle, 6),
      targetNetPerCycle: roundTo(targetNetPerCycle, 6),
      requiredPaidSubscribers: requiredPaidSubscribers,
    };

    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
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

    const ids = {
      form: 'calculatorForm',
      error: 'errorBox',
      errorText: 'errorText',
      grossBillings: 'grossBillings',
      totalFees: 'totalFees',
      netTakeHomePerCycle: 'netTakeHomePerCycle',
      monthlyEquivalentNetTakeHome: 'monthlyEquivalentNetTakeHome',
      refundedBillings: 'refundedBillings',
      netBillingsAfterRefunds: 'netBillingsAfterRefunds',
      substackPlatformFee: 'substackPlatformFee',
      processorVariableFee: 'processorVariableFee',
      processorFixedFeeTotal: 'processorFixedFeeTotal',
      recurringBillingFee: 'recurringBillingFee',
      effectiveFeeRatePct: 'effectiveFeeRatePct',
      requiredPaidSubscribers: 'requiredPaidSubscribers',
      targetNetPerCycle: 'targetNetPerCycle',
      summary: 'summaryText',
      copy: 'copySummaryBtn',
      copyStatus: 'copyStatus',
      reset: 'resetDefaultsBtn',
      cycleNote: 'cycleNote',
    };

    const form = document.getElementById(ids.form);
    if (!form) return;

    const refs = {};
    Object.keys(ids).forEach(function (key) {
      refs[key] = document.getElementById(ids[key]);
    });

    const fields = Array.from(form.querySelectorAll('[data-field]'));

    function applyDefaults() {
      fields.forEach(function (field) {
        const key = field.getAttribute('data-field');
        if (field.tagName === 'SELECT') {
          field.value = DEFAULT_INPUTS[key];
        } else {
          field.value = String(DEFAULT_INPUTS[key]);
        }
      });
    }

    function collectInput() {
      const input = {};
      fields.forEach(function (field) {
        input[field.getAttribute('data-field')] = field.value;
      });
      return input;
    }

    function setError(message) {
      const visible = Boolean(message);
      refs.error.hidden = !visible;
      refs.errorText.textContent = visible ? message : '';
    }

    function renderResult(result) {
      refs.grossBillings.textContent = formatCurrency(result.grossBillings);
      refs.totalFees.textContent = formatCurrency(result.totalFees);
      refs.netTakeHomePerCycle.textContent = formatCurrency(result.netTakeHomePerCycle);
      refs.monthlyEquivalentNetTakeHome.textContent = formatCurrency(result.monthlyEquivalentNetTakeHome);
      refs.refundedBillings.textContent = formatCurrency(result.refundedBillings);
      refs.netBillingsAfterRefunds.textContent = formatCurrency(result.netBillingsAfterRefunds);
      refs.substackPlatformFee.textContent = formatCurrency(result.substackPlatformFee);
      refs.processorVariableFee.textContent = formatCurrency(result.processorVariableFee);
      refs.processorFixedFeeTotal.textContent = formatCurrency(result.processorFixedFeeTotal);
      refs.recurringBillingFee.textContent = formatCurrency(result.recurringBillingFee);
      refs.effectiveFeeRatePct.textContent = formatPercent(result.effectiveFeeRatePct);
      refs.requiredPaidSubscribers.textContent = result.requiredPaidSubscribers == null ? 'N/A' : String(result.requiredPaidSubscribers);
      refs.targetNetPerCycle.textContent = formatCurrency(result.targetNetPerCycle);
      refs.summary.value = result.summary;
      refs.cycleNote.textContent = result.input.billingCycle === 'annual'
        ? 'Annual mode shows one billing cycle per year and converts take-home to a monthly-equivalent view.'
        : 'Monthly mode assumes one charge per subscriber each month.';
    }

    function render() {
      const { result, error } = calculate(collectInput());
      refs.copyStatus.textContent = '';
      if (error) {
        setError(error);
        refs.summary.value = '';
        return;
      }
      setError('');
      renderResult(result);
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);

    refs.copy.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        refs.copyStatus.textContent = 'Copy failed. Please copy manually.';
      }
    });

    refs.reset.addEventListener('click', function () {
      applyDefaults();
      render();
    });

    applyDefaults();
    render();
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initBrowser);
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    VALID_BILLING_CYCLES: Array.from(VALID_BILLING_CYCLES),
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    mergeWithDefaults: mergeWithDefaults,
    cycleMonths: cycleMonths,
    validateInputs: validateInputs,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    escapeHtml: escapeHtml,
    initBrowser: initBrowser,
  };
});
