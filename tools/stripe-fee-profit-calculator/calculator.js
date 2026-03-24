(function (root) {
  const BREAK_EVEN_MAX = 1_000_000;
  const BREAK_EVEN_ITERATIONS = 60;
  const BREAK_EVEN_TOL = 0.001;

  const DEFAULTS = {
    salePrice: 100,
    shippingCharged: 0,
    taxCollected: 0,
    productCost: 25,
    fulfillmentCost: 5,
    opsCost: 0,
    stripeFeeRate: 2.9,
    stripeFlatFee: 0.30,
    internationalCardRate: 0,
    currencyConversionRate: 0
  };

  const TEXT = {
    ko: {
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      rate: '비율(%) 입력값은 0에서 100 사이여야 합니다.',
      revenue: '판매가 + 배송비는 0보다 커야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서 순이익이 플러스입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 가격·비용을 점검하세요.',
      summaryTitle: '[Stripe 수수료·순이익 요약]',
      na: 'N/A'
    },
    en: {
      money: 'All money fields must be zero or above.',
      rate: 'Percentage inputs must be between 0 and 100.',
      revenue: 'Sale price + shipping must be greater than zero.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate results.',
      statusGood: 'Net profit is positive under these assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check price or costs.',
      summaryTitle: '[Stripe Fee Profit Summary]',
      na: 'N/A'
    }
  };

  function round2(v) {
    return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  }
  function round4(v) {
    return Math.round((Number(v) + Number.EPSILON) * 10000) / 10000;
  }

  function normalize(input) {
    const s = input || {};
    return {
      salePrice:             Number(s.salePrice             ?? DEFAULTS.salePrice),
      shippingCharged:       Number(s.shippingCharged       ?? DEFAULTS.shippingCharged),
      taxCollected:          Number(s.taxCollected          ?? DEFAULTS.taxCollected),
      productCost:           Number(s.productCost           ?? DEFAULTS.productCost),
      fulfillmentCost:       Number(s.fulfillmentCost       ?? DEFAULTS.fulfillmentCost),
      opsCost:               Number(s.opsCost               ?? DEFAULTS.opsCost),
      stripeFeeRate:         Number(s.stripeFeeRate         ?? DEFAULTS.stripeFeeRate),
      stripeFlatFee:         Number(s.stripeFlatFee         ?? DEFAULTS.stripeFlatFee),
      internationalCardRate: Number(s.internationalCardRate ?? DEFAULTS.internationalCardRate),
      currencyConversionRate:Number(s.currencyConversionRate?? DEFAULTS.currencyConversionRate)
    };
  }

  function validate(inp, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      inp.salePrice, inp.shippingCharged, inp.taxCollected,
      inp.productCost, inp.fulfillmentCost, inp.opsCost,
      inp.stripeFlatFee
    ];
    if (moneyFields.some((v) => v < 0)) return t.money;

    const rateFields = [
      inp.stripeFeeRate, inp.internationalCardRate, inp.currencyConversionRate
    ];
    if (rateFields.some((v) => v < 0 || v > 100)) return t.rate;

    if (inp.salePrice + inp.shippingCharged <= 0) return t.revenue;

    return '';
  }

  function computeAtSalePrice(sp, inp) {
    const revenueExTax        = sp + inp.shippingCharged;
    const grossCharge         = revenueExTax + inp.taxCollected;
    const stripeVariableFee   = grossCharge * (inp.stripeFeeRate / 100);
    const internationalFee    = grossCharge * (inp.internationalCardRate / 100);
    const currencyConvFee     = grossCharge * (inp.currencyConversionRate / 100);
    const totalStripeFees     = stripeVariableFee + inp.stripeFlatFee + internationalFee + currencyConvFee;
    const payoutAfterFees     = grossCharge - totalStripeFees;
    const payoutBeforeSellerCosts = revenueExTax - totalStripeFees;
    const sellerCostTotal     = inp.productCost + inp.fulfillmentCost + inp.opsCost;
    const netProfit           = payoutBeforeSellerCosts - sellerCostTotal;
    return { revenueExTax, grossCharge, stripeVariableFee, internationalFee, currencyConvFee, totalStripeFees, payoutAfterFees, payoutBeforeSellerCosts, sellerCostTotal, netProfit };
  }

  function findBreakEven(inp) {
    const atLo = computeAtSalePrice(0, inp).netProfit;
    const atHi = computeAtSalePrice(BREAK_EVEN_MAX, inp).netProfit;

    if (atHi < 0) return null;   // never profitable even at huge price
    if (atLo >= 0) return 0;     // already profitable at zero price

    let lo = 0, hi = BREAK_EVEN_MAX;
    for (let i = 0; i < BREAK_EVEN_ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      const profit = computeAtSalePrice(mid, inp).netProfit;
      if (Math.abs(profit) <= BREAK_EVEN_TOL) return round2(mid);
      if (profit < 0) lo = mid;
      else hi = mid;
    }
    return round2((lo + hi) / 2);
  }

  function buildSummary(r, inp, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const fmt = (v) => v == null ? na : '$' + v.toFixed(2);
    const fmtPct = (v) => v == null ? na : v.toFixed(2) + '%';
    const lines = [
      t.summaryTitle,
      '',
      (lang === 'ko' ? '판매가' : 'Sale price')                + ': ' + fmt(inp.salePrice),
      (lang === 'ko' ? '세전 매출' : 'Revenue ex tax')         + ': ' + fmt(r.revenueExTax),
      (lang === 'ko' ? '총 청구액' : 'Gross charge')           + ': ' + fmt(r.grossCharge),
      (lang === 'ko' ? 'Stripe 총 수수료' : 'Total Stripe fees')+ ': ' + fmt(r.totalStripeFees),
      (lang === 'ko' ? '수수료 공제 후 수취액' : 'Payout after fees') + ': ' + fmt(r.payoutAfterFees),
      (lang === 'ko' ? '순이익' : 'Net profit')                + ': ' + fmt(r.netProfit),
      (lang === 'ko' ? '실효 수수료율' : 'Effective fee rate') + ': ' + fmtPct(r.effectiveStripeFeeRatePct),
      (lang === 'ko' ? '순마진율' : 'Net margin')              + ': ' + fmtPct(r.netMarginPct),
      (lang === 'ko' ? '손익분기 판매가' : 'Break-even price') + ': ' + fmt(r.breakEvenSalePrice),
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const inp = normalize(input);

    const err = validate(inp, lang);
    if (err) return { result: null, error: err };

    const base = computeAtSalePrice(inp.salePrice, inp);

    const effectiveStripeFeeRatePct = base.revenueExTax > 0
      ? round4((base.totalStripeFees / base.revenueExTax) * 100)
      : 0;
    const netMarginPct = base.revenueExTax > 0
      ? round4((base.netProfit / base.revenueExTax) * 100)
      : 0;

    const breakEvenSalePrice = findBreakEven(inp);

    const result = {
      revenueExTax:              round2(base.revenueExTax),
      grossCharge:               round2(base.grossCharge),
      stripeVariableFee:         round2(base.stripeVariableFee),
      stripeFlatFee:             round2(inp.stripeFlatFee),
      internationalFee:          round2(base.internationalFee),
      currencyConversionFee:     round2(base.currencyConvFee),
      totalStripeFees:           round2(base.totalStripeFees),
      payoutAfterFees:           round2(base.payoutAfterFees),
      payoutBeforeSellerCosts:   round2(base.payoutBeforeSellerCosts),
      sellerCostTotal:           round2(base.sellerCostTotal),
      netProfit:                 round2(base.netProfit),
      effectiveStripeFeeRatePct: effectiveStripeFeeRatePct,
      netMarginPct:              netMarginPct,
      breakEvenSalePrice:        breakEvenSalePrice
    };

    result.summary = buildSummary(result, inp, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS, TEXT };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.StripeCalc = exports;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
