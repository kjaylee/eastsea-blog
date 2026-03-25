/**
 * PeoplePerHour Fee Calculator — deterministic compute module
 * PeoplePerHour freelancer-side service fee tiers (lifetime billings per buyer):
 *   First £250:                        20%
 *   Next £4,750 (up to £5,000 total):   7.5%
 *   Above £5,000 lifetime:              3.5%
 *
 * Export: { calculate, DEFAULTS }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PPHCalc = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Fee tier thresholds (cumulative lifetime billings with the same buyer)
  const TIER1_LIMIT = 250;   // first £250 at 20%
  const TIER2_LIMIT = 5000;  // up to £5,000 at 7.5% (tier 2 spans £250–£5,000)
  const RATE1 = 0.20;
  const RATE2 = 0.075;
  const RATE3 = 0.035;

  const DEFAULTS = {
    priorLifetimeBilled: 0,
    currentInvoice:      500,
    subcontractorCost:   0,
    softwareCost:        0,
    deliveryCost:        0
  };

  const STRINGS = {
    en: {
      errPrior:        'Prior lifetime billings must be 0 or more.',
      errInvoice:      'Current invoice amount must be greater than 0.',
      errNegCost:      'Seller cost inputs must be 0 or more.',
      warnNegativeNet: 'Net profit is negative — seller costs exceed payout.',
      tierNote:        '20% on first £250 → 7.5% on next £4,750 → 3.5% above £5,000 lifetime.'
    },
    ko: {
      errPrior:        '이전 누적 청구액은 0 이상이어야 합니다.',
      errInvoice:      '현재 인보이스 금액은 0보다 커야 합니다.',
      errNegCost:      '셀러 비용 입력값은 0 이상이어야 합니다.',
      warnNegativeNet: '순이익이 음수입니다 — 셀러 비용이 지급액을 초과합니다.',
      tierNote:        '처음 £250: 20% → 다음 £4,750: 7.5% → £5,000 초과: 3.5% (동일 바이어 누적 기준)'
    }
  };

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function validate(input, s) {
    const { priorLifetimeBilled, currentInvoice, subcontractorCost, softwareCost, deliveryCost } = input;
    if (typeof priorLifetimeBilled !== 'number' || priorLifetimeBilled < 0) return s.errPrior;
    if (typeof currentInvoice !== 'number' || currentInvoice <= 0) return s.errInvoice;
    if ([subcontractorCost, softwareCost, deliveryCost].some(v => typeof v !== 'number' || v < 0)) return s.errNegCost;
    return '';
  }

  /**
   * Calculate the service fee for a given prior lifetime amount and current invoice,
   * applying the PPH tier structure.
   * @param {number} prior   - Cumulative lifetime billings before this invoice
   * @param {number} current - Current invoice amount
   * @returns {number} - Total service fee
   */
  function computeFee(prior, current) {
    let fee = 0;
    let remaining = current;
    let pos = prior;

    // Tier 1: 0 → £250 @ 20%
    if (pos < TIER1_LIMIT && remaining > 0) {
      const available = TIER1_LIMIT - pos;
      const used = Math.min(remaining, available);
      fee += used * RATE1;
      remaining -= used;
      pos += used;
    }

    // Tier 2: £250 → £5,000 @ 7.5%
    if (pos < TIER2_LIMIT && remaining > 0) {
      const available = TIER2_LIMIT - pos;
      const used = Math.min(remaining, available);
      fee += used * RATE2;
      remaining -= used;
      pos += used;
    }

    // Tier 3: above £5,000 @ 3.5%
    if (remaining > 0) {
      fee += remaining * RATE3;
    }

    return round2(fee);
  }

  /**
   * Describe which tier each pound of the current invoice falls into.
   * Returns an object with amounts allocated per tier.
   */
  function tierBreakdown(prior, current) {
    let remaining = current;
    let pos = prior;
    const result = { tier1: 0, tier2: 0, tier3: 0 };

    if (pos < TIER1_LIMIT && remaining > 0) {
      const available = TIER1_LIMIT - pos;
      const used = Math.min(remaining, available);
      result.tier1 = round2(used);
      remaining -= used;
      pos += used;
    }
    if (pos < TIER2_LIMIT && remaining > 0) {
      const available = TIER2_LIMIT - pos;
      const used = Math.min(remaining, available);
      result.tier2 = round2(used);
      remaining -= used;
      pos += used;
    }
    if (remaining > 0) {
      result.tier3 = round2(remaining);
    }

    return result;
  }

  /**
   * Main calculation function.
   *
   * @param {Object} input
   * @param {number} input.priorLifetimeBilled  - Cumulative lifetime billings with this buyer before this invoice (>= 0)
   * @param {number} input.currentInvoice       - Current invoice amount (> 0)
   * @param {number} [input.subcontractorCost=0]
   * @param {number} [input.softwareCost=0]
   * @param {number} [input.deliveryCost=0]
   * @param {Object} [opts]
   * @param {string} [opts.lang='en']
   * @returns {{ result: Object|null, error: string, warning: string }}
   */
  function calculate(input, opts) {
    const lang = (opts && opts.lang && STRINGS[opts.lang]) ? opts.lang : 'en';
    const s    = STRINGS[lang];

    const priorLifetimeBilled = typeof input.priorLifetimeBilled === 'number' ? input.priorLifetimeBilled : DEFAULTS.priorLifetimeBilled;
    const currentInvoice      = typeof input.currentInvoice === 'number'      ? input.currentInvoice      : DEFAULTS.currentInvoice;
    const subcontractorCost   = typeof input.subcontractorCost === 'number'   ? input.subcontractorCost   : DEFAULTS.subcontractorCost;
    const softwareCost        = typeof input.softwareCost === 'number'        ? input.softwareCost        : DEFAULTS.softwareCost;
    const deliveryCost        = typeof input.deliveryCost === 'number'        ? input.deliveryCost        : DEFAULTS.deliveryCost;

    const normalised = { priorLifetimeBilled, currentInvoice, subcontractorCost, softwareCost, deliveryCost };
    const validationError = validate(normalised, s);
    if (validationError) return { result: null, error: validationError, warning: '' };

    // ── Core fee calculation ─────────────────────────────────────────────────
    const serviceFeeTotal          = computeFee(priorLifetimeBilled, currentInvoice);
    const breakdown                = tierBreakdown(priorLifetimeBilled, currentInvoice);
    const payoutBeforeSellerCosts  = round2(currentInvoice - serviceFeeTotal);
    const sellerCostTotal          = round2(subcontractorCost + softwareCost + deliveryCost);
    const netProfit                = round2(payoutBeforeSellerCosts - sellerCostTotal);
    const effectiveFeeRatePct      = round2(serviceFeeTotal / currentInvoice * 100);
    const postInvoiceCumulativeBilled = round2(priorLifetimeBilled + currentInvoice);

    // Determine which tier the NEXT pound would fall into
    let nextInvoiceTierRate;
    if (postInvoiceCumulativeBilled < TIER1_LIMIT) {
      nextInvoiceTierRate = RATE1;
    } else if (postInvoiceCumulativeBilled < TIER2_LIMIT) {
      nextInvoiceTierRate = RATE2;
    } else {
      nextInvoiceTierRate = RATE3;
    }

    // ── Warning ───────────────────────────────────────────────────────────────
    const warning = netProfit < 0 ? s.warnNegativeNet : '';

    return {
      result: {
        currentInvoice,
        serviceFeeTotal,
        tier1Amount:   breakdown.tier1,
        tier1Fee:      round2(breakdown.tier1 * RATE1),
        tier2Amount:   breakdown.tier2,
        tier2Fee:      round2(breakdown.tier2 * RATE2),
        tier3Amount:   breakdown.tier3,
        tier3Fee:      round2(breakdown.tier3 * RATE3),
        payoutBeforeSellerCosts,
        sellerCostTotal,
        subcontractorCost,
        softwareCost,
        deliveryCost,
        netProfit,
        effectiveFeeRatePct,
        postInvoiceCumulativeBilled,
        nextInvoiceTierRate
      },
      error: '',
      warning
    };
  }

  return { calculate, DEFAULTS, TIER1_LIMIT, TIER2_LIMIT, RATE1, RATE2, RATE3, computeFee };
}));
