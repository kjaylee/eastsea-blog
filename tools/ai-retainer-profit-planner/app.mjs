import {
  DEFAULT_INPUT,
  validateInputs,
  calculateRetainerPlan,
  buildSummary,
} from './logic.mjs';

const fieldIds = [
  'monthlyLeads',
  'discoveryRatePct',
  'closeRatePct',
  'avgDeliveryHoursPerClient',
  'teamCostPerHour',
  'toolCostPerClient',
  'overheadPerMonth',
  'targetMarginPct',
  'riskBufferPct',
  'churnRatePct',
  'upsellAttachRatePct',
  'upsellAmountPerClient',
];

const form = document.getElementById('plannerForm');
const errorBox = document.getElementById('errorBox');
const summaryBox = document.getElementById('summaryBox');
const statusBadge = document.getElementById('statusBadge');

const refs = Object.fromEntries(
  fieldIds.map((id) => [id, document.getElementById(id)]),
);

const outputs = {
  qualifiedCalls: document.getElementById('qualifiedCalls'),
  newClients: document.getElementById('newClients'),
  revenuePerClient: document.getElementById('revenuePerClient'),
  variableCostPerClient: document.getElementById('variableCostPerClient'),
  netRevenueAfterChurn: document.getElementById('netRevenueAfterChurn'),
  operatingProfit: document.getElementById('operatingProfit'),
  operatingMarginPct: document.getElementById('operatingMarginPct'),
  breakEvenClients: document.getElementById('breakEvenClients'),
  starterTier: document.getElementById('starterTier'),
  growthTier: document.getElementById('growthTier'),
  scaleTier: document.getElementById('scaleTier'),
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const num2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function readInput() {
  return Object.fromEntries(
    fieldIds.map((id) => [id, Number(refs[id].value)]),
  );
}

function hydrateDefaults() {
  for (const id of fieldIds) {
    refs[id].value = String(DEFAULT_INPUT[id]);
  }
}

function setStatus(text, tone = 'neutral') {
  statusBadge.textContent = text;
  statusBadge.dataset.tone = tone;
}

function renderResult(result) {
  outputs.qualifiedCalls.textContent = num2.format(result.qualifiedCalls);
  outputs.newClients.textContent = num2.format(result.newClients);
  outputs.revenuePerClient.textContent = money.format(result.revenuePerClient);
  outputs.variableCostPerClient.textContent = money.format(result.variableCostPerClient);
  outputs.netRevenueAfterChurn.textContent = money.format(result.netRevenueAfterChurn);
  outputs.operatingProfit.textContent = money.format(result.operatingProfit);
  outputs.operatingMarginPct.textContent = `${num2.format(result.operatingMarginPct)}%`;
  outputs.breakEvenClients.textContent = Number.isFinite(result.breakEvenClients)
    ? num2.format(result.breakEvenClients)
    : '∞';

  outputs.starterTier.textContent = money.format(result.tiers[0].suggestedPrice);
  outputs.growthTier.textContent = money.format(result.tiers[1].suggestedPrice);
  outputs.scaleTier.textContent = money.format(result.tiers[2].suggestedPrice);

  summaryBox.value = buildSummary(result, 'en-US', 'USD');

  if (result.status === 'excellent') {
    setStatus('Excellent margin profile', 'good');
  } else if (result.status === 'viable') {
    setStatus('Viable, monitor churn + close rate', 'warn');
  } else {
    setStatus('Fragile economics, reprice offer', 'bad');
  }
}

function clearResult() {
  for (const node of Object.values(outputs)) {
    node.textContent = '-';
  }
  summaryBox.value = '';
  setStatus('Waiting for valid input', 'neutral');
}

function render() {
  const input = readInput();
  const validation = validateInputs(input);
  if (!validation.valid) {
    errorBox.hidden = false;
    errorBox.textContent = validation.message;
    clearResult();
    return;
  }

  errorBox.hidden = true;
  errorBox.textContent = '';

  const result = calculateRetainerPlan(input);
  renderResult(result);
}

function resetForm() {
  hydrateDefaults();
  render();
}

function copySummary() {
  const text = summaryBox.value.trim();
  if (!text) return;

  navigator.clipboard?.writeText(text)
    .then(() => setStatus('Summary copied to clipboard', 'good'))
    .catch(() => setStatus('Copy failed. Select and copy manually.', 'warn'));
}

for (const id of fieldIds) {
  refs[id].addEventListener('input', render);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});

document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('copyBtn').addEventListener('click', copySummary);

hydrateDefaults();
render();
