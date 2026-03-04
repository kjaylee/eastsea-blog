import {
  DEFAULT_INPUT,
  validateInputs,
  calculateCreatorMembershipChurnReductionROI,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'creator_membership_churn_reduction_roi_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  startingMembers: $('startingMembers'),
  monthlyNewMembers: $('monthlyNewMembers'),
  monthlyMembershipFee: $('monthlyMembershipFee'),
  currentMonthlyChurnPct: $('currentMonthlyChurnPct'),
  targetMonthlyChurnPct: $('targetMonthlyChurnPct'),
  paymentFeePct: $('paymentFeePct'),
  supportCostPerMember: $('supportCostPerMember'),
  monthlyRetentionProgramCost: $('monthlyRetentionProgramCost'),
  oneTimeSetupCost: $('oneTimeSetupCost'),
  analysisMonths: $('analysisMonths'),
  targetPaybackMonths: $('targetPaybackMonths'),

  retainedMemberDelta: $('retainedMemberDelta'),
  averageMonthlyNetLift: $('averageMonthlyNetLift'),
  periodNetBenefit: $('periodNetBenefit'),
  roiPct: $('roiPct'),
  paybackMonths: $('paybackMonths'),
  breakEvenTargetChurnPct: $('breakEvenTargetChurnPct'),

  currentEndingMembers: $('currentEndingMembers'),
  targetEndingMembers: $('targetEndingMembers'),
  incrementalRevenue: $('incrementalRevenue'),
  incrementalVariableCost: $('incrementalVariableCost'),
  incrementalProgramCost: $('incrementalProgramCost'),
  incrementalNetBeforeSetup: $('incrementalNetBeforeSetup'),

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
    refs.status.innerHTML = '<span class="dot good">●</span> Churn play is profitable and payback is within target';
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
    'retainedMemberDelta',
    'averageMonthlyNetLift',
    'periodNetBenefit',
    'roiPct',
    'paybackMonths',
    'breakEvenTargetChurnPct',
    'currentEndingMembers',
    'targetEndingMembers',
    'incrementalRevenue',
    'incrementalVariableCost',
    'incrementalProgramCost',
    'incrementalNetBeforeSetup',
  ];

  for (const id of ids) {
    refs[id].textContent = '-';
  }

  refs.summary.value = '';
  refs.status.innerHTML = '<span class="dot bad">●</span> Check inputs';
}

function renderResult(result) {
  showError('');

  refs.retainedMemberDelta.textContent = num.format(result.retainedMemberDelta);
  refs.averageMonthlyNetLift.textContent = money.format(result.averageMonthlyNetLift);
  refs.periodNetBenefit.textContent = money.format(result.periodNetBenefit);
  refs.roiPct.textContent = Number.isFinite(result.roiPct) ? `${num.format(result.roiPct)}%` : '∞';
  refs.paybackMonths.textContent = Number.isFinite(result.paybackMonths)
    ? `${num.format(result.paybackMonths)} months`
    : 'No payback';
  refs.breakEvenTargetChurnPct.textContent = Number.isFinite(result.breakEvenTargetChurnPct)
    ? `${num.format(result.breakEvenTargetChurnPct)}%`
    : 'Not reachable';

  refs.currentEndingMembers.textContent = num.format(result.currentEndingMembers);
  refs.targetEndingMembers.textContent = num.format(result.targetEndingMembers);
  refs.incrementalRevenue.textContent = money.format(result.incrementalRevenue);
  refs.incrementalVariableCost.textContent = money.format(result.incrementalVariableCost);
  refs.incrementalProgramCost.textContent = money.format(result.incrementalProgramCost);
  refs.incrementalNetBeforeSetup.textContent = money.format(result.incrementalNetBeforeSetup);

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

  const result = calculateCreatorMembershipChurnReductionROI(input);
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
