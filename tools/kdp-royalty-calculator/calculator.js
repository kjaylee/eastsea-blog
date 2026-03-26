(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.KdpRoyaltyCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ROYALTY_PLANS = [
    {
      id: '35',
      ratePct: 35,
      label: { en: '35% royalty option', ko: '35% 로열티 옵션' }
    },
    {
      id: '70',
      ratePct: 70,
      label: { en: '70% royalty option', ko: '70% 로열티 옵션' }
    }
  ];

  const DEFAULTS = {
    royaltyPlan: '70',
    listPrice: 9.99,
    priceIncludesVat: true,
    vatRatePct: 0,
    monthlyUnitsSold: 250,
    eligibleTerritorySharePct: 85,
    deliveryCostPerSale: 0.2,
    kuPagesRead: 50000,
    kuPayoutPerPage: 0.004,
    targetMonthlyRoyalty: 2000,
    targetRoyaltyPerSale: 3
  };

  const planMap = Object.fromEntries(ROYALTY_PLANS.map((plan) => [plan.id, plan]));

  const TEXT = {
    en: {
      heroLead: 'Estimate how much your Kindle Direct Publishing eBook can keep after VAT, 35% vs 70% royalty rules, delivery-cost drag, and Kindle Unlimited page reads.',
      heroHow: 'How this models KDP',
      heroBullet1: '35% plan pays a flat 35% of net list price.',
      heroBullet2: '70% plan uses 70% minus delivery costs only in eligible territories.',
      heroBullet3: 'Sales outside 70%-eligible territories fall back to 35%.',
      heroBullet4: 'Kindle Unlimited earnings are modeled separately as pages read × payout per page.',
      heroWhy: 'Why this page matters',
      heroWhyCopy: 'KDP authors usually need one fast answer: what does each sale actually pay me, and what monthly combination of sales plus KU pages gets me to my target? This page keeps that answer on one screen.',
      inputsTitle: 'Inputs',
      inputsCopy: 'Use recent KDP assumptions instead of generic averages when you are deciding price, format, or launch goals.',
      royaltyPlan: 'Royalty plan',
      listPrice: 'List price (USD)',
      priceVatMode: 'Price includes VAT?',
      vatRate: 'VAT rate (%)',
      monthlyUnitsSold: 'Monthly eBook units sold',
      eligibleTerritoryShare: '70%-eligible territory share (%)',
      eligibleTerritoryNote: 'Only this share uses the 70% formula. The rest falls back to 35%.',
      deliveryCostPerSale: 'Delivery cost per sold eBook (USD)',
      kuPagesRead: 'Kindle Unlimited pages read / month',
      kuPayoutPerPage: 'KU payout per page (USD)',
      kuPayoutNote: 'Editable planning input. Update this from your recent KDP reports.',
      targetMonthlyRoyalty: 'Target monthly royalty (USD)',
      targetRoyaltyPerSale: 'Target royalty per sold eBook (USD)',
      copySummary: 'Copy summary',
      reset: 'Reset',
      resultsTitle: 'Results',
      resultsCopy: 'Use the first row for the core decision, then scan the detail grid to see whether territory mix, VAT, or delivery cost is actually driving the result.',
      kpiBlendedRoyalty: 'Blended royalty / sold eBook',
      kpiEbookRoyalty: 'Monthly eBook royalty',
      kpiKuRoyalty: 'Monthly KU royalty',
      kpiTotalRoyalty: 'Total monthly royalty',
      kpiUnitsNeeded: 'Units needed for target',
      kpiRequiredListPrice: 'Required list price',
      detailNetListPrice: 'Net list price ex VAT',
      detailEffectiveRate: 'Effective eBook royalty rate',
      detailEligibleRoyalty: 'Royalty per eligible 70% sale',
      detailFallbackRoyalty: 'Royalty per fallback / 35% sale',
      detailEligibleUnits: 'Eligible-territory units',
      detailFallbackUnits: 'Fallback / 35% units',
      detailDeliveryCeiling: 'Delivery-cost ceiling before 70% loses edge',
      detailEligibleAdvantage: '70% advantage per eligible sale',
      summaryCopy: 'Plain-text summary for pricing notes, launch docs, or author dashboards.',
      invalid: 'Please review your inputs.',
      unsupportedPlan: 'Unsupported royalty plan.',
      listPrice: 'List price must be greater than zero.',
      vatRate: 'VAT rate must be between 0 and 100.',
      monthlyUnitsSold: 'Monthly units sold must be an integer of 0 or above.',
      territoryShare: 'Eligible-territory share must be between 0 and 100.',
      deliveryCost: 'Delivery cost per sale must be 0 or above.',
      kuPagesRead: 'Kindle Unlimited pages read must be an integer of 0 or above.',
      kuPayoutPerPage: 'KU payout per page must be 0 or above.',
      targetMonthlyRoyalty: 'Target monthly royalty must be 0 or above.',
      targetRoyaltyPerSale: 'Target royalty per sold eBook must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Use the default baseline or enter your own KDP assumptions.',
      statusStrong: 'Current assumptions reach or exceed your monthly royalty target.',
      statusBelow: 'Current assumptions are below your monthly royalty target.',
      statusDelivery: 'Delivery cost is erasing the 70% advantage on eligible sales.',
      summaryTitle: '[KDP Royalty Calculator Summary]',
      royaltyPlanLabel: 'Royalty plan',
      listPriceLabel: 'List price',
      netPriceLabel: 'Net list price ex VAT',
      royaltyPerEligibleLabel: 'Royalty per eligible 70% sale',
      royaltyPerFallbackLabel: 'Royalty per fallback / 35% sale',
      blendedRoyaltyLabel: 'Blended royalty per sold eBook',
      ebookRoyaltyLabel: 'Monthly eBook royalty',
      kuRoyaltyLabel: 'Monthly KU royalty',
      totalRoyaltyLabel: 'Total monthly royalty',
      effectiveRateLabel: 'Effective eBook royalty rate',
      unitsNeededLabel: 'Units needed for target monthly royalty',
      requiredPriceLabel: 'Required list price for target royalty / sale',
      deliveryCeilingLabel: 'Delivery-cost ceiling before 70% loses edge',
      eligibleAdvantageLabel: '70% advantage per eligible sale',
      note: 'Planning note: KU payout per page changes over time. Replace the default with your recent KDP report average before making a pricing decision.',
      na: 'N/A'
    },
    ko: {
      heroLead: 'VAT, 35% vs 70% 규칙, 전달 비용, Kindle Unlimited 페이지 읽힘까지 반영해 KDP eBook이 실제로 얼마나 남기는지 계산합니다.',
      heroHow: '이 계산기가 KDP를 처리하는 방식',
      heroBullet1: '35% 옵션은 VAT 제외 순가격의 35%를 지급합니다.',
      heroBullet2: '70% 옵션은 대상 지역에서만 70%에서 전달 비용을 차감합니다.',
      heroBullet3: '70% 대상이 아닌 판매는 35%로 자동 환산합니다.',
      heroBullet4: 'Kindle Unlimited 수익은 페이지 읽힘 수 × 페이지당 지급액으로 별도 계산합니다.',
      heroWhy: '왜 이 페이지가 유용한가',
      heroWhyCopy: 'KDP 저자는 보통 한 가지를 바로 알고 싶습니다. 판매 1권당 실제 지급액이 얼마인지, 그리고 월 목표 로열티를 만들려면 판매와 KU 페이지가 어느 정도 필요한지입니다. 이 페이지는 그 답을 한 화면에 모읍니다.',
      inputsTitle: '입력값',
      inputsCopy: '가격, 포맷, 런칭 목표를 결정할 때는 일반 평균보다 최근 KDP 실제 가정값을 넣는 편이 좋습니다.',
      royaltyPlan: '로열티 옵션',
      listPrice: '리스트 가격 (USD)',
      priceVatMode: '가격에 VAT 포함?',
      vatRate: 'VAT 비율 (%)',
      monthlyUnitsSold: '월 eBook 판매 부수',
      eligibleTerritoryShare: '70% 대상 지역 비중 (%)',
      eligibleTerritoryNote: '이 비중만 70% 공식이 적용되고, 나머지는 35%로 계산됩니다.',
      deliveryCostPerSale: '판매당 전달 비용 (USD)',
      kuPagesRead: '월 Kindle Unlimited 페이지 읽힘 수',
      kuPayoutPerPage: 'KU 페이지당 지급액 (USD)',
      kuPayoutNote: '계획용 입력값입니다. 최근 KDP 리포트 평균값으로 바꿔 사용하세요.',
      targetMonthlyRoyalty: '목표 월 로열티 (USD)',
      targetRoyaltyPerSale: '목표 판매당 로열티 (USD)',
      copySummary: '요약 복사',
      reset: '초기화',
      resultsTitle: '결과',
      resultsCopy: '첫 줄에서 핵심 의사결정 값을 보고, 아래 상세 블록에서 실제로 VAT, 지역 비중, 전달 비용 중 무엇이 결과를 바꾸는지 확인하세요.',
      kpiBlendedRoyalty: '판매 1권당 평균 로열티',
      kpiEbookRoyalty: '월 eBook 로열티',
      kpiKuRoyalty: '월 KU 로열티',
      kpiTotalRoyalty: '총 월 로열티',
      kpiUnitsNeeded: '목표 달성 필요 판매 부수',
      kpiRequiredListPrice: '필요 리스트 가격',
      detailNetListPrice: 'VAT 제외 순가격',
      detailEffectiveRate: '실효 eBook 로열티율',
      detailEligibleRoyalty: '70% 대상 판매당 로열티',
      detailFallbackRoyalty: '35% 판매당 로열티',
      detailEligibleUnits: '대상 지역 판매 부수',
      detailFallbackUnits: '35% 환산 판매 부수',
      detailDeliveryCeiling: '70% 이점이 사라지기 전 전달 비용 한도',
      detailEligibleAdvantage: '대상 판매당 70% 추가 이점',
      summaryCopy: '가격 노트, 런칭 문서, 작가 대시보드에 붙여넣기 좋은 텍스트 요약입니다.',
      invalid: '입력값을 확인해주세요.',
      unsupportedPlan: '지원하지 않는 로열티 옵션입니다.',
      listPrice: '리스트 가격은 0보다 커야 합니다.',
      vatRate: 'VAT 비율은 0 이상 100 이하이어야 합니다.',
      monthlyUnitsSold: '월 판매 부수는 0 이상의 정수여야 합니다.',
      territoryShare: '70% 적용 가능 지역 비중은 0 이상 100 이하이어야 합니다.',
      deliveryCost: '판매당 전달 비용은 0 이상이어야 합니다.',
      kuPagesRead: 'KU 페이지 읽힘 수는 0 이상의 정수여야 합니다.',
      kuPayoutPerPage: 'KU 페이지당 지급액은 0 이상이어야 합니다.',
      targetMonthlyRoyalty: '목표 월 로열티는 0 이상이어야 합니다.',
      targetRoyaltyPerSale: '목표 판매당 로열티는 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '기본값으로 빠르게 추정하거나 실제 KDP 가정값으로 수정해보세요.',
      statusStrong: '현재 가정값이면 목표 월 로열티를 달성하거나 초과합니다.',
      statusBelow: '현재 가정값은 목표 월 로열티보다 낮습니다.',
      statusDelivery: '전달 비용 때문에 70% 옵션의 추가 이점이 사라지고 있습니다.',
      summaryTitle: '[KDP 로열티 계산기 요약]',
      royaltyPlanLabel: '로열티 옵션',
      listPriceLabel: '리스트 가격',
      netPriceLabel: 'VAT 제외 순가격',
      royaltyPerEligibleLabel: '70% 대상 판매당 로열티',
      royaltyPerFallbackLabel: '비대상 / 35% 판매당 로열티',
      blendedRoyaltyLabel: '판매 1권당 평균 로열티',
      ebookRoyaltyLabel: '월 eBook 로열티',
      kuRoyaltyLabel: '월 KU 로열티',
      totalRoyaltyLabel: '총 월 로열티',
      effectiveRateLabel: '실효 eBook 로열티율',
      unitsNeededLabel: '목표 월 로열티 달성 필요 판매 부수',
      requiredPriceLabel: '목표 판매당 로열티 달성 필요 가격',
      deliveryCeilingLabel: '70% 이점이 사라지기 전 전달 비용 한도',
      eligibleAdvantageLabel: '70% 옵션의 대상 판매당 추가 이점',
      note: '계획용 메모: KU 페이지당 지급액은 월마다 달라집니다. 실제 가격 결정을 하기 전 최근 KDP 리포트 평균값으로 바꿔서 사용하세요.',
      na: '계산 불가'
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
      royaltyPlan: String(input.royaltyPlan || DEFAULTS.royaltyPlan),
      listPrice: Number(input.listPrice),
      priceIncludesVat: Boolean(input.priceIncludesVat),
      vatRatePct: Number(input.vatRatePct),
      monthlyUnitsSold: Number(input.monthlyUnitsSold),
      eligibleTerritorySharePct: Number(input.eligibleTerritorySharePct),
      deliveryCostPerSale: Number(input.deliveryCostPerSale),
      kuPagesRead: Number(input.kuPagesRead),
      kuPayoutPerPage: Number(input.kuPayoutPerPage),
      targetMonthlyRoyalty: Number(input.targetMonthlyRoyalty),
      targetRoyaltyPerSale: Number(input.targetRoyaltyPerSale)
    };
  }

  function getPlan(input) {
    return planMap[input.royaltyPlan] || null;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!getPlan(input)) {
      return t.unsupportedPlan;
    }
    if (!Number.isFinite(input.listPrice) || input.listPrice <= 0) {
      return t.listPrice;
    }
    if (!Number.isFinite(input.vatRatePct) || input.vatRatePct < 0 || input.vatRatePct > 100) {
      return t.vatRate;
    }
    if (!Number.isFinite(input.monthlyUnitsSold) || input.monthlyUnitsSold < 0 || !Number.isInteger(input.monthlyUnitsSold)) {
      return t.monthlyUnitsSold;
    }
    if (!Number.isFinite(input.eligibleTerritorySharePct) || input.eligibleTerritorySharePct < 0 || input.eligibleTerritorySharePct > 100) {
      return t.territoryShare;
    }
    if (!Number.isFinite(input.deliveryCostPerSale) || input.deliveryCostPerSale < 0) {
      return t.deliveryCost;
    }
    if (!Number.isFinite(input.kuPagesRead) || input.kuPagesRead < 0 || !Number.isInteger(input.kuPagesRead)) {
      return t.kuPagesRead;
    }
    if (!Number.isFinite(input.kuPayoutPerPage) || input.kuPayoutPerPage < 0) {
      return t.kuPayoutPerPage;
    }
    if (!Number.isFinite(input.targetMonthlyRoyalty) || input.targetMonthlyRoyalty < 0) {
      return t.targetMonthlyRoyalty;
    }
    if (!Number.isFinite(input.targetRoyaltyPerSale) || input.targetRoyaltyPerSale < 0) {
      return t.targetRoyaltyPerSale;
    }

    return '';
  }

  function getNetListPrice(input) {
    if (!input.priceIncludesVat) {
      return input.listPrice;
    }
    return input.listPrice / (1 + (input.vatRatePct / 100));
  }

  function getEligibleShare(input) {
    return input.royaltyPlan === '70' ? (input.eligibleTerritorySharePct / 100) : 0;
  }

  function getBlendedCoefficient(input) {
    const eligibleShare = getEligibleShare(input);
    return input.royaltyPlan === '70'
      ? (eligibleShare * 0.7) + ((1 - eligibleShare) * 0.35)
      : 0.35;
  }

  function getBlendedDeliveryDeduction(input) {
    return input.royaltyPlan === '70'
      ? getEligibleShare(input) * input.deliveryCostPerSale
      : 0;
  }

  function calculate(input, options) {
    const lang = options && options.lang ? options.lang : 'en';
    const t = TEXT[lang] || TEXT.en;
    const normalized = normalizeInput(Object.assign({}, DEFAULTS, input || {}));
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const netListPrice = getNetListPrice(normalized);
    const eligibleShare = getEligibleShare(normalized);
    const eligibleUnits = normalized.monthlyUnitsSold * eligibleShare;
    const fallbackUnits = normalized.monthlyUnitsSold - eligibleUnits;
    const royaltyPerFallbackSale = netListPrice * 0.35;
    const royaltyPerEligibleSale = normalized.royaltyPlan === '70'
      ? (netListPrice * 0.7) - normalized.deliveryCostPerSale
      : royaltyPerFallbackSale;
    const ebookRoyalty = (eligibleUnits * royaltyPerEligibleSale) + (fallbackUnits * royaltyPerFallbackSale);
    const blendedRoyaltyPerSale = normalized.monthlyUnitsSold > 0 ? (ebookRoyalty / normalized.monthlyUnitsSold) : 0;
    const kuRoyalty = normalized.kuPagesRead * normalized.kuPayoutPerPage;
    const totalRoyalty = ebookRoyalty + kuRoyalty;
    const netConsumerRevenue = normalized.monthlyUnitsSold * netListPrice;
    const effectiveRoyaltyRatePct = netConsumerRevenue > 0 ? (ebookRoyalty / netConsumerRevenue) * 100 : 0;
    const deliveryCostCeiling = netListPrice * 0.35;
    const eligibleAdvantagePerSale = normalized.royaltyPlan === '70'
      ? royaltyPerEligibleSale - royaltyPerFallbackSale
      : 0;

    let unitsNeededForTargetMonthlyRoyalty = null;
    if (blendedRoyaltyPerSale > 0) {
      const residualTarget = normalized.targetMonthlyRoyalty - kuRoyalty;
      unitsNeededForTargetMonthlyRoyalty = residualTarget <= 0 ? 0 : residualTarget / blendedRoyaltyPerSale;
    }

    const blendedCoefficient = getBlendedCoefficient(normalized);
    const blendedDeliveryDeduction = getBlendedDeliveryDeduction(normalized);
    let requiredNetListPrice = null;
    let requiredListPrice = null;
    if (blendedCoefficient > 0) {
      requiredNetListPrice = (normalized.targetRoyaltyPerSale + blendedDeliveryDeduction) / blendedCoefficient;
      requiredListPrice = normalized.priceIncludesVat
        ? requiredNetListPrice * (1 + (normalized.vatRatePct / 100))
        : requiredNetListPrice;
    }

    const statusTone = normalized.royaltyPlan === '70' && eligibleAdvantagePerSale < 0
      ? 'warn'
      : totalRoyalty >= normalized.targetMonthlyRoyalty
        ? 'good'
        : 'neutral';
    const statusText = normalized.royaltyPlan === '70' && eligibleAdvantagePerSale < 0
      ? t.statusDelivery
      : totalRoyalty >= normalized.targetMonthlyRoyalty
        ? t.statusStrong
        : t.statusBelow;

    const result = {
      input: normalized,
      planLabel: getPlan(normalized).label[lang] || getPlan(normalized).label.en,
      netListPrice: round4(netListPrice),
      eligibleUnits: round4(eligibleUnits),
      fallbackUnits: round4(fallbackUnits),
      royaltyPerEligibleSale: round4(royaltyPerEligibleSale),
      royaltyPerFallbackSale: round4(royaltyPerFallbackSale),
      blendedRoyaltyPerSale: round4(blendedRoyaltyPerSale),
      ebookRoyalty: round4(ebookRoyalty),
      kuRoyalty: round4(kuRoyalty),
      totalRoyalty: round4(totalRoyalty),
      effectiveRoyaltyRatePct: round4(effectiveRoyaltyRatePct),
      deliveryCostCeiling: round4(deliveryCostCeiling),
      eligibleAdvantagePerSale: round4(eligibleAdvantagePerSale),
      unitsNeededForTargetMonthlyRoyalty: unitsNeededForTargetMonthlyRoyalty == null ? null : round4(unitsNeededForTargetMonthlyRoyalty),
      requiredNetListPrice: requiredNetListPrice == null ? null : round4(requiredNetListPrice),
      requiredListPrice: requiredListPrice == null ? null : round4(requiredListPrice),
      statusTone,
      statusText,
      note: t.note,
      summary: buildSummary({
        lang,
        t,
        planLabel: getPlan(normalized).label[lang] || getPlan(normalized).label.en,
        input: normalized,
        netListPrice,
        royaltyPerEligibleSale,
        royaltyPerFallbackSale,
        blendedRoyaltyPerSale,
        ebookRoyalty,
        kuRoyalty,
        totalRoyalty,
        effectiveRoyaltyRatePct,
        unitsNeededForTargetMonthlyRoyalty,
        requiredListPrice,
        deliveryCostCeiling,
        eligibleAdvantagePerSale
      })
    };

    return { result, error: '' };
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0)}%`;
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits == null ? 2 : digits
    }).format(Number.isFinite(value) ? value : 0);
  }

  function buildSummary(context) {
    const unitsNeeded = context.unitsNeededForTargetMonthlyRoyalty == null
      ? context.t.na
      : formatNumber(context.unitsNeededForTargetMonthlyRoyalty, context.lang, 1);
    const requiredPrice = context.requiredListPrice == null
      ? context.t.na
      : formatMoney(context.requiredListPrice, context.lang);

    return [
      context.t.summaryTitle,
      `${context.t.royaltyPlanLabel}: ${context.planLabel}`,
      `${context.t.listPriceLabel}: ${formatMoney(context.input.listPrice, context.lang)}`,
      `${context.t.netPriceLabel}: ${formatMoney(context.netListPrice, context.lang)}`,
      `${context.t.royaltyPerEligibleLabel}: ${formatMoney(context.royaltyPerEligibleSale, context.lang)}`,
      `${context.t.royaltyPerFallbackLabel}: ${formatMoney(context.royaltyPerFallbackSale, context.lang)}`,
      `${context.t.blendedRoyaltyLabel}: ${formatMoney(context.blendedRoyaltyPerSale, context.lang)}`,
      `${context.t.ebookRoyaltyLabel}: ${formatMoney(context.ebookRoyalty, context.lang)}`,
      `${context.t.kuRoyaltyLabel}: ${formatMoney(context.kuRoyalty, context.lang)}`,
      `${context.t.totalRoyaltyLabel}: ${formatMoney(context.totalRoyalty, context.lang)}`,
      `${context.t.effectiveRateLabel}: ${formatPercent(context.effectiveRoyaltyRatePct, context.lang)}`,
      `${context.t.unitsNeededLabel}: ${unitsNeeded}`,
      `${context.t.requiredPriceLabel}: ${requiredPrice}`,
      `${context.t.deliveryCeilingLabel}: ${formatMoney(context.deliveryCostCeiling, context.lang)}`,
      `${context.t.eligibleAdvantageLabel}: ${formatMoney(context.eligibleAdvantagePerSale, context.lang)}`
    ].join('\n');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      langBtn: document.getElementById('langBtn'),
      royaltyPlan: document.getElementById('royaltyPlan'),
      listPrice: document.getElementById('listPrice'),
      priceIncludesVat: document.getElementById('priceIncludesVat'),
      vatRatePct: document.getElementById('vatRatePct'),
      monthlyUnitsSold: document.getElementById('monthlyUnitsSold'),
      eligibleTerritorySharePct: document.getElementById('eligibleTerritorySharePct'),
      deliveryCostPerSale: document.getElementById('deliveryCostPerSale'),
      kuPagesRead: document.getElementById('kuPagesRead'),
      kuPayoutPerPage: document.getElementById('kuPayoutPerPage'),
      targetMonthlyRoyalty: document.getElementById('targetMonthlyRoyalty'),
      targetRoyaltyPerSale: document.getElementById('targetRoyaltyPerSale'),
      copyBtn: document.getElementById('copyBtn'),
      resetBtn: document.getElementById('resetBtn'),
      error: document.getElementById('error'),
      status: document.getElementById('status'),
      note: document.getElementById('dynamicNote'),
      summary: document.getElementById('summary'),
      netListPrice: document.getElementById('netListPrice'),
      royaltyPerEligibleSale: document.getElementById('royaltyPerEligibleSale'),
      royaltyPerFallbackSale: document.getElementById('royaltyPerFallbackSale'),
      blendedRoyaltyPerSale: document.getElementById('blendedRoyaltyPerSale'),
      ebookRoyalty: document.getElementById('ebookRoyalty'),
      kuRoyalty: document.getElementById('kuRoyalty'),
      totalRoyalty: document.getElementById('totalRoyalty'),
      effectiveRoyaltyRatePct: document.getElementById('effectiveRoyaltyRatePct'),
      unitsNeededForTargetMonthlyRoyalty: document.getElementById('unitsNeededForTargetMonthlyRoyalty'),
      requiredListPrice: document.getElementById('requiredListPrice'),
      eligibleUnits: document.getElementById('eligibleUnits'),
      fallbackUnits: document.getElementById('fallbackUnits'),
      deliveryCostCeiling: document.getElementById('deliveryCostCeiling'),
      eligibleAdvantagePerSale: document.getElementById('eligibleAdvantagePerSale'),
      territoryFields: document.querySelectorAll('[data-plan-only="70"]')
    };

    let lang = document.documentElement.lang === 'ko' ? 'ko' : 'en';

    function t(key) {
      return (TEXT[lang] || TEXT.en)[key] || key;
    }

    function setDataI18n() {
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-i18n]').forEach((node) => {
        node.textContent = t(node.dataset.i18n);
      });
      refs.langBtn.textContent = lang === 'en' ? 'KO' : 'EN';
    }

    function clearOutputs() {
      [
        refs.netListPrice,
        refs.royaltyPerEligibleSale,
        refs.royaltyPerFallbackSale,
        refs.blendedRoyaltyPerSale,
        refs.ebookRoyalty,
        refs.kuRoyalty,
        refs.totalRoyalty,
        refs.effectiveRoyaltyRatePct,
        refs.unitsNeededForTargetMonthlyRoyalty,
        refs.requiredListPrice,
        refs.eligibleUnits,
        refs.fallbackUnits,
        refs.deliveryCostCeiling,
        refs.eligibleAdvantagePerSale
      ].forEach((node) => {
        node.textContent = '—';
      });
      refs.summary.value = '';
    }

    function syncPlanDependentFields() {
      const isSeventy = refs.royaltyPlan.value === '70';
      refs.territoryFields.forEach((node) => {
        node.toggleAttribute('data-disabled', !isSeventy);
      });
      refs.eligibleTerritorySharePct.disabled = !isSeventy;
      refs.deliveryCostPerSale.disabled = !isSeventy;
    }

    function getInput() {
      return {
        royaltyPlan: refs.royaltyPlan.value,
        listPrice: refs.listPrice.value,
        priceIncludesVat: refs.priceIncludesVat.value === 'true',
        vatRatePct: refs.vatRatePct.value,
        monthlyUnitsSold: refs.monthlyUnitsSold.value,
        eligibleTerritorySharePct: refs.eligibleTerritorySharePct.value,
        deliveryCostPerSale: refs.deliveryCostPerSale.value,
        kuPagesRead: refs.kuPagesRead.value,
        kuPayoutPerPage: refs.kuPayoutPerPage.value,
        targetMonthlyRoyalty: refs.targetMonthlyRoyalty.value,
        targetRoyaltyPerSale: refs.targetRoyaltyPerSale.value
      };
    }

    function render() {
      syncPlanDependentFields();
      const { result, error } = calculate(getInput(), { lang });

      refs.error.hidden = !error;
      refs.error.textContent = error || '';

      if (error) {
        refs.status.dataset.tone = 'neutral';
        refs.status.textContent = t('invalid');
        refs.note.textContent = t('note');
        clearOutputs();
        return;
      }

      refs.status.dataset.tone = result.statusTone;
      refs.status.textContent = result.statusText;
      refs.note.textContent = result.note;

      refs.netListPrice.textContent = formatMoney(result.netListPrice, lang);
      refs.royaltyPerEligibleSale.textContent = formatMoney(result.royaltyPerEligibleSale, lang);
      refs.royaltyPerFallbackSale.textContent = formatMoney(result.royaltyPerFallbackSale, lang);
      refs.blendedRoyaltyPerSale.textContent = formatMoney(result.blendedRoyaltyPerSale, lang);
      refs.ebookRoyalty.textContent = formatMoney(result.ebookRoyalty, lang);
      refs.kuRoyalty.textContent = formatMoney(result.kuRoyalty, lang);
      refs.totalRoyalty.textContent = formatMoney(result.totalRoyalty, lang);
      refs.effectiveRoyaltyRatePct.textContent = formatPercent(result.effectiveRoyaltyRatePct, lang);
      refs.unitsNeededForTargetMonthlyRoyalty.textContent = result.unitsNeededForTargetMonthlyRoyalty == null
        ? t('na')
        : formatNumber(result.unitsNeededForTargetMonthlyRoyalty, lang, 1);
      refs.requiredListPrice.textContent = result.requiredListPrice == null
        ? t('na')
        : formatMoney(result.requiredListPrice, lang);
      refs.eligibleUnits.textContent = formatNumber(result.eligibleUnits, lang, 1);
      refs.fallbackUnits.textContent = formatNumber(result.fallbackUnits, lang, 1);
      refs.deliveryCostCeiling.textContent = formatMoney(result.deliveryCostCeiling, lang);
      refs.eligibleAdvantagePerSale.textContent = formatMoney(result.eligibleAdvantagePerSale, lang);
      refs.summary.value = result.summary;
    }

    refs.langBtn.addEventListener('click', function () {
      lang = lang === 'en' ? 'ko' : 'en';
      setDataI18n();
      render();
    });

    refs.copyBtn.addEventListener('click', async function () {
      if (!refs.summary.value.trim()) {
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.dataset.tone = 'good';
        refs.status.textContent = t('copied');
      } catch (error) {
        refs.status.dataset.tone = 'warn';
        refs.status.textContent = t('copyFail');
      }
    });

    refs.resetBtn.addEventListener('click', function () {
      refs.royaltyPlan.value = DEFAULTS.royaltyPlan;
      refs.listPrice.value = DEFAULTS.listPrice;
      refs.priceIncludesVat.value = String(DEFAULTS.priceIncludesVat);
      refs.vatRatePct.value = DEFAULTS.vatRatePct;
      refs.monthlyUnitsSold.value = DEFAULTS.monthlyUnitsSold;
      refs.eligibleTerritorySharePct.value = DEFAULTS.eligibleTerritorySharePct;
      refs.deliveryCostPerSale.value = DEFAULTS.deliveryCostPerSale;
      refs.kuPagesRead.value = DEFAULTS.kuPagesRead;
      refs.kuPayoutPerPage.value = DEFAULTS.kuPayoutPerPage;
      refs.targetMonthlyRoyalty.value = DEFAULTS.targetMonthlyRoyalty;
      refs.targetRoyaltyPerSale.value = DEFAULTS.targetRoyaltyPerSale;
      render();
    });

    [
      refs.royaltyPlan,
      refs.listPrice,
      refs.priceIncludesVat,
      refs.vatRatePct,
      refs.monthlyUnitsSold,
      refs.eligibleTerritorySharePct,
      refs.deliveryCostPerSale,
      refs.kuPagesRead,
      refs.kuPayoutPerPage,
      refs.targetMonthlyRoyalty,
      refs.targetRoyaltyPerSale
    ].forEach((node) => {
      node.addEventListener('input', render);
      node.addEventListener('change', render);
    });

    setDataI18n();
    refs.status.textContent = t('waiting');
    refs.note.textContent = t('note');
    render();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initBrowser);
  }

  return {
    ROYALTY_PLANS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    validate,
    getNetListPrice,
    getEligibleShare,
    getBlendedCoefficient,
    getBlendedDeliveryDeduction,
    buildSummary,
    calculate,
    formatMoney,
    formatPercent,
    formatNumber
  };
});
