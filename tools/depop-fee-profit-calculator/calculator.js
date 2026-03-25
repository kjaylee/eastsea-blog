(function (root) {
  const BREAK_EVEN_MAX = 100000;
  const SEARCH_ITERATIONS = 52;

  const DEFAULTS = {
    salePrice: 45,
    costOfGoods: 15,
    shippingCost: 5,
    sellerPaysShipping: true,
    processingFeePct: 3.3,
    processingFixedFee: 0.30,
    isBoosted: false,
    boostFeePct: 8,
    numberOfSales: 1,
    targetMonthlyProfit: 500
  };

  const TEXT = {
    ko: {
      negMoney: '금액 입력값은 모두 0 이상이어야 합니다.',
      badPct: '수수료율은 0~100 범위여야 합니다.',
      badSalePrice: '판매가는 0보다 커야 합니다.',
      badSales: '판매 수량은 1 이상이어야 합니다.',
      statusGood: '현재 가정에서 순이익이 플러스입니다.',
      statusWarn: '현재 가정에서 순이익이 마이너스입니다.',
      summaryTitle: '[Depop 수수료·순이익 요약]',
      na: 'N/A'
    },
    en: {
      negMoney: 'All money fields must be zero or above.',
      badPct: 'Fee rate must be between 0 and 100.',
      badSalePrice: 'Sale price must be greater than zero.',
      badSales: 'Number of sales must be at least 1.',
      statusGood: 'Net profit is positive under these assumptions.',
      statusWarn: 'Net profit is negative under these assumptions.',
      summaryTitle: '[Depop Fee Profit Summary]',
      na: 'N/A'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function computePerItem(salePrice, costOfGoods, shippingCost, sellerPaysShipping, processingFeePct, processingFixedFee, isBoosted, boostFeePct) {
    const processingFee = round2(salePrice * (processingFeePct / 100) + processingFixedFee);
    const boostFee = isBoosted ? round2(salePrice * (boostFeePct / 100)) : 0;
    const totalFees = round2(processingFee + boostFee);
    const shippingCostTotal = sellerPaysShipping ? shippingCost : 0;
    const totalCosts = round2(totalFees + shippingCostTotal + costOfGoods);
    const netProfit = round2(salePrice - totalCosts);
    const profitMarginPct = salePrice > 0 ? round4((netProfit / salePrice) * 100) : 0;
    const effectiveFeeRatePct = salePrice > 0 ? round4((totalFees / salePrice) * 100) : 0;
    return { processingFee, boostFee, totalFees, shippingCostTotal, totalCosts, netProfit, profitMarginPct, effectiveFeeRatePct };
  }

  function computeCore(salePrice, costOfGoods, shippingCost, sellerPaysShipping, processingFeePct, processingFixedFee, isBoosted, boostFeePct, numberOfSales, targetMonthlyProfit) {
    const perItem = computePerItem(salePrice, costOfGoods, shippingCost, sellerPaysShipping, processingFeePct, processingFixedFee, isBoosted, boostFeePct);
    const grossRevenue = round2(salePrice * numberOfSales);
    const processingFee = round2(perItem.processingFee * numberOfSales);
    const boostFee = round2(perItem.boostFee * numberOfSales);
    const totalFees = round2(perItem.totalFees * numberOfSales);
    const shippingCostTotal = round2(perItem.shippingCostTotal * numberOfSales);
    const totalCosts = round2(perItem.totalCosts * numberOfSales);
    const netProfit = round2(perItem.netProfit * numberOfSales);
    const profitPerItem = perItem.netProfit;
    const profitMarginPct = grossRevenue > 0 ? round4((netProfit / grossRevenue) * 100) : 0;
    const effectiveFeeRatePct = grossRevenue > 0 ? round4((totalFees / grossRevenue) * 100) : 0;
    let requiredSalesForTarget = null;
    if (targetMonthlyProfit >= 0 && profitPerItem > 0) {
      requiredSalesForTarget = Math.ceil(targetMonthlyProfit / profitPerItem);
    }
    return {
      grossRevenue,
      processingFee,
      boostFee,
      totalFees,
      shippingCostTotal,
      totalCosts,
      netProfit,
      profitPerItem,
      profitMarginPct,
      effectiveFeeRatePct,
      requiredSalesForTarget
    };
  }

  function findBreakEven(costOfGoods, shippingCost, sellerPaysShipping, processingFeePct, processingFixedFee, isBoosted, boostFeePct) {
    const check = (sp) => {
      const p = computePerItem(sp, costOfGoods, shippingCost, sellerPaysShipping, processingFeePct, processingFixedFee, isBoosted, boostFeePct);
      return p.netProfit >= 0;
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

  function buildSummary(input, result, breakEvenSalePrice, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const be = breakEvenSalePrice !== null ? '$' + breakEvenSalePrice.toFixed(2) : na;
    const req = result.requiredSalesForTarget !== null ? String(result.requiredSalesForTarget) : na;
    const lines = [
      t.summaryTitle,
      'Sale price: $' + Number(input.salePrice).toFixed(2),
      'Number of sales: ' + Number(input.numberOfSales),
      'Gross revenue: $' + result.grossRevenue.toFixed(2),
      'Processing fee (' + Number(input.processingFeePct).toFixed(2) + '% + $' + Number(input.processingFixedFee).toFixed(2) + '): $' + result.processingFee.toFixed(2),
      'Boost fee (' + (input.isBoosted ? Number(input.boostFeePct).toFixed(2) + '%' : 'off') + '): $' + result.boostFee.toFixed(2),
      'Total fees: $' + result.totalFees.toFixed(2),
      'Shipping cost (seller pays: ' + (input.sellerPaysShipping ? 'yes' : 'no') + '): $' + result.shippingCostTotal.toFixed(2),
      'Total costs: $' + result.totalCosts.toFixed(2),
      'Net profit: $' + result.netProfit.toFixed(2),
      'Profit per item: $' + result.profitPerItem.toFixed(2),
      'Profit margin: ' + result.profitMarginPct.toFixed(2) + '%',
      'Effective fee rate: ' + result.effectiveFeeRatePct.toFixed(2) + '%',
      'Break-even sale price: ' + be,
      'Required sales for monthly target ($' + Number(input.targetMonthlyProfit).toFixed(2) + '): ' + req
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      salePrice: Number(input.salePrice),
      costOfGoods: Number(input.costOfGoods),
      shippingCost: Number(input.shippingCost),
      sellerPaysShipping: Boolean(input.sellerPaysShipping),
      processingFeePct: Number(input.processingFeePct),
      processingFixedFee: Number(input.processingFixedFee),
      isBoosted: Boolean(input.isBoosted),
      boostFeePct: Number(input.boostFeePct),
      numberOfSales: Number(input.numberOfSales),
      targetMonthlyProfit: Number(input.targetMonthlyProfit)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [n.salePrice, n.costOfGoods, n.shippingCost, n.processingFixedFee, n.targetMonthlyProfit];
    if (moneyFields.some((v) => v < 0)) return t.negMoney;
    if (n.processingFeePct < 0 || n.processingFeePct > 100) return t.badPct;
    if (n.boostFeePct < 0 || n.boostFeePct > 100) return t.badPct;
    if (n.salePrice <= 0) return t.badSalePrice;
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
      n.salePrice, n.costOfGoods, n.shippingCost, n.sellerPaysShipping,
      n.processingFeePct, n.processingFixedFee, n.isBoosted, n.boostFeePct,
      n.numberOfSales, n.targetMonthlyProfit
    );

    const breakEvenSalePrice = findBreakEven(
      n.costOfGoods, n.shippingCost, n.sellerPaysShipping,
      n.processingFeePct, n.processingFixedFee, n.isBoosted, n.boostFeePct
    );

    const result = {
      ...core,
      breakEvenSalePrice,
      status: core.netProfit >= 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, breakEvenSalePrice, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.DepopCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
