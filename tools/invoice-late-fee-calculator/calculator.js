(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.InvoiceLateFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = {
    amount: 5500000,
    daysLate: 26,
    annualRate: 12,
    grace: 3,
    fixedFee: 100000,
    feeTax: 10,
  };

  const SCENARIO_DAYS = [7, 14, 30, 60, 90];
  const FIXED_FEE_ASSUMPTION = '고정 연체수수료는 유예기간 이후 최초 1회 발생하는 것으로 가정합니다.';

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const numeric = Number(text);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function normalizeInput(rawInput) {
    const source = Object.assign({}, DEFAULTS, rawInput || {});
    return {
      amount: toFiniteNumber(source.amount),
      daysLate: toFiniteNumber(source.daysLate),
      annualRate: toFiniteNumber(source.annualRate),
      grace: toFiniteNumber(source.grace),
      fixedFee: toFiniteNumber(source.fixedFee),
      feeTax: toFiniteNumber(source.feeTax),
    };
  }

  function validateInput(rawInput) {
    const input = normalizeInput(rawInput);

    if (input.amount == null || input.amount < 0) {
      return { ok: false, error: '원청구 금액은 0 이상이어야 합니다.', values: null };
    }
    if (input.daysLate == null || input.daysLate < 0) {
      return { ok: false, error: '연체일수는 0 이상이어야 합니다.', values: null };
    }
    if (input.annualRate == null || input.annualRate < 0 || input.annualRate > 100) {
      return { ok: false, error: '연체이율은 0~100 범위여야 합니다.', values: null };
    }
    if (input.grace == null || input.grace < 0) {
      return { ok: false, error: '유예기간은 0 이상이어야 합니다.', values: null };
    }
    if (input.fixedFee == null || input.fixedFee < 0) {
      return { ok: false, error: '고정 연체수수료는 0 이상이어야 합니다.', values: null };
    }
    if (input.feeTax == null || input.feeTax < 0 || input.feeTax > 100) {
      return { ok: false, error: '수수료 부가세율은 0~100 범위여야 합니다.', values: null };
    }

    return { ok: true, error: '', values: input };
  }

  function computeScenario(input, customDaysLate) {
    const daysLate = Number.isFinite(customDaysLate) ? customDaysLate : input.daysLate;
    const billableDays = Math.max(0, daysLate - input.grace);
    const dailyInterest = input.amount * (input.annualRate / 100) / 365;
    const lateInterest = dailyInterest * billableDays;
    const fixedFeeApplied = billableDays > 0 ? input.fixedFee : 0;
    const feeWithTax = fixedFeeApplied * (1 + input.feeTax / 100);
    const totalDue = input.amount + lateInterest + feeWithTax;
    const burdenRate = input.amount === 0 ? 0 : ((totalDue - input.amount) / input.amount) * 100;

    return {
      daysLate,
      billableDays,
      dailyInterest,
      lateInterest,
      fixedFeeApplied,
      feeWithTax,
      totalDue,
      burdenRate,
    };
  }

  function buildScenarios(input, scenarioDays) {
    return scenarioDays.map(function (daysLate) {
      const result = computeScenario(input, daysLate);
      return Object.assign({ daysLate: daysLate }, result);
    });
  }

  function getStatus(result) {
    if (result.burdenRate < 1.5) {
      return { tone: 'up', message: '추가부담이 낮은 편입니다' };
    }
    if (result.burdenRate < 4) {
      return { tone: 'mid', message: '연체비용이 누적되고 있습니다' };
    }
    return { tone: 'down', message: '연체비용 부담이 큽니다 (회수 우선)' };
  }

  function formatWon(value) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  }

  function buildSummary(input, result) {
    return [
      '[인보이스 연체료 요약]',
      '가정: ' + FIXED_FEE_ASSUMPTION,
      '원청구 금액: ' + formatWon(input.amount),
      '현재 연체일수: ' + formatNumber(input.daysLate, 0) + '일 (유예 ' + formatNumber(input.grace, 0) + '일)',
      '연체이율: 연 ' + formatNumber(input.annualRate, 2) + '%',
      '이자 산정 연체일: ' + formatNumber(result.billableDays, 0) + '일',
      '누적 연체이자: ' + formatWon(result.lateInterest),
      '연체수수료(부가세 포함): ' + formatWon(result.feeWithTax),
      '최종 청구금액: ' + formatWon(result.totalDue),
      '원금 대비 추가부담률: ' + formatNumber(result.burdenRate, 2) + '%',
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const validation = validateInput(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.error };
    }

    const input = validation.values;
    const scenarioDays = Array.isArray(options && options.scenarioDays) && (options && options.scenarioDays).length
      ? (options && options.scenarioDays)
      : SCENARIO_DAYS;

    const primary = computeScenario(input);
    const status = getStatus(primary);
    const scenarios = buildScenarios(input, scenarioDays);
    const summary = buildSummary(input, primary);

    return {
      error: '',
      result: Object.assign({}, primary, {
        input,
        status,
        scenarios,
        summary,
        assumption: FIXED_FEE_ASSUMPTION,
      }),
    };
  }

  return {
    DEFAULTS,
    SCENARIO_DAYS,
    FIXED_FEE_ASSUMPTION,
    normalizeInput,
    validateInput,
    computeScenario,
    buildScenarios,
    getStatus,
    buildSummary,
    calculate,
  };
});
