(function (root) {
  'use strict';

  var SERVICE_FEE_RATE = 0.05;
  var INTERNATIONAL_SURCHARGE_RATE = 0.035;

  var PRESETS = [
    { id: 'creator-average', label: { en: 'Creator covers · average', ko: '크리에이터 부담 · 평균' }, ratePct: 4.99, flatFee: 0.30, creatorPays: true },
    { id: 'creator-over-25', label: { en: 'Creator covers · avg over $25', ko: '크리에이터 부담 · 25달러 이상 평균' }, ratePct: 6.22, flatFee: 0.30, creatorPays: true },
    { id: 'creator-floor', label: { en: 'Creator covers · floor range', ko: '크리에이터 부담 · 하한 범위' }, ratePct: 3.00, flatFee: 0.30, creatorPays: true },
    { id: 'creator-ceiling', label: { en: 'Creator covers · ceiling range', ko: '크리에이터 부담 · 상한 범위' }, ratePct: 7.00, flatFee: 0.40, creatorPays: true },
    { id: 'subscriber-covers', label: { en: 'Subscriber covers processing', ko: '구독자가 결제 처리 수수료 부담' }, ratePct: 0, flatFee: 0, creatorPays: false },
    { id: 'custom', label: { en: 'Custom', ko: '커스텀' }, ratePct: null, flatFee: null, creatorPays: true }
  ];

  var DEFAULTS = {
    monthlyBilledRevenue: 4500,
    successfulCharges: 320,
    refundRatePct: 2,
    feePreset: 'creator-average',
    customRatePct: 4.99,
    customFlatFee: 0.30,
    internationalSurcharge: false,
    reserveEnabled: false,
    reserveRatePct: 10,
    payoutRatePct: 0,
    payoutFlatFee: 0,
    payoutCount: 1,
    otherMonthlyCost: 250,
    desiredMonthlyCash: 4000
  };

  var TEXT = {
    en: {
      toolName: 'SubscribeStar Fee Calculator',
      summaryTitle: '[SubscribeStar Fee Calculator Summary]',
      errMoney: 'Money fields must be zero or above.',
      errCount: 'Charge and payout counts must be whole numbers zero or above.',
      errRates: 'Rates must be zero or above and below 100%.',
      errPreset: 'Choose a valid fee preset.',
      waiting: 'Enter your assumptions to calculate SubscribeStar take-home.',
      negativeCash: 'Cash available now is negative under the current assumptions.',
      invalidMargin: 'Break-even and target gross are unavailable because the cash margin is zero or negative.',
      reserveNote: 'Rolling reserve is modeled as cash held back, not a permanent loss.',
      copySuccess: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Copy manually.',
      na: 'N/A',
      impossible: 'Unavailable'
    },
    ko: {
      toolName: 'SubscribeStar 수수료 계산기',
      summaryTitle: '[SubscribeStar 수수료 계산기 요약]',
      errMoney: '금액 입력값은 0 이상이어야 합니다.',
      errCount: '결제 수와 정산 횟수는 0 이상의 정수여야 합니다.',
      errRates: '비율 입력값은 0 이상 100 미만이어야 합니다.',
      errPreset: '유효한 수수료 프리셋을 선택하세요.',
      waiting: '가정을 입력하면 SubscribeStar 실수령액이 계산됩니다.',
      negativeCash: '현재 가정에서는 당월 가용 현금이 음수입니다.',
      invalidMargin: '현금 마진이 0 이하라서 손익분기/목표 매출을 계산할 수 없습니다.',
      reserveNote: '롤링 리저브는 영구 손실이 아니라 일시적 현금 보류로 모델링했습니다.',
      copySuccess: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      na: 'N/A',
      impossible: '계산 불가'
    }
  };

  function round(value, digits) {
    var factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function toNumber(value, fallback) {
    if (value === '' || value == null) return fallback;
    var numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function toInt(value, fallback) {
    if (value === '' || value == null) return fallback;
    var numeric = Number(value);
    return Number.isFinite(numeric) ? Math.trunc(numeric) : fallback;
  }

  function getPreset(id) {
    for (var i = 0; i < PRESETS.length; i += 1) {
      if (PRESETS[i].id === id) return PRESETS[i];
    }
    return null;
  }

  function normalize(input) {
    var presetId = input.feePreset || DEFAULTS.feePreset;
    return {
      monthlyBilledRevenue: toNumber(input.monthlyBilledRevenue, DEFAULTS.monthlyBilledRevenue),
      successfulCharges: toNumber(input.successfulCharges, DEFAULTS.successfulCharges),
      refundRatePct: toNumber(input.refundRatePct, DEFAULTS.refundRatePct),
      feePreset: presetId,
      customRatePct: toNumber(input.customRatePct, DEFAULTS.customRatePct),
      customFlatFee: toNumber(input.customFlatFee, DEFAULTS.customFlatFee),
      internationalSurcharge: Boolean(input.internationalSurcharge),
      reserveEnabled: Boolean(input.reserveEnabled),
      reserveRatePct: toNumber(input.reserveRatePct, DEFAULTS.reserveRatePct),
      payoutRatePct: toNumber(input.payoutRatePct, DEFAULTS.payoutRatePct),
      payoutFlatFee: toNumber(input.payoutFlatFee, DEFAULTS.payoutFlatFee),
      payoutCount: toNumber(input.payoutCount, DEFAULTS.payoutCount),
      otherMonthlyCost: toNumber(input.otherMonthlyCost, DEFAULTS.otherMonthlyCost),
      desiredMonthlyCash: toNumber(input.desiredMonthlyCash, DEFAULTS.desiredMonthlyCash)
    };
  }

  function validate(values, lang) {
    var t = TEXT[lang] || TEXT.en;
    if (!getPreset(values.feePreset)) return t.errPreset;

    var moneyFields = [
      values.monthlyBilledRevenue,
      values.customFlatFee,
      values.payoutFlatFee,
      values.otherMonthlyCost,
      values.desiredMonthlyCash
    ];
    for (var i = 0; i < moneyFields.length; i += 1) {
      if (!Number.isFinite(moneyFields[i]) || moneyFields[i] < 0) return t.errMoney;
    }

    var rateFields = [
      values.refundRatePct,
      values.customRatePct,
      values.reserveRatePct,
      values.payoutRatePct
    ];
    for (var j = 0; j < rateFields.length; j += 1) {
      if (!Number.isFinite(rateFields[j]) || rateFields[j] < 0 || rateFields[j] >= 100) return t.errRates;
    }

    if (!Number.isFinite(values.successfulCharges) || values.successfulCharges < 0 || Math.trunc(values.successfulCharges) !== values.successfulCharges) {
      return t.errCount;
    }
    if (!Number.isFinite(values.payoutCount) || values.payoutCount < 0 || Math.trunc(values.payoutCount) !== values.payoutCount) {
      return t.errCount;
    }

    return '';
  }

  function resolveProcessing(values) {
    var preset = getPreset(values.feePreset);
    var creatorPays = preset.creatorPays;
    var baseRatePct = preset.id === 'custom' ? values.customRatePct : preset.ratePct;
    var flatFee = preset.id === 'custom' ? values.customFlatFee : preset.flatFee;
    var effectiveRatePct = creatorPays && values.internationalSurcharge ? baseRatePct + (INTERNATIONAL_SURCHARGE_RATE * 100) : baseRatePct;
    return {
      preset: preset,
      creatorPays: creatorPays,
      baseRatePct: baseRatePct,
      effectiveRatePct: creatorPays ? effectiveRatePct : 0,
      flatFee: creatorPays ? flatFee : 0
    };
  }

  function scenarioInput(values, presetId) {
    return {
      monthlyBilledRevenue: values.monthlyBilledRevenue,
      successfulCharges: values.successfulCharges,
      refundRatePct: values.refundRatePct,
      feePreset: presetId,
      customRatePct: values.customRatePct,
      customFlatFee: values.customFlatFee,
      internationalSurcharge: values.internationalSurcharge,
      reserveEnabled: values.reserveEnabled,
      reserveRatePct: values.reserveRatePct,
      payoutRatePct: values.payoutRatePct,
      payoutFlatFee: values.payoutFlatFee,
      payoutCount: values.payoutCount,
      otherMonthlyCost: values.otherMonthlyCost,
      desiredMonthlyCash: values.desiredMonthlyCash
    };
  }

  function computeScenario(rawInput, options) {
    var lang = options && options.lang ? options.lang : 'en';
    var skipScenarioTable = options && options.skipScenarioTable;
    var t = TEXT[lang] || TEXT.en;
    var values = normalize(rawInput || {});
    var error = validate(values, lang);
    if (error) return { result: null, error: error };

    var processing = resolveProcessing(values);
    var gross = values.monthlyBilledRevenue;
    var charges = values.successfulCharges;
    var refundRate = values.refundRatePct / 100;
    var reserveRate = values.reserveEnabled ? values.reserveRatePct / 100 : 0;
    var payoutRate = values.payoutRatePct / 100;
    var creatorProcessingRate = processing.effectiveRatePct / 100;
    var avgCharge = charges > 0 ? gross / charges : null;

    var platformFee = gross * SERVICE_FEE_RATE;
    var processingFee = gross * creatorProcessingRate + charges * processing.flatFee;
    var refundLoss = gross * refundRate;
    var balanceBeforeReserve = gross - platformFee - processingFee - refundLoss;
    var reserveHold = values.reserveEnabled && balanceBeforeReserve > 0 ? balanceBeforeReserve * reserveRate : 0;
    var payoutBase = balanceBeforeReserve - reserveHold;
    var payoutFees = payoutBase > 0 ? payoutBase * payoutRate + values.payoutCount * values.payoutFlatFee : 0;
    var cashAvailableNow = payoutBase - payoutFees - values.otherMonthlyCost;
    var economicNet = balanceBeforeReserve - payoutFees - values.otherMonthlyCost;
    var annualizedCashNow = cashAvailableNow * 12;

    var flatFeeRate = (avgCharge && avgCharge > 0) ? processing.flatFee / avgCharge : null;
    var preReserveMarginRate = flatFeeRate == null ? null : 1 - refundRate - SERVICE_FEE_RATE - creatorProcessingRate - flatFeeRate;
    var cashMarginRate = preReserveMarginRate == null ? null : preReserveMarginRate * (1 - reserveRate) * (1 - payoutRate);
    var baseFixedCosts = (values.payoutCount * values.payoutFlatFee) + values.otherMonthlyCost;
    var breakEvenGross = null;
    var targetGross = null;
    var targetGap = null;

    if (cashMarginRate != null && cashMarginRate > 0 && avgCharge != null && avgCharge > 0) {
      breakEvenGross = baseFixedCosts / cashMarginRate;
      targetGross = (values.desiredMonthlyCash + baseFixedCosts) / cashMarginRate;
      targetGap = Math.max(targetGross - gross, 0);
    }

    var warnings = [];
    if (cashAvailableNow < 0) warnings.push(t.negativeCash);
    if (cashMarginRate == null || cashMarginRate <= 0) warnings.push(t.invalidMargin);
    if (values.reserveEnabled) warnings.push(t.reserveNote);

    var result = {
      inputs: values,
      feePresetLabel: processing.preset.label[lang] || processing.preset.label.en,
      creatorPaysProcessing: processing.creatorPays,
      creatorProcessingRatePct: round2(processing.effectiveRatePct),
      creatorProcessingFlatFee: round2(processing.flatFee),
      gross: round2(gross),
      platformFee: round2(platformFee),
      processingFee: round2(processingFee),
      refundLoss: round2(refundLoss),
      balanceBeforeReserve: round2(balanceBeforeReserve),
      reserveHold: round2(reserveHold),
      payoutBase: round2(payoutBase),
      payoutFees: round2(payoutFees),
      cashAvailableNow: round2(cashAvailableNow),
      economicNet: round2(economicNet),
      annualizedCashNow: round2(annualizedCashNow),
      averageChargeAmount: avgCharge == null ? null : round2(avgCharge),
      effectiveCashKeepRate: gross > 0 ? round4(cashAvailableNow / gross) : 0,
      effectiveCashKeepRatePct: gross > 0 ? round2((cashAvailableNow / gross) * 100) : 0,
      breakEvenGross: breakEvenGross == null ? null : round2(breakEvenGross),
      targetGross: targetGross == null ? null : round2(targetGross),
      targetGap: targetGap == null ? null : round2(targetGap),
      warnings: warnings,
      scenarioRows: [],
      summary: ''
    };

    if (!skipScenarioTable) {
      var scenarioIds = ['creator-average', 'creator-over-25', 'subscriber-covers'];
      for (var s = 0; s < scenarioIds.length; s += 1) {
        var row = computeScenario(scenarioInput(values, scenarioIds[s]), { lang: lang, skipScenarioTable: true });
        if (!row.error && row.result) {
          result.scenarioRows.push({
            id: scenarioIds[s],
            label: row.result.feePresetLabel,
            processingRatePct: row.result.creatorProcessingRatePct,
            cashAvailableNow: row.result.cashAvailableNow,
            economicNet: row.result.economicNet,
            effectiveCashKeepRatePct: row.result.effectiveCashKeepRatePct
          });
        }
      }
      if (values.feePreset === 'custom') {
        result.scenarioRows.push({
          id: 'custom',
          label: processing.preset.label[lang] || processing.preset.label.en,
          processingRatePct: result.creatorProcessingRatePct,
          cashAvailableNow: result.cashAvailableNow,
          economicNet: result.economicNet,
          effectiveCashKeepRatePct: result.effectiveCashKeepRatePct
        });
      }
    }

    result.summary = buildSummary(result, lang);
    return { result: result, error: '' };
  }

  function formatMoney(amount) {
    if (amount == null || !Number.isFinite(amount)) return 'N/A';
    return '$' + amount.toFixed(2);
  }

  function buildSummary(result, lang) {
    var t = TEXT[lang] || TEXT.en;
    var lines = [
      t.summaryTitle,
      (lang === 'ko' ? '월 청구 매출' : 'Monthly billed revenue') + ': ' + formatMoney(result.gross),
      (lang === 'ko' ? '프리셋' : 'Preset') + ': ' + result.feePresetLabel,
      (lang === 'ko' ? '플랫폼 수수료 5%' : 'Platform fee 5%') + ': ' + formatMoney(result.platformFee),
      (lang === 'ko' ? '크리에이터 부담 결제 처리비' : 'Creator-side processing fee') + ': ' + formatMoney(result.processingFee),
      (lang === 'ko' ? '환불 손실' : 'Refund loss') + ': ' + formatMoney(result.refundLoss),
      (lang === 'ko' ? '리저브 전 잔액' : 'Balance before reserve') + ': ' + formatMoney(result.balanceBeforeReserve),
      (lang === 'ko' ? '리저브 보류액' : 'Reserve hold') + ': ' + formatMoney(result.reserveHold),
      (lang === 'ko' ? '정산 수수료' : 'Payout fees') + ': ' + formatMoney(result.payoutFees),
      (lang === 'ko' ? '당월 가용 현금' : 'Cash available now') + ': ' + formatMoney(result.cashAvailableNow),
      (lang === 'ko' ? '리저브 해제 후 경제적 순이익' : 'Economic net after reserve release') + ': ' + formatMoney(result.economicNet),
      (lang === 'ko' ? '실효 현금 유지율' : 'Effective cash keep rate') + ': ' + result.effectiveCashKeepRatePct.toFixed(2) + '%',
      (lang === 'ko' ? '손익분기 청구 매출' : 'Break-even billed revenue') + ': ' + (result.breakEvenGross == null ? t.impossible : formatMoney(result.breakEvenGross)),
      (lang === 'ko' ? '목표 현금 달성 필요 매출' : 'Required billed revenue for target cash') + ': ' + (result.targetGross == null ? t.impossible : formatMoney(result.targetGross)),
      '',
      lang === 'ko'
        ? '참고: SubscribeStar 공개 요금은 변동 가능하며, 리저브는 현금 보류로만 취급했습니다.'
        : 'Note: SubscribeStar public fees vary over time, and reserve is treated as a cash hold rather than a permanent loss.'
    ];
    return lines.join('\n');
  }

  function getStateFromDom(doc) {
    return {
      monthlyBilledRevenue: doc.getElementById('monthlyBilledRevenue').value,
      successfulCharges: doc.getElementById('successfulCharges').value,
      refundRatePct: doc.getElementById('refundRatePct').value,
      feePreset: doc.getElementById('feePreset').value,
      customRatePct: doc.getElementById('customRatePct').value,
      customFlatFee: doc.getElementById('customFlatFee').value,
      internationalSurcharge: doc.getElementById('internationalSurcharge').checked,
      reserveEnabled: doc.getElementById('reserveEnabled').checked,
      reserveRatePct: doc.getElementById('reserveRatePct').value,
      payoutRatePct: doc.getElementById('payoutRatePct').value,
      payoutFlatFee: doc.getElementById('payoutFlatFee').value,
      payoutCount: doc.getElementById('payoutCount').value,
      otherMonthlyCost: doc.getElementById('otherMonthlyCost').value,
      desiredMonthlyCash: doc.getElementById('desiredMonthlyCash').value
    };
  }

  function formatCurrency(amount) {
    if (amount == null || !Number.isFinite(amount)) return 'N/A';
    var sign = amount < 0 ? '-' : '';
    return sign + '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatPct(amount) {
    if (amount == null || !Number.isFinite(amount)) return 'N/A';
    return amount.toFixed(2) + '%';
  }

  function applyTranslations(doc, lang) {
    var nodes = doc.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i += 1) {
      var token = nodes[i].getAttribute('data-i18n');
      var value = nodes[i].getAttribute('data-i18n-' + lang);
      if (value != null) nodes[i].textContent = value;
    }
    doc.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    doc.title = lang === 'ko' ? 'SubscribeStar 수수료 계산기' : 'SubscribeStar Fee Calculator';
  }

  function renderResult(doc, payload, lang) {
    var t = TEXT[lang] || TEXT.en;
    var errorBox = doc.getElementById('error');
    var statusBox = doc.getElementById('status');
    var summary = doc.getElementById('summary');

    if (payload.error) {
      errorBox.textContent = payload.error;
      errorBox.classList.add('show');
      statusBox.textContent = t.waiting;
      statusBox.className = 'status';
      summary.value = '';
      return;
    }

    errorBox.classList.remove('show');
    var result = payload.result;

    doc.getElementById('platformFee').textContent = formatCurrency(result.platformFee);
    doc.getElementById('processingFee').textContent = formatCurrency(result.processingFee);
    doc.getElementById('reserveHold').textContent = formatCurrency(result.reserveHold);
    doc.getElementById('cashAvailableNow').textContent = formatCurrency(result.cashAvailableNow);
    doc.getElementById('economicNet').textContent = formatCurrency(result.economicNet);
    doc.getElementById('annualizedCashNow').textContent = formatCurrency(result.annualizedCashNow);
    doc.getElementById('averageChargeAmount').textContent = result.averageChargeAmount == null ? t.na : formatCurrency(result.averageChargeAmount);
    doc.getElementById('refundLoss').textContent = formatCurrency(result.refundLoss);
    doc.getElementById('balanceBeforeReserve').textContent = formatCurrency(result.balanceBeforeReserve);
    doc.getElementById('payoutFees').textContent = formatCurrency(result.payoutFees);
    doc.getElementById('keepRate').textContent = formatPct(result.effectiveCashKeepRatePct);
    doc.getElementById('breakEvenGross').textContent = result.breakEvenGross == null ? t.impossible : formatCurrency(result.breakEvenGross);
    doc.getElementById('targetGross').textContent = result.targetGross == null ? t.impossible : formatCurrency(result.targetGross);
    doc.getElementById('targetGap').textContent = result.targetGap == null ? t.impossible : formatCurrency(result.targetGap);

    var scenarioBody = doc.getElementById('scenarioBody');
    scenarioBody.innerHTML = '';
    for (var i = 0; i < result.scenarioRows.length; i += 1) {
      var row = result.scenarioRows[i];
      var tr = doc.createElement('tr');
      tr.innerHTML = '<td>' + row.label + '</td><td>' + formatPct(row.processingRatePct) + '</td><td>' + formatCurrency(row.cashAvailableNow) + '</td><td>' + formatCurrency(row.economicNet) + '</td><td>' + formatPct(row.effectiveCashKeepRatePct) + '</td>';
      scenarioBody.appendChild(tr);
    }

    summary.value = result.summary;
    if (result.warnings.length) {
      statusBox.textContent = result.warnings.join(' ');
      statusBox.className = 'status warn';
    } else {
      statusBox.textContent = lang === 'ko' ? '입력값을 반영해 결과를 갱신했습니다.' : 'Updated with your current assumptions.';
      statusBox.className = 'status good';
    }
  }

  function syncVisibility(doc) {
    var feePreset = doc.getElementById('feePreset').value;
    var isCustom = feePreset === 'custom';
    var customFields = doc.querySelectorAll('.custom-processing');
    for (var i = 0; i < customFields.length; i += 1) {
      customFields[i].style.display = isCustom ? 'grid' : 'none';
    }
  }

  function initDom(doc) {
    if (!doc || !doc.getElementById) return;
    var lang = 'en';
    var langBtn = doc.getElementById('langBtn');
    var form = doc.getElementById('calculatorForm');
    var resetBtn = doc.getElementById('resetDefaults');
    var copyBtn = doc.getElementById('copySummary');
    var inputs = form.querySelectorAll('input, select');

    function render() {
      applyTranslations(doc, lang);
      syncVisibility(doc);
      var payload = computeScenario(getStateFromDom(doc), { lang: lang });
      renderResult(doc, payload, lang);
      langBtn.textContent = lang === 'en' ? 'KO' : 'EN';
    }

    for (var i = 0; i < inputs.length; i += 1) {
      inputs[i].addEventListener('input', render);
      inputs[i].addEventListener('change', render);
    }

    langBtn.addEventListener('click', function () {
      lang = lang === 'en' ? 'ko' : 'en';
      render();
    });

    resetBtn.addEventListener('click', function () {
      form.reset();
      doc.getElementById('monthlyBilledRevenue').value = DEFAULTS.monthlyBilledRevenue;
      doc.getElementById('successfulCharges').value = DEFAULTS.successfulCharges;
      doc.getElementById('refundRatePct').value = DEFAULTS.refundRatePct;
      doc.getElementById('feePreset').value = DEFAULTS.feePreset;
      doc.getElementById('customRatePct').value = DEFAULTS.customRatePct;
      doc.getElementById('customFlatFee').value = DEFAULTS.customFlatFee;
      doc.getElementById('reserveRatePct').value = DEFAULTS.reserveRatePct;
      doc.getElementById('payoutRatePct').value = DEFAULTS.payoutRatePct;
      doc.getElementById('payoutFlatFee').value = DEFAULTS.payoutFlatFee;
      doc.getElementById('payoutCount').value = DEFAULTS.payoutCount;
      doc.getElementById('otherMonthlyCost').value = DEFAULTS.otherMonthlyCost;
      doc.getElementById('desiredMonthlyCash').value = DEFAULTS.desiredMonthlyCash;
      doc.getElementById('internationalSurcharge').checked = DEFAULTS.internationalSurcharge;
      doc.getElementById('reserveEnabled').checked = DEFAULTS.reserveEnabled;
      render();
    });

    copyBtn.addEventListener('click', function () {
      var text = doc.getElementById('summary').value;
      var statusBox = doc.getElementById('status');
      if (!root.navigator || !root.navigator.clipboard || !root.navigator.clipboard.writeText) {
        statusBox.textContent = (TEXT[lang] || TEXT.en).copyFail;
        statusBox.className = 'status warn';
        return;
      }
      root.navigator.clipboard.writeText(text).then(function () {
        statusBox.textContent = (TEXT[lang] || TEXT.en).copySuccess;
        statusBox.className = 'status good';
      }).catch(function () {
        statusBox.textContent = (TEXT[lang] || TEXT.en).copyFail;
        statusBox.className = 'status warn';
      });
    });

    render();
  }

  var api = {
    DEFAULTS: DEFAULTS,
    PRESETS: PRESETS,
    SERVICE_FEE_RATE: SERVICE_FEE_RATE,
    INTERNATIONAL_SURCHARGE_RATE: INTERNATIONAL_SURCHARGE_RATE,
    TEXT: TEXT,
    normalize: normalize,
    validate: validate,
    resolveProcessing: resolveProcessing,
    computeScenario: computeScenario,
    buildSummary: buildSummary,
    initDom: initDom
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.SubscribeStarCalc = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { initDom(document); });
    } else {
      initDom(document);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
