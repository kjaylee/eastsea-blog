(function (root) {
  const LISTING_FEE_PER_UNIT = 0.2;
  const TRANSACTION_FEE_RATE = 0.065;
  const OFFSITE_ADS_CAP = 100;
  const ROOT_SEARCH_MAX_PRICE = 100000;
  const ROOT_SEARCH_STEPS = 240;
  const ROOT_SEARCH_ITERATIONS = 48;

  const presets = [
    { id: "us", rate: 3, flat: 0.25, label: { ko: "미국 (US)", en: "US" } },
    { id: "uk", rate: 4, flat: 0.2, label: { ko: "영국 (UK)", en: "UK" } },
    { id: "ca-domestic", rate: 3, flat: 0.25, label: { ko: "캐나다 국내/미국", en: "Canada domestic / US" } },
    { id: "ca-international", rate: 4, flat: 0.25, label: { ko: "캐나다 해외", en: "Canada international" } },
    { id: "au-domestic", rate: 3, flat: 0.25, label: { ko: "호주 국내", en: "Australia domestic" } },
    { id: "au-international", rate: 4, flat: 0.25, label: { ko: "호주 해외", en: "Australia international" } },
    { id: "eu-generic", rate: 4, flat: 0.3, label: { ko: "EU 일반", en: "EU generic" } },
    { id: "kr", rate: 6.5, flat: 0.3, label: { ko: "대한민국", en: "South Korea" } },
    { id: "jp", rate: 6.0, flat: 0.3, label: { ko: "일본", en: "Japan" } },
    { id: "custom", rate: 3, flat: 0.25, label: { ko: "사용자 지정", en: "Custom" } }
  ];

  const presetMap = Object.fromEntries(presets.map((preset) => [preset.id, preset]));

  const TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      quantity: "수량은 1 이상의 정수여야 합니다.",
      money: "금액 입력값은 모두 0 이상이어야 합니다.",
      rate: "처리 수수료율과 오프사이트 광고율은 0~100 범위여야 합니다.",
      revenue: "세전 매출(item + shipping + extras)이 0보다 커야 계산할 수 있습니다.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      waiting: "결과 계산 대기",
      statusGood: "현재 가정에서는 주문당 순이익이 플러스입니다.",
      statusWarn: "현재 가정에서는 주문당 순이익이 마이너스입니다.",
      summaryTitle: "[Etsy 수수료·순이익 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      quantity: "Quantity must be an integer greater than or equal to 1.",
      money: "All money fields must be zero or above.",
      rate: "Processing and offsite ad rates must be between 0 and 100.",
      revenue: "Revenue excluding tax (item + shipping + extras) must be greater than zero.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      waiting: "Waiting for calculation",
      statusGood: "Net profit per order is positive under these assumptions.",
      statusWarn: "Net profit per order is negative under these assumptions.",
      summaryTitle: "[Etsy Fee Profit Summary]",
      na: "N/A"
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function normalizeInput(input) {
    return {
      presetId: input.presetId || "custom",
      unitPrice: Number(input.unitPrice),
      quantity: Number(input.quantity),
      shippingCharged: Number(input.shippingCharged),
      buyerExtras: Number(input.buyerExtras),
      taxCollected: Number(input.taxCollected),
      unitCogs: Number(input.unitCogs),
      packagingCost: Number(input.packagingCost),
      sellerPostageCost: Number(input.sellerPostageCost),
      etsyAdsSpend: Number(input.etsyAdsSpend),
      processingRate: Number(input.processingRate),
      processingFlat: Number(input.processingFlat),
      offsiteRate: Number(input.offsiteRate),
      includeTaxesInOffsiteFee: Boolean(input.includeTaxesInOffsiteFee),
      includeListingFee: input.includeListingFee !== false
    };
  }

  function validate(normalized, lang) {
    const t = TEXT[lang] || TEXT.ko;
    const moneyFields = [
      normalized.unitPrice,
      normalized.shippingCharged,
      normalized.buyerExtras,
      normalized.taxCollected,
      normalized.unitCogs,
      normalized.packagingCost,
      normalized.sellerPostageCost,
      normalized.etsyAdsSpend,
      normalized.processingFlat
    ];

    if (!Number.isInteger(normalized.quantity) || normalized.quantity < 1) {
      return t.quantity;
    }

    if (
      moneyFields.some((value) => !Number.isFinite(value) || value < 0) ||
      !Number.isFinite(normalized.processingRate) ||
      !Number.isFinite(normalized.offsiteRate)
    ) {
      return t.money;
    }

    if (
      normalized.processingRate < 0 || normalized.processingRate > 100 ||
      normalized.offsiteRate < 0 || normalized.offsiteRate > 100
    ) {
      return t.rate;
    }

    const revenueExTax = (normalized.unitPrice * normalized.quantity) + normalized.shippingCharged + normalized.buyerExtras;
    if (!Number.isFinite(revenueExTax) || revenueExTax <= 0) {
      return t.revenue;
    }

    return "";
  }

  function evaluateAtUnitPrice(input, unitPriceOverride) {
    const unitPrice = unitPriceOverride == null ? input.unitPrice : unitPriceOverride;
    const revenueExTax = (unitPrice * input.quantity) + input.shippingCharged + input.buyerExtras;
    const paymentBase = revenueExTax + input.taxCollected;
    const listingFee = input.includeListingFee ? LISTING_FEE_PER_UNIT * input.quantity : 0;
    const transactionFee = TRANSACTION_FEE_RATE * revenueExTax;
    const processingFee = (input.processingRate / 100) * paymentBase + input.processingFlat;
    const offsiteBase = input.includeTaxesInOffsiteFee ? paymentBase : revenueExTax;
    const offsiteAdsFee = Math.min((input.offsiteRate / 100) * offsiteBase, OFFSITE_ADS_CAP);
    const etsyFeeTotal = listingFee + transactionFee + processingFee + offsiteAdsFee;
    const sellerCostTotal = (input.unitCogs * input.quantity) + input.packagingCost + input.sellerPostageCost + input.etsyAdsSpend;
    const totalCost = etsyFeeTotal + sellerCostTotal;
    const payoutAfterEtsyFees = revenueExTax - etsyFeeTotal;
    const netProfit = revenueExTax - totalCost;
    const netMargin = revenueExTax > 0 ? netProfit / revenueExTax : 0;
    const effectiveEtsyFeeRate = revenueExTax > 0 ? etsyFeeTotal / revenueExTax : 0;

    return {
      unitPrice,
      revenueExTax,
      paymentBase,
      listingFee,
      transactionFee,
      processingFee,
      offsiteBase,
      offsiteAdsFee,
      etsyFeeTotal,
      sellerCostTotal,
      totalCost,
      payoutAfterEtsyFees,
      netProfit,
      netMargin,
      effectiveEtsyFeeRate
    };
  }

  function binarySearchRoot(input, low, high) {
    let lo = low;
    let hi = high;

    for (let i = 0; i < ROOT_SEARCH_ITERATIONS; i += 1) {
      const mid = (lo + hi) / 2;
      const profit = evaluateAtUnitPrice(input, mid).netProfit;
      if (profit >= 0) {
        hi = mid;
      } else {
        lo = mid;
      }
    }

    return hi;
  }

  function findBreakEvenUnitPrice(input) {
    const current = evaluateAtUnitPrice(input, input.unitPrice);

    if (Math.abs(current.netProfit) <= 0.000001) {
      return input.unitPrice;
    }

    if (current.netProfit > 0) {
      const zeroProfit = evaluateAtUnitPrice(input, 0).netProfit;
      if (zeroProfit >= 0) {
        return 0;
      }

      let previousPrice = input.unitPrice;
      for (let step = 1; step <= ROOT_SEARCH_STEPS; step += 1) {
        const price = input.unitPrice * (1 - step / ROOT_SEARCH_STEPS);
        const profit = evaluateAtUnitPrice(input, price).netProfit;
        if (profit <= 0) {
          return binarySearchRoot(input, price, previousPrice);
        }
        previousPrice = price;
      }
      return 0;
    }

    let low = Math.max(input.unitPrice, 0);
    let high = Math.max(1, low || 1);
    let highProfit = evaluateAtUnitPrice(input, high).netProfit;

    while (high < ROOT_SEARCH_MAX_PRICE && highProfit < 0) {
      low = high;
      high = Math.min(ROOT_SEARCH_MAX_PRICE, high * 2);
      highProfit = evaluateAtUnitPrice(input, high).netProfit;
    }

    if (highProfit < 0) {
      return null;
    }

    return binarySearchRoot(input, low, high);
  }

  function buildSummary(result, options) {
    const lang = (options && options.lang) || "ko";
    const locale = lang === "en" ? "en-US" : "ko-KR";
    const t = TEXT[lang] || TEXT.ko;
    const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pct = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const na = t.na;

    return [
      t.summaryTitle,
      `${lang === "en" ? "Unit price" : "판매가"}: ${nf.format(result.inputs.unitPrice)} × ${result.inputs.quantity}`,
      `${lang === "en" ? "Revenue ex tax" : "세전 매출"}: ${nf.format(result.revenueExTax)}`,
      `${lang === "en" ? "Etsy fee total" : "Etsy 수수료 합계"}: ${nf.format(result.etsyFeeTotal)}`,
      `${lang === "en" ? "Payout after Etsy fees" : "Etsy 수수료 차감 후 수령액"}: ${nf.format(result.payoutAfterEtsyFees)}`,
      `${lang === "en" ? "Net profit" : "순이익"}: ${nf.format(result.netProfit)}`,
      `${lang === "en" ? "Net margin" : "순이익률"}: ${pct.format(result.netMarginPct)}%`,
      `${lang === "en" ? "Break-even unit price" : "손익분기 판매가"}: ${result.breakEvenUnitPrice == null ? na : nf.format(result.breakEvenUnitPrice)}`,
      `${lang === "en" ? "Max discount before loss" : "적자 전 최대 할인율"}: ${result.maxDiscountPct == null ? na : `${pct.format(result.maxDiscountPct)}%`}`
    ].join("\n");
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || "ko";
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);

    if (error) {
      return { result: null, error };
    }

    const evaluated = evaluateAtUnitPrice(normalized, normalized.unitPrice);
    const breakEvenUnitPrice = findBreakEvenUnitPrice(normalized);
    const maxDiscountPct = normalized.unitPrice > 0
      ? (evaluated.netProfit >= 0
        ? (breakEvenUnitPrice == null ? null : Math.max(0, Math.min(100, ((normalized.unitPrice - breakEvenUnitPrice) / normalized.unitPrice) * 100)))
        : 0)
      : 0;

    const result = {
      inputs: normalized,
      revenueExTax: round2(evaluated.revenueExTax),
      paymentBase: round2(evaluated.paymentBase),
      listingFee: round2(evaluated.listingFee),
      transactionFee: round2(evaluated.transactionFee),
      processingFee: round2(evaluated.processingFee),
      offsiteBase: round2(evaluated.offsiteBase),
      offsiteAdsFee: round2(evaluated.offsiteAdsFee),
      etsyFeeTotal: round2(evaluated.etsyFeeTotal),
      sellerCostTotal: round2(evaluated.sellerCostTotal),
      totalCost: round2(evaluated.totalCost),
      payoutAfterEtsyFees: round2(evaluated.payoutAfterEtsyFees),
      netProfit: round2(evaluated.netProfit),
      netMargin: round4(evaluated.netMargin),
      netMarginPct: round2(evaluated.netMargin * 100),
      effectiveEtsyFeeRate: round4(evaluated.effectiveEtsyFeeRate),
      effectiveEtsyFeeRatePct: round2(evaluated.effectiveEtsyFeeRate * 100),
      breakEvenUnitPrice: breakEvenUnitPrice == null ? null : round2(breakEvenUnitPrice),
      maxDiscountPct: maxDiscountPct == null ? null : round2(maxDiscountPct)
    };

    result.summary = buildSummary(result, { lang });

    return { result, error: "" };
  }

  const api = {
    presets,
    presetMap,
    calculate,
    buildSummary,
    normalizeInput,
    validate,
    evaluateAtUnitPrice,
    findBreakEvenUnitPrice
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.EtsyFeeProfitCalculator = api;

  if (typeof document === "undefined") {
    return;
  }

  const I18N = {
    ko: {
      title: "🛍️ Etsy 수수료·순이익 계산기",
      subtitle: "리스팅 수수료, 6.5% 거래 수수료, 결제 처리 수수료, 오프사이트 광고, 원가/포장/배송비를 함께 반영해 주문당 실제 순이익을 계산합니다.",
      back: "← Tools",
      inputHeader: "입력값",
      kpiHeader: "핵심 KPI",
      detailHeader: "세부 지표",
      aboutHeader: "가정 및 해설",
      copy: "요약 복사",
      reset: "기본값 복원",
      presetNote: "Preset fees are based on Etsy help documentation; use manual override if your actual shop currency/flat fee differs.",
      assumptionNote: "리스팅 수수료는 옵션을 켠 경우 0.20 × 수량으로 반영합니다. 거래 수수료는 상품가 + 구매자 배송비 + 부가옵션, 결제 처리 수수료는 세금 포함 결제금액, 오프사이트 광고는 12%/15% 또는 사용자 지정 + 주문당 최대 100 한도로 계산합니다.",
      aboutCopy: "Etsy 리스팅 수수료는 기본적으로 리스팅당 $0.20입니다. 거래 수수료 6.5%는 상품가, 구매자에게 청구한 배송비, gift wrap/customization 같은 buyer extras에 적용됩니다. 결제 처리 수수료는 국가별 퍼센트·고정 수수료가 다르며, Offsite Ads는 보통 12% 또는 15%이고 주문당 최대 $100으로 제한됩니다. 실제 정산 통화/flat fee가 다르면 manual override 값을 사용하세요.",
      l_unitPrice: "Unit sale price (same currency)",
      l_quantity: "Quantity sold",
      l_shippingCharged: "Shipping charged to buyer",
      l_buyerExtras: "Buyer extras (gift wrap/customization)",
      l_taxCollected: "Tax collected",
      l_unitCogs: "Unit COGS",
      l_packagingCost: "Packaging cost / order",
      l_sellerPostageCost: "Seller postage cost / order",
      l_etsyAdsSpend: "Etsy Ads spend / order",
      l_paymentPreset: "Payment preset",
      l_processingRate: "Manual processing %",
      l_processingFlat: "Manual flat fee",
      l_offsiteMode: "Offsite Ads rate",
      l_offsiteCustomRate: "Custom Offsite Ads %",
      l_includeTaxesInOffsiteFee: "Include taxes in offsite fee base",
      l_includeListingFee: "Include listing fee in per-order profit",
      k_etsyFeeTotal: "Etsy fee total",
      k_payoutAfterEtsyFees: "Payout after Etsy fees",
      k_netProfit: "Net profit",
      k_netMargin: "Net margin",
      k_breakEvenUnitPrice: "Break-even unit price",
      k_maxDiscountBeforeLoss: "Max discount before loss",
      d_listingFee: "Listing fee",
      d_transactionFee: "Transaction fee",
      d_processingFee: "Payment processing fee",
      d_offsiteAdsFee: "Offsite Ads fee",
      d_sellerCostTotal: "Seller cost total",
      d_totalCost: "Total cost",
      d_effectiveEtsyFeeRate: "Effective Etsy fee rate",
      d_revenueExTax: "Revenue excluding tax",
      offsiteNone: "0% (none)",
      offsite12: "12%",
      offsite15: "15%",
      offsiteCustom: "Custom",
      copied: TEXT.ko.copied,
      copyFail: TEXT.ko.copyFail,
      waiting: TEXT.ko.waiting,
      statusGood: TEXT.ko.statusGood,
      statusWarn: TEXT.ko.statusWarn,
      invalid: TEXT.ko.invalid,
      na: TEXT.ko.na
    },
    en: {
      title: "🛍️ Etsy Fee Profit Calculator",
      subtitle: "Model listing fees, the 6.5% transaction fee, payment processing, offsite ads, and seller-side costs to see what you actually keep per order.",
      back: "← Tools",
      inputHeader: "Inputs",
      kpiHeader: "Key KPIs",
      detailHeader: "Detail table",
      aboutHeader: "Assumptions and notes",
      copy: "Copy Summary",
      reset: "Reset Defaults",
      presetNote: "Preset fees are based on Etsy help documentation; use manual override if your actual shop currency/flat fee differs.",
      assumptionNote: "When enabled, the listing fee is modeled as 0.20 × quantity. The 6.5% transaction fee applies to item price + buyer shipping + buyer extras, payment processing applies to the payment base including tax, and Offsite Ads uses 12%/15% or a custom rate with a $100 per-order cap.",
      aboutCopy: "Etsy listing fees are typically $0.20 per listing. The 6.5% transaction fee applies to item price plus shipping charged to the buyer and extras like gift wrap or customization. Payment processing varies by country, and Offsite Ads generally uses a 12% or 15% fee with a $100 per-order cap. If your actual shop currency or flat fee differs, use the manual override fields.",
      l_unitPrice: "Unit sale price (same currency)",
      l_quantity: "Quantity sold",
      l_shippingCharged: "Shipping charged to buyer",
      l_buyerExtras: "Buyer extras (gift wrap/customization)",
      l_taxCollected: "Tax collected",
      l_unitCogs: "Unit COGS",
      l_packagingCost: "Packaging cost / order",
      l_sellerPostageCost: "Seller postage cost / order",
      l_etsyAdsSpend: "Etsy Ads spend / order",
      l_paymentPreset: "Payment preset",
      l_processingRate: "Manual processing %",
      l_processingFlat: "Manual flat fee",
      l_offsiteMode: "Offsite Ads rate",
      l_offsiteCustomRate: "Custom Offsite Ads %",
      l_includeTaxesInOffsiteFee: "Include taxes in offsite fee base",
      l_includeListingFee: "Include listing fee in per-order profit",
      k_etsyFeeTotal: "Etsy fee total",
      k_payoutAfterEtsyFees: "Payout after Etsy fees",
      k_netProfit: "Net profit",
      k_netMargin: "Net margin",
      k_breakEvenUnitPrice: "Break-even unit price",
      k_maxDiscountBeforeLoss: "Max discount before loss",
      d_listingFee: "Listing fee",
      d_transactionFee: "Transaction fee",
      d_processingFee: "Payment processing fee",
      d_offsiteAdsFee: "Offsite Ads fee",
      d_sellerCostTotal: "Seller cost total",
      d_totalCost: "Total cost",
      d_effectiveEtsyFeeRate: "Effective Etsy fee rate",
      d_revenueExTax: "Revenue excluding tax",
      offsiteNone: "0% (none)",
      offsite12: "12%",
      offsite15: "15%",
      offsiteCustom: "Custom",
      copied: TEXT.en.copied,
      copyFail: TEXT.en.copyFail,
      waiting: TEXT.en.waiting,
      statusGood: TEXT.en.statusGood,
      statusWarn: TEXT.en.statusWarn,
      invalid: TEXT.en.invalid,
      na: TEXT.en.na
    }
  };

  function initBrowser() {
    const $ = (id) => document.getElementById(id);
    const refs = {
      langBtn: $("langBtn"),
      backLink: $("backLink"),
      inputHeader: $("inputHeader"),
      kpiHeader: $("kpiHeader"),
      detailHeader: $("detailHeader"),
      aboutHeader: $("aboutHeader"),
      presetNote: $("presetNote"),
      assumptionNote: $("assumptionNote"),
      aboutCopy: $("aboutCopy"),
      paymentPreset: $("paymentPreset"),
      offsiteMode: $("offsiteMode"),
      unitPrice: $("unitPrice"),
      quantity: $("quantity"),
      shippingCharged: $("shippingCharged"),
      buyerExtras: $("buyerExtras"),
      taxCollected: $("taxCollected"),
      unitCogs: $("unitCogs"),
      packagingCost: $("packagingCost"),
      sellerPostageCost: $("sellerPostageCost"),
      etsyAdsSpend: $("etsyAdsSpend"),
      processingRate: $("processingRate"),
      processingFlat: $("processingFlat"),
      offsiteCustomRate: $("offsiteCustomRate"),
      includeTaxesInOffsiteFee: $("includeTaxesInOffsiteFee"),
      includeListingFee: $("includeListingFee"),
      copy: $("copy"),
      reset: $("reset"),
      summary: $("summary"),
      error: $("error"),
      status: $("status"),
      offsiteCustomWrap: $("offsiteCustomWrap"),
      etsyFeeTotal: $("etsyFeeTotal"),
      payoutAfterEtsyFees: $("payoutAfterEtsyFees"),
      netProfit: $("netProfit"),
      netMargin: $("netMargin"),
      breakEvenUnitPrice: $("breakEvenUnitPrice"),
      maxDiscountBeforeLoss: $("maxDiscountBeforeLoss"),
      listingFee: $("listingFee"),
      transactionFee: $("transactionFee"),
      processingFee: $("processingFee"),
      offsiteAdsFee: $("offsiteAdsFee"),
      sellerCostTotal: $("sellerCostTotal"),
      totalCost: $("totalCost"),
      effectiveEtsyFeeRate: $("effectiveEtsyFeeRate"),
      revenueExTax: $("revenueExTax")
    };

    if (!refs.langBtn) {
      return;
    }

    const defaults = {
      presetId: "us",
      unitPrice: 35,
      quantity: 1,
      shippingCharged: 4.99,
      buyerExtras: 0,
      taxCollected: 0,
      unitCogs: 12,
      packagingCost: 0.8,
      sellerPostageCost: 4.2,
      etsyAdsSpend: 0,
      processingRate: presetMap.us.rate,
      processingFlat: presetMap.us.flat,
      offsiteMode: "0",
      offsiteCustomRate: 8,
      includeTaxesInOffsiteFee: false,
      includeListingFee: true
    };

    let lang = "ko";

    const labelIds = [
      "title", "subtitle", "inputHeader", "kpiHeader", "detailHeader", "aboutHeader",
      "presetNote", "assumptionNote", "aboutCopy", "backLink", "copy", "reset"
    ];

    const fieldIds = [
      "unitPrice", "quantity", "shippingCharged", "buyerExtras", "taxCollected", "unitCogs",
      "packagingCost", "sellerPostageCost", "etsyAdsSpend", "paymentPreset", "processingRate",
      "processingFlat", "offsiteMode", "offsiteCustomRate", "includeTaxesInOffsiteFee", "includeListingFee"
    ];

    const kpiIds = [
      "etsyFeeTotal", "payoutAfterEtsyFees", "netProfit", "netMargin", "breakEvenUnitPrice", "maxDiscountBeforeLoss"
    ];

    const detailIds = [
      "listingFee", "transactionFee", "processingFee", "offsiteAdsFee", "sellerCostTotal", "totalCost", "effectiveEtsyFeeRate", "revenueExTax"
    ];

    function t(key) {
      return I18N[lang][key] || key;
    }

    function applyLabels() {
      document.documentElement.lang = lang;
      labelIds.forEach((id) => {
        const node = $(id);
        if (!node) return;
        if (id === "backLink") {
          node.textContent = t("back");
        } else {
          node.textContent = t(id);
        }
      });

      fieldIds.forEach((id) => {
        const label = $("l_" + id);
        if (label) {
          label.textContent = t("l_" + id);
        }
      });

      kpiIds.forEach((id) => {
        const label = $("k_" + id);
        if (label) {
          label.textContent = t("k_" + id);
        }
      });

      detailIds.forEach((id) => {
        const label = $("d_" + id);
        if (label) {
          label.textContent = t("d_" + id);
        }
      });

      refs.langBtn.textContent = lang === "ko" ? "EN" : "KO";
      populatePresetOptions();
      populateOffsiteOptions();
    }

    function populatePresetOptions() {
      const current = refs.paymentPreset.value || defaults.presetId;
      refs.paymentPreset.innerHTML = presets.map((preset) => {
        const label = preset.label[lang] || preset.label.en;
        const suffix = preset.id === "custom" ? "" : ` — ${preset.rate}% + ${preset.flat.toFixed(2)}`;
        return `<option value="${preset.id}">${label}${suffix}</option>`;
      }).join("");
      refs.paymentPreset.value = current;
    }

    function populateOffsiteOptions() {
      const current = refs.offsiteMode.value || defaults.offsiteMode;
      refs.offsiteMode.innerHTML = [
        { value: "0", key: "offsiteNone" },
        { value: "12", key: "offsite12" },
        { value: "15", key: "offsite15" },
        { value: "custom", key: "offsiteCustom" }
      ].map((item) => `<option value="${item.value}">${t(item.key)}</option>`).join("");
      refs.offsiteMode.value = current;
    }

    function money(value) {
      const locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
    }

    function percent(value) {
      const locale = lang === "en" ? "en-US" : "ko-KR";
      return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0)}%`;
    }

    function setEmpty() {
      [
        "etsyFeeTotal", "payoutAfterEtsyFees", "netProfit", "netMargin", "breakEvenUnitPrice", "maxDiscountBeforeLoss",
        "listingFee", "transactionFee", "processingFee", "offsiteAdsFee", "sellerCostTotal", "totalCost", "effectiveEtsyFeeRate", "revenueExTax"
      ].forEach((key) => {
        refs[key].textContent = "-";
      });
      refs.summary.value = "";
    }

    function syncPresetFields(force) {
      const preset = presetMap[refs.paymentPreset.value] || presetMap.custom;
      if (force || refs.paymentPreset.value !== "custom") {
        refs.processingRate.value = preset.rate;
        refs.processingFlat.value = preset.flat.toFixed(2);
      }
    }

    function syncOffsiteField() {
      const isCustom = refs.offsiteMode.value === "custom";
      refs.offsiteCustomWrap.classList.toggle("hidden", !isCustom);
      refs.offsiteCustomRate.disabled = !isCustom;
      if (!isCustom) {
        refs.offsiteCustomRate.value = refs.offsiteMode.value;
      }
    }

    function readValues() {
      return {
        presetId: refs.paymentPreset.value,
        unitPrice: Number(refs.unitPrice.value),
        quantity: Number(refs.quantity.value),
        shippingCharged: Number(refs.shippingCharged.value),
        buyerExtras: Number(refs.buyerExtras.value),
        taxCollected: Number(refs.taxCollected.value),
        unitCogs: Number(refs.unitCogs.value),
        packagingCost: Number(refs.packagingCost.value),
        sellerPostageCost: Number(refs.sellerPostageCost.value),
        etsyAdsSpend: Number(refs.etsyAdsSpend.value),
        processingRate: Number(refs.processingRate.value),
        processingFlat: Number(refs.processingFlat.value),
        offsiteRate: refs.offsiteMode.value === "custom" ? Number(refs.offsiteCustomRate.value) : Number(refs.offsiteMode.value),
        includeTaxesInOffsiteFee: refs.includeTaxesInOffsiteFee.checked,
        includeListingFee: refs.includeListingFee.checked
      };
    }

    function render() {
      syncOffsiteField();
      const payload = readValues();
      const { result, error } = calculate(payload, { lang });

      refs.error.classList.toggle("show", Boolean(error));
      refs.error.textContent = error;

      if (error) {
        refs.status.textContent = t("invalid");
        setEmpty();
        return;
      }

      refs.etsyFeeTotal.textContent = money(result.etsyFeeTotal);
      refs.payoutAfterEtsyFees.textContent = money(result.payoutAfterEtsyFees);
      refs.netProfit.textContent = money(result.netProfit);
      refs.netMargin.textContent = percent(result.netMarginPct);
      refs.breakEvenUnitPrice.textContent = result.breakEvenUnitPrice == null ? t("na") : money(result.breakEvenUnitPrice);
      refs.maxDiscountBeforeLoss.textContent = result.maxDiscountPct == null ? t("na") : percent(result.maxDiscountPct);
      refs.listingFee.textContent = money(result.listingFee);
      refs.transactionFee.textContent = money(result.transactionFee);
      refs.processingFee.textContent = money(result.processingFee);
      refs.offsiteAdsFee.textContent = money(result.offsiteAdsFee);
      refs.sellerCostTotal.textContent = money(result.sellerCostTotal);
      refs.totalCost.textContent = money(result.totalCost);
      refs.effectiveEtsyFeeRate.textContent = percent(result.effectiveEtsyFeeRatePct);
      refs.revenueExTax.textContent = money(result.revenueExTax);
      refs.summary.value = result.summary;
      refs.status.innerHTML = result.netProfit >= 0
        ? `<span class="good">●</span> ${t("statusGood")}`
        : `<span class="warn">●</span> ${t("statusWarn")}`;
    }

    refs.langBtn.addEventListener("click", () => {
      lang = lang === "ko" ? "en" : "ko";
      applyLabels();
      render();
    });

    refs.paymentPreset.addEventListener("change", () => {
      syncPresetFields(true);
      render();
    });

    refs.offsiteMode.addEventListener("change", render);

    [
      refs.unitPrice,
      refs.quantity,
      refs.shippingCharged,
      refs.buyerExtras,
      refs.taxCollected,
      refs.unitCogs,
      refs.packagingCost,
      refs.sellerPostageCost,
      refs.etsyAdsSpend,
      refs.processingRate,
      refs.processingFlat,
      refs.offsiteCustomRate,
      refs.includeTaxesInOffsiteFee,
      refs.includeListingFee
    ].forEach((element) => {
      element.addEventListener("input", render);
      element.addEventListener("change", render);
    });

    refs.copy.addEventListener("click", async () => {
      if (!refs.summary.value.trim()) {
        return;
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        alert(t("copied"));
      } catch (error) {
        console.error(error);
        alert(t("copyFail"));
      }
    });

    refs.reset.addEventListener("click", () => {
      refs.paymentPreset.value = defaults.presetId;
      refs.unitPrice.value = defaults.unitPrice;
      refs.quantity.value = defaults.quantity;
      refs.shippingCharged.value = defaults.shippingCharged;
      refs.buyerExtras.value = defaults.buyerExtras;
      refs.taxCollected.value = defaults.taxCollected;
      refs.unitCogs.value = defaults.unitCogs;
      refs.packagingCost.value = defaults.packagingCost;
      refs.sellerPostageCost.value = defaults.sellerPostageCost;
      refs.etsyAdsSpend.value = defaults.etsyAdsSpend;
      refs.processingRate.value = defaults.processingRate;
      refs.processingFlat.value = defaults.processingFlat.toFixed(2);
      refs.offsiteMode.value = defaults.offsiteMode;
      refs.offsiteCustomRate.value = defaults.offsiteCustomRate;
      refs.includeTaxesInOffsiteFee.checked = defaults.includeTaxesInOffsiteFee;
      refs.includeListingFee.checked = defaults.includeListingFee;
      syncPresetFields(true);
      syncOffsiteField();
      render();
    });

    applyLabels();
    refs.paymentPreset.value = defaults.presetId;
    syncPresetFields(true);
    refs.offsiteMode.value = defaults.offsiteMode;
    refs.offsiteCustomRate.value = defaults.offsiteCustomRate;
    syncOffsiteField();
    refs.status.textContent = t("waiting");
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
