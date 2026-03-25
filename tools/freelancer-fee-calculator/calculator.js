/**
 * Freelancer Fee Calculator — deterministic compute module
 * Freelancer.com charges sellers:
 *   fixed-price / hourly-fixed: max(bidAmount * 0.10, $5.00) on the awarded amount
 *   extra released above original bid: 10%
 *   hourly milestone release: 10% of released milestone amount (no minimum)
 *   bonus / tip: treated as overage at 10%
 *
 * Export: { calculate, DEFAULTS }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.FreelancerCalc = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FEE_RATE        = 0.10;
  const FIXED_PRICE_MIN = 5.00;  // $5 minimum fee on original bid (fixed-price only)
  const BID_MIN_FOR_PCT = 50.00; // bid * 10% < $5 when bid < $50

  const DEFAULTS = {
    workMode:          'fixed-price',
    originalBid:       100,
    totalReleased:     100,
    subcontractorCost: 0,
    softwareCost:      0,
    deliveryCost:      0
  };

  const STRINGS = {
    en: {
      errWorkMode:       'Work mode must be "fixed-price" or "hourly".',
      errOriginalBid:    'Original bid / awarded amount must be greater than 0.',
      errTotalReleased:  'Total released amount must be ≥ original bid.',
      errNegCost:        'Seller cost inputs must be 0 or more.',
      warnNegativeNet:   'Net profit is negative — seller costs exceed payout.',
      warnOverageNote:   'Released amount exceeds original bid; overage is charged at 10%.'
    },
    ko: {
      errWorkMode:       '작업 방식은 "fixed-price" 또는 "hourly"여야 합니다.',
      errOriginalBid:    '원래 입찰/수주 금액은 0보다 커야 합니다.',
      errTotalReleased:  '총 지급액은 원래 입찰 금액 이상이어야 합니다.',
      errNegCost:        '셀러 비용 입력값은 0 이상이어야 합니다.',
      warnNegativeNet:   '순이익이 음수입니다 — 셀러 비용이 지급액을 초과합니다.',
      warnOverageNote:   '지급액이 원래 입찰 금액을 초과합니다. 초과분은 10% 추가 수수료가 적용됩니다.'
    }
  };

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function validate(input, s) {
    const { workMode, originalBid, totalReleased, subcontractorCost, softwareCost, deliveryCost } = input;
    if (workMode !== 'fixed-price' && workMode !== 'hourly') return s.errWorkMode;
    if (typeof originalBid !== 'number' || originalBid <= 0) return s.errOriginalBid;
    if (typeof totalReleased !== 'number' || totalReleased < originalBid) return s.errTotalReleased;
    if ([subcontractorCost, softwareCost, deliveryCost].some(v => typeof v !== 'number' || v < 0)) return s.errNegCost;
    return '';
  }

  /**
   * Main calculation function.
   *
   * @param {Object} input
   * @param {string} input.workMode            - 'fixed-price' or 'hourly'
   * @param {number} input.originalBid         - Original bid / awarded amount (> 0)
   * @param {number} input.totalReleased       - Total released / paid amount (>= originalBid)
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

    const workMode          = input.workMode          !== undefined ? input.workMode          : DEFAULTS.workMode;
    const originalBid       = typeof input.originalBid === 'number'       ? input.originalBid       : DEFAULTS.originalBid;
    const totalReleased     = typeof input.totalReleased === 'number'     ? input.totalReleased     : DEFAULTS.totalReleased;
    const subcontractorCost = typeof input.subcontractorCost === 'number' ? input.subcontractorCost : DEFAULTS.subcontractorCost;
    const softwareCost      = typeof input.softwareCost === 'number'      ? input.softwareCost      : DEFAULTS.softwareCost;
    const deliveryCost      = typeof input.deliveryCost === 'number'      ? input.deliveryCost      : DEFAULTS.deliveryCost;

    const normalised = { workMode, originalBid, totalReleased, subcontractorCost, softwareCost, deliveryCost };
    const validationError = validate(normalised, s);
    if (validationError) return { result: null, error: validationError, warning: '' };

    // ── Core fee calculation ─────────────────────────────────────────────────
    let feeOnBid     = 0;
    let feeOnOverage = 0;
    const overageAmount = round2(Math.max(0, totalReleased - originalBid));

    if (workMode === 'fixed-price') {
      feeOnBid     = round2(Math.max(originalBid * FEE_RATE, FIXED_PRICE_MIN));
      feeOnOverage = round2(overageAmount * FEE_RATE);
    } else {
      // hourly milestone: 10% of total released, no minimum
      feeOnBid     = round2(totalReleased * FEE_RATE);
      feeOnOverage = 0;
    }

    const platformFee           = round2(feeOnBid + feeOnOverage);
    const grossReleasedAmount   = round2(totalReleased);
    const payoutBeforeSellerCosts = round2(grossReleasedAmount - platformFee);
    const sellerCostTotal       = round2(subcontractorCost + softwareCost + deliveryCost);
    const netProfit             = round2(payoutBeforeSellerCosts - sellerCostTotal);
    const effectiveFeeRatePct   = round2(platformFee / grossReleasedAmount * 100);

    // ── Break-even gross (to cover seller costs, not counting platform fee itself) ─
    let breakEvenGross = 0;
    if (sellerCostTotal > 0) {
      if (workMode === 'fixed-price') {
        const candidate90 = round2(sellerCostTotal / (1 - FEE_RATE));
        if (candidate90 >= BID_MIN_FOR_PCT) {
          breakEvenGross = candidate90;
        } else {
          // $5 minimum fee applies at this range
          breakEvenGross = round2(sellerCostTotal + FIXED_PRICE_MIN);
        }
      } else {
        breakEvenGross = round2(sellerCostTotal / (1 - FEE_RATE));
      }
    }

    // ── Warnings ─────────────────────────────────────────────────────────────
    let warning = '';
    if (netProfit < 0) {
      warning = s.warnNegativeNet;
    } else if (overageAmount > 0) {
      warning = s.warnOverageNote;
    }

    return {
      result: {
        workMode,
        grossReleasedAmount,
        feeOnBid,
        feeOnOverage,
        overageAmount,
        platformFee,
        payoutBeforeSellerCosts,
        sellerCostTotal,
        subcontractorCost,
        softwareCost,
        deliveryCost,
        netProfit,
        effectiveFeeRatePct,
        breakEvenGross
      },
      error: '',
      warning
    };
  }

  return { calculate, DEFAULTS, FEE_RATE, FIXED_PRICE_MIN };
}));
