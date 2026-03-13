(function (root) {
  const SEARCH_MAX_PRICE = 1000000;
  const SEARCH_ITERATIONS = 64;
  const PROCESSING_RATE = 0.03;
  const US_MINIMUM_SELLER_FEE = 5.0;

  const SELLER_LEVELS = [
    {
      id: 'level-1',
      label: { ko: 'Level 1 · 거래 수수료 9%', en: 'Level 1 · 9% transaction fee' },
      transactionRatePct: 9
    },
    {
      id: 'level-2',
      label: { ko: 'Level 2 · 거래 수수료 8.5%', en: 'Level 2 · 8.5% transaction fee' },
      transactionRatePct: 8.5
    },
    {
      id: 'level-3',
      label: { ko: 'Level 3 · 거래 수수료 8%', en: 'Level 3 · 8% transaction fee' },
      transactionRatePct: 8
    },
    {
      id: 'level-4',
      label: { ko: 'Level 4 · 거래 수수료 7.5%', en: 'Level 4 · 7.5% transaction fee' },
      transactionRatePct: 7.5
    },
    {
      id: 'level-5',
      label: { ko: 'Level 5 · 거래 수수료 7%', en: 'Level 5 · 7% transaction fee' },
      transactionRatePct: 7
    }
  ];

  const SELLER_LEVEL_MAP = Object.fromEntries(SELLER_LEVELS.map((level) => [level.id, level]));

  const DEFAULTS = {
    salePrice: 220,
    sellerLevel: 'level-1',
    itemCost: 140,
    shippingToStockx: 14,
    packagingCost: 1.5,
    otherCost: 0
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      salePrice: '판매가는 0보다 커야 합니다.',
      level: '지원하지 않는 StockX 셀러 레벨입니다.',
      copied: '요약이 복사되었습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서는 이 StockX 판매가 흑자입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 판매가나 원가 구조를 다시 보세요.',
      summaryTitle: '[StockX 수수료·순이익 요약]',
      salePriceLabel: '판매가',
      sellerLevelLabel: '셀러 레벨',
      finalStockxFees: '최종 StockX 수수료',
      payoutAfterFees: '수수료 차감 후 수령액',
      netProfit: '순이익',
      netMarginPct: '순이익률',
      breakEvenSalePrice: '손익분기 판매가',
      maxItemCostBeforeLoss: '적자 전 최대 상품 원가',
      note: '참고: 이 v1은 미국 기준 StockX 공개 수수료(셀러 레벨 거래 수수료 + 3% processing + $5 최소 셀러 수수료 해석)를 반영한 추정치입니다. Flex fees, 지역별 최소 수수료, 세금, 환율은 포함하지 않습니다.',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      money: 'All money fields must be zero or above.',
      salePrice: 'Sale price must be greater than zero.',
      level: 'Unsupported StockX seller level.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate results.',
      statusGood: 'This StockX sale is profitable under the current assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check your price or sourcing costs.',
      summaryTitle: '[StockX Fee Profit Summary]',
      salePriceLabel: 'Sale price',
      sellerLevelLabel: 'Seller level',
      finalStockxFees: 'Final StockX fees',
      payoutAfterFees: 'Payout after fees',
      netProfit: 'Net profit',
      netMarginPct: 'Net margin',
      breakEvenSalePrice: 'Break-even sale price',
      maxItemCostBeforeLoss: 'Max item cost before loss',
      note: 'Note: this v1 models the public US StockX seller-fee baseline using seller-level transaction fee + 3% processing + a published $5 minimum seller-fee interpretation. Flex fees, regional minimums, tax, and FX are excluded.',
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
      salePrice: Number(input.salePrice),
      sellerLevel: input.sellerLevel || DEFAULTS.sellerLevel,
      itemCost: Number(input.itemCost),
      shippingToStockx: Number(input.shippingToStockx),
      packagingCost: Number(input.packagingCost),
      otherCost: Number(input.otherCost)
    };
  }

  function resolveSellerLevel(input) {
    return SELLER_LEVEL_MAP[input.sellerLevel] || null;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.ko;
    const moneyFields = [input.salePrice, input.itemCost, input.shippingToStockx, input.packagingCost, input.otherCost];

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }

    if (!Number.isFinite(input.salePrice) || input.salePrice <= 0) {
      return t.salePrice;
    }

    if (!resolveSellerLevel(input)) {
      return t.level;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const level = resolveSellerLevel(input);
    const salePrice = overrides && overrides.salePrice != null ? Number(overrides.salePrice) : input.salePrice;
    const transactionRate = level.transactionRatePct / 100;
    const transactionFee = salePrice * transactionRate;
    const processingFee = salePrice * PROCESSING_RATE;
    const stockxFeesBeforeMinimum = transactionFee + processingFee;
    const finalStockxFees = Math.max(stockxFeesBeforeMinimum, US_MINIMUM_SELLER_FEE);
    const minimumFeeAdjustment = finalStockxFees - stockxFeesBeforeMinimum;
    const payoutAfterFees = salePrice - finalStockxFees;
    const sellerCostTotal = input.itemCost + input.shippingToStockx + input.packagingCost + input.otherCost;
    const totalCost = finalStockxFees + sellerCostTotal;
    const netProfit = salePrice - totalCost;
    const netMargin = salePrice > 0 ? netProfit / salePrice : 0;
    const effectiveFeeRate = salePrice > 0 ? finalStockxFees / salePrice : 0;
    const maxItemCostBeforeLoss = payoutAfterFees - (input.shippingToStockx + input.packagingCost + input.otherCost);

    return {
      level,
      salePrice,
      transactionFee,
      processingFee,
      stockxFeesBeforeMinimum,
      minimumFeeAdjustment,
      finalStockxFees,
      payoutAfterFees,
      sellerCostTotal,
      totalCost,
      netProfit,
      netMargin,
      effectiveFeeRate,
      maxItemCostBeforeLoss
    };
  }

  function findBreakEvenSalePrice(input) {
    const current = evaluateScenario(input);
    if (Math.abs(current.netProfit) <= 0.000001) {
      return input.salePrice;
    }

    const lowestScenario = evaluateScenario(input, { salePrice: 0.01 });
    if (current.netProfit > 0) {
      if (lowestScenario.netProfit >= 0) {
        return 0.01;
      }

      let low = 0.01;
      let high = input.salePrice;
      for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
        const mid = (low + high) / 2;
        const profit = evaluateScenario(input, { salePrice: mid }).netProfit;
        if (profit >= 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return high;
    }

    let low = Math.max(0.01, input.salePrice);
    let high = Math.max(1, input.salePrice || 1);
    let highProfit = evaluateScenario(input, { salePrice: high }).netProfit;

    while (high < SEARCH_MAX_PRICE && highProfit < 0) {
      low = high;
      high = Math.min(SEARCH_MAX_PRICE, high * 2);
      highProfit = evaluateScenario(input, { salePrice: high }).netProfit;
    }

    if (highProfit < 0) {
      return null;
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const profit = evaluateScenario(input, { salePrice: mid }).netProfit;
      if (profit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
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

  function getSellerLevelLabel(input, lang) {
    const level = resolveSellerLevel(input);
    return level ? (level.label[lang] || level.label.en) : '';
  }

  function formatRuleCopy(level, lang) {
    const rateText = formatPercent(level.transactionRatePct, lang);
    const processingText = lang === 'en'
      ? `${formatPercent(PROCESSING_RATE * 100, lang)} payment processing on sale price`
      : `판매가 기준 ${formatPercent(PROCESSING_RATE * 100, lang)} 결제 처리 수수료`;
    const floorText = lang === 'en'
      ? `${formatMoney(US_MINIMUM_SELLER_FEE, lang)} minimum seller fee (US baseline)`
      : `미국 기준 최소 셀러 수수료 ${formatMoney(US_MINIMUM_SELLER_FEE, lang)}`;
    return `${level.label[lang] || level.label.en} · ${rateText} · ${processingText} · ${floorText}`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'ko';
    const t = TEXT[lang] || TEXT.ko;
    const na = t.na;

    return [
      t.summaryTitle,
      `${t.salePriceLabel}: ${formatMoney(result.inputs.salePrice, lang)}`,
      `${t.sellerLevelLabel}: ${result.sellerLevelLabel}`,
      `${lang === 'en' ? 'Transaction fee' : '거래 수수료'}: ${formatMoney(result.transactionFee, lang)}`,
      `${lang === 'en' ? 'Payment processing fee' : '결제 처리 수수료'}: ${formatMoney(result.processingFee, lang)}`,
      `${lang === 'en' ? 'Fees before minimum' : '최소 수수료 적용 전 fees'}: ${formatMoney(result.stockxFeesBeforeMinimum, lang)}`,
      `${lang === 'en' ? 'Minimum fee adjustment' : '최소 수수료 보정'}: ${formatMoney(result.minimumFeeAdjustment, lang)}`,
      `${t.finalStockxFees}: ${formatMoney(result.finalStockxFees, lang)}`,
      `${t.payoutAfterFees}: ${formatMoney(result.payoutAfterFees, lang)}`,
      `${t.netProfit}: ${formatMoney(result.netProfit, lang)}`,
      `${t.netMarginPct}: ${formatPercent(result.netMarginPct, lang)}`,
      `${t.breakEvenSalePrice}: ${result.breakEvenSalePrice == null ? na : formatMoney(result.breakEvenSalePrice, lang)}`,
      `${t.maxItemCostBeforeLoss}: ${formatMoney(result.maxItemCostBeforeLoss, lang)}`,
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
    const breakEvenSalePrice = findBreakEvenSalePrice(normalized);
    const result = {
      inputs: normalized,
      sellerLevelLabel: getSellerLevelLabel(normalized, lang),
      transactionFee: round2(evaluated.transactionFee),
      processingFee: round2(evaluated.processingFee),
      stockxFeesBeforeMinimum: round2(evaluated.stockxFeesBeforeMinimum),
      minimumFeeAdjustment: round2(evaluated.minimumFeeAdjustment),
      finalStockxFees: round2(evaluated.finalStockxFees),
      payoutAfterFees: round2(evaluated.payoutAfterFees),
      sellerCostTotal: round2(evaluated.sellerCostTotal),
      totalCost: round2(evaluated.totalCost),
      netProfit: round2(evaluated.netProfit),
      netMargin: round4(evaluated.netMargin),
      netMarginPct: round2(evaluated.netMargin * 100),
      effectiveFeeRate: round4(evaluated.effectiveFeeRate),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
      breakEvenSalePrice: breakEvenSalePrice == null ? null : round2(breakEvenSalePrice),
      maxItemCostBeforeLoss: round2(evaluated.maxItemCostBeforeLoss),
      sellerLevel: {
        id: evaluated.level.id,
        transactionRatePct: evaluated.level.transactionRatePct
      },
      minimumSellerFee: US_MINIMUM_SELLER_FEE
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    TEXT,
    SELLER_LEVELS,
    SELLER_LEVEL_MAP,
    PROCESSING_RATE,
    US_MINIMUM_SELLER_FEE,
    normalizeInput,
    resolveSellerLevel,
    validate,
    evaluateScenario,
    findBreakEvenSalePrice,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.StockXFeeProfitCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← Tools',
      pageTitle: 'StockX Fee Profit Calculator | StockX 수수료·순이익 계산기',
      title: 'StockX 수수료·순이익 계산기',
      subtitle: 'StockX 판매가, 셀러 레벨, 상품 원가와 배송/포장 비용을 함께 넣어 실제 수령액과 안전한 매입 한도를 계산합니다.',
      disclaimer: 'v1은 미국 기준 StockX 공개 셀러 수수료 문서(레벨별 거래 수수료 + 3% processing + 공개된 $5 최소 셀러 수수료 해석)를 반영한 추정기입니다. Flex fees, 지역별 최소 수수료, 세금, 환율은 포함하지 않습니다.',
      inputHeader: '입력값',
      notesHeader: '가정 및 메모',
      summaryHeader: '복사용 요약',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      resultsEmpty: '유효한 입력값을 넣으면 KPI와 상세 계산이 표시됩니다.',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      salePrice: '판매가',
      sellerLevel: '셀러 레벨',
      itemCost: '상품 원가',
      shippingToStockx: 'StockX 발송비',
      packagingCost: '포장비',
      otherCost: '기타 비용',
      ruleHeader: '선택된 수수료 규칙',
      assumptionBullet1: 'StockX 거래 수수료는 공개된 Seller Level 요율을 판매가에 곱해 계산합니다.',
      assumptionBullet2: '결제 처리 수수료는 판매가 기준 3%로 계산합니다.',
      assumptionBullet3: 'v1은 미국 기준 공개된 최소 셀러 수수료 $5.00을 총 StockX 수수료 하한선으로 해석합니다.',
      assumptionBullet4: 'Flex storage / fulfillment fee, 지역별 최소 수수료, 세금, 환율, payout delay는 범위 밖입니다.',
      whyHeader: '왜 저가 판매는 체감 수수료율이 급격히 오르나요?',
      whyBody: '낮은 판매가에서는 퍼센트 수수료 합계보다 공개된 최소 셀러 수수료가 더 크게 작동할 수 있습니다. 그래서 저가 판매는 단순 12% 전후 감각보다 실제 실효 수수료율이 더 높게 보일 수 있습니다.',
      kpiFinalStockxFees: '최종 StockX 수수료',
      kpiPayoutAfterFees: '수수료 차감 후 수령액',
      kpiNetProfit: '순이익',
      kpiNetMarginPct: '순이익률',
      kpiBreakEvenSalePrice: '손익분기 판매가',
      kpiMaxItemCostBeforeLoss: '적자 전 최대 상품 원가',
      detailTransactionFee: '거래 수수료',
      detailProcessingFee: '결제 처리 수수료',
      detailFeesBeforeMinimum: '최소 수수료 적용 전',
      detailMinimumFeeAdjustment: '최소 수수료 보정',
      detailSellerCostTotal: '판매자 비용 합계',
      detailEffectiveFeeRatePct: '실효 수수료율',
      detailTotalCost: '총비용'
    },
    en: {
      back: '← Tools',
      pageTitle: 'StockX Fee Profit Calculator | StockX 수수료·순이익 계산기',
      title: 'StockX Fee Profit Calculator',
      subtitle: 'Estimate StockX take-home after seller-level fees, processing, item cost, shipping-to-StockX, packaging, and other seller-side costs.',
      disclaimer: 'This v1 models the public US StockX seller-fee baseline: seller-level transaction fee, 3% payment processing, and a published $5 minimum seller-fee interpretation. Flex fees, regional minimums, taxes, FX, and payout timing are out of scope.',
      inputHeader: 'Inputs',
      notesHeader: 'Assumptions & notes',
      summaryHeader: 'Copy-ready summary',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      resultsEmpty: 'Valid inputs will render KPI cards and the detailed fee table here.',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      salePrice: 'Sale price',
      sellerLevel: 'Seller level',
      itemCost: 'Item cost',
      shippingToStockx: 'Shipping to StockX',
      packagingCost: 'Packaging cost',
      otherCost: 'Other cost',
      ruleHeader: 'Active fee rule',
      assumptionBullet1: 'Transaction fee is modeled from the public Seller Level rate table on sale price.',
      assumptionBullet2: 'Payment processing is modeled at 3% of sale price.',
      assumptionBullet3: 'This v1 interprets the published US $5 minimum seller fee as the floor for total StockX fees.',
      assumptionBullet4: 'Flex storage / fulfillment, regional fee floors, tax, FX, and payout timing are outside scope.',
      whyHeader: 'Why do low-priced sales feel more expensive?',
      whyBody: 'At lower sale prices, the published minimum seller-fee floor can dominate the pure percentage math. That pushes the effective fee rate above the usual seller-level-plus-processing intuition.',
      kpiFinalStockxFees: 'Final StockX fees',
      kpiPayoutAfterFees: 'Payout after fees',
      kpiNetProfit: 'Net profit',
      kpiNetMarginPct: 'Net margin',
      kpiBreakEvenSalePrice: 'Break-even sale price',
      kpiMaxItemCostBeforeLoss: 'Max item cost before loss',
      detailTransactionFee: 'Transaction fee',
      detailProcessingFee: 'Payment processing fee',
      detailFeesBeforeMinimum: 'Fees before minimum',
      detailMinimumFeeAdjustment: 'Minimum fee adjustment',
      detailSellerCostTotal: 'Seller cost total',
      detailEffectiveFeeRatePct: 'Effective fee rate',
      detailTotalCost: 'Total cost'
    }
  };

  const fieldIds = ['salePrice', 'sellerLevel', 'itemCost', 'shippingToStockx', 'packagingCost', 'otherCost'];
  const currencyKeys = ['transactionFee', 'processingFee', 'stockxFeesBeforeMinimum', 'minimumFeeAdjustment', 'finalStockxFees', 'payoutAfterFees', 'sellerCostTotal', 'totalCost', 'netProfit', 'breakEvenSalePrice', 'maxItemCostBeforeLoss'];
  const percentKeys = ['netMarginPct', 'effectiveFeeRatePct'];

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
    ruleHeader: document.getElementById('ruleHeader'),
    ruleBody: document.getElementById('ruleBody'),
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
    'transactionFee',
    'processingFee',
    'stockxFeesBeforeMinimum',
    'minimumFeeAdjustment',
    'finalStockxFees',
    'payoutAfterFees',
    'sellerCostTotal',
    'totalCost',
    'netProfit',
    'netMarginPct',
    'effectiveFeeRatePct',
    'breakEvenSalePrice',
    'maxItemCostBeforeLoss'
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
      salePrice: getInputValue('salePrice'),
      sellerLevel: getInputValue('sellerLevel'),
      itemCost: getInputValue('itemCost'),
      shippingToStockx: getInputValue('shippingToStockx'),
      packagingCost: getInputValue('packagingCost'),
      otherCost: getInputValue('otherCost')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function updateRuleCopy() {
    const input = normalizeInput(collectInput());
    const level = resolveSellerLevel(input) || SELLER_LEVEL_MAP[DEFAULTS.sellerLevel];
    els.ruleBody.textContent = formatRuleCopy(level, currentLang);
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

    SELLER_LEVELS.forEach((level) => {
      const option = els.sellerLevel.querySelector(`option[value="${level.id}"]`);
      if (option) {
        option.textContent = level.label[currentLang] || level.label.en;
      }
    });

    els.ruleHeader.textContent = ui.ruleHeader;
    els.assumption1.textContent = ui.assumptionBullet1;
    els.assumption2.textContent = ui.assumptionBullet2;
    els.assumption3.textContent = ui.assumptionBullet3;
    els.assumption4.textContent = ui.assumptionBullet4;
    els.whyHeader.textContent = ui.whyHeader;
    els.whyBody.textContent = ui.whyBody;

    document.querySelector('[data-kpi="finalStockxFees"]').textContent = ui.kpiFinalStockxFees;
    document.querySelector('[data-kpi="payoutAfterFees"]').textContent = ui.kpiPayoutAfterFees;
    document.querySelector('[data-kpi="netProfit"]').textContent = ui.kpiNetProfit;
    document.querySelector('[data-kpi="netMarginPct"]').textContent = ui.kpiNetMarginPct;
    document.querySelector('[data-kpi="breakEvenSalePrice"]').textContent = ui.kpiBreakEvenSalePrice;
    document.querySelector('[data-kpi="maxItemCostBeforeLoss"]').textContent = ui.kpiMaxItemCostBeforeLoss;

    document.querySelector('[data-detail="transactionFee"]').textContent = ui.detailTransactionFee;
    document.querySelector('[data-detail="processingFee"]').textContent = ui.detailProcessingFee;
    document.querySelector('[data-detail="stockxFeesBeforeMinimum"]').textContent = ui.detailFeesBeforeMinimum;
    document.querySelector('[data-detail="minimumFeeAdjustment"]').textContent = ui.detailMinimumFeeAdjustment;
    document.querySelector('[data-detail="sellerCostTotal"]').textContent = ui.detailSellerCostTotal;
    document.querySelector('[data-detail="effectiveFeeRatePct"]').textContent = ui.detailEffectiveFeeRatePct;
    document.querySelector('[data-detail="totalCost"]').textContent = ui.detailTotalCost;

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
