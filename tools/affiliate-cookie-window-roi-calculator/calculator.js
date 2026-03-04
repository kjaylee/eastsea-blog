(function (root) {
  const ERROR_TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요",
      range: "비율 값은 0~100 범위여야 합니다.",
      nonNegative: "값은 0 이상이어야 하며, 클릭 수/기간은 1 이상이어야 합니다.",
      logic: "목표 전환율은 현재 전환율 이상이어야 합니다."
    },
    en: {
      invalid: "Please review your inputs.",
      range: "Rate values must be between 0 and 100.",
      nonNegative: "Values must be >= 0, and clicks/months must be >= 1.",
      logic: "Target CVR must be greater than or equal to current CVR."
    }
  };

  function isFiniteNumber(value) {
    return Number.isFinite(value);
  }

  function validate(input, lang) {
    const t = ERROR_TEXT[lang] || ERROR_TEXT.ko;
    const rateFields = [
      input.currentCvr,
      input.targetCvr,
      input.grossMargin,
      input.commissionRate,
      input.networkFeeRate,
      input.refundRate
    ];

    const amountFields = [
      input.aov,
      input.monthlyCost,
      input.setupCost
    ];

    const mustBePositive = [input.clicks, input.months];

    if (mustBePositive.some((v) => !isFiniteNumber(v) || v < 1)) {
      return t.nonNegative;
    }

    if (amountFields.some((v) => !isFiniteNumber(v) || v < 0)) {
      return t.nonNegative;
    }

    if (rateFields.some((v) => !isFiniteNumber(v) || v < 0 || v > 100)) {
      return t.range;
    }

    if (input.targetCvr < input.currentCvr) {
      return t.logic;
    }

    return "";
  }

  function calculateCore(input) {
    const currentOrders = input.clicks * (input.currentCvr / 100);
    const targetOrders = input.clicks * (input.targetCvr / 100);
    const incrementalOrders = Math.max(0, targetOrders - currentOrders);

    const netSalesPerOrder = input.aov * (1 - input.refundRate / 100);
    const grossProfitPerOrder = netSalesPerOrder * (input.grossMargin / 100);
    const commissionCostPerOrder = netSalesPerOrder * (input.commissionRate / 100);
    const networkFeePerOrder = netSalesPerOrder * (input.networkFeeRate / 100);
    const contributionPerOrder = grossProfitPerOrder - commissionCostPerOrder - networkFeePerOrder;

    const incrementalContribution = incrementalOrders * contributionPerOrder;
    const monthlyNet = incrementalContribution - input.monthlyCost;
    const periodNet = monthlyNet * input.months - input.setupCost;

    const totalInvestment = input.monthlyCost * input.months + input.setupCost;
    const roi = totalInvestment > 0 ? (periodNet / totalInvestment) * 100 : 0;

    const requiredIncrementalOrders = contributionPerOrder > 0
      ? input.monthlyCost / contributionPerOrder
      : Number.POSITIVE_INFINITY;

    const breakEvenCvr = Number.isFinite(requiredIncrementalOrders)
      ? input.currentCvr + (requiredIncrementalOrders / input.clicks) * 100
      : Number.POSITIVE_INFINITY;

    const paybackMonths = monthlyNet > 0
      ? input.setupCost / monthlyNet
      : Number.POSITIVE_INFINITY;

    return {
      incrementalOrders,
      contributionPerOrder,
      incrementalContribution,
      monthlyNet,
      periodNet,
      totalInvestment,
      roi,
      breakEvenCvr,
      paybackMonths,
      cvrDelta: input.targetCvr - input.currentCvr
    };
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || "ko";
    const normalized = {
      clicks: Number(input.clicks),
      currentCvr: Number(input.currentCvr),
      targetCvr: Number(input.targetCvr),
      aov: Number(input.aov),
      grossMargin: Number(input.grossMargin),
      commissionRate: Number(input.commissionRate),
      networkFeeRate: Number(input.networkFeeRate),
      refundRate: Number(input.refundRate),
      monthlyCost: Number(input.monthlyCost),
      setupCost: Number(input.setupCost),
      months: Number(input.months)
    };

    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    return { result: calculateCore(normalized), error: "" };
  }

  const api = { calculate, validate, calculateCore };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.AffiliateCookieWindow = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
