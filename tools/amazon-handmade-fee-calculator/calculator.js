(function (root) {
  const REFERRAL_RATE = 0.15;
  const MINIMUM_REFERRAL_FEE = 1;
  const FIRST_MONTH_PROFESSIONAL_FEE = 39.99;
  const PRICE_SEARCH_MAX = 100000;
  const PRICE_SEARCH_ITERATIONS = 48;

  const DEFAULTS = {
    itemPrice: 35,
    shippingCharged: 6,
    monthlyOrders: 40,
    itemCost: 12,
    packagingCost: 1.25,
    shippingCost: 5.5,
    adCostPerOrder: 2,
    otherCostPerOrder: 0,
    includeFirstMonthProfessionalFee: true,
    ongoingMonthlyFee: 0,
    targetMonthlyNetProfit: 1000
  };

  const TEXT = {
    en: {
      summaryTitle: '[Amazon Handmade Fee Calculator Summary]',
      invalidItemPrice: 'Item price must be greater than zero.',
      invalidMonthlyOrders: 'Monthly orders must be an integer greater than or equal to zero.',
      invalidMoney: 'All money inputs must be zero or above.',
      invalidTarget: 'Target monthly net profit must be zero or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter valid inputs to calculate Amazon Handmade payout and profit.',
      statusGood: 'This Handmade scenario is profitable on a per-order basis.',
      statusWarn: 'This Handmade scenario is losing money on a per-order basis.',
      assumption: 'Planning model only: this v1 applies the public 15% referral fee with a $1 minimum to the item price, then layers your own shipping and cost assumptions.',
      na: 'N/A',
      labels: {
        title: 'Amazon Handmade Fee Calculator',
        subtitle: 'Estimate referral fees, payout, and seller profit after item cost, packaging, shipping, ads, and the optional first-month Professional plan charge.',
        back: 'Back to Tools',
        copy: 'Copy Summary',
        reset: 'Reset',
        inputHeader: 'Inputs',
        kpiHeader: 'Key outputs',
        detailHeader: 'Detailed breakdown',
        notesHeader: 'Assumptions',
        itemPrice: 'Item price',
        shippingCharged: 'Shipping charged to buyer',
        monthlyOrders: 'Monthly orders',
        itemCost: 'Item cost',
        packagingCost: 'Packaging cost',
        shippingCost: 'Actual shipping cost',
        adCostPerOrder: 'Ad cost per order',
        otherCostPerOrder: 'Other cost per order',
        includeFirstMonthProfessionalFee: 'Include one-time first-month $39.99 Professional plan charge',
        ongoingMonthlyFee: 'Ongoing monthly fee override',
        targetMonthlyNetProfit: 'Target monthly net profit',
        referralFee: 'Referral fee / order',
        payoutAfterAmazonFee: 'Payout after Amazon fee',
        netProfitPerOrder: 'Net profit / order',
        monthlyNetProfit: 'Monthly net profit',
        breakEvenItemPrice: 'Break-even item price',
        requiredItemPrice: 'Required item price for target net',
        effectiveReferralRatePct: 'Effective referral rate',
        fixedMonthlyFees: 'Fixed monthly fees',
        paybackOrders: 'Payback orders',
        orderRevenue: 'Order revenue',
        sellerCostPerOrder: 'Seller cost / order',
        summary: 'Summary',
        detailOrderRevenue: 'Order revenue',
        detailReferralFee: 'Referral fee',
        detailPayoutAfterAmazonFee: 'Payout after Amazon fee',
        detailSellerCostPerOrder: 'Seller cost per order',
        detailNetProfitPerOrder: 'Net profit per order',
        detailMonthlyOrders: 'Monthly orders',
        detailFixedMonthlyFees: 'Fixed monthly fees',
        detailMonthlyNetProfit: 'Monthly net profit',
        detailPaybackOrders: 'Payback orders'
      }
    },
    ko: {
      summaryTitle: '[Amazon Handmade 수수료 계산기 요약]',
      invalidItemPrice: '상품 가격은 0보다 커야 합니다.',
      invalidMonthlyOrders: '월 주문 수는 0 이상의 정수여야 합니다.',
      invalidMoney: '금액 입력값은 모두 0 이상이어야 합니다.',
      invalidTarget: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      waiting: '유효한 입력값을 넣으면 Amazon Handmade 손익이 계산됩니다.',
      statusGood: '현재 Handmade 시나리오는 주문당 기준으로 흑자입니다.',
      statusWarn: '현재 Handmade 시나리오는 주문당 기준으로 적자입니다.',
      assumption: '계획용 모델입니다. 이 v1은 공개된 15% referral fee와 $1 minimum fee를 상품 가격 기준으로 적용하고, 배송·광고·기타 비용은 사용자가 직접 넣는 방식입니다.',
      na: 'N/A',
      labels: {
        title: '아마존 핸드메이드 수수료 계산기',
        subtitle: 'Amazon Handmade referral fee, 제작원가, 포장비, 배송비, 광고비, 선택형 첫 달 Professional fee를 반영해 판매 수익성을 계산합니다.',
        back: '도구로 돌아가기',
        copy: '요약 복사',
        reset: '초기화',
        inputHeader: '입력값',
        kpiHeader: '핵심 결과',
        detailHeader: '세부 계산',
        notesHeader: '가정',
        itemPrice: '상품 가격',
        shippingCharged: '구매자에게 청구한 배송비',
        monthlyOrders: '월 주문 수',
        itemCost: '상품 원가',
        packagingCost: '포장비',
        shippingCost: '실배송비',
        adCostPerOrder: '주문당 광고비',
        otherCostPerOrder: '주문당 기타비용',
        includeFirstMonthProfessionalFee: '첫 달 Professional plan $39.99를 반영',
        ongoingMonthlyFee: '지속 월비용 직접 입력',
        targetMonthlyNetProfit: '목표 월 순이익',
        referralFee: '주문당 referral fee',
        payoutAfterAmazonFee: 'Amazon 수수료 차감 후 수령액',
        netProfitPerOrder: '주문당 순이익',
        monthlyNetProfit: '월 순이익',
        breakEvenItemPrice: '손익분기 상품가',
        requiredItemPrice: '목표 순이익용 상품가',
        effectiveReferralRatePct: '실효 referral fee율',
        fixedMonthlyFees: '월 고정비',
        paybackOrders: '고정비 회수 주문 수',
        orderRevenue: '주문 매출',
        sellerCostPerOrder: '주문당 총비용',
        summary: '요약',
        detailOrderRevenue: '주문 매출',
        detailReferralFee: 'Referral fee',
        detailPayoutAfterAmazonFee: 'Amazon 수수료 차감 후 수령액',
        detailSellerCostPerOrder: '주문당 총비용',
        detailNetProfitPerOrder: '주문당 순이익',
        detailMonthlyOrders: '월 주문 수',
        detailFixedMonthlyFees: '월 고정비',
        detailMonthlyNetProfit: '월 순이익',
        detailPaybackOrders: '고정비 회수 주문 수'
      }
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalize(input) {
    const src = input || {};
    return {
      itemPrice: Number(src.itemPrice ?? DEFAULTS.itemPrice),
      shippingCharged: Number(src.shippingCharged ?? DEFAULTS.shippingCharged),
      monthlyOrders: Number(src.monthlyOrders ?? DEFAULTS.monthlyOrders),
      itemCost: Number(src.itemCost ?? DEFAULTS.itemCost),
      packagingCost: Number(src.packagingCost ?? DEFAULTS.packagingCost),
      shippingCost: Number(src.shippingCost ?? DEFAULTS.shippingCost),
      adCostPerOrder: Number(src.adCostPerOrder ?? DEFAULTS.adCostPerOrder),
      otherCostPerOrder: Number(src.otherCostPerOrder ?? DEFAULTS.otherCostPerOrder),
      includeFirstMonthProfessionalFee: src.includeFirstMonthProfessionalFee == null
        ? DEFAULTS.includeFirstMonthProfessionalFee
        : Boolean(src.includeFirstMonthProfessionalFee),
      ongoingMonthlyFee: Number(src.ongoingMonthlyFee ?? DEFAULTS.ongoingMonthlyFee),
      targetMonthlyNetProfit: Number(src.targetMonthlyNetProfit ?? DEFAULTS.targetMonthlyNetProfit)
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(input.itemPrice) || input.itemPrice <= 0) {
      return t.invalidItemPrice;
    }

    if (!Number.isInteger(input.monthlyOrders) || input.monthlyOrders < 0) {
      return t.invalidMonthlyOrders;
    }

    const moneyFields = [
      input.shippingCharged,
      input.itemCost,
      input.packagingCost,
      input.shippingCost,
      input.adCostPerOrder,
      input.otherCostPerOrder,
      input.ongoingMonthlyFee
    ];
    if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
      return t.invalidMoney;
    }

    if (!Number.isFinite(input.targetMonthlyNetProfit) || input.targetMonthlyNetProfit < 0) {
      return t.invalidTarget;
    }

    return '';
  }

  function fixedMonthlyFees(input) {
    return input.ongoingMonthlyFee + (input.includeFirstMonthProfessionalFee ? FIRST_MONTH_PROFESSIONAL_FEE : 0);
  }

  function referralFeeForItemPrice(itemPrice) {
    return Math.max(itemPrice * REFERRAL_RATE, MINIMUM_REFERRAL_FEE);
  }

  function evaluateAtItemPrice(input, itemPriceOverride) {
    const itemPrice = itemPriceOverride == null ? input.itemPrice : Number(itemPriceOverride);
    const referralFee = referralFeeForItemPrice(itemPrice);
    const orderRevenue = itemPrice + input.shippingCharged;
    const payoutAfterAmazonFee = orderRevenue - referralFee;
    const sellerCostPerOrder = input.itemCost + input.packagingCost + input.shippingCost + input.adCostPerOrder + input.otherCostPerOrder;
    const netProfitPerOrder = payoutAfterAmazonFee - sellerCostPerOrder;
    const monthlyFixedFees = fixedMonthlyFees(input);
    const monthlyNetProfit = (netProfitPerOrder * input.monthlyOrders) - monthlyFixedFees;
    const effectiveReferralRatePct = itemPrice > 0 ? (referralFee / itemPrice) * 100 : 0;
    const paybackOrders = monthlyFixedFees > 0 && netProfitPerOrder > 0 ? Math.ceil(monthlyFixedFees / netProfitPerOrder) : null;

    return {
      itemPrice: round2(itemPrice),
      referralFee: round2(referralFee),
      orderRevenue: round2(orderRevenue),
      payoutAfterAmazonFee: round2(payoutAfterAmazonFee),
      sellerCostPerOrder: round2(sellerCostPerOrder),
      netProfitPerOrder: round2(netProfitPerOrder),
      monthlyFixedFees: round2(monthlyFixedFees),
      monthlyNetProfit: round2(monthlyNetProfit),
      effectiveReferralRatePct: round2(effectiveReferralRatePct),
      paybackOrders
    };
  }

  function searchMonotonicPrice(predicate, targetValue, fallbackNull) {
    let low = 0.01;
    let high = 1;
    let highValue = predicate(high);

    while (high < PRICE_SEARCH_MAX && highValue < targetValue) {
      low = high;
      high = Math.min(PRICE_SEARCH_MAX, high * 2);
      highValue = predicate(high);
    }

    if (highValue < targetValue) {
      return fallbackNull ? null : high;
    }

    for (let i = 0; i < PRICE_SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const midValue = predicate(mid);
      if (midValue >= targetValue) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function findBreakEvenItemPrice(input) {
    return searchMonotonicPrice(
      function priceToPerOrderNet(itemPrice) {
        return evaluateAtItemPrice(input, itemPrice).netProfitPerOrder;
      },
      0,
      true
    );
  }

  function findRequiredItemPriceForTargetMonthlyNet(input) {
    if (input.monthlyOrders === 0) {
      return input.targetMonthlyNetProfit <= -fixedMonthlyFees(input) ? 0.01 : null;
    }

    return searchMonotonicPrice(
      function priceToMonthlyNet(itemPrice) {
        return evaluateAtItemPrice(input, itemPrice).monthlyNetProfit;
      },
      input.targetMonthlyNetProfit,
      true
    );
  }

  function formatCurrency(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const label = t.labels;

    return [
      t.summaryTitle,
      `${label.itemPrice}: ${formatCurrency(result.itemPrice, lang)}`,
      `${label.referralFee}: ${formatCurrency(result.referralFee, lang)}`,
      `${label.payoutAfterAmazonFee}: ${formatCurrency(result.payoutAfterAmazonFee, lang)}`,
      `${label.sellerCostPerOrder}: ${formatCurrency(result.sellerCostPerOrder, lang)}`,
      `${label.netProfitPerOrder}: ${formatCurrency(result.netProfitPerOrder, lang)}`,
      `${label.monthlyOrders}: ${formatNumber(result.inputs.monthlyOrders, lang, 0)}`,
      `${label.fixedMonthlyFees}: ${formatCurrency(result.monthlyFixedFees, lang)}`,
      `${label.monthlyNetProfit}: ${formatCurrency(result.monthlyNetProfit, lang)}`,
      `${label.breakEvenItemPrice}: ${result.breakEvenItemPrice == null ? t.na : formatCurrency(result.breakEvenItemPrice, lang)}`,
      `${label.requiredItemPrice}: ${result.requiredItemPriceForTargetMonthlyNet == null ? t.na : formatCurrency(result.requiredItemPriceForTargetMonthlyNet, lang)}`,
      `${label.paybackOrders}: ${result.paybackOrders == null ? t.na : formatNumber(result.paybackOrders, lang, 0)}`
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalize(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateAtItemPrice(normalized);
    const breakEvenItemPrice = findBreakEvenItemPrice(normalized);
    const requiredItemPriceForTargetMonthlyNet = findRequiredItemPriceForTargetMonthlyNet(normalized);
    const t = TEXT[lang] || TEXT.en;

    const result = {
      inputs: normalized,
      itemPrice: evaluated.itemPrice,
      referralFee: evaluated.referralFee,
      orderRevenue: evaluated.orderRevenue,
      payoutAfterAmazonFee: evaluated.payoutAfterAmazonFee,
      sellerCostPerOrder: evaluated.sellerCostPerOrder,
      netProfitPerOrder: evaluated.netProfitPerOrder,
      monthlyFixedFees: evaluated.monthlyFixedFees,
      monthlyNetProfit: evaluated.monthlyNetProfit,
      effectiveReferralRatePct: evaluated.effectiveReferralRatePct,
      paybackOrders: evaluated.paybackOrders,
      breakEvenItemPrice,
      requiredItemPriceForTargetMonthlyNet,
      status: evaluated.netProfitPerOrder >= 0 ? t.statusGood : t.statusWarn
    };
    result.summary = buildSummary(result, { lang: lang });

    return { result: result, error: '' };
  }

  function initCalculator() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      langBtn: document.getElementById('langBtn'),
      copyBtn: document.getElementById('copyBtn'),
      resetBtn: document.getElementById('resetBtn'),
      error: document.getElementById('error'),
      status: document.getElementById('status'),
      assumption: document.getElementById('assumption'),
      summary: document.getElementById('summary'),
      referralFee: document.getElementById('referralFee'),
      payoutAfterAmazonFee: document.getElementById('payoutAfterAmazonFee'),
      netProfitPerOrder: document.getElementById('netProfitPerOrder'),
      monthlyNetProfit: document.getElementById('monthlyNetProfit'),
      breakEvenItemPrice: document.getElementById('breakEvenItemPrice'),
      requiredItemPrice: document.getElementById('requiredItemPrice'),
      effectiveReferralRatePct: document.getElementById('effectiveReferralRatePct'),
      fixedMonthlyFees: document.getElementById('fixedMonthlyFees'),
      paybackOrders: document.getElementById('paybackOrders'),
      detailOrderRevenue: document.getElementById('detailOrderRevenue'),
      detailReferralFee: document.getElementById('detailReferralFee'),
      detailPayoutAfterAmazonFee: document.getElementById('detailPayoutAfterAmazonFee'),
      detailSellerCostPerOrder: document.getElementById('detailSellerCostPerOrder'),
      detailNetProfitPerOrder: document.getElementById('detailNetProfitPerOrder'),
      detailMonthlyOrders: document.getElementById('detailMonthlyOrders'),
      detailFixedMonthlyFees: document.getElementById('detailFixedMonthlyFees'),
      detailMonthlyNetProfit: document.getElementById('detailMonthlyNetProfit'),
      detailPaybackOrders: document.getElementById('detailPaybackOrders')
    };

    const inputRefs = {
      itemPrice: document.getElementById('itemPrice'),
      shippingCharged: document.getElementById('shippingCharged'),
      monthlyOrders: document.getElementById('monthlyOrders'),
      itemCost: document.getElementById('itemCost'),
      packagingCost: document.getElementById('packagingCost'),
      shippingCost: document.getElementById('shippingCost'),
      adCostPerOrder: document.getElementById('adCostPerOrder'),
      otherCostPerOrder: document.getElementById('otherCostPerOrder'),
      includeFirstMonthProfessionalFee: document.getElementById('includeFirstMonthProfessionalFee'),
      ongoingMonthlyFee: document.getElementById('ongoingMonthlyFee'),
      targetMonthlyNetProfit: document.getElementById('targetMonthlyNetProfit')
    };

    let lang = 'ko';

    function readInputs() {
      return {
        itemPrice: Number(inputRefs.itemPrice.value),
        shippingCharged: Number(inputRefs.shippingCharged.value),
        monthlyOrders: Number(inputRefs.monthlyOrders.value),
        itemCost: Number(inputRefs.itemCost.value),
        packagingCost: Number(inputRefs.packagingCost.value),
        shippingCost: Number(inputRefs.shippingCost.value),
        adCostPerOrder: Number(inputRefs.adCostPerOrder.value),
        otherCostPerOrder: Number(inputRefs.otherCostPerOrder.value),
        includeFirstMonthProfessionalFee: Boolean(inputRefs.includeFirstMonthProfessionalFee.checked),
        ongoingMonthlyFee: Number(inputRefs.ongoingMonthlyFee.value),
        targetMonthlyNetProfit: Number(inputRefs.targetMonthlyNetProfit.value)
      };
    }

    function writeDefaults() {
      inputRefs.itemPrice.value = DEFAULTS.itemPrice;
      inputRefs.shippingCharged.value = DEFAULTS.shippingCharged;
      inputRefs.monthlyOrders.value = DEFAULTS.monthlyOrders;
      inputRefs.itemCost.value = DEFAULTS.itemCost;
      inputRefs.packagingCost.value = DEFAULTS.packagingCost;
      inputRefs.shippingCost.value = DEFAULTS.shippingCost;
      inputRefs.adCostPerOrder.value = DEFAULTS.adCostPerOrder;
      inputRefs.otherCostPerOrder.value = DEFAULTS.otherCostPerOrder;
      inputRefs.includeFirstMonthProfessionalFee.checked = DEFAULTS.includeFirstMonthProfessionalFee;
      inputRefs.ongoingMonthlyFee.value = DEFAULTS.ongoingMonthlyFee;
      inputRefs.targetMonthlyNetProfit.value = DEFAULTS.targetMonthlyNetProfit;
    }

    function updateCopy() {
      const t = TEXT[lang] || TEXT.ko;
      document.documentElement.lang = lang;
      refs.langBtn.textContent = lang === 'ko' ? 'EN' : '한국어';
      refs.assumption.textContent = t.assumption;
      document.querySelectorAll('[data-i18n]').forEach(function (node) {
        const key = node.getAttribute('data-i18n');
        if (t.labels[key]) {
          node.textContent = t.labels[key];
        }
      });
      document.title = lang === 'ko'
        ? 'Amazon Handmade Fee Calculator | 아마존 핸드메이드 수수료 계산기'
        : 'Amazon Handmade Fee Calculator | Amazon Handmade Seller Fee Estimator';
    }

    function render() {
      const t = TEXT[lang] || TEXT.ko;
      const output = calculate(readInputs(), { lang: lang });
      if (output.error) {
        refs.error.textContent = output.error;
        refs.error.hidden = false;
        refs.status.textContent = t.waiting;
        ['referralFee', 'payoutAfterAmazonFee', 'netProfitPerOrder', 'monthlyNetProfit', 'breakEvenItemPrice', 'requiredItemPrice', 'effectiveReferralRatePct', 'fixedMonthlyFees', 'paybackOrders', 'detailOrderRevenue', 'detailReferralFee', 'detailPayoutAfterAmazonFee', 'detailSellerCostPerOrder', 'detailNetProfitPerOrder', 'detailMonthlyOrders', 'detailFixedMonthlyFees', 'detailMonthlyNetProfit', 'detailPaybackOrders'].forEach(function (key) {
          refs[key].textContent = '—';
        });
        refs.summary.value = '';
        return;
      }

      refs.error.hidden = true;
      const result = output.result;
      refs.status.textContent = result.status;
      refs.referralFee.textContent = formatCurrency(result.referralFee, lang);
      refs.payoutAfterAmazonFee.textContent = formatCurrency(result.payoutAfterAmazonFee, lang);
      refs.netProfitPerOrder.textContent = formatCurrency(result.netProfitPerOrder, lang);
      refs.monthlyNetProfit.textContent = formatCurrency(result.monthlyNetProfit, lang);
      refs.breakEvenItemPrice.textContent = result.breakEvenItemPrice == null ? t.na : formatCurrency(result.breakEvenItemPrice, lang);
      refs.requiredItemPrice.textContent = result.requiredItemPriceForTargetMonthlyNet == null ? t.na : formatCurrency(result.requiredItemPriceForTargetMonthlyNet, lang);
      refs.effectiveReferralRatePct.textContent = formatNumber(result.effectiveReferralRatePct, lang, 2) + '%';
      refs.fixedMonthlyFees.textContent = formatCurrency(result.monthlyFixedFees, lang);
      refs.paybackOrders.textContent = result.paybackOrders == null ? t.na : formatNumber(result.paybackOrders, lang, 0);
      refs.detailOrderRevenue.textContent = formatCurrency(result.orderRevenue, lang);
      refs.detailReferralFee.textContent = formatCurrency(result.referralFee, lang);
      refs.detailPayoutAfterAmazonFee.textContent = formatCurrency(result.payoutAfterAmazonFee, lang);
      refs.detailSellerCostPerOrder.textContent = formatCurrency(result.sellerCostPerOrder, lang);
      refs.detailNetProfitPerOrder.textContent = formatCurrency(result.netProfitPerOrder, lang);
      refs.detailMonthlyOrders.textContent = formatNumber(result.inputs.monthlyOrders, lang, 0);
      refs.detailFixedMonthlyFees.textContent = formatCurrency(result.monthlyFixedFees, lang);
      refs.detailMonthlyNetProfit.textContent = formatCurrency(result.monthlyNetProfit, lang);
      refs.detailPaybackOrders.textContent = result.paybackOrders == null ? t.na : formatNumber(result.paybackOrders, lang, 0);
      refs.summary.value = result.summary;
    }

    writeDefaults();
    updateCopy();
    render();

    Object.keys(inputRefs).forEach(function (key) {
      inputRefs[key].addEventListener(key === 'includeFirstMonthProfessionalFee' ? 'change' : 'input', render);
    });

    refs.langBtn.addEventListener('click', function () {
      lang = lang === 'ko' ? 'en' : 'ko';
      updateCopy();
      render();
    });

    refs.resetBtn.addEventListener('click', function () {
      writeDefaults();
      render();
    });

    refs.copyBtn.addEventListener('click', async function () {
      const t = TEXT[lang] || TEXT.ko;
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.status.textContent = t.copied;
      } catch (error) {
        refs.status.textContent = t.copyFail;
      }
    });
  }

  const api = {
    DEFAULTS: DEFAULTS,
    REFERRAL_RATE: REFERRAL_RATE,
    MINIMUM_REFERRAL_FEE: MINIMUM_REFERRAL_FEE,
    FIRST_MONTH_PROFESSIONAL_FEE: FIRST_MONTH_PROFESSIONAL_FEE,
    normalize: normalize,
    validate: validate,
    calculate: calculate,
    buildSummary: buildSummary
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AmazonHandmadeFeeCalculator = api;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
      initCalculator();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
