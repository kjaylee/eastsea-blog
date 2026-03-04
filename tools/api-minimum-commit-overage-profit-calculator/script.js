const $ = (id) => document.getElementById(id);

const refs = {
  accounts: $("accounts"),
  currentArpa: $("currentArpa"),
  commitFee: $("commitFee"),
  overageRevenue: $("overageRevenue"),
  grossMargin: $("grossMargin"),
  feeRate: $("feeRate"),
  monthlyProgramCost: $("monthlyProgramCost"),
  setupCost: $("setupCost"),
  months: $("months"),
  baselineProfit: $("baselineProfit"),
  scenarioProfit: $("scenarioProfit"),
  monthlyUplift: $("monthlyUplift"),
  periodNet: $("periodNet"),
  roi: $("roi"),
  payback: $("payback"),
  breakEvenCommit: $("breakEvenCommit"),
  breakEvenAccounts: $("breakEvenAccounts"),
  scenarioRevenue: $("scenarioRevenue"),
  totalProgramCost: $("totalProgramCost"),
  status: $("status"),
  error: $("error"),
  summary: $("summary"),
  copyBtn: $("copyBtn"),
  resetBtn: $("resetBtn")
};

const defaults = {
  accounts: 240,
  currentArpa: 85000,
  commitFee: 70000,
  overageRevenue: 32000,
  grossMargin: 78,
  feeRate: 4,
  monthlyProgramCost: 2800000,
  setupCost: 9000000,
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
    accounts: Number(refs.accounts.value),
    currentArpa: Number(refs.currentArpa.value),
    commitFee: Number(refs.commitFee.value),
    overageRevenue: Number(refs.overageRevenue.value),
    grossMargin: Number(refs.grossMargin.value),
    feeRate: Number(refs.feeRate.value),
    monthlyProgramCost: Number(refs.monthlyProgramCost.value),
    setupCost: Number(refs.setupCost.value),
    months: Number(refs.months.value)
  };
}

function validate(v) {
  const positiveInts = ["accounts", "months"];
  for (const key of positiveInts) {
    if (!Number.isFinite(v[key]) || v[key] < 1) {
      return "계정 수와 분석 기간은 1 이상이어야 합니다.";
    }
  }

  const nonNegative = [
    "currentArpa",
    "commitFee",
    "overageRevenue",
    "monthlyProgramCost",
    "setupCost"
  ];
  for (const key of nonNegative) {
    if (!Number.isFinite(v[key]) || v[key] < 0) {
      return "금액 입력값은 0 이상이어야 합니다.";
    }
  }

  if (!Number.isFinite(v.grossMargin) || !Number.isFinite(v.feeRate) || v.grossMargin < 0 || v.grossMargin > 100 || v.feeRate < 0 || v.feeRate > 100) {
    return "마진율/수수료율은 0~100% 범위여야 합니다.";
  }

  if (v.grossMargin <= v.feeRate) {
    return "총마진율이 수수료율보다 커야 의미 있는 비교가 가능합니다.";
  }

  return "";
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle("show", Boolean(message));
}

function clearOutputs() {
  [
    "baselineProfit",
    "scenarioProfit",
    "monthlyUplift",
    "periodNet",
    "roi",
    "payback",
    "breakEvenCommit",
    "breakEvenAccounts",
    "scenarioRevenue",
    "totalProgramCost"
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

  const netRate = (v.grossMargin - v.feeRate) / 100;
  const proposedArpa = v.commitFee + v.overageRevenue;

  const baselineProfit = v.accounts * v.currentArpa * netRate;
  const scenarioRevenue = v.accounts * proposedArpa;
  const scenarioProfit = scenarioRevenue * netRate - v.monthlyProgramCost;
  const monthlyUplift = scenarioProfit - baselineProfit;

  const totalProgramCost = v.monthlyProgramCost * v.months + v.setupCost;
  const periodNet = monthlyUplift * v.months - v.setupCost;
  const roi = totalProgramCost > 0 ? (periodNet / totalProgramCost) * 100 : 0;

  const payback = monthlyUplift > 0 ? v.setupCost / monthlyUplift : Infinity;

  const breakEvenArpa = v.currentArpa + v.monthlyProgramCost / (v.accounts * netRate);
  const breakEvenCommit = breakEvenArpa - v.overageRevenue;

  const perAccountUplift = (proposedArpa - v.currentArpa) * netRate;
  const breakEvenAccounts = perAccountUplift > 0 ? v.monthlyProgramCost / perAccountUplift : Infinity;

  refs.baselineProfit.textContent = won(baselineProfit);
  refs.scenarioProfit.textContent = won(scenarioProfit);
  refs.monthlyUplift.textContent = won(monthlyUplift);
  refs.periodNet.textContent = won(periodNet);
  refs.roi.textContent = pct(roi);
  refs.payback.textContent = Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가";
  refs.breakEvenCommit.textContent = won(Math.max(0, breakEvenCommit));
  refs.breakEvenAccounts.textContent = Number.isFinite(breakEvenAccounts) ? `${num(breakEvenAccounts, 0)} 계정` : "계산 불가";
  refs.scenarioRevenue.textContent = won(scenarioRevenue);
  refs.totalProgramCost.textContent = won(totalProgramCost);

  if (monthlyUplift > 0) {
    refs.status.innerHTML = `<span style="color: var(--good)">●</span> 월 순이익이 ${won(monthlyUplift)} 개선됩니다.`;
  } else if (monthlyUplift < 0) {
    refs.status.innerHTML = `<span style="color: var(--bad)">●</span> 현재 입력에서는 월 순이익이 ${won(Math.abs(monthlyUplift))} 감소합니다.`;
  } else {
    refs.status.innerHTML = `<span style="color: var(--warn)">●</span> 월 순이익이 손익분기 상태입니다.`;
  }

  refs.summary.value = [
    "[API 최소 커밋 + 오버리지 손익 요약]",
    `기준 월 순이익: ${won(baselineProfit)}`,
    `전환 후 월 순이익: ${won(scenarioProfit)}`,
    `월 순이익 증감: ${won(monthlyUplift)}`,
    `기간 순효과(${v.months}개월): ${won(periodNet)}`,
    `ROI: ${pct(roi)}`,
    `회수기간: ${Number.isFinite(payback) ? `${numFmt.format(payback)}개월` : "회수 불가"}`,
    `손익분기 최소 커밋/계정: ${won(Math.max(0, breakEvenCommit))}`,
    `운영비 손익분기 계정 수: ${Number.isFinite(breakEvenAccounts) ? `${num(breakEvenAccounts, 0)} 계정` : "계산 불가"}`
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
  refs.accounts,
  refs.currentArpa,
  refs.commitFee,
  refs.overageRevenue,
  refs.grossMargin,
  refs.feeRate,
  refs.monthlyProgramCost,
  refs.setupCost,
  refs.months
].forEach((input) => input.addEventListener("input", render));

refs.resetBtn.addEventListener("click", reset);
refs.copyBtn.addEventListener("click", copySummary);

render();
