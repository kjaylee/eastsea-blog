(function (root) {
  'use strict';

  var PLATFORM_FEE_RATE = 0.20;

  var DEFAULTS = {
    activeSubscribers: 150,
    subscriptionPrice: 9.99,
    tipsRevenue: 800,
    ppvRevenue: 500,
    customRevenue: 200,
    refundRatePct: 2,
    payoutDelayDays: 7,
    annualCashCostPct: 8,
    promoCost: 300,
    otherCost: 150,
    targetMonthlyNet: 5000
  };

  var TEXT = {
    en: {
      errSubscribers: 'Active subscribers must be 0 or above.',
      errPrice: 'Subscription price must be 0 or above.',
      errTips: 'Tips revenue must be 0 or above.',
      errPpv: 'PPV / message revenue must be 0 or above.',
      errCustom: 'Custom / other revenue must be 0 or above.',
      errRefund: 'Refund rate must be 0 or above and below 100%.',
      errDelay: 'Payout delay must be 0 to 365 days.',
      errCashCost: 'Annual cash-cost rate must be 0 to 100%.',
      errPromo: 'Promo cost must be 0 or above.',
      errOther: 'Other cost must be 0 or above.',
      errTarget: 'Target monthly net must be 0 or above.',
      warnNegative: 'Net income is negative under current assumptions.',
      warnImpossible: 'Per-subscriber contribution is zero or negative — subscriber targets cannot be calculated.',
      summaryTitle: '[OnlyFans Earnings Summary]',
      na: 'N/A',
      impossible: 'Impossible'
    },
    ko: {
      errSubscribers: '활성 구독자 수는 0 이상이어야 합니다.',
      errPrice: '구독 가격은 0 이상이어야 합니다.',
      errTips: '팁 수익은 0 이상이어야 합니다.',
      errPpv: 'PPV/메시지 수익은 0 이상이어야 합니다.',
      errCustom: '커스텀/기타 수익은 0 이상이어야 합니다.',
      errRefund: '환불률은 0 이상 100 미만이어야 합니다.',
      errDelay: '정산 지연은 0~365일이어야 합니다.',
      errCashCost: '연간 자금비용률은 0~100%이어야 합니다.',
      errPromo: '프로모 비용은 0 이상이어야 합니다.',
      errOther: '기타 비용은 0 이상이어야 합니다.',
      errTarget: '목표 월 순수입은 0 이상이어야 합니다.',
      warnNegative: '현재 가정에서 순수입이 음수입니다.',
      warnImpossible: '구독자당 기여액이 0 이하여서 구독자 목표를 계산할 수 없습니다.',
      summaryTitle: '[OnlyFans 실수령액 요약]',
      na: 'N/A',
      impossible: '불가'
    }
  };

  function round2(v) { return Math.round((v + Number.EPSILON) * 100) / 100; }
  function round4(v) { return Math.round((v + Number.EPSILON) * 10000) / 10000; }

  function normalize(input) {
    return {
      activeSubscribers:  Number(input.activeSubscribers   ?? DEFAULTS.activeSubscribers),
      subscriptionPrice:  Number(input.subscriptionPrice    ?? DEFAULTS.subscriptionPrice),
      tipsRevenue:        Number(input.tipsRevenue          ?? DEFAULTS.tipsRevenue),
      ppvRevenue:         Number(input.ppvRevenue           ?? DEFAULTS.ppvRevenue),
      customRevenue:      Number(input.customRevenue        ?? DEFAULTS.customRevenue),
      refundRatePct:      Number(input.refundRatePct        ?? DEFAULTS.refundRatePct),
      payoutDelayDays:    Number(input.payoutDelayDays      ?? DEFAULTS.payoutDelayDays),
      annualCashCostPct:  Number(input.annualCashCostPct    ?? DEFAULTS.annualCashCostPct),
      promoCost:          Number(input.promoCost            ?? DEFAULTS.promoCost),
      otherCost:          Number(input.otherCost            ?? DEFAULTS.otherCost),
      targetMonthlyNet:   Number(input.targetMonthlyNet     ?? DEFAULTS.targetMonthlyNet)
    };
  }

  function validate(v, lang) {
    var t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(v.activeSubscribers) || v.activeSubscribers < 0) return t.errSubscribers;
    if (!Number.isFinite(v.subscriptionPrice) || v.subscriptionPrice < 0) return t.errPrice;
    if (!Number.isFinite(v.tipsRevenue) || v.tipsRevenue < 0) return t.errTips;
    if (!Number.isFinite(v.ppvRevenue) || v.ppvRevenue < 0) return t.errPpv;
    if (!Number.isFinite(v.customRevenue) || v.customRevenue < 0) return t.errCustom;
    if (!Number.isFinite(v.refundRatePct) || v.refundRatePct < 0 || v.refundRatePct >= 100) return t.errRefund;
    if (!Number.isFinite(v.payoutDelayDays) || v.payoutDelayDays < 0 || v.payoutDelayDays > 365) return t.errDelay;
    if (!Number.isFinite(v.annualCashCostPct) || v.annualCashCostPct < 0 || v.annualCashCostPct > 100) return t.errCashCost;
    if (!Number.isFinite(v.promoCost) || v.promoCost < 0) return t.errPromo;
    if (!Number.isFinite(v.otherCost) || v.otherCost < 0) return t.errOther;
    if (!Number.isFinite(v.targetMonthlyNet) || v.targetMonthlyNet < 0) return t.errTarget;
    return '';
  }

  function calculate(input, options) {
    var lang = (options && options.lang) || 'en';
    var t = TEXT[lang] || TEXT.en;
    var v = normalize(input);
    var error = validate(v, lang);
    if (error) return { result: null, error: error };

    var subscriptionRevenue = v.activeSubscribers * v.subscriptionPrice;
    var ancillaryRevenue = v.tipsRevenue + v.ppvRevenue + v.customRevenue;
    var grossRevenue = subscriptionRevenue + ancillaryRevenue;
    var platformFee = grossRevenue * PLATFORM_FEE_RATE;
    var refundLoss = grossRevenue * (v.refundRatePct / 100);
    var proceedsBeforeDrag = grossRevenue - platformFee - refundLoss;
    var payoutDrag = proceedsBeforeDrag * (v.annualCashCostPct / 100) * (v.payoutDelayDays / 365);
    var takeHomeBeforeOps = proceedsBeforeDrag - payoutDrag;
    var totalOpsCost = v.promoCost + v.otherCost;
    var netIncome = takeHomeBeforeOps - totalOpsCost;
    var annualizedNet = netIncome * 12;

    var effectiveKeepRate = grossRevenue > 0 ? takeHomeBeforeOps / grossRevenue : 0;
    var effectiveNetRate = grossRevenue > 0 ? netIncome / grossRevenue : 0;

    var grossPerSubscriber = v.activeSubscribers > 0 ? grossRevenue / v.activeSubscribers : null;
    var takeHomePerSub = v.activeSubscribers > 0 ? takeHomeBeforeOps / v.activeSubscribers : null;

    // Required subscribers for target net (assuming current per-subscriber contribution scales)
    var requiredSubscribersForTarget = null;
    var breakEvenSubscribers = null;
    var requiredSubscriptionPrice = null;

    if (takeHomePerSub !== null && takeHomePerSub > 0) {
      requiredSubscribersForTarget = Math.ceil((v.targetMonthlyNet + totalOpsCost) / takeHomePerSub);
      breakEvenSubscribers = totalOpsCost > 0 ? Math.ceil(totalOpsCost / takeHomePerSub) : 0;
    }

    // Required subscription price at current subscriber count to hit target net
    if (v.activeSubscribers > 0) {
      // total needed from take-home = targetMonthlyNet + totalOpsCost
      // take-home = gross * (1 - platformFee) * (1 - refund) * (1 - dragFactor) approximately
      // more precisely:
      // takeHomeBeforeOps = (gross - gross*0.2 - gross*refund) - (gross*(1-0.2-refund)) * dragFactor
      // where dragFactor = annualCashCost * payoutDelay / 365
      // = gross * (1 - 0.2 - refund) * (1 - dragFactor)
      // gross = subs * price + ancillary
      // We need: subs * price_new + ancillary = totalNeeded / ((1-0.2-refund)*(1-dragFactor))
      var refundRate = v.refundRatePct / 100;
      var dragFactor = (v.annualCashCostPct / 100) * (v.payoutDelayDays / 365);
      var multiplier = (1 - PLATFORM_FEE_RATE - refundRate) * (1 - dragFactor);
      if (multiplier > 0) {
        var neededGross = (v.targetMonthlyNet + totalOpsCost) / multiplier;
        var neededSubRevenue = neededGross - ancillaryRevenue;
        if (neededSubRevenue >= 0) {
          requiredSubscriptionPrice = neededSubRevenue / v.activeSubscribers;
        }
      }
    }

    var warnings = [];
    if (netIncome < 0) warnings.push(t.warnNegative);
    if (takeHomePerSub !== null && takeHomePerSub <= 0) warnings.push(t.warnImpossible);

    // Summary
    function fmt(val) { return val == null ? t.na : '$' + val.toFixed(2); }
    function fmtPct(val) { return val == null ? t.na : (val * 100).toFixed(2) + '%'; }
    var summary = [
      t.summaryTitle,
      (lang === 'ko' ? '활성 구독자' : 'Active subscribers') + ': ' + v.activeSubscribers,
      (lang === 'ko' ? '구독 가격' : 'Subscription price') + ': ' + fmt(v.subscriptionPrice),
      (lang === 'ko' ? '총 월 매출' : 'Gross monthly revenue') + ': ' + fmt(grossRevenue),
      (lang === 'ko' ? 'OnlyFans 수수료 (20%)' : 'OnlyFans fee (20%)') + ': ' + fmt(platformFee),
      (lang === 'ko' ? '환불/차지백 손실' : 'Refund / chargeback loss') + ': ' + fmt(refundLoss),
      (lang === 'ko' ? '정산 지연 비용' : 'Payout drag cost') + ': ' + fmt(payoutDrag),
      (lang === 'ko' ? '운영비 차감 전 실수령' : 'Take-home before ops') + ': ' + fmt(takeHomeBeforeOps),
      (lang === 'ko' ? '월 순수입' : 'Net monthly income') + ': ' + fmt(netIncome),
      (lang === 'ko' ? '연환산 순수입' : 'Annualized net income') + ': ' + fmt(annualizedNet),
      (lang === 'ko' ? '실효 수취율' : 'Effective keep rate') + ': ' + fmtPct(effectiveKeepRate),
      (lang === 'ko' ? '목표 달성 필요 구독자' : 'Required subscribers for target') + ': ' + (requiredSubscribersForTarget == null ? t.impossible : requiredSubscribersForTarget),
      (lang === 'ko' ? '손익분기 구독자' : 'Break-even subscribers') + ': ' + (breakEvenSubscribers == null ? t.impossible : breakEvenSubscribers),
      '',
      lang === 'ko'
        ? '참고: OnlyFans 공개 20% 수수료 기준. 세금, 출금 수수료, 에이전시 수수료는 미포함.'
        : 'Note: Based on OnlyFans public 20% platform fee. Taxes, withdrawal fees, and agency splits are not modeled.'
    ].join('\n');

    var result = {
      inputs: v,
      subscriptionRevenue: round2(subscriptionRevenue),
      ancillaryRevenue: round2(ancillaryRevenue),
      grossRevenue: round2(grossRevenue),
      platformFee: round2(platformFee),
      platformFeeRate: PLATFORM_FEE_RATE,
      refundLoss: round2(refundLoss),
      proceedsBeforeDrag: round2(proceedsBeforeDrag),
      payoutDrag: round2(payoutDrag),
      takeHomeBeforeOps: round2(takeHomeBeforeOps),
      promoCost: round2(v.promoCost),
      otherCost: round2(v.otherCost),
      totalOpsCost: round2(totalOpsCost),
      netIncome: round2(netIncome),
      annualizedNet: round2(annualizedNet),
      effectiveKeepRate: round4(effectiveKeepRate),
      effectiveKeepRatePct: round2(effectiveKeepRate * 100),
      effectiveNetRate: round4(effectiveNetRate),
      effectiveNetRatePct: round2(effectiveNetRate * 100),
      grossPerSubscriber: grossPerSubscriber == null ? null : round2(grossPerSubscriber),
      takeHomePerSubscriber: takeHomePerSub == null ? null : round2(takeHomePerSub),
      requiredSubscribersForTarget: requiredSubscribersForTarget,
      breakEvenSubscribers: breakEvenSubscribers,
      requiredSubscriptionPrice: requiredSubscriptionPrice == null ? null : round2(requiredSubscriptionPrice),
      warnings: warnings,
      summary: summary
    };

    return { result: result, error: '' };
  }

  var api = {
    PLATFORM_FEE_RATE: PLATFORM_FEE_RATE,
    DEFAULTS: DEFAULTS,
    TEXT: TEXT,
    normalize: normalize,
    validate: validate,
    calculate: calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.OnlyFansCalc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
