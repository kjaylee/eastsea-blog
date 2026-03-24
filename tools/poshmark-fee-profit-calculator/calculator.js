(function (root) {
  const FLAT_FEE = 2.95;
  const FLAT_FEE_THRESHOLD = 15;
  const PCT_FEE_RATE = 0.20;
  const BREAK_EVEN_MAX = 100000;
  const SEARCH_STEPS = 200;
  const SEARCH_ITERATIONS = 52;

  const DEFAULTS = {
    listPrice: 50,
    offerDiscountPct: 0,
    itemCost: 18,
    sellerShippingDiscount: 0,
    packagingCost: 0.5,
    otherCost: 0
  };

  const TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      negMoney: "금액 입력값은 모두 0 이상이어야 합니다.",
      badRate: "할인율은 0~100 범위여야 합니다.",
      noRevenue: "실현 판매가는 0보다 커야 합니다.",
      statusGood: "현재 가정에서 순이익이 플러스입니다.",
      statusWarn: "현재 가정에서 순이익이 마이너스입니다.",
      summaryTitle: "[Poshmark 수수료·순이익 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      negMoney: "All money fields must be zero or above.",
      badRate: "Offer discount must be between 0 and 100.",
      noRevenue: "Realized sale price must be greater than zero.",
      statusGood: "Net profit is positive under these assumptions.",
      statusWarn: "Net profit is negative under these assumptions.",
      summaryTitle: "[Poshmark Fee Profit Summary]",
      na: "N/A"
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function poshmarkFeeFor(realizedSalePrice) {
    return realizedSalePrice < FLAT_FEE_THRESHOLD
      ? FLAT_FEE
      : round2(realizedSalePrice * PCT_FEE_RATE);
  }

  function computeCore(listPrice, offerDiscountPct, itemCost, sellerShippingDiscount, packagingCost, otherCost) {
    const realizedSalePrice = round2(listPrice * (1 - offerDiscountPct / 100));
    const poshmarkFee = poshmarkFeeFor(realizedSalePrice);
    const payoutAfterPoshmarkFee = round2(realizedSalePrice - poshmarkFee);
    const sellerCostTotal = round2(itemCost + sellerShippingDiscount + packagingCost + otherCost);
    const totalCost = round2(poshmarkFee + sellerCostTotal);
    const netProfit = round2(realizedSalePrice - totalCost);
    const netMarginPct = realizedSalePrice > 0
      ? round4((netProfit / realizedSalePrice) * 100)
      : 0;
    const effectivePoshmarkFeeRatePct = realizedSalePrice > 0
      ? round4((poshmarkFee / realizedSalePrice) * 100)
      : 0;
    return {
      realizedSalePrice,
      poshmarkFee,
      payoutAfterPoshmarkFee,
      sellerCostTotal,
      totalCost,
      netProfit,
      netMarginPct,
      effectivePoshmarkFeeRatePct
    };
  }

  function findBreakEven(offerDiscountPct, itemCost, sellerShippingDiscount, packagingCost, otherCost) {
    // Binary search for minimum listPrice where netProfit >= 0
    let lo = 0;
    let hi = BREAK_EVEN_MAX;
    const check = (lp) => {
      const c = computeCore(lp, offerDiscountPct, itemCost, sellerShippingDiscount, packagingCost, otherCost);
      return c.netProfit >= 0;
    };
    if (!check(hi)) return null;
    for (let i = 0; i < SEARCH_ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      if (check(mid)) hi = mid;
      else lo = mid;
    }
    return round2(hi);
  }

  function findMaxOfferDiscount(listPrice, itemCost, sellerShippingDiscount, packagingCost, otherCost) {
    // Binary search for highest offerDiscountPct where netProfit >= 0
    const check = (pct) => {
      const c = computeCore(listPrice, pct, itemCost, sellerShippingDiscount, packagingCost, otherCost);
      return c.netProfit >= 0;
    };
    if (!check(0)) return null;
    if (check(100)) return 100;
    let lo = 0;
    let hi = 100;
    for (let i = 0; i < SEARCH_ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      if (check(mid)) lo = mid;
      else hi = mid;
    }
    return round4(lo);
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const be = result.breakEvenListPrice !== null
      ? `$${result.breakEvenListPrice.toFixed(2)}`
      : na;
    const maxD = result.maxOfferDiscountPct !== null
      ? `${result.maxOfferDiscountPct.toFixed(2)}%`
      : na;
    const lines = [
      t.summaryTitle,
      `List price: $${Number(input.listPrice).toFixed(2)}`,
      `Offer discount: ${Number(input.offerDiscountPct).toFixed(2)}%`,
      `Realized sale price: $${result.realizedSalePrice.toFixed(2)}`,
      `Poshmark fee: $${result.poshmarkFee.toFixed(2)}`,
      `Payout after fee: $${result.payoutAfterPoshmarkFee.toFixed(2)}`,
      `Seller cost total: $${result.sellerCostTotal.toFixed(2)}`,
      `Net profit: $${result.netProfit.toFixed(2)}`,
      `Net margin: ${result.netMarginPct.toFixed(2)}%`,
      `Effective fee rate: ${result.effectivePoshmarkFeeRatePct.toFixed(2)}%`,
      `Break-even list price: ${be}`,
      `Max offer discount before loss: ${maxD}`
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      listPrice: Number(input.listPrice),
      offerDiscountPct: Number(input.offerDiscountPct),
      itemCost: Number(input.itemCost),
      sellerShippingDiscount: Number(input.sellerShippingDiscount),
      packagingCost: Number(input.packagingCost),
      otherCost: Number(input.otherCost)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [n.listPrice, n.itemCost, n.sellerShippingDiscount, n.packagingCost, n.otherCost];
    if (moneyFields.some((v) => v < 0)) return t.negMoney;
    if (n.offerDiscountPct < 0 || n.offerDiscountPct > 100) return t.badRate;
    const realized = n.listPrice * (1 - n.offerDiscountPct / 100);
    if (realized <= 0) return t.noRevenue;
    return '';
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(
      n.listPrice, n.offerDiscountPct,
      n.itemCost, n.sellerShippingDiscount,
      n.packagingCost, n.otherCost
    );

    const breakEvenListPrice = findBreakEven(
      n.offerDiscountPct, n.itemCost,
      n.sellerShippingDiscount, n.packagingCost, n.otherCost
    );

    const maxOfferDiscountPct = findMaxOfferDiscount(
      n.listPrice, n.itemCost,
      n.sellerShippingDiscount, n.packagingCost, n.otherCost
    );

    const result = {
      ...core,
      breakEvenListPrice,
      maxOfferDiscountPct,
      status: core.netProfit >= 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.PoshmarkCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
