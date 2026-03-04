const $ = (id) => document.getElementById(id);

const refs = {
  monthlyBudget: $("monthlyBudget"),
  cpt: $("cpt"),
  tapToInstall: $("tapToInstall"),
  installToTrial: $("installToTrial"),
  trialToPaid: $("trialToPaid"),
  price: $("price"),
  retentionMonths: $("retentionMonths"),
  storeFee: $("storeFee"),
  serviceCostPerPaid: $("serviceCostPerPaid"),
  monthlyOps: $("monthlyOps"),
  setupCost: $("setupCost"),
  months: $("months"),
  paidUsers: $("paidUsers"),
  netLtvPerPaid: $("netLtvPerPaid"),
  monthlyNetProfit: $("monthlyNetProfit"),
  periodNet: $("periodNet"),
  roi: $("roi"),
  payback: $("payback"),
  breakEvenCpt: $("breakEvenCpt"),
  breakEvenTrialToPaid: $("breakEvenTrialToPaid"),
  taps: $("taps"),
  monthlySpend: $("monthlySpend"),
  status: $("status"),
  error: $("error"),
  summary: $("summary"),
  copyBtn: $("copyBtn"),
  resetBtn: $("resetBtn")
};

const defaults = {
  monthlyBudget: 12000000,
  cpt: 3200,
  tapToInstall: 42,
  installToTrial: 34,
  trialToPaid: 29,
  price: 12500,
  retentionMonths: 5.5,
  storeFee: 15,
  serviceCostPerPaid: 6800,
  monthlyOps: 1400000,
  setupCost: 3500000,
  months: 6
};

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
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
    monthlyBudget: Number(refs.monthlyBudget.value),
    cpt: Number(refs.cpt.value),
    tapToInstall: Number(refs.tapToInstall.value),
    installToTrial: Number(refs.installToTrial.value),
    trialToPaid: Number(refs.trialToPaid.value),
    price: Number(refs.price.value),
    retentionMonths: Number(refs.retentionMonths.value),
    storeFee: Number(refs.storeFee.value),
    serviceCostPerPaid: Number(refs.serviceCostPerPaid.value),
    monthlyOps: Number(refs.monthlyOps.value),
    setupCost: Number(refs.setupCost.value),
    months: Number(refs.months.value)
  };
}

function validate(v) {
  const nonNegative = [
    "monthlyBudget",
    "price",
    "retentionMonths",
    "serviceCostPerPaid",
    "monthlyOps",
    "setupCost"
  ];

  for (const key of nonNegative) {
    if (!Number.isFinite(v[key]) || v[key] < 0) {
      return "금액/기간 입력값은 0 이상이어야 합니다.";
    }
  }

  if (!Number.isFinite(v.cpt) || v.cpt <= 0) {
    return "CPT는 0보다 커야 합니다.";
  }

  if (!Number.isFinite(v.months) || v.months < 1) {
    return "분석 기간은 1개월 이상이어야 합니다.";
  }

  for (const key of ["tapToInstall", "installToTrial", "trialToPaid", "storeFee"]) {
    if (!Number.isFinite(v[key]) || v[key] < 0 || v[key] > 100) {
      return "전환율/수수료율은 0~100% 범위여야 합니다.";
    }
  }

  if (v.storeFee >= 100) {
    return "스토어 수수료율은 100% 미만이어야 합니다.";
  }

  return "";
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle("show", Boolean(message));
}

function clearOutputs() {
  [
    "paidUsers",
    "netLtvPerPaid",
    "monthlyNetProfit",
    "periodNet",
    "roi",
    "payback",
    "breakEvenCpt",
    "breakEvenTrialToPaid",
    "taps",
    "monthlySpend"
  ].forEach((key) => {
    refs[key].textContent = "-";
  });
  refs.status.textContent = "입력값을 확인해주세요";
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

  const tapRate = v.tapToInstall / 100;
  const trialRate = v.installToTrial / 100;
  const paidRate = v.trialToPaid / 100;
  const feeRate = v.storeFee / 100;

  const taps = v.monthlyBudget / v.cpt;
  const installs = taps * tapRate;
  const paidUsers = installs * trialRate * paidRate;

  const grossLtvPerPaid = v.price * v.retentionMonths;
  const netLtvPerPaid = grossLtvPerPaid * (1 - feeRate) - v.serviceCostPerPaid;

  const grossReturn = paidUsers * netLtvPerPaid;
  const monthlyNetProfit = grossReturn - v.monthlyBudget - v.monthlyOps;

  const totalSpend = (v.monthlyBudget + v.monthlyOps) * v.months + v.setupCost;
  const periodNet = monthlyNetProfit * v.months - v.setupCost;
  const roi = totalSpend > 0 ? (periodNet / totalSpend) * 100 : 0;
  const payback = monthlyNetProfit > 0 ? v.setupCost / monthlyNetProfit : Infinity;

  const funnelNoPaid = tapRate * trialRate;
  const breakEvenTrialToPaid =
    v.monthlyBudget > 0 && funnelNoPaid > 0 && netLtvPerPaid > 0
      ? ((v.monthlyBudget + v.monthlyOps) * v.cpt) / (v.monthlyBudget * funnelNoPaid * netLtvPerPaid) * 100
      : Infinity;

  const fullFunnel = tapRate * trialRate * paidRate;
  const breakEvenCpt =
    v.monthlyBudget > 0 && fullFunnel > 0 && netLtvPerPaid > 0
      ? (v.monthlyBudget * fullFunnel * netLtvPerPaid) / (v.monthlyBudget + v.monthlyOps)
      : Infinity;

  refs.paidUsers.textContent = `${num(paidUsers, 1)}명`;
  refs.netLtvPerPaid.textContent = won(netLtvPerPaid);
  refs.monthlyNetProfit.textContent = won(monthlyNetProfit);
  refs.periodNet.textContent = won(periodNet);
  refs.roi.textContent = pct(roi);
  refs.payback.textContent = Number.isFinite(payback) ? `${num(payback, 1)}개월` : "회수 불가";
  refs.breakEvenCpt.textContent = Number.isFinite(breakEvenCpt) ? `${won(breakEvenCpt)}/tap` : "계산 불가";
  refs.breakEvenTrialToPaid.textContent = Number.isFinite(breakEvenTrialToPaid) ? pct(breakEvenTrialToPaid, 2) : "계산 불가";
  refs.taps.textContent = `${num(taps, 0)} taps`;
  refs.monthlySpend.textContent = won(v.monthlyBudget + v.monthlyOps);

  if (monthlyNetProfit > 0) {
    refs.status.innerHTML = `<span style="color: var(--good)">●</span> 현재 입력 기준 월 순이익 ${won(monthlyNetProfit)}입니다.`;
  } else if (monthlyNetProfit < 0) {
    refs.status.innerHTML = `<span style="color: var(--bad)">●</span> 현재 입력 기준 월 손실 ${won(Math.abs(monthlyNetProfit))}입니다.`;
  } else {
    refs.status.innerHTML = `<span style="color: var(--warn)">●</span> 월 손익분기 상태입니다.`;
  }

  refs.summary.value = [
    "[Apple Search Ads CPT·LTV ROI 요약]",
    `월 광고비: ${won(v.monthlyBudget)} / CPT: ${won(v.cpt)}`,
    `월 예상 유료 전환: ${num(paidUsers, 1)}명`,
    `유료 1인당 순LTV: ${won(netLtvPerPaid)}`,
    `월 순이익: ${won(monthlyNetProfit)}`,
    `기간 순효과(${v.months}개월): ${won(periodNet)}`,
    `ROI: ${pct(roi)}`,
    `회수기간: ${Number.isFinite(payback) ? `${num(payback, 1)}개월` : "회수 불가"}`,
    `손익분기 CPT: ${Number.isFinite(breakEvenCpt) ? `${won(breakEvenCpt)}/tap` : "계산 불가"}`,
    `손익분기 Trial→Paid 전환율: ${Number.isFinite(breakEvenTrialToPaid) ? pct(breakEvenTrialToPaid, 2) : "계산 불가"}`
  ].join("\n");
}

function reset() {
  Object.entries(defaults).forEach(([key, value]) => {
    refs[key].value = value;
  });
  render();
}

async function copySummary() {
  if (!refs.summary.value.trim()) return;
  try {
    await navigator.clipboard.writeText(refs.summary.value);
    refs.status.innerHTML = '<span style="color: var(--good)">●</span> 요약을 클립보드에 복사했습니다.';
  } catch {
    refs.status.innerHTML = '<span style="color: var(--warn)">●</span> 클립보드 접근 실패. 직접 복사해주세요.';
  }
}

[
  refs.monthlyBudget,
  refs.cpt,
  refs.tapToInstall,
  refs.installToTrial,
  refs.trialToPaid,
  refs.price,
  refs.retentionMonths,
  refs.storeFee,
  refs.serviceCostPerPaid,
  refs.monthlyOps,
  refs.setupCost,
  refs.months
].forEach((input) => input.addEventListener("input", render));

refs.resetBtn.addEventListener("click", reset);
refs.copyBtn.addEventListener("click", copySummary);

render();
