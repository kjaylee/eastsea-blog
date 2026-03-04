import {
  DEFAULT_INPUT,
  validateInputs,
  calculateNewsletterSponsorFillRateROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'newsletter_sponsor_fill_rate_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  issuesPerMonth: $('issuesPerMonth'),
  adSlotsPerIssue: $('adSlotsPerIssue'),
  currentFillRatePct: $('currentFillRatePct'),
  targetFillRatePct: $('targetFillRatePct'),
  avgSponsorFeePerSlot: $('avgSponsorFeePerSlot'),
  deliveryCostPerFilledSlot: $('deliveryCostPerFilledSlot'),
  monthlySalesOpsCost: $('monthlySalesOpsCost'),
  monthlyToolingCost: $('monthlyToolingCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalFilledSlots: $('incrementalFilledSlots'),
  averageMonthlyNetLift: $('averageMonthlyNetLift'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenFillRatePct: $('breakEvenFillRatePct'),

  totalSlots: $('totalSlots'),
  currentRevenue: $('currentRevenue'),
  targetRevenue: $('targetRevenue'),
  incrementalRevenue: $('incrementalRevenue'),
  incrementalVariableCost: $('incrementalVariableCost'),
  incrementalFixedCost: $('incrementalFixedCost'),

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

function setStatus(result) {
  if (result.status === 'strong') {
    refs.status.innerHTML = '<span class="dot good">●</span> Fill-rate strategy is profitable and pays back within target';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Profitable over the period, but payback is slower than target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Current assumptions do not cover execution cost';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalFilledSlots',
    'averageMonthlyNetLift',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenFillRatePct',
    'totalSlots',
    'currentRevenue',
    'targetRevenue',
    'incrementalRevenue',
    'incrementalVariableCost',
    'incrementalFixedCost',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.incrementalFilledSlots.textContent = num.format(result.incrementalFilledSlots);
  refs.averageMonthlyNetLift.textContent = money.format(result.averageMonthlyNetLift);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenFillRatePct.textContent = Number.isFinite(result.breakEvenFillRatePct)
    ? `${num.format(result.breakEvenFillRatePct)}%`
    : 'Not reachable';

  refs.totalSlots.textContent = num.format(result.totalSlots);
  refs.currentRevenue.textContent = money.format(result.currentRevenue);
  refs.targetRevenue.textContent = money.format(result.targetRevenue);
  refs.incrementalRevenue.textContent = money.format(result.incrementalRevenue);
  refs.incrementalVariableCost.textContent = money.format(result.incrementalVariableCost);
  refs.incrementalFixedCost.textContent = money.format(result.incrementalFixedCost);

  refs.summary.value = buildSummary(result, 'en-US', 'USD');
  setStatus(result);
}

function render() {
  const input = parseInput();
  const validation = validateInputs(input);

  if (!validation.valid) {
    renderEmptyState(`Input error: ${validation.message}`);
    return;
  }

  const result = calculateNewsletterSponsorFillRateROI(input);
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
