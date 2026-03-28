import {
  DEFAULT_INPUT,
  calculateComparison,
  validateInputs,
} from './logic.mjs';

const STORAGE_KEY = 'thrivecart_vs_samcart_cost_calculator_v1';
const $ = (id) => document.getElementById(id);

const refs = {
  monthlyGrossSales: $('monthlyGrossSales'),
  successfulPayments: $('successfulPayments'),
  planningMonths: $('planningMonths'),
  refundRatePct: $('refundRatePct'),
  processorRatePct: $('processorRatePct'),
  processorFlatFee: $('processorFlatFee'),
  otherMonthlyCost: $('otherMonthlyCost'),
  targetMonthlyNetProfit: $('targetMonthlyNetProfit'),
  thrivecartUpfrontFee: $('thrivecartUpfrontFee'),
  thrivecartAnnualAddonCost: $('thrivecartAnnualAddonCost'),
  samcartMonthlyFee: $('samcartMonthlyFee'),
  samcartGrowthSurcharge: $('samcartGrowthSurcharge'),
  samcartRevenueLiftPct: $('samcartRevenueLiftPct'),
  errorBox: $('errorBox'),
  warningBox: $('warningBox'),
  status: $('status'),
  copyBtn: $('copyBtn'),
  resetBtn: $('resetBtn'),
  summary: $('summary'),
  winnerValue: $('winnerValue'),
  deltaValue: $('deltaValue'),
  breakEvenValue: $('breakEvenValue'),
  liftValue: $('liftValue'),
  thriveTargetValue: $('thriveTargetValue'),
  samTargetValue: $('samTargetValue'),
  detailRows: $('detailRows'),
  scenarioRows: $('scenarioRows'),
};

const numericKeys = [
  'monthlyGrossSales',
  'successfulPayments',
  'planningMonths',
  'refundRatePct',
  'processorRatePct',
  'processorFlatFee',
  'otherMonthlyCost',
  'targetMonthlyNetProfit',
  'thrivecartUpfrontFee',
  'thrivecartAnnualAddonCost',
  'samcartMonthlyFee',
  'samcartGrowthSurcharge',
  'samcartRevenueLiftPct',
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
    // ignore localStorage failures
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
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
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
  refs.winnerValue.textContent = result.winner.label;
  refs.deltaValue.textContent = formatMoney(result.cumulativeNetDelta);
  refs.breakEvenValue.textContent = result.breakEvenMonth == null ? 'Not in horizon' : `Month ${result.breakEvenMonth}`;
  refs.liftValue.textContent = result.requiredLift.monthlyGrossLiftNeeded == null
    ? 'N/A'
    : `${formatMoney(result.requiredLift.monthlyGrossLiftNeeded)} (${formatPercent(result.requiredLift.liftPctNeeded)})`;
  refs.thriveTargetValue.textContent = formatMoney(result.thrivecart.requiredBaselineGrossForTargetNet);
  refs.samTargetValue.textContent = formatMoney(result.samcart.requiredBaselineGrossForTargetNet);
}

function renderDetailRows(result) {
  const rows = [
    ['Average payment size', formatMoney(result.margin.averagePayment)],
    ['Base contribution margin rate', formatPercent(result.margin.baseContributionMarginRatePct)],
    ['Refund rate', formatPercent(result.inputs.refundRatePct)],
    ['Processor variable fee', formatPercent(result.inputs.processorRatePct)],
    ['Processor flat fee', formatMoney(result.inputs.processorFlatFee)],
    ['ThriveCart total platform cost', formatMoney(result.thrivecart.totalPlatformCost)],
    ['SamCart total platform cost', formatMoney(result.samcart.totalPlatformCost)],
    ['Platform cost delta (SamCart - ThriveCart)', formatMoney(result.cumulativePlatformCostDelta)],
    ['Winner by cumulative net', result.winner.label],
    ['Break-even month', result.breakEvenMonth == null ? 'Not within selected horizon' : `Month ${result.breakEvenMonth}`],
  ];

  refs.detailRows.innerHTML = rows
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join('');
}

function renderScenarioRows(result) {
  const scenarios = [result.thrivecart, result.samcart];
  refs.scenarioRows.innerHTML = scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${scenario.pricingModel}</td>
      <td>${formatMoney(scenario.projectedMonthlyGrossSales)}</td>
      <td>${formatMoney(scenario.equivalentMonthlyPlatformCost)}</td>
      <td>${formatMoney(scenario.totalPlatformCost)}</td>
      <td>${formatMoney(scenario.monthlyNetAfterPlatform)}</td>
      <td>${formatMoney(scenario.cumulativeNetAfterPlatform)}</td>
      <td>${formatPercent(scenario.effectivePlatformCostRatePct)}</td>
    </tr>
  `).join('');
}

function setStatus(result) {
  if (result.winner.key === 'thrivecart') {
    refs.status.textContent = 'ThriveCart currently wins on cumulative take-home. SamCart needs more revenue lift or lower recurring cost to catch up.';
    return;
  }
  refs.status.textContent = 'SamCart currently wins on cumulative take-home under your assumptions.';
}

function clearOutputs() {
  refs.winnerValue.textContent = '—';
  refs.deltaValue.textContent = '—';
  refs.breakEvenValue.textContent = '—';
  refs.liftValue.textContent = '—';
  refs.thriveTargetValue.textContent = '—';
  refs.samTargetValue.textContent = '—';
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
  const result = calculateComparison(state);
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
