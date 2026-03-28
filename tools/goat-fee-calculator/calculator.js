(function (root) {
  const PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE = {
    id: 'goat-baseline',
    assumptionName: {
      en: 'Public GOAT baseline: US seller in good standing + prepaid shipping',
      ko: '공개 GOAT 기준: 미국 판매자(양호한 상태) + prepaid shipping'
    },
    sellerFeeRatePct: 9.5,
    flatFeeUsd: 5,
    sourceUpdatedDates: ['2025-08-22', '2025-02-26']
  };

  const PRESETS = [
    {
      id: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.id,
      sellerFeeRatePct: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.sellerFeeRatePct,
      flatFeeUsd: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.flatFeeUsd,
      label: {
        en: 'GOAT US seller in good standing + prepaid shipping',
        ko: 'GOAT 미국 판매자(양호한 상태) + prepaid shipping'
      }
    },
    {
      id: 'custom',
      sellerFeeRatePct: null,
      flatFeeUsd: null,
      label: {
        en: 'Custom override',
        ko: '커스텀 오버라이드'
      }
    }
  ];

  const PRESET_MAP = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    salePrice: 300,
    feePreset: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.id,
    sellerFeeRatePct: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.sellerFeeRatePct,
    flatFeePerOrder: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.flatFeeUsd,
    itemCost: 180,
    sellerShippingCost: 12,
    packagingCost: 1.5,
    otherSellerCost: 0,
    refundLossRatePct: 2,
    desiredNetProfit: 40
  };

  const TEXT = {
    ko: {
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      salePrice: '판매가는 0보다 커야 합니다.',
      preset: '지원하지 않는 GOAT 프리셋입니다.',
      sellerFeeRatePct: '수수료율은 0% 이상 100% 이하여야 합니다.',
      refundLossRatePct: '환불/반품 손실률은 0% 이상 100% 이하여야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 GOAT 순이익 추정이 표시됩니다.',
      statusGood: '현재 가정에서는 이 GOAT 판매가 흑자입니다.',
      statusWarn: '현재 가정에서는 손실입니다. 판매가나 수수료/원가를 다시 보세요.',
      summaryTitle: '[GOAT 수수료·순이익 요약]',
      salePriceLabel: '판매가',
      presetLabel: '프리셋',
      platformFeeTotalLabel: '플랫폼 수수료 합계',
      refundLossLabel: '환불/반품 계획 손실',
      payoutLabel: '셀러 비용 전 정산액',
      sellerCostLabel: '셀러 비용 합계',
      netProfitLabel: '순이익',
      effectiveTakeRateLabel: '실효 차감률',
      breakEvenLabel: '손익분기 판매가',
      targetLabel: '목표 순이익 판매가',
      note: '참고: 이 계산기는 공개 GOAT 기준인 미국 판매자(양호한 상태) + prepaid shipping 흐름의 9.5% commission + $5 seller fee를 기본값으로 둡니다. 환불/반품 손실은 공식 수수료가 아니라 사용자 계획 입력값이며, 캐시아웃 수수료·캐나다 비율·평점 악화 시 증가 수수료·세금·특수 프로그램은 제외합니다.',
      na: 'N/A'
    },
    en: {
      money: 'All money fields must be zero or above.',
      salePrice: 'Sale price must be greater than zero.',
      preset: 'Unsupported GOAT fee preset.',
      sellerFeeRatePct: 'Fee rate must be between 0% and 100%.',
      refundLossRatePct: 'Refund / return loss rate must be between 0% and 100%.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to estimate GOAT payout and profit.',
      statusGood: 'This GOAT scenario is profitable under the current assumptions.',
      statusWarn: 'This GOAT scenario is unprofitable. Re-check your price, fees, or costs.',
      summaryTitle: '[GOAT Fee Profit Summary]',
      salePriceLabel: 'Sale price',
      presetLabel: 'Preset',
      platformFeeTotalLabel: 'Platform fee total',
      refundLossLabel: 'Refund / return planning loss',
      payoutLabel: 'Payout before seller costs',
      sellerCostLabel: 'Seller cost total',
      netProfitLabel: 'Net profit',
      effectiveTakeRateLabel: 'Effective take rate',
      breakEvenLabel: 'Break-even listing price',
      targetLabel: 'Required listing price for target net',
      note: 'Note: this calculator defaults to the public GOAT baseline for a US seller in good standing using prepaid shipping: 9.5% commission + $5 seller fee. Refund / return loss is a planning input, not an official fee. Cash-out fees, Canadian rates, elevated commissions from cancellations or verification issues, tax, and special programs are excluded.',
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
      feePreset: input.feePreset || DEFAULTS.feePreset,
      sellerFeeRatePct: Number(input.sellerFeeRatePct),
      flatFeePerOrder: Number(input.flatFeePerOrder),
      itemCost: Number(input.itemCost),
      sellerShippingCost: Number(input.sellerShippingCost),
      packagingCost: Number(input.packagingCost),
      otherSellerCost: Number(input.otherSellerCost),
      refundLossRatePct: Number(input.refundLossRatePct),
      desiredNetProfit: Number(input.desiredNetProfit)
    };
  }

  function getPreset(input) {
    return PRESET_MAP[input.feePreset] || null;
  }

  function resolveFeeConfig(input) {
    const preset = getPreset(input);
    if (!preset) {
      return null;
    }

    if (preset.id === 'custom') {
      return {
        preset,
        sellerFeeRatePct: input.sellerFeeRatePct,
        flatFeePerOrder: input.flatFeePerOrder,
        assumptionName: {
          en: 'Custom GOAT seller fee override',
          ko: '커스텀 GOAT 수수료 오버라이드'
        }
      };
    }

    return {
      preset,
      sellerFeeRatePct: preset.sellerFeeRatePct,
      flatFeePerOrder: preset.flatFeeUsd,
      assumptionName: PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.assumptionName
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.salePrice,
      input.flatFeePerOrder,
      input.itemCost,
      input.sellerShippingCost,
      input.packagingCost,
      input.otherSellerCost,
      input.desiredNetProfit
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

    if (!Number.isFinite(input.sellerFeeRatePct) || input.sellerFeeRatePct < 0 || input.sellerFeeRatePct > 100) {
      return t.sellerFeeRatePct;
    }

    if (!Number.isFinite(input.refundLossRatePct) || input.refundLossRatePct < 0 || input.refundLossRatePct > 100) {
      return t.refundLossRatePct;
    }

    return '';
  }

  function evaluateScenario(input, overrides) {
    const feeConfig = resolveFeeConfig(input);
    const salePrice = overrides && overrides.salePrice != null ? Number(overrides.salePrice) : input.salePrice;
    const sellerFeeRatePct = Number(feeConfig.sellerFeeRatePct);
    const flatFeePerOrder = Number(feeConfig.flatFeePerOrder);
    const sellerFeeRate = sellerFeeRatePct / 100;
    const refundLossRate = input.refundLossRatePct / 100;
    const platformVariableFee = salePrice * sellerFeeRate;
    const platformFeeTotal = platformVariableFee + flatFeePerOrder;
    const refundLoss = salePrice * refundLossRate;
    const totalTake = platformFeeTotal + refundLoss;
    const payoutBeforeSellerCosts = salePrice - totalTake;
    const sellerCostTotal = input.itemCost + input.sellerShippingCost + input.packagingCost + input.otherSellerCost;
    const netProfit = payoutBeforeSellerCosts - sellerCostTotal;
    const effectiveTakeRate = salePrice > 0 ? totalTake / salePrice : 0;
    const contributionMargin = 1 - sellerFeeRate - refundLossRate;

    return {
      feeConfig,
      salePrice,
      sellerFeeRatePct,
      flatFeePerOrder,
      platformVariableFee,
      platformFeeTotal,
      refundLoss,
      payoutBeforeSellerCosts,
      sellerCostTotal,
      netProfit,
      effectiveTakeRate,
      contributionMargin
    };
  }

  function findBreakEvenListingPrice(input) {
    const evaluated = evaluateScenario(input);
    if (!Number.isFinite(evaluated.contributionMargin) || evaluated.contributionMargin <= 0) {
      return null;
    }

    return (evaluated.flatFeePerOrder + evaluated.sellerCostTotal) / evaluated.contributionMargin;
  }

  function findRequiredListingPriceForTargetNet(input) {
    const evaluated = evaluateScenario(input);
    if (!Number.isFinite(evaluated.contributionMargin) || evaluated.contributionMargin <= 0) {
      return null;
    }

    return (evaluated.flatFeePerOrder + evaluated.sellerCostTotal + input.desiredNetProfit) / evaluated.contributionMargin;
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
    const feeConfig = resolveFeeConfig(input);
    return feeConfig ? (feeConfig.preset.label[lang] || feeConfig.preset.label.en) : '';
  }

  function buildRuleCopy(input, lang) {
    const feeConfig = resolveFeeConfig(input);
    if (!feeConfig) {
      return '';
    }

    const assumptionName = feeConfig.assumptionName[lang] || feeConfig.assumptionName.en;
    const sourceDates = PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE.sourceUpdatedDates.join(' / ');
    const sourceText = lang === 'ko'
      ? `GOAT Support 업데이트 기준 ${sourceDates}`
      : `GOAT Support updated ${sourceDates}`;

    return `${assumptionName} · ${formatPercent(feeConfig.sellerFeeRatePct, lang)} commission · ${formatMoney(feeConfig.flatFeePerOrder, lang)} flat seller fee · ${sourceText}`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;

    return [
      t.summaryTitle,
      `${t.salePriceLabel}: ${formatMoney(result.grossSale, lang)}`,
      `${t.presetLabel}: ${result.presetLabel}`,
      `${lang === 'ko' ? '적용 수수료율' : 'Fee rate used'}: ${formatPercent(result.sellerFeeRatePct, lang)}`,
      `${lang === 'ko' ? '주문당 고정 수수료' : 'Flat seller fee'}: ${formatMoney(result.flatFeePerOrder, lang)}`,
      `${t.platformFeeTotalLabel}: ${formatMoney(result.platformFeeTotal, lang)}`,
      `${t.refundLossLabel}: ${formatMoney(result.refundLoss, lang)}`,
      `${t.payoutLabel}: ${formatMoney(result.payoutBeforeSellerCosts, lang)}`,
      `${t.sellerCostLabel}: ${formatMoney(result.sellerCostTotal, lang)}`,
      `${t.netProfitLabel}: ${formatMoney(result.netProfit, lang)}`,
      `${t.effectiveTakeRateLabel}: ${formatPercent(result.effectiveTakeRatePct, lang)}`,
      `${t.breakEvenLabel}: ${result.breakEvenListingPrice == null ? t.na : formatMoney(result.breakEvenListingPrice, lang)}`,
      `${t.targetLabel}: ${result.requiredListingPriceForTargetNet == null ? t.na : formatMoney(result.requiredListingPriceForTargetNet, lang)}`,
      t.note
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateScenario(normalized);
    const breakEvenListingPrice = findBreakEvenListingPrice(normalized);
    const requiredListingPriceForTargetNet = findRequiredListingPriceForTargetNet(normalized);

    const result = {
      inputs: normalized,
      presetLabel: getPresetLabel(normalized, lang),
      assumptionName: evaluated.feeConfig.assumptionName[lang] || evaluated.feeConfig.assumptionName.en,
      grossSale: round2(evaluated.salePrice),
      sellerFeeRatePct: round2(evaluated.sellerFeeRatePct),
      flatFeePerOrder: round2(evaluated.flatFeePerOrder),
      platformVariableFee: round2(evaluated.platformVariableFee),
      platformFeeTotal: round2(evaluated.platformFeeTotal),
      refundLoss: round2(evaluated.refundLoss),
      payoutBeforeSellerCosts: round2(evaluated.payoutBeforeSellerCosts),
      sellerCostTotal: round2(evaluated.sellerCostTotal),
      netProfit: round2(evaluated.netProfit),
      effectiveTakeRate: round4(evaluated.effectiveTakeRate),
      effectiveTakeRatePct: round2(evaluated.effectiveTakeRate * 100),
      contributionMargin: round4(evaluated.contributionMargin),
      breakEvenListingPrice: breakEvenListingPrice == null ? null : round2(breakEvenListingPrice),
      requiredListingPriceForTargetNet: requiredListingPriceForTargetNet == null ? null : round2(requiredListingPriceForTargetNet),
      status: evaluated.netProfit >= 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    PUBLIC_GOAT_US_GOOD_STANDING_PREPAID_BASELINE,
    PRESETS,
    PRESET_MAP,
    DEFAULTS,
    getPreset,
    resolveFeeConfig,
    validate,
    evaluateScenario,
    findBreakEvenListingPrice,
    findRequiredListingPriceForTargetNet,
    buildRuleCopy,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.GoatFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const UI_TEXT = {
    ko: {
      back: '← 도구 목록',
      pageTitle: 'GOAT 수수료 계산기 | GOAT 판매자 순이익 계산기',
      title: 'GOAT 수수료 계산기',
      subtitle: 'GOAT 판매가, 셀러 비용, 환불 계획 손실을 함께 넣어 실제 take-home과 손익분기 판매가를 빠르게 추정합니다.',
      disclaimer: '기본값은 공개 GOAT 기준인 미국 판매자(양호한 상태) + prepaid shipping 흐름의 9.5% commission + $5 seller fee입니다. 이 가정에 맞지 않으면 custom override를 사용하세요.',
      inputHeader: '입력값',
      assumptionHeader: '가정 및 주의사항',
      resultsHeader: '핵심 KPI',
      detailHeader: '세부 계산',
      summaryHeader: '복사용 요약',
      relatedHeader: '관련 리셀 계산기',
      copy: '요약 복사',
      reset: '기본값 복원',
      resultsEmpty: '유효한 입력값을 넣으면 KPI와 상세 계산이 표시됩니다.',
      salePrice: '판매가 / 수락 오퍼가',
      feePreset: 'GOAT 수수료 프리셋',
      sellerFeeRatePct: '수수료율 (%)',
      flatFeePerOrder: '주문당 고정 셀러 수수료',
      itemCost: '상품 원가',
      sellerShippingCost: '셀러 부담 배송비',
      packagingCost: '포장 / 핸들링비',
      otherSellerCost: '기타 셀러 비용',
      refundLossRatePct: '환불 / 반품 손실률 (%)',
      desiredNetProfit: '목표 순이익',
      customHint: 'custom preset일 때만 직접 편집됩니다.',
      ruleHeader: '적용 중인 공개 baseline / override',
      assumption1: '공개 기본값은 GOAT Support의 2025-08-22 commission 문서와 2025-02-26 seller fee 문서를 조합한 미국·양호한 상태·prepaid shipping 흐름입니다.',
      assumption2: '환불/반품 손실률은 공식 GOAT 수수료가 아니라 계획용 입력값이며, 판매가에 비례한 예상 손실로 처리합니다.',
      assumption3: '캐나다 전용 commission, cancellation / verification issue로 올라간 비율, cash-out fee, 세금, 지역 특수 규칙은 v1 범위 밖입니다.',
      assumption4: '기준 가정이 맞지 않으면 custom override에 공개/계약 수치를 직접 넣어 같은 공식을 재사용하세요.',
      kpiNetProfit: '순이익',
      kpiPayout: '셀러 비용 전 정산액',
      kpiTakeRate: '실효 차감률',
      kpiBreakEven: '손익분기 판매가',
      kpiTarget: '목표 순이익 판매가',
      kpiPlatformFeeTotal: '플랫폼 수수료 합계',
      detailGrossSale: '총 판매금액',
      detailPlatformVariableFee: '비율 수수료',
      detailFlatFeePerOrder: '고정 셀러 수수료',
      detailRefundLoss: '환불/반품 계획 손실',
      detailSellerCostTotal: '셀러 비용 합계',
      detailContributionMargin: '역산용 contribution margin'
    },
    en: {
      back: '← Tools',
      pageTitle: 'GOAT Fee Calculator | GOAT Seller Profit Calculator',
      title: 'GOAT Fee Calculator',
      subtitle: 'Estimate GOAT payout, seller-side profit, break-even listing price, and target listing price before you accept an offer or list inventory.',
      disclaimer: 'Default baseline: the public GOAT assumption for a US seller in good standing using prepaid shipping, modeled as 9.5% commission + $5 seller fee. Use custom override if your flow differs.',
      inputHeader: 'Inputs',
      assumptionHeader: 'Assumptions & disclaimer',
      resultsHeader: 'Key KPIs',
      detailHeader: 'Calculation detail',
      summaryHeader: 'Copy-ready summary',
      relatedHeader: 'Related resale tools',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      resultsEmpty: 'Valid inputs will render KPI cards and the detailed calculation view here.',
      salePrice: 'Sale price / accepted offer',
      feePreset: 'GOAT fee preset',
      sellerFeeRatePct: 'Fee rate (%)',
      flatFeePerOrder: 'Flat seller fee per order',
      itemCost: 'Item cost',
      sellerShippingCost: 'Seller-paid shipping',
      packagingCost: 'Packaging / handling',
      otherSellerCost: 'Other seller cost',
      refundLossRatePct: 'Refund / return loss rate (%)',
      desiredNetProfit: 'Desired net profit',
      customHint: 'Editable only when preset = custom.',
      ruleHeader: 'Active public baseline / override',
      assumption1: 'The default assumption combines GOAT Support’s August 22, 2025 commission article and February 26, 2025 seller-fee article into one US, good-standing, prepaid-shipping baseline.',
      assumption2: 'Refund / return loss rate is not an official GOAT fee. It is a planning input modeled as a percentage drag on sale price.',
      assumption3: 'Canadian commission, elevated rates from cancellations or verification issues, cash-out fees, tax, and special regional programs are outside this v1.',
      assumption4: 'If your flow differs from the named public baseline, switch to custom override and enter your own rate + flat fee.',
      kpiNetProfit: 'Net profit',
      kpiPayout: 'Payout before seller costs',
      kpiTakeRate: 'Effective take rate',
      kpiBreakEven: 'Break-even listing price',
      kpiTarget: 'Required price for target net',
      kpiPlatformFeeTotal: 'Platform fee total',
      detailGrossSale: 'Gross sale',
      detailPlatformVariableFee: 'Variable fee',
      detailFlatFeePerOrder: 'Flat seller fee',
      detailRefundLoss: 'Refund / return planning loss',
      detailSellerCostTotal: 'Seller cost total',
      detailContributionMargin: 'Contribution margin used for reverse solve'
    }
  };

  const fieldIds = [
    'salePrice',
    'feePreset',
    'sellerFeeRatePct',
    'flatFeePerOrder',
    'itemCost',
    'sellerShippingCost',
    'packagingCost',
    'otherSellerCost',
    'refundLossRatePct',
    'desiredNetProfit'
  ];

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
    relatedHeader: document.getElementById('relatedHeader'),
    resultsEmpty: document.getElementById('resultsEmpty'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    resultsContent: document.getElementById('resultsContent'),
    ruleHeader: document.getElementById('ruleHeader'),
    ruleBody: document.getElementById('ruleBody'),
    customHint: document.getElementById('customHint'),
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
    'netProfit',
    'payoutBeforeSellerCosts',
    'effectiveTakeRatePct',
    'breakEvenListingPrice',
    'requiredListingPriceForTargetNet',
    'platformFeeTotal',
    'grossSale',
    'platformVariableFee',
    'flatFeePerOrderValue',
    'refundLoss',
    'sellerCostTotal',
    'contributionMarginPct'
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
      feePreset: getInputValue('feePreset'),
      sellerFeeRatePct: getInputValue('sellerFeeRatePct'),
      flatFeePerOrder: getInputValue('flatFeePerOrder'),
      itemCost: getInputValue('itemCost'),
      sellerShippingCost: getInputValue('sellerShippingCost'),
      packagingCost: getInputValue('packagingCost'),
      otherSellerCost: getInputValue('otherSellerCost'),
      refundLossRatePct: getInputValue('refundLossRatePct'),
      desiredNetProfit: getInputValue('desiredNetProfit')
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => setInputValue(key, value));
  }

  function syncFeeFieldsFromPreset() {
    const preset = PRESET_MAP[getInputValue('feePreset')] || PRESET_MAP[DEFAULTS.feePreset];
    const isCustom = preset.id === 'custom';
    els.sellerFeeRatePct.disabled = !isCustom;
    els.flatFeePerOrder.disabled = !isCustom;

    if (!isCustom) {
      setInputValue('sellerFeeRatePct', preset.sellerFeeRatePct);
      setInputValue('flatFeePerOrder', preset.flatFeeUsd);
    }
  }

  function updateStaticText() {
    const t = UI_TEXT[currentLang];
    els.htmlTitle.textContent = t.pageTitle;
    els.backLink.textContent = t.back;
    els.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';
    els.title.textContent = t.title;
    els.subtitle.textContent = t.subtitle;
    els.disclaimer.textContent = t.disclaimer;
    els.inputHeader.textContent = t.inputHeader;
    els.assumptionHeader.textContent = t.assumptionHeader;
    els.resultsHeader.textContent = t.resultsHeader;
    els.detailHeader.textContent = t.detailHeader;
    els.summaryHeader.textContent = t.summaryHeader;
    els.relatedHeader.textContent = t.relatedHeader;
    els.copyBtn.textContent = t.copy;
    els.resetBtn.textContent = t.reset;
    els.resultsEmpty.textContent = t.resultsEmpty;
    els.customHint.textContent = t.customHint;
    els.ruleHeader.textContent = t.ruleHeader;
    els.assumption1.textContent = t.assumption1;
    els.assumption2.textContent = t.assumption2;
    els.assumption3.textContent = t.assumption3;
    els.assumption4.textContent = t.assumption4;

    const labels = {
      salePrice: t.salePrice,
      feePreset: t.feePreset,
      sellerFeeRatePct: t.sellerFeeRatePct,
      flatFeePerOrder: t.flatFeePerOrder,
      itemCost: t.itemCost,
      sellerShippingCost: t.sellerShippingCost,
      packagingCost: t.packagingCost,
      otherSellerCost: t.otherSellerCost,
      refundLossRatePct: t.refundLossRatePct,
      desiredNetProfit: t.desiredNetProfit
    };

    Object.entries(labels).forEach(([id, value]) => {
      els[`l_${id}`].textContent = value;
    });

    PRESETS.forEach((preset) => {
      const option = els.feePreset.querySelector(`option[value="${preset.id}"]`);
      if (option) {
        option.textContent = preset.label[currentLang] || preset.label.en;
      }
    });

    document.querySelector('[data-kpi="netProfit"]').textContent = t.kpiNetProfit;
    document.querySelector('[data-kpi="payoutBeforeSellerCosts"]').textContent = t.kpiPayout;
    document.querySelector('[data-kpi="effectiveTakeRatePct"]').textContent = t.kpiTakeRate;
    document.querySelector('[data-kpi="breakEvenListingPrice"]').textContent = t.kpiBreakEven;
    document.querySelector('[data-kpi="requiredListingPriceForTargetNet"]').textContent = t.kpiTarget;
    document.querySelector('[data-kpi="platformFeeTotal"]').textContent = t.kpiPlatformFeeTotal;

    document.querySelector('[data-detail="grossSale"]').textContent = t.detailGrossSale;
    document.querySelector('[data-detail="platformVariableFee"]').textContent = t.detailPlatformVariableFee;
    document.querySelector('[data-detail="flatFeePerOrderValue"]').textContent = t.detailFlatFeePerOrder;
    document.querySelector('[data-detail="refundLoss"]').textContent = t.detailRefundLoss;
    document.querySelector('[data-detail="sellerCostTotal"]').textContent = t.detailSellerCostTotal;
    document.querySelector('[data-detail="contributionMarginPct"]').textContent = t.detailContributionMargin;
  }

  function renderError(message) {
    els.error.textContent = message;
    els.error.classList.add('show');
    els.status.textContent = message;
    els.status.className = 'status warn';
    els.resultsContent.hidden = true;
  }

  function renderResult(result) {
    els.error.textContent = '';
    els.error.classList.remove('show');
    els.status.textContent = result.status;
    els.status.className = `status ${result.netProfit >= 0 ? 'good' : 'warn'}`;
    els.resultsContent.hidden = false;

    const moneyKeys = [
      'grossSale',
      'platformVariableFee',
      'platformFeeTotal',
      'refundLoss',
      'payoutBeforeSellerCosts',
      'sellerCostTotal',
      'netProfit',
      'breakEvenListingPrice',
      'requiredListingPriceForTargetNet'
    ];

    moneyKeys.forEach((key) => {
      const value = result[key];
      if (els[key]) {
        els[key].textContent = value == null ? TEXT[currentLang].na : formatMoney(value, currentLang);
      }
    });

    els.flatFeePerOrderValue.textContent = formatMoney(result.flatFeePerOrder, currentLang);
    els.effectiveTakeRatePct.textContent = formatPercent(result.effectiveTakeRatePct, currentLang);
    els.contributionMarginPct.textContent = formatPercent(round2(result.contributionMargin * 100), currentLang);
    els.ruleBody.textContent = buildRuleCopy(result.inputs, currentLang);
    els.summary.value = buildSummary(result, { lang: currentLang });
  }

  function render() {
    const { result, error } = calculate(collectInput(), { lang: currentLang });
    if (error) {
      renderError(error);
      return;
    }

    renderResult(result);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(els.summary.value);
      els.status.textContent = TEXT[currentLang].copied;
      els.status.className = 'status good';
    } catch (error) {
      els.status.textContent = TEXT[currentLang].copyFail;
      els.status.className = 'status warn';
    }
  }

  applyDefaults();
  updateStaticText();
  syncFeeFieldsFromPreset();
  render();

  fieldIds.forEach((id) => {
    const eventName = id === 'feePreset' ? 'change' : 'input';
    els[id].addEventListener(eventName, function () {
      if (id === 'feePreset') {
        syncFeeFieldsFromPreset();
      }
      render();
    });
  });

  els.copyBtn.addEventListener('click', copySummary);
  els.resetBtn.addEventListener('click', function () {
    applyDefaults();
    syncFeeFieldsFromPreset();
    render();
  });

  els.langBtn.addEventListener('click', function () {
    currentLang = currentLang === 'en' ? 'ko' : 'en';
    updateStaticText();
    syncFeeFieldsFromPreset();
    render();
  });
}(typeof globalThis !== 'undefined' ? globalThis : this));
