(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GooglePlayNetRevenueCalculator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function toNumber(value) {
    return Number(value);
  }

  function validateInput(input) {
    var v = {
      grossCustomerSpend: toNumber(input.grossCustomerSpend),
      vatRate: toNumber(input.vatRate),
      refundRate: toNumber(input.refundRate),
      productType: input.productType,
      enrolledTier15: Boolean(input.enrolledTier15),
      ytdEarnings: toNumber(input.ytdEarnings),
      thresholdCap: toNumber(input.thresholdCap),
      operatingCost: toNumber(input.operatingCost),
      uaSpend: toNumber(input.uaSpend)
    };

    if (!Number.isFinite(v.grossCustomerSpend) || v.grossCustomerSpend < 0) return 'Projected gross customer spend must be 0 or above.';
    if (!Number.isFinite(v.thresholdCap) || v.thresholdCap <= 0) return 'Threshold cap must be greater than 0.';
    if (!Number.isFinite(v.ytdEarnings) || v.ytdEarnings < 0) return 'YTD earnings must be 0 or above.';
    if (!Number.isFinite(v.operatingCost) || v.operatingCost < 0) return 'Operating cost must be 0 or above.';
    if (!Number.isFinite(v.uaSpend) || v.uaSpend < 0) return 'UA spend must be 0 or above.';
    if (!Number.isFinite(v.vatRate) || v.vatRate < 0 || v.vatRate > 100) return 'VAT/GST rate must be between 0 and 100.';
    if (!Number.isFinite(v.refundRate) || v.refundRate < 0 || v.refundRate > 100) return 'Refund rate must be between 0 and 100.';
    if (v.productType !== 'standard' && v.productType !== 'subscription') return 'Product type must be standard or subscription.';
    return '';
  }

  function compute(input) {
    var error = validateInput(input);
    if (error) {
      throw new Error(error);
    }

    var grossCustomerSpend = toNumber(input.grossCustomerSpend);
    var vatRate = toNumber(input.vatRate);
    var refundRate = toNumber(input.refundRate);
    var productType = input.productType;
    var enrolledTier15 = Boolean(input.enrolledTier15);
    var ytdEarnings = toNumber(input.ytdEarnings);
    var thresholdCap = toNumber(input.thresholdCap);
    var operatingCost = toNumber(input.operatingCost);
    var uaSpend = toNumber(input.uaSpend);

    var revenueExVat = grossCustomerSpend / (1 + vatRate / 100);
    var feeBearingRevenue = revenueExVat * (1 - refundRate / 100);

    var lowerTierRevenue = 0;
    var upperTierRevenue = 0;

    if (productType === 'subscription') {
      lowerTierRevenue = feeBearingRevenue;
      upperTierRevenue = 0;
    } else if (!enrolledTier15) {
      lowerTierRevenue = 0;
      upperTierRevenue = feeBearingRevenue;
    } else {
      var remainingTierRunway = Math.max(0, thresholdCap - ytdEarnings);
      lowerTierRevenue = Math.min(feeBearingRevenue, remainingTierRunway);
      upperTierRevenue = Math.max(0, feeBearingRevenue - lowerTierRevenue);
    }

    var lowerTierFee = lowerTierRevenue * 0.15;
    var upperTierFee = upperTierRevenue * 0.30;
    var googleFeeAmount = lowerTierFee + upperTierFee;
    var netProceedsBeforeCosts = feeBearingRevenue - googleFeeAmount;
    var totalCost = operatingCost + uaSpend;
    var netProfit = netProceedsBeforeCosts - totalCost;
    var blendedFeeRate = feeBearingRevenue > 0 ? (googleFeeAmount / feeBearingRevenue) * 100 : 0;

    var thresholdAfterScenario = productType === 'subscription'
      ? Math.max(0, thresholdCap - ytdEarnings)
      : Math.max(0, thresholdCap - (ytdEarnings + feeBearingRevenue));
    var exceededAmount = productType === 'subscription'
      ? Math.max(0, ytdEarnings - thresholdCap)
      : Math.max(0, ytdEarnings + feeBearingRevenue - thresholdCap);
    var runwayState = productType === 'subscription'
      ? 'not_applicable'
      : (!enrolledTier15 ? 'tier_disabled' : (exceededAmount > 0 ? 'exceeded' : 'remaining'));

    return {
      grossCustomerSpend: grossCustomerSpend,
      revenueExVat: revenueExVat,
      feeBearingRevenue: feeBearingRevenue,
      lowerTierRevenue: lowerTierRevenue,
      upperTierRevenue: upperTierRevenue,
      lowerTierFee: lowerTierFee,
      upperTierFee: upperTierFee,
      googleFeeAmount: googleFeeAmount,
      blendedFeeRate: blendedFeeRate,
      netProceedsBeforeCosts: netProceedsBeforeCosts,
      operatingCost: operatingCost,
      uaSpend: uaSpend,
      totalCost: totalCost,
      netProfit: netProfit,
      remainingTierRunway: thresholdAfterScenario,
      exceededAmount: exceededAmount,
      runwayState: runwayState,
      thresholdCap: thresholdCap,
      ytdEarnings: ytdEarnings,
      productType: productType,
      enrolledTier15: enrolledTier15
    };
  }

  return {
    compute: compute,
    validateInput: validateInput
  };
}));
