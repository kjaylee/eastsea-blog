const $ = (id) => document.getElementById(id);

const refs = {
  forecastSales: $('forecastSales'),
  royaltyRate: $('royaltyRate'),
  minimumGuarantee: $('minimumGuarantee'),
  agentCommission: $('agentCommission'),
  advanceRemaining: $('advanceRemaining'),
  recoupRate: $('recoupRate'),
  marketingCost: $('marketingCost'),
  legalCost: $('legalCost'),
  opsCost: $('opsCost'),
  royaltyDue: $('royaltyDue'),
  cashReceived: $('cashReceived'),
  netProfit: $('netProfit'),
  roi: $('roi'),
  breakEvenSales: $('breakEvenSales'),
  advanceLeft: $('advanceLeft'),
  forecastRoyalty: $('forecastRoyalty'),
  mgGap: $('mgGap'),
  agentFee: $('agentFee'),
  recouped: $('recouped'),
  totalCosts: $('totalCosts'),
  effectiveTake: $('effectiveTake'),
  status: $('status'),
  summary: $('summary'),
  error: $('error'),
  copy: $('copy'),
  reset: $('reset')
};

const defaults = {
  forecastSales: 120000000,
  royaltyRate: 8,
  minimumGuarantee: 6000000,
  agentCommission: 10,
  advanceRemaining: 10000000,
  recoupRate: 30,
  marketingCost: 1500000,
  legalCost: 800000,
  opsCost: 700000
};

const money = (n) => new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0
}).format(Number.isFinite(n) ? n : 0);

const num = (n, d = 2) => Number(n).toLocaleString('ko-KR', { maximumFractionDigits: d });

function readValues() {
  return {
    forecastSales: Number(refs.forecastSales.value),
    royaltyRate: Number(refs.royaltyRate.value),
    minimumGuarantee: Number(refs.minimumGuarantee.value),
    agentCommission: Number(refs.agentCommission.value),
    advanceRemaining: Number(refs.advanceRemaining.value),
    recoupRate: Number(refs.recoupRate.value),
    marketingCost: Number(refs.marketingCost.value),
    legalCost: Number(refs.legalCost.value),
    opsCost: Number(refs.opsCost.value)
  };
}

function validate(v) {
  if (!Number.isFinite(v.forecastSales) || v.forecastSales <= 0) return '예상 매출은 0보다 커야 합니다.';
  if (!Number.isFinite(v.royaltyRate) || v.royaltyRate <= 0 || v.royaltyRate > 100) return '로열티율은 0~100% 범위여야 합니다.';
  if (!Number.isFinite(v.minimumGuarantee) || v.minimumGuarantee < 0) return '최소 보장액은 0 이상이어야 합니다.';
  if (!Number.isFinite(v.agentCommission) || v.agentCommission < 0 || v.agentCommission > 100) return '에이전트 수수료는 0~100% 범위여야 합니다.';
  if (!Number.isFinite(v.advanceRemaining) || v.advanceRemaining < 0) return '선급금 잔액은 0 이상이어야 합니다.';
  if (!Number.isFinite(v.recoupRate) || v.recoupRate < 0 || v.recoupRate > 100) return '선급금 회수율은 0~100% 범위여야 합니다.';
  if (v.agentCommission + v.recoupRate >= 100) return '에이전트 수수료 + 회수율 합계는 100% 미만이어야 합니다.';
  if ([v.marketingCost, v.legalCost, v.opsCost].some((n) => !Number.isFinite(n) || n < 0)) return '지원비 항목은 0 이상이어야 합니다.';
  return '';
}

function computeBreakEvenRoyalty({ agentRate, recoupRate, advanceRemaining, totalCosts }) {
  if (totalCosts <= 0) return 0;
  const denomNoRecoup = 1 - agentRate;
  if (denomNoRecoup <= 0) return null;
  if (advanceRemaining <= 0) return totalCosts / denomNoRecoup;

  const denomWithRecoup = 1 - agentRate - recoupRate;
  if (denomWithRecoup > 0 && recoupRate > 0) {
    const candidate = totalCosts / denomWithRecoup;
    const maxBeforeFullRecoup = advanceRemaining / recoupRate;
    if (candidate <= maxBeforeFullRecoup) return candidate;
  }

  return (advanceRemaining + totalCosts) / denomNoRecoup;
}

function compute(v) {
  const rate = v.royaltyRate / 100;
  const agentRate = v.agentCommission / 100;
  const recoupRate = v.recoupRate / 100;
  const forecastRoyalty = v.forecastSales * rate;
  const royaltyDue = Math.max(forecastRoyalty, v.minimumGuarantee);
  const agentFee = royaltyDue * agentRate;
  const recoupCap = royaltyDue * recoupRate;
  const recouped = Math.min(v.advanceRemaining, recoupCap);
  const cashReceived = royaltyDue - agentFee - recouped;
  const totalCosts = v.marketingCost + v.legalCost + v.opsCost;
  const netProfit = cashReceived - totalCosts;
  const roi = totalCosts === 0 ? (netProfit >= 0 ? Infinity : -Infinity) : (netProfit / totalCosts) * 100;
  const advanceLeft = Math.max(v.advanceRemaining - recouped, 0);
  const mgGap = Math.max(v.minimumGuarantee - forecastRoyalty, 0);
  const effectiveTake = v.forecastSales > 0 ? (cashReceived / v.forecastSales) * 100 : 0;
  const breakEvenRoyalty = computeBreakEvenRoyalty({
    agentRate,
    recoupRate,
    advanceRemaining: v.advanceRemaining,
    totalCosts
  });

  let breakEvenLabel = 'N/A';
  let breakEvenSalesValue = null;
  if (breakEvenRoyalty !== null && rate > 0) {
    if (breakEvenRoyalty <= v.minimumGuarantee) {
      breakEvenLabel = 'MG로 충당';
      breakEvenSalesValue = 0;
    } else {
      breakEvenSalesValue = breakEvenRoyalty / rate;
      breakEvenLabel = money(breakEvenSalesValue);
    }
  }

  return {
    forecastRoyalty,
    royaltyDue,
    agentFee,
    recouped,
    cashReceived,
    totalCosts,
    netProfit,
    roi,
    advanceLeft,
    mgGap,
    effectiveTake,
    breakEvenLabel,
    breakEvenSalesValue
  };
}

function render() {
  const v = readValues();
  const error = validate(v);

  refs.error.textContent = error;
  refs.error.classList.toggle('show', !!error);

  if (error) {
    ['royaltyDue','cashReceived','netProfit','roi','breakEvenSales','advanceLeft','forecastRoyalty','mgGap','agentFee','recouped','totalCosts','effectiveTake']
      .forEach((key) => { refs[key].textContent = '-'; });
    refs.status.textContent = '입력값을 확인하세요.';
    refs.summary.value = '';
    return;
  }

  const r = compute(v);

  refs.royaltyDue.textContent = money(r.royaltyDue);
  refs.cashReceived.textContent = money(r.cashReceived);
  refs.netProfit.textContent = money(r.netProfit);
  refs.roi.textContent = Number.isFinite(r.roi) ? `${num(r.roi, 1)}%` : (r.roi > 0 ? '∞' : '-∞');
  refs.breakEvenSales.textContent = r.breakEvenLabel;
  refs.advanceLeft.textContent = money(r.advanceLeft);

  refs.forecastRoyalty.textContent = money(r.forecastRoyalty);
  refs.mgGap.textContent = money(r.mgGap);
  refs.agentFee.textContent = money(r.agentFee);
  refs.recouped.textContent = money(r.recouped);
  refs.totalCosts.textContent = money(r.totalCosts);
  refs.effectiveTake.textContent = `${num(r.effectiveTake, 2)}%`;

  let statusText = '';
  if (r.netProfit <= 0) {
    statusText = '<span class="bad">●</span> 순이익이 음수입니다. 로열티율·비용·회수율 가정을 재검토하세요.';
  } else if (Number.isFinite(r.roi) && r.roi >= 50) {
    statusText = `<span class="ok">●</span> ROI ${num(r.roi, 1)}% (확장 후보)`;
  } else {
    statusText = `<span class="warn">●</span> ROI ${Number.isFinite(r.roi) ? num(r.roi, 1) + '%' : '∞'} (검토 가능)`;
  }
  refs.status.innerHTML = statusText;

  refs.summary.value = [
    '[브랜드 라이선싱 로열티 요약]',
    `로열티 확정액: ${money(r.royaltyDue)}`,
    `기간 현금 수령액: ${money(r.cashReceived)}`,
    `순이익: ${money(r.netProfit)}`,
    `ROI: ${Number.isFinite(r.roi) ? num(r.roi, 1) + '%' : '∞'}`,
    `손익분기 매출: ${r.breakEvenLabel}`,
    `잔여 선급금: ${money(r.advanceLeft)}`
  ].join('\n');
}

refs.copy.addEventListener('click', async () => {
  if (!refs.summary.value.trim()) return;
  try {
    await navigator.clipboard.writeText(refs.summary.value);
    alert('요약이 복사되었습니다.');
  } catch (err) {
    alert('복사 권한이 없어 수동 복사를 해주세요.');
  }
});

refs.reset.addEventListener('click', () => {
  Object.entries(defaults).forEach(([key, value]) => {
    refs[key].value = value;
  });
  render();
});

['input', 'change'].forEach((event) => {
  Object.values(refs).forEach((el) => {
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      el.addEventListener(event, render);
    }
  });
});

render();
