import {
  DEFAULT_INPUT,
  validateInputs,
  calculateApiCreditPackBreakageROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'api_credit_pack_breakage_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyActiveCustomers: $('monthlyActiveCustomers'),
  currentAdoptionPct: $('currentAdoptionPct'),
  targetAdoptionPct: $('targetAdoptionPct'),
  avgCreditsPerBuyer: $('avgCreditsPerBuyer'),
  pricePerCredit: $('pricePerCredit'),
  deliveryCostPerCredit: $('deliveryCostPerCredit'),
  breakagePct: $('breakagePct'),
  expiryLiabilityReservePct: $('expiryLiabilityReservePct'),
  supportCostPerBuyer: $('supportCostPerBuyer'),
  monthlyProgramCost: $('monthlyProgramCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalBuyers: $('incrementalBuyers'),
  netContributionPerBuyer: $('netContributionPerBuyer'),
  netMonthlyBenefit: $('netMonthlyBenefit'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetAdoptionPct: $('breakEvenTargetAdoptionPct'),

  currentBuyers: $('currentBuyers'),
  targetBuyers: $('targetBuyers'),
  grossRevenuePerBuyer: $('grossRevenuePerBuyer'),
  deliveryCostPerBuyer: $('deliveryCostPerBuyer'),
  liabilityReservePerBuyer: $('liabilityReservePerBuyer'),
  incrementalContribution: $('incrementalContribution'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> Break-even is fast and adoption lift clears target';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Positive model, but payback is slower than your target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Economics are negative at current assumptions';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalBuyers',
    'netContributionPerBuyer',
    'netMonthlyBenefit',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetAdoptionPct',
    'currentBuyers',
    'targetBuyers',
    'grossRevenuePerBuyer',
    'deliveryCostPerBuyer',
    'liabilityReservePerBuyer',
    'incrementalContribution',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.incrementalBuyers.textContent = num.format(result.incrementalBuyers);
  refs.netContributionPerBuyer.textContent = money.format(result.netContributionPerBuyer);
  refs.netMonthlyBenefit.textContent = money.format(result.netMonthlyBenefit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenTargetAdoptionPct.textContent = Number.isFinite(result.breakEvenTargetAdoptionPct)
    ? `${num.format(result.breakEvenTargetAdoptionPct)}%`
    : 'Not reachable';

  refs.currentBuyers.textContent = num.format(result.currentBuyers);
  refs.targetBuyers.textContent = num.format(result.targetBuyers);
  refs.grossRevenuePerBuyer.textContent = money.format(result.grossRevenuePerBuyer);
  refs.deliveryCostPerBuyer.textContent = money.format(result.deliveryCostPerBuyer);
  refs.liabilityReservePerBuyer.textContent = money.format(result.liabilityReservePerBuyer);
  refs.incrementalContribution.textContent = money.format(result.incrementalContribution);

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

  const result = calculateApiCreditPackBreakageROI(input);
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
