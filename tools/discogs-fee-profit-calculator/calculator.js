(function (root) {
  const SELLER_FEE_RATE = 0.08;
  const SELLER_FEE_MIN = 0.10;
  const PROCESSING_FEE_RATE = 0.035;
  const PROCESSING_FEE_FIXED = 0.50;
  const BREAK_EVEN_MAX = 100000;
  const SEARCH_ITERATIONS = 52;

  const DEFAULTS = {
    itemPrice: 25,
    costOfGoods: 8,
    shippingCharged: 5,
    shippingCost: 4,
    sellerFeePct: 8,
    processingFeePct: 3.5,
    processingFixedFee: 0.50,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      negMoney: '금액 입력값은 모두 0 이상이어야 합니다.',
      badRate: '수수료율은 0~100 범위여야 합니다.',
      noRevenue: '상품 가격은 0보다 커야 합니다.',
      badSales: '판매 횟수는 1 이상이어야 합니다.',
      statusGood: '현재 가정에서 순이익이 플러스입니다.',
      statusWarn: '현재 가정에서 순이익이 마이너스입니다.',
      summaryTitle: '[Discogs 수수료·순이익 요약]',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      negMoney: 'All money fields must be zero or above.',
      badRate: 'Fee rate must be between 0 and 100.',
      noRevenue: 'Item price must be greater than zero.',
      badSales: 'Number of sales must be at least 1.',
      statusGood: 'Net profit is positive under these assumptions.',
      statusWarn: 'Net profit is negative under these assumptions.',
      summaryTitle: '[Discogs Fee Profit Summary]',
      na: 'N/A'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function computeCore(itemPrice, costOfGoods, shippingCharged, shippingCost, sellerFeePct, processingFeePct, processingFixedFee) {
    const grossRevenue = round2(itemPrice + shippingCharged);

    const rawSellerFee = round2(itemPrice * (sellerFeePct / 100));
    const discogsSellerFee = round2(Math.max(rawSellerFee, SELLER_FEE_MIN));

    const processingFees = round2(grossRevenue * (processingFeePct / 100) + processingFixedFee);

    const shippingProfit = round2(shippingCharged - shippingCost);

    const totalFees = round2(discogsSellerFee + processingFees);
    const totalCosts = round2(costOfGoods + shippingCost + totalFees);

    const netProfit = round2(grossRevenue - totalCosts);
    const profitPerItem = netProfit;

    const profitMarginPct = grossRevenue > 0
      ? round4((netProfit / grossRevenue) * 100)
      : 0;

    const effectiveFeeRatePct = grossRevenue > 0
      ? round4((totalFees / grossRevenue) * 100)
      : 0;

    return {
      grossRevenue,
      discogsSellerFee,
      processingFees,
      shippingProfit,
      totalFees,
      totalCosts,
      netProfit,
      profitPerItem,
      profitMarginPct,
      effectiveFeeRatePct
    };
  }

  function computeRequiredSales(targetMonthlyProfit, profitPerItem) {
    if (profitPerItem <= 0) return null;
    return Math.ceil(targetMonthlyProfit / profitPerItem);
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const req = result.requiredSalesForTarget !== null
      ? String(result.requiredSalesForTarget)
      : na;
    const lines = [
      t.summaryTitle,
      `Item price: $${Number(input.itemPrice).toFixed(2)}`,
      `Shipping charged: $${Number(input.shippingCharged).toFixed(2)}`,
      `Gross revenue: $${result.grossRevenue.toFixed(2)}`,
      `Discogs seller fee (${input.sellerFeePct}%): $${result.discogsSellerFee.toFixed(2)}`,
      `Processing fees (${input.processingFeePct}% + $${Number(input.processingFixedFee).toFixed(2)}): $${result.processingFees.toFixed(2)}`,
      `Total fees: $${result.totalFees.toFixed(2)}`,
      `Cost of goods: $${Number(input.costOfGoods).toFixed(2)}`,
      `Shipping cost: $${Number(input.shippingCost).toFixed(2)}`,
      `Total costs: $${result.totalCosts.toFixed(2)}`,
      `Net profit: $${result.netProfit.toFixed(2)}`,
      `Profit margin: ${result.profitMarginPct.toFixed(2)}%`,
      `Effective fee rate: ${result.effectiveFeeRatePct.toFixed(2)}%`,
      `Shipping profit/loss: $${result.shippingProfit.toFixed(2)}`,
      `Number of sales: ${input.numberOfSales}`,
      `Sales needed for $${Number(input.targetMonthlyProfit).toFixed(0)}/mo target: ${req}`
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      itemPrice: Number(input.itemPrice),
      costOfGoods: Number(input.costOfGoods),
      shippingCharged: Number(input.shippingCharged),
      shippingCost: Number(input.shippingCost),
      sellerFeePct: input.sellerFeePct !== undefined ? Number(input.sellerFeePct) : DEFAULTS.sellerFeePct,
      processingFeePct: input.processingFeePct !== undefined ? Number(input.processingFeePct) : DEFAULTS.processingFeePct,
      processingFixedFee: input.processingFixedFee !== undefined ? Number(input.processingFixedFee) : DEFAULTS.processingFixedFee,
      numberOfSales: input.numberOfSales !== undefined ? Number(input.numberOfSales) : DEFAULTS.numberOfSales,
      targetMonthlyProfit: input.targetMonthlyProfit !== undefined ? Number(input.targetMonthlyProfit) : DEFAULTS.targetMonthlyProfit
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (n.itemPrice <= 0) return t.noRevenue;
    const moneyFields = [n.costOfGoods, n.shippingCharged, n.shippingCost, n.processingFixedFee, n.targetMonthlyProfit];
    if (moneyFields.some((v) => v < 0)) return t.negMoney;
    if (n.sellerFeePct < 0 || n.sellerFeePct > 100) return t.badRate;
    if (n.processingFeePct < 0 || n.processingFeePct > 100) return t.badRate;
    if (!Number.isInteger(n.numberOfSales) || n.numberOfSales < 1) return t.badSales;
    return '';
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(
      n.itemPrice, n.costOfGoods, n.shippingCharged, n.shippingCost,
      n.sellerFeePct, n.processingFeePct, n.processingFixedFee
    );

    const requiredSalesForTarget = computeRequiredSales(n.targetMonthlyProfit, core.profitPerItem);

    const result = {
      ...core,
      requiredSalesForTarget,
      status: core.netProfit >= 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.DiscogsCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
