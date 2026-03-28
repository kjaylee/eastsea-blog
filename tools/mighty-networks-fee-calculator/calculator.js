(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MightyNetworksFeeCalculator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PLANS = [
    { id: 'launch', name: 'Launch', monthlyFee: 79, transactionRatePct: 2 },
    { id: 'scale', name: 'Scale', monthlyFee: 179, transactionRatePct: 1 },
    { id: 'growth', name: 'Growth', monthlyFee: 354, transactionRatePct: 0.5 }
  ];

  var PLAN_MAP = PLANS.reduce(function (acc, plan) {
    acc[plan.id] = plan;
    return acc;
  }, {});

  var DEFAULT_INPUTS = {
    monthlyGrossSales: 6000,
    successfulCharges: 120,
    refundRatePct: 3,
    processorRatePct: 2.9,
    processorFlatFee: 0.3,
    otherMonthlyCost: 500,
    desiredMonthlyNetProfit: 1500
  };

  function toNumber(value) {
    return Number(value);
  }

  function round(value, digits) {
    var factor = Math.pow(10, digits || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalizeInput(input) {
    return {
      monthlyGrossSales: toNumber(input.monthlyGrossSales),
      successfulCharges: toNumber(input.successfulCharges),
      refundRatePct: toNumber(input.refundRatePct),
      processorRatePct: toNumber(input.processorRatePct),
      processorFlatFee: toNumber(input.processorFlatFee),
      otherMonthlyCost: toNumber(input.otherMonthlyCost),
      desiredMonthlyNetProfit: toNumber(input.desiredMonthlyNetProfit)
    };
  }

  function validateInput(input) {
    var v = normalizeInput(input);

    if (!Number.isFinite(v.monthlyGrossSales) || v.monthlyGrossSales <= 0) {
      return 'Monthly gross sales must be greater than 0.';
    }
    if (!Number.isFinite(v.successfulCharges) || v.successfulCharges <= 0) {
      return 'Successful charges must be greater than 0.';
    }
    if (!Number.isFinite(v.refundRatePct) || v.refundRatePct < 0 || v.refundRatePct >= 100) {
      return 'Refund rate must be between 0 and 100 (excluding 100).';
    }
    if (!Number.isFinite(v.processorRatePct) || v.processorRatePct < 0 || v.processorRatePct >= 100) {
      return 'Processor fee rate must be between 0 and 100 (excluding 100).';
    }
    if (!Number.isFinite(v.processorFlatFee) || v.processorFlatFee < 0) {
      return 'Processor flat fee must be 0 or above.';
    }
    if (!Number.isFinite(v.otherMonthlyCost) || v.otherMonthlyCost < 0) {
      return 'Other monthly fixed cost must be 0 or above.';
    }
    if (!Number.isFinite(v.desiredMonthlyNetProfit) || v.desiredMonthlyNetProfit < 0) {
      return 'Desired monthly net profit must be 0 or above.';
    }
    return '';
  }

  function findPlanById(planId) {
    return PLAN_MAP[planId] || null;
  }

  function evaluatePlan(input, plan) {
    var gross = toNumber(input.monthlyGrossSales);
    var charges = toNumber(input.successfulCharges);
    var refundRate = toNumber(input.refundRatePct) / 100;
    var processorRate = toNumber(input.processorRatePct) / 100;
    var processorFlatFee = toNumber(input.processorFlatFee);
    var otherMonthlyCost = toNumber(input.otherMonthlyCost);
    var desiredMonthlyNetProfit = toNumber(input.desiredMonthlyNetProfit);
    var planRate = plan.transactionRatePct / 100;
    var avgChargeAmount = gross / charges;
    var refundLoss = gross * refundRate;
    var mightyTransactionFees = gross * planRate;
    var processorFees = gross * processorRate + charges * processorFlatFee;
    var takeHomeAfterPlatform = gross - refundLoss - plan.monthlyFee - mightyTransactionFees - processorFees;
    var netProfit = takeHomeAfterPlatform - otherMonthlyCost;
    var annualizedNetProfit = netProfit * 12;
    var effectiveFeeRatePct = gross > 0
      ? ((plan.monthlyFee + mightyTransactionFees + processorFees) / gross) * 100
      : 0;
    var flatFeeRate = avgChargeAmount > 0 ? (processorFlatFee / avgChargeAmount) : Number.POSITIVE_INFINITY;
    var contributionMarginRate = 1 - refundRate - planRate - processorRate - flatFeeRate;
    var breakEvenGross = contributionMarginRate > 0
      ? (plan.monthlyFee + otherMonthlyCost) / contributionMarginRate
      : null;
    var requiredGrossForTargetNet = contributionMarginRate > 0
      ? (plan.monthlyFee + otherMonthlyCost + desiredMonthlyNetProfit) / contributionMarginRate
      : null;

    return {
      planId: plan.id,
      planName: plan.name,
      monthlyFee: plan.monthlyFee,
      transactionRatePct: plan.transactionRatePct,
      avgChargeAmount: avgChargeAmount,
      refundLoss: refundLoss,
      mightyTransactionFees: mightyTransactionFees,
      processorFees: processorFees,
      takeHomeAfterPlatform: takeHomeAfterPlatform,
      netProfit: netProfit,
      annualizedNetProfit: annualizedNetProfit,
      effectiveFeeRatePct: effectiveFeeRatePct,
      contributionMarginRate: contributionMarginRate,
      breakEvenGross: breakEvenGross,
      requiredGrossForTargetNet: requiredGrossForTargetNet,
      otherMonthlyCost: otherMonthlyCost,
      desiredMonthlyNetProfit: desiredMonthlyNetProfit
    };
  }

  function getUpgradeThresholds() {
    return {
      launchToScaleGross: (179 - 79) / (0.02 - 0.01),
      scaleToGrowthGross: (354 - 179) / (0.01 - 0.005),
      launchToGrowthGross: (354 - 79) / (0.02 - 0.005)
    };
  }

  function pickBestPlan(scenarios) {
    return scenarios.reduce(function (best, current) {
      if (!best) return current;
      if (current.netProfit > best.netProfit) return current;
      if (current.netProfit === best.netProfit && current.monthlyFee < best.monthlyFee) return current;
      return best;
    }, null);
  }

  function buildSummary(result) {
    function n(value, digits) {
      return Number(value).toLocaleString('en-US', {
        maximumFractionDigits: digits == null ? 2 : digits
      });
    }
    function money(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      }).format(Number.isFinite(value) ? value : 0);
    }

    var best = result.bestPlan;
    var thresholds = result.upgradeThresholds;

    return [
      '[Mighty Networks Fee Calculator Summary]',
      'Monthly gross sales: ' + money(result.inputs.monthlyGrossSales),
      'Successful charges: ' + n(result.inputs.successfulCharges, 0),
      'Refund rate: ' + n(result.inputs.refundRatePct, 2) + '%',
      'Processor fee: ' + n(result.inputs.processorRatePct, 2) + '% + ' + money(result.inputs.processorFlatFee) + ' per charge',
      'Best plan right now: ' + best.planName,
      'Best-plan monthly net profit: ' + money(best.netProfit),
      'Best-plan take-home after platform: ' + money(best.takeHomeAfterPlatform),
      'Best-plan effective fee rate: ' + n(best.effectiveFeeRatePct, 2) + '%',
      'Best-plan break-even gross: ' + (best.breakEvenGross == null ? 'N/A' : money(best.breakEvenGross)),
      'Gross needed for target net: ' + (best.requiredGrossForTargetNet == null ? 'N/A' : money(best.requiredGrossForTargetNet)),
      'Upgrade thresholds: Launch→Scale ' + money(thresholds.launchToScaleGross) + ', Scale→Growth ' + money(thresholds.scaleToGrowthGross) + ', Launch→Growth ' + money(thresholds.launchToGrowthGross),
      'Note: plan fees use Mighty Networks public pricing (Launch $79 + 2%, Scale $179 + 1%, Growth $354 + 0.5%). Processor fees are your planning assumptions.'
    ].join('\n');
  }

  function compute(input) {
    var error = validateInput(input);
    if (error) {
      throw new Error(error);
    }

    var normalized = normalizeInput(input);
    var scenarios = PLANS.map(function (plan) {
      return evaluatePlan(normalized, plan);
    });
    var bestPlan = pickBestPlan(scenarios);
    var thresholds = getUpgradeThresholds();

    return {
      inputs: normalized,
      plans: scenarios,
      bestPlan: bestPlan,
      upgradeThresholds: thresholds,
      summary: buildSummary({
        inputs: normalized,
        bestPlan: bestPlan,
        upgradeThresholds: thresholds
      })
    };
  }

  return {
    PLANS: PLANS,
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    validateInput: validateInput,
    findPlanById: findPlanById,
    evaluatePlan: evaluatePlan,
    getUpgradeThresholds: getUpgradeThresholds,
    pickBestPlan: pickBestPlan,
    buildSummary: buildSummary,
    compute: compute
  };
}));
