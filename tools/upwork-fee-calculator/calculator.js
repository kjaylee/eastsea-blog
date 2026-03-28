(function (root) {
  'use strict';

  // ── Fee constants ──────────────────────────────────────────────────────────
  const UPWORK_TIERS = [
    { max: 500,      rate: 0.20 },
    { max: 10000,    rate: 0.10 },
    { max: Infinity, rate: 0.05 }
  ];

  const WITHDRAWAL_METHODS = {
    ach:     { label: 'ACH (US Bank)',    labelKo: 'ACH (미국 은행)',    fee: function () { return 0; } },
    paypal:  { label: 'PayPal',           labelKo: 'PayPal',             fee: function (amt) { return Math.max(0.99, amt * 0.01); } },
    wire:    { label: 'Wire Transfer',    labelKo: '국제 전신송금',       fee: function () { return 30; } },
    instant: { label: 'Instant Pay (Visa)', labelKo: 'Instant Pay (Visa)', fee: function (amt) { return Math.min(15, Math.max(0.25, amt * 0.01)); } }
  };

  const INPUT_MIN = 0;
  const INPUT_MAX = 999999;
  const BINARY_SEARCH_ITERATIONS = 60;

  // ── Rounding helper ────────────────────────────────────────────────────────
  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  // ── Core: service fee (forward) ────────────────────────────────────────────
  // Returns { totalFee, breakdown: [{inTier, rate, tierFee, tierIndex}] }
  function calcServiceFee(gross, prior) {
    var fee = 0;
    var breakdown = [];
    var remaining = gross;
    var cursor = prior;

    for (var i = 0; i < UPWORK_TIERS.length; i++) {
      var tier = UPWORK_TIERS[i];
      if (remaining <= 0) break;
      if (cursor >= tier.max) continue;
      var inTier = Math.min(remaining, tier.max - cursor);
      var tierFee = inTier * tier.rate;
      breakdown.push({ inTier: round2(inTier), rate: tier.rate, tierFee: round2(tierFee), tierIndex: i });
      fee += tierFee;
      remaining -= inTier;
      cursor += inTier;
    }

    return { totalFee: round2(fee), breakdown: breakdown };
  }

  // ── Withdrawal fee ─────────────────────────────────────────────────────────
  function calcWithdrawalFee(grossAfterServiceFee, method) {
    var m = WITHDRAWAL_METHODS[method];
    if (!m) return 0;
    return round2(m.fee(grossAfterServiceFee));
  }

  // ── Tier progress info ─────────────────────────────────────────────────────
  // Returns info about where the user currently stands in their tier ladder
  // based on (prior + gross) after this invoice.
  function calcTierProgress(gross, prior) {
    var endTotal = prior + gross;
    var currentTierIndex = 0;
    var tierStarts = [0, 500, 10000];
    var tierEnds = [500, 10000, Infinity];
    var tierRates = [0.20, 0.10, 0.05];

    // Determine which tier the END of this invoice lands in
    for (var i = UPWORK_TIERS.length - 1; i >= 0; i--) {
      if (endTotal > (i === 0 ? 0 : tierStarts[i])) {
        currentTierIndex = i;
        break;
      }
    }

    var tierStart = tierStarts[currentTierIndex];
    var tierEnd = tierEnds[currentTierIndex];
    var tierRate = tierRates[currentTierIndex];
    var isMaxTier = currentTierIndex === UPWORK_TIERS.length - 1;
    var amountInTier = isMaxTier ? endTotal - tierStart : Math.min(endTotal, tierEnd) - tierStart;
    var tierSize = isMaxTier ? null : tierEnd - tierStart;
    var pctThroughTier = isMaxTier ? 100 : round4((amountInTier / tierSize) * 100);
    var remaining = isMaxTier ? 0 : round2(tierEnd - Math.min(endTotal, tierEnd));
    var nextRate = isMaxTier ? null : tierRates[currentTierIndex + 1];

    return {
      currentTierIndex: currentTierIndex,
      currentRate: tierRate,
      tierStart: tierStart,
      tierEnd: tierEnd,
      amountInTier: round2(amountInTier),
      tierSize: tierSize,
      pctThroughTier: pctThroughTier,
      remaining: remaining,
      nextRate: nextRate,
      isMaxTier: isMaxTier,
      endTotal: round2(endTotal)
    };
  }

  // ── Reverse calculation (net → gross) ─────────────────────────────────────
  function calcRequiredGross(netTarget, prior, method) {
    // Binary search: find gross such that (gross - serviceFee - withdrawalFee) ≈ netTarget
    var lo = netTarget;
    var hi = netTarget * 1.35 + 50; // generous upper bound for extreme cases

    for (var i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
      var mid = (lo + hi) / 2;
      var sf = calcServiceFee(mid, prior);
      var afterFee = mid - sf.totalFee;
      var wFee = calcWithdrawalFee(afterFee, method);
      var net = afterFee - wFee;
      if (net < netTarget) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    return round2((lo + hi) / 2);
  }

  // ── All withdrawal methods side-by-side ───────────────────────────────────
  function calcAllWithdrawals(grossAfterServiceFee) {
    var result = {};
    var methods = Object.keys(WITHDRAWAL_METHODS);
    for (var i = 0; i < methods.length; i++) {
      var key = methods[i];
      var wFee = round2(WITHDRAWAL_METHODS[key].fee(grossAfterServiceFee));
      result[key] = {
        label: WITHDRAWAL_METHODS[key].label,
        labelKo: WITHDRAWAL_METHODS[key].labelKo,
        fee: wFee,
        net: round2(grossAfterServiceFee - wFee)
      };
    }
    return result;
  }

  // ── Input validation ───────────────────────────────────────────────────────
  var TEXT = {
    en: {
      invalidGross:   'Invoice amount must be a number between $0 and $999,999.',
      invalidPrior:   'Prior lifetime billings must be a number between $0 and $999,999.',
      invalidNet:     'Target net must be a number between $1 and $999,999.',
      invalidMethod:  'Invalid withdrawal method.',
      negativeInput:  'All monetary inputs must be zero or greater.'
    },
    ko: {
      invalidGross:   '청구 금액은 0~999,999 사이의 숫자여야 합니다.',
      invalidPrior:   '누적 청구액은 0~999,999 사이의 숫자여야 합니다.',
      invalidNet:     '목표 순수익은 1~999,999 사이의 숫자여야 합니다.',
      invalidMethod:  '유효하지 않은 출금 방법입니다.',
      negativeInput:  '금액 입력값은 모두 0 이상이어야 합니다.'
    }
  };

  function validateForward(gross, prior, method, lang) {
    var t = TEXT[lang] || TEXT.en;
    if (typeof gross !== 'number' || isNaN(gross) || gross < INPUT_MIN || gross > INPUT_MAX) return t.invalidGross;
    if (typeof prior !== 'number' || isNaN(prior) || prior < INPUT_MIN || prior > INPUT_MAX) return t.invalidPrior;
    if (gross < 0 || prior < 0) return t.negativeInput;
    if (!WITHDRAWAL_METHODS[method]) return t.invalidMethod;
    return '';
  }

  function validateReverse(netTarget, prior, method, lang) {
    var t = TEXT[lang] || TEXT.en;
    if (typeof netTarget !== 'number' || isNaN(netTarget) || netTarget < 1 || netTarget > INPUT_MAX) return t.invalidNet;
    if (typeof prior !== 'number' || isNaN(prior) || prior < INPUT_MIN || prior > INPUT_MAX) return t.invalidPrior;
    if (!WITHDRAWAL_METHODS[method]) return t.invalidMethod;
    return '';
  }

  // ── Public API: forward ────────────────────────────────────────────────────
  function calculateForward(input, opts) {
    var lang = (opts && opts.lang) || 'en';
    var gross = Number(input.gross);
    var prior = Number(input.prior);
    var method = input.method || 'ach';

    var err = validateForward(gross, prior, method, lang);
    if (err) return { result: null, error: err };

    var sf = calcServiceFee(gross, prior);
    var grossAfterServiceFee = round2(gross - sf.totalFee);
    var wFee = calcWithdrawalFee(grossAfterServiceFee, method);
    var net = round2(grossAfterServiceFee - wFee);
    var effectiveRate = gross > 0 ? round4(((sf.totalFee + wFee) / gross) * 100) : 0;
    var tierProgress = calcTierProgress(gross, prior);
    var allWithdrawals = calcAllWithdrawals(grossAfterServiceFee);

    return {
      result: {
        gross: gross,
        prior: prior,
        method: method,
        serviceFeeBreakdown: sf.breakdown,
        totalServiceFee: sf.totalFee,
        grossAfterServiceFee: grossAfterServiceFee,
        withdrawalFee: wFee,
        net: net,
        effectiveRate: effectiveRate,
        tierProgress: tierProgress,
        allWithdrawals: allWithdrawals
      },
      error: ''
    };
  }

  // ── Public API: reverse ────────────────────────────────────────────────────
  function calculateReverse(input, opts) {
    var lang = (opts && opts.lang) || 'en';
    var netTarget = Number(input.netTarget);
    var prior = Number(input.prior);
    var method = input.method || 'ach';

    var err = validateReverse(netTarget, prior, method, lang);
    if (err) return { result: null, error: err };

    var requiredGross = calcRequiredGross(netTarget, prior, method);
    var sf = calcServiceFee(requiredGross, prior);
    var grossAfterServiceFee = round2(requiredGross - sf.totalFee);
    var wFee = calcWithdrawalFee(grossAfterServiceFee, method);
    var net = round2(grossAfterServiceFee - wFee);
    var effectiveRate = requiredGross > 0 ? round4(((sf.totalFee + wFee) / requiredGross) * 100) : 0;
    var tierProgress = calcTierProgress(requiredGross, prior);
    var allWithdrawals = calcAllWithdrawals(grossAfterServiceFee);

    return {
      result: {
        netTarget: netTarget,
        prior: prior,
        method: method,
        requiredGross: requiredGross,
        serviceFeeBreakdown: sf.breakdown,
        totalServiceFee: sf.totalFee,
        grossAfterServiceFee: grossAfterServiceFee,
        withdrawalFee: wFee,
        net: net,
        effectiveRate: effectiveRate,
        tierProgress: tierProgress,
        allWithdrawals: allWithdrawals
      },
      error: ''
    };
  }

  var exports = {
    calculateForward: calculateForward,
    calculateReverse: calculateReverse,
    calcServiceFee: calcServiceFee,
    calcWithdrawalFee: calcWithdrawalFee,
    calcRequiredGross: calcRequiredGross,
    calcTierProgress: calcTierProgress,
    UPWORK_TIERS: UPWORK_TIERS,
    WITHDRAWAL_METHODS: WITHDRAWAL_METHODS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.UpworkCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
