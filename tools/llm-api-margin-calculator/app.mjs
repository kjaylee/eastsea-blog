import {
  DEFAULT_INPUT,
  validateInputs,
  calculateLlmMargin,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'llm_api_margin_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyActiveUsers: $('monthlyActiveUsers'),
  requestsPerUserPerMonth: $('requestsPerUserPerMonth'),
  avgInputTokensPerRequest: $('avgInputTokensPerRequest'),
  avgOutputTokensPerRequest: $('avgOutputTokensPerRequest'),
  cacheHitRatePct: $('cacheHitRatePct'),
  retryRatePct: $('retryRatePct'),
  modelInputCostPer1M: $('modelInputCostPer1M'),
  modelOutputCostPer1M: $('modelOutputCostPer1M'),
  infraCostPerRequest: $('infraCostPerRequest'),
  subscriptionPricePerUser: $('subscriptionPricePerUser'),
  paymentFeePct: $('paymentFeePct'),
  supportCostPerUser: $('supportCostPerUser'),
  fixedMonthlyCost: $('fixedMonthlyCost'),
  targetContributionMarginPct: $('targetContributionMarginPct'),

  grossRevenue: $('grossRevenue'),
  netRevenueAfterFees: $('netRevenueAfterFees'),
  totalModelCost: $('totalModelCost'),
  variableCostTotal: $('variableCostTotal'),
  contributionMarginPct: $('contributionMarginPct'),
  operatingProfit: $('operatingProfit'),
  operatingMarginPct: $('operatingMarginPct'),
  breakEvenPricePerUser: $('breakEvenPricePerUser'),
  breakEvenUsersAtCurrentPrice: $('breakEvenUsersAtCurrentPrice'),
  requiredPricePerUserForTarget: $('requiredPricePerUserForTarget'),

  baseRequests: $('baseRequests'),
  billableRequests: $('billableRequests'),
  effectiveInputTokens: $('effectiveInputTokens'),
  effectiveOutputTokens: $('effectiveOutputTokens'),
  inputTokenCost: $('inputTokenCost'),
  outputTokenCost: $('outputTokenCost'),
  paymentFees: $('paymentFees'),

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
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INPUT, ...parsed };
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
    refs.status.innerHTML = '<span class="dot good">●</span> Strong margin profile (scaling-ready)';
    return;
  }
  if (result.status === 'balanced') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Balanced profile (watch token efficiency)';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Risky profile (price/cost action required)';
}

function renderEmptyState(message) {
  showError(message);
  const placeholders = [
    'grossRevenue',
    'netRevenueAfterFees',
    'totalModelCost',
    'variableCostTotal',
    'contributionMarginPct',
    'operatingProfit',
    'operatingMarginPct',
    'breakEvenPricePerUser',
    'breakEvenUsersAtCurrentPrice',
    'requiredPricePerUserForTarget',
    'baseRequests',
    'billableRequests',
    'effectiveInputTokens',
    'effectiveOutputTokens',
    'inputTokenCost',
    'outputTokenCost',
    'paymentFees',
  ];

  for (const id of placeholders) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.grossRevenue.textContent = money.format(result.grossRevenue);
  refs.netRevenueAfterFees.textContent = money.format(result.netRevenueAfterFees);
  refs.totalModelCost.textContent = money.format(result.totalModelCost);
  refs.variableCostTotal.textContent = money.format(result.variableCostTotal);
  refs.contributionMarginPct.textContent = `${num.format(result.contributionMarginPct)}%`;
  refs.operatingProfit.textContent = money.format(result.operatingProfit);
  refs.operatingMarginPct.textContent = `${num.format(result.operatingMarginPct)}%`;
  refs.breakEvenPricePerUser.textContent = money.format(result.breakEvenPricePerUser);
  refs.breakEvenUsersAtCurrentPrice.textContent = Number.isFinite(result.breakEvenUsersAtCurrentPrice)
    ? num.format(result.breakEvenUsersAtCurrentPrice)
    : '∞';
  refs.requiredPricePerUserForTarget.textContent = money.format(result.requiredPricePerUserForTarget);

  refs.baseRequests.textContent = num.format(result.baseRequests);
  refs.billableRequests.textContent = num.format(result.billableRequests);
  refs.effectiveInputTokens.textContent = num.format(result.effectiveInputTokens);
  refs.effectiveOutputTokens.textContent = num.format(result.effectiveOutputTokens);
  refs.inputTokenCost.textContent = money.format(result.inputTokenCost);
  refs.outputTokenCost.textContent = money.format(result.outputTokenCost);
  refs.paymentFees.textContent = money.format(result.paymentFees);

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

  const result = calculateLlmMargin(current);
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
