(() => {
  const $ = (id) => document.getElementById(id);

  const refs = {
    ordersPerMonth: $("ordersPerMonth"),
    currentAttachRate: $("currentAttachRate"),
    targetAttachRate: $("targetAttachRate"),
    planPrice: $("planPrice"),
    claimRate: $("claimRate"),
    refundRate: $("refundRate"),
    paymentFeeRate: $("paymentFeeRate"),
    opsCostPerContract: $("opsCostPerContract"),
    monthlyFixedCost: $("monthlyFixedCost"),
    setupCost: $("setupCost"),

    monthlyNet: $("monthlyNet"),
    roi: $("roi"),
    payback: $("payback"),
    incrementalContracts: $("incrementalContracts"),
    netRevenue: $("netRevenue"),
    contributionProfit: $("contributionProfit"),
    breakEvenAttachRate: $("breakEvenAttachRate"),

    attachUplift: $("attachUplift"),
    grossRevenue: $("grossRevenue"),
    refunds: $("refunds"),
    claimCost: $("claimCost"),
    paymentFee: $("paymentFee"),
    contributionPerContract: $("contributionPerContract"),
    annualCost: $("annualCost"),

    status: $("status"),
    error: $("error"),
    summary: $("summary"),
    copy: $("copy"),
    reset: $("reset")
  };

  const defaults = {
    ordersPerMonth: 12000,
    currentAttachRate: 4.5,
    targetAttachRate: 7.5,
    planPrice: 8900,
    claimRate: 25,
    refundRate: 6,
    paymentFeeRate: 3,
    opsCostPerContract: 800,
    monthlyFixedCost: 1500000,
    setupCost: 12000000
  };

  const money = (v) => new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(Number.isFinite(v) ? v : 0);

  const num = (v, d = 1) => Number(v).toLocaleString("ko-KR", { maximumFractionDigits: d });
  const pct = (v, d = 1) => `${num(v, d)}%`;

  function readValues() {
    return {
      ordersPerMonth: Number(refs.ordersPerMonth.value),
      currentAttachRate: Number(refs.currentAttachRate.value),
      targetAttachRate: Number(refs.targetAttachRate.value),
      planPrice: Number(refs.planPrice.value),
      claimRate: Number(refs.claimRate.value),
      refundRate: Number(refs.refundRate.value),
      paymentFeeRate: Number(refs.paymentFeeRate.value),
      opsCostPerContract: Number(refs.opsCostPerContract.value),
      monthlyFixedCost: Number(refs.monthlyFixedCost.value),
      setupCost: Number(refs.setupCost.value)
    };
  }

  function validate(v) {
    if (!Number.isFinite(v.ordersPerMonth) || v.ordersPerMonth < 0) return "월 주문 수는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.currentAttachRate) || v.currentAttachRate < 0 || v.currentAttachRate > 100) return "현재 부착률은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.targetAttachRate) || v.targetAttachRate < 0 || v.targetAttachRate > 100) return "목표 부착률은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.planPrice) || v.planPrice < 0) return "보증 플랜 가격은 0 이상이어야 합니다.";
    if (!Number.isFinite(v.claimRate) || v.claimRate < 0 || v.claimRate > 100) return "클레임 원가율은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.refundRate) || v.refundRate < 0 || v.refundRate > 100) return "환불률은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.paymentFeeRate) || v.paymentFeeRate < 0 || v.paymentFeeRate > 100) return "결제 수수료율은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.opsCostPerContract) || v.opsCostPerContract < 0) return "계약당 운영비는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.monthlyFixedCost) || v.monthlyFixedCost < 0) return "월 고정 운영비는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.setupCost) || v.setupCost < 0) return "초기 구축비는 0 이상이어야 합니다.";
    return "";
  }

  function setEmpty() {
    [
      "monthlyNet", "roi", "payback", "incrementalContracts", "netRevenue",
      "contributionProfit", "breakEvenAttachRate", "attachUplift", "grossRevenue",
      "refunds", "claimCost", "paymentFee", "contributionPerContract", "annualCost"
    ].forEach((k) => { refs[k].textContent = "-"; });
    refs.summary.value = "";
  }

  function render() {
    const v = readValues();
    const err = validate(v);

    refs.error.classList.toggle("show", !!err);
    refs.error.textContent = err;
    if (err) {
      refs.status.textContent = "입력값을 확인하세요";
      setEmpty();
      return;
    }

    const uplift = Math.max(v.targetAttachRate - v.currentAttachRate, 0);
    const incrementalContracts = v.ordersPerMonth * (uplift / 100);
    const grossRevenue = incrementalContracts * v.planPrice;
    const refunds = grossRevenue * (v.refundRate / 100);
    const netRevenue = grossRevenue - refunds;
    const claimCost = grossRevenue * (v.claimRate / 100);
    const paymentFee = netRevenue * (v.paymentFeeRate / 100);
    const opsCost = incrementalContracts * v.opsCostPerContract;
    const contributionProfit = netRevenue - claimCost - paymentFee - opsCost;
    const monthlyNet = contributionProfit - v.monthlyFixedCost;

    const annualCost = v.setupCost + v.monthlyFixedCost * 12;
    const annualNet = monthlyNet * 12 - v.setupCost;
    const roi = annualCost > 0 ? (annualNet / annualCost) * 100 : 0;
    const payback = monthlyNet > 0 ? v.setupCost / monthlyNet : Infinity;

    const contributionPerContract = v.planPrice * (1 - v.refundRate / 100)
      - v.planPrice * (v.claimRate / 100)
      - (v.planPrice * (1 - v.refundRate / 100) * (v.paymentFeeRate / 100))
      - v.opsCostPerContract;

    const breakEvenContracts = contributionPerContract > 0 ? v.monthlyFixedCost / contributionPerContract : Infinity;
    const breakEvenAttachRate = (v.ordersPerMonth > 0 && Number.isFinite(breakEvenContracts))
      ? v.currentAttachRate + (breakEvenContracts / v.ordersPerMonth) * 100
      : Infinity;

    refs.monthlyNet.textContent = money(monthlyNet);
    refs.roi.textContent = pct(roi, 1);
    refs.payback.textContent = Number.isFinite(payback) ? `${num(payback, 1)}개월` : "N/A";
    refs.incrementalContracts.textContent = `${num(incrementalContracts, 1)}건`;
    refs.netRevenue.textContent = money(netRevenue);
    refs.contributionProfit.textContent = money(contributionProfit);
    refs.breakEvenAttachRate.textContent = Number.isFinite(breakEvenAttachRate) ? pct(breakEvenAttachRate, 2) : "N/A";

    refs.attachUplift.textContent = `${num(uplift, 2)}%p`;
    refs.grossRevenue.textContent = money(grossRevenue);
    refs.refunds.textContent = money(refunds);
    refs.claimCost.textContent = money(claimCost);
    refs.paymentFee.textContent = money(paymentFee);
    refs.contributionPerContract.textContent = money(contributionPerContract);
    refs.annualCost.textContent = money(annualCost);

    refs.status.innerHTML = monthlyNet >= 0
      ? `<span class="good">●</span> 순이익이 발생합니다`
      : `<span class="warn">●</span> 현재 가정에서는 적자입니다`;

    refs.summary.value = [
      "[연장 보증 부착률 수익 요약]",
      `추가 보증 계약: ${num(incrementalContracts, 1)}건`,
      `월 순이익: ${money(monthlyNet)}`,
      `연간 ROI: ${pct(roi, 1)}`,
      `손익분기 부착률: ${Number.isFinite(breakEvenAttachRate) ? pct(breakEvenAttachRate, 2) : "N/A"}`
    ].join("\n");
  }

  refs.copy.addEventListener("click", async () => {
    if (!refs.summary.value.trim()) return;
    try {
      await navigator.clipboard.writeText(refs.summary.value);
      alert("요약이 복사되었습니다.");
    } catch {
      alert("클립보드 사용이 불가합니다. 수동으로 복사하세요.");
    }
  });

  refs.reset.addEventListener("click", () => {
    Object.entries(defaults).forEach(([key, value]) => {
      refs[key].value = value;
    });
    render();
  });

  [
    refs.ordersPerMonth, refs.currentAttachRate, refs.targetAttachRate, refs.planPrice,
    refs.claimRate, refs.refundRate, refs.paymentFeeRate, refs.opsCostPerContract,
    refs.monthlyFixedCost, refs.setupCost
  ].forEach((el) => el.addEventListener("input", render));

  render();
})();
