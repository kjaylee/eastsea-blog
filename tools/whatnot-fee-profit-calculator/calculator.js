(function (root) {
  const PROCESSING_RATE = 0.029;
  const PROCESSING_FLAT = 0.30;
  const BREAK_EVEN_MAX = 100000;
  const SEARCH_ITERATIONS = 52;

  const COMMISSION_PROFILES = {
    'all-other-categories':               { label: 'All Other Categories (8%)' },
    'coins-money-limited':                { label: 'Coins & Money — capped at $1,500 (4%)' },
    'promo-categories-over-1500-limited': { label: 'Promo Categories — capped at $1,500 (8%)' }
  };

  const DEFAULTS = {
    salePrice:             50,
    sellerCouponAmount:    0,
    commissionProfile:     'all-other-categories',
    buyerShippingPaid:     5.5,
    buyerTax:              3.2,
    itemCost:              18,
    sellerShippingSubsidy: 0,
    packagingCost:         0.75,
    otherCost:             0
  };

  const TEXT = {
    ko: {
      invalid:       '입력값을 확인해주세요.',
      negMoney:      '금액 입력값은 모두 0 이상이어야 합니다.',
      badCoupon:     '셀러 쿠폰은 0 이상이어야 합니다.',
      noRevenue:     '최종 판매가(판매가 − 쿠폰)는 0보다 커야 합니다.',
      badProfile:    '알 수 없는 커미션 프로파일입니다.',
      statusGood:    '현재 가정에서 순이익이 플러스입니다.',
      statusWarn:    '현재 가정에서 순이익이 마이너스입니다.',
      summaryTitle:  '[Whatnot 수수료·순이익 요약]',
      na:            'N/A'
    },
    en: {
      invalid:       'Please review your inputs.',
      negMoney:      'All money fields must be zero or above.',
      badCoupon:     'Seller coupon must be zero or above.',
      noRevenue:     'Final sale price (sale price − coupon) must be greater than zero.',
      badProfile:    'Unknown commission profile.',
      statusGood:    'Net profit is positive under these assumptions.',
      statusWarn:    'Net profit is negative under these assumptions.',
      summaryTitle:  '[Whatnot Fee Profit Summary]',
      na:            'N/A'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function computeCommission(finalSalePrice, profile) {
    if (profile === 'all-other-categories') {
      return round2(finalSalePrice * 0.08);
    } else if (profile === 'coins-money-limited') {
      return round2(Math.min(finalSalePrice, 1500) * 0.04);
    } else if (profile === 'promo-categories-over-1500-limited') {
      return round2(Math.min(finalSalePrice, 1500) * 0.08);
    }
    return 0;
  }

  function computeCore(salePrice, sellerCouponAmount, commissionProfile, buyerShippingPaid, buyerTax, itemCost, sellerShippingSubsidy, packagingCost, otherCost) {
    const finalSalePrice    = round2(salePrice - sellerCouponAmount);
    const buyerOrderTotal   = round2(finalSalePrice + buyerShippingPaid + buyerTax);
    const commissionFee     = computeCommission(finalSalePrice, commissionProfile);
    const processingFee     = round2(buyerOrderTotal * PROCESSING_RATE + PROCESSING_FLAT);
    const totalPlatformFees = round2(commissionFee + processingFee);
    const payoutAfterFees   = round2(finalSalePrice - totalPlatformFees);
    const sellerCostTotal   = round2(itemCost + sellerShippingSubsidy + packagingCost + otherCost);
    const totalCost         = round2(totalPlatformFees + sellerCostTotal);
    const netProfit         = round2(finalSalePrice - totalCost);
    const netMarginPct      = finalSalePrice > 0
      ? round4((netProfit / finalSalePrice) * 100)
      : 0;
    const effectiveFeeRatePct = finalSalePrice > 0
      ? round4((totalPlatformFees / finalSalePrice) * 100)
      : 0;
    return {
      finalSalePrice,
      buyerOrderTotal,
      commissionFee,
      processingFee,
      totalPlatformFees,
      payoutAfterFees,
      sellerCostTotal,
      totalCost,
      netProfit,
      netMarginPct,
      effectiveFeeRatePct
    };
  }

  function findBreakEven(sellerCouponAmount, commissionProfile, buyerShippingPaid, buyerTax, itemCost, sellerShippingSubsidy, packagingCost, otherCost) {
    const check = (sp) => {
      const fsp = round2(sp - sellerCouponAmount);
      if (fsp <= 0) return false;
      const c = computeCore(sp, sellerCouponAmount, commissionProfile, buyerShippingPaid, buyerTax, itemCost, sellerShippingSubsidy, packagingCost, otherCost);
      return c.netProfit >= 0;
    };
    if (!check(BREAK_EVEN_MAX)) return null;
    let lo = 0;
    let hi = BREAK_EVEN_MAX;
    for (let i = 0; i < SEARCH_ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      if (check(mid)) hi = mid;
      else lo = mid;
    }
    return round2(hi);
  }

  function findMaxSellerCoupon(salePrice, commissionProfile, buyerShippingPaid, buyerTax, itemCost, sellerShippingSubsidy, packagingCost, otherCost) {
    const check = (coupon) => {
      const fsp = round2(salePrice - coupon);
      if (fsp <= 0) return false;
      const c = computeCore(salePrice, coupon, commissionProfile, buyerShippingPaid, buyerTax, itemCost, sellerShippingSubsidy, packagingCost, otherCost);
      return c.netProfit >= 0;
    };
    if (!check(0)) return null;
    let lo = 0;
    let hi = salePrice;
    for (let i = 0; i < SEARCH_ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      if (check(mid)) lo = mid;
      else hi = mid;
    }
    return round2(lo);
  }

  function buildSummary(input, result, lang) {
    const t  = TEXT[lang] || TEXT.en;
    const na = t.na;
    const be  = result.breakEvenSalePrice !== null
      ? '$' + result.breakEvenSalePrice.toFixed(2)
      : na;
    const mc  = result.maxSellerCouponAmount !== null
      ? '$' + result.maxSellerCouponAmount.toFixed(2)
      : na;
    const lines = [
      t.summaryTitle,
      'Sale price: $'             + Number(input.salePrice).toFixed(2),
      'Seller coupon: $'          + Number(input.sellerCouponAmount).toFixed(2),
      'Final sale price: $'       + result.finalSalePrice.toFixed(2),
      'Commission profile: '      + input.commissionProfile,
      'Buyer order total: $'      + result.buyerOrderTotal.toFixed(2),
      'Commission fee: $'         + result.commissionFee.toFixed(2),
      'Processing fee: $'         + result.processingFee.toFixed(2),
      'Total platform fees: $'    + result.totalPlatformFees.toFixed(2),
      'Payout after fees: $'      + result.payoutAfterFees.toFixed(2),
      'Seller cost total: $'      + result.sellerCostTotal.toFixed(2),
      'Net profit: $'             + result.netProfit.toFixed(2),
      'Net margin: '              + result.netMarginPct.toFixed(2) + '%',
      'Effective fee rate: '      + result.effectiveFeeRatePct.toFixed(2) + '%',
      'Break-even sale price: '   + be,
      'Max seller coupon: '       + mc
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      salePrice:             Number(input.salePrice),
      sellerCouponAmount:    Number(input.sellerCouponAmount),
      commissionProfile:     String(input.commissionProfile || ''),
      buyerShippingPaid:     Number(input.buyerShippingPaid),
      buyerTax:              Number(input.buyerTax),
      itemCost:              Number(input.itemCost),
      sellerShippingSubsidy: Number(input.sellerShippingSubsidy),
      packagingCost:         Number(input.packagingCost),
      otherCost:             Number(input.otherCost)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [n.salePrice, n.buyerShippingPaid, n.buyerTax, n.itemCost, n.sellerShippingSubsidy, n.packagingCost, n.otherCost];
    if (moneyFields.some((v) => v < 0)) return t.negMoney;
    if (n.sellerCouponAmount < 0) return t.badCoupon;
    if (!COMMISSION_PROFILES[n.commissionProfile]) return t.badProfile;
    const fsp = n.salePrice - n.sellerCouponAmount;
    if (fsp <= 0) return t.noRevenue;
    return '';
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t    = TEXT[lang] || TEXT.en;
    const n    = normalizeInput(input);
    const err  = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(
      n.salePrice, n.sellerCouponAmount, n.commissionProfile,
      n.buyerShippingPaid, n.buyerTax,
      n.itemCost, n.sellerShippingSubsidy, n.packagingCost, n.otherCost
    );

    const breakEvenSalePrice = findBreakEven(
      n.sellerCouponAmount, n.commissionProfile,
      n.buyerShippingPaid, n.buyerTax,
      n.itemCost, n.sellerShippingSubsidy, n.packagingCost, n.otherCost
    );

    const maxSellerCouponAmount = findMaxSellerCoupon(
      n.salePrice, n.commissionProfile,
      n.buyerShippingPaid, n.buyerTax,
      n.itemCost, n.sellerShippingSubsidy, n.packagingCost, n.otherCost
    );

    const result = {
      ...core,
      breakEvenSalePrice,
      maxSellerCouponAmount,
      status: core.netProfit >= 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.WhatnotCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
