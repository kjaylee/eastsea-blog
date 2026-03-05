const $ = (id) => document.getElementById(id);

const refs = {
  mau: $('mau'),
  exposureRate: $('exposureRate'),
  conversionRate: $('conversionRate'),
  tipsPerTipper: $('tipsPerTipper'),
  avgTip: $('avgTip'),
  platformFee: $('platformFee'),
  paymentFee: $('paymentFee'),
  fixedFee: $('fixedFee'),
  monthlyCost: $('monthlyCost'),
  implementationCost: $('implementationCost'),
  gross: $('gross'),
  netRevenue: $('netRevenue'),
  monthlyNet: $('monthlyNet'),
  annualRoi: $('annualRoi'),
  payback: $('payback'),
  breakEven: $('breakEven'),
  exposure: $('exposure'),
  tippers: $('tippers'),
  transactions: $('transactions'),
  fees: $('fees'),
  netPerTip: $('netPerTip'),
  monthlyCostOut: $('monthlyCostOut'),
  status: $('status'),
  summary: $('summary'),
  error: $('error'),
  copy: $('copy'),
  reset: $('reset')
};

const defaults = {
  mau: 50000,
  exposureRate: 40,
  conversionRate: 1.2,
  tipsPerTipper: 1.4,
  avgTip: 3500,
  platformFee: 15,
  paymentFee: 3.4,
  fixedFee: 40,
  monthlyCost: 500000,
  implementationCost: 4000000
};

const money = (n) => new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0
}).format(Number.isFinite(n) ? n : 0);

const num = (n, d = 2) => Number(n).toLocaleString('ko-KR', { maximumFractionDigits: d });

function readValues() {
  return {
    mau: Number(refs.mau.value),
    exposureRate: Number(refs.exposureRate.value),
    conversionRate: Number(refs.conversionRate.value),
    tipsPerTipper: Number(refs.tipsPerTipper.value),
    avgTip: Number(refs.avgTip.value),
    platformFee: Number(refs.platformFee.value),
    paymentFee: Number(refs.paymentFee.value),
    fixedFee: Number(refs.fixedFee.value),
    monthlyCost: Number(refs.monthlyCost.value),
    implementationCost: Number(refs.implementationCost.value)
  };
}

function validate(v) {
  if (!Number.isFinite(v.mau) || v.mau <= 0) return 'MAU는 1 이상이어야 합니다.';
  if (!Number.isFinite(v.exposureRate) || v.exposureRate < 0 || v.exposureRate > 100) return '팁 노출률은 0~100% 범위여야 합니다.';
  if (!Number.isFinite(v.conversionRate) || v.conversionRate < 0 || v.conversionRate > 100) return '팁 전환율은 0~100% 범위여야 합니다.';
  if (!Number.isFinite(v.tipsPerTipper) || v.tipsPerTipper <= 0) return '1인당 월 평균 팁 횟수는 0보다 커야 합니다.';
  if (!Number.isFinite(v.avgTip) || v.avgTip <= 0) return '평균 팁 금액은 0보다 커야 합니다.';
  if (!Number.isFinite(v.platformFee) || v.platformFee < 0 || v.platformFee > 100) return '플랫폼 수수료는 0~100% 범위여야 합니다.';
  if (!Number.isFinite(v.paymentFee) || v.paymentFee < 0 || v.paymentFee > 100) return '결제 처리 수수료는 0~100% 범위여야 합니다.';
  if (v.platformFee + v.paymentFee >= 100) return '수수료 합계는 100% 미만이어야 합니다.';
  if (!Number.isFinite(v.fixedFee) || v.fixedFee < 0) return '고정 수수료는 0 이상이어야 합니다.';
  if (!Number.isFinite(v.monthlyCost) || v.monthlyCost < 0) return '월 운영비는 0 이상이어야 합니다.';
  if (!Number.isFinite(v.implementationCost) || v.implementationCost < 0) return '구축비는 0 이상이어야 합니다.';
  return '';
}

function compute(v) {
  const exposureRate = v.exposureRate / 100;
  const conversionRate = v.conversionRate / 100;
  const feeRate = (v.platformFee + v.paymentFee) / 100;

  const exposure = v.mau * exposureRate;
  const tippers = exposure * conversionRate;
  const transactions = tippers * v.tipsPerTipper;
  const gross = transactions * v.avgTip;
  const variableFees = gross * feeRate;
  const fixedFees = transactions * v.fixedFee;
  const netRevenue = gross - variableFees - fixedFees;
  const monthlyNet = netRevenue - v.monthlyCost;
  const annualRoi = v.implementationCost === 0
    ? Infinity
    : ((monthlyNet * 12 - v.implementationCost) / v.implementationCost) * 100;
  const payback = (monthlyNet > 0 && v.implementationCost > 0)
    ? v.implementationCost / monthlyNet
    : null;
  const netPerTip = v.avgTip * (1 - feeRate) - v.fixedFee;
  const breakEvenConversion = (netPerTip > 0 && exposureRate > 0 && v.tipsPerTipper > 0)
    ? (v.monthlyCost / (v.mau * exposureRate * v.tipsPerTipper * netPerTip)) * 100
    : null;

  return {
    exposure,
    tippers,
    transactions,
    gross,
    variableFees,
    fixedFees,
    netRevenue,
    monthlyNet,
    annualRoi,
    payback,
    netPerTip,
    breakEvenConversion
  };
}

function render() {
  const v = readValues();
  const error = validate(v);

  refs.error.textContent = error;
  refs.error.classList.toggle('show', !!error);

  if (error) {
    ['gross', 'netRevenue', 'monthlyNet', 'annualRoi', 'payback', 'breakEven', 'exposure', 'tippers', 'transactions', 'fees', 'netPerTip', 'monthlyCostOut']
      .forEach((key) => { refs[key].textContent = '-'; });
    refs.status.textContent = '입력값을 확인하세요.';
    refs.summary.value = '';
    return;
  }

  const r = compute(v);
  const totalFees = r.variableFees + r.fixedFees;

  refs.gross.textContent = money(r.gross);
  refs.netRevenue.textContent = money(r.netRevenue);
  refs.monthlyNet.textContent = money(r.monthlyNet);
  refs.annualRoi.textContent = Number.isFinite(r.annualRoi) ? `${num(r.annualRoi, 1)}%` : '∞';
  refs.payback.textContent = r.payback ? `${num(r.payback, 1)}개월` : 'N/A';
  refs.breakEven.textContent = r.breakEvenConversion !== null ? `${num(r.breakEvenConversion, 2)}%` : 'N/A';

  refs.exposure.textContent = `${num(r.exposure, 0)}명`;
  refs.tippers.textContent = `${num(r.tippers, 0)}명`;
  refs.transactions.textContent = `${num(r.transactions, 0)}건`;
  refs.fees.textContent = money(totalFees);
  refs.netPerTip.textContent = `${money(r.netPerTip)} / 건`;
  refs.monthlyCostOut.textContent = money(v.monthlyCost);

  let statusText = '';
  if (r.monthlyNet <= 0) {
    statusText = `<span class="bad">●</span> 월 순이익이 음수입니다. 전환율·팁 금액·수수료 구조를 개선하세요.`;
  } else if (r.payback && r.payback <= 6) {
    statusText = `<span class="ok">●</span> 회수기간 ${num(r.payback, 1)}개월 (확장 후보)`;
  } else if (r.payback && r.payback <= 12) {
    statusText = `<span class="warn">●</span> 회수기간 ${num(r.payback, 1)}개월 (검토 가능)`;
  } else if (r.payback) {
    statusText = `<span class="warn">●</span> 회수기간 ${num(r.payback, 1)}개월 (장기 회수)`;
  } else {
    statusText = `<span class="warn">●</span> 회수기간 산정 불가 (순이익 개선 필요)`;
  }

  refs.status.innerHTML = statusText;

  refs.summary.value = [
    '[Tip Jar 수익 요약]',
    `월 총 팁 매출: ${money(r.gross)}`,
    `월 순매출: ${money(r.netRevenue)}`,
    `월 순이익: ${money(r.monthlyNet)}`,
    `연간 ROI: ${Number.isFinite(r.annualRoi) ? num(r.annualRoi, 1) + '%' : '∞'}`,
    `회수기간: ${r.payback ? num(r.payback, 1) + '개월' : 'N/A'}`,
    `손익분기 전환율: ${r.breakEvenConversion !== null ? num(r.breakEvenConversion, 2) + '%' : 'N/A'}`,
    `팁 사용자 수: ${num(r.tippers, 0)}명`
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
  [
    refs.mau,
    refs.exposureRate,
    refs.conversionRate,
    refs.tipsPerTipper,
    refs.avgTip,
    refs.platformFee,
    refs.paymentFee,
    refs.fixedFee,
    refs.monthlyCost,
    refs.implementationCost
  ].forEach((el) => el.addEventListener(event, render));
});

render();
