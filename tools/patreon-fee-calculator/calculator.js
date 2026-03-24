(function (root) {
  const PLAN_PRESETS = {
    'standard':       { platformFeePct: 10, label: { en: 'Standard · 10%',      ko: '스탠다드 · 10%' } },
    'legacy-lite':    { platformFeePct: 5,  label: { en: 'Legacy Lite · 5%',    ko: '레거시 라이트 · 5%' } },
    'legacy-pro':     { platformFeePct: 8,  label: { en: 'Legacy Pro · 8%',     ko: '레거시 프로 · 8%' } },
    'legacy-premium': { platformFeePct: 11, label: { en: 'Legacy Premium · 11%',ko: '레거시 프리미엄 · 11%' } },
    'custom':         { platformFeePct: null, label: { en: 'Custom',             ko: '커스텀' } }
  };

  const DEFAULTS = {
    pricePerBillingCycle:   8,
    patronCount:            250,
    billingCycleMonths:     1,
    planPreset:             'standard',
    platformFeePct:         10,
    processingFeePct:       2.9,
    processingFixedFee:     0.30,
    targetMonthlyNetIncome: 3000
  };

  const TEXT = {
    en: {
      errPrice:      'Price per billing cycle must be greater than 0.',
      errPatrons:    'Patron count must be a positive integer.',
      errCycle:      'Billing cycle must be 1 (monthly) or 12 (annual).',
      errPreset:     'Unknown plan preset.',
      errPlatform:   'Platform fee % must be between 0 and 100.',
      errProcessing: 'Processing fee % must be between 0 and 100.',
      errFixedFee:   'Fixed fee per charge must be 0 or above.',
      errTarget:     'Target monthly net income must be 0 or above.',
      warnImpossible:'⚠️ Fixed fee exceeds ticket price — net per patron is negative. Increase price to make memberships viable.',
      warnAnnual:    '⚠️ Annual billing collects cash upfront. Monthly-equivalent net is spread across 12 months for planning purposes.',
      summaryTitle:  '[Patreon Fee Calculator Summary]',
      na:            'N/A'
    },
    ko: {
      errPrice:      '결제 주기당 가격은 0보다 커야 합니다.',
      errPatrons:    '후원자 수는 1 이상의 정수여야 합니다.',
      errCycle:      '결제 주기는 1(월) 또는 12(연)여야 합니다.',
      errPreset:     '알 수 없는 플랜 프리셋입니다.',
      errPlatform:   '플랫폼 수수료(%): 0~100 범위여야 합니다.',
      errProcessing: '결제 처리 수수료(%): 0~100 범위여야 합니다.',
      errFixedFee:   '건당 고정 수수료는 0 이상이어야 합니다.',
      errTarget:     '목표 월 순수입은 0 이상이어야 합니다.',
      warnImpossible:'⚠️ 고정 수수료가 티켓 가격을 초과합니다 — 후원자당 순수입이 음수입니다. 가격을 올려야 멤버십이 수익성을 가질 수 있습니다.',
      warnAnnual:    '⚠️ 연간 결제는 현금을 선불로 수취합니다. 월 환산 순수입은 계획 목적으로 12개월로 분산됩니다.',
      summaryTitle:  '[Patreon 수수료 계산기 요약]',
      na:            'N/A'
    }
  };

  function round2(v) {
    return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  }
  function round4(v) {
    return Math.round((Number(v) + Number.EPSILON) * 10000) / 10000;
  }

  function validate(inp, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(inp.pricePerBillingCycle) || inp.pricePerBillingCycle <= 0) return t.errPrice;
    if (!Number.isFinite(inp.patronCount) || inp.patronCount < 1 || Math.trunc(inp.patronCount) !== inp.patronCount) return t.errPatrons;
    if (inp.billingCycleMonths !== 1 && inp.billingCycleMonths !== 12) return t.errCycle;
    if (!PLAN_PRESETS[inp.planPreset]) return t.errPreset;
    if (!Number.isFinite(inp.platformFeePct) || inp.platformFeePct < 0 || inp.platformFeePct > 100) return t.errPlatform;
    if (!Number.isFinite(inp.processingFeePct) || inp.processingFeePct < 0 || inp.processingFeePct > 100) return t.errProcessing;
    if (!Number.isFinite(inp.processingFixedFee) || inp.processingFixedFee < 0) return t.errFixedFee;
    if (inp.targetMonthlyNetIncome !== null && (!Number.isFinite(inp.targetMonthlyNetIncome) || inp.targetMonthlyNetIncome < 0)) return t.errTarget;
    return '';
  }

  function normalize(raw) {
    const s = raw || {};
    const preset = s.planPreset != null ? String(s.planPreset) : DEFAULTS.planPreset;
    const presetDef = PLAN_PRESETS[preset];

    // platform fee: use preset value unless custom or explicitly overridden
    let platformFeePct;
    if (s.platformFeePct != null) {
      platformFeePct = Number(s.platformFeePct);
    } else if (presetDef && presetDef.platformFeePct != null) {
      platformFeePct = presetDef.platformFeePct;
    } else {
      platformFeePct = DEFAULTS.platformFeePct;
    }

    const patronCount = Number(s.patronCount ?? DEFAULTS.patronCount);

    return {
      pricePerBillingCycle:   Number(s.pricePerBillingCycle   ?? DEFAULTS.pricePerBillingCycle),
      patronCount:            patronCount,
      billingCycleMonths:     Number(s.billingCycleMonths     ?? DEFAULTS.billingCycleMonths),
      planPreset:             preset,
      platformFeePct:         platformFeePct,
      processingFeePct:       Number(s.processingFeePct       ?? DEFAULTS.processingFeePct),
      processingFixedFee:     Number(s.processingFixedFee     ?? DEFAULTS.processingFixedFee),
      targetMonthlyNetIncome: s.targetMonthlyNetIncome != null ? Number(s.targetMonthlyNetIncome) : DEFAULTS.targetMonthlyNetIncome
    };
  }

  function compute(inp) {
    const P  = inp.pricePerBillingCycle;
    const N  = inp.patronCount;
    const M  = inp.billingCycleMonths;
    const PF = inp.platformFeePct / 100;
    const TF = inp.processingFeePct / 100;
    const FF = inp.processingFixedFee;
    const T  = inp.targetMonthlyNetIncome;

    const grossCollected     = P * N;
    const platformFee        = grossCollected * PF;
    const processingFee      = grossCollected * TF + N * FF;
    const totalFees          = platformFee + processingFee;
    const netCollected       = grossCollected - totalFees;
    const effectiveTakeHomePct = grossCollected > 0 ? (netCollected / grossCollected) * 100 : 0;
    const monthlyEquivalentGross = grossCollected / M;
    const monthlyEquivalentNet   = netCollected / M;
    const annualizedNet          = monthlyEquivalentNet * 12;
    const netPerPatronPerCycle   = P - P * PF - P * TF - FF;

    let requiredPatronsForTargetMonthlyNet = null;
    if (T !== null && Number.isFinite(T) && T >= 0) {
      if (netPerPatronPerCycle <= 0) {
        requiredPatronsForTargetMonthlyNet = null; // impossible
      } else {
        requiredPatronsForTargetMonthlyNet = Math.ceil((T * M) / netPerPatronPerCycle);
      }
    }

    // planDeltaVsStandard: compare netCollected against standard plan
    let planDeltaVsStandard = null;
    if (inp.planPreset !== 'standard') {
      const standardPF = PLAN_PRESETS['standard'].platformFeePct / 100;
      const standardPlatformFee  = grossCollected * standardPF;
      const standardTotalFees    = standardPlatformFee + processingFee;
      const standardNetCollected = grossCollected - standardTotalFees;
      planDeltaVsStandard = round2(netCollected - standardNetCollected);
    }

    const preset = PLAN_PRESETS[inp.planPreset];

    return {
      grossCollected:                  round2(grossCollected),
      platformFee:                     round2(platformFee),
      processingFee:                   round2(processingFee),
      totalFees:                       round2(totalFees),
      netCollected:                    round2(netCollected),
      effectiveTakeHomePct:            round4(effectiveTakeHomePct),
      monthlyEquivalentGross:          round2(monthlyEquivalentGross),
      monthlyEquivalentNet:            round2(monthlyEquivalentNet),
      netPerPatronPerCycle:            round4(netPerPatronPerCycle),
      requiredPatronsForTargetMonthlyNet: requiredPatronsForTargetMonthlyNet,
      annualizedNet:                   round2(annualizedNet),
      planLabel:                       preset ? preset.label.en : inp.planPreset,
      planDeltaVsStandard:             planDeltaVsStandard,
      feePerPatronPerCycle:            round4(totalFees / N)
    };
  }

  function buildWarnings(result, inp, lang) {
    const t = TEXT[lang] || TEXT.en;
    const warnings = [];
    if (result.netPerPatronPerCycle <= 0) {
      warnings.push(t.warnImpossible);
    }
    if (inp.billingCycleMonths === 12) {
      warnings.push(t.warnAnnual);
    }
    return warnings;
  }

  function buildSummary(result, inp, lang) {
    const t = TEXT[lang] || TEXT.en;
    const fmt = (v) => '$' + v.toFixed(2);
    const fmtPct = (v) => v.toFixed(2) + '%';
    const na = t.na;
    const lines = [
      t.summaryTitle,
      '',
      (lang === 'ko' ? '플랜' : 'Plan')                                + ': ' + result.planLabel,
      (lang === 'ko' ? '결제 주기' : 'Billing cycle')                  + ': ' + (inp.billingCycleMonths === 1 ? (lang === 'ko' ? '월간' : 'Monthly') : (lang === 'ko' ? '연간' : 'Annual')),
      (lang === 'ko' ? '총 수취액' : 'Gross collected')                + ': ' + fmt(result.grossCollected),
      (lang === 'ko' ? '플랫폼 수수료' : 'Platform fee')               + ': ' + fmt(result.platformFee),
      (lang === 'ko' ? '결제 처리 수수료' : 'Processing fee')          + ': ' + fmt(result.processingFee),
      (lang === 'ko' ? '총 수수료' : 'Total fees')                     + ': ' + fmt(result.totalFees),
      (lang === 'ko' ? '순 수취액' : 'Net collected')                  + ': ' + fmt(result.netCollected),
      (lang === 'ko' ? '실효 수취율' : 'Effective take-home %')        + ': ' + fmtPct(result.effectiveTakeHomePct),
      (lang === 'ko' ? '월 환산 순수입' : 'Monthly equivalent net')    + ': ' + fmt(result.monthlyEquivalentNet),
      (lang === 'ko' ? '후원자당 순수입' : 'Net per patron/cycle')     + ': ' + fmt(result.netPerPatronPerCycle),
      (lang === 'ko' ? '목표 달성 필요 후원자 수' : 'Patrons needed for target') + ': ' + (result.requiredPatronsForTargetMonthlyNet != null ? result.requiredPatronsForTargetMonthlyNet : na),
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const inp = normalize(input);
    const err = validate(inp, lang);
    if (err) return { result: null, error: err };

    const result = compute(inp);
    result.warnings = buildWarnings(result, inp, lang);
    result.summary  = buildSummary(result, inp, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS, PLAN_PRESETS, TEXT };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.PatreonFeeCalc = exports;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
