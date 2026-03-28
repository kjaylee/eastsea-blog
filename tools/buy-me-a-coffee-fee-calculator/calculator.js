(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.BuyMeACoffeeFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    transactionCount: 120,
    averageSupportAmount: 10,
    coverCardFeeFromSupporters: false,
    platformFeeRatePct: 5,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    payoutRatePct: 0.5,
    rewardCostPerTransaction: 0,
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 1000,
    currency: 'USD',
    lang: 'en',
  };

  const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'KRW']);
  const VALID_LANGS = new Set(['en', 'ko']);
  const MODE_KEYS = {
    CREATOR_COVERS: 'creatorCovers',
    SUPPORTER_COVERS: 'supporterCovers',
  };

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return 0;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function toBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    const text = String(value == null ? '' : value).trim().toLowerCase();
    return text === 'true' || text === '1' || text === 'yes' || text === 'on';
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function getModeLabel(mode, lang) {
    const locale = VALID_LANGS.has(lang) ? lang : 'en';
    if (locale === 'ko') {
      return mode === MODE_KEYS.SUPPORTER_COVERS
        ? '서포터가 카드 수수료 부담'
        : '크리에이터가 카드 수수료 부담';
    }
    return mode === MODE_KEYS.SUPPORTER_COVERS
      ? 'Supporters cover card fee'
      : 'Creator covers card fee';
  }

  function formatCurrency(value, currency) {
    const safeCurrency = VALID_CURRENCIES.has(currency) ? currency : DEFAULT_INPUTS.currency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: safeCurrency === 'KRW' ? 0 : 2,
      maximumFractionDigits: safeCurrency === 'KRW' ? 0 : 2,
    }).format(value);
  }

  function formatPercent(value, digits) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits == null ? 2 : digits,
      maximumFractionDigits: digits == null ? 2 : digits,
    }).format(value) + '%';
  }

  function formatMaybeCurrency(value, currency) {
    return value == null ? 'N/A' : formatCurrency(value, currency);
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    const transactionCount = toFiniteNumber(source.transactionCount);
    if (transactionCount == null || transactionCount < 0 || !Number.isInteger(transactionCount)) {
      errors.push('transactionCount must be an integer at least 0.');
    } else {
      values.transactionCount = transactionCount;
    }

    const averageSupportAmount = toFiniteNumber(source.averageSupportAmount);
    if (averageSupportAmount == null || averageSupportAmount < 0) {
      errors.push('averageSupportAmount must be at least 0.');
    } else {
      values.averageSupportAmount = averageSupportAmount;
    }

    values.coverCardFeeFromSupporters = toBoolean(source.coverCardFeeFromSupporters);

    const platformFeeRatePct = toFiniteNumber(source.platformFeeRatePct);
    if (platformFeeRatePct == null || platformFeeRatePct < 0 || platformFeeRatePct >= 100) {
      errors.push('platformFeeRatePct must be between 0 and less than 100.');
    } else {
      values.platformFeeRatePct = platformFeeRatePct;
    }

    const processingRatePct = toFiniteNumber(source.processingRatePct);
    if (processingRatePct == null || processingRatePct < 0 || processingRatePct >= 100) {
      errors.push('processingRatePct must be between 0 and less than 100.');
    } else {
      values.processingRatePct = processingRatePct;
    }

    const processingFixedFee = toFiniteNumber(source.processingFixedFee);
    if (processingFixedFee == null || processingFixedFee < 0) {
      errors.push('processingFixedFee must be at least 0.');
    } else {
      values.processingFixedFee = processingFixedFee;
    }

    const payoutRatePct = toFiniteNumber(source.payoutRatePct);
    if (payoutRatePct == null || payoutRatePct < 0 || payoutRatePct >= 100) {
      errors.push('payoutRatePct must be between 0 and less than 100.');
    } else {
      values.payoutRatePct = payoutRatePct;
    }

    const rewardCostPerTransaction = toFiniteNumber(source.rewardCostPerTransaction);
    if (rewardCostPerTransaction == null || rewardCostPerTransaction < 0) {
      errors.push('rewardCostPerTransaction must be at least 0.');
    } else {
      values.rewardCostPerTransaction = rewardCostPerTransaction;
    }

    const otherMonthlyCost = toFiniteNumber(source.otherMonthlyCost);
    if (otherMonthlyCost == null || otherMonthlyCost < 0) {
      errors.push('otherMonthlyCost must be at least 0.');
    } else {
      values.otherMonthlyCost = otherMonthlyCost;
    }

    const desiredMonthlyNetProfit = toFiniteNumber(source.desiredMonthlyNetProfit);
    if (desiredMonthlyNetProfit == null || desiredMonthlyNetProfit < 0) {
      errors.push('desiredMonthlyNetProfit must be at least 0.');
    } else {
      values.desiredMonthlyNetProfit = desiredMonthlyNetProfit;
    }

    const currency = String(source.currency == null ? '' : source.currency).trim().toUpperCase();
    if (!VALID_CURRENCIES.has(currency)) {
      errors.push('currency must be one of USD, EUR, GBP, or KRW.');
    } else {
      values.currency = currency;
    }

    const lang = String(source.lang == null ? '' : source.lang).trim().toLowerCase();
    if (!VALID_LANGS.has(lang)) {
      errors.push('lang must be en or ko.');
    } else {
      values.lang = lang;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function calculateThresholds(input, mode) {
    const count = input.transactionCount;
    if (count === 0) {
      return { breakEvenAverageSupport: null, targetAverageSupport: null, denominator: null };
    }

    const platformRate = input.platformFeeRatePct / 100;
    const processingRate = input.processingRatePct / 100;
    const payoutRate = input.payoutRatePct / 100;
    const rewardCosts = count * input.rewardCostPerTransaction;

    let denominator;
    let breakEvenNumerator;
    let targetNumerator;

    if (mode === MODE_KEYS.SUPPORTER_COVERS) {
      denominator = count * (1 - platformRate) * (1 - payoutRate);
      breakEvenNumerator = input.otherMonthlyCost + rewardCosts;
      targetNumerator = input.desiredMonthlyNetProfit + input.otherMonthlyCost + rewardCosts;
    } else {
      denominator = count * (1 - platformRate - processingRate) * (1 - payoutRate);
      breakEvenNumerator = input.otherMonthlyCost + rewardCosts + count * input.processingFixedFee * (1 - payoutRate);
      targetNumerator = input.desiredMonthlyNetProfit + input.otherMonthlyCost + rewardCosts + count * input.processingFixedFee * (1 - payoutRate);
    }

    if (!(denominator > 0)) {
      return { breakEvenAverageSupport: null, targetAverageSupport: null, denominator: roundTo(denominator, 12) };
    }

    return {
      breakEvenAverageSupport: roundTo(breakEvenNumerator / denominator, 6),
      targetAverageSupport: roundTo(targetNumerator / denominator, 6),
      denominator: roundTo(denominator, 12),
    };
  }

  function calculateScenario(input, mode) {
    const validated = input && input.transactionCount != null ? { ok: true, values: input } : validateInputs(input);
    if (!validated.ok) {
      return { result: null, error: validated.errors.join(' '), errors: validated.errors };
    }

    const values = validated.values;
    const count = values.transactionCount;
    const averageSupportAmount = values.averageSupportAmount;
    const platformRate = values.platformFeeRatePct / 100;
    const processingRate = values.processingRatePct / 100;
    const payoutRate = values.payoutRatePct / 100;

    const grossSupportVolume = count * averageSupportAmount;
    const rewardCosts = count * values.rewardCostPerTransaction;
    const otherMonthlyCost = values.otherMonthlyCost;

    let supporterChargeTotal;
    let processingFees;
    let platformFees = grossSupportVolume * platformRate;
    let prePayoutTakeHome;

    if (mode === MODE_KEYS.SUPPORTER_COVERS) {
      supporterChargeTotal = grossSupportVolume === 0
        ? 0
        : (grossSupportVolume + count * values.processingFixedFee) / (1 - processingRate);
      processingFees = supporterChargeTotal * processingRate + count * values.processingFixedFee;
      prePayoutTakeHome = grossSupportVolume - platformFees;
    } else {
      supporterChargeTotal = grossSupportVolume;
      processingFees = grossSupportVolume * processingRate + count * values.processingFixedFee;
      prePayoutTakeHome = grossSupportVolume - platformFees - processingFees;
    }

    const payoutFees = prePayoutTakeHome * payoutRate;
    const takeHomeBeforeOperatingCosts = prePayoutTakeHome - payoutFees;
    const monthlyNetProfit = takeHomeBeforeOperatingCosts - rewardCosts - otherMonthlyCost;
    const effectiveCreatorFeeDragPct = grossSupportVolume > 0
      ? ((grossSupportVolume - takeHomeBeforeOperatingCosts) / grossSupportVolume) * 100
      : 0;
    const takeHomePerTransactionAfterAllCosts = count > 0 ? monthlyNetProfit / count : 0;
    const supporterExtraChargeTotal = supporterChargeTotal - grossSupportVolume;
    const supporterChargePerTransaction = count > 0 ? supporterChargeTotal / count : 0;
    const thresholds = calculateThresholds(values, mode);

    return {
      result: {
        mode: mode,
        modeLabel: getModeLabel(mode, values.lang),
        input: values,
        transactionCount: count,
        averageSupportAmount: roundTo(averageSupportAmount, 6),
        grossSupportVolume: roundTo(grossSupportVolume, 6),
        supporterChargeTotal: roundTo(supporterChargeTotal, 6),
        supporterChargePerTransaction: roundTo(supporterChargePerTransaction, 6),
        platformFees: roundTo(platformFees, 6),
        processingFees: roundTo(processingFees, 6),
        payoutFees: roundTo(payoutFees, 6),
        rewardCosts: roundTo(rewardCosts, 6),
        otherMonthlyCost: roundTo(otherMonthlyCost, 6),
        takeHomeBeforeOperatingCosts: roundTo(takeHomeBeforeOperatingCosts, 6),
        monthlyNetProfit: roundTo(monthlyNetProfit, 6),
        effectiveCreatorFeeDragPct: roundTo(effectiveCreatorFeeDragPct, 6),
        breakEvenAverageSupport: thresholds.breakEvenAverageSupport,
        targetAverageSupport: thresholds.targetAverageSupport,
        thresholdDenominator: thresholds.denominator,
        supporterExtraChargeTotal: roundTo(supporterExtraChargeTotal, 6),
        takeHomePerTransactionAfterAllCosts: roundTo(takeHomePerTransactionAfterAllCosts, 6),
      },
      error: '',
      errors: [],
    };
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const currentMode = input.coverCardFeeFromSupporters ? MODE_KEYS.SUPPORTER_COVERS : MODE_KEYS.CREATOR_COVERS;
    const alternateMode = currentMode === MODE_KEYS.CREATOR_COVERS ? MODE_KEYS.SUPPORTER_COVERS : MODE_KEYS.CREATOR_COVERS;

    const currentScenario = calculateScenario(input, currentMode);
    const alternateScenario = calculateScenario(input, alternateMode);
    if (currentScenario.error || alternateScenario.error) {
      const errors = []
        .concat(currentScenario.errors || [])
        .concat(alternateScenario.errors || []);
      return { result: null, error: errors.join(' '), errors: errors };
    }

    const current = currentScenario.result;
    const alternate = alternateScenario.result;
    const netProfitDeltaVsAlternate = roundTo(current.monthlyNetProfit - alternate.monthlyNetProfit, 6);

    const result = {
      input: input,
      currentScenario: current,
      alternateScenario: alternate,
      currentScenarioLabel: current.modeLabel,
      alternateScenarioLabel: alternate.modeLabel,
      breakEvenAverageSupport: current.breakEvenAverageSupport,
      targetAverageSupport: current.targetAverageSupport,
      netProfitDeltaVsAlternate: netProfitDeltaVsAlternate,
      summary: '',
    };
    result.summary = buildSummary(result);

    return { result: result, error: '', errors: [] };
  }

  function buildSummary(model) {
    const input = model.input;
    const current = model.currentScenario;
    const alternate = model.alternateScenario;
    const currency = input.currency;

    return [
      '[Buy Me a Coffee Fee Calculator Summary | 바이미어커피 수수료 계산기 요약]',
      'Scenario / 시나리오: ' + current.modeLabel,
      'Transactions / 거래 수: ' + input.transactionCount,
      'Average support / 평균 후원액: ' + formatCurrency(input.averageSupportAmount, currency),
      'Creator-priced gross / 기준 후원 총액: ' + formatCurrency(current.grossSupportVolume, currency),
      'Supporter charge total / 실제 결제 총액: ' + formatCurrency(current.supporterChargeTotal, currency),
      'Platform fees / 플랫폼 수수료: ' + formatCurrency(current.platformFees, currency),
      'Card processing fees / 카드 결제 수수료: ' + formatCurrency(current.processingFees, currency),
      'Payout fees / 정산 수수료: ' + formatCurrency(current.payoutFees, currency),
      'Reward costs / 리워드 비용: ' + formatCurrency(current.rewardCosts, currency),
      'Other monthly cost / 기타 월 고정비: ' + formatCurrency(current.otherMonthlyCost, currency),
      'Take-home before operating costs / 운영비 차감 전 실수령: ' + formatCurrency(current.takeHomeBeforeOperatingCosts, currency),
      'Monthly net profit / 월 순이익: ' + formatCurrency(current.monthlyNetProfit, currency),
      'Effective creator fee drag / 크리에이터 기준 실질 수수료율: ' + formatPercent(current.effectiveCreatorFeeDragPct, 2),
      'Break-even average support / 손익분기 평균 후원액: ' + formatMaybeCurrency(model.breakEvenAverageSupport, currency),
      'Target average support / 목표 순이익 달성 평균 후원액: ' + formatMaybeCurrency(model.targetAverageSupport, currency),
      'Alternate scenario / 대안 시나리오: ' + alternate.modeLabel,
      'Alternate monthly net / 대안 월 순이익: ' + formatCurrency(alternate.monthlyNetProfit, currency),
      'Delta vs alternate / 대안 대비 차이: ' + formatCurrency(model.netProfitDeltaVsAlternate, currency),
      'Assumption note / 가정 메모: platform ' + formatPercent(input.platformFeeRatePct, 1) + ', processing ' + formatPercent(input.processingRatePct, 1) + ' + ' + formatCurrency(input.processingFixedFee, currency) + ', payout ' + formatPercent(input.payoutRatePct, 1) + '.',
      'Editable planning model only. Verify official platform and processor terms before pricing decisions.',
    ].join('\n');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const ids = {
      form: 'calculatorForm',
      errorBox: 'errorBox',
      errorText: 'errorText',
      transactionCount: 'transactionCount',
      averageSupportAmount: 'averageSupportAmount',
      coverCardFeeFromSupporters: 'coverCardFeeFromSupporters',
      platformFeeRatePct: 'platformFeeRatePct',
      processingRatePct: 'processingRatePct',
      processingFixedFee: 'processingFixedFee',
      payoutRatePct: 'payoutRatePct',
      rewardCostPerTransaction: 'rewardCostPerTransaction',
      otherMonthlyCost: 'otherMonthlyCost',
      desiredMonthlyNetProfit: 'desiredMonthlyNetProfit',
      currency: 'currency',
      lang: 'lang',
      currentScenarioLabel: 'currentScenarioLabel',
      creatorPricedGross: 'creatorPricedGross',
      supporterChargeTotal: 'supporterChargeTotal',
      platformFees: 'platformFees',
      processingFees: 'processingFees',
      payoutFees: 'payoutFees',
      rewardCosts: 'rewardCosts',
      takeHomeBeforeOperatingCosts: 'takeHomeBeforeOperatingCosts',
      monthlyNetProfit: 'monthlyNetProfit',
      effectiveCreatorFeeDragPct: 'effectiveCreatorFeeDragPct',
      breakEvenAverageSupport: 'breakEvenAverageSupport',
      targetAverageSupport: 'targetAverageSupport',
      supporterExtraChargeTotal: 'supporterExtraChargeTotal',
      takeHomePerTransactionAfterAllCosts: 'takeHomePerTransactionAfterAllCosts',
      alternateScenario: 'alternateScenario',
      alternateScenarioLabel: 'alternateScenarioLabel',
      alternateMonthlyNetProfit: 'alternateMonthlyNetProfit',
      netProfitDeltaVsAlternate: 'netProfitDeltaVsAlternate',
      alternateBreakEvenAverageSupport: 'alternateBreakEvenAverageSupport',
      alternateTargetAverageSupport: 'alternateTargetAverageSupport',
      summary: 'summary',
      copySummaryBtn: 'copySummaryBtn',
      copyStatus: 'copyStatus',
      resetDefaultsBtn: 'resetDefaultsBtn',
    };

    const refs = {};
    Object.keys(ids).forEach(function (key) {
      refs[key] = document.getElementById(ids[key]);
    });

    if (!refs.form) {
      return;
    }

    function copyStatusMessage(lang, kind) {
      if (lang === 'ko') {
        if (kind === 'ok') return '요약을 복사했습니다.';
        if (kind === 'fail') return '복사에 실패했습니다. 수동으로 복사해 주세요.';
      }
      if (kind === 'ok') return 'Summary copied.';
      if (kind === 'fail') return 'Copy failed. Please copy manually.';
      return '';
    }

    function setError(message) {
      const visible = Boolean(message);
      refs.errorBox.hidden = !visible;
      refs.errorText.textContent = visible ? message : '';
    }

    function applyDefaults() {
      refs.transactionCount.value = String(DEFAULT_INPUTS.transactionCount);
      refs.averageSupportAmount.value = String(DEFAULT_INPUTS.averageSupportAmount);
      refs.coverCardFeeFromSupporters.checked = DEFAULT_INPUTS.coverCardFeeFromSupporters;
      refs.platformFeeRatePct.value = String(DEFAULT_INPUTS.platformFeeRatePct);
      refs.processingRatePct.value = String(DEFAULT_INPUTS.processingRatePct);
      refs.processingFixedFee.value = String(DEFAULT_INPUTS.processingFixedFee);
      refs.payoutRatePct.value = String(DEFAULT_INPUTS.payoutRatePct);
      refs.rewardCostPerTransaction.value = String(DEFAULT_INPUTS.rewardCostPerTransaction);
      refs.otherMonthlyCost.value = String(DEFAULT_INPUTS.otherMonthlyCost);
      refs.desiredMonthlyNetProfit.value = String(DEFAULT_INPUTS.desiredMonthlyNetProfit);
      refs.currency.value = DEFAULT_INPUTS.currency;
      refs.lang.value = DEFAULT_INPUTS.lang;
    }

    function collectInput() {
      return {
        transactionCount: refs.transactionCount.value,
        averageSupportAmount: refs.averageSupportAmount.value,
        coverCardFeeFromSupporters: refs.coverCardFeeFromSupporters.checked,
        platformFeeRatePct: refs.platformFeeRatePct.value,
        processingRatePct: refs.processingRatePct.value,
        processingFixedFee: refs.processingFixedFee.value,
        payoutRatePct: refs.payoutRatePct.value,
        rewardCostPerTransaction: refs.rewardCostPerTransaction.value,
        otherMonthlyCost: refs.otherMonthlyCost.value,
        desiredMonthlyNetProfit: refs.desiredMonthlyNetProfit.value,
        currency: refs.currency.value,
        lang: refs.lang.value,
      };
    }

    function renderCurrencyCell(ref, value, currency) {
      ref.textContent = value == null ? 'N/A' : formatCurrency(value, currency);
    }

    function render() {
      const outcome = calculate(collectInput());
      refs.copyStatus.textContent = '';

      if (outcome.error) {
        setError(outcome.error);
        refs.summary.value = '';
        return;
      }

      setError('');

      const model = outcome.result;
      const current = model.currentScenario;
      const alternate = model.alternateScenario;
      const currency = model.input.currency;

      refs.currentScenarioLabel.textContent = current.modeLabel;
      renderCurrencyCell(refs.creatorPricedGross, current.grossSupportVolume, currency);
      renderCurrencyCell(refs.supporterChargeTotal, current.supporterChargeTotal, currency);
      renderCurrencyCell(refs.platformFees, current.platformFees, currency);
      renderCurrencyCell(refs.processingFees, current.processingFees, currency);
      renderCurrencyCell(refs.payoutFees, current.payoutFees, currency);
      renderCurrencyCell(refs.rewardCosts, current.rewardCosts, currency);
      renderCurrencyCell(refs.takeHomeBeforeOperatingCosts, current.takeHomeBeforeOperatingCosts, currency);
      renderCurrencyCell(refs.monthlyNetProfit, current.monthlyNetProfit, currency);
      refs.effectiveCreatorFeeDragPct.textContent = formatPercent(current.effectiveCreatorFeeDragPct, 2);
      renderCurrencyCell(refs.breakEvenAverageSupport, model.breakEvenAverageSupport, currency);
      renderCurrencyCell(refs.targetAverageSupport, model.targetAverageSupport, currency);
      renderCurrencyCell(refs.supporterExtraChargeTotal, current.supporterExtraChargeTotal, currency);
      renderCurrencyCell(refs.takeHomePerTransactionAfterAllCosts, current.takeHomePerTransactionAfterAllCosts, currency);

      refs.alternateScenarioLabel.textContent = alternate.modeLabel;
      renderCurrencyCell(refs.alternateMonthlyNetProfit, alternate.monthlyNetProfit, currency);
      renderCurrencyCell(refs.netProfitDeltaVsAlternate, model.netProfitDeltaVsAlternate, currency);
      renderCurrencyCell(refs.alternateBreakEvenAverageSupport, alternate.breakEvenAverageSupport, currency);
      renderCurrencyCell(refs.alternateTargetAverageSupport, alternate.targetAverageSupport, currency);
      refs.alternateScenario.dataset.mode = alternate.mode;

      refs.summary.value = model.summary;
    }

    refs.form.addEventListener('input', render);
    refs.form.addEventListener('change', render);

    refs.copySummaryBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value || '');
        refs.copyStatus.textContent = copyStatusMessage(refs.lang.value, 'ok');
      } catch (_error) {
        refs.copyStatus.textContent = copyStatusMessage(refs.lang.value, 'fail');
      }
    });

    refs.resetDefaultsBtn.addEventListener('click', function () {
      applyDefaults();
      render();
    });

    applyDefaults();
    render();
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initBrowser);
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    MODE_KEYS: MODE_KEYS,
    VALID_CURRENCIES: Array.from(VALID_CURRENCIES),
    VALID_LANGS: Array.from(VALID_LANGS),
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    toBoolean: toBoolean,
    mergeWithDefaults: mergeWithDefaults,
    getModeLabel: getModeLabel,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    validateInputs: validateInputs,
    calculateThresholds: calculateThresholds,
    calculateScenario: calculateScenario,
    calculate: calculate,
    buildSummary: buildSummary,
    initBrowser: initBrowser,
  };
});
