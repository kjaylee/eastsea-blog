(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.MarketplaceFeeProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = Object.freeze({
    price: 42000,
    cogs: 15000,
    shipping: 3200,
    adSpend: 2800,
    marketRate: 12,
    marketFixed: 400,
    paymentRate: 3.2,
    paymentFixed: 120,
    returnRate: 6,
    returnLoss: 4500,
    targetMargin: 15,
  });

  const COST_FIELDS = ['cogs', 'shipping', 'adSpend', 'marketFixed', 'paymentFixed', 'returnLoss'];
  const PERCENT_FIELDS = ['marketRate', 'paymentRate', 'returnRate'];

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const normalized = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    const price = toFiniteNumber(source.price);
    if (price == null || !(price > 0)) {
      errors.push('판매가는 0보다 커야 합니다.');
    } else {
      values.price = price;
    }

    COST_FIELDS.forEach((field) => {
      const parsed = toFiniteNumber(source[field]);
      if (parsed == null || parsed < 0) {
        errors.push(field + ' 값은 0 이상이어야 합니다.');
      } else {
        values[field] = parsed;
      }
    });

    PERCENT_FIELDS.forEach((field) => {
      const parsed = toFiniteNumber(source[field]);
      if (parsed == null || parsed < 0 || parsed >= 100) {
        errors.push(field + ' 값은 0 이상 100 미만이어야 합니다.');
      } else {
        values[field] = parsed;
      }
    });

    const targetMargin = toFiniteNumber(source.targetMargin);
    if (targetMargin == null || targetMargin < 0 || targetMargin >= 95) {
      errors.push('목표 순마진은 0% 이상 95% 미만이어야 합니다.');
    } else {
      values.targetMargin = targetMargin;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function compute(validInput) {
    const v = mergeWithDefaults(validInput);
    const r = v.returnRate / 100;
    const mp = v.marketRate / 100;
    const pp = v.paymentRate / 100;
    const tm = v.targetMargin / 100;

    const marketFee = v.price * mp + v.marketFixed;
    const paymentFee = v.price * pp + v.paymentFixed;
    const feeBurden = marketFee + paymentFee;
    const expectedRevenue = v.price * (1 - r);
    const expectedReturnLoss = r * v.returnLoss;
    const baseCost = v.cogs + v.shipping + v.adSpend;
    const expectedProfit = expectedRevenue - (baseCost + feeBurden + expectedReturnLoss);
    const expectedMargin = (expectedProfit / v.price) * 100;
    const kFactor = (1 - r) - (mp + pp);

    if (kFactor <= 0) {
      throw new Error('현재 수수료/반품 조합에서는 가격이 올라도 손익분기 계산이 불가능합니다.');
    }

    const breakEvenPrice = (baseCost + v.marketFixed + v.paymentFixed + expectedReturnLoss) / kFactor;
    const targetDenom = kFactor - tm;
    if (targetDenom <= 0) {
      throw new Error('목표 마진이 너무 높아 달성 가격을 계산할 수 없습니다. 목표 마진을 낮추세요.');
    }

    const targetPrice = (baseCost + v.marketFixed + v.paymentFixed + expectedReturnLoss) / targetDenom;

    return {
      input: Object.assign({}, v),
      marketFee: roundTo(marketFee, 6),
      paymentFee: roundTo(paymentFee, 6),
      feeBurden: roundTo(feeBurden, 6),
      expectedRevenue: roundTo(expectedRevenue, 6),
      expectedReturnLoss: roundTo(expectedReturnLoss, 6),
      baseCost: roundTo(baseCost, 6),
      expectedProfit: roundTo(expectedProfit, 6),
      expectedMargin: roundTo(expectedMargin, 6),
      breakEvenPrice: roundTo(breakEvenPrice, 6),
      targetPrice: roundTo(targetPrice, 6),
      kFactor: roundTo(kFactor, 6),
      summary: '',
    };
  }

  function formatCurrency(value) {
    if (value == null || !Number.isFinite(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercent(value, digits) {
    if (value == null || !Number.isFinite(value)) {
      return 'N/A';
    }
    return Number(value).toLocaleString('ko-KR', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits == null ? 2 : digits,
    }) + '%';
  }

  function buildSummary(result) {
    return [
      '[Marketplace Fee Profit 요약]',
      '기대 실현매출/주문: ' + formatCurrency(result.expectedRevenue),
      '기대 순이익/주문: ' + formatCurrency(result.expectedProfit),
      '기대 순마진: ' + formatPercent(result.expectedMargin, 2),
      '주문당 총 수수료 부담: ' + formatCurrency(result.feeBurden),
      '손익분기 판매가: ' + formatCurrency(result.breakEvenPrice),
      '목표 마진(' + Number(result.input.targetMargin).toLocaleString('ko-KR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + '%) 판매가: ' + formatCurrency(result.targetPrice),
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    try {
      const result = compute(validation.values);
      result.summary = buildSummary(result);
      return { result: result, error: '', errors: [] };
    } catch (error) {
      const message = error && error.message ? error.message : '계산 중 오류가 발생했습니다.';
      return { result: null, error: message, errors: [message] };
    }
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const $ = function (id) { return document.getElementById(id); };
    const refs = {
      price: $('price'),
      cogs: $('cogs'),
      shipping: $('shipping'),
      adSpend: $('adSpend'),
      marketRate: $('marketRate'),
      marketFixed: $('marketFixed'),
      paymentRate: $('paymentRate'),
      paymentFixed: $('paymentFixed'),
      returnRate: $('returnRate'),
      returnLoss: $('returnLoss'),
      targetMargin: $('targetMargin'),
      expectedProfit: $('expectedProfit'),
      expectedMargin: $('expectedMargin'),
      feeBurden: $('feeBurden'),
      breakEvenPrice: $('breakEvenPrice'),
      targetPrice: $('targetPrice'),
      expectedRevenue: $('expectedRevenue'),
      marketFeeOut: $('marketFeeOut'),
      paymentFeeOut: $('paymentFeeOut'),
      expectedReturnLoss: $('expectedReturnLoss'),
      baseCostOut: $('baseCostOut'),
      kFactor: $('kFactor'),
      status: $('status'),
      error: $('error'),
      summary: $('summary'),
      copy: $('copy'),
      reset: $('reset'),
    };

    if (!refs.price || !refs.summary || !refs.copy || !refs.reset) {
      return;
    }

    const inputRefs = [
      refs.price,
      refs.cogs,
      refs.shipping,
      refs.adSpend,
      refs.marketRate,
      refs.marketFixed,
      refs.paymentRate,
      refs.paymentFixed,
      refs.returnRate,
      refs.returnLoss,
      refs.targetMargin,
    ];

    function setEmptyOutputs() {
      [
        'expectedProfit',
        'expectedMargin',
        'feeBurden',
        'breakEvenPrice',
        'targetPrice',
        'expectedRevenue',
        'marketFeeOut',
        'paymentFeeOut',
        'expectedReturnLoss',
        'baseCostOut',
        'kFactor',
      ].forEach(function (key) {
        refs[key].textContent = '-';
      });
      refs.summary.value = '';
    }

    function collectInput() {
      return {
        price: refs.price.value,
        cogs: refs.cogs.value,
        shipping: refs.shipping.value,
        adSpend: refs.adSpend.value,
        marketRate: refs.marketRate.value,
        marketFixed: refs.marketFixed.value,
        paymentRate: refs.paymentRate.value,
        paymentFixed: refs.paymentFixed.value,
        returnRate: refs.returnRate.value,
        returnLoss: refs.returnLoss.value,
        targetMargin: refs.targetMargin.value,
      };
    }

    function render() {
      const outcome = calculate(collectInput());
      const hasError = Boolean(outcome.error);
      refs.error.classList.toggle('show', hasError);
      refs.error.textContent = outcome.error || '';

      if (hasError || !outcome.result) {
        setEmptyOutputs();
        refs.status.textContent = '입력값을 확인하세요';
        return;
      }

      const result = outcome.result;
      refs.expectedProfit.textContent = formatCurrency(result.expectedProfit);
      refs.expectedMargin.textContent = formatPercent(result.expectedMargin, 2);
      refs.feeBurden.textContent = formatCurrency(result.feeBurden);
      refs.breakEvenPrice.textContent = formatCurrency(result.breakEvenPrice);
      refs.targetPrice.textContent = formatCurrency(result.targetPrice);
      refs.expectedRevenue.textContent = formatCurrency(result.expectedRevenue);
      refs.marketFeeOut.textContent = formatCurrency(result.marketFee);
      refs.paymentFeeOut.textContent = formatCurrency(result.paymentFee);
      refs.expectedReturnLoss.textContent = formatCurrency(result.expectedReturnLoss);
      refs.baseCostOut.textContent = formatCurrency(result.baseCost);
      refs.kFactor.textContent = Number(result.kFactor).toLocaleString('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
      refs.status.innerHTML = result.expectedProfit >= 0
        ? '<span class="ok">●</span> 주문당 기대이익 ' + formatCurrency(result.expectedProfit)
        : '<span class="warn">●</span> 주문당 기대손실 ' + formatCurrency(Math.abs(result.expectedProfit));
      refs.summary.value = result.summary;
    }

    refs.copy.addEventListener('click', async function () {
      if (!refs.summary.value.trim()) {
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        alert('요약이 복사되었습니다.');
      } catch (error) {
        alert('복사 권한이 없어 수동 복사를 해주세요.');
      }
    });

    refs.reset.addEventListener('click', function () {
      Object.keys(DEFAULT_INPUTS).forEach(function (key) {
        refs[key].value = DEFAULT_INPUTS[key];
      });
      render();
    });

    ['input', 'change'].forEach(function (eventName) {
      inputRefs.forEach(function (element) {
        element.addEventListener(eventName, render);
      });
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    DEFAULTS: DEFAULT_INPUTS,
    roundTo: roundTo,
    toFiniteNumber: toFiniteNumber,
    validateInputs: validateInputs,
    compute: compute,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    initBrowser: initBrowser,
  };
});
