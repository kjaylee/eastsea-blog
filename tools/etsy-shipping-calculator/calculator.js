(function (root) {
  const ETSY_TRANSACTION_FEE_RATE = 0.065;

  const CARRIERS = [
    { id: "usps-first-class", dimFactor: null, maxWeightOz: 13, label: { ko: "USPS First Class (< 13 oz)", en: "USPS First Class (< 13 oz)" } },
    { id: "usps-priority", dimFactor: 166, maxWeightOz: 1120, label: { ko: "USPS Priority Mail", en: "USPS Priority Mail" } },
    { id: "usps-ground-advantage", dimFactor: 166, maxWeightOz: 1120, label: { ko: "USPS Ground Advantage", en: "USPS Ground Advantage" } },
    { id: "ups-ground", dimFactor: 139, maxWeightOz: 2400, label: { ko: "UPS Ground", en: "UPS Ground" } },
    { id: "fedex-ground", dimFactor: 139, maxWeightOz: 2400, label: { ko: "FedEx Ground", en: "FedEx Ground" } }
  ];

  const carrierMap = Object.fromEntries(CARRIERS.map(function (c) { return [c.id, c]; }));

  // Simplified rate tables: [maxWeightOz, rates-by-zone(1-9)]
  // Rates are estimated averages for 2025-2026 Etsy label discounts
  const RATE_TABLES = {
    "usps-first-class": [
      [1, [3.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50]],
      [4, [3.75, 3.80, 3.90, 4.00, 4.10, 4.20, 4.30, 4.40, 4.50]],
      [8, [4.20, 4.30, 4.50, 4.70, 4.90, 5.10, 5.30, 5.50, 5.70]],
      [13, [4.70, 4.80, 5.10, 5.40, 5.60, 5.80, 6.00, 6.20, 6.50]]
    ],
    "usps-priority": [
      [16, [7.75, 8.00, 8.25, 8.70, 9.45, 10.20, 10.80, 11.50, 12.30]],
      [32, [8.50, 9.00, 9.50, 10.20, 11.25, 12.40, 13.50, 14.60, 15.80]],
      [48, [9.80, 10.50, 11.20, 12.10, 13.45, 14.90, 16.30, 17.60, 19.20]],
      [80, [11.50, 12.50, 13.60, 14.80, 16.50, 18.40, 20.20, 22.00, 24.00]],
      [160, [14.00, 15.50, 17.20, 19.00, 21.50, 24.00, 26.50, 29.00, 32.00]],
      [320, [18.00, 20.50, 23.00, 26.00, 29.50, 33.00, 36.50, 40.00, 44.00]],
      [1120, [25.00, 29.00, 33.00, 38.00, 43.00, 48.00, 53.00, 58.00, 64.00]]
    ],
    "usps-ground-advantage": [
      [16, [5.50, 5.80, 6.10, 6.50, 7.00, 7.50, 8.00, 8.50, 9.00]],
      [32, [6.50, 7.00, 7.50, 8.10, 8.80, 9.50, 10.20, 10.90, 11.60]],
      [48, [7.80, 8.50, 9.20, 10.00, 10.90, 11.80, 12.70, 13.60, 14.50]],
      [80, [9.50, 10.50, 11.50, 12.60, 13.80, 15.00, 16.20, 17.40, 18.60]],
      [160, [12.00, 13.50, 15.00, 16.60, 18.30, 20.00, 21.70, 23.40, 25.10]],
      [320, [16.00, 18.00, 20.00, 22.20, 24.50, 26.80, 29.10, 31.40, 33.70]],
      [1120, [22.00, 25.00, 28.00, 31.50, 35.00, 38.50, 42.00, 45.50, 49.00]]
    ],
    "ups-ground": [
      [16, [8.50, 9.00, 9.80, 10.60, 11.50, 12.40, 13.30, 14.20, 15.10]],
      [32, [9.80, 10.50, 11.50, 12.60, 13.80, 15.00, 16.20, 17.40, 18.60]],
      [48, [11.50, 12.50, 13.80, 15.20, 16.70, 18.20, 19.70, 21.20, 22.70]],
      [80, [14.00, 15.50, 17.20, 19.00, 21.00, 23.00, 25.00, 27.00, 29.00]],
      [160, [18.00, 20.00, 22.50, 25.00, 28.00, 31.00, 34.00, 37.00, 40.00]],
      [320, [24.00, 27.00, 30.50, 34.00, 38.00, 42.00, 46.00, 50.00, 54.00]],
      [2400, [35.00, 40.00, 45.00, 51.00, 57.00, 63.00, 69.00, 75.00, 81.00]]
    ],
    "fedex-ground": [
      [16, [8.20, 8.70, 9.50, 10.30, 11.20, 12.10, 13.00, 13.90, 14.80]],
      [32, [9.50, 10.20, 11.20, 12.30, 13.50, 14.70, 15.90, 17.10, 18.30]],
      [48, [11.20, 12.20, 13.50, 14.90, 16.40, 17.90, 19.40, 20.90, 22.40]],
      [80, [13.70, 15.20, 16.90, 18.70, 20.70, 22.70, 24.70, 26.70, 28.70]],
      [160, [17.50, 19.50, 22.00, 24.50, 27.50, 30.50, 33.50, 36.50, 39.50]],
      [320, [23.50, 26.50, 30.00, 33.50, 37.50, 41.50, 45.50, 49.50, 53.50]],
      [2400, [34.00, 39.00, 44.00, 50.00, 56.00, 62.00, 68.00, 74.00, 80.00]]
    ]
  };

  var TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      weightRange: "무게는 0보다 크고 캐리어 최대 중량 이하여야 합니다.",
      dimsPositive: "패키지 치수(가로, 세로, 높이)는 모두 0보다 커야 합니다.",
      zoneRange: "배송 존(Zone)은 1~9 범위여야 합니다.",
      itemPricePositive: "상품 가격은 0 이상이어야 합니다.",
      quantityPositive: "수량은 1 이상의 정수여야 합니다.",
      weightExceedsFirstClass: "USPS First Class는 13 oz 이하만 가능합니다. 다른 서비스를 선택하세요.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      waiting: "결과 계산 대기",
      statusGood: "배송비가 커버됩니다.",
      statusWarn: "배송비를 추가 부담해야 합니다.",
      summaryTitle: "[Etsy 배송비 계산 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      weightRange: "Weight must be greater than 0 and within carrier max.",
      dimsPositive: "Package dimensions (L, W, H) must all be greater than 0.",
      zoneRange: "Shipping zone must be between 1 and 9.",
      itemPricePositive: "Item price must be zero or above.",
      quantityPositive: "Quantity must be an integer >= 1.",
      weightExceedsFirstClass: "USPS First Class max is 13 oz. Choose another service.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      waiting: "Waiting for calculation",
      statusGood: "Shipping cost is covered.",
      statusWarn: "Shipping requires additional cost absorption.",
      summaryTitle: "[Etsy Shipping Cost Summary]",
      na: "N/A"
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function normalizeInput(input) {
    return {
      packageWeightOz: Number(input.packageWeightOz),
      lengthIn: Number(input.lengthIn),
      widthIn: Number(input.widthIn),
      heightIn: Number(input.heightIn),
      carrier: String(input.carrier || "usps-priority"),
      zone: Number(input.zone),
      itemPrice: Number(input.itemPrice),
      quantity: Number(input.quantity),
      shippingCharged: input.shippingCharged != null ? Number(input.shippingCharged) : null
    };
  }

  function validate(n, lang) {
    var t = TEXT[lang] || TEXT.en;
    var carrier = carrierMap[n.carrier];

    if (!Number.isInteger(n.quantity) || n.quantity < 1) {
      return t.quantityPositive;
    }
    if (!Number.isFinite(n.packageWeightOz) || n.packageWeightOz <= 0) {
      return t.weightRange;
    }
    if (!Number.isFinite(n.lengthIn) || n.lengthIn <= 0 ||
        !Number.isFinite(n.widthIn) || n.widthIn <= 0 ||
        !Number.isFinite(n.heightIn) || n.heightIn <= 0) {
      return t.dimsPositive;
    }
    if (!Number.isFinite(n.zone) || !Number.isInteger(n.zone) || n.zone < 1 || n.zone > 9) {
      return t.zoneRange;
    }
    if (!Number.isFinite(n.itemPrice) || n.itemPrice < 0) {
      return t.itemPricePositive;
    }
    if (carrier && n.packageWeightOz > carrier.maxWeightOz) {
      if (n.carrier === "usps-first-class") {
        return t.weightExceedsFirstClass;
      }
      return t.weightRange;
    }
    return "";
  }

  function calcDimensionalWeightOz(lengthIn, widthIn, heightIn, dimFactor) {
    if (!dimFactor) return 0;
    var cubicInches = lengthIn * widthIn * heightIn;
    return Math.ceil(cubicInches / dimFactor);
  }

  function lookupRate(carrierId, billableWeightOz, zone) {
    var table = RATE_TABLES[carrierId];
    if (!table) return 0;
    var zoneIdx = zone - 1;
    for (var i = 0; i < table.length; i++) {
      if (billableWeightOz <= table[i][0]) {
        return table[i][1][zoneIdx];
      }
    }
    // Over max tier, use last tier
    return table[table.length - 1][1][zoneIdx];
  }

  function calculate(input, options) {
    var lang = (options && options.lang) || "en";
    var n = normalizeInput(input);
    var error = validate(n, lang);
    if (error) {
      return { result: null, error: error };
    }

    var carrier = carrierMap[n.carrier];
    var dimFactor = carrier ? carrier.dimFactor : null;

    // Dimensional weight
    var dimWeightOz = calcDimensionalWeightOz(n.lengthIn, n.widthIn, n.heightIn, dimFactor);
    var totalActualWeightOz = n.packageWeightOz * n.quantity;
    var totalDimWeightOz = dimWeightOz * n.quantity;
    var billableWeightOz = Math.max(totalActualWeightOz, totalDimWeightOz);

    // Rate lookup
    var estimatedShippingCost = lookupRate(n.carrier, billableWeightOz, n.zone);

    // Etsy transaction fee on shipping (6.5%)
    var shippingToCharge = n.shippingCharged != null ? n.shippingCharged : estimatedShippingCost;
    var etsyShippingFee = round2(shippingToCharge * ETSY_TRANSACTION_FEE_RATE);

    // Total shipping expense for seller
    var totalShippingExpense = round2(estimatedShippingCost + etsyShippingFee);

    // Suggested shipping price that covers cost + Etsy fee
    var suggestedShippingPrice = round2(estimatedShippingCost / (1 - ETSY_TRANSACTION_FEE_RATE));

    // Free shipping impact analysis
    var freeShippingProfitImpact = round2(-(estimatedShippingCost + round2(estimatedShippingCost * ETSY_TRANSACTION_FEE_RATE)));

    // If seller charges shipping
    var chargedShippingProfit = round2(shippingToCharge - estimatedShippingCost - etsyShippingFee);

    // Effective shipping fee rate
    var effectiveShippingFeeRate = shippingToCharge > 0 ? round4(etsyShippingFee / shippingToCharge) : 0;

    // Per-item weight
    var perItemDimWeightOz = dimWeightOz;
    var usedDimensional = totalDimWeightOz > totalActualWeightOz;

    var result = {
      inputs: n,
      perItemDimWeightOz: perItemDimWeightOz,
      billableWeightOz: billableWeightOz,
      usedDimensional: usedDimensional,
      estimatedShippingCost: round2(estimatedShippingCost),
      shippingCharged: round2(shippingToCharge),
      etsyShippingFee: etsyShippingFee,
      totalShippingExpense: totalShippingExpense,
      suggestedShippingPrice: suggestedShippingPrice,
      freeShippingProfitImpact: freeShippingProfitImpact,
      chargedShippingProfit: chargedShippingProfit,
      effectiveShippingFeeRate: effectiveShippingFeeRate,
      effectiveShippingFeeRatePct: round2(effectiveShippingFeeRate * 100)
    };

    result.summary = buildSummary(result, { lang: lang });
    return { result: result, error: "" };
  }

  function buildSummary(result, options) {
    var lang = (options && options.lang) || "en";
    var t = TEXT[lang] || TEXT.en;
    var locale = lang === "en" ? "en-US" : "ko-KR";
    var nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    var lines = [
      t.summaryTitle,
      (lang === "en" ? "Billable weight" : "청구 중량") + ": " + result.billableWeightOz + " oz" + (result.usedDimensional ? " (dimensional)" : " (actual)"),
      (lang === "en" ? "Estimated shipping cost" : "예상 배송비") + ": " + nf.format(result.estimatedShippingCost),
      (lang === "en" ? "Etsy shipping fee (6.5%)" : "Etsy 배송 수수료 (6.5%)") + ": " + nf.format(result.etsyShippingFee),
      (lang === "en" ? "Total shipping expense" : "총 배송 비용") + ": " + nf.format(result.totalShippingExpense),
      (lang === "en" ? "Suggested shipping price" : "추천 배송 가격") + ": " + nf.format(result.suggestedShippingPrice),
      (lang === "en" ? "Free shipping profit impact" : "무료 배송 시 이익 영향") + ": " + nf.format(result.freeShippingProfitImpact)
    ];
    return lines.join("\n");
  }

  var api = {
    CARRIERS: CARRIERS,
    carrierMap: carrierMap,
    RATE_TABLES: RATE_TABLES,
    calculate: calculate,
    buildSummary: buildSummary,
    normalizeInput: normalizeInput,
    validate: validate,
    calcDimensionalWeightOz: calcDimensionalWeightOz,
    lookupRate: lookupRate
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.EtsyShippingCalculator = api;

  if (typeof document === "undefined") {
    return;
  }

  var I18N = {
    ko: {
      title: "📦 Etsy 배송비 계산기",
      subtitle: "패키지 무게/치수, 캐리어, 존(Zone)을 입력하면 배송비 추정치, Etsy 6.5% 수수료, 무료 배송 시 이익 영향을 계산합니다.",
      back: "← Tools",
      inputHeader: "입력값",
      kpiHeader: "핵심 KPI",
      detailHeader: "세부 지표",
      aboutHeader: "가정 및 해설",
      copy: "요약 복사",
      reset: "기본값 복원",
      aboutCopy: "배송비는 캐리어 공시 요금 기반 추정치입니다. 실제 Etsy 라벨 할인율에 따라 달라질 수 있습니다. Etsy는 구매자에게 청구한 배송비에 6.5% 거래 수수료를 부과합니다. 무료 배송 시 이 수수료가 면제되지만 배송 실비는 판매자가 부담합니다.",
      l_packageWeightOz: "패키지 무게 (oz)",
      l_lengthIn: "길이 (인치)",
      l_widthIn: "너비 (인치)",
      l_heightIn: "높이 (인치)",
      l_carrier: "캐리어/서비스",
      l_zone: "배송 존 (1-9)",
      l_itemPrice: "상품 가격",
      l_quantity: "수량",
      l_shippingCharged: "구매자 청구 배송비 (비워두면 자동)",
      k_billableWeight: "청구 중량",
      k_estimatedShippingCost: "예상 배송비",
      k_etsyShippingFee: "Etsy 배송 수수료",
      k_totalShippingExpense: "총 배송 비용",
      k_suggestedShippingPrice: "추천 배송 가격",
      k_freeShippingImpact: "무료 배송 시 이익 영향",
      d_perItemDimWeight: "개별 부피중량",
      d_usedDimensional: "부피중량 적용 여부",
      d_chargedShippingProfit: "배송비 청구 시 손익",
      d_effectiveShippingFeeRate: "실효 배송 수수료율",
      copied: TEXT.ko.copied,
      copyFail: TEXT.ko.copyFail,
      waiting: TEXT.ko.waiting,
      statusGood: TEXT.ko.statusGood,
      statusWarn: TEXT.ko.statusWarn,
      invalid: TEXT.ko.invalid,
      na: TEXT.ko.na,
      yes: "예",
      no: "아니오"
    },
    en: {
      title: "📦 Etsy Shipping Calculator",
      subtitle: "Enter package weight/dimensions, carrier, and zone to estimate shipping cost, Etsy's 6.5% fee, and the profit impact of free vs. charged shipping.",
      back: "← Tools",
      inputHeader: "Inputs",
      kpiHeader: "Key KPIs",
      detailHeader: "Detail Table",
      aboutHeader: "Assumptions & Notes",
      copy: "Copy Summary",
      reset: "Reset Defaults",
      aboutCopy: "Shipping rates are estimates based on published carrier rates. Actual Etsy label discounts may vary. Etsy charges a 6.5% transaction fee on shipping charged to buyers. With free shipping this fee is waived, but the seller absorbs the actual shipping cost.",
      l_packageWeightOz: "Package weight (oz)",
      l_lengthIn: "Length (in)",
      l_widthIn: "Width (in)",
      l_heightIn: "Height (in)",
      l_carrier: "Carrier / Service",
      l_zone: "Shipping zone (1-9)",
      l_itemPrice: "Item price",
      l_quantity: "Quantity",
      l_shippingCharged: "Shipping charged to buyer (blank = auto)",
      k_billableWeight: "Billable weight",
      k_estimatedShippingCost: "Est. shipping cost",
      k_etsyShippingFee: "Etsy shipping fee",
      k_totalShippingExpense: "Total shipping expense",
      k_suggestedShippingPrice: "Suggested shipping price",
      k_freeShippingImpact: "Free shipping profit impact",
      d_perItemDimWeight: "Per-item dim weight",
      d_usedDimensional: "Used dimensional weight?",
      d_chargedShippingProfit: "Charged shipping profit/loss",
      d_effectiveShippingFeeRate: "Effective shipping fee rate",
      copied: TEXT.en.copied,
      copyFail: TEXT.en.copyFail,
      waiting: TEXT.en.waiting,
      statusGood: TEXT.en.statusGood,
      statusWarn: TEXT.en.statusWarn,
      invalid: TEXT.en.invalid,
      na: TEXT.en.na,
      yes: "Yes",
      no: "No"
    }
  };

  function initBrowser() {
    var $ = function (id) { return document.getElementById(id); };
    var refs = {
      langBtn: $("langBtn"),
      backLink: $("backLink"),
      packageWeightOz: $("packageWeightOz"),
      lengthIn: $("lengthIn"),
      widthIn: $("widthIn"),
      heightIn: $("heightIn"),
      carrier: $("carrier"),
      zone: $("zone"),
      itemPrice: $("itemPrice"),
      quantity: $("quantity"),
      shippingCharged: $("shippingCharged"),
      copy: $("copy"),
      reset: $("reset"),
      summary: $("summary"),
      error: $("error"),
      status: $("status"),
      billableWeight: $("billableWeight"),
      estimatedShippingCost: $("estimatedShippingCost"),
      etsyShippingFee: $("etsyShippingFee"),
      totalShippingExpense: $("totalShippingExpense"),
      suggestedShippingPrice: $("suggestedShippingPrice"),
      freeShippingImpact: $("freeShippingImpact"),
      perItemDimWeight: $("perItemDimWeight"),
      usedDimensional: $("usedDimensional"),
      chargedShippingProfit: $("chargedShippingProfit"),
      effectiveShippingFeeRate: $("effectiveShippingFeeRate")
    };

    if (!refs.langBtn) return;

    var defaults = {
      packageWeightOz: 12,
      lengthIn: 10,
      widthIn: 8,
      heightIn: 4,
      carrier: "usps-priority",
      zone: 5,
      itemPrice: 35,
      quantity: 1,
      shippingCharged: ""
    };

    var lang = "ko";

    var labelIds = [
      "title", "subtitle", "inputHeader", "kpiHeader", "detailHeader", "aboutHeader", "aboutCopy", "backLink", "copy", "reset"
    ];
    var fieldIds = [
      "packageWeightOz", "lengthIn", "widthIn", "heightIn", "carrier", "zone", "itemPrice", "quantity", "shippingCharged"
    ];
    var kpiIds = [
      "billableWeight", "estimatedShippingCost", "etsyShippingFee", "totalShippingExpense", "suggestedShippingPrice", "freeShippingImpact"
    ];
    var detailIds = [
      "perItemDimWeight", "usedDimensional", "chargedShippingProfit", "effectiveShippingFeeRate"
    ];

    function t(key) { return I18N[lang][key] || key; }

    function applyLabels() {
      document.documentElement.lang = lang;
      labelIds.forEach(function (id) {
        var node = $(id);
        if (!node) return;
        if (id === "backLink") { node.textContent = t("back"); }
        else { node.textContent = t(id); }
      });
      fieldIds.forEach(function (id) {
        var label = $("l_" + id);
        if (label) label.textContent = t("l_" + id);
      });
      kpiIds.forEach(function (id) {
        var label = $("k_" + id);
        if (label) label.textContent = t("k_" + id);
      });
      detailIds.forEach(function (id) {
        var label = $("d_" + id);
        if (label) label.textContent = t("d_" + id);
      });
      refs.langBtn.textContent = lang === "ko" ? "EN" : "KO";
      populateCarrierOptions();
    }

    function populateCarrierOptions() {
      var current = refs.carrier.value || defaults.carrier;
      refs.carrier.innerHTML = CARRIERS.map(function (c) {
        var label = c.label[lang] || c.label.en;
        return '<option value="' + c.id + '">' + label + '</option>';
      }).join("");
      refs.carrier.value = current;
    }

    function money(value) {
      var locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
    }

    function percent(value) {
      var locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0) + "%";
    }

    function setEmpty() {
      kpiIds.concat(detailIds).forEach(function (key) {
        if (refs[key]) refs[key].textContent = "-";
      });
      refs.summary.value = "";
    }

    function readValues() {
      var sc = refs.shippingCharged.value.trim();
      return {
        packageWeightOz: Number(refs.packageWeightOz.value),
        lengthIn: Number(refs.lengthIn.value),
        widthIn: Number(refs.widthIn.value),
        heightIn: Number(refs.heightIn.value),
        carrier: refs.carrier.value,
        zone: Number(refs.zone.value),
        itemPrice: Number(refs.itemPrice.value),
        quantity: Number(refs.quantity.value),
        shippingCharged: sc === "" ? null : Number(sc)
      };
    }

    function render() {
      var payload = readValues();
      var out = calculate(payload, { lang: lang });

      refs.error.classList.toggle("show", Boolean(out.error));
      refs.error.textContent = out.error;

      if (out.error) {
        refs.status.textContent = t("invalid");
        setEmpty();
        return;
      }

      var r = out.result;
      refs.billableWeight.textContent = r.billableWeightOz + " oz" + (r.usedDimensional ? " (dim)" : "");
      refs.estimatedShippingCost.textContent = money(r.estimatedShippingCost);
      refs.etsyShippingFee.textContent = money(r.etsyShippingFee);
      refs.totalShippingExpense.textContent = money(r.totalShippingExpense);
      refs.suggestedShippingPrice.textContent = money(r.suggestedShippingPrice);
      refs.freeShippingImpact.textContent = money(r.freeShippingProfitImpact);
      refs.perItemDimWeight.textContent = r.perItemDimWeightOz + " oz";
      refs.usedDimensional.textContent = r.usedDimensional ? t("yes") : t("no");
      refs.chargedShippingProfit.textContent = money(r.chargedShippingProfit);
      refs.effectiveShippingFeeRate.textContent = percent(r.effectiveShippingFeeRatePct);
      refs.summary.value = r.summary;
      refs.status.innerHTML = r.chargedShippingProfit >= 0
        ? '<span class="good">\u25cf</span> ' + t("statusGood")
        : '<span class="warn">\u25cf</span> ' + t("statusWarn");
    }

    refs.langBtn.addEventListener("click", function () {
      lang = lang === "ko" ? "en" : "ko";
      applyLabels();
      render();
    });

    var inputEls = [
      refs.packageWeightOz, refs.lengthIn, refs.widthIn, refs.heightIn,
      refs.carrier, refs.zone, refs.itemPrice, refs.quantity, refs.shippingCharged
    ];
    inputEls.forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    refs.copy.addEventListener("click", function () {
      if (!refs.summary.value.trim()) return;
      try {
        navigator.clipboard.writeText(refs.summary.value).then(function () {
          alert(t("copied"));
        });
      } catch (e) {
        alert(t("copyFail"));
      }
    });

    refs.reset.addEventListener("click", function () {
      refs.packageWeightOz.value = defaults.packageWeightOz;
      refs.lengthIn.value = defaults.lengthIn;
      refs.widthIn.value = defaults.widthIn;
      refs.heightIn.value = defaults.heightIn;
      refs.carrier.value = defaults.carrier;
      refs.zone.value = defaults.zone;
      refs.itemPrice.value = defaults.itemPrice;
      refs.quantity.value = defaults.quantity;
      refs.shippingCharged.value = defaults.shippingCharged;
      populateCarrierOptions();
      render();
    });

    applyLabels();
    refs.carrier.value = defaults.carrier;
    refs.status.textContent = t("waiting");
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
