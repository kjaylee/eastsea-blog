(function (root) {
  const PLAN_ORDER = ['Basic', 'Grow', 'Advanced'];
  const PAYMENT_MODES = ['shopify-payments', 'third-party'];

  const DEFAULTS = {
    selectedPlan: 'Basic',
    paymentMode: 'shopify-payments',
    ordersPerMonth: 100,
    averageOrderValue: 50,
    processingRatePercent: 2.9,
    fixedFeePerOrder: 0.3,
    basicPlanFee: 39,
    growPlanFee: 105,
    advancedPlanFee: 399,
    basicThirdPartyRate: 2,
    growThirdPartyRate: 1,
    advancedThirdPartyRate: 0.6
  };

  const TEXT = {
    copied: 'Summary copied.',
    copyFail: 'Clipboard unavailable. Please copy manually.',
    paymentsModeNote: 'Using Shopify Payments means no additional third-party Shopify transaction fee, so upgrade break-even from transaction-fee savings is not applicable.',
    thirdPartyModeNote: 'Break-even compares only the extra monthly plan cost versus reduced third-party Shopify transaction-fee rate. Processing assumptions stay the same across plans in this MVP.',
    summaryTitle: '[Shopify Fee Calculator Summary]',
    estimateNote: 'Estimate only. Rates vary by country/region, payment-method mix, and Shopify pricing changes.'
  };

  function sanitizeNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return numeric;
  }

  function sanitizeInteger(value) {
    return Math.floor(sanitizeNumber(value));
  }

  function sanitizePlan(value) {
    return PLAN_ORDER.includes(value) ? value : DEFAULTS.selectedPlan;
  }

  function sanitizePaymentMode(value) {
    return PAYMENT_MODES.includes(value) ? value : DEFAULTS.paymentMode;
  }

  function readMaybeNested(input, nestedKey, flatKey, fallback, aliasKey) {
    if (input && input[nestedKey] && Object.prototype.hasOwnProperty.call(input[nestedKey], flatKey)) {
      return input[nestedKey][flatKey];
    }
    if (input && Object.prototype.hasOwnProperty.call(input, flatKey)) {
      return input[flatKey];
    }
    if (aliasKey && input && Object.prototype.hasOwnProperty.call(input, aliasKey)) {
      return input[aliasKey];
    }
    return fallback;
  }

  function normalizeInput(input) {
    const source = input || {};

    return {
      selectedPlan: sanitizePlan(source.selectedPlan),
      paymentMode: sanitizePaymentMode(source.paymentMode),
      ordersPerMonth: sanitizeInteger(source.ordersPerMonth),
      averageOrderValue: sanitizeNumber(source.averageOrderValue),
      processingRatePercent: sanitizeNumber(source.processingRatePercent),
      fixedFeePerOrder: sanitizeNumber(source.fixedFeePerOrder),
      basicPlanFee: sanitizeNumber(readMaybeNested(source, 'planFees', 'Basic', DEFAULTS.basicPlanFee, 'basicPlanFee')),
      growPlanFee: sanitizeNumber(readMaybeNested(source, 'planFees', 'Grow', DEFAULTS.growPlanFee, 'growPlanFee')),
      advancedPlanFee: sanitizeNumber(readMaybeNested(source, 'planFees', 'Advanced', DEFAULTS.advancedPlanFee, 'advancedPlanFee')),
      basicThirdPartyRate: sanitizeNumber(readMaybeNested(source, 'thirdPartyRates', 'Basic', DEFAULTS.basicThirdPartyRate, 'basicThirdPartyRate')),
      growThirdPartyRate: sanitizeNumber(readMaybeNested(source, 'thirdPartyRates', 'Grow', DEFAULTS.growThirdPartyRate, 'growThirdPartyRate')),
      advancedThirdPartyRate: sanitizeNumber(readMaybeNested(source, 'thirdPartyRates', 'Advanced', DEFAULTS.advancedThirdPartyRate, 'advancedThirdPartyRate'))
    };
  }

  function buildPlanConfig(normalized) {
    return {
      Basic: {
        monthlyPlanFee: normalized.basicPlanFee,
        thirdPartyRatePercent: normalized.basicThirdPartyRate,
        thirdPartyRate: normalized.basicThirdPartyRate / 100
      },
      Grow: {
        monthlyPlanFee: normalized.growPlanFee,
        thirdPartyRatePercent: normalized.growThirdPartyRate,
        thirdPartyRate: normalized.growThirdPartyRate / 100
      },
      Advanced: {
        monthlyPlanFee: normalized.advancedPlanFee,
        thirdPartyRatePercent: normalized.advancedThirdPartyRate,
        thirdPartyRate: normalized.advancedThirdPartyRate / 100
      }
    };
  }

  function formatNumber(value) {
    return Number.isFinite(value) ? value.toFixed(2) : '—';
  }

  function formatRatioAsPercent(value) {
    return Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : '—';
  }

  function calculateComparison(planName, planConfig, selectedPlan, monthlyGross, processingFee, averageOrderValue) {
    const current = planConfig[selectedPlan];
    const candidate = planConfig[planName];
    const currentThirdPartyTransactionFee = monthlyGross * current.thirdPartyRate;
    const candidateThirdPartyTransactionFee = monthlyGross * candidate.thirdPartyRate;
    const currentTotalShopifyFees = current.monthlyPlanFee + processingFee + currentThirdPartyTransactionFee;
    const candidateTotalShopifyFees = candidate.monthlyPlanFee + processingFee + candidateThirdPartyTransactionFee;
    const monthlyPlanFeeDelta = candidate.monthlyPlanFee - current.monthlyPlanFee;
    const thirdPartyRateDelta = current.thirdPartyRate - candidate.thirdPartyRate;

    let breakEvenMonthlyGross = null;
    let breakEvenMonthlyOrders = null;

    if (thirdPartyRateDelta > 0) {
      breakEvenMonthlyGross = monthlyPlanFeeDelta / thirdPartyRateDelta;
      if (averageOrderValue > 0) {
        breakEvenMonthlyOrders = Math.ceil(breakEvenMonthlyGross / averageOrderValue);
      }
    }

    return {
      candidatePlan: planName,
      monthlyPlanFeeDelta,
      thirdPartyRateDelta,
      thirdPartyRateDeltaPercent: thirdPartyRateDelta * 100,
      breakEvenMonthlyGross,
      breakEvenMonthlyOrders,
      currentPlanTotalShopifyFees: currentTotalShopifyFees,
      candidatePlanTotalShopifyFees: candidateTotalShopifyFees,
      cheaperAtCurrentVolume: candidateTotalShopifyFees < currentTotalShopifyFees
    };
  }

  function createDisplay(result) {
    return {
      monthlyGross: formatNumber(result.monthlyGross),
      monthlyPlanFee: formatNumber(result.monthlyPlanFee),
      processingFee: formatNumber(result.processingFee),
      thirdPartyTransactionFee: formatNumber(result.thirdPartyTransactionFee),
      totalShopifyFees: formatNumber(result.totalShopifyFees),
      netAfterFees: formatNumber(result.netAfterFees),
      effectiveFeeRate: formatRatioAsPercent(result.effectiveFeeRate),
      feePerOrder: formatNumber(result.feePerOrder)
    };
  }

  function buildSummary(result) {
    const comparisonLines = result.comparisons.length
      ? result.comparisons.map((item) => {
          const gross = item.breakEvenMonthlyGross == null ? '—' : formatNumber(item.breakEvenMonthlyGross);
          const orders = item.breakEvenMonthlyOrders == null ? '—' : String(item.breakEvenMonthlyOrders);
          return `- ${item.candidatePlan}: break-even gross ${gross}, break-even orders ${orders}, candidate total fees ${formatNumber(item.candidatePlanTotalShopifyFees)}`;
        }).join('\n')
      : '- No higher-plan comparison rows for the selected setup.';

    return [
      TEXT.summaryTitle,
      `Plan: ${result.inputs.selectedPlan}`,
      `Payment mode: ${result.inputs.paymentMode}`,
      `Orders per month: ${result.inputs.ordersPerMonth}`,
      `Average order value: ${formatNumber(result.inputs.averageOrderValue)}`,
      `Monthly gross sales: ${formatNumber(result.monthlyGross)}`,
      `Monthly plan fee: ${formatNumber(result.monthlyPlanFee)}`,
      `Payment processing fee: ${formatNumber(result.processingFee)}`,
      `Third-party transaction fee: ${formatNumber(result.thirdPartyTransactionFee)}`,
      `Total Shopify-related fees: ${formatNumber(result.totalShopifyFees)}`,
      `Net after fees: ${formatNumber(result.netAfterFees)}`,
      `Effective fee rate: ${formatRatioAsPercent(result.effectiveFeeRate)}`,
      `Fee per order: ${formatNumber(result.feePerOrder)}`,
      'Higher-plan comparison:',
      comparisonLines,
      TEXT.estimateNote
    ].join('\n');
  }

  function calculate(input) {
    const normalized = normalizeInput(input);
    const planConfig = buildPlanConfig(normalized);
    const selectedPlanConfig = planConfig[normalized.selectedPlan];
    const monthlyGross = normalized.ordersPerMonth * normalized.averageOrderValue;
    const processingFee = (monthlyGross * normalized.processingRatePercent / 100) + (normalized.ordersPerMonth * normalized.fixedFeePerOrder);
    const thirdPartyTransactionFee = normalized.paymentMode === 'third-party'
      ? monthlyGross * selectedPlanConfig.thirdPartyRate
      : 0;
    const monthlyPlanFee = selectedPlanConfig.monthlyPlanFee;
    const totalShopifyFees = monthlyPlanFee + processingFee + thirdPartyTransactionFee;
    const netAfterFees = monthlyGross - totalShopifyFees;
    const effectiveFeeRate = monthlyGross > 0 ? totalShopifyFees / monthlyGross : 0;
    const feePerOrder = normalized.ordersPerMonth > 0 ? totalShopifyFees / normalized.ordersPerMonth : 0;

    const selectedIndex = PLAN_ORDER.indexOf(normalized.selectedPlan);
    const higherPlans = PLAN_ORDER.slice(selectedIndex + 1);
    const comparisons = normalized.paymentMode === 'third-party'
      ? higherPlans.map((planName) => calculateComparison(
          planName,
          planConfig,
          normalized.selectedPlan,
          monthlyGross,
          processingFee,
          normalized.averageOrderValue
        ))
      : [];

    const result = {
      inputs: normalized,
      planConfig,
      monthlyGross,
      monthlyPlanFee,
      processingFee,
      thirdPartyTransactionFee,
      totalShopifyFees,
      netAfterFees,
      effectiveFeeRate,
      effectiveFeeRatePercent: effectiveFeeRate * 100,
      feePerOrder,
      comparisons,
      comparisonNote: normalized.paymentMode === 'third-party' ? TEXT.thirdPartyModeNote : TEXT.paymentsModeNote
    };

    result.display = createDisplay(result);
    result.summary = buildSummary(result);

    return { result, error: '' };
  }

  const api = {
    PLAN_ORDER,
    PAYMENT_MODES,
    DEFAULTS,
    TEXT,
    sanitizeNumber,
    sanitizeInteger,
    normalizeInput,
    buildPlanConfig,
    calculateComparison,
    formatNumber,
    formatRatioAsPercent,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.ShopifyFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  function initBrowser() {
    const $ = function (id) { return document.getElementById(id); };
    const refs = {
      selectedPlan: $('selectedPlan'),
      paymentMode: $('paymentMode'),
      ordersPerMonth: $('ordersPerMonth'),
      averageOrderValue: $('averageOrderValue'),
      processingRatePercent: $('processingRatePercent'),
      fixedFeePerOrder: $('fixedFeePerOrder'),
      basicPlanFee: $('basicPlanFee'),
      growPlanFee: $('growPlanFee'),
      advancedPlanFee: $('advancedPlanFee'),
      basicThirdPartyRate: $('basicThirdPartyRate'),
      growThirdPartyRate: $('growThirdPartyRate'),
      advancedThirdPartyRate: $('advancedThirdPartyRate'),
      monthlyGross: $('monthlyGross'),
      monthlyPlanFee: $('monthlyPlanFee'),
      processingFee: $('processingFee'),
      thirdPartyTransactionFee: $('thirdPartyTransactionFee'),
      totalShopifyFees: $('totalShopifyFees'),
      netAfterFees: $('netAfterFees'),
      effectiveFeeRate: $('effectiveFeeRate'),
      feePerOrder: $('feePerOrder'),
      comparisonBody: $('comparisonBody'),
      comparisonEmpty: $('comparisonEmpty'),
      comparisonNote: $('comparisonNote'),
      summary: $('summary'),
      copySummary: $('copySummary'),
      resetDefaults: $('resetDefaults'),
      status: $('status')
    };

    if (!refs.selectedPlan) {
      return;
    }

    function setDefaults() {
      refs.selectedPlan.value = DEFAULTS.selectedPlan;
      refs.paymentMode.value = DEFAULTS.paymentMode;
      refs.ordersPerMonth.value = DEFAULTS.ordersPerMonth;
      refs.averageOrderValue.value = DEFAULTS.averageOrderValue;
      refs.processingRatePercent.value = DEFAULTS.processingRatePercent;
      refs.fixedFeePerOrder.value = DEFAULTS.fixedFeePerOrder;
      refs.basicPlanFee.value = DEFAULTS.basicPlanFee;
      refs.growPlanFee.value = DEFAULTS.growPlanFee;
      refs.advancedPlanFee.value = DEFAULTS.advancedPlanFee;
      refs.basicThirdPartyRate.value = DEFAULTS.basicThirdPartyRate;
      refs.growThirdPartyRate.value = DEFAULTS.growThirdPartyRate;
      refs.advancedThirdPartyRate.value = DEFAULTS.advancedThirdPartyRate;
    }

    function readInput() {
      return {
        selectedPlan: refs.selectedPlan.value,
        paymentMode: refs.paymentMode.value,
        ordersPerMonth: refs.ordersPerMonth.value,
        averageOrderValue: refs.averageOrderValue.value,
        processingRatePercent: refs.processingRatePercent.value,
        fixedFeePerOrder: refs.fixedFeePerOrder.value,
        Basic: refs.basicPlanFee.value,
        Grow: refs.growPlanFee.value,
        Advanced: refs.advancedPlanFee.value,
        planFees: {
          Basic: refs.basicPlanFee.value,
          Grow: refs.growPlanFee.value,
          Advanced: refs.advancedPlanFee.value
        },
        thirdPartyRates: {
          Basic: refs.basicThirdPartyRate.value,
          Grow: refs.growThirdPartyRate.value,
          Advanced: refs.advancedThirdPartyRate.value
        }
      };
    }

    function renderComparisons(comparisons) {
      refs.comparisonBody.innerHTML = '';
      if (!comparisons.length) {
        refs.comparisonEmpty.hidden = false;
        return;
      }
      refs.comparisonEmpty.hidden = true;

      comparisons.forEach(function (item) {
        const row = document.createElement('tr');
        row.innerHTML = [
          `<td>${item.candidatePlan}</td>`,
          `<td>${formatNumber(item.monthlyPlanFeeDelta)}</td>`,
          `<td>${formatRatioAsPercent(item.thirdPartyRateDelta)}</td>`,
          `<td>${item.breakEvenMonthlyGross == null ? '—' : formatNumber(item.breakEvenMonthlyGross)}</td>`,
          `<td>${item.breakEvenMonthlyOrders == null ? '—' : item.breakEvenMonthlyOrders}</td>`,
          `<td>${formatNumber(item.currentPlanTotalShopifyFees)}</td>`,
          `<td>${formatNumber(item.candidatePlanTotalShopifyFees)}</td>`
        ].join('');
        refs.comparisonBody.appendChild(row);
      });
    }

    function render() {
      const payload = readInput();
      const response = calculate(payload);
      const result = response.result;

      refs.monthlyGross.textContent = result.display.monthlyGross;
      refs.monthlyPlanFee.textContent = result.display.monthlyPlanFee;
      refs.processingFee.textContent = result.display.processingFee;
      refs.thirdPartyTransactionFee.textContent = result.display.thirdPartyTransactionFee;
      refs.totalShopifyFees.textContent = result.display.totalShopifyFees;
      refs.netAfterFees.textContent = result.display.netAfterFees;
      refs.effectiveFeeRate.textContent = result.display.effectiveFeeRate;
      refs.feePerOrder.textContent = result.display.feePerOrder;
      refs.comparisonNote.textContent = result.comparisonNote;
      refs.summary.value = result.summary;
      refs.status.textContent = result.netAfterFees >= 0
        ? 'Net after fees is currently positive.'
        : 'Net after fees is currently negative.';
      renderComparisons(result.comparisons);
    }

    [
      refs.selectedPlan,
      refs.paymentMode,
      refs.ordersPerMonth,
      refs.averageOrderValue,
      refs.processingRatePercent,
      refs.fixedFeePerOrder,
      refs.basicPlanFee,
      refs.growPlanFee,
      refs.advancedPlanFee,
      refs.basicThirdPartyRate,
      refs.growThirdPartyRate,
      refs.advancedThirdPartyRate
    ].forEach(function (element) {
      element.addEventListener('input', render);
      element.addEventListener('change', render);
    });

    refs.copySummary.addEventListener('click', function () {
      if (!refs.summary.value.trim()) {
        return;
      }
      navigator.clipboard.writeText(refs.summary.value)
        .then(function () {
          window.alert(TEXT.copied);
        })
        .catch(function () {
          window.alert(TEXT.copyFail);
        });
    });

    refs.resetDefaults.addEventListener('click', function () {
      setDefaults();
      render();
    });

    setDefaults();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
