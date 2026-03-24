/**
 * Fiverr Seller Fee Calculator — deterministic compute module
 * Fiverr charges sellers a flat 20% service fee on every completed order (including tips).
 * Export: { calculate, DEFAULTS }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.FiverrCalc = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FIVERR_FEE_RATE = 0.20;

  const DEFAULTS = {
    gigPrice: 25,
    numberOfOrders: 10,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0,
    lang: 'en'
  };

  const STRINGS = {
    en: {
      errGigPrice: 'Gig price must be greater than 0.',
      errOrders: 'Number of orders must be at least 1 and a whole number.',
      errTip: 'Tip amount must be 0 or more.',
      errSellerPlus: 'Seller Plus monthly fee must be 0 or more.',
      errTargetNet: 'Target monthly net must be 0 or more.',
      warnNegativeNet: 'Net take-home is negative — Seller Plus cost exceeds earnings.',
      warnImpossibleReverse: 'No finite order count can reach target with current inputs.'
    },
    ko: {
      errGigPrice: '긱 가격은 0보다 커야 합니다.',
      errOrders: '주문 수는 1 이상의 정수여야 합니다.',
      errTip: '팁 금액은 0 이상이어야 합니다.',
      errSellerPlus: 'Seller Plus 월 구독료는 0 이상이어야 합니다.',
      errTargetNet: '목표 월 순수익은 0 이상이어야 합니다.',
      warnNegativeNet: '순수익이 음수입니다 — Seller Plus 비용이 수익을 초과합니다.',
      warnImpossibleReverse: '현재 입력으로는 목표 순수익에 도달하는 주문 수가 존재하지 않습니다.'
    }
  };

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /**
   * Validate inputs. Returns error string or '' if valid.
   */
  function validate(input, s) {
    const { gigPrice, numberOfOrders, tipAmount, sellerPlusMonthlyFee, targetMonthlyNet } = input;
    if (typeof gigPrice !== 'number' || gigPrice <= 0) return s.errGigPrice;
    if (typeof numberOfOrders !== 'number' || numberOfOrders < 1 || !Number.isInteger(numberOfOrders)) return s.errOrders;
    if (typeof tipAmount !== 'number' || tipAmount < 0) return s.errTip;
    if (typeof sellerPlusMonthlyFee !== 'number' || sellerPlusMonthlyFee < 0) return s.errSellerPlus;
    if (typeof targetMonthlyNet !== 'number' || targetMonthlyNet < 0) return s.errTargetNet;
    return '';
  }

  /**
   * Main calculation function.
   *
   * @param {Object} input
   * @param {number} input.gigPrice          - Price per gig order (> 0)
   * @param {number} input.numberOfOrders    - Number of completed orders (>= 1, integer)
   * @param {number} [input.tipAmount=0]     - Total tip amount (>= 0, subject to 20% fee)
   * @param {number} [input.sellerPlusMonthlyFee=0] - Seller Plus monthly subscription (>= 0)
   * @param {number} [input.targetMonthlyNet=0]     - Target net for reverse calc (>= 0)
   * @param {Object} [opts]
   * @param {string} [opts.lang='en']        - 'en' or 'ko'
   * @returns {{ result: Object|null, error: string, warning: string }}
   */
  function calculate(input, opts) {
    const lang = (opts && opts.lang && STRINGS[opts.lang]) ? opts.lang : 'en';
    const s = STRINGS[lang];

    const gigPrice            = typeof input.gigPrice === 'number'            ? input.gigPrice            : DEFAULTS.gigPrice;
    const numberOfOrders      = typeof input.numberOfOrders === 'number'      ? input.numberOfOrders      : DEFAULTS.numberOfOrders;
    const tipAmount           = typeof input.tipAmount === 'number'           ? input.tipAmount           : DEFAULTS.tipAmount;
    const sellerPlusMonthlyFee= typeof input.sellerPlusMonthlyFee === 'number'? input.sellerPlusMonthlyFee: DEFAULTS.sellerPlusMonthlyFee;
    const targetMonthlyNet    = typeof input.targetMonthlyNet === 'number'    ? input.targetMonthlyNet    : DEFAULTS.targetMonthlyNet;

    const normalised = { gigPrice, numberOfOrders, tipAmount, sellerPlusMonthlyFee, targetMonthlyNet };
    const validationError = validate(normalised, s);
    if (validationError) return { result: null, error: validationError, warning: '' };

    // ── Core formula ──────────────────────────────────────────────────────────
    const grossRevenue       = round2(gigPrice * numberOfOrders + tipAmount);
    const fiverrFee          = round2(grossRevenue * FIVERR_FEE_RATE);
    const tipFeeTotal        = round2(tipAmount * FIVERR_FEE_RATE);
    const netBeforeSellerPlus= round2(grossRevenue - fiverrFee);
    const sellerPlusCost     = round2(sellerPlusMonthlyFee);
    const netTakeHome        = round2(netBeforeSellerPlus - sellerPlusCost);
    const effectiveTakeHomePct = round2(netTakeHome / grossRevenue * 100);
    const revenuePerOrder    = round2(netTakeHome / numberOfOrders);

    // ── Reverse calc: required orders to reach targetMonthlyNet ──────────────
    let requiredOrdersForTarget = null;
    let warning = '';

    if (netTakeHome < 0) {
      warning = s.warnNegativeNet;
    }

    if (targetMonthlyNet > 0) {
      // netTakeHome per order = gigPrice * 0.80
      // total needed = targetMonthlyNet + sellerPlusCost
      const netPerOrder = gigPrice * (1 - FIVERR_FEE_RATE);
      if (netPerOrder <= 0) {
        warning = s.warnImpossibleReverse;
        requiredOrdersForTarget = null;
      } else {
        requiredOrdersForTarget = Math.ceil((targetMonthlyNet + sellerPlusCost) / netPerOrder);
      }
    }

    return {
      result: {
        grossRevenue,
        fiverrFee,
        tipFeeTotal,
        netBeforeSellerPlus,
        sellerPlusCost,
        netTakeHome,
        effectiveTakeHomePct,
        revenuePerOrder,
        requiredOrdersForTarget
      },
      error: '',
      warning
    };
  }

  return { calculate, DEFAULTS, FIVERR_FEE_RATE };
}));
