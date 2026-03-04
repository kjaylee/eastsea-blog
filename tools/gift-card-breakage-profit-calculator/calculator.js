(() => {
  const $ = (id) => document.getElementById(id);
  const won = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  });
  const num = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

  const inputIds = [
    "monthlyIssued",
    "breakageRatePct",
    "redeemedMarginPct",
    "processingFeePct",
    "fraudLossPct",
    "annualFloatYieldPct",
    "avgLiabilityMonths",
    "monthlyOpsCost",
    "setupCost",
    "analysisMonths",
    "targetPaybackMonths"
  ];

  const outputIds = [
    "monthlyLifecycleGross",
    "monthlyNetEffect",
    "periodNetProfit",
    "roiPct",
    "paybackMonths",
    "breakEvenBreakage",
    "profitPerIssuedWon",
    "breakageProfit",
    "redeemedGrossProfit",
    "floatIncome",
    "processingCost",
    "fraudLoss",
    "opsCost",
    "periodOpsCost"
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const asPct = (value) => value / 100;
  const fmtWon = (value) => won.format(Number.isFinite(value) ? value : 0);
  const fmtPct = (value) => `${num.format(value)}%`;

  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };

  const showError = (message) => {
    const error = $("error");
    error.textContent = message;
    error.classList.toggle("show", Boolean(message));
  };

  const clearOutputs = () => {
    outputIds.forEach((id) => setText(id, "-"));
    setText("status", "계산 대기");
    $("summary").value = "";
  };

  const readValues = () => {
    const v = {};
    inputIds.forEach((id) => {
      v[id] = Number($(id).value);
    });
    return v;
  };

  const calculate = () => {
    const v = readValues();

    if (!Number.isFinite(v.monthlyIssued) || v.monthlyIssued <= 0) {
      showError("월 기프트카드 발행액은 0보다 커야 합니다.");
      clearOutputs();
      return;
    }
    if (!Number.isFinite(v.analysisMonths) || v.analysisMonths < 1 || !Number.isInteger(v.analysisMonths)) {
      showError("분석 기간은 1 이상의 정수(개월)여야 합니다.");
      clearOutputs();
      return;
    }
    if (!Number.isFinite(v.targetPaybackMonths) || v.targetPaybackMonths < 1 || !Number.isInteger(v.targetPaybackMonths)) {
      showError("목표 회수기간은 1 이상의 정수(개월)여야 합니다.");
      clearOutputs();
      return;
    }

    const breakageRate = clamp(asPct(v.breakageRatePct), 0, 1);
    const redeemedMargin = clamp(asPct(v.redeemedMarginPct), 0, 1);
    const processingFee = clamp(asPct(v.processingFeePct), 0, 1);
    const fraudLoss = clamp(asPct(v.fraudLossPct), 0, 1);
    const annualFloatYield = clamp(asPct(v.annualFloatYieldPct), 0, 1);
    const liabilityMonths = clamp(v.avgLiabilityMonths, 0, 60);

    const monthlyIssued = Math.max(0, v.monthlyIssued);
    const monthlyOpsCost = Math.max(0, v.monthlyOpsCost);
    const setupCost = Math.max(0, v.setupCost);

    const redeemedRate = 1 - breakageRate;

    const breakageProfit = monthlyIssued * breakageRate;
    const redeemedGrossProfit = monthlyIssued * redeemedRate * redeemedMargin;
    const floatIncome = monthlyIssued * annualFloatYield * (liabilityMonths / 12);

    const processingCost = monthlyIssued * processingFee;
    const fraudCost = monthlyIssued * fraudLoss;

    const monthlyLifecycleGross = breakageProfit + redeemedGrossProfit + floatIncome;
    const monthlyNetEffect = monthlyLifecycleGross - processingCost - fraudCost - monthlyOpsCost;

    const periodOpsCost = monthlyOpsCost * v.analysisMonths;
    const periodNetProfit = monthlyNetEffect * v.analysisMonths - setupCost;

    const investmentBase = setupCost + periodOpsCost;
    const roi = investmentBase > 0 ? (periodNetProfit / investmentBase) * 100 : 0;
    const paybackMonths = monthlyNetEffect > 0 ? setupCost / monthlyNetEffect : Infinity;

    const targetMonthlyNet = setupCost / v.targetPaybackMonths;
    const baseWithoutBreakage = monthlyIssued * (redeemedMargin + annualFloatYield * (liabilityMonths / 12) - processingFee - fraudLoss) - monthlyOpsCost;
    const sensitivity = monthlyIssued * (1 - redeemedMargin);

    let breakEvenBreakage;
    let breakEvenLabel;
    if (sensitivity <= 0) {
      breakEvenBreakage = NaN;
      breakEvenLabel = "N/A";
    } else {
      breakEvenBreakage = (targetMonthlyNet - baseWithoutBreakage) / sensitivity;
      breakEvenLabel = breakEvenBreakage <= 0
        ? "0% 이하"
        : breakEvenBreakage >= 1
          ? "100% 초과"
          : fmtPct(breakEvenBreakage * 100);
    }

    const profitPerIssuedWon = monthlyIssued > 0 ? monthlyLifecycleGross / monthlyIssued : 0;

    let statusClass = "warn";
    let statusText = "⚪ 재검토 필요: 전제값을 조정해 수익 여지를 확인하세요.";
    if (monthlyNetEffect > 0 && paybackMonths <= v.targetPaybackMonths) {
      statusClass = "good";
      statusText = `🟢 실행 우선: 목표 회수기간 ${v.targetPaybackMonths}개월 이내 달성 예상`;
    } else if (monthlyNetEffect > 0) {
      statusClass = "warn";
      statusText = `🟡 수익은 양호하나 회수기간 ${num.format(paybackMonths)}개월로 목표보다 깁니다.`;
    } else {
      statusClass = "bad";
      statusText = "🔴 적자 가능성: 수수료/부정사용 손실 또는 운영비 구조를 먼저 줄이세요.";
    }

    showError("");

    setText("monthlyLifecycleGross", fmtWon(monthlyLifecycleGross));
    setText("monthlyNetEffect", fmtWon(monthlyNetEffect));
    setText("periodNetProfit", fmtWon(periodNetProfit));
    setText("roiPct", fmtPct(roi));
    setText("paybackMonths", Number.isFinite(paybackMonths) ? `${num.format(paybackMonths)}개월` : "회수 불가");
    setText("breakEvenBreakage", breakEvenLabel);
    setText("profitPerIssuedWon", `${num.format(profitPerIssuedWon)}원`);

    setText("breakageProfit", fmtWon(breakageProfit));
    setText("redeemedGrossProfit", fmtWon(redeemedGrossProfit));
    setText("floatIncome", fmtWon(floatIncome));
    setText("processingCost", fmtWon(processingCost));
    setText("fraudLoss", fmtWon(fraudCost));
    setText("opsCost", fmtWon(monthlyOpsCost));
    setText("periodOpsCost", fmtWon(periodOpsCost));

    const status = $("status");
    status.innerHTML = `<span class="dot ${statusClass}">●</span> ${statusText}`;

    const summaryLines = [
      "[Gift Card Breakage ROI Summary]",
      `월 발행액: ${fmtWon(monthlyIssued)}`,
      `브레이키지율: ${fmtPct(breakageRate * 100)} | 환전 구간 총이익률: ${fmtPct(redeemedMargin * 100)}`,
      `월 라이프사이클 총이익: ${fmtWon(monthlyLifecycleGross)}`,
      `월 순효과: ${fmtWon(monthlyNetEffect)} | 분석기간 순이익: ${fmtWon(periodNetProfit)}`,
      `ROI: ${fmtPct(roi)} | 회수기간: ${Number.isFinite(paybackMonths) ? `${num.format(paybackMonths)}개월` : "회수 불가"}`,
      `목표 ${v.targetPaybackMonths}개월 기준 손익분기 브레이키지율: ${breakEvenLabel}`,
      `판정: ${statusText.replace(/^🟢|^🟡|^🔴/, "").trim()}`
    ];

    $("summary").value = summaryLines.join("\n");
  };

  const resetDefaults = () => {
    inputIds.forEach((id) => {
      const el = $(id);
      if (el.dataset.default !== undefined) {
        el.value = el.dataset.default;
      }
    });
    calculate();
  };

  inputIds.forEach((id) => {
    const el = $(id);
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  $("copyBtn").addEventListener("click", async () => {
    const text = $("summary").value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const btn = $("copyBtn");
      const original = btn.textContent;
      btn.textContent = "복사 완료";
      setTimeout(() => {
        btn.textContent = original;
      }, 1200);
    } catch {
      showError("복사에 실패했습니다. 요약 텍스트를 직접 선택해 복사하세요.");
    }
  });

  $("resetBtn").addEventListener("click", resetDefaults);

  calculate();
})();
