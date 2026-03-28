(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.PayoneerFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    grossAmount: 1000,
    targetNetAmount: 1000,
    currency: 'USD',
    receiveMethod: 'clientCard',
    withdrawalMode: 'sameCurrencyLocal',
    receiveFeeRatePct: 3.99,
    receiveFixedFee: 0,
    withdrawalFeeRatePct: 0,
    withdrawalFixedFee: 1.5,
  };

  const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'HKD']);
  const VALID_RECEIVE_METHODS = new Set(['clientCard', 'achBankDebit', 'paypalUs', 'receivingLocal', 'receivingForeign']);
  const VALID_WITHDRAWAL_MODES = new Set(['none', 'sameCurrencyLocal', 'variableRate']);

  const LOCAL_WITHDRAWAL_FIXED_FEES = {
    USD: 1.5,
    EUR: 1.5,
    GBP: 1.5,
    HKD: 12,
  };

  const RECEIVE_METHODS = {
    clientCard: {
      label: 'Client credit card',
      feeRatePct: 3.99,
      fixedFee: 0,
      note: 'Public pricing page shows up to 3.99% for client credit-card payments. Some countries may add a fixed surcharge; edit the fixed field if needed.',
    },
    achBankDebit: {
      label: 'ACH bank debit (US only)',
      feeRatePct: 1,
      fixedFee: 0,
      note: 'Public pricing page shows 1% for ACH bank debits (US only).',
    },
    paypalUs: {
      label: 'PayPal (US only)',
      feeRatePct: 3.99,
      fixedFee: 0.49,
      note: 'Public pricing page shows 3.99% + $0.49 for PayPal (US only). Keep the fixed fee editable if your account differs.',
    },
    receivingLocal: {
      label: 'Receiving account — local currency',
      feeRatePct: 0,
      fixedFee: 0,
      note: 'Public pricing page shows free receiving-account funding when you receive in the local currency of your primary location.',
    },
    receivingForeign: {
      label: 'Receiving account — other currency',
      feeRatePct: 1,
      fixedFee: 0,
      note: 'Public pricing page says fixed fee OR 1% depending on amount received. This v1 uses 1% as the editable planning baseline.',
    },
  };

  const WITHDRAWAL_MODES = {
    none: {
      label: 'No withdrawal modeled',
      feeRatePct: 0,
      fixedFee: 0,
      note: 'Use this when you only want Payoneer balance after receiving fees.',
    },
    sameCurrencyLocal: {
      label: 'Same-currency local bank withdrawal',
      feeRatePct: 0,
      fixedFee: null,
      note: 'Public examples show fixed local-bank withdrawal fees such as 1.50 USD / 1.50 EUR / 1.50 GBP / 12 HKD.',
    },
    variableRate: {
      label: 'Variable withdrawal rate',
      feeRatePct: 2,
      fixedFee: 0,
      note: 'Public pricing page shows a 1–4% variable withdrawal range depending on region and volume. This preset starts at 2% and remains editable.',
    },
  };

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getReceivePreset(receiveMethod) {
    return RECEIVE_METHODS[receiveMethod] || RECEIVE_METHODS[DEFAULT_INPUTS.receiveMethod];
  }

  function getWithdrawalPreset(withdrawalMode, currency) {
    if (withdrawalMode === 'sameCurrencyLocal') {
      return {
        label: WITHDRAWAL_MODES.sameCurrencyLocal.label,
        feeRatePct: 0,
        fixedFee: LOCAL_WITHDRAWAL_FIXED_FEES[currency] != null ? LOCAL_WITHDRAWAL_FIXED_FEES[currency] : LOCAL_WITHDRAWAL_FIXED_FEES.USD,
        note: WITHDRAWAL_MODES.sameCurrencyLocal.note,
      };
    }
    const preset = WITHDRAWAL_MODES[withdrawalMode] || WITHDRAWAL_MODES[DEFAULT_INPUTS.withdrawalMode];
    return {
      label: preset.label,
      feeRatePct: preset.feeRatePct,
      fixedFee: preset.fixedFee,
      note: preset.note,
    };
  }

  function formatCurrency(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: VALID_CURRENCIES.has(currency) ? currency : DEFAULT_INPUTS.currency,
      minimumFractionDigits: currency === 'HKD' ? 2 : 2,
      maximumFractionDigits: currency === 'HKD' ? 2 : 2,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function validateInputs(rawInput) {
    const source = Object.assign({}, DEFAULT_INPUTS, rawInput || {});
    const errors = [];

    const currency = String(source.currency == null ? '' : source.currency).trim().toUpperCase();
    if (!VALID_CURRENCIES.has(currency)) {
      errors.push('currency must be USD, EUR, GBP, or HKD.');
    }

    const receiveMethod = String(source.receiveMethod == null ? '' : source.receiveMethod).trim();
    if (!VALID_RECEIVE_METHODS.has(receiveMethod)) {
      errors.push('receiveMethod must be one of the supported Payoneer receiving presets.');
    }

    const withdrawalMode = String(source.withdrawalMode == null ? '' : source.withdrawalMode).trim();
    if (!VALID_WITHDRAWAL_MODES.has(withdrawalMode)) {
      errors.push('withdrawalMode must be none, sameCurrencyLocal, or variableRate.');
    }

    const receivePreset = getReceivePreset(VALID_RECEIVE_METHODS.has(receiveMethod) ? receiveMethod : DEFAULT_INPUTS.receiveMethod);
    const withdrawalPreset = getWithdrawalPreset(VALID_WITHDRAWAL_MODES.has(withdrawalMode) ? withdrawalMode : DEFAULT_INPUTS.withdrawalMode, VALID_CURRENCIES.has(currency) ? currency : DEFAULT_INPUTS.currency);

    const grossAmount = toFiniteNumber(source.grossAmount);
    if (grossAmount == null || grossAmount < 0) {
      errors.push('grossAmount must be at least 0.');
    }

    const targetNetAmount = toFiniteNumber(source.targetNetAmount);
    if (targetNetAmount == null || targetNetAmount < 0) {
      errors.push('targetNetAmount must be at least 0.');
    }

    const receiveFeeRatePct = hasOwn(rawInput || {}, 'receiveFeeRatePct') ? toFiniteNumber(source.receiveFeeRatePct) : receivePreset.feeRatePct;
    if (receiveFeeRatePct == null || receiveFeeRatePct < 0 || receiveFeeRatePct >= 100) {
      errors.push('receiveFeeRatePct must be between 0 and less than 100.');
    }

    const receiveFixedFee = hasOwn(rawInput || {}, 'receiveFixedFee') ? toFiniteNumber(source.receiveFixedFee) : receivePreset.fixedFee;
    if (receiveFixedFee == null || receiveFixedFee < 0) {
      errors.push('receiveFixedFee must be at least 0.');
    }

    const withdrawalFeeRatePct = hasOwn(rawInput || {}, 'withdrawalFeeRatePct') ? toFiniteNumber(source.withdrawalFeeRatePct) : withdrawalPreset.feeRatePct;
    if (withdrawalFeeRatePct == null || withdrawalFeeRatePct < 0 || withdrawalFeeRatePct >= 100) {
      errors.push('withdrawalFeeRatePct must be between 0 and less than 100.');
    }

    const withdrawalFixedFee = hasOwn(rawInput || {}, 'withdrawalFixedFee') ? toFiniteNumber(source.withdrawalFixedFee) : withdrawalPreset.fixedFee;
    if (withdrawalFixedFee == null || withdrawalFixedFee < 0) {
      errors.push('withdrawalFixedFee must be at least 0.');
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return {
      ok: true,
      errors: [],
      values: {
        grossAmount: grossAmount,
        targetNetAmount: targetNetAmount,
        currency: currency,
        receiveMethod: receiveMethod,
        withdrawalMode: withdrawalMode,
        receiveFeeRatePct: receiveFeeRatePct,
        receiveFixedFee: receiveFixedFee,
        withdrawalFeeRatePct: withdrawalFeeRatePct,
        withdrawalFixedFee: withdrawalFixedFee,
      },
    };
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const receivePreset = getReceivePreset(input.receiveMethod);
    const withdrawalPreset = getWithdrawalPreset(input.withdrawalMode, input.currency);
    const rp = input.receiveFeeRatePct / 100;
    const wp = input.withdrawalFeeRatePct / 100;

    const receiveFee = input.grossAmount > 0 ? input.grossAmount * rp + input.receiveFixedFee : 0;
    const balanceAfterReceive = input.grossAmount - receiveFee;
    const withdrawalFee = balanceAfterReceive > 0 ? balanceAfterReceive * wp + input.withdrawalFixedFee : 0;
    const bankNet = balanceAfterReceive - withdrawalFee;
    const totalFees = receiveFee + withdrawalFee;
    const effectiveTotalFeeRatePct = input.grossAmount > 0 ? (totalFees / input.grossAmount) * 100 : 0;

    const denominator = (1 - rp) * (1 - wp);
    let targetGrossForNet = null;
    if (denominator > 0) {
      targetGrossForNet = (input.targetNetAmount + input.receiveFixedFee * (1 - wp) + input.withdrawalFixedFee) / denominator;
    }

    const result = {
      input: input,
      methodLabel: receivePreset.label,
      methodNote: receivePreset.note,
      withdrawalLabel: withdrawalPreset.label,
      withdrawalNote: withdrawalPreset.note,
      receiveFee: roundTo(receiveFee, 6),
      balanceAfterReceive: roundTo(balanceAfterReceive, 6),
      withdrawalFee: roundTo(withdrawalFee, 6),
      bankNet: roundTo(bankNet, 6),
      totalFees: roundTo(totalFees, 6),
      effectiveTotalFeeRatePct: roundTo(effectiveTotalFeeRatePct, 6),
      targetGrossForNet: targetGrossForNet == null ? null : roundTo(targetGrossForNet, 6),
      summary: '',
    };

    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function buildSummary(result) {
    const input = result.input;
    const rangeNote = input.withdrawalMode === 'variableRate'
      ? 'Variable withdrawal mode uses Payoneer\'s public 1–4% range as an editable planning assumption.'
      : 'Same-currency local withdrawal mode uses the public fixed-fee examples shown on Payoneer\'s pricing page.';

    return [
      '[Payoneer Fee Calculator Summary | 페이오니아 수수료 계산기 요약]',
      'Currency / 통화: ' + input.currency,
      'Gross amount / 총 입금액: ' + formatCurrency(input.grossAmount, input.currency),
      'Receive method / 수취 방식: ' + result.methodLabel,
      'Receive fee / 수취 수수료: ' + formatCurrency(result.receiveFee, input.currency) + ' (' + formatPercent(input.receiveFeeRatePct) + ' + ' + formatCurrency(input.receiveFixedFee, input.currency) + ')',
      'Balance after receive / 수취 후 Payoneer 잔액: ' + formatCurrency(result.balanceAfterReceive, input.currency),
      'Withdrawal mode / 출금 방식: ' + result.withdrawalLabel,
      'Withdrawal fee / 출금 수수료: ' + formatCurrency(result.withdrawalFee, input.currency) + ' (' + formatPercent(input.withdrawalFeeRatePct) + ' + ' + formatCurrency(input.withdrawalFixedFee, input.currency) + ')',
      'Final bank net / 최종 은행 수령액: ' + formatCurrency(result.bankNet, input.currency),
      'Total fees / 총 수수료: ' + formatCurrency(result.totalFees, input.currency),
      'Effective total fee rate / 총 실효 수수료율: ' + formatPercent(result.effectiveTotalFeeRatePct),
      'Target bank net / 목표 은행 수령액: ' + formatCurrency(input.targetNetAmount, input.currency),
      'Gross needed for target / 목표 달성 필요 총액: ' + (result.targetGrossForNet == null ? 'N/A' : formatCurrency(result.targetGrossForNet, input.currency)),
      'Planning note / 가정 메모: ' + result.methodNote,
      'Withdrawal note / 출금 메모: ' + rangeNote,
      'This is a planning model only. Account-specific and region-specific pricing may differ inside Payoneer.',
    ].join('\n');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const ids = {
      form: 'calculatorForm',
      currency: 'currency',
      receiveMethod: 'receiveMethod',
      withdrawalMode: 'withdrawalMode',
      grossAmount: 'grossAmount',
      targetNetAmount: 'targetNetAmount',
      receiveFeeRatePct: 'receiveFeeRatePct',
      receiveFixedFee: 'receiveFixedFee',
      withdrawalFeeRatePct: 'withdrawalFeeRatePct',
      withdrawalFixedFee: 'withdrawalFixedFee',
      receiveMethodNote: 'receiveMethodNote',
      withdrawalModeNote: 'withdrawalModeNote',
      receiveFeeLabel: 'receiveFeeLabel',
      withdrawalFeeLabel: 'withdrawalFeeLabel',
      receiveFee: 'receiveFee',
      balanceAfterReceive: 'balanceAfterReceive',
      withdrawalFee: 'withdrawalFee',
      bankNet: 'bankNet',
      totalFees: 'totalFees',
      effectiveTotalFeeRatePct: 'effectiveTotalFeeRatePct',
      targetGrossForNet: 'targetGrossForNet',
      summary: 'summary',
      copyBtn: 'copySummaryBtn',
      resetBtn: 'resetDefaultsBtn',
      copyStatus: 'copyStatus',
      errorBox: 'errorBox',
      errorText: 'errorText',
    };

    const refs = {};
    Object.keys(ids).forEach(function (key) {
      refs[key] = document.getElementById(ids[key]);
    });

    if (!refs.form) {
      return;
    }

    function renderCurrency(ref, value, currency) {
      ref.textContent = value == null ? 'N/A' : formatCurrency(value, currency);
    }

    function setError(message) {
      const visible = Boolean(message);
      refs.errorBox.hidden = !visible;
      refs.errorText.textContent = visible ? message : '';
    }

    function setPresetInputs() {
      const currency = refs.currency.value;
      const receivePreset = getReceivePreset(refs.receiveMethod.value);
      const withdrawalPreset = getWithdrawalPreset(refs.withdrawalMode.value, currency);
      refs.receiveFeeRatePct.value = String(receivePreset.feeRatePct);
      refs.receiveFixedFee.value = String(receivePreset.fixedFee);
      refs.withdrawalFeeRatePct.value = String(withdrawalPreset.feeRatePct);
      refs.withdrawalFixedFee.value = String(withdrawalPreset.fixedFee);
      refs.receiveMethodNote.textContent = receivePreset.note;
      refs.withdrawalModeNote.textContent = withdrawalPreset.note;
      const variableMode = refs.withdrawalMode.value === 'variableRate';
      refs.withdrawalFeeLabel.textContent = variableMode ? 'Withdrawal fee (1–4% range modeled)' : 'Withdrawal fee';
    }

    function collectInput() {
      return {
        grossAmount: refs.grossAmount.value,
        targetNetAmount: refs.targetNetAmount.value,
        currency: refs.currency.value,
        receiveMethod: refs.receiveMethod.value,
        withdrawalMode: refs.withdrawalMode.value,
        receiveFeeRatePct: refs.receiveFeeRatePct.value,
        receiveFixedFee: refs.receiveFixedFee.value,
        withdrawalFeeRatePct: refs.withdrawalFeeRatePct.value,
        withdrawalFixedFee: refs.withdrawalFixedFee.value,
      };
    }

    function applyDefaults() {
      refs.currency.value = DEFAULT_INPUTS.currency;
      refs.receiveMethod.value = DEFAULT_INPUTS.receiveMethod;
      refs.withdrawalMode.value = DEFAULT_INPUTS.withdrawalMode;
      refs.grossAmount.value = String(DEFAULT_INPUTS.grossAmount);
      refs.targetNetAmount.value = String(DEFAULT_INPUTS.targetNetAmount);
      setPresetInputs();
    }

    function render() {
      const outcome = calculate(collectInput());
      refs.copyStatus.textContent = '';
      if (outcome.error) {
        setError(outcome.error);
        refs.summary.value = '';
        ['receiveFee', 'balanceAfterReceive', 'withdrawalFee', 'bankNet', 'totalFees', 'effectiveTotalFeeRatePct', 'targetGrossForNet'].forEach(function (key) {
          refs[key].textContent = '—';
        });
        return;
      }

      setError('');
      const result = outcome.result;
      const currency = result.input.currency;
      renderCurrency(refs.receiveFee, result.receiveFee, currency);
      renderCurrency(refs.balanceAfterReceive, result.balanceAfterReceive, currency);
      renderCurrency(refs.withdrawalFee, result.withdrawalFee, currency);
      renderCurrency(refs.bankNet, result.bankNet, currency);
      renderCurrency(refs.totalFees, result.totalFees, currency);
      refs.effectiveTotalFeeRatePct.textContent = formatPercent(result.effectiveTotalFeeRatePct);
      renderCurrency(refs.targetGrossForNet, result.targetGrossForNet, currency);
      refs.summary.value = result.summary;
      refs.receiveFeeLabel.textContent = result.methodLabel;
    }

    refs.form.addEventListener('input', render);
    refs.form.addEventListener('change', render);

    [refs.currency, refs.receiveMethod, refs.withdrawalMode].forEach(function (el) {
      el.addEventListener('change', function () {
        setPresetInputs();
        render();
      });
    });

    refs.copyBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value || '');
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (_error) {
        refs.copyStatus.textContent = 'Copy failed. Please copy manually.';
      }
    });

    refs.resetBtn.addEventListener('click', function () {
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
    VALID_CURRENCIES: Array.from(VALID_CURRENCIES),
    VALID_RECEIVE_METHODS: Array.from(VALID_RECEIVE_METHODS),
    VALID_WITHDRAWAL_MODES: Array.from(VALID_WITHDRAWAL_MODES),
    LOCAL_WITHDRAWAL_FIXED_FEES: Object.assign({}, LOCAL_WITHDRAWAL_FIXED_FEES),
    RECEIVE_METHODS: RECEIVE_METHODS,
    WITHDRAWAL_MODES: WITHDRAWAL_MODES,
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    getReceivePreset: getReceivePreset,
    getWithdrawalPreset: getWithdrawalPreset,
    validateInputs: validateInputs,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    initBrowser: initBrowser,
  };
});
