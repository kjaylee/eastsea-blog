(function (root) {
  'use strict';

  const RATE_SOURCE_DATE = '2025-07-31';

  const PAYMENT_TYPES = {
    invoice: {
      key: 'invoice',
      label: 'Invoice or digital wallet',
      shortLabel: 'Invoice / wallet',
      assumptionKey: 'invoiceRate',
      internationalEligible: true
    },
    ach: {
      key: 'ach',
      label: 'ACH bank payment',
      shortLabel: 'ACH',
      assumptionKey: 'achRate',
      internationalEligible: false
    },
    inPerson: {
      key: 'inPerson',
      label: 'In-person payment',
      shortLabel: 'In-person',
      assumptionKey: 'inPersonRate',
      internationalEligible: true
    },
    keyed: {
      key: 'keyed',
      label: 'Keyed-in card',
      shortLabel: 'Keyed-in',
      assumptionKey: 'keyedRate',
      internationalEligible: true
    }
  };

  const PAYMENT_TYPE_KEYS = Object.keys(PAYMENT_TYPES);

  const DEFAULT_ASSUMPTIONS = Object.freeze({
    invoiceRate: 0.0299,
    achRate: 0.01,
    inPersonRate: 0.025,
    keyedRate: 0.035,
    internationalSurchargeRate: 0.01
  });

  const DEFAULT_INPUTS = Object.freeze({
    mode: 'forward',
    paymentType: 'invoice',
    amount: 100,
    international: false,
    monthlyTransactionCount: 25,
    customTotalRate: null
  });

  function roundTo(value, digits) {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function roundMoney(value) {
    return roundTo(value, 2);
  }

  function roundRate(value) {
    return roundTo(value, 4);
  }

  function percentToDecimal(value) {
    return Number(value) / 100;
  }

  function decimalToPercent(value) {
    return Number(value) * 100;
  }

  function cloneAssumptions(assumptions) {
    return {
      invoiceRate: assumptions.invoiceRate,
      achRate: assumptions.achRate,
      inPersonRate: assumptions.inPersonRate,
      keyedRate: assumptions.keyedRate,
      internationalSurchargeRate: assumptions.internationalSurchargeRate
    };
  }

  function normalizeAssumptions(assumptions) {
    const merged = Object.assign({}, DEFAULT_ASSUMPTIONS, assumptions || {});
    return {
      invoiceRate: Number(merged.invoiceRate),
      achRate: Number(merged.achRate),
      inPersonRate: Number(merged.inPersonRate),
      keyedRate: Number(merged.keyedRate),
      internationalSurchargeRate: Number(merged.internationalSurchargeRate)
    };
  }

  function normalizeInput(input) {
    const merged = Object.assign({}, DEFAULT_INPUTS, input || {});
    const customTotalRate =
      merged.customTotalRate === '' || merged.customTotalRate == null
        ? null
        : Number(merged.customTotalRate);

    return {
      mode: String(merged.mode || DEFAULT_INPUTS.mode),
      paymentType: String(merged.paymentType || DEFAULT_INPUTS.paymentType),
      amount: Number(merged.amount),
      international: Boolean(merged.international),
      monthlyTransactionCount: Number(merged.monthlyTransactionCount),
      customTotalRate
    };
  }

  function validateRate(value, label) {
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      return `${label} must be a finite rate between 0% and under 100%.`;
    }
    return '';
  }

  function resolveScenario(input, assumptions, paymentTypeKey) {
    const paymentType = PAYMENT_TYPES[paymentTypeKey];
    const baseRate = assumptions[paymentType.assumptionKey];
    const internationalRate =
      input.international && paymentType.internationalEligible
        ? assumptions.internationalSurchargeRate
        : 0;
    const customTotalRateUsed =
      paymentTypeKey === input.paymentType && input.customTotalRate != null;
    const totalRate = customTotalRateUsed ? input.customTotalRate : baseRate + internationalRate;

    return {
      paymentTypeKey,
      paymentTypeLabel: paymentType.label,
      baseRate,
      internationalRate,
      totalRate,
      customTotalRateUsed,
      internationalApplied: internationalRate > 0
    };
  }

  function computeScenario(input, assumptions, paymentTypeKey) {
    const scenario = resolveScenario(input, assumptions, paymentTypeKey);
    let grossCharge;
    let targetNet;
    let fee;
    let net;

    if (input.mode === 'forward') {
      grossCharge = input.amount;
      fee = grossCharge * scenario.totalRate;
      net = grossCharge - fee;
      targetNet = net;
    } else {
      targetNet = input.amount;
      grossCharge = targetNet / (1 - scenario.totalRate);
      fee = grossCharge - targetNet;
      net = targetNet;
    }

    const effectiveFeeRate = grossCharge > 0 ? fee / grossCharge : 0;
    const monthlyFees = fee * input.monthlyTransactionCount;
    const annualFees = monthlyFees * 12;

    return {
      paymentTypeKey: scenario.paymentTypeKey,
      paymentTypeLabel: scenario.paymentTypeLabel,
      baseRate: roundRate(scenario.baseRate),
      internationalRate: roundRate(scenario.internationalRate),
      totalRate: roundRate(scenario.totalRate),
      customTotalRateUsed: scenario.customTotalRateUsed,
      internationalApplied: scenario.internationalApplied,
      grossCharge: roundMoney(grossCharge),
      targetNet: roundMoney(targetNet),
      fee: roundMoney(fee),
      net: roundMoney(net),
      effectiveFeeRate: roundRate(effectiveFeeRate),
      monthlyFees: roundMoney(monthlyFees),
      annualFees: roundMoney(annualFees)
    };
  }

  function buildComparison(input, assumptions) {
    return PAYMENT_TYPE_KEYS.map((paymentTypeKey) => computeScenario(input, assumptions, paymentTypeKey));
  }

  function validate(input, assumptions) {
    if (!PAYMENT_TYPES[input.paymentType]) {
      return 'Choose a supported QuickBooks Payments method.';
    }

    if (input.mode !== 'forward' && input.mode !== 'reverse') {
      return 'Choose either forward or reverse mode.';
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return 'Amount must be a finite number greater than 0.';
    }

    if (
      !Number.isFinite(input.monthlyTransactionCount) ||
      input.monthlyTransactionCount < 0 ||
      !Number.isInteger(input.monthlyTransactionCount)
    ) {
      return 'Monthly transaction count must be an integer-like number at or above 0.';
    }

    const assumptionChecks = [
      validateRate(assumptions.invoiceRate, 'Invoice or digital wallet rate assumption'),
      validateRate(assumptions.achRate, 'ACH rate assumption'),
      validateRate(assumptions.inPersonRate, 'In-person rate assumption'),
      validateRate(assumptions.keyedRate, 'Keyed-in rate assumption'),
      validateRate(assumptions.internationalSurchargeRate, 'International surcharge assumption')
    ].filter(Boolean);

    if (assumptionChecks.length > 0) {
      return assumptionChecks[0];
    }

    if (input.customTotalRate != null) {
      const customRateError = validateRate(input.customTotalRate, 'Custom total rate override');
      if (customRateError) {
        return customRateError;
      }
    }

    const selectedScenario = resolveScenario(input, assumptions, input.paymentType);
    if (input.mode === 'reverse' && selectedScenario.totalRate >= 1) {
      return 'Reverse mode is impossible when the total fee rate is 100% or more.';
    }

    return '';
  }

  function formatMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function formatPercentFromDecimal(value) {
    return `${decimalToPercent(value).toFixed(2)}%`;
  }

  function buildSummary(result, input, assumptions) {
    const modeLabel = input.mode === 'forward' ? 'Charge amount' : 'Target net amount';
    const amountLabel = input.mode === 'forward' ? 'Net proceeds' : 'Required gross charge';
    const assumptionLine = result.customTotalRateUsed
      ? `Custom total rate override: ${formatPercentFromDecimal(result.totalRate)}`
      : `Public rate assumption: ${formatPercentFromDecimal(result.baseRate)}${result.internationalApplied ? ` + ${formatPercentFromDecimal(result.internationalRate)} international surcharge assumption` : ''}`;

    return [
      '[QuickBooks Payments Fee Estimate]',
      '',
      `Mode: ${input.mode}`,
      `Payment type: ${result.paymentTypeLabel}`,
      `${modeLabel}: ${formatMoney(input.amount)}`,
      `Gross charge: ${formatMoney(result.grossCharge)}`,
      `Total fee: ${formatMoney(result.fee)}`,
      `${amountLabel}: ${input.mode === 'forward' ? formatMoney(result.net) : formatMoney(result.grossCharge)}`,
      `Net proceeds: ${formatMoney(result.net)}`,
      `Effective fee rate: ${formatPercentFromDecimal(result.effectiveFeeRate)}`,
      `Monthly fees (${input.monthlyTransactionCount} tx): ${formatMoney(result.monthlyFees)}`,
      `Annualized fees: ${formatMoney(result.annualFees)}`,
      assumptionLine,
      `Assumption source date: ${RATE_SOURCE_DATE}`,
      'Planning note: QuickBooks rates can vary by plan, discount, or negotiated terms, so every public assumption stays editable.'
    ].join('\n');
  }

  function calculate(input, assumptionOverrides) {
    const normalizedInput = normalizeInput(input);
    const normalizedAssumptions = normalizeAssumptions(assumptionOverrides);
    const error = validate(normalizedInput, normalizedAssumptions);

    if (error) {
      return {
        result: null,
        error,
        input: normalizedInput,
        assumptions: cloneAssumptions(normalizedAssumptions)
      };
    }

    const result = computeScenario(normalizedInput, normalizedAssumptions, normalizedInput.paymentType);
    result.comparison = buildComparison(normalizedInput, normalizedAssumptions);
    result.summary = buildSummary(result, normalizedInput, normalizedAssumptions);
    result.assumptionSourceDate = RATE_SOURCE_DATE;
    result.assumptions = cloneAssumptions(normalizedAssumptions);

    return {
      result,
      error: '',
      input: normalizedInput,
      assumptions: cloneAssumptions(normalizedAssumptions)
    };
  }

  const exportsObject = {
    RATE_SOURCE_DATE,
    PAYMENT_TYPES,
    PAYMENT_TYPE_KEYS,
    DEFAULT_ASSUMPTIONS,
    DEFAULT_INPUTS,
    percentToDecimal,
    decimalToPercent,
    roundMoney,
    roundRate,
    normalizeAssumptions,
    normalizeInput,
    resolveScenario,
    buildComparison,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsObject;
  } else {
    root.QuickBooksPaymentsFeeCalculator = exportsObject;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
