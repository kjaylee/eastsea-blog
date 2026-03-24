(function (root) {
  const PROCESSING_RATE = 0.029;
  const PROCESSING_FLAT = 0.3;

  const PRESETS = [
    {
      id: 'standard',
      ratePct: 8,
      label: { ko: '표준 판매 · 수수료 8%', en: 'Standard selling · 8% commission' }
    },
    {
      id: 'electronics',
      ratePct: 5,
      label: { ko: 'Electronics · 수수료 5%', en: 'Electronics · 5% commission' }
    },
    {
      id: 'coins-money',
      ratePct: 4,
      label: { ko: 'Coins & Money · 수수료 4%', en: 'Coins & Money · 4% commission' }
    },
    {
      id: 'custom',
      ratePct: null,
      label: { ko: 'Custom · 직접 입력', en: 'Custom · manual rate' }
    }
  ];

  const presetMap = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    salePrice: 50,
    commissionPreset: 'standard',
    commissionRatePct: 8,
    buyerShipping: 8.2,
    buyerTax: 3.5,
    itemCost: 18,
    sellerShippingSubsidy: 0,
    packagingCost: 1.25,
    otherCost: 0
  };

  const TEXT = {
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      salePrice: '판매가는 0보다 커야 합니다.',
      preset: '지원하지 않는 Whatnot 수수료 프리셋입니다.',
      customRate: '커스텀 수수료율은 0 이상 100 미만이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 결과가 계산됩니다.',
      statusGood: '현재 가정에서는 이 Whatnot 판매가 흑자입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 판매가·수수료율·원가를 다시 점검하세요.',
      summaryTitle: '[Whatnot 수수료·순이익 요약]',
      salePriceLabel: '실제 판매가',
      presetLabel: '수수료 프리셋',
      totalFees: 'Whatnot 총수수료',
      payoutAfterFees: '수수료 차감 후 정산액',
      netProfit: '순이익',
      netMargin: '순이익률',
      breakEvenSalePrice: '손익분기 판매가',
      maxShippingSubsidy: '적자 전 최대 셀러 배송보조',
      note: '참고: 이 계산기는 Whatnot 미국 기준 공개 수수료 베이스라인(표준 8%, Electronics 5%, Coins & Money 4%, processing 2.9% + $0.30)을 반영한 추정치입니다. buyer-paid shipping/tax는 processing fee base에는 포함되지만 seller revenue로는 잡지 않습니다.',
      na: 'N/A'
    },
    en: {
      invalid: 'Please review your inputs.',
      money: 'All money fields must be zero or above.',
      salePrice: 'Sale price must be greater than zero.',
      preset: 'Unsupported Whatnot fee preset.',
      customRate: 'Custom commission must be 0 or above and below 100%.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate results.',
      statusGood: 'This Whatnot order is profitable under the current assumptions.',
      statusWarn: 'This scenario is unprofitable. Re-check price, fees, or seller costs.',
      summaryTitle: '[Whatnot Seller Fee Summary]',
      salePriceLabel: 'Sold price',
      presetLabel: 'Fee preset',
      totalFees: 'Whatnot fee total',
      payoutAfterFees: 'Payout after fees',
      netProfit: 'Net profit',
      netMargin: 'Net margin',
      breakEvenSalePrice: 'Break-even sale price',
      maxShippingSubsidy: 'Max seller shipping subsidy before loss',
      note: 'Note: this calculator models the public US-baseline Whatnot fee rules: standard 8%, Electronics 5%, Coins & Money 4%, plus 2.9% + $0.30 processing. Buyer-paid shipping and buyer tax are included in the processing-fee base but are not treated as seller revenue.',
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
      commissionPreset: input.commissionPreset || DEFAULTS.commissionPreset,
      commissionRatePct: Number(input.commissionRatePct),
      buyerShipping: Number(input.buyerShipping),
      buyerTax: Number(input.buyerTax),
      itemCost: Number(input.itemCost),
      sellerShippingSubsidy: Number(input.sellerShippingSubsidy),
      packagingCost: Number(input.packagingCost),
      otherCost: Number(input.otherCost)
    };
  }

  function getPreset(input) {
    return presetMap[input.commissionPreset] || null;
  }

  function resolveCommissionRatePct(input) {
    const preset = getPreset(input);
    if (!preset) {
      return null;
    }
    return preset.id === 'custom' ? input.commissionRatePct : preset.ratePct;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.salePrice,
      input.buyerShipping,
      input.buyerTax,
      input.itemCost,
      input.sellerShippingSubsidy,
      input.packagingCost,
      input.otherCost
    ];

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }

    if (!Number.isFinite(input.salePrice) || input.salePrice <= 0) {
      return t.salePrice;
    }

    if (!getPreset(input)) {
      return t.preset;
    }

    const commissionRatePct = resolveCommissionRatePct(input);
    if (!Number.isFinite(commissionRatePct) || commissionRatePct < 0 || commissionRatePct >= 100) {
      return t.customRate;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const salePrice = overrides && overrides.salePrice != null ? Number(overrides.salePrice) : input.salePrice;
    const commissionRatePct = resolveCommissionRatePct(input);
    const commissionRate = commissionRatePct / 100;
    const commissionFee = salePrice * commissionRate;
    const processingBase = salePrice + input.buyerShipping + input.buyerTax;
    const processingFee = processingBase * PROCESSING_RATE + PROCESSING_FLAT;
    const whatnotFeeTotal = commissionFee + processingFee;
    const payoutAfterFees = salePrice - whatnotFeeTotal;
    const sellerCostTotal = input.itemCost + input.sellerShippingSubsidy + input.packagingCost + input.otherCost;
    const totalCost = whatnotFeeTotal + sellerCostTotal;
    const netProfit = salePrice - totalCost;
    const netMargin = salePrice > 0 ? netProfit / salePrice : 0;
    const effectiveFeeRate = salePrice > 0 ? whatnotFeeTotal / salePrice : 0;
    const maxSellerShippingSubsidyBeforeLoss = payoutAfterFees - (input.itemCost + input.packagingCost + input.otherCost);
    const maxItemCostBeforeLoss = payoutAfterFees - (input.sellerShippingSubsidy + input.packagingCost + input.otherCost);

    return {
      salePrice,
      commissionRatePct,
      commissionRate,
      commissionFee,
      processingBase,
      processingFee,
      whatnotFeeTotal,
      payoutAfterFees,
      sellerCostTotal,
      totalCost,
      netProfit,
      netMargin,
      effectiveFeeRate,
      maxSellerShippingSubsidyBeforeLoss,
      maxItemCostBeforeLoss
    };
  }

  function findBreakEvenSalePrice(input) {
    const commissionRate = resolveCommissionRatePct(input) / 100;
    const denominator = 1 - commissionRate - PROCESSING_RATE;
    if (!Number.isFinite(denominator) || denominator <= 0) {
      return null;
    }

    const sellerCostTotal = input.itemCost + input.sellerShippingSubsidy + input.packagingCost + input.otherCost;
    const numerator = (PROCESSING_RATE * (input.buyerShipping + input.buyerTax)) + PROCESSING_FLAT + sellerCostTotal;
    if (!Number.isFinite(numerator) || numerator < 0) {
      return null;
    }

    return numerator / denominator;
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function getPresetLabel(input, lang) {
    const preset = getPreset(input);
    return preset ? (preset.label[lang] || preset.label.en) : '';
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.salePriceLabel}: ${formatMoney(result.inputs.salePrice, lang)}`,
      `${t.presetLabel}: ${result.presetLabel}`,
      `${lang === 'ko' ? '커미션' : 'Commission fee'}: ${formatMoney(result.commissionFee, lang)}`,
      `${lang === 'ko' ? '결제 처리 수수료' : 'Processing fee'}: ${formatMoney(result.processingFee, lang)}`,
      `${t.totalFees}: ${formatMoney(result.whatnotFeeTotal, lang)}`,
      `${t.payoutAfterFees}: ${formatMoney(result.payoutAfterFees, lang)}`,
      `${t.netProfit}: ${formatMoney(result.netProfit, lang)}`,
      `${t.netMargin}: ${formatPercent(result.netMarginPct, lang)}`,
      `${t.breakEvenSalePrice}: ${result.breakEvenSalePrice == null ? t.na : formatMoney(result.breakEvenSalePrice, lang)}`,
      `${t.maxShippingSubsidy}: ${formatMoney(result.maxSellerShippingSubsidyBeforeLoss, lang)}`,
      t.note
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateScenario(normalized);
    const breakEvenSalePrice = findBreakEvenSalePrice(normalized);
    const result = {
      inputs: normalized,
      presetLabel: getPresetLabel(normalized, lang),
      commissionFee: round2(evaluated.commissionFee),
      processingBase: round2(evaluated.processingBase),
      processingFee: round2(evaluated.processingFee),
      whatnotFeeTotal: round2(evaluated.whatnotFeeTotal),
      payoutAfterFees: round2(evaluated.payoutAfterFees),
      sellerCostTotal: round2(evaluated.sellerCostTotal),
      totalCost: round2(evaluated.totalCost),
      netProfit: round2(evaluated.netProfit),
      netMargin: round4(evaluated.netMargin),
      netMarginPct: round2(evaluated.netMargin * 100),
      effectiveFeeRate: round4(evaluated.effectiveFeeRate),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRate * 100),
      breakEvenSalePrice: breakEvenSalePrice == null ? null : round2(breakEvenSalePrice),
      maxSellerShippingSubsidyBeforeLoss: round2(evaluated.maxSellerShippingSubsidyBeforeLoss),
      maxItemCostBeforeLoss: round2(evaluated.maxItemCostBeforeLoss),
      commissionRatePct: round2(evaluated.commissionRatePct)
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    PROCESSING_RATE,
    PROCESSING_FLAT,
    PRESETS,
    presetMap,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPreset,
    resolveCommissionRatePct,
    validate,
    evaluateScenario,
    findBreakEvenSalePrice,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.WhatnotSellerFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← Tools',
      pageTitle: 'Whatnot Seller Fee Calculator | Whatnot 셀러 수수료 계산기',
      title: 'Whatnot 셀러 수수료 계산기',
      subtitle: 'Whatnot 판매가, buyer-paid shipping/tax, 셀러 원가를 함께 넣어 실제 정산액과 순이익을 빠르게 계산합니다.',
      disclaimer: '이 v1은 Whatnot 미국 기준 공개 수수료 베이스라인(표준 8%, Electronics 5%, Coins & Money 4%, processing 2.9% + $0.30)을 반영한 추정기입니다. 임시 프로모션, 해외 규칙, 세무 자문은 포함하지 않습니다.',
      inputHeader: '입력값',
      assumptionHeader: '가정 및 해석',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      summaryHeader: '복사용 요약',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: '유효한 입력값을 넣으면 KPI와 상세 계산이 표시됩니다.',
      salePrice: '실제 판매가',
      commissionPreset: '수수료 프리셋',
      commissionRatePct: '커스텀 수수료율 (%)',
      buyerShipping: 'Buyer-paid shipping',
      buyerTax: 'Buyer-paid tax',
      itemCost: '상품 원가',
      sellerShippingSubsidy: '셀러 배송보조/무료배송 비용',
      packagingCost: '포장비',
      otherCost: '기타 비용',
      ruleHeader: '적용 중인 수수료 규칙',
      assumption1: 'Commission은 sold price 기준으로 계산합니다.',
      assumption2: 'Processing fee는 sold price + buyer-paid shipping + buyer-paid tax 기준으로 계산합니다.',
      assumption3: 'buyer-paid shipping은 fee base에는 포함되지만, v1에서는 seller revenue로 보지 않습니다.',
      assumption4: '무료배송/할인배송을 셀러가 부담하는 경우 seller shipping subsidy에 별도 입력합니다.',
      kpiFees: 'Whatnot 총수수료',
      kpiPayout: '수수료 차감 후 정산액',
      kpiProfit: '순이익',
      kpiMargin: '순이익률',
      kpiBreakEven: '손익분기 판매가',
      kpiShipping: '적자 전 최대 배송보조',
      detailCommissionFee: '커미션',
      detailProcessingBase: 'Processing fee 기준 금액',
      detailProcessingFee: '결제 처리 수수료',
      detailSellerCostTotal: '셀러 비용 합계',
      detailEffectiveFeeRatePct: '실효 수수료율',
      detailMaxItemCostBeforeLoss: '적자 전 최대 상품 원가',
      detailTotalCost: '총비용'
    },
    en: {
      back: '← Tools',
      pageTitle: 'Whatnot Seller Fee Calculator | Whatnot 셀러 수수료 계산기',
      title: 'Whatnot Seller Fee Calculator',
      subtitle: 'Estimate Whatnot payout after fees and net profit using sold price, buyer-paid shipping/tax, and your seller-side costs.',
      disclaimer: 'This v1 models the public US-baseline Whatnot fee rules: standard 8%, Electronics 5%, Coins & Money 4%, plus 2.9% + $0.30 processing. Temporary promotions, international rules, and tax advice are out of scope.',
      inputHeader: 'Inputs',
      assumptionHeader: 'Assumptions & interpretation',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      summaryHeader: 'Copy-ready summary',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: 'Valid inputs will render KPI cards and the detailed calculation view here.',
      salePrice: 'Sold price',
      commissionPreset: 'Fee preset',
      commissionRatePct: 'Custom commission (%)',
      buyerShipping: 'Buyer-paid shipping',
      buyerTax: 'Buyer-paid tax',
      itemCost: 'Item cost',
      sellerShippingSubsidy: 'Seller shipping subsidy / free shipping cost',
      packagingCost: 'Packaging cost',
      otherCost: 'Other cost',
      ruleHeader: 'Active fee rule',
      assumption1: 'Commission is modeled on sold price only.',
      assumption2: 'Processing fee is modeled on sold price + buyer-paid shipping + buyer-paid tax.',
      assumption3: 'Buyer-paid shipping is included in fee base but is not treated as seller revenue in this estimator.',
      assumption4: 'If you subsidize shipping, enter that seller-paid amount separately.',
      kpiFees: 'Whatnot fee total',
      kpiPayout: 'Payout after fees',
      kpiProfit: 'Net profit',
      kpiMargin: 'Net margin',
      kpiBreakEven: 'Break-even sale price',
      kpiShipping: 'Max shipping subsidy before loss',
      detailCommissionFee: 'Commission fee',
      detailProcessingBase: 'Processing-fee base',
      detailProcessingFee: 'Processing fee',
      detailSellerCostTotal: 'Seller cost total',
      detailEffectiveFeeRatePct: 'Effective fee rate',
      detailMaxItemCostBeforeLoss: 'Max item cost before loss',
      detailTotalCost: 'Total cost'
    }
  };

  const fieldIds = [
    'salePrice',
    'commissionPreset',
    'commissionRatePct',
    'buyerShipping',
    'buyerTax',
    'itemCost',
    'sellerShippingSubsidy',
    'packagingCost',
    'otherCost'
  ];

  const currencyKeys = [
    'commissionFee',
    'processingBase',
    'processingFee',
    'whatnotFeeTotal',
    'payoutAfterFees',
    'sellerCostTotal',
    'totalCost',
    'netProfit',
    'breakEvenSalePrice',
    'maxSellerShippingSubsidyBeforeLoss',
    'maxItemCostBeforeLoss'
  ];

  const percentKeys = ['netMarginPct', 'effectiveFeeRatePct'];

  const els = {
    htmlTitle: document.querySelector('title'),
    backLink: document.getElementById('backLink'),
    langBtn: document.getElementById('langBtn'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    disclaimer: document.getElementById('disclaimer'),
    inputHeader: document.getElementById('inputHeader'),
    assumptionHeader: document.getElementById('assumptionHeader'),
    resultsHeader: document.getElementById('resultsHeader'),
    detailHeader: document.getElementById('detailHeader'),
    summaryHeader: document.getElementById('summaryHeader'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    resultsContent: document.getElementById('resultsContent'),
    ruleHeader: document.getElementById('ruleHeader'),
    ruleBody: document.getElementById('ruleBody'),
    assumption1: document.getElementById('assumption1'),
    assumption2: document.getElementById('assumption2'),
    assumption3: document.getElementById('assumption3'),
    assumption4: document.getElementById('assumption4')
  };

  fieldIds.forEach((id) => {
    els[id] = document.getElementById(id);
    els[`l_${id}`] = document.getElementById(`l_${id}`);
  });

  [
    'commissionFee',
    'processingBase',
    'processingFee',
    'whatnotFeeTotal',
    'payoutAfterFees',
    'sellerCostTotal',
    'totalCost',
    'netProfit',
    'netMarginPct',
    'effectiveFeeRatePct',
    'breakEvenSalePrice',
    'maxSellerShippingSubsidyBeforeLoss',
    'maxItemCostBeforeLoss'
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  let currentLang = 'en';

  function getInputValue(id) {
    return els[id].value;
  }

  function setInputValue(id, value) {
    els[id].value = value;
  }

  function collectInput() {
    return {
      salePrice: getInputValue('salePrice'),
      commissionPreset: getInputValue('commissionPreset'),
      commissionRatePct: getInputValue('commissionRatePct'),
      buyerShipping: getInputValue('buyerShipping'),
      buyerTax: getInputValue('buyerTax'),
      itemCost: getInputValue('itemCost'),
      sellerShippingSubsidy: getInputValue('sellerShippingSubsidy'),
      packagingCost: getInputValue('packagingCost'),
      otherCost: getInputValue('otherCost')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function syncCommissionRateFromPreset() {
    const preset = presetMap[getInputValue('commissionPreset')] || presetMap.standard;
    const isCustom = preset.id === 'custom';
    els.commissionRatePct.disabled = !isCustom;
    if (!isCustom) {
      setInputValue('commissionRatePct', preset.ratePct);
    }
  }

  function updateRuleCopy() {
    const input = normalizeInput(collectInput());
    const ratePct = resolveCommissionRatePct(input);
    const presetLabel = getPresetLabel(input, currentLang);
    const processingText = currentLang === 'ko'
      ? `processing ${(PROCESSING_RATE * 100).toFixed(1)}% + ${formatMoney(PROCESSING_FLAT, currentLang)} on sold price + buyer shipping + buyer tax`
      : `${(PROCESSING_RATE * 100).toFixed(1)}% + ${formatMoney(PROCESSING_FLAT, currentLang)} processing on sold price + buyer shipping + buyer tax`;
    els.ruleBody.textContent = `${presetLabel} · ${formatPercent(ratePct, currentLang)} · ${processingText}`;
  }

  function renderStaticText() {
    const ui = UI_TEXT[currentLang];
    els.htmlTitle.textContent = ui.pageTitle;
    els.backLink.textContent = ui.back;
    els.title.textContent = ui.title;
    els.subtitle.textContent = ui.subtitle;
    els.disclaimer.textContent = ui.disclaimer;
    els.inputHeader.textContent = ui.inputHeader;
    els.assumptionHeader.textContent = ui.assumptionHeader;
    els.resultsHeader.textContent = ui.resultsHeader;
    els.detailHeader.textContent = ui.detailHeader;
    els.summaryHeader.textContent = ui.summaryHeader;
    els.resultsEmpty.textContent = ui.resultsEmpty;
    els.copyBtn.textContent = ui.copy;
    els.resetBtn.textContent = ui.reset;
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';

    fieldIds.forEach((key) => {
      if (els[`l_${key}`]) {
        els[`l_${key}`].textContent = ui[key];
      }
    });

    PRESETS.forEach((preset) => {
      const option = els.commissionPreset.querySelector(`option[value="${preset.id}"]`);
      if (option) {
        option.textContent = preset.label[currentLang] || preset.label.en;
      }
    });

    document.querySelector('[data-kpi="whatnotFeeTotal"]').textContent = ui.kpiFees;
    document.querySelector('[data-kpi="payoutAfterFees"]').textContent = ui.kpiPayout;
    document.querySelector('[data-kpi="netProfit"]').textContent = ui.kpiProfit;
    document.querySelector('[data-kpi="netMarginPct"]').textContent = ui.kpiMargin;
    document.querySelector('[data-kpi="breakEvenSalePrice"]').textContent = ui.kpiBreakEven;
    document.querySelector('[data-kpi="maxSellerShippingSubsidyBeforeLoss"]').textContent = ui.kpiShipping;

    document.querySelector('[data-detail="commissionFee"]').textContent = ui.detailCommissionFee;
    document.querySelector('[data-detail="processingBase"]').textContent = ui.detailProcessingBase;
    document.querySelector('[data-detail="processingFee"]').textContent = ui.detailProcessingFee;
    document.querySelector('[data-detail="sellerCostTotal"]').textContent = ui.detailSellerCostTotal;
    document.querySelector('[data-detail="effectiveFeeRatePct"]').textContent = ui.detailEffectiveFeeRatePct;
    document.querySelector('[data-detail="maxItemCostBeforeLoss"]').textContent = ui.detailMaxItemCostBeforeLoss;
    document.querySelector('[data-detail="totalCost"]').textContent = ui.detailTotalCost;

    els.ruleHeader.textContent = ui.ruleHeader;
    els.assumption1.textContent = ui.assumption1;
    els.assumption2.textContent = ui.assumption2;
    els.assumption3.textContent = ui.assumption3;
    els.assumption4.textContent = ui.assumption4;

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
    syncCommissionRateFromPreset();
    updateRuleCopy();
    const t = TEXT[currentLang] || TEXT.en;
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
      syncCommissionRateFromPreset();
      renderStaticText();
      render();
    });
  }

  applyDefaults();
  syncCommissionRateFromPreset();
  renderStaticText();
  bindEvents();
  render();
})(typeof window !== 'undefined' ? window : globalThis);
