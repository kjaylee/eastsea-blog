(function () {
  'use strict';

  if (typeof document === 'undefined') {
    return;
  }

  const calculator = globalThis.ShopifyAppStoreRevenueShareCalculator;
  if (!calculator) {
    return;
  }

  const el = function (id) { return document.getElementById(id); };
  const refs = {
    ytdRecognizedRevenueBeforeMonth: el('ytdRecognizedRevenueBeforeMonth'),
    monthlyGrossAppRevenue: el('monthlyGrossAppRevenue'),
    refundRatePct: el('refundRatePct'),
    processingFeeRatePct: el('processingFeeRatePct'),
    taxReserveRatePct: el('taxReserveRatePct'),
    monthlyOperatingCost: el('monthlyOperatingCost'),
    thresholdUsd: el('thresholdUsd'),
    revenueShareRatePct: el('revenueShareRatePct'),
    bandBadge: el('bandBadge'),
    bandLabel: el('bandLabel'),
    monthlyTakeHome: el('monthlyTakeHome'),
    breakEvenMonthlyRevenue: el('breakEvenMonthlyRevenue'),
    blendedRevenueShareRatePct: el('blendedRevenueShareRatePct'),
    runwayBeforeMonth: el('runwayBeforeMonth'),
    recognizedRevenue: el('recognizedRevenue'),
    zeroShareRecognizedRevenue: el('zeroShareRecognizedRevenue'),
    sharedRecognizedRevenue: el('sharedRecognizedRevenue'),
    revenueShareFee: el('revenueShareFee'),
    processingFees: el('processingFees'),
    taxReserve: el('taxReserve'),
    totalCost: el('totalCost'),
    takeHomeMarginPct: el('takeHomeMarginPct'),
    effectiveTotalTakeRatePct: el('effectiveTotalTakeRatePct'),
    insight: el('insight'),
    summary: el('summary'),
    error: el('error'),
    copyBtn: el('copyBtn'),
    resetBtn: el('resetBtn'),
  };

  const money = function (value) {
    if (!Number.isFinite(value)) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const percent = function (value) {
    if (!Number.isFinite(value)) {
      return '—';
    }
    return value.toFixed(2) + '%';
  };

  const BAND_COPY = {
    'within-threshold': {
      label: 'Inside 0% band',
      className: 'band-badge within-threshold',
    },
    'crosses-threshold': {
      label: 'Crosses into 15% band',
      className: 'band-badge crosses-threshold',
    },
    'above-threshold': {
      label: 'Fully in 15% band',
      className: 'band-badge above-threshold',
    },
  };

  function readInput() {
    return {
      ytdRecognizedRevenueBeforeMonth: refs.ytdRecognizedRevenueBeforeMonth.value,
      monthlyGrossAppRevenue: refs.monthlyGrossAppRevenue.value,
      refundRatePct: refs.refundRatePct.value,
      processingFeeRatePct: refs.processingFeeRatePct.value,
      taxReserveRatePct: refs.taxReserveRatePct.value,
      monthlyOperatingCost: refs.monthlyOperatingCost.value,
      thresholdUsd: refs.thresholdUsd.value,
      revenueShareRatePct: refs.revenueShareRatePct.value,
    };
  }

  function applyDefaults() {
    Object.keys(calculator.DEFAULT_INPUTS).forEach(function (key) {
      if (refs[key]) {
        refs[key].value = calculator.DEFAULT_INPUTS[key];
      }
    });
  }

  function clearOutputs() {
    [
      'monthlyTakeHome',
      'breakEvenMonthlyRevenue',
      'blendedRevenueShareRatePct',
      'runwayBeforeMonth',
      'recognizedRevenue',
      'zeroShareRecognizedRevenue',
      'sharedRecognizedRevenue',
      'revenueShareFee',
      'processingFees',
      'taxReserve',
      'totalCost',
      'takeHomeMarginPct',
      'effectiveTotalTakeRatePct',
    ].forEach(function (key) {
      refs[key].textContent = '—';
    });
    refs.insight.textContent = 'Review the inputs to estimate Shopify App Store take-home.';
    refs.summary.value = '';
    refs.bandBadge.className = 'band-badge idle';
    refs.bandLabel.textContent = 'Waiting for valid inputs';
  }

  function showError(message) {
    refs.error.textContent = message;
    refs.error.classList.add('show');
  }

  function hideError() {
    refs.error.textContent = '';
    refs.error.classList.remove('show');
  }

  function render() {
    const outcome = calculator.calculate(readInput());
    if (!outcome.ok) {
      clearOutputs();
      showError(outcome.errors.join(' '));
      return;
    }

    hideError();
    const result = outcome.result;
    const band = BAND_COPY[result.band] || BAND_COPY['within-threshold'];

    refs.bandBadge.className = band.className;
    refs.bandLabel.textContent = band.label;
    refs.monthlyTakeHome.textContent = money(result.monthlyTakeHome);
    refs.breakEvenMonthlyRevenue.textContent = result.breakEvenMonthlyRevenue == null
      ? 'Not reachable'
      : money(result.breakEvenMonthlyRevenue);
    refs.blendedRevenueShareRatePct.textContent = percent(result.blendedRevenueShareRatePct);
    refs.runwayBeforeMonth.textContent = money(result.runwayBeforeMonth);
    refs.recognizedRevenue.textContent = money(result.recognizedRevenue);
    refs.zeroShareRecognizedRevenue.textContent = money(result.zeroShareRecognizedRevenue);
    refs.sharedRecognizedRevenue.textContent = money(result.sharedRecognizedRevenue);
    refs.revenueShareFee.textContent = money(result.revenueShareFee);
    refs.processingFees.textContent = money(result.processingFees);
    refs.taxReserve.textContent = money(result.taxReserve);
    refs.totalCost.textContent = money(result.totalCost);
    refs.takeHomeMarginPct.textContent = percent(result.takeHomeMarginPct);
    refs.effectiveTotalTakeRatePct.textContent = percent(result.effectiveTotalTakeRatePct);
    refs.insight.textContent = result.insight;
    refs.summary.value = result.summary;
  }

  async function copySummary() {
    const value = refs.summary.value.trim();
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      refs.copyBtn.textContent = 'Copied';
      window.setTimeout(function () {
        refs.copyBtn.textContent = 'Copy summary';
      }, 1200);
    } catch (error) {
      window.alert('Clipboard unavailable. Please copy manually.');
    }
  }

  refs.copyBtn.addEventListener('click', copySummary);
  refs.resetBtn.addEventListener('click', function () {
    applyDefaults();
    render();
  });

  [
    refs.ytdRecognizedRevenueBeforeMonth,
    refs.monthlyGrossAppRevenue,
    refs.refundRatePct,
    refs.processingFeeRatePct,
    refs.taxReserveRatePct,
    refs.monthlyOperatingCost,
    refs.thresholdUsd,
    refs.revenueShareRatePct,
  ].forEach(function (node) {
    node.addEventListener('input', render);
    node.addEventListener('change', render);
  });

  applyDefaults();
  render();
})();
