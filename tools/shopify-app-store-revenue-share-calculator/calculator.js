(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ShopifyAppStoreRevenueShareCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    ytdRecognizedRevenueBeforeMonth: 780000,
    monthlyGrossAppRevenue: 85000,
    refundRatePct: 3.5,
    processingFeeRatePct: 2.9,
    taxReserveRatePct: 12,
    monthlyOperatingCost: 9000,
    thresholdUsd: 1000000,
    revenueShareRatePct: 15,
  };

  const FIELD_META = {
    ytdRecognizedRevenueBeforeMonth: { type: 'number', minInclusive: 0, label: 'ytdRecognizedRevenueBeforeMonth' },
    monthlyGrossAppRevenue: { type: 'number', minInclusive: 0, label: 'monthlyGrossAppRevenue' },
    refundRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'refundRatePct' },
    processingFeeRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'processingFeeRatePct' },
    taxReserveRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'taxReserveRatePct' },
    monthlyOperatingCost: { type: 'number', minInclusive: 0, label: 'monthlyOperatingCost' },
    thresholdUsd: { type: 'number', minExclusive: 0, label: 'thresholdUsd' },
    revenueShareRatePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'revenueShareRatePct' },
  };

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
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
    const values = {};
    const errors = [];

    Object.keys(FIELD_META).forEach(function (field) {
      const meta = FIELD_META[field];
      const num = toFiniteNumber(source[field]);
      if (num == null) {
        errors.push(meta.label + ' must be a valid number.');
        return;
      }
      if (meta.minExclusive != null && !(num > meta.minExclusive)) {
        errors.push(meta.label + ' must be greater than ' + meta.minExclusive + '.');
        return;
      }
      if (meta.minInclusive != null && !(num >= meta.minInclusive)) {
        errors.push(meta.label + ' must be at least ' + meta.minInclusive + '.');
        return;
      }
      if (meta.maxInclusive != null && !(num <= meta.maxInclusive)) {
        errors.push(meta.label + ' must be at most ' + meta.maxInclusive + '.');
        return;
      }
      values[field] = num;
    });

    if (
      Number.isFinite(values.taxReserveRatePct) &&
      Number.isFinite(values.revenueShareRatePct) &&
      values.taxReserveRatePct + values.revenueShareRatePct >= 100
    ) {
      errors.push('taxReserveRatePct + revenueShareRatePct must stay below 100 so post-threshold take-home can exist.');
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return roundTo(value, 2).toFixed(2) + '%';
  }

  function computeTierSplit(ytdRecognizedRevenueBeforeMonth, recognizedRevenue, thresholdUsd) {
    const runwayBeforeMonth = Math.max(0, thresholdUsd - ytdRecognizedRevenueBeforeMonth);
    const zeroShareRecognizedRevenue = Math.min(recognizedRevenue, runwayBeforeMonth);
    const sharedRecognizedRevenue = Math.max(0, recognizedRevenue - zeroShareRecognizedRevenue);
    let band = 'within-threshold';

    if (ytdRecognizedRevenueBeforeMonth >= thresholdUsd) {
      band = 'above-threshold';
    } else if (sharedRecognizedRevenue > 0) {
      band = 'crosses-threshold';
    }

    return {
      runwayBeforeMonth: runwayBeforeMonth,
      zeroShareRecognizedRevenue: zeroShareRecognizedRevenue,
      sharedRecognizedRevenue: sharedRecognizedRevenue,
      band: band,
    };
  }

  function computeBreakEvenMonthlyGross(values) {
    const ops = values.monthlyOperatingCost;
    if (ops === 0) {
      return 0;
    }

    const refundKeepFactor = 1 - (values.refundRatePct / 100);
    const processingRate = values.processingFeeRatePct / 100;
    const taxReserveRate = values.taxReserveRatePct / 100;
    const shareRate = values.revenueShareRatePct / 100;

    if (refundKeepFactor <= 0) {
      return null;
    }

    const beforeThresholdContribution = refundKeepFactor * (1 - taxReserveRate) - processingRate;
    const afterThresholdContribution = refundKeepFactor * (1 - taxReserveRate - shareRate) - processingRate;

    if (values.ytdRecognizedRevenueBeforeMonth >= values.thresholdUsd) {
      if (afterThresholdContribution <= 0) {
        return null;
      }
      return ops / afterThresholdContribution;
    }

    if (beforeThresholdContribution <= 0) {
      return null;
    }

    const runwayRecognizedRevenue = Math.max(0, values.thresholdUsd - values.ytdRecognizedRevenueBeforeMonth);
    const grossToThreshold = runwayRecognizedRevenue / refundKeepFactor;
    const breakEvenBeforeThreshold = ops / beforeThresholdContribution;

    if (breakEvenBeforeThreshold <= grossToThreshold) {
      return breakEvenBeforeThreshold;
    }

    if (afterThresholdContribution <= 0) {
      return null;
    }

    const contributionBeforeThreshold = grossToThreshold * beforeThresholdContribution;
    const remainingOps = ops - contributionBeforeThreshold;
    return grossToThreshold + (remainingOps / afterThresholdContribution);
  }

  function buildInsight(result) {
    if (result.monthlyGrossAppRevenue <= 0) {
      return 'Enter monthly gross app revenue to estimate take-home and the current break-even monthly revenue.';
    }

    if (result.band === 'within-threshold') {
      return 'This month stays inside Shopify App Store\'s 0% revenue-share band. Current drag comes from refunds, processing, tax reserve, and operating cost only.';
    }

    if (result.band === 'crosses-threshold') {
      return 'This month partially crosses the first $1M recognized-revenue band, so only the post-threshold portion is charged the 15% Shopify revenue share.';
    }

    if (result.monthlyTakeHome < 0 && result.breakEvenMonthlyRevenue != null) {
      return 'You are already above the 0% band, and the current month is below take-home break-even. Use the break-even revenue target to size the next month.';
    }

    return 'You are already above the 0% band, so the full recognized revenue for this month is modeled with Shopify\'s post-threshold revenue-share rate.';
  }

  function buildSummary(result) {
    return [
      '[Shopify App Store Revenue Share Calculator Summary]',
      'YTD recognized revenue before month: ' + formatMoney(result.ytdRecognizedRevenueBeforeMonth),
      'Monthly gross app revenue: ' + formatMoney(result.monthlyGrossAppRevenue),
      'Recognized revenue after refunds: ' + formatMoney(result.recognizedRevenue),
      '0% band runway before month: ' + formatMoney(result.runwayBeforeMonth),
      'Recognized revenue at 0% band: ' + formatMoney(result.zeroShareRecognizedRevenue),
      'Recognized revenue at revenue-share band: ' + formatMoney(result.sharedRecognizedRevenue),
      'Shopify revenue share fee: ' + formatMoney(result.revenueShareFee),
      'Processing fees: ' + formatMoney(result.processingFees),
      'Tax reserve: ' + formatMoney(result.taxReserve),
      'Monthly operating cost: ' + formatMoney(result.monthlyOperatingCost),
      'Monthly take-home: ' + formatMoney(result.monthlyTakeHome),
      'Effective total take rate: ' + formatPercent(result.effectiveTotalTakeRatePct),
      'Break-even monthly gross revenue: ' + (result.breakEvenMonthlyRevenue == null ? 'Not reachable with current assumptions' : formatMoney(result.breakEvenMonthlyRevenue)),
      'Band status: ' + result.band,
      'Note: Planning estimate only. Tax reserve and payment processing vary by entity, processor, and contract.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        input: null,
        result: null,
      };
    }

    const values = validation.values;
    const refundRate = values.refundRatePct / 100;
    const processingRate = values.processingFeeRatePct / 100;
    const taxReserveRate = values.taxReserveRatePct / 100;
    const shareRate = values.revenueShareRatePct / 100;

    const refundAmount = values.monthlyGrossAppRevenue * refundRate;
    const recognizedRevenue = values.monthlyGrossAppRevenue - refundAmount;
    const tierSplit = computeTierSplit(
      values.ytdRecognizedRevenueBeforeMonth,
      recognizedRevenue,
      values.thresholdUsd
    );
    const processingFees = values.monthlyGrossAppRevenue * processingRate;
    const revenueShareFee = tierSplit.sharedRecognizedRevenue * shareRate;
    const taxReserve = recognizedRevenue * taxReserveRate;
    const totalCost = refundAmount + processingFees + taxReserve + revenueShareFee + values.monthlyOperatingCost;
    const monthlyTakeHome = values.monthlyGrossAppRevenue - totalCost;
    const effectiveTotalTakeRatePct = values.monthlyGrossAppRevenue > 0
      ? (totalCost / values.monthlyGrossAppRevenue) * 100
      : 0;
    const takeHomeMarginPct = values.monthlyGrossAppRevenue > 0
      ? (monthlyTakeHome / values.monthlyGrossAppRevenue) * 100
      : 0;
    const blendedRevenueShareRatePct = recognizedRevenue > 0
      ? (revenueShareFee / recognizedRevenue) * 100
      : 0;
    const breakEvenMonthlyRevenue = computeBreakEvenMonthlyGross(values);
    const runwayAfterMonth = Math.max(0, values.thresholdUsd - (values.ytdRecognizedRevenueBeforeMonth + recognizedRevenue));

    const result = {
      ytdRecognizedRevenueBeforeMonth: roundTo(values.ytdRecognizedRevenueBeforeMonth, 10),
      monthlyGrossAppRevenue: roundTo(values.monthlyGrossAppRevenue, 10),
      refundRatePct: roundTo(values.refundRatePct, 10),
      processingFeeRatePct: roundTo(values.processingFeeRatePct, 10),
      taxReserveRatePct: roundTo(values.taxReserveRatePct, 10),
      monthlyOperatingCost: roundTo(values.monthlyOperatingCost, 10),
      thresholdUsd: roundTo(values.thresholdUsd, 10),
      revenueShareRatePct: roundTo(values.revenueShareRatePct, 10),
      refundAmount: roundTo(refundAmount, 10),
      recognizedRevenue: roundTo(recognizedRevenue, 10),
      runwayBeforeMonth: roundTo(tierSplit.runwayBeforeMonth, 10),
      runwayAfterMonth: roundTo(runwayAfterMonth, 10),
      zeroShareRecognizedRevenue: roundTo(tierSplit.zeroShareRecognizedRevenue, 10),
      sharedRecognizedRevenue: roundTo(tierSplit.sharedRecognizedRevenue, 10),
      revenueShareFee: roundTo(revenueShareFee, 10),
      processingFees: roundTo(processingFees, 10),
      taxReserve: roundTo(taxReserve, 10),
      totalCost: roundTo(totalCost, 10),
      monthlyTakeHome: roundTo(monthlyTakeHome, 10),
      effectiveTotalTakeRatePct: roundTo(effectiveTotalTakeRatePct, 10),
      takeHomeMarginPct: roundTo(takeHomeMarginPct, 10),
      blendedRevenueShareRatePct: roundTo(blendedRevenueShareRatePct, 10),
      breakEvenMonthlyRevenue: breakEvenMonthlyRevenue == null ? null : roundTo(breakEvenMonthlyRevenue, 10),
      band: tierSplit.band,
    };

    result.insight = buildInsight(result);
    result.summary = buildSummary(result);

    return {
      ok: true,
      errors: [],
      input: values,
      result: result,
    };
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    FIELD_META: FIELD_META,
    validateInputs: validateInputs,
    computeTierSplit: computeTierSplit,
    computeBreakEvenMonthlyGross: computeBreakEvenMonthlyGross,
    buildInsight: buildInsight,
    buildSummary: buildSummary,
    calculate: calculate,
    roundTo: roundTo,
    formatMoney: formatMoney,
    formatPercent: formatPercent,
  };
});
