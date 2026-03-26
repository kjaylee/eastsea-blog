(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.FacebookMarketplaceFeeProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const BASELINE = Object.freeze({
    shippedFeeRatePct: 10,
    shippedMinimumFee: 0.80,
    pickupFeeRatePct: 0,
    pickupMinimumFee: 0,
  });

  const DEFAULT_INPUTS = Object.freeze({
    salePrice: 45,
    orderMode: 'shipped',
    shippingChargedToBuyer: 8,
    shippingLabelCost: 7.25,
    itemCost: 18,
    packagingCost: 1.2,
    boostCost: 2,
    otherCost: 0,
    useCustomFee: false,
    customFeeRatePct: 10,
    customMinimumFee: 0.8,
    processingRatePct: 0,
    processingFlatFee: 0,
    targetProfit: 15,
  });

  const VALID_MODES = new Set(['shipped', 'pickup']);

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
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

  function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      return lowered === 'true' || lowered === '1' || lowered === 'yes' || lowered === 'on';
    }
    return Boolean(value);
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    const salePrice = toFiniteNumber(source.salePrice);
    if (salePrice == null || !(salePrice > 0)) {
      errors.push('salePrice must be greater than 0.');
    } else {
      values.salePrice = salePrice;
    }

    const orderMode = String(source.orderMode || '').trim().toLowerCase();
    if (!VALID_MODES.has(orderMode)) {
      errors.push('orderMode must be shipped or pickup.');
    } else {
      values.orderMode = orderMode;
    }

    const nonNegativeFields = [
      'shippingChargedToBuyer',
      'shippingLabelCost',
      'itemCost',
      'packagingCost',
      'boostCost',
      'otherCost',
      'customMinimumFee',
      'processingFlatFee',
      'targetProfit',
    ];

    nonNegativeFields.forEach((field) => {
      const parsed = toFiniteNumber(source[field]);
      if (parsed == null || parsed < 0) {
        errors.push(field + ' must be 0 or above.');
      } else {
        values[field] = parsed;
      }
    });

    const boundedPctFields = ['customFeeRatePct', 'processingRatePct'];
    boundedPctFields.forEach((field) => {
      const parsed = toFiniteNumber(source[field]);
      if (parsed == null || parsed < 0 || parsed >= 100) {
        errors.push(field + ' must be between 0 and 100.');
      } else {
        values[field] = parsed;
      }
    });

    values.useCustomFee = toBoolean(source.useCustomFee);

    if (!errors.length && values.orderMode === 'pickup' && values.shippingChargedToBuyer > 0) {
      errors.push('shippingChargedToBuyer must be 0 for pickup orders.');
    }

    if (!errors.length) {
      const effectiveFeeRatePct = values.orderMode === 'pickup'
        ? BASELINE.pickupFeeRatePct
        : (values.useCustomFee ? values.customFeeRatePct : BASELINE.shippedFeeRatePct);
      const effectiveProcessingRatePct = values.processingRatePct;
      if ((effectiveFeeRatePct + effectiveProcessingRatePct) >= 100) {
        errors.push('combined feeRatePct + processingRatePct must stay below 100.');
      }
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function getFeeModel(input) {
    if (input.orderMode === 'pickup') {
      return {
        feeRatePct: BASELINE.pickupFeeRatePct,
        minimumFee: BASELINE.pickupMinimumFee,
        feeModelLabel: 'Local pickup baseline: 0% marketplace fee',
      };
    }

    if (input.useCustomFee) {
      return {
        feeRatePct: input.customFeeRatePct,
        minimumFee: input.customMinimumFee,
        feeModelLabel: 'Custom fee override',
      };
    }

    return {
      feeRatePct: BASELINE.shippedFeeRatePct,
      minimumFee: BASELINE.shippedMinimumFee,
      feeModelLabel: 'Public baseline: shipped orders 10% fee, $0.80 minimum',
    };
  }

  function calculateMarketplaceFee(grossCollected, feeRatePct, minimumFee, orderMode) {
    if (orderMode === 'pickup') {
      return 0;
    }
    const pctFee = grossCollected * (feeRatePct / 100);
    return Math.max(pctFee, minimumFee);
  }

  function calculateProcessingFee(grossCollected, processingRatePct, processingFlatFee) {
    if (!(grossCollected > 0)) {
      return 0;
    }
    return (grossCollected * (processingRatePct / 100)) + processingFlatFee;
  }

  function calculateSellerCosts(input) {
    return input.itemCost
      + input.packagingCost
      + input.boostCost
      + input.otherCost
      + (input.orderMode === 'shipped' ? input.shippingLabelCost : 0);
  }

  function solveSalePriceForProfit(validInput, targetProfit) {
    const input = mergeWithDefaults(validInput);
    const feeModel = getFeeModel(input);
    const shippingRevenue = input.orderMode === 'shipped' ? input.shippingChargedToBuyer : 0;
    const sellerCosts = calculateSellerCosts(input);
    const processingRate = input.processingRatePct / 100;
    const feeRate = feeModel.feeRatePct / 100;
    const desiredProfit = toFiniteNumber(targetProfit);

    if (desiredProfit == null || desiredProfit < 0) {
      return null;
    }

    const candidates = [];

    if (input.orderMode === 'pickup') {
      const denominator = 1 - processingRate;
      if (denominator <= 0) {
        return null;
      }
      const candidate = (desiredProfit + input.processingFlatFee + sellerCosts) / denominator;
      if (Number.isFinite(candidate) && candidate >= 0) {
        candidates.push(candidate);
      }
      return candidates.length ? Math.min.apply(null, candidates) : null;
    }

    const pctDenominator = 1 - feeRate - processingRate;
    if (pctDenominator > 0) {
      const pctCandidate = ((desiredProfit + input.processingFlatFee + sellerCosts) / pctDenominator) - shippingRevenue;
      const pctGross = pctCandidate + shippingRevenue;
      if (Number.isFinite(pctCandidate) && pctCandidate >= 0 && (pctGross * feeRate) >= feeModel.minimumFee - 1e-9) {
        candidates.push(pctCandidate);
      }
    }

    const minDenominator = 1 - processingRate;
    if (minDenominator > 0) {
      const minCandidate = ((desiredProfit + feeModel.minimumFee + input.processingFlatFee + sellerCosts) / minDenominator) - shippingRevenue;
      const minGross = minCandidate + shippingRevenue;
      if (Number.isFinite(minCandidate) && minCandidate >= 0 && (minGross * feeRate) <= feeModel.minimumFee + 1e-9) {
        candidates.push(minCandidate);
      }
    }

    if (!candidates.length) {
      return null;
    }

    return Math.min.apply(null, candidates);
  }

  function buildPickupDelta(input, currentNetProfit) {
    if (input.orderMode !== 'shipped') {
      return {
        mode: 'pickup-baseline',
        label: 'Pickup orders already assume 0% marketplace fee.',
        profitDeltaVsPickup: 0,
        alternateNetProfit: roundTo(currentNetProfit, 6),
      };
    }

    const pickupInput = Object.assign({}, input, {
      orderMode: 'pickup',
      shippingChargedToBuyer: 0,
      shippingLabelCost: 0,
      useCustomFee: false,
    });
    const alternate = buildScenario(pickupInput);
    if (alternate.error) {
      return {
        mode: 'pickup-baseline',
        label: 'Pickup comparison unavailable.',
        profitDeltaVsPickup: null,
        alternateNetProfit: null,
      };
    }

    const profitDeltaVsPickup = alternate.result.netProfit - currentNetProfit;
    return {
      mode: 'pickup-baseline',
      label: profitDeltaVsPickup >= 0
        ? 'If the same item sells via local pickup, profit improves by this amount.'
        : 'If the same item sells via local pickup, profit declines by this amount.',
      profitDeltaVsPickup: roundTo(profitDeltaVsPickup, 6),
      alternateNetProfit: roundTo(alternate.result.netProfit, 6),
    };
  }

  function buildSummary(result) {
    return [
      '[Facebook Marketplace Fee & Profit Calculator Summary]',
      'Order mode: ' + result.input.orderMode,
      'Fee model: ' + result.feeModel.feeModelLabel,
      'Sale price: ' + formatCurrency(result.input.salePrice),
      'Buyer shipping collected: ' + formatCurrency(result.shippingRevenue),
      'Gross collected: ' + formatCurrency(result.grossCollected),
      'Marketplace fee: ' + formatCurrency(result.marketplaceFee),
      'Processing fee: ' + formatCurrency(result.processingFee),
      'Payout after fees: ' + formatCurrency(result.payoutAfterFees),
      'Seller costs: ' + formatCurrency(result.sellerCosts),
      'Net profit: ' + formatCurrency(result.netProfit),
      'Net margin: ' + formatPercent(result.netMarginPct),
      'Break-even sale price: ' + formatCurrency(result.breakEvenSalePrice),
      'Sale price for target profit: ' + formatCurrency(result.requiredSalePriceForTargetProfit),
      'Pickup delta vs current scenario: ' + formatCurrency(result.pickupDelta.profitDeltaVsPickup),
      'Reference posture only. Public fee baselines can drift by region, account, or checkout path.',
    ].join('\n');
  }

  function formatCurrency(value) {
    if (value == null || !Number.isFinite(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    if (value == null || !Number.isFinite(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function buildScenario(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const feeModel = getFeeModel(input);
    const shippingRevenue = input.orderMode === 'shipped' ? input.shippingChargedToBuyer : 0;
    const grossCollected = input.salePrice + shippingRevenue;
    const marketplaceFee = calculateMarketplaceFee(grossCollected, feeModel.feeRatePct, feeModel.minimumFee, input.orderMode);
    const processingFee = calculateProcessingFee(grossCollected, input.processingRatePct, input.processingFlatFee);
    const payoutAfterFees = grossCollected - marketplaceFee - processingFee;
    const sellerCosts = calculateSellerCosts(input);
    const netProfit = payoutAfterFees - sellerCosts;
    const netMarginPct = grossCollected > 0 ? (netProfit / grossCollected) * 100 : 0;
    const effectiveFeeRatePct = grossCollected > 0 ? ((marketplaceFee + processingFee) / grossCollected) * 100 : 0;

    const breakEvenSalePrice = solveSalePriceForProfit(input, 0);
    const requiredSalePriceForTargetProfit = solveSalePriceForProfit(input, input.targetProfit);
    const pickupDelta = buildPickupDelta(input, netProfit);

    const result = {
      input: input,
      feeModel: feeModel,
      grossCollected: roundTo(grossCollected, 6),
      shippingRevenue: roundTo(shippingRevenue, 6),
      marketplaceFee: roundTo(marketplaceFee, 6),
      processingFee: roundTo(processingFee, 6),
      payoutAfterFees: roundTo(payoutAfterFees, 6),
      sellerCosts: roundTo(sellerCosts, 6),
      netProfit: roundTo(netProfit, 6),
      netMarginPct: roundTo(netMarginPct, 6),
      effectiveFeeRatePct: roundTo(effectiveFeeRatePct, 6),
      breakEvenSalePrice: breakEvenSalePrice == null ? null : roundTo(breakEvenSalePrice, 6),
      requiredSalePriceForTargetProfit: requiredSalePriceForTargetProfit == null ? null : roundTo(requiredSalePriceForTargetProfit, 6),
      pickupDelta: pickupDelta,
      summary: '',
    };

    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function calculate(rawInput) {
    return buildScenario(rawInput);
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const form = document.getElementById('calculatorForm');
    if (!form) {
      return;
    }

    const refs = {
      orderMode: document.getElementById('orderMode'),
      shippingChargedToBuyer: document.getElementById('shippingChargedToBuyer'),
      shippingLabelCost: document.getElementById('shippingLabelCost'),
      useCustomFee: document.getElementById('useCustomFee'),
      customFeeFields: document.getElementById('customFeeFields'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      summary: document.getElementById('summary'),
      copyStatus: document.getElementById('copyStatus'),
      grossCollected: document.getElementById('grossCollected'),
      marketplaceFee: document.getElementById('marketplaceFee'),
      payoutAfterFees: document.getElementById('payoutAfterFees'),
      netProfit: document.getElementById('netProfit'),
      processingFee: document.getElementById('processingFee'),
      sellerCosts: document.getElementById('sellerCosts'),
      netMarginPct: document.getElementById('netMarginPct'),
      effectiveFeeRatePct: document.getElementById('effectiveFeeRatePct'),
      breakEvenSalePrice: document.getElementById('breakEvenSalePrice'),
      requiredSalePriceForTargetProfit: document.getElementById('requiredSalePriceForTargetProfit'),
      pickupInsight: document.getElementById('pickupInsight'),
      feeModelLabel: document.getElementById('feeModelLabel'),
      resetBtn: document.getElementById('resetDefaultsBtn'),
      copyBtn: document.getElementById('copySummaryBtn'),
    };

    function applyDefaults() {
      Object.keys(DEFAULT_INPUTS).forEach((key) => {
        if (!form.elements[key]) return;
        if (form.elements[key].type === 'checkbox') {
          form.elements[key].checked = Boolean(DEFAULT_INPUTS[key]);
        } else {
          form.elements[key].value = String(DEFAULT_INPUTS[key]);
        }
      });
    }

    function toggleConditionalFields() {
      const shipped = refs.orderMode.value === 'shipped';
      refs.shippingChargedToBuyer.disabled = !shipped;
      refs.shippingLabelCost.disabled = !shipped;
      if (!shipped) {
        refs.shippingChargedToBuyer.value = '0';
        refs.shippingLabelCost.value = '0';
      }
      refs.customFeeFields.hidden = !refs.useCustomFee.checked || !shipped;
      if (!shipped) {
        refs.useCustomFee.checked = false;
      }
    }

    function collectInput() {
      return {
        salePrice: form.elements.salePrice.value,
        orderMode: form.elements.orderMode.value,
        shippingChargedToBuyer: form.elements.shippingChargedToBuyer.value,
        shippingLabelCost: form.elements.shippingLabelCost.value,
        itemCost: form.elements.itemCost.value,
        packagingCost: form.elements.packagingCost.value,
        boostCost: form.elements.boostCost.value,
        otherCost: form.elements.otherCost.value,
        useCustomFee: form.elements.useCustomFee.checked,
        customFeeRatePct: form.elements.customFeeRatePct.value,
        customMinimumFee: form.elements.customMinimumFee.value,
        processingRatePct: form.elements.processingRatePct.value,
        processingFlatFee: form.elements.processingFlatFee.value,
        targetProfit: form.elements.targetProfit.value,
      };
    }

    function setError(message) {
      refs.errorBox.hidden = !message;
      refs.errorText.textContent = message || '';
    }

    function renderResult(result) {
      refs.grossCollected.textContent = formatCurrency(result.grossCollected);
      refs.marketplaceFee.textContent = formatCurrency(result.marketplaceFee);
      refs.payoutAfterFees.textContent = formatCurrency(result.payoutAfterFees);
      refs.netProfit.textContent = formatCurrency(result.netProfit);
      refs.processingFee.textContent = formatCurrency(result.processingFee);
      refs.sellerCosts.textContent = formatCurrency(result.sellerCosts);
      refs.netMarginPct.textContent = formatPercent(result.netMarginPct);
      refs.effectiveFeeRatePct.textContent = formatPercent(result.effectiveFeeRatePct);
      refs.breakEvenSalePrice.textContent = formatCurrency(result.breakEvenSalePrice);
      refs.requiredSalePriceForTargetProfit.textContent = formatCurrency(result.requiredSalePriceForTargetProfit);
      refs.pickupInsight.textContent = result.pickupDelta.label + ' ' + formatCurrency(result.pickupDelta.profitDeltaVsPickup);
      refs.feeModelLabel.textContent = result.feeModel.feeModelLabel;
      refs.summary.value = result.summary;
    }

    function render() {
      toggleConditionalFields();
      const { result, error } = calculate(collectInput());
      if (error) {
        setError(error);
        refs.summary.value = '';
        ['grossCollected', 'marketplaceFee', 'payoutAfterFees', 'netProfit', 'processingFee', 'sellerCosts', 'netMarginPct', 'effectiveFeeRatePct', 'breakEvenSalePrice', 'requiredSalePriceForTargetProfit'].forEach((key) => {
          refs[key].textContent = 'N/A';
        });
        refs.pickupInsight.textContent = 'Adjust inputs to see the pickup-vs-shipping insight.';
        refs.feeModelLabel.textContent = 'Waiting for valid inputs.';
        return;
      }
      setError('');
      renderResult(result);
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);

    refs.resetBtn.addEventListener('click', function () {
      applyDefaults();
      toggleConditionalFields();
      render();
    });

    refs.copyBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        refs.copyStatus.textContent = 'Clipboard unavailable. Please copy manually.';
      }
    });

    applyDefaults();
    toggleConditionalFields();
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
    BASELINE: BASELINE,
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    DEFAULTS: DEFAULT_INPUTS,
    VALID_MODES: VALID_MODES,
    roundTo: roundTo,
    validateInputs: validateInputs,
    getFeeModel: getFeeModel,
    calculateMarketplaceFee: calculateMarketplaceFee,
    calculateProcessingFee: calculateProcessingFee,
    calculateSellerCosts: calculateSellerCosts,
    solveSalePriceForProfit: solveSalePriceForProfit,
    buildPickupDelta: buildPickupDelta,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    initBrowser: initBrowser,
  };
});
