(function (root) {
  'use strict';

  var SOURCE_REVIEWED_AT = '2026-03-27';

  var DEFAULTS = {
    salePrice: 99,
    transactions: 25,
    domesticSharePct: 70,
    internationalSharePct: 30,
    fxConversionSharePct: 20,
    billingEnabled: true,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    affiliateCommissionBasePct: 20,
    payoutMethod: 'none',
    sellerCostPerSale: 8,
    monthlyFixedCost: 250,
    processorDomesticPct: 2.7,
    processorFixedUsd: 0.30,
    internationalSurchargePct: 1.5,
    fxSurchargePct: 1.0,
    billingPct: 0.5,
    taxPct: 0.5,
    affiliateProcessingPct: 1.25
  };

  var PAYOUT_METHODS = {
    none: {
      id: 'none',
      label: 'No payout fee modeled',
      pct: 0,
      fixed: 0,
      assumption: 'No explicit payout fee applied. Useful when you do not want to model a withdrawal event yet.'
    },
    next_day_ach: {
      id: 'next_day_ach',
      label: 'Next day ACH',
      pct: 0,
      fixed: 2.5,
      assumption: 'Official docs list $2.50 per successful payout.'
    },
    instant_bank: {
      id: 'instant_bank',
      label: 'Instant Bank Deposit (RTP)',
      pct: 4,
      fixed: 1,
      assumption: 'Official docs list 4% + $1.00 per successful payout.'
    },
    crypto: {
      id: 'crypto',
      label: 'Crypto',
      pct: 5,
      fixed: 1,
      assumption: 'Official docs list 5% + $1.00 per successful payout.'
    },
    venmo: {
      id: 'venmo',
      label: 'Venmo',
      pct: 5,
      fixed: 1,
      assumption: 'Official docs list 5% + $1.00 per successful payout.'
    },
    wire: {
      id: 'wire',
      label: 'Bank wire',
      pct: 0,
      fixed: 23,
      assumption: 'Official docs list $23.00 per successful payout.'
    }
  };

  var SOURCE_URLS = [
    'https://docs.whop.com/fees',
    'https://help.whop.com/en/articles/10336276-what-are-our-fees',
    'https://help.whop.com/en/articles/10760877-whop-creator-payments-faq'
  ];

  var TEXT = {
    salePrice: 'Sale price must be a finite number greater than or equal to 0.',
    transactions: 'Transactions must be a whole number greater than or equal to 0.',
    shareRange: 'Share percentages must stay between 0% and 100%.',
    shareMix: 'Domestic share plus international share must equal 100%.',
    fxMix: 'FX conversion share cannot exceed the international share.',
    nonNegative: 'Costs and fixed dollar fees must be 0 or greater.',
    percentageRange: 'Fee percentage inputs must stay between 0% and 100%.',
    payoutMethod: 'Choose a supported payout method.',
    impossibleBreakEven: 'The current fee stack leaves no positive contribution margin, so break-even is impossible under these assumptions.'
  };

  var INPUT_MAX = 1000000;
  var SEARCH_MAX = 10000000;
  var BINARY_SEARCH_STEPS = 70;

  function round(value, digits) {
    var factor = Math.pow(10, digits);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function toPercent(value) {
    return Number(value) / 100;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatPercent(value) {
    return round2(value).toFixed(2) + '%';
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function normalizeInput(input) {
    var raw = input || {};
    return {
      salePrice: Number(raw.salePrice != null ? raw.salePrice : DEFAULTS.salePrice),
      transactions: Number(raw.transactions != null ? raw.transactions : DEFAULTS.transactions),
      domesticSharePct: Number(raw.domesticSharePct != null ? raw.domesticSharePct : DEFAULTS.domesticSharePct),
      internationalSharePct: Number(raw.internationalSharePct != null ? raw.internationalSharePct : DEFAULTS.internationalSharePct),
      fxConversionSharePct: Number(raw.fxConversionSharePct != null ? raw.fxConversionSharePct : DEFAULTS.fxConversionSharePct),
      billingEnabled: Boolean(raw.billingEnabled != null ? raw.billingEnabled : DEFAULTS.billingEnabled),
      taxRemittanceEnabled: Boolean(raw.taxRemittanceEnabled != null ? raw.taxRemittanceEnabled : DEFAULTS.taxRemittanceEnabled),
      affiliateEnabled: Boolean(raw.affiliateEnabled != null ? raw.affiliateEnabled : DEFAULTS.affiliateEnabled),
      affiliateCommissionBasePct: Number(raw.affiliateCommissionBasePct != null ? raw.affiliateCommissionBasePct : DEFAULTS.affiliateCommissionBasePct),
      payoutMethod: String(raw.payoutMethod != null ? raw.payoutMethod : DEFAULTS.payoutMethod),
      sellerCostPerSale: Number(raw.sellerCostPerSale != null ? raw.sellerCostPerSale : DEFAULTS.sellerCostPerSale),
      monthlyFixedCost: Number(raw.monthlyFixedCost != null ? raw.monthlyFixedCost : DEFAULTS.monthlyFixedCost),
      processorDomesticPct: Number(raw.processorDomesticPct != null ? raw.processorDomesticPct : DEFAULTS.processorDomesticPct),
      processorFixedUsd: Number(raw.processorFixedUsd != null ? raw.processorFixedUsd : DEFAULTS.processorFixedUsd),
      internationalSurchargePct: Number(raw.internationalSurchargePct != null ? raw.internationalSurchargePct : DEFAULTS.internationalSurchargePct),
      fxSurchargePct: Number(raw.fxSurchargePct != null ? raw.fxSurchargePct : DEFAULTS.fxSurchargePct),
      billingPct: Number(raw.billingPct != null ? raw.billingPct : DEFAULTS.billingPct),
      taxPct: Number(raw.taxPct != null ? raw.taxPct : DEFAULTS.taxPct),
      affiliateProcessingPct: Number(raw.affiliateProcessingPct != null ? raw.affiliateProcessingPct : DEFAULTS.affiliateProcessingPct)
    };
  }

  function validate(input) {
    if (!isFiniteNumber(input.salePrice) || input.salePrice < 0 || input.salePrice > INPUT_MAX) {
      return TEXT.salePrice;
    }

    if (!isFiniteNumber(input.transactions) || input.transactions < 0 || input.transactions > INPUT_MAX || !Number.isInteger(input.transactions)) {
      return TEXT.transactions;
    }

    if (!isFiniteNumber(input.domesticSharePct) || !isFiniteNumber(input.internationalSharePct) || !isFiniteNumber(input.fxConversionSharePct)) {
      return TEXT.shareRange;
    }

    if (input.domesticSharePct < 0 || input.domesticSharePct > 100 || input.internationalSharePct < 0 || input.internationalSharePct > 100 || input.fxConversionSharePct < 0 || input.fxConversionSharePct > 100) {
      return TEXT.shareRange;
    }

    if (Math.abs((input.domesticSharePct + input.internationalSharePct) - 100) > 0.0001) {
      return TEXT.shareMix;
    }

    if (input.fxConversionSharePct > input.internationalSharePct + 0.0001) {
      return TEXT.fxMix;
    }

    if (!PAYOUT_METHODS[input.payoutMethod]) {
      return TEXT.payoutMethod;
    }

    if (!isFiniteNumber(input.sellerCostPerSale) || input.sellerCostPerSale < 0 || !isFiniteNumber(input.monthlyFixedCost) || input.monthlyFixedCost < 0 || !isFiniteNumber(input.processorFixedUsd) || input.processorFixedUsd < 0) {
      return TEXT.nonNegative;
    }

    var pctFields = [
      input.affiliateCommissionBasePct,
      input.processorDomesticPct,
      input.internationalSurchargePct,
      input.fxSurchargePct,
      input.billingPct,
      input.taxPct,
      input.affiliateProcessingPct
    ];

    for (var i = 0; i < pctFields.length; i += 1) {
      if (!isFiniteNumber(pctFields[i]) || pctFields[i] < 0 || pctFields[i] > 100) {
        return TEXT.percentageRange;
      }
    }

    return '';
  }

  function resolvePayoutMethod(method) {
    return PAYOUT_METHODS[method] || PAYOUT_METHODS.none;
  }

  function calcPayoutFee(prePayoutTakeHome, payoutMethodId, transactionCount) {
    var payoutMethod = resolvePayoutMethod(payoutMethodId);
    if (!transactionCount || transactionCount <= 0) {
      return 0;
    }
    var payoutBase = Math.max(0, Number(prePayoutTakeHome) || 0);
    if (payoutBase <= 0) {
      return 0;
    }
    return round2((payoutBase * toPercent(payoutMethod.pct)) + payoutMethod.fixed);
  }

  function buildSummary(result) {
    var payout = result.payoutMethod;
    var lines = [
      'Whop Fee Calculator summary',
      'Reviewed official Whop docs: ' + SOURCE_REVIEWED_AT,
      'Sale price: ' + formatMoney(result.salePrice),
      'Transactions: ' + result.transactions,
      'Gross revenue: ' + formatMoney(result.grossRevenue),
      'Share mix: domestic ' + round2(result.domesticSharePct) + '% / international ' + round2(result.internationalSharePct) + '% / FX on ' + round2(result.fxConversionSharePct) + '% of total sales',
      'Modeled fee stack: ' + round2(result.processorDomesticPct) + '% + ' + formatMoney(result.processorFixedUsd) + ' cards, +' + round2(result.internationalSurchargePct) + '% international, +' + round2(result.fxSurchargePct) + '% FX, billing ' + (result.billingEnabled ? 'on' : 'off') + ', tax/remittance ' + (result.taxRemittanceEnabled ? 'on' : 'off') + ', affiliate processing ' + (result.affiliateEnabled ? 'on' : 'off'),
      'Payout assumption: ' + payout.label + ' (' + payout.assumption + ')',
      'Total payment + Whop fees: ' + formatMoney(result.totalFees) + ' (' + formatPercent(result.effectiveTakeRatePct) + ')',
      'Take-home before seller costs: ' + formatMoney(result.takeHomeBeforeSellerCosts),
      'Seller-side costs: ' + formatMoney(result.totalSellerCosts),
      'Net profit after seller costs: ' + formatMoney(result.netProfit) + ' (' + formatPercent(result.netMarginPct) + ')'
    ];

    if (result.affiliateEnabled && result.affiliateCommissionCost > 0) {
      lines.push('Seller-set affiliate commission payout: ' + formatMoney(result.affiliateCommissionCost) + ' (' + round2(result.affiliateCommissionBasePct) + '% of gross, not a Whop fee)');
    }

    if (result.breakEvenSalePrice == null) {
      lines.push('Break-even sale price: impossible under the current fee stack.');
    } else {
      lines.push('Break-even sale price: ' + formatMoney(result.breakEvenSalePrice) + ' per transaction.');
    }

    if (result.breakEvenTransactions == null) {
      lines.push('Break-even transactions at current price: impossible under the current fee stack.');
    } else {
      lines.push('Break-even transactions at current price: ' + result.breakEvenTransactions + '.');
    }

    lines.push('Not modeled: automation-only 3% platform fee, local-bank payout fees that vary by country, 3DS/Radar/disputes, financing, and custom enterprise pricing.');

    return lines.join('\n');
  }

  function computeCore(input) {
    var domesticShare = toPercent(input.domesticSharePct);
    var internationalShare = toPercent(input.internationalSharePct);
    var fxShare = toPercent(input.fxConversionSharePct);

    var grossRevenue = round2(input.salePrice * input.transactions);
    var processorRate = toPercent(input.processorDomesticPct);
    var internationalSurcharge = toPercent(input.internationalSurchargePct);
    var fxSurcharge = toPercent(input.fxSurchargePct);
    var billingRate = input.billingEnabled ? toPercent(input.billingPct) : 0;
    var taxRate = input.taxRemittanceEnabled ? toPercent(input.taxPct) : 0;
    var affiliateProcessingRate = input.affiliateEnabled ? toPercent(input.affiliateProcessingPct) : 0;
    var affiliateCommissionRate = input.affiliateEnabled ? toPercent(input.affiliateCommissionBasePct) : 0;

    var processorBaseFee = round2((grossRevenue * processorRate) + (input.transactions * input.processorFixedUsd));
    var internationalFee = round2(grossRevenue * internationalShare * internationalSurcharge);
    var fxFee = round2(grossRevenue * fxShare * fxSurcharge);
    var billingFee = round2(grossRevenue * billingRate);
    var taxFee = round2(grossRevenue * taxRate);
    var affiliateProcessingFee = round2(grossRevenue * affiliateProcessingRate);
    var prePayoutTakeHome = round2(grossRevenue - processorBaseFee - internationalFee - fxFee - billingFee - taxFee - affiliateProcessingFee);
    var payoutFee = calcPayoutFee(prePayoutTakeHome, input.payoutMethod, input.transactions);
    var totalFees = round2(processorBaseFee + internationalFee + fxFee + billingFee + taxFee + affiliateProcessingFee + payoutFee);
    var takeHomeBeforeSellerCosts = round2(grossRevenue - totalFees);
    var sellerVariableCost = round2(input.sellerCostPerSale * input.transactions);
    var affiliateCommissionCost = round2(grossRevenue * affiliateCommissionRate);
    var totalSellerCosts = round2(sellerVariableCost + affiliateCommissionCost + input.monthlyFixedCost);
    var netProfit = round2(takeHomeBeforeSellerCosts - totalSellerCosts);
    var effectiveTakeRatePct = grossRevenue > 0 ? round4((totalFees / grossRevenue) * 100) : 0;
    var netMarginPct = grossRevenue > 0 ? round4((netProfit / grossRevenue) * 100) : 0;

    return {
      salePrice: input.salePrice,
      transactions: input.transactions,
      domesticSharePct: input.domesticSharePct,
      internationalSharePct: input.internationalSharePct,
      fxConversionSharePct: input.fxConversionSharePct,
      billingEnabled: input.billingEnabled,
      taxRemittanceEnabled: input.taxRemittanceEnabled,
      affiliateEnabled: input.affiliateEnabled,
      affiliateCommissionBasePct: input.affiliateCommissionBasePct,
      payoutMethod: resolvePayoutMethod(input.payoutMethod),
      sellerCostPerSale: input.sellerCostPerSale,
      monthlyFixedCost: input.monthlyFixedCost,
      processorDomesticPct: input.processorDomesticPct,
      processorFixedUsd: input.processorFixedUsd,
      internationalSurchargePct: input.internationalSurchargePct,
      fxSurchargePct: input.fxSurchargePct,
      billingPct: input.billingPct,
      taxPct: input.taxPct,
      affiliateProcessingPct: input.affiliateProcessingPct,
      grossRevenue: grossRevenue,
      processorBaseFee: processorBaseFee,
      internationalFee: internationalFee,
      fxFee: fxFee,
      billingFee: billingFee,
      taxFee: taxFee,
      affiliateProcessingFee: affiliateProcessingFee,
      payoutFee: payoutFee,
      prePayoutTakeHome: prePayoutTakeHome,
      totalFees: totalFees,
      takeHomeBeforeSellerCosts: takeHomeBeforeSellerCosts,
      sellerVariableCost: sellerVariableCost,
      affiliateCommissionCost: affiliateCommissionCost,
      totalSellerCosts: totalSellerCosts,
      netProfit: netProfit,
      effectiveTakeRatePct: effectiveTakeRatePct,
      netMarginPct: netMarginPct,
      sourceReviewedAt: SOURCE_REVIEWED_AT,
      sourceUrls: SOURCE_URLS.slice(),
      breakdownRows: [
        { id: 'processor-base', label: 'Base card processing', value: processorBaseFee, note: round2(input.processorDomesticPct) + '% + ' + formatMoney(input.processorFixedUsd) + ' per transaction' },
        { id: 'international', label: 'International card surcharge', value: internationalFee, note: '+' + round2(input.internationalSurchargePct) + '% on international sales' },
        { id: 'fx', label: 'Currency conversion surcharge', value: fxFee, note: '+' + round2(input.fxSurchargePct) + '% when conversion is required' },
        { id: 'billing', label: 'Billing automation', value: billingFee, note: input.billingEnabled ? round2(input.billingPct) + '% enabled' : 'Not modeled' },
        { id: 'tax', label: 'Tax and remittance', value: taxFee, note: input.taxRemittanceEnabled ? round2(input.taxPct) + '% enabled' : 'Not modeled' },
        { id: 'affiliate-processing', label: 'Affiliate processing', value: affiliateProcessingFee, note: input.affiliateEnabled ? round2(input.affiliateProcessingPct) + '% enabled' : 'Not modeled' },
        { id: 'payout', label: 'Payout fee', value: payoutFee, note: resolvePayoutMethod(input.payoutMethod).label }
      ],
      sellerCostRows: [
        { id: 'seller-variable', label: 'Seller cost per sale', value: sellerVariableCost, note: formatMoney(input.sellerCostPerSale) + ' × ' + input.transactions },
        { id: 'affiliate-commission', label: 'Affiliate commission payout', value: affiliateCommissionCost, note: input.affiliateEnabled ? round2(input.affiliateCommissionBasePct) + '% of gross (seller-set, optional)' : 'Not modeled' },
        { id: 'fixed', label: 'Monthly fixed cost', value: round2(input.monthlyFixedCost), note: 'Applied once per planning period' }
      ]
    };
  }

  function calculate(rawInput) {
    var input = normalizeInput(rawInput);
    var error = validate(input);

    if (error) {
      return { result: null, error: error };
    }

    var result = computeCore(input);
    result.breakEvenSalePrice = findBreakEvenSalePrice(input);
    result.breakEvenTransactions = findBreakEvenTransactions(input);
    result.breakEvenMessage = result.breakEvenSalePrice == null ? TEXT.impossibleBreakEven : '';
    result.summary = buildSummary(result);

    return { result: result, error: '' };
  }

  function findBreakEvenSalePrice(rawInput) {
    var input = normalizeInput(rawInput);
    if (validate(input) || input.transactions <= 0) {
      return null;
    }

    var low = 0;
    if (computeCore(Object.assign({}, input, { salePrice: low })).netProfit >= 0) {
      return 0;
    }

    var high = Math.max(1, input.salePrice || 1);
    var highEval = computeCore(Object.assign({}, input, { salePrice: high }));

    while (highEval.netProfit < 0 && high < SEARCH_MAX) {
      high *= 2;
      highEval = computeCore(Object.assign({}, input, { salePrice: high }));
    }

    if (highEval.netProfit < 0) {
      return null;
    }

    for (var i = 0; i < BINARY_SEARCH_STEPS; i += 1) {
      var mid = (low + high) / 2;
      var midEval = computeCore(Object.assign({}, input, { salePrice: mid }));
      if (midEval.netProfit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function findBreakEvenTransactions(rawInput) {
    var input = normalizeInput(rawInput);
    if (validate(input) || input.salePrice <= 0) {
      return null;
    }

    if (computeCore(Object.assign({}, input, { transactions: 0 })).netProfit >= 0) {
      return 0;
    }

    var low = 0;
    var high = Math.max(1, input.transactions || 1);
    var highEval = computeCore(Object.assign({}, input, { transactions: high }));

    while (highEval.netProfit < 0 && high < SEARCH_MAX) {
      high *= 2;
      highEval = computeCore(Object.assign({}, input, { transactions: high }));
    }

    if (highEval.netProfit < 0) {
      return null;
    }

    while (low + 1 < high) {
      var mid = Math.floor((low + high) / 2);
      var midEval = computeCore(Object.assign({}, input, { transactions: mid }));
      if (midEval.netProfit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  var exports_ = {
    SOURCE_REVIEWED_AT: SOURCE_REVIEWED_AT,
    SOURCE_URLS: SOURCE_URLS,
    DEFAULTS: DEFAULTS,
    PAYOUT_METHODS: PAYOUT_METHODS,
    TEXT: TEXT,
    normalizeInput: normalizeInput,
    validate: validate,
    computeCore: computeCore,
    calcPayoutFee: calcPayoutFee,
    findBreakEvenSalePrice: findBreakEvenSalePrice,
    findBreakEvenTransactions: findBreakEvenTransactions,
    calculate: calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports_;
  } else {
    root.WhopFeeCalc = exports_;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
