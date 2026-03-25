(function (root) {
  const DEFAULTS = {
    monthlyRevenue: 5000,
    numberOfTransactions: 50,
    kajabiPlanCost: 149,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetMonthlyNet: 0
  };

  const TEXT = {
    ko: {
      negRevenue: '월 수익은 0보다 커야 합니다.',
      negTx: '거래 건수는 1 이상이어야 합니다.',
      negMoney: '금액 입력값은 모두 0 이상이어야 합니다.',
      badRate: '수수료율은 0~100 범위여야 합니다.',
      statusGood: '현재 설정에서 순이익이 플러스입니다.',
      statusWarn: '현재 설정에서 순이익이 마이너스입니다.',
      summaryTitle: '[Kajabi 수익 요약]',
      na: 'N/A'
    },
    en: {
      negRevenue: 'Monthly revenue must be greater than zero.',
      negTx: 'Number of transactions must be at least 1.',
      negMoney: 'All money fields must be zero or above.',
      badRate: 'Rate must be between 0 and 100.',
      statusGood: 'Net revenue is positive under these assumptions.',
      statusWarn: 'Net revenue is negative under these assumptions.',
      summaryTitle: '[Kajabi Revenue Summary]',
      na: 'N/A'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function normalizeInput(input) {
    const d = DEFAULTS;
    return {
      monthlyRevenue: Number(input.monthlyRevenue),
      numberOfTransactions: Number(input.numberOfTransactions),
      kajabiPlanCost: Number(input.kajabiPlanCost !== undefined ? input.kajabiPlanCost : d.kajabiPlanCost),
      processingFeePct: Number(input.processingFeePct !== undefined ? input.processingFeePct : d.processingFeePct),
      processingFixedFee: Number(input.processingFixedFee !== undefined ? input.processingFixedFee : d.processingFixedFee),
      refundRatePct: Number(input.refundRatePct !== undefined ? input.refundRatePct : d.refundRatePct),
      targetMonthlyNet: Number(input.targetMonthlyNet !== undefined ? input.targetMonthlyNet : d.targetMonthlyNet)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(n.monthlyRevenue) || n.monthlyRevenue <= 0) return t.negRevenue;
    if (!Number.isFinite(n.numberOfTransactions) || n.numberOfTransactions < 1) return t.negTx;
    if (n.kajabiPlanCost < 0 || n.processingFixedFee < 0 || n.targetMonthlyNet < 0) return t.negMoney;
    if (n.processingFeePct < 0 || n.processingFeePct > 100) return t.badRate;
    if (n.refundRatePct < 0 || n.refundRatePct > 100) return t.badRate;
    return '';
  }

  function computeCore(n) {
    const grossRevenue = round2(n.monthlyRevenue);
    const refundLoss = round2(grossRevenue * n.refundRatePct / 100);
    const processingFees = round2(
      n.numberOfTransactions * n.processingFixedFee + grossRevenue * n.processingFeePct / 100
    );
    const kajabiSubscriptionCost = round2(n.kajabiPlanCost);
    const totalCosts = round2(refundLoss + processingFees + kajabiSubscriptionCost);
    const netRevenue = round2(grossRevenue - totalCosts);
    const effectiveCostRatePct = grossRevenue > 0
      ? round4(totalCosts / grossRevenue * 100)
      : 0;
    const revenuePerTransaction = round2(grossRevenue / n.numberOfTransactions);

    // Required gross revenue so that netRevenue == targetMonthlyNet
    // R*(1 - r - p) - N*F - K = T  →  R = (T + N*F + K) / (1 - r - p)
    const r = n.refundRatePct / 100;
    const p = n.processingFeePct / 100;
    const netMultiplier = 1 - r - p;
    const requiredRevenueForTarget = netMultiplier > 0
      ? round2((n.targetMonthlyNet + n.numberOfTransactions * n.processingFixedFee + n.kajabiPlanCost) / netMultiplier)
      : null;

    // Min transactions at current avg order value to cover Kajabi subscription
    // N_be = ceil(K / contributionPerTx),  contributionPerTx = avgTx*(1-r-p) - F
    const contributionPerTx = revenuePerTransaction * netMultiplier - n.processingFixedFee;
    const breakEvenTransactions = contributionPerTx > 0
      ? Math.ceil(n.kajabiPlanCost / contributionPerTx)
      : null;

    return {
      grossRevenue,
      refundLoss,
      processingFees,
      kajabiSubscriptionCost,
      totalCosts,
      netRevenue,
      effectiveCostRatePct,
      revenuePerTransaction,
      requiredRevenueForTarget,
      breakEvenTransactions
    };
  }

  function buildSummary(n, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const req = result.requiredRevenueForTarget !== null
      ? `$${result.requiredRevenueForTarget.toFixed(2)}`
      : na;
    const beTx = result.breakEvenTransactions !== null
      ? String(result.breakEvenTransactions)
      : na;
    const lines = [
      t.summaryTitle,
      `Monthly Revenue: $${result.grossRevenue.toFixed(2)}`,
      `Transactions: ${n.numberOfTransactions}`,
      `Kajabi Plan Cost: $${result.kajabiSubscriptionCost.toFixed(2)}`,
      `Refund Loss: $${result.refundLoss.toFixed(2)}`,
      `Processing Fees: $${result.processingFees.toFixed(2)}`,
      `Total Costs: $${result.totalCosts.toFixed(2)}`,
      `Net Revenue: $${result.netRevenue.toFixed(2)}`,
      `Effective Cost Rate: ${result.effectiveCostRatePct.toFixed(2)}%`,
      `Revenue Per Transaction: $${result.revenuePerTransaction.toFixed(2)}`,
      `Required Revenue for Target: ${req}`,
      `Break-even Transactions: ${beTx}`
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(n);
    const result = {
      ...core,
      status: core.netRevenue >= 0 ? t.statusGood : t.statusWarn
    };
    result.summary = buildSummary(n, result, lang);
    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.KajabiCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
