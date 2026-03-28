import {
  DEFAULT_INPUT,
  validateInputs,
  calculateBrandDeal,
  buildSummary,
} from './logic.mjs';

function $(id) {
  return document.getElementById(id);
}

const refs = {
  deliverables: $('deliverables'),
  baseFeePerDeliverable: $('baseFeePerDeliverable'),
  usageMonths: $('usageMonths'),
  usageFeePerMonth: $('usageFeePerMonth'),
  whitelistingMonths: $('whitelistingMonths'),
  whitelistingFeePerMonth: $('whitelistingFeePerMonth'),
  exclusivityMonths: $('exclusivityMonths'),
  exclusivityFeePerMonth: $('exclusivityFeePerMonth'),
  managerFeePct: $('managerFeePct'),
  agencyFeePct: $('agencyFeePct'),
  platformFeePct: $('platformFeePct'),
  paymentProcessingFeePct: $('paymentProcessingFeePct'),
  paymentFixedFee: $('paymentFixedFee'),
  productionCost: $('productionCost'),
  assistantCost: $('assistantCost'),
  travelCost: $('travelCost'),
  taxReservePct: $('taxReservePct'),
  targetNetTakeHome: $('targetNetTakeHome'),
  error: $('error'),
  status: $('status'),
  summary: $('summary'),
  copyButton: $('copySummary'),
  resetButton: $('resetDefaults'),
  grossQuote: $('grossQuote'),
  creatorNetTakeHome: $('creatorNetTakeHome'),
  requiredGrossQuote: $('requiredGrossQuote'),
  gapToTarget: $('gapToTarget'),
  effectiveTakeHomeRatePct: $('effectiveTakeHomeRatePct'),
  rightsSubtotal: $('rightsSubtotal'),
  contentSubtotal: $('contentSubtotal'),
  managerFeeAmount: $('managerFeeAmount'),
  agencyFeeAmount: $('agencyFeeAmount'),
  platformFeeAmount: $('platformFeeAmount'),
  paymentProcessingAmount: $('paymentProcessingAmount'),
  hardCosts: $('hardCosts'),
  preTaxNet: $('preTaxNet'),
  taxReserveAmount: $('taxReserveAmount'),
  requiredBaseFeePerDeliverable: $('requiredBaseFeePerDeliverable'),
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

function setDefaults() {
  for (const [key, value] of Object.entries(DEFAULT_INPUT)) {
    if (refs[key]) {
      refs[key].value = value;
    }
  }
}

function readInput() {
  return {
    deliverables: Number(refs.deliverables.value),
    baseFeePerDeliverable: Number(refs.baseFeePerDeliverable.value),
    usageMonths: Number(refs.usageMonths.value),
    usageFeePerMonth: Number(refs.usageFeePerMonth.value),
    whitelistingMonths: Number(refs.whitelistingMonths.value),
    whitelistingFeePerMonth: Number(refs.whitelistingFeePerMonth.value),
    exclusivityMonths: Number(refs.exclusivityMonths.value),
    exclusivityFeePerMonth: Number(refs.exclusivityFeePerMonth.value),
    managerFeePct: Number(refs.managerFeePct.value),
    agencyFeePct: Number(refs.agencyFeePct.value),
    platformFeePct: Number(refs.platformFeePct.value),
    paymentProcessingFeePct: Number(refs.paymentProcessingFeePct.value),
    paymentFixedFee: Number(refs.paymentFixedFee.value),
    productionCost: Number(refs.productionCost.value),
    assistantCost: Number(refs.assistantCost.value),
    travelCost: Number(refs.travelCost.value),
    taxReservePct: Number(refs.taxReservePct.value),
    targetNetTakeHome: Number(refs.targetNetTakeHome.value),
  };
}

function clearOutputs() {
  [
    'grossQuote',
    'creatorNetTakeHome',
    'requiredGrossQuote',
    'gapToTarget',
    'effectiveTakeHomeRatePct',
    'rightsSubtotal',
    'contentSubtotal',
    'managerFeeAmount',
    'agencyFeeAmount',
    'platformFeeAmount',
    'paymentProcessingAmount',
    'hardCosts',
    'preTaxNet',
    'taxReserveAmount',
    'requiredBaseFeePerDeliverable',
  ].forEach((key) => {
    refs[key].textContent = '—';
  });
  refs.summary.value = '';
}

function setStatus(text, tone = 'neutral') {
  refs.status.textContent = text;
  refs.status.dataset.tone = tone;
}

function formatMoneyOrUnavailable(value) {
  return Number.isFinite(value) ? money.format(value) : 'Unavailable';
}

function render() {
  const input = readInput();
  const validation = validateInputs(input);

  refs.error.hidden = validation.valid;
  refs.error.textContent = validation.message;

  if (!validation.valid) {
    clearOutputs();
    setStatus('Fix the highlighted input issue to calculate take-home.', 'bad');
    return;
  }

  const result = calculateBrandDeal(input);

  refs.grossQuote.textContent = money.format(result.grossQuote);
  refs.creatorNetTakeHome.textContent = money.format(result.creatorNetTakeHome);
  refs.requiredGrossQuote.textContent = formatMoneyOrUnavailable(result.requiredGrossQuote);
  refs.gapToTarget.textContent = money.format(result.gapToTarget);
  refs.effectiveTakeHomeRatePct.textContent = `${percent.format(result.effectiveTakeHomeRatePct)}%`;
  refs.rightsSubtotal.textContent = money.format(result.rightsSubtotal);
  refs.contentSubtotal.textContent = money.format(result.contentSubtotal);
  refs.managerFeeAmount.textContent = money.format(result.managerFeeAmount);
  refs.agencyFeeAmount.textContent = money.format(result.agencyFeeAmount);
  refs.platformFeeAmount.textContent = money.format(result.platformFeeAmount);
  refs.paymentProcessingAmount.textContent = money.format(
    result.paymentProcessingPctAmount + result.paymentFixedFee
  );
  refs.hardCosts.textContent = money.format(result.hardCosts);
  refs.preTaxNet.textContent = money.format(result.preTaxNet);
  refs.taxReserveAmount.textContent = money.format(result.taxReserveAmount);
  refs.requiredBaseFeePerDeliverable.textContent = formatMoneyOrUnavailable(result.requiredBaseFeePerDeliverable);

  if (result.status === 'on-track') {
    setStatus('Current quote clears the target net take-home.', 'good');
  } else if (result.status === 'close') {
    setStatus('Current quote is close, but still below the target net.', 'warn');
  } else if (result.status === 'gap') {
    setStatus('Current quote misses the target net. Use the required quote output before replying.', 'bad');
  } else {
    setStatus('Deal math is ready. Pressure-test the rights terms before sending the quote.', 'neutral');
  }

  refs.summary.value = buildSummary(result);
}

async function copySummary() {
  if (!refs.summary.value.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(refs.summary.value);
    setStatus('Summary copied. Paste it into your negotiation notes or proposal draft.', 'good');
  } catch {
    setStatus('Clipboard is unavailable. Copy the summary manually from the text box.', 'warn');
  }
}

setDefaults();
render();

Object.values(refs).forEach((value) => {
  if (value instanceof HTMLInputElement) {
    value.addEventListener('input', render);
  }
});

refs.copyButton.addEventListener('click', copySummary);
refs.resetButton.addEventListener('click', () => {
  setDefaults();
  render();
});
