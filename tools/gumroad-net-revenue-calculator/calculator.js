(function (root) {
  const GUMROAD_DIRECT_RATE = 0.10;
  const GUMROAD_DIRECT_FLAT = 0.50;
  const GUMROAD_DISCOVER_RATE = 0.30;

  const PROCESSOR_PRESETS = [
    {
      id: 'stripe-domestic',
      ratePct: 2.9,
      flatFee: 0.30,
      label: { ko: 'Stripe 미국 국내 카드 · 2.9% + $0.30', en: 'Stripe domestic cards · 2.9% + $0.30' }
    },
    {
      id: 'paypal-standard',
      ratePct: 3.49,
      flatFee: 0.49,
      label: { ko: 'PayPal 표준 결제 · 3.49% + $0.49', en: 'PayPal standard checkout · 3.49% + $0.49' }
    },
    {
      id: 'custom',
      ratePct: null,
      flatFee: null,
      label: { ko: '커스텀 직접 결제비용', en: 'Custom direct-processing fees' }
    }
  ];

  const presetMap = Object.fromEntries(PROCESSOR_PRESETS.map((preset) => [preset.id, preset]));

  const DEFAULTS = {
    directGrossSales: 3000,
    directOrders: 80,
    discoverGrossSales: 1500,
    discoverOrders: 30,
    processorPreset: 'stripe-domestic',
    customProcessorRatePct: 2.9,
    customProcessorFlatFee: 0.30,
    payoutDelayDays: 7,
    annualCashCostPct: 8
  };

  const TEXT = {
    ko: {
      totalGross: '총매출',
      netRevenue: '순수령액',
      gumroadFees: 'Gumroad 수수료',
      processorFees: '직접 결제 처리비',
      payoutDrag: '정산 지연 비용',
      blendedRate: '혼합 실수령률',
      directNet: '직접/프로필 실수령',
      discoverNet: 'Discover 실수령',
      directAov: '직접 평균 주문액',
      discoverAov: 'Discover 평균 주문액',
      directPerOrder: '직접 주문당 실수령',
      discoverPerOrder: 'Discover 주문당 실수령',
      summaryTitle: '[Gumroad 순수익 요약]',
      presetLabel: '직접 결제 처리비 프리셋',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '입력값을 넣고 계산하면 Gumroad 순수익이 표시됩니다.',
      status: '현재 가정에서 직접 판매는 대체로 Discover보다 실수령률이 높고, Discover는 추가 노출 대가로 단순한 30% 수수료를 지불합니다.',
      invalid: '입력값을 확인해주세요.',
      grossNonNegative: '매출 입력값은 0 이상이어야 합니다.',
      needSales: '직접 또는 Discover 매출 중 하나 이상은 0보다 커야 합니다.',
      directOrders: '직접 매출이 있으면 직접 주문수도 1 이상이어야 합니다.',
      discoverOrders: 'Discover 매출이 있으면 Discover 주문수도 1 이상이어야 합니다.',
      orderNonNegative: '주문수는 0 이상이어야 합니다.',
      preset: '지원하지 않는 처리비 프리셋입니다.',
      customRate: '커스텀 처리비율은 0 이상 100 미만이어야 합니다.',
      customFlat: '커스텀 고정 처리비는 0 이상이어야 합니다.',
      payoutDelay: '정산 지연 일수는 0 이상 365 이하여야 합니다.',
      annualCashCost: '연간 자금비용률은 0 이상 100 미만이어야 합니다.',
      note: '공식 Gumroad 공개 요금은 직접/프로필 판매 10% + $0.50, Discover 판매 30%입니다. 직접 결제 처리비는 Gumroad 공식 플랫폼 수수료가 아니라 사용자가 가정하는 카드/PayPal 비용입니다. 2025년부터 Gumroad는 Merchant of Record로 세금 징수/납부를 처리합니다.',
      na: 'N/A'
    },
    en: {
      totalGross: 'Total gross sales',
      netRevenue: 'Net revenue',
      gumroadFees: 'Gumroad fees',
      processorFees: 'Direct processing fees',
      payoutDrag: 'Payout drag cost',
      blendedRate: 'Blended take-home rate',
      directNet: 'Direct/profile take-home',
      discoverNet: 'Discover take-home',
      directAov: 'Direct average order value',
      discoverAov: 'Discover average order value',
      directPerOrder: 'Direct take-home per order',
      discoverPerOrder: 'Discover take-home per order',
      summaryTitle: '[Gumroad Net Revenue Summary]',
      presetLabel: 'Direct processing preset',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter inputs and calculate to see Gumroad take-home.',
      status: 'Under this model, direct sales usually keep a higher take-home rate while Discover trades margin for marketplace distribution.',
      invalid: 'Please review your inputs.',
      grossNonNegative: 'Gross sales inputs must be zero or above.',
      needSales: 'At least one of direct or Discover sales must be greater than zero.',
      directOrders: 'Direct orders must be at least 1 when direct sales are above zero.',
      discoverOrders: 'Discover orders must be at least 1 when Discover sales are above zero.',
      orderNonNegative: 'Order counts must be zero or above.',
      preset: 'Unsupported processing preset.',
      customRate: 'Custom processing rate must be 0 or above and below 100%.',
      customFlat: 'Custom flat processing fee must be 0 or above.',
      payoutDelay: 'Payout delay days must be between 0 and 365.',
      annualCashCost: 'Annual cash-cost rate must be 0 or above and below 100%.',
      note: 'Official Gumroad pricing is 10% + $0.50 for direct/profile sales and 30% for Discover sales. Direct processing fees in this tool are user assumptions, not Gumroad platform fees. Since 2025 Gumroad acts as Merchant of Record and handles tax collection/remittance.',
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
      directGrossSales: Number(input.directGrossSales),
      directOrders: Number(input.directOrders),
      discoverGrossSales: Number(input.discoverGrossSales),
      discoverOrders: Number(input.discoverOrders),
      processorPreset: input.processorPreset || DEFAULTS.processorPreset,
      customProcessorRatePct: Number(input.customProcessorRatePct),
      customProcessorFlatFee: Number(input.customProcessorFlatFee),
      payoutDelayDays: Number(input.payoutDelayDays),
      annualCashCostPct: Number(input.annualCashCostPct)
    };
  }

  function getProcessorPreset(input) {
    return presetMap[input.processorPreset] || null;
  }

  function resolveProcessor(input) {
    const preset = getProcessorPreset(input);
    if (!preset) {
      return null;
    }
    if (preset.id === 'custom') {
      return {
        id: preset.id,
        label: preset.label,
        ratePct: input.customProcessorRatePct,
        flatFee: input.customProcessorFlatFee
      };
    }
    return {
      id: preset.id,
      label: preset.label,
      ratePct: preset.ratePct,
      flatFee: preset.flatFee
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyValues = [input.directGrossSales, input.discoverGrossSales];
    const orderValues = [input.directOrders, input.discoverOrders];

    if (moneyValues.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.grossNonNegative;
    }

    if (orderValues.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.orderNonNegative;
    }

    if (input.directGrossSales <= 0 && input.discoverGrossSales <= 0) {
      return t.needSales;
    }

    if (input.directGrossSales > 0 && input.directOrders < 1) {
      return t.directOrders;
    }

    if (input.discoverGrossSales > 0 && input.discoverOrders < 1) {
      return t.discoverOrders;
    }

    if (!getProcessorPreset(input)) {
      return t.preset;
    }

    if (!Number.isFinite(input.customProcessorRatePct) || input.customProcessorRatePct < 0 || input.customProcessorRatePct >= 100) {
      return t.customRate;
    }

    if (!Number.isFinite(input.customProcessorFlatFee) || input.customProcessorFlatFee < 0) {
      return t.customFlat;
    }

    if (!Number.isFinite(input.payoutDelayDays) || input.payoutDelayDays < 0 || input.payoutDelayDays > 365) {
      return t.payoutDelay;
    }

    if (!Number.isFinite(input.annualCashCostPct) || input.annualCashCostPct < 0 || input.annualCashCostPct >= 100) {
      return t.annualCashCost;
    }

    return '';
  }

  function safeDivide(numerator, denominator) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  function evaluateScenario(input, overrides) {
    const processor = overrides && overrides.processor ? overrides.processor : resolveProcessor(input);
    const directGrossSales = input.directGrossSales;
    const directOrders = input.directOrders;
    const discoverGrossSales = input.discoverGrossSales;
    const discoverOrders = input.discoverOrders;

    const processorRate = processor.ratePct / 100;
    const annualCashCostRate = input.annualCashCostPct / 100;

    const directGumroadFee = directGrossSales * GUMROAD_DIRECT_RATE + directOrders * GUMROAD_DIRECT_FLAT;
    const directProcessingFee = directGrossSales * processorRate + directOrders * processor.flatFee;
    const directNetBeforeDrag = directGrossSales - directGumroadFee - directProcessingFee;

    const discoverGumroadFee = discoverGrossSales * GUMROAD_DISCOVER_RATE;
    const discoverNetBeforeDrag = discoverGrossSales - discoverGumroadFee;

    const totalGrossSales = directGrossSales + discoverGrossSales;
    const gumroadFeesTotal = directGumroadFee + discoverGumroadFee;
    const totalNetBeforeDrag = directNetBeforeDrag + discoverNetBeforeDrag;
    const payoutDragCost = totalNetBeforeDrag * annualCashCostRate * input.payoutDelayDays / 365;
    const netRevenue = totalNetBeforeDrag - payoutDragCost;
    const totalFeeDragBeforeDrag = gumroadFeesTotal + directProcessingFee;

    const directAverageOrderValue = safeDivide(directGrossSales, directOrders);
    const discoverAverageOrderValue = safeDivide(discoverGrossSales, discoverOrders);
    const directTakeHomePerOrder = safeDivide(directNetBeforeDrag, directOrders);
    const discoverTakeHomePerOrder = safeDivide(discoverNetBeforeDrag, discoverOrders);
    const directTakeHomeRate = safeDivide(directNetBeforeDrag, directGrossSales);
    const discoverTakeHomeRate = safeDivide(discoverNetBeforeDrag, discoverGrossSales);
    const blendedTakeHomeRate = safeDivide(netRevenue, totalGrossSales);
    const effectiveFeeRateBeforeDrag = safeDivide(totalFeeDragBeforeDrag, totalGrossSales);

    return {
      processorId: processor.id,
      processorLabel: processor.label,
      processorRatePct: processor.ratePct,
      processorFlatFee: processor.flatFee,
      directGumroadFee,
      directProcessingFee,
      directNetBeforeDrag,
      discoverGumroadFee,
      discoverNetBeforeDrag,
      gumroadFeesTotal,
      totalGrossSales,
      totalNetBeforeDrag,
      payoutDragCost,
      netRevenue,
      totalFeeDragBeforeDrag,
      directAverageOrderValue,
      discoverAverageOrderValue,
      directTakeHomePerOrder,
      discoverTakeHomePerOrder,
      directTakeHomeRate,
      discoverTakeHomeRate,
      blendedTakeHomeRate,
      effectiveFeeRateBeforeDrag
    };
  }

  function buildComparisonRows(input) {
    return PROCESSOR_PRESETS.map((preset) => {
      const processor = preset.id === 'custom'
        ? {
            id: 'custom',
            label: preset.label,
            ratePct: input.customProcessorRatePct,
            flatFee: input.customProcessorFlatFee
          }
        : {
            id: preset.id,
            label: preset.label,
            ratePct: preset.ratePct,
            flatFee: preset.flatFee
          };

      const evaluated = evaluateScenario(input, { processor });
      return {
        id: processor.id,
        label: processor.label,
        processorRatePct: processor.ratePct,
        processorFlatFee: processor.flatFee,
        directProcessingFee: round2(evaluated.directProcessingFee),
        netRevenue: round2(evaluated.netRevenue),
        blendedTakeHomeRatePct: evaluated.blendedTakeHomeRate == null ? null : round2(evaluated.blendedTakeHomeRate * 100),
        payoutDragCost: round2(evaluated.payoutDragCost)
      };
    });
  }

  function formatMoney(value, lang) {
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).na;
    }
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).na;
    }
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}%`;
  }

  function getProcessorLabel(input, lang) {
    const processor = resolveProcessor(input);
    return processor ? (processor.label[lang] || processor.label.en) : '';
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${t.totalGross}: ${formatMoney(result.totalGrossSales, lang)}`,
      `${t.presetLabel}: ${result.processorLabel}`,
      `${t.gumroadFees}: ${formatMoney(result.gumroadFeesTotal, lang)}`,
      `${t.processorFees}: ${formatMoney(result.directProcessingFee, lang)}`,
      `${t.payoutDrag}: ${formatMoney(result.payoutDragCost, lang)}`,
      `${t.directNet}: ${formatMoney(result.directNetBeforeDrag, lang)}`,
      `${t.discoverNet}: ${formatMoney(result.discoverNetBeforeDrag, lang)}`,
      `${t.netRevenue}: ${formatMoney(result.netRevenue, lang)}`,
      `${t.blendedRate}: ${formatPercent(result.blendedTakeHomeRatePct, lang)}`,
      `${t.directPerOrder}: ${formatMoney(result.directTakeHomePerOrder, lang)}`,
      `${t.discoverPerOrder}: ${formatMoney(result.discoverTakeHomePerOrder, lang)}`,
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

    const processor = resolveProcessor(normalized);
    const evaluated = evaluateScenario(normalized, { processor });
    const result = {
      inputs: normalized,
      processorLabel: processor.label[lang] || processor.label.en,
      directGumroadFee: round2(evaluated.directGumroadFee),
      directProcessingFee: round2(evaluated.directProcessingFee),
      directNetBeforeDrag: round2(evaluated.directNetBeforeDrag),
      discoverGumroadFee: round2(evaluated.discoverGumroadFee),
      discoverNetBeforeDrag: round2(evaluated.discoverNetBeforeDrag),
      gumroadFeesTotal: round2(evaluated.gumroadFeesTotal),
      totalGrossSales: round2(evaluated.totalGrossSales),
      totalNetBeforeDrag: round2(evaluated.totalNetBeforeDrag),
      payoutDragCost: round2(evaluated.payoutDragCost),
      netRevenue: round2(evaluated.netRevenue),
      totalFeeDragBeforeDrag: round2(evaluated.totalFeeDragBeforeDrag),
      directAverageOrderValue: evaluated.directAverageOrderValue == null ? null : round2(evaluated.directAverageOrderValue),
      discoverAverageOrderValue: evaluated.discoverAverageOrderValue == null ? null : round2(evaluated.discoverAverageOrderValue),
      directTakeHomePerOrder: evaluated.directTakeHomePerOrder == null ? null : round2(evaluated.directTakeHomePerOrder),
      discoverTakeHomePerOrder: evaluated.discoverTakeHomePerOrder == null ? null : round2(evaluated.discoverTakeHomePerOrder),
      directTakeHomeRatePct: evaluated.directTakeHomeRate == null ? null : round2(evaluated.directTakeHomeRate * 100),
      discoverTakeHomeRatePct: evaluated.discoverTakeHomeRate == null ? null : round2(evaluated.discoverTakeHomeRate * 100),
      blendedTakeHomeRatePct: evaluated.blendedTakeHomeRate == null ? null : round2(evaluated.blendedTakeHomeRate * 100),
      effectiveFeeRateBeforeDragPct: evaluated.effectiveFeeRateBeforeDrag == null ? null : round2(evaluated.effectiveFeeRateBeforeDrag * 100),
      comparisonRows: buildComparisonRows(normalized).map((row) => ({
        ...row,
        label: row.label[lang] || row.label.en
      }))
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  function initDom() {
    if (!root.document) {
      return;
    }

    const state = { lang: 'en' };
    const form = document.getElementById('calculatorForm');
    if (!form) {
      return;
    }

    const langBtn = document.getElementById('langBtn');
    const processorPreset = document.getElementById('processorPreset');
    const customFields = document.getElementById('customProcessorFields');
    const errorBox = document.getElementById('errorBox');
    const statusText = document.getElementById('statusText');
    const summary = document.getElementById('summary');
    const comparisonBody = document.getElementById('comparisonBody');

    const moneyTargets = {
      totalGrossSales: document.getElementById('totalGrossSalesValue'),
      netRevenue: document.getElementById('netRevenueValue'),
      gumroadFeesTotal: document.getElementById('gumroadFeesValue'),
      directProcessingFee: document.getElementById('directProcessingFeesValue'),
      payoutDragCost: document.getElementById('payoutDragValue'),
      directNetBeforeDrag: document.getElementById('directNetValue'),
      discoverNetBeforeDrag: document.getElementById('discoverNetValue'),
      directAverageOrderValue: document.getElementById('directAovValue'),
      discoverAverageOrderValue: document.getElementById('discoverAovValue'),
      directTakeHomePerOrder: document.getElementById('directPerOrderValue'),
      discoverTakeHomePerOrder: document.getElementById('discoverPerOrderValue')
    };

    const percentTargets = {
      blendedTakeHomeRatePct: document.getElementById('blendedRateValue'),
      effectiveFeeRateBeforeDragPct: document.getElementById('effectiveFeeRateValue'),
      directTakeHomeRatePct: document.getElementById('directRateValue'),
      discoverTakeHomeRatePct: document.getElementById('discoverRateValue')
    };

    function getFormData() {
      return {
        directGrossSales: form.directGrossSales.value,
        directOrders: form.directOrders.value,
        discoverGrossSales: form.discoverGrossSales.value,
        discoverOrders: form.discoverOrders.value,
        processorPreset: form.processorPreset.value,
        customProcessorRatePct: form.customProcessorRatePct.value,
        customProcessorFlatFee: form.customProcessorFlatFee.value,
        payoutDelayDays: form.payoutDelayDays.value,
        annualCashCostPct: form.annualCashCostPct.value
      };
    }

    function syncCustomFields() {
      const visible = processorPreset.value === 'custom';
      customFields.hidden = !visible;
    }

    function setError(message) {
      errorBox.textContent = message;
      errorBox.classList.toggle('show', Boolean(message));
    }

    function renderComparison(rows) {
      comparisonBody.innerHTML = rows.map((row) => `
        <tr>
          <td>${row.label}</td>
          <td>${formatMoney(row.directProcessingFee, state.lang)}</td>
          <td>${formatMoney(row.payoutDragCost, state.lang)}</td>
          <td>${formatMoney(row.netRevenue, state.lang)}</td>
          <td>${formatPercent(row.blendedTakeHomeRatePct, state.lang)}</td>
        </tr>
      `).join('');
    }

    function render() {
      syncCustomFields();
      const { result, error } = calculate(getFormData(), { lang: state.lang });
      const t = TEXT[state.lang] || TEXT.en;

      if (error) {
        setError(error);
        statusText.textContent = t.invalid;
        summary.value = '';
        comparisonBody.innerHTML = '';
        Object.values(moneyTargets).forEach((node) => { if (node) node.textContent = t.na; });
        Object.values(percentTargets).forEach((node) => { if (node) node.textContent = t.na; });
        return;
      }

      setError('');
      statusText.textContent = t.status;
      Object.entries(moneyTargets).forEach(([key, node]) => {
        if (node) {
          node.textContent = formatMoney(result[key], state.lang);
        }
      });
      Object.entries(percentTargets).forEach(([key, node]) => {
        if (node) {
          node.textContent = formatPercent(result[key], state.lang);
        }
      });
      summary.value = result.summary;
      renderComparison(result.comparisonRows);
    }

    function resetForm() {
      Object.entries(DEFAULTS).forEach(([key, value]) => {
        if (form[key]) {
          form[key].value = value;
        }
      });
      syncCustomFields();
      setError('');
      statusText.textContent = (TEXT[state.lang] || TEXT.en).waiting;
      summary.value = '';
      comparisonBody.innerHTML = '';
      Object.values(moneyTargets).forEach((node) => { if (node) node.textContent = (TEXT[state.lang] || TEXT.en).na; });
      Object.values(percentTargets).forEach((node) => { if (node) node.textContent = (TEXT[state.lang] || TEXT.en).na; });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      resetForm();
    });

    document.getElementById('copyBtn').addEventListener('click', async function () {
      const t = TEXT[state.lang] || TEXT.en;
      try {
        await navigator.clipboard.writeText(summary.value);
        statusText.textContent = t.copied;
      } catch (error) {
        statusText.textContent = t.copyFail;
      }
    });

    processorPreset.addEventListener('change', function () {
      syncCustomFields();
      render();
    });

    ['directGrossSales', 'directOrders', 'discoverGrossSales', 'discoverOrders', 'customProcessorRatePct', 'customProcessorFlatFee', 'payoutDelayDays', 'annualCashCostPct'].forEach((name) => {
      form[name].addEventListener('input', function () {
        render();
      });
    });

    langBtn.addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'ko' : 'en';
      langBtn.textContent = state.lang === 'en' ? '한국어 보기' : 'Switch to English';
      render();
    });

    langBtn.textContent = '한국어 보기';
    resetForm();
    render();
  }

  const api = {
    GUMROAD_DIRECT_RATE,
    GUMROAD_DIRECT_FLAT,
    GUMROAD_DISCOVER_RATE,
    PROCESSOR_PRESETS,
    DEFAULTS,
    resolveProcessor,
    evaluateScenario,
    calculate,
    validate,
    buildComparisonRows,
    TEXT,
    formatMoney,
    formatPercent,
    round2,
    round4
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GumroadNetRevenueCalculator = api;
  }

  if (root.document) {
    root.addEventListener('DOMContentLoaded', initDom);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
