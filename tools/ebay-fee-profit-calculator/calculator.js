(function (root) {
  const ROOT_SEARCH_MAX_PRICE = 100000;
  const ROOT_SEARCH_STEPS = 240;
  const ROOT_SEARCH_ITERATIONS = 48;

  const PRESETS = [
    { id: 'most', lowRatePct: 13.6, threshold: 7500, overRatePct: 2.35, perOrderExempt: false, label: { ko: '대부분 카테고리', en: 'Most categories' } },
    { id: 'media', lowRatePct: 15.3, threshold: 7500, overRatePct: 2.35, perOrderExempt: false, label: { ko: '도서/영화/음악', en: 'Books / Movies / Music' } },
    { id: 'sneakers150', lowRatePct: 8.0, threshold: null, overRatePct: null, perOrderExempt: true, label: { ko: '스니커즈 $150 초과', en: 'Sneakers over $150' } },
    { id: 'guitars', lowRatePct: 6.7, threshold: 7500, overRatePct: 2.35, perOrderExempt: false, label: { ko: '기타 & 베이스', en: 'Guitars & Basses' } },
    { id: 'heavy', lowRatePct: 3.0, threshold: 15000, overRatePct: 0.5, perOrderExempt: false, label: { ko: '중장비', en: 'Heavy Equipment' } },
    { id: 'custom', lowRatePct: 13.6, threshold: 7500, overRatePct: 2.35, perOrderExempt: false, label: { ko: '사용자 지정', en: 'Custom' } }
  ];

  const presetMap = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

  const DEFAULTS = {
    soldPrice: 45,
    shippingCharged: 7,
    salesTaxRatePct: 8,
    itemCost: 18,
    actualShippingCost: 6.2,
    packagingCost: 0.8,
    categoryPreset: 'most',
    customLowRatePct: 13.6,
    customThreshold: 7500,
    customOverRatePct: 2.35,
    customPerOrderExempt: false,
    promotedRatePct: 5,
    chargeInsertionFee: false,
    insertionFeeAmount: 0.35
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      rate: '비율(%) 입력값은 0에서 100 사이여야 합니다.',
      revenue: '세전 매출(판매가 + 구매자 배송비)이 0보다 커야 합니다.',
      customMissing: '커스텀 카테고리의 수수료율/임계값이 유효해야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서는 주문당 순이익이 플러스입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 가격/광고율/원가를 점검하세요.',
      summaryTitle: '[eBay 수수료·순이익 요약]',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      money: 'All money fields must be zero or above.',
      rate: 'Percentage inputs must be between 0 and 100.',
      revenue: 'Revenue excluding tax (sold price + buyer shipping) must be greater than zero.',
      customMissing: 'Custom category rates/threshold must be valid.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate results.',
      statusGood: 'Net profit per order is positive under these assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check price/ad rate/costs.',
      summaryTitle: '[eBay Fee Profit Summary]',
      na: 'N/A'
    }
  };

  function round(value, digits) {
    const f = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * f) / f;
  }
  const r2 = (v) => round(v, 2);
  const r4 = (v) => round(v, 4);

  function normalize(input) {
    const src = input || {};
    return {
      soldPrice: Number(src.soldPrice ?? DEFAULTS.soldPrice),
      shippingCharged: Number(src.shippingCharged ?? DEFAULTS.shippingCharged),
      salesTaxRatePct: Number(src.salesTaxRatePct ?? DEFAULTS.salesTaxRatePct),
      itemCost: Number(src.itemCost ?? DEFAULTS.itemCost),
      actualShippingCost: Number(src.actualShippingCost ?? DEFAULTS.actualShippingCost),
      packagingCost: Number(src.packagingCost ?? DEFAULTS.packagingCost),
      categoryPreset: src.categoryPreset || DEFAULTS.categoryPreset,
      customLowRatePct: Number(src.customLowRatePct ?? DEFAULTS.customLowRatePct),
      customThreshold: src.customThreshold == null ? DEFAULTS.customThreshold : Number(src.customThreshold),
      customOverRatePct: src.customOverRatePct == null ? DEFAULTS.customOverRatePct : Number(src.customOverRatePct),
      customPerOrderExempt: src.customPerOrderExempt != null ? Boolean(src.customPerOrderExempt) : DEFAULTS.customPerOrderExempt,
      promotedRatePct: Number(src.promotedRatePct ?? DEFAULTS.promotedRatePct),
      chargeInsertionFee: src.chargeInsertionFee != null ? Boolean(src.chargeInsertionFee) : DEFAULTS.chargeInsertionFee,
      insertionFeeAmount: Number(src.insertionFeeAmount ?? DEFAULTS.insertionFeeAmount)
    };
  }

  function resolvePreset(input) {
    const base = presetMap[input.categoryPreset] || presetMap.most;
    if (base.id !== 'custom') return base;
    return {
      id: 'custom',
      lowRatePct: input.customLowRatePct,
      threshold: input.customThreshold,
      overRatePct: input.customOverRatePct,
      perOrderExempt: input.customPerOrderExempt,
      label: base.label
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const money = [
      input.soldPrice,
      input.shippingCharged,
      input.itemCost,
      input.actualShippingCost,
      input.packagingCost,
      input.insertionFeeAmount
    ];
    if (money.some((v) => !Number.isFinite(v) || v < 0)) return t.money;

    const rates = [input.salesTaxRatePct, input.promotedRatePct];
    if (rates.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) return t.rate;

    const revenueExTax = input.soldPrice + input.shippingCharged;
    if (!Number.isFinite(revenueExTax) || revenueExTax <= 0) return t.revenue;

    if (input.categoryPreset === 'custom') {
      if (
        !Number.isFinite(input.customLowRatePct) || input.customLowRatePct < 0 || input.customLowRatePct > 100 ||
        (input.customThreshold != null && input.customThreshold < 0) ||
        (input.customOverRatePct != null && (input.customOverRatePct < 0 || input.customOverRatePct > 100))
      ) {
        return t.customMissing;
      }
    }
    return '';
  }

  function evaluateAtSoldPrice(input, soldPriceOverride) {
    const soldPrice = soldPriceOverride == null ? input.soldPrice : Number(soldPriceOverride);
    const salesTaxRate = input.salesTaxRatePct / 100;
    const promotedRate = input.promotedRatePct / 100;
    const preset = resolvePreset(input);
    const lowRate = (preset.lowRatePct || 0) / 100;
    const overRate = preset.overRatePct == null ? null : (preset.overRatePct / 100);
    const threshold = preset.threshold == null ? null : Number(preset.threshold);

    const revenueExTax = soldPrice + input.shippingCharged;
    const estimatedSalesTax = revenueExTax * salesTaxRate;
    const transactionTotal = revenueExTax + estimatedSalesTax;

    let finalValueFee = 0;
    if (threshold == null || overRate == null) {
      finalValueFee = lowRate * transactionTotal;
    } else {
      const lowPortion = Math.min(transactionTotal, threshold);
      const overPortion = Math.max(transactionTotal - threshold, 0);
      finalValueFee = (lowRate * lowPortion) + (overRate * overPortion);
    }

    const perOrderFee = preset.perOrderExempt ? 0 : (transactionTotal <= 10 ? 0.30 : 0.40);
    const insertionFee = input.chargeInsertionFee ? input.insertionFeeAmount : 0;
    const promotedListingsFee = promotedRate * transactionTotal;
    const ebayFeeTotal = finalValueFee + perOrderFee + insertionFee + promotedListingsFee;
    const sellerCostTotal = input.itemCost + input.actualShippingCost + input.packagingCost;
    const totalCost = ebayFeeTotal + sellerCostTotal;

    const payoutAfterEbayFees = revenueExTax - ebayFeeTotal;
    const netProfit = revenueExTax - totalCost;
    const netMargin = revenueExTax > 0 ? netProfit / revenueExTax : 0;
    const effectiveEbayFeeRate = revenueExTax > 0 ? ebayFeeTotal / revenueExTax : 0;

    return {
      soldPrice,
      revenueExTax,
      estimatedSalesTax,
      transactionTotal,
      finalValueFee,
      perOrderFee,
      insertionFee,
      promotedListingsFee,
      ebayFeeTotal,
      sellerCostTotal,
      totalCost,
      payoutAfterEbayFees,
      netProfit,
      netMargin,
      effectiveEbayFeeRate
    };
  }

  function binarySearchRoot(input, lo, hi) {
    let low = lo;
    let high = hi;
    for (let i = 0; i < ROOT_SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const profit = evaluateAtSoldPrice(input, mid).netProfit;
      if (profit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return high;
  }

  function findBreakEvenSoldPrice(input) {
    const current = evaluateAtSoldPrice(input, input.soldPrice);
    if (Math.abs(current.netProfit) <= 1e-6) return input.soldPrice;

    if (current.netProfit > 0) {
      let prev = input.soldPrice;
      for (let step = 1; step <= ROOT_SEARCH_STEPS; step += 1) {
        const price = input.soldPrice * (1 - step / ROOT_SEARCH_STEPS);
        const profit = evaluateAtSoldPrice(input, price).netProfit;
        if (profit <= 0) {
          return binarySearchRoot(input, price, prev);
        }
        prev = price;
      }
      return 0;
    }

    let low = Math.max(input.soldPrice, 0);
    let high = Math.max(1, low || 1);
    let pHigh = evaluateAtSoldPrice(input, high).netProfit;
    while (high < ROOT_SEARCH_MAX_PRICE && pHigh < 0) {
      low = high;
      high = Math.min(ROOT_SEARCH_MAX_PRICE, high * 2);
      pHigh = evaluateAtSoldPrice(input, high).netProfit;
    }
    if (pHigh < 0) return null;
    return binarySearchRoot(input, low, high);
  }

  function computeMaxPromotedRateBeforeLoss(input) {
    // Use rounded components to align with displayed two-decimal outputs.
    const e = evaluateAtSoldPrice(input, input.soldPrice);
    const revenueExTax = r2(e.revenueExTax);
    const transactionTotal = r2(e.transactionTotal);
    const finalValueFee = r2(e.finalValueFee);
    const perOrderFee = r2(e.perOrderFee);
    const insertionFee = r2(e.insertionFee);
    const sellerCostTotal = r2(e.sellerCostTotal);
    const numerator = revenueExTax - (finalValueFee + perOrderFee + insertionFee + sellerCostTotal);
    if (transactionTotal <= 0) return null;
    const raw = numerator / transactionTotal;
    if (!Number.isFinite(raw)) return null;
    return Math.max(0, Math.min(1, raw));
  }

  function moneyFmt(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  function pctFmt(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${lang === 'ko' ? '판매가' : 'Sold price'}: ${moneyFmt(result.inputs.soldPrice, lang)}`,
      `${lang === 'ko' ? '카테고리' : 'Category preset'}: ${result.presetLabel}`,
      `${lang === 'ko' ? 'eBay 수수료 합계' : 'eBay fee total'}: ${moneyFmt(result.ebayFeeTotal, lang)}`,
      `${lang === 'ko' ? 'eBay 수수료 차감 후 수령액' : 'Payout after eBay fees'}: ${moneyFmt(result.payoutAfterEbayFees, lang)}`,
      `${lang === 'ko' ? '순이익' : 'Net profit'}: ${moneyFmt(result.netProfit, lang)}`,
      `${lang === 'ko' ? '순이익률' : 'Net margin'}: ${pctFmt(result.netMarginPct, lang)}`,
      `${lang === 'ko' ? '손익분기 판매가' : 'Break-even sold price'}: ${result.breakEvenSoldPrice == null ? t.na : moneyFmt(result.breakEvenSoldPrice, lang)}`,
      `${lang === 'ko' ? '적자 전 최대 광고율' : 'Max promoted ad rate before loss'}: ${result.maxPromotedAdRateBeforeLossPct == null ? t.na : pctFmt(result.maxPromotedAdRateBeforeLossPct, lang)}`,
      `${lang === 'ko' ? '참고: eBay 수수료는 카테고리/판매자 상태에 따라 다를 수 있으며, v1은 공개 기준만 반영합니다. 수수료 기준 금액에는 판매가, 구매자 배송비, 예상 판매세가 포함됩니다.' : 'Note: eBay fee rules vary by category and seller profile; this v1 models standard public behavior. Fee basis includes sold price, buyer shipping, and estimated sales tax.'}`
    ].join('\n');
  }

  function getPresetLabel(preset, lang) {
    return preset && (preset.label[lang] || preset.label.en) || '';
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const v = normalize(input);
    const error = validate(v, lang);
    if (error) return { result: null, error };

    const preset = resolvePreset(v);
    const e = evaluateAtSoldPrice(v, v.soldPrice);
    const breakEvenSoldPrice = findBreakEvenSoldPrice(v);
    const maxPromotedAdRateBeforeLoss = computeMaxPromotedRateBeforeLoss(v);

    const result = {
      inputs: v,
      presetLabel: getPresetLabel(preset, lang),
      revenueExTax: r2(e.revenueExTax),
      estimatedSalesTax: r2(e.estimatedSalesTax),
      transactionTotal: r2(e.transactionTotal),
      finalValueFee: r2(e.finalValueFee),
      perOrderFee: r2(e.perOrderFee),
      insertionFee: r2(e.insertionFee),
      promotedListingsFee: r2(e.promotedListingsFee),
      ebayFeeTotal: r2(e.ebayFeeTotal),
      sellerCostTotal: r2(e.sellerCostTotal),
      totalCost: r2(e.totalCost),
      payoutAfterEbayFees: r2(e.payoutAfterEbayFees),
      netProfit: r2(e.netProfit),
      netMargin: r4(e.netMargin),
      netMarginPct: r2(e.netMargin * 100),
      effectiveEbayFeeRate: r4(e.effectiveEbayFeeRate),
      effectiveEbayFeeRatePct: r2(e.effectiveEbayFeeRate * 100),
      breakEvenSoldPrice: breakEvenSoldPrice == null ? null : r2(breakEvenSoldPrice),
      maxPromotedAdRateBeforeLossPct: maxPromotedAdRateBeforeLoss == null ? null : r2(maxPromotedAdRateBeforeLoss * 100)
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    PRESETS,
    presetMap,
    DEFAULTS,
    TEXT,
    normalize,
    resolvePreset,
    validate,
    evaluateAtSoldPrice,
    findBreakEvenSoldPrice,
    computeMaxPromotedRateBeforeLoss,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.EbayFeeProfitCalculator = api;

  if (typeof document === 'undefined') return;

  // --- Minimal browser UI wiring ---
  function $(id) { return document.getElementById(id); }

  const els = {
    htmlTitle: document.querySelector('title'),
    backLink: $('backLink'),
    langBtn: $('langBtn'),
    title: $('titleH1'),
    subtitle: $('subtitle'),
    inputHeader: $('inputHeader'),
    resultsHeader: $('resultsHeader'),
    detailHeader: $('detailHeader'),
    assumptionHeader: $('assumptionHeader'),
    assumptionList: $('assumptionList'),
    copyBtn: $('copyBtn'),
    resetBtn: $('resetBtn'),
    error: $('error'),
    status: $('status'),
    summary: $('summary'),
    // inputs
    soldPrice: $('soldPrice'),
    shippingCharged: $('shippingCharged'),
    salesTaxRatePct: $('salesTaxRatePct'),
    itemCost: $('itemCost'),
    actualShippingCost: $('actualShippingCost'),
    packagingCost: $('packagingCost'),
    categoryPreset: $('categoryPreset'),
    customLowRatePct: $('customLowRatePct'),
    customThreshold: $('customThreshold'),
    customOverRatePct: $('customOverRatePct'),
    customPerOrderExempt: $('customPerOrderExempt'),
    promotedRatePct: $('promotedRatePct'),
    chargeInsertionFee: $('chargeInsertionFee'),
    insertionFeeAmount: $('insertionFeeAmount'),
    // outputs
    ebayFeeTotal: $('ebayFeeTotal'),
    payoutAfterEbayFees: $('payoutAfterEbayFees'),
    netProfit: $('netProfit'),
    netMargin: $('netMargin'),
    breakEvenSoldPrice: $('breakEvenSoldPrice'),
    maxPromotedAdRateBeforeLoss: $('maxPromotedAdRateBeforeLoss'),
    revenueExTax: $('revenueExTax'),
    estimatedSalesTax: $('estimatedSalesTax'),
    transactionTotal: $('transactionTotal'),
    finalValueFee: $('finalValueFee'),
    perOrderFee: $('perOrderFee'),
    insertionFee: $('insertionFee'),
    promotedListingsFee: $('promotedListingsFee'),
    sellerCostTotal: $('sellerCostTotal'),
    totalCost: $('totalCost')
  };

  let currentLang = 'en';

  const UI = {
    ko: {
      pageTitle: 'eBay Fee Profit Calculator | eBay 수수료·순이익 계산기',
      back: '← Tools',
      title: 'eBay 수수료·순이익 계산기',
      subtitle: '최종 거래가 수수료, 주문당 수수료, promoted listings, 구매자 배송비, 판매세 추정을 반영해 주문당 순이익과 손익분기 판매가를 계산합니다.',
      inputHeader: '입력값',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 지표',
      assumptionHeader: '가정 및 참고',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      assumptions: [
        '수수료 기준 금액에는 판매가 + 구매자 청구 배송비 + 예상 판매세가 포함됩니다.',
        '주문당 수수료는 $10 이하 $0.30, 초과 $0.40 (일부 예외).',
        'Store 구독 할인/셀러 등급 계수/해외 결제 수수료는 v1에서 제외됩니다.'
      ],
      labels: {
        soldPrice: '판매가',
        shippingCharged: '구매자 청구 배송비',
        salesTaxRatePct: '판매세율 (%)',
        itemCost: '상품 원가',
        actualShippingCost: '실제 배송비',
        packagingCost: '포장비',
        categoryPreset: '카테고리 프리셋',
        customLowRatePct: '커스텀 저구간 요율 (%)',
        customThreshold: '커스텀 임계값',
        customOverRatePct: '커스텀 초과 요율 (%)',
        customPerOrderExempt: '주문당 수수료 면제',
        promotedRatePct: 'Promoted listings 광고율 (%)',
        chargeInsertionFee: '이 인서션 수수료를 비용으로 반영',
        insertionFeeAmount: '인서션 수수료 금액'
      },
      kpi: {
        ebayFeeTotal: 'eBay 수수료 합계',
        payoutAfterEbayFees: 'eBay 수수료 차감 후 수령액',
        netProfit: '순이익',
        netMargin: '순이익률',
        breakEvenSoldPrice: '손익분기 판매가',
        maxPromotedAdRateBeforeLoss: '적자 전 최대 광고율'
      },
      detail: {
        revenueExTax: '세전 매출',
        estimatedSalesTax: '예상 판매세',
        transactionTotal: '수수료 산정 기준 총액',
        finalValueFee: 'Final value fee',
        perOrderFee: 'Per-order fee',
        insertionFee: 'Insertion fee',
        promotedListingsFee: 'Promoted listings fee',
        sellerCostTotal: '셀러 비용 합계',
        totalCost: '총비용',
        effectiveEbayFeeRate: '실효 eBay 수수료율'
      }
    },
    en: {
      pageTitle: 'eBay Fee Profit Calculator | eBay 수수료·순이익 계산기',
      back: '← Tools',
      title: 'eBay Fee Profit Calculator',
      subtitle: 'Estimate net profit per order after eBay final value fee, per-order fee, promoted listings, shipping charged to buyer, and estimated sales tax.',
      inputHeader: 'Inputs',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Detail table',
      assumptionHeader: 'Assumptions & notes',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      assumptions: [
        'Fee basis includes sold price + buyer shipping + estimated sales tax.',
        'Per-order fee: $0.30 at $10 or under, else $0.40 (some categories exempt).',
        'Store discounts/seller-level modifiers/international payment fees are excluded in this v1.'
      ],
      labels: {
        soldPrice: 'Sold price',
        shippingCharged: 'Shipping charged to buyer',
        salesTaxRatePct: 'Sales tax rate (%)',
        itemCost: 'Item cost',
        actualShippingCost: 'Actual shipping cost',
        packagingCost: 'Packaging cost',
        categoryPreset: 'Category preset',
        customLowRatePct: 'Custom low-tier rate (%)',
        customThreshold: 'Custom threshold',
        customOverRatePct: 'Custom over-threshold rate (%)',
        customPerOrderExempt: 'Per-order fee exemption',
        promotedRatePct: 'Promoted listings ad rate (%)',
        chargeInsertionFee: 'Charge insertion fee for this order',
        insertionFeeAmount: 'Insertion fee amount'
      },
      kpi: {
        ebayFeeTotal: 'eBay fee total',
        payoutAfterEbayFees: 'Payout after eBay fees',
        netProfit: 'Net profit',
        netMargin: 'Net margin',
        breakEvenSoldPrice: 'Break-even sold price',
        maxPromotedAdRateBeforeLoss: 'Max promoted ad rate before loss'
      },
      detail: {
        revenueExTax: 'Revenue excluding tax',
        estimatedSalesTax: 'Estimated sales tax',
        transactionTotal: 'Transaction total (fee basis)',
        finalValueFee: 'Final value fee',
        perOrderFee: 'Per-order fee',
        insertionFee: 'Insertion fee',
        promotedListingsFee: 'Promoted listings fee',
        sellerCostTotal: 'Seller cost total',
        totalCost: 'Total cost',
        effectiveEbayFeeRate: 'Effective eBay fee rate'
      }
    }
  };

  const fieldIds = [
    'soldPrice','shippingCharged','salesTaxRatePct','itemCost','actualShippingCost','packagingCost','categoryPreset','customLowRatePct','customThreshold','customOverRatePct','customPerOrderExempt','promotedRatePct','chargeInsertionFee','insertionFeeAmount'
  ];

  function collectInput() {
    return {
      soldPrice: Number(els.soldPrice.value),
      shippingCharged: Number(els.shippingCharged.value),
      salesTaxRatePct: Number(els.salesTaxRatePct.value),
      itemCost: Number(els.itemCost.value),
      actualShippingCost: Number(els.actualShippingCost.value),
      packagingCost: Number(els.packagingCost.value),
      categoryPreset: els.categoryPreset.value,
      customLowRatePct: Number(els.customLowRatePct.value),
      customThreshold: els.customThreshold.value === '' ? null : Number(els.customThreshold.value),
      customOverRatePct: els.customOverRatePct.value === '' ? null : Number(els.customOverRatePct.value),
      customPerOrderExempt: els.customPerOrderExempt.checked,
      promotedRatePct: Number(els.promotedRatePct.value),
      chargeInsertionFee: els.chargeInsertionFee.checked,
      insertionFeeAmount: Number(els.insertionFeeAmount.value)
    };
  }

  function renderStatic() {
    const ui = UI[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.inputHeader.textContent = ui.inputHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.assumptionHeader.textContent = ui.assumptionHeader;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';

    // labels
    Object.entries(ui.labels).forEach(([key, label]) => {
      const node = document.querySelector(`label[for="${key}"]`);
      if (node) node.textContent = label;
    });

    // preset options
    els.categoryPreset.innerHTML = PRESETS.map((p) => `<option value="${p.id}">${p.label[currentLang] || p.label.en}</option>`).join('');
    els.categoryPreset.value = collectInput().categoryPreset || DEFAULTS.categoryPreset;

    // assumptions
    els.assumptionList.innerHTML = ui.assumptions.map((s) => `<li>${s}</li>`).join('');

    // KPI/detail labels
    document.querySelector('[data-kpi="ebayFeeTotal"]').textContent = ui.kpi.ebayFeeTotal;
    document.querySelector('[data-kpi="payoutAfterEbayFees"]').textContent = ui.kpi.payoutAfterEbayFees;
    document.querySelector('[data-kpi="netProfit"]').textContent = ui.kpi.netProfit;
    document.querySelector('[data-kpi="netMargin"]').textContent = ui.kpi.netMargin;
    document.querySelector('[data-kpi="breakEvenSoldPrice"]').textContent = ui.kpi.breakEvenSoldPrice;
    document.querySelector('[data-kpi="maxPromotedAdRateBeforeLoss"]').textContent = ui.kpi.maxPromotedAdRateBeforeLoss;

    document.querySelector('[data-detail="revenueExTax"]').textContent = ui.detail.revenueExTax;
    document.querySelector('[data-detail="estimatedSalesTax"]').textContent = ui.detail.estimatedSalesTax;
    document.querySelector('[data-detail="transactionTotal"]').textContent = ui.detail.transactionTotal;
    document.querySelector('[data-detail="finalValueFee"]').textContent = ui.detail.finalValueFee;
    document.querySelector('[data-detail="perOrderFee"]').textContent = ui.detail.perOrderFee;
    document.querySelector('[data-detail="insertionFee"]').textContent = ui.detail.insertionFee;
    document.querySelector('[data-detail="promotedListingsFee"]').textContent = ui.detail.promotedListingsFee;
    document.querySelector('[data-detail="sellerCostTotal"]').textContent = ui.detail.sellerCostTotal;
    document.querySelector('[data-detail="totalCost"]').textContent = ui.detail.totalCost;
    document.querySelector('[data-detail="effectiveEbayFeeRate"]').textContent = ui.detail.effectiveEbayFeeRate;
  }

  function syncCustomFieldsState() {
    const isCustom = els.categoryPreset.value === 'custom';
    ['customLowRatePct','customThreshold','customOverRatePct','customPerOrderExempt'].forEach((id) => {
      const el = els[id];
      el.disabled = !isCustom;
      const wrap = document.getElementById(id + 'Wrap');
      if (wrap) wrap.classList.toggle('hidden', !isCustom);
    });
  }

  function money(v) { return moneyFmt(v, currentLang); }
  function pct(v) { return pctFmt(v, currentLang); }

  function clearOutputs() {
    ['ebayFeeTotal','payoutAfterEbayFees','netProfit','netMargin','breakEvenSoldPrice','maxPromotedAdRateBeforeLoss','revenueExTax','estimatedSalesTax','transactionTotal','finalValueFee','perOrderFee','insertionFee','promotedListingsFee','sellerCostTotal','totalCost'].forEach((k) => {
      if (els[k]) els[k].textContent = '—';
    });
    els.summary.value = '';
  }

  function render() {
    syncCustomFieldsState();
    const input = collectInput();
    const { result, error } = calculate(input, { lang: currentLang });
    const t = TEXT[currentLang] || TEXT.en;

    if (error) {
      els.error.textContent = error || t.invalid;
      els.error.classList.add('show');
      els.status.textContent = t.waiting;
      els.status.className = 'status';
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.status.textContent = result.netProfit >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.netProfit >= 0 ? 'good' : 'warn'}`;

    els.ebayFeeTotal.textContent = money(result.ebayFeeTotal);
    els.payoutAfterEbayFees.textContent = money(result.payoutAfterEbayFees);
    els.netProfit.textContent = money(result.netProfit);
    els.netMargin.textContent = pct(result.netMarginPct);
    els.breakEvenSoldPrice.textContent = result.breakEvenSoldPrice == null ? (t.na) : money(result.breakEvenSoldPrice);
    els.maxPromotedAdRateBeforeLoss.textContent = result.maxPromotedAdRateBeforeLossPct == null ? (t.na) : pct(result.maxPromotedAdRateBeforeLossPct);

    els.revenueExTax.textContent = money(result.revenueExTax);
    els.estimatedSalesTax.textContent = money(result.estimatedSalesTax);
    els.transactionTotal.textContent = money(result.transactionTotal);
    els.finalValueFee.textContent = money(result.finalValueFee);
    els.perOrderFee.textContent = money(result.perOrderFee);
    els.insertionFee.textContent = money(result.insertionFee);
    els.promotedListingsFee.textContent = money(result.promotedListingsFee);
    els.sellerCostTotal.textContent = money(result.sellerCostTotal);
    els.totalCost.textContent = money(result.totalCost);

    els.summary.value = result.summary;
  }

  function applyDefaults() {
    els.soldPrice.value = DEFAULTS.soldPrice;
    els.shippingCharged.value = DEFAULTS.shippingCharged;
    els.salesTaxRatePct.value = DEFAULTS.salesTaxRatePct;
    els.itemCost.value = DEFAULTS.itemCost;
    els.actualShippingCost.value = DEFAULTS.actualShippingCost;
    els.packagingCost.value = DEFAULTS.packagingCost;
    els.categoryPreset.value = DEFAULTS.categoryPreset;
    els.customLowRatePct.value = DEFAULTS.customLowRatePct;
    els.customThreshold.value = DEFAULTS.customThreshold;
    els.customOverRatePct.value = DEFAULTS.customOverRatePct;
    els.customPerOrderExempt.checked = DEFAULTS.customPerOrderExempt;
    els.promotedRatePct.value = DEFAULTS.promotedRatePct;
    els.chargeInsertionFee.checked = DEFAULTS.chargeInsertionFee;
    els.insertionFeeAmount.value = DEFAULTS.insertionFeeAmount;
  }

  function bind() {
    fieldIds.forEach((id) => {
      const node = els[id];
      if (!node) return;
      const event = node.tagName === 'SELECT' ? 'change' : (node.type === 'checkbox' ? 'change' : 'input');
      node.addEventListener(event, render);
    });

    els.resetBtn.addEventListener('click', () => { applyDefaults(); render(); });
    els.copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(els.summary.value || ''); els.status.textContent = TEXT[currentLang].copied; els.status.className = 'status good'; }
      catch { els.status.textContent = TEXT[currentLang].copyFail; els.status.className = 'status warn'; }
    });
    els.langBtn.addEventListener('click', () => { currentLang = currentLang === 'en' ? 'ko' : 'en'; renderStatic(); render(); });
  }

  // Initialize
  renderStatic();
  applyDefaults();
  bind();
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
