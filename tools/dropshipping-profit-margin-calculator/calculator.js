/* Dropshipping Profit Margin Calculator — calculator.js */
(function () {
  "use strict";

  /* ── i18n ── */
  const T = {
    ko: {
      title: "📦 드롭쉬핑 수익 마진 계산기",
      subtitle: "공급가, 배송비, 플랫폼 수수료, 결제 수수료, 광고비(CPA), 반품률, 고정비를 반영해 주문당 순이익과 월간 수익을 계산합니다.",
      langBtn: "EN",
      backLink: "← 도구 목록",
      inputHeader: "입력값",
      kpiHeader: "핵심 KPI",
      detailHeader: "세부 지표",
      aboutHeader: "가정 및 해설",
      copy: "요약 복사",
      reset: "기본값 복원",
      presetNote: "플랫폼 수수료는 Shopify 거래 수수료 또는 마켓플레이스 커미션을 반영합니다. 결제 수수료는 Stripe/PayPal 기준입니다.",
      assumptionNote: "반품 비용은 (공급가 + 배송비) × 반품률로 산출합니다. 고정비(Shopify 구독, 앱, 도메인 등)는 월 주문 수로 나눠 주문당 비용에 반영합니다.",
      aboutCopy: "드롭쉬핑 모델에서는 상품을 직접 재고로 보유하지 않으므로 공급가(AliExpress, CJ Dropshipping 등)가 핵심 원가입니다. 배송비는 ePacket 또는 3PL 비용이며, 구매자에게 별도 청구할 수 있습니다. 플랫폼 수수료는 Shopify 거래 수수료(0~2%) 또는 마켓플레이스 커미션을 반영합니다. 광고비(CPA)는 Facebook/Google 등 유료 광고의 주문당 획득 비용입니다. 반품 비용은 공급가 + 배송비를 기준으로 반품률만큼 평균 반영합니다. 월 고정비(Shopify 구독료, 앱, 도메인)는 월 주문 수로 나눠 주문당 비용에 포함됩니다.",
      l_productCost: "공급가 (제품 원가)",
      l_sellingPrice: "판매가",
      l_shippingCost: "고객 배송비 (셀러 부담)",
      l_shippingCharged: "구매자에게 청구한 배송비",
      l_platformFeeRate: "플랫폼 수수료 %",
      l_paymentRate: "결제 수수료 %",
      l_paymentFlat: "결제 고정 수수료",
      l_adCPA: "광고비 (주문당 CPA)",
      l_returnRate: "반품률 %",
      l_fixedCosts: "월 고정비",
      l_ordersPerMonth: "월 주문 수",
      k_netProfitOrder: "주문당 순이익",
      k_netMargin: "순마진",
      k_monthlyProfit: "월 순이익",
      k_breakEvenOrders: "손익분기 주문 수",
      k_breakEvenPrice: "손익분기 판매가",
      k_roas: "ROAS",
      d_grossRevenue: "주문당 총 수입",
      d_platformFee: "플랫폼 수수료",
      d_paymentFee: "결제 수수료",
      d_netShipping: "순 배송비",
      d_adCost: "광고비 (CPA)",
      d_returnCost: "주문당 반품 비용",
      d_amortizedFixed: "주문당 고정비",
      d_totalCost: "주문당 총 비용",
      d_effectiveFeeRate: "실효 수수료율",
      statusWait: "결과 계산 대기",
      statusProfit: "✅ 수익 발생",
      statusLoss: "⚠️ 적자 — 가격 또는 비용 조정 필요",
      statusWarn: "⚠️ 마진 10% 이하 — 리스크 주의",
      summaryTitle: "=== 드롭쉬핑 수익 요약 ===",
      copied: "복사 완료!"
    },
    en: {
      title: "📦 Dropshipping Profit Margin Calculator",
      subtitle: "Calculate per-order net profit after supplier cost, shipping, platform fees, payment processing, ad spend (CPA), returns, and fixed costs.",
      langBtn: "KO",
      backLink: "← Tools",
      inputHeader: "Inputs",
      kpiHeader: "Key KPIs",
      detailHeader: "Detailed Breakdown",
      aboutHeader: "Assumptions & Notes",
      copy: "Copy Summary",
      reset: "Reset Defaults",
      presetNote: "Platform fee covers Shopify transaction fee or marketplace commission. Payment processing is Stripe/PayPal rate.",
      assumptionNote: "Return cost = (product cost + shipping) × return rate. Fixed costs (Shopify plan, apps, domain) are amortized across monthly orders.",
      aboutCopy: "In the dropshipping model you don't hold inventory, so the supplier cost (AliExpress, CJ Dropshipping, etc.) is your core COGS. Shipping cost covers ePacket or 3PL fulfillment — you may charge shipping separately to the buyer. Platform fee reflects Shopify transaction fees (0–2%) or marketplace commission. Ad CPA is your Facebook/Google cost per acquisition. Return cost is averaged as (product + shipping) × return rate. Monthly fixed costs (Shopify subscription, apps, domain) are divided by monthly orders.",
      l_productCost: "Product cost (supplier)",
      l_sellingPrice: "Selling price",
      l_shippingCost: "Shipping cost to customer",
      l_shippingCharged: "Shipping charged to buyer",
      l_platformFeeRate: "Platform fee %",
      l_paymentRate: "Payment processing %",
      l_paymentFlat: "Payment flat fee",
      l_adCPA: "Ad spend per order (CPA)",
      l_returnRate: "Return rate %",
      l_fixedCosts: "Monthly fixed costs",
      l_ordersPerMonth: "Orders per month",
      k_netProfitOrder: "Net profit / order",
      k_netMargin: "Net margin",
      k_monthlyProfit: "Monthly net profit",
      k_breakEvenOrders: "Break-even orders/month",
      k_breakEvenPrice: "Break-even selling price",
      k_roas: "ROAS",
      d_grossRevenue: "Gross revenue / order",
      d_platformFee: "Platform fee",
      d_paymentFee: "Payment processing fee",
      d_netShipping: "Net shipping cost",
      d_adCost: "Ad CPA",
      d_returnCost: "Return cost / order",
      d_amortizedFixed: "Amortized fixed cost",
      d_totalCost: "Total cost / order",
      d_effectiveFeeRate: "Effective fee rate",
      statusWait: "Awaiting calculation",
      statusProfit: "✅ Profitable",
      statusLoss: "⚠️ Loss — adjust pricing or costs",
      statusWarn: "⚠️ Margin ≤ 10% — risky",
      summaryTitle: "=== Dropshipping Profit Summary ===",
      copied: "Copied!"
    }
  };

  let lang = "ko";
  const $ = (id) => document.getElementById(id);

  /* defaults */
  const DEFAULTS = {
    productCost: 8,
    sellingPrice: 29.99,
    shippingCost: 3.5,
    shippingCharged: 0,
    platformFeeRate: 2,
    paymentRate: 2.9,
    paymentFlat: 0.3,
    adCPA: 8,
    returnRate: 5,
    fixedCosts: 39,
    ordersPerMonth: 100
  };

  const FIELDS = Object.keys(DEFAULTS);
  const n = (id) => parseFloat($(id).value) || 0;
  const fmt = (v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (v) => v.toFixed(2) + "%";

  function applyLang() {
    const t = T[lang];
    for (const [k, v] of Object.entries(t)) {
      const el = $(k);
      if (el) {
        if (el.tagName === "INPUT" || el.tagName === "SELECT") continue;
        if (el.tagName === "A") el.textContent = v;
        else if (el.tagName === "BUTTON") el.textContent = v;
        else el.textContent = v;
      }
    }
    $("langBtn").textContent = t.langBtn;
  }

  function calc() {
    const t = T[lang];
    const sellingPrice = n("sellingPrice");
    const productCost = n("productCost");
    const shippingCost = n("shippingCost");
    const shippingCharged = n("shippingCharged");
    const platformFeeRate = n("platformFeeRate") / 100;
    const paymentRate = n("paymentRate") / 100;
    const paymentFlat = n("paymentFlat");
    const adCPA = n("adCPA");
    const returnRate = n("returnRate") / 100;
    const fixedCosts = n("fixedCosts");
    const ordersPerMonth = Math.max(1, Math.round(n("ordersPerMonth")));

    const errEl = $("error");
    if (sellingPrice <= 0) {
      errEl.textContent = lang === "ko" ? "판매가는 0보다 커야 합니다." : "Selling price must be greater than 0.";
      errEl.classList.add("show");
      return;
    }
    errEl.classList.remove("show");

    /* per-order calculations */
    const grossRevenue = sellingPrice + shippingCharged;
    const platformFee = sellingPrice * platformFeeRate;
    const paymentFee = grossRevenue * paymentRate + paymentFlat;
    const netShipping = shippingCost - shippingCharged;
    const returnCostPerOrder = (productCost + shippingCost) * returnRate;
    const amortizedFixed = fixedCosts / ordersPerMonth;

    const totalCost = productCost + Math.max(0, netShipping) + platformFee + paymentFee + adCPA + returnCostPerOrder + amortizedFixed;
    const netProfit = grossRevenue - totalCost;
    const netMargin = (netProfit / grossRevenue) * 100;
    const monthlyProfit = netProfit * ordersPerMonth;

    /* break-even orders: fixed costs / profit-before-fixed per order */
    const profitBeforeFixed = grossRevenue - (productCost + Math.max(0, netShipping) + platformFee + paymentFee + adCPA + returnCostPerOrder);
    const breakEvenOrders = profitBeforeFixed > 0 ? Math.ceil(fixedCosts / profitBeforeFixed) : Infinity;

    /* break-even selling price: find price where netProfit = 0
       price + shippingCharged - [productCost + netShip + price*platRate + (price+shipCharged)*payRate + payFlat + adCPA + returnCost + amortFixed] = 0
       Solving for price:
       price(1 - platRate - payRate) = productCost + netShip + shipCharged*payRate + payFlat + adCPA + returnCost + amortFixed - shippingCharged
    */
    const denom = 1 - platformFeeRate - paymentRate;
    const breakEvenPrice = denom > 0
      ? (productCost + Math.max(0, netShipping) + shippingCharged * paymentRate + paymentFlat + adCPA + returnCostPerOrder + amortizedFixed - shippingCharged) / denom
      : Infinity;

    /* ROAS */
    const roas = adCPA > 0 ? grossRevenue / adCPA : Infinity;

    const effectiveFeeRate = grossRevenue > 0 ? ((platformFee + paymentFee) / grossRevenue) * 100 : 0;

    /* KPIs */
    const profitClass = netProfit >= 0 ? "good" : "warn";
    $("netProfitOrder").innerHTML = `<span class="${profitClass}">${fmt(netProfit)}</span>`;
    $("netMargin").innerHTML = `<span class="${profitClass}">${pct(netMargin)}</span>`;
    $("monthlyProfit").innerHTML = `<span class="${profitClass}">${fmt(monthlyProfit)}</span>`;
    $("breakEvenOrders").textContent = breakEvenOrders === Infinity ? "N/A" : breakEvenOrders.toLocaleString();
    $("breakEvenPrice").textContent = breakEvenPrice === Infinity ? "N/A" : fmt(breakEvenPrice);
    $("roas").textContent = roas === Infinity ? "∞" : roas.toFixed(2) + "x";

    /* status pill */
    const statusEl = $("status");
    if (netProfit < 0) {
      statusEl.textContent = t.statusLoss;
      statusEl.style.borderColor = "#7a3140";
      statusEl.style.color = "#fecaca";
    } else if (netMargin <= 10) {
      statusEl.textContent = t.statusWarn;
      statusEl.style.borderColor = "#7a6a20";
      statusEl.style.color = "#fbbf24";
    } else {
      statusEl.textContent = t.statusProfit;
      statusEl.style.borderColor = "#1a6e4a";
      statusEl.style.color = "#34d399";
    }

    /* detail table */
    $("grossRevenue").textContent = fmt(grossRevenue);
    $("platformFee").textContent = fmt(platformFee);
    $("paymentFee").textContent = fmt(paymentFee);
    $("netShipping").textContent = fmt(Math.max(0, netShipping));
    $("adCost").textContent = fmt(adCPA);
    $("returnCost").textContent = fmt(returnCostPerOrder);
    $("amortizedFixed").textContent = fmt(amortizedFixed);
    $("totalCost").textContent = fmt(totalCost);
    $("effectiveFeeRate").textContent = pct(effectiveFeeRate);

    /* summary */
    const lines = [
      t.summaryTitle,
      `${t.k_netProfitOrder}: ${fmt(netProfit)}`,
      `${t.k_netMargin}: ${pct(netMargin)}`,
      `${t.k_monthlyProfit}: ${fmt(monthlyProfit)}`,
      `${t.k_breakEvenOrders}: ${breakEvenOrders === Infinity ? "N/A" : breakEvenOrders}`,
      `${t.k_breakEvenPrice}: ${breakEvenPrice === Infinity ? "N/A" : fmt(breakEvenPrice)}`,
      `${t.k_roas}: ${roas === Infinity ? "∞" : roas.toFixed(2) + "x"}`,
      "",
      `${t.d_grossRevenue}: ${fmt(grossRevenue)}`,
      `${t.d_platformFee}: ${fmt(platformFee)}`,
      `${t.d_paymentFee}: ${fmt(paymentFee)}`,
      `${t.d_netShipping}: ${fmt(Math.max(0, netShipping))}`,
      `${t.d_adCost}: ${fmt(adCPA)}`,
      `${t.d_returnCost}: ${fmt(returnCostPerOrder)}`,
      `${t.d_amortizedFixed}: ${fmt(amortizedFixed)}`,
      `${t.d_totalCost}: ${fmt(totalCost)}`
    ];
    $("summary").value = lines.join("\n");
  }

  /* ── wiring ── */
  FIELDS.forEach((f) => {
    const el = $(f);
    if (el) el.addEventListener("input", calc);
  });

  $("langBtn").addEventListener("click", () => {
    lang = lang === "ko" ? "en" : "ko";
    applyLang();
    calc();
  });

  $("reset").addEventListener("click", () => {
    FIELDS.forEach((f) => {
      $(f).value = DEFAULTS[f];
    });
    calc();
  });

  $("copy").addEventListener("click", () => {
    const txt = $("summary").value;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => {
        const btn = $("copy");
        const orig = btn.textContent;
        btn.textContent = T[lang].copied;
        setTimeout(() => (btn.textContent = orig), 1500);
      });
    }
  });

  /* init */
  applyLang();
  calc();
})();
