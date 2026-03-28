(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.TptFeeCalculator = api;
  global.TptSellerFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONSTANTS = Object.freeze({
    BASIC_MEMBERSHIP_FEE: 29,
    PREMIUM_MEMBERSHIP_FEE: 59.95,
    BASIC_PAYOUT_RATE: 0.55,
    PREMIUM_PAYOUT_RATE: 0.80,
    BASIC_TRANSACTION_FEE: 0.30,
    PREMIUM_UNDER3_FEE: 0.15,
  });

  const DEFAULT_INPUTS = Object.freeze({
    listPrice: 4.99,
    discountPct: 0,
    monthlySales: 10,
    lang: 'en',
  });

  const VALID_LANGS = new Set(['en', 'ko']);
  const EPSILON = 1e-9;

  function roundTo(value, digits) {
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    const listPrice = toFiniteNumber(source.listPrice);
    if (listPrice == null || !(listPrice > 0)) {
      errors.push('listPrice must be greater than 0.');
    } else {
      values.listPrice = listPrice;
    }

    const discountPct = toFiniteNumber(source.discountPct);
    if (discountPct == null || discountPct < 0 || discountPct > 100) {
      errors.push('discountPct must be between 0 and 100.');
    } else {
      values.discountPct = discountPct;
    }

    const monthlySales = toFiniteNumber(source.monthlySales);
    if (monthlySales == null || monthlySales < 0 || !Number.isInteger(monthlySales)) {
      errors.push('monthlySales must be an integer at least 0.');
    } else {
      values.monthlySales = monthlySales;
    }

    const lang = String(source.lang || 'en').trim().toLowerCase();
    if (!VALID_LANGS.has(lang)) {
      errors.push('lang must be en or ko.');
    } else {
      values.lang = lang;
    }

    if (!errors.length && values.listPrice != null && values.discountPct != null) {
      const realizedSalePrice = values.listPrice * (1 - (values.discountPct / 100));
      if (!(realizedSalePrice > 0)) {
        errors.push('realizedSalePrice must be greater than 0 after discount.');
      }
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function recommendationFor(annualPremiumLift) {
    if (annualPremiumLift > EPSILON) return 'Premium';
    if (annualPremiumLift < -EPSILON) return 'Basic';
    return 'Either / neutral';
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const realizedSalePrice = input.listPrice * (1 - (input.discountPct / 100));
    const premiumTransactionFee = realizedSalePrice < 3 ? CONSTANTS.PREMIUM_UNDER3_FEE : 0;

    const basicPayout = (realizedSalePrice * CONSTANTS.BASIC_PAYOUT_RATE) - CONSTANTS.BASIC_TRANSACTION_FEE;
    const premiumPayout = (realizedSalePrice * CONSTANTS.PREMIUM_PAYOUT_RATE) - premiumTransactionFee;
    const basicPlatformTake = realizedSalePrice - basicPayout;
    const premiumPlatformTake = realizedSalePrice - premiumPayout;
    const basicEffectiveTakeRatePct = realizedSalePrice > 0 ? (basicPlatformTake / realizedSalePrice) * 100 : 0;
    const premiumEffectiveTakeRatePct = realizedSalePrice > 0 ? (premiumPlatformTake / realizedSalePrice) * 100 : 0;
    const perSalePremiumLift = premiumPayout - basicPayout;

    const monthlyBasicEarnings = basicPayout * input.monthlySales;
    const monthlyPremiumEarnings = premiumPayout * input.monthlySales;
    const annualBasicEarningsAfterMembership = (monthlyBasicEarnings * 12) - CONSTANTS.BASIC_MEMBERSHIP_FEE;
    const annualPremiumEarningsAfterMembership = (monthlyPremiumEarnings * 12) - CONSTANTS.PREMIUM_MEMBERSHIP_FEE;
    const annualPremiumLift = annualPremiumEarningsAfterMembership - annualBasicEarningsAfterMembership;

    let premiumBreakEvenSalesNewSeller = null;
    let premiumBreakEvenSalesUpgrade = null;
    if (perSalePremiumLift > EPSILON) {
      premiumBreakEvenSalesNewSeller = Math.ceil((CONSTANTS.PREMIUM_MEMBERSHIP_FEE - CONSTANTS.BASIC_MEMBERSHIP_FEE) / perSalePremiumLift);
      premiumBreakEvenSalesUpgrade = Math.ceil(CONSTANTS.PREMIUM_MEMBERSHIP_FEE / perSalePremiumLift);
    }

    let premiumBreakEvenMonthsNewSeller = null;
    let premiumBreakEvenMonthsUpgrade = null;
    if (input.monthlySales > 0 && premiumBreakEvenSalesNewSeller != null) {
      premiumBreakEvenMonthsNewSeller = premiumBreakEvenSalesNewSeller / input.monthlySales;
      premiumBreakEvenMonthsUpgrade = premiumBreakEvenSalesUpgrade / input.monthlySales;
    }

    const result = {
      input: input,
      constants: CONSTANTS,
      realizedSalePrice: roundTo(realizedSalePrice, 6),
      premiumTransactionFee: roundTo(premiumTransactionFee, 6),
      basicPayout: roundTo(basicPayout, 6),
      premiumPayout: roundTo(premiumPayout, 6),
      basicPlatformTake: roundTo(basicPlatformTake, 6),
      premiumPlatformTake: roundTo(premiumPlatformTake, 6),
      basicEffectiveTakeRatePct: roundTo(basicEffectiveTakeRatePct, 6),
      premiumEffectiveTakeRatePct: roundTo(premiumEffectiveTakeRatePct, 6),
      perSalePremiumLift: roundTo(perSalePremiumLift, 6),
      monthlyBasicEarnings: roundTo(monthlyBasicEarnings, 6),
      monthlyPremiumEarnings: roundTo(monthlyPremiumEarnings, 6),
      annualBasicEarningsAfterMembership: roundTo(annualBasicEarningsAfterMembership, 6),
      annualPremiumEarningsAfterMembership: roundTo(annualPremiumEarningsAfterMembership, 6),
      annualPremiumLift: roundTo(annualPremiumLift, 6),
      premiumBreakEvenSalesNewSeller: premiumBreakEvenSalesNewSeller,
      premiumBreakEvenSalesUpgrade: premiumBreakEvenSalesUpgrade,
      premiumBreakEvenMonthsNewSeller: premiumBreakEvenMonthsNewSeller == null ? null : roundTo(premiumBreakEvenMonthsNewSeller, 6),
      premiumBreakEvenMonthsUpgrade: premiumBreakEvenMonthsUpgrade == null ? null : roundTo(premiumBreakEvenMonthsUpgrade, 6),
      recommendedTier: recommendationFor(annualPremiumLift),
      isSingleResourceBaseline: true,
      summary: '',
    };

    result.summary = buildSummary(result, input.lang);
    return { result: result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function formatMaybeNumber(value, suffix) {
    return value == null ? 'N/A' : roundTo(value, 2) + (suffix || '');
  }

  function recommendationLabel(value, lang) {
    if (lang === 'ko') {
      if (value === 'Premium') return 'Premium 추천';
      if (value === 'Basic') return 'Basic 추천';
      return '중립';
    }
    return value;
  }

  function buildSummary(result, lang) {
    if (lang === 'ko') {
      return [
        '[Teachers Pay Teachers Fee Calculator 요약]',
        '기준: 단일 리소스 주문(single-resource order baseline)',
        '정가: ' + formatCurrency(result.input.listPrice),
        '할인율: ' + formatPercent(result.input.discountPct),
        '실제 판매가: ' + formatCurrency(result.realizedSalePrice),
        '월 판매 수: ' + result.input.monthlySales,
        'Basic 건당 정산액: ' + formatCurrency(result.basicPayout),
        'Premium 건당 정산액: ' + formatCurrency(result.premiumPayout),
        'Premium 건당 추가 이익: ' + formatCurrency(result.perSalePremiumLift),
        'Basic 1년 순수익(가입비 차감): ' + formatCurrency(result.annualBasicEarningsAfterMembership),
        'Premium 1년 순수익(가입비 차감): ' + formatCurrency(result.annualPremiumEarningsAfterMembership),
        'Premium 연간 추가 이익: ' + formatCurrency(result.annualPremiumLift),
        'Premium 손익분기 판매수(새 셀러): ' + (result.premiumBreakEvenSalesNewSeller == null ? 'N/A' : result.premiumBreakEvenSalesNewSeller + '건'),
        'Premium 손익분기 판매수(Basic 이미 결제): ' + (result.premiumBreakEvenSalesUpgrade == null ? 'N/A' : result.premiumBreakEvenSalesUpgrade + '건'),
        '추천: ' + recommendationLabel(result.recommendedTier, 'ko'),
        '주의: TPT 정책은 바뀔 수 있으며, 이 결과는 세무/회계 문서가 아닙니다.',
      ].join('\n');
    }

    return [
      '[Teachers Pay Teachers Fee Calculator Summary]',
      'Baseline: single-resource order',
      'List price: ' + formatCurrency(result.input.listPrice),
      'Discount: ' + formatPercent(result.input.discountPct),
      'Realized sale price: ' + formatCurrency(result.realizedSalePrice),
      'Monthly sales: ' + result.input.monthlySales,
      'Basic payout per sale: ' + formatCurrency(result.basicPayout),
      'Premium payout per sale: ' + formatCurrency(result.premiumPayout),
      'Premium lift per sale: ' + formatCurrency(result.perSalePremiumLift),
      'Annual Basic earnings after membership: ' + formatCurrency(result.annualBasicEarningsAfterMembership),
      'Annual Premium earnings after membership: ' + formatCurrency(result.annualPremiumEarningsAfterMembership),
      'Annual Premium lift: ' + formatCurrency(result.annualPremiumLift),
      'Premium break-even sales (new seller): ' + (result.premiumBreakEvenSalesNewSeller == null ? 'N/A' : result.premiumBreakEvenSalesNewSeller),
      'Premium break-even sales (upgrade after Basic): ' + (result.premiumBreakEvenSalesUpgrade == null ? 'N/A' : result.premiumBreakEvenSalesUpgrade),
      'Recommendation: ' + result.recommendedTier,
      'Note: this is a planning model, not tax or accounting advice.',
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const I18N = {
    en: {
      subtitle: 'Compare Teachers Pay Teachers Basic vs Premium take-home, first-year earnings, and upgrade payback using a simple single-resource order baseline.',
      note: 'v1 single-resource order baseline. Assumption snapshot: March 2026. This models one resource per order, not every possible cart mix, and it is not tax or accounting advice.',
      inputsTitle: 'Inputs',
      inputCopy: 'Adjust price, discount, and monthly sales to estimate how much TPT keeps and when Premium pays back.',
      assumptions: 'Assumption snapshot (March 2026): Premium’s $0.15 fee applies only when the modeled order total is under $3. The Basic $29 fee is treated as sunk in the upgrade scenario.',
      listPrice: 'List price',
      discountPct: 'Discount (%)',
      monthlySales: 'Monthly sales',
      reset: 'Reset defaults',
      copy: 'Copy summary',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      realizedSalePrice: 'Realized sale price',
      annualBasic: 'Annual Basic after fee',
      annualPremium: 'Annual Premium after fee',
      annualLift: 'Annual Premium lift',
      perSale: 'Per-sale comparison',
      annual: 'Projection and payback',
      field: 'Metric',
      payoutMetric: 'Payout',
      basic: 'Basic',
      premium: 'Premium',
      platformTake: 'Platform take',
      effectiveTakeRate: 'Effective take rate',
      premiumFeeRule: 'Premium transaction fee',
      perSaleLift: 'Premium lift per sale',
      monthlyEarnings: 'Monthly earnings',
      annualEarnings: 'Annual earnings after membership',
      payback: 'Premium payback',
      newSeller: 'New seller',
      upgrade: 'Upgrade after Basic',
      paybackSales: 'Break-even sales',
      paybackMonths: 'Break-even months',
      recommendation: 'Recommendation',
      faqTitle: 'FAQ',
      faq1q: 'Why does Premium sometimes show a $0.15 fee?',
      faq1a: 'TPT says Premium sellers pay a $0.15 transaction fee only on orders totaling less than $3. This tool uses your modeled sale price as a single-resource order baseline.',
      faq2q: 'Why are there two Premium break-even numbers?',
      faq2a: 'A new seller compares Premium against starting with Basic, so the incremental cost is $30.95. An upgrade scenario treats the earlier $29 Basic fee as sunk, so the Premium payback uses the full $59.95 annual fee.',
      faq3q: 'Does this include taxes or cart complexity?',
      faq3a: 'No. This is a planning model for payout math, not a tax calculator or a full multi-item cart simulator.',
      summaryLabel: 'Copy-ready summary',
      recommendationPremium: 'Premium',
      recommendationBasic: 'Basic',
      recommendationEither: 'Either / neutral',
      na: 'N/A',
    },
    ko: {
      subtitle: 'Teachers Pay Teachers Basic vs Premium 실수령액, 첫해 순수익, 업그레이드 손익분기를 단일 리소스 주문 기준으로 비교합니다.',
      note: 'v1 단일 리소스 주문 기준입니다. 가정 스냅샷: 2026년 3월. 여러 상품이 담긴 실제 장바구니를 완벽히 재현하지 않으며, 세무·회계 조언도 아닙니다.',
      inputsTitle: '입력값',
      inputCopy: '가격, 할인율, 월 판매량을 조정해 TPT가 가져가는 몫과 Premium 회수 시점을 빠르게 계산하세요.',
      assumptions: '가정 스냅샷(2026년 3월): Premium의 $0.15 수수료는 주문 총액이 $3 미만일 때만 적용됩니다. 업그레이드 시나리오에서는 Basic $29를 매몰비용으로 처리합니다.',
      listPrice: '정가',
      discountPct: '할인율 (%)',
      monthlySales: '월 판매 수',
      reset: '기본값 복원',
      copy: '요약 복사',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없습니다. 수동 복사해 주세요.',
      realizedSalePrice: '실제 판매가',
      annualBasic: 'Basic 연간 순수익',
      annualPremium: 'Premium 연간 순수익',
      annualLift: 'Premium 연간 추가 이익',
      perSale: '건당 비교',
      annual: '연간 전망과 손익분기',
      field: '항목',
      payoutMetric: '정산액',
      basic: 'Basic',
      premium: 'Premium',
      platformTake: '플랫폼 몫',
      effectiveTakeRate: '실효 차감률',
      premiumFeeRule: 'Premium 거래 수수료',
      perSaleLift: 'Premium 건당 추가 이익',
      monthlyEarnings: '월 순수익',
      annualEarnings: '가입비 차감 후 연 순수익',
      payback: 'Premium 회수 시점',
      newSeller: '새 셀러 시작',
      upgrade: 'Basic 이후 업그레이드',
      paybackSales: '손익분기 판매 수',
      paybackMonths: '손익분기 개월 수',
      recommendation: '추천',
      faqTitle: '자주 묻는 질문',
      faq1q: '왜 Premium에 가끔 $0.15 수수료가 붙나요?',
      faq1a: 'TPT는 주문 총액이 $3 미만일 때만 Premium 셀러에게 $0.15 거래 수수료를 적용한다고 안내합니다. 이 도구는 단일 리소스 주문 기준으로 그 규칙을 모델링합니다.',
      faq2q: '왜 Premium 손익분기 숫자가 두 개 있나요?',
      faq2a: '새 셀러는 Basic 대비 추가 비용 $30.95만 보면 됩니다. 반면 Basic을 이미 결제한 뒤 업그레이드한다면 이전 $29는 매몰비용이므로 Premium 전체 연회비 $59.95를 회수해야 합니다.',
      faq3q: '세금이나 복잡한 장바구니까지 포함하나요?',
      faq3a: '아닙니다. 이 도구는 정산 구조를 빠르게 비교하는 계획용 모델입니다.',
      summaryLabel: '복사용 요약',
      recommendationPremium: 'Premium 추천',
      recommendationBasic: 'Basic 추천',
      recommendationEither: '중립',
      na: 'N/A',
    },
  };

  function localizedRecommendation(result, lang) {
    const pack = I18N[lang] || I18N.en;
    if (result.recommendedTier === 'Premium') return pack.recommendationPremium;
    if (result.recommendedTier === 'Basic') return pack.recommendationBasic;
    return pack.recommendationEither;
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const ids = {
      form: 'calculatorForm',
      langBtn: 'langBtn',
      error: 'errorBox',
      errorText: 'errorText',
      copyStatus: 'copyStatus',
      summary: 'summary',
      copy: 'copySummaryBtn',
      reset: 'resetDefaultsBtn',
      listPrice: 'listPrice',
      discountPct: 'discountPct',
      monthlySales: 'monthlySales',
      realizedSalePrice: 'realizedSalePrice',
      annualBasic: 'annualBasicEarningsAfterMembership',
      annualPremium: 'annualPremiumEarningsAfterMembership',
      annualLift: 'annualPremiumLift',
      basicPayout: 'basicPayout',
      premiumPayout: 'premiumPayout',
      basicPlatformTake: 'basicPlatformTake',
      premiumPlatformTake: 'premiumPlatformTake',
      basicEffectiveTakeRatePct: 'basicEffectiveTakeRatePct',
      premiumEffectiveTakeRatePct: 'premiumEffectiveTakeRatePct',
      premiumTransactionFee: 'premiumTransactionFee',
      perSalePremiumLift: 'perSalePremiumLift',
      monthlyBasicEarnings: 'monthlyBasicEarnings',
      monthlyPremiumEarnings: 'monthlyPremiumEarnings',
      breakEvenSalesNew: 'breakEvenSalesNew',
      breakEvenSalesUpgrade: 'breakEvenSalesUpgrade',
      breakEvenMonthsNew: 'breakEvenMonthsNew',
      breakEvenMonthsUpgrade: 'breakEvenMonthsUpgrade',
      recommendation: 'recommendation',
    };

    const refs = {};
    Object.keys(ids).forEach(function (key) {
      refs[key] = document.getElementById(ids[key]);
    });

    const form = refs.form;
    if (!form) {
      return;
    }

    let currentLang = DEFAULT_INPUTS.lang;

    function applyDefaults() {
      refs.listPrice.value = String(DEFAULT_INPUTS.listPrice);
      refs.discountPct.value = String(DEFAULT_INPUTS.discountPct);
      refs.monthlySales.value = String(DEFAULT_INPUTS.monthlySales);
    }

    function setLanguage(lang) {
      currentLang = lang === 'ko' ? 'ko' : 'en';
      const pack = I18N[currentLang];
      document.documentElement.lang = currentLang;
      if (refs.langBtn) refs.langBtn.textContent = currentLang === 'en' ? 'KO' : 'EN';
      document.querySelectorAll('[data-i18n]').forEach(function (node) {
        const key = node.getAttribute('data-i18n');
        if (pack[key]) {
          node.textContent = pack[key];
        }
      });
      render();
    }

    function collectInput() {
      return {
        listPrice: refs.listPrice.value,
        discountPct: refs.discountPct.value,
        monthlySales: refs.monthlySales.value,
        lang: currentLang,
      };
    }

    function setError(message) {
      refs.error.hidden = !message;
      refs.errorText.textContent = message || '';
    }

    function render() {
      const { result, error } = calculate(collectInput());
      const pack = I18N[currentLang];
      if (error) {
        setError(error);
        refs.summary.value = '';
        return;
      }
      setError('');
      refs.realizedSalePrice.textContent = formatCurrency(result.realizedSalePrice);
      refs.annualBasic.textContent = formatCurrency(result.annualBasicEarningsAfterMembership);
      refs.annualPremium.textContent = formatCurrency(result.annualPremiumEarningsAfterMembership);
      refs.annualLift.textContent = formatCurrency(result.annualPremiumLift);
      refs.basicPayout.textContent = formatCurrency(result.basicPayout);
      refs.premiumPayout.textContent = formatCurrency(result.premiumPayout);
      refs.basicPlatformTake.textContent = formatCurrency(result.basicPlatformTake);
      refs.premiumPlatformTake.textContent = formatCurrency(result.premiumPlatformTake);
      refs.basicEffectiveTakeRatePct.textContent = formatPercent(result.basicEffectiveTakeRatePct);
      refs.premiumEffectiveTakeRatePct.textContent = formatPercent(result.premiumEffectiveTakeRatePct);
      refs.premiumTransactionFee.textContent = formatCurrency(result.premiumTransactionFee);
      refs.perSalePremiumLift.textContent = formatCurrency(result.perSalePremiumLift);
      refs.monthlyBasicEarnings.textContent = formatCurrency(result.monthlyBasicEarnings);
      refs.monthlyPremiumEarnings.textContent = formatCurrency(result.monthlyPremiumEarnings);
      refs.breakEvenSalesNew.textContent = result.premiumBreakEvenSalesNewSeller == null ? pack.na : String(result.premiumBreakEvenSalesNewSeller);
      refs.breakEvenSalesUpgrade.textContent = result.premiumBreakEvenSalesUpgrade == null ? pack.na : String(result.premiumBreakEvenSalesUpgrade);
      refs.breakEvenMonthsNew.textContent = result.premiumBreakEvenMonthsNewSeller == null ? pack.na : formatMaybeNumber(result.premiumBreakEvenMonthsNewSeller, ' mo');
      refs.breakEvenMonthsUpgrade.textContent = result.premiumBreakEvenMonthsUpgrade == null ? pack.na : formatMaybeNumber(result.premiumBreakEvenMonthsUpgrade, ' mo');
      if (currentLang === 'ko') {
        refs.breakEvenMonthsNew.textContent = result.premiumBreakEvenMonthsNewSeller == null ? pack.na : formatMaybeNumber(result.premiumBreakEvenMonthsNewSeller, '개월');
        refs.breakEvenMonthsUpgrade.textContent = result.premiumBreakEvenMonthsUpgrade == null ? pack.na : formatMaybeNumber(result.premiumBreakEvenMonthsUpgrade, '개월');
      }
      refs.recommendation.textContent = localizedRecommendation(result, currentLang);
      refs.summary.value = result.summary;
    }

    form.addEventListener('input', render);
    if (refs.reset) {
      refs.reset.addEventListener('click', function () {
        applyDefaults();
        render();
      });
    }
    if (refs.copy) {
      refs.copy.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(refs.summary.value);
          refs.copyStatus.textContent = I18N[currentLang].copied;
        } catch (err) {
          refs.copyStatus.textContent = I18N[currentLang].copyFail;
        }
      });
    }
    if (refs.langBtn) {
      refs.langBtn.addEventListener('click', function () {
        setLanguage(currentLang === 'en' ? 'ko' : 'en');
      });
    }

    applyDefaults();
    setLanguage(currentLang);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    CONSTANTS: CONSTANTS,
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    DEFAULTS: DEFAULT_INPUTS,
    validateInputs: validateInputs,
    calculate: calculate,
    buildSummary: buildSummary,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    recommendationFor: recommendationFor,
    initBrowser: initBrowser,
  };
});
