/* TikTok Shop Fee Profit Calculator
 * Pure calculator API for Node tests + browser UI wiring.
 */
(function (root) {
  'use strict';

  /* ── Constants ── */
  var STANDARD_REFERRAL_FEE_PCT = 6;
  var PROMO_REFERRAL_FEE_PCT = 3;
  var REFUND_ADMIN_SHARE_OF_REFERRAL = 0.20;
  var REFUND_ADMIN_CAP_PER_REFUNDED_ORDER = 5;

  var DEFAULTS = {
    customerPaymentPerOrder: 25,
    platformDiscountPerOrder: 0,
    taxPerOrder: 0,
    monthlyOrders: 100,
    feeMode: 'standard-6',
    customReferralFeePct: 6,
    refundRatePct: 4,
    productCostPerOrder: 10,
    shippingSubsidyPerOrder: 2,
    otherCostPerOrder: 1
  };

  var UI_TEXT = {
    en: {
      docTitle: 'TikTok Shop Fee Profit Calculator | TikTok Shop Seller Fee Estimator',
      backLink: '\u2190 Tools',
      langButton: '\ud55c\uad6d\uc5b4',
      pageTitle: 'TikTok Shop Fee Profit Calculator',
      pageSubtitle: 'Estimate TikTok Shop referral fees, refund admin fees, and monthly net profit under standard 6%, promo 3%, or custom fee rates.',
      disclaimer: 'Planning estimate only. Actual TikTok Shop fees may vary by category, promotion, and settlement terms. This is not an official settlement statement.',
      inputsHeading: 'Inputs',
      feeHeading: 'Fee Summary',
      profitHeading: 'Monthly Profit',
      summaryHeading: 'Summary',
      copySummary: 'Copy Summary',
      resetDefaults: 'Reset Defaults',
      labels: {
        customerPaymentPerOrder: 'Customer payment per order (USD)',
        platformDiscountPerOrder: 'Platform discount per order',
        taxPerOrder: 'Tax per order',
        monthlyOrders: 'Monthly orders',
        feeMode: 'Fee mode',
        customReferralFeePct: 'Custom referral fee %',
        refundRatePct: 'Refund rate %',
        productCostPerOrder: 'Product cost per order',
        shippingSubsidyPerOrder: 'Shipping subsidy per order',
        otherCostPerOrder: 'Other cost per order'
      },
      feeModes: { 'standard-6': 'Standard 6%', 'promo-3': 'Promo 3%', custom: 'Custom' },
      kpis: {
        referralFeePct: 'Referral fee rate',
        estimatedNetProfit: 'Est. monthly net profit',
        effectivePlatformTakeRatePct: 'Effective platform take'
      },
      details: {
        qualifiedFeeBasePerOrder: 'Qualified fee base / order',
        referralFeePerOrder: 'Referral fee / order',
        refundAdminFeePerRefundedOrder: 'Refund admin fee / refunded order',
        variableCostPerOrder: 'Variable cost / order',
        completedOrders: 'Completed orders',
        refundedOrders: 'Refunded orders',
        grossSellerReceipts: 'Gross seller receipts',
        monthlyReferralFees: 'Monthly referral fees',
        monthlyRefundAdminFees: 'Monthly refund admin fees',
        estimatedPayoutAfterPlatformFees: 'Est. payout after platform fees',
        monthlyVariableCosts: 'Monthly variable costs',
        estimatedNetProfit: 'Est. net profit'
      },
      formulaNote: 'Fee base = Customer Payment + Platform Discount \u2212 Tax. Referral fee = fee base \u00d7 rate. Refund admin = 20% of referral fee, capped at $5/refunded order.',
      assumptions: 'Single-SKU estimate. Editable defaults model TikTok Shop public fee assumptions only.',
      summaryLines: {
        title: '[TikTok Shop Fee Profit Calculator Summary]',
        feeMode: 'Fee mode',
        referralFeePct: 'Referral fee rate',
        feeBase: 'Fee base / order',
        referralFee: 'Referral fee / order',
        refundAdmin: 'Refund admin / refunded order',
        completedOrders: 'Completed orders',
        grossReceipts: 'Gross receipts',
        platformFees: 'Platform fees total',
        payout: 'Est. payout after fees',
        variableCosts: 'Variable costs',
        netProfit: 'Est. net profit',
        takeRate: 'Effective take rate'
      },
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable.',
      statusGood: 'profitable',
      statusTight: 'break-even',
      statusNegative: 'loss'
    },
    ko: {
      docTitle: 'TikTok Shop \uc218\uc218\ub8cc\u00b7\uc21c\uc774\uc775 \uacc4\uc0b0\uae30 | TikTok Shop Fee Profit Calculator',
      backLink: '\u2190 \ub3c4\uad6c',
      langButton: 'EN',
      pageTitle: 'TikTok Shop \uc218\uc218\ub8cc\u00b7\uc21c\uc774\uc775 \uacc4\uc0b0\uae30',
      pageSubtitle: 'TikTok Shop \ucd94\ucc9c \uc218\uc218\ub8cc, \ud658\ubd88 \uad00\ub9ac \uc218\uc218\ub8cc, \uc6d4\uac04 \uc21c\uc774\uc775\uc744 \ud45c\uc900 6%, \ud504\ub85c\ubaa8 3%, \uc0ac\uc6a9\uc790 \uc815\uc758 \uc218\uc218\ub8cc\ub85c \ucd94\uc815\ud569\ub2c8\ub2e4.',
      disclaimer: '\uacc4\ud68d\uc6a9 \ucd94\uc815\uce58\uc785\ub2c8\ub2e4. \uc2e4\uc81c TikTok Shop \uc218\uc218\ub8cc\ub294 \uce74\ud14c\uace0\ub9ac, \ud504\ub85c\ubaa8\uc158, \uc815\uc0b0 \uc870\uac74\uc5d0 \ub530\ub77c \ub2ec\ub77c\uc9c8 \uc218 \uc788\uc2b5\ub2c8\ub2e4.',
      inputsHeading: '\uc785\ub825\uac12',
      feeHeading: '\uc218\uc218\ub8cc \uc694\uc57d',
      profitHeading: '\uc6d4\uac04 \uc218\uc775',
      summaryHeading: '\uc694\uc57d',
      copySummary: '\uc694\uc57d \ubcf5\uc0ac',
      resetDefaults: '\uae30\ubcf8\uac12 \ubcf5\uc6d0',
      labels: {
        customerPaymentPerOrder: '\uc8fc\ubb38\ub2f9 \uace0\uac1d \uacb0\uc81c\uc561 (USD)',
        platformDiscountPerOrder: '\uc8fc\ubb38\ub2f9 \ud50c\ub7ab\ud3fc \ud560\uc778',
        taxPerOrder: '\uc8fc\ubb38\ub2f9 \uc138\uae08',
        monthlyOrders: '\uc6d4\uac04 \uc8fc\ubb38 \uc218',
        feeMode: '\uc218\uc218\ub8cc \ubaa8\ub4dc',
        customReferralFeePct: '\uc0ac\uc6a9\uc790 \uc815\uc758 \uc218\uc218\ub8cc %',
        refundRatePct: '\ud658\ubd88\ub960 %',
        productCostPerOrder: '\uc8fc\ubb38\ub2f9 \uc81c\ud488 \uc6d0\uac00',
        shippingSubsidyPerOrder: '\uc8fc\ubb38\ub2f9 \ubc30\uc1a1 \ubcf4\uc870',
        otherCostPerOrder: '\uc8fc\ubb38\ub2f9 \uae30\ud0c0 \ube44\uc6a9'
      },
      feeModes: { 'standard-6': '\ud45c\uc900 6%', 'promo-3': '\ud504\ub85c\ubaa8 3%', custom: '\uc0ac\uc6a9\uc790 \uc815\uc758' },
      kpis: {
        referralFeePct: '\ucd94\ucc9c \uc218\uc218\ub8cc\uc728',
        estimatedNetProfit: '\uc6d4 \uc608\uc0c1 \uc21c\uc774\uc775',
        effectivePlatformTakeRatePct: '\uc2e4\ud6a8 \ud50c\ub7ab\ud3fc \uc218\uc218\ub8cc'
      },
      details: {
        qualifiedFeeBasePerOrder: '\uc8fc\ubb38\ub2f9 \uc218\uc218\ub8cc \uae30\uc900\uc561',
        referralFeePerOrder: '\uc8fc\ubb38\ub2f9 \ucd94\ucc9c \uc218\uc218\ub8cc',
        refundAdminFeePerRefundedOrder: '\ud658\ubd88 \uc8fc\ubb38\ub2f9 \uad00\ub9ac \uc218\uc218\ub8cc',
        variableCostPerOrder: '\uc8fc\ubb38\ub2f9 \ubcc0\ub3d9\ube44',
        completedOrders: '\uc644\ub8cc \uc8fc\ubb38',
        refundedOrders: '\ud658\ubd88 \uc8fc\ubb38',
        grossSellerReceipts: '\ucd1d \ud310\ub9e4 \uc218\uc785',
        monthlyReferralFees: '\uc6d4\uac04 \ucd94\ucc9c \uc218\uc218\ub8cc',
        monthlyRefundAdminFees: '\uc6d4\uac04 \ud658\ubd88 \uad00\ub9ac \uc218\uc218\ub8cc',
        estimatedPayoutAfterPlatformFees: '\ud50c\ub7ab\ud3fc \uc218\uc218\ub8cc \ud6c4 \uc608\uc0c1 \uc815\uc0b0',
        monthlyVariableCosts: '\uc6d4\uac04 \ubcc0\ub3d9\ube44',
        estimatedNetProfit: '\uc608\uc0c1 \uc21c\uc774\uc775'
      },
      formulaNote: '\uc218\uc218\ub8cc \uae30\uc900 = \uace0\uac1d \uacb0\uc81c\uc561 + \ud50c\ub7ab\ud3fc \ud560\uc778 \u2212 \uc138\uae08. \ucd94\ucc9c \uc218\uc218\ub8cc = \uae30\uc900 \u00d7 \uc218\uc218\ub8cc\uc728. \ud658\ubd88 \uad00\ub9ac = \ucd94\ucc9c \uc218\uc218\ub8cc\uc758 20%, \ucd5c\ub300 $5/\ud658\ubd88 \uc8fc\ubb38.',
      assumptions: '\ub2e8\uc77c SKU \ucd94\uc815\uce58. TikTok Shop \uacf5\uac1c \uc218\uc218\ub8cc \uac00\uc815\ub9cc \ubaa8\ub378\ub9c1\ud569\ub2c8\ub2e4.',
      summaryLines: {
        title: '[TikTok Shop \uc218\uc218\ub8cc\u00b7\uc21c\uc774\uc775 \uacc4\uc0b0\uae30 \uc694\uc57d]',
        feeMode: '\uc218\uc218\ub8cc \ubaa8\ub4dc',
        referralFeePct: '\ucd94\ucc9c \uc218\uc218\ub8cc\uc728',
        feeBase: '\uc8fc\ubb38\ub2f9 \uc218\uc218\ub8cc \uae30\uc900',
        referralFee: '\uc8fc\ubb38\ub2f9 \ucd94\ucc9c \uc218\uc218\ub8cc',
        refundAdmin: '\ud658\ubd88 \uc8fc\ubb38\ub2f9 \uad00\ub9ac \uc218\uc218\ub8cc',
        completedOrders: '\uc644\ub8cc \uc8fc\ubb38',
        grossReceipts: '\ucd1d \uc218\uc785',
        platformFees: '\ud50c\ub7ab\ud3fc \uc218\uc218\ub8cc \ucd1d\uc561',
        payout: '\uc218\uc218\ub8cc \ud6c4 \uc608\uc0c1 \uc815\uc0b0',
        variableCosts: '\ubcc0\ub3d9\ube44',
        netProfit: '\uc608\uc0c1 \uc21c\uc774\uc775',
        takeRate: '\uc2e4\ud6a8 \uc218\uc218\ub8cc\uc728'
      },
      copied: '\uc694\uc57d\uc744 \ubcf5\uc0ac\ud588\uc2b5\ub2c8\ub2e4.',
      copyFail: '\ud074\ub9bd\ubcf4\ub4dc\ub97c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
      statusGood: '\uc218\uc775',
      statusTight: '\uc190\uc775\ubd84\uae30',
      statusNegative: '\uc190\uc2e4'
    }
  };

  /* ── Helpers ── */
  function r2(v) { return Math.round((v + Number.EPSILON) * 100) / 100; }

  function num(v, fb) {
    var p = Number(v);
    return Number.isFinite(p) ? p : (fb !== undefined ? fb : NaN);
  }

  /* ── Normalize ── */
  function normalize(raw) {
    var s = raw || {};
    /* Use fallback only when the key is truly absent (undefined/null).
       If the caller supplies a value (even a bad string), pass it through
       so validation can reject it. */
    function pick(key) {
      var v = s[key];
      if (v === undefined || v === null) return DEFAULTS[key];
      return num(v);  /* NaN if non-numeric */
    }
    return {
      customerPaymentPerOrder: pick('customerPaymentPerOrder'),
      platformDiscountPerOrder: pick('platformDiscountPerOrder'),
      taxPerOrder: pick('taxPerOrder'),
      monthlyOrders: pick('monthlyOrders'),
      feeMode: (s.feeMode === 'promo-3' || s.feeMode === 'custom') ? s.feeMode : 'standard-6',
      customReferralFeePct: pick('customReferralFeePct'),
      refundRatePct: pick('refundRatePct'),
      productCostPerOrder: pick('productCostPerOrder'),
      shippingSubsidyPerOrder: pick('shippingSubsidyPerOrder'),
      otherCostPerOrder: pick('otherCostPerOrder')
    };
  }

  /* ── Validate ── */
  function validate(input) {
    if (!Number.isFinite(input.customerPaymentPerOrder) || input.customerPaymentPerOrder < 0) return 'customerPaymentPerOrder must be >= 0';
    if (!Number.isFinite(input.platformDiscountPerOrder) || input.platformDiscountPerOrder < 0) return 'platformDiscountPerOrder must be >= 0';
    if (!Number.isFinite(input.taxPerOrder) || input.taxPerOrder < 0) return 'taxPerOrder must be >= 0';
    if (!Number.isFinite(input.monthlyOrders) || !Number.isInteger(input.monthlyOrders) || input.monthlyOrders < 0) return 'monthlyOrders must be integer >= 0';
    if (input.feeMode !== 'standard-6' && input.feeMode !== 'promo-3' && input.feeMode !== 'custom') return 'feeMode must be standard-6|promo-3|custom';
    if (input.feeMode === 'custom') {
      if (!Number.isFinite(input.customReferralFeePct) || input.customReferralFeePct < 0 || input.customReferralFeePct > 100) return 'customReferralFeePct must be 0..100';
    }
    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct > 100) return 'refundRatePct must be 0..100';
    if (!Number.isFinite(input.productCostPerOrder) || input.productCostPerOrder < 0) return 'productCostPerOrder must be >= 0';
    if (!Number.isFinite(input.shippingSubsidyPerOrder) || input.shippingSubsidyPerOrder < 0) return 'shippingSubsidyPerOrder must be >= 0';
    if (!Number.isFinite(input.otherCostPerOrder) || input.otherCostPerOrder < 0) return 'otherCostPerOrder must be >= 0';
    return '';
  }

  /* ── Core calculation ── */
  function calculate(rawInput) {
    var input = normalize(rawInput);
    var error = validate(input);
    if (error) return { result: null, error: error };

    /* Fee mode resolution */
    var referralFeePct;
    if (input.feeMode === 'standard-6') referralFeePct = STANDARD_REFERRAL_FEE_PCT;
    else if (input.feeMode === 'promo-3') referralFeePct = PROMO_REFERRAL_FEE_PCT;
    else referralFeePct = input.customReferralFeePct;

    var referralFeeRate = referralFeePct / 100;

    /* Per-order */
    var qualifiedFeeBasePerOrder = Math.max(input.customerPaymentPerOrder + input.platformDiscountPerOrder - input.taxPerOrder, 0);
    var referralFeePerOrder = qualifiedFeeBasePerOrder * referralFeeRate;
    var rawRefundAdmin = referralFeePerOrder * REFUND_ADMIN_SHARE_OF_REFERRAL;
    var refundAdminFeePerRefundedOrder = Math.min(rawRefundAdmin, REFUND_ADMIN_CAP_PER_REFUNDED_ORDER);
    var variableCostPerOrder = input.productCostPerOrder + input.shippingSubsidyPerOrder + input.otherCostPerOrder;

    /* Monthly */
    var refundRate = input.refundRatePct / 100;
    var completedOrders = input.monthlyOrders * (1 - refundRate);
    var refundedOrders = input.monthlyOrders * refundRate;
    var grossSellerReceipts = qualifiedFeeBasePerOrder * completedOrders;
    var monthlyReferralFees = referralFeePerOrder * completedOrders;
    var monthlyRefundAdminFees = refundAdminFeePerRefundedOrder * refundedOrders;
    var estimatedPayoutAfterPlatformFees = grossSellerReceipts - monthlyReferralFees - monthlyRefundAdminFees;
    var monthlyVariableCosts = variableCostPerOrder * input.monthlyOrders;
    var estimatedNetProfit = estimatedPayoutAfterPlatformFees - monthlyVariableCosts;

    /* Effective take rate */
    var effectivePlatformTakeRatePct = grossSellerReceipts > 0
      ? ((monthlyReferralFees + monthlyRefundAdminFees) / grossSellerReceipts) * 100
      : 0;

    /* Status */
    var roundedNet = r2(estimatedNetProfit);
    var status = roundedNet > 0.01 ? 'good' : (roundedNet >= -0.01 ? 'tight' : 'negative');

    var result = {
      inputs: input,
      referralFeePct: r2(referralFeePct),
      qualifiedFeeBasePerOrder: r2(qualifiedFeeBasePerOrder),
      referralFeePerOrder: r2(referralFeePerOrder),
      refundAdminFeePerRefundedOrder: r2(refundAdminFeePerRefundedOrder),
      variableCostPerOrder: r2(variableCostPerOrder),
      completedOrders: r2(completedOrders),
      refundedOrders: r2(refundedOrders),
      grossSellerReceipts: r2(grossSellerReceipts),
      monthlyReferralFees: r2(monthlyReferralFees),
      monthlyRefundAdminFees: r2(monthlyRefundAdminFees),
      estimatedPayoutAfterPlatformFees: r2(estimatedPayoutAfterPlatformFees),
      monthlyVariableCosts: r2(monthlyVariableCosts),
      estimatedNetProfit: r2(estimatedNetProfit),
      effectivePlatformTakeRatePct: r2(effectivePlatformTakeRatePct),
      status: status
    };

    return { result: result, error: '' };
  }

  /* ── Summary builder ── */
  function buildSummary(result, lang) {
    var ui = UI_TEXT[lang] || UI_TEXT.en;
    var sl = ui.summaryLines;
    var fml = ui.feeModes[result.inputs.feeMode] || result.inputs.feeMode;
    return [
      sl.title,
      sl.feeMode + ': ' + fml,
      sl.referralFeePct + ': ' + result.referralFeePct + '%',
      sl.feeBase + ': $' + result.qualifiedFeeBasePerOrder,
      sl.referralFee + ': $' + result.referralFeePerOrder,
      sl.refundAdmin + ': $' + result.refundAdminFeePerRefundedOrder,
      sl.completedOrders + ': ' + result.completedOrders,
      sl.grossReceipts + ': $' + result.grossSellerReceipts,
      sl.platformFees + ': $' + r2(result.monthlyReferralFees + result.monthlyRefundAdminFees),
      sl.payout + ': $' + result.estimatedPayoutAfterPlatformFees,
      sl.variableCosts + ': $' + result.monthlyVariableCosts,
      sl.netProfit + ': $' + result.estimatedNetProfit,
      sl.takeRate + ': ' + result.effectivePlatformTakeRatePct + '%',
      ui.assumptions
    ].join('\n');
  }

  /* ── Public API ── */
  var api = { DEFAULTS: DEFAULTS, UI_TEXT: UI_TEXT, normalize: normalize, validate: validate, calculate: calculate, buildSummary: buildSummary, r2: r2 };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.TikTokShopFeeCalculator = api;

  /* ── Browser wiring ── */
  if (typeof document === 'undefined') return;

  function $(id) { return document.getElementById(id); }

  function fmt(v, lang, d) {
    var loc = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  }

  function initBrowser() {
    var currentLang = 'en';

    var refs = {
      docTitle: document.querySelector('title'),
      html: document.documentElement,
      backLink: $('backLink'),
      langBtn: $('langBtn'),
      pageTitle: $('pageTitle'),
      pageSubtitle: $('pageSubtitle'),
      disclaimer: $('disclaimer'),
      inputsHeading: $('inputsHeading'),
      feeHeading: $('feeHeading'),
      profitHeading: $('profitHeading'),
      summaryHeading: $('summaryHeading'),
      copySummary: $('copySummary'),
      resetDefaults: $('resetDefaults'),
      summary: $('summary'),
      assumptions: $('assumptions'),
      formulaNote: $('formulaNote'),
      status: $('status'),
      customerPaymentPerOrder: $('customerPaymentPerOrder'),
      platformDiscountPerOrder: $('platformDiscountPerOrder'),
      taxPerOrder: $('taxPerOrder'),
      monthlyOrders: $('monthlyOrders'),
      feeMode: $('feeMode'),
      customReferralFeePct: $('customReferralFeePct'),
      customReferralField: $('customReferralField'),
      refundRatePct: $('refundRatePct'),
      productCostPerOrder: $('productCostPerOrder'),
      shippingSubsidyPerOrder: $('shippingSubsidyPerOrder'),
      otherCostPerOrder: $('otherCostPerOrder')
    };

    var outputIds = [
      'qualifiedFeeBasePerOrder', 'referralFeePerOrder', 'refundAdminFeePerRefundedOrder',
      'variableCostPerOrder', 'completedOrders', 'refundedOrders', 'grossSellerReceipts',
      'monthlyReferralFees', 'monthlyRefundAdminFees', 'estimatedPayoutAfterPlatformFees',
      'monthlyVariableCosts', 'estimatedNetProfit', 'effectivePlatformTakeRatePct', 'referralFeePct'
    ];

    var inputNodes = [
      refs.customerPaymentPerOrder, refs.platformDiscountPerOrder, refs.taxPerOrder,
      refs.monthlyOrders, refs.feeMode, refs.customReferralFeePct, refs.refundRatePct,
      refs.productCostPerOrder, refs.shippingSubsidyPerOrder, refs.otherCostPerOrder
    ];

    function setDefaults() {
      refs.customerPaymentPerOrder.value = DEFAULTS.customerPaymentPerOrder;
      refs.platformDiscountPerOrder.value = DEFAULTS.platformDiscountPerOrder;
      refs.taxPerOrder.value = DEFAULTS.taxPerOrder;
      refs.monthlyOrders.value = DEFAULTS.monthlyOrders;
      refs.feeMode.value = DEFAULTS.feeMode;
      refs.customReferralFeePct.value = DEFAULTS.customReferralFeePct;
      refs.refundRatePct.value = DEFAULTS.refundRatePct;
      refs.productCostPerOrder.value = DEFAULTS.productCostPerOrder;
      refs.shippingSubsidyPerOrder.value = DEFAULTS.shippingSubsidyPerOrder;
      refs.otherCostPerOrder.value = DEFAULTS.otherCostPerOrder;
    }

    function gather() {
      return {
        customerPaymentPerOrder: refs.customerPaymentPerOrder.value,
        platformDiscountPerOrder: refs.platformDiscountPerOrder.value,
        taxPerOrder: refs.taxPerOrder.value,
        monthlyOrders: refs.monthlyOrders.value,
        feeMode: refs.feeMode.value,
        customReferralFeePct: refs.customReferralFeePct.value,
        refundRatePct: refs.refundRatePct.value,
        productCostPerOrder: refs.productCostPerOrder.value,
        shippingSubsidyPerOrder: refs.shippingSubsidyPerOrder.value,
        otherCostPerOrder: refs.otherCostPerOrder.value
      };
    }

    function syncCustomField() {
      refs.customReferralField.style.display = refs.feeMode.value === 'custom' ? 'grid' : 'none';
    }

    function clearOutputs() {
      outputIds.forEach(function (id) {
        var el = $('o_' + id);
        if (el) el.textContent = '\u2014';
      });
      refs.summary.value = '';
    }

    function applyStaticText() {
      var ui = UI_TEXT[currentLang] || UI_TEXT.en;
      refs.html.lang = currentLang;
      refs.docTitle.textContent = ui.docTitle;
      if (refs.backLink) refs.backLink.textContent = ui.backLink;
      if (refs.langBtn) refs.langBtn.textContent = ui.langButton;
      if (refs.pageTitle) refs.pageTitle.textContent = ui.pageTitle;
      if (refs.pageSubtitle) refs.pageSubtitle.textContent = ui.pageSubtitle;
      if (refs.disclaimer) refs.disclaimer.textContent = ui.disclaimer;
      if (refs.inputsHeading) refs.inputsHeading.textContent = ui.inputsHeading;
      if (refs.feeHeading) refs.feeHeading.textContent = ui.feeHeading;
      if (refs.profitHeading) refs.profitHeading.textContent = ui.profitHeading;
      if (refs.summaryHeading) refs.summaryHeading.textContent = ui.summaryHeading;
      if (refs.copySummary) refs.copySummary.textContent = ui.copySummary;
      if (refs.resetDefaults) refs.resetDefaults.textContent = ui.resetDefaults;
      if (refs.assumptions) refs.assumptions.textContent = ui.assumptions;
      if (refs.formulaNote) refs.formulaNote.textContent = ui.formulaNote;
      Object.keys(ui.labels).forEach(function (k) {
        var lbl = $('label_' + k);
        if (lbl) lbl.textContent = ui.labels[k];
      });
      Object.keys(ui.kpis).forEach(function (k) {
        var lbl = $('kpi_' + k);
        if (lbl) lbl.textContent = ui.kpis[k];
      });
      Object.keys(ui.details).forEach(function (k) {
        var lbl = $('detail_' + k);
        if (lbl) lbl.textContent = ui.details[k];
      });
      /* Fee mode select options */
      Array.from(refs.feeMode.options).forEach(function (opt) {
        if (ui.feeModes[opt.value]) opt.textContent = ui.feeModes[opt.value];
      });
    }

    function render() {
      syncCustomField();
      var ui = UI_TEXT[currentLang] || UI_TEXT.en;
      var res = calculate(gather());

      if (res.error) {
        clearOutputs();
        refs.status.textContent = res.error;
        refs.status.className = 'status negative';
        return;
      }

      var r = res.result;
      $('o_referralFeePct').textContent = fmt(r.referralFeePct, currentLang, 2) + '%';
      $('o_qualifiedFeeBasePerOrder').textContent = '$' + fmt(r.qualifiedFeeBasePerOrder, currentLang, 2);
      $('o_referralFeePerOrder').textContent = '$' + fmt(r.referralFeePerOrder, currentLang, 2);
      $('o_refundAdminFeePerRefundedOrder').textContent = '$' + fmt(r.refundAdminFeePerRefundedOrder, currentLang, 2);
      $('o_variableCostPerOrder').textContent = '$' + fmt(r.variableCostPerOrder, currentLang, 2);
      $('o_completedOrders').textContent = fmt(r.completedOrders, currentLang, 0);
      $('o_refundedOrders').textContent = fmt(r.refundedOrders, currentLang, 0);
      $('o_grossSellerReceipts').textContent = '$' + fmt(r.grossSellerReceipts, currentLang, 2);
      $('o_monthlyReferralFees').textContent = '$' + fmt(r.monthlyReferralFees, currentLang, 2);
      $('o_monthlyRefundAdminFees').textContent = '$' + fmt(r.monthlyRefundAdminFees, currentLang, 2);
      $('o_estimatedPayoutAfterPlatformFees').textContent = '$' + fmt(r.estimatedPayoutAfterPlatformFees, currentLang, 2);
      $('o_monthlyVariableCosts').textContent = '$' + fmt(r.monthlyVariableCosts, currentLang, 2);
      $('o_estimatedNetProfit').textContent = '$' + fmt(r.estimatedNetProfit, currentLang, 2);
      $('o_effectivePlatformTakeRatePct').textContent = fmt(r.effectivePlatformTakeRatePct, currentLang, 2) + '%';

      refs.summary.value = buildSummary(r, currentLang);

      var label = r.status === 'good' ? ui.statusGood : (r.status === 'tight' ? ui.statusTight : ui.statusNegative);
      refs.status.textContent = label;
      refs.status.className = 'status ' + r.status;
    }

    inputNodes.forEach(function (n) {
      n.addEventListener('input', render);
      n.addEventListener('change', render);
    });

    refs.langBtn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyStaticText();
      render();
    });

    refs.copySummary.addEventListener('click', async function () {
      var ui = UI_TEXT[currentLang] || UI_TEXT.en;
      if (!refs.summary.value.trim()) render();
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.textContent = ui.copied;
        refs.status.className = 'status good';
      } catch (_e) {
        refs.status.textContent = ui.copyFail;
        refs.status.className = 'status tight';
      }
    });

    refs.resetDefaults.addEventListener('click', function () {
      setDefaults();
      applyStaticText();
      render();
    });

    setDefaults();
    applyStaticText();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
