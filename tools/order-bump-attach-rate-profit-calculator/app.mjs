import {
  DEFAULT_INPUT,
  validateInputs,
  calculateOrderBumpAttachRateProfit,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'order_bump_attach_rate_profit_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  monthlyOrders: $('monthlyOrders'),
  currentAttachRatePct: $('currentAttachRatePct'),
  targetAttachRatePct: $('targetAttachRatePct'),
  bumpPrice: $('bumpPrice'),
  bumpUnitCost: $('bumpUnitCost'),
  fulfillmentCostPerBump: $('fulfillmentCostPerBump'),
  refundRatePct: $('refundRatePct'),
  paymentFeePct: $('paymentFeePct'),
  supportCostPerRefund: $('supportCostPerRefund'),
  monthlyToolCost: $('monthlyToolCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  incrementalBumpOrders: $('incrementalBumpOrders'),
  incrementalMonthlyNet: $('incrementalMonthlyNet'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetAttachRatePct: $('breakEvenTargetAttachRatePct'),

  currentMonthlyNet: $('currentMonthlyNet'),
  targetMonthlyNet: $('targetMonthlyNet'),
  incrementalGrossRevenue: $('incrementalGrossRevenue'),
  incrementalRefundLoss: $('incrementalRefundLoss'),
  incrementalCogsFulfillmentCost: $('incrementalCogsFulfillmentCost'),
  incrementalProcessingSupportToolCost: $('incrementalProcessingSupportToolCost'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> Attach-rate lift is profitable and payback is within target';
    return;
  }
  if (result.status === 'watch') {
    refs.status.innerHTML = '<span class="dot warn">●</span> Profitable over the period, but payback is slower than target';
    return;
  }
  refs.status.innerHTML = '<span class="dot bad">●</span> Economics are not covering cost under current assumptions';
}

function renderEmptyState(message) {
  showError(message);

  const ids = [
    'incrementalBumpOrders',
    'incrementalMonthlyNet',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetAttachRatePct',
    'currentMonthlyNet',
    'targetMonthlyNet',
    'incrementalGrossRevenue',
    'incrementalRefundLoss',
    'incrementalCogsFulfillmentCost',
    'incrementalProcessingSupportToolCost',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.incrementalBumpOrders.textContent = num.format(result.incrementalBumpOrders);
  refs.incrementalMonthlyNet.textContent = money.format(result.incrementalMonthlyNet);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenTargetAttachRatePct.textContent = Number.isFinite(result.breakEvenTargetAttachRatePct)
    ? `${num.format(result.breakEvenTargetAttachRatePct)}%`
    : 'Not reachable';

  refs.currentMonthlyNet.textContent = money.format(result.currentMonthlyNet);
  refs.targetMonthlyNet.textContent = money.format(result.targetMonthlyNet);
  refs.incrementalGrossRevenue.textContent = money.format(result.incrementalGrossRevenue);
  refs.incrementalRefundLoss.textContent = money.format(result.incrementalRefundLoss);
  refs.incrementalCogsFulfillmentCost.textContent = money.format(result.incrementalCogsFulfillmentCost);
  refs.incrementalProcessingSupportToolCost.textContent = money.format(result.incrementalProcessingSupportToolCost);

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

  const result = calculateOrderBumpAttachRateProfit(input);
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
