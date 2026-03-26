(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof global !== 'undefined') {
    global.GhostMembershipRevenueCalculator = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULT_INPUTS = {
    monthlyMembers: 320,
    annualMembers: 80,
    monthlyPrice: 9,
    annualPrice: 90,
    ghostPlanCost: 31,
    stripeFeeRatePct: 2.9,
    stripeFixedFee: 0.30,
    refundRatePct: 2,
    supportCostPerMember: 0.60,
    targetMonthlyNetIncome: 3000
  };

  var TEXT = {
    en: {
      langLabel: '한국어',
      backLabel: 'All tools',
      heroEyebrow: 'Ghost memberships',
      title: 'Ghost Membership Revenue Calculator',
      subtitle: 'Model Ghost paid-membership take-home with monthly and annual members, Stripe drag, refunds, plan cost, and member support overhead.',
      heroNote: 'Planning model only. Annual members are amortized across 12 months so you can compare recurring economics instead of one-off billing spikes.',
      inputTitle: 'Inputs',
      inputCopy: 'Enter your current Ghost pricing and cost assumptions. Use your real monthly plan cost instead of relying on a baked-in pricing table.',
      monthlyMembers: 'Monthly members',
      annualMembers: 'Annual members',
      monthlyPrice: 'Monthly price ($)',
      annualPrice: 'Annual price ($)',
      ghostPlanCost: 'Ghost plan cost / month ($)',
      stripeFeeRatePct: 'Stripe fee (%)',
      stripeFixedFee: 'Stripe fixed fee ($)',
      refundRatePct: 'Refund rate (%)',
      supportCostPerMember: 'Support cost / member / month ($)',
      targetMonthlyNetIncome: 'Target monthly net ($)',
      resetDefaultsBtn: 'Reset defaults',
      copySummaryBtn: 'Copy summary',
      copyReady: 'Summary copied.',
      copyFailed: 'Clipboard unavailable. Copy manually.',
      note: 'Ghost pricing, Stripe pricing, and your true refund drag vary by setup. Every cost input here is editable by design.',
      resultsTitle: 'Results',
      statusGood: 'Profitable at current assumptions.',
      statusWarn: 'Positive, but not yet at your target monthly net.',
      statusBad: 'Negative after refunds, Stripe fees, support, and Ghost plan cost.',
      kpiNet: 'Monthly-equivalent net',
      kpiAnnualized: 'Annualized net run-rate',
      kpiCostRate: 'Effective cost rate',
      kpiTargetMembers: 'Active members for target',
      gross: 'Monthly-equivalent gross',
      refundDrag: 'Refund drag',
      keptAfterRefunds: 'Kept after refunds',
      stripeVariableFees: 'Stripe variable fees',
      stripeFixedFees: 'Stripe fixed fees',
      supportCost: 'Support cost',
      totalActiveMembers: 'Total active members',
      monthlyContribution: 'Monthly member contribution',
      annualContribution: 'Annual member contribution (monthly-eq)',
      ghostPlanCoverage: 'Members to cover Ghost plan',
      targetGap: 'Gap to target monthly net',
      summaryTitle: 'Summary',
      summaryHint: 'Copy-ready planning summary',
      relatedTitle: 'Related tools',
      summaryBlockTitle: '[Ghost Membership Revenue Summary]',
      notFeasible: 'Not feasible',
      invalidInteger: 'must be an integer at least 0.',
      invalidPositive: 'must be greater than 0.',
      invalidPercent: 'must be between 0 and 100.',
      invalidRefund: 'must be between 0 and 99.99.',
      invalidNonNegative: 'must be at least 0.',
      statusPrefix: 'Status',
      targetMet: 'Target met',
      targetMissed: 'Target not met'
    },
    ko: {
      langLabel: 'English',
      backLabel: '도구 목록',
      heroEyebrow: 'Ghost 멤버십',
      title: 'Ghost 멤버십 수익 계산기',
      subtitle: '월간·연간 멤버 수, Stripe 수수료, 환불률, Ghost 플랜 비용, 회원 지원비를 반영해 Ghost 유료 멤버십의 실질 수익을 계산합니다.',
      heroNote: '계획용 모델입니다. 연간 멤버십은 월간 비교가 가능하도록 12개월로 나눠 월 환산 수익 기준으로 계산합니다.',
      inputTitle: '입력값',
      inputCopy: '현재 Ghost 멤버십 가격과 비용 가정을 입력하세요. 공식 플랜 표를 고정하지 않고 실제 월 비용을 직접 넣는 방식입니다.',
      monthlyMembers: '월간 멤버 수',
      annualMembers: '연간 멤버 수',
      monthlyPrice: '월간 가격 ($)',
      annualPrice: '연간 가격 ($)',
      ghostPlanCost: 'Ghost 플랜 월 비용 ($)',
      stripeFeeRatePct: 'Stripe 수수료 (%)',
      stripeFixedFee: 'Stripe 고정 수수료 ($)',
      refundRatePct: '환불률 (%)',
      supportCostPerMember: '멤버 1인당 월 지원비 ($)',
      targetMonthlyNetIncome: '목표 월 순이익 ($)',
      resetDefaultsBtn: '기본값 복원',
      copySummaryBtn: '요약 복사',
      copyReady: '요약을 복사했습니다.',
      copyFailed: '클립보드를 사용할 수 없습니다. 직접 복사해 주세요.',
      note: 'Ghost 플랜 가격, Stripe 수수료, 실제 환불 드래그는 설정에 따라 달라집니다. 그래서 모든 비용 입력값을 수정 가능하게 두었습니다.',
      resultsTitle: '결과',
      statusGood: '현재 가정에서 순이익이 납니다.',
      statusWarn: '흑자는 나지만 목표 월 순이익에는 아직 못 미칩니다.',
      statusBad: '환불, Stripe 수수료, 지원비, Ghost 플랜 비용까지 반영하면 적자입니다.',
      kpiNet: '월 환산 순이익',
      kpiAnnualized: '연 환산 순이익 런레이트',
      kpiCostRate: '실효 비용률',
      kpiTargetMembers: '목표 달성 필요 활성 멤버',
      gross: '월 환산 총매출',
      refundDrag: '환불 드래그',
      keptAfterRefunds: '환불 후 보전 매출',
      stripeVariableFees: 'Stripe 변동 수수료',
      stripeFixedFees: 'Stripe 고정 수수료',
      supportCost: '회원 지원비',
      totalActiveMembers: '총 활성 멤버 수',
      monthlyContribution: '월간 멤버 1인당 기여',
      annualContribution: '연간 멤버 1인당 기여(월 환산)',
      ghostPlanCoverage: 'Ghost 플랜 손익분기 멤버 수',
      targetGap: '목표 월 순이익 대비 차이',
      summaryTitle: '요약',
      summaryHint: '복사 가능한 계획 요약',
      relatedTitle: '관련 도구',
      summaryBlockTitle: '[Ghost 멤버십 수익 요약]',
      notFeasible: '계산 불가',
      invalidInteger: '0 이상의 정수여야 합니다.',
      invalidPositive: '0보다 커야 합니다.',
      invalidPercent: '0~100 범위여야 합니다.',
      invalidRefund: '0~99.99 범위여야 합니다.',
      invalidNonNegative: '0 이상이어야 합니다.',
      statusPrefix: '상태',
      targetMet: '목표 달성',
      targetMissed: '목표 미달'
    }
  };

  function roundTo(value, digits) {
    var factor = Math.pow(10, digits);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    var text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    var num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput, lang) {
    var source = mergeWithDefaults(rawInput);
    var t = TEXT[lang] || TEXT.en;
    var errors = [];
    var values = {};

    function validateInteger(field) {
      var value = toFiniteNumber(source[field]);
      if (value == null || value < 0 || !Number.isInteger(value)) {
        errors.push(field + ' ' + t.invalidInteger);
      } else {
        values[field] = value;
      }
    }

    function validatePositive(field) {
      var value = toFiniteNumber(source[field]);
      if (value == null || !(value > 0)) {
        errors.push(field + ' ' + t.invalidPositive);
      } else {
        values[field] = value;
      }
    }

    function validateNonNegative(field) {
      var value = toFiniteNumber(source[field]);
      if (value == null || value < 0) {
        errors.push(field + ' ' + t.invalidNonNegative);
      } else {
        values[field] = value;
      }
    }

    function validatePercent(field) {
      var value = toFiniteNumber(source[field]);
      if (value == null || value < 0 || value > 100) {
        errors.push(field + ' ' + t.invalidPercent);
      } else {
        values[field] = value;
      }
    }

    validateInteger('monthlyMembers');
    validateInteger('annualMembers');
    validatePositive('monthlyPrice');
    validatePositive('annualPrice');
    validateNonNegative('ghostPlanCost');
    validatePercent('stripeFeeRatePct');
    validateNonNegative('stripeFixedFee');
    validateNonNegative('supportCostPerMember');
    validateNonNegative('targetMonthlyNetIncome');

    var refundRatePct = toFiniteNumber(source.refundRatePct);
    if (refundRatePct == null || refundRatePct < 0 || refundRatePct >= 100) {
      errors.push('refundRatePct ' + t.invalidRefund);
    } else {
      values.refundRatePct = refundRatePct;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function compute(input) {
    var refundKeepFactor = 1 - (input.refundRatePct / 100);
    var stripeFeeFactor = 1 - (input.stripeFeeRatePct / 100);
    var totalActiveMembers = input.monthlyMembers + input.annualMembers;

    var monthlyGross = input.monthlyMembers * input.monthlyPrice;
    var annualGrossMonthlyEquivalent = input.annualMembers * (input.annualPrice / 12);
    var grossMonthlyEquivalent = monthlyGross + annualGrossMonthlyEquivalent;

    var refundDrag = grossMonthlyEquivalent * (input.refundRatePct / 100);
    var keptAfterRefunds = grossMonthlyEquivalent - refundDrag;
    var stripeVariableFees = keptAfterRefunds * (input.stripeFeeRatePct / 100);
    var stripeFixedFees = (input.monthlyMembers * input.stripeFixedFee) + (input.annualMembers * (input.stripeFixedFee / 12));
    var supportCost = totalActiveMembers * input.supportCostPerMember;

    var monthlyMemberContribution = (input.monthlyPrice * refundKeepFactor * stripeFeeFactor) - input.stripeFixedFee - input.supportCostPerMember;
    var annualMemberContributionMonthlyEquivalent = ((input.annualPrice / 12) * refundKeepFactor * stripeFeeFactor) - (input.stripeFixedFee / 12) - input.supportCostPerMember;
    var weightedContribution = totalActiveMembers > 0
      ? ((input.monthlyMembers * monthlyMemberContribution) + (input.annualMembers * annualMemberContributionMonthlyEquivalent)) / totalActiveMembers
      : 0;

    var totalCosts = refundDrag + stripeVariableFees + stripeFixedFees + supportCost + input.ghostPlanCost;
    var netMonthlyEquivalent = grossMonthlyEquivalent - totalCosts;
    var annualizedNetRunRate = netMonthlyEquivalent * 12;
    var effectiveCostRatePct = grossMonthlyEquivalent > 0 ? (totalCosts / grossMonthlyEquivalent) * 100 : 0;
    var gapToTargetMonthlyNet = input.targetMonthlyNetIncome - netMonthlyEquivalent;

    var membersToCoverGhostPlan = monthlyMemberContribution > 0
      ? Math.ceil(input.ghostPlanCost / monthlyMemberContribution)
      : null;

    var activeMembersForTargetNet = weightedContribution > 0
      ? Math.ceil((input.targetMonthlyNetIncome + input.ghostPlanCost) / weightedContribution)
      : null;

    return {
      input: input,
      totalActiveMembers: totalActiveMembers,
      grossMonthlyEquivalent: roundTo(grossMonthlyEquivalent, 6),
      refundDrag: roundTo(refundDrag, 6),
      keptAfterRefunds: roundTo(keptAfterRefunds, 6),
      stripeVariableFees: roundTo(stripeVariableFees, 6),
      stripeFixedFees: roundTo(stripeFixedFees, 6),
      supportCost: roundTo(supportCost, 6),
      totalCosts: roundTo(totalCosts, 6),
      netMonthlyEquivalent: roundTo(netMonthlyEquivalent, 6),
      annualizedNetRunRate: roundTo(annualizedNetRunRate, 6),
      effectiveCostRatePct: roundTo(effectiveCostRatePct, 6),
      monthlyMemberContribution: roundTo(monthlyMemberContribution, 6),
      annualMemberContributionMonthlyEquivalent: roundTo(annualMemberContributionMonthlyEquivalent, 6),
      weightedContribution: roundTo(weightedContribution, 6),
      membersToCoverGhostPlan: membersToCoverGhostPlan,
      activeMembersForTargetNet: activeMembersForTargetNet,
      gapToTargetMonthlyNet: roundTo(gapToTargetMonthlyNet, 6)
    };
  }

  function buildWarnings(result, lang) {
    var t = TEXT[lang] || TEXT.en;
    var warnings = [];
    if (result.monthlyMemberContribution <= 0) {
      warnings.push(lang === 'ko'
        ? '월간 멤버 1인당 기여가 0 이하입니다. 가격·환불률·지원비를 다시 확인하세요.'
        : 'Monthly-member contribution is zero or negative. Re-check price, refunds, and member support cost.');
    }
    if (result.annualMemberContributionMonthlyEquivalent <= 0) {
      warnings.push(lang === 'ko'
        ? '연간 멤버 1인당 월 환산 기여가 0 이하입니다. 연간 가격 할인폭이 너무 큰지 확인하세요.'
        : 'Annual-member monthly-equivalent contribution is zero or negative. Check whether the annual discount is too aggressive.');
    }
    if (result.netMonthlyEquivalent < 0) {
      warnings.push(lang === 'ko'
        ? '현재 가정에서는 Ghost 플랜 비용까지 반영하면 적자입니다.'
        : 'At the current assumptions, you are negative after Ghost plan cost.');
    } else if (result.activeMembersForTargetNet != null && result.totalActiveMembers < result.activeMembersForTargetNet) {
      warnings.push(lang === 'ko'
        ? '현재 멤버 믹스 기준으로 목표 월 순이익에 아직 못 미칩니다.'
        : 'You are still below the target monthly net at the current member mix.');
    }
    if (!warnings.length) {
      warnings.push(lang === 'ko'
        ? '현재 가정에서는 Ghost 멤버십이 순이익 상태입니다.'
        : 'The current Ghost membership setup is profitable under these assumptions.');
    }
    return warnings;
  }

  function buildSummary(result, lang) {
    var t = TEXT[lang] || TEXT.en;
    var lines = [
      t.summaryBlockTitle,
      '',
      (lang === 'ko' ? '월간 멤버 수' : 'Monthly members') + ': ' + formatNumber(result.input.monthlyMembers, lang),
      (lang === 'ko' ? '연간 멤버 수' : 'Annual members') + ': ' + formatNumber(result.input.annualMembers, lang),
      (lang === 'ko' ? '월간 가격' : 'Monthly price') + ': ' + formatCurrency(result.input.monthlyPrice, lang),
      (lang === 'ko' ? '연간 가격' : 'Annual price') + ': ' + formatCurrency(result.input.annualPrice, lang),
      (lang === 'ko' ? 'Ghost 월 비용' : 'Ghost monthly plan cost') + ': ' + formatCurrency(result.input.ghostPlanCost, lang),
      (lang === 'ko' ? '월 환산 총매출' : 'Monthly-equivalent gross') + ': ' + formatCurrency(result.grossMonthlyEquivalent, lang),
      (lang === 'ko' ? '월 환산 순이익' : 'Monthly-equivalent net') + ': ' + formatCurrency(result.netMonthlyEquivalent, lang),
      (lang === 'ko' ? '연 환산 순이익 런레이트' : 'Annualized net run-rate') + ': ' + formatCurrency(result.annualizedNetRunRate, lang),
      (lang === 'ko' ? '실효 비용률' : 'Effective cost rate') + ': ' + formatPercent(result.effectiveCostRatePct, lang),
      (lang === 'ko' ? 'Ghost 플랜 손익분기 멤버 수' : 'Members to cover Ghost plan') + ': ' + (result.membersToCoverGhostPlan == null ? t.notFeasible : formatNumber(result.membersToCoverGhostPlan, lang)),
      (lang === 'ko' ? '목표 월 순이익 달성 필요 활성 멤버' : 'Active members needed for target monthly net') + ': ' + (result.activeMembersForTargetNet == null ? t.notFeasible : formatNumber(result.activeMembersForTargetNet, lang)),
      (lang === 'ko' ? '목표 대비 차이' : 'Gap to target') + ': ' + formatCurrency(result.gapToTargetMonthlyNet, lang),
      '',
      (lang === 'ko'
        ? '참고: 연간 멤버십은 월간 비교를 위해 12개월 기준으로 나눠 계산했습니다.'
        : 'Note: annual memberships are spread across 12 months for monthly-equivalent planning.')
    ];
    return lines.join('\n');
  }

  function calculate(rawInput, opts) {
    var lang = (opts && opts.lang) || 'en';
    var validation = validateInputs(rawInput, lang);
    if (!validation.ok) {
      return { ok: false, result: null, error: validation.errors[0], errors: validation.errors };
    }

    var result = compute(validation.values);
    result.warnings = buildWarnings(result, lang);
    result.summary = buildSummary(result, lang);
    return { ok: true, result: result, error: '', errors: [] };
  }

  function formatCurrency(value, lang) {
    var locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    var locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value) + '%';
  }

  function formatNumber(value, lang) {
    var locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0
    }).format(value);
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;

    var currentLang = 'en';
    var form = document.getElementById('calculatorForm');
    if (!form) return;

    var refs = {
      langBtn: document.getElementById('langBtn'),
      errorBox: document.getElementById('errorBox'),
      statusBox: document.getElementById('statusBox'),
      warningList: document.getElementById('warningList'),
      summaryOutput: document.getElementById('summaryOutput'),
      copyStatus: document.getElementById('copyStatus'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      kpiNet: document.getElementById('kpiNet'),
      kpiAnnualized: document.getElementById('kpiAnnualized'),
      kpiCostRate: document.getElementById('kpiCostRate'),
      kpiTargetMembers: document.getElementById('kpiTargetMembers'),
      grossMonthlyEquivalent: document.getElementById('grossMonthlyEquivalent'),
      refundDrag: document.getElementById('refundDrag'),
      keptAfterRefunds: document.getElementById('keptAfterRefunds'),
      stripeVariableFees: document.getElementById('stripeVariableFees'),
      stripeFixedFees: document.getElementById('stripeFixedFees'),
      supportCost: document.getElementById('supportCost'),
      totalActiveMembers: document.getElementById('totalActiveMembers'),
      ghostPlanCostValue: document.getElementById('ghostPlanCostValue'),
      monthlyMemberContribution: document.getElementById('monthlyMemberContribution'),
      annualMemberContribution: document.getElementById('annualMemberContribution'),
      ghostPlanCoverage: document.getElementById('ghostPlanCoverage'),
      targetGap: document.getElementById('targetGap')
    };

    var fieldNodes = Array.prototype.slice.call(form.querySelectorAll('[data-field]'));

    function applyTranslations() {
      var t = TEXT[currentLang];
      Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (node) {
        var key = node.getAttribute('data-t');
        if (t[key] != null) node.textContent = t[key];
      });
      refs.langBtn.textContent = t.langLabel;
    }

    function setDefaults() {
      fieldNodes.forEach(function (node) {
        var key = node.getAttribute('data-field');
        node.value = DEFAULT_INPUTS[key];
      });
    }

    function readInputs() {
      var input = {};
      fieldNodes.forEach(function (node) {
        input[node.getAttribute('data-field')] = node.value;
      });
      return input;
    }

    function renderWarnings(messages) {
      refs.warningList.innerHTML = '';
      messages.forEach(function (message) {
        var li = document.createElement('li');
        li.textContent = message;
        refs.warningList.appendChild(li);
      });
    }

    function resetOutputs() {
      [
        'kpiNet', 'kpiAnnualized', 'kpiCostRate', 'kpiTargetMembers',
        'grossMonthlyEquivalent', 'refundDrag', 'keptAfterRefunds', 'stripeVariableFees',
        'stripeFixedFees', 'supportCost', 'totalActiveMembers', 'ghostPlanCostValue', 'monthlyMemberContribution',
        'annualMemberContribution', 'ghostPlanCoverage', 'targetGap'
      ].forEach(function (key) {
        refs[key].textContent = '—';
      });
      refs.summaryOutput.value = '';
    }

    function render() {
      var t = TEXT[currentLang];
      var response = calculate(readInputs(), { lang: currentLang });

      refs.copyStatus.textContent = '';
      refs.errorBox.classList.remove('show');

      if (!response.ok) {
        refs.errorBox.textContent = response.errors.join(' ');
        refs.errorBox.classList.add('show');
        refs.statusBox.className = 'status status-bad';
        refs.statusBox.textContent = t.statusBad;
        renderWarnings([]);
        resetOutputs();
        return;
      }

      var result = response.result;
      var targetReached = result.netMonthlyEquivalent >= result.input.targetMonthlyNetIncome;
      if (result.netMonthlyEquivalent < 0) {
        refs.statusBox.className = 'status status-bad';
        refs.statusBox.textContent = t.statusBad;
      } else if (targetReached) {
        refs.statusBox.className = 'status status-good';
        refs.statusBox.textContent = t.statusGood;
      } else {
        refs.statusBox.className = 'status status-warn';
        refs.statusBox.textContent = t.statusWarn;
      }

      renderWarnings(result.warnings);

      refs.kpiNet.textContent = formatCurrency(result.netMonthlyEquivalent, currentLang);
      refs.kpiAnnualized.textContent = formatCurrency(result.annualizedNetRunRate, currentLang);
      refs.kpiCostRate.textContent = formatPercent(result.effectiveCostRatePct, currentLang);
      refs.kpiTargetMembers.textContent = result.activeMembersForTargetNet == null ? t.notFeasible : formatNumber(result.activeMembersForTargetNet, currentLang);

      refs.grossMonthlyEquivalent.textContent = formatCurrency(result.grossMonthlyEquivalent, currentLang);
      refs.refundDrag.textContent = formatCurrency(result.refundDrag, currentLang);
      refs.keptAfterRefunds.textContent = formatCurrency(result.keptAfterRefunds, currentLang);
      refs.stripeVariableFees.textContent = formatCurrency(result.stripeVariableFees, currentLang);
      refs.stripeFixedFees.textContent = formatCurrency(result.stripeFixedFees, currentLang);
      refs.supportCost.textContent = formatCurrency(result.supportCost, currentLang);
      refs.totalActiveMembers.textContent = formatNumber(result.totalActiveMembers, currentLang);
      refs.ghostPlanCostValue.textContent = formatCurrency(result.input.ghostPlanCost, currentLang);
      refs.monthlyMemberContribution.textContent = formatCurrency(result.monthlyMemberContribution, currentLang);
      refs.annualMemberContribution.textContent = formatCurrency(result.annualMemberContributionMonthlyEquivalent, currentLang);
      refs.ghostPlanCoverage.textContent = result.membersToCoverGhostPlan == null ? t.notFeasible : formatNumber(result.membersToCoverGhostPlan, currentLang);
      refs.targetGap.textContent = formatCurrency(result.gapToTargetMonthlyNet, currentLang);

      refs.summaryOutput.value = result.summary;
    }

    refs.copySummaryBtn.addEventListener('click', function () {
      var t = TEXT[currentLang];
      var text = refs.summaryOutput.value;
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          refs.copyStatus.textContent = t.copyReady;
        }, function () {
          refs.copyStatus.textContent = t.copyFailed;
        });
      } else {
        refs.copyStatus.textContent = t.copyFailed;
      }
    });

    refs.resetDefaultsBtn.addEventListener('click', function () {
      setDefaults();
      render();
    });

    refs.langBtn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyTranslations();
      render();
    });

    fieldNodes.forEach(function (node) {
      node.addEventListener('input', render);
    });

    setDefaults();
    applyTranslations();
    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    TEXT: TEXT,
    validateInputs: validateInputs,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    formatNumber: formatNumber
  };
});
