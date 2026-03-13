import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRollingReserve,
  buildSummary,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const refs = {
  form: {
    monthlyProcessedVolume: $('monthlyProcessedVolume'),
    processingFeeRate: $('processingFeeRate'),
    refundRate: $('refundRate'),
    chargebackLossRate: $('chargebackLossRate'),
    reserveRate: $('reserveRate'),
    reserveHoldMonths: $('reserveHoldMonths'),
    monthlyFixedCost: $('monthlyFixedCost'),
    annualCostOfCapitalRate: $('annualCostOfCapitalRate'),
    analysisMonths: $('analysisMonths'),
  },
  error: $('error'),
  status: $('status'),
  summary: $('summary'),
  currentMonthCashAfterReserve: $('currentMonthCashAfterReserve'),
  steadyStateMonthlyCash: $('steadyStateMonthlyCash'),
  monthlyReserveWithheld: $('monthlyReserveWithheld'),
  totalReserveReleased: $('totalReserveReleased'),
  endingReserveBalance: $('endingReserveBalance'),
  steadyStateReserveBalance: $('steadyStateReserveBalance'),
  annualFinancingCostAtSteadyState: $('annualFinancingCostAtSteadyState'),
  breakEvenProcessedVolume: $('breakEvenProcessedVolume'),
  monthlyNetBeforeReserve: $('monthlyNetBeforeReserve'),
  totalReserveWithheld: $('totalReserveWithheld'),
  periodNetCashAfterFixedCost: $('periodNetCashAfterFixedCost'),
  netRateBeforeReserve: $('netRateBeforeReserve'),
  contributionAfterFinancing: $('contributionAfterFinancing'),
  maturedMonths: $('maturedMonths'),
  resetBtn: $('resetBtn'),
  copyBtn: $('copyBtn'),
};

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}%`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function getInput() {
  return Object.fromEntries(
    Object.entries(refs.form).map(([key, element]) => [key, element.value])
  );
}

function setDefaults() {
  for (const [key, value] of Object.entries(DEFAULT_INPUT)) {
    refs.form[key].value = value;
  }
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function clearOutputs() {
  [
    'currentMonthCashAfterReserve',
    'steadyStateMonthlyCash',
    'monthlyReserveWithheld',
    'totalReserveReleased',
    'endingReserveBalance',
    'steadyStateReserveBalance',
    'annualFinancingCostAtSteadyState',
    'breakEvenProcessedVolume',
    'monthlyNetBeforeReserve',
    'totalReserveWithheld',
    'periodNetCashAfterFixedCost',
    'netRateBeforeReserve',
    'contributionAfterFinancing',
    'maturedMonths',
  ].forEach((key) => {
    refs[key].textContent = '-';
  });
  refs.summary.value = '';
}

function setStatus(result) {
  let tone = 'good';
  let text = 'Reserve drag looks manageable under the current assumptions.';

  if (result.currentMonthCashAfterReserve < 0) {
    tone = 'bad';
    text = 'Month-one cash turns negative after reserve withholding. Recheck fees, reserve rate, or fixed cost.';
  } else if (result.annualFinancingCostAtSteadyState > result.monthlyFixedCost * 6) {
    tone = 'warn';
    text = 'Locked reserve creates a meaningful working-capital drag. Watch financing cost and hold length.';
  } else if (!Number.isFinite(result.breakEvenProcessedVolume)) {
    tone = 'warn';
    text = 'Reserve financing plus variable losses erase contribution margin. Break-even volume is non-finite.';
  }

  refs.status.className = `status ${tone}`;
  refs.status.textContent = text;
}

function render() {
  const input = getInput();
  const validation = validateInputs(input);

  if (!validation.valid) {
    setError(validation.message);
    clearOutputs();
    refs.status.className = 'status bad';
    refs.status.textContent = 'Fix the highlighted assumption error to calculate cashflow.';
    return;
  }

  setError('');
  const result = calculateRollingReserve(input);

  refs.currentMonthCashAfterReserve.textContent = formatMoney(result.currentMonthCashAfterReserve);
  refs.steadyStateMonthlyCash.textContent = formatMoney(result.steadyStateMonthlyCash);
  refs.monthlyReserveWithheld.textContent = formatMoney(result.monthlyReserveWithheld);
  refs.totalReserveReleased.textContent = formatMoney(result.totalReserveReleased);
  refs.endingReserveBalance.textContent = formatMoney(result.endingReserveBalance);
  refs.steadyStateReserveBalance.textContent = formatMoney(result.steadyStateReserveBalance);
  refs.annualFinancingCostAtSteadyState.textContent = formatMoney(result.annualFinancingCostAtSteadyState);
  refs.breakEvenProcessedVolume.textContent = Number.isFinite(result.breakEvenProcessedVolume)
    ? formatMoney(result.breakEvenProcessedVolume)
    : 'Non-finite';
  refs.monthlyNetBeforeReserve.textContent = formatMoney(result.monthlyNetBeforeReserve);
  refs.totalReserveWithheld.textContent = formatMoney(result.totalReserveWithheld);
  refs.periodNetCashAfterFixedCost.textContent = formatMoney(result.periodNetCashAfterFixedCost);
  refs.netRateBeforeReserve.textContent = formatPercent(result.netRateBeforeReserve);
  refs.contributionAfterFinancing.textContent = formatPercent(result.monthlyContributionAfterReserveFinancingRate);
  refs.maturedMonths.textContent = `${formatNumber(result.maturedMonths)} month(s)`;
  refs.summary.value = buildSummary(result, 'en-US', 'USD');
  setStatus(result);
}

refs.resetBtn.addEventListener('click', () => {
  setDefaults();
  render();
});

refs.copyBtn.addEventListener('click', async () => {
  try {
    if (!refs.summary.value) render();
    await navigator.clipboard.writeText(refs.summary.value);
    refs.copyBtn.textContent = 'Copied';
    setTimeout(() => {
      refs.copyBtn.textContent = 'Copy Summary';
    }, 1400);
  } catch {
    refs.copyBtn.textContent = 'Copy failed';
    setTimeout(() => {
      refs.copyBtn.textContent = 'Copy Summary';
    }, 1400);
  }
});

Object.values(refs.form).forEach((element) => {
  element.addEventListener('input', render);
});

setDefaults();
render();
