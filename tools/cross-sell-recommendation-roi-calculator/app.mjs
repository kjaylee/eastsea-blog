import {
  DEFAULT_INPUT,
  validateInputs,
  calculateCrossSellRecommendationROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'cross_sell_recommendation_roi_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyOrders: $('monthlyOrders'),
  baseAov: $('baseAov'),
  exposureRate: $('exposureRate'),
  takeRate: $('takeRate'),
  crossSellPrice: $('crossSellPrice'),
  crossSellCogs: $('crossSellCogs'),
  fulfillmentCost: $('fulfillmentCost'),
  refundRate: $('refundRate'),
  toolCost: $('toolCost'),
  opsCost: $('opsCost'),
  setupCost: $('setupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  netCrossSellRevenue: $('netCrossSellRevenue'),
  contribution: $('contribution'),
  netMonthlyProfit: $('netMonthlyProfit'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  aovLift: $('aovLift'),
  newAov: $('newAov'),

  exposureOrders: $('exposureOrders'),
  crossSellUnits: $('crossSellUnits'),
  refundedUnits: $('refundedUnits'),
  breakEvenTakeRate: $('breakEvenTakeRate'),
  fixedCost: $('fixedCost'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> 수익성 우수 — 목표 회수기간 이내';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> 수익성은 양호하나 회수기간이 길어요';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> 손실 상태 — 부착률/원가를 재점검하세요';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'netCrossSellRevenue',
    'contribution',
    'netMonthlyProfit',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'aovLift',
    'newAov',
    'exposureOrders',
    'crossSellUnits',
    'refundedUnits',
    'breakEvenTakeRate',
    'fixedCost',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> 입력을 확인하세요';
}

function renderResult(result) {
  showError('');

  refs.netCrossSellRevenue.textContent = money.format(result.netCrossSellRevenue);
  refs.contribution.textContent = money.format(result.contribution);
  refs.netMonthlyProfit.textContent = money.format(result.netMonthlyProfit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)}개월`
    : '회수 불가';
  refs.aovLift.textContent = money.format(result.aovLift);
  refs.newAov.textContent = money.format(result.newAov);

  refs.exposureOrders.textContent = `${num.format(result.exposureOrders)}건`;
  refs.crossSellUnits.textContent = `${num.format(result.crossSellUnits)}건`;
  refs.refundedUnits.textContent = `${num.format(result.refundedUnits)}건`;
  refs.breakEvenTakeRate.textContent = Number.isFinite(result.breakEvenTakeRate)
    ? `${num.format(result.breakEvenTakeRate)}%`
    : '도달 불가';
  refs.fixedCost.textContent = money.format(result.fixedCost);

  if (result.perUnitContribution <= 0) {
    showError('1건당 공헌이익이 0 이하입니다. 가격/원가/환불률을 조정하세요.');
  }

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

  const result = calculateCrossSellRecommendationROI(input);
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
    window.alert('복사 권한이 없습니다. 수동 복사를 사용해주세요.');
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
