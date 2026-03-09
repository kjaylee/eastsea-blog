import {
  DEFAULT_INPUT,
  validateInputs,
  calculateAmazonFbaProfit,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'amazon_fba_profit_calculator_v1';
const $ = (id) => document.getElementById(id);

const refs = {
  monthlyUnitsSold: $('monthlyUnitsSold'),
  salePricePerUnit: $('salePricePerUnit'),
  landedCostPerUnit: $('landedCostPerUnit'),
  referralFeePct: $('referralFeePct'),
  fbaFulfillmentFeePerUnit: $('fbaFulfillmentFeePerUnit'),
  prepLabelCostPerUnit: $('prepLabelCostPerUnit'),
  returnRatePct: $('returnRatePct'),
  lossPerReturn: $('lossPerReturn'),
  acosPct: $('acosPct'),
  monthlyStorageCost: $('monthlyStorageCost'),
  monthlyOverhead: $('monthlyOverhead'),
  launchCost: $('launchCost'),
  analysisMonths: $('analysisMonths'),
  targetNetMarginPct: $('targetNetMarginPct'),

  grossRevenue: $('grossRevenue'),
  monthlyNetProfit: $('monthlyNetProfit'),
  netMarginPct: $('netMarginPct'),
  profitPerUnit: $('profitPerUnit'),
  periodNetProfit: $('periodNetProfit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenUnits: $('breakEvenUnits'),
  breakEvenAcosPct: $('breakEvenAcosPct'),
  requiredPricePerUnitForTargetMargin: $('requiredPricePerUnitForTargetMargin'),

  referralFees: $('referralFees'),
  adSpend: $('adSpend'),
  landedCostTotal: $('landedCostTotal'),
  fulfillmentCostTotal: $('fulfillmentCostTotal'),
  prepCostTotal: $('prepCostTotal'),
  returnReserveTotal: $('returnReserveTotal'),
  fixedMonthlyCost: $('fixedMonthlyCost'),

  status: $('status'),
  summary: $('summary'),
  error: $('error'),
  resetBtn: $('resetBtn'),
  copyBtn: $('copyBtn'),
};

const numericKeys = Object.keys(DEFAULT_INPUT);
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });

function formatMoney(value) {
  return money.format(value);
}

function formatPct(value) {
  return `${num.format(value)}%`;
}

function parseInput() {
  const parsed = {};
  for (const key of numericKeys) {
    parsed[key] = Number(refs[key].value);
  }
  return parsed;
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
    // storage can fail in private mode
  }
}

function showError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function renderEmptyState(message) {
  showError(message);
  [
    'grossRevenue',
    'monthlyNetProfit',
    'netMarginPct',
    'profitPerUnit',
    'periodNetProfit',
    'roiPct',
    'paybackMonths',
    'breakEvenUnits',
    'breakEvenAcosPct',
    'requiredPricePerUnitForTargetMargin',
    'referralFees',
    'adSpend',
    'landedCostTotal',
    'fulfillmentCostTotal',
    'prepCostTotal',
    'returnReserveTotal',
    'fixedMonthlyCost',
  ].forEach((key) => {
    refs[key].textContent = '-';
  });
  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> 입력값을 확인해주세요';
}

function setStatus(result) {
  if (result.status === 'profitable') {
    refs.status.innerHTML = '<span class="dot good">●</span> 현재 가정에서 월 흑자 구조입니다';
    return;
  }
  if (result.status === 'tight') {
    refs.status.innerHTML = '<span class="dot warn">●</span> 손익은 플러스지만 마진 방어가 빡빡합니다';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> 현재 가정에서는 적자 구조입니다';
}

function renderResult(result) {
  showError('');

  refs.grossRevenue.textContent = formatMoney(result.grossRevenue);
  refs.monthlyNetProfit.textContent = formatMoney(result.monthlyNetProfit);
  refs.netMarginPct.textContent = formatPct(result.netMarginPct);
  refs.profitPerUnit.textContent = formatMoney(result.profitPerUnit);
  refs.periodNetProfit.textContent = formatMoney(result.periodNetProfit);
  refs.roiPct.textContent = formatPct(result.roiPct);
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths) ? `${num.format(result.paybackMonths)}개월` : 'N/A';
  refs.breakEvenUnits.textContent = Number.isFinite(result.breakEvenUnits) ? `${num.format(result.breakEvenUnits)}개` : 'N/A';
  refs.breakEvenAcosPct.textContent = formatPct(result.breakEvenAcosPct);
  refs.requiredPricePerUnitForTargetMargin.textContent = Number.isFinite(result.requiredPricePerUnitForTargetMargin)
    ? formatMoney(result.requiredPricePerUnitForTargetMargin)
    : 'N/A';

  refs.referralFees.textContent = formatMoney(result.referralFees);
  refs.adSpend.textContent = formatMoney(result.adSpend);
  refs.landedCostTotal.textContent = formatMoney(result.landedCostTotal);
  refs.fulfillmentCostTotal.textContent = formatMoney(result.fulfillmentCostTotal);
  refs.prepCostTotal.textContent = formatMoney(result.prepCostTotal);
  refs.returnReserveTotal.textContent = formatMoney(result.returnReserveTotal);
  refs.fixedMonthlyCost.textContent = formatMoney(result.fixedMonthlyCost);

  refs.summary.value = buildSummary(result, 'ko-KR', 'USD');
  setStatus(result);
}

function render() {
  const input = parseInput();
  const validation = validateInputs(input);
  if (!validation.valid) {
    renderEmptyState(`입력 오류: ${validation.message}`);
    return;
  }

  const result = calculateAmazonFbaProfit(input);
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
    window.alert('클립보드 권한이 없어 수동 복사가 필요합니다.');
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
