const $ = (id) => document.getElementById(id);

const refs = {
  dau: $("dau"),
  currentImpressions: $("currentImpressions"),
  targetImpressions: $("targetImpressions"),
  ecpm: $("ecpm"),
  fillRate: $("fillRate"),
  publisherShare: $("publisherShare"),
  servingCostCpm: $("servingCostCpm"),
  retentionLift: $("retentionLift"),
  profitPerRetainedUser: $("profitPerRetainedUser"),
  monthlyProgramCost: $("monthlyProgramCost"),
  setupCost: $("setupCost"),
  months: $("months"),

  currentAdProfit: $("currentAdProfit"),
  targetAdProfit: $("targetAdProfit"),
  adDelta: $("adDelta"),
  retentionValue: $("retentionValue"),
  monthlyNet: $("monthlyNet"),
  roi: $("roi"),
  periodNet: $("periodNet"),
  payback: $("payback"),
  breakEvenTargetImpressions: $("breakEvenTargetImpressions"),
  retainedUsers: $("retainedUsers"),
  totalInvestment: $("totalInvestment"),

  status: $("status"),
  error: $("error"),
  summary: $("summary"),
  copyBtn: $("copyBtn"),
  resetBtn: $("resetBtn")
};

const defaults = {
  dau: 120000,
  currentImpressions: 9.5,
  targetImpressions: 8.2,
  ecpm: 6400,
  fillRate: 92,
  publisherShare: 68,
  servingCostCpm: 260,
  retentionLift: 0.45,
  profitPerRetainedUser: 3700,
  monthlyProgramCost: 2800000,
  setupCost: 12000000,
  months: 12
};

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

const numFmt = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2
});

function won(value) {
  return KRW.format(Number.isFinite(value) ? value : 0);
}

function num(value, digits = 2) {
  return Number(value).toLocaleString("ko-KR", { maximumFractionDigits: digits });
}

function pct(value, digits = 1) {
  return `${num(value, digits)}%`;
}

function parseValues() {
  return {
    dau: Number(refs.dau.value),
    currentImpressions: Number(refs.currentImpressions.value),
    targetImpressions: Number(refs.targetImpressions.value),
    ecpm: Number(refs.ecpm.value),
    fillRate: Number(refs.fillRate.value),
    publisherShare: Number(refs.publisherShare.value),
    servingCostCpm: Number(refs.servingCostCpm.value),
    retentionLift: Number(refs.retentionLift.value),
    profitPerRetainedUser: Number(refs.profitPerRetainedUser.value),
    monthlyProgramCost: Number(refs.monthlyProgramCost.value),
    setupCost: Number(refs.setupCost.value),
    months: Number(refs.months.value)
  };
}

function validate(v) {
  if (!Number.isFinite(v.dau) || v.dau < 1 || !Number.isFinite(v.months) || v.months < 1) {
    return "DAU와 분석 기간은 1 이상이어야 합니다.";
  }

  const nonNegative = [
    "currentImpressions",
    "targetImpressions",
    "ecpm",
    "servingCostCpm",
    "retentionLift",
    "profitPerRetainedUser",
    "monthlyProgramCost",
    "setupCost"
  ];

  for (const key of nonNegative) {
    if (!Number.isFinite(v[key]) || v[key] < 0) {
      return "노출수/금액/개선폭 입력값은 0 이상이어야 합니다.";
    }
  }

  const percentageKeys = ["fillRate", "publisherShare", "retentionLift"];
  for (const key of percentageKeys) {
    if (!Number.isFinite(v[key]) || v[key] < 0 || v[key] > 100) {
      return "퍼센트 입력값은 0~100 범위여야 합니다.";
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
    "currentAdProfit",
    "targetAdProfit",
    "adDelta",
    "retentionValue",
    "monthlyNet",
    "roi",
    "periodNet",
    "payback",
    "breakEvenTargetImpressions",
    "retainedUsers",
    "totalInvestment"
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

  const k = v.dau * 30 * (v.fillRate / 100) / 1000;
  const unitMarginCpm = v.ecpm * (v.publisherShare / 100) - v.servingCostCpm;

  const currentAdProfit = v.currentImpressions * k * unitMarginCpm;
  const targetAdProfit = v.targetImpressions * k * unitMarginCpm;
  const adDelta = targetAdProfit - currentAdProfit;

  const retainedUsers = v.dau * (v.retentionLift / 100);
  const retentionValue = retainedUsers * v.profitPerRetainedUser;

  const monthlyNet = adDelta + retentionValue - v.monthlyProgramCost;
  const totalInvestment = v.setupCost + v.monthlyProgramCost * v.months;
  const periodNet = monthlyNet * v.months - v.setupCost;
  const roi = totalInvestment > 0 ? (periodNet / totalInvestment) * 100 : 0;
  const payback = monthlyNet > 0 ? v.setupCost / monthlyNet : Infinity;

  const breakEvenDenominator = k * unitMarginCpm;
  const breakEvenTargetImpressions =
    breakEvenDenominator > 0
      ? v.currentImpressions + (v.monthlyProgramCost - retentionValue) / breakEvenDenominator
      : Infinity;

  refs.currentAdProfit.textContent = won(currentAdProfit);
  refs.targetAdProfit.textContent = won(targetAdProfit);
  refs.adDelta.textContent = won(adDelta);
  refs.retentionValue.textContent = won(retentionValue);
  refs.monthlyNet.textContent = won(monthlyNet);
  refs.roi.textContent = pct(roi);
  refs.periodNet.textContent = won(periodNet);
  refs.payback.textContent = Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가";
  refs.breakEvenTargetImpressions.textContent = Number.isFinite(breakEvenTargetImpressions)
    ? `${num(Math.max(0, breakEvenTargetImpressions), 2)} 회/일`
    : "계산 불가";
  refs.retainedUsers.textContent = `${num(retainedUsers, 0)} 명`;
  refs.totalInvestment.textContent = won(totalInvestment);

  if (monthlyNet > 0) {
    refs.status.innerHTML = `<span style="color: var(--good)">●</span> 월 순효과 ${won(monthlyNet)} (개선)`;
  } else if (monthlyNet < 0) {
    refs.status.innerHTML = `<span style="color: var(--bad)">●</span> 월 순효과 ${won(Math.abs(monthlyNet))} (감소)`;
  } else {
    refs.status.innerHTML = `<span style="color: var(--warn)">●</span> 월 손익분기 상태`;
  }

  refs.summary.value = [
    "[모바일 광고 빈도 캡 ROI 요약]",
    `현재 노출수: ${num(v.currentImpressions, 2)}회/일`,
    `목표 노출수: ${num(v.targetImpressions, 2)}회/일`,
    `현재 월 광고이익: ${won(currentAdProfit)}`,
    `목표 월 광고이익: ${won(targetAdProfit)}`,
    `광고이익 증감: ${won(adDelta)}`,
    `리텐션 가치(월): ${won(retentionValue)}`,
    `월 순효과: ${won(monthlyNet)}`,
    `기간 순효과(${v.months}개월): ${won(periodNet)}`,
    `ROI: ${pct(roi)}`,
    `회수기간: ${Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가"}`,
    `손익분기 목표 노출수: ${Number.isFinite(breakEvenTargetImpressions) ? `${num(Math.max(0, breakEvenTargetImpressions), 2)}회/일` : "계산 불가"}`
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
    refs.status.innerHTML = `<span style="color: var(--good)">●</span> 요약을 클립보드에 복사했습니다.`;
  } catch {
    refs.status.innerHTML = `<span style="color: var(--warn)">●</span> 클립보드 접근 실패. 직접 복사해주세요.`;
  }
}

[
  refs.dau,
  refs.currentImpressions,
  refs.targetImpressions,
  refs.ecpm,
  refs.fillRate,
  refs.publisherShare,
  refs.servingCostCpm,
  refs.retentionLift,
  refs.profitPerRetainedUser,
  refs.monthlyProgramCost,
  refs.setupCost,
  refs.months
].forEach((input) => input.addEventListener("input", render));

refs.resetBtn.addEventListener("click", reset);
refs.copyBtn.addEventListener("click", copySummary);

render();
