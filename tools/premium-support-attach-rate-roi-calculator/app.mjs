import {
  DEFAULT_INPUT,
  validateInputs,
  calculatePremiumSupportAttachROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'premium_support_attach_rate_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  activeAccounts: $('activeAccounts'),
  currentAttachPct: $('currentAttachPct'),
  targetAttachPct: $('targetAttachPct'),
  supportPlanPricePerMonth: $('supportPlanPricePerMonth'),
  addOnGrossMarginPct: $('addOnGrossMarginPct'),
  supportDeliveryCostPerAccount: $('supportDeliveryCostPerAccount'),
  churnReductionPct: $('churnReductionPct'),
  avgAccountGrossProfitPerMonth: $('avgAccountGrossProfitPerMonth'),
  programFixedCostPerMonth: $('programFixedCostPerMonth'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalAttachedAccounts: $('incrementalAttachedAccounts'),
  netMonthlyBenefit: $('netMonthlyBenefit'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenAttachPct: $('breakEvenAttachPct'),

  currentAttachedAccounts: $('currentAttachedAccounts'),
  targetAttachedAccounts: $('targetAttachedAccounts'),
  addOnGrossProfitPerAccount: $('addOnGrossProfitPerAccount'),
  incrementalAddOnGrossProfit: $('incrementalAddOnGrossProfit'),
  savedAccountsPerMonth: $('savedAccountsPerMonth'),
  retentionGrossProfit: $('retentionGrossProfit'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> Meets payback target with healthy upside';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Positive case, but payback is slower than target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Economics are negative at current assumptions';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalAttachedAccounts',
    'netMonthlyBenefit',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenAttachPct',
    'currentAttachedAccounts',
    'targetAttachedAccounts',
    'addOnGrossProfitPerAccount',
    'incrementalAddOnGrossProfit',
    'savedAccountsPerMonth',
    'retentionGrossProfit',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.incrementalAttachedAccounts.textContent = num.format(result.incrementalAttachedAccounts);
  refs.netMonthlyBenefit.textContent = money.format(result.netMonthlyBenefit);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenAttachPct.textContent = Number.isFinite(result.breakEvenAttachPct)
    ? `${num.format(result.breakEvenAttachPct)}%`
    : 'Not reachable';

  refs.currentAttachedAccounts.textContent = num.format(result.currentAttachedAccounts);
  refs.targetAttachedAccounts.textContent = num.format(result.targetAttachedAccounts);
  refs.addOnGrossProfitPerAccount.textContent = money.format(result.addOnGrossProfitPerAccount);
  refs.incrementalAddOnGrossProfit.textContent = money.format(result.incrementalAddOnGrossProfit);
  refs.savedAccountsPerMonth.textContent = num.format(result.savedAccountsPerMonth);
  refs.retentionGrossProfit.textContent = money.format(result.retentionGrossProfit);

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

  const result = calculatePremiumSupportAttachROI(input);
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
