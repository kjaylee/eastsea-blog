(function (root) {
  const PLAN_PRESETS = {
    selfHosted: {
      monthlyCost: 0,
      supportsPaid: true,
      label: 'Self-hosted Ghost',
    },
    starter: {
      monthlyCost: 18,
      supportsPaid: false,
      label: 'Ghost(Pro) Starter',
    },
    publisher: {
      monthlyCost: 29,
      supportsPaid: true,
      label: 'Ghost(Pro) Publisher',
    },
    business: {
      monthlyCost: 199,
      supportsPaid: true,
      label: 'Ghost(Pro) Business',
    },
    custom: {
      monthlyCost: null,
      supportsPaid: true,
      label: 'Custom monthly cost',
    },
  };

  const DEFAULTS = {
    planPreset: 'publisher',
    customMonthlyCost: 29,
    monthlyPrice: 9,
    monthlyMembers: 220,
    annualPrice: 90,
    annualMembers: 60,
    oneTimeRevenue: 600,
    oneTimePayments: 20,
    refundRatePct: 2,
    processorRatePct: 2.9,
    processorFixedFee: 0.3,
    otherMonthlyCosts: 150,
    targetMonthlyNet: 3000,
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      planPreset: 'Unsupported Ghost plan preset.',
      customMonthlyCost: 'Custom monthly Ghost cost must be 0 or above.',
      monthlyPrice: 'Monthly membership price must be 0 or above.',
      monthlyMembers: 'Monthly paid members must be a whole number 0 or above.',
      annualPrice: 'Annual membership price must be 0 or above.',
      annualMembers: 'Annual paid members must be a whole number 0 or above.',
      oneTimeRevenue: 'One-time revenue must be 0 or above.',
      oneTimePayments: 'One-time payments must be a whole number 0 or above.',
      oneTimePair: 'If one-time revenue is above 0, one-time payments must be at least 1.',
      refundRatePct: 'Refund rate must be 0 or above and below 100%.',
      processorRatePct: 'Processor rate must be 0 or above and below 100%.',
      processorFixedFee: 'Processor fixed fee must be 0 or above.',
      otherMonthlyCosts: 'Other monthly costs must be 0 or above.',
      targetMonthlyNet: 'Target monthly net must be 0 or above.',
      starterPaid:
        'Ghost(Pro) Starter does not support paid subscriptions or tips. Pick Publisher, Business, self-hosted, or custom.',
      waiting: 'Enter valid Ghost assumptions to estimate take-home.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      summaryTitle: '[Ghost Membership Fee Calculator Summary]',
      note:
        'Ghost officially states 0% transaction fees; Stripe processing still applies. Ghost(Pro) Starter is excluded from paid memberships. Preset monthly costs are editable planning defaults based on the official Ghost pricing page checked on March 27, 2026.',
      annualSmooth:
        'Annual members are smoothed into monthly-equivalent revenue and charge count by dividing annual billings across 12 months.',
      infraWarning:
        'Self-hosted Ghost keeps Ghost platform cost at $0 here. Add hosting, email, and ops cost under Other monthly costs if you run your own stack.',
      marginGood: 'Ghost keeps strong take-home under these assumptions.',
      marginWarn: 'Fee drag is meaningful. Re-check plan cost, refunds, or low-ticket pricing.',
      marginBad: 'The current setup is underwater. Raise price, reduce costs, or improve conversion quality.',
      na: 'N/A',
    },
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function isWholeNumber(value) {
    return Number.isFinite(value) && Math.trunc(value) === value;
  }

  function normalizeInput(input) {
    return {
      planPreset: String(input.planPreset || DEFAULTS.planPreset),
      customMonthlyCost: Number(input.customMonthlyCost ?? DEFAULTS.customMonthlyCost),
      monthlyPrice: Number(input.monthlyPrice ?? DEFAULTS.monthlyPrice),
      monthlyMembers: Number(input.monthlyMembers ?? DEFAULTS.monthlyMembers),
      annualPrice: Number(input.annualPrice ?? DEFAULTS.annualPrice),
      annualMembers: Number(input.annualMembers ?? DEFAULTS.annualMembers),
      oneTimeRevenue: Number(input.oneTimeRevenue ?? DEFAULTS.oneTimeRevenue),
      oneTimePayments: Number(input.oneTimePayments ?? DEFAULTS.oneTimePayments),
      refundRatePct: Number(input.refundRatePct ?? DEFAULTS.refundRatePct),
      processorRatePct: Number(input.processorRatePct ?? DEFAULTS.processorRatePct),
      processorFixedFee: Number(input.processorFixedFee ?? DEFAULTS.processorFixedFee),
      otherMonthlyCosts: Number(input.otherMonthlyCosts ?? DEFAULTS.otherMonthlyCosts),
      targetMonthlyNet: Number(input.targetMonthlyNet ?? DEFAULTS.targetMonthlyNet),
    };
  }

  function getGhostMonthlyCost(values) {
    if (values.planPreset === 'custom') {
      return values.customMonthlyCost;
    }
    return PLAN_PRESETS[values.planPreset].monthlyCost;
  }

  function validate(values, lang) {
    const t = TEXT[lang] || TEXT.en;
    const preset = PLAN_PRESETS[values.planPreset];

    if (!preset) return t.planPreset;
    if (!Number.isFinite(values.customMonthlyCost) || values.customMonthlyCost < 0) return t.customMonthlyCost;
    if (!Number.isFinite(values.monthlyPrice) || values.monthlyPrice < 0) return t.monthlyPrice;
    if (!isWholeNumber(values.monthlyMembers) || values.monthlyMembers < 0) return t.monthlyMembers;
    if (!Number.isFinite(values.annualPrice) || values.annualPrice < 0) return t.annualPrice;
    if (!isWholeNumber(values.annualMembers) || values.annualMembers < 0) return t.annualMembers;
    if (!Number.isFinite(values.oneTimeRevenue) || values.oneTimeRevenue < 0) return t.oneTimeRevenue;
    if (!isWholeNumber(values.oneTimePayments) || values.oneTimePayments < 0) return t.oneTimePayments;
    if (values.oneTimeRevenue > 0 && values.oneTimePayments < 1) return t.oneTimePair;
    if (!Number.isFinite(values.refundRatePct) || values.refundRatePct < 0 || values.refundRatePct >= 100) return t.refundRatePct;
    if (!Number.isFinite(values.processorRatePct) || values.processorRatePct < 0 || values.processorRatePct >= 100) return t.processorRatePct;
    if (!Number.isFinite(values.processorFixedFee) || values.processorFixedFee < 0) return t.processorFixedFee;
    if (!Number.isFinite(values.otherMonthlyCosts) || values.otherMonthlyCosts < 0) return t.otherMonthlyCosts;
    if (!Number.isFinite(values.targetMonthlyNet) || values.targetMonthlyNet < 0) return t.targetMonthlyNet;

    if (!preset.supportsPaid) {
      const hasPaidMotion =
        values.monthlyPrice > 0 ||
        values.monthlyMembers > 0 ||
        values.annualPrice > 0 ||
        values.annualMembers > 0 ||
        values.oneTimeRevenue > 0 ||
        values.oneTimePayments > 0;

      if (hasPaidMotion) {
        return t.starterPaid;
      }
    }

    return '';
  }

  function calculateScenario(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const values = normalizeInput(input || {});
    const error = validate(values, lang);

    if (error) {
      return { ok: false, error, values };
    }

    const planPreset = PLAN_PRESETS[values.planPreset];
    const ghostMonthlyCost = getGhostMonthlyCost(values);
    const refundRate = values.refundRatePct / 100;
    const processorRate = values.processorRatePct / 100;

    const monthlyRecurringGross = values.monthlyPrice * values.monthlyMembers;
    const annualMonthlyEquivalentGross = (values.annualPrice * values.annualMembers) / 12;
    const recurringGross = monthlyRecurringGross + annualMonthlyEquivalentGross;
    const grossMonthlyEquivalentRevenue = recurringGross + values.oneTimeRevenue;

    const estimatedAnnualChargesPerMonth = values.annualMembers / 12;
    const estimatedTransactionCount =
      values.monthlyMembers + estimatedAnnualChargesPerMonth + values.oneTimePayments;

    const refundLoss = grossMonthlyEquivalentRevenue * refundRate;
    const processorVariableFees = grossMonthlyEquivalentRevenue * processorRate;
    const processorFixedFees = estimatedTransactionCount * values.processorFixedFee;
    const processorTotalFees = processorVariableFees + processorFixedFees;
    const totalCosts =
      refundLoss + processorTotalFees + ghostMonthlyCost + values.otherMonthlyCosts;
    const netTakeHome = grossMonthlyEquivalentRevenue - totalCosts;
    const effectiveTakeHomePct =
      grossMonthlyEquivalentRevenue > 0
        ? (netTakeHome / grossMonthlyEquivalentRevenue) * 100
        : 0;

    const fixedFeeRateEquivalent =
      grossMonthlyEquivalentRevenue > 0
        ? processorFixedFees / grossMonthlyEquivalentRevenue
        : Number.POSITIVE_INFINITY;
    const contributionMarginRate =
      1 - refundRate - processorRate - fixedFeeRateEquivalent;

    const fixedMonthlyCosts = ghostMonthlyCost + values.otherMonthlyCosts;
    const breakEvenGrossMonthlyRevenue =
      contributionMarginRate > 0 ? fixedMonthlyCosts / contributionMarginRate : null;
    const targetGrossMonthlyRevenue =
      contributionMarginRate > 0
        ? (fixedMonthlyCosts + values.targetMonthlyNet) / contributionMarginRate
        : null;

    const activePaidMembers = values.monthlyMembers + values.annualMembers;
    const avgRecurringRevenuePerPaidMember =
      activePaidMembers > 0 ? recurringGross / activePaidMembers : 0;
    const requiredPaidMembersForTarget =
      targetGrossMonthlyRevenue != null && avgRecurringRevenuePerPaidMember > 0
        ? Math.ceil(
            Math.max(targetGrossMonthlyRevenue - values.oneTimeRevenue, 0) /
              avgRecurringRevenuePerPaidMember
          )
        : null;
    const additionalPaidMembersNeeded =
      requiredPaidMembersForTarget != null
        ? Math.max(requiredPaidMembersForTarget - activePaidMembers, 0)
        : null;

    const warnings = [];
    if (values.annualMembers > 0) {
      warnings.push(t.annualSmooth);
    }
    if (values.planPreset === 'selfHosted') {
      warnings.push(t.infraWarning);
    }

    let health = 'good';
    let healthLabel = t.marginGood;
    if (netTakeHome < 0) {
      health = 'bad';
      healthLabel = t.marginBad;
    } else if (effectiveTakeHomePct < 75) {
      health = 'warn';
      healthLabel = t.marginWarn;
    }

    const result = {
      ok: true,
      input: values,
      planLabel: planPreset.label,
      ghostMonthlyCost: round2(ghostMonthlyCost),
      monthlyRecurringGross: round2(monthlyRecurringGross),
      annualMonthlyEquivalentGross: round2(annualMonthlyEquivalentGross),
      recurringGross: round2(recurringGross),
      oneTimeRevenue: round2(values.oneTimeRevenue),
      grossMonthlyEquivalentRevenue: round2(grossMonthlyEquivalentRevenue),
      estimatedAnnualChargesPerMonth: round4(estimatedAnnualChargesPerMonth),
      estimatedTransactionCount: round4(estimatedTransactionCount),
      refundLoss: round2(refundLoss),
      processorVariableFees: round2(processorVariableFees),
      processorFixedFees: round2(processorFixedFees),
      processorTotalFees: round2(processorTotalFees),
      otherMonthlyCosts: round2(values.otherMonthlyCosts),
      totalCosts: round2(totalCosts),
      netTakeHome: round2(netTakeHome),
      effectiveTakeHomePct: round4(effectiveTakeHomePct),
      fixedFeeRateEquivalent: round4(fixedFeeRateEquivalent * 100),
      contributionMarginRate: round4(contributionMarginRate * 100),
      breakEvenGrossMonthlyRevenue:
        breakEvenGrossMonthlyRevenue == null ? null : round2(breakEvenGrossMonthlyRevenue),
      targetGrossMonthlyRevenue:
        targetGrossMonthlyRevenue == null ? null : round2(targetGrossMonthlyRevenue),
      activePaidMembers,
      avgRecurringRevenuePerPaidMember: round4(avgRecurringRevenuePerPaidMember),
      requiredPaidMembersForTarget,
      additionalPaidMembersNeeded,
      health,
      healthLabel,
      warnings,
    };

    result.summary = buildSummary(result, lang);

    return result;
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const lines = [
      t.summaryTitle,
      '',
      'Ghost plan: ' + result.planLabel,
      'Gross monthly-equivalent revenue: $' + result.grossMonthlyEquivalentRevenue.toFixed(2),
      'Processor fees: $' + result.processorTotalFees.toFixed(2),
      'Ghost monthly cost: $' + result.ghostMonthlyCost.toFixed(2),
      'Refund loss: $' + result.refundLoss.toFixed(2),
      'Other monthly costs: $' + result.otherMonthlyCosts.toFixed(2),
      'Net take-home: $' + result.netTakeHome.toFixed(2),
      'Effective take-home: ' + result.effectiveTakeHomePct.toFixed(2) + '%',
      'Break-even gross revenue: ' +
        (result.breakEvenGrossMonthlyRevenue == null
          ? t.na
          : '$' + result.breakEvenGrossMonthlyRevenue.toFixed(2)),
      'Required gross for target: ' +
        (result.targetGrossMonthlyRevenue == null
          ? t.na
          : '$' + result.targetGrossMonthlyRevenue.toFixed(2)),
      'Paid members needed for target: ' +
        (result.requiredPaidMembersForTarget == null ? t.na : result.requiredPaidMembersForTarget),
      'Additional paid members needed: ' +
        (result.additionalPaidMembersNeeded == null ? t.na : result.additionalPaidMembersNeeded),
    ];

    if (result.warnings.length) {
      lines.push('');
      lines.push('Notes:');
      result.warnings.forEach((warning) => lines.push('- ' + warning));
    }

    return lines.join('\n');
  }

  const exportsObject = {
    PLAN_PRESETS,
    DEFAULTS,
    TEXT,
    normalizeInput,
    calculateScenario,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsObject;
  } else {
    root.GhostMembershipFeeCalc = exportsObject;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
