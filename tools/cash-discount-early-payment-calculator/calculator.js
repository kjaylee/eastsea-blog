(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.CashDiscountEarlyPaymentCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULTS = {
    monthlyInvoiceVolume: 900000,
    eligibleSharePct: 55,
    projectedAdoptionPct: 45,
    averageInvoiceAmount: 6500,
    discountRatePct: 1,
    processingFeeRatePct: 0.35,
    processingFixedFee: 0.35,
    currentTermsDays: 45,
    earlyPayTermsDays: 20,
    annualCostOfCapitalPct: 16,
    badDebtRatePct: 1.8,
    badDebtReductionPct: 60,
    opsSavings: 250,
    monthlyProgramCost: 650,
    setupCost: 3500,
    months: 12
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      money: 'Money fields must be zero or above.',
      volume: 'Monthly invoice volume must be greater than zero.',
      eligibleShare: 'Eligible invoice share must be between 0 and 100%.',
      adoption: 'Projected adoption must be between 0 and 100%.',
      averageInvoice: 'Average invoice amount must be greater than zero.',
      discountRate: 'Discount rate must be between 0 and 30%.',
      processingRate: 'Processing fee rate must be between 0 and 10%.',
      processingFixed: 'Processing fixed fee must be zero or above.',
      currentTerms: 'Current terms must be between 1 and 180 days.',
      earlyTerms: 'Early-pay terms must be between 0 and 180 days.',
      termsOrder: 'Early-pay terms must be shorter than current terms.',
      annualCost: 'Annual cost of capital must be between 0 and 100%.',
      badDebtRate: 'Bad-debt rate must be between 0 and 20%.',
      badDebtReduction: 'Bad-debt reduction must be between 0 and 100%.',
      months: 'Analysis period must be between 1 and 60 months.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid assumptions to model the program.',
      positive: 'Current assumptions produce positive monthly net impact.',
      negative: 'Current assumptions are negative. Re-check discount, fees, or savings.',
      summaryTitle: '[Cash Discount Early Payment Summary]',
      eligibleVolume: 'Eligible volume',
      adoptedVolume: 'Adopted early-pay volume',
      participatingInvoiceCount: 'Estimated participating invoices',
      discountCost: 'Discount cost',
      processingFees: 'Processing fees',
      financingBenefit: 'Financing benefit',
      badDebtSavings: 'Bad-debt savings',
      grossBenefit: 'Gross monthly benefit',
      monthlyNetImpact: 'Monthly net impact',
      periodNetImpact: 'Period net impact',
      roiPct: 'ROI',
      paybackMonths: 'Payback',
      breakEvenAdoptionPct: 'Break-even adoption',
      totalProgramCost: 'Total program cost',
      capitalReleased: 'Capital released',
      daysAccelerated: 'Days accelerated',
      notAttainable: 'Not attainable',
      noPayback: 'No payback'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      volume: '월 인보이스 발행액은 0보다 커야 합니다.',
      eligibleShare: '대상 비중은 0~100% 범위여야 합니다.',
      adoption: '채택률은 0~100% 범위여야 합니다.',
      averageInvoice: '평균 인보이스 금액은 0보다 커야 합니다.',
      discountRate: '할인율은 0~30% 범위여야 합니다.',
      processingRate: '결제 처리비율은 0~10% 범위여야 합니다.',
      processingFixed: '건당 고정 처리비는 0 이상이어야 합니다.',
      currentTerms: '현재 결제조건은 1~180일 범위여야 합니다.',
      earlyTerms: '조기결제 조건은 0~180일 범위여야 합니다.',
      termsOrder: '조기결제 조건은 현재 결제조건보다 짧아야 합니다.',
      annualCost: '연 자금비용은 0~100% 범위여야 합니다.',
      badDebtRate: '대손률은 0~20% 범위여야 합니다.',
      badDebtReduction: '대손 감소율은 0~100% 범위여야 합니다.',
      months: '분석 기간은 1~60개월 범위여야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '유효한 가정을 입력하면 결과가 계산됩니다.',
      positive: '현재 가정에서는 월 순효과가 플러스입니다.',
      negative: '현재 가정에서는 손익이 음수입니다. 할인율·수수료·절감효과를 다시 점검하세요.',
      summaryTitle: '[조기결제 현금할인 ROI 요약]',
      eligibleVolume: '대상 금액',
      adoptedVolume: '채택 금액',
      participatingInvoiceCount: '참여 인보이스 수',
      discountCost: '할인 비용',
      processingFees: '결제 처리비',
      financingBenefit: '자금비용 절감',
      badDebtSavings: '대손 절감',
      grossBenefit: '총 월 편익',
      monthlyNetImpact: '월 순효과',
      periodNetImpact: '기간 순효과',
      roiPct: 'ROI',
      paybackMonths: '회수기간',
      breakEvenAdoptionPct: '손익분기 채택률',
      totalProgramCost: '총 프로그램 비용',
      capitalReleased: '운전자본 개선액',
      daysAccelerated: '회수 단축 일수',
      notAttainable: '달성 불가',
      noPayback: '회수 불가'
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

  function normalizeInput(source) {
    return {
      monthlyInvoiceVolume: Number(source.monthlyInvoiceVolume),
      eligibleSharePct: Number(source.eligibleSharePct),
      projectedAdoptionPct: Number(source.projectedAdoptionPct),
      averageInvoiceAmount: Number(source.averageInvoiceAmount),
      discountRatePct: Number(source.discountRatePct),
      processingFeeRatePct: Number(source.processingFeeRatePct),
      processingFixedFee: Number(source.processingFixedFee),
      currentTermsDays: Number(source.currentTermsDays),
      earlyPayTermsDays: Number(source.earlyPayTermsDays),
      annualCostOfCapitalPct: Number(source.annualCostOfCapitalPct),
      badDebtRatePct: Number(source.badDebtRatePct),
      badDebtReductionPct: Number(source.badDebtReductionPct),
      opsSavings: Number(source.opsSavings),
      monthlyProgramCost: Number(source.monthlyProgramCost),
      setupCost: Number(source.setupCost),
      months: Number(source.months)
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.monthlyInvoiceVolume,
      input.averageInvoiceAmount,
      input.processingFixedFee,
      input.opsSavings,
      input.monthlyProgramCost,
      input.setupCost
    ];

    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.money;
    }
    if (!Number.isFinite(input.monthlyInvoiceVolume) || input.monthlyInvoiceVolume <= 0) {
      return t.volume;
    }
    if (!Number.isFinite(input.eligibleSharePct) || input.eligibleSharePct < 0 || input.eligibleSharePct > 100) {
      return t.eligibleShare;
    }
    if (!Number.isFinite(input.projectedAdoptionPct) || input.projectedAdoptionPct < 0 || input.projectedAdoptionPct > 100) {
      return t.adoption;
    }
    if (!Number.isFinite(input.averageInvoiceAmount) || input.averageInvoiceAmount <= 0) {
      return t.averageInvoice;
    }
    if (!Number.isFinite(input.discountRatePct) || input.discountRatePct < 0 || input.discountRatePct > 30) {
      return t.discountRate;
    }
    if (!Number.isFinite(input.processingFeeRatePct) || input.processingFeeRatePct < 0 || input.processingFeeRatePct > 10) {
      return t.processingRate;
    }
    if (!Number.isFinite(input.processingFixedFee) || input.processingFixedFee < 0) {
      return t.processingFixed;
    }
    if (!Number.isFinite(input.currentTermsDays) || input.currentTermsDays < 1 || input.currentTermsDays > 180) {
      return t.currentTerms;
    }
    if (!Number.isFinite(input.earlyPayTermsDays) || input.earlyPayTermsDays < 0 || input.earlyPayTermsDays > 180) {
      return t.earlyTerms;
    }
    if (input.earlyPayTermsDays >= input.currentTermsDays) {
      return t.termsOrder;
    }
    if (!Number.isFinite(input.annualCostOfCapitalPct) || input.annualCostOfCapitalPct < 0 || input.annualCostOfCapitalPct > 100) {
      return t.annualCost;
    }
    if (!Number.isFinite(input.badDebtRatePct) || input.badDebtRatePct < 0 || input.badDebtRatePct > 20) {
      return t.badDebtRate;
    }
    if (!Number.isFinite(input.badDebtReductionPct) || input.badDebtReductionPct < 0 || input.badDebtReductionPct > 100) {
      return t.badDebtReduction;
    }
    if (!Number.isFinite(input.months) || input.months < 1 || input.months > 60) {
      return t.months;
    }
    return '';
  }

  function computeScenario(input) {
    const eligibleShare = input.eligibleSharePct / 100;
    const projectedAdoption = input.projectedAdoptionPct / 100;
    const discountRate = input.discountRatePct / 100;
    const processingFeeRate = input.processingFeeRatePct / 100;
    const annualCostOfCapital = input.annualCostOfCapitalPct / 100;
    const badDebtRate = input.badDebtRatePct / 100;
    const badDebtReduction = input.badDebtReductionPct / 100;
    const daysAccelerated = input.currentTermsDays - input.earlyPayTermsDays;

    const eligibleVolume = input.monthlyInvoiceVolume * eligibleShare;
    const adoptedVolume = eligibleVolume * projectedAdoption;
    const participatingInvoiceCount = adoptedVolume / input.averageInvoiceAmount;
    const discountCost = adoptedVolume * discountRate;
    const processingFees = (adoptedVolume * processingFeeRate) + (participatingInvoiceCount * input.processingFixedFee);
    const financingBenefit = adoptedVolume * annualCostOfCapital * daysAccelerated / 365;
    const badDebtSavings = adoptedVolume * badDebtRate * badDebtReduction;
    const grossBenefit = financingBenefit + badDebtSavings + input.opsSavings;
    const monthlyNetImpact = grossBenefit - discountCost - processingFees - input.monthlyProgramCost;
    const capitalReleased = adoptedVolume * daysAccelerated / 30;
    const totalProgramCost = ((discountCost + processingFees + input.monthlyProgramCost) * input.months) + input.setupCost;
    const periodNetImpact = (monthlyNetImpact * input.months) - input.setupCost;
    const roiPct = totalProgramCost > 0 ? (periodNetImpact / totalProgramCost) * 100 : (periodNetImpact >= 0 ? Infinity : -Infinity);
    const paybackMonths = monthlyNetImpact > 0 ? input.setupCost / monthlyNetImpact : null;

    const contributionPerAdoptedDollar = (
      (annualCostOfCapital * daysAccelerated / 365) +
      (badDebtRate * badDebtReduction) -
      discountRate -
      processingFeeRate -
      (input.processingFixedFee / input.averageInvoiceAmount)
    );

    let breakEvenAdoptionPct = null;
    if (eligibleVolume > 0 && contributionPerAdoptedDollar > 0) {
      breakEvenAdoptionPct = ((input.monthlyProgramCost - input.opsSavings) / (eligibleVolume * contributionPerAdoptedDollar)) * 100;
      if (breakEvenAdoptionPct < 0) {
        breakEvenAdoptionPct = 0;
      }
    }

    return {
      eligibleVolume,
      adoptedVolume,
      participatingInvoiceCount,
      discountCost,
      processingFees,
      financingBenefit,
      badDebtSavings,
      grossBenefit,
      monthlyNetImpact,
      periodNetImpact,
      roiPct,
      paybackMonths,
      breakEvenAdoptionPct,
      capitalReleased,
      daysAccelerated,
      totalProgramCost,
      contributionPerAdoptedDollar
    };
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

  function formatNumber(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function buildSummary(inputs, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.eligibleVolume}: ${formatMoney(result.eligibleVolume, lang)}`,
      `${t.adoptedVolume}: ${formatMoney(result.adoptedVolume, lang)}`,
      `${t.participatingInvoiceCount}: ${formatNumber(result.participatingInvoiceCount, lang)}`,
      `${t.discountCost}: ${formatMoney(result.discountCost, lang)}`,
      `${t.processingFees}: ${formatMoney(result.processingFees, lang)}`,
      `${t.financingBenefit}: ${formatMoney(result.financingBenefit, lang)}`,
      `${t.badDebtSavings}: ${formatMoney(result.badDebtSavings, lang)}`,
      `${t.grossBenefit}: ${formatMoney(result.grossBenefit, lang)}`,
      `${t.monthlyNetImpact}: ${formatMoney(result.monthlyNetImpact, lang)}`,
      `${t.periodNetImpact}: ${formatMoney(result.periodNetImpact, lang)}`,
      `${t.roiPct}: ${Number.isFinite(result.roiPct) ? formatPercent(result.roiPct, lang) : (result.roiPct > 0 ? '∞' : '-∞')}`,
      `${t.paybackMonths}: ${result.paybackMonths == null ? t.noPayback : `${formatNumber(result.paybackMonths, lang)} mo`}`,
      `${t.breakEvenAdoptionPct}: ${result.breakEvenAdoptionPct == null || result.breakEvenAdoptionPct > 100 ? t.notAttainable : formatPercent(result.breakEvenAdoptionPct, lang)}`,
      `${t.totalProgramCost}: ${formatMoney(result.totalProgramCost, lang)}`,
      `${t.capitalReleased}: ${formatMoney(result.capitalReleased, lang)}`,
      `${t.daysAccelerated}: ${formatNumber(result.daysAccelerated, lang)}`
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { error, result: null };
    }

    const scenario = computeScenario(normalized);
    const result = {
      ...scenario,
      eligibleVolume: round2(scenario.eligibleVolume),
      adoptedVolume: round2(scenario.adoptedVolume),
      participatingInvoiceCount: round4(scenario.participatingInvoiceCount),
      discountCost: round2(scenario.discountCost),
      processingFees: round2(scenario.processingFees),
      financingBenefit: round2(scenario.financingBenefit),
      badDebtSavings: round2(scenario.badDebtSavings),
      grossBenefit: round2(scenario.grossBenefit),
      monthlyNetImpact: round2(scenario.monthlyNetImpact),
      periodNetImpact: round2(scenario.periodNetImpact),
      roiPct: Number.isFinite(scenario.roiPct) ? round2(scenario.roiPct) : scenario.roiPct,
      paybackMonths: scenario.paybackMonths == null ? null : round2(scenario.paybackMonths),
      breakEvenAdoptionPct: scenario.breakEvenAdoptionPct == null ? null : round2(scenario.breakEvenAdoptionPct),
      capitalReleased: round2(scenario.capitalReleased),
      totalProgramCost: round2(scenario.totalProgramCost),
      contributionPerAdoptedDollar: round4(scenario.contributionPerAdoptedDollar)
    };
    result.summary = buildSummary(normalized, result, lang);
    return { error: '', result };
  }

  function initCalculator() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      monthlyInvoiceVolume: document.getElementById('monthlyInvoiceVolume'),
      eligibleSharePct: document.getElementById('eligibleSharePct'),
      projectedAdoptionPct: document.getElementById('projectedAdoptionPct'),
      averageInvoiceAmount: document.getElementById('averageInvoiceAmount'),
      discountRatePct: document.getElementById('discountRatePct'),
      processingFeeRatePct: document.getElementById('processingFeeRatePct'),
      processingFixedFee: document.getElementById('processingFixedFee'),
      currentTermsDays: document.getElementById('currentTermsDays'),
      earlyPayTermsDays: document.getElementById('earlyPayTermsDays'),
      annualCostOfCapitalPct: document.getElementById('annualCostOfCapitalPct'),
      badDebtRatePct: document.getElementById('badDebtRatePct'),
      badDebtReductionPct: document.getElementById('badDebtReductionPct'),
      opsSavings: document.getElementById('opsSavings'),
      monthlyProgramCost: document.getElementById('monthlyProgramCost'),
      setupCost: document.getElementById('setupCost'),
      months: document.getElementById('months'),
      eligibleVolume: document.getElementById('eligibleVolume'),
      adoptedVolume: document.getElementById('adoptedVolume'),
      monthlyNetImpact: document.getElementById('monthlyNetImpact'),
      periodNetImpact: document.getElementById('periodNetImpact'),
      roiPct: document.getElementById('roiPct'),
      breakEvenAdoptionPct: document.getElementById('breakEvenAdoptionPct'),
      participatingInvoiceCount: document.getElementById('participatingInvoiceCount'),
      paybackMonths: document.getElementById('paybackMonths'),
      discountCost: document.getElementById('discountCost'),
      processingFees: document.getElementById('processingFees'),
      financingBenefit: document.getElementById('financingBenefit'),
      badDebtSavings: document.getElementById('badDebtSavings'),
      grossBenefit: document.getElementById('grossBenefit'),
      capitalReleased: document.getElementById('capitalReleased'),
      daysAccelerated: document.getElementById('daysAccelerated'),
      totalProgramCost: document.getElementById('totalProgramCost'),
      summary: document.getElementById('summary'),
      status: document.getElementById('status'),
      error: document.getElementById('error'),
      langBtn: document.getElementById('langBtn'),
      copySummary: document.getElementById('copySummary'),
      resetDefaults: document.getElementById('resetDefaults')
    };

    const translatables = Array.from(document.querySelectorAll('[data-en][data-ko]'));
    let currentLang = 'en';

    function readInput() {
      return {
        monthlyInvoiceVolume: refs.monthlyInvoiceVolume.value,
        eligibleSharePct: refs.eligibleSharePct.value,
        projectedAdoptionPct: refs.projectedAdoptionPct.value,
        averageInvoiceAmount: refs.averageInvoiceAmount.value,
        discountRatePct: refs.discountRatePct.value,
        processingFeeRatePct: refs.processingFeeRatePct.value,
        processingFixedFee: refs.processingFixedFee.value,
        currentTermsDays: refs.currentTermsDays.value,
        earlyPayTermsDays: refs.earlyPayTermsDays.value,
        annualCostOfCapitalPct: refs.annualCostOfCapitalPct.value,
        badDebtRatePct: refs.badDebtRatePct.value,
        badDebtReductionPct: refs.badDebtReductionPct.value,
        opsSavings: refs.opsSavings.value,
        monthlyProgramCost: refs.monthlyProgramCost.value,
        setupCost: refs.setupCost.value,
        months: refs.months.value
      };
    }

    function resetOutputs() {
      [
        'eligibleVolume',
        'adoptedVolume',
        'monthlyNetImpact',
        'periodNetImpact',
        'roiPct',
        'breakEvenAdoptionPct',
        'participatingInvoiceCount',
        'paybackMonths',
        'discountCost',
        'processingFees',
        'financingBenefit',
        'badDebtSavings',
        'grossBenefit',
        'capitalReleased',
        'daysAccelerated',
        'totalProgramCost'
      ].forEach((key) => {
        refs[key].textContent = '-';
      });
      refs.summary.value = '';
    }

    function applyLanguage() {
      translatables.forEach((node) => {
        node.textContent = node.dataset[currentLang];
      });
      refs.langBtn.textContent = currentLang === 'en' ? 'KR' : 'EN';
      refs.copySummary.textContent = currentLang === 'en' ? 'Copy summary / 요약 복사' : '요약 복사 / Copy summary';
      refs.resetDefaults.textContent = currentLang === 'en' ? 'Reset / 초기화' : '초기화 / Reset';
      render();
    }

    function render() {
      const t = TEXT[currentLang] || TEXT.en;
      const { error, result } = calculate(readInput(), { lang: currentLang });
      refs.error.classList.toggle('show', Boolean(error));
      refs.error.textContent = error;

      if (error || !result) {
        refs.status.className = 'status';
        refs.status.textContent = error || t.waiting;
        resetOutputs();
        return;
      }

      refs.eligibleVolume.textContent = formatMoney(result.eligibleVolume, currentLang);
      refs.adoptedVolume.textContent = formatMoney(result.adoptedVolume, currentLang);
      refs.monthlyNetImpact.textContent = formatMoney(result.monthlyNetImpact, currentLang);
      refs.periodNetImpact.textContent = formatMoney(result.periodNetImpact, currentLang);
      refs.roiPct.textContent = Number.isFinite(result.roiPct) ? formatPercent(result.roiPct, currentLang) : (result.roiPct > 0 ? '∞' : '-∞');
      refs.breakEvenAdoptionPct.textContent = result.breakEvenAdoptionPct == null || result.breakEvenAdoptionPct > 100
        ? t.notAttainable
        : formatPercent(result.breakEvenAdoptionPct, currentLang);
      refs.participatingInvoiceCount.textContent = formatNumber(result.participatingInvoiceCount, currentLang);
      refs.paybackMonths.textContent = result.paybackMonths == null
        ? t.noPayback
        : `${formatNumber(result.paybackMonths, currentLang)} mo`;
      refs.discountCost.textContent = formatMoney(result.discountCost, currentLang);
      refs.processingFees.textContent = formatMoney(result.processingFees, currentLang);
      refs.financingBenefit.textContent = formatMoney(result.financingBenefit, currentLang);
      refs.badDebtSavings.textContent = formatMoney(result.badDebtSavings, currentLang);
      refs.grossBenefit.textContent = formatMoney(result.grossBenefit, currentLang);
      refs.capitalReleased.textContent = formatMoney(result.capitalReleased, currentLang);
      refs.daysAccelerated.textContent = formatNumber(result.daysAccelerated, currentLang);
      refs.totalProgramCost.textContent = formatMoney(result.totalProgramCost, currentLang);
      refs.summary.value = result.summary;

      refs.status.className = `status ${result.monthlyNetImpact >= 0 ? 'good' : 'bad'}`;
      refs.status.textContent = result.monthlyNetImpact >= 0 ? t.positive : t.negative;
    }

    Object.keys(DEFAULTS).forEach((key) => {
      refs[key].addEventListener('input', render);
      refs[key].addEventListener('change', render);
    });

    refs.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyLanguage();
    });

    refs.resetDefaults.addEventListener('click', () => {
      Object.entries(DEFAULTS).forEach(([key, value]) => {
        refs[key].value = value;
      });
      render();
    });

    refs.copySummary.addEventListener('click', async () => {
      const t = TEXT[currentLang] || TEXT.en;
      if (!refs.summary.value.trim()) {
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.className = 'status good';
        refs.status.textContent = t.copied;
      } catch (error) {
        refs.status.className = 'status bad';
        refs.status.textContent = t.copyFail;
      }
    });

    applyLanguage();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
      initCalculator();
    }
  }

  return {
    DEFAULTS,
    TEXT,
    normalizeInput,
    validate,
    computeScenario,
    calculate,
    formatMoney,
    formatPercent
  };
});

