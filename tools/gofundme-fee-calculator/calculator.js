(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.GoFundMeFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    donationCount: 50,
    averageDonationAmount: 40,
    recurringMonthlyDonation: false,
    transactionFeeRatePct: 2.9,
    transactionFixedFee: 0.30,
    recurringDonorFeePct: 5,
    campaignCosts: 150,
    targetNetAmount: 3000,
    currency: 'USD',
    lang: 'en',
  };

  const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'CAD']);
  const VALID_LANGS = new Set(['en', 'ko']);

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
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
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

  function formatCurrency(value, currency) {
    const safeCurrency = VALID_CURRENCIES.has(currency) ? currency : DEFAULT_INPUTS.currency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    const donationCount = toFiniteNumber(source.donationCount);
    if (donationCount == null || donationCount < 0 || !Number.isInteger(donationCount)) {
      errors.push('donationCount must be an integer at least 0.');
    } else {
      values.donationCount = donationCount;
    }

    const averageDonationAmount = toFiniteNumber(source.averageDonationAmount);
    if (averageDonationAmount == null || averageDonationAmount < 0) {
      errors.push('averageDonationAmount must be at least 0.');
    } else {
      values.averageDonationAmount = averageDonationAmount;
    }

    values.recurringMonthlyDonation = toBoolean(source.recurringMonthlyDonation);

    const transactionFeeRatePct = toFiniteNumber(source.transactionFeeRatePct);
    if (transactionFeeRatePct == null || transactionFeeRatePct < 0 || transactionFeeRatePct >= 100) {
      errors.push('transactionFeeRatePct must be between 0 and less than 100.');
    } else {
      values.transactionFeeRatePct = transactionFeeRatePct;
    }

    const transactionFixedFee = toFiniteNumber(source.transactionFixedFee);
    if (transactionFixedFee == null || transactionFixedFee < 0) {
      errors.push('transactionFixedFee must be at least 0.');
    } else {
      values.transactionFixedFee = transactionFixedFee;
    }

    const recurringDonorFeePct = toFiniteNumber(source.recurringDonorFeePct);
    if (recurringDonorFeePct == null || recurringDonorFeePct < 0 || recurringDonorFeePct >= 100) {
      errors.push('recurringDonorFeePct must be between 0 and less than 100.');
    } else {
      values.recurringDonorFeePct = recurringDonorFeePct;
    }

    const campaignCosts = toFiniteNumber(source.campaignCosts);
    if (campaignCosts == null || campaignCosts < 0) {
      errors.push('campaignCosts must be at least 0.');
    } else {
      values.campaignCosts = campaignCosts;
    }

    const targetNetAmount = toFiniteNumber(source.targetNetAmount);
    if (targetNetAmount == null || targetNetAmount < 0) {
      errors.push('targetNetAmount must be at least 0.');
    } else {
      values.targetNetAmount = targetNetAmount;
    }

    const currency = String(source.currency == null ? '' : source.currency).trim().toUpperCase();
    if (!VALID_CURRENCIES.has(currency)) {
      errors.push('currency must be USD, EUR, GBP, or CAD.');
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

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const donationCount = input.donationCount;
    const averageDonationAmount = input.averageDonationAmount;
    const feeRate = input.transactionFeeRatePct / 100;
    const recurringRate = input.recurringDonorFeePct / 100;

    const grossDonations = donationCount * averageDonationAmount;
    const transactionFees = grossDonations * feeRate + donationCount * input.transactionFixedFee;
    const organizerNetBeforeCosts = grossDonations - transactionFees;
    const campaignNetAfterCosts = organizerNetBeforeCosts - input.campaignCosts;
    const donorExtraRecurringFee = input.recurringMonthlyDonation ? grossDonations * recurringRate : 0;
    const donorCheckoutTotal = grossDonations + donorExtraRecurringFee;
    const effectiveOrganizerFeeRatePct = grossDonations > 0 ? (transactionFees / grossDonations) * 100 : 0;
    const netPerDonationAfterCosts = donationCount > 0 ? campaignNetAfterCosts / donationCount : 0;

    let breakEvenAverageDonation = null;
    let targetAverageDonation = null;
    const denominator = donationCount * (1 - feeRate);
    if (donationCount > 0 && denominator > 0) {
      breakEvenAverageDonation = (input.campaignCosts + donationCount * input.transactionFixedFee) / denominator;
      targetAverageDonation = (input.targetNetAmount + input.campaignCosts + donationCount * input.transactionFixedFee) / denominator;
    }

    const result = {
      input: input,
      scenarioLabel: input.recurringMonthlyDonation
        ? (input.lang === 'ko' ? '월 정기후원 가정' : 'Recurring monthly donation')
        : (input.lang === 'ko' ? '일회성 후원 가정' : 'One-time donation'),
      grossDonations: roundTo(grossDonations, 6),
      transactionFees: roundTo(transactionFees, 6),
      organizerNetBeforeCosts: roundTo(organizerNetBeforeCosts, 6),
      campaignNetAfterCosts: roundTo(campaignNetAfterCosts, 6),
      donorExtraRecurringFee: roundTo(donorExtraRecurringFee, 6),
      donorCheckoutTotal: roundTo(donorCheckoutTotal, 6),
      effectiveOrganizerFeeRatePct: roundTo(effectiveOrganizerFeeRatePct, 6),
      netPerDonationAfterCosts: roundTo(netPerDonationAfterCosts, 6),
      breakEvenAverageDonation: breakEvenAverageDonation == null ? null : roundTo(breakEvenAverageDonation, 6),
      targetAverageDonation: targetAverageDonation == null ? null : roundTo(targetAverageDonation, 6),
      summary: '',
    };
    result.summary = buildSummary(result);

    return { result: result, error: '', errors: [] };
  }

  function buildSummary(result) {
    const input = result.input;
    return [
      '[GoFundMe Fee Calculator Summary | 고펀드미 수수료 계산기 요약]',
      'Scenario / 시나리오: ' + result.scenarioLabel,
      'Donation count / 후원 건수: ' + input.donationCount,
      'Average donation / 평균 후원액: ' + formatCurrency(input.averageDonationAmount, input.currency),
      'Gross donations / 총 모금액: ' + formatCurrency(result.grossDonations, input.currency),
      'Transaction fees / 결제 수수료: ' + formatCurrency(result.transactionFees, input.currency),
      'Organizer net before costs / 비용 전 실수령액: ' + formatCurrency(result.organizerNetBeforeCosts, input.currency),
      'Campaign costs / 캠페인 비용: ' + formatCurrency(input.campaignCosts, input.currency),
      'Campaign net after costs / 비용 후 순모금액: ' + formatCurrency(result.campaignNetAfterCosts, input.currency),
      'Donor extra recurring fee / 정기후원 추가 부담: ' + formatCurrency(result.donorExtraRecurringFee, input.currency),
      'Donor checkout total / 후원자 결제 총액: ' + formatCurrency(result.donorCheckoutTotal, input.currency),
      'Effective organizer fee rate / 실질 수수료율: ' + formatPercent(result.effectiveOrganizerFeeRatePct),
      'Break-even average donation / 손익분기 평균 후원액: ' + (result.breakEvenAverageDonation == null ? 'N/A' : formatCurrency(result.breakEvenAverageDonation, input.currency)),
      'Target average donation / 목표 달성 평균 후원액: ' + (result.targetAverageDonation == null ? 'N/A' : formatCurrency(result.targetAverageDonation, input.currency)),
      'Assumption note / 가정 메모: 0% platform fee to start/manage, ' + formatPercent(input.transactionFeeRatePct) + ' + ' + formatCurrency(input.transactionFixedFee, input.currency) + ' transaction fee, recurring donor fee ' + formatPercent(input.recurringDonorFeePct) + ' when enabled.',
      'This is a planning model. International or processor-specific variations are not included in v1.',
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
      donationCount: 'donationCount',
      averageDonationAmount: 'averageDonationAmount',
      recurringMonthlyDonation: 'recurringMonthlyDonation',
      transactionFeeRatePct: 'transactionFeeRatePct',
      transactionFixedFee: 'transactionFixedFee',
      recurringDonorFeePct: 'recurringDonorFeePct',
      campaignCosts: 'campaignCosts',
      targetNetAmount: 'targetNetAmount',
      currency: 'currency',
      lang: 'lang',
      scenarioLabel: 'scenarioLabel',
      grossDonations: 'grossDonations',
      transactionFees: 'transactionFees',
      organizerNetBeforeCosts: 'organizerNetBeforeCosts',
      campaignNetAfterCosts: 'campaignNetAfterCosts',
      donorExtraRecurringFee: 'donorExtraRecurringFee',
      donorCheckoutTotal: 'donorCheckoutTotal',
      effectiveOrganizerFeeRatePct: 'effectiveOrganizerFeeRatePct',
      netPerDonationAfterCosts: 'netPerDonationAfterCosts',
      breakEvenAverageDonation: 'breakEvenAverageDonation',
      targetAverageDonation: 'targetAverageDonation',
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

    function setError(message) {
      const visible = Boolean(message);
      refs.errorBox.hidden = !visible;
      refs.errorText.textContent = visible ? message : '';
    }

    function applyDefaults() {
      refs.donationCount.value = String(DEFAULT_INPUTS.donationCount);
      refs.averageDonationAmount.value = String(DEFAULT_INPUTS.averageDonationAmount);
      refs.recurringMonthlyDonation.checked = DEFAULT_INPUTS.recurringMonthlyDonation;
      refs.transactionFeeRatePct.value = String(DEFAULT_INPUTS.transactionFeeRatePct);
      refs.transactionFixedFee.value = String(DEFAULT_INPUTS.transactionFixedFee);
      refs.recurringDonorFeePct.value = String(DEFAULT_INPUTS.recurringDonorFeePct);
      refs.campaignCosts.value = String(DEFAULT_INPUTS.campaignCosts);
      refs.targetNetAmount.value = String(DEFAULT_INPUTS.targetNetAmount);
      refs.currency.value = DEFAULT_INPUTS.currency;
      refs.lang.value = DEFAULT_INPUTS.lang;
    }

    function collectInput() {
      return {
        donationCount: refs.donationCount.value,
        averageDonationAmount: refs.averageDonationAmount.value,
        recurringMonthlyDonation: refs.recurringMonthlyDonation.checked,
        transactionFeeRatePct: refs.transactionFeeRatePct.value,
        transactionFixedFee: refs.transactionFixedFee.value,
        recurringDonorFeePct: refs.recurringDonorFeePct.value,
        campaignCosts: refs.campaignCosts.value,
        targetNetAmount: refs.targetNetAmount.value,
        currency: refs.currency.value,
        lang: refs.lang.value,
      };
    }

    function renderCurrency(ref, value, currency) {
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
      const result = outcome.result;
      const currency = result.input.currency;
      refs.scenarioLabel.textContent = result.scenarioLabel;
      renderCurrency(refs.grossDonations, result.grossDonations, currency);
      renderCurrency(refs.transactionFees, result.transactionFees, currency);
      renderCurrency(refs.organizerNetBeforeCosts, result.organizerNetBeforeCosts, currency);
      renderCurrency(refs.campaignNetAfterCosts, result.campaignNetAfterCosts, currency);
      renderCurrency(refs.donorExtraRecurringFee, result.donorExtraRecurringFee, currency);
      renderCurrency(refs.donorCheckoutTotal, result.donorCheckoutTotal, currency);
      refs.effectiveOrganizerFeeRatePct.textContent = formatPercent(result.effectiveOrganizerFeeRatePct);
      renderCurrency(refs.netPerDonationAfterCosts, result.netPerDonationAfterCosts, currency);
      renderCurrency(refs.breakEvenAverageDonation, result.breakEvenAverageDonation, currency);
      renderCurrency(refs.targetAverageDonation, result.targetAverageDonation, currency);
      refs.summary.value = result.summary;
    }

    refs.form.addEventListener('input', render);
    refs.form.addEventListener('change', render);

    refs.copySummaryBtn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(refs.summary.value || '');
        refs.copyStatus.textContent = refs.lang.value === 'ko' ? '요약을 복사했습니다.' : 'Summary copied.';
      } catch (_error) {
        refs.copyStatus.textContent = refs.lang.value === 'ko' ? '복사에 실패했습니다. 수동 복사해 주세요.' : 'Copy failed. Please copy manually.';
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
    VALID_CURRENCIES: Array.from(VALID_CURRENCIES),
    VALID_LANGS: Array.from(VALID_LANGS),
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    toBoolean: toBoolean,
    mergeWithDefaults: mergeWithDefaults,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    validateInputs: validateInputs,
    calculate: calculate,
    buildSummary: buildSummary,
    initBrowser: initBrowser,
  };
});
