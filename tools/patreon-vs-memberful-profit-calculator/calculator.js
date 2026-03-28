(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.PatreonVsMemberfulProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONSTANTS = Object.freeze({
    PATREON_PLATFORM_RATE: 0.10,
    MEMBERFUL_MONTHLY_FEE: 49,
    MEMBERFUL_TRANSACTION_RATE: 0.049,
  });

  const PATREON_EXTRA_FEE_PRESETS = Object.freeze([
    { id: 'baseline', label: 'Planner baseline · 2.9% + $0.30', ratePct: 2.9, flatFee: 0.30 },
    { id: 'custom', label: 'Custom Patreon extra fees', ratePct: null, flatFee: null },
  ]);

  const MEMBERFUL_PROCESSOR_PRESETS = Object.freeze([
    { id: 'domestic', label: 'Stripe domestic cards · 2.9% + $0.30', ratePct: 2.9, flatFee: 0.30 },
    { id: 'international', label: 'Stripe international cards · 4.4% + $0.30', ratePct: 4.4, flatFee: 0.30 },
    { id: 'custom', label: 'Custom processor', ratePct: null, flatFee: null },
  ]);

  const DEFAULT_INPUTS = Object.freeze({
    monthlyGrossSales: 4000,
    successfulCharges: 300,
    refundRatePct: 2,
    patreonExtraFeePreset: 'baseline',
    customPatreonExtraFeeRatePct: 2.9,
    customPatreonExtraFixedFee: 0.30,
    memberfulProcessorPreset: 'domestic',
    customMemberfulProcessorRatePct: 2.9,
    customMemberfulProcessorFlatFee: 0.30,
    migrationCost: 250,
  });

  const patreonPresetMap = Object.fromEntries(PATREON_EXTRA_FEE_PRESETS.map((preset) => [preset.id, preset]));
  const memberfulPresetMap = Object.fromEntries(MEMBERFUL_PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

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

  function getPatreonPreset(presetId) {
    return patreonPresetMap[presetId] || null;
  }

  function getMemberfulPreset(presetId) {
    return memberfulPresetMap[presetId] || null;
  }

  function resolvePatreonExtraFees(input) {
    const preset = getPatreonPreset(input.patreonExtraFeePreset);
    if (!preset) return null;
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        label: preset.label,
        ratePct: input.customPatreonExtraFeeRatePct,
        flatFee: input.customPatreonExtraFixedFee,
      };
    }
    return {
      id: preset.id,
      label: preset.label,
      ratePct: preset.ratePct,
      flatFee: preset.flatFee,
    };
  }

  function resolveMemberfulProcessor(input) {
    const preset = getMemberfulPreset(input.memberfulProcessorPreset);
    if (!preset) return null;
    if (preset.id === 'custom') {
      return {
        id: 'custom',
        label: preset.label,
        ratePct: input.customMemberfulProcessorRatePct,
        flatFee: input.customMemberfulProcessorFlatFee,
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
      monthlyGrossSales: toFiniteNumber(source.monthlyGrossSales),
      successfulCharges: toFiniteNumber(source.successfulCharges),
      refundRatePct: toFiniteNumber(source.refundRatePct),
      patreonExtraFeePreset: source.patreonExtraFeePreset || DEFAULT_INPUTS.patreonExtraFeePreset,
      customPatreonExtraFeeRatePct: toFiniteNumber(source.customPatreonExtraFeeRatePct),
      customPatreonExtraFixedFee: toFiniteNumber(source.customPatreonExtraFixedFee),
      memberfulProcessorPreset: source.memberfulProcessorPreset || DEFAULT_INPUTS.memberfulProcessorPreset,
      customMemberfulProcessorRatePct: toFiniteNumber(source.customMemberfulProcessorRatePct),
      customMemberfulProcessorFlatFee: toFiniteNumber(source.customMemberfulProcessorFlatFee),
      migrationCost: toFiniteNumber(source.migrationCost),
    };

    const errors = [];

    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) {
      errors.push('monthlyGrossSales must be greater than 0.');
    }
    if (!Number.isFinite(input.successfulCharges) || input.successfulCharges <= 0 || !Number.isInteger(input.successfulCharges)) {
      errors.push('successfulCharges must be an integer greater than 0.');
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      errors.push('refundRatePct must be between 0 and less than 100.');
    }
    if (!getPatreonPreset(input.patreonExtraFeePreset)) {
      errors.push('patreonExtraFeePreset is unsupported.');
    }
    if (!Number.isFinite(input.customPatreonExtraFeeRatePct) || input.customPatreonExtraFeeRatePct < 0 || input.customPatreonExtraFeeRatePct >= 100) {
      errors.push('customPatreonExtraFeeRatePct must be between 0 and less than 100.');
    }
    if (!Number.isFinite(input.customPatreonExtraFixedFee) || input.customPatreonExtraFixedFee < 0) {
      errors.push('customPatreonExtraFixedFee must be zero or above.');
    }
    if (!getMemberfulPreset(input.memberfulProcessorPreset)) {
      errors.push('memberfulProcessorPreset is unsupported.');
    }
    if (!Number.isFinite(input.customMemberfulProcessorRatePct) || input.customMemberfulProcessorRatePct < 0 || input.customMemberfulProcessorRatePct >= 100) {
      errors.push('customMemberfulProcessorRatePct must be between 0 and less than 100.');
    }
    if (!Number.isFinite(input.customMemberfulProcessorFlatFee) || input.customMemberfulProcessorFlatFee < 0) {
      errors.push('customMemberfulProcessorFlatFee must be zero or above.');
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
    const grossSales = input.monthlyGrossSales;
    const refundRate = input.refundRatePct / 100;
    const refundLoss = grossSales * refundRate;
    const avgChargeAmount = input.successfulCharges > 0 ? grossSales / input.successfulCharges : 0;

    return {
      grossSales,
      successfulCharges: input.successfulCharges,
      refundRate,
      refundLoss,
      avgChargeAmount,
    };
  }

  function calcPatreonScenario(shared, patreonExtra) {
    const extraRate = patreonExtra.ratePct / 100;
    const platformFee = shared.grossSales * CONSTANTS.PATREON_PLATFORM_RATE;
    const extraVariableFee = shared.grossSales * extraRate;
    const extraFixedFee = shared.successfulCharges * patreonExtra.flatFee;
    const totalFees = platformFee + extraVariableFee + extraFixedFee;
    const net = shared.grossSales - shared.refundLoss - totalFees;
    const effectiveFeeRatePct = shared.grossSales > 0 ? (totalFees / shared.grossSales) * 100 : 0;
    const contributionMarginRate = shared.avgChargeAmount > 0
      ? 1 - shared.refundRate - CONSTANTS.PATREON_PLATFORM_RATE - extraRate - (patreonExtra.flatFee / shared.avgChargeAmount)
      : null;

    return {
      id: 'patreon',
      label: 'Patreon',
      extraFeeLabel: patreonExtra.label,
      extraFeeRatePct: patreonExtra.ratePct,
      extraFeeFlat: patreonExtra.flatFee,
      platformFee,
      extraVariableFee,
      extraFixedFee,
      totalFees,
      net,
      effectiveFeeRatePct,
      contributionMarginRate,
    };
  }

  function calcMemberfulScenario(shared, processor) {
    const processorRate = processor.ratePct / 100;
    const monthlyFee = CONSTANTS.MEMBERFUL_MONTHLY_FEE;
    const transactionFee = shared.grossSales * CONSTANTS.MEMBERFUL_TRANSACTION_RATE;
    const processorVariableFee = shared.grossSales * processorRate;
    const processorFixedFee = shared.successfulCharges * processor.flatFee;
    const totalFees = monthlyFee + transactionFee + processorVariableFee + processorFixedFee;
    const net = shared.grossSales - shared.refundLoss - totalFees;
    const effectiveFeeRatePct = shared.grossSales > 0 ? (totalFees / shared.grossSales) * 100 : 0;
    const contributionMarginRate = shared.avgChargeAmount > 0
      ? 1 - shared.refundRate - CONSTANTS.MEMBERFUL_TRANSACTION_RATE - processorRate - (processor.flatFee / shared.avgChargeAmount)
      : null;

    return {
      id: 'memberful',
      label: 'Memberful',
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      monthlyFee,
      transactionFee,
      processorVariableFee,
      processorFixedFee,
      totalFees,
      net,
      effectiveFeeRatePct,
      contributionMarginRate,
    };
  }

  function calcBreakEvenForMemberful(shared, patreon, memberful) {
    if (!Number.isFinite(shared.avgChargeAmount) || shared.avgChargeAmount <= 0) {
      return { grossSales: null, charges: null, marginAdvantageRate: null };
    }
    if (!Number.isFinite(patreon.contributionMarginRate) || !Number.isFinite(memberful.contributionMarginRate)) {
      return { grossSales: null, charges: null, marginAdvantageRate: null };
    }

    const marginAdvantageRate = memberful.contributionMarginRate - patreon.contributionMarginRate;
    if (!Number.isFinite(marginAdvantageRate) || marginAdvantageRate <= 0) {
      return { grossSales: null, charges: null, marginAdvantageRate };
    }

    const grossSales = CONSTANTS.MEMBERFUL_MONTHLY_FEE / marginAdvantageRate;
    const charges = grossSales / shared.avgChargeAmount;

    return {
      grossSales,
      charges,
      marginAdvantageRate,
    };
  }

  function chooseWinner(rows) {
    if (!rows || !rows.length) return null;
    return rows.slice().sort((a, b) => {
      if (b.net !== a.net) return b.net - a.net;
      return a.totalFees - b.totalFees;
    })[0];
  }

  function buildSummary(result) {
    const breakEvenText = result.breakEvenGrossForMemberful == null
      ? 'Memberful break-even vs Patreon: not reached under the current assumptions.'
      : 'Memberful break-even vs Patreon: ' + formatCurrency(result.breakEvenGrossForMemberful)
        + ' gross / ' + formatNumber(result.breakEvenChargesForMemberful, 1) + ' charges per month.';

    const paybackText = result.paybackMonths == null
      ? 'Migration payback: not reached under the current assumptions.'
      : 'Migration payback: ' + formatNumber(result.paybackMonths, 1) + ' months.';

    return [
      '[Patreon vs Memberful Profit Calculator]',
      'Gross billings: ' + formatCurrency(result.grossSales),
      'Successful charges: ' + formatNumber(result.successfulCharges, 0),
      'Refund loss: ' + formatCurrency(result.refundLoss),
      'Patreon net: ' + formatCurrency(result.patreonNet),
      'Memberful net: ' + formatCurrency(result.memberfulNet),
      'Winner: ' + result.winnerLabel,
      'Memberful delta vs Patreon: ' + formatCurrency(result.memberfulDeltaVsPatreon),
      'Annual delta: ' + formatCurrency(result.annualDeltaVsPatreon),
      paybackText,
      breakEvenText,
      'Patreon extra-fee assumption: ' + result.patreonExtraLabel,
      'Memberful processor assumption: ' + result.memberfulProcessorLabel,
      'Planning note: Patreon public pricing starts at 10% plus additional payment/currency/payout costs. Memberful public pricing is $49/month + 4.9%, with processor fees modeled separately.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors, result: null };
    }

    const input = validation.input;
    const patreonExtra = resolvePatreonExtraFees(input);
    const memberfulProcessor = resolveMemberfulProcessor(input);
    const shared = buildSharedMetrics(input);
    const patreon = calcPatreonScenario(shared, patreonExtra);
    const memberful = calcMemberfulScenario(shared, memberfulProcessor);
    const breakEven = calcBreakEvenForMemberful(shared, patreon, memberful);
    const rows = [patreon, memberful];
    const winner = chooseWinner(rows);
    const memberfulDeltaVsPatreon = memberful.net - patreon.net;
    const annualDeltaVsPatreon = memberfulDeltaVsPatreon * 12;
    const paybackMonths = memberfulDeltaVsPatreon > 0 ? input.migrationCost / memberfulDeltaVsPatreon : null;

    const result = {
      input: Object.assign({}, input),
      grossSales: roundTo(shared.grossSales, 2),
      successfulCharges: shared.successfulCharges,
      refundLoss: roundTo(shared.refundLoss, 2),
      avgChargeAmount: roundTo(shared.avgChargeAmount, 2),
      patreonExtraLabel: patreon.extraFeeLabel,
      memberfulProcessorLabel: memberful.processorLabel,
      patreonNet: roundTo(patreon.net, 2),
      memberfulNet: roundTo(memberful.net, 2),
      patreonFees: roundTo(patreon.totalFees, 2),
      memberfulFees: roundTo(memberful.totalFees, 2),
      patreonEffectiveFeeRatePct: roundTo(patreon.effectiveFeeRatePct, 2),
      memberfulEffectiveFeeRatePct: roundTo(memberful.effectiveFeeRatePct, 2),
      winnerId: winner.id,
      winnerLabel: winner.label,
      memberfulDeltaVsPatreon: roundTo(memberfulDeltaVsPatreon, 2),
      annualDeltaVsPatreon: roundTo(annualDeltaVsPatreon, 2),
      paybackMonths: paybackMonths == null ? null : roundTo(paybackMonths, 2),
      breakEvenGrossForMemberful: breakEven.grossSales == null ? null : roundTo(breakEven.grossSales, 2),
      breakEvenChargesForMemberful: breakEven.charges == null ? null : roundTo(breakEven.charges, 2),
      comparisonRows: rows.map((row) => ({
        id: row.id,
        label: row.label,
        totalFees: roundTo(row.totalFees, 2),
        net: roundTo(row.net, 2),
        effectiveFeeRatePct: roundTo(row.effectiveFeeRatePct, 2),
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
      'monthlyGrossSales',
      'successfulCharges',
      'refundRatePct',
      'patreonExtraFeePreset',
      'customPatreonExtraFeeRatePct',
      'customPatreonExtraFixedFee',
      'memberfulProcessorPreset',
      'customMemberfulProcessorRatePct',
      'customMemberfulProcessorFlatFee',
      'migrationCost',
    ];

    const fields = Object.fromEntries(fieldIds.map((id) => [id, document.getElementById(id)]));
    const patreonCustomFields = document.getElementById('patreonCustomFields');
    const memberfulCustomFields = document.getElementById('memberfulCustomFields');
    const errorBox = document.getElementById('errorBox');
    const errorText = document.getElementById('errorText');
    const copyStatus = document.getElementById('copyStatus');
    const summary = document.getElementById('summary');
    const verdict = document.getElementById('verdict');
    const tableBody = document.getElementById('comparisonBody');

    const moneyNodes = {
      patreonNet: document.getElementById('patreonNet'),
      memberfulNet: document.getElementById('memberfulNet'),
      monthlyDelta: document.getElementById('monthlyDelta'),
      annualDelta: document.getElementById('annualDelta'),
      refundLoss: document.getElementById('refundLoss'),
      patreonFees: document.getElementById('patreonFees'),
      memberfulFees: document.getElementById('memberfulFees'),
      breakEvenGross: document.getElementById('breakEvenGross'),
    };

    const textNodes = {
      winnerLabel: document.getElementById('winnerLabel'),
      paybackMonths: document.getElementById('paybackMonths'),
      patreonEffectiveFeeRate: document.getElementById('patreonEffectiveFeeRate'),
      memberfulEffectiveFeeRate: document.getElementById('memberfulEffectiveFeeRate'),
      breakEvenCharges: document.getElementById('breakEvenCharges'),
      patreonAssumption: document.getElementById('patreonAssumption'),
      memberfulAssumption: document.getElementById('memberfulAssumption'),
    };

    function applyDefaults() {
      Object.entries(DEFAULT_INPUTS).forEach(([key, value]) => {
        if (fields[key]) fields[key].value = value;
      });
      syncCustomFields();
    }

    function syncCustomFields() {
      if (patreonCustomFields) patreonCustomFields.hidden = fields.patreonExtraFeePreset.value !== 'custom';
      if (memberfulCustomFields) memberfulCustomFields.hidden = fields.memberfulProcessorPreset.value !== 'custom';
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
      verdict.textContent = 'Fix the invalid inputs to compare Patreon and Memberful.';
      verdict.dataset.state = 'loss';
      summary.value = '';
      tableBody.innerHTML = '';
    }

    function hideError() {
      errorBox.hidden = true;
      errorText.textContent = '';
    }

    function renderTable(rows, winnerId) {
      tableBody.innerHTML = rows.map((row) => `
        <tr${row.id === winnerId ? ' class="is-best"' : ''}>
          <td>${row.label}</td>
          <td>${formatCurrency(row.totalFees)}</td>
          <td>${formatCurrency(row.net)}</td>
          <td>${formatPercent(row.effectiveFeeRatePct, 2)}</td>
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

      moneyNodes.patreonNet.textContent = formatCurrency(r.patreonNet);
      moneyNodes.memberfulNet.textContent = formatCurrency(r.memberfulNet);
      moneyNodes.monthlyDelta.textContent = formatCurrency(r.memberfulDeltaVsPatreon);
      moneyNodes.annualDelta.textContent = formatCurrency(r.annualDeltaVsPatreon);
      moneyNodes.refundLoss.textContent = formatCurrency(r.refundLoss);
      moneyNodes.patreonFees.textContent = formatCurrency(r.patreonFees);
      moneyNodes.memberfulFees.textContent = formatCurrency(r.memberfulFees);
      moneyNodes.breakEvenGross.textContent = r.breakEvenGrossForMemberful == null ? 'N/A' : formatCurrency(r.breakEvenGrossForMemberful);

      textNodes.winnerLabel.textContent = r.winnerLabel;
      textNodes.paybackMonths.textContent = r.paybackMonths == null ? 'Not reached' : formatNumber(r.paybackMonths, 1) + ' mo';
      textNodes.patreonEffectiveFeeRate.textContent = formatPercent(r.patreonEffectiveFeeRatePct, 2);
      textNodes.memberfulEffectiveFeeRate.textContent = formatPercent(r.memberfulEffectiveFeeRatePct, 2);
      textNodes.breakEvenCharges.textContent = r.breakEvenChargesForMemberful == null ? 'N/A' : formatNumber(r.breakEvenChargesForMemberful, 1) + ' charges';
      textNodes.patreonAssumption.textContent = r.patreonExtraLabel;
      textNodes.memberfulAssumption.textContent = r.memberfulProcessorLabel;

      if (r.memberfulDeltaVsPatreon > 0) {
        verdict.textContent = 'Memberful keeps ' + formatCurrency(r.memberfulDeltaVsPatreon) + ' more per month than Patreon under the current assumptions.';
        verdict.dataset.state = 'win';
      } else if (r.memberfulDeltaVsPatreon === 0) {
        verdict.textContent = 'Patreon and Memberful are effectively tied under the current assumptions.';
        verdict.dataset.state = 'warn';
      } else {
        verdict.textContent = 'Patreon still keeps ' + formatCurrency(Math.abs(r.memberfulDeltaVsPatreon)) + ' more per month than Memberful under the current assumptions.';
        verdict.dataset.state = 'loss';
      }

      summary.value = r.summary;
      renderTable(r.comparisonRows, r.winnerId);
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
    PATREON_EXTRA_FEE_PRESETS,
    MEMBERFUL_PROCESSOR_PRESETS,
    DEFAULT_INPUTS,
    toFiniteNumber,
    roundTo,
    getPatreonPreset,
    getMemberfulPreset,
    resolvePatreonExtraFees,
    resolveMemberfulProcessor,
    validateInputs,
    buildSharedMetrics,
    calcPatreonScenario,
    calcMemberfulScenario,
    calcBreakEvenForMemberful,
    chooseWinner,
    buildSummary,
    calculate,
    formatCurrency,
    formatPercent,
    formatNumber,
    initBrowser,
  };
});
