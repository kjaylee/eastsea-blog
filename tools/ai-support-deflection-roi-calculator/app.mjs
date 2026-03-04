import {
  DEFAULT_INPUT,
  validateInputs,
  calculateSupportDeflectionROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'ai_support_deflection_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyTickets: $('monthlyTickets'),
  currentDeflectionPct: $('currentDeflectionPct'),
  targetDeflectionPct: $('targetDeflectionPct'),
  avgHandleMinutes: $('avgHandleMinutes'),
  agentHourlyCost: $('agentHourlyCost'),
  aiCostPerDeflectedTicket: $('aiCostPerDeflectedTicket'),
  implementationCostPerMonth: $('implementationCostPerMonth'),
  platformFeePerMonth: $('platformFeePerMonth'),
  qualityReviewCostPerMonth: $('qualityReviewCostPerMonth'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  targetPaybackMonths: $('targetPaybackMonths'),

  netMonthlyBenefit: $('netMonthlyBenefit'),
  annualNetBenefit: $('annualNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetDeflectionPct: $('breakEvenTargetDeflectionPct'),
  incrementalDeflectedTickets: $('incrementalDeflectedTickets'),
  laborHoursSaved: $('laborHoursSaved'),
  grossLaborSavings: $('grossLaborSavings'),
  totalProgramCost: $('totalProgramCost'),
  aiVariableCost: $('aiVariableCost'),
  fixedProgramCost: $('fixedProgramCost'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> ROI positive and payback meets target window';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> ROI positive but payback slower than target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Scenario is net-negative (tune assumptions)';
}

function renderEmptyState(message) {
  showError(message);
  const ids = [
    'netMonthlyBenefit',
    'annualNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetDeflectionPct',
    'incrementalDeflectedTickets',
    'laborHoursSaved',
    'grossLaborSavings',
    'totalProgramCost',
    'aiVariableCost',
    'fixedProgramCost',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.netMonthlyBenefit.textContent = money.format(result.netMonthlyBenefit);
  refs.annualNetBenefit.textContent = money.format(result.annualNetBenefit);
  refs.roiPct.textContent = `${num.format(result.roiPct)}%`;
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} mo`
    : 'Not reachable';
  refs.breakEvenTargetDeflectionPct.textContent = Number.isFinite(result.breakEvenTargetDeflectionPct)
    ? `${num.format(result.breakEvenTargetDeflectionPct)}%`
    : 'Not reachable';

  refs.incrementalDeflectedTickets.textContent = num.format(result.incrementalDeflectedTickets);
  refs.laborHoursSaved.textContent = num.format(result.laborHoursSaved);
  refs.grossLaborSavings.textContent = money.format(result.grossLaborSavings);
  refs.totalProgramCost.textContent = money.format(result.totalProgramCost);
  refs.aiVariableCost.textContent = money.format(result.aiVariableCost);
  refs.fixedProgramCost.textContent = money.format(result.fixedProgramCost);

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

  const result = calculateSupportDeflectionROI(input);
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
