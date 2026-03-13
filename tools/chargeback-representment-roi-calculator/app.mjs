import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRepresentmentRoi,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'chargeback_representment_roi_calculator_v1';
const $ = (id) => document.getElementById(id);

const refs = {
  disputedOrdersPerMonth: $('disputedOrdersPerMonth'),
  averageOrderValue: $('averageOrderValue'),
  chargebackFeePerCase: $('chargebackFeePerCase'),
  currentWinRatePct: $('currentWinRatePct'),
  projectedWinRatePct: $('projectedWinRatePct'),
  evidencePrepCostPerCase: $('evidencePrepCostPerCase'),
  vendorFeePct: $('vendorFeePct'),
  platformFeePct: $('platformFeePct'),
  monthlySoftwareCost: $('monthlySoftwareCost'),
  analystHoursPerMonth: $('analystHoursPerMonth'),
  analystHourlyCost: $('analystHourlyCost'),

  currentRecoveredRevenue: $('currentRecoveredRevenue'),
  projectedRecoveredRevenue: $('projectedRecoveredRevenue'),
  incrementalRecoveredRevenue: $('incrementalRecoveredRevenue'),
  totalProgramCost: $('totalProgramCost'),
  netLift: $('netLift'),
  roiPct: $('roiPct'),
  breakEvenProjectedWinRatePct: $('breakEvenProjectedWinRatePct'),
  paybackMonths: $('paybackMonths'),

  currentWins: $('currentWins'),
  projectedWins: $('projectedWins'),
  incrementalWins: $('incrementalWins'),
  grossValuePerWin: $('grossValuePerWin'),
  evidenceCost: $('evidenceCost'),
  vendorFeeCost: $('vendorFeeCost'),
  platformFeeCost: $('platformFeeCost'),
  laborCost: $('laborCost'),
  fixedCost: $('fixedCost'),

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
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

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
    // ignore storage failure
  }
}

function showError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function setStatus(result) {
  if (result.status === 'strong') {
    refs.status.innerHTML = '<span class="dot good">●</span> Strong ROI profile (worth piloting now)';
    return;
  }
  if (result.status === 'balanced') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Positive but moderate ROI (watch fee drag)';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Negative ROI under current assumptions';
}

function renderEmptyState(message) {
  showError(message);

  const placeholders = [
    'currentRecoveredRevenue',
    'projectedRecoveredRevenue',
    'incrementalRecoveredRevenue',
    'totalProgramCost',
    'netLift',
    'roiPct',
    'breakEvenProjectedWinRatePct',
    'paybackMonths',
    'currentWins',
    'projectedWins',
    'incrementalWins',
    'grossValuePerWin',
    'evidenceCost',
    'vendorFeeCost',
    'platformFeeCost',
    'laborCost',
    'fixedCost',
  ];

  for (const key of placeholders) {
    refs[key].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.currentRecoveredRevenue.textContent = money.format(result.currentRecoveredRevenue);
  refs.projectedRecoveredRevenue.textContent = money.format(result.projectedRecoveredRevenue);
  refs.incrementalRecoveredRevenue.textContent = money.format(result.incrementalRecoveredRevenue);
  refs.totalProgramCost.textContent = money.format(result.totalProgramCost);
  refs.netLift.textContent = money.format(result.netLift);
  refs.roiPct.textContent = `${num.format(result.roiPct)}%`;
  refs.breakEvenProjectedWinRatePct.textContent = Number.isFinite(result.breakEvenProjectedWinRatePct)
    ? `${num.format(result.breakEvenProjectedWinRatePct)}%`
    : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} mo`
    : '∞';

  refs.currentWins.textContent = num.format(result.currentWins);
  refs.projectedWins.textContent = num.format(result.projectedWins);
  refs.incrementalWins.textContent = num.format(result.incrementalWins);
  refs.grossValuePerWin.textContent = money.format(result.grossValuePerWin);
  refs.evidenceCost.textContent = money.format(result.evidenceCost);
  refs.vendorFeeCost.textContent = money.format(result.vendorFeeCost);
  refs.platformFeeCost.textContent = money.format(result.platformFeeCost);
  refs.laborCost.textContent = money.format(result.laborCost);
  refs.fixedCost.textContent = money.format(result.fixedCost);

  refs.summary.value = buildSummary(result, 'en-US', 'USD');
  setStatus(result);
}

function render() {
  const current = parseInput();
  const validation = validateInputs(current);
  if (!validation.valid) {
    renderEmptyState(`Input error: ${validation.message}`);
    return;
  }

  const result = calculateRepresentmentRoi(current);
  renderResult(result);
  saveInput(current);
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
    window.alert('Clipboard permission blocked. Please copy manually.');
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
