import {
  DEFAULT_INPUT,
  validateInputs,
  calculateLimitedTimeOfferProfit,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'limited_time_offer_profit_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlySessions: $('monthlySessions'),
  baselineConvPct: $('baselineConvPct'),
  targetConvPct: $('targetConvPct'),
  aov: $('aov'),
  grossMarginPct: $('grossMarginPct'),
  discountPct: $('discountPct'),
  offerSharePct: $('offerSharePct'),
  extraFulfillmentCost: $('extraFulfillmentCost'),
  monthlyPromoCost: $('monthlyPromoCost'),
  setupCost: $('setupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  baselineNetMonthly: $('baselineNetMonthly'),
  targetNetMonthly: $('targetNetMonthly'),
  monthlyNetLift: $('monthlyNetLift'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetConvPct: $('breakEvenTargetConvPct'),

  baselineOrders: $('baselineOrders'),
  targetOrders: $('targetOrders'),
  offerOrders: $('offerOrders'),
  avgSellingPrice: $('avgSellingPrice'),
  netContributionPerOrder: $('netContributionPerOrder'),
  monthlyOfferFulfillmentCost: $('monthlyOfferFulfillmentCost'),

  status: $('status'),
  error: $('error'),
  summary: $('summary'),
  resetBtn: $('resetBtn'),
  copyBtn: $('copyBtn'),
};

const numericKeys = Object.keys(DEFAULT_INPUT);
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

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

function setStatus(result, input) {
  if (result.periodNetBenefit > 0 && result.paybackMonths <= input.targetPaybackMonths) {
    refs.status.innerHTML = '<span class="dot good">●</span> Offer is profitable and payback meets target.';
    return;
  }
  if (result.periodNetBenefit > 0) {
    refs.status.innerHTML = '<span class="dot warn">●</span> Profitable, but payback is slower than target.';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Economics are negative under current assumptions.';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'baselineNetMonthly',
    'targetNetMonthly',
    'monthlyNetLift',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetConvPct',
    'baselineOrders',
    'targetOrders',
    'offerOrders',
    'avgSellingPrice',
    'netContributionPerOrder',
    'monthlyOfferFulfillmentCost',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs.';
}

function renderResult(result, input) {
  showError('');

  refs.baselineNetMonthly.textContent = money.format(result.baselineNetMonthly);
  refs.targetNetMonthly.textContent = money.format(result.targetNetMonthly);
  refs.monthlyNetLift.textContent = money.format(result.monthlyNetLift);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenTargetConvPct.textContent = Number.isFinite(result.breakEvenTargetConvPct)
    ? `${num.format(result.breakEvenTargetConvPct)}%`
    : 'Not reachable';

  refs.baselineOrders.textContent = num.format(result.baselineOrders);
  refs.targetOrders.textContent = num.format(result.targetOrders);
  refs.offerOrders.textContent = num.format(result.offerOrders);
  refs.avgSellingPrice.textContent = money.format(result.avgSellingPrice);
  refs.netContributionPerOrder.textContent = money.format(result.netContributionPerOrder);
  refs.monthlyOfferFulfillmentCost.textContent = money.format(result.monthlyOfferFulfillmentCost);

  refs.summary.value = buildSummary(result, 'en-US', 'USD');
  setStatus(result, input);
}

function render() {
  const input = parseInput();
  const validation = validateInputs(input);

  if (!validation.valid) {
    renderEmptyState(`Input error: ${validation.message}`);
    return;
  }

  const result = calculateLimitedTimeOfferProfit(input);
  renderResult(result, input);
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
    window.alert('Summary copied.');
  } catch {
    window.alert('Clipboard permission blocked. Copy manually.');
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
