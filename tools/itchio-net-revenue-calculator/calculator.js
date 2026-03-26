(function (root) {
  const DEFAULTS = {
    minimumPrice: 5,
    unitsSold: 100,
    averageExtraPaid: 1.5,
    itchRevenueShareRate: 10,
    paymentProcessorRate: 2.9,
    paymentProcessorFixedFee: 0.3,
    targetNetRevenue: 1000,
    payoutMode: 'direct-to-you'
  };

  const TEXT = {
    en: {
      title: 'Itch.io Net Revenue Calculator',
      summaryTitle: '[Itch.io Net Revenue Calculator Summary]',
      estimateNote: 'Planning estimate only. Edit the assumptions to match your own itch.io setup.',
      payoutModeNote: 'Payout mode is explanatory only in v1 and does not change the math.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      invalidPrefix: 'Input error',
      statusHealthy: 'Healthy take-home at the current assumptions.',
      statusWarning: 'Low pricing or fixed-fee drag is notable. itch.io commonly recommends pricing around $2 or more.',
      labels: {
        minimumPrice: 'Minimum price',
        unitsSold: 'Units sold',
        averageExtraPaid: 'Average extra paid above minimum',
        itchRevenueShareRate: 'Itch open revenue share (%)',
        paymentProcessorRate: 'Payment processor rate (%)',
        paymentProcessorFixedFee: 'Payment processor fixed fee',
        targetNetRevenue: 'Target net revenue',
        payoutMode: 'Payout mode note'
      },
      payoutModeOptions: {
        'direct-to-you': 'Direct to you',
        'collected-by-itch': 'Collected by itch.io'
      },
      kpis: {
        netRevenue: 'Net revenue',
        takeRate: 'Effective take rate',
        targetMinimum: 'Target minimum price'
      },
      details: {
        averagePaidPrice: 'Average paid price',
        grossRevenue: 'Gross revenue',
        itchFeeTotal: 'Itch fee total',
        processorVariableFee: 'Processor variable fee',
        processorFixedFeeTotal: 'Processor fixed fee total',
        processorFeeTotal: 'Processor fee total',
        totalFees: 'Total fees',
        netRevenuePerSale: 'Net revenue / sale',
        keepRatePct: 'Keep rate',
        fixedFeeDragPct: 'Fixed fee drag vs avg paid price'
      },
      summaryLines: {
        minimumPrice: 'Minimum price',
        averagePaidPrice: 'Average paid price',
        unitsSold: 'Units sold',
        totalFees: 'Total fees',
        netRevenue: 'Net revenue',
        effectiveTakeRatePct: 'Effective take rate',
        targetMinimum: 'Target minimum price',
        payoutMode: 'Payout mode note'
      }
    },
    ko: {
      title: 'Itch.io 순수익 계산기',
      summaryTitle: '[Itch.io 순수익 계산기 요약]',
      estimateNote: '계획용 추정치입니다. 실제 itch.io 설정에 맞게 가정값을 조정하세요.',
      payoutModeNote: '정산 모드 표시는 v1에서 설명용이며 계산값에는 영향을 주지 않습니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없습니다. 수동으로 복사해 주세요.',
      invalidPrefix: '입력 오류',
      statusHealthy: '현재 가정에서는 실수령률이 양호합니다.',
      statusWarning: '낮은 가격 또는 고정 수수료 부담이 큽니다. itch.io는 보통 $2 안팎 이상 가격을 권장합니다.',
      labels: {
        minimumPrice: '최소 가격',
        unitsSold: '판매 수량',
        averageExtraPaid: '최소가 초과 평균 지불액',
        itchRevenueShareRate: 'itch open revenue share (%)',
        paymentProcessorRate: '결제 수수료율 (%)',
        paymentProcessorFixedFee: '결제 고정 수수료',
        targetNetRevenue: '목표 순수익',
        payoutMode: '정산 모드 메모'
      },
      payoutModeOptions: {
        'direct-to-you': '직접 수령',
        'collected-by-itch': 'itch.io 경유 수령'
      },
      kpis: {
        netRevenue: '순수익',
        takeRate: '실효 차감률',
        targetMinimum: '목표 최소 가격'
      },
      details: {
        averagePaidPrice: '평균 결제 가격',
        grossRevenue: '총매출',
        itchFeeTotal: 'itch 수수료 합계',
        processorVariableFee: '변동 결제 수수료',
        processorFixedFeeTotal: '고정 결제 수수료 합계',
        processorFeeTotal: '결제 수수료 합계',
        totalFees: '총수수료',
        netRevenuePerSale: '건당 순수익',
        keepRatePct: '실수령률',
        fixedFeeDragPct: '평균 결제 대비 고정 수수료 비중'
      },
      summaryLines: {
        minimumPrice: '최소 가격',
        averagePaidPrice: '평균 결제 가격',
        unitsSold: '판매 수량',
        totalFees: '총수수료',
        netRevenue: '순수익',
        effectiveTakeRatePct: '실효 차감률',
        targetMinimum: '목표 최소 가격',
        payoutMode: '정산 모드 메모'
      }
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function r2(value) {
    return round(value, 2);
  }

  function numberValue(value, fallback = NaN) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function integerValue(value, fallback = NaN) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : NaN;
  }

  function normalize(input) {
    const source = input || {};
    return {
      minimumPrice: numberValue(source.minimumPrice, DEFAULTS.minimumPrice),
      unitsSold: integerValue(source.unitsSold, DEFAULTS.unitsSold),
      averageExtraPaid: numberValue(source.averageExtraPaid, DEFAULTS.averageExtraPaid),
      itchRevenueShareRate: numberValue(source.itchRevenueShareRate, DEFAULTS.itchRevenueShareRate),
      paymentProcessorRate: numberValue(source.paymentProcessorRate, DEFAULTS.paymentProcessorRate),
      paymentProcessorFixedFee: numberValue(source.paymentProcessorFixedFee, DEFAULTS.paymentProcessorFixedFee),
      targetNetRevenue: numberValue(source.targetNetRevenue, DEFAULTS.targetNetRevenue),
      payoutMode: source.payoutMode === undefined || source.payoutMode === null || source.payoutMode === '' ? DEFAULTS.payoutMode : source.payoutMode
    };
  }

  function validate(input) {
    if (!Number.isFinite(input.minimumPrice) || input.minimumPrice < 0) return 'minimumPrice must be >= 0';
    if (!Number.isFinite(input.unitsSold) || !Number.isInteger(input.unitsSold) || input.unitsSold < 0) return 'unitsSold must be an integer >= 0';
    if (!Number.isFinite(input.averageExtraPaid) || input.averageExtraPaid < 0) return 'averageExtraPaid must be >= 0';
    if (!Number.isFinite(input.itchRevenueShareRate) || input.itchRevenueShareRate < 0 || input.itchRevenueShareRate > 100) return 'itchRevenueShareRate must be 0..100';
    if (!Number.isFinite(input.paymentProcessorRate) || input.paymentProcessorRate < 0 || input.paymentProcessorRate > 100) return 'paymentProcessorRate must be 0..100';
    if (!Number.isFinite(input.paymentProcessorFixedFee) || input.paymentProcessorFixedFee < 0) return 'paymentProcessorFixedFee must be >= 0';
    if (!Number.isFinite(input.targetNetRevenue) || input.targetNetRevenue < 0) return 'targetNetRevenue must be >= 0';
    if (input.payoutMode !== 'direct-to-you' && input.payoutMode !== 'collected-by-itch') return 'payoutMode must be direct-to-you|collected-by-itch';
    return '';
  }

  function formatCurrency(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function formatPercent(value, lang) {
    return `${formatNumber(value, lang, 2)}%`;
  }

  function buildSummary(result, lang) {
    const ui = TEXT[lang] || TEXT.en;
    const lines = ui.summaryLines;
    return [
      ui.summaryTitle,
      `${lines.minimumPrice}: ${formatCurrency(result.inputs.minimumPrice, lang)}`,
      `${lines.averagePaidPrice}: ${formatCurrency(result.averagePaidPrice, lang)}`,
      `${lines.unitsSold}: ${formatNumber(result.inputs.unitsSold, lang, 0)}`,
      `${lines.totalFees}: ${formatCurrency(result.totalFees, lang)}`,
      `${lines.netRevenue}: ${formatCurrency(result.netRevenue, lang)}`,
      `${lines.effectiveTakeRatePct}: ${formatPercent(result.effectiveTakeRatePct, lang)}`,
      `${lines.targetMinimum}: ${Number.isFinite(result.requiredMinimumPriceForTargetNet) ? formatCurrency(result.requiredMinimumPriceForTargetNet, lang) : '—'}`,
      `${lines.payoutMode}: ${ui.payoutModeNote}`,
      ui.estimateNote
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const input = normalize(rawInput);
    const error = validate(input);
    if (error) return { result: null, error };

    const shareRate = input.itchRevenueShareRate / 100;
    const processorRate = input.paymentProcessorRate / 100;

    const averagePaidPriceRaw = input.minimumPrice + input.averageExtraPaid;
    const grossRevenueRaw = input.unitsSold * averagePaidPriceRaw;
    if (!(grossRevenueRaw > 0)) {
      return { result: null, error: 'grossRevenue must be > 0' };
    }

    const keepRateDenominator = 1 - shareRate - processorRate;
    if (input.targetNetRevenue > 0 && keepRateDenominator <= 1e-12) {
      return { result: null, error: 'targetNetRevenue impossible when keep-rate denominator <= 0' };
    }

    const itchFeeTotalRaw = grossRevenueRaw * shareRate;
    const processorVariableFeeRaw = grossRevenueRaw * processorRate;
    const processorFixedFeeTotalRaw = input.unitsSold * input.paymentProcessorFixedFee;
    const processorFeeTotalRaw = processorVariableFeeRaw + processorFixedFeeTotalRaw;
    const totalFeesRaw = itchFeeTotalRaw + processorFeeTotalRaw;
    const netRevenueRaw = grossRevenueRaw - totalFeesRaw;
    const effectiveTakeRatePctRaw = grossRevenueRaw > 0 ? (totalFeesRaw / grossRevenueRaw) * 100 : 0;
    const netRevenuePerSaleRaw = input.unitsSold > 0 ? netRevenueRaw / input.unitsSold : 0;
    const keepRatePctRaw = grossRevenueRaw > 0 ? (netRevenueRaw / grossRevenueRaw) * 100 : 0;
    const fixedFeeDragPctRaw = averagePaidPriceRaw > 0 ? (input.paymentProcessorFixedFee / averagePaidPriceRaw) * 100 : 0;

    let requiredMinimumPriceForTargetNetRaw = 0;
    if (input.targetNetRevenue > 0 && input.unitsSold > 0) {
      requiredMinimumPriceForTargetNetRaw = ((input.targetNetRevenue / input.unitsSold) + input.paymentProcessorFixedFee) / keepRateDenominator - input.averageExtraPaid;
      if (requiredMinimumPriceForTargetNetRaw < 0) requiredMinimumPriceForTargetNetRaw = 0;
    }

    const lowPriceWarning = input.minimumPrice < 2 || (input.paymentProcessorFixedFee > 0 && averagePaidPriceRaw > 0 && (input.paymentProcessorFixedFee / averagePaidPriceRaw) >= 0.10);
    const lang = options && options.lang === 'ko' ? 'ko' : 'en';

    const result = {
      inputs: input,
      averagePaidPrice: r2(averagePaidPriceRaw),
      grossRevenue: r2(grossRevenueRaw),
      itchFeeTotal: r2(itchFeeTotalRaw),
      processorVariableFee: r2(processorVariableFeeRaw),
      processorFixedFeeTotal: r2(processorFixedFeeTotalRaw),
      processorFeeTotal: r2(processorFeeTotalRaw),
      totalFees: r2(totalFeesRaw),
      netRevenue: r2(netRevenueRaw),
      effectiveTakeRatePct: r2(effectiveTakeRatePctRaw),
      keepRatePct: r2(keepRatePctRaw),
      netRevenuePerSale: r2(netRevenuePerSaleRaw),
      fixedFeeDragPct: r2(fixedFeeDragPctRaw),
      requiredMinimumPriceForTargetNet: r2(requiredMinimumPriceForTargetNetRaw),
      lowPriceWarning,
      warningMessage: lowPriceWarning ? (TEXT[lang] || TEXT.en).statusWarning : '',
      summary: ''
    };

    result.summary = buildSummary(result, lang);
    return { result, error: '' };
  }

  const api = { DEFAULTS, TEXT, normalize, validate, calculate, buildSummary };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ItchioNetRevenueCalculator = api;

  if (typeof document === 'undefined') return;

  function $(id) {
    return document.getElementById(id);
  }

  function initBrowser() {
    const refs = {
      html: document.documentElement,
      docTitle: document.querySelector('title'),
      langBtn: $('langBtn'),
      pageTitle: $('pageTitle'),
      pageSubtitle: $('pageSubtitle'),
      disclaimer: $('pageDisclaimer'),
      inputsHeading: $('inputsHeading'),
      totalsHeading: $('totalsHeading'),
      detailsHeading: $('detailsHeading'),
      summaryHeading: $('summaryHeading'),
      assumptionsHeading: $('assumptionsHeading'),
      backLink: $('backLink'),
      copySummary: $('copySummary'),
      resetDefaults: $('resetDefaults'),
      warning: $('warning'),
      status: $('status'),
      summary: $('summary'),
      assumption1: $('assumption1'),
      assumption2: $('assumption2'),
      assumption3: $('assumption3'),
      assumption4: $('assumption4'),
      assumption5: $('assumption5'),
      minimumPrice: $('minimumPrice'),
      unitsSold: $('unitsSold'),
      averageExtraPaid: $('averageExtraPaid'),
      itchRevenueShareRate: $('itchRevenueShareRate'),
      paymentProcessorRate: $('paymentProcessorRate'),
      paymentProcessorFixedFee: $('paymentProcessorFixedFee'),
      targetNetRevenue: $('targetNetRevenue'),
      payoutMode: $('payoutMode'),
      outputs: {
        netRevenue: $('o_netRevenue'),
        effectiveTakeRatePct: $('o_effectiveTakeRatePct'),
        requiredMinimumPriceForTargetNet: $('o_requiredMinimumPriceForTargetNet'),
        averagePaidPrice: $('o_averagePaidPrice'),
        grossRevenue: $('o_grossRevenue'),
        itchFeeTotal: $('o_itchFeeTotal'),
        processorVariableFee: $('o_processorVariableFee'),
        processorFixedFeeTotal: $('o_processorFixedFeeTotal'),
        processorFeeTotal: $('o_processorFeeTotal'),
        totalFees: $('o_totalFees'),
        netRevenuePerSale: $('o_netRevenuePerSale'),
        keepRatePct: $('o_keepRatePct'),
        fixedFeeDragPct: $('o_fixedFeeDragPct')
      }
    };

    const labelIds = [
      'minimumPrice',
      'unitsSold',
      'averageExtraPaid',
      'itchRevenueShareRate',
      'paymentProcessorRate',
      'paymentProcessorFixedFee',
      'targetNetRevenue',
      'payoutMode'
    ];

    const detailIds = [
      'averagePaidPrice',
      'grossRevenue',
      'itchFeeTotal',
      'processorVariableFee',
      'processorFixedFeeTotal',
      'processorFeeTotal',
      'totalFees',
      'netRevenuePerSale',
      'keepRatePct',
      'fixedFeeDragPct'
    ];

    let currentLang = 'en';

    function setDefaults() {
      refs.minimumPrice.value = DEFAULTS.minimumPrice;
      refs.unitsSold.value = DEFAULTS.unitsSold;
      refs.averageExtraPaid.value = DEFAULTS.averageExtraPaid;
      refs.itchRevenueShareRate.value = DEFAULTS.itchRevenueShareRate;
      refs.paymentProcessorRate.value = DEFAULTS.paymentProcessorRate;
      refs.paymentProcessorFixedFee.value = DEFAULTS.paymentProcessorFixedFee;
      refs.targetNetRevenue.value = DEFAULTS.targetNetRevenue;
      refs.payoutMode.value = DEFAULTS.payoutMode;
    }

    function applyStaticText() {
      const ui = TEXT[currentLang] || TEXT.en;
      refs.html.lang = currentLang;
      refs.docTitle.textContent = `${ui.title} | Itch.io Fees, Pay-What-You-Want & Target Price`;
      refs.langBtn.textContent = currentLang === 'en' ? '한국어 보기' : 'View in English';
      refs.pageTitle.textContent = ui.title;
      refs.pageSubtitle.textContent = currentLang === 'en'
        ? 'Estimate real itch.io take-home from open revenue share, pay-what-you-want uplift, processor fees, and your target net goal.'
        : 'open revenue share, 최소가 초과 지불, 결제 수수료, 목표 순수익을 반영해 itch.io 실제 순수익을 계산합니다.';
      refs.disclaimer.textContent = currentLang === 'en'
        ? 'This v1 models itch.io planning assumptions only. Open revenue share is adjustable, average extra paid defaults to $1.50, and payout mode is explanatory copy only.'
        : '이 v1은 itch.io 계획 가정만 모델링합니다. open revenue share는 조정 가능하며, 평균 초과 지불 기본값은 $1.50이고, 정산 모드는 설명용입니다.';
      refs.inputsHeading.textContent = currentLang === 'en' ? 'Inputs' : '입력값';
      refs.totalsHeading.textContent = currentLang === 'en' ? 'Key totals' : '핵심 결과';
      refs.detailsHeading.textContent = currentLang === 'en' ? 'Details' : '상세 계산';
      refs.summaryHeading.textContent = currentLang === 'en' ? 'Summary' : '요약';
      refs.assumptionsHeading.textContent = currentLang === 'en' ? 'Assumptions' : '가정 및 메모';
      refs.backLink.textContent = currentLang === 'en' ? '← Back to tools' : '← 도구로 돌아가기';
      refs.copySummary.textContent = currentLang === 'en' ? 'Copy Summary' : '요약 복사';
      refs.resetDefaults.textContent = currentLang === 'en' ? 'Reset Defaults' : '기본값 복원';
      refs.summary.placeholder = currentLang === 'en'
        ? 'Summary includes minimum price, total fees, net revenue, and take rate.'
        : '최소 가격, 총수수료, 순수익, 차감률 요약이 여기에 표시됩니다.';
      $('kpiNetRevenue').textContent = ui.kpis.netRevenue;
      $('kpiTakeRate').textContent = ui.kpis.takeRate;
      $('kpiTargetMinimum').textContent = ui.kpis.targetMinimum;

      labelIds.forEach((id) => {
        const label = $(`label_${id}`);
        if (label) label.textContent = ui.labels[id];
      });
      detailIds.forEach((id) => {
        const node = $(`detail_${id}`);
        if (node) node.textContent = ui.details[id];
      });

      Array.from(refs.payoutMode.options).forEach((option) => {
        option.textContent = ui.payoutModeOptions[option.value];
      });

      refs.assumption1.textContent = currentLang === 'en'
        ? 'Itch.io uses open revenue sharing, so your itch share can be 0–100%. Docs often show 10% as a planning default.'
        : 'itch.io는 open revenue sharing 구조라서 itch 몫을 0–100%로 조정할 수 있습니다. 문서 예시는 10%를 자주 사용합니다.';
      refs.assumption2.textContent = currentLang === 'en'
        ? 'Processor fees are commonly modeled as 2.9% + $0.30, but they are editable here.'
        : '결제 수수료는 보통 2.9% + $0.30으로 모델링하지만 이 페이지에서는 수정 가능합니다.';
      refs.assumption3.textContent = currentLang === 'en'
        ? 'Pay-what-you-want matters: itch.io says average purchases are about $1.50 above the minimum price.'
        : 'pay-what-you-want가 핵심입니다. itch.io는 평균 결제가 최소 가격보다 약 $1.50 높다고 안내합니다.';
      refs.assumption4.textContent = currentLang === 'en'
        ? 'Itch.io commonly recommends pricing around $2 or more to reduce fixed-fee drag on low-price purchases.'
        : 'itch.io는 낮은 가격대의 고정 수수료 부담을 줄이기 위해 대략 $2 이상 가격을 권장합니다.';
      refs.assumption5.textContent = currentLang === 'en' ? ui.payoutModeNote : ui.payoutModeNote;
    }

    function gather() {
      return {
        minimumPrice: refs.minimumPrice.value,
        unitsSold: refs.unitsSold.value,
        averageExtraPaid: refs.averageExtraPaid.value,
        itchRevenueShareRate: refs.itchRevenueShareRate.value,
        paymentProcessorRate: refs.paymentProcessorRate.value,
        paymentProcessorFixedFee: refs.paymentProcessorFixedFee.value,
        targetNetRevenue: refs.targetNetRevenue.value,
        payoutMode: refs.payoutMode.value
      };
    }

    function clearOutputs() {
      Object.values(refs.outputs).forEach((node) => {
        node.textContent = '—';
      });
      refs.summary.value = '';
    }

    function render() {
      const ui = TEXT[currentLang] || TEXT.en;
      const { result, error } = calculate(gather(), { lang: currentLang });
      if (error) {
        clearOutputs();
        refs.warning.hidden = true;
        refs.status.textContent = `${ui.invalidPrefix}: ${error}`;
        refs.status.className = 'status negative';
        return;
      }

      refs.outputs.netRevenue.textContent = formatCurrency(result.netRevenue, currentLang);
      refs.outputs.effectiveTakeRatePct.textContent = formatPercent(result.effectiveTakeRatePct, currentLang);
      refs.outputs.requiredMinimumPriceForTargetNet.textContent = formatCurrency(result.requiredMinimumPriceForTargetNet, currentLang);
      refs.outputs.averagePaidPrice.textContent = formatCurrency(result.averagePaidPrice, currentLang);
      refs.outputs.grossRevenue.textContent = formatCurrency(result.grossRevenue, currentLang);
      refs.outputs.itchFeeTotal.textContent = formatCurrency(result.itchFeeTotal, currentLang);
      refs.outputs.processorVariableFee.textContent = formatCurrency(result.processorVariableFee, currentLang);
      refs.outputs.processorFixedFeeTotal.textContent = formatCurrency(result.processorFixedFeeTotal, currentLang);
      refs.outputs.processorFeeTotal.textContent = formatCurrency(result.processorFeeTotal, currentLang);
      refs.outputs.totalFees.textContent = formatCurrency(result.totalFees, currentLang);
      refs.outputs.netRevenuePerSale.textContent = formatCurrency(result.netRevenuePerSale, currentLang);
      refs.outputs.keepRatePct.textContent = formatPercent(result.keepRatePct, currentLang);
      refs.outputs.fixedFeeDragPct.textContent = formatPercent(result.fixedFeeDragPct, currentLang);
      refs.summary.value = result.summary;

      if (result.lowPriceWarning) {
        refs.warning.hidden = false;
        refs.warning.textContent = ui.statusWarning;
        refs.status.textContent = ui.statusWarning;
        refs.status.className = 'status warning';
      } else {
        refs.warning.hidden = true;
        refs.status.textContent = ui.statusHealthy;
        refs.status.className = 'status good';
      }
    }

    [
      refs.minimumPrice,
      refs.unitsSold,
      refs.averageExtraPaid,
      refs.itchRevenueShareRate,
      refs.paymentProcessorRate,
      refs.paymentProcessorFixedFee,
      refs.targetNetRevenue,
      refs.payoutMode
    ].forEach((node) => {
      node.addEventListener('input', render);
      node.addEventListener('change', render);
    });

    refs.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyStaticText();
      render();
    });

    refs.copySummary.addEventListener('click', async () => {
      const ui = TEXT[currentLang] || TEXT.en;
      try {
        await navigator.clipboard.writeText(refs.summary.value || '');
        refs.status.textContent = ui.copied;
        refs.status.className = 'status good';
      } catch (error) {
        refs.status.textContent = ui.copyFail;
        refs.status.className = 'status warning';
      }
    });

    refs.resetDefaults.addEventListener('click', () => {
      setDefaults();
      render();
    });

    setDefaults();
    applyStaticText();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
