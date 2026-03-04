import {
  DEFAULT_INPUT,
  validateInputs,
  calculateAgencyMargin,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'white_label_agency_margin_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  currentRetainerPrice: $('currentRetainerPrice'),
  plannedHoursPerMonth: $('plannedHoursPerMonth'),
  blendedTeamCostPerHour: $('blendedTeamCostPerHour'),
  teamUtilizationPct: $('teamUtilizationPct'),
  revisionsPerMonth: $('revisionsPerMonth'),
  hoursPerRevision: $('hoursPerRevision'),
  scopeCreepPct: $('scopeCreepPct'),
  toolingCostPerMonth: $('toolingCostPerMonth'),
  managementOverheadPerMonth: $('managementOverheadPerMonth'),
  paymentFeePct: $('paymentFeePct'),
  targetMarginPct: $('targetMarginPct'),

  totalMonthlyCost: $('totalMonthlyCost'),
  breakEvenRetainer: $('breakEvenRetainer'),
  recommendedRetainer: $('recommendedRetainer'),
  currentOperatingMarginPct: $('currentOperatingMarginPct'),
  currentOperatingProfit: $('currentOperatingProfit'),
  priceDelta: $('priceDelta'),
  totalDeliveryHours: $('totalDeliveryHours'),
  revisionHours: $('revisionHours'),
  scopeCreepHours: $('scopeCreepHours'),
  effectiveCostPerHour: $('effectiveCostPerHour'),
  currentPaymentFees: $('currentPaymentFees'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> Margin comfortably above target';
    return;
  }
  if (result.status === 'balanced') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Near target margin (monitor revisions)';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Below target margin (reprice needed)';
}

function renderEmptyState(message) {
  showError(message);
  const ids = [
    'totalMonthlyCost',
    'breakEvenRetainer',
    'recommendedRetainer',
    'currentOperatingMarginPct',
    'currentOperatingProfit',
    'priceDelta',
    'totalDeliveryHours',
    'revisionHours',
    'scopeCreepHours',
    'effectiveCostPerHour',
    'currentPaymentFees',
  ];
  for (const id of ids) {
    refs[id].textContent = '-';
  }
  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.totalMonthlyCost.textContent = money.format(result.totalMonthlyCost);
  refs.breakEvenRetainer.textContent = money.format(result.breakEvenRetainer);
  refs.recommendedRetainer.textContent = money.format(result.recommendedRetainer);
  refs.currentOperatingMarginPct.textContent = `${num.format(result.currentOperatingMarginPct)}%`;
  refs.currentOperatingProfit.textContent = money.format(result.currentOperatingProfit);
  refs.priceDelta.textContent = money.format(result.priceDelta);
  refs.totalDeliveryHours.textContent = num.format(result.totalDeliveryHours);
  refs.revisionHours.textContent = num.format(result.revisionHours);
  refs.scopeCreepHours.textContent = num.format(result.scopeCreepHours);
  refs.effectiveCostPerHour.textContent = money.format(result.effectiveCostPerHour);
  refs.currentPaymentFees.textContent = money.format(result.currentPaymentFees);

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

  const result = calculateAgencyMargin(input);
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
