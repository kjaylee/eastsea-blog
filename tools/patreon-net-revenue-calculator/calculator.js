(function (root) {
  const PLAN_PRESETS = [
    { id: 'lite', ratePct: 5, label: { en: 'Lite · 5%', ko: '라이트 · 5%' } },
    { id: 'pro', ratePct: 8, label: { en: 'Pro · 8%', ko: '프로 · 8%' } },
    { id: 'premium', ratePct: 12, label: { en: 'Premium · 12%', ko: '프리미엄 · 12%' } },
    { id: 'custom', ratePct: null, label: { en: 'Custom plan rate', ko: '커스텀 플랜 비율' } }
  ];

  const PROCESSING_DEFAULTS = {
    standardRatePct: 2.9,
    standardFlat: 0.30,
    microRatePct: 5.0,
    microFlat: 0.10,
    microThreshold: 3.00
  };

  const DEFAULTS = {
    monthlyMembers: 800,
    monthlyPrice: 5,
    annualMembersBilled: 40,
    annualPrice: 50,
    oneTimeGrossSales: 1000,
    oneTimeOrders: 50,

    planPreset: 'pro',
    customPlanRatePct: 8,

    standardRatePct: PROCESSING_DEFAULTS.standardRatePct,
    standardFlat: PROCESSING_DEFAULTS.standardFlat,
    microRatePct: PROCESSING_DEFAULTS.microRatePct,
    microFlat: PROCESSING_DEFAULTS.microFlat,
    microThreshold: PROCESSING_DEFAULTS.microThreshold,

    refundRatePct: 2,

    payoutFlat: 0.25,
    payoutPercentPct: 0,
    payoutsPerMonth: 1,

    otherMonthlyCost: 200,

    currency: 'USD',
    desiredMonthlyNet: null
  };

  const TEXT = {
    en: {
      title: 'Patreon Net Revenue Calculator',
      gross: 'Total gross',
      net: 'Net revenue',
      totalFees: 'Total fees',
      platformFees: 'Platform fees',
      processingFees: 'Processing fees',
      processingMonthly: 'Monthly processing',
      processingAnnual: 'Annual processing',
      processingOnetime: 'One‑time processing',
      refundLoss: 'Refund/chargeback loss',
      payoutFees: 'Payout fees',
      effectiveRate: 'Effective fee rate',
      breakEvenPrice: 'Break‑even monthly price',
      takeHomePerMonthly: 'Take‑home per monthly member',
      planPreset: 'Plan preset',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter inputs and calculate to see Patreon take‑home.',
      na: 'N/A',
      summaryTitle: '[Patreon Net Revenue Summary]',
      invalid: 'Please review your inputs.',
      errMoney: 'Monetary inputs must be zero or above.',
      errCount: 'Counts must be integers and zero or above.',
      errOrdersRequired: 'Order count must be at least 1 when one‑time gross is greater than zero.',
      errRates: 'Rates must be 0 or above and below 100%.',
      errPayouts: 'Payouts per month must be an integer between 0 and 31.',
    },
    ko: {
      title: 'Patreon 순수령액 계산기',
      gross: '총매출',
      net: '순수령액',
      totalFees: '총 수수료/비용',
      platformFees: '플랫폼 수수료',
      processingFees: '결제 처리 수수료',
      processingMonthly: '월 구독 처리비',
      processingAnnual: '연 구독 처리비',
      processingOnetime: '일회성 처리비',
      refundLoss: '환불/차지백 손실',
      payoutFees: '정산 드래그',
      effectiveRate: '실효 차감률',
      breakEvenPrice: '손익분기 월 가격',
      takeHomePerMonthly: '월 멤버 1인당 순수령',
      planPreset: '플랜 프리셋',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '입력값을 넣고 계산하면 Patreon 순수령액이 표시됩니다.',
      na: 'N/A',
      summaryTitle: '[Patreon 순수익 요약]',
      invalid: '입력값을 확인해주세요.',
      errMoney: '금액 입력값은 0 이상이어야 합니다.',
      errCount: '개수 입력값은 정수이고 0 이상이어야 합니다.',
      errOrdersRequired: '일회성 매출이 있으면 주문수는 1 이상이어야 합니다.',
      errRates: '비율 입력값은 0 이상 100 미만이어야 합니다.',
      errPayouts: '월 정산 횟수는 0~31 사이 정수여야 합니다.',
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }
  const r2 = (v) => round(v, 2);

  function toInt(n) { return Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : NaN; }
  function toNum(n) { return Number(n); }

  function planRate(preset, customRatePct) {
    const p = PLAN_PRESETS.find(x => x.id === preset);
    if (!p) return null;
    return p.id === 'custom' ? (customRatePct/100) : (p.ratePct/100);
  }

  function resolveTier(aov, cfg) {
    const useMicro = Number.isFinite(aov) && aov <= cfg.microThreshold;
    return useMicro
      ? { ratePct: cfg.microRatePct/100, flat: cfg.microFlat, id: 'micro' }
      : { ratePct: cfg.standardRatePct/100, flat: cfg.standardFlat, id: 'standard' };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const money = [input.monthlyPrice, input.annualPrice, input.oneTimeGrossSales, input.otherMonthlyCost];
    if (money.some(v => !Number.isFinite(v) || v < 0)) return t.errMoney;

    const counts = [input.monthlyMembers, input.annualMembersBilled, input.oneTimeOrders, input.payoutsPerMonth];
    if (counts.some(v => !Number.isFinite(v) || v < 0 || Math.trunc(v) !== v)) return t.errCount;

    const rates = [input.customPlanRatePct, input.standardRatePct, input.microRatePct, input.refundRatePct, input.payoutPercentPct];
    if (rates.some(v => !Number.isFinite(v) || v < 0 || v >= 100)) return t.errRates;

    if (input.oneTimeGrossSales > 0 && input.oneTimeOrders < 1) return t.errOrdersRequired;
    if (input.payoutsPerMonth < 0 || input.payoutsPerMonth > 31) return t.errPayouts;

    const pr = PLAN_PRESETS.find(x => x.id === input.planPreset);
    if (!pr) return 'Unknown plan preset';

    return '';
  }

  function calculate(rawInput = {}, opts = { lang: 'en', skipSolve: false }) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;

    const input = {
      monthlyMembers: toInt(rawInput.monthlyMembers),
      monthlyPrice: toNum(rawInput.monthlyPrice),
      annualMembersBilled: toInt(rawInput.annualMembersBilled),
      annualPrice: toNum(rawInput.annualPrice),
      oneTimeGrossSales: toNum(rawInput.oneTimeGrossSales),
      oneTimeOrders: toInt(rawInput.oneTimeOrders),

      planPreset: rawInput.planPreset || DEFAULTS.planPreset,
      customPlanRatePct: toNum(rawInput.customPlanRatePct),

      standardRatePct: toNum(rawInput.standardRatePct),
      standardFlat: toNum(rawInput.standardFlat),
      microRatePct: toNum(rawInput.microRatePct),
      microFlat: toNum(rawInput.microFlat),
      microThreshold: toNum(rawInput.microThreshold),

      refundRatePct: toNum(rawInput.refundRatePct),

      payoutFlat: toNum(rawInput.payoutFlat),
      payoutPercentPct: toNum(rawInput.payoutPercentPct),
      payoutsPerMonth: toInt(rawInput.payoutsPerMonth),

      otherMonthlyCost: toNum(rawInput.otherMonthlyCost),

      currency: rawInput.currency || DEFAULTS.currency,
      desiredMonthlyNet: rawInput.desiredMonthlyNet == null ? null : toNum(rawInput.desiredMonthlyNet)
    };

    const err = validate(input, lang);
    if (err) return { result: null, error: err };

    // Gross buckets
    const grossMonthly = r2(input.monthlyMembers * input.monthlyPrice);
    const grossAnnual = r2(input.annualMembersBilled * input.annualPrice);
    const grossOneTime = r2(input.oneTimeGrossSales);
    const totalGross = r2(grossMonthly + grossAnnual + grossOneTime);

    // Platform
    const plan = planRate(input.planPreset, input.customPlanRatePct);
    const platformFees = r2(totalGross * plan);

    // Processing per bucket
    const cfg = {
      standardRatePct: input.standardRatePct,
      standardFlat: input.standardFlat,
      microRatePct: input.microRatePct,
      microFlat: input.microFlat,
      microThreshold: input.microThreshold,
    };

    const monthlyTier = resolveTier(input.monthlyPrice, cfg);
    const annualTier = resolveTier(input.annualPrice, cfg);
    const oneTimeAov = input.oneTimeOrders > 0 ? (grossOneTime / input.oneTimeOrders) : NaN;
    const oneTimeTier = resolveTier(oneTimeAov, cfg);

    const monthlyProcessing = r2(grossMonthly * monthlyTier.ratePct + input.monthlyMembers * monthlyTier.flat);
    const annualProcessing = r2(grossAnnual * annualTier.ratePct + input.annualMembersBilled * annualTier.flat);
    const oneTimeProcessing = r2(grossOneTime * oneTimeTier.ratePct + input.oneTimeOrders * oneTimeTier.flat);
    const processingFees = r2(monthlyProcessing + annualProcessing + oneTimeProcessing);

    // Refunds
    const refundLoss = r2(totalGross * (input.refundRatePct / 100));

    // Payout drag (on payout base)
    const payoutBase = Math.max(0, totalGross - platformFees - processingFees - refundLoss);
    const payoutFees = r2(input.payoutsPerMonth * input.payoutFlat + payoutBase * (input.payoutPercentPct/100));

    const fixedCost = r2(input.otherMonthlyCost);

    const totalFees = r2(platformFees + processingFees + refundLoss + payoutFees + fixedCost);
    const netRevenue = r2(totalGross - totalFees);
    const effectiveFeeRatePct = totalGross > 0 ? round((totalFees / totalGross) * 100, 2) : 0;

    const monthlyOrders = input.monthlyMembers;
    const takeHomePerMonthlyMember = monthlyOrders > 0 ? r2(netRevenue / (monthlyOrders)) : null;

    // Solver: break‑even monthly price keeping other buckets fixed
    function netWithMonthlyPrice(price) {
      return calculate({ ...input, monthlyPrice: price }, { lang, skipSolve: true }).result.netRevenue;
    }

    function findBreakEvenMonthlyPrice() {
      // If total gross is zero and no members, trivial 0
      if (input.monthlyMembers <= 0) return null;
      let lo = 0, hi = 9999, mid, fmid;
      for (let i = 0; i < 72; i += 1) {
        mid = (lo + hi) / 2;
        fmid = netWithMonthlyPrice(mid);
        if (Math.abs(fmid) < 0.01) break;
        if (fmid < 0) lo = mid; else hi = mid;
      }
      return r2(mid);
    }

    function findRequiredGrossForTargetNet(targetNet) {
      if (!Number.isFinite(targetNet)) return null;
      if (targetNet <= netRevenue) return totalGross; // already at/above
      // Scale monthly price proportionally via gross scale
      let lo = totalGross, hi = totalGross * 50; // generous headroom
      let mid, net;
      for (let i = 0; i < 72; i += 1) {
        mid = (lo + hi) / 2;
        // derive implied monthly price scale to reach mid gross
        const otherGross = totalGross - grossMonthly;
        const neededMonthlyGross = Math.max(0, mid - otherGross);
        const price = input.monthlyMembers > 0 ? neededMonthlyGross / input.monthlyMembers : input.monthlyPrice;
        net = netWithMonthlyPrice(price);
        if (Math.abs(net - targetNet) < 0.01) break;
        if (net < targetNet) lo = mid; else hi = mid;
      }
      return r2(mid);
    }

    const breakEvenMonthlyPrice = opts.skipSolve ? null : findBreakEvenMonthlyPrice();
    const requiredGrossForTargetNet = (opts.skipSolve || input.desiredMonthlyNet == null) ? null : findRequiredGrossForTargetNet(input.desiredMonthlyNet);

    const summary = [
      t.summaryTitle,
      `${t.gross}: ${totalGross.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.platformFees}: ${platformFees.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.processingFees}: ${processingFees.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.refundLoss}: ${refundLoss.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.payoutFees}: ${payoutFees.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.net}: ${netRevenue.toLocaleString(undefined, { style: 'currency', currency: input.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t.effectiveRate}: ${effectiveFeeRatePct.toFixed(2)}%`,
      `${t.breakEvenPrice}: ${breakEvenMonthlyPrice == null ? t.na : breakEvenMonthlyPrice.toLocaleString(undefined, { style: 'currency', currency: input.currency })}`,
    ].join('\n');

    const comparisonRows = PLAN_PRESETS.map(p => {
      const rate = p.id === 'custom' ? (input.customPlanRatePct/100) : (p.ratePct/100);
      const pf = r2(totalGross * rate);
      const tf = r2(pf + processingFees + refundLoss + payoutFees + fixedCost);
      const net = r2(totalGross - tf);
      return { id: p.id, ratePct: p.id === 'custom' ? input.customPlanRatePct : p.ratePct, netRevenue: net };
    });

    return {
      result: {
        input,
        grossMonthly, grossAnnual, grossOneTime, totalGross,
        platformFees, monthlyProcessing, annualProcessing, oneTimeProcessing, processingFees,
        refundLoss, payoutFees, fixedCost, totalFees, netRevenue,
        effectiveFeeRatePct,
        takeHomePerMonthlyMember,
        breakEvenMonthlyPrice,
        requiredGrossForTargetNet,
        comparisonRows,
        summary
      },
      error: ''
    };
  }

  const api = {
    PLAN_PRESETS,
    PROCESSING_DEFAULTS,
    DEFAULTS,
    calculate,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PatreonCalculator = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
