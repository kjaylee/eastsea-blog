import {
  DEFAULT_INPUT,
  validateInputs,
  calculateAdFreeUpgradeROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'ad_free_upgrade_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  mau: $('mau'),
  adExposureRatePct: $('adExposureRatePct'),
  adRevenuePerUser: $('adRevenuePerUser'),
  adFreePrice: $('adFreePrice'),
  attachRatePct: $('attachRatePct'),
  platformFeePct: $('platformFeePct'),
  serviceCostPerSubscriber: $('serviceCostPerSubscriber'),
  monthlyProgramCost: $('monthlyProgramCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),

  adExposedUsers: $('adExposedUsers'),
  adFreeSubscribers: $('adFreeSubscribers'),
  netContributionPerSubscriber: $('netContributionPerSubscriber'),
  netMonthlyBenefit: $('netMonthlyBenefit'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenAttachRatePct: $('breakEvenAttachRatePct'),

  netSubscriptionPrice: $('netSubscriptionPrice'),
  grossSubscriptionRevenue: $('grossSubscriptionRevenue'),
  lostAdRevenue: $('lostAdRevenue'),
  serviceCost: $('serviceCost'),
  monthlyProgramCostDisplay: $('monthlyProgramCostDisplay'),

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
  refs.error.hidden = !message;
}

function setStatus(result) {
  if (result.status === 'strong') {
    refs.status.dataset.tone = 'good';
    refs.status.textContent = 'ROI is strong. The ad-free tier clears target payback.';
    return;
  }
  if (result.status === 'watch') {
    refs.status.dataset.tone = 'warn';
    refs.status.textContent = 'Positive model, but ROI is modest. Watch attach rate and price.';
    return;
  }
  refs.status.dataset.tone = 'bad';
  refs.status.textContent = 'Economics are negative at current assumptions.';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'adExposedUsers',
    'adFreeSubscribers',
    'netContributionPerSubscriber',
    'netMonthlyBenefit',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenAttachRatePct',
    'netSubscriptionPrice',
    'grossSubscriptionRevenue',
    'lostAdRevenue',
    'serviceCost',
    'monthlyProgramCostDisplay',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.dataset.tone = 'bad';
  refs.status.textContent = 'Check inputs.';
}

function renderResult(result) {
  showError('');

  refs.adExposedUsers.textContent = num.format(result.adExposedUsers);
  refs.adFreeSubscribers.textContent = num.format(result.adFreeSubscribers);
  refs.netContributionPerSubscriber.textContent = money.format(result.netContributionPerSubscriber);
  refs.netMonthlyBenefit.textContent = money.format(result.netMonthlyBenefit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenAttachRatePct.textContent = Number.isFinite(result.breakEvenAttachRatePct)
    ? `${num.format(result.breakEvenAttachRatePct)}%`
    : 'Not reachable';

  refs.netSubscriptionPrice.textContent = money.format(result.netSubscriptionPrice);
  refs.grossSubscriptionRevenue.textContent = money.format(result.grossSubscriptionRevenue);
  refs.lostAdRevenue.textContent = money.format(result.lostAdRevenue);
  refs.serviceCost.textContent = money.format(result.serviceCost);
  refs.monthlyProgramCostDisplay.textContent = money.format(result.inputs.monthlyProgramCost);

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

  const result = calculateAdFreeUpgradeROI(input);
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
