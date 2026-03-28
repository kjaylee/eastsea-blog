(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.GumroadVsLemonSqueezyMigrationROICalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONSTANTS = Object.freeze({
    GUMROAD_DIRECT_RATE: 0.10,
    GUMROAD_DIRECT_FIXED: 0.50,
    GUMROAD_DISCOVER_RATE: 0.30,
    LEMON_BASE_RATE: 0.05,
    LEMON_FIXED: 0.50,
    LEMON_INTL_RATE: 0.015,
    LEMON_PAYPAL_RATE: 0.015,
    LEMON_SUBSCRIPTION_RATE: 0.005,
  });

  const DEFAULT_INPUTS = Object.freeze({
    monthlyOrders: 100,
    averageOrderValue: 30,
    refundRatePct: 5,
    gumroadDiscoverSharePct: 0,
    lemonInternationalSharePct: 15,
    lemonPaypalSharePct: 10,
    subscriptionSharePct: 0,
    expectedOrderLiftPct: 0,
    migrationCost: 300,
  });

  const FIELD_META = Object.freeze({
    monthlyOrders: { type: 'integer', minExclusive: 0 },
    averageOrderValue: { type: 'number', minExclusive: 0 },
    refundRatePct: { type: 'rate' },
    gumroadDiscoverSharePct: { type: 'rate' },
    lemonInternationalSharePct: { type: 'rate' },
    lemonPaypalSharePct: { type: 'rate' },
    subscriptionSharePct: { type: 'rate' },
    expectedOrderLiftPct: { type: 'number', minInclusive: 0 },
    migrationCost: { type: 'number', minInclusive: 0 },
  });

  function toFiniteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
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
    const errors = [];
    const values = {};

    Object.keys(FIELD_META).forEach(function (field) {
      const meta = FIELD_META[field];
      const num = toFiniteNumber(source[field]);
      if (num == null) {
        errors.push(field + ' must be a valid number.');
        return;
      }
      if (meta.type === 'integer' && !Number.isInteger(num)) {
        errors.push(field + ' must be an integer.');
        return;
      }
      if (field === 'refundRatePct' && !(num >= 0 && num < 100)) {
        errors.push(field + ' must be between 0 and less than 100.');
        return;
      }
      if ((field === 'gumroadDiscoverSharePct' || field === 'lemonInternationalSharePct' || field === 'lemonPaypalSharePct' || field === 'subscriptionSharePct') && !(num >= 0 && num <= 100)) {
        errors.push(field + ' must be between 0 and 100.');
        return;
      }
      if (meta.minExclusive != null && !(num > meta.minExclusive)) {
        errors.push(field + ' must be greater than ' + meta.minExclusive + '.');
        return;
      }
      if (meta.minInclusive != null && !(num >= meta.minInclusive)) {
        errors.push(field + ' must be at least ' + meta.minInclusive + '.');
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
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value, digits) {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value) + '%';
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  function lemonEffectiveRate(input) {
    return CONSTANTS.LEMON_BASE_RATE
      + (input.lemonInternationalSharePct / 100) * CONSTANTS.LEMON_INTL_RATE
      + (input.lemonPaypalSharePct / 100) * CONSTANTS.LEMON_PAYPAL_RATE
      + (input.subscriptionSharePct / 100) * CONSTANTS.LEMON_SUBSCRIPTION_RATE;
  }

  function calcLemonScenario(input, orders, aov, refundRate) {
    const gross = orders * aov;
    const recognizedRevenue = gross * (1 - refundRate);
    const feeRate = lemonEffectiveRate(input);
    const fees = (recognizedRevenue * feeRate) + (orders * CONSTANTS.LEMON_FIXED);
    const net = recognizedRevenue - fees;
    return {
      orders: roundTo(orders, 10),
      gross: roundTo(gross, 10),
      recognizedRevenue: roundTo(recognizedRevenue, 10),
      feeRatePct: roundTo(feeRate * 100, 10),
      fees: roundTo(fees, 10),
      net: roundTo(net, 10),
      effectiveFeeRatePct: gross > 0 ? roundTo((fees / gross) * 100, 10) : 0,
    };
  }

  function buildSummary(result) {
    const paybackText = result.paybackMonths == null
      ? 'Payback: not reached under the current assumptions.'
      : 'Payback: ' + formatNumber(result.paybackMonths, 1) + ' months.';

    return [
      '[Gumroad vs Lemon Squeezy Migration ROI Calculator]',
      'Current Gumroad net: ' + formatCurrency(result.gumroadNet),
      'Lemon net at same volume: ' + formatCurrency(result.sameVolumeLemonNet),
      'Fee-only monthly delta: ' + formatCurrency(result.sameVolumeDelta),
      'Projected Lemon net after migration assumptions: ' + formatCurrency(result.projectedLemonNet),
      'Projected monthly delta: ' + formatCurrency(result.projectedDelta),
      'Projected annual delta: ' + formatCurrency(result.annualProjectedDelta),
      paybackText,
      'Assumptions: Gumroad Discover share ' + formatPercent(result.input.gumroadDiscoverSharePct, 1)
        + ', Lemon intl/paypal/subscription shares '
        + formatPercent(result.input.lemonInternationalSharePct, 1) + ' / '
        + formatPercent(result.input.lemonPaypalSharePct, 1) + ' / '
        + formatPercent(result.input.subscriptionSharePct, 1)
        + ', order lift ' + formatPercent(result.input.expectedOrderLiftPct, 1) + '.',
      'Scope: payout fees, taxes, and chargebacks excluded in v1.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors, input: null, result: null };
    }

    const input = validation.values;
    const refundRate = input.refundRatePct / 100;
    const discoverShare = input.gumroadDiscoverSharePct / 100;

    const currentGross = input.monthlyOrders * input.averageOrderValue;
    const recognizedRevenue = currentGross * (1 - refundRate);
    const discoverOrders = input.monthlyOrders * discoverShare;
    const directOrders = input.monthlyOrders - discoverOrders;

    const gumroadDirectFee = (directOrders * input.averageOrderValue * (1 - refundRate) * CONSTANTS.GUMROAD_DIRECT_RATE)
      + (directOrders * CONSTANTS.GUMROAD_DIRECT_FIXED);
    const gumroadDiscoverFee = discoverOrders * input.averageOrderValue * (1 - refundRate) * CONSTANTS.GUMROAD_DISCOVER_RATE;
    const gumroadFees = gumroadDirectFee + gumroadDiscoverFee;
    const gumroadNet = recognizedRevenue - gumroadFees;
    const gumroadEffectiveFeeRatePct = currentGross > 0 ? (gumroadFees / currentGross) * 100 : 0;

    const sameVolume = calcLemonScenario(input, input.monthlyOrders, input.averageOrderValue, refundRate);
    const projectedOrders = input.monthlyOrders * (1 + (input.expectedOrderLiftPct / 100));
    const projected = calcLemonScenario(input, projectedOrders, input.averageOrderValue, refundRate);

    const sameVolumeDelta = sameVolume.net - gumroadNet;
    const projectedDelta = projected.net - gumroadNet;
    const annualProjectedDelta = projectedDelta * 12;
    const paybackMonths = projectedDelta > 0 ? input.migrationCost / projectedDelta : null;

    const result = {
      input: Object.assign({}, input),
      currentGross: roundTo(currentGross, 10),
      recognizedRevenue: roundTo(recognizedRevenue, 10),
      directOrders: roundTo(directOrders, 10),
      discoverOrders: roundTo(discoverOrders, 10),
      gumroadDirectFee: roundTo(gumroadDirectFee, 10),
      gumroadDiscoverFee: roundTo(gumroadDiscoverFee, 10),
      gumroadFees: roundTo(gumroadFees, 10),
      gumroadNet: roundTo(gumroadNet, 10),
      gumroadEffectiveFeeRatePct: roundTo(gumroadEffectiveFeeRatePct, 10),
      sameVolumeLemonNet: sameVolume.net,
      sameVolumeLemonFees: sameVolume.fees,
      sameVolumeLemonGross: sameVolume.gross,
      sameVolumeLemonEffectiveFeeRatePct: sameVolume.effectiveFeeRatePct,
      sameVolumeDelta: roundTo(sameVolumeDelta, 10),
      projectedLemonOrders: projected.orders,
      projectedLemonGross: projected.gross,
      projectedLemonNet: projected.net,
      projectedLemonFees: projected.fees,
      projectedLemonEffectiveFeeRatePct: projected.effectiveFeeRatePct,
      projectedDelta: roundTo(projectedDelta, 10),
      annualProjectedDelta: roundTo(annualProjectedDelta, 10),
      paybackMonths: paybackMonths == null ? null : roundTo(paybackMonths, 10),
      lemonFeeRatePct: sameVolume.feeRatePct,
      summary: '',
    };

    result.summary = buildSummary(result);

    return { ok: true, errors: [], input: input, result: result };
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;

    const form = document.getElementById('calculatorForm');
    if (!form) return;

    const fieldIds = [
      'monthlyOrders',
      'averageOrderValue',
      'refundRatePct',
      'gumroadDiscoverSharePct',
      'lemonInternationalSharePct',
      'lemonPaypalSharePct',
      'subscriptionSharePct',
      'expectedOrderLiftPct',
      'migrationCost',
    ];

    const fields = fieldIds.map(function (id) { return document.getElementById(id); });

    const outputs = {
      gumroadNet: document.getElementById('gumroadNet'),
      sameVolumeLemonNet: document.getElementById('sameVolumeLemonNet'),
      projectedLemonNet: document.getElementById('projectedLemonNet'),
      projectedDelta: document.getElementById('projectedDelta'),
      annualProjectedDelta: document.getElementById('annualProjectedDelta'),
      paybackMonths: document.getElementById('paybackMonths'),
      gumroadFees: document.getElementById('gumroadFees'),
      gumroadEffectiveFeeRatePct: document.getElementById('gumroadEffectiveFeeRatePct'),
      sameVolumeLemonFees: document.getElementById('sameVolumeLemonFees'),
      sameVolumeLemonEffectiveFeeRatePct: document.getElementById('sameVolumeLemonEffectiveFeeRatePct'),
      projectedLemonFees: document.getElementById('projectedLemonFees'),
      projectedLemonOrders: document.getElementById('projectedLemonOrders'),
      feeOnlyDelta: document.getElementById('feeOnlyDelta'),
      currentGross: document.getElementById('currentGross'),
      recognizedRevenue: document.getElementById('recognizedRevenue'),
      summary: document.getElementById('summary'),
      verdict: document.getElementById('verdict'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      copyStatus: document.getElementById('copyStatus'),
    };

    function applyDefaults() {
      fields.forEach(function (field) {
        field.value = String(DEFAULT_INPUTS[field.id]);
      });
    }

    function readInput() {
      const data = {};
      fields.forEach(function (field) {
        data[field.id] = field.value;
      });
      return data;
    }

    function renderError(errors) {
      outputs.errorBox.hidden = false;
      outputs.errorText.textContent = errors.join(' ');
    }

    function clearError() {
      outputs.errorBox.hidden = true;
      outputs.errorText.textContent = '';
    }

    function render() {
      const out = calculate(readInput());
      if (!out.ok) {
        renderError(out.errors);
        return;
      }
      clearError();
      const r = out.result;

      outputs.gumroadNet.textContent = formatCurrency(r.gumroadNet);
      outputs.sameVolumeLemonNet.textContent = formatCurrency(r.sameVolumeLemonNet);
      outputs.projectedLemonNet.textContent = formatCurrency(r.projectedLemonNet);
      outputs.projectedDelta.textContent = formatCurrency(r.projectedDelta);
      outputs.annualProjectedDelta.textContent = formatCurrency(r.annualProjectedDelta);
      outputs.paybackMonths.textContent = r.paybackMonths == null ? 'Not reached' : formatNumber(r.paybackMonths, 1) + ' mo';
      outputs.gumroadFees.textContent = formatCurrency(r.gumroadFees);
      outputs.gumroadEffectiveFeeRatePct.textContent = formatPercent(r.gumroadEffectiveFeeRatePct, 2);
      outputs.sameVolumeLemonFees.textContent = formatCurrency(r.sameVolumeLemonFees);
      outputs.sameVolumeLemonEffectiveFeeRatePct.textContent = formatPercent(r.sameVolumeLemonEffectiveFeeRatePct, 2);
      outputs.projectedLemonFees.textContent = formatCurrency(r.projectedLemonFees);
      outputs.projectedLemonOrders.textContent = formatNumber(r.projectedLemonOrders, 1);
      outputs.feeOnlyDelta.textContent = formatCurrency(r.sameVolumeDelta);
      outputs.currentGross.textContent = formatCurrency(r.currentGross);
      outputs.recognizedRevenue.textContent = formatCurrency(r.recognizedRevenue);
      outputs.summary.value = r.summary;

      if (r.projectedDelta > 0) {
        outputs.verdict.textContent = 'Migration pays back under the current assumptions. Lemon Squeezy adds ' + formatCurrency(r.projectedDelta) + ' per month.';
        outputs.verdict.dataset.state = 'win';
      } else if (r.sameVolumeDelta > 0) {
        outputs.verdict.textContent = 'Fee-only savings exist, but your migration assumptions are not strong enough to pay back yet.';
        outputs.verdict.dataset.state = 'warn';
      } else {
        outputs.verdict.textContent = 'Under the current assumptions, migration does not improve monthly take-home.';
        outputs.verdict.dataset.state = 'loss';
      }
    }

    form.addEventListener('input', render);
    document.getElementById('resetDefaultsBtn').addEventListener('click', function () {
      applyDefaults();
      render();
    });
    document.getElementById('copySummaryBtn').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(outputs.summary.value);
        outputs.copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        outputs.copyStatus.textContent = 'Clipboard unavailable. Copy manually.';
      }
    });

    applyDefaults();
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
    CONSTANTS: CONSTANTS,
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    toFiniteNumber: toFiniteNumber,
    roundTo: roundTo,
    validateInputs: validateInputs,
    lemonEffectiveRate: lemonEffectiveRate,
    calcLemonScenario: calcLemonScenario,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    formatNumber: formatNumber,
    initBrowser: initBrowser,
  };
});