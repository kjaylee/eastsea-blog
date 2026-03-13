(function (root) {
  const SEARCH_MAX_PRICE = 1000000;
  const SEARCH_ITERATIONS = 64;
  const MAX_DISCOUNT_SEARCH = 64;
  const SELLING_FEE_RATE = 0.05;

  const SELLER_PROGRAMS = [
    {
      id: 'standard',
      label: { ko: '기본 셀러 · 3.19% + $0.49', en: 'Standard seller · 3.19% + $0.49' },
      processingRatePct: 3.19,
      processingFlatFee: 0.49
    },
    {
      id: 'preferred',
      label: { ko: 'Preferred Seller · 2.99% + $0.49', en: 'Preferred Seller · 2.99% + $0.49' },
      processingRatePct: 2.99,
      processingFlatFee: 0.49
    }
  ];

  const SELLER_PROGRAM_MAP = Object.fromEntries(SELLER_PROGRAMS.map((program) => [program.id, program]));

  const DEFAULTS = {
    listPrice: 850,
    offerDiscountPct: 0,
    buyerShippingCharged: 35,
    buyerSalesTax: 0,
    sellerProgram: 'standard',
    extraPlatformFees: 0,
    itemCost: 500,
    sellerShippingCost: 26,
    packagingCost: 5,
    otherCost: 0
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      listPrice: '리스트 가격은 0보다 커야 합니다.',
      rate: '할인율은 0~100 범위여야 합니다.',
      program: '지원하지 않는 Reverb 셀러 프로그램입니다.',
      sale: '오퍼 적용 후 실거래가는 0보다 커야 합니다.',
      copied: '요약이 복사되었습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서는 이 Reverb 판매가 흑자입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 가격·오퍼·원가를 다시 보세요.',
      summaryTitle: '[Reverb 수수료·순이익 요약]',
      listPriceLabel: '리스트 가격',
      realizedSalePriceLabel: '실거래가',
      sellerProgramLabel: '셀러 프로그램',
      totalPlatformFees: '플랫폼 수수료 합계',
      payoutAfterFees: '수수료 차감 후 수령액',
      netProfit: '순이익',
      netMarginPct: '순이익률',
      breakEvenListPrice: '손익분기 리스트 가격',
      maxOfferDiscountPct: '적자 전 최대 할인율',
      note: '참고: 이 v1은 Reverb 공식 도움말 스니펫 기반 5% selling fee와 published processing baseline만 반영한 추정치입니다. bump / shipping label / cross-border fee는 수동 입력으로만 반영하며, 지역별 예외와 실제 정산 차이는 포함하지 않습니다.',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      money: 'All money fields must be zero or above.',
      listPrice: 'List price must be greater than zero.',
      rate: 'Offer discount must stay between 0 and 100.',
      program: 'Unsupported Reverb seller program.',
      sale: 'Realized sale price must be greater than zero after the offer discount.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate results.',
      statusGood: 'This Reverb sale is profitable under the current assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check your list price, costs, or offer discount.',
      summaryTitle: '[Reverb Fee Profit Summary]',
      listPriceLabel: 'List price',
      realizedSalePriceLabel: 'Realized sale price',
      sellerProgramLabel: 'Seller program',
      totalPlatformFees: 'Total platform fees',
      payoutAfterFees: 'Payout after fees',
      netProfit: 'Net profit',
      netMarginPct: 'Net margin',
      breakEvenListPrice: 'Break-even list price',
      maxOfferDiscountPct: 'Max offer discount before loss',
      note: 'Note: this v1 models the Reverb 5% selling-fee baseline and the published processing profiles from official help snippets. Bump / shipping-label / cross-border fees are only included through the manual extra-platform-fees input. Regional exceptions and settlement nuances are excluded.',
      na: 'N/A'
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function normalizeInput(input) {
    return {
      listPrice: Number(input.listPrice),
      offerDiscountPct: Number(input.offerDiscountPct),
      buyerShippingCharged: Number(input.buyerShippingCharged),
      buyerSalesTax: Number(input.buyerSalesTax),
      sellerProgram: input.sellerProgram || DEFAULTS.sellerProgram,
      extraPlatformFees: Number(input.extraPlatformFees),
      itemCost: Number(input.itemCost),
      sellerShippingCost: Number(input.sellerShippingCost),
      packagingCost: Number(input.packagingCost),
      otherCost: Number(input.otherCost)
    };
  }

  function resolveSellerProgram(input) {
    return SELLER_PROGRAM_MAP[input.sellerProgram] || null;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.ko;
    const moneyFields = [
      input.listPrice,
      input.buyerShippingCharged,
      input.buyerSalesTax,
      input.extraPlatformFees,
      input.itemCost,
      input.sellerShippingCost,
      input.packagingCost,
      input.otherCost
    ];

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }

    if (!Number.isFinite(input.listPrice) || input.listPrice <= 0) {
      return t.listPrice;
    }

    if (!Number.isFinite(input.offerDiscountPct) || input.offerDiscountPct < 0 || input.offerDiscountPct > 100) {
      return t.rate;
    }

    if (!resolveSellerProgram(input)) {
      return t.program;
    }

    const realizedSalePrice = input.listPrice * (1 - input.offerDiscountPct / 100);
    if (!Number.isFinite(realizedSalePrice) || realizedSalePrice <= 0) {
      return t.sale;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const sellerProgram = resolveSellerProgram(input);
    const listPrice = overrides && overrides.listPrice != null ? Number(overrides.listPrice) : input.listPrice;
    const offerDiscountPct = overrides && overrides.offerDiscountPct != null ? Number(overrides.offerDiscountPct) : input.offerDiscountPct;
    const realizedSalePrice = listPrice * (1 - offerDiscountPct / 100);
    const sellingFeeBase = realizedSalePrice + input.buyerShippingCharged;
    const orderTotalForProcessing = sellingFeeBase + input.buyerSalesTax;
    const reverbSellingFee = sellingFeeBase * SELLING_FEE_RATE;
    const paymentProcessingFee = orderTotalForProcessing * (sellerProgram.processingRatePct / 100) + sellerProgram.processingFlatFee;
    const totalPlatformFees = reverbSellingFee + paymentProcessingFee + input.extraPlatformFees;
    const payoutAfterFees = sellingFeeBase - totalPlatformFees;
    const sellerCostTotal = input.itemCost + input.sellerShippingCost + input.packagingCost + input.otherCost;
    const totalCost = totalPlatformFees + sellerCostTotal;
    const netProfit = sellingFeeBase - totalCost;
    const netMargin = sellingFeeBase > 0 ? netProfit / sellingFeeBase : 0;
    const effectiveFeeRate = sellingFeeBase > 0 ? totalPlatformFees / sellingFeeBase : 0;

    return {
      sellerProgram,
      listPrice,
      offerDiscountPct,
      realizedSalePrice,
      sellingFeeBase,
      orderTotalForProcessing,
      reverbSellingFee,
      paymentProcessingFee,
      totalPlatformFees,
      payoutAfterFees,
      sellerCostTotal,
      totalCost,
      netProfit,
      netMargin,
      effectiveFeeRate
    };
  }

  function findBreakEvenListPrice(input) {
    const current = evaluateScenario(input);
    if (Math.abs(current.netProfit) <= 0.000001) {
      return input.listPrice;
    }

    const lowestScenario = evaluateScenario(input, { listPrice: 0.01 });
    if (current.netProfit > 0) {
      if (lowestScenario.netProfit >= 0) {
        return 0.01;
      }

      let low = 0.01;
      let high = input.listPrice;
      for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
        const mid = (low + high) / 2;
        const profit = evaluateScenario(input, { listPrice: mid }).netProfit;
        if (profit >= 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return high;
    }

    let low = Math.max(0.01, input.listPrice);
    let high = Math.max(1, input.listPrice || 1);
    let highProfit = evaluateScenario(input, { listPrice: high }).netProfit;

    while (high < SEARCH_MAX_PRICE && highProfit < 0) {
      low = high;
      high = Math.min(SEARCH_MAX_PRICE, high * 2);
      highProfit = evaluateScenario(input, { listPrice: high }).netProfit;
    }

    if (highProfit < 0) {
      return null;
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const profit = evaluateScenario(input, { listPrice: mid }).netProfit;
      if (profit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function findMaxOfferDiscountPct(input) {
    const noDiscountProfit = evaluateScenario(input, { offerDiscountPct: 0 }).netProfit;
    if (noDiscountProfit < 0) {
      return null;
    }

    let low = 0;
    let high = 100;
    for (let i = 0; i < MAX_DISCOUNT_SEARCH; i += 1) {
      const mid = (low + high) / 2;
      const scenario = evaluateScenario(input, { offerDiscountPct: mid });
      if (scenario.realizedSalePrice > 0 && scenario.netProfit >= 0) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return low;
  }

  function formatMoney(value, lang) {
    const locale = lang === 'en' ? 'en-US' : 'ko-KR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'en' ? 'en-US' : 'ko-KR';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function getSellerProgramLabel(input, lang) {
    const sellerProgram = resolveSellerProgram(input);
    return sellerProgram ? (sellerProgram.label[lang] || sellerProgram.label.en) : '';
  }

  function formatRuleCopy(program, lang) {
    const processingText = lang === 'en'
      ? `${formatPercent(program.processingRatePct, lang)} of order total + ${formatMoney(program.processingFlatFee, lang)}`
      : `주문총액 기준 ${formatPercent(program.processingRatePct, lang)} + ${formatMoney(program.processingFlatFee, lang)}`;
    const sellingText = lang === 'en'
      ? `${formatPercent(SELLING_FEE_RATE * 100, lang)} selling fee on realized sale + buyer shipping`
      : `실거래가 + 구매자 배송비 기준 selling fee ${formatPercent(SELLING_FEE_RATE * 100, lang)}`;
    return `${program.label[lang] || program.label.en} · ${sellingText} · ${processingText}`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'ko';
    const t = TEXT[lang] || TEXT.ko;
    const na = t.na;

    return [
      t.summaryTitle,
      `${t.listPriceLabel}: ${formatMoney(result.inputs.listPrice, lang)}`,
      `${lang === 'en' ? 'Offer discount' : '오퍼 할인율'}: ${formatPercent(result.inputs.offerDiscountPct, lang)}`,
      `${t.realizedSalePriceLabel}: ${formatMoney(result.realizedSalePrice, lang)}`,
      `${lang === 'en' ? 'Buyer shipping charged' : '구매자 배송비'}: ${formatMoney(result.inputs.buyerShippingCharged, lang)}`,
      `${lang === 'en' ? 'Buyer sales tax' : '구매자 세금'}: ${formatMoney(result.inputs.buyerSalesTax, lang)}`,
      `${t.sellerProgramLabel}: ${result.sellerProgramLabel}`,
      `${lang === 'en' ? 'Reverb selling fee' : 'Reverb selling fee'}: ${formatMoney(result.reverbSellingFee, lang)}`,
      `${lang === 'en' ? 'Payment processing fee' : '결제 처리 수수료'}: ${formatMoney(result.paymentProcessingFee, lang)}`,
      `${lang === 'en' ? 'Extra platform fees' : '추가 플랫폼 수수료'}: ${formatMoney(result.inputs.extraPlatformFees, lang)}`,
      `${t.totalPlatformFees}: ${formatMoney(result.totalPlatformFees, lang)}`,
      `${t.payoutAfterFees}: ${formatMoney(result.payoutAfterFees, lang)}`,
      `${t.netProfit}: ${formatMoney(result.netProfit, lang)}`,
      `${t.netMarginPct}: ${formatPercent(result.netMarginPct, lang)}`,
      `${t.breakEvenListPrice}: ${result.breakEvenListPrice == null ? na : formatMoney(result.breakEvenListPrice, lang)}`,
      `${t.maxOfferDiscountPct}: ${result.maxOfferDiscountPct == null ? na : formatPercent(result.maxOfferDiscountPct, lang)}`,
      t.note
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'ko';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateScenario(normalized);
    const breakEvenListPrice = findBreakEvenListPrice(normalized);
    const maxOfferDiscountPct = findMaxOfferDiscountPct(normalized);
    const result = {
      inputs: normalized,
      sellerProgramLabel: getSellerProgramLabel(normalized, lang),
      realizedSalePrice: round2(evaluated.realizedSalePrice),
      sellingFeeBase: round2(evaluated.sellingFeeBase),
      orderTotalForProcessing: round2(evaluated.orderTotalForProcessing),
      reverbSellingFee: round2(evaluated.reverbSellingFee),
      paymentProcessingFee: round2(evaluated.paymentProcessingFee),
      totalPlatformFees: round2(evaluated.totalPlatformFees),
      payoutAfterFees: round2(evaluated.payoutAfterFees),
      sellerCostTotal: round2(evaluated.sellerCostTotal),
      totalCost: round2(evaluated.totalCost),
      netProfit: round2(evaluated.netProfit),
      netMargin: round4(evaluated.netMargin),
      netMarginPct: round2(evaluated.netMargin * 100),
      effectiveFeeRate: round4(evaluated.effectiveFeeRate),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
      breakEvenListPrice: breakEvenListPrice == null ? null : round2(breakEvenListPrice),
      maxOfferDiscountPct: maxOfferDiscountPct == null ? null : round2(maxOfferDiscountPct),
      sellerProgram: {
        id: evaluated.sellerProgram.id,
        processingRatePct: evaluated.sellerProgram.processingRatePct,
        processingFlatFee: evaluated.sellerProgram.processingFlatFee
      }
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    TEXT,
    SELLER_PROGRAMS,
    SELLER_PROGRAM_MAP,
    SELLING_FEE_RATE,
    normalizeInput,
    resolveSellerProgram,
    validate,
    evaluateScenario,
    findBreakEvenListPrice,
    findMaxOfferDiscountPct,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.ReverbFeeProfitCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← Tools',
      pageTitle: 'Reverb Fee Profit Calculator | Reverb 수수료·순이익 계산기',
      title: 'Reverb 수수료·순이익 계산기',
      subtitle: 'Reverb 리스트 가격, 오퍼 할인, 구매자 배송비·세금, 셀러 프로그램, 상품 원가와 배송/포장 비용을 넣어 실제 순이익과 안전한 할인 한도를 계산합니다.',
      disclaimer: 'v1은 Reverb 공식 도움말 스니펫의 5% selling fee와 published processing baseline을 반영한 추정기입니다. bump fee·shipping label·cross-border fee는 수동 입력으로만 반영하며, 지역별 세부 예외는 포함하지 않습니다.',
      inputHeader: '입력값',
      notesHeader: '가정 및 메모',
      summaryHeader: '복사용 요약',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      resultsEmpty: '유효한 입력값을 넣으면 KPI와 상세 계산이 표시됩니다.',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      listPrice: '리스트 가격',
      offerDiscountPct: '오퍼 할인율 (%)',
      buyerShippingCharged: '구매자 배송비',
      buyerSalesTax: '구매자 세금',
      sellerProgram: '셀러 프로그램',
      extraPlatformFees: '추가 플랫폼 수수료',
      itemCost: '상품 원가',
      sellerShippingCost: '판매자 실제 배송비',
      packagingCost: '포장비',
      otherCost: '기타 비용',
      ruleHeader: '선택된 셀러 프로그램 규칙',
      assumptionBullet1: 'Reverb selling fee는 실거래가 + 구매자 배송비 기준 5%로 계산합니다.',
      assumptionBullet2: '결제 처리 수수료는 실거래가 + 구매자 배송비 + 구매자 세금 기준으로 계산합니다.',
      assumptionBullet3: '추가 플랫폼 수수료는 bump / shipping label / cross-border fee 같은 항목을 수동으로 반영하는 입력값입니다.',
      assumptionBullet4: '구매자 세금은 seller revenue로 더하지 않고 processing fee 부담만 증가시키는 값으로 취급합니다.',
      whyHeader: '왜 세금이 순이익에 영향을 주나요?',
      whyBody: '공식 스니펫 기준으로 processing fee는 주문 총액(배송비와 적용 세금 포함)에 걸립니다. 그래서 세금이 seller revenue는 아니더라도 결제 처리 수수료 부담은 키울 수 있습니다.',
      kpiTotalPlatformFees: '플랫폼 수수료 합계',
      kpiPayoutAfterFees: '수수료 차감 후 수령액',
      kpiNetProfit: '순이익',
      kpiNetMarginPct: '순이익률',
      kpiBreakEvenListPrice: '손익분기 리스트 가격',
      kpiMaxOfferDiscountPct: '적자 전 최대 할인율',
      detailRealizedSalePrice: '실거래가',
      detailSellingFeeBase: 'selling fee 기준 금액',
      detailOrderTotalForProcessing: 'processing fee 기준 주문총액',
      detailReverbSellingFee: 'Reverb selling fee',
      detailPaymentProcessingFee: '결제 처리 수수료',
      detailSellerCostTotal: '판매자 비용 합계',
      detailTotalCost: '총비용',
      detailEffectiveFeeRatePct: '실효 수수료율'
    },
    en: {
      back: '← Tools',
      pageTitle: 'Reverb Fee Profit Calculator | Reverb 수수료·순이익 계산기',
      title: 'Reverb Fee Profit Calculator',
      subtitle: 'Estimate Reverb payout after list-price discounts, shipping charged, buyer sales tax, seller program, platform add-ons, and seller-side costs.',
      disclaimer: 'This v1 models the 5% Reverb selling-fee baseline plus the published processing profiles from official help snippets. Bump, shipping-label, and cross-border fees are only captured through the manual extra-platform-fees input.',
      inputHeader: 'Inputs',
      notesHeader: 'Assumptions & notes',
      summaryHeader: 'Copy-ready summary',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      resultsEmpty: 'Valid inputs will render KPI cards and the detailed fee table here.',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      listPrice: 'List price',
      offerDiscountPct: 'Offer discount (%)',
      buyerShippingCharged: 'Buyer shipping charged',
      buyerSalesTax: 'Buyer sales tax',
      sellerProgram: 'Seller program',
      extraPlatformFees: 'Extra platform fees',
      itemCost: 'Item cost',
      sellerShippingCost: 'Actual seller shipping cost',
      packagingCost: 'Packaging cost',
      otherCost: 'Other cost',
      ruleHeader: 'Active seller-program rule',
      assumptionBullet1: 'The Reverb selling fee is modeled at 5% of realized sale price plus buyer shipping charged.',
      assumptionBullet2: 'Payment processing is modeled on realized sale price plus buyer shipping and buyer sales tax.',
      assumptionBullet3: 'Extra platform fees let you manually include bump, shipping-label, cross-border, or other Reverb add-ons.',
      assumptionBullet4: 'Buyer sales tax increases the processing-fee basis but is not counted as seller revenue in this v1.',
      whyHeader: 'Why does buyer tax affect seller profit here?',
      whyBody: 'The official help snippets say payment processing is based on order total including shipping and applicable sales tax. That means tax can increase fee drag even though it is not modeled as your kept revenue.',
      kpiTotalPlatformFees: 'Total platform fees',
      kpiPayoutAfterFees: 'Payout after fees',
      kpiNetProfit: 'Net profit',
      kpiNetMarginPct: 'Net margin',
      kpiBreakEvenListPrice: 'Break-even list price',
      kpiMaxOfferDiscountPct: 'Max offer discount before loss',
      detailRealizedSalePrice: 'Realized sale price',
      detailSellingFeeBase: 'Selling-fee base',
      detailOrderTotalForProcessing: 'Processing-fee order total',
      detailReverbSellingFee: 'Reverb selling fee',
      detailPaymentProcessingFee: 'Payment processing fee',
      detailSellerCostTotal: 'Seller cost total',
      detailTotalCost: 'Total cost',
      detailEffectiveFeeRatePct: 'Effective fee rate'
    }
  };

  const fieldIds = ['listPrice', 'offerDiscountPct', 'buyerShippingCharged', 'buyerSalesTax', 'sellerProgram', 'extraPlatformFees', 'itemCost', 'sellerShippingCost', 'packagingCost', 'otherCost'];
  const currencyKeys = ['totalPlatformFees', 'payoutAfterFees', 'netProfit', 'breakEvenListPrice', 'realizedSalePrice', 'sellingFeeBase', 'orderTotalForProcessing', 'reverbSellingFee', 'paymentProcessingFee', 'sellerCostTotal', 'totalCost'];
  const percentKeys = ['netMarginPct', 'maxOfferDiscountPct', 'effectiveFeeRatePct'];

  const els = {
    htmlTitle: document.querySelector('title'),
    backLink: document.getElementById('backLink'),
    langBtn: document.getElementById('langBtn'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    disclaimer: document.getElementById('disclaimer'),
    inputHeader: document.getElementById('inputHeader'),
    notesHeader: document.getElementById('notesHeader'),
    summaryHeader: document.getElementById('summaryHeader'),
    resultsHeader: document.getElementById('resultsHeader'),
    detailHeader: document.getElementById('detailHeader'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    copyBtn: document.getElementById('copy'),
    resetBtn: document.getElementById('reset'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    resultsContent: document.getElementById('resultsContent'),
    ruleHeader: document.getElementById('programRuleHeader'),
    ruleBody: document.getElementById('programRuleBody'),
    assumption1: document.getElementById('assumption1'),
    assumption2: document.getElementById('assumption2'),
    assumption3: document.getElementById('assumption3'),
    assumption4: document.getElementById('assumption4'),
    whyHeader: document.getElementById('whyHeader'),
    whyBody: document.getElementById('whyBody')
  };

  fieldIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });

  [
    'totalPlatformFees',
    'payoutAfterFees',
    'netProfit',
    'netMarginPct',
    'breakEvenListPrice',
    'maxOfferDiscountPct',
    'realizedSalePrice',
    'sellingFeeBase',
    'orderTotalForProcessing',
    'reverbSellingFee',
    'paymentProcessingFee',
    'sellerCostTotal',
    'totalCost',
    'effectiveFeeRatePct'
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  let currentLang = 'ko';

  function getInputValue(id) {
    return els[id].value;
  }

  function setInputValue(id, value) {
    els[id].value = value;
  }

  function collectInput() {
    return {
      listPrice: getInputValue('listPrice'),
      offerDiscountPct: getInputValue('offerDiscountPct'),
      buyerShippingCharged: getInputValue('buyerShippingCharged'),
      buyerSalesTax: getInputValue('buyerSalesTax'),
      sellerProgram: getInputValue('sellerProgram'),
      extraPlatformFees: getInputValue('extraPlatformFees'),
      itemCost: getInputValue('itemCost'),
      sellerShippingCost: getInputValue('sellerShippingCost'),
      packagingCost: getInputValue('packagingCost'),
      otherCost: getInputValue('otherCost')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function updateRuleCopy() {
    const input = normalizeInput(collectInput());
    const sellerProgram = resolveSellerProgram(input) || SELLER_PROGRAM_MAP[DEFAULTS.sellerProgram];
    els.ruleBody.textContent = formatRuleCopy(sellerProgram, currentLang);
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.inputHeader.textContent = ui.inputHeader;
    els.notesHeader.textContent = ui.notesHeader;
    els.summaryHeader.textContent = ui.summaryHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.resultsEmpty.textContent = ui.resultsEmpty;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';

    fieldIds.forEach((key) => {
      els[`l_${key}`].textContent = ui[key];
    });

    SELLER_PROGRAMS.forEach((program) => {
      const option = els.sellerProgram.querySelector(`option[value="${program.id}"]`);
      if (option) {
        option.textContent = program.label[currentLang] || program.label.en;
      }
    });

    els.ruleHeader.textContent = ui.ruleHeader;
    els.assumption1.textContent = ui.assumptionBullet1;
    els.assumption2.textContent = ui.assumptionBullet2;
    els.assumption3.textContent = ui.assumptionBullet3;
    els.assumption4.textContent = ui.assumptionBullet4;
    els.whyHeader.textContent = ui.whyHeader;
    els.whyBody.textContent = ui.whyBody;

    document.querySelector('[data-kpi="totalPlatformFees"]').textContent = ui.kpiTotalPlatformFees;
    document.querySelector('[data-kpi="payoutAfterFees"]').textContent = ui.kpiPayoutAfterFees;
    document.querySelector('[data-kpi="netProfit"]').textContent = ui.kpiNetProfit;
    document.querySelector('[data-kpi="netMarginPct"]').textContent = ui.kpiNetMarginPct;
    document.querySelector('[data-kpi="breakEvenListPrice"]').textContent = ui.kpiBreakEvenListPrice;
    document.querySelector('[data-kpi="maxOfferDiscountPct"]').textContent = ui.kpiMaxOfferDiscountPct;

    document.querySelector('[data-detail="realizedSalePrice"]').textContent = ui.detailRealizedSalePrice;
    document.querySelector('[data-detail="sellingFeeBase"]').textContent = ui.detailSellingFeeBase;
    document.querySelector('[data-detail="orderTotalForProcessing"]').textContent = ui.detailOrderTotalForProcessing;
    document.querySelector('[data-detail="reverbSellingFee"]').textContent = ui.detailReverbSellingFee;
    document.querySelector('[data-detail="paymentProcessingFee"]').textContent = ui.detailPaymentProcessingFee;
    document.querySelector('[data-detail="sellerCostTotal"]').textContent = ui.detailSellerCostTotal;
    document.querySelector('[data-detail="totalCost"]').textContent = ui.detailTotalCost;
    document.querySelector('[data-detail="effectiveFeeRatePct"]').textContent = ui.detailEffectiveFeeRatePct;

    updateRuleCopy();
  }

  function clearOutputs() {
    currencyKeys.forEach((key) => {
      if (els[key]) {
        els[key].textContent = '—';
      }
    });
    percentKeys.forEach((key) => {
      if (els[key]) {
        els[key].textContent = '—';
      }
    });
    els.summary.value = '';
  }

  function render() {
    updateRuleCopy();
    const t = TEXT[currentLang] || TEXT.ko;
    const { result, error } = calculate(collectInput(), { lang: currentLang });

    if (error) {
      els.error.textContent = error || t.invalid;
      els.error.classList.add('show');
      els.status.textContent = t.waiting;
      els.status.className = 'status';
      els.resultsContent.hidden = true;
      els.resultsEmpty.hidden = false;
      clearOutputs();
      return;
    }

    els.error.classList.remove('show');
    els.resultsContent.hidden = false;
    els.resultsEmpty.hidden = true;
    els.status.textContent = result.netProfit >= 0 ? t.statusGood : t.statusWarn;
    els.status.className = `status ${result.netProfit >= 0 ? 'good' : 'warn'}`;

    currencyKeys.forEach((key) => {
      const value = result[key];
      els[key].textContent = value == null ? t.na : formatMoney(value, currentLang);
    });

    percentKeys.forEach((key) => {
      const value = result[key];
      els[key].textContent = value == null ? t.na : formatPercent(value, currentLang);
    });

    els.summary.value = result.summary;
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      const eventName = els[id].tagName === 'SELECT' ? 'change' : 'input';
      els[id].addEventListener(eventName, render);
    });

    els.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      renderStaticText();
      render();
    });

    els.copyBtn.addEventListener('click', async () => {
      try {
        if (!els.summary.value) {
          render();
        }
        await navigator.clipboard.writeText(els.summary.value);
        els.status.textContent = TEXT[currentLang].copied;
        els.status.className = 'status good';
      } catch (error) {
        els.status.textContent = TEXT[currentLang].copyFail;
        els.status.className = 'status warn';
      }
    });

    els.resetBtn.addEventListener('click', () => {
      applyDefaults();
      renderStaticText();
      render();
    });
  }

  applyDefaults();
  renderStaticText();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);