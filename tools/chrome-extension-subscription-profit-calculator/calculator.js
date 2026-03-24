(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ChromeExtensionSubscriptionProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    storeVisitors: 18000,
    visitToInstallRatePct: 12,
    installToTrialRatePct: 35,
    trialToPaidRatePct: 28,
    currentPaidSubscribers: 540,
    monthlyPrice: 9.99,
    monthlyChurnRatePct: 4.8,
    processingFeeRatePct: 3.2,
    paymentFlatFee: 0.30,
    apiCostPerPaidSubscriber: 0.45,
    supportCostPerPaidSubscriber: 0.65,
    fixedMonthlyCosts: 3200,
    oneTimeBuildCost: 18000,
  };

  const FIELD_META = {
    storeVisitors: {
      type: 'integer',
      minInclusive: 0,
      label: { ko: '월간 스토어 방문자', en: 'Monthly store visitors' },
    },
    visitToInstallRatePct: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '방문 → 설치율', en: 'Visit to install rate' },
    },
    installToTrialRatePct: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '설치 → 체험 전환율', en: 'Install to trial rate' },
    },
    trialToPaidRatePct: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '체험 → 유료 전환율', en: 'Trial to paid rate' },
    },
    currentPaidSubscribers: {
      type: 'integer',
      minInclusive: 0,
      label: { ko: '현재 유료 구독자', en: 'Current paid subscribers' },
    },
    monthlyPrice: {
      type: 'number',
      minExclusive: 0,
      label: { ko: '월 구독 가격', en: 'Monthly subscription price' },
    },
    monthlyChurnRatePct: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '월 churn', en: 'Monthly churn rate' },
    },
    processingFeeRatePct: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '결제 수수료율', en: 'Payment processing fee rate' },
    },
    paymentFlatFee: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '결제 고정 수수료', en: 'Payment flat fee per subscriber' },
    },
    apiCostPerPaidSubscriber: {
      type: 'number',
      minInclusive: 0,
      label: { ko: 'API / infra 비용', en: 'API / infra cost per paid subscriber' },
    },
    supportCostPerPaidSubscriber: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '지원 비용', en: 'Support cost per paid subscriber' },
    },
    fixedMonthlyCosts: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '월 고정비', en: 'Fixed monthly costs' },
    },
    oneTimeBuildCost: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '초기 구축비', en: 'One-time build cost' },
    },
  };

  const UI_TEXT = {
    ko: {
      eyebrow: 'EXTENSION MRR',
      pageTitle: '크롬 익스텐션 구독 수익 계산기',
      pageLede: 'Chrome Web Store 방문자부터 설치, 체험, 유료 전환, churn, 결제 수수료, 운영비까지 한 번에 넣어 브라우저 확장 프로그램의 실제 순 MRR을 확인하세요.',
      heroNote: '현재 유료 구독자 기반에 월 churn을 먼저 적용한 뒤 신규 유료 전환을 더해 월말 구독자와 순 MRR을 계산합니다.',
      backLink: '도구 목록',
      inputHeading: '입력값',
      inputCopy: '브라우저 확장 프로그램의 스토어 퍼널과 비용 구조를 넣으면 월말 유료 구독자, 순 MRR, 손익분기 방문자를 계산합니다.',
      detailHeading: '세부 지표',
      detailCopy: '구독자 churn, 결제 수수료, 변수 비용, 연환산 런레이트까지 함께 확인해 실제 브라우저 확장 프로그램 수익성을 점검하세요.',
      summaryHeading: '복사용 요약',
      summaryCopy: '팀 문서, 투자 메모, pricing 검토 노트에 바로 붙여 넣을 수 있는 짧은 요약입니다.',
      copy: '요약 복사',
      reset: '기본값 복원',
      statusReady: '입력값을 반영하면 순 MRR이 계산됩니다.',
      statusPositive: '현재 가정에서는 확장 프로그램 구독이 월 고정비를 넘기고 있습니다.',
      statusNegative: '현재 가정에서는 아직 월 고정비를 회수하지 못합니다.',
      copied: '요약을 복사했습니다.',
      copyFailed: '클립보드에 접근할 수 없어 수동 복사가 필요합니다.',
      na: 'N/A',
      monthsSuffix: '개월',
      summaryTitle: '[크롬 익스텐션 구독 수익 요약]',
      summaryFunnel: '퍼널',
      summaryEndingPaid: '월말 유료 구독자',
      summaryGrossMrr: 'Gross MRR',
      summaryNetMrr: 'Net MRR',
      summaryBreakEvenVisitors: '손익분기 월 방문자',
      summaryPaybackMonths: '회수기간',
      summaryRateInstall: '설치율',
      summaryRateTrial: '체험율',
      summaryRatePaid: '유료 전환율',
      kpis: {
        newInstalls: '신규 설치 / 월',
        newPaidSubscribers: '신규 유료 구독자 / 월',
        endingPaidSubscribers: '월말 유료 구독자',
        grossMrr: 'Gross MRR',
        netMrr: 'Net MRR',
        paybackMonths: '회수기간',
      },
      details: {
        churnedSubscribers: '이탈 구독자 / 월',
        processingFees: '결제 수수료',
        variableServiceCost: '변동 서비스 비용',
        annualizedNetRunRate: '연환산 순 런레이트',
        breakEvenVisitors: '손익분기 월 방문자',
        contributionMarginPerPaid: '유료 구독자당 공헌이익',
      },
      errors: {
        invalidNumber: '{label} 값이 올바르지 않습니다.',
        integerRequired: '{label} 값은 0 이상의 정수여야 합니다.',
        minimum: '{label} 값은 {min} 이상이어야 합니다.',
        greaterThan: '{label} 값은 {min}보다 커야 합니다.',
        maximum: '{label} 값은 {max} 이하여야 합니다.',
        emptyFunnel: '월간 스토어 방문자 또는 현재 유료 구독자 중 하나는 0보다 커야 합니다.',
      },
    },
    en: {
      eyebrow: 'EXTENSION MRR',
      pageTitle: 'Chrome Extension Subscription Profit Calculator',
      pageLede: 'Model the path from Chrome Web Store traffic to installs, trials, paid subscribers, churn, fees, and ops costs so you can see the real net MRR of a browser extension.',
      heroNote: 'The calculator applies churn to the current paid base first, then adds new paid subscribers to estimate ending subscribers and net MRR.',
      backLink: 'Back to tools',
      inputHeading: 'Inputs',
      inputCopy: 'Enter your browser extension store funnel and cost stack to estimate ending paid subscribers, net MRR, and break-even monthly store visitors.',
      detailHeading: 'Detail table',
      detailCopy: 'Review churn, payment fees, variable service cost, and annualized run-rate before deciding whether the extension can support a recurring-revenue business.',
      summaryHeading: 'Copy-ready summary',
      summaryCopy: 'Use this short output in docs, pricing notes, or investor memos.',
      copy: 'Copy summary',
      reset: 'Reset defaults',
      statusReady: 'Add your assumptions to estimate extension subscription MRR.',
      statusPositive: 'Under these assumptions, the extension clears monthly fixed cost.',
      statusNegative: 'Under these assumptions, the extension is still below monthly fixed cost.',
      copied: 'Summary copied.',
      copyFailed: 'Clipboard unavailable. Please copy manually.',
      na: 'N/A',
      monthsSuffix: 'months',
      summaryTitle: '[Chrome Extension Subscription Profit Summary]',
      summaryFunnel: 'Funnel',
      summaryEndingPaid: 'Ending paid subscribers',
      summaryGrossMrr: 'Gross MRR',
      summaryNetMrr: 'Net MRR',
      summaryBreakEvenVisitors: 'Break-even monthly store visitors',
      summaryPaybackMonths: 'Payback period',
      summaryRateInstall: 'install rate',
      summaryRateTrial: 'trial rate',
      summaryRatePaid: 'paid conversion',
      kpis: {
        newInstalls: 'New installs / month',
        newPaidSubscribers: 'New paid subscribers / month',
        endingPaidSubscribers: 'Ending paid subscribers',
        grossMrr: 'Gross MRR',
        netMrr: 'Net MRR',
        paybackMonths: 'Payback months',
      },
      details: {
        churnedSubscribers: 'Churned subscribers / month',
        processingFees: 'Processing fees',
        variableServiceCost: 'Variable service cost',
        annualizedNetRunRate: 'Annualized net run-rate',
        breakEvenVisitors: 'Break-even monthly visitors',
        contributionMarginPerPaid: 'Contribution margin per paid subscriber',
      },
      errors: {
        invalidNumber: '{label} must be a valid number.',
        integerRequired: '{label} must be an integer greater than or equal to 0.',
        minimum: '{label} must be at least {min}.',
        greaterThan: '{label} must be greater than {min}.',
        maximum: '{label} must be at most {max}.',
        emptyFunnel: 'Either monthly store visitors or current paid subscribers must be greater than 0.',
      },
    },
  };

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function interpolate(template, values) {
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : '';
    });
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput, lang) {
    const locale = lang === 'ko' ? 'ko' : 'en';
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};
    const messages = UI_TEXT[locale].errors;

    Object.keys(FIELD_META).forEach(function (field) {
      const meta = FIELD_META[field];
      const label = meta.label[locale];
      const num = toFiniteNumber(source[field]);

      if (num == null) {
        errors.push(interpolate(messages.invalidNumber, { label: label }));
        return;
      }

      if (meta.type === 'integer' && !Number.isInteger(num)) {
        errors.push(interpolate(messages.integerRequired, { label: label }));
        return;
      }

      if (meta.minExclusive != null && !(num > meta.minExclusive)) {
        errors.push(interpolate(messages.greaterThan, { label: label, min: meta.minExclusive }));
        return;
      }

      if (meta.minInclusive != null && !(num >= meta.minInclusive)) {
        errors.push(interpolate(messages.minimum, { label: label, min: meta.minInclusive }));
        return;
      }

      if (meta.maxInclusive != null && !(num <= meta.maxInclusive)) {
        errors.push(interpolate(messages.maximum, { label: label, max: meta.maxInclusive }));
        return;
      }

      values[field] = num;
    });

    if (
      Number.isFinite(values.storeVisitors) &&
      Number.isFinite(values.currentPaidSubscribers) &&
      values.storeVisitors === 0 &&
      values.currentPaidSubscribers === 0
    ) {
      errors.push(messages.emptyFunnel);
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function formatCurrency(value, lang) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatCount(value, lang, digits) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  function formatInteger(value, lang) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatMonths(value, lang) {
    const text = UI_TEXT[lang].monthsSuffix;
    return formatCount(value, lang, 1) + ' ' + text;
  }

  function buildSummary(values, result, lang) {
    const t = UI_TEXT[lang];
    return [
      t.summaryTitle,
      t.summaryFunnel + ': ' +
        formatInteger(values.storeVisitors, lang) +
        ' visitors x ' +
        t.summaryRateInstall + ' ' + formatCount(values.visitToInstallRatePct, lang, 1) + '% x ' +
        t.summaryRateTrial + ' ' + formatCount(values.installToTrialRatePct, lang, 1) + '% x ' +
        t.summaryRatePaid + ' ' + formatCount(values.trialToPaidRatePct, lang, 1) + '%',
      t.summaryEndingPaid + ': ' + formatCount(result.endingPaidSubscribers, lang, 1),
      t.summaryGrossMrr + ': ' + formatCurrency(result.grossMrr, lang),
      t.summaryNetMrr + ': ' + formatCurrency(result.netMrr, lang),
      t.summaryBreakEvenVisitors + ': ' + (result.breakEvenVisitors == null ? t.na : formatInteger(result.breakEvenVisitors, lang)),
      t.summaryPaybackMonths + ': ' + (result.paybackMonths == null ? t.na : formatMonths(result.paybackMonths, lang)),
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const lang = options && options.lang === 'ko' ? 'ko' : 'en';
    const validation = validateInputs(rawInput, lang);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        input: null,
        result: null,
      };
    }

    const values = validation.values;
    const visitToInstallRate = values.visitToInstallRatePct / 100;
    const installToTrialRate = values.installToTrialRatePct / 100;
    const trialToPaidRate = values.trialToPaidRatePct / 100;
    const monthlyChurnRate = values.monthlyChurnRatePct / 100;
    const processingRate = values.processingFeeRatePct / 100;

    const newInstalls = values.storeVisitors * visitToInstallRate;
    const newTrials = newInstalls * installToTrialRate;
    const newPaidSubscribers = newTrials * trialToPaidRate;
    const churnedSubscribers = values.currentPaidSubscribers * monthlyChurnRate;
    const endingPaidSubscribers = Math.max(0, values.currentPaidSubscribers - churnedSubscribers + newPaidSubscribers);
    const grossMrr = endingPaidSubscribers * values.monthlyPrice;
    const processingFees = (grossMrr * processingRate) + (endingPaidSubscribers * values.paymentFlatFee);
    const variableServiceCost = endingPaidSubscribers * (values.apiCostPerPaidSubscriber + values.supportCostPerPaidSubscriber);
    const netMrr = grossMrr - processingFees - variableServiceCost - values.fixedMonthlyCosts;
    const annualizedNetRunRate = netMrr * 12;
    const contributionMarginPerPaid =
      (values.monthlyPrice * (1 - processingRate)) -
      values.paymentFlatFee -
      values.apiCostPerPaidSubscriber -
      values.supportCostPerPaidSubscriber;

    const paybackMonths = netMrr > 0 ? values.oneTimeBuildCost / netMrr : null;
    const funnelDenominator = visitToInstallRate * installToTrialRate * trialToPaidRate;
    const breakEvenVisitors = funnelDenominator > 0 && contributionMarginPerPaid > 0
      ? Math.max(
          0,
          ((values.fixedMonthlyCosts / contributionMarginPerPaid) - (values.currentPaidSubscribers * (1 - monthlyChurnRate))) /
            funnelDenominator
        )
      : null;

    const result = {
      newInstalls: roundTo(newInstalls, 10),
      newTrials: roundTo(newTrials, 10),
      newPaidSubscribers: roundTo(newPaidSubscribers, 10),
      churnedSubscribers: roundTo(churnedSubscribers, 10),
      endingPaidSubscribers: roundTo(endingPaidSubscribers, 10),
      grossMrr: roundTo(grossMrr, 10),
      processingFees: roundTo(processingFees, 10),
      variableServiceCost: roundTo(variableServiceCost, 10),
      netMrr: roundTo(netMrr, 10),
      annualizedNetRunRate: roundTo(annualizedNetRunRate, 10),
      contributionMarginPerPaid: roundTo(contributionMarginPerPaid, 10),
      paybackMonths: paybackMonths == null ? null : roundTo(paybackMonths, 10),
      breakEvenVisitors: breakEvenVisitors == null ? null : roundTo(breakEvenVisitors, 10),
    };

    result.summary = buildSummary(values, result, lang);
    result.statusTone = result.netMrr >= 0 ? 'good' : 'warn';

    return {
      ok: true,
      errors: [],
      input: values,
      result: result,
    };
  }

  function attachDomBindings() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      eyebrow: document.getElementById('eyebrow'),
      pageTitle: document.getElementById('pageTitle'),
      pageLede: document.getElementById('pageLede'),
      heroNote: document.getElementById('heroNote'),
      backLink: document.getElementById('backLink'),
      inputHeading: document.getElementById('inputHeading'),
      inputCopy: document.getElementById('inputCopy'),
      detailHeading: document.getElementById('detailHeading'),
      detailCopy: document.getElementById('detailCopy'),
      summaryHeading: document.getElementById('summaryHeading'),
      summaryCopy: document.getElementById('summaryCopy'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
      langBtn: document.getElementById('langBtn'),
      errorBox: document.getElementById('errorBox'),
      statusBadge: document.getElementById('statusBadge'),
      summaryOutput: document.getElementById('summaryOutput'),
      storeVisitors: document.getElementById('storeVisitors'),
      visitToInstallRatePct: document.getElementById('visitToInstallRatePct'),
      installToTrialRatePct: document.getElementById('installToTrialRatePct'),
      trialToPaidRatePct: document.getElementById('trialToPaidRatePct'),
      currentPaidSubscribers: document.getElementById('currentPaidSubscribers'),
      monthlyPrice: document.getElementById('monthlyPrice'),
      monthlyChurnRatePct: document.getElementById('monthlyChurnRatePct'),
      processingFeeRatePct: document.getElementById('processingFeeRatePct'),
      paymentFlatFee: document.getElementById('paymentFlatFee'),
      apiCostPerPaidSubscriber: document.getElementById('apiCostPerPaidSubscriber'),
      supportCostPerPaidSubscriber: document.getElementById('supportCostPerPaidSubscriber'),
      fixedMonthlyCosts: document.getElementById('fixedMonthlyCosts'),
      oneTimeBuildCost: document.getElementById('oneTimeBuildCost'),
    };

    Object.keys(UI_TEXT.ko.kpis).forEach(function (key) {
      refs['kpiLabel_' + key] = document.getElementById('kpiLabel-' + key);
      refs['kpi_' + key] = document.getElementById('kpi-' + key);
    });

    Object.keys(UI_TEXT.ko.details).forEach(function (key) {
      refs['detailLabel_' + key] = document.getElementById('detailLabel-' + key);
      refs['detail_' + key] = document.getElementById('detail-' + key);
    });

    let currentLang = 'ko';

    function applyLanguage() {
      const t = UI_TEXT[currentLang];
      document.documentElement.lang = currentLang;
      refs.eyebrow.textContent = t.eyebrow;
      refs.pageTitle.textContent = t.pageTitle;
      refs.pageLede.textContent = t.pageLede;
      refs.heroNote.textContent = t.heroNote;
      refs.backLink.textContent = t.backLink;
      refs.inputHeading.textContent = t.inputHeading;
      refs.inputCopy.textContent = t.inputCopy;
      refs.detailHeading.textContent = t.detailHeading;
      refs.detailCopy.textContent = t.detailCopy;
      refs.summaryHeading.textContent = t.summaryHeading;
      refs.summaryCopy.textContent = t.summaryCopy;
      refs.copySummaryBtn.textContent = t.copy;
      refs.resetDefaultsBtn.textContent = t.reset;
      refs.langBtn.textContent = currentLang === 'ko' ? 'EN' : 'KO';

      Object.keys(FIELD_META).forEach(function (field) {
        const label = document.getElementById('label-' + field);
        if (label) {
          label.textContent = FIELD_META[field].label[currentLang];
        }
      });

      Object.keys(t.kpis).forEach(function (key) {
        refs['kpiLabel_' + key].textContent = t.kpis[key];
      });

      Object.keys(t.details).forEach(function (key) {
        refs['detailLabel_' + key].textContent = t.details[key];
      });
    }

    function formatValue(key, value) {
      const t = UI_TEXT[currentLang];
      if (value == null) {
        return t.na;
      }
      if (key === 'grossMrr' || key === 'netMrr' || key === 'processingFees' || key === 'variableServiceCost' || key === 'annualizedNetRunRate' || key === 'contributionMarginPerPaid') {
        return formatCurrency(value, currentLang);
      }
      if (key === 'breakEvenVisitors') {
        return formatInteger(value, currentLang);
      }
      if (key === 'paybackMonths') {
        return formatMonths(value, currentLang);
      }
      return formatCount(value, currentLang, 1);
    }

    function readInputValues() {
      const values = {};
      Object.keys(DEFAULT_INPUTS).forEach(function (field) {
        values[field] = refs[field].value;
      });
      return values;
    }

    function render() {
      const outcome = calculate(readInputValues(), { lang: currentLang });
      const t = UI_TEXT[currentLang];

      if (!outcome.ok) {
        refs.errorBox.classList.add('show');
        refs.errorBox.textContent = outcome.errors.join(' ');
        refs.statusBadge.className = 'status warn';
        refs.statusBadge.textContent = t.statusNegative;
        refs.summaryOutput.value = '';
        Object.keys(t.kpis).forEach(function (key) {
          refs['kpi_' + key].textContent = '-';
        });
        Object.keys(t.details).forEach(function (key) {
          refs['detail_' + key].textContent = '-';
        });
        return;
      }

      refs.errorBox.classList.remove('show');
      refs.errorBox.textContent = '';
      refs.summaryOutput.value = outcome.result.summary;
      refs.statusBadge.className = 'status ' + outcome.result.statusTone;
      refs.statusBadge.textContent = outcome.result.netMrr >= 0 ? t.statusPositive : t.statusNegative;

      Object.keys(t.kpis).forEach(function (key) {
        refs['kpi_' + key].textContent = formatValue(key, outcome.result[key]);
      });

      Object.keys(t.details).forEach(function (key) {
        refs['detail_' + key].textContent = formatValue(key, outcome.result[key]);
      });
    }

    function resetDefaults() {
      Object.keys(DEFAULT_INPUTS).forEach(function (field) {
        refs[field].value = DEFAULT_INPUTS[field];
      });
      render();
    }

    Object.keys(DEFAULT_INPUTS).forEach(function (field) {
      refs[field].addEventListener('input', render);
    });

    refs.langBtn.addEventListener('click', function () {
      currentLang = currentLang === 'ko' ? 'en' : 'ko';
      applyLanguage();
      render();
    });

    refs.resetDefaultsBtn.addEventListener('click', resetDefaults);
    refs.copySummaryBtn.addEventListener('click', function () {
      const text = refs.summaryOutput.value;
      if (!text.trim()) {
        return;
      }
      const t = UI_TEXT[currentLang];
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          refs.statusBadge.className = 'status good';
          refs.statusBadge.textContent = t.copied;
        }).catch(function () {
          refs.statusBadge.className = 'status warn';
          refs.statusBadge.textContent = t.copyFailed;
        });
        return;
      }
      refs.statusBadge.className = 'status warn';
      refs.statusBadge.textContent = t.copyFailed;
    });

    applyLanguage();
    resetDefaults();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachDomBindings, { once: true });
    } else {
      attachDomBindings();
    }
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    FIELD_META: FIELD_META,
    UI_TEXT: UI_TEXT,
    validateInputs: validateInputs,
    calculate: calculate,
  };
});
