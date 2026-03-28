(function () {
  'use strict';

  var tool = window.ChargebackRateThresholdCalculator;
  if (!tool) return;

  function $(id) { return document.getElementById(id); }

  var refs = {
    chargebacks: $('chargebacks'),
    transactionsCurrent: $('transactionsCurrent'),
    transactionsPrevious: $('transactionsPrevious'),
    averageOrderValue: $('averageOrderValue'),
    chargebackFee: $('chargebackFee'),
    recoveryRate: $('recoveryRate'),
    monitoredRatePct: $('monitoredRatePct'),
    excessiveRatePct: $('excessiveRatePct'),
    monitoredCountThreshold: $('monitoredCountThreshold'),
    error: $('error'),
    summary: $('summary'),
    status: $('status'),
    copy: $('copy'),
    reset: $('reset'),
    sameMonthRatePct: $('sameMonthRatePct'),
    laggedRatePct: $('laggedRatePct'),
    monthlyExposure: $('monthlyExposure'),
    annualizedExposure: $('annualizedExposure'),
    bestHeadroom: $('bestHeadroom'),
    countHeadroom: $('countHeadroom'),
    maxMonitoredOut: $('maxMonitoredOut'),
    maxExcessiveOut: $('maxExcessiveOut'),
    transactionsNeededMonitoredOut: $('transactionsNeededMonitoredOut'),
    grossDisputedVolumeOut: $('grossDisputedVolumeOut'),
    recoveredDisputedVolumeOut: $('recoveredDisputedVolumeOut'),
    unrecoveredDisputedVolumeOut: $('unrecoveredDisputedVolumeOut'),
    feeBurnOut: $('feeBurnOut')
  };

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 2 : digits });
  }

  function getInput() {
    return {
      chargebacks: Number(refs.chargebacks.value),
      transactionsCurrent: Number(refs.transactionsCurrent.value),
      transactionsPrevious: Number(refs.transactionsPrevious.value),
      averageOrderValue: Number(refs.averageOrderValue.value),
      chargebackFee: Number(refs.chargebackFee.value),
      recoveryRate: Number(refs.recoveryRate.value),
      monitoredRatePct: Number(refs.monitoredRatePct.value),
      excessiveRatePct: Number(refs.excessiveRatePct.value),
      monitoredCountThreshold: Number(refs.monitoredCountThreshold.value)
    };
  }

  function setError(message) {
    refs.error.textContent = message || '';
    refs.error.classList.toggle('show', Boolean(message));
  }

  function resetOutputs() {
    [
      'sameMonthRatePct', 'laggedRatePct', 'monthlyExposure', 'annualizedExposure',
      'bestHeadroom', 'countHeadroom', 'maxMonitoredOut', 'maxExcessiveOut',
      'transactionsNeededMonitoredOut', 'grossDisputedVolumeOut', 'recoveredDisputedVolumeOut',
      'unrecoveredDisputedVolumeOut', 'feeBurnOut'
    ].forEach(function (key) {
      refs[key].textContent = '-';
    });
    refs.summary.value = '';
  }

  function render() {
    var input = getInput();
    var error = tool.validateInput(input);
    setError(error);

    if (error) {
      refs.status.innerHTML = '<span class="warn">●</span> Check your assumptions';
      resetOutputs();
      return;
    }

    var result = tool.compute(input);
    refs.sameMonthRatePct.textContent = formatNumber(result.sameMonthRatePct, 3) + '%';
    refs.laggedRatePct.textContent = formatNumber(result.laggedRatePct, 3) + '%';
    refs.monthlyExposure.textContent = formatMoney(result.monthlyExposure);
    refs.annualizedExposure.textContent = formatMoney(result.annualizedExposure);
    refs.bestHeadroom.textContent = formatNumber(Math.min(result.headroomMonitoredCurrent, result.headroomMonitoredLagged), 0);
    refs.countHeadroom.textContent = formatNumber(result.countHeadroom, 0);
    refs.maxMonitoredOut.textContent = formatNumber(result.maxDisputesMonitoredCurrent, 0) + ' current / ' + formatNumber(result.maxDisputesMonitoredLagged, 0) + ' lagged';
    refs.maxExcessiveOut.textContent = formatNumber(result.maxDisputesExcessiveCurrent, 0) + ' current / ' + formatNumber(result.maxDisputesExcessiveLagged, 0) + ' lagged';
    refs.transactionsNeededMonitoredOut.textContent = formatNumber(result.transactionsNeededAtMonitored, 0);
    refs.grossDisputedVolumeOut.textContent = formatMoney(result.grossDisputedVolume);
    refs.recoveredDisputedVolumeOut.textContent = formatMoney(result.recoveredDisputedVolume);
    refs.unrecoveredDisputedVolumeOut.textContent = formatMoney(result.unrecoveredDisputedVolume);
    refs.feeBurnOut.textContent = formatMoney(result.feeBurn);

    refs.status.innerHTML = result.statusTone === 'ok'
      ? '<span class="ok">●</span> ' + result.statusLabel
      : '<span class="warn">●</span> ' + result.statusLabel;

    refs.summary.value = result.summary;
  }

  refs.copy.addEventListener('click', function () {
    if (!refs.summary.value.trim()) return;
    navigator.clipboard.writeText(refs.summary.value)
      .then(function () { window.alert('Summary copied.'); })
      .catch(function () { window.alert('Clipboard unavailable. Please copy manually.'); });
  });

  refs.reset.addEventListener('click', function () {
    Object.keys(tool.DEFAULT_INPUTS).forEach(function (key) {
      refs[key].value = tool.DEFAULT_INPUTS[key];
    });
    render();
  });

  [
    refs.chargebacks, refs.transactionsCurrent, refs.transactionsPrevious, refs.averageOrderValue,
    refs.chargebackFee, refs.recoveryRate, refs.monitoredRatePct, refs.excessiveRatePct,
    refs.monitoredCountThreshold
  ].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();
}());
