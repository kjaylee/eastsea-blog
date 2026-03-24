(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.MerchantOfRecordVsDirectBillingProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    monthlyOrders: 500,
    averageOrderValue: 29,
    refundRatePct: 4,
    chargebackRatePct: 0.8,
    directProcessorRatePct: 2.9,
    directProcessorFixedFee: 0.30,
    directTaxBurdenRatePct: 10,
    directComplianceMonthlyCost: 299,
    directBillingOpsMonthlyCost: 199,
    chargebackFeePerCase: 15,
    morFeeRatePct: 5,
    morFixedFeePerOrder: 0.50,
    morMonthlyCost: 0,
  };

  const FIELD_META = {
    monthlyOrders: { type: 'integer', minExclusive: 0, label: 'monthlyOrders' },
    averageOrderValue: { type: 'number', minExclusive: 0, label: 'averageOrderValue' },
    refundRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'refundRatePct' },
    chargebackRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'chargebackRatePct' },
    directProcessorRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'directProcessorRatePct' },
    directProcessorFixedFee: { type: 'number', minInclusive: 0, label: 'directProcessorFixedFee' },
    directTaxBurdenRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'directTaxBurdenRatePct' },
    directComplianceMonthlyCost: { type: 'number', minInclusive: 0, label: 'directComplianceMonthlyCost' },
    directBillingOpsMonthlyCost: { type: 'number', minInclusive: 0, label: 'directBillingOpsMonthlyCost' },
    chargebackFeePerCase: { type: 'number', minInclusive: 0, label: 'chargebackFeePerCase' },
    morFeeRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'morFeeRatePct' },
    morFixedFeePerOrder: { type: 'number', minInclusive: 0, label: 'morFixedFeePerOrder' },
    morMonthlyCost: { type: 'number', minInclusive: 0, label: 'morMonthlyCost' },
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

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value, digits) {
    if (!Number.isFinite(value)) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value) + '%';
  }

  function buildSummary(result) {
    const winner = result.monthlyDelta > 0
      ? 'Merchant of Record wins'
      : (result.monthlyDelta < 0 ? 'Direct billing wins' : 'Both models tie');

    const why = result.monthlyDelta > 0
      ? 'the direct stack is losing more to tax burden, disputes, compliance, and billing operations than the MoR fee stack removes'
      : (result.monthlyDelta < 0
        ? 'the direct stack is already lean enough that the MoR fee stack becomes extra drag'
        : 'both stacks land on near-identical take-home under the current assumptions');

    const thresholdText = result.breakEvenMorFeeRatePct == null
      ? 'Break-even MoR fee rate is unavailable because recognized revenue is not positive.'
      : 'Break-even MoR fee rate: ' + formatPercent(result.breakEvenMorFeeRatePct, 2) + '.';

    return winner + ': monthly delta ' + formatCurrency(result.monthlyDelta) +
      ' (' + formatCurrency(result.annualDelta) + ' annual). ' +
      'Direct net ' + formatCurrency(result.directNetTakeHome) +
      ' vs MoR net ' + formatCurrency(result.morNetTakeHome) + '. ' +
      'That happens because ' + why + '. ' + thresholdText;
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
    const refundRate = values.refundRatePct / 100;
    const chargebackRate = values.chargebackRatePct / 100;
    const directProcessorRate = values.directProcessorRatePct / 100;
    const directTaxBurdenRate = values.directTaxBurdenRatePct / 100;
    const morFeeRate = values.morFeeRatePct / 100;

    const grossBillings = values.monthlyOrders * values.averageOrderValue;
    const refundLoss = grossBillings * refundRate;
    const recognizedRevenue = grossBillings - refundLoss;
    const chargebackOrders = values.monthlyOrders * chargebackRate;
    const chargebackRevenueLoss = values.averageOrderValue * chargebackOrders;

    const directProcessorVariableFees = grossBillings * directProcessorRate;
    const directProcessorFixedFees = values.monthlyOrders * values.directProcessorFixedFee;
    const directTaxBurden = recognizedRevenue * directTaxBurdenRate;
    const directChargebackFees = chargebackOrders * values.chargebackFeePerCase;
    const directNetTakeHome = recognizedRevenue
      - directTaxBurden
      - directProcessorVariableFees
      - directProcessorFixedFees
      - chargebackRevenueLoss
      - directChargebackFees
      - values.directComplianceMonthlyCost
      - values.directBillingOpsMonthlyCost;

    const morFeeAmount = recognizedRevenue * morFeeRate;
    const morFixedFees = values.monthlyOrders * values.morFixedFeePerOrder;
    const morNetTakeHome = recognizedRevenue
      - morFeeAmount
      - morFixedFees
      - values.morMonthlyCost;

    const monthlyDelta = morNetTakeHome - directNetTakeHome;
    const annualDelta = monthlyDelta * 12;
    const directAllInCosts = recognizedRevenue - directNetTakeHome;
    const morAllInCosts = recognizedRevenue - morNetTakeHome;
    const directTakeHomeRatePct = grossBillings > 0 ? (directNetTakeHome / grossBillings) * 100 : null;
    const morTakeHomeRatePct = grossBillings > 0 ? (morNetTakeHome / grossBillings) * 100 : null;

    const breakEvenMorFeeRatePct = recognizedRevenue > 0
      ? (((recognizedRevenue - morFixedFees - values.morMonthlyCost) - directNetTakeHome) / recognizedRevenue) * 100
      : null;

    const annualMorCost = (morFeeAmount + morFixedFees + values.morMonthlyCost) * 12;
    const annualMorROI = annualMorCost > 0 ? (annualDelta / annualMorCost) * 100 : null;
    const currentMorVsBreakEvenPct = breakEvenMorFeeRatePct == null ? null : values.morFeeRatePct - breakEvenMorFeeRatePct;

    const result = {
      monthlyOrders: values.monthlyOrders,
      averageOrderValue: roundTo(values.averageOrderValue, 10),
      refundRatePct: roundTo(values.refundRatePct, 10),
      chargebackRatePct: roundTo(values.chargebackRatePct, 10),
      directProcessorRatePct: roundTo(values.directProcessorRatePct, 10),
      directProcessorFixedFee: roundTo(values.directProcessorFixedFee, 10),
      directTaxBurdenRatePct: roundTo(values.directTaxBurdenRatePct, 10),
      directComplianceMonthlyCost: roundTo(values.directComplianceMonthlyCost, 10),
      directBillingOpsMonthlyCost: roundTo(values.directBillingOpsMonthlyCost, 10),
      chargebackFeePerCase: roundTo(values.chargebackFeePerCase, 10),
      morFeeRatePct: roundTo(values.morFeeRatePct, 10),
      morFixedFeePerOrder: roundTo(values.morFixedFeePerOrder, 10),
      morMonthlyCost: roundTo(values.morMonthlyCost, 10),
      grossBillings: roundTo(grossBillings, 10),
      refundLoss: roundTo(refundLoss, 10),
      recognizedRevenue: roundTo(recognizedRevenue, 10),
      chargebackOrders: roundTo(chargebackOrders, 10),
      chargebackRevenueLoss: roundTo(chargebackRevenueLoss, 10),
      directProcessorVariableFees: roundTo(directProcessorVariableFees, 10),
      directProcessorFixedFees: roundTo(directProcessorFixedFees, 10),
      directTaxBurden: roundTo(directTaxBurden, 10),
      directChargebackFees: roundTo(directChargebackFees, 10),
      directNetTakeHome: roundTo(directNetTakeHome, 10),
      morFeeAmount: roundTo(morFeeAmount, 10),
      morFixedFees: roundTo(morFixedFees, 10),
      morNetTakeHome: roundTo(morNetTakeHome, 10),
      monthlyDelta: roundTo(monthlyDelta, 10),
      annualDelta: roundTo(annualDelta, 10),
      directAllInCosts: roundTo(directAllInCosts, 10),
      morAllInCosts: roundTo(morAllInCosts, 10),
      directTakeHomeRatePct: directTakeHomeRatePct == null ? null : roundTo(directTakeHomeRatePct, 10),
      morTakeHomeRatePct: morTakeHomeRatePct == null ? null : roundTo(morTakeHomeRatePct, 10),
      breakEvenMorFeeRatePct: breakEvenMorFeeRatePct == null ? null : roundTo(breakEvenMorFeeRatePct, 10),
      annualMorCost: roundTo(annualMorCost, 10),
      annualMorROI: annualMorROI == null ? null : roundTo(annualMorROI, 10),
      currentMorVsBreakEvenPct: currentMorVsBreakEvenPct == null ? null : roundTo(currentMorVsBreakEvenPct, 10),
      winner: monthlyDelta > 0 ? 'mor' : (monthlyDelta < 0 ? 'direct' : 'tie'),
      formatted: {
        directNetTakeHome: formatCurrency(directNetTakeHome),
        morNetTakeHome: formatCurrency(morNetTakeHome),
        monthlyDelta: formatCurrency(monthlyDelta),
        annualDelta: formatCurrency(annualDelta),
      },
    };

    result.summary = buildSummary(result);

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
    mergeWithDefaults: mergeWithDefaults,
    validateInputs: validateInputs,
    calculate: calculate,
    roundTo: roundTo,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    buildSummary: buildSummary,
  };
});
