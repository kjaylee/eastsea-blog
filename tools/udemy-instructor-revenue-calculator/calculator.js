(function (root) {
  const CHANNEL_RATES = {
    instructorPromoPct: 97,
    marketplacePct: 37,
    partnerPct: 25,
    subscriptionPoolPct: 15
  };

  const DEFAULTS = {
    instructorPromoNetSales: 4000,
    marketplaceNetSales: 2500,
    partnerNetSales: 800,
    partnerSharePct: CHANNEL_RATES.partnerPct,
    subscriptionRevenue: 250000,
    subscriptionPoolPct: CHANNEL_RATES.subscriptionPoolPct,
    minutesSharePct: 1.2,
    otherMonthlyCost: 300,
    targetMonthlyTakeHome: 6500
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      money: 'Money inputs must be 0 or above.',
      rate: 'Rate inputs must be 0 or above and below 100%.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter inputs to estimate Udemy instructor take-home.',
      onTarget: 'Current scenario already reaches the target monthly take-home.',
      offTarget: 'Current scenario is below the target. The extra instructor-promo sales estimate assumes the same 97% share.',
      summaryTitle: '[Udemy Instructor Revenue Summary]',
      na: 'N/A'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 0 이상이어야 합니다.',
      rate: '비율 입력값은 0 이상 100 미만이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '입력값을 넣으면 Udemy 강사 순수익 추정치가 표시됩니다.',
      onTarget: '현재 시나리오는 이미 목표 월 순수익에 도달합니다.',
      offTarget: '현재 시나리오는 목표보다 낮습니다. 추가 필요 매출은 97% 강사 프로모션 share를 기준으로 계산합니다.',
      summaryTitle: '[Udemy 강사 수익 요약]',
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

  function normalizeInput(raw) {
    return {
      instructorPromoNetSales: Number(raw.instructorPromoNetSales),
      marketplaceNetSales: Number(raw.marketplaceNetSales),
      partnerNetSales: Number(raw.partnerNetSales),
      partnerSharePct: Number(raw.partnerSharePct),
      subscriptionRevenue: Number(raw.subscriptionRevenue),
      subscriptionPoolPct: Number(raw.subscriptionPoolPct),
      minutesSharePct: Number(raw.minutesSharePct),
      otherMonthlyCost: Number(raw.otherMonthlyCost),
      targetMonthlyTakeHome: Number(raw.targetMonthlyTakeHome)
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.instructorPromoNetSales,
      input.marketplaceNetSales,
      input.partnerNetSales,
      input.subscriptionRevenue,
      input.otherMonthlyCost,
      input.targetMonthlyTakeHome
    ];
    const rateFields = [
      input.partnerSharePct,
      input.subscriptionPoolPct,
      input.minutesSharePct
    ];

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }

    if (rateFields.some((value) => !Number.isFinite(value) || value < 0 || value >= 100)) {
      return t.rate;
    }

    return '';
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPct(value) {
    return `${round(value, 2).toFixed(2)}%`;
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;

    return [
      t.summaryTitle,
      `${lang === 'ko' ? '강사 프로모션 지급액' : 'Instructor-promo payout'}: ${result.formatted.instructorPromoPayout}`,
      `${lang === 'ko' ? '마켓플레이스 지급액' : 'Marketplace payout'}: ${result.formatted.marketplacePayout}`,
      `${lang === 'ko' ? '파트너 채널 지급액' : 'Partner payout'}: ${result.formatted.partnerPayout}`,
      `${lang === 'ko' ? '구독 풀 지급액' : 'Subscription payout'}: ${result.formatted.subscriptionPayout}`,
      `${lang === 'ko' ? '총 지급액' : 'Total payout'}: ${result.formatted.totalPayout}`,
      `${lang === 'ko' ? '월 순수익' : 'Monthly take-home'}: ${result.formatted.monthlyTakeHome}`,
      `${lang === 'ko' ? '연간 환산 순수익' : 'Annualized take-home'}: ${result.formatted.annualTakeHome}`,
      `${lang === 'ko' ? '블렌디드 지급률' : 'Blended payout rate'}: ${result.formatted.blendedPayoutRatePct}`,
      `${lang === 'ko' ? '목표 달성 추가 강사 프로모션 순매출' : 'Extra instructor-promo net sales for target'}: ${result.formatted.requiredExtraInstructorPromoSales}`
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const opts = options || {};
    const lang = opts.lang || 'en';
    const currency = opts.currency || 'USD';
    const input = normalizeInput(rawInput || DEFAULTS);
    const error = validate(input, lang);

    if (error) {
      return { result: null, error };
    }

    const instructorPromoPayout = round2(input.instructorPromoNetSales * (CHANNEL_RATES.instructorPromoPct / 100));
    const marketplacePayout = round2(input.marketplaceNetSales * (CHANNEL_RATES.marketplacePct / 100));
    const partnerPayout = round2(input.partnerNetSales * (input.partnerSharePct / 100));
    const subscriptionInstructorPool = round2(input.subscriptionRevenue * (input.subscriptionPoolPct / 100));
    const subscriptionPayout = round2(subscriptionInstructorPool * (input.minutesSharePct / 100));
    const totalPayout = round2(instructorPromoPayout + marketplacePayout + partnerPayout + subscriptionPayout);
    const monthlyTakeHome = round2(totalPayout - input.otherMonthlyCost);
    const annualTakeHome = round2(monthlyTakeHome * 12);
    const modeledBase = round2(input.instructorPromoNetSales + input.marketplaceNetSales + input.partnerNetSales + subscriptionInstructorPool);
    const blendedPayoutRatePct = modeledBase > 0 ? round((totalPayout / modeledBase) * 100, 2) : 0;
    const targetGap = round2(Math.max(0, input.targetMonthlyTakeHome - monthlyTakeHome));
    const requiredExtraInstructorPromoSales = round2(targetGap / (CHANNEL_RATES.instructorPromoPct / 100));

    const channelRows = [
      {
        key: 'instructorPromo',
        label: { en: 'Instructor promo · 97%', ko: '강사 프로모션 · 97%' },
        base: input.instructorPromoNetSales,
        payout: instructorPromoPayout,
        mixPct: totalPayout > 0 ? round((instructorPromoPayout / totalPayout) * 100, 2) : 0
      },
      {
        key: 'marketplace',
        label: { en: 'Marketplace · 37%', ko: '마켓플레이스 · 37%' },
        base: input.marketplaceNetSales,
        payout: marketplacePayout,
        mixPct: totalPayout > 0 ? round((marketplacePayout / totalPayout) * 100, 2) : 0
      },
      {
        key: 'partner',
        label: { en: `Partner · ${round(input.partnerSharePct, 2)}%`, ko: `파트너 · ${round(input.partnerSharePct, 2)}%` },
        base: input.partnerNetSales,
        payout: partnerPayout,
        mixPct: totalPayout > 0 ? round((partnerPayout / totalPayout) * 100, 2) : 0
      },
      {
        key: 'subscription',
        label: { en: `Subscription pool · ${round(input.subscriptionPoolPct, 2)}% x ${round(input.minutesSharePct, 2)}%`, ko: `구독 풀 · ${round(input.subscriptionPoolPct, 2)}% x ${round(input.minutesSharePct, 2)}%` },
        base: subscriptionInstructorPool,
        payout: subscriptionPayout,
        mixPct: totalPayout > 0 ? round((subscriptionPayout / totalPayout) * 100, 2) : 0
      }
    ];

    const result = {
      input,
      instructorPromoPayout,
      marketplacePayout,
      partnerPayout,
      subscriptionInstructorPool,
      subscriptionPayout,
      totalPayout,
      monthlyTakeHome,
      annualTakeHome,
      modeledBase,
      blendedPayoutRatePct,
      targetGap,
      requiredExtraInstructorPromoSales,
      channelRows,
      formatted: {
        instructorPromoPayout: formatMoney(instructorPromoPayout, currency),
        marketplacePayout: formatMoney(marketplacePayout, currency),
        partnerPayout: formatMoney(partnerPayout, currency),
        subscriptionPayout: formatMoney(subscriptionPayout, currency),
        totalPayout: formatMoney(totalPayout, currency),
        monthlyTakeHome: formatMoney(monthlyTakeHome, currency),
        annualTakeHome: formatMoney(annualTakeHome, currency),
        modeledBase: formatMoney(modeledBase, currency),
        subscriptionInstructorPool: formatMoney(subscriptionInstructorPool, currency),
        blendedPayoutRatePct: formatPct(blendedPayoutRatePct),
        targetGap: formatMoney(targetGap, currency),
        requiredExtraInstructorPromoSales: formatMoney(requiredExtraInstructorPromoSales, currency)
      }
    };

    result.summary = buildSummary(result, lang);
    return { result, error: '' };
  }

  const api = {
    CHANNEL_RATES,
    DEFAULTS,
    TEXT,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.UdemyInstructorRevenueCalculator = api;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const state = {
    lang: 'en'
  };

  const copy = (value) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return Promise.reject(new Error('clipboard unavailable'));
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    $(id).textContent = value;
  }

  function setFieldValue(id, value) {
    $(id).value = value;
  }

  function getInputValues() {
    return {
      instructorPromoNetSales: $('instructorPromoNetSales').value,
      marketplaceNetSales: $('marketplaceNetSales').value,
      partnerNetSales: $('partnerNetSales').value,
      partnerSharePct: $('partnerSharePct').value,
      subscriptionRevenue: $('subscriptionRevenue').value,
      subscriptionPoolPct: $('subscriptionPoolPct').value,
      minutesSharePct: $('minutesSharePct').value,
      otherMonthlyCost: $('otherMonthlyCost').value,
      targetMonthlyTakeHome: $('targetMonthlyTakeHome').value
    };
  }

  function applyDefaults() {
    Object.keys(DEFAULTS).forEach((key) => {
      setFieldValue(key, DEFAULTS[key]);
    });
  }

  function renderRows(rows) {
    const lang = state.lang;
    $('channelBody').innerHTML = rows.map((row) => `
      <tr>
        <td>${row.label[lang]}</td>
        <td>${formatMoney(row.base, 'USD')}</td>
        <td>${formatMoney(row.payout, 'USD')}</td>
        <td>${formatPct(row.mixPct)}</td>
      </tr>
    `).join('');
  }

  function setStatus(text, isWarn) {
    const node = $('status');
    node.textContent = text;
    node.className = isWarn ? 'status warn' : 'status good';
  }

  function setError(message) {
    const node = $('error');
    if (!message) {
      node.classList.remove('show');
      node.textContent = '';
      return;
    }
    node.textContent = message;
    node.classList.add('show');
  }

  function render() {
    const lang = state.lang;
    const t = TEXT[lang] || TEXT.en;
    const { result, error } = calculate(getInputValues(), { lang, currency: 'USD' });

    setError(error);

    if (error) {
      ['totalPayout', 'monthlyTakeHome', 'annualTakeHome', 'blendedPayoutRatePct', 'modeledBase', 'subscriptionInstructorPool', 'requiredExtraInstructorPromoSales', 'targetGap'].forEach((id) => setText(id, t.na));
      $('summary').value = '';
      $('channelBody').innerHTML = '';
      $('status').textContent = t.invalid;
      $('status').className = 'status warn';
      return;
    }

    setText('totalPayout', result.formatted.totalPayout);
    setText('monthlyTakeHome', result.formatted.monthlyTakeHome);
    setText('annualTakeHome', result.formatted.annualTakeHome);
    setText('blendedPayoutRatePct', result.formatted.blendedPayoutRatePct);
    setText('modeledBase', result.formatted.modeledBase);
    setText('subscriptionInstructorPool', result.formatted.subscriptionInstructorPool);
    setText('requiredExtraInstructorPromoSales', result.formatted.requiredExtraInstructorPromoSales);
    setText('targetGap', result.formatted.targetGap);
    $('summary').value = result.summary;
    renderRows(result.channelRows);
    setStatus(result.targetGap > 0 ? t.offTarget : t.onTarget, result.targetGap > 0);
  }

  function applyTranslations() {
    const dict = {
      en: {
        title: 'Udemy Instructor Revenue Calculator | 유데미 강사 수익 계산기',
        subtitle: 'Model Udemy instructor take-home across instructor promotions, marketplace sales, partner channels, and the Udemy Business / Personal Plan subscription pool.',
        note: 'Official Udemy support articles reviewed on March 27, 2026: instructor promotions 97%, marketplace sales 37%, subscription pool default 15% from January 2026. Partner share stays editable because current public docs do not surface one clean official rate here.',
        inputsTitle: 'Inputs',
        channelTitle: 'Channel breakdown',
        resultsTitle: 'Results',
        assumptionsTitle: 'Assumptions',
        labelInstructorPromo: 'Instructor-promo net sales',
        labelMarketplace: 'Marketplace / organic net sales',
        labelPartner: 'Partner / affiliate net sales',
        labelPartnerShare: 'Partner share (%)',
        labelSubscriptionRevenue: 'Total monthly subscription revenue',
        labelSubscriptionPool: 'Subscription instructor pool (%)',
        labelMinutesShare: 'Your subscription minutes share (%)',
        labelOtherCost: 'Other monthly operating cost',
        labelTarget: 'Target monthly take-home',
        hintNetSales: 'Enter Net Amount style sales before instructor share. Taxes / app-store fees should already be excluded.',
        hintSubscription: 'Scenario input for Udemy Business / Personal Plan. Payout = subscription revenue x pool % x your minutes share %.',
        summaryTitle: 'Summary',
        totalPayout: 'Total payout',
        monthlyTakeHome: 'Monthly take-home',
        annualTakeHome: 'Annualized take-home',
        blendedPayoutRatePct: 'Blended payout rate',
        modeledBase: 'Modeled base',
        subscriptionInstructorPool: 'Subscription instructor pool',
        requiredExtraInstructorPromoSales: 'Extra instructor-promo sales for target',
        targetGap: 'Remaining target gap',
        reset: 'Reset defaults',
        copy: 'Copy summary',
        assumptions1: 'Transactional sales inputs are Net Amount style inputs, based on Udemy’s support language, not raw learner payment totals.',
        assumptions2: 'The partner channel is a planning assumption with an editable share percentage.',
        assumptions3: 'Subscription estimates depend on your scenario for total subscription revenue and your share of minutes consumed.',
        related1: 'Teachable Fee Calculator',
        related2: 'Sellfy Pricing Calculator',
        related3: 'Patreon Net Revenue Calculator',
        rowChannel: 'Channel',
        rowBase: 'Modeled base',
        rowPayout: 'Payout',
        rowMix: 'Mix',
        back: '← Back to tools'
      },
      ko: {
        title: 'Udemy Instructor Revenue Calculator | 유데미 강사 수익 계산기',
        subtitle: '강사 프로모션, 마켓플레이스 판매, 파트너 채널, Udemy Business / Personal Plan 구독 풀까지 반영해 Udemy 강사 실수익을 추정합니다.',
        note: '2026년 3월 27일 기준 Udemy 지원 문서를 반영했습니다. 강사 프로모션 97%, 마켓플레이스 37%, 구독 풀 기본값 15%(2026년 1월 변경) 기준이며, 파트너 채널 비율은 공식 문서의 단일 공개 기준이 명확하지 않아 수정 가능값으로 둡니다.',
        inputsTitle: '입력값',
        channelTitle: '채널별 분해',
        resultsTitle: '결과',
        assumptionsTitle: '가정',
        labelInstructorPromo: '강사 프로모션 순매출',
        labelMarketplace: '마켓플레이스 / 오가닉 순매출',
        labelPartner: '파트너 / 제휴 순매출',
        labelPartnerShare: '파트너 배분율 (%)',
        labelSubscriptionRevenue: '월간 전체 구독 매출',
        labelSubscriptionPool: '구독 강사 풀 비율 (%)',
        labelMinutesShare: '내 분당 점유율 (%)',
        labelOtherCost: '기타 월 운영비',
        labelTarget: '목표 월 순수익',
        hintNetSales: 'Udemy revenue share 적용 전 Net Amount 성격의 순매출을 입력하세요. 세금 / 앱스토어 수수료는 이미 제외된 값이어야 합니다.',
        hintSubscription: 'Udemy Business / Personal Plan 시나리오 입력값입니다. 지급액 = 구독매출 x 강사풀 % x 내 분당 점유율 %.',
        summaryTitle: '요약',
        totalPayout: '총 지급액',
        monthlyTakeHome: '월 순수익',
        annualTakeHome: '연간 환산 순수익',
        blendedPayoutRatePct: '블렌디드 지급률',
        modeledBase: '모델 기준 금액',
        subscriptionInstructorPool: '구독 강사 풀',
        requiredExtraInstructorPromoSales: '목표 달성 추가 강사 프로모션 매출',
        targetGap: '남은 목표 갭',
        reset: '기본값 복원',
        copy: '요약 복사',
        assumptions1: '거래형 매출 입력값은 Udemy 지원 문서의 Net Amount 개념을 따르며, 학습자 결제 총액 그대로가 아닙니다.',
        assumptions2: '파트너 채널은 공식 단일 공개 비율이 명확하지 않아 수정 가능한 planning 값입니다.',
        assumptions3: '구독 추정치는 전체 구독 매출과 내 분당 점유율 가정에 따라 달라집니다.',
        related1: 'Teachable Fee Calculator',
        related2: 'Sellfy Pricing Calculator',
        related3: 'Patreon Net Revenue Calculator',
        rowChannel: '채널',
        rowBase: '기준 금액',
        rowPayout: '지급액',
        rowMix: '비중',
        back: '← 도구 목록으로'
      }
    };

    const copy = dict[state.lang];
    document.documentElement.lang = state.lang;
    document.title = copy.title;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (copy[key]) {
        node.textContent = copy[key];
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach((node) => {
      const key = node.getAttribute('data-i18n-html');
      if (copy[key]) {
        node.innerHTML = copy[key];
      }
    });
    $('langBtn').textContent = state.lang === 'en' ? 'KO' : 'EN';
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyDefaults();
    applyTranslations();
    render();

    document.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', render);
    });

    $('langBtn').addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'ko' : 'en';
      applyTranslations();
      render();
    });

    $('reset').addEventListener('click', () => {
      applyDefaults();
      render();
    });

    $('copy').addEventListener('click', async () => {
      const t = TEXT[state.lang] || TEXT.en;
      try {
        await copy($('summary').value);
        setStatus(t.copied, false);
      } catch (error) {
        setStatus(t.copyFail, true);
      }
    });
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
