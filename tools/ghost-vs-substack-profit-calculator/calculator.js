(function (root) {
  const GHOST_PLANS = {
    starter: { fee: 18, label: 'Starter · $18/mo' },
    publisher: { fee: 29, label: 'Publisher · $29/mo' },
    business: { fee: 199, label: 'Business · $199/mo' }
  };

  const CONSTANTS = {
    GHOST_TRANSACTION_FEE_PCT: 0,
    SUBSTACK_PLATFORM_FEE_PCT: 10,
    DEFAULT_RECURRING_FEE_PCT: 0.7,
    CURRENCY: 'USD'
  };

  const DEFAULTS = {
    paidSubscribers: 1000,
    monthlyPrice: 5,
    monthlyChargeEvents: 1000,
    refundRatePct: 2,
    ghostPlan: 'publisher',
    processorRatePct: 2.9,
    processorFixedFee: 0.30,
    includeRecurringFee: true,
    substackRecurringFeePct: 0.7,
    targetAnnualSavings: 6000
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toBoolean(value) {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
  }

  function normalizeInput(input) {
    return {
      paidSubscribers: Number(input.paidSubscribers),
      monthlyPrice: Number(input.monthlyPrice),
      monthlyChargeEvents: Number(input.monthlyChargeEvents),
      refundRatePct: Number(input.refundRatePct),
      ghostPlan: input.ghostPlan || DEFAULTS.ghostPlan,
      processorRatePct: Number(input.processorRatePct),
      processorFixedFee: Number(input.processorFixedFee),
      includeRecurringFee: toBoolean(input.includeRecurringFee),
      substackRecurringFeePct: Number(input.substackRecurringFeePct),
      targetAnnualSavings: Number(input.targetAnnualSavings)
    };
  }

  function getGhostPlan(planId) {
    return GHOST_PLANS[planId] || null;
  }

  function validate(input) {
    if (!Number.isInteger(input.paidSubscribers) || input.paidSubscribers < 1) {
      return 'Paid subscribers must be an integer greater than or equal to 1.';
    }
    if (!Number.isFinite(input.monthlyPrice) || input.monthlyPrice <= 0) {
      return 'Monthly price must be greater than 0.';
    }
    if (!Number.isInteger(input.monthlyChargeEvents) || input.monthlyChargeEvents < 1) {
      return 'Monthly charge events must be an integer greater than or equal to 1.';
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return 'Refund rate must be 0 or above and below 100%.';
    }
    if (!getGhostPlan(input.ghostPlan)) {
      return 'Unsupported Ghost plan.';
    }
    if (!Number.isFinite(input.processorRatePct) || input.processorRatePct < 0 || input.processorRatePct >= 100) {
      return 'Processor rate must be 0 or above and below 100%.';
    }
    if (!Number.isFinite(input.processorFixedFee) || input.processorFixedFee < 0) {
      return 'Processor fixed fee must be 0 or above.';
    }
    if (!Number.isFinite(input.substackRecurringFeePct) || input.substackRecurringFeePct < 0 || input.substackRecurringFeePct >= 100) {
      return 'Substack recurring fee must be 0 or above and below 100%.';
    }
    if (!Number.isFinite(input.targetAnnualSavings) || input.targetAnnualSavings < 0) {
      return 'Target annual savings must be 0 or above.';
    }
    return '';
  }

  function evaluateScenario(input, planId) {
    const plan = getGhostPlan(planId || input.ghostPlan);
    const grossMonthlyRevenue = input.paidSubscribers * input.monthlyPrice;
    const refundLoss = grossMonthlyRevenue * (input.refundRatePct / 100);
    const processorFees = grossMonthlyRevenue * (input.processorRatePct / 100) + input.monthlyChargeEvents * input.processorFixedFee;
    const substackPlatformFee = grossMonthlyRevenue * (CONSTANTS.SUBSTACK_PLATFORM_FEE_PCT / 100);
    const recurringRate = input.includeRecurringFee ? (input.substackRecurringFeePct / 100) : 0;
    const substackRecurringFee = grossMonthlyRevenue * recurringRate;
    const ghostMonthlyNet = grossMonthlyRevenue - refundLoss - processorFees - plan.fee;
    const substackMonthlyNet = grossMonthlyRevenue - refundLoss - processorFees - substackPlatformFee - substackRecurringFee;
    const monthlySavingsWithGhost = ghostMonthlyNet - substackMonthlyNet;
    const annualGhostNet = ghostMonthlyNet * 12;
    const annualSubstackNet = substackMonthlyNet * 12;
    const annualSavingsWithGhost = monthlySavingsWithGhost * 12;
    const effectiveDeltaRate = (CONSTANTS.SUBSTACK_PLATFORM_FEE_PCT / 100) + recurringRate;
    const breakEvenMonthlyRevenue = effectiveDeltaRate > 0 ? plan.fee / effectiveDeltaRate : null;
    const breakEvenSubscribers = breakEvenMonthlyRevenue != null ? breakEvenMonthlyRevenue / input.monthlyPrice : null;
    const requiredSubscribersForTargetAnnualSavings = effectiveDeltaRate > 0
      ? ((plan.fee + (input.targetAnnualSavings / 12)) / effectiveDeltaRate) / input.monthlyPrice
      : null;
    const ghostEffectiveFeeRatePct = grossMonthlyRevenue > 0
      ? ((processorFees + plan.fee) / grossMonthlyRevenue) * 100
      : 0;
    const substackEffectiveFeeRatePct = grossMonthlyRevenue > 0
      ? ((processorFees + substackPlatformFee + substackRecurringFee) / grossMonthlyRevenue) * 100
      : 0;

    return {
      planId: planId || input.ghostPlan,
      ghostPlanLabel: plan.label,
      ghostPlanCost: plan.fee,
      grossMonthlyRevenue,
      refundLoss,
      processorFees,
      substackPlatformFee,
      substackRecurringFee,
      ghostMonthlyNet,
      substackMonthlyNet,
      annualGhostNet,
      annualSubstackNet,
      monthlySavingsWithGhost,
      annualSavingsWithGhost,
      breakEvenMonthlyRevenue,
      breakEvenSubscribers,
      requiredSubscribersForTargetAnnualSavings,
      ghostEffectiveFeeRatePct,
      substackEffectiveFeeRatePct,
      effectiveDeltaRatePct: effectiveDeltaRate * 100
    };
  }

  function buildPlanRows(input) {
    return Object.keys(GHOST_PLANS).map((planId) => {
      const row = evaluateScenario(input, planId);
      return {
        planId,
        ghostPlanLabel: row.ghostPlanLabel,
        ghostPlanCost: round2(row.ghostPlanCost),
        monthlySavingsWithGhost: round2(row.monthlySavingsWithGhost),
        annualSavingsWithGhost: round2(row.annualSavingsWithGhost),
        breakEvenMonthlyRevenue: row.breakEvenMonthlyRevenue == null ? null : round2(row.breakEvenMonthlyRevenue),
        breakEvenSubscribers: row.breakEvenSubscribers == null ? null : round2(row.breakEvenSubscribers)
      };
    });
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: CONSTANTS.CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function buildSummary(result) {
    return [
      '[Ghost vs Substack Profit Calculator Summary]',
      `Paid subscribers: ${result.inputs.paidSubscribers}`,
      `Monthly price: ${formatMoney(result.inputs.monthlyPrice)}`,
      `Monthly charge events: ${result.inputs.monthlyChargeEvents}`,
      `Ghost transaction fee: 0.00%`,
      `Substack platform fee: 10.00%`,
      `Recurring fee modeled: ${result.inputs.includeRecurringFee ? formatPercent(result.inputs.substackRecurringFeePct) : 'Off'}`,
      `Ghost plan: ${result.ghostPlanLabel}`,
      `Gross monthly revenue: ${formatMoney(result.grossMonthlyRevenue)}`,
      `Processor fees: ${formatMoney(result.processorFees)}`,
      `Ghost monthly net: ${formatMoney(result.ghostMonthlyNet)}`,
      `Substack monthly net: ${formatMoney(result.substackMonthlyNet)}`,
      `Annual savings with Ghost: ${formatMoney(result.annualSavingsWithGhost)}`,
      `Break-even subscribers: ${result.breakEvenSubscribers == null ? 'N/A' : result.breakEvenSubscribers.toFixed(2)}`,
      `Subscribers needed for target annual savings: ${result.requiredSubscribersForTargetAnnualSavings == null ? 'N/A' : result.requiredSubscribersForTargetAnnualSavings.toFixed(2)}`,
      'Scope note: this is a planning model. It excludes taxes, migration labor, sponsorship revenue, and discovery/network effects.'
    ].join('\n');
  }

  function calculate(rawInput) {
    const normalized = normalizeInput(rawInput);
    const error = validate(normalized);
    if (error) {
      return { result: null, error };
    }

    const scenario = evaluateScenario(normalized, normalized.ghostPlan);
    const result = {
      inputs: normalized,
      ghostPlanLabel: scenario.ghostPlanLabel,
      ghostPlanCost: round2(scenario.ghostPlanCost),
      grossMonthlyRevenue: round2(scenario.grossMonthlyRevenue),
      refundLoss: round2(scenario.refundLoss),
      processorFees: round2(scenario.processorFees),
      substackPlatformFee: round2(scenario.substackPlatformFee),
      substackRecurringFee: round2(scenario.substackRecurringFee),
      ghostMonthlyNet: round2(scenario.ghostMonthlyNet),
      substackMonthlyNet: round2(scenario.substackMonthlyNet),
      annualGhostNet: round2(scenario.annualGhostNet),
      annualSubstackNet: round2(scenario.annualSubstackNet),
      monthlySavingsWithGhost: round2(scenario.monthlySavingsWithGhost),
      annualSavingsWithGhost: round2(scenario.annualSavingsWithGhost),
      breakEvenMonthlyRevenue: scenario.breakEvenMonthlyRevenue == null ? null : round2(scenario.breakEvenMonthlyRevenue),
      breakEvenSubscribers: scenario.breakEvenSubscribers == null ? null : round2(scenario.breakEvenSubscribers),
      requiredSubscribersForTargetAnnualSavings: scenario.requiredSubscribersForTargetAnnualSavings == null ? null : round2(scenario.requiredSubscribersForTargetAnnualSavings),
      ghostEffectiveFeeRatePct: round2(scenario.ghostEffectiveFeeRatePct),
      substackEffectiveFeeRatePct: round2(scenario.substackEffectiveFeeRatePct),
      effectiveDeltaRatePct: round2(scenario.effectiveDeltaRatePct),
      planRows: buildPlanRows(normalized)
    };
    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  const api = {
    GHOST_PLANS,
    CONSTANTS,
    DEFAULTS,
    normalizeInput,
    getGhostPlan,
    validate,
    evaluateScenario,
    buildPlanRows,
    buildSummary,
    calculate,
    formatMoney,
    formatPercent
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.GhostVsSubstackCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const inputIds = [
    'paidSubscribers',
    'monthlyPrice',
    'monthlyChargeEvents',
    'refundRatePct',
    'ghostPlan',
    'processorRatePct',
    'processorFixedFee',
    'substackRecurringFeePct',
    'targetAnnualSavings'
  ];

  const els = {
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    summary: document.getElementById('summary'),
    includeRecurringFee: document.getElementById('includeRecurringFee'),
    planRows: document.getElementById('planRows')
  };

  inputIds.forEach((id) => {
    els[id] = document.getElementById(id);
  });

  [
    'grossMonthlyRevenue',
    'processorFees',
    'refundLoss',
    'substackPlatformFee',
    'substackRecurringFee',
    'ghostPlanCost',
    'ghostMonthlyNet',
    'substackMonthlyNet',
    'annualGhostNet',
    'annualSubstackNet',
    'annualSavingsWithGhost',
    'monthlySavingsWithGhost',
    'breakEvenSubscribers',
    'requiredSubscribersForTargetAnnualSavings',
    'ghostEffectiveFeeRatePct',
    'substackEffectiveFeeRatePct'
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (key === 'includeRecurringFee') {
        els.includeRecurringFee.checked = Boolean(value);
      } else if (els[key]) {
        els[key].value = value;
      }
    });
  }

  function collectInput() {
    return {
      paidSubscribers: els.paidSubscribers.value,
      monthlyPrice: els.monthlyPrice.value,
      monthlyChargeEvents: els.monthlyChargeEvents.value,
      refundRatePct: els.refundRatePct.value,
      ghostPlan: els.ghostPlan.value,
      processorRatePct: els.processorRatePct.value,
      processorFixedFee: els.processorFixedFee.value,
      includeRecurringFee: els.includeRecurringFee.checked,
      substackRecurringFeePct: els.substackRecurringFeePct.value,
      targetAnnualSavings: els.targetAnnualSavings.value
    };
  }

  function formatNullableMoney(value) {
    return value == null ? 'N/A' : formatMoney(value);
  }

  function formatNullableNumber(value, suffix) {
    return value == null ? 'N/A' : `${value.toFixed(2)}${suffix || ''}`;
  }

  function clearOutputs() {
    [
      'grossMonthlyRevenue',
      'processorFees',
      'refundLoss',
      'substackPlatformFee',
      'substackRecurringFee',
      'ghostPlanCost',
      'ghostMonthlyNet',
      'substackMonthlyNet',
      'annualGhostNet',
      'annualSubstackNet',
      'annualSavingsWithGhost',
      'monthlySavingsWithGhost',
      'breakEvenSubscribers',
      'requiredSubscribersForTargetAnnualSavings',
      'ghostEffectiveFeeRatePct',
      'substackEffectiveFeeRatePct'
    ].forEach((id) => {
      if (els[id]) els[id].textContent = '—';
    });
    els.planRows.innerHTML = '';
    els.summary.value = '';
  }

  function renderPlanRows(rows) {
    els.planRows.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.ghostPlanLabel}</td>
        <td>${formatMoney(row.ghostPlanCost)}</td>
        <td class="${row.monthlySavingsWithGhost >= 0 ? 'good' : 'warn'}">${formatMoney(row.monthlySavingsWithGhost)}</td>
        <td>${formatNullableMoney(row.breakEvenMonthlyRevenue)}</td>
        <td>${formatNullableNumber(row.breakEvenSubscribers)}</td>
      </tr>
    `).join('');
  }

  function render() {
    const { result, error } = calculate(collectInput());
    if (error) {
      els.error.textContent = error;
      els.error.hidden = false;
      els.status.textContent = 'Review the inputs to compare Ghost and Substack.';
      clearOutputs();
      return;
    }

    els.error.hidden = true;
    els.grossMonthlyRevenue.textContent = formatMoney(result.grossMonthlyRevenue);
    els.processorFees.textContent = formatMoney(result.processorFees);
    els.refundLoss.textContent = formatMoney(result.refundLoss);
    els.substackPlatformFee.textContent = formatMoney(result.substackPlatformFee);
    els.substackRecurringFee.textContent = formatMoney(result.substackRecurringFee);
    els.ghostPlanCost.textContent = formatMoney(result.ghostPlanCost);
    els.ghostMonthlyNet.textContent = formatMoney(result.ghostMonthlyNet);
    els.substackMonthlyNet.textContent = formatMoney(result.substackMonthlyNet);
    els.annualGhostNet.textContent = formatMoney(result.annualGhostNet);
    els.annualSubstackNet.textContent = formatMoney(result.annualSubstackNet);
    els.annualSavingsWithGhost.textContent = formatMoney(result.annualSavingsWithGhost);
    els.monthlySavingsWithGhost.textContent = formatMoney(result.monthlySavingsWithGhost);
    els.breakEvenSubscribers.textContent = formatNullableNumber(result.breakEvenSubscribers, ' subscribers');
    els.requiredSubscribersForTargetAnnualSavings.textContent = formatNullableNumber(result.requiredSubscribersForTargetAnnualSavings, ' subscribers');
    els.ghostEffectiveFeeRatePct.textContent = formatPercent(result.ghostEffectiveFeeRatePct);
    els.substackEffectiveFeeRatePct.textContent = formatPercent(result.substackEffectiveFeeRatePct);
    els.summary.value = result.summary;
    renderPlanRows(result.planRows);

    if (result.monthlySavingsWithGhost > 0) {
      els.status.textContent = `Ghost wins by ${formatMoney(result.monthlySavingsWithGhost)} / month under these assumptions.`;
      els.status.className = 'status good';
    } else if (result.monthlySavingsWithGhost < 0) {
      els.status.textContent = `Substack stays cheaper until you reach roughly ${formatNullableNumber(result.breakEvenSubscribers)} paid subscribers.`;
      els.status.className = 'status warn';
    } else {
      els.status.textContent = 'You are effectively at break-even between the two platforms.';
      els.status.className = 'status';
    }
  }

  inputIds.forEach((id) => {
    const eventName = els[id].tagName === 'SELECT' ? 'change' : 'input';
    els[id].addEventListener(eventName, render);
  });
  els.includeRecurringFee.addEventListener('change', render);

  els.copyBtn.addEventListener('click', async () => {
    try {
      if (!els.summary.value) render();
      await navigator.clipboard.writeText(els.summary.value);
      els.status.textContent = 'Summary copied.';
      els.status.className = 'status good';
    } catch (_error) {
      els.status.textContent = 'Clipboard unavailable. Copy manually.';
      els.status.className = 'status warn';
    }
  });

  els.resetBtn.addEventListener('click', () => {
    applyDefaults();
    render();
  });

  applyDefaults();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
