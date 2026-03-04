import {
  DEFAULT_INPUT,
  validateInputs,
  calculateBattlePassAttachRateROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'battle_pass_attach_rate_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  eligibleMau: $('eligibleMau'),
  currentAttachRate: $('currentAttachRate'),
  targetAttachRate: $('targetAttachRate'),
  battlePassPrice: $('battlePassPrice'),
  platformFeePct: $('platformFeePct'),
  rewardCostPerBuyer: $('rewardCostPerBuyer'),
  retentionLiftPct: $('retentionLiftPct'),
  profitPerRetainedUser: $('profitPerRetainedUser'),
  monthlyOpsCost: $('monthlyOpsCost'),
  setupCost: $('setupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalBuyers: $('incrementalBuyers'),
  netPerBuyer: $('netPerBuyer'),
  monthlyRetentionValue: $('monthlyRetentionValue'),
  monthlyNetLift: $('monthlyNetLift'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetAttachRate: $('breakEvenTargetAttachRate'),

  incrementalGrossRevenue: $('incrementalGrossRevenue'),
  platformFees: $('platformFees'),
  rewardCostTotal: $('rewardCostTotal'),
  buyerNetProfit: $('buyerNetProfit'),
  periodNetBenefit: $('periodNetBenefit'),
  totalInvestment: $('totalInvestment'),

  status: $('status'),
  error: $('error'),
  summary: $('summary'),
  resetBtn: $('resetBtn'),
  copyBtn: $('copyBtn'),
};

const numericKeys = Object.keys(DEFAULT_INPUT);
const money = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });

function parseInput() {
  const input = {};
  for (const key of numericKeys) {
    input[key] = Number(refs[key].value);
  }
  return input;
}

function applyInput(values) {
  for (const key of numericKeys) {
    refs[key].value = values[key];
  }
}

function loadInput() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INPUT };
    return { ...DEFAULT_INPUT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_INPUT };
  }
}

function saveInput(values) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // ignore storage failures
  }
}

function showError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function setStatus(result) {
  if (result.status === 'strong') {
    refs.status.innerHTML = '<span class="dot good">●</span> 목표 회수기간 내 수익화 가능';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> 수익성은 있으나 회수기간이 길어짐';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> 현재 가정으로는 비용 회수가 어려움';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalBuyers',
    'netPerBuyer',
    'monthlyRetentionValue',
    'monthlyNetLift',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetAttachRate',
    'incrementalGrossRevenue',
    'platformFees',
    'rewardCostTotal',
    'buyerNetProfit',
    'periodNetBenefit',
    'totalInvestment',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> 입력값을 확인하세요';
}

function renderResult(result) {
  showError('');

  refs.incrementalBuyers.textContent = `${num.format(result.incrementalBuyers)}명`;
  refs.netPerBuyer.textContent = money.format(result.netPerBuyer);
  refs.monthlyRetentionValue.textContent = money.format(result.monthlyRetentionValue);
  refs.monthlyNetLift.textContent = money.format(result.monthlyNetLift);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)}개월`
    : '회수 불가';
  refs.breakEvenTargetAttachRate.textContent = Number.isFinite(result.breakEvenTargetAttachRate)
    ? `${num.format(result.breakEvenTargetAttachRate)}%`
    : '도달 불가';

  refs.incrementalGrossRevenue.textContent = money.format(result.incrementalGrossRevenue);
  refs.platformFees.textContent = money.format(result.platformFees);
  refs.rewardCostTotal.textContent = money.format(result.rewardCostTotal);
  refs.buyerNetProfit.textContent = money.format(result.buyerNetProfit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.totalInvestment.textContent = money.format(result.totalInvestment);

  refs.summary.value = buildSummary(result, 'ko-KR', 'KRW');
  setStatus(result);
}

function render() {
  const input = parseInput();
  const validation = validateInputs(input);

  if (!validation.valid) {
    renderEmptyState(`입력 오류: ${validation.message}`);
    return;
  }

  const result = calculateBattlePassAttachRateROI(input);
  renderResult(result);
  saveInput(input);
}

function resetDefaults() {
  applyInput(DEFAULT_INPUT);
  render();
}

async function copySummary() {
  const text = refs.summary.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    window.alert('요약이 복사되었습니다.');
  } catch {
    window.alert('클립보드 권한이 차단되었습니다. 직접 복사해주세요.');
  }
}

function init() {
  applyInput(loadInput());

  for (const key of numericKeys) {
    refs[key].addEventListener('input', render);
    refs[key].addEventListener('change', render);
  }

  refs.resetBtn.addEventListener('click', resetDefaults);
  refs.copyBtn.addEventListener('click', copySummary);

  render();
}

init();
