(function (root) {
  const DEFAULTS = {
    sellingPrice: 120,
    variableCostPerUnit: 45,
    fixedCosts: 18000,
    targetProfit: 12000
  };

  const EXAMPLES = [
    {
      id: 'coffee-cart',
      sellingPrice: 8,
      variableCostPerUnit: 2.6,
      fixedCosts: 5400,
      targetProfit: 2400
    },
    {
      id: 'dtc-product',
      sellingPrice: 49,
      variableCostPerUnit: 17,
      fixedCosts: 10000,
      targetProfit: 2500
    },
    {
      id: 'course-seat',
      sellingPrice: 199,
      variableCostPerUnit: 28,
      fixedCosts: 22000,
      targetProfit: 18000
    }
  ];

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      sellingPrice: 'Selling price per unit must be greater than zero.',
      variableCostPerUnit: 'Variable cost per unit must be zero or above.',
      fixedCosts: 'Fixed costs must be zero or above.',
      targetProfit: 'Target profit must be zero or above.',
      summaryTitle: '[Contribution Margin Summary]',
      statusHealthy: 'Each unit contributes positive dollars toward fixed costs and profit.',
      statusZeroFixed: 'No fixed costs entered, so break-even volume starts at zero units.',
      statusImpossible: 'Current unit economics are not viable because selling price does not exceed variable cost per unit.',
      na: 'Not achievable'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      sellingPrice: '단위 판매가는 0보다 커야 합니다.',
      variableCostPerUnit: '단위 변동원가는 0 이상이어야 합니다.',
      fixedCosts: '고정비는 0 이상이어야 합니다.',
      targetProfit: '목표이익은 0 이상이어야 합니다.',
      summaryTitle: '[공헌이익 요약]',
      statusHealthy: '각 판매 단위가 고정비 회수와 이익 창출에 기여하고 있습니다.',
      statusZeroFixed: '고정비가 0이므로 손익분기 판매량은 0개부터 시작합니다.',
      statusImpossible: '현재 단위경제성에서는 판매가가 변동원가를 넘지 못해 손익분기 달성이 불가능합니다.',
      na: '달성 불가'
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
    const source = input || {};
    return {
      sellingPrice: Number(source.sellingPrice != null ? source.sellingPrice : DEFAULTS.sellingPrice),
      variableCostPerUnit: Number(source.variableCostPerUnit != null ? source.variableCostPerUnit : DEFAULTS.variableCostPerUnit),
      fixedCosts: Number(source.fixedCosts != null ? source.fixedCosts : DEFAULTS.fixedCosts),
      targetProfit: Number(source.targetProfit != null ? source.targetProfit : 0)
    };
  }

  function validateInputs(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(input.sellingPrice) || input.sellingPrice <= 0) {
      return { ok: false, error: t.sellingPrice };
    }
    if (!Number.isFinite(input.variableCostPerUnit) || input.variableCostPerUnit < 0) {
      return { ok: false, error: t.variableCostPerUnit };
    }
    if (!Number.isFinite(input.fixedCosts) || input.fixedCosts < 0) {
      return { ok: false, error: t.fixedCosts };
    }
    if (!Number.isFinite(input.targetProfit) || input.targetProfit < 0) {
      return { ok: false, error: t.targetProfit };
    }
    return { ok: true, error: '' };
  }

  function computeMetrics(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const contributionMarginPerUnit = round2(input.sellingPrice - input.variableCostPerUnit);
    const contributionMarginRatio = round4(contributionMarginPerUnit / input.sellingPrice);
    const variableCostRatio = round4(input.variableCostPerUnit / input.sellingPrice);
    const isViable = contributionMarginPerUnit > 0;

    const breakEvenUnits = isViable
      ? Math.ceil(input.fixedCosts / contributionMarginPerUnit)
      : null;
    const targetProfitUnits = isViable
      ? Math.ceil((input.fixedCosts + input.targetProfit) / contributionMarginPerUnit)
      : null;

    const breakEvenRevenue = breakEvenUnits === null
      ? null
      : round2(breakEvenUnits * input.sellingPrice);
    const targetProfitRevenue = targetProfitUnits === null
      ? null
      : round2(targetProfitUnits * input.sellingPrice);

    let status = t.statusHealthy;
    if (!isViable) {
      status = t.statusImpossible;
    } else if (input.fixedCosts === 0) {
      status = t.statusZeroFixed;
    }

    return {
      sellingPrice: input.sellingPrice,
      variableCostPerUnit: input.variableCostPerUnit,
      fixedCosts: input.fixedCosts,
      targetProfit: input.targetProfit,
      contributionMarginPerUnit,
      contributionMarginRatio,
      variableCostRatio,
      isViable,
      breakEvenUnits,
      targetProfitUnits,
      breakEvenRevenue,
      targetProfitRevenue,
      status
    };
  }

  function formatMoney(value) {
    return '$' + Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const breakEvenUnits = result.breakEvenUnits === null ? na : String(result.breakEvenUnits);
    const targetProfitUnits = result.targetProfitUnits === null ? na : String(result.targetProfitUnits);
    const breakEvenRevenue = result.breakEvenRevenue === null ? na : formatMoney(result.breakEvenRevenue);
    const targetProfitRevenue = result.targetProfitRevenue === null ? na : formatMoney(result.targetProfitRevenue);

    return [
      t.summaryTitle,
      'Selling price per unit: ' + formatMoney(input.sellingPrice),
      'Variable cost per unit: ' + formatMoney(input.variableCostPerUnit),
      'Fixed costs: ' + formatMoney(input.fixedCosts),
      'Target profit: ' + formatMoney(input.targetProfit),
      'Contribution margin per unit: ' + formatMoney(result.contributionMarginPerUnit),
      'Contribution margin ratio: ' + formatPercent(result.contributionMarginRatio),
      'Break-even units: ' + breakEvenUnits,
      'Break-even revenue: ' + breakEvenRevenue,
      'Target-profit units: ' + targetProfitUnits,
      'Target-profit revenue: ' + targetProfitRevenue,
      'Status: ' + result.status
    ].join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const normalized = normalizeInput(input);
    const validation = validateInputs(normalized, lang);

    if (!validation.ok) {
      return {
        result: null,
        error: validation.error || (TEXT[lang] || TEXT.en).invalid
      };
    }

    const result = computeMetrics(normalized, lang);
    result.summary = buildSummary(normalized, result, lang);

    return {
      result,
      error: ''
    };
  }

  const exports = {
    DEFAULTS,
    EXAMPLES,
    TEXT,
    validateInputs,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.ContributionMarginCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
