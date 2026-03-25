(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof global !== 'undefined') {
    global.BeehiivVsSubstackCalculator = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULT_INPUTS = {
    subscribers: 500,
    monthlyPrice: 8,
    processorPct: 2.9,
    processorFixed: 0.30,
    beehiivPlanCost: 42,
  };

  var SCENARIO_SUBS = [100, 500, 1000, 2000];

  function roundTo(value, digits) {
    var factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toNum(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    var s = String(v == null ? '' : v).trim().replace(/,/g, '');
    if (!s) return null;
    var n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function validate(raw) {
    var src = Object.assign({}, DEFAULT_INPUTS, raw || {});
    var errors = [];
    var v = {};

    var subscribers = toNum(src.subscribers);
    if (subscribers == null || subscribers < 0 || !Number.isInteger(subscribers)) {
      errors.push('subscribers must be an integer >= 0.');
    } else { v.subscribers = subscribers; }

    var monthlyPrice = toNum(src.monthlyPrice);
    if (monthlyPrice == null || monthlyPrice <= 0) {
      errors.push('monthlyPrice must be > 0.');
    } else { v.monthlyPrice = monthlyPrice; }

    var processorPct = toNum(src.processorPct);
    if (processorPct == null || processorPct < 0 || processorPct > 100) {
      errors.push('processorPct must be 0–100.');
    } else { v.processorPct = processorPct; }

    var processorFixed = toNum(src.processorFixed);
    if (processorFixed == null || processorFixed < 0) {
      errors.push('processorFixed must be >= 0.');
    } else { v.processorFixed = processorFixed; }

    var beehiivPlanCost = toNum(src.beehiivPlanCost);
    if (beehiivPlanCost == null || beehiivPlanCost < 0) {
      errors.push('beehiivPlanCost must be >= 0.');
    } else { v.beehiivPlanCost = beehiivPlanCost; }

    if (errors.length) return { ok: false, errors: errors, values: null };
    return { ok: true, errors: [], values: v };
  }

  /**
   * Core calculation for a single scenario.
   * Returns an object with all derived values.
   */
  function calcScenario(subscribers, monthlyPrice, processorPct, processorFixed, beehiivPlanCost) {
    var grossRevenue = roundTo(subscribers * monthlyPrice, 2);
    var substackPlatformFee = roundTo(grossRevenue * 0.10, 2);
    var processorFee = roundTo(subscribers * (monthlyPrice * (processorPct / 100) + processorFixed), 2);
    var substackNet = roundTo(grossRevenue - substackPlatformFee - processorFee, 2);
    var beehiivNet = roundTo(grossRevenue - beehiivPlanCost - processorFee, 2);
    var monthlySavings = roundTo(beehiivNet - substackNet, 2);
    var annualSubstackNet = roundTo(substackNet * 12, 2);
    var annualBeehiivNet = roundTo(beehiivNet * 12, 2);
    var annualSavings = roundTo(monthlySavings * 12, 2);
    var breakEvenSubs = monthlyPrice > 0 ? roundTo(beehiivPlanCost / (monthlyPrice * 0.10), 2) : null;

    var verdict;
    if (monthlySavings > 0) {
      // Check if near break-even (within ±5% of grossRevenue or absolute < $5)
      var pctDiff = grossRevenue > 0 ? Math.abs(monthlySavings) / grossRevenue : 0;
      if (pctDiff <= 0.05 && Math.abs(monthlySavings) <= grossRevenue * 0.05) {
        // Additional check: if the absolute monthly savings is very small relative to revenue
        // Use a simple threshold: savings < 5% of gross AND < $50
        if (Math.abs(monthlySavings) < 50 && pctDiff <= 0.05) {
          verdict = 'near-break-even';
        } else {
          verdict = 'beehiiv-wins';
        }
      } else {
        verdict = 'beehiiv-wins';
      }
    } else if (monthlySavings < 0) {
      var pctDiffNeg = grossRevenue > 0 ? Math.abs(monthlySavings) / grossRevenue : 0;
      if (pctDiffNeg <= 0.05 && Math.abs(monthlySavings) < 50) {
        verdict = 'near-break-even';
      } else {
        verdict = 'substack-cheaper';
      }
    } else {
      verdict = 'near-break-even';
    }

    return {
      subscribers: subscribers,
      grossRevenue: grossRevenue,
      substackPlatformFee: substackPlatformFee,
      processorFee: processorFee,
      substackNet: substackNet,
      beehiivNet: beehiivNet,
      monthlySavings: monthlySavings,
      annualSubstackNet: annualSubstackNet,
      annualBeehiivNet: annualBeehiivNet,
      annualSavings: annualSavings,
      breakEvenSubs: breakEvenSubs,
      verdict: verdict,
    };
  }

  /**
   * Main entry point. Validates inputs and runs full calculation.
   */
  function calculate(rawInput) {
    var v = validate(rawInput);
    if (!v.ok) {
      return { result: null, error: v.errors.join(' '), errors: v.errors };
    }
    var inp = v.values;

    var main = calcScenario(
      inp.subscribers, inp.monthlyPrice,
      inp.processorPct, inp.processorFixed,
      inp.beehiivPlanCost
    );

    // Scenario strip at fixed subscriber counts
    var scenarios = SCENARIO_SUBS.map(function (subs) {
      return calcScenario(subs, inp.monthlyPrice, inp.processorPct, inp.processorFixed, inp.beehiivPlanCost);
    });

    var result = {
      input: inp,
      main: main,
      scenarios: scenarios,
    };

    return { result: result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value);
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0,
    }).format(value);
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    SCENARIO_SUBS: SCENARIO_SUBS,
    roundTo: roundTo,
    toNum: toNum,
    validate: validate,
    calcScenario: calcScenario,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
  };
});
