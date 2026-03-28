(function (root) {
  const CONSTANTS = {
    CURRENCY: 'USD',
    HIGH_TICKET_THRESHOLD: 900,
    MAX_CHARGE_AMOUNT: 100000,
    FLAT_FEE: 0.3,
    ANNUAL_MONTHS_CHARGED: 10,
    MONTHS_IN_YEAR: 12
  };

  const PLAN_PRESETS = {
    hobby: {
      id: 'hobby',
      monthlyFee: 9,
      standardRatePct: 10,
      highTicketRatePct: 10,
      flatFee: CONSTANTS.FLAT_FEE,
      label: { en: 'Hobby · $9/mo', ko: 'Hobby · $9/월' }
    },
    pro: {
      id: 'pro',
      monthlyFee: 99,
      standardRatePct: 2.9,
      highTicketRatePct: 3.9,
      flatFee: CONSTANTS.FLAT_FEE,
      label: { en: 'Pro · $99/mo', ko: 'Pro · $99/월' }
    }
  };

  const DEFAULTS = {
    subscriptionPrice: 99,
    billedMembers: 80,
    refundRatePct: 2,
    planTier: 'pro',
    planBilling: 'monthly',
    otherMonthlyCost: 500,
    desiredMonthlyNetProfit: 5000
  };

  const TEXT = {
    invalid: 'Please review your inputs.',
    price: 'Subscription price must be greater than zero and no more than $100,000.',
    members: 'Billed members must be a whole number greater than zero.',
    refund: 'Refund rate must be 0 or above and below 100%.',
    tier: 'Unsupported Skool tier.',
    billing: 'Unsupported Skool billing mode.',
    other: 'Other monthly cost must be 0 or above.',
    target: 'Desired monthly net profit must be 0 or above.',
    copied: 'Summary copied.',
    copyFail: 'Clipboard unavailable. Please copy manually.',
    statusGood: 'Your current Skool setup is profitable under these assumptions.',
    statusWarn: 'Your current Skool setup is underwater. Re-check price, refunds, or fixed costs.',
    na: 'N/A'
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalizeInput(input) {
    return {
      subscriptionPrice: Number(input.subscriptionPrice),
      billedMembers: Number(input.billedMembers),
      refundRatePct: Number(input.refundRatePct),
      planTier: input.planTier || DEFAULTS.planTier,
      planBilling: input.planBilling || DEFAULTS.planBilling,
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlanPreset(input, tierOverride) {
    const tier = tierOverride || input.planTier;
    return PLAN_PRESETS[tier] || null;
  }

  function resolvePlanMonthlyFee(input, tierOverride) {
    const plan = getPlanPreset(input, tierOverride);
    if (!plan) {
      return null;
    }
    return input.planBilling === 'annual'
      ? (plan.monthlyFee * CONSTANTS.ANNUAL_MONTHS_CHARGED) / CONSTANTS.MONTHS_IN_YEAR
      : plan.monthlyFee;
  }

  function resolveTransactionRatePct(input, tierOverride) {
    const plan = getPlanPreset(input, tierOverride);
    if (!plan) {
      return null;
    }
    if (plan.id === 'pro' && Number(input.subscriptionPrice) >= CONSTANTS.HIGH_TICKET_THRESHOLD) {
      return plan.highTicketRatePct;
    }
    return plan.standardRatePct;
  }

  function resolvePlanConfig(input, tierOverride) {
    const plan = getPlanPreset(input, tierOverride);
    if (!plan) {
      return null;
    }

    const monthlyPlanFee = resolvePlanMonthlyFee(input, tierOverride);
    const transactionRatePct = resolveTransactionRatePct(input, tierOverride);

    return {
      id: plan.id,
      label: plan.label,
      monthlyPlanFee,
      transactionRatePct,
      flatFee: plan.flatFee,
      transactionFeeLabel: `${transactionRatePct.toFixed(1)}% + $0.30`
    };
  }

  function validate(input) {
    if (!Number.isFinite(input.subscriptionPrice) || input.subscriptionPrice <= 0 || input.subscriptionPrice > CONSTANTS.MAX_CHARGE_AMOUNT) {
      return TEXT.price;
    }
    if (!Number.isFinite(input.billedMembers) || input.billedMembers <= 0 || !Number.isInteger(input.billedMembers)) {
      return TEXT.members;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return TEXT.refund;
    }
    if (!getPlanPreset(input)) {
      return TEXT.tier;
    }
    if (!['monthly', 'annual'].includes(input.planBilling)) {
      return TEXT.billing;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return TEXT.other;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return TEXT.target;
    }
    return '';
  }

  function evaluateScenario(input, overrides) {
    const planConfig = overrides && overrides.planConfig
      ? overrides.planConfig
      : resolvePlanConfig(input, overrides && overrides.planTier);

    const gross = overrides && overrides.gross != null
      ? Number(overrides.gross)
      : input.subscriptionPrice * input.billedMembers;

    const billedMembers = overrides && overrides.billedMembers != null
      ? Number(overrides.billedMembers)
      : input.billedMembers;

    const refundRate = input.refundRatePct / 100;
    const transactionRate = planConfig.transactionRatePct / 100;
    const refundLoss = gross * refundRate;
    const transactionFees = gross * transactionRate + billedMembers * planConfig.flatFee;
    const takeHomeAfterSkool = gross - refundLoss - transactionFees - planConfig.monthlyPlanFee;
    const monthlyNetProfit = takeHomeAfterSkool - input.otherMonthlyCost;
    const effectiveSkoolFeeRate = gross > 0
      ? (transactionFees + planConfig.monthlyPlanFee) / gross
      : 0;
    const contributionPerMember = input.subscriptionPrice * (1 - refundRate - transactionRate) - planConfig.flatFee;

    return {
      gross,
      billedMembers,
      refundRate,
      transactionRate,
      refundLoss,
      transactionFees,
      takeHomeAfterSkool,
      monthlyNetProfit,
      annualizedNetProfit: monthlyNetProfit * 12,
      effectiveSkoolFeeRate,
      effectiveSkoolFeeRatePct: effectiveSkoolFeeRate * 100,
      contributionPerMember,
      averageNetPerMember: billedMembers > 0 ? monthlyNetProfit / billedMembers : null,
      planMonthlyFee: planConfig.monthlyPlanFee,
      transactionFeeLabel: planConfig.transactionFeeLabel
    };
  }

  function findRequiredMembers(input, targetNet, overrides) {
    const planConfig = overrides && overrides.planConfig
      ? overrides.planConfig
      : resolvePlanConfig(input, overrides && overrides.planTier);

    const evaluated = evaluateScenario(input, { planConfig });
    if (!Number.isFinite(evaluated.contributionPerMember) || evaluated.contributionPerMember <= 0) {
      return null;
    }

    return (planConfig.monthlyPlanFee + input.otherMonthlyCost + (Number(targetNet) || 0)) / evaluated.contributionPerMember;
  }

  function findUpgradeBreakEvenGross(input) {
    const hobby = resolvePlanConfig(input, 'hobby');
    const pro = resolvePlanConfig(input, 'pro');
    if (!hobby || !pro) {
      return null;
    }

    const fixedDiff = pro.monthlyPlanFee - hobby.monthlyPlanFee;
    const rateDiff = (hobby.transactionRatePct / 100) - (pro.transactionRatePct / 100);
    if (!Number.isFinite(rateDiff) || rateDiff <= 0) {
      return null;
    }
    return fixedDiff / rateDiff;
  }

  function buildComparisonRows(input) {
    return ['hobby', 'pro'].map((tierId) => {
      const planConfig = resolvePlanConfig(input, tierId);
      const evaluated = evaluateScenario(input, { planConfig });
      return {
        id: tierId,
        label: planConfig.label.en,
        monthlyPlanFee: round2(planConfig.monthlyPlanFee),
        transactionRatePct: round2(planConfig.transactionRatePct),
        transactionFeeLabel: planConfig.transactionFeeLabel,
        transactionFees: round2(evaluated.transactionFees),
        takeHomeAfterSkool: round2(evaluated.takeHomeAfterSkool),
        monthlyNetProfit: round2(evaluated.monthlyNetProfit)
      };
    });
  }

  function pickRecommendedPlan(rows) {
    return rows.reduce((best, row) => {
      if (!best || row.monthlyNetProfit > best.monthlyNetProfit) {
        return row;
      }
      return best;
    }, null);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: CONSTANTS.CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    return `${round2(value).toFixed(2)}%`;
  }

  function buildSummary(result) {
    const lines = [
      '[Skool Fee Calculator Summary]',
      `Selected plan: ${result.planLabel}`,
      `Billing mode: ${result.inputs.planBilling}`,
      `Subscription price: ${formatMoney(result.inputs.subscriptionPrice)}`,
      `Billed members: ${formatNumber(result.inputs.billedMembers)}`,
      `Monthly gross sales: ${formatMoney(result.monthlyGrossSales)}`,
      `Transaction fee rate used: ${result.transactionFeeLabel}`,
      `Skool transaction fees: ${formatMoney(result.skoolTransactionFees)}`,
      `Refund loss: ${formatMoney(result.refundLoss)}`,
      `Fixed plan cost: ${formatMoney(result.planFixedFee)}`,
      `Take-home after Skool: ${formatMoney(result.takeHomeAfterSkool)}`,
      `Monthly net profit: ${formatMoney(result.monthlyNetProfit)}`,
      `Break-even billed members: ${result.breakEvenMembers == null ? TEXT.na : formatNumber(result.breakEvenMembers)}`,
      `Required billed members for target net: ${result.requiredMembersForTargetNet == null ? TEXT.na : formatNumber(result.requiredMembersForTargetNet)}`,
      `Hobby→Pro upgrade break-even gross: ${result.upgradeBreakEvenGross == null ? TEXT.na : formatMoney(result.upgradeBreakEvenGross)}`,
      `Hobby→Pro upgrade break-even billed members: ${result.upgradeBreakEvenMembers == null ? TEXT.na : formatNumber(result.upgradeBreakEvenMembers)}`,
      `Recommended plan: ${result.recommendedPlan}`
    ];

    return lines.join('\n');
  }

  function calculate(input) {
    const normalized = normalizeInput(input);
    const error = validate(normalized);
    if (error) {
      return { result: null, error };
    }

    const planConfig = resolvePlanConfig(normalized);
    const evaluated = evaluateScenario(normalized, { planConfig });
    const breakEvenMembers = findRequiredMembers(normalized, 0, { planConfig });
    const requiredMembersForTargetNet = findRequiredMembers(normalized, normalized.desiredMonthlyNetProfit, { planConfig });
    const upgradeBreakEvenGross = findUpgradeBreakEvenGross(normalized);
    const upgradeBreakEvenMembers = upgradeBreakEvenGross == null ? null : upgradeBreakEvenGross / normalized.subscriptionPrice;
    const comparisonRows = buildComparisonRows(normalized);
    const recommended = pickRecommendedPlan(comparisonRows);
    const targetGapMembers = requiredMembersForTargetNet == null
      ? null
      : Math.max(requiredMembersForTargetNet - normalized.billedMembers, 0);

    const result = {
      inputs: normalized,
      planLabel: planConfig.label.en,
      planFixedFee: round2(planConfig.monthlyPlanFee),
      transactionRatePct: round2(planConfig.transactionRatePct),
      transactionFeeLabel: planConfig.transactionFeeLabel,
      monthlyGrossSales: round2(evaluated.gross),
      skoolTransactionFees: round2(evaluated.transactionFees),
      refundLoss: round2(evaluated.refundLoss),
      takeHomeAfterSkool: round2(evaluated.takeHomeAfterSkool),
      monthlyNetProfit: round2(evaluated.monthlyNetProfit),
      annualizedNetProfit: round2(evaluated.annualizedNetProfit),
      effectiveSkoolFeeRatePct: round2(evaluated.effectiveSkoolFeeRatePct),
      contributionPerMember: round2(evaluated.contributionPerMember),
      averageNetPerMember: round2(evaluated.averageNetPerMember),
      breakEvenMembers: breakEvenMembers == null ? null : round2(breakEvenMembers),
      requiredMembersForTargetNet: requiredMembersForTargetNet == null ? null : round2(requiredMembersForTargetNet),
      upgradeBreakEvenGross: upgradeBreakEvenGross == null ? null : round2(upgradeBreakEvenGross),
      upgradeBreakEvenMembers: upgradeBreakEvenMembers == null ? null : round2(upgradeBreakEvenMembers),
      targetGapMembers: targetGapMembers == null ? null : round2(targetGapMembers),
      comparisonRows,
      recommendedPlanId: recommended.id,
      recommendedPlan: recommended.label
    };

    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  const api = {
    CONSTANTS,
    PLAN_PRESETS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPlanPreset,
    resolvePlanMonthlyFee,
    resolveTransactionRatePct,
    resolvePlanConfig,
    validate,
    evaluateScenario,
    findRequiredMembers,
    findUpgradeBreakEvenGross,
    buildComparisonRows,
    pickRecommendedPlan,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.SkoolFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const fieldIds = [
    'subscriptionPrice',
    'billedMembers',
    'refundRatePct',
    'planTier',
    'planBilling',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit'
  ];

  const outputIds = [
    'monthlyGrossSales',
    'takeHomeAfterSkool',
    'monthlyNetProfit',
    'effectiveSkoolFeeRatePct',
    'breakEvenMembers',
    'requiredMembersForTargetNet',
    'planFixedFee',
    'transactionRateUsed',
    'skoolTransactionFees',
    'refundLoss',
    'annualizedNetProfit',
    'upgradeBreakEvenGross',
    'upgradeBreakEvenMembers',
    'targetGapMembers',
    'recommendedPlan'
  ];

  const els = Object.fromEntries([
    ...fieldIds,
    ...outputIds,
    'status',
    'error',
    'summary',
    'comparisonBody',
    'copyBtn',
    'resetBtn'
  ].map((id) => [id, document.getElementById(id)]));

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (els[key]) {
        els[key].value = value;
      }
    });
  }

  function collectInput() {
    return {
      subscriptionPrice: els.subscriptionPrice.value,
      billedMembers: els.billedMembers.value,
      refundRatePct: els.refundRatePct.value,
      planTier: els.planTier.value,
      planBilling: els.planBilling.value,
      otherMonthlyCost: els.otherMonthlyCost.value,
      desiredMonthlyNetProfit: els.desiredMonthlyNetProfit.value
    };
  }

  function clearOutputs() {
    outputIds.forEach((id) => {
      if (els[id]) {
        els[id].textContent = '—';
      }
    });
    els.summary.value = '';
    els.comparisonBody.innerHTML = '';
  }

  function renderComparison(rows) {
    els.comparisonBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.label}</td>
        <td>${formatMoney(row.monthlyPlanFee)}</td>
        <td>${row.transactionFeeLabel}</td>
        <td>${formatMoney(row.transactionFees)}</td>
        <td>${formatMoney(row.takeHomeAfterSkool)}</td>
        <td class="${row.monthlyNetProfit >= 0 ? 'good' : 'warn'}">${formatMoney(row.monthlyNetProfit)}</td>
      </tr>
    `).join('');
  }

  function render() {
    const { result, error } = calculate(collectInput());

    if (error) {
      els.error.textContent = error || TEXT.invalid;
      els.error.classList.add('show');
      els.status.textContent = TEXT.invalid;
      els.status.className = 'status warn';
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.status.textContent = result.monthlyNetProfit >= 0
      ? `${TEXT.statusGood} ${result.recommendedPlan} is currently the stronger plan.`
      : TEXT.statusWarn;
    els.status.className = `status ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;

    els.monthlyGrossSales.textContent = formatMoney(result.monthlyGrossSales);
    els.takeHomeAfterSkool.textContent = formatMoney(result.takeHomeAfterSkool);
    els.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit);
    els.effectiveSkoolFeeRatePct.textContent = formatPercent(result.effectiveSkoolFeeRatePct);
    els.breakEvenMembers.textContent = result.breakEvenMembers == null ? TEXT.na : formatNumber(result.breakEvenMembers);
    els.requiredMembersForTargetNet.textContent = result.requiredMembersForTargetNet == null ? TEXT.na : formatNumber(result.requiredMembersForTargetNet);
    els.planFixedFee.textContent = formatMoney(result.planFixedFee);
    els.transactionRateUsed.textContent = result.transactionFeeLabel;
    els.skoolTransactionFees.textContent = formatMoney(result.skoolTransactionFees);
    els.refundLoss.textContent = formatMoney(result.refundLoss);
    els.annualizedNetProfit.textContent = formatMoney(result.annualizedNetProfit);
    els.upgradeBreakEvenGross.textContent = result.upgradeBreakEvenGross == null ? TEXT.na : formatMoney(result.upgradeBreakEvenGross);
    els.upgradeBreakEvenMembers.textContent = result.upgradeBreakEvenMembers == null ? TEXT.na : formatNumber(result.upgradeBreakEvenMembers);
    els.targetGapMembers.textContent = result.targetGapMembers == null ? TEXT.na : formatNumber(result.targetGapMembers);
    els.recommendedPlan.textContent = result.recommendedPlan;
    els.summary.value = result.summary;
    renderComparison(result.comparisonRows);
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      const eventName = els[id].tagName === 'SELECT' ? 'change' : 'input';
      els[id].addEventListener(eventName, render);
    });

    els.copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(els.summary.value);
        els.status.textContent = TEXT.copied;
        els.status.className = 'status good';
      } catch (error) {
        els.status.textContent = TEXT.copyFail;
        els.status.className = 'status warn';
      }
    });

    els.resetBtn.addEventListener('click', () => {
      applyDefaults();
      render();
    });
  }

  applyDefaults();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
