(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.FourthwallFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = {
    revenueMode: 'membership',
    planTier: 'free',
    pricePerTransaction: 10,
    monthlyTransactions: 100,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 1000,
  };

  const VALID_REVENUE_MODES = new Set(['membership', 'digital', 'donation']);
  const VALID_PLAN_TIERS = new Set(['free', 'pro']);

  const MODE_LABELS = {
    membership: 'Membership',
    digital: 'Digital product',
    donation: 'Donation / tip',
  };

  const PLAN_LABELS = {
    free: 'Free',
    pro: 'Pro',
  };

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULTS, rawInput || {});
  }

  function normalizeInput(rawInput) {
    const input = mergeWithDefaults(rawInput);
    return {
      revenueMode: String(input.revenueMode || '').trim(),
      planTier: String(input.planTier || '').trim(),
      pricePerTransaction: toFiniteNumber(input.pricePerTransaction),
      monthlyTransactions: toFiniteNumber(input.monthlyTransactions),
      processingRatePct: toFiniteNumber(input.processingRatePct),
      processingFixedFee: toFiniteNumber(input.processingFixedFee),
      targetMonthlyNet: toFiniteNumber(input.targetMonthlyNet),
    };
  }

  function getPlatformRate(input) {
    if (!input || !VALID_REVENUE_MODES.has(input.revenueMode) || !VALID_PLAN_TIERS.has(input.planTier)) {
      return null;
    }

    if (input.revenueMode === 'membership') {
      return 0.05;
    }
    if (input.revenueMode === 'digital') {
      return input.planTier === 'pro' ? 0 : 0.05;
    }
    return 0;
  }

  function getModeExplanation(input) {
    if (!input || !VALID_REVENUE_MODES.has(input.revenueMode)) {
      return '';
    }

    if (input.revenueMode === 'membership') {
      return 'Memberships stay at a 5% Fourthwall platform fee on both Free and Pro in this v1.';
    }
    if (input.revenueMode === 'digital') {
      return input.planTier === 'pro'
        ? 'Digital products on Pro model a 0% Fourthwall platform fee. Only payment processing stays.'
        : 'Digital products on Free model a 5% Fourthwall platform fee. Switching to Pro removes that 5% in this calculator.';
    }
    return 'Donations and tips model a 0% Fourthwall platform fee here, so only payment processing is deducted.';
  }

  function validateInput(rawInput) {
    const input = normalizeInput(rawInput);
    const errors = [];

    if (!VALID_REVENUE_MODES.has(input.revenueMode)) {
      errors.push('revenueMode must be membership, digital, or donation.');
    }
    if (!VALID_PLAN_TIERS.has(input.planTier)) {
      errors.push('planTier must be free or pro.');
    }
    if (input.pricePerTransaction == null || !(input.pricePerTransaction > 0)) {
      errors.push('pricePerTransaction must be greater than 0.');
    }
    if (input.monthlyTransactions == null || input.monthlyTransactions < 1 || !Number.isInteger(input.monthlyTransactions)) {
      errors.push('monthlyTransactions must be an integer at least 1.');
    }
    if (input.processingRatePct == null || input.processingRatePct < 0 || input.processingRatePct > 100) {
      errors.push('processingRatePct must be between 0 and 100.');
    }
    if (input.processingFixedFee == null || input.processingFixedFee < 0) {
      errors.push('processingFixedFee must be at least 0.');
    }
    if (input.targetMonthlyNet == null || input.targetMonthlyNet < 0) {
      errors.push('targetMonthlyNet must be at least 0.');
    }

    const platformRate = getPlatformRate(input);
    if (platformRate == null) {
      errors.push('Unable to resolve Fourthwall fee rules for this combination.');
    }

    return {
      ok: errors.length === 0,
      errors,
      input,
      platformRate,
    };
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  function formatPercent(value) {
    return `${Number(value).toFixed(2)}%`;
  }

  function buildSummary(result) {
    const lines = [
      '[Fourthwall Fee Calculator Summary]',
      `Revenue mode: ${MODE_LABELS[result.input.revenueMode] || result.input.revenueMode}`,
      `Plan tier: ${PLAN_LABELS[result.input.planTier] || result.input.planTier}`,
      `Platform fee rate: ${formatPercent(result.platformFeeRatePct)}`,
      `Monthly gross revenue: ${formatMoney(result.monthlyGrossRevenue)}`,
      `Platform fee amount: ${formatMoney(result.platformFeeAmount)}`,
      `Processing variable amount: ${formatMoney(result.processingVariableAmount)}`,
      `Processing fixed amount: ${formatMoney(result.processingFixedAmount)}`,
      `Total fee amount: ${formatMoney(result.totalFeeAmount)}`,
      `Monthly take-home: ${formatMoney(result.monthlyTakeHome)}`,
      `Effective take-home rate: ${formatPercent(result.effectiveTakeHomeRatePct)}`,
      `Net per transaction/member: ${formatMoney(result.netPerTransaction)}`,
      `Transactions needed for target net: ${result.requiredTransactionsForTargetNet == null ? 'Unreachable at current unit economics' : result.requiredTransactionsForTargetNet}`,
      `Gross needed for target net: ${result.requiredGrossForTargetNet == null ? 'Unreachable at current unit economics' : formatMoney(result.requiredGrossForTargetNet)}`,
      `Mode note: ${result.modeExplanation}`,
      'Scope note: this v1 models memberships, digital products, and donations only. Merch/product-catalog margins are out of scope.',
      'Processing note: 2.9% + $0.30 is only the default US card assumption. Real fees vary by provider and region.',
    ];

    if (result.requiredTransactionsForTargetNet == null) {
      lines.push('Planner note: your current price and fee assumptions do not produce a positive net per transaction, so the target is unreachable without changing the economics.');
    }

    return lines.join('\n');
  }

  function calculateFourthwallFees(rawInput) {
    const validation = validateInput(rawInput);
    if (!validation.ok) {
      return {
        result: null,
        error: validation.errors.join(' '),
        errors: validation.errors,
      };
    }

    const input = validation.input;
    const platformRate = validation.platformRate;
    const P = input.pricePerTransaction;
    const N = input.monthlyTransactions;
    const r = input.processingRatePct / 100;
    const f = input.processingFixedFee;
    const T = input.targetMonthlyNet;

    const monthlyGrossRevenue = P * N;
    const platformFeeAmount = monthlyGrossRevenue * platformRate;
    const processingVariableAmount = monthlyGrossRevenue * r;
    const processingFixedAmount = N * f;
    const totalFeeAmount = platformFeeAmount + processingVariableAmount + processingFixedAmount;
    const monthlyTakeHome = monthlyGrossRevenue - totalFeeAmount;
    const effectiveTakeHomeRatePct = monthlyGrossRevenue > 0 ? (monthlyTakeHome / monthlyGrossRevenue) * 100 : 0;
    const netPerTransaction = P * (1 - platformRate - r) - f;
    const requiredTransactionsForTargetNet = netPerTransaction > 0 ? Math.ceil(T / netPerTransaction) : null;
    const requiredGrossForTargetNet = requiredTransactionsForTargetNet == null ? null : requiredTransactionsForTargetNet * P;

    const result = {
      input,
      platformFeeRatePct: roundTo(platformRate * 100, 4),
      monthlyGrossRevenue: roundTo(monthlyGrossRevenue, 6),
      platformFeeAmount: roundTo(platformFeeAmount, 6),
      processingVariableAmount: roundTo(processingVariableAmount, 6),
      processingFixedAmount: roundTo(processingFixedAmount, 6),
      totalFeeAmount: roundTo(totalFeeAmount, 6),
      monthlyTakeHome: roundTo(monthlyTakeHome, 6),
      effectiveTakeHomeRatePct: roundTo(effectiveTakeHomeRatePct, 4),
      netPerTransaction: roundTo(netPerTransaction, 6),
      requiredTransactionsForTargetNet,
      requiredGrossForTargetNet: requiredGrossForTargetNet == null ? null : roundTo(requiredGrossForTargetNet, 6),
      modeExplanation: getModeExplanation(input),
    };

    result.summary = buildSummary(result);

    return {
      result,
      error: '',
      errors: [],
    };
  }

  function initPage() {
    if (typeof document === 'undefined') {
      return;
    }

    const form = document.getElementById('calculatorForm');
    if (!form) {
      return;
    }

    const elements = {
      revenueMode: document.getElementById('revenueMode'),
      planTier: document.getElementById('planTier'),
      pricePerTransaction: document.getElementById('pricePerTransaction'),
      monthlyTransactions: document.getElementById('monthlyTransactions'),
      processingRatePct: document.getElementById('processingRatePct'),
      processingFixedFee: document.getElementById('processingFixedFee'),
      targetMonthlyNet: document.getElementById('targetMonthlyNet'),
      modeHint: document.getElementById('modeHint'),
      errorBox: document.getElementById('errorBox'),
      statusNote: document.getElementById('statusNote'),
      summary: document.getElementById('summary'),
      results: {
        takeHome: document.getElementById('resultTakeHome'),
        effectiveRate: document.getElementById('resultEffectiveRate'),
        requiredTransactions: document.getElementById('resultRequiredTransactions'),
        requiredGross: document.getElementById('resultRequiredGross'),
        platformRate: document.getElementById('resultPlatformRate'),
        gross: document.getElementById('resultGross'),
        platformFee: document.getElementById('resultPlatformFee'),
        processingVariable: document.getElementById('resultProcessingVariable'),
        processingFixed: document.getElementById('resultProcessingFixed'),
        totalFees: document.getElementById('resultTotalFees'),
        netPerTransaction: document.getElementById('resultNetPerTransaction'),
      },
      copyBtn: document.getElementById('copySummaryBtn'),
      resetBtn: document.getElementById('resetBtn'),
    };

    function currentInput() {
      return {
        revenueMode: elements.revenueMode.value,
        planTier: elements.planTier.value,
        pricePerTransaction: elements.pricePerTransaction.value,
        monthlyTransactions: elements.monthlyTransactions.value,
        processingRatePct: elements.processingRatePct.value,
        processingFixedFee: elements.processingFixedFee.value,
        targetMonthlyNet: elements.targetMonthlyNet.value,
      };
    }

    function setResultValue(target, text) {
      if (target) {
        target.textContent = text;
      }
    }

    function render() {
      const { result, error } = calculateFourthwallFees(currentInput());
      const previewInput = normalizeInput(currentInput());
      const previewHint = getModeExplanation({
        revenueMode: previewInput.revenueMode,
        planTier: VALID_PLAN_TIERS.has(previewInput.planTier) ? previewInput.planTier : 'free',
      });
      elements.modeHint.textContent = previewHint || 'Choose a revenue mode to see how Fourthwall fees change.';

      if (error) {
        elements.errorBox.hidden = false;
        elements.errorBox.textContent = error;
        elements.statusNote.textContent = 'Enter valid inputs to calculate Fourthwall take-home.';
        setResultValue(elements.results.takeHome, '—');
        setResultValue(elements.results.effectiveRate, '—');
        setResultValue(elements.results.requiredTransactions, '—');
        setResultValue(elements.results.requiredGross, '—');
        setResultValue(elements.results.platformRate, '—');
        setResultValue(elements.results.gross, '—');
        setResultValue(elements.results.platformFee, '—');
        setResultValue(elements.results.processingVariable, '—');
        setResultValue(elements.results.processingFixed, '—');
        setResultValue(elements.results.totalFees, '—');
        setResultValue(elements.results.netPerTransaction, '—');
        elements.summary.value = '';
        return;
      }

      elements.errorBox.hidden = true;
      elements.errorBox.textContent = '';

      setResultValue(elements.results.takeHome, formatMoney(result.monthlyTakeHome));
      setResultValue(elements.results.effectiveRate, formatPercent(result.effectiveTakeHomeRatePct));
      setResultValue(elements.results.requiredTransactions, result.requiredTransactionsForTargetNet == null ? 'Unreachable' : String(result.requiredTransactionsForTargetNet));
      setResultValue(elements.results.requiredGross, result.requiredGrossForTargetNet == null ? 'Unreachable' : formatMoney(result.requiredGrossForTargetNet));
      setResultValue(elements.results.platformRate, formatPercent(result.platformFeeRatePct));
      setResultValue(elements.results.gross, formatMoney(result.monthlyGrossRevenue));
      setResultValue(elements.results.platformFee, formatMoney(result.platformFeeAmount));
      setResultValue(elements.results.processingVariable, formatMoney(result.processingVariableAmount));
      setResultValue(elements.results.processingFixed, formatMoney(result.processingFixedAmount));
      setResultValue(elements.results.totalFees, formatMoney(result.totalFeeAmount));
      setResultValue(elements.results.netPerTransaction, formatMoney(result.netPerTransaction));

      elements.statusNote.textContent = result.requiredTransactionsForTargetNet == null
        ? 'At this price and fee stack, the planner is underwater. Raise price, lower fees, or reduce the fixed processing drag.'
        : `Target planner uses your current ${MODE_LABELS[result.input.revenueMode].toLowerCase()} price and assumes each monthly transaction stays at ${formatMoney(result.input.pricePerTransaction)}.`;

      elements.summary.value = result.summary;
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);

    elements.copyBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(elements.summary.value);
        elements.statusNote.textContent = 'Summary copied to clipboard.';
      } catch (error) {
        elements.statusNote.textContent = 'Clipboard write failed. Copy the summary manually.';
      }
    });

    elements.resetBtn.addEventListener('click', function () {
      elements.revenueMode.value = DEFAULTS.revenueMode;
      elements.planTier.value = DEFAULTS.planTier;
      elements.pricePerTransaction.value = String(DEFAULTS.pricePerTransaction);
      elements.monthlyTransactions.value = String(DEFAULTS.monthlyTransactions);
      elements.processingRatePct.value = String(DEFAULTS.processingRatePct);
      elements.processingFixedFee.value = String(DEFAULTS.processingFixedFee);
      elements.targetMonthlyNet.value = String(DEFAULTS.targetMonthlyNet);
      render();
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPage);
    } else {
      initPage();
    }
  }

  return {
    DEFAULTS,
    VALID_REVENUE_MODES,
    VALID_PLAN_TIERS,
    MODE_LABELS,
    PLAN_LABELS,
    normalizeInput,
    getPlatformRate,
    getModeExplanation,
    validateInput,
    buildSummary,
    calculateFourthwallFees,
    formatMoney,
    formatPercent,
  };
});
