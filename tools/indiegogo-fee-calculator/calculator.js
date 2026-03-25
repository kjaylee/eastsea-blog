(function (root) {
  const VALID_TYPES = ['fixed', 'flexible', 'indemand'];

  const DEFAULTS = {
    goalAmount: 10000,
    totalRaised: 12500,
    numberOfBackers: 100,
    campaignType: 'flexible',
    platformFeePct: 5,
    processingFeePct: 2.9,
    processingFixedFee: 0.30,
    refundRatePct: 0,
    targetNetProceeds: 8000
  };

  const TEXT = {
    en: {
      negGoal: 'Goal amount must be greater than zero.',
      negRaised: 'Total raised must be zero or above.',
      negBackers: 'Number of backers must be at least 1.',
      badType: 'Campaign type must be fixed, flexible, or indemand.',
      badPlatformFee: 'Platform fee must be between 0 and 100.',
      badProcessingFee: 'Processing fee percentage must be between 0 and 100.',
      badFixedFee: 'Processing fixed fee must be zero or above.',
      badRefundRate: 'Refund rate must be between 0 and 100.',
      negTarget: 'Target net proceeds must be zero or above.',
      summaryTitle: '[Indiegogo Fee Calculator Summary]',
      goalMet: 'Goal reached — campaign funded.',
      goalNotMet: 'Goal not reached — fixed campaign returns funds to backers.',
      flexNote: 'Flexible / InDemand — you keep what you raise.'
    },
    ko: {
      negGoal: '목표 금액은 0보다 커야 합니다.',
      negRaised: '모금액은 0 이상이어야 합니다.',
      negBackers: '후원자 수는 최소 1명이어야 합니다.',
      badType: '캠페인 유형은 fixed, flexible, indemand 중 하나여야 합니다.',
      badPlatformFee: '플랫폼 수수료는 0~100 범위여야 합니다.',
      badProcessingFee: '결제 수수료율은 0~100 범위여야 합니다.',
      badFixedFee: '결제 고정 수수료는 0 이상이어야 합니다.',
      badRefundRate: '환불율은 0~100 범위여야 합니다.',
      negTarget: '목표 순수익은 0 이상이어야 합니다.',
      summaryTitle: '[Indiegogo 수수료 계산기 요약]',
      goalMet: '목표 달성 — 캠페인 펀딩 성공.',
      goalNotMet: '목표 미달성 — Fixed 캠페인: 후원자에게 환불됩니다.',
      flexNote: 'Flexible / InDemand — 모금액 전액 수령 가능.'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function normalizeInput(input) {
    return {
      goalAmount: Number(input.goalAmount),
      totalRaised: Number(input.totalRaised),
      numberOfBackers: Number(input.numberOfBackers),
      campaignType: String(input.campaignType || ''),
      platformFeePct: Number(input.platformFeePct != null ? input.platformFeePct : 5),
      processingFeePct: Number(input.processingFeePct != null ? input.processingFeePct : 2.9),
      processingFixedFee: Number(input.processingFixedFee != null ? input.processingFixedFee : 0.30),
      refundRatePct: Number(input.refundRatePct != null ? input.refundRatePct : 0),
      targetNetProceeds: Number(input.targetNetProceeds != null ? input.targetNetProceeds : 0)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (n.goalAmount <= 0) return t.negGoal;
    if (n.totalRaised < 0) return t.negRaised;
    if (n.numberOfBackers < 1) return t.negBackers;
    if (!VALID_TYPES.includes(n.campaignType)) return t.badType;
    if (n.platformFeePct < 0 || n.platformFeePct > 100) return t.badPlatformFee;
    if (n.processingFeePct < 0 || n.processingFeePct > 100) return t.badProcessingFee;
    if (n.processingFixedFee < 0) return t.badFixedFee;
    if (n.refundRatePct < 0 || n.refundRatePct > 100) return t.badRefundRate;
    if (n.targetNetProceeds < 0) return t.negTarget;
    return '';
  }

  function compute(n) {
    const isGoalMet = n.totalRaised >= n.goalAmount;

    // Fixed (all-or-nothing): if goal not met, no funds are collected
    const grossRaised = (n.campaignType === 'fixed' && !isGoalMet) ? 0 : n.totalRaised;

    const platformFee = round2(grossRaised * n.platformFeePct / 100);
    const processingFees = grossRaised > 0
      ? round2(grossRaised * n.processingFeePct / 100 + n.numberOfBackers * n.processingFixedFee)
      : 0;
    const refundLoss = round2(grossRaised * n.refundRatePct / 100);
    const totalFees = round2(platformFee + processingFees);
    const netProceeds = round2(grossRaised - totalFees - refundLoss);

    const effectiveFeeRatePct = grossRaised > 0
      ? round4((totalFees / grossRaised) * 100)
      : 0;

    const proceedsPerBacker = round2(netProceeds / n.numberOfBackers);
    const goalReachedPct = round4((n.totalRaised / n.goalAmount) * 100);

    // Solve: target = R*(1 - combinedRate) - backers*fixedFee
    // => R = (target + backers*fixedFee) / (1 - combinedRate)
    const combinedRate = (n.platformFeePct + n.processingFeePct + n.refundRatePct) / 100;
    const remainingRate = 1 - combinedRate;
    let requiredRaisedForTarget = null;
    if (remainingRate > 0 && n.targetNetProceeds >= 0) {
      requiredRaisedForTarget = round2(
        (n.targetNetProceeds + n.numberOfBackers * n.processingFixedFee) / remainingRate
      );
    }

    return {
      grossRaised,
      platformFee,
      processingFees,
      refundLoss,
      totalFees,
      netProceeds,
      effectiveFeeRatePct,
      proceedsPerBacker,
      goalReachedPct,
      requiredRaisedForTarget,
      isGoalMet
    };
  }

  function buildSummary(n, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const fmt = (v) => v !== null ? '$' + v.toFixed(2) : 'N/A';
    const lines = [
      t.summaryTitle,
      'Campaign type: ' + n.campaignType,
      'Goal amount: ' + fmt(n.goalAmount),
      'Total raised: ' + fmt(n.totalRaised),
      'Backers: ' + n.numberOfBackers,
      'Goal reached: ' + result.goalReachedPct.toFixed(2) + '%',
      'Gross raised (kept): ' + fmt(result.grossRaised),
      'Platform fee (' + n.platformFeePct + '%): ' + fmt(result.platformFee),
      'Processing fees: ' + fmt(result.processingFees),
      'Refund loss: ' + fmt(result.refundLoss),
      'Total fees: ' + fmt(result.totalFees),
      'Net proceeds: ' + fmt(result.netProceeds),
      'Effective fee rate: ' + result.effectiveFeeRatePct.toFixed(2) + '%',
      'Proceeds per backer: ' + fmt(result.proceedsPerBacker),
      'Required raised for target: ' + fmt(result.requiredRaisedForTarget)
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const result = compute(n);
    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.IndiegogoCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
