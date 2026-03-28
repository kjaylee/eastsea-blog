(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SellfyVsGumroadProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONSTANTS = Object.freeze({
    GUMROAD_DIRECT_RATE: 0.10,
    GUMROAD_DIRECT_FIXED_FEE: 0.50,
  });

  const DEFAULT_INPUTS = Object.freeze({
    monthlyOrders: 120,
    averageOrderValue: 25,
    refundRatePct: 3,
    processorRatePct: 2.9,
    processorFixedFee: 0.30,
    sellfyMonthlyPlanCost: 29,
    sellfyOverageRatePct: 0,
    annualSalesCap: 0,
  });

  const FIELD_META = Object.freeze({
    monthlyOrders: { type: 'integer', minExclusive: 0 },
    averageOrderValue: { type: 'number', minExclusive: 0 },
    refundRatePct: { type: 'rate' },
    processorRatePct: { type: 'rate' },
    processorFixedFee: { type: 'number', minInclusive: 0 },
    sellfyMonthlyPlanCost: { type: 'number', minInclusive: 0 },
    sellfyOverageRatePct: { type: 'rate' },
    annualSalesCap: { type: 'number', minInclusive: 0 },
  });

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
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
      if (meta.type === 'rate' && (num < 0 || num > 100)) {
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

    if (!errors.length && values.annualSalesCap === 0 && values.sellfyOverageRatePct > 0) {
      errors.push('annualSalesCap must be above 0 when sellfyOverageRatePct is used.');
    }

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

  function buildSummary(result) {
    const winner = result.monthlyDelta > 0
      ? 'Sellfy wins'
      : (result.monthlyDelta < 0 ? 'Gumroad wins' : 'Tie');
    const breakEvenText = result.breakEvenMonthlyOrdersForSellfy == null
      ? 'Sellfy does not reach break-even under the current assumptions.'
      : 'Sellfy break-even monthly orders: ' + result.breakEvenMonthlyOrdersForSellfy + '.';
    const overageText = result.sellfyMonthlyOverageFee > 0
      ? 'Sellfy overage adds ' + formatCurrency(result.sellfyMonthlyOverageFee) + ' per month.'
      : 'No Sellfy overage fee is modeled.';

    return [
      '[Sellfy vs Gumroad Profit Calculator Summary]',
      'Winner: ' + winner,
      'Gross billings: ' + formatCurrency(result.grossBillings),
      'Recognized revenue after refunds: ' + formatCurrency(result.recognizedRevenue),
      'Gumroad net take-home: ' + formatCurrency(result.gumroadNetTakeHome),
      'Sellfy net take-home: ' + formatCurrency(result.sellfyNetTakeHome),
      'Monthly delta (Sellfy - Gumroad): ' + formatCurrency(result.monthlyDelta),
      'Annual delta: ' + formatCurrency(result.annualDelta),
      'Per-order delta: ' + formatCurrency(result.perOrderDelta),
      breakEvenText,
      overageText,
      'Scope: Gumroad direct sales only; Sellfy compares one plan cost at a time.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors, input: null, result: null };
    }

    const input = validation.values;
    const refundRate = input.refundRatePct / 100;
    const processorRate = input.processorRatePct / 100;
    const sellfyOverageRate = input.sellfyOverageRatePct / 100;

    const grossBillings = input.monthlyOrders * input.averageOrderValue;
    const annualizedGrossBillings = grossBillings * 12;
    const refundLoss = grossBillings * refundRate;
    const recognizedRevenue = grossBillings - refundLoss;

    const processorVariableFees = grossBillings * processorRate;
    const processorFixedFees = input.monthlyOrders * input.processorFixedFee;

    const gumroadPlatformFee = (recognizedRevenue * CONSTANTS.GUMROAD_DIRECT_RATE) + (input.monthlyOrders * CONSTANTS.GUMROAD_DIRECT_FIXED_FEE);
    const gumroadNetTakeHome = recognizedRevenue - gumroadPlatformFee - processorVariableFees - processorFixedFees;

    const annualOverageBase = input.annualSalesCap > 0 ? Math.max(annualizedGrossBillings - input.annualSalesCap, 0) : 0;
    const annualSellfyOverageFee = annualOverageBase * sellfyOverageRate;
    const sellfyMonthlyOverageFee = annualSellfyOverageFee / 12;
    const sellfyTotalFixedMonthlyCost = input.sellfyMonthlyPlanCost + sellfyMonthlyOverageFee;
    const sellfyNetTakeHome = recognizedRevenue - processorVariableFees - processorFixedFees - sellfyTotalFixedMonthlyCost;

    const monthlyDelta = sellfyNetTakeHome - gumroadNetTakeHome;
    const annualDelta = monthlyDelta * 12;
    const perOrderDelta = monthlyDelta / input.monthlyOrders;

    const gumroadSavingsPerOrderVsSellfy = (input.averageOrderValue * (1 - refundRate) * CONSTANTS.GUMROAD_DIRECT_RATE) + CONSTANTS.GUMROAD_DIRECT_FIXED_FEE;
    const breakEvenMonthlyOrdersForSellfy = gumroadSavingsPerOrderVsSellfy > 0
      ? Math.ceil(sellfyTotalFixedMonthlyCost / gumroadSavingsPerOrderVsSellfy)
      : null;

    const result = {
      monthlyOrders: input.monthlyOrders,
      averageOrderValue: roundTo(input.averageOrderValue, 10),
      refundRatePct: roundTo(input.refundRatePct, 10),
      processorRatePct: roundTo(input.processorRatePct, 10),
      processorFixedFee: roundTo(input.processorFixedFee, 10),
      sellfyMonthlyPlanCost: roundTo(input.sellfyMonthlyPlanCost, 10),
      sellfyOverageRatePct: roundTo(input.sellfyOverageRatePct, 10),
      annualSalesCap: roundTo(input.annualSalesCap, 10),
      grossBillings: roundTo(grossBillings, 10),
      annualizedGrossBillings: roundTo(annualizedGrossBillings, 10),
      refundLoss: roundTo(refundLoss, 10),
      recognizedRevenue: roundTo(recognizedRevenue, 10),
      processorVariableFees: roundTo(processorVariableFees, 10),
      processorFixedFees: roundTo(processorFixedFees, 10),
      gumroadPlatformFee: roundTo(gumroadPlatformFee, 10),
      gumroadNetTakeHome: roundTo(gumroadNetTakeHome, 10),
      annualSellfyOverageFee: roundTo(annualSellfyOverageFee, 10),
      sellfyMonthlyOverageFee: roundTo(sellfyMonthlyOverageFee, 10),
      sellfyTotalFixedMonthlyCost: roundTo(sellfyTotalFixedMonthlyCost, 10),
      sellfyNetTakeHome: roundTo(sellfyNetTakeHome, 10),
      monthlyDelta: roundTo(monthlyDelta, 10),
      annualDelta: roundTo(annualDelta, 10),
      perOrderDelta: roundTo(perOrderDelta, 10),
      gumroadSavingsPerOrderVsSellfy: roundTo(gumroadSavingsPerOrderVsSellfy, 10),
      breakEvenMonthlyOrdersForSellfy: breakEvenMonthlyOrdersForSellfy,
      gumroadTakeHomeRatePct: grossBillings > 0 ? roundTo((gumroadNetTakeHome / grossBillings) * 100, 10) : null,
      sellfyTakeHomeRatePct: grossBillings > 0 ? roundTo((sellfyNetTakeHome / grossBillings) * 100, 10) : null,
      winner: monthlyDelta > 0 ? 'sellfy' : (monthlyDelta < 0 ? 'gumroad' : 'tie'),
      summary: '',
    };

    result.summary = buildSummary(result);

    return { ok: true, errors: [], input: input, result: result };
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
    if (typeof document === 'undefined') return;

    const form = document.getElementById('calculatorForm');
    if (!form) return;

    const fields = [
      'monthlyOrders',
      'averageOrderValue',
      'refundRatePct',
      'processorRatePct',
      'processorFixedFee',
      'sellfyMonthlyPlanCost',
      'sellfyOverageRatePct',
      'annualSalesCap',
    ].map(function (id) { return document.getElementById(id); });

    const outputs = {
      grossBillings: document.getElementById('grossBillings'),
      recognizedRevenue: document.getElementById('recognizedRevenue'),
      gumroadNetTakeHome: document.getElementById('gumroadNetTakeHome'),
      sellfyNetTakeHome: document.getElementById('sellfyNetTakeHome'),
      monthlyDelta: document.getElementById('monthlyDelta'),
      annualDelta: document.getElementById('annualDelta'),
      perOrderDelta: document.getElementById('perOrderDelta'),
      breakEvenMonthlyOrdersForSellfy: document.getElementById('breakEvenMonthlyOrdersForSellfy'),
      gumroadPlatformFee: document.getElementById('gumroadPlatformFee'),
      processorVariableFees: document.getElementById('processorVariableFees'),
      processorFixedFees: document.getElementById('processorFixedFees'),
      sellfyMonthlyOverageFee: document.getElementById('sellfyMonthlyOverageFee'),
      sellfyTotalFixedMonthlyCost: document.getElementById('sellfyTotalFixedMonthlyCost'),
      gumroadTakeHomeRatePct: document.getElementById('gumroadTakeHomeRatePct'),
      sellfyTakeHomeRatePct: document.getElementById('sellfyTakeHomeRatePct'),
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
      outputs.grossBillings.textContent = formatCurrency(r.grossBillings);
      outputs.recognizedRevenue.textContent = formatCurrency(r.recognizedRevenue);
      outputs.gumroadNetTakeHome.textContent = formatCurrency(r.gumroadNetTakeHome);
      outputs.sellfyNetTakeHome.textContent = formatCurrency(r.sellfyNetTakeHome);
      outputs.monthlyDelta.textContent = formatCurrency(r.monthlyDelta);
      outputs.annualDelta.textContent = formatCurrency(r.annualDelta);
      outputs.perOrderDelta.textContent = formatCurrency(r.perOrderDelta);
      outputs.breakEvenMonthlyOrdersForSellfy.textContent = r.breakEvenMonthlyOrdersForSellfy == null ? 'N/A' : String(r.breakEvenMonthlyOrdersForSellfy);
      outputs.gumroadPlatformFee.textContent = formatCurrency(r.gumroadPlatformFee);
      outputs.processorVariableFees.textContent = formatCurrency(r.processorVariableFees);
      outputs.processorFixedFees.textContent = formatCurrency(r.processorFixedFees);
      outputs.sellfyMonthlyOverageFee.textContent = formatCurrency(r.sellfyMonthlyOverageFee);
      outputs.sellfyTotalFixedMonthlyCost.textContent = formatCurrency(r.sellfyTotalFixedMonthlyCost);
      outputs.gumroadTakeHomeRatePct.textContent = formatPercent(r.gumroadTakeHomeRatePct, 2);
      outputs.sellfyTakeHomeRatePct.textContent = formatPercent(r.sellfyTakeHomeRatePct, 2);
      outputs.summary.value = r.summary;
      outputs.verdict.textContent = r.winner === 'sellfy'
        ? 'Sellfy wins under the current assumptions.'
        : (r.winner === 'gumroad' ? 'Gumroad wins under the current assumptions.' : 'Both options are tied under the current assumptions.');
      outputs.verdict.dataset.winner = r.winner;
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
    validateInputs: validateInputs,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    escapeHtml: escapeHtml,
    initBrowser: initBrowser,
  };
});
