(function (root) {
  const PLAN_PRESETS = {
    free: {
      monthlyFee: 0,
      beaconsFeePct: 9,
      label: { en: 'Free · $0/mo', ko: 'Free · $0/월' }
    },
    creator: {
      monthlyFee: 10,
      beaconsFeePct: 9,
      label: { en: 'Creator · $10/mo', ko: 'Creator · $10/월' }
    },
    creatorPlus: {
      monthlyFee: 30,
      beaconsFeePct: 0,
      label: { en: 'Creator Plus · $30/mo', ko: 'Creator Plus · $30/월' }
    },
    creatorMax: {
      monthlyFee: 90,
      beaconsFeePct: 0,
      label: { en: 'Creator Max · $90/mo', ko: 'Creator Max · $90/월' }
    }
  };

  const CONSTANTS = {
    STRIPE_RATE_PCT: 2.9,
    STRIPE_FIXED_FEE: 0.3,
    CURRENCY: 'USD'
  };

  const DEFAULTS = {
    monthlyGrossSales: 5000,
    monthlyOrders: 80,
    refundRatePct: 2,
    planTier: 'creator',
    averageVariableCostPerOrder: 12,
    otherMonthlyCost: 300,
    desiredMonthlyNetProfit: 2500
  };

  const TEXT = {
    en: {
      gross: 'Monthly gross sales must be greater than zero.',
      orders: 'Monthly orders must be a whole number greater than zero.',
      refund: 'Refund rate must be 0 or above and below 100%.',
      plan: 'Unsupported Beacons plan tier.',
      variable: 'Average variable cost per order must be 0 or above.',
      other: 'Other monthly cost must be 0 or above.',
      target: 'Desired monthly net profit must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to model Beacons take-home.',
      statusGood: 'Under these assumptions, the Beacons offer is profitable.',
      statusWarn: 'Under these assumptions, you are underwater. Re-check pricing, refunds, or plan choice.',
      summaryTitle: '[Beacons Fee Calculator Summary]',
      na: 'N/A',
      note: 'Scope note: this v1 models Beacons plans plus Stripe 2.9% + $0.30. PayPal, annual billing discounts, and invoice exceptions are intentionally excluded.'
    },
    ko: {
      gross: '월 총매출은 0보다 커야 합니다.',
      orders: '월 주문 수는 0보다 큰 정수여야 합니다.',
      refund: '환불률은 0 이상 100 미만이어야 합니다.',
      plan: '지원하지 않는 Beacons 플랜입니다.',
      variable: '주문당 변동원가는 0 이상이어야 합니다.',
      other: '기타 월 고정비는 0 이상이어야 합니다.',
      target: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 Beacons 실수령액이 계산됩니다.',
      statusGood: '현재 가정에서는 Beacons 판매 구조가 흑자입니다.',
      statusWarn: '현재 가정에서는 적자입니다. 가격, 환불률, 플랜을 다시 점검하세요.',
      summaryTitle: '[Beacons 수수료 계산기 요약]',
      na: '해당 없음',
      note: '범위 메모: 이 v1은 Beacons 플랜과 Stripe 2.9% + $0.30만 모델링합니다. PayPal, 연간 결제 할인, invoice 예외는 제외했습니다.'
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
      monthlyGrossSales: Number(input.monthlyGrossSales),
      monthlyOrders: Number(input.monthlyOrders),
      refundRatePct: Number(input.refundRatePct),
      planTier: input.planTier || DEFAULTS.planTier,
      averageVariableCostPerOrder: Number(input.averageVariableCostPerOrder),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      desiredMonthlyNetProfit: Number(input.desiredMonthlyNetProfit)
    };
  }

  function getPlanPreset(input) {
    return PLAN_PRESETS[input.planTier] || null;
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.monthlyGrossSales) || input.monthlyGrossSales <= 0) {
      return t.gross;
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders <= 0 || !Number.isInteger(input.monthlyOrders)) {
      return t.orders;
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct >= 100) {
      return t.refund;
    }
    if (!getPlanPreset(input)) {
      return t.plan;
    }
    if (!Number.isFinite(input.averageVariableCostPerOrder) || input.averageVariableCostPerOrder < 0) {
      return t.variable;
    }
    if (!Number.isFinite(input.otherMonthlyCost) || input.otherMonthlyCost < 0) {
      return t.other;
    }
    if (!Number.isFinite(input.desiredMonthlyNetProfit) || input.desiredMonthlyNetProfit < 0) {
      return t.target;
    }

    return '';
  }

  function evaluateCore(input, overrides) {
    const gross = overrides && overrides.gross != null ? Number(overrides.gross) : input.monthlyGrossSales;
    const orders = overrides && overrides.orders != null ? Number(overrides.orders) : input.monthlyOrders;
    const planPreset = overrides && overrides.planPreset ? overrides.planPreset : getPlanPreset(input);
    const refundLoss = gross * (input.refundRatePct / 100);
    const beaconsFees = gross * (planPreset.beaconsFeePct / 100);
    const stripeFees = gross * (CONSTANTS.STRIPE_RATE_PCT / 100) + orders * CONSTANTS.STRIPE_FIXED_FEE;
    const variableCostTotal = orders * input.averageVariableCostPerOrder;
    const takeHomeAfterPlatformCosts = gross - refundLoss - beaconsFees - stripeFees - variableCostTotal - planPreset.monthlyFee;
    const monthlyNetProfit = takeHomeAfterPlatformCosts - input.otherMonthlyCost;
    const effectiveFeeRatePct = gross > 0
      ? ((beaconsFees + stripeFees + variableCostTotal + planPreset.monthlyFee) / gross) * 100
      : 0;

    return {
      gross,
      orders,
      monthlyPlanFee: planPreset.monthlyFee,
      beaconsFeePct: planPreset.beaconsFeePct,
      beaconsFees,
      stripeFees,
      refundLoss,
      variableCostTotal,
      takeHomeAfterPlatformCosts,
      monthlyNetProfit,
      annualizedNetProfit: monthlyNetProfit * 12,
      averageOrderValue: orders > 0 ? gross / orders : null,
      effectiveFeeRatePct
    };
  }

  function findRequiredGross(input, targetNet, planPreset) {
    const baselineAverageOrderValue = input.monthlyGrossSales / input.monthlyOrders;
    if (!Number.isFinite(baselineAverageOrderValue) || baselineAverageOrderValue <= 0) {
      return null;
    }

    const target = Number(targetNet) || 0;
    const maxIterations = 80;
    const tolerance = 0.005;
    let low = 0;
    let high = Math.max(input.monthlyGrossSales, baselineAverageOrderValue);

    while (evaluateCore(input, {
      gross: high,
      orders: high / baselineAverageOrderValue,
      planPreset
    }).monthlyNetProfit < target) {
      high *= 2;
      if (high > 1e9) {
        return null;
      }
    }

    for (let i = 0; i < maxIterations; i += 1) {
      const mid = (low + high) / 2;
      const result = evaluateCore(input, {
        gross: mid,
        orders: mid / baselineAverageOrderValue,
        planPreset
      });
      if (Math.abs(result.monthlyNetProfit - target) <= tolerance) {
        return mid;
      }
      if (result.monthlyNetProfit >= target) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function buildComparisonRows(input, lang) {
    return Object.entries(PLAN_PRESETS).map(([id, preset]) => {
      const evaluated = evaluateCore(input, { planPreset: preset });
      const breakEven = findRequiredGross(input, 0, preset);
      return {
        id,
        label: preset.label[lang] || preset.label.en,
        monthlyPlanFee: round2(evaluated.monthlyPlanFee),
        beaconsFeePct: round2(evaluated.beaconsFeePct),
        beaconsFees: round2(evaluated.beaconsFees),
        stripeFees: round2(evaluated.stripeFees),
        monthlyNetProfit: round2(evaluated.monthlyNetProfit),
        breakEvenMonthlyGrossSales: breakEven == null ? null : round2(breakEven)
      };
    });
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: CONSTANTS.CURRENCY,
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

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    return [
      t.summaryTitle,
      `${lang === 'ko' ? '플랜' : 'Plan tier'}: ${result.planLabel}`,
      `${lang === 'ko' ? 'Beacons 수수료율' : 'Beacons fee rate'}: ${formatPercent(result.beaconsFeePct, lang)}`,
      `${lang === 'ko' ? '월 총매출' : 'Monthly gross sales'}: ${formatMoney(result.inputs.monthlyGrossSales, lang)}`,
      `${lang === 'ko' ? '월 주문 수' : 'Monthly orders'}: ${result.inputs.monthlyOrders}`,
      `${lang === 'ko' ? '평균 주문 금액' : 'Average order value'}: ${formatMoney(result.averageOrderValue, lang)}`,
      `${lang === 'ko' ? 'Beacons 수수료' : 'Beacons fees'}: ${formatMoney(result.beaconsFees, lang)}`,
      `${lang === 'ko' ? 'Stripe 수수료' : 'Stripe fees'}: ${formatMoney(result.stripeFees, lang)}`,
      `${lang === 'ko' ? '환불 손실' : 'Refund loss'}: ${formatMoney(result.refundLoss, lang)}`,
      `${lang === 'ko' ? '주문당 변동원가 합계' : 'Variable cost total'}: ${formatMoney(result.variableCostTotal, lang)}`,
      `${lang === 'ko' ? '월 플랜 비용' : 'Monthly plan fee'}: ${formatMoney(result.monthlyPlanFee, lang)}`,
      `${lang === 'ko' ? '플랫폼 비용 차감 후 실수령액' : 'Take-home after platform costs'}: ${formatMoney(result.takeHomeAfterPlatformCosts, lang)}`,
      `${lang === 'ko' ? '월 순이익' : 'Monthly net profit'}: ${formatMoney(result.monthlyNetProfit, lang)}`,
      `${lang === 'ko' ? '실효 수수료율' : 'Effective fee rate'}: ${formatPercent(result.effectiveFeeRatePct, lang)}`,
      `${lang === 'ko' ? '손익분기 월매출' : 'Break-even monthly gross'}: ${result.breakEvenMonthlyGrossSales == null ? t.na : formatMoney(result.breakEvenMonthlyGrossSales, lang)}`,
      `${lang === 'ko' ? '목표 순이익용 필요 월매출' : 'Gross needed for target net'}: ${result.requiredMonthlyGrossForTargetNet == null ? t.na : formatMoney(result.requiredMonthlyGrossForTargetNet, lang)}`,
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

    const planPreset = getPlanPreset(normalized);
    const evaluated = evaluateCore(normalized, { planPreset });
    const breakEvenMonthlyGrossSales = findRequiredGross(normalized, 0, planPreset);
    const requiredMonthlyGrossForTargetNet = findRequiredGross(normalized, normalized.desiredMonthlyNetProfit, planPreset);
    const targetGap = requiredMonthlyGrossForTargetNet == null
      ? null
      : Math.max(requiredMonthlyGrossForTargetNet - normalized.monthlyGrossSales, 0);

    const result = {
      inputs: normalized,
      planLabel: planPreset.label[lang] || planPreset.label.en,
      beaconsFeePct: round2(evaluated.beaconsFeePct),
      beaconsFees: round2(evaluated.beaconsFees),
      stripeFees: round2(evaluated.stripeFees),
      refundLoss: round2(evaluated.refundLoss),
      variableCostTotal: round2(evaluated.variableCostTotal),
      monthlyPlanFee: round2(evaluated.monthlyPlanFee),
      takeHomeAfterPlatformCosts: round2(evaluated.takeHomeAfterPlatformCosts),
      monthlyNetProfit: round2(evaluated.monthlyNetProfit),
      annualizedNetProfit: round2(evaluated.annualizedNetProfit),
      averageOrderValue: round2(evaluated.averageOrderValue),
      effectiveFeeRatePct: round2(evaluated.effectiveFeeRatePct),
      breakEvenMonthlyGrossSales: breakEvenMonthlyGrossSales == null ? null : round2(breakEvenMonthlyGrossSales),
      requiredMonthlyGrossForTargetNet: requiredMonthlyGrossForTargetNet == null ? null : round2(requiredMonthlyGrossForTargetNet),
      targetGap: targetGap == null ? null : round2(targetGap),
      comparisonRows: buildComparisonRows(normalized, lang)
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    PLAN_PRESETS,
    CONSTANTS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    getPlanPreset,
    validate,
    evaluateCore,
    findRequiredGross,
    buildComparisonRows,
    buildSummary,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BeaconsFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const elements = {
    form: document.getElementById('calculatorForm'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    comparisonBody: document.getElementById('comparisonBody'),
    monthlyGrossSales: document.getElementById('monthlyGrossSales'),
    monthlyOrders: document.getElementById('monthlyOrders'),
    refundRatePct: document.getElementById('refundRatePct'),
    planTier: document.getElementById('planTier'),
    averageVariableCostPerOrder: document.getElementById('averageVariableCostPerOrder'),
    otherMonthlyCost: document.getElementById('otherMonthlyCost'),
    desiredMonthlyNetProfit: document.getElementById('desiredMonthlyNetProfit'),
    kpiTakeHome: document.getElementById('kpiTakeHome'),
    kpiNetProfit: document.getElementById('kpiNetProfit'),
    kpiEffectiveFee: document.getElementById('kpiEffectiveFee'),
    kpiBreakEven: document.getElementById('kpiBreakEven'),
    kpiTarget: document.getElementById('kpiTarget'),
    kpiAov: document.getElementById('kpiAov'),
    detailBeaconsFeePct: document.getElementById('detailBeaconsFeePct'),
    detailBeaconsFees: document.getElementById('detailBeaconsFees'),
    detailStripeFees: document.getElementById('detailStripeFees'),
    detailRefundLoss: document.getElementById('detailRefundLoss'),
    detailVariableCostTotal: document.getElementById('detailVariableCostTotal'),
    detailMonthlyPlanFee: document.getElementById('detailMonthlyPlanFee'),
    detailAnnualizedNetProfit: document.getElementById('detailAnnualizedNetProfit'),
    detailTargetGap: document.getElementById('detailTargetGap')
  };

  function getFormInput() {
    return {
      monthlyGrossSales: elements.monthlyGrossSales.value,
      monthlyOrders: elements.monthlyOrders.value,
      refundRatePct: elements.refundRatePct.value,
      planTier: elements.planTier.value,
      averageVariableCostPerOrder: elements.averageVariableCostPerOrder.value,
      otherMonthlyCost: elements.otherMonthlyCost.value,
      desiredMonthlyNetProfit: elements.desiredMonthlyNetProfit.value
    };
  }

  function fillDefaults() {
    elements.monthlyGrossSales.value = DEFAULTS.monthlyGrossSales;
    elements.monthlyOrders.value = DEFAULTS.monthlyOrders;
    elements.refundRatePct.value = DEFAULTS.refundRatePct;
    elements.planTier.value = DEFAULTS.planTier;
    elements.averageVariableCostPerOrder.value = DEFAULTS.averageVariableCostPerOrder;
    elements.otherMonthlyCost.value = DEFAULTS.otherMonthlyCost;
    elements.desiredMonthlyNetProfit.value = DEFAULTS.desiredMonthlyNetProfit;
  }

  function setPlaceholderState(message) {
    elements.error.textContent = '';
    elements.status.textContent = message;
    elements.status.className = 'status-chip';
    elements.kpiTakeHome.textContent = '—';
    elements.kpiNetProfit.textContent = '—';
    elements.kpiEffectiveFee.textContent = '—';
    elements.kpiBreakEven.textContent = '—';
    elements.kpiTarget.textContent = '—';
    elements.kpiAov.textContent = '—';
    elements.detailBeaconsFeePct.textContent = '—';
    elements.detailBeaconsFees.textContent = '—';
    elements.detailStripeFees.textContent = '—';
    elements.detailRefundLoss.textContent = '—';
    elements.detailVariableCostTotal.textContent = '—';
    elements.detailMonthlyPlanFee.textContent = '—';
    elements.detailAnnualizedNetProfit.textContent = '—';
    elements.detailTargetGap.textContent = '—';
    elements.summary.value = '';
    elements.comparisonBody.innerHTML = '<tr><td colspan="6">Run a valid scenario to compare Beacons plans.</td></tr>';
  }

  function renderComparison(rows) {
    elements.comparisonBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.label}</td>
        <td>${formatPercent(row.beaconsFeePct, 'en')}</td>
        <td>${formatMoney(row.monthlyPlanFee, 'en')}</td>
        <td>${formatMoney(row.beaconsFees, 'en')}</td>
        <td>${formatMoney(row.monthlyNetProfit, 'en')}</td>
        <td>${row.breakEvenMonthlyGrossSales == null ? 'N/A' : formatMoney(row.breakEvenMonthlyGrossSales, 'en')}</td>
      </tr>
    `).join('');
  }

  function render() {
    const { result, error } = calculate(getFormInput(), { lang: 'en' });

    if (error) {
      elements.error.textContent = error;
      setPlaceholderState(TEXT.en.waiting);
      elements.error.textContent = error;
      return;
    }

    elements.error.textContent = '';
    elements.status.textContent = result.monthlyNetProfit >= 0 ? TEXT.en.statusGood : TEXT.en.statusWarn;
    elements.status.className = `status-chip ${result.monthlyNetProfit >= 0 ? 'good' : 'warn'}`;
    elements.kpiTakeHome.textContent = formatMoney(result.takeHomeAfterPlatformCosts, 'en');
    elements.kpiNetProfit.textContent = formatMoney(result.monthlyNetProfit, 'en');
    elements.kpiEffectiveFee.textContent = formatPercent(result.effectiveFeeRatePct, 'en');
    elements.kpiBreakEven.textContent = result.breakEvenMonthlyGrossSales == null ? 'N/A' : formatMoney(result.breakEvenMonthlyGrossSales, 'en');
    elements.kpiTarget.textContent = result.requiredMonthlyGrossForTargetNet == null ? 'N/A' : formatMoney(result.requiredMonthlyGrossForTargetNet, 'en');
    elements.kpiAov.textContent = formatMoney(result.averageOrderValue, 'en');
    elements.detailBeaconsFeePct.textContent = formatPercent(result.beaconsFeePct, 'en');
    elements.detailBeaconsFees.textContent = formatMoney(result.beaconsFees, 'en');
    elements.detailStripeFees.textContent = formatMoney(result.stripeFees, 'en');
    elements.detailRefundLoss.textContent = formatMoney(result.refundLoss, 'en');
    elements.detailVariableCostTotal.textContent = formatMoney(result.variableCostTotal, 'en');
    elements.detailMonthlyPlanFee.textContent = formatMoney(result.monthlyPlanFee, 'en');
    elements.detailAnnualizedNetProfit.textContent = formatMoney(result.annualizedNetProfit, 'en');
    elements.detailTargetGap.textContent = result.targetGap == null ? 'N/A' : formatMoney(result.targetGap, 'en');
    elements.summary.value = result.summary;
    renderComparison(result.comparisonRows);
  }

  if (!elements.form) {
    return;
  }

  fillDefaults();
  setPlaceholderState(TEXT.en.waiting);
  render();

  elements.form.addEventListener('input', render);
  elements.form.addEventListener('change', render);

  elements.resetBtn.addEventListener('click', () => {
    fillDefaults();
    render();
  });

  elements.copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(elements.summary.value || '');
      elements.status.textContent = TEXT.en.copied;
      elements.status.className = 'status-chip good';
    } catch (err) {
      elements.status.textContent = TEXT.en.copyFail;
      elements.status.className = 'status-chip warn';
    }
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
