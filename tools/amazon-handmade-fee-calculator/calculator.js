(function (root) {
  const DEFAULTS = {
    productPrice: 35,
    shippingChargedToBuyer: 6,
    giftWrapChargedToBuyer: 0,
    materialCost: 10,
    packagingCost: 2,
    shippingCost: 5,
    adCostPerOrder: 3,
    monthlyOrders: 40,
    includeFirstMonthProfessionalFee: false,
    firstMonthProfessionalFee: 39.99,
    otherMonthlyCost: 80,
    targetMonthlyNet: 1000,
    currency: 'USD'
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      productPrice: 'Product price must be greater than 0.',
      money: 'Money inputs must be 0 or greater.',
      monthlyOrders: 'Monthly orders must be a whole number of at least 1.',
      targetMonthlyNet: 'Target monthly net must be 0 or greater.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy the summary manually.',
      statusGood: 'This Handmade setup stays profitable under the current assumptions.',
      statusWarn: 'This Handmade setup is underwater under the current assumptions.',
      na: 'N/A',
      summaryTitle: '[Amazon Handmade Fee Calculator Summary]'
    },
    ko: {
      invalid: '입력값을 다시 확인해주세요.',
      productPrice: '상품가는 0보다 커야 합니다.',
      money: '금액 입력값은 모두 0 이상이어야 합니다.',
      monthlyOrders: '월 주문 수는 1 이상의 정수여야 합니다.',
      targetMonthlyNet: '목표 월 순이익은 0 이상이어야 합니다.',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없어 수동 복사가 필요합니다.',
      statusGood: '현재 가정에서 수익성이 유지됩니다.',
      statusWarn: '현재 가정에서는 적자입니다.',
      na: '해당 없음',
      summaryTitle: '[Amazon Handmade 수수료 계산기 요약]'
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toBoolean(value) {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
  }

  function normalizeInput(input) {
    return {
      productPrice: Number(input.productPrice),
      shippingChargedToBuyer: Number(input.shippingChargedToBuyer),
      giftWrapChargedToBuyer: Number(input.giftWrapChargedToBuyer),
      materialCost: Number(input.materialCost),
      packagingCost: Number(input.packagingCost),
      shippingCost: Number(input.shippingCost),
      adCostPerOrder: Number(input.adCostPerOrder),
      monthlyOrders: Number(input.monthlyOrders),
      includeFirstMonthProfessionalFee: toBoolean(input.includeFirstMonthProfessionalFee),
      firstMonthProfessionalFee: Number(input.firstMonthProfessionalFee),
      otherMonthlyCost: Number(input.otherMonthlyCost),
      targetMonthlyNet: Number(input.targetMonthlyNet),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!Number.isFinite(input.productPrice) || input.productPrice <= 0) return t.productPrice;
    for (const key of ['shippingChargedToBuyer', 'giftWrapChargedToBuyer', 'materialCost', 'packagingCost', 'shippingCost', 'adCostPerOrder', 'firstMonthProfessionalFee', 'otherMonthlyCost']) {
      if (!Number.isFinite(input[key]) || input[key] < 0) return t.money;
    }
    if (!Number.isFinite(input.monthlyOrders) || input.monthlyOrders < 1 || !Number.isInteger(input.monthlyOrders)) return t.monthlyOrders;
    if (!Number.isFinite(input.targetMonthlyNet) || input.targetMonthlyNet < 0) return t.targetMonthlyNet;
    return '';
  }

  function computeOrderMetrics(input) {
    const buyerChargeBasis = input.productPrice + input.shippingChargedToBuyer + input.giftWrapChargedToBuyer;
    const referralFeePerOrder = Math.max(buyerChargeBasis * 0.15, 0.30);
    const effectiveReferralRatePct = buyerChargeBasis > 0 ? (referralFeePerOrder / buyerChargeBasis) * 100 : 0;
    const variableCostPerOrder = input.materialCost + input.packagingCost + input.shippingCost + input.adCostPerOrder;
    const netProfitPerOrder = buyerChargeBasis - referralFeePerOrder - variableCostPerOrder;

    return {
      buyerChargeBasis: round2(buyerChargeBasis),
      referralFeePerOrder: round2(referralFeePerOrder),
      effectiveReferralRatePct: round2(effectiveReferralRatePct),
      variableCostPerOrder: round2(variableCostPerOrder),
      netProfitPerOrder: round2(netProfitPerOrder)
    };
  }

  function getMonthlyFixedCosts(input) {
    return round2(input.otherMonthlyCost + (input.includeFirstMonthProfessionalFee ? input.firstMonthProfessionalFee : 0));
  }

  function computeMonthlyNetProfit(input) {
    const perOrder = computeOrderMetrics(input);
    const monthlyFixedCosts = getMonthlyFixedCosts(input);
    return round2(perOrder.netProfitPerOrder * input.monthlyOrders - monthlyFixedCosts);
  }

  function solveProductPrice(input, targetMonthlyNet) {
    if (!Number.isFinite(targetMonthlyNet) || targetMonthlyNet < 0 || input.monthlyOrders < 1) {
      return null;
    }

    const monthlyAt = (productPrice) => computeMonthlyNetProfit({ ...input, productPrice });

    if (monthlyAt(0.01) >= targetMonthlyNet) {
      return 0.01;
    }

    let low = 0.01;
    let high = Math.max(input.productPrice, 1);
    while (monthlyAt(high) < targetMonthlyNet && high < 1000000) {
      high *= 2;
    }

    if (monthlyAt(high) < targetMonthlyNet) {
      return null;
    }

    for (let i = 0; i < 80; i += 1) {
      const mid = (low + high) / 2;
      if (monthlyAt(mid) >= targetMonthlyNet) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const currency = result.inputs.currency;
    const na = t.na;

    return [
      t.summaryTitle,
      `Product price: ${formatMoney(result.inputs.productPrice, lang, currency)}`,
      `Shipping charged to buyer: ${formatMoney(result.inputs.shippingChargedToBuyer, lang, currency)}`,
      `Gift-wrap charged to buyer: ${formatMoney(result.inputs.giftWrapChargedToBuyer, lang, currency)}`,
      `Buyer charge basis: ${formatMoney(result.buyerChargeBasis, lang, currency)}`,
      `Referral fee per order: ${formatMoney(result.referralFeePerOrder, lang, currency)}`,
      `Effective referral rate: ${formatPercent(result.effectiveReferralRatePct, lang)}`,
      `Variable cost per order: ${formatMoney(result.variableCostPerOrder, lang, currency)}`,
      `Net profit per order: ${formatMoney(result.netProfitPerOrder, lang, currency)}`,
      `Monthly fixed costs: ${formatMoney(result.monthlyFixedCosts, lang, currency)}`,
      `Monthly net profit: ${formatMoney(result.monthlyNetProfit, lang, currency)}`,
      `Required monthly orders for target net: ${result.requiredMonthlyOrders == null ? na : result.requiredMonthlyOrders}`,
      `Break-even product price: ${result.breakEvenProductPrice == null ? na : formatMoney(result.breakEvenProductPrice, lang, currency)}`,
      `Target product price: ${result.targetProductPrice == null ? na : formatMoney(result.targetProductPrice, lang, currency)}`,
      'Official rule modeled: Amazon Handmade referral fee = 15% of buyer charge basis or $0.30 minimum, whichever is greater.',
      'Buyer charge basis modeled here = product price + shipping charged to buyer + gift-wrap charged to buyer.',
      'Taxes collected by Amazon are excluded from this model. Returns and refunds are outside this v1 slice.'
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error };
    }

    const perOrder = computeOrderMetrics(normalized);
    const monthlyFixedCosts = getMonthlyFixedCosts(normalized);
    const monthlyNetProfit = round2(perOrder.netProfitPerOrder * normalized.monthlyOrders - monthlyFixedCosts);
    const requiredMonthlyOrders = perOrder.netProfitPerOrder > 0
      ? Math.ceil((normalized.targetMonthlyNet + monthlyFixedCosts) / perOrder.netProfitPerOrder)
      : null;

    const result = {
      inputs: normalized,
      ...perOrder,
      monthlyFixedCosts,
      monthlyNetProfit,
      requiredMonthlyOrders,
      breakEvenProductPrice: solveProductPrice(normalized, 0),
      targetProductPrice: solveProductPrice(normalized, normalized.targetMonthlyNet)
    };

    result.summary = buildSummary(result, lang);
    return { result, error: '' };
  }

  function formatMoney(value, lang, currency) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
  }

  const api = {
    DEFAULTS,
    normalizeInput,
    validate,
    computeOrderMetrics,
    getMonthlyFixedCosts,
    computeMonthlyNetProfit,
    solveProductPrice,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.AmazonHandmadeFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const fieldIds = [
    'productPrice',
    'shippingChargedToBuyer',
    'giftWrapChargedToBuyer',
    'materialCost',
    'packagingCost',
    'shippingCost',
    'adCostPerOrder',
    'monthlyOrders',
    'firstMonthProfessionalFee',
    'otherMonthlyCost',
    'targetMonthlyNet'
  ];

  const outputIds = [
    'buyerChargeBasis',
    'referralFeePerOrder',
    'effectiveReferralRatePct',
    'variableCostPerOrder',
    'netProfitPerOrder',
    'monthlyFixedCosts',
    'monthlyNetProfit',
    'requiredMonthlyOrders',
    'breakEvenProductPrice',
    'targetProductPrice'
  ];

  const els = {
    form: document.getElementById('calculatorForm'),
    includeFirstMonthProfessionalFee: document.getElementById('includeFirstMonthProfessionalFee'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  fieldIds.forEach((id) => {
    els[id] = document.getElementById(id);
  });
  outputIds.forEach((id) => {
    els[id] = document.getElementById(id);
  });

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (key === 'includeFirstMonthProfessionalFee') {
        els.includeFirstMonthProfessionalFee.checked = Boolean(value);
      } else if (els[key]) {
        els[key].value = value;
      }
    });
  }

  function collectInput() {
    return {
      productPrice: els.productPrice.value,
      shippingChargedToBuyer: els.shippingChargedToBuyer.value,
      giftWrapChargedToBuyer: els.giftWrapChargedToBuyer.value,
      materialCost: els.materialCost.value,
      packagingCost: els.packagingCost.value,
      shippingCost: els.shippingCost.value,
      adCostPerOrder: els.adCostPerOrder.value,
      monthlyOrders: els.monthlyOrders.value,
      includeFirstMonthProfessionalFee: els.includeFirstMonthProfessionalFee.checked,
      firstMonthProfessionalFee: els.firstMonthProfessionalFee.value,
      otherMonthlyCost: els.otherMonthlyCost.value,
      targetMonthlyNet: els.targetMonthlyNet.value,
      currency: 'USD'
    };
  }

  function renderValue(id, value, type, currency) {
    const lang = 'en';
    if (value == null) {
      els[id].textContent = TEXT.en.na;
      return;
    }
    if (type === 'money') {
      els[id].textContent = formatMoney(value, lang, currency);
      return;
    }
    if (type === 'percent') {
      els[id].textContent = formatPercent(value, lang);
      return;
    }
    els[id].textContent = String(value);
  }

  function render() {
    const { result, error } = calculate(collectInput(), { lang: 'en' });

    if (error) {
      els.error.textContent = error || TEXT.en.invalid;
      els.error.hidden = false;
      els.status.textContent = TEXT.en.invalid;
      outputIds.forEach((id) => {
        els[id].textContent = '—';
      });
      els.summary.value = '';
      return;
    }

    els.error.hidden = true;
    els.status.textContent = result.monthlyNetProfit >= 0 ? TEXT.en.statusGood : TEXT.en.statusWarn;

    renderValue('buyerChargeBasis', result.buyerChargeBasis, 'money', result.inputs.currency);
    renderValue('referralFeePerOrder', result.referralFeePerOrder, 'money', result.inputs.currency);
    renderValue('effectiveReferralRatePct', result.effectiveReferralRatePct, 'percent', result.inputs.currency);
    renderValue('variableCostPerOrder', result.variableCostPerOrder, 'money', result.inputs.currency);
    renderValue('netProfitPerOrder', result.netProfitPerOrder, 'money', result.inputs.currency);
    renderValue('monthlyFixedCosts', result.monthlyFixedCosts, 'money', result.inputs.currency);
    renderValue('monthlyNetProfit', result.monthlyNetProfit, 'money', result.inputs.currency);
    renderValue('requiredMonthlyOrders', result.requiredMonthlyOrders, 'text', result.inputs.currency);
    renderValue('breakEvenProductPrice', result.breakEvenProductPrice, 'money', result.inputs.currency);
    renderValue('targetProductPrice', result.targetProductPrice, 'money', result.inputs.currency);

    els.summary.value = result.summary;
  }

  function bindEvents() {
    fieldIds.forEach((id) => {
      els[id].addEventListener('input', render);
    });
    els.includeFirstMonthProfessionalFee.addEventListener('change', render);

    els.copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(els.summary.value);
        els.status.textContent = TEXT.en.copied;
      } catch (error) {
        els.status.textContent = TEXT.en.copyFail;
      }
    });

    els.resetBtn.addEventListener('click', () => {
      applyDefaults();
      render();
    });
  }

  applyDefaults();
  bindEvents();
  render();
}(typeof window !== 'undefined' ? window : globalThis));
