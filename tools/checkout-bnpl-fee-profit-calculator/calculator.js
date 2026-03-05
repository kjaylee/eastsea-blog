(() => {
  const $ = (id) => document.getElementById(id);

  const refs = {
    sessions: $("sessions"),
    baseCvr: $("baseCvr"),
    aov: $("aov"),
    grossMargin: $("grossMargin"),
    bnplShare: $("bnplShare"),
    bnplLiftPp: $("bnplLiftPp"),
    aovLift: $("aovLift"),
    bnplFeeRate: $("bnplFeeRate"),
    bnplFixedFee: $("bnplFixedFee"),
    bnplLossRate: $("bnplLossRate"),
    monthlyOps: $("monthlyOps"),
    setupCost: $("setupCost"),

    monthlyNet: $("monthlyNet"),
    annualNet: $("annualNet"),
    roi: $("roi"),
    payback: $("payback"),
    incrementalOrders: $("incrementalOrders"),
    breakEvenLift: $("breakEvenLift"),

    bnplOrders: $("bnplOrders"),
    incrementalGross: $("incrementalGross"),
    bnplVariableCost: $("bnplVariableCost"),
    monthlyRunRate: $("monthlyRunRate"),
    annualCost: $("annualCost"),

    status: $("status"),
    error: $("error"),
    summary: $("summary"),
    copy: $("copy"),
    reset: $("reset")
  };

  const defaults = {
    sessions: 120000,
    baseCvr: 2.6,
    aov: 72000,
    grossMargin: 43,
    bnplShare: 28,
    bnplLiftPp: 0.9,
    aovLift: 11,
    bnplFeeRate: 3.5,
    bnplFixedFee: 280,
    bnplLossRate: 0.45,
    monthlyOps: 2500000,
    setupCost: 18000000
  };

  const nf0 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
  const money = (v) => new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(Number.isFinite(v) ? v : 0);
  const pct = (v, d = 2) => `${Number(v).toLocaleString("ko-KR", { maximumFractionDigits: d })}%`;

  function readValues() {
    return {
      sessions: Number(refs.sessions.value),
      baseCvr: Number(refs.baseCvr.value),
      aov: Number(refs.aov.value),
      grossMargin: Number(refs.grossMargin.value),
      bnplShare: Number(refs.bnplShare.value),
      bnplLiftPp: Number(refs.bnplLiftPp.value),
      aovLift: Number(refs.aovLift.value),
      bnplFeeRate: Number(refs.bnplFeeRate.value),
      bnplFixedFee: Number(refs.bnplFixedFee.value),
      bnplLossRate: Number(refs.bnplLossRate.value),
      monthlyOps: Number(refs.monthlyOps.value),
      setupCost: Number(refs.setupCost.value)
    };
  }

  function validate(v) {
    if (!Number.isFinite(v.sessions) || v.sessions < 0) return "월 체크아웃 세션 수는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.baseCvr) || v.baseCvr < 0 || v.baseCvr > 100) return "현재 결제 전환율은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.aov) || v.aov < 0) return "객단가 AOV는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.grossMargin) || v.grossMargin < 0 || v.grossMargin > 100) return "매출총이익률은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.bnplShare) || v.bnplShare < 0 || v.bnplShare > 100) return "BNPL 채택 비중은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.bnplLiftPp) || v.bnplLiftPp < 0) return "BNPL 전환 상승폭은 0 이상이어야 합니다.";
    if (!Number.isFinite(v.aovLift) || v.aovLift < 0) return "BNPL 객단가 상승률은 0 이상이어야 합니다.";
    if (!Number.isFinite(v.bnplFeeRate) || v.bnplFeeRate < 0 || v.bnplFeeRate > 100) return "BNPL 수수료율은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.bnplFixedFee) || v.bnplFixedFee < 0) return "BNPL 고정수수료는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.bnplLossRate) || v.bnplLossRate < 0 || v.bnplLossRate > 100) return "대손/차지백률은 0~100% 범위여야 합니다.";
    if (!Number.isFinite(v.monthlyOps) || v.monthlyOps < 0) return "월 운영비는 0 이상이어야 합니다.";
    if (!Number.isFinite(v.setupCost) || v.setupCost < 0) return "초기 구축비는 0 이상이어야 합니다.";
    return "";
  }

  function scenario(v, overrideLiftPp = null) {
    const baseCvr = v.baseCvr / 100;
    const share = v.bnplShare / 100;
    const margin = v.grossMargin / 100;
    const lift = (overrideLiftPp ?? v.bnplLiftPp) / 100;
    const aovBnpl = v.aov * (1 + v.aovLift / 100);

    const baseOrders = v.sessions * baseCvr;
    const baseRevenue = baseOrders * v.aov;
    const baseGross = baseRevenue * margin;

    const bnplSessions = v.sessions * share;
    const normalSessions = v.sessions - bnplSessions;
    const bnplCvr = Math.min(1, baseCvr + lift);

    const normalOrders = normalSessions * baseCvr;
    const bnplOrders = bnplSessions * bnplCvr;
    const totalOrders = normalOrders + bnplOrders;

    const normalRevenue = normalOrders * v.aov;
    const bnplRevenue = bnplOrders * aovBnpl;
    const totalRevenue = normalRevenue + bnplRevenue;
    const totalGross = totalRevenue * margin;

    const incrementalOrders = totalOrders - baseOrders;
    const incrementalGross = totalGross - baseGross;

    const bnplFee = bnplRevenue * (v.bnplFeeRate / 100);
    const bnplFixed = bnplOrders * v.bnplFixedFee;
    const bnplLoss = bnplRevenue * (v.bnplLossRate / 100);
    const bnplVariableCost = bnplFee + bnplFixed + bnplLoss;

    const monthlyRunRate = incrementalGross - bnplVariableCost - v.monthlyOps;
    const annualCost = v.setupCost + (v.monthlyOps * 12);
    const annualNet = (incrementalGross - bnplVariableCost) * 12 - annualCost;
    const roi = annualCost > 0 ? (annualNet / annualCost) * 100 : 0;

    return {
      incrementalOrders,
      bnplOrders,
      incrementalGross,
      bnplVariableCost,
      monthlyRunRate,
      annualCost,
      annualNet,
      roi
    };
  }

  function findBreakEvenLiftPp(v) {
    const lowScenario = scenario(v, 0);
    if (lowScenario.monthlyRunRate >= 0) return 0;

    const highLift = 30; // pp upper bound
    const highScenario = scenario(v, highLift);
    if (highScenario.monthlyRunRate < 0) return Infinity;

    let lo = 0;
    let hi = highLift;

    for (let i = 0; i < 40; i += 1) {
      const mid = (lo + hi) / 2;
      const s = scenario(v, mid);
      if (s.monthlyRunRate >= 0) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  function setEmpty() {
    [
      "monthlyNet", "annualNet", "roi", "payback", "incrementalOrders", "breakEvenLift",
      "bnplOrders", "incrementalGross", "bnplVariableCost", "monthlyRunRate", "annualCost"
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

    const result = scenario(v);
    const breakEvenLift = findBreakEvenLiftPp(v);

    const payback = result.monthlyRunRate > 0 ? v.setupCost / result.monthlyRunRate : Infinity;

    refs.monthlyNet.textContent = money(result.monthlyRunRate);
    refs.annualNet.textContent = money(result.annualNet);
    refs.roi.textContent = pct(result.roi, 2);
    refs.payback.textContent = Number.isFinite(payback) ? `${payback.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}개월` : "N/A";
    refs.incrementalOrders.textContent = `${result.incrementalOrders.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}건`;
    refs.breakEvenLift.textContent = Number.isFinite(breakEvenLift) ? `${breakEvenLift.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}pp` : "N/A";

    refs.bnplOrders.textContent = `${result.bnplOrders.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}건`;
    refs.incrementalGross.textContent = money(result.incrementalGross);
    refs.bnplVariableCost.textContent = money(result.bnplVariableCost);
    refs.monthlyRunRate.textContent = money(result.monthlyRunRate);
    refs.annualCost.textContent = money(result.annualCost);

    if (result.monthlyRunRate > 0) {
      refs.status.innerHTML = '<span class="good">●</span> 월 순효과 플러스 — 도입 타당성 높음';
    } else {
      refs.status.innerHTML = '<span class="warn">●</span> 월 순효과 마이너스 — 전환 상승폭/수수료 조건 재협상 필요';
    }

    refs.summary.value = [
      "[Checkout BNPL 손익 요약]",
      `월 추가 주문: ${result.incrementalOrders.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}건`,
      `월 증분 매출총이익: ${money(result.incrementalGross)}`,
      `월 BNPL 변동비: ${money(result.bnplVariableCost)}`,
      `월 순효과(구축비 제외): ${money(result.monthlyRunRate)}`,
      `연간 순이익: ${money(result.annualNet)}`,
      `연간 ROI: ${pct(result.roi, 2)}`,
      `회수기간: ${Number.isFinite(payback) ? `${payback.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}개월` : "N/A"}`,
      `손익분기 전환 상승폭: ${Number.isFinite(breakEvenLift) ? `${breakEvenLift.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}pp` : "N/A"}`
    ].join("\n");
  }

  refs.copy.addEventListener("click", async () => {
    if (!refs.summary.value.trim()) return;
    try {
      await navigator.clipboard.writeText(refs.summary.value);
      alert("요약이 복사되었습니다.");
    } catch (error) {
      console.error(error);
      alert("클립보드 권한이 없어 수동 복사를 해주세요.");
    }
  });

  refs.reset.addEventListener("click", () => {
    Object.entries(defaults).forEach(([key, value]) => {
      refs[key].value = value;
    });
    render();
  });

  [
    refs.sessions, refs.baseCvr, refs.aov, refs.grossMargin, refs.bnplShare, refs.bnplLiftPp,
    refs.aovLift, refs.bnplFeeRate, refs.bnplFixedFee, refs.bnplLossRate, refs.monthlyOps, refs.setupCost
  ].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  // avoid unused-linter false-positive in static review scripts
  void nf0;

  render();
})();
