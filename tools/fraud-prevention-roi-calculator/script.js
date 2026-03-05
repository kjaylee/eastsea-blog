const $ = (id) => document.getElementById(id);

const refs = {
  orders: $("orders"),
  aov: $("aov"),
  fraudRate: $("fraudRate"),
  chargebackFee: $("chargebackFee"),
  blockRate: $("blockRate"),
  falsePositiveRate: $("falsePositiveRate"),
  grossMargin: $("grossMargin"),
  monthlyCost: $("monthlyCost"),
  setupCost: $("setupCost"),
  months: $("months"),
  baselineLoss: $("baselineLoss"),
  preventedLoss: $("preventedLoss"),
  falsePosLoss: $("falsePosLoss"),
  monthlyNet: $("monthlyNet"),
  periodNet: $("periodNet"),
  roi: $("roi"),
  payback: $("payback"),
  breakEven: $("breakEven"),
  remainingLoss: $("remainingLoss"),
  fraudOrders: $("fraudOrders"),
  preventedOrders: $("preventedOrders"),
  falsePosOrders: $("falsePosOrders"),
  totalCost: $("totalCost"),
  status: $("status"),
  error: $("error"),
  summary: $("summary"),
  copyBtn: $("copyBtn"),
  resetBtn: $("resetBtn")
};

const defaults = {
  orders: 12000,
  aov: 58000,
  fraudRate: 1.2,
  chargebackFee: 25000,
  blockRate: 60,
  falsePositiveRate: 0.4,
  grossMargin: 45,
  monthlyCost: 3000000,
  setupCost: 8000000,
  months: 12
};

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

const numFmt = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1
});

const intFmt = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0
});

function won(value) {
  return KRW.format(Number.isFinite(value) ? value : 0);
}

function num(value, digits = 1) {
  return Number(value).toLocaleString("ko-KR", { maximumFractionDigits: digits });
}

function pct(value, digits = 1) {
  return `${num(value, digits)}%`;
}

function parseValues() {
  return {
    orders: Number(refs.orders.value),
    aov: Number(refs.aov.value),
    fraudRate: Number(refs.fraudRate.value),
    chargebackFee: Number(refs.chargebackFee.value),
    blockRate: Number(refs.blockRate.value),
    falsePositiveRate: Number(refs.falsePositiveRate.value),
    grossMargin: Number(refs.grossMargin.value),
    monthlyCost: Number(refs.monthlyCost.value),
    setupCost: Number(refs.setupCost.value),
    months: Number(refs.months.value)
  };
}

function validate(v) {
  if (!Number.isFinite(v.orders) || v.orders < 1 || !Number.isFinite(v.months) || v.months < 1) {
    return "월 주문 수와 분석 기간은 1 이상이어야 합니다.";
  }
  if (!Number.isFinite(v.aov) || v.aov <= 0) {
    return "평균 주문 금액은 0보다 커야 합니다.";
  }
  const rates = ["fraudRate", "blockRate", "falsePositiveRate", "grossMargin"];
  for (const key of rates) {
    if (!Number.isFinite(v[key]) || v[key] < 0 || v[key] > 100) {
      return "비율 입력값은 0~100% 범위여야 합니다.";
    }
  }
  const costs = ["chargebackFee", "monthlyCost", "setupCost"];
  for (const key of costs) {
    if (!Number.isFinite(v[key]) || v[key] < 0) {
      return "비용 입력값은 0 이상이어야 합니다.";
    }
  }
  return "";
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle("show", Boolean(message));
}

function clearOutputs() {
  [
    "baselineLoss",
    "preventedLoss",
    "falsePosLoss",
    "monthlyNet",
    "periodNet",
    "roi",
    "payback",
    "breakEven",
    "remainingLoss",
    "fraudOrders",
    "preventedOrders",
    "falsePosOrders",
    "totalCost"
  ].forEach((key) => {
    refs[key].textContent = "-";
  });
  refs.status.textContent = "입력값을 확인하세요";
  refs.summary.value = "";
}

function render() {
  const v = parseValues();
  const error = validate(v);
  if (error) {
    setError(error);
    clearOutputs();
    return;
  }

  setError("");

  const fraudOrders = v.orders * (v.fraudRate / 100);
  const legitOrders = v.orders - fraudOrders;
  const lossPerFraud = v.aov + v.chargebackFee;
  const baselineLoss = fraudOrders * lossPerFraud;

  const preventedOrders = fraudOrders * (v.blockRate / 100);
  const preventedLoss = preventedOrders * lossPerFraud;
  const remainingLoss = baselineLoss - preventedLoss;

  const marginPerOrder = v.aov * (v.grossMargin / 100);
  const falsePosOrders = legitOrders * (v.falsePositiveRate / 100);
  const falsePosLoss = falsePosOrders * marginPerOrder;

  const monthlyNet = preventedLoss - falsePosLoss - v.monthlyCost;
  const totalCost = v.monthlyCost * v.months + v.setupCost;
  const periodNet = monthlyNet * v.months - v.setupCost;
  const roi = totalCost > 0 ? (periodNet / totalCost) * 100 : 0;
  const payback = monthlyNet > 0 ? v.setupCost / monthlyNet : Infinity;

  const breakEvenRate = (fraudOrders > 0 && lossPerFraud > 0)
    ? ((v.monthlyCost + falsePosLoss) / (fraudOrders * lossPerFraud)) * 100
    : Infinity;

  refs.baselineLoss.textContent = won(baselineLoss);
  refs.preventedLoss.textContent = won(preventedLoss);
  refs.falsePosLoss.textContent = won(falsePosLoss);
  refs.monthlyNet.textContent = won(monthlyNet);
  refs.periodNet.textContent = won(periodNet);
  refs.roi.textContent = pct(roi, 1);
  refs.payback.textContent = Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가";

  let breakEvenText = "사기 주문 없음";
  if (Number.isFinite(breakEvenRate)) {
    breakEvenText = breakEvenRate > 100 ? "100% 초과" : pct(Math.max(0, breakEvenRate), 1);
  }
  refs.breakEven.textContent = breakEvenText;

  refs.remainingLoss.textContent = won(remainingLoss);
  refs.fraudOrders.textContent = `${intFmt.format(fraudOrders)}건`;
  refs.preventedOrders.textContent = `${intFmt.format(preventedOrders)}건`;
  refs.falsePosOrders.textContent = `${intFmt.format(falsePosOrders)}건`;
  refs.totalCost.textContent = won(totalCost);

  if (monthlyNet > 0) {
    refs.status.innerHTML = `<span style="color: var(--good)">●</span> 월 ${won(monthlyNet)} 순효과가 발생합니다.`;
  } else if (monthlyNet < 0) {
    refs.status.innerHTML = `<span style="color: var(--bad)">●</span> 월 ${won(Math.abs(monthlyNet))} 순손실이 예상됩니다.`;
  } else {
    refs.status.innerHTML = `<span style="color: var(--warn)">●</span> 손익분기 상태입니다.`;
  }

  refs.summary.value = [
    "[Fraud Prevention ROI 요약]",
    `월 사기 손실(기준): ${won(baselineLoss)}`,
    `월 차단 방어액: ${won(preventedLoss)}`,
    `월 오탐 손실: ${won(falsePosLoss)}`,
    `월 순효과: ${won(monthlyNet)}`,
    `기간 순효과(${v.months}개월): ${won(periodNet)}`,
    `ROI: ${pct(roi, 1)}`,
    `회수기간: ${Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가"}`,
    `손익분기 차단율: ${breakEvenText}`
  ].join("\n");
}

function reset() {
  Object.entries(defaults).forEach(([key, value]) => {
    refs[key].value = value;
  });
  render();
}

refs.copyBtn.addEventListener("click", async () => {
  if (!refs.summary.value.trim()) return;
  try {
    await navigator.clipboard.writeText(refs.summary.value);
    alert("요약이 복사되었습니다.");
  } catch (error) {
    alert("복사 권한이 없어 수동 복사를 해주세요.");
  }
});

refs.resetBtn.addEventListener("click", reset);

["input", "change"].forEach((evt) => {
  [
    refs.orders,
    refs.aov,
    refs.fraudRate,
    refs.chargebackFee,
    refs.blockRate,
    refs.falsePositiveRate,
    refs.grossMargin,
    refs.monthlyCost,
    refs.setupCost,
    refs.months
  ].forEach((el) => el.addEventListener(evt, render));
});

render();
