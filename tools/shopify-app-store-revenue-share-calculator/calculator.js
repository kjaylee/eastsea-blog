(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ShopifyAppStoreRevenueShareCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const THRESHOLD = 1000000;
  const REVENUE_SHARE_RATE = 0.15;

  const DEFAULT_INPUTS = {
    monthlyGrossRevenue: 25000,
    lifetimeGrossBeforeMonth: 920000,
    refundRate: 3,
    processingFeeRate: 2.9,
    taxReserveRate: 15,
    supportToolingCost: 1800,
    oneTimeRegistrationCost: 19,
    amortizationMonths: 12,
  };

  const FIELD_META = {
    monthlyGrossRevenue: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '이번 달 총매출', en: 'Monthly gross revenue' },
    },
    lifetimeGrossBeforeMonth: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '이번 달 전 누적 총매출', en: 'Lifetime gross before this month' },
    },
    refundRate: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '환불률', en: 'Refund rate' },
    },
    processingFeeRate: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '결제 처리 수수료율', en: 'Processing fee rate' },
    },
    taxReserveRate: {
      type: 'rate',
      minInclusive: 0,
      maxInclusive: 100,
      label: { ko: '세금 준비율', en: 'Tax reserve rate' },
    },
    supportToolingCost: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '월 운영·툴링 비용', en: 'Monthly support & tooling cost' },
    },
    oneTimeRegistrationCost: {
      type: 'number',
      minInclusive: 0,
      label: { ko: '원타임 등록·설정비', en: 'One-time registration/setup cost' },
    },
    amortizationMonths: {
      type: 'integer',
      minInclusive: 1,
      label: { ko: '상각 개월 수', en: 'Amortization months' },
    },
  };

  const UI_TEXT = {
    ko: {
      eyebrow: 'SHOPIFY APP STORE',
      pageTitle: 'Shopify 앱스토어 수익 배분 계산기',
      pageLede: 'Shopify App Store 개발자가 이번 달 총매출과 누적 위치를 넣으면 첫 $1M 0% 구간과 이후 15% 수익 배분, 환불, 처리 수수료, 세금 준비율, 운영비를 반영한 실제 실수령액을 추정합니다.',
      heroNote: '이 도구는 Shopify merchant checkout 수수료 계산기가 아니라 Shopify App Store 개발자 economics 전용 계산기입니다.',
      disclaimer: '세금 준비율은 운영자 계획용 가정치이며 Shopify의 공식 공제 항목이 아닙니다. 실제 정산서는 Shopify Partner / App Store 문서를 확인하세요.',
      formulaStrip: '0% on first $1M lifetime gross → 15% above threshold · 환불/처리 수수료/세금 준비율/운영비 반영',
      backLink: '도구 목록',
      inputHeading: '입력값',
      inputCopy: '이번 달 매출과 누적 매출 위치를 기준으로 App Store 개발자 관점의 take-home을 계산합니다.',
      resultsHeading: '핵심 결과',
      detailHeading: '세부 지표',
      detailCopy: '0% 구간과 15% 구간을 분리해 Shopify revenue share가 언제 실제 비용으로 켜지는지 바로 확인할 수 있습니다.',
      summaryHeading: '복사용 요약',
      summaryCopy: '가격 결정, 메모, 파트너 논의에 바로 붙여 넣을 수 있는 한 문단 요약입니다.',
      copy: '요약 복사',
      reset: '기본값 복원',
      statusReady: '입력값을 넣으면 Shopify App Store 개발자 실수령액을 계산합니다.',
      statusInside: '이번 달 매출이 아직 Shopify App Store 첫 $1M 0% 구간 안에 있습니다.',
      statusCrossing: '이번 달 중 일부 매출이 첫 $1M를 넘어서 15% revenue share가 적용됩니다.',
      statusAbove: '이미 $1M를 넘긴 상태라 이번 달 총매출 전체에 15% revenue share가 적용됩니다.',
      statusProfitable: '현재 가정에서는 월 순이익이 양수입니다.',
      statusNegative: '현재 가정에서는 월 순이익이 음수입니다.',
      copied: '요약을 복사했습니다.',
      copyFailed: '클립보드에 접근할 수 없어 수동 복사가 필요합니다.',
      na: 'N/A',
      summaryTitle: '[Shopify 앱스토어 수익 배분 요약]',
      summaryGross: '이번 달 총매출',
      summaryLifetime: '이번 달 전 누적 총매출',
      summaryBand: '구간 분할',
      summaryShareFee: 'Shopify 수익 배분 수수료',
      summaryRecognized: '환불 반영 인식 매출',
      summaryTotalCost: '총 월 비용',
      summaryNetProfit: '월 순이익',
      summaryBreakEven: '손익분기 월매출',
      notes: {
        inside: '이번 달 매출 전부가 첫 $1M 0% 구간에 있습니다.',
        crossing: '이번 달 매출이 첫 $1M 구간을 일부 초과해 초과분에만 15%가 적용됩니다.',
        above: '이미 임계값을 넘긴 상태라 이번 달 총매출 전부가 15% 구간입니다.',
      },
      kpis: {
        zeroShareBandRevenue: '0% 구간 매출',
        fifteenShareBandRevenue: '15% 구간 매출',
        shopifyRevenueShareFee: 'Shopify 수익 배분 수수료',
        totalCost: '총 월 비용',
        monthlyNetProfit: '월 순이익',
        breakEvenMonthlyGrossRevenue: '손익분기 월매출',
      },
      details: {
        monthlyGrossRevenue: '이번 달 총매출',
        lifetimeGrossBeforeMonth: '이번 달 전 누적 총매출',
        recognizedRevenueAfterRefunds: '환불 반영 인식 매출',
        processingFeeAmount: '결제 처리 수수료',
        taxReserveAmount: '세금 준비 금액',
        supportToolingCost: '운영·툴링 비용',
        amortizedOneTimeCost: '월 상각 등록비',
        effectiveTakeHomeRatePct: '실효 take-home 비율',
      },
      labels: {
        monthlyGrossRevenue: '이번 달 총매출 (USD)',
        lifetimeGrossBeforeMonth: '이번 달 전 누적 총매출 (USD)',
        refundRate: '환불률 (%)',
        processingFeeRate: '결제 처리 수수료율 (%)',
        taxReserveRate: '세금 준비율 (%)',
        supportToolingCost: '월 운영·툴링 비용 (USD)',
        oneTimeRegistrationCost: '원타임 등록·설정비 (USD)',
        amortizationMonths: '상각 개월 수',
      },
      errors: {
        invalidNumber: '{label} 값이 올바르지 않습니다.',
        integerRequired: '{label} 값은 정수여야 합니다.',
        minimum: '{label} 값은 {min} 이상이어야 합니다.',
        maximum: '{label} 값은 {max} 이하여야 합니다.',
      },
    },
    en: {
      eyebrow: 'SHOPIFY APP STORE',
      pageTitle: 'Shopify App Store Revenue Share Calculator',
      pageLede: 'Estimate what a Shopify App Store developer keeps this month after the first $1M 0% band, the 15% revenue-share band above it, refunds, payment processing, tax reserve, and operating cost assumptions.',
      heroNote: 'This is for Shopify App Store developer economics only, not merchant checkout or storefront fees.',
      disclaimer: 'Tax reserve is an owner planning assumption, not an official Shopify deduction. Always verify against Shopify Partner / App Store documentation for real settlement details.',
      formulaStrip: '0% on first $1M lifetime gross → 15% above threshold · plus refunds, processing, tax reserve, and ops costs',
      backLink: 'Back to tools',
      inputHeading: 'Inputs',
      inputCopy: 'Model one month of Shopify App Store developer revenue using your lifetime threshold position and operating assumptions.',
      resultsHeading: 'Key results',
      detailHeading: 'Detail table',
      detailCopy: 'The page separates the 0% band and the 15% band so you can see when revenue share actually turns on.',
      summaryHeading: 'Copy-ready summary',
      summaryCopy: 'Paste this into pricing notes, partner memos, or revenue-planning docs.',
      copy: 'Copy summary',
      reset: 'Reset defaults',
      statusReady: 'Add your inputs to estimate Shopify App Store take-home.',
      statusInside: 'This month still sits fully inside Shopify’s first $1M 0% band.',
      statusCrossing: 'Part of this month crosses the first $1M threshold, so only the overflow is charged 15%.',
      statusAbove: 'You are already above the threshold, so the entire month is charged at 15% revenue share.',
      statusProfitable: 'Monthly net profit is positive under these assumptions.',
      statusNegative: 'Monthly net profit is negative under these assumptions.',
      copied: 'Summary copied.',
      copyFailed: 'Clipboard unavailable. Please copy manually.',
      na: 'N/A',
      summaryTitle: '[Shopify App Store Revenue Share Summary]',
      summaryGross: 'Monthly gross revenue',
      summaryLifetime: 'Lifetime gross before month',
      summaryBand: 'Band split',
      summaryShareFee: 'Shopify revenue-share fee',
      summaryRecognized: 'Recognized revenue after refunds',
      summaryTotalCost: 'Total monthly cost',
      summaryNetProfit: 'Monthly net profit',
      summaryBreakEven: 'Break-even monthly gross revenue',
      notes: {
        inside: 'All current-month revenue still sits inside the first $1M 0% band.',
        crossing: 'This month crosses the first $1M threshold, so only the overflow is charged 15%.',
        above: 'The account is already above threshold, so all current-month gross is in the 15% band.',
      },
      kpis: {
        zeroShareBandRevenue: '0% band revenue',
        fifteenShareBandRevenue: '15% band revenue',
        shopifyRevenueShareFee: 'Shopify revenue-share fee',
        totalCost: 'Total monthly cost',
        monthlyNetProfit: 'Monthly net profit',
        breakEvenMonthlyGrossRevenue: 'Break-even monthly gross',
      },
      details: {
        monthlyGrossRevenue: 'Monthly gross revenue',
        lifetimeGrossBeforeMonth: 'Lifetime gross before month',
        recognizedRevenueAfterRefunds: 'Recognized revenue after refunds',
        processingFeeAmount: 'Processing fee amount',
        taxReserveAmount: 'Tax reserve amount',
        supportToolingCost: 'Support & tooling cost',
        amortizedOneTimeCost: 'Amortized registration cost',
        effectiveTakeHomeRatePct: 'Effective take-home rate',
      },
      labels: {
        monthlyGrossRevenue: 'Monthly gross revenue (USD)',
        lifetimeGrossBeforeMonth: 'Lifetime gross before month (USD)',
        refundRate: 'Refund rate (%)',
        processingFeeRate: 'Processing fee rate (%)',
        taxReserveRate: 'Tax reserve rate (%)',
        supportToolingCost: 'Monthly support & tooling cost (USD)',
        oneTimeRegistrationCost: 'One-time registration/setup cost (USD)',
        amortizationMonths: 'Amortization months',
      },
      errors: {
        invalidNumber: '{label} must be a valid number.',
        integerRequired: '{label} must be an integer.',
        minimum: '{label} must be at least {min}.',
        maximum: '{label} must be at most {max}.',
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
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
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
      const value = toFiniteNumber(source[field]);

      if (value == null) {
        errors.push(interpolate(messages.invalidNumber, { label: label }));
        return;
      }
      if (meta.type === 'integer' && !Number.isInteger(value)) {
        errors.push(interpolate(messages.integerRequired, { label: label }));
        return;
      }
      if (meta.minInclusive != null && !(value >= meta.minInclusive)) {
        errors.push(interpolate(messages.minimum, { label: label, min: meta.minInclusive }));
        return;
      }
      if (meta.maxInclusive != null && !(value <= meta.maxInclusive)) {
        errors.push(interpolate(messages.maximum, { label: label, max: meta.maxInclusive }));
        return;
      }
      values[field] = value;
    });

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }
    return { ok: true, errors: [], values: values };
  }

  function describeBandState(result, lang) {
    const text = UI_TEXT[lang].notes;
    if (result.fifteenShareBandRevenue > 0 && result.zeroShareBandRevenue > 0) {
      return { key: 'crossing', note: text.crossing };
    }
    if (result.fifteenShareBandRevenue > 0) {
      return { key: 'above', note: text.above };
    }
    return { key: 'inside', note: text.inside };
  }

  function buildSummary(values, result, lang) {
    const t = UI_TEXT[lang];
    return [
      t.summaryTitle,
      t.summaryGross + ': ' + formatCurrency(values.monthlyGrossRevenue, lang),
      t.summaryLifetime + ': ' + formatCurrency(values.lifetimeGrossBeforeMonth, lang),
      t.summaryBand + ': 0% ' + formatCurrency(result.zeroShareBandRevenue, lang) + ' / 15% ' + formatCurrency(result.fifteenShareBandRevenue, lang),
      t.summaryShareFee + ': ' + formatCurrency(result.shopifyRevenueShareFee, lang),
      t.summaryRecognized + ': ' + formatCurrency(result.recognizedRevenueAfterRefunds, lang),
      t.summaryTotalCost + ': ' + formatCurrency(result.totalCost, lang),
      t.summaryNetProfit + ': ' + formatCurrency(result.monthlyNetProfit, lang),
      t.summaryBreakEven + ': ' + (result.breakEvenMonthlyGrossRevenue === Infinity ? t.na : formatCurrency(result.breakEvenMonthlyGrossRevenue, lang)),
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const lang = options && options.lang === 'ko' ? 'ko' : 'en';
    const validation = validateInputs(rawInput, lang);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors, input: null, result: null };
    }

    const values = validation.values;
    const gross = values.monthlyGrossRevenue;
    const prior = values.lifetimeGrossBeforeMonth;
    const refund = values.refundRate / 100;
    const proc = values.processingFeeRate / 100;
    const tax = values.taxReserveRate / 100;
    const remainingZeroBand = Math.max(0, THRESHOLD - prior);
    const zeroShareBandRevenue = Math.min(gross, remainingZeroBand);
    const fifteenShareBandRevenue = Math.max(0, gross - zeroShareBandRevenue);
    const recognizedRevenueAfterRefunds = gross * (1 - refund);
    const shopifyRevenueShareFee = fifteenShareBandRevenue * REVENUE_SHARE_RATE;
    const processingFeeAmount = gross * proc;
    const taxReserveAmount = recognizedRevenueAfterRefunds * tax;
    const amortizedOneTimeCost = values.oneTimeRegistrationCost / values.amortizationMonths;
    const totalCost = shopifyRevenueShareFee + processingFeeAmount + taxReserveAmount + values.supportToolingCost + amortizedOneTimeCost;
    const monthlyNetProfit = recognizedRevenueAfterRefunds - totalCost;
    const effectiveTakeHomeRatePct = gross > 0 ? (monthlyNetProfit / gross) * 100 : 0;

    const shareRateAtMargin = prior >= THRESHOLD ? REVENUE_SHARE_RATE : 0;
    const netFactor = (1 - refund) - proc - tax - shareRateAtMargin;
    const fixedLikeCost = values.supportToolingCost + amortizedOneTimeCost;
    const breakEvenMonthlyGrossRevenue = netFactor <= 0 ? Infinity : Math.max(0, fixedLikeCost / netFactor);

    const result = {
      threshold: THRESHOLD,
      zeroShareBandRevenue: roundTo(zeroShareBandRevenue, 10),
      fifteenShareBandRevenue: roundTo(fifteenShareBandRevenue, 10),
      shopifyRevenueShareFee: roundTo(shopifyRevenueShareFee, 10),
      processingFeeAmount: roundTo(processingFeeAmount, 10),
      recognizedRevenueAfterRefunds: roundTo(recognizedRevenueAfterRefunds, 10),
      taxReserveAmount: roundTo(taxReserveAmount, 10),
      amortizedOneTimeCost: roundTo(amortizedOneTimeCost, 10),
      totalCost: roundTo(totalCost, 10),
      monthlyNetProfit: roundTo(monthlyNetProfit, 10),
      effectiveTakeHomeRatePct: roundTo(effectiveTakeHomeRatePct, 10),
      breakEvenMonthlyGrossRevenue: breakEvenMonthlyGrossRevenue === Infinity ? Infinity : roundTo(breakEvenMonthlyGrossRevenue, 10),
      remainingZeroBandBeforeMonth: roundTo(remainingZeroBand, 10),
      thresholdPositionAfterMonth: roundTo(prior + gross, 10),
      netFactor: roundTo(netFactor, 10),
      fixedLikeCost: roundTo(fixedLikeCost, 10),
    };

    const bandState = describeBandState(result, lang);
    result.bandState = bandState.key;
    result.bandNote = bandState.note;
    result.summary = buildSummary(values, result, lang);
    result.profitTone = result.monthlyNetProfit >= 0 ? 'good' : 'warn';

    return { ok: true, errors: [], input: values, result: result };
  }

  function formatCurrency(value, lang) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value, lang, digits) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value) + '%';
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
      disclaimer: document.getElementById('disclaimer'),
      formulaStrip: document.getElementById('formulaStrip'),
      backLink: document.getElementById('backLink'),
      inputHeading: document.getElementById('inputHeading'),
      inputCopy: document.getElementById('inputCopy'),
      resultsHeading: document.getElementById('resultsHeading'),
      detailHeading: document.getElementById('detailHeading'),
      detailCopy: document.getElementById('detailCopy'),
      summaryHeading: document.getElementById('summaryHeading'),
      summaryCopy: document.getElementById('summaryCopy'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
      langBtn: document.getElementById('langBtn'),
      errorBox: document.getElementById('errorBox'),
      bandStatus: document.getElementById('bandStatus'),
      profitStatus: document.getElementById('profitStatus'),
      summaryOutput: document.getElementById('summaryOutput'),
      thresholdNote: document.getElementById('thresholdNote'),
    };

    Object.keys(DEFAULT_INPUTS).forEach(function (field) {
      refs[field] = document.getElementById(field);
    });

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
      refs.disclaimer.textContent = t.disclaimer;
      refs.formulaStrip.textContent = t.formulaStrip;
      refs.backLink.textContent = t.backLink;
      refs.inputHeading.textContent = t.inputHeading;
      refs.inputCopy.textContent = t.inputCopy;
      refs.resultsHeading.textContent = t.resultsHeading;
      refs.detailHeading.textContent = t.detailHeading;
      refs.detailCopy.textContent = t.detailCopy;
      refs.summaryHeading.textContent = t.summaryHeading;
      refs.summaryCopy.textContent = t.summaryCopy;
      refs.copySummaryBtn.textContent = t.copy;
      refs.resetDefaultsBtn.textContent = t.reset;
      refs.langBtn.textContent = currentLang === 'ko' ? 'EN' : 'KO';

      Object.keys(t.labels).forEach(function (key) {
        const label = document.getElementById('label-' + key);
        if (label) {
          label.textContent = t.labels[key];
        }
      });
      Object.keys(t.kpis).forEach(function (key) {
        refs['kpiLabel_' + key].textContent = t.kpis[key];
      });
      Object.keys(t.details).forEach(function (key) {
        refs['detailLabel_' + key].textContent = t.details[key];
      });
    }

    function clearOutputs() {
      Object.keys(UI_TEXT.ko.kpis).forEach(function (key) {
        refs['kpi_' + key].textContent = '-';
      });
      Object.keys(UI_TEXT.ko.details).forEach(function (key) {
        refs['detail_' + key].textContent = '-';
      });
      refs.thresholdNote.textContent = '';
      refs.summaryOutput.value = '';
    }

    function readInputs() {
      const values = {};
      Object.keys(DEFAULT_INPUTS).forEach(function (field) {
        values[field] = refs[field].value;
      });
      return values;
    }

    function render() {
      const t = UI_TEXT[currentLang];
      const outcome = calculate(readInputs(), { lang: currentLang });

      if (!outcome.ok) {
        refs.errorBox.classList.add('show');
        refs.errorBox.textContent = outcome.errors.join(' ');
        refs.bandStatus.className = 'status-pill';
        refs.bandStatus.textContent = t.statusReady;
        refs.profitStatus.className = 'status-pill warn';
        refs.profitStatus.textContent = t.statusNegative;
        clearOutputs();
        return;
      }

      refs.errorBox.classList.remove('show');
      refs.errorBox.textContent = '';

      const result = outcome.result;
      const bandStatusText = result.bandState === 'inside' ? t.statusInside : result.bandState === 'crossing' ? t.statusCrossing : t.statusAbove;
      refs.bandStatus.className = 'status-pill info';
      refs.bandStatus.textContent = bandStatusText;
      refs.profitStatus.className = 'status-pill ' + result.profitTone;
      refs.profitStatus.textContent = result.monthlyNetProfit >= 0 ? t.statusProfitable : t.statusNegative;
      refs.thresholdNote.textContent = result.bandNote;
      refs.summaryOutput.value = result.summary;

      Object.keys(t.kpis).forEach(function (key) {
        const value = result[key];
        refs['kpi_' + key].textContent = key === 'breakEvenMonthlyGrossRevenue'
          ? (value === Infinity ? t.na : formatCurrency(value, currentLang))
          : formatCurrency(value, currentLang);
      });

      refs.detail_monthlyGrossRevenue.textContent = formatCurrency(outcome.input.monthlyGrossRevenue, currentLang);
      refs.detail_lifetimeGrossBeforeMonth.textContent = formatCurrency(outcome.input.lifetimeGrossBeforeMonth, currentLang);
      refs.detail_recognizedRevenueAfterRefunds.textContent = formatCurrency(result.recognizedRevenueAfterRefunds, currentLang);
      refs.detail_processingFeeAmount.textContent = formatCurrency(result.processingFeeAmount, currentLang);
      refs.detail_taxReserveAmount.textContent = formatCurrency(result.taxReserveAmount, currentLang);
      refs.detail_supportToolingCost.textContent = formatCurrency(outcome.input.supportToolingCost, currentLang);
      refs.detail_amortizedOneTimeCost.textContent = formatCurrency(result.amortizedOneTimeCost, currentLang);
      refs.detail_effectiveTakeHomeRatePct.textContent = formatPercent(result.effectiveTakeHomeRatePct, currentLang, 2);
    }

    function resetDefaults() {
      Object.keys(DEFAULT_INPUTS).forEach(function (field) {
        refs[field].value = DEFAULT_INPUTS[field];
      });
      render();
    }

    Object.keys(DEFAULT_INPUTS).forEach(function (field) {
      refs[field].addEventListener('input', render);
      refs[field].addEventListener('change', render);
    });

    refs.langBtn.addEventListener('click', function () {
      currentLang = currentLang === 'ko' ? 'en' : 'ko';
      applyLanguage();
      render();
    });

    refs.resetDefaultsBtn.addEventListener('click', resetDefaults);
    refs.copySummaryBtn.addEventListener('click', function () {
      const text = refs.summaryOutput.value;
      const t = UI_TEXT[currentLang];
      if (!text.trim()) {
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          refs.profitStatus.className = 'status-pill good';
          refs.profitStatus.textContent = t.copied;
        }).catch(function () {
          refs.profitStatus.className = 'status-pill warn';
          refs.profitStatus.textContent = t.copyFailed;
        });
        return;
      }
      refs.profitStatus.className = 'status-pill warn';
      refs.profitStatus.textContent = t.copyFailed;
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
    THRESHOLD: THRESHOLD,
    REVENUE_SHARE_RATE: REVENUE_SHARE_RATE,
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    FIELD_META: FIELD_META,
    UI_TEXT: UI_TEXT,
    validateInputs: validateInputs,
    calculate: calculate,
  };
});
