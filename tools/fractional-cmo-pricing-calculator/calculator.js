(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.FractionalCmoPricingCalculator = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_INPUTS = {
    currentRetainer: 5500,
    strategyHours: 8,
    leadershipHours: 6,
    channelReviewHours: 10,
    supportHours: 8,
    seniorRate: 175,
    supportRate: 60,
    toolBudget: 350,
    overhead: 900,
    scopeBufferPct: 18,
    paymentFeePct: 3,
    targetMarginPct: 30,
    onboardingHours: 12,
    contractMonths: 6,
  };

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function validate(input) {
    const checks = [
      ['currentRetainer', 1, 1000000],
      ['strategyHours', 0, 200],
      ['leadershipHours', 0, 200],
      ['channelReviewHours', 0, 300],
      ['supportHours', 0, 300],
      ['seniorRate', 1, 10000],
      ['supportRate', 0, 10000],
      ['toolBudget', 0, 1000000],
      ['overhead', 0, 1000000],
      ['scopeBufferPct', 0, 200],
      ['paymentFeePct', 0, 40],
      ['targetMarginPct', 0, 90],
      ['onboardingHours', 0, 200],
      ['contractMonths', 1, 60],
    ];

    for (const [key, min, max] of checks) {
      const value = Number(input[key]);
      if (!Number.isFinite(value)) {
        return `${key} must be a finite number.`;
      }
      if (value < min || value > max) {
        return `${key} must be between ${min} and ${max}.`;
      }
    }

    const seniorBaseHours = Number(input.strategyHours) + Number(input.leadershipHours) + Number(input.channelReviewHours);
    if (seniorBaseHours <= 0) {
      return 'At least one senior delivery hour bucket must be greater than zero.';
    }

    if (Number(input.paymentFeePct) >= 100) {
      return 'paymentFeePct must stay below 100%.';
    }

    if (Number(input.paymentFeePct) + Number(input.targetMarginPct) >= 100) {
      return 'Target margin plus payment fees must stay below 100%.';
    }

    return '';
  }

  function buildTier(name, focus, multipliers, baseInput, paymentFeeRate, targetMarginRate) {
    const seniorBaseHours = (baseInput.strategyHours + baseInput.leadershipHours + baseInput.channelReviewHours) * multipliers.senior;
    const bufferedSeniorHours = seniorBaseHours * (1 + baseInput.scopeBufferPct / 100);
    const rawSupportHours = baseInput.supportHours * multipliers.support;
    const bufferedSupportHours = rawSupportHours * (1 + baseInput.scopeBufferPct / 200);
    const deliveryCost =
      bufferedSeniorHours * baseInput.seniorRate +
      bufferedSupportHours * baseInput.supportRate +
      baseInput.toolBudget * multipliers.tools +
      baseInput.overhead * multipliers.overhead;

    const suggestedRetainer = deliveryCost / (1 - paymentFeeRate - targetMarginRate);
    const totalHours = bufferedSeniorHours + bufferedSupportHours;

    return {
      name,
      focus,
      totalHours: round2(totalHours),
      deliveryCost: round2(deliveryCost),
      suggestedRetainer: round2(suggestedRetainer),
    };
  }

  function buildSummary(result, locale, currency) {
    const money = new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    });
    const num = new Intl.NumberFormat(locale || 'en-US', { maximumFractionDigits: 2 });

    const tierLines = result.tiers
      .map((tier) => `${tier.name}: ${money.format(tier.suggestedRetainer)} / mo (${num.format(tier.totalHours)} hrs)`)
      .join('\n');

    return [
      '[Fractional CMO Pricing Plan]',
      `Recommended Monthly Retainer: ${money.format(result.recommendedRetainer)}`,
      `Break-even Retainer: ${money.format(result.breakEvenRetainer)}`,
      `Suggested Onboarding Fee: ${money.format(result.suggestedOnboardingFee)}`,
      `Estimated Contract Value (${num.format(result.inputs.contractMonths)} months): ${money.format(result.contractValue)}`,
      `Current Operating Margin: ${num.format(result.currentOperatingMarginPct)}%`,
      `Margin Gap to Target: ${num.format(result.marginGapPct)} pts`,
      `Net Realized Hourly Rate @ Recommendation: ${money.format(result.netRealizedHourlyRate)} / hr`,
      `Status: ${result.status}`,
      'Tier Ladder:',
      tierLines,
    ].join('\n');
  }

  function calculate(rawInput) {
    const input = Object.assign({}, DEFAULT_INPUTS, rawInput || {});
    const error = validate(input);
    if (error) {
      return { result: null, error };
    }

    const currentRetainer = Number(input.currentRetainer);
    const strategyHours = Number(input.strategyHours);
    const leadershipHours = Number(input.leadershipHours);
    const channelReviewHours = Number(input.channelReviewHours);
    const supportHours = Number(input.supportHours);
    const seniorRate = Number(input.seniorRate);
    const supportRate = Number(input.supportRate);
    const toolBudget = Number(input.toolBudget);
    const overhead = Number(input.overhead);
    const scopeBufferPct = Number(input.scopeBufferPct);
    const paymentFeePct = Number(input.paymentFeePct);
    const targetMarginPct = Number(input.targetMarginPct);
    const onboardingHours = Number(input.onboardingHours);
    const contractMonths = Number(input.contractMonths);

    const paymentFeeRate = paymentFeePct / 100;
    const targetMarginRate = targetMarginPct / 100;

    const seniorBaseHours = strategyHours + leadershipHours + channelReviewHours;
    const bufferedSeniorHours = seniorBaseHours * (1 + scopeBufferPct / 100);
    const bufferedSupportHours = supportHours * (1 + scopeBufferPct / 200);
    const totalDeliveryHours = bufferedSeniorHours + bufferedSupportHours;

    const seniorLaborCost = bufferedSeniorHours * seniorRate;
    const supportLaborCost = bufferedSupportHours * supportRate;
    const monthlyDeliveryCost = seniorLaborCost + supportLaborCost + toolBudget + overhead;

    const breakEvenDenominator = 1 - paymentFeeRate;
    const targetDenominator = 1 - paymentFeeRate - targetMarginRate;

    if (breakEvenDenominator <= 0) {
      return { result: null, error: 'Break-even pricing is impossible with the current payment fee.' };
    }

    if (targetDenominator <= 0) {
      return { result: null, error: 'Target margin is too high relative to payment fees.' };
    }

    const breakEvenRetainer = monthlyDeliveryCost / breakEvenDenominator;
    const recommendedRetainer = monthlyDeliveryCost / targetDenominator;

    const onboardingCost = onboardingHours * seniorRate;
    const suggestedOnboardingFee = onboardingCost / targetDenominator;
    const contractValue = recommendedRetainer * contractMonths + suggestedOnboardingFee;

    const currentPaymentFees = currentRetainer * paymentFeeRate;
    const currentNetAfterFees = currentRetainer - currentPaymentFees;
    const currentOperatingProfit = currentNetAfterFees - monthlyDeliveryCost;
    const currentOperatingMarginPct = currentRetainer > 0
      ? (currentOperatingProfit / currentRetainer) * 100
      : 0;

    const targetNetAfterFees = recommendedRetainer * (1 - paymentFeeRate);
    const profitAtRecommendedRetainer = targetNetAfterFees - monthlyDeliveryCost;
    const netRealizedHourlyRate = totalDeliveryHours > 0 ? targetNetAfterFees / totalDeliveryHours : 0;
    const marginGapPct = targetMarginPct - currentOperatingMarginPct;

    const tiers = [
      buildTier('Advisor', 'Strategy and leadership cadence for early-stage teams.', {
        senior: 0.65,
        support: 0.5,
        tools: 0.75,
        overhead: 0.9,
      }, {
        strategyHours,
        leadershipHours,
        channelReviewHours,
        supportHours,
        seniorRate,
        supportRate,
        toolBudget,
        overhead,
        scopeBufferPct,
      }, paymentFeeRate, targetMarginRate),
      buildTier('Growth', 'Baseline cross-channel operator for weekly execution oversight.', {
        senior: 1,
        support: 1,
        tools: 1,
        overhead: 1,
      }, {
        strategyHours,
        leadershipHours,
        channelReviewHours,
        supportHours,
        seniorRate,
        supportRate,
        toolBudget,
        overhead,
        scopeBufferPct,
      }, paymentFeeRate, targetMarginRate),
      buildTier('Performance', 'Broader experimentation, reporting, and agency management scope.', {
        senior: 1.45,
        support: 1.35,
        tools: 1.25,
        overhead: 1.15,
      }, {
        strategyHours,
        leadershipHours,
        channelReviewHours,
        supportHours,
        seniorRate,
        supportRate,
        toolBudget,
        overhead,
        scopeBufferPct,
      }, paymentFeeRate, targetMarginRate),
    ];

    const status = currentOperatingMarginPct >= targetMarginPct + 3
      ? 'strong'
      : currentOperatingMarginPct >= targetMarginPct - 3
        ? 'balanced'
        : 'risky';

    const result = {
      inputs: {
        currentRetainer,
        strategyHours,
        leadershipHours,
        channelReviewHours,
        supportHours,
        seniorRate,
        supportRate,
        toolBudget,
        overhead,
        scopeBufferPct,
        paymentFeePct,
        targetMarginPct,
        onboardingHours,
        contractMonths,
      },
      seniorBaseHours: round2(seniorBaseHours),
      bufferedSeniorHours: round2(bufferedSeniorHours),
      bufferedSupportHours: round2(bufferedSupportHours),
      totalDeliveryHours: round2(totalDeliveryHours),
      seniorLaborCost: round2(seniorLaborCost),
      supportLaborCost: round2(supportLaborCost),
      monthlyDeliveryCost: round2(monthlyDeliveryCost),
      breakEvenRetainer: round2(breakEvenRetainer),
      recommendedRetainer: round2(recommendedRetainer),
      onboardingCost: round2(onboardingCost),
      suggestedOnboardingFee: round2(suggestedOnboardingFee),
      contractValue: round2(contractValue),
      currentPaymentFees: round2(currentPaymentFees),
      currentNetAfterFees: round2(currentNetAfterFees),
      currentOperatingProfit: round2(currentOperatingProfit),
      currentOperatingMarginPct: round2(currentOperatingMarginPct),
      profitAtRecommendedRetainer: round2(profitAtRecommendedRetainer),
      netRealizedHourlyRate: round2(netRealizedHourlyRate),
      marginGapPct: round2(marginGapPct),
      tiers,
      status,
    };

    result.summary = buildSummary(result, 'en-US', 'USD');

    return { result, error: '' };
  }

  return {
    DEFAULT_INPUTS,
    calculate,
    buildSummary,
  };
}));
