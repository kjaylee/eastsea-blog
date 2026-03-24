(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.CreatorMembershipPlatformFeeComparatorCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    membershipPrice: 10,
    activeMembers: 100,
    refundRate: 5,
    directOpsCost: 29,
    appStoreSmallBusiness: false,
    appStoreLongTermSharePct: 20,
    directStripeFeeRate: 2.9,
    directStripeFixedFee: 0.30,
    patreonPlatformFeeRate: 10,
    patreonProcessingFeeRate: 2.9,
    patreonProcessingFixedFee: 0.30,
    substackPlatformFeeRate: 10,
    substackProcessingFeeRate: 2.9,
    substackProcessingFixedFee: 0.30,
    substackRecurringBillingFeeRate: 0.7,
    appStoreStandardCommissionRate: 30,
    appStoreReducedCommissionRate: 15,
  };

  const FIELD_META = {
    membershipPrice: { type: 'number', minExclusive: 0, label: 'membershipPrice' },
    activeMembers: { type: 'integer', minExclusive: 0, label: 'activeMembers' },
    refundRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'refundRate' },
    directOpsCost: { type: 'number', minInclusive: 0, label: 'directOpsCost' },
    appStoreSmallBusiness: { type: 'boolean', label: 'appStoreSmallBusiness' },
    appStoreLongTermSharePct: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appStoreLongTermSharePct' },
    directStripeFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'directStripeFeeRate' },
    directStripeFixedFee: { type: 'number', minInclusive: 0, label: 'directStripeFixedFee' },
    patreonPlatformFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'patreonPlatformFeeRate' },
    patreonProcessingFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'patreonProcessingFeeRate' },
    patreonProcessingFixedFee: { type: 'number', minInclusive: 0, label: 'patreonProcessingFixedFee' },
    substackPlatformFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'substackPlatformFeeRate' },
    substackProcessingFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'substackProcessingFeeRate' },
    substackProcessingFixedFee: { type: 'number', minInclusive: 0, label: 'substackProcessingFixedFee' },
    substackRecurringBillingFeeRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'substackRecurringBillingFeeRate' },
    appStoreStandardCommissionRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appStoreStandardCommissionRate' },
    appStoreReducedCommissionRate: { type: 'rate', minInclusive: 0, maxInclusive: 100, label: 'appStoreReducedCommissionRate' },
  };

  const PLATFORM_ORDER = ['directStripe', 'patreon', 'substack', 'appStore'];
  const PLATFORM_LABELS = {
    directStripe: 'Direct Stripe',
    patreon: 'Patreon',
    substack: 'Substack',
    appStore: 'App Store',
  };

  function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
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
      const value = source[field];

      if (meta.type === 'boolean') {
        values[field] = Boolean(value);
        return;
      }

      const num = toFiniteNumber(value);
      if (num == null) {
        errors.push(meta.label + ' must be a valid number.');
        return;
      }
      if (meta.type === 'integer' && !Number.isInteger(num)) {
        errors.push(meta.label + ' must be an integer.');
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

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function computeAppStoreEffectiveCommissionRate(values) {
    if (values.appStoreSmallBusiness) {
      return values.appStoreReducedCommissionRate;
    }
    const longTermShare = values.appStoreLongTermSharePct / 100;
    return (values.appStoreStandardCommissionRate * (1 - longTermShare)) + (values.appStoreReducedCommissionRate * longTermShare);
  }

  function computePriceToMatchDirect(targetTakeHome, values, config) {
    const refundKeepFactor = 1 - (values.refundRate / 100);
    const variableKeepFactor = 1 - (config.variableRate / 100);
    const denominator = values.activeMembers * refundKeepFactor * variableKeepFactor;
    if (!(denominator > 0)) {
      return null;
    }
    return (targetTakeHome + (values.activeMembers * config.fixedFeePerTxn) + config.monthlyExtraCost) / denominator;
  }

  function calculateAll(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        input: null,
      };
    }

    const values = validation.values;
    const grossMonthlyBillings = values.membershipPrice * values.activeMembers;
    const refundedBillings = grossMonthlyBillings * (values.refundRate / 100);
    const netBillingsAfterRefunds = grossMonthlyBillings - refundedBillings;
    const transactionCount = values.activeMembers;
    const appStoreEffectiveCommissionRate = computeAppStoreEffectiveCommissionRate(values);

    const directVariableFees = netBillingsAfterRefunds * (values.directStripeFeeRate / 100);
    const directFixedFees = transactionCount * values.directStripeFixedFee;
    const directFees = directVariableFees + directFixedFees + values.directOpsCost;
    const directNetTakeHome = netBillingsAfterRefunds - directFees;

    const patreonTotalRate = values.patreonPlatformFeeRate + values.patreonProcessingFeeRate;
    const patreonVariableFees = netBillingsAfterRefunds * (patreonTotalRate / 100);
    const patreonFixedFees = transactionCount * values.patreonProcessingFixedFee;
    const patreonFees = patreonVariableFees + patreonFixedFees;
    const patreonNetTakeHome = netBillingsAfterRefunds - patreonFees;

    const substackTotalRate = values.substackPlatformFeeRate + values.substackProcessingFeeRate + values.substackRecurringBillingFeeRate;
    const substackVariableFees = netBillingsAfterRefunds * (substackTotalRate / 100);
    const substackFixedFees = transactionCount * values.substackProcessingFixedFee;
    const substackFees = substackVariableFees + substackFixedFees;
    const substackNetTakeHome = netBillingsAfterRefunds - substackFees;

    const appStoreFees = netBillingsAfterRefunds * (appStoreEffectiveCommissionRate / 100);
    const appStoreNetTakeHome = netBillingsAfterRefunds - appStoreFees;

    const patreonDeltaVsDirect = patreonNetTakeHome - directNetTakeHome;
    const substackDeltaVsDirect = substackNetTakeHome - directNetTakeHome;
    const appStoreDeltaVsDirect = appStoreNetTakeHome - directNetTakeHome;

    const patreonPriceToMatchDirect = computePriceToMatchDirect(directNetTakeHome, values, {
      variableRate: patreonTotalRate,
      fixedFeePerTxn: values.patreonProcessingFixedFee,
      monthlyExtraCost: 0,
    });
    const substackPriceToMatchDirect = computePriceToMatchDirect(directNetTakeHome, values, {
      variableRate: substackTotalRate,
      fixedFeePerTxn: values.substackProcessingFixedFee,
      monthlyExtraCost: 0,
    });
    const appStorePriceToMatchDirect = computePriceToMatchDirect(directNetTakeHome, values, {
      variableRate: appStoreEffectiveCommissionRate,
      fixedFeePerTxn: 0,
      monthlyExtraCost: 0,
    });

    const platformResults = {
      directStripe: {
        key: 'directStripe',
        label: PLATFORM_LABELS.directStripe,
        totalFees: directFees,
        netTakeHome: directNetTakeHome,
        deltaVsDirect: 0,
        annualDeltaVsDirect: 0,
        priceToMatchDirect: values.membershipPrice,
        requiredPriceLiftPct: 0,
        variableRate: values.directStripeFeeRate,
        fixedFeePerTxn: values.directStripeFixedFee,
        monthlyExtraCost: values.directOpsCost,
        assumptionNote: 'Includes direct Stripe variable fees, per-member fixed fees, and your direct ops cost.',
      },
      patreon: {
        key: 'patreon',
        label: PLATFORM_LABELS.patreon,
        totalFees: patreonFees,
        netTakeHome: patreonNetTakeHome,
        deltaVsDirect: patreonDeltaVsDirect,
        annualDeltaVsDirect: patreonDeltaVsDirect * 12,
        priceToMatchDirect: patreonPriceToMatchDirect,
        requiredPriceLiftPct: patreonPriceToMatchDirect == null ? null : ((patreonPriceToMatchDirect / values.membershipPrice) - 1) * 100,
        variableRate: patreonTotalRate,
        fixedFeePerTxn: values.patreonProcessingFixedFee,
        monthlyExtraCost: 0,
        assumptionNote: 'Baseline web Patreon assumption: platform fee plus payment processing. iOS Patreon path is excluded in v1.',
      },
      substack: {
        key: 'substack',
        label: PLATFORM_LABELS.substack,
        totalFees: substackFees,
        netTakeHome: substackNetTakeHome,
        deltaVsDirect: substackDeltaVsDirect,
        annualDeltaVsDirect: substackDeltaVsDirect * 12,
        priceToMatchDirect: substackPriceToMatchDirect,
        requiredPriceLiftPct: substackPriceToMatchDirect == null ? null : ((substackPriceToMatchDirect / values.membershipPrice) - 1) * 100,
        variableRate: substackTotalRate,
        fixedFeePerTxn: values.substackProcessingFixedFee,
        monthlyExtraCost: 0,
        assumptionNote: 'Baseline Substack assumption: platform fee, Stripe-style processing, and recurring billing fee.',
      },
      appStore: {
        key: 'appStore',
        label: PLATFORM_LABELS.appStore,
        totalFees: appStoreFees,
        netTakeHome: appStoreNetTakeHome,
        deltaVsDirect: appStoreDeltaVsDirect,
        annualDeltaVsDirect: appStoreDeltaVsDirect * 12,
        priceToMatchDirect: appStorePriceToMatchDirect,
        requiredPriceLiftPct: appStorePriceToMatchDirect == null ? null : ((appStorePriceToMatchDirect / values.membershipPrice) - 1) * 100,
        variableRate: appStoreEffectiveCommissionRate,
        fixedFeePerTxn: 0,
        monthlyExtraCost: 0,
        assumptionNote: 'App Store uses an effective commission approximation based on Small Business status or long-term subscriber share.',
      },
    };

    const rankedPlatforms = PLATFORM_ORDER
      .map(function (key) { return platformResults[key]; })
      .sort(function (left, right) {
        if (right.netTakeHome !== left.netTakeHome) {
          return right.netTakeHome - left.netTakeHome;
        }
        return PLATFORM_ORDER.indexOf(left.key) - PLATFORM_ORDER.indexOf(right.key);
      });

    const bestPlatform = rankedPlatforms[0].key;
    const bestPlatformNetTakeHome = rankedPlatforms[0].netTakeHome;

    return {
      ok: true,
      input: values,
      grossMonthlyBillings: roundTo(grossMonthlyBillings, 6),
      refundedBillings: roundTo(refundedBillings, 6),
      netBillingsAfterRefunds: roundTo(netBillingsAfterRefunds, 6),
      transactionCount: transactionCount,
      appStoreEffectiveCommissionRate: roundTo(appStoreEffectiveCommissionRate, 6),
      directNetTakeHome: roundTo(directNetTakeHome, 6),
      patreonNetTakeHome: roundTo(patreonNetTakeHome, 6),
      substackNetTakeHome: roundTo(substackNetTakeHome, 6),
      appStoreNetTakeHome: roundTo(appStoreNetTakeHome, 6),
      bestPlatform: bestPlatform,
      bestPlatformLabel: PLATFORM_LABELS[bestPlatform],
      bestPlatformNetTakeHome: roundTo(bestPlatformNetTakeHome, 6),
      patreonDeltaVsDirect: roundTo(patreonDeltaVsDirect, 6),
      substackDeltaVsDirect: roundTo(substackDeltaVsDirect, 6),
      appStoreDeltaVsDirect: roundTo(appStoreDeltaVsDirect, 6),
      patreonAnnualDeltaVsDirect: roundTo(patreonDeltaVsDirect * 12, 6),
      substackAnnualDeltaVsDirect: roundTo(substackDeltaVsDirect * 12, 6),
      appStoreAnnualDeltaVsDirect: roundTo(appStoreDeltaVsDirect * 12, 6),
      patreonPriceToMatchDirect: patreonPriceToMatchDirect == null ? null : roundTo(patreonPriceToMatchDirect, 6),
      substackPriceToMatchDirect: substackPriceToMatchDirect == null ? null : roundTo(substackPriceToMatchDirect, 6),
      appStorePriceToMatchDirect: appStorePriceToMatchDirect == null ? null : roundTo(appStorePriceToMatchDirect, 6),
      patreonRequiredPriceLiftPct: platformResults.patreon.requiredPriceLiftPct == null ? null : roundTo(platformResults.patreon.requiredPriceLiftPct, 6),
      substackRequiredPriceLiftPct: platformResults.substack.requiredPriceLiftPct == null ? null : roundTo(platformResults.substack.requiredPriceLiftPct, 6),
      appStoreRequiredPriceLiftPct: platformResults.appStore.requiredPriceLiftPct == null ? null : roundTo(platformResults.appStore.requiredPriceLiftPct, 6),
      platforms: platformResults,
      rankedPlatforms: rankedPlatforms.map(function (platform) {
        return Object.assign({}, platform, {
          totalFees: roundTo(platform.totalFees, 6),
          netTakeHome: roundTo(platform.netTakeHome, 6),
          deltaVsDirect: roundTo(platform.deltaVsDirect, 6),
          annualDeltaVsDirect: roundTo(platform.annualDeltaVsDirect, 6),
          priceToMatchDirect: platform.priceToMatchDirect == null ? null : roundTo(platform.priceToMatchDirect, 6),
          requiredPriceLiftPct: platform.requiredPriceLiftPct == null ? null : roundTo(platform.requiredPriceLiftPct, 6),
          variableRate: roundTo(platform.variableRate, 6),
          fixedFeePerTxn: roundTo(platform.fixedFeePerTxn, 6),
          monthlyExtraCost: roundTo(platform.monthlyExtraCost, 6),
        });
      }),
    };
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    PLATFORM_LABELS: PLATFORM_LABELS,
    validateInputs: validateInputs,
    computeAppStoreEffectiveCommissionRate: computeAppStoreEffectiveCommissionRate,
    computePriceToMatchDirect: computePriceToMatchDirect,
    calculateAll: calculateAll,
    roundTo: roundTo,
  };
});
