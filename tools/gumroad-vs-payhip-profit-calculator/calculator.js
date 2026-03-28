(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.GumroadVsPayhipProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONSTANTS = Object.freeze({
    GUMROAD_DIRECT_RATE: 0.10,
    GUMROAD_DIRECT_FIXED: 0.50,
    GUMROAD_DISCOVER_RATE: 0.30,
  });

  const PAYHIP_PLANS = Object.freeze([
    { id: 'free', label: 'Free', transactionRate: 0.05, monthlyFee: 0 },
    { id: 'plus', label: 'Plus', transactionRate: 0.02, monthlyFee: 29 },
    { id: 'pro', label: 'Pro', transactionRate: 0.00, monthlyFee: 99 },
  ]);

  const PROCESSOR_PRESETS = Object.freeze([
    { id: 'stripe-domestic', label: 'Stripe baseline · 2.9% + $0.30', ratePct: 2.9, flatFee: 0.30 },
    { id: 'paypal-usd', label: 'PayPal USD baseline · 2.99% + $0.49', ratePct: 2.99, flatFee: 0.49 },
    { id: 'custom', label: 'Custom processor', ratePct: null, flatFee: null },
  ]);

  const DEFAULT_INPUTS = Object.freeze({
    averageOrderValue: 30,
    monthlyOrders: 120,
    refundRatePct: 2,
    gumroadDiscoverSharePct: 25,
    processorPreset: 'stripe-domestic',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.30,
    migrationCost: 300,
  });

  const planMap = Object.fromEntries(PAYHIP_PLANS.map((plan) => [plan.id, plan]));
  const processorMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  function toFiniteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function roundTo(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
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

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function getPlan(planId) {
    return planMap[planId] || null;
  }

  function getProcessorPreset(presetId) {
    return processorMap[presetId] || null;
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input.processorPreset);
    if (!preset) return null;
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        label: preset.label,
        ratePct: input.customProcessorRatePct,
        flatFee: input.customProcessorFlatFee,
      };
    }
    return {
      id: preset.id,
      label: preset.label,
      ratePct: preset.ratePct,
      flatFee: preset.flatFee,
    };
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const input = {
      averageOrderValue: toFiniteNumber(source.averageOrderValue),
      monthlyOrders: toFiniteNumber(source.monthlyOrders),
      refundRatePct: toFiniteNumber(source.refundRatePct),
      gumroadDiscoverSharePct: toFiniteNumber(source.gumroadDiscoverSharePct),
      processorPreset: source.processorPreset || DEFAULT_INPUTS.processorPreset,
      customProcessorRatePct: toFiniteNumber(source.customProcessorRatePct),
      customProcessorFlatFee: toFiniteNumber(source.customProcessorFlatFee),
      migrationCost: toFiniteNumber(source.migrationCost),
    };

    const errors = [];

    if (!Number.isFinite(input.averageOrderValue) || input.averageOrderValue <= 0) {
      errors.push('averageOrderValue must be greater than 0.');
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders <= 0 || !Number.isInteger(input.monthlyOrders)) {
      errors.push('monthlyOrders must be an integer greater than 0.');
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      errors.push('refundRatePct must be between 0 and less than 100.');
    }
    if (!Number.isFinite(input.gumroadDiscoverSharePct) || input.gumroadDiscoverSharePct < 0 || input.gumroadDiscoverSharePct > 100) {
      errors.push('gumroadDiscoverSharePct must be between 0 and 100.');
    }
    if (!getProcessorPreset(input.processorPreset)) {
      errors.push('processorPreset is unsupported.');
    }
    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      errors.push('customProcessorRatePct must be between 0 and less than 100.');
    }
    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      errors.push('customProcessorFlatFee must be zero or above.');
    }
    if (!Number.isFinite(input.migrationCost) || input.migrationCost < 0) {
      errors.push('migrationCost must be zero or above.');
    }

    return {
      ok: errors.length === 0,
      errors,
      input,
    };
  }

  function buildSharedMetrics(input) {
    const grossSales = input.averageOrderValue * input.monthlyOrders;
    const refundLoss = grossSales * (input.refundRatePct / 100);
    const recognizedRevenue = grossSales - refundLoss;
    const discoverShare = input.gumroadDiscoverSharePct / 100;
    const discoverOrders = input.monthlyOrders * discoverShare;
    const directOrders = input.monthlyOrders - discoverOrders;
    const discoverRevenue = recognizedRevenue * discoverShare;
    const directRevenue = recognizedRevenue - discoverRevenue;
    const recognizedRevenuePerOrder = recognizedRevenue / input.monthlyOrders;

    return {
      grossSales,
      refundLoss,
      recognizedRevenue,
      discoverShare,
      discoverOrders,
      directOrders,
      discoverRevenue,
      directRevenue,
      recognizedRevenuePerOrder,
    };
  }

  function calcGumroadScenario(input, shared) {
    const directFee = (shared.directRevenue * CONSTANTS.GUMROAD_DIRECT_RATE)
      + (shared.directOrders * CONSTANTS.GUMROAD_DIRECT_FIXED);
    const discoverFee = shared.discoverRevenue * CONSTANTS.GUMROAD_DISCOVER_RATE;
    const totalFees = directFee + discoverFee;
    const net = shared.recognizedRevenue - totalFees;
    const effectiveFeeRatePct = shared.grossSales > 0 ? (totalFees / shared.grossSales) * 100 : 0;
    const perOrderNet = input.monthlyOrders > 0 ? net / input.monthlyOrders : 0;
    const weightedVariableFeeRate = ((1 - shared.discoverShare) * CONSTANTS.GUMROAD_DIRECT_RATE)
      + (shared.discoverShare * CONSTANTS.GUMROAD_DISCOVER_RATE);
    const directFixedFeePerAllOrders = (1 - shared.discoverShare) * CONSTANTS.GUMROAD_DIRECT_FIXED;

    return {
      directFee,
      discoverFee,
      totalFees,
      net,
      effectiveFeeRatePct,
      perOrderNet,
      weightedVariableFeeRate,
      directFixedFeePerAllOrders,
    };
  }

  function calcPayhipPlan(shared, processor, gumroad, plan) {
    const processorRate = processor.ratePct / 100;
    const platformVariableFee = shared.recognizedRevenue * plan.transactionRate;
    const processorVariableFee = shared.recognizedRevenue * processorRate;
    const processorFixedFee = shared.monthlyOrders * processor.flatFee;
    const totalFees = platformVariableFee + processorVariableFee + processorFixedFee + plan.monthlyFee;
    const net = shared.recognizedRevenue - totalFees;
    const effectiveFeeRatePct = shared.grossSales > 0 ? (totalFees / shared.grossSales) * 100 : 0;
    const deltaVsGumroad = net - gumroad.net;
    const annualDeltaVsGumroad = deltaVsGumroad * 12;

    const payhipPerOrderBeforeMonthly = (shared.recognizedRevenuePerOrder * (1 - plan.transactionRate - processorRate)) - processor.flatFee;
    const advantagePerOrderVsGumroad = payhipPerOrderBeforeMonthly - gumroad.perOrderNet;

    let breakEvenOrdersVsGumroad = null;
    let breakEvenGrossVsGumroad = null;

    if (plan.monthlyFee === 0) {
      if (advantagePerOrderVsGumroad >= 0) {
        breakEvenOrdersVsGumroad = 0;
        breakEvenGrossVsGumroad = 0;
      }
    } else if (advantagePerOrderVsGumroad > 0) {
      breakEvenOrdersVsGumroad = plan.monthlyFee / advantagePerOrderVsGumroad;
      breakEvenGrossVsGumroad = breakEvenOrdersVsGumroad * (shared.grossSales / shared.monthlyOrders);
    }

    return {
      id: plan.id,
      label: plan.label,
      transactionRatePct: plan.transactionRate * 100,
      monthlyFee: plan.monthlyFee,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      platformVariableFee,
      processorVariableFee,
      processorFixedFee,
      totalFees,
      net,
      effectiveFeeRatePct,
      deltaVsGumroad,
      annualDeltaVsGumroad,
      payhipPerOrderBeforeMonthly,
      advantagePerOrderVsGumroad,
      breakEvenOrdersVsGumroad,
      breakEvenGrossVsGumroad,
    };
  }

  function chooseBestPlan(rows) {
    if (!rows || !rows.length) return null;
    return rows.slice().sort((a, b) => {
      if (b.net !== a.net) return b.net - a.net;
      return a.totalFees - b.totalFees;
    })[0];
  }

  function buildSummary(result) {
    const paybackText = result.paybackMonths == null
      ? 'Payback: not reached under the current assumptions.'
      : 'Payback: ' + formatNumber(result.paybackMonths, 1) + ' months.';

    return [
      '[Gumroad vs Payhip Profit Calculator]',
      'Gross sales: ' + formatCurrency(result.grossSales),
      'Recognized revenue after refunds: ' + formatCurrency(result.recognizedRevenue),
      'Gumroad net: ' + formatCurrency(result.gumroadNet),
      'Best Payhip plan: ' + result.bestPlanLabel,
      'Best Payhip net: ' + formatCurrency(result.bestPayhipNet),
      'Monthly delta vs Gumroad: ' + formatCurrency(result.bestMonthlyDelta),
      'Annual delta vs Gumroad: ' + formatCurrency(result.bestAnnualDelta),
      paybackText,
      'Processor assumption: ' + result.processorLabel,
      'Gumroad Discover share: ' + formatPercent(result.input.gumroadDiscoverSharePct, 1),
      'Planning note: Gumroad uses 10% + $0.50 direct and 30% Discover. Payhip Free/Plus/Pro use 5% / $29+2% / $99+0%, and processor fees remain separate.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors, result: null };
    }

    const input = validation.input;
    const processor = resolveProcessor(input);
    const shared = buildSharedMetrics(input);
    shared.monthlyOrders = input.monthlyOrders;
    const gumroad = calcGumroadScenario(input, shared);
    const rows = PAYHIP_PLANS.map((plan) => calcPayhipPlan(shared, processor, gumroad, plan)).map((row) => ({
      ...row,
      paybackMonths: row.deltaVsGumroad > 0 ? input.migrationCost / row.deltaVsGumroad : null,
    }));
    const bestPlan = chooseBestPlan(rows);

    const result = {
      input: Object.assign({}, input),
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      grossSales: roundTo(shared.grossSales, 2),
      refundLoss: roundTo(shared.refundLoss, 2),
      recognizedRevenue: roundTo(shared.recognizedRevenue, 2),
      directOrders: roundTo(shared.directOrders, 2),
      discoverOrders: roundTo(shared.discoverOrders, 2),
      gumroadDirectFee: roundTo(gumroad.directFee, 2),
      gumroadDiscoverFee: roundTo(gumroad.discoverFee, 2),
      gumroadFees: roundTo(gumroad.totalFees, 2),
      gumroadNet: roundTo(gumroad.net, 2),
      gumroadEffectiveFeeRatePct: roundTo(gumroad.effectiveFeeRatePct, 2),
      bestPlanId: bestPlan.id,
      bestPlanLabel: bestPlan.label,
      bestPayhipNet: roundTo(bestPlan.net, 2),
      bestPayhipFees: roundTo(bestPlan.totalFees, 2),
      bestPayhipEffectiveFeeRatePct: roundTo(bestPlan.effectiveFeeRatePct, 2),
      bestMonthlyDelta: roundTo(bestPlan.deltaVsGumroad, 2),
      bestAnnualDelta: roundTo(bestPlan.annualDeltaVsGumroad, 2),
      paybackMonths: bestPlan.deltaVsGumroad > 0 ? roundTo(input.migrationCost / bestPlan.deltaVsGumroad, 2) : null,
      planRows: rows.map((row) => ({
        id: row.id,
        label: row.label,
        transactionRatePct: roundTo(row.transactionRatePct, 2),
        monthlyFee: roundTo(row.monthlyFee, 2),
        platformVariableFee: roundTo(row.platformVariableFee, 2),
        processorVariableFee: roundTo(row.processorVariableFee, 2),
        processorFixedFee: roundTo(row.processorFixedFee, 2),
        totalFees: roundTo(row.totalFees, 2),
        net: roundTo(row.net, 2),
        effectiveFeeRatePct: roundTo(row.effectiveFeeRatePct, 2),
        deltaVsGumroad: roundTo(row.deltaVsGumroad, 2),
        annualDeltaVsGumroad: roundTo(row.annualDeltaVsGumroad, 2),
        paybackMonths: row.paybackMonths == null ? null : roundTo(row.paybackMonths, 2),
        breakEvenOrdersVsGumroad: row.breakEvenOrdersVsGumroad == null ? null : roundTo(row.breakEvenOrdersVsGumroad, 2),
        breakEvenGrossVsGumroad: row.breakEvenGrossVsGumroad == null ? null : roundTo(row.breakEvenGrossVsGumroad, 2),
      })),
      summary: '',
    };

    result.summary = buildSummary(result);
    return { ok: true, errors: [], result };
  }

  function clearNodes(nodes, text) {
    Object.values(nodes).forEach((node) => {
      if (node) node.textContent = text;
    });
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;

    const form = document.getElementById('calculatorForm');
    if (!form) return;

    const fieldIds = [
      'averageOrderValue',
      'monthlyOrders',
      'refundRatePct',
      'gumroadDiscoverSharePct',
      'processorPreset',
      'customProcessorRatePct',
      'customProcessorFlatFee',
      'migrationCost',
    ];

    const fields = Object.fromEntries(fieldIds.map((id) => [id, document.getElementById(id)]));
    const customFields = document.getElementById('customProcessorFields');
    const errorBox = document.getElementById('errorBox');
    const errorText = document.getElementById('errorText');
    const summary = document.getElementById('summary');
    const copyStatus = document.getElementById('copyStatus');
    const verdict = document.getElementById('verdict');
    const tableBody = document.getElementById('comparisonBody');

    const moneyNodes = {
      gumroadNet: document.getElementById('gumroadNet'),
      bestPayhipNet: document.getElementById('bestPayhipNet'),
      bestMonthlyDelta: document.getElementById('bestMonthlyDelta'),
      bestAnnualDelta: document.getElementById('bestAnnualDelta'),
      recognizedRevenue: document.getElementById('recognizedRevenue'),
      gumroadFees: document.getElementById('gumroadFees'),
      bestPayhipFees: document.getElementById('bestPayhipFees'),
    };

    const textNodes = {
      bestPlanLabel: document.getElementById('bestPlanLabel'),
      gumroadEffectiveFeeRatePct: document.getElementById('gumroadEffectiveFeeRatePct'),
      bestPayhipEffectiveFeeRatePct: document.getElementById('bestPayhipEffectiveFeeRatePct'),
      paybackMonths: document.getElementById('paybackMonths'),
    };

    function applyDefaults() {
      Object.entries(DEFAULT_INPUTS).forEach(([key, value]) => {
        if (fields[key]) fields[key].value = value;
      });
      syncCustomFields();
    }

    function syncCustomFields() {
      if (customFields) customFields.hidden = fields.processorPreset.value !== 'custom';
    }

    function readInput() {
      const input = {};
      Object.entries(fields).forEach(([key, field]) => {
        input[key] = field.value;
      });
      return input;
    }

    function showError(messages) {
      errorBox.hidden = false;
      errorText.textContent = messages.join(' ');
      clearNodes(moneyNodes, '—');
      clearNodes(textNodes, '—');
      verdict.textContent = 'Fix the invalid inputs to compare Gumroad and Payhip.';
      verdict.dataset.state = 'loss';
      summary.value = '';
      tableBody.innerHTML = '';
    }

    function hideError() {
      errorBox.hidden = true;
      errorText.textContent = '';
    }

    function renderTable(rows) {
      tableBody.innerHTML = rows.map((row) => `
        <tr${row.id === document.getElementById('bestPlanLabel').dataset.planId ? ' class="is-best"' : ''}>
          <td>${row.label}</td>
          <td>${formatCurrency(row.totalFees)}</td>
          <td>${formatCurrency(row.net)}</td>
          <td>${formatCurrency(row.deltaVsGumroad)}</td>
          <td>${row.paybackMonths == null ? 'N/A' : formatNumber(row.paybackMonths, 1) + ' mo'}</td>
          <td>${row.breakEvenGrossVsGumroad == null ? 'N/A' : formatCurrency(row.breakEvenGrossVsGumroad)}</td>
        </tr>
      `).join('');
    }

    function render() {
      syncCustomFields();
      const out = calculate(readInput());
      if (!out.ok) {
        showError(out.errors);
        return;
      }
      hideError();
      const r = out.result;
      moneyNodes.gumroadNet.textContent = formatCurrency(r.gumroadNet);
      moneyNodes.bestPayhipNet.textContent = formatCurrency(r.bestPayhipNet);
      moneyNodes.bestMonthlyDelta.textContent = formatCurrency(r.bestMonthlyDelta);
      moneyNodes.bestAnnualDelta.textContent = formatCurrency(r.bestAnnualDelta);
      moneyNodes.recognizedRevenue.textContent = formatCurrency(r.recognizedRevenue);
      moneyNodes.gumroadFees.textContent = formatCurrency(r.gumroadFees);
      moneyNodes.bestPayhipFees.textContent = formatCurrency(r.bestPayhipFees);

      textNodes.bestPlanLabel.textContent = r.bestPlanLabel;
      textNodes.bestPlanLabel.dataset.planId = r.bestPlanId;
      textNodes.gumroadEffectiveFeeRatePct.textContent = formatPercent(r.gumroadEffectiveFeeRatePct, 2);
      textNodes.bestPayhipEffectiveFeeRatePct.textContent = formatPercent(r.bestPayhipEffectiveFeeRatePct, 2);
      textNodes.paybackMonths.textContent = r.paybackMonths == null ? 'Not reached' : formatNumber(r.paybackMonths, 1) + ' mo';

      if (r.bestMonthlyDelta > 0) {
        verdict.textContent = r.bestPlanLabel + ' beats Gumroad by ' + formatCurrency(r.bestMonthlyDelta) + ' per month under the current assumptions.';
        verdict.dataset.state = 'win';
      } else if (r.bestMonthlyDelta === 0) {
        verdict.textContent = 'The best Payhip plan is effectively tied with Gumroad under the current assumptions.';
        verdict.dataset.state = 'warn';
      } else {
        verdict.textContent = 'Under the current assumptions, Gumroad still keeps more than any Payhip plan.';
        verdict.dataset.state = 'loss';
      }

      summary.value = r.summary;
      renderTable(r.planRows);
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);

    document.getElementById('resetDefaultsBtn').addEventListener('click', function () {
      applyDefaults();
      copyStatus.textContent = '';
      render();
    });

    document.getElementById('copySummaryBtn').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(summary.value);
        copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        copyStatus.textContent = 'Clipboard unavailable. Copy manually.';
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
    CONSTANTS,
    PAYHIP_PLANS,
    PROCESSOR_PRESETS,
    DEFAULT_INPUTS,
    toFiniteNumber,
    roundTo,
    getPlan,
    getProcessorPreset,
    resolveProcessor,
    validateInputs,
    buildSharedMetrics,
    calcGumroadScenario,
    calcPayhipPlan,
    chooseBestPlan,
    calculate,
    buildSummary,
    formatCurrency,
    formatPercent,
    formatNumber,
    initBrowser,
  };
});
