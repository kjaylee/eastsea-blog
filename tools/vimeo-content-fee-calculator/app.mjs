import { DEFAULT_INPUT, calculateVimeoContentFee, buildSummary } from './logic.mjs';

const STORAGE_KEY = 'vimeo_content_fee_calculator_v1';
const $ = (id) => document.getElementById(id);

// Input refs
const refs = {
  contentPrice: $('contentPrice'),
  rentalPrice: $('rentalPrice'),
  monthlySubPrice: $('monthlySubPrice'),
  transactionType: $('transactionType'),
  paymentProcessor: $('paymentProcessor'),
  monthlyTransactions: $('monthlyTransactions'),
  monthlySubscribers: $('monthlySubscribers'),
  vatRatePct: $('vatRatePct'),
  monthlyFixedCosts: $('monthlyFixedCosts'),

  // Output KPIs
  kpiActivePayout: $('kpiActivePayout'),
  kpiVimeoFeePerTx: $('kpiVimeoFeePerTx'),
  kpiPaymentFeePerTx: $('kpiPaymentFeePerTx'),
  kpiTotalFeeRate: $('kpiTotalFeeRate'),
  kpiMonthlyGross: $('kpiMonthlyGross'),
  kpiMonthlyVimeoFees: $('kpiMonthlyVimeoFees'),
  kpiMonthlyPaymentFees: $('kpiMonthlyPaymentFees'),
  kpiMonthlyPayout: $('kpiMonthlyPayout'),
  kpiVatAmount: $('kpiVatAmount'),
  kpiNetProfit: $('kpiNetProfit'),
  kpiNetMargin: $('kpiNetMargin'),
  kpiBreakEven: $('kpiBreakEven'),
  kpiAnnualGross: $('kpiAnnualGross'),
  kpiAnnualNet: $('kpiAnnualNet'),

  // Table
  buyPayout: $('buyPayout'),
  buyFeeRate: $('buyFeeRate'),
  rentPayout: $('rentPayout'),
  rentFeeRate: $('rentFeeRate'),
  subPayout: $('subPayout'),
  subFeeRate: $('subFeeRate'),

  status: $('status'),
  summary: $('summary'),
  error: $('error'),
  resetBtn: $('resetBtn'),
  copyBtn: $('copyBtn'),
  subRowGroup: $('subRowGroup'),
};

const fmt = (n) => {
  if (n === null || n === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
};
const pct = (n) => (n === null || n === undefined) ? 'N/A' : n.toFixed(2) + '%';
const num = (n) => (n === null || n === undefined) ? 'N/A' : n.toLocaleString('en-US', { maximumFractionDigits: 0 });

function readInput() {
  return {
    contentPrice: refs.contentPrice.value,
    rentalPrice: refs.rentalPrice.value,
    monthlySubPrice: refs.monthlySubPrice.value,
    transactionType: refs.transactionType.value,
    paymentProcessor: refs.paymentProcessor.value,
    monthlyTransactions: refs.monthlyTransactions.value,
    monthlySubscribers: refs.monthlySubscribers.value,
    vatRatePct: refs.vatRatePct.value,
    monthlyFixedCosts: refs.monthlyFixedCosts.value,
  };
}

function saveToStorage(input) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(input)); } catch (_) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function applyInput(input) {
  for (const key of Object.keys(DEFAULT_INPUT)) {
    const el = refs[key];
    if (!el) continue;
    if (el.tagName === 'SELECT') {
      el.value = input[key] ?? DEFAULT_INPUT[key];
    } else {
      el.value = input[key] ?? DEFAULT_INPUT[key];
    }
  }
}

function updateSubriberRow() {
  const type = refs.transactionType.value;
  if (refs.subRowGroup) {
    refs.subRowGroup.style.display = (type !== 'subscription') ? '' : 'none';
  }
  // When subscription mode, use monthlyTransactions as subscriber count
  const subLabel = document.getElementById('labelMonthlyTransactions');
  const subSubscribersRow = document.getElementById('subSubscribersRow');
  if (subLabel) {
    subLabel.textContent = type === 'subscription' ? '월 구독자 수' : '월 거래 건수';
  }
  if (subSubscribersRow) {
    subSubscribersRow.style.display = type === 'subscription' ? 'none' : '';
  }
}

function showError(msg) {
  if (!refs.error) return;
  refs.error.textContent = msg;
  refs.error.classList.toggle('show', !!msg);
}

function render(result) {
  showError('');

  // Per-tx KPIs
  refs.kpiActivePayout.textContent = fmt(result.activePayoutPerTx);
  refs.kpiVimeoFeePerTx.textContent = fmt(result.activeVimeoFeePerTx);
  refs.kpiPaymentFeePerTx.textContent = fmt(result.activePaymentFeePerTx);
  refs.kpiTotalFeeRate.textContent = pct(result.totalFeeRatePct);

  // Monthly
  refs.kpiMonthlyGross.textContent = fmt(result.totalGrossRevenue);
  refs.kpiMonthlyVimeoFees.textContent = fmt(result.totalVimeoFees);
  refs.kpiMonthlyPaymentFees.textContent = fmt(result.totalPaymentFees);
  refs.kpiMonthlyPayout.textContent = fmt(result.totalCreatorPayout);
  refs.kpiVatAmount.textContent = fmt(result.vatAmount);
  refs.kpiNetProfit.textContent = fmt(result.netProfit);
  refs.kpiNetMargin.textContent = pct(result.overallNetMarginPct);
  refs.kpiBreakEven.textContent = result.breakEvenTransactions !== null
    ? num(result.breakEvenTransactions) + ' 건'
    : 'N/A';

  // Annual
  refs.kpiAnnualGross.textContent = fmt(result.annualGrossRevenue);
  refs.kpiAnnualNet.textContent = fmt(result.annualNetProfit);

  // Comparison table
  refs.buyPayout.textContent = result.buy.price > 0 ? `${fmt(result.buy.payout)} / ${fmt(result.buy.price)}` : '-';
  refs.buyFeeRate.textContent = result.buy.price > 0 ? pct(100 - result.buy.netMarginPct) : '-';
  refs.rentPayout.textContent = result.rent.price > 0 ? `${fmt(result.rent.payout)} / ${fmt(result.rent.price)}` : '-';
  refs.rentFeeRate.textContent = result.rent.price > 0 ? pct(100 - result.rent.netMarginPct) : '-';
  refs.subPayout.textContent = result.subscription.price > 0 ? `${fmt(result.subscription.payout)} / ${fmt(result.subscription.price)}` : '-';
  refs.subFeeRate.textContent = result.subscription.price > 0 ? pct(100 - result.subscription.netMarginPct) : '-';

  // Status badge
  const statusEl = refs.status;
  statusEl.className = 'pill';
  if (result.status === 'profitable') {
    statusEl.textContent = '✅ 수익 발생';
    statusEl.classList.add('ok');
  } else if (result.status === 'tight') {
    statusEl.textContent = '⚠️ 수익 미미';
    statusEl.classList.add('warn');
  } else {
    statusEl.textContent = '🔴 손실 발생';
    statusEl.classList.add('err');
  }

  // Summary textarea
  refs.summary.value = buildSummary(result);
}

function calculate() {
  const input = readInput();
  saveToStorage(input);
  try {
    const result = calculateVimeoContentFee(input);
    render(result);
  } catch (e) {
    showError(e.message);
  }
}

// Event listeners: recalculate on any input change
document.querySelectorAll('input, select').forEach((el) => {
  el.addEventListener('input', () => {
    updateSubriberRow();
    calculate();
  });
  el.addEventListener('change', () => {
    updateSubriberRow();
    calculate();
  });
});

if (refs.resetBtn) {
  refs.resetBtn.addEventListener('click', () => {
    applyInput(DEFAULT_INPUT);
    localStorage.removeItem(STORAGE_KEY);
    updateSubriberRow();
    calculate();
  });
}

if (refs.copyBtn) {
  refs.copyBtn.addEventListener('click', () => {
    if (refs.summary && refs.summary.value) {
      navigator.clipboard.writeText(refs.summary.value).catch(() => {
        refs.summary.select();
        document.execCommand('copy');
      });
    }
  });
}

// Init
const saved = loadFromStorage();
applyInput(saved || DEFAULT_INPUT);
updateSubriberRow();
calculate();
