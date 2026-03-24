(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.KoFiFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    creatorMode: 'free',
    paymentType: 'oneOffTip',
    averagePaymentAmount: 5,
    successfulTransactions: 100,
    refundRatePct: 0,
    processorPreset: 'stripe',
    processorRatePct: 3.0,
    processorFixedFee: 0.30,
    fxFeeRatePct: 0,
    targetNetIncome: 1000,
  };

  const VALID_MODES = new Set(['free', 'contributor']);
  const VALID_PAYMENT_TYPES = new Set([
    'oneOffTip',
    'crowdfundingGoal',
    'monthlyTip',
    'membershipTier',
    'shopSale',
    'commissionSale',
  ]);
  const RECURRING_PAYMENT_TYPES = new Set(['monthlyTip', 'membershipTier']);
  const PROCESSOR_PRESETS = {
    stripe: { ratePct: 3.0, fixedFee: 0.30, label: 'Stripe baseline' },
    paypal: { ratePct: 3.49, fixedFee: 0.49, label: 'PayPal baseline' },
    custom: { ratePct: null, fixedFee: null, label: 'Custom' },
  };
  const PAYMENT_TYPE_LABELS = {
    oneOffTip: 'One-off tip',
    crowdfundingGoal: 'Crowdfunding goal',
    monthlyTip: 'Monthly tip',
    membershipTier: 'Membership tier',
    shopSale: 'Shop sale',
    commissionSale: 'Commission sale',
  };
  const SERVICE_FEE_RULES = {
    free: {
      oneOffTip: 0,
      crowdfundingGoal: 0,
      monthlyTip: 5,
      membershipTier: 5,
      shopSale: 5,
      commissionSale: 5,
    },
    contributor: {
      oneOffTip: 5,
      crowdfundingGoal: 5,
      monthlyTip: 5,
      membershipTier: 5,
      shopSale: 5,
      commissionSale: 5,
    },
  };

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function normalizeTargetNetIncome(value) {
    const text = String(value == null ? '' : value).trim();
    if (!text) {
      return null;
    }
    const number = Number(text.replace(/,/g, ''));
    return Number.isFinite(number) ? number : null;
  }

  function getProcessorPreset(name) {
    return PROCESSOR_PRESETS[name] || null;
  }

  function applyProcessorPreset(name, currentInput) {
    const preset = getProcessorPreset(name);
    if (!preset || name === 'custom') {
      return Object.assign({}, currentInput || {});
    }
    return Object.assign({}, currentInput || {}, {
      processorPreset: name,
      processorRatePct: preset.ratePct,
      processorFixedFee: preset.fixedFee,
    });
  }

  function paymentTypeLabel(paymentType) {
    return PAYMENT_TYPE_LABELS[paymentType] || paymentType;
  }

  function getServiceFeeRatePct(creatorMode, paymentType) {
    if (!VALID_MODES.has(creatorMode) || !VALID_PAYMENT_TYPES.has(paymentType)) {
      return null;
    }
    return SERVICE_FEE_RULES[creatorMode][paymentType];
  }

  function shouldShowRecurringCaveat(paymentType) {
    return RECURRING_PAYMENT_TYPES.has(paymentType);
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    if (!VALID_MODES.has(source.creatorMode)) {
      errors.push('creatorMode must be free or contributor.');
    } else {
      values.creatorMode = source.creatorMode;
    }

    if (!VALID_PAYMENT_TYPES.has(source.paymentType)) {
      errors.push('paymentType is invalid.');
    } else {
      values.paymentType = source.paymentType;
    }

    const averagePaymentAmount = toFiniteNumber(source.averagePaymentAmount);
    if (averagePaymentAmount == null || !(averagePaymentAmount > 0)) {
      errors.push('averagePaymentAmount must be greater than 0.');
    } else {
      values.averagePaymentAmount = averagePaymentAmount;
    }

    const successfulTransactions = toFiniteNumber(source.successfulTransactions);
    if (successfulTransactions == null || successfulTransactions < 0 || !Number.isInteger(successfulTransactions)) {
      errors.push('successfulTransactions must be an integer at least 0.');
    } else {
      values.successfulTransactions = successfulTransactions;
    }

    const refundRatePct = toFiniteNumber(source.refundRatePct);
    if (refundRatePct == null || refundRatePct < 0 || refundRatePct > 99.99) {
      errors.push('refundRatePct must be between 0 and 99.99.');
    } else {
      values.refundRatePct = refundRatePct;
    }

    if (!getProcessorPreset(source.processorPreset)) {
      errors.push('processorPreset must be stripe, paypal, or custom.');
    } else {
      values.processorPreset = source.processorPreset;
    }

    const processorRatePct = toFiniteNumber(source.processorRatePct);
    if (processorRatePct == null || processorRatePct < 0 || processorRatePct > 100) {
      errors.push('processorRatePct must be between 0 and 100.');
    } else {
      values.processorRatePct = processorRatePct;
    }

    const processorFixedFee = toFiniteNumber(source.processorFixedFee);
    if (processorFixedFee == null || processorFixedFee < 0) {
      errors.push('processorFixedFee must be at least 0.');
    } else {
      values.processorFixedFee = processorFixedFee;
    }

    const fxFeeRatePct = toFiniteNumber(source.fxFeeRatePct);
    if (fxFeeRatePct == null || fxFeeRatePct < 0 || fxFeeRatePct > 100) {
      errors.push('fxFeeRatePct must be between 0 and 100.');
    } else {
      values.fxFeeRatePct = fxFeeRatePct;
    }

    const targetNetIncome = normalizeTargetNetIncome(source.targetNetIncome);
    if (targetNetIncome != null && targetNetIncome < 0) {
      errors.push('targetNetIncome must be at least 0.');
    } else {
      values.targetNetIncome = targetNetIncome;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    values.serviceFeeRatePct = getServiceFeeRatePct(values.creatorMode, values.paymentType);
    if (values.serviceFeeRatePct == null) {
      return { ok: false, errors: ['Unable to resolve Ko-fi service fee rules.'], values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function calculateScenario(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const refundKeepFactor = 1 - (input.refundRatePct / 100);
    const serviceFeeRate = input.serviceFeeRatePct / 100;
    const processorRate = input.processorRatePct / 100;
    const fxRate = input.fxFeeRatePct / 100;
    const variableFeeRate = serviceFeeRate + processorRate + fxRate;

    const grossVolume = input.averagePaymentAmount * input.successfulTransactions;
    const refundedVolume = grossVolume * (input.refundRatePct / 100);
    const netChargeVolume = grossVolume - refundedVolume;
    const koFiServiceFee = netChargeVolume * serviceFeeRate;
    const processorVariableFee = netChargeVolume * processorRate;
    const processorFixedFeeTotal = input.successfulTransactions * input.processorFixedFee;
    const fxFee = netChargeVolume * fxRate;
    const totalFees = koFiServiceFee + processorVariableFee + processorFixedFeeTotal + fxFee;
    const netTakeHome = netChargeVolume - totalFees;
    const effectiveFeeRate = grossVolume > 0 ? totalFees / grossVolume : 0;
    const takeHomePerTransaction = input.successfulTransactions > 0 ? netTakeHome / input.successfulTransactions : 0;
    const netContributionPerTransaction = (input.averagePaymentAmount * refundKeepFactor * (1 - variableFeeRate)) - input.processorFixedFee;

    let requiredSuccessfulTransactions = null;
    if (input.targetNetIncome != null && netContributionPerTransaction > 0) {
      requiredSuccessfulTransactions = Math.ceil(input.targetNetIncome / netContributionPerTransaction);
    }

    let requiredAveragePaymentAmount = null;
    const reverseDenominator = refundKeepFactor * (1 - variableFeeRate);
    if (input.targetNetIncome != null && input.successfulTransactions > 0 && reverseDenominator > 0) {
      requiredAveragePaymentAmount = ((input.targetNetIncome / input.successfulTransactions) + input.processorFixedFee) / reverseDenominator;
    }

    const result = {
      input: input,
      paymentTypeLabel: paymentTypeLabel(input.paymentType),
      refundKeepFactor: roundTo(refundKeepFactor, 6),
      variableFeeRate: roundTo(variableFeeRate, 12),
      grossVolume: roundTo(grossVolume, 6),
      refundedVolume: roundTo(refundedVolume, 6),
      netChargeVolume: roundTo(netChargeVolume, 6),
      serviceFeeRatePct: roundTo(input.serviceFeeRatePct, 6),
      koFiServiceFee: roundTo(koFiServiceFee, 6),
      processorVariableFee: roundTo(processorVariableFee, 6),
      processorFixedFeeTotal: roundTo(processorFixedFeeTotal, 6),
      fxFee: roundTo(fxFee, 6),
      totalFees: roundTo(totalFees, 6),
      netTakeHome: roundTo(netTakeHome, 6),
      effectiveFeeRate: roundTo(effectiveFeeRate, 12),
      effectiveFeeRatePct: roundTo(effectiveFeeRate * 100, 6),
      takeHomePerTransaction: roundTo(takeHomePerTransaction, 6),
      netContributionPerTransaction: roundTo(netContributionPerTransaction, 6),
      requiredSuccessfulTransactions: requiredSuccessfulTransactions,
      requiredAveragePaymentAmount: requiredAveragePaymentAmount == null ? null : roundTo(requiredAveragePaymentAmount, 6),
      showRecurringCaveat: shouldShowRecurringCaveat(input.paymentType),
    };

    return { result: result, error: '', errors: [] };
  }

  function calculateComparison(rawInput) {
    const baseInput = mergeWithDefaults(rawInput);
    const free = calculateScenario(Object.assign({}, baseInput, { creatorMode: 'free' }));
    const contributor = calculateScenario(Object.assign({}, baseInput, { creatorMode: 'contributor' }));
    if (free.error || contributor.error) {
      const errors = [].concat(free.errors || [], contributor.errors || []);
      return { result: null, error: errors.join(' '), errors: errors };
    }
    const deltaContributorMinusFree = roundTo(contributor.result.netTakeHome - free.result.netTakeHome, 6);
    return {
      result: {
        free: free.result,
        contributor: contributor.result,
        deltaContributorMinusFree: deltaContributorMinusFree,
        betterMode: deltaContributorMinusFree > 0 ? 'contributor' : deltaContributorMinusFree < 0 ? 'free' : 'tie',
      },
      error: '',
      errors: [],
    };
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

  function buildSummary(result, comparison) {
    const delta = comparison ? comparison.deltaContributorMinusFree : 0;
    const comparisonLine = comparison
      ? ('Free vs Contributor net delta: ' + formatCurrency(delta) + ' (positive means Contributor keeps more).')
      : 'Free vs Contributor comparison unavailable.';

    return [
      '[Ko-fi Fee Calculator Summary]',
      'Creator mode: ' + result.input.creatorMode,
      'Payment type: ' + result.paymentTypeLabel,
      'Average payment amount: ' + formatCurrency(result.input.averagePaymentAmount),
      'Successful transactions: ' + result.input.successfulTransactions,
      'Gross volume: ' + formatCurrency(result.grossVolume),
      'Refunded volume: ' + formatCurrency(result.refundedVolume),
      'Net charge volume: ' + formatCurrency(result.netChargeVolume),
      'Ko-fi service fee rate: ' + formatPercent(result.serviceFeeRatePct),
      'Ko-fi service fee total: ' + formatCurrency(result.koFiServiceFee),
      'Processor variable fee: ' + formatCurrency(result.processorVariableFee),
      'Processor fixed fee total: ' + formatCurrency(result.processorFixedFeeTotal),
      'FX fee total: ' + formatCurrency(result.fxFee),
      'Total fees: ' + formatCurrency(result.totalFees),
      'Net take-home: ' + formatCurrency(result.netTakeHome),
      'Effective fee rate: ' + formatPercent(result.effectiveFeeRatePct),
      'Take-home per transaction: ' + formatCurrency(result.takeHomePerTransaction),
      'Required successful transactions for target net: ' + (result.requiredSuccessfulTransactions == null ? 'N/A' : result.requiredSuccessfulTransactions),
      'Required average payment amount at current transaction count: ' + (result.requiredAveragePaymentAmount == null ? 'N/A' : formatCurrency(result.requiredAveragePaymentAmount)),
      comparisonLine,
      'This is a planning model. Processor inputs are editable baselines, not guaranteed live fees.',
    ].join('\n');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const ids = {
      form: 'calculatorForm',
      error: 'errorBox',
      errorText: 'errorText',
      creatorMode: 'creatorMode',
      paymentType: 'paymentType',
      averagePaymentAmount: 'averagePaymentAmount',
      successfulTransactions: 'successfulTransactions',
      refundRatePct: 'refundRatePct',
      processorPreset: 'processorPreset',
      processorRatePct: 'processorRatePct',
      processorFixedFee: 'processorFixedFee',
      fxFeeRatePct: 'fxFeeRatePct',
      targetNetIncome: 'targetNetIncome',
      grossVolume: 'grossVolume',
      totalFees: 'totalFees',
      netTakeHome: 'netTakeHome',
      effectiveFeeRatePct: 'effectiveFeeRatePct',
      refundedVolume: 'refundedVolume',
      netChargeVolume: 'netChargeVolume',
      serviceFeeRatePct: 'serviceFeeRatePct',
      koFiServiceFee: 'koFiServiceFee',
      processorVariableFee: 'processorVariableFee',
      processorFixedFeeTotal: 'processorFixedFeeTotal',
      fxFee: 'fxFee',
      takeHomePerTransaction: 'takeHomePerTransaction',
      requiredSuccessfulTransactions: 'requiredSuccessfulTransactions',
      requiredAveragePaymentAmount: 'requiredAveragePaymentAmount',
      caveat: 'recurringCaveat',
      comparisonFreeNet: 'comparisonFreeNet',
      comparisonContributorNet: 'comparisonContributorNet',
      comparisonDelta: 'comparisonDelta',
      comparisonBetterMode: 'comparisonBetterMode',
      summary: 'summaryText',
      copy: 'copySummaryBtn',
      copyStatus: 'copyStatus',
      reset: 'resetDefaultsBtn',
    };

    const form = document.getElementById(ids.form);
    if (!form) {
      return;
    }

    const refs = {};
    Object.keys(ids).forEach(function (key) {
      refs[key] = document.getElementById(ids[key]);
    });

    function setError(message) {
      const visible = Boolean(message);
      refs.error.hidden = !visible;
      refs.errorText.textContent = visible ? message : '';
    }

    function collectInput() {
      return {
        creatorMode: refs.creatorMode.value,
        paymentType: refs.paymentType.value,
        averagePaymentAmount: refs.averagePaymentAmount.value,
        successfulTransactions: refs.successfulTransactions.value,
        refundRatePct: refs.refundRatePct.value,
        processorPreset: refs.processorPreset.value,
        processorRatePct: refs.processorRatePct.value,
        processorFixedFee: refs.processorFixedFee.value,
        fxFeeRatePct: refs.fxFeeRatePct.value,
        targetNetIncome: refs.targetNetIncome.value,
      };
    }

    function applyDefaults() {
      refs.creatorMode.value = DEFAULT_INPUTS.creatorMode;
      refs.paymentType.value = DEFAULT_INPUTS.paymentType;
      refs.averagePaymentAmount.value = String(DEFAULT_INPUTS.averagePaymentAmount);
      refs.successfulTransactions.value = String(DEFAULT_INPUTS.successfulTransactions);
      refs.refundRatePct.value = String(DEFAULT_INPUTS.refundRatePct);
      refs.processorPreset.value = DEFAULT_INPUTS.processorPreset;
      refs.processorRatePct.value = String(DEFAULT_INPUTS.processorRatePct);
      refs.processorFixedFee.value = String(DEFAULT_INPUTS.processorFixedFee);
      refs.fxFeeRatePct.value = String(DEFAULT_INPUTS.fxFeeRatePct);
      refs.targetNetIncome.value = String(DEFAULT_INPUTS.targetNetIncome);
    }

    function applyPresetDefaults(presetName) {
      const preset = getProcessorPreset(presetName);
      if (!preset || preset.ratePct == null) {
        return;
      }
      refs.processorRatePct.value = String(preset.ratePct);
      refs.processorFixedFee.value = String(preset.fixedFee);
    }

    function renderScenario(result) {
      refs.grossVolume.textContent = formatCurrency(result.grossVolume);
      refs.totalFees.textContent = formatCurrency(result.totalFees);
      refs.netTakeHome.textContent = formatCurrency(result.netTakeHome);
      refs.effectiveFeeRatePct.textContent = formatPercent(result.effectiveFeeRatePct);
      refs.refundedVolume.textContent = formatCurrency(result.refundedVolume);
      refs.netChargeVolume.textContent = formatCurrency(result.netChargeVolume);
      refs.serviceFeeRatePct.textContent = formatPercent(result.serviceFeeRatePct);
      refs.koFiServiceFee.textContent = formatCurrency(result.koFiServiceFee);
      refs.processorVariableFee.textContent = formatCurrency(result.processorVariableFee);
      refs.processorFixedFeeTotal.textContent = formatCurrency(result.processorFixedFeeTotal);
      refs.fxFee.textContent = formatCurrency(result.fxFee);
      refs.takeHomePerTransaction.textContent = formatCurrency(result.takeHomePerTransaction);
      refs.requiredSuccessfulTransactions.textContent = result.requiredSuccessfulTransactions == null ? 'N/A' : String(result.requiredSuccessfulTransactions);
      refs.requiredAveragePaymentAmount.textContent = result.requiredAveragePaymentAmount == null ? 'N/A' : formatCurrency(result.requiredAveragePaymentAmount);
      refs.caveat.hidden = !result.showRecurringCaveat;
    }

    function renderComparison(comparison) {
      refs.comparisonFreeNet.textContent = formatCurrency(comparison.free.netTakeHome);
      refs.comparisonContributorNet.textContent = formatCurrency(comparison.contributor.netTakeHome);
      refs.comparisonDelta.textContent = formatCurrency(comparison.deltaContributorMinusFree);
      refs.comparisonBetterMode.textContent = comparison.betterMode === 'tie'
        ? 'Tie under this scenario'
        : (comparison.betterMode === 'free' ? 'Free keeps more' : 'Contributor keeps more');
    }

    function render() {
      const scenario = calculateScenario(collectInput());
      refs.copyStatus.textContent = '';
      if (scenario.error) {
        setError(scenario.error);
        refs.summary.value = '';
        return;
      }
      const comparison = calculateComparison(collectInput());
      if (comparison.error) {
        setError(comparison.error);
        refs.summary.value = '';
        return;
      }
      setError('');
      renderScenario(scenario.result);
      renderComparison(comparison.result);
      refs.summary.value = buildSummary(scenario.result, comparison.result);
    }

    form.addEventListener('input', render);
    form.addEventListener('change', function (event) {
      if (event.target === refs.processorPreset) {
        applyPresetDefaults(refs.processorPreset.value);
      }
      render();
    });

    refs.copy.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (_error) {
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
    VALID_MODES: Array.from(VALID_MODES),
    VALID_PAYMENT_TYPES: Array.from(VALID_PAYMENT_TYPES),
    PROCESSOR_PRESETS: PROCESSOR_PRESETS,
    PAYMENT_TYPE_LABELS: PAYMENT_TYPE_LABELS,
    SERVICE_FEE_RULES: SERVICE_FEE_RULES,
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    mergeWithDefaults: mergeWithDefaults,
    getProcessorPreset: getProcessorPreset,
    applyProcessorPreset: applyProcessorPreset,
    paymentTypeLabel: paymentTypeLabel,
    getServiceFeeRatePct: getServiceFeeRatePct,
    shouldShowRecurringCaveat: shouldShowRecurringCaveat,
    validateInputs: validateInputs,
    calculateScenario: calculateScenario,
    calculateComparison: calculateComparison,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    escapeHtml: escapeHtml,
    initBrowser: initBrowser,
  };
});
