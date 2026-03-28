(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChargebackRateThresholdCalculator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_INPUTS = {
    chargebacks: 85,
    transactionsCurrent: 12000,
    transactionsPrevious: 11000,
    averageOrderValue: 82,
    chargebackFee: 15,
    recoveryRate: 28,
    monitoredRatePct: 1,
    excessiveRatePct: 1.5,
    monitoredCountThreshold: 100
  };

  function toNumber(value) {
    return Number(value);
  }

  function validateInput(input) {
    var v = {
      chargebacks: toNumber(input.chargebacks),
      transactionsCurrent: toNumber(input.transactionsCurrent),
      transactionsPrevious: toNumber(input.transactionsPrevious),
      averageOrderValue: toNumber(input.averageOrderValue),
      chargebackFee: toNumber(input.chargebackFee),
      recoveryRate: toNumber(input.recoveryRate),
      monitoredRatePct: toNumber(input.monitoredRatePct),
      excessiveRatePct: toNumber(input.excessiveRatePct),
      monitoredCountThreshold: toNumber(input.monitoredCountThreshold)
    };

    if (!Number.isFinite(v.chargebacks) || v.chargebacks < 0) return 'Current-month chargebacks must be 0 or above.';
    if (!Number.isFinite(v.transactionsCurrent) || v.transactionsCurrent <= 0) return 'Current-month card transactions must be greater than 0.';
    if (!Number.isFinite(v.transactionsPrevious) || v.transactionsPrevious <= 0) return 'Previous-month card transactions must be greater than 0.';
    if (!Number.isFinite(v.averageOrderValue) || v.averageOrderValue < 0) return 'Average disputed order value must be 0 or above.';
    if (!Number.isFinite(v.chargebackFee) || v.chargebackFee < 0) return 'Average chargeback fee must be 0 or above.';
    if (!Number.isFinite(v.recoveryRate) || v.recoveryRate < 0 || v.recoveryRate > 100) return 'Recovery rate must be between 0 and 100.';
    if (!Number.isFinite(v.monitoredRatePct) || v.monitoredRatePct <= 0 || v.monitoredRatePct >= 100) return 'Monitored threshold must be between 0 and 100.';
    if (!Number.isFinite(v.excessiveRatePct) || v.excessiveRatePct <= v.monitoredRatePct || v.excessiveRatePct >= 100) return 'Excessive threshold must be higher than monitored threshold and below 100.';
    if (!Number.isFinite(v.monitoredCountThreshold) || v.monitoredCountThreshold < 0) return 'Monthly dispute-count warning threshold must be 0 or above.';
    return '';
  }

  function classifyStatus(result) {
    if (result.sameMonthRatePct >= result.excessiveRatePct || result.laggedRatePct >= result.excessiveRatePct) {
      return {
        key: 'excessive',
        label: 'Excessive threshold breached',
        tone: 'warn'
      };
    }
    if (result.sameMonthRatePct >= result.monitoredRatePct || result.laggedRatePct >= result.monitoredRatePct) {
      return {
        key: 'ratio',
        label: 'Ratio threshold breached',
        tone: 'warn'
      };
    }
    if (result.chargebacks >= result.monitoredCountThreshold) {
      return {
        key: 'count',
        label: 'Count threshold breached',
        tone: 'warn'
      };
    }
    return {
      key: 'safe',
      label: 'Safely below monitored threshold',
      tone: 'ok'
    };
  }

  function compute(input) {
    var error = validateInput(input);
    if (error) throw new Error(error);

    var chargebacks = toNumber(input.chargebacks);
    var transactionsCurrent = toNumber(input.transactionsCurrent);
    var transactionsPrevious = toNumber(input.transactionsPrevious);
    var averageOrderValue = toNumber(input.averageOrderValue);
    var chargebackFee = toNumber(input.chargebackFee);
    var recoveryRate = toNumber(input.recoveryRate);
    var monitoredRatePct = toNumber(input.monitoredRatePct);
    var excessiveRatePct = toNumber(input.excessiveRatePct);
    var monitoredCountThreshold = toNumber(input.monitoredCountThreshold);

    var sameMonthRatePct = (chargebacks / transactionsCurrent) * 100;
    var laggedRatePct = (chargebacks / transactionsPrevious) * 100;

    var maxDisputesMonitoredCurrent = Math.floor(transactionsCurrent * monitoredRatePct / 100);
    var maxDisputesMonitoredLagged = Math.floor(transactionsPrevious * monitoredRatePct / 100);
    var maxDisputesExcessiveCurrent = Math.floor(transactionsCurrent * excessiveRatePct / 100);
    var maxDisputesExcessiveLagged = Math.floor(transactionsPrevious * excessiveRatePct / 100);

    var headroomMonitoredCurrent = maxDisputesMonitoredCurrent - chargebacks;
    var headroomMonitoredLagged = maxDisputesMonitoredLagged - chargebacks;
    var headroomExcessiveCurrent = maxDisputesExcessiveCurrent - chargebacks;
    var headroomExcessiveLagged = maxDisputesExcessiveLagged - chargebacks;
    var countHeadroom = monitoredCountThreshold - chargebacks;

    var transactionsNeededAtMonitored = chargebacks === 0 ? 0 : chargebacks / (monitoredRatePct / 100);
    var transactionsNeededAtExcessive = chargebacks === 0 ? 0 : chargebacks / (excessiveRatePct / 100);
    var currentTransactionBufferToMonitored = transactionsCurrent - transactionsNeededAtMonitored;
    var previousTransactionBufferToMonitored = transactionsPrevious - transactionsNeededAtMonitored;

    var grossDisputedVolume = chargebacks * averageOrderValue;
    var recoveredDisputedVolume = grossDisputedVolume * (recoveryRate / 100);
    var unrecoveredDisputedVolume = grossDisputedVolume - recoveredDisputedVolume;
    var feeBurn = chargebacks * chargebackFee;
    var monthlyExposure = unrecoveredDisputedVolume + feeBurn;
    var annualizedExposure = monthlyExposure * 12;

    var result = {
      chargebacks: chargebacks,
      transactionsCurrent: transactionsCurrent,
      transactionsPrevious: transactionsPrevious,
      averageOrderValue: averageOrderValue,
      chargebackFee: chargebackFee,
      recoveryRate: recoveryRate,
      monitoredRatePct: monitoredRatePct,
      excessiveRatePct: excessiveRatePct,
      monitoredCountThreshold: monitoredCountThreshold,
      sameMonthRatePct: sameMonthRatePct,
      laggedRatePct: laggedRatePct,
      maxDisputesMonitoredCurrent: maxDisputesMonitoredCurrent,
      maxDisputesMonitoredLagged: maxDisputesMonitoredLagged,
      maxDisputesExcessiveCurrent: maxDisputesExcessiveCurrent,
      maxDisputesExcessiveLagged: maxDisputesExcessiveLagged,
      headroomMonitoredCurrent: headroomMonitoredCurrent,
      headroomMonitoredLagged: headroomMonitoredLagged,
      headroomExcessiveCurrent: headroomExcessiveCurrent,
      headroomExcessiveLagged: headroomExcessiveLagged,
      countHeadroom: countHeadroom,
      transactionsNeededAtMonitored: transactionsNeededAtMonitored,
      transactionsNeededAtExcessive: transactionsNeededAtExcessive,
      currentTransactionBufferToMonitored: currentTransactionBufferToMonitored,
      previousTransactionBufferToMonitored: previousTransactionBufferToMonitored,
      grossDisputedVolume: grossDisputedVolume,
      recoveredDisputedVolume: recoveredDisputedVolume,
      unrecoveredDisputedVolume: unrecoveredDisputedVolume,
      feeBurn: feeBurn,
      monthlyExposure: monthlyExposure,
      annualizedExposure: annualizedExposure
    };

    var status = classifyStatus(result);
    result.statusKey = status.key;
    result.statusLabel = status.label;
    result.statusTone = status.tone;
    result.summary = buildSummary(result);
    return result;
  }

  function buildSummary(result) {
    function n(value, digits) {
      return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 2 : digits });
    }
    function money(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      }).format(Number.isFinite(value) ? value : 0);
    }

    return [
      '[Chargeback Threshold Summary]',
      'Current chargebacks: ' + n(result.chargebacks, 0),
      'Same-month ratio: ' + n(result.sameMonthRatePct, 3) + '%',
      'Lagged ratio: ' + n(result.laggedRatePct, 3) + '%',
      'Monitored threshold: ' + n(result.monitoredRatePct, 2) + '% / ' + n(result.monitoredCountThreshold, 0) + ' disputes',
      'Excessive threshold: ' + n(result.excessiveRatePct, 2) + '%',
      'Monitored headroom (current / lagged): ' + n(result.headroomMonitoredCurrent, 0) + ' / ' + n(result.headroomMonitoredLagged, 0),
      'Count threshold headroom: ' + n(result.countHeadroom, 0),
      'Transactions needed to sit at monitored threshold: ' + n(result.transactionsNeededAtMonitored, 0),
      'Monthly exposure: ' + money(result.monthlyExposure),
      'Annualized exposure: ' + money(result.annualizedExposure),
      'Status: ' + result.statusLabel
    ].join('\n');
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    validateInput: validateInput,
    compute: compute,
    buildSummary: buildSummary
  };
}));
