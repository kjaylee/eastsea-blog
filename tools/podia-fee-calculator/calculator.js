(function (root) {
  var PLAN_PRESETS = {
    'starter': { monthlyCost: 9,  transactionFeePct: 8, label: { en: 'Starter · $9/mo + 8%',  ko: '스타터 · $9/월 + 8%' } },
    'mover':   { monthlyCost: 39, transactionFeePct: 5, label: { en: 'Mover · $39/mo + 5%',   ko: '무버 · $39/월 + 5%' } },
    'shaker':  { monthlyCost: 89, transactionFeePct: 0, label: { en: 'Shaker · $89/mo + 0%',  ko: '쉐이커 · $89/월 + 0%' } },
    'custom':  { monthlyCost: null, transactionFeePct: null, label: { en: 'Custom', ko: '커스텀' } }
  };

  var DEFAULTS = {
    monthlyRevenue:        1000,
    numberOfTransactions:  20,
    planPreset:            'mover',
    planMonthlyCost:       39,
    podiaTransactionFeePct: 5,
    processingFeePct:      2.9,
    processingFixedFee:    0.30,
    targetMonthlyNet:      500
  };

  var TEXT = {
    en: {
      errRevenue:     'Monthly revenue must be greater than 0.',
      errTxCount:     'Number of transactions must be a positive integer.',
      errPreset:      'Unknown plan preset.',
      errMonthlyCost: 'Plan monthly cost must be 0 or above.',
      errPodiaPct:    'Podia transaction fee % must be between 0 and 100.',
      errProcPct:     'Processing fee % must be between 0 and 100.',
      errFixedFee:    'Fixed fee per transaction must be 0 or above.',
      errTarget:      'Target monthly net must be 0 or above.',
      summaryTitle:   '[Podia Fee Calculator Summary]',
      na:             'N/A'
    },
    ko: {
      errRevenue:     '월 매출은 0보다 커야 합니다.',
      errTxCount:     '거래 건수는 1 이상의 정수여야 합니다.',
      errPreset:      '알 수 없는 플랜 프리셋입니다.',
      errMonthlyCost: '플랜 월 비용은 0 이상이어야 합니다.',
      errPodiaPct:    'Podia 거래 수수료(%): 0~100 범위여야 합니다.',
      errProcPct:     '결제 처리 수수료(%): 0~100 범위여야 합니다.',
      errFixedFee:    '건당 고정 수수료는 0 이상이어야 합니다.',
      errTarget:      '목표 월 순수입은 0 이상이어야 합니다.',
      summaryTitle:   '[Podia 수수료 계산기 요약]',
      na:             'N/A'
    }
  };

  function round2(v) {
    return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  }
  function round4(v) {
    return Math.round((Number(v) + Number.EPSILON) * 10000) / 10000;
  }

  function validate(inp, lang) {
    var t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(inp.monthlyRevenue) || inp.monthlyRevenue <= 0) return t.errRevenue;
    if (!Number.isFinite(inp.numberOfTransactions) || inp.numberOfTransactions < 1 || Math.trunc(inp.numberOfTransactions) !== inp.numberOfTransactions) return t.errTxCount;
    if (!PLAN_PRESETS[inp.planPreset]) return t.errPreset;
    if (!Number.isFinite(inp.planMonthlyCost) || inp.planMonthlyCost < 0) return t.errMonthlyCost;
    if (!Number.isFinite(inp.podiaTransactionFeePct) || inp.podiaTransactionFeePct < 0 || inp.podiaTransactionFeePct > 100) return t.errPodiaPct;
    if (!Number.isFinite(inp.processingFeePct) || inp.processingFeePct < 0 || inp.processingFeePct > 100) return t.errProcPct;
    if (!Number.isFinite(inp.processingFixedFee) || inp.processingFixedFee < 0) return t.errFixedFee;
    if (!Number.isFinite(inp.targetMonthlyNet) || inp.targetMonthlyNet < 0) return t.errTarget;
    return '';
  }

  function normalize(raw) {
    var s = raw || {};
    var preset = s.planPreset != null ? String(s.planPreset) : DEFAULTS.planPreset;
    var presetDef = PLAN_PRESETS[preset];

    var planMonthlyCost;
    if (s.planMonthlyCost != null) {
      planMonthlyCost = Number(s.planMonthlyCost);
    } else if (presetDef && presetDef.monthlyCost != null) {
      planMonthlyCost = presetDef.monthlyCost;
    } else {
      planMonthlyCost = DEFAULTS.planMonthlyCost;
    }

    var podiaTransactionFeePct;
    if (s.podiaTransactionFeePct != null) {
      podiaTransactionFeePct = Number(s.podiaTransactionFeePct);
    } else if (presetDef && presetDef.transactionFeePct != null) {
      podiaTransactionFeePct = presetDef.transactionFeePct;
    } else {
      podiaTransactionFeePct = DEFAULTS.podiaTransactionFeePct;
    }

    return {
      monthlyRevenue:        Number(s.monthlyRevenue        ?? DEFAULTS.monthlyRevenue),
      numberOfTransactions:  Number(s.numberOfTransactions  ?? DEFAULTS.numberOfTransactions),
      planPreset:            preset,
      planMonthlyCost:       planMonthlyCost,
      podiaTransactionFeePct: podiaTransactionFeePct,
      processingFeePct:      Number(s.processingFeePct      ?? DEFAULTS.processingFeePct),
      processingFixedFee:    Number(s.processingFixedFee    ?? DEFAULTS.processingFixedFee),
      targetMonthlyNet:      Number(s.targetMonthlyNet      ?? DEFAULTS.targetMonthlyNet)
    };
  }

  // Compute net income for arbitrary plan parameters at given revenue/transactions
  function computeNet(revenue, nTx, transactionPct, procPct, fixedFee, monthlyCost) {
    var podiaTxFee   = revenue * transactionPct / 100;
    var procFees     = revenue * procPct / 100 + nTx * fixedFee;
    var totalCosts   = podiaTxFee + procFees + monthlyCost;
    return revenue - totalCosts;
  }

  // Closed-form break-even: R = (fixedCosts) / (1 - podiaPct/100 - procPct/100)
  function breakEven(nTx, transactionPct, procPct, fixedFee, monthlyCost) {
    var denom = 1 - transactionPct / 100 - procPct / 100;
    if (denom <= 0) return null;
    var fixedCosts = nTx * fixedFee + monthlyCost;
    var r = fixedCosts / denom;
    return r <= 0 ? 0 : round2(r);
  }

  // Closed-form required revenue for target net
  function requiredRevenue(target, nTx, transactionPct, procPct, fixedFee, monthlyCost) {
    var denom = 1 - transactionPct / 100 - procPct / 100;
    if (denom <= 0) return null;
    var fixedCosts = nTx * fixedFee + monthlyCost;
    return round2((target + fixedCosts) / denom);
  }

  function bestPlanRecommendation(inp) {
    var plans = ['starter', 'mover', 'shaker'];
    var best = null;
    var bestNet = -Infinity;
    plans.forEach(function (key) {
      var p = PLAN_PRESETS[key];
      var net = computeNet(inp.monthlyRevenue, inp.numberOfTransactions,
        p.transactionFeePct, inp.processingFeePct, inp.processingFixedFee, p.monthlyCost);
      if (net > bestNet) { bestNet = net; best = key; }
    });
    return best;
  }

  function compute(inp) {
    var R  = inp.monthlyRevenue;
    var N  = inp.numberOfTransactions;
    var PP = inp.podiaTransactionFeePct;
    var TF = inp.processingFeePct;
    var FF = inp.processingFixedFee;
    var MC = inp.planMonthlyCost;
    var TG = inp.targetMonthlyNet;

    var grossRevenue           = R;
    var revenuePerTransaction  = round2(R / N);
    var podiaTransactionFee    = round2(R * PP / 100);
    var processingFees         = round2(R * TF / 100 + N * FF);
    var planCost               = round2(MC);
    var totalCosts             = round2(podiaTransactionFee + processingFees + planCost);
    var netIncome              = round2(R - totalCosts);
    var effectiveCostRatePct   = round4(R > 0 ? (totalCosts / R) * 100 : 0);

    var breakEvenRevenue        = breakEven(N, PP, TF, FF, MC);
    var requiredRevenueForTarget = requiredRevenue(TG, N, PP, TF, FF, MC);
    var bestPlan                = bestPlanRecommendation(inp);

    var preset = PLAN_PRESETS[inp.planPreset];
    return {
      grossRevenue:              grossRevenue,
      podiaTransactionFee:       podiaTransactionFee,
      processingFees:            processingFees,
      planCost:                  planCost,
      totalCosts:                totalCosts,
      netIncome:                 netIncome,
      effectiveCostRatePct:      effectiveCostRatePct,
      revenuePerTransaction:     revenuePerTransaction,
      breakEvenRevenue:          breakEvenRevenue,
      bestPlanRecommendation:    bestPlan,
      requiredRevenueForTarget:  requiredRevenueForTarget,
      planLabel:                 preset ? preset.label.en : inp.planPreset
    };
  }

  function buildSummary(result, inp, lang) {
    var t = TEXT[lang] || TEXT.en;
    var fmt = function (v) { return '$' + (v != null ? v.toFixed(2) : t.na); };
    var fmtPct = function (v) { return v.toFixed(2) + '%'; };
    var na = t.na;
    var isKo = lang === 'ko';
    var lines = [
      t.summaryTitle,
      '',
      (isKo ? '플랜' : 'Plan')                                        + ': ' + result.planLabel,
      (isKo ? '월 매출' : 'Gross revenue')                            + ': ' + fmt(result.grossRevenue),
      (isKo ? 'Podia 거래 수수료' : 'Podia transaction fee')          + ': ' + fmt(result.podiaTransactionFee),
      (isKo ? '결제 처리 수수료' : 'Processing fees')                 + ': ' + fmt(result.processingFees),
      (isKo ? '플랜 월 비용' : 'Plan monthly cost')                   + ': ' + fmt(result.planCost),
      (isKo ? '총 비용' : 'Total costs')                              + ': ' + fmt(result.totalCosts),
      (isKo ? '순수입' : 'Net income')                                + ': ' + fmt(result.netIncome),
      (isKo ? '실효 비용율' : 'Effective cost rate')                  + ': ' + fmtPct(result.effectiveCostRatePct),
      (isKo ? '건당 매출' : 'Revenue per transaction')                + ': ' + fmt(result.revenuePerTransaction),
      (isKo ? '손익분기점 매출' : 'Break-even revenue')               + ': ' + (result.breakEvenRevenue != null ? fmt(result.breakEvenRevenue) : na),
      (isKo ? '목표 달성 필요 매출' : 'Revenue for target net')       + ': ' + (result.requiredRevenueForTarget != null ? fmt(result.requiredRevenueForTarget) : na),
      (isKo ? '최적 플랜' : 'Best plan recommendation')               + ': ' + (result.bestPlanRecommendation || na)
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    var lang = (opts && opts.lang) || 'en';
    var inp = normalize(input);
    var err = validate(inp, lang);
    if (err) return { result: null, error: err };

    var result = compute(inp);
    result.summary = buildSummary(result, inp, lang);

    return { result: result, error: '' };
  }

  var exports = { calculate: calculate, DEFAULTS: DEFAULTS, PLAN_PRESETS: PLAN_PRESETS, TEXT: TEXT };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.PodiaFeeCalc = exports;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
