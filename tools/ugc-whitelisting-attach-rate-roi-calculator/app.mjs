import {
  DEFAULT_INPUT,
  validateInputs,
  calculateUgcWhitelistingAttachRateROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'ugc_whitelisting_attach_rate_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyQualifiedDeals: $('monthlyQualifiedDeals'),
  currentAttachRatePct: $('currentAttachRatePct'),
  targetAttachRatePct: $('targetAttachRatePct'),
  rightsFeePerDeal: $('rightsFeePerDeal'),
  platformFeePct: $('platformFeePct'),
  rightsFulfillmentCostPerDeal: $('rightsFulfillmentCostPerDeal'),
  creativeRefreshCostPerDeal: $('creativeRefreshCostPerDeal'),
  incrementalGrossProfitLiftPerDeal: $('incrementalGrossProfitLiftPerDeal'),
  monthlyEnablementCost: $('monthlyEnablementCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalWhitelistingDeals: $('incrementalWhitelistingDeals'),
  netContributionPerDeal: $('netContributionPerDeal'),
  netMonthlyBenefit: $('netMonthlyBenefit'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetAttachRatePct: $('breakEvenTargetAttachRatePct'),

  currentWhitelistingDeals: $('currentWhitelistingDeals'),
  targetWhitelistingDeals: $('targetWhitelistingDeals'),
  platformFeePerDeal: $('platformFeePerDeal'),
  netRightsRevenuePerDeal: $('netRightsRevenuePerDeal'),
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
    refs.status.innerHTML = '<span class="dot good">●</span> Upsell playbook looks healthy with fast payback';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Positive model, but payback is slower than target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Model is negative at current assumptions';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalWhitelistingDeals',
    'netContributionPerDeal',
    'netMonthlyBenefit',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetAttachRatePct',
    'currentWhitelistingDeals',
    'targetWhitelistingDeals',
    'platformFeePerDeal',
    'netRightsRevenuePerDeal',
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

  refs.incrementalWhitelistingDeals.textContent = num.format(result.incrementalWhitelistingDeals);
  refs.netContributionPerDeal.textContent = money.format(result.netContributionPerDeal);
  refs.netMonthlyBenefit.textContent = money.format(result.netMonthlyBenefit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenTargetAttachRatePct.textContent = Number.isFinite(result.breakEvenTargetAttachRatePct)
    ? `${num.format(result.breakEvenTargetAttachRatePct)}%`
    : 'Not reachable';

  refs.currentWhitelistingDeals.textContent = num.format(result.currentWhitelistingDeals);
  refs.targetWhitelistingDeals.textContent = num.format(result.targetWhitelistingDeals);
  refs.platformFeePerDeal.textContent = money.format(result.platformFeePerDeal);
  refs.netRightsRevenuePerDeal.textContent = money.format(result.netRightsRevenuePerDeal);
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

  const result = calculateUgcWhitelistingAttachRateROI(input);
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
