(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.AppStoreVsWebCheckoutProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    appStorePrice: 14.99,
    webPrice: 12.99,
    eligibleCustomers: 1000,
    webCaptureRatePct: 72,
    appStoreRefundRatePct: 4,
    webRefundRatePct: 5,
    appStoreFeeRatePct: 30,
    merchantOfRecordFeeRatePct: 5,
    paymentFeeRatePct: 2.9,
    paymentFixedFee: 0.30,
    monthlyWebFixedCost: 399,
  };

  const FIELD_META = {
    appStorePrice: { type: 'number', minExclusive: 0, label: 'appStorePrice' },
    webPrice: { type: 'number', minExclusive: 0, label: 'webPrice' },
    eligibleCustomers: { type: 'integer', minInclusive: 0, label: 'eligibleCustomers' },
    webCaptureRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'webCaptureRatePct' },
    appStoreRefundRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appStoreRefundRatePct' },
    webRefundRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'webRefundRatePct' },
    appStoreFeeRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appStoreFeeRatePct' },
    merchantOfRecordFeeRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'merchantOfRecordFeeRatePct' },
    paymentFeeRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'paymentFeeRatePct' },
    paymentFixedFee: { type: 'number', minInclusive: 0, label: 'paymentFixedFee' },
    monthlyWebFixedCost: { type: 'number', minInclusive: 0, label: 'monthlyWebFixedCost' },
  };

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const values = {};
    const errors = [];

    Object.keys(FIELD_META).forEach(function (field) {
      const meta = FIELD_META[field];
      const num = toFiniteNumber(source[field]);

      if (num == null) {
        errors.push(meta.label + ' must be a valid number.');
        return;
      }
      if (meta.type === 'integer' && !Number.isInteger(num)) {
        errors.push(meta.label + ' must be an integer.');
        return;
      }
      if (meta.minExclusive != null && !(num > meta.minExclusive)) {
        errors.push(meta.label + ' must be greater than ' + meta.minExclusive + '.');
        return;
      }
      if (meta.minInclusive != null && !(num >= meta.minInclusive)) {
        errors.push(meta.label + ' must be at least ' + meta.minInclusive + '.');
        return;
      }
      if (meta.maxInclusive != null && !(num <= meta.maxInclusive)) {
        errors.push(meta.label + ' must be at most ' + meta.maxInclusive + '.');
        return;
      }
      values[field] = num;
    });

    if (
      Number.isFinite(values.merchantOfRecordFeeRatePct) &&
      Number.isFinite(values.paymentFeeRatePct) &&
      values.merchantOfRecordFeeRatePct + values.paymentFeeRatePct >= 100
    ) {
      errors.push('merchantOfRecordFeeRatePct + paymentFeeRatePct must stay below 100.');
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function buildInsight(result) {
    if (result.eligibleCustomers === 0) {
      return 'Enter at least one eligible customer to compare in-app proceeds against app-to-web checkout economics.';
    }

    if (Math.abs(result.monthlyDelta) < 1e-9) {
      return 'Under these assumptions, web checkout and App Store checkout land at parity. The next lever to test is either capture rate or web price.';
    }

    if (result.monthlyDelta > 0) {
      if (result.breakEvenWebCaptureRatePct != null && result.currentWebCaptureVsBreakEvenPct >= 0) {
        return 'Web checkout wins by ' + result.formatted.monthlyDelta + ' per month because the current capture rate stays above the break-even threshold even after MoR, processor, and fixed web costs.';
      }
      return 'Web checkout wins by ' + result.formatted.monthlyDelta + ' per month. At this point, lower channel fees offset conversion leakage.';
    }

    if (result.breakEvenWebCaptureRatePct != null && result.breakEvenWebCaptureRatePct > 100) {
      return 'App Store wins by ' + result.formatted.monthlyDeltaAbs + ' per month. With the current web fee stack and fixed costs, parity would require more than 100% web capture, so another lever must change.';
    }

    return 'App Store wins by ' + result.formatted.monthlyDeltaAbs + ' per month. Web checkout needs either a higher capture rate, a higher web price, or a leaner fee stack to catch up.';
  }

  function computeBreakEvenWebCaptureRatePct(appNet, values) {
    const eligibleCustomers = values.eligibleCustomers;
    const webRefundKeepFactor = 1 - (values.webRefundRatePct / 100);
    const webVariableKeepFactor = 1 - ((values.merchantOfRecordFeeRatePct + values.paymentFeeRatePct) / 100);
    const unitWebNetBeforeFixed = (values.webPrice * webRefundKeepFactor * webVariableKeepFactor) - values.paymentFixedFee;

    if (!(eligibleCustomers > 0) || !(unitWebNetBeforeFixed > 0)) {
      return null;
    }

    const capture = (appNet + values.monthlyWebFixedCost) / (eligibleCustomers * unitWebNetBeforeFixed);
    return capture * 100;
  }

  function computeRequiredWebPrice(appNet, values) {
    const completedWebOrders = values.eligibleCustomers * (values.webCaptureRatePct / 100);
    const refundKeepFactor = 1 - (values.webRefundRatePct / 100);
    const variableKeepFactor = 1 - ((values.merchantOfRecordFeeRatePct + values.paymentFeeRatePct) / 100);
    const denominator = completedWebOrders * refundKeepFactor * variableKeepFactor;

    if (!(denominator > 0)) {
      return null;
    }

    return (appNet + values.monthlyWebFixedCost + (completedWebOrders * values.paymentFixedFee)) / denominator;
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        input: null,
        result: null,
      };
    }

    const values = validation.values;
    const appRefundRate = values.appStoreRefundRatePct / 100;
    const webCaptureRate = values.webCaptureRatePct / 100;
    const webRefundRate = values.webRefundRatePct / 100;
    const appFeeRate = values.appStoreFeeRatePct / 100;
    const webVariableFeeRatePct = values.merchantOfRecordFeeRatePct + values.paymentFeeRatePct;
    const webVariableFeeRate = webVariableFeeRatePct / 100;

    const appGrossBillings = values.eligibleCustomers * values.appStorePrice;
    const appRefundedAmount = appGrossBillings * appRefundRate;
    const appRecognizedBillings = appGrossBillings - appRefundedAmount;
    const appFeeAmount = appRecognizedBillings * appFeeRate;
    const appNetTakeHome = appRecognizedBillings - appFeeAmount;
    const appTakeHomeRatePct = appGrossBillings > 0 ? (appNetTakeHome / appGrossBillings) * 100 : 0;

    const completedWebOrders = values.eligibleCustomers * webCaptureRate;
    const webGrossBillings = completedWebOrders * values.webPrice;
    const webRefundedAmount = webGrossBillings * webRefundRate;
    const webRecognizedBillings = webGrossBillings - webRefundedAmount;
    const webVariableFees = webRecognizedBillings * webVariableFeeRate;
    const webFixedPaymentFees = completedWebOrders * values.paymentFixedFee;
    const webTotalCosts = webVariableFees + webFixedPaymentFees + values.monthlyWebFixedCost;
    const webNetTakeHome = webRecognizedBillings - webTotalCosts;
    const webTakeHomeRatePct = webGrossBillings > 0 ? (webNetTakeHome / webGrossBillings) * 100 : 0;

    const monthlyDelta = webNetTakeHome - appNetTakeHome;
    const annualDelta = monthlyDelta * 12;

    const breakEvenWebCaptureRatePct = computeBreakEvenWebCaptureRatePct(appNetTakeHome, values);
    const requiredWebPrice = computeRequiredWebPrice(appNetTakeHome, values);
    const currentWebCaptureVsBreakEvenPct = breakEvenWebCaptureRatePct == null
      ? null
      : values.webCaptureRatePct - breakEvenWebCaptureRatePct;

    const result = {
      eligibleCustomers: values.eligibleCustomers,
      appStorePrice: values.appStorePrice,
      webPrice: values.webPrice,
      webCaptureRatePct: roundTo(values.webCaptureRatePct, 10),
      appStoreRefundRatePct: roundTo(values.appStoreRefundRatePct, 10),
      webRefundRatePct: roundTo(values.webRefundRatePct, 10),
      appStoreFeeRatePct: roundTo(values.appStoreFeeRatePct, 10),
      merchantOfRecordFeeRatePct: roundTo(values.merchantOfRecordFeeRatePct, 10),
      paymentFeeRatePct: roundTo(values.paymentFeeRatePct, 10),
      webVariableFeeRatePct: roundTo(webVariableFeeRatePct, 10),
      paymentFixedFee: roundTo(values.paymentFixedFee, 10),
      monthlyWebFixedCost: roundTo(values.monthlyWebFixedCost, 10),
      appGrossBillings: roundTo(appGrossBillings, 10),
      appRefundedAmount: roundTo(appRefundedAmount, 10),
      appRecognizedBillings: roundTo(appRecognizedBillings, 10),
      appFeeAmount: roundTo(appFeeAmount, 10),
      appNetTakeHome: roundTo(appNetTakeHome, 10),
      appTakeHomeRatePct: roundTo(appTakeHomeRatePct, 10),
      completedWebOrders: roundTo(completedWebOrders, 10),
      webGrossBillings: roundTo(webGrossBillings, 10),
      webRefundedAmount: roundTo(webRefundedAmount, 10),
      webRecognizedBillings: roundTo(webRecognizedBillings, 10),
      webVariableFees: roundTo(webVariableFees, 10),
      webFixedPaymentFees: roundTo(webFixedPaymentFees, 10),
      webTotalCosts: roundTo(webTotalCosts, 10),
      webNetTakeHome: roundTo(webNetTakeHome, 10),
      webTakeHomeRatePct: roundTo(webTakeHomeRatePct, 10),
      monthlyDelta: roundTo(monthlyDelta, 10),
      annualDelta: roundTo(annualDelta, 10),
      breakEvenWebCaptureRatePct: breakEvenWebCaptureRatePct == null ? null : roundTo(breakEvenWebCaptureRatePct, 10),
      requiredWebPrice: requiredWebPrice == null ? null : roundTo(requiredWebPrice, 10),
      currentWebCaptureVsBreakEvenPct: currentWebCaptureVsBreakEvenPct == null ? null : roundTo(currentWebCaptureVsBreakEvenPct, 10),
      parityNote: breakEvenWebCaptureRatePct == null
        ? 'Break-even web capture is unavailable when eligible customers are zero or the web fee stack leaves no positive unit economics before fixed cost.'
        : 'Break-even web capture assumes the same eligible audience size and the current web price, refund, and fee assumptions.',
    };

    result.formatted = {
      monthlyDelta: formatCurrency(Math.abs(result.monthlyDelta)),
      monthlyDeltaAbs: formatCurrency(Math.abs(result.monthlyDelta)),
      appNetTakeHome: formatCurrency(result.appNetTakeHome),
      webNetTakeHome: formatCurrency(result.webNetTakeHome),
    };
    result.insight = buildInsight(result);

    return {
      ok: true,
      errors: [],
      input: values,
      result: result,
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

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    FIELD_META: FIELD_META,
    mergeWithDefaults: mergeWithDefaults,
    validateInputs: validateInputs,
    computeBreakEvenWebCaptureRatePct: computeBreakEvenWebCaptureRatePct,
    computeRequiredWebPrice: computeRequiredWebPrice,
    calculate: calculate,
    roundTo: roundTo,
  };
});
