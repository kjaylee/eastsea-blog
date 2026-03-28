(function (root) {
  const DEFAULTS = {
    monthlyLongformViews: 300000,
    monthlyShortsViews: 1200000,
    monetizedPlaybackRatePct: 42,
    longformRpm: 4.5,
    shortsRpm: 0.08,
    membershipRevenue: 450,
    sponsorshipRevenue: 800,
    affiliateRevenue: 250,
    productionCost: 700,
    softwareCost: 120,
    taxReservePct: 20,
    targetMonthlyTakeHome: 3000,
    currency: 'USD'
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      nonNegative: 'Views, revenue, and cost inputs must be 0 or greater.',
      monetizedRange: 'Monetized playback rate must stay between 0 and 100.',
      taxRange: 'Tax reserve must stay between 0 and 60.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy the summary manually.',
      statusGood: 'This YouTube money setup stays profitable under the current assumptions.',
      statusWarn: 'This YouTube money setup is underwater under the current assumptions.',
      na: 'N/A',
      summaryTitle: '[YouTube Money Calculator Summary]',
      summaryPhrase: 'YouTube money calculator',
      moneyLabel: 'monthly take-home',
      assumptions1: 'Long-form ad revenue = monetized long-form views × RPM.',
      assumptions2: 'Shorts revenue uses a separate Shorts RPM assumption.',
      assumptions3: 'Tax reserve only applies when pre-tax profit is positive.',
      limitationNote: 'Estimates only — actual payout varies by niche, geography, audience mix, seasonality, ad fill, YPP eligibility, and platform policy changes.',
      limitations1: 'This calculator is an estimate, not YouTube Analytics, AdSense, or creator studio reporting.',
      limitations2: 'Real RPM and monetized playback rates can swing materially by niche, viewer geography, seasonality, and content format.',
      limitations3: 'This page is for planning only and is not tax, accounting, or legal advice.'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      nonNegative: '조회수, 수익, 비용 입력값은 모두 0 이상이어야 합니다.',
      monetizedRange: '수익화 재생 비율은 0~100 범위여야 합니다.',
      taxRange: '세금 적립 비율은 0~60 범위여야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      statusGood: '현재 가정에서 유튜브 수익이 흑자입니다.',
      statusWarn: '현재 가정에서는 유튜브 수익이 적자입니다.',
      na: '해당 없음',
      summaryTitle: '[유튜브 수익 계산기 요약]',
      summaryPhrase: '유튜브 수익 계산기',
      moneyLabel: '월 실수령액',
      assumptions1: '롱폼 광고 수익 = 수익화 롱폼 조회수 × RPM 입니다.',
      assumptions2: '쇼츠 수익은 별도 Shorts RPM 가정으로 계산합니다.',
      assumptions3: '세금 적립은 세전 이익이 양수일 때만 적용합니다.',
      limitationNote: '예상치용 계산기입니다. 실제 지급액은 니치, 국가, 시청자 구성, 계절성, 광고 채움률, YPP 자격, 플랫폼 정책 변화에 따라 크게 달라질 수 있습니다.',
      limitations1: '이 계산기는 추정 도구이며 YouTube Analytics, AdSense, 또는 스튜디오 실측 보고서가 아닙니다.',
      limitations2: '실제 RPM과 수익화 재생 비율은 니치, 시청자 국가, 시즌성, 콘텐츠 포맷에 따라 크게 변동할 수 있습니다.',
      limitations3: '이 페이지는 계획용이며 세무·회계·법률 자문이 아닙니다.'
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalizeInput(input) {
    return {
      monthlyLongformViews: Number(input.monthlyLongformViews),
      monthlyShortsViews: Number(input.monthlyShortsViews),
      monetizedPlaybackRatePct: Number(input.monetizedPlaybackRatePct),
      longformRpm: Number(input.longformRpm),
      shortsRpm: Number(input.shortsRpm),
      membershipRevenue: Number(input.membershipRevenue),
      sponsorshipRevenue: Number(input.sponsorshipRevenue),
      affiliateRevenue: Number(input.affiliateRevenue),
      productionCost: Number(input.productionCost),
      softwareCost: Number(input.softwareCost),
      taxReservePct: Number(input.taxReservePct),
      targetMonthlyTakeHome: Number(input.targetMonthlyTakeHome),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    for (const key of [
      'monthlyLongformViews',
      'monthlyShortsViews',
      'longformRpm',
      'shortsRpm',
      'membershipRevenue',
      'sponsorshipRevenue',
      'affiliateRevenue',
      'productionCost',
      'softwareCost',
      'targetMonthlyTakeHome'
    ]) {
      if (!Number.isFinite(input[key]) || input[key] < 0) return t.nonNegative;
    }
    if (!Number.isFinite(input.monetizedPlaybackRatePct) || input.monetizedPlaybackRatePct < 0 || input.monetizedPlaybackRatePct > 100) {
      return t.monetizedRange;
    }
    if (!Number.isFinite(input.taxReservePct) || input.taxReservePct < 0 || input.taxReservePct > 60) {
      return t.taxRange;
    }
    return '';
  }

  function computeRevenueStack(input) {
    const monetizedLongformViews = input.monthlyLongformViews * (input.monetizedPlaybackRatePct / 100);
    const longformAdRevenue = (monetizedLongformViews / 1000) * input.longformRpm;
    const shortsAdRevenue = (input.monthlyShortsViews / 1000) * input.shortsRpm;
    const totalAdRevenue = longformAdRevenue + shortsAdRevenue;
    const extraRevenue = input.membershipRevenue + input.sponsorshipRevenue + input.affiliateRevenue;
    const grossRevenue = totalAdRevenue + extraRevenue;
    const operatingCost = input.productionCost + input.softwareCost;
    const preTaxProfit = grossRevenue - operatingCost;
    const taxReserve = preTaxProfit > 0 ? preTaxProfit * (input.taxReservePct / 100) : 0;
    const monthlyTakeHome = preTaxProfit - taxReserve;
    const yearlyTakeHome = monthlyTakeHome * 12;
    const totalViews = input.monthlyLongformViews + input.monthlyShortsViews;
    const blendedRevenuePerThousandViews = totalViews > 0 ? grossRevenue / (totalViews / 1000) : 0;

    return {
      monetizedLongformViews: round2(monetizedLongformViews),
      longformAdRevenue: round2(longformAdRevenue),
      shortsAdRevenue: round2(shortsAdRevenue),
      totalAdRevenue: round2(totalAdRevenue),
      extraRevenue: round2(extraRevenue),
      grossRevenue: round2(grossRevenue),
      operatingCost: round2(operatingCost),
      preTaxProfit: round2(preTaxProfit),
      taxReserve: round2(taxReserve),
      monthlyTakeHome: round2(monthlyTakeHome),
      yearlyTakeHome: round2(yearlyTakeHome),
      blendedRevenuePerThousandViews: round2(blendedRevenuePerThousandViews)
    };
  }

  function computeScenarioTakeHome(input, multiplier) {
    const taxRate = input.taxReservePct / 100;
    const monetizedLongformViews = input.monthlyLongformViews * (input.monetizedPlaybackRatePct / 100);
    const longformAdRevenue = (monetizedLongformViews / 1000) * input.longformRpm * multiplier;
    const shortsAdRevenue = (input.monthlyShortsViews / 1000) * input.shortsRpm * multiplier;
    const extraRevenue = input.membershipRevenue + input.sponsorshipRevenue + input.affiliateRevenue;
    const gross = longformAdRevenue + shortsAdRevenue + extraRevenue;
    const preTax = gross - (input.productionCost + input.softwareCost);
    const taxReserve = preTax > 0 ? preTax * taxRate : 0;
    return round2(preTax - taxReserve);
  }

  function solveRequiredLongformViews(input, targetMonthlyTakeHome) {
    const taxRate = input.taxReservePct / 100;
    const longformRevenuePerRawView = (input.monetizedPlaybackRatePct / 100) * (input.longformRpm / 1000);
    if (longformRevenuePerRawView <= 0) return null;

    const shortsAdRevenue = (input.monthlyShortsViews / 1000) * input.shortsRpm;
    const fixedGross = shortsAdRevenue + input.membershipRevenue + input.sponsorshipRevenue + input.affiliateRevenue;
    const operatingCost = input.productionCost + input.softwareCost;
    const requiredPreTaxProfit = targetMonthlyTakeHome > 0
      ? targetMonthlyTakeHome / Math.max(1 - taxRate, Number.EPSILON)
      : 0;
    const requiredGross = operatingCost + requiredPreTaxProfit;
    const requiredViews = Math.max(0, (requiredGross - fixedGross) / longformRevenuePerRawView);
    return Math.ceil(requiredViews);
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const currency = result.inputs.currency;
    const na = t.na;
    return [
      t.summaryTitle,
      `${t.summaryPhrase}`,
      `Monthly long-form views: ${formatNumber(result.inputs.monthlyLongformViews, lang, 0)}`,
      `Monthly Shorts views: ${formatNumber(result.inputs.monthlyShortsViews, lang, 0)}`,
      `Monetized long-form views: ${formatNumber(result.monetizedLongformViews, lang, 0)}`,
      `Long-form ad revenue: ${formatMoney(result.longformAdRevenue, lang, currency)}`,
      `Shorts ad revenue: ${formatMoney(result.shortsAdRevenue, lang, currency)}`,
      `Extra revenue: ${formatMoney(result.extraRevenue, lang, currency)}`,
      `Gross revenue: ${formatMoney(result.grossRevenue, lang, currency)}`,
      `Operating cost: ${formatMoney(result.operatingCost, lang, currency)}`,
      `Tax reserve: ${formatMoney(result.taxReserve, lang, currency)}`,
      `Monthly take-home: ${formatMoney(result.monthlyTakeHome, lang, currency)}`,
      `Yearly take-home: ${formatMoney(result.yearlyTakeHome, lang, currency)}`,
      `Break-even long-form views: ${result.breakEvenLongformViews == null ? na : formatNumber(result.breakEvenLongformViews, lang, 0)}`,
      `Target long-form views: ${result.targetLongformViews == null ? na : formatNumber(result.targetLongformViews, lang, 0)}`,
      `Low / Base / High take-home: ${formatMoney(result.lowMonthlyTakeHome, lang, currency)} / ${formatMoney(result.baseMonthlyTakeHome, lang, currency)} / ${formatMoney(result.highMonthlyTakeHome, lang, currency)}`,
      (TEXT[lang] || TEXT.en).assumptions1,
      (TEXT[lang] || TEXT.en).assumptions2,
      (TEXT[lang] || TEXT.en).assumptions3,
      (TEXT[lang] || TEXT.en).limitationNote
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const core = computeRevenueStack(normalized);
    const result = {
      inputs: normalized,
      ...core,
      lowMonthlyTakeHome: computeScenarioTakeHome(normalized, 0.8),
      baseMonthlyTakeHome: core.monthlyTakeHome,
      highMonthlyTakeHome: computeScenarioTakeHome(normalized, 1.2),
      breakEvenLongformViews: solveRequiredLongformViews(normalized, 0),
      targetLongformViews: solveRequiredLongformViews(normalized, normalized.targetMonthlyTakeHome)
    };
    result.summary = buildSummary(result, lang);
    return { result, error: '' };
  }

  function formatMoney(value, lang, currency) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    }).format(value);
  }

  const api = {
    DEFAULTS,
    normalizeInput,
    validate,
    computeRevenueStack,
    computeScenarioTakeHome,
    solveRequiredLongformViews,
    calculate,
    formatMoney,
    formatNumber
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.YouTubeMoneyCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const fieldIds = [
    'monthlyLongformViews',
    'monthlyShortsViews',
    'monetizedPlaybackRatePct',
    'longformRpm',
    'shortsRpm',
    'membershipRevenue',
    'sponsorshipRevenue',
    'affiliateRevenue',
    'productionCost',
    'softwareCost',
    'taxReservePct',
    'targetMonthlyTakeHome'
  ];

  const refs = {};
  fieldIds.forEach((id) => {
    refs[id] = document.getElementById(id);
  });

  refs.copyButton = document.getElementById('copyButton');
  refs.resetButton = document.getElementById('resetButton');
  refs.langButton = document.getElementById('langButton');
  refs.error = document.getElementById('error');
  refs.status = document.getElementById('status');
  refs.summary = document.getElementById('summary');

  const outputIds = [
    'monetizedLongformViews',
    'longformAdRevenue',
    'shortsAdRevenue',
    'extraRevenue',
    'grossRevenue',
    'operatingCost',
    'taxReserve',
    'monthlyTakeHome',
    'yearlyTakeHome',
    'blendedRevenuePerThousandViews',
    'breakEvenLongformViews',
    'targetLongformViews',
    'lowMonthlyTakeHome',
    'baseMonthlyTakeHome',
    'highMonthlyTakeHome'
  ];

  outputIds.forEach((id) => {
    refs[id] = document.getElementById(id);
  });

  let lang = 'en';
  const moneyOutputIds = [
    'longformAdRevenue',
    'shortsAdRevenue',
    'extraRevenue',
    'grossRevenue',
    'operatingCost',
    'taxReserve',
    'monthlyTakeHome',
    'yearlyTakeHome',
    'lowMonthlyTakeHome',
    'baseMonthlyTakeHome',
    'highMonthlyTakeHome'
  ];

  const numberOutputIds = [
    'monetizedLongformViews',
    'blendedRevenuePerThousandViews',
    'breakEvenLongformViews',
    'targetLongformViews'
  ];

  const I18N = {
    en: {
      pageTitle: 'YouTube Money Calculator | 유튜브 수익 계산기',
      title: 'YouTube Money Calculator',
      intro: 'Use this YouTube money calculator to estimate monthly creator income from long-form views, Shorts, memberships, sponsorships, and affiliate revenue — then see take-home after costs and a tax reserve.',
      inputs: 'Inputs',
      revenue: 'Revenue breakdown',
      takehome: 'Take-home summary',
      scenarios: 'Low / Base / High scenarios',
      assumptions: 'Assumptions & FAQ',
      limitations: 'Limitations',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      back: '← Tools',
      labels: {
        monthlyLongformViews: 'Monthly long-form views',
        monthlyShortsViews: 'Monthly Shorts views',
        monetizedPlaybackRatePct: 'Monetized playback rate (%)',
        longformRpm: 'Long-form RPM (USD)',
        shortsRpm: 'Shorts RPM (USD)',
        membershipRevenue: 'Membership revenue / month',
        sponsorshipRevenue: 'Sponsorship revenue / month',
        affiliateRevenue: 'Affiliate revenue / month',
        productionCost: 'Production cost / month',
        softwareCost: 'Software & tools cost / month',
        taxReservePct: 'Tax reserve (%)',
        targetMonthlyTakeHome: 'Target monthly take-home'
      },
      outputs: {
        monetizedLongformViews: 'Monetized long-form views',
        longformAdRevenue: 'Long-form ad revenue',
        shortsAdRevenue: 'Shorts ad revenue',
        extraRevenue: 'Extra revenue stack',
        grossRevenue: 'Gross revenue',
        operatingCost: 'Operating cost',
        taxReserve: 'Tax reserve',
        monthlyTakeHome: 'Monthly take-home',
        yearlyTakeHome: 'Yearly take-home',
        blendedRevenuePerThousandViews: 'Blended revenue / 1,000 total views',
        breakEvenLongformViews: 'Break-even long-form views',
        targetLongformViews: 'Target long-form views',
        lowMonthlyTakeHome: 'Low',
        baseMonthlyTakeHome: 'Base',
        highMonthlyTakeHome: 'High'
      },
      assumptionBullets: [
        'RPM is creator-side revenue per 1,000 views, while CPM is advertiser-side pricing. This page models RPM.',
        'Long-form revenue uses the monetized playback rate; Shorts revenue uses a separate Shorts RPM assumption.',
        'Memberships, sponsorships, and affiliate revenue are added before operating costs and tax reserve.',
        'Target-view solver assumes Shorts and extra revenue stay fixed while long-form views change.'
      ],
      limitationBullets: [
        'This calculator is an estimate, not YouTube Analytics, AdSense, or creator studio reporting.',
        'Real RPM and monetized playback rates can swing materially by niche, viewer geography, seasonality, and content format.',
        'This page is for planning only and is not tax, accounting, or legal advice.'
      ]
    },
    ko: {
      pageTitle: 'YouTube Money Calculator | 유튜브 수익 계산기',
      title: '유튜브 수익 계산기',
      intro: '이 YouTube money calculator는 롱폼 조회수, 쇼츠, 멤버십, 스폰서십, 제휴 수익을 합쳐 월 수익을 추정하고 비용과 세금 적립 후 실제 남는 금액까지 보여줍니다.',
      inputs: '입력값',
      revenue: '수익 분해',
      takehome: '실수령 요약',
      scenarios: '저가정 / 기준 / 고가정 시나리오',
      assumptions: '가정 및 FAQ',
      limitations: '한계와 주의사항',
      copy: '요약 복사',
      reset: '기본값 복원',
      back: '← 도구 목록',
      labels: {
        monthlyLongformViews: '월 롱폼 조회수',
        monthlyShortsViews: '월 쇼츠 조회수',
        monetizedPlaybackRatePct: '수익화 재생 비율 (%)',
        longformRpm: '롱폼 RPM (USD)',
        shortsRpm: '쇼츠 RPM (USD)',
        membershipRevenue: '월 멤버십 수익',
        sponsorshipRevenue: '월 스폰서십 수익',
        affiliateRevenue: '월 제휴 수익',
        productionCost: '월 제작비',
        softwareCost: '월 툴/소프트웨어 비용',
        taxReservePct: '세금 적립 비율 (%)',
        targetMonthlyTakeHome: '목표 월 실수령액'
      },
      outputs: {
        monetizedLongformViews: '수익화 롱폼 조회수',
        longformAdRevenue: '롱폼 광고 수익',
        shortsAdRevenue: '쇼츠 광고 수익',
        extraRevenue: '추가 수익 합계',
        grossRevenue: '총매출',
        operatingCost: '운영비',
        taxReserve: '세금 적립',
        monthlyTakeHome: '월 실수령액',
        yearlyTakeHome: '연 실수령액',
        blendedRevenuePerThousandViews: '총 조회수 1,000회당 수익',
        breakEvenLongformViews: '손익분기 롱폼 조회수',
        targetLongformViews: '목표 달성 롱폼 조회수',
        lowMonthlyTakeHome: '보수',
        baseMonthlyTakeHome: '기준',
        highMonthlyTakeHome: '공격'
      },
      assumptionBullets: [
        'RPM은 크리에이터 입장 수익이고 CPM은 광고주 입장 단가입니다. 이 페이지는 RPM을 사용합니다.',
        '롱폼 수익은 수익화 재생 비율을 반영하고, 쇼츠는 별도 Shorts RPM 가정을 사용합니다.',
        '멤버십·스폰서십·제휴 수익은 운영비와 세금 적립 전에 합산합니다.',
        '목표 조회수 계산은 쇼츠와 기타 수익이 고정되고 롱폼 조회수만 바뀐다고 가정합니다.'
      ],
      limitationBullets: [
        '이 계산기는 추정 도구이며 YouTube Analytics, AdSense, 또는 스튜디오 실측 보고서가 아닙니다.',
        '실제 RPM과 수익화 재생 비율은 니치, 시청자 국가, 시즌성, 콘텐츠 포맷에 따라 크게 변동할 수 있습니다.',
        '이 페이지는 계획용이며 세무·회계·법률 자문이 아닙니다.'
      ]
    }
  };

  function applyI18n() {
    const copy = I18N[lang];
    document.documentElement.lang = lang;
    document.title = copy.pageTitle;
    const setText = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    };

    setText('title', copy.title);
    setText('intro', copy.intro);
    setText('inputsHeading', copy.inputs);
    setText('revenueHeading', copy.revenue);
    setText('takehomeHeading', copy.takehome);
    setText('scenarioHeading', copy.scenarios);
    setText('assumptionsHeading', copy.assumptions);
    setText('limitationsHeading', copy.limitations);
    setText('backLink', copy.back);
    refs.copyButton.textContent = copy.copy;
    refs.resetButton.textContent = copy.reset;
    refs.langButton.textContent = lang === 'en' ? 'KO' : 'EN';

    Object.keys(copy.labels).forEach((id) => {
      setText(`label-${id}`, copy.labels[id]);
    });
    Object.keys(copy.outputs).forEach((id) => {
      setText(`output-${id}`, copy.outputs[id]);
    });

    const assumptionList = document.getElementById('assumptionList');
    if (assumptionList) {
      assumptionList.innerHTML = copy.assumptionBullets.map((line) => `<li>${line}</li>`).join('');
    }

    const limitationNote = document.getElementById('limitationNote');
    if (limitationNote) {
      limitationNote.textContent = (TEXT[lang] || TEXT.en).limitationNote;
    }

    const limitationList = document.getElementById('limitationList');
    if (limitationList) {
      limitationList.innerHTML = copy.limitationBullets.map((line) => `<li>${line}</li>`).join('');
    }
  }

  function getInputState() {
    const state = {};
    fieldIds.forEach((id) => {
      state[id] = refs[id].value;
    });
    state.currency = 'USD';
    return state;
  }

  function render() {
    const { result, error } = calculate(getInputState(), { lang });

    refs.error.textContent = error;
    refs.error.hidden = !error;
    if (error) {
      refs.status.textContent = (TEXT[lang] || TEXT.en).invalid;
      outputIds.forEach((id) => { if (refs[id]) refs[id].textContent = '—'; });
      refs.summary.value = '';
      return;
    }

    moneyOutputIds.forEach((id) => {
      refs[id].textContent = formatMoney(result[id], lang, result.inputs.currency);
    });

    refs.monetizedLongformViews.textContent = formatNumber(result.monetizedLongformViews, lang, 0);
    refs.blendedRevenuePerThousandViews.textContent = formatMoney(result.blendedRevenuePerThousandViews, lang, result.inputs.currency);
    refs.breakEvenLongformViews.textContent = result.breakEvenLongformViews == null ? (TEXT[lang] || TEXT.en).na : formatNumber(result.breakEvenLongformViews, lang, 0);
    refs.targetLongformViews.textContent = result.targetLongformViews == null ? (TEXT[lang] || TEXT.en).na : formatNumber(result.targetLongformViews, lang, 0);

    refs.status.textContent = result.monthlyTakeHome >= 0 ? (TEXT[lang] || TEXT.en).statusGood : (TEXT[lang] || TEXT.en).statusWarn;
    refs.summary.value = result.summary;
  }

  refs.copyButton.addEventListener('click', async () => {
    if (!refs.summary.value.trim()) return;
    try {
      await navigator.clipboard.writeText(refs.summary.value);
      alert((TEXT[lang] || TEXT.en).copied);
    } catch (error) {
      alert((TEXT[lang] || TEXT.en).copyFail);
    }
  });

  refs.resetButton.addEventListener('click', () => {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (refs[key]) refs[key].value = value;
    });
    render();
  });

  refs.langButton.addEventListener('click', () => {
    lang = lang === 'en' ? 'ko' : 'en';
    applyI18n();
    render();
  });

  fieldIds.forEach((id) => {
    refs[id].addEventListener('input', render);
  });

  applyI18n();
  refs.resetButton.click();
})(typeof window !== 'undefined' ? window : globalThis);
