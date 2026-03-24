(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.AppStoreVsGooglePlaySubscriptionProfitComparator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    price: 9.99,
    billedSubscribers: 1200,
    refundRate: 4,
    appleSmallBusiness: true,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 0,
    appleFirstYearFeeRate: 30,
    applePostYearOneFeeRate: 15,
    appleSmallBusinessFeeRate: 15,
    googlePlaySubscriptionFeeRate: 15,
  };

  const FIELD_META = {
    price: { type: 'number', minExclusive: 0, label: 'price' },
    billedSubscribers: { type: 'integer', minInclusive: 0, label: 'billedSubscribers' },
    refundRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'refundRate' },
    appleSmallBusiness: { type: 'boolean', label: 'appleSmallBusiness' },
    appleLongTermSharePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appleLongTermSharePct' },
    monthlyOpsCost: { type: 'number', minInclusive: 0, label: 'monthlyOpsCost' },
    appleFirstYearFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appleFirstYearFeeRate' },
    applePostYearOneFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'applePostYearOneFeeRate' },
    appleSmallBusinessFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appleSmallBusinessFeeRate' },
    googlePlaySubscriptionFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'googlePlaySubscriptionFeeRate' },
  };

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
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
      const value = source[field];

      if (meta.type === 'boolean') {
        values[field] = Boolean(value);
        return;
      }

      const num = toFiniteNumber(value);
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
      Number.isFinite(values.appleFirstYearFeeRate) &&
      Number.isFinite(values.applePostYearOneFeeRate) &&
      values.applePostYearOneFeeRate > values.appleFirstYearFeeRate
    ) {
      errors.push('applePostYearOneFeeRate should not exceed appleFirstYearFeeRate.');
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function computeAppleFeeRatePct(values) {
    if (values.appleSmallBusiness) {
      return values.appleSmallBusinessFeeRate;
    }
    const longTermShare = values.appleLongTermSharePct / 100;
    return (values.appleFirstYearFeeRate * (1 - longTermShare)) +
      (values.applePostYearOneFeeRate * longTermShare);
  }

  function buildInsight(result, values) {
    if (values.billedSubscribers === 0) {
      return 'Enter at least 1 billed subscriber to compare store take-home and calculate the Apple parity price.';
    }

    if (Math.abs(result.monthlyDelta) < 1e-9) {
      if (values.appleSmallBusiness) {
        return 'At the same price, Apple reaches parity here because Small Business is enabled.';
      }
      if (values.appleLongTermSharePct >= 100) {
        return 'At the same price, Apple reaches parity here because all Apple subscriber-months are beyond year one.';
      }
      return 'At the same price, both stores land at parity under the current fee assumptions.';
    }

    if (result.monthlyDelta > 0) {
      if (values.appleSmallBusiness) {
        return 'Google Play still leads by ' + formatMoney(result.monthlyDelta) + ' per month, but Apple is already in its reduced-fee Small Business state.';
      }
      if (values.appleLongTermSharePct > 0) {
        return 'At the same price, Google Play keeps ' + formatMoney(result.monthlyDelta) + ' more per month. Apple narrows the gap as more subscriber-months move beyond year one.';
      }
      return 'At the same price, Google Play keeps ' + formatMoney(result.monthlyDelta) + ' more per month because Apple is still modeled at the first-year subscription fee rate.';
    }

    return 'At the same price, Apple keeps ' + formatMoney(Math.abs(result.monthlyDelta)) + ' more per month under the current custom fee assumptions.';
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
    const refundRateDecimal = values.refundRate / 100;
    const grossBillings = values.price * values.billedSubscribers;
    const refundedAmount = grossBillings * refundRateDecimal;
    const recognizedBillings = grossBillings - refundedAmount;

    const appleFeeRatePct = computeAppleFeeRatePct(values);
    const googleFeeRatePct = values.googlePlaySubscriptionFeeRate;
    const appleFeeRate = appleFeeRatePct / 100;
    const googleFeeRate = googleFeeRatePct / 100;

    const appleFeeAmount = recognizedBillings * appleFeeRate;
    const googleFeeAmount = recognizedBillings * googleFeeRate;

    const appleNetBeforeOps = recognizedBillings - appleFeeAmount;
    const googleNetBeforeOps = recognizedBillings - googleFeeAmount;
    const appleNetAfterOps = appleNetBeforeOps - values.monthlyOpsCost;
    const googleNetAfterOps = googleNetBeforeOps - values.monthlyOpsCost;

    const monthlyDelta = googleNetAfterOps - appleNetAfterOps;
    const annualDelta = monthlyDelta * 12;

    const appleTakeHomeRatePct = grossBillings > 0 ? (appleNetAfterOps / grossBillings) * 100 : 0;
    const googleTakeHomeRatePct = grossBillings > 0 ? (googleNetAfterOps / grossBillings) * 100 : 0;

    const refundKeepFactor = 1 - refundRateDecimal;
    const appleKeepFactorBeforeOps = 1 - appleFeeRate;
    let requiredApplePrice = null;
    if (
      values.billedSubscribers > 0 &&
      refundKeepFactor > 0 &&
      appleKeepFactorBeforeOps > 0
    ) {
      const requiredAppleRecognized = googleNetBeforeOps / appleKeepFactorBeforeOps;
      const requiredAppleGross = requiredAppleRecognized / refundKeepFactor;
      requiredApplePrice = requiredAppleGross / values.billedSubscribers;
    }

    const appleParityPriceLiftPct = requiredApplePrice == null
      ? null
      : ((requiredApplePrice / values.price) - 1) * 100;

    const result = {
      price: values.price,
      billedSubscribers: values.billedSubscribers,
      refundRatePct: values.refundRate,
      appleSmallBusiness: values.appleSmallBusiness,
      appleLongTermSharePct: values.appleLongTermSharePct,
      monthlyOpsCost: values.monthlyOpsCost,
      grossBillings: roundTo(grossBillings, 10),
      refundedAmount: roundTo(refundedAmount, 10),
      recognizedBillings: roundTo(recognizedBillings, 10),
      appleFeeRatePct: roundTo(appleFeeRatePct, 10),
      googleFeeRatePct: roundTo(googleFeeRatePct, 10),
      appleFeeAmount: roundTo(appleFeeAmount, 10),
      googleFeeAmount: roundTo(googleFeeAmount, 10),
      appleNetBeforeOps: roundTo(appleNetBeforeOps, 10),
      googleNetBeforeOps: roundTo(googleNetBeforeOps, 10),
      appleNetAfterOps: roundTo(appleNetAfterOps, 10),
      googleNetAfterOps: roundTo(googleNetAfterOps, 10),
      appleTakeHomeRatePct: roundTo(appleTakeHomeRatePct, 10),
      googleTakeHomeRatePct: roundTo(googleTakeHomeRatePct, 10),
      monthlyDelta: roundTo(monthlyDelta, 10),
      annualDelta: roundTo(annualDelta, 10),
      requiredApplePrice: requiredApplePrice == null ? null : roundTo(requiredApplePrice, 10),
      appleParityPriceLiftPct: appleParityPriceLiftPct == null ? null : roundTo(appleParityPriceLiftPct, 10),
      parityNote: requiredApplePrice == null
        ? 'Apple parity price is unavailable when billed subscribers is zero or refund/fee assumptions leave no valid denominator.'
        : 'Apple parity price holds subscriber count, refund rate, and Apple fee assumptions constant.',
    };

    result.insight = buildInsight(result, values);

    return {
      ok: true,
      errors: [],
      input: values,
      result: result,
    };
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    FIELD_META: FIELD_META,
    validateInputs: validateInputs,
    computeAppleFeeRatePct: computeAppleFeeRatePct,
    buildInsight: buildInsight,
    calculate: calculate,
    roundTo: roundTo,
  };
});
