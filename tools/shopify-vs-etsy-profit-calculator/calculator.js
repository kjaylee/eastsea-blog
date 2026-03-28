(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof global !== 'undefined') {
    global.ShopifyVsEtsyProfitCalculator = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULT_INPUTS = {
    monthlyOrders: 120,
    productPrice: 48,
    shippingCharged: 6,
    productCost: 16,
    shippingLabelCost: 5,
    etsyTransactionRate: 6.5,
    etsyPaymentRate: 3.0,
    etsyPaymentFixed: 0.25,
    etsyListingFee: 0.20,
    etsyOffsiteAdsRate: 0,
    shopifyPlanCost: 39,
    shopifyPaymentRate: 2.9,
    shopifyPaymentFixed: 0.30,
    shopifyThirdPartyRate: 0,
    shopifyAppsMonthly: 15
  };

  var SCENARIO_ORDERS = [25, 100, 250, 500];

  function roundTo(value, digits) {
    var factor = Math.pow(10, digits || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toNum(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    var raw = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!raw) return null;
    var parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function validate(rawInput) {
    var source = Object.assign({}, DEFAULT_INPUTS, rawInput || {});
    var errors = [];
    var v = {};

    function requireInt(key, min) {
      var value = toNum(source[key]);
      if (value == null || !Number.isInteger(value) || value < min) {
        errors.push(key + ' must be an integer >= ' + min + '.');
      } else {
        v[key] = value;
      }
    }

    function requireNum(key, min, max, exclusiveMin) {
      var value = toNum(source[key]);
      var tooLow = exclusiveMin ? (value == null || value <= min) : (value == null || value < min);
      var tooHigh = max != null && value > max;
      if (tooLow || tooHigh) {
        var range = exclusiveMin ? ('> ' + min) : ('>= ' + min);
        if (max != null) range += ' and <= ' + max;
        errors.push(key + ' must be ' + range + '.');
      } else {
        v[key] = value;
      }
    }

    requireInt('monthlyOrders', 0);
    requireNum('productPrice', 0, null, true);
    requireNum('shippingCharged', 0);
    requireNum('productCost', 0);
    requireNum('shippingLabelCost', 0);
    requireNum('etsyTransactionRate', 0, 100);
    requireNum('etsyPaymentRate', 0, 100);
    requireNum('etsyPaymentFixed', 0);
    requireNum('etsyListingFee', 0);
    requireNum('etsyOffsiteAdsRate', 0, 100);
    requireNum('shopifyPlanCost', 0);
    requireNum('shopifyPaymentRate', 0, 100);
    requireNum('shopifyPaymentFixed', 0);
    requireNum('shopifyThirdPartyRate', 0, 100);
    requireNum('shopifyAppsMonthly', 0);

    if (errors.length) return { ok: false, errors: errors, values: null };
    return { ok: true, errors: [], values: v };
  }

  function deriveShared(values) {
    var grossOrderRevenue = roundTo(values.productPrice + values.shippingCharged, 2);
    var cogsPerOrder = roundTo(values.productCost + values.shippingLabelCost, 2);
    var etsyRate = roundTo(values.etsyTransactionRate + values.etsyPaymentRate + values.etsyOffsiteAdsRate, 4);
    var shopifyRate = roundTo(values.shopifyPaymentRate + values.shopifyThirdPartyRate, 4);
    var etsyFeePerOrder = roundTo(grossOrderRevenue * (etsyRate / 100) + values.etsyPaymentFixed + values.etsyListingFee, 2);
    var shopifyFeePerOrder = roundTo(grossOrderRevenue * (shopifyRate / 100) + values.shopifyPaymentFixed, 2);
    var shopifyFixedFees = roundTo(values.shopifyPlanCost + values.shopifyAppsMonthly, 2);
    var feeAdvantagePerOrder = roundTo(etsyFeePerOrder - shopifyFeePerOrder, 2);
    var breakEvenOrders = feeAdvantagePerOrder > 0 ? roundTo(shopifyFixedFees / feeAdvantagePerOrder, 2) : null;

    return {
      grossOrderRevenue: grossOrderRevenue,
      cogsPerOrder: cogsPerOrder,
      etsyRate: etsyRate,
      shopifyRate: shopifyRate,
      etsyFeePerOrder: etsyFeePerOrder,
      shopifyFeePerOrder: shopifyFeePerOrder,
      shopifyFixedFees: shopifyFixedFees,
      feeAdvantagePerOrder: feeAdvantagePerOrder,
      breakEvenOrders: breakEvenOrders
    };
  }

  function calcScenario(values, orders) {
    var shared = deriveShared(values);
    var grossRevenue = roundTo(shared.grossOrderRevenue * orders, 2);
    var costOfGoods = roundTo(shared.cogsPerOrder * orders, 2);
    var etsyFees = roundTo(shared.etsyFeePerOrder * orders, 2);
    var shopifyVariableFees = roundTo(shared.shopifyFeePerOrder * orders, 2);
    var shopifyFees = roundTo(shopifyVariableFees + shared.shopifyFixedFees, 2);
    var etsyNetProfit = roundTo(grossRevenue - costOfGoods - etsyFees, 2);
    var shopifyNetProfit = roundTo(grossRevenue - costOfGoods - shopifyFees, 2);
    var monthlyDelta = roundTo(shopifyNetProfit - etsyNetProfit, 2);
    var annualDelta = roundTo(monthlyDelta * 12, 2);
    var etsyTakeRate = grossRevenue > 0 ? roundTo((etsyFees / grossRevenue) * 100, 2) : 0;
    var shopifyTakeRate = grossRevenue > 0 ? roundTo((shopifyFees / grossRevenue) * 100, 2) : 0;

    return {
      orders: orders,
      grossRevenue: grossRevenue,
      costOfGoods: costOfGoods,
      etsyFees: etsyFees,
      shopifyVariableFees: shopifyVariableFees,
      shopifyFixedFees: shared.shopifyFixedFees,
      shopifyFees: shopifyFees,
      etsyNetProfit: etsyNetProfit,
      shopifyNetProfit: shopifyNetProfit,
      monthlyDelta: monthlyDelta,
      annualDelta: annualDelta,
      etsyTakeRate: etsyTakeRate,
      shopifyTakeRate: shopifyTakeRate,
      grossOrderRevenue: shared.grossOrderRevenue,
      cogsPerOrder: shared.cogsPerOrder,
      etsyFeePerOrder: shared.etsyFeePerOrder,
      shopifyFeePerOrder: shared.shopifyFeePerOrder,
      feeAdvantagePerOrder: shared.feeAdvantagePerOrder,
      breakEvenOrders: shared.breakEvenOrders
    };
  }

  function getVerdict(main) {
    if (main.monthlyDelta > 0) return 'shopify-wins';
    if (main.monthlyDelta < 0) return 'etsy-wins';
    return 'tie';
  }

  function buildSummary(result) {
    var main = result.main;
    var breakEvenText = main.breakEvenOrders == null
      ? 'Shopify does not gain a per-order fee advantage with the current third-party fee setup.'
      : ('Shopify break-even starts at about ' + formatNumber(main.breakEvenOrders, 2) + ' orders/month.');

    return [
      'Shopify vs Etsy Profit Snapshot',
      '- Orders/month: ' + formatNumber(result.input.monthlyOrders, 0),
      '- Gross revenue/month: ' + formatCurrency(main.grossRevenue),
      '- Etsy net profit/month: ' + formatCurrency(main.etsyNetProfit),
      '- Shopify net profit/month: ' + formatCurrency(main.shopifyNetProfit),
      '- Monthly delta (Shopify - Etsy): ' + formatCurrency(main.monthlyDelta),
      '- Annual delta: ' + formatCurrency(main.annualDelta),
      '- ' + breakEvenText
    ].join('\n');
  }

  function calculate(rawInput) {
    var validated = validate(rawInput);
    if (!validated.ok) {
      return { result: null, error: validated.errors.join(' '), errors: validated.errors };
    }

    var input = validated.values;
    var main = calcScenario(input, input.monthlyOrders);
    var scenarios = SCENARIO_ORDERS.map(function (orders) {
      return calcScenario(input, orders);
    });
    var verdict = getVerdict(main);

    var result = {
      input: input,
      main: main,
      verdict: verdict,
      scenarios: scenarios,
      summary: buildSummary({ input: input, main: main })
    };

    return { result: result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value, digits) {
    var precision = digits == null ? 0 : digits;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(value);
  }

  function formatPercent(value, digits) {
    return formatNumber(value, digits == null ? 1 : digits) + '%';
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    SCENARIO_ORDERS: SCENARIO_ORDERS,
    roundTo: roundTo,
    toNum: toNum,
    validate: validate,
    deriveShared: deriveShared,
    calcScenario: calcScenario,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    formatPercent: formatPercent
  };
});
