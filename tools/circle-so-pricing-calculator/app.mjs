import {
  DEFAULT_INPUT,
  calculateCirclePricing,
  validateInputs,
} from './logic.mjs';

const STORAGE_KEY = 'circle_so_pricing_calculator_v1';
const $ = (id) => document.getElementById(id);

const refs = {
  monthlyGrossSales: $('monthlyGrossSales'),
  successfulPayments: $('successfulPayments'),
  refundRatePct: $('refundRatePct'),
  processorRatePct: $('processorRatePct'),
  processorFlatFee: $('processorFlatFee'),
  otherMonthlyCost: $('otherMonthlyCost'),
  desiredMonthlyNetProfit: $('desiredMonthlyNetProfit'),
  businessLiftPct: $('businessLiftPct'),
  emailHubLiftPct: $('emailHubLiftPct'),
  errorBox: $('errorBox'),
  warningBox: $('warningBox'),
  status: $('status'),
  copyBtn: $('copyBtn'),
  resetBtn: $('resetBtn'),
  summary: $('summary'),
  bestScenarioValue: $('bestScenarioValue'),
  bestNetValue: $('bestNetValue'),
  businessThresholdValue: $('businessThresholdValue'),
  emailThresholdValue: $('emailThresholdValue'),
  breakEvenValue: $('breakEvenValue'),
  avgPaymentValue: $('avgPaymentValue'),
  detailRows: $('detailRows'),
  scenarioRows: $('scenarioRows'),
};

const numericKeys = [
  'monthlyGrossSales',
  'successfulPayments',
  'refundRatePct',
  'processorRatePct',
  'processorFlatFee',
  'otherMonthlyCost',
  'desiredMonthlyNetProfit',
  'businessLiftPct',
  'emailHubLiftPct',
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_INPUT, ...JSON.parse(raw) } : { ...DEFAULT_INPUT };
  } catch {
    return { ...DEFAULT_INPUT };
  }
}

function saveState(values) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // ignore storage failures
  }
}

function applyState(values) {
  for (const key of numericKeys) {
    refs[key].value = values[key];
  }
}

function readState() {
  const state = {};
  for (const key of numericKeys) {
    state[key] = Number(refs[key].value);
  }
  return state;
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  return `${formatNumber(value, 2)}%`;
}

function showError(message = '') {
  refs.errorBox.textContent = message;
  refs.errorBox.classList.toggle('show', Boolean(message));
}

function showWarnings(warnings = []) {
  refs.warningBox.innerHTML = warnings.length
    ? `<ul>${warnings.map((warning) => `<li>${warning}</li>`).join('')}</ul>`
    : '';
  refs.warningBox.classList.toggle('show', warnings.length > 0);
}

function setKpis(result) {
  refs.bestScenarioValue.textContent = result.bestScenario.label;
  refs.bestNetValue.textContent = formatMoney(result.bestScenario.monthlyNetProfit);
  refs.businessThresholdValue.textContent = result.thresholds.businessGrossLiftNeeded == null
    ? 'N/A'
    : `${formatMoney(result.thresholds.businessGrossLiftNeeded)} (${formatPercent(result.thresholds.businessLiftPctNeeded)})`;
  refs.emailThresholdValue.textContent = result.thresholds.emailHubGrossLiftNeeded == null
    ? 'N/A'
    : `${formatMoney(result.thresholds.emailHubGrossLiftNeeded)} (${formatPercent(result.thresholds.emailHubLiftPctNeeded)})`;
  refs.breakEvenValue.textContent = formatMoney(result.bestScenario.breakEvenBaseGross);
  refs.avgPaymentValue.textContent = formatMoney(result.bestScenario.averagePayment);
}

function renderDetailRows(result) {
  const best = result.bestScenario;
  const rows = [
    ['Projected gross sales', formatMoney(best.projectedGrossSales)],
    ['Projected successful payments', formatNumber(best.projectedSuccessfulPayments, 2)],
    ['Scenario uplift rate', formatPercent(best.upliftRatePct)],
    ['Refund loss', formatMoney(best.refundLoss)],
    ['Processor fees', formatMoney(best.processorFees)],
    ['Circle fixed cost', formatMoney(best.fixedCircleCost)],
    ['Take-home after Circle', formatMoney(best.takeHomeAfterCircle)],
    ['Monthly net profit', formatMoney(best.monthlyNetProfit)],
    ['Annualized net profit', formatMoney(best.annualizedNetProfit)],
    ['Effective fee rate', formatPercent(best.effectiveFeeRatePct)],
    ['Base gross for break-even', formatMoney(best.breakEvenBaseGross)],
    ['Base gross for target net', formatMoney(best.requiredBaseGrossForTargetNet)],
  ];

  refs.detailRows.innerHTML = rows
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join('');
}

function renderScenarioRows(result) {
  refs.scenarioRows.innerHTML = result.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${formatMoney(scenario.projectedGrossSales)}</td>
      <td>${formatMoney(scenario.fixedCircleCost)}</td>
      <td>${formatMoney(scenario.monthlyNetProfit)}</td>
      <td>${formatPercent(scenario.effectiveFeeRatePct)}</td>
      <td>${formatMoney(scenario.netDeltaVsProfessional)}</td>
    </tr>
  `).join('');
}

function setStatus(result) {
  if (result.bestScenario.key === 'professional') {
    refs.status.textContent = 'Professional stays ahead under your current assumptions. Increase uplift only if Business or Email Hub should genuinely drive more gross sales.';
    return;
  }
  refs.status.textContent = `${result.bestScenario.label} wins under your current assumptions.`;
}

function clearOutputs() {
  refs.bestScenarioValue.textContent = '—';
  refs.bestNetValue.textContent = '—';
  refs.businessThresholdValue.textContent = '—';
  refs.emailThresholdValue.textContent = '—';
  refs.breakEvenValue.textContent = '—';
  refs.avgPaymentValue.textContent = '—';
  refs.detailRows.innerHTML = '';
  refs.scenarioRows.innerHTML = '';
  refs.summary.value = '';
}

function render() {
  const state = readState();
  const validation = validateInputs(state);

  if (!validation.valid) {
    showError(validation.message);
    showWarnings([]);
    refs.status.textContent = 'Check your inputs.';
    clearOutputs();
    return;
  }

  showError('');
  const result = calculateCirclePricing(state);
  setKpis(result);
  renderDetailRows(result);
  renderScenarioRows(result);
  setStatus(result);
  showWarnings(result.warnings);
  refs.summary.value = result.summary;
  saveState(state);
}

async function copySummary() {
  const text = refs.summary.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    refs.status.textContent = 'Summary copied.';
  } catch {
    refs.status.textContent = 'Clipboard unavailable. Copy the summary manually.';
  }
}

function resetDefaults() {
  applyState(DEFAULT_INPUT);
  render();
}

function bindEvents() {
  for (const key of numericKeys) {
    refs[key].addEventListener('input', render);
    refs[key].addEventListener('change', render);
  }
  refs.copyBtn.addEventListener('click', copySummary);
  refs.resetBtn.addEventListener('click', resetDefaults);
}

applyState(loadState());
bindEvents();
render();
