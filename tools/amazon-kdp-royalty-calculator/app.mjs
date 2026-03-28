import {
  DEFAULT_INPUT,
  EBOOK_MARKETS,
  PAPERBACK_MARKETS,
  validateInputs,
  calculateKdpRoyalty,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'amazon_kdp_royalty_calculator_v1';
const $ = (id) => document.getElementById(id);

const refs = {
  format: $('format'),
  ebookMarket: $('ebookMarket'),
  ebookListPrice: $('ebookListPrice'),
  ebookUnitsSold: $('ebookUnitsSold'),
  ebookRoyaltyPlan: $('ebookRoyaltyPlan'),
  ebookFileSizeMb: $('ebookFileSizeMb'),
  ebookVatRatePct: $('ebookVatRatePct'),
  ebookEligibleSalesPct: $('ebookEligibleSalesPct'),
  paperbackMarket: $('paperbackMarket'),
  paperbackListPrice: $('paperbackListPrice'),
  paperbackPrintingCost: $('paperbackPrintingCost'),
  paperbackAmazonUnits: $('paperbackAmazonUnits'),
  paperbackExpandedUnits: $('paperbackExpandedUnits'),
  ebookFields: $('ebookFields'),
  paperbackFields: $('paperbackFields'),
  errorBox: $('errorBox'),
  warningBox: $('warningBox'),
  status: $('status'),
  copyBtn: $('copyBtn'),
  resetBtn: $('resetBtn'),
  summary: $('summary'),
  primaryLabel: $('primaryLabel'),
  primaryValue: $('primaryValue'),
  secondaryLabel: $('secondaryLabel'),
  secondaryValue: $('secondaryValue'),
  tertiaryLabel: $('tertiaryLabel'),
  tertiaryValue: $('tertiaryValue'),
  quaternaryLabel: $('quaternaryLabel'),
  quaternaryValue: $('quaternaryValue'),
  detailRows: $('detailRows'),
};

const numericKeys = [
  'ebookListPrice',
  'ebookUnitsSold',
  'ebookFileSizeMb',
  'ebookVatRatePct',
  'ebookEligibleSalesPct',
  'paperbackListPrice',
  'paperbackPrintingCost',
  'paperbackAmazonUnits',
  'paperbackExpandedUnits',
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

function populateSelect(select, items) {
  select.innerHTML = Object.entries(items).map(([value, item]) => (
    `<option value="${value}">${item.label}</option>`
  )).join('');
}

function applyState(values) {
  refs.format.value = values.format;
  refs.ebookMarket.value = values.ebookMarket;
  refs.ebookListPrice.value = values.ebookListPrice;
  refs.ebookUnitsSold.value = values.ebookUnitsSold;
  refs.ebookRoyaltyPlan.value = values.ebookRoyaltyPlan;
  refs.ebookFileSizeMb.value = values.ebookFileSizeMb;
  refs.ebookVatRatePct.value = values.ebookVatRatePct;
  refs.ebookEligibleSalesPct.value = values.ebookEligibleSalesPct;
  refs.paperbackMarket.value = values.paperbackMarket;
  refs.paperbackListPrice.value = values.paperbackListPrice;
  refs.paperbackPrintingCost.value = values.paperbackPrintingCost;
  refs.paperbackAmazonUnits.value = values.paperbackAmazonUnits;
  refs.paperbackExpandedUnits.value = values.paperbackExpandedUnits;
  syncFieldVisibility();
}

function readState() {
  const state = {
    format: refs.format.value,
    ebookMarket: refs.ebookMarket.value,
    ebookRoyaltyPlan: refs.ebookRoyaltyPlan.value,
    paperbackMarket: refs.paperbackMarket.value,
  };

  for (const key of numericKeys) {
    state[key] = Number(refs[key].value);
  }

  return state;
}

function syncFieldVisibility() {
  const isEbook = refs.format.value === 'ebook';
  refs.ebookFields.classList.toggle('hidden', !isEbook);
  refs.paperbackFields.classList.toggle('hidden', isEbook);
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${Number(value).toFixed(2).replace(/\.00$/, '')}%`;
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

function setStatus(result) {
  if (result.mode === 'ebook') {
    refs.status.textContent = result.royaltyPerSale >= 0
      ? 'Using public KDP eBook formulas (35% / 70%) with VAT and delivery drag.'
      : 'Current eBook inputs imply negative royalty in the 70%-eligible scenario.';
    return;
  }

  refs.status.textContent = result.totalMonthlyRoyalty >= 0
    ? 'Using public KDP paperback formulas for Amazon marketplace and Expanded Distribution.'
    : 'Current paperback assumptions imply negative royalty at the selected price.';
}

function setKpis(result) {
  const money = (value) => formatMoney(value, result.currency);

  if (result.mode === 'ebook') {
    refs.primaryLabel.textContent = 'Royalty per sale';
    refs.primaryValue.textContent = money(result.royaltyPerSale);
    refs.secondaryLabel.textContent = 'Monthly royalty';
    refs.secondaryValue.textContent = money(result.monthlyRoyalty);
    refs.tertiaryLabel.textContent = 'Effective royalty rate';
    refs.tertiaryValue.textContent = formatPercent(result.effectiveRoyaltyRatePct);
    refs.quaternaryLabel.textContent = '70% vs 35% monthly delta';
    refs.quaternaryValue.textContent = money(result.monthlyDeltaVs35);
    return;
  }

  refs.primaryLabel.textContent = 'Amazon royalty / sale';
  refs.primaryValue.textContent = money(result.amazonRoyaltyPerSale);
  refs.secondaryLabel.textContent = 'Expanded royalty / sale';
  refs.secondaryValue.textContent = money(result.expandedRoyaltyPerSale);
  refs.tertiaryLabel.textContent = 'Total monthly royalty';
  refs.tertiaryValue.textContent = money(result.totalMonthlyRoyalty);
  refs.quaternaryLabel.textContent = 'Effective blended rate';
  refs.quaternaryValue.textContent = formatPercent(result.effectiveBlendedRatePct);
}

function renderDetailRows(result) {
  const money = (value) => formatMoney(value, result.currency);
  const rows = result.mode === 'ebook'
    ? [
        ['Marketplace', result.marketLabel],
        ['Exclusive list price', money(result.exclusiveListPrice)],
        ['Applicable VAT', money(result.applicableVatAmount)],
        ['Delivery cost / sale', money(result.deliveryCostPerSale)],
        ['35% royalty / sale', money(result.royalty35PerSale)],
        ['70% royalty / eligible sale', money(result.royalty70EligiblePerSale)],
        ['35% baseline monthly royalty', money(result.monthlyRoyaltyAt35)],
        ['Monthly delivery drag', money(result.monthlyDeliveryDrag)],
        ['Positive-70% minimum list price', money(result.minimumListPriceForPositive70Royalty)],
      ]
    : [
        ['Marketplace', result.marketLabel],
        ['Amazon band', result.amazonBandLabel],
        ['Amazon royalty rate', `${result.amazonRatePct}%`],
        ['Amazon break-even list price', money(result.breakEvenListPriceAmazon)],
        ['Expanded break-even list price', money(result.breakEvenListPriceExpanded)],
        ['60% threshold price', money(result.threshold60)],
        ['Gap to 60% threshold', money(result.priceGapTo60Band)],
        ['Royalty / sale at 60% threshold', money(result.royaltyAt60BandPerSale)],
        ['Total gross sales', money(result.totalGrossSales)],
      ];

  refs.detailRows.innerHTML = rows
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join('');
}

function render() {
  syncFieldVisibility();
  const state = readState();
  const validation = validateInputs(state);

  if (!validation.valid) {
    showError(validation.message);
    showWarnings([]);
    refs.summary.value = '';
    refs.detailRows.innerHTML = '';
    refs.status.textContent = 'Check your inputs.';
    ['primaryValue', 'secondaryValue', 'tertiaryValue', 'quaternaryValue'].forEach((id) => {
      refs[id].textContent = '—';
    });
    return;
  }

  showError('');
  const result = calculateKdpRoyalty(state);
  setKpis(result);
  renderDetailRows(result);
  setStatus(result);
  showWarnings(result.warnings);
  refs.summary.value = buildSummary(result, 'en-US');
  saveState(state);
}

async function copySummary() {
  const text = refs.summary.value.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    window.alert('Summary copied.');
  } catch {
    window.alert('Clipboard unavailable. Please copy manually.');
  }
}

function resetDefaults() {
  applyState(DEFAULT_INPUT);
  render();
}

function init() {
  populateSelect(refs.ebookMarket, EBOOK_MARKETS);
  populateSelect(refs.paperbackMarket, PAPERBACK_MARKETS);
  applyState(loadState());

  [refs.format, refs.ebookMarket, refs.ebookRoyaltyPlan, refs.paperbackMarket].forEach((el) => {
    el.addEventListener('change', render);
  });
  numericKeys.forEach((key) => {
    refs[key].addEventListener('input', render);
    refs[key].addEventListener('change', render);
  });
  refs.copyBtn.addEventListener('click', copySummary);
  refs.resetBtn.addEventListener('click', resetDefaults);
  render();
}

init();
