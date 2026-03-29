(function (root) {
  const DEFAULTS = Object.freeze({
    retailPrice: 24.99,
    customerShippingCharge: 0,
    productCost: 10,
    printifyShippingCost: 4,
    storefrontFeePercent: 6.5,
    storefrontFixedFee: 0.2,
    otherSellerCosts: 0,
    planMode: 'free',
    premiumDiscountPct: 20,
    targetMarginPct: 40,
  });

  const PLAN_MODES = ['free', 'premium'];
  const PREMIUM_ANNUAL_MONTHLY_EQUIVALENT = 24.99;
  const PREMIUM_MONTHLY_PLAN_FEE = 39;

  const TEXT = {
    en: {
      invalidMoney: 'Money inputs must be 0 or above.',
      invalidPercent: 'Percent inputs must stay between 0 and 100.',
      invalidPlan: 'Plan mode must be free or premium.',
      invalidRetail: 'Retail price must be 0 or above.',
      invalidTargetMargin: 'Target margin must be between 0% and less than 100%.',
      solverBlocked: 'Storefront fee % plus target margin leaves no room to solve a valid retail price.',
      noSavings: 'Premium discount is 0%, so there is no Premium savings to break even.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      summaryTitle: '[Printify Profit Calculator Summary]',
      noSavingsLabel: 'No savings state',
      notApplicable: 'N/A'
    }
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

  function round6(value) {
    return round(value, 6);
  }

  function toFiniteNumber(value) {
    const normalized = typeof value === 'string' ? value.trim().replace(/,/g, '') : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeInput(rawInput) {
    const merged = Object.assign({}, DEFAULTS, rawInput || {});
    return {
      retailPrice: toFiniteNumber(merged.retailPrice),
      customerShippingCharge: toFiniteNumber(merged.customerShippingCharge),
      productCost: toFiniteNumber(merged.productCost),
      printifyShippingCost: toFiniteNumber(merged.printifyShippingCost),
      storefrontFeePercent: toFiniteNumber(merged.storefrontFeePercent),
      storefrontFixedFee: toFiniteNumber(merged.storefrontFixedFee),
      otherSellerCosts: toFiniteNumber(merged.otherSellerCosts),
      planMode: merged.planMode,
      premiumDiscountPct: toFiniteNumber(merged.premiumDiscountPct),
      targetMarginPct: toFiniteNumber(merged.targetMarginPct),
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    const moneyFields = [
      input.retailPrice,
      input.customerShippingCharge,
      input.productCost,
      input.printifyShippingCost,
      input.storefrontFixedFee,
      input.otherSellerCosts,
    ];

    if (moneyFields.some((value) => value == null || value < 0)) {
      return t.invalidMoney;
    }

    if (input.retailPrice == null || input.retailPrice < 0) {
      return t.invalidRetail;
    }

    const percentFields = [input.storefrontFeePercent, input.premiumDiscountPct];
    if (percentFields.some((value) => value == null || value < 0 || value > 100)) {
      return t.invalidPercent;
    }

    if (!PLAN_MODES.includes(input.planMode)) {
      return t.invalidPlan;
    }

    if (input.targetMarginPct == null || input.targetMarginPct < 0 || input.targetMarginPct >= 100) {
      return t.invalidTargetMargin;
    }

    return '';
  }

  function effectiveProductCost(productCost, planMode, premiumDiscountPct) {
    if (planMode === 'premium') {
      return productCost * (1 - premiumDiscountPct / 100);
    }
    return productCost;
  }

  function calculateScenario(rawInput, overrides) {
    const input = normalizeInput(Object.assign({}, rawInput || {}, overrides || {}));
    const gross = input.retailPrice + input.customerShippingCharge;
    const discountedProductCost = effectiveProductCost(input.productCost, input.planMode, input.premiumDiscountPct);
    const storefrontFee = gross * (input.storefrontFeePercent / 100) + input.storefrontFixedFee;
    const totalSellerCost = discountedProductCost + input.printifyShippingCost + storefrontFee + input.otherSellerCosts;
    const netProfit = gross - totalSellerCost;
    const marginPct = gross > 0 ? (netProfit / gross) * 100 : 0;

    return {
      planMode: input.planMode,
      gross: round6(gross),
      effectiveProductCost: round6(discountedProductCost),
      storefrontFee: round6(storefrontFee),
      totalSellerCost: round6(totalSellerCost),
      netProfit: round6(netProfit),
      marginPct: round6(marginPct),
      retailPrice: round6(input.retailPrice),
      customerShippingCharge: round6(input.customerShippingCharge),
      productCost: round6(input.productCost),
      printifyShippingCost: round6(input.printifyShippingCost),
      storefrontFeePercent: round6(input.storefrontFeePercent),
      storefrontFixedFee: round6(input.storefrontFixedFee),
      otherSellerCosts: round6(input.otherSellerCosts),
      premiumDiscountPct: round6(input.premiumDiscountPct),
    };
  }

  function calculateRequiredRetail(rawInput, overrides) {
    const input = normalizeInput(Object.assign({}, rawInput || {}, overrides || {}));
    const effectiveCost = effectiveProductCost(input.productCost, input.planMode, input.premiumDiscountPct);
    const baseCosts = effectiveCost + input.printifyShippingCost + input.storefrontFixedFee + input.otherSellerCosts;
    const denominator = 1 - (input.storefrontFeePercent / 100) - (input.targetMarginPct / 100);

    if (!(denominator > 0)) {
      return {
        blocked: true,
        error: (TEXT.en).solverBlocked,
        denominator: round6(denominator),
        baseCosts: round6(baseCosts),
        requiredGross: null,
        requiredRetailPrice: null,
      };
    }

    const requiredGross = baseCosts / denominator;
    const requiredRetailPrice = requiredGross - input.customerShippingCharge;

    return {
      blocked: false,
      error: '',
      denominator: round6(denominator),
      baseCosts: round6(baseCosts),
      requiredGross: round6(requiredGross),
      requiredRetailPrice: round6(requiredRetailPrice),
    };
  }

  function calculatePremiumBreakEven(rawInput) {
    const input = normalizeInput(rawInput);
    const freeProductCost = input.productCost;
    const premiumProductCost = effectiveProductCost(input.productCost, 'premium', input.premiumDiscountPct);
    const premiumUpliftPerOrder = freeProductCost - premiumProductCost;

    if (!(premiumUpliftPerOrder > 0)) {
      return {
        freeProductCost: round6(freeProductCost),
        premiumProductCost: round6(premiumProductCost),
        premiumUpliftPerOrder: round6(premiumUpliftPerOrder),
        annualBreakEvenOrders: null,
        monthlyBreakEvenOrders: null,
        noSavings: true,
        message: TEXT.en.noSavings,
      };
    }

    return {
      freeProductCost: round6(freeProductCost),
      premiumProductCost: round6(premiumProductCost),
      premiumUpliftPerOrder: round6(premiumUpliftPerOrder),
      annualBreakEvenOrders: Math.ceil(PREMIUM_ANNUAL_MONTHLY_EQUIVALENT / premiumUpliftPerOrder),
      monthlyBreakEvenOrders: Math.ceil(PREMIUM_MONTHLY_PLAN_FEE / premiumUpliftPerOrder),
      noSavings: false,
      message: '',
    };
  }

  function buildComparison(rawInput) {
    return {
      free: calculateScenario(rawInput, { planMode: 'free' }),
      premium: calculateScenario(rawInput, { planMode: 'premium' }),
    };
  }

  function formatMoney(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).notApplicable;
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value, lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    if (value == null || !Number.isFinite(value)) {
      return (TEXT[lang] || TEXT.en).notApplicable;
    }
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const selectedScenario = result.scenario;
    const requiredRetail = result.requiredRetail;
    const premium = result.premiumBreakEven;

    return [
      t.summaryTitle,
      `Selected plan: ${selectedScenario.planMode}`,
      `Gross customer revenue: ${formatMoney(selectedScenario.gross, lang)}`,
      `Effective product cost: ${formatMoney(selectedScenario.effectiveProductCost, lang)}`,
      `Storefront fees total: ${formatMoney(selectedScenario.storefrontFee, lang)}`,
      `Total seller cost: ${formatMoney(selectedScenario.totalSellerCost, lang)}`,
      `Net profit: ${formatMoney(selectedScenario.netProfit, lang)}`,
      `Profit margin: ${formatPercent(selectedScenario.marginPct, lang)}`,
      `Required retail price for ${round2(result.input.targetMarginPct).toFixed(0)}% margin: ${requiredRetail.blocked ? requiredRetail.error : formatMoney(requiredRetail.requiredRetailPrice, lang)}`,
      `Premium uplift per order vs Free: ${formatMoney(premium.premiumUpliftPerOrder, lang)}`,
      `Premium annual break-even orders ($24.99/mo equivalent): ${premium.annualBreakEvenOrders == null ? t.noSavingsLabel : premium.annualBreakEvenOrders}`,
      `Premium monthly break-even orders ($39/mo): ${premium.monthlyBreakEvenOrders == null ? t.noSavingsLabel : premium.monthlyBreakEvenOrders}`,
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const lang = (options && options.lang) || 'en';
    const input = normalizeInput(rawInput);
    const error = validate(input, lang);

    if (error) {
      return { result: null, error };
    }

    const scenario = calculateScenario(input);
    const requiredRetail = calculateRequiredRetail(input);
    const premiumBreakEven = calculatePremiumBreakEven(input);
    const comparison = buildComparison(input);

    const result = {
      input,
      scenario,
      requiredRetail,
      premiumBreakEven,
      comparison,
      premiumPlans: {
        annualMonthlyEquivalent: PREMIUM_ANNUAL_MONTHLY_EQUIVALENT,
        monthlyPlanFee: PREMIUM_MONTHLY_PLAN_FEE,
      },
    };

    result.summary = buildSummary(result, { lang });
    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    PLAN_MODES,
    PREMIUM_ANNUAL_MONTHLY_EQUIVALENT,
    PREMIUM_MONTHLY_PLAN_FEE,
    normalizeInput,
    validate,
    effectiveProductCost,
    calculateScenario,
    calculateRequiredRetail,
    calculatePremiumBreakEven,
    buildComparison,
    buildSummary,
    calculate,
    formatMoney,
    formatPercent,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.PrintifyProfitCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const refs = {
    retailPrice: document.getElementById('retailPrice'),
    customerShippingCharge: document.getElementById('customerShippingCharge'),
    productCost: document.getElementById('productCost'),
    printifyShippingCost: document.getElementById('printifyShippingCost'),
    storefrontFeePercent: document.getElementById('storefrontFeePercent'),
    storefrontFixedFee: document.getElementById('storefrontFixedFee'),
    otherSellerCosts: document.getElementById('otherSellerCosts'),
    planMode: document.getElementById('planMode'),
    premiumDiscountPct: document.getElementById('premiumDiscountPct'),
    targetMarginPct: document.getElementById('targetMarginPct'),
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    selectedPlanLabel: document.getElementById('selectedPlanLabel'),
    netProfit: document.getElementById('netProfit'),
    marginPct: document.getElementById('marginPct'),
    requiredRetailPrice: document.getElementById('requiredRetailPrice'),
    premiumUpliftPerOrder: document.getElementById('premiumUpliftPerOrder'),
    grossRevenue: document.getElementById('grossRevenue'),
    effectiveProductCostOut: document.getElementById('effectiveProductCostOut'),
    storefrontFeeOut: document.getElementById('storefrontFeeOut'),
    totalSellerCostOut: document.getElementById('totalSellerCostOut'),
    solverState: document.getElementById('solverState'),
    annualBreakEvenOrders: document.getElementById('annualBreakEvenOrders'),
    monthlyBreakEvenOrders: document.getElementById('monthlyBreakEvenOrders'),
    premiumBreakEvenNote: document.getElementById('premiumBreakEvenNote'),
    freeNetProfit: document.getElementById('freeNetProfit'),
    freeMarginPct: document.getElementById('freeMarginPct'),
    premiumNetProfit: document.getElementById('premiumNetProfit'),
    premiumMarginPct: document.getElementById('premiumMarginPct'),
  };

  function hasUi() {
    return refs.retailPrice && refs.summary && refs.copyBtn && refs.resetBtn;
  }

  function collectInput() {
    return {
      retailPrice: refs.retailPrice.value,
      customerShippingCharge: refs.customerShippingCharge.value,
      productCost: refs.productCost.value,
      printifyShippingCost: refs.printifyShippingCost.value,
      storefrontFeePercent: refs.storefrontFeePercent.value,
      storefrontFixedFee: refs.storefrontFixedFee.value,
      otherSellerCosts: refs.otherSellerCosts.value,
      planMode: refs.planMode.value,
      premiumDiscountPct: refs.premiumDiscountPct.value,
      targetMarginPct: refs.targetMarginPct.value,
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (refs[key]) {
        refs[key].value = value;
      }
    });
  }

  function setError(message) {
    refs.error.textContent = message;
    refs.error.classList.toggle('show', Boolean(message));
  }

  function setStatus(result) {
    if (!result) {
      refs.status.textContent = 'Enter valid inputs to estimate per-sale profit, 40% target pricing, and Premium break-even.';
      refs.status.className = 'status';
      return;
    }

    if (result.scenario.netProfit >= 0) {
      refs.status.textContent = `Selected ${result.scenario.planMode} scenario keeps ${formatMoney(result.scenario.netProfit, 'en')} per sale.`;
      refs.status.className = 'status good';
      return;
    }

    refs.status.textContent = `Selected ${result.scenario.planMode} scenario is losing ${formatMoney(Math.abs(result.scenario.netProfit), 'en')} per sale.`;
    refs.status.className = 'status warn';
  }

  function clearRenderedState() {
    [
      refs.netProfit,
      refs.marginPct,
      refs.requiredRetailPrice,
      refs.premiumUpliftPerOrder,
      refs.grossRevenue,
      refs.effectiveProductCostOut,
      refs.storefrontFeeOut,
      refs.totalSellerCostOut,
      refs.solverState,
      refs.annualBreakEvenOrders,
      refs.monthlyBreakEvenOrders,
      refs.premiumBreakEvenNote,
      refs.freeNetProfit,
      refs.freeMarginPct,
      refs.premiumNetProfit,
      refs.premiumMarginPct,
    ].forEach((node) => {
      node.textContent = '—';
    });

    refs.selectedPlanLabel.textContent = 'Selected plan';
    refs.summary.value = '';
    refs.copyBtn.disabled = true;
  }

  function render() {
    const { result, error } = calculate(collectInput(), { lang: 'en' });
    setError(error);

    if (error || !result) {
      clearRenderedState();
      setStatus(null);
      return;
    }

    refs.copyBtn.disabled = false;
    refs.selectedPlanLabel.textContent = result.scenario.planMode === 'premium' ? 'Premium selected' : 'Free selected';
    refs.netProfit.textContent = formatMoney(result.scenario.netProfit, 'en');
    refs.marginPct.textContent = formatPercent(result.scenario.marginPct, 'en');
    refs.grossRevenue.textContent = formatMoney(result.scenario.gross, 'en');
    refs.effectiveProductCostOut.textContent = formatMoney(result.scenario.effectiveProductCost, 'en');
    refs.storefrontFeeOut.textContent = formatMoney(result.scenario.storefrontFee, 'en');
    refs.totalSellerCostOut.textContent = formatMoney(result.scenario.totalSellerCost, 'en');
    refs.premiumUpliftPerOrder.textContent = formatMoney(result.premiumBreakEven.premiumUpliftPerOrder, 'en');

    if (result.requiredRetail.blocked) {
      refs.requiredRetailPrice.textContent = 'Blocked';
      refs.solverState.textContent = result.requiredRetail.error;
    } else {
      refs.requiredRetailPrice.textContent = formatMoney(result.requiredRetail.requiredRetailPrice, 'en');
      refs.solverState.textContent = `Target: ${round2(result.input.targetMarginPct).toFixed(0)}% margin.`;
    }

    if (result.premiumBreakEven.noSavings) {
      refs.annualBreakEvenOrders.textContent = 'No savings';
      refs.monthlyBreakEvenOrders.textContent = 'No savings';
      refs.premiumBreakEvenNote.textContent = result.premiumBreakEven.message;
    } else {
      refs.annualBreakEvenOrders.textContent = String(result.premiumBreakEven.annualBreakEvenOrders);
      refs.monthlyBreakEvenOrders.textContent = String(result.premiumBreakEven.monthlyBreakEvenOrders);
      refs.premiumBreakEvenNote.textContent = `Based on ${formatMoney(result.premiumBreakEven.premiumUpliftPerOrder, 'en')} saved per order on product cost alone.`;
    }

    refs.freeNetProfit.textContent = formatMoney(result.comparison.free.netProfit, 'en');
    refs.freeMarginPct.textContent = formatPercent(result.comparison.free.marginPct, 'en');
    refs.premiumNetProfit.textContent = formatMoney(result.comparison.premium.netProfit, 'en');
    refs.premiumMarginPct.textContent = formatPercent(result.comparison.premium.marginPct, 'en');
    refs.summary.value = result.summary;
    setStatus(result);
  }

  async function copySummary() {
    if (!refs.summary.value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(refs.summary.value);
      refs.status.textContent = TEXT.en.copied;
      refs.status.className = 'status good';
    } catch (error) {
      refs.status.textContent = TEXT.en.copyFail;
      refs.status.className = 'status warn';
    }
  }

  if (!hasUi()) {
    return;
  }

  applyDefaults();
  render();

  [
    refs.retailPrice,
    refs.customerShippingCharge,
    refs.productCost,
    refs.printifyShippingCost,
    refs.storefrontFeePercent,
    refs.storefrontFixedFee,
    refs.otherSellerCosts,
    refs.planMode,
    refs.premiumDiscountPct,
    refs.targetMarginPct,
  ].forEach((element) => {
    const eventName = element.tagName === 'SELECT' ? 'change' : 'input';
    element.addEventListener(eventName, render);
  });

  refs.copyBtn.addEventListener('click', copySummary);
  refs.resetBtn.addEventListener('click', function () {
    applyDefaults();
    render();
  });
}(typeof globalThis !== 'undefined' ? globalThis : this));
