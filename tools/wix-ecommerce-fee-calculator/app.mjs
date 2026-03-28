// Wix eCommerce Fee Calculator — app.mjs
import {
  DEFAULT_INPUT,
  PLANS,
  PAYMENT_METHODS,
  validateInputs,
  calculateWixFees,
  buildSummary,
} from './logic.mjs';

const STORAGE_KEY = 'wix_ecommerce_fee_calc_v1';
const $ = (id) => document.getElementById(id);

// ── i18n ──────────────────────────────────────────────────────────────────────
const i18n = {
  ko: {
    title:        'Wix eCommerce 수수료 계산기',
    subtitle:     'Wix 쇼핑몰 결제 수수료, 순 수령액, 월간 수익을 즉시 계산하세요. 플랜별 비용과 손익분기 판매가까지 한번에.',
    inputs:       '입력값',
    kpi:          '핵심 지표',
    detail:       '세부 분석',
    monthly:      '월간 예측',
    productPrice: '판매가 (USD)',
    quantity:     '수량',
    plan:         'Wix 플랜',
    paymentMethod:'결제 수단',
    includeShipping: '배송비 포함',
    shippingCost: '배송비 (USD)',
    cogs:         '원가 / COGS (USD)',
    monthlyOrders:'월 예상 주문 수',
    copy:         '결과 복사',
    reset:        '초기화',
    back:         '← 도구 목록',
    lang:         'EN',
    note:         '이 계산기는 미국 기준 Wix 요금표를 사용합니다. 실제 수수료는 국가, 통화, 결제 유형에 따라 다를 수 있습니다. Wix는 타사 결제 수단 사용 시 별도 거래 수수료를 부과하지 않습니다.',
    k_orderTotal:     '주문 합계',
    k_processingFee:  '결제 수수료',
    k_wixTxFee:       'Wix 거래 수수료',
    k_totalFees:      '총 수수료',
    k_netPayout:      '순 수령액',
    k_grossProfit:    '총이익',
    k_profitMargin:   '이익률',
    k_breakEven:      '손익분기 판매가',
    d_subtotal:       '상품 소계',
    d_shipping:       '배송비',
    d_orderTotal:     '주문 합계',
    d_processingPct:  '결제 수수료율(%)',
    d_processingFixed:'결제 고정 수수료',
    d_processingTotal:'결제 수수료 합계',
    d_wixFee:         'Wix 거래 수수료',
    d_effectiveRate:  '실효 수수료율',
    d_netPayout:      '순 수령액',
    d_cogs:           '원가(COGS)',
    d_grossProfit:    '총이익',
    d_planCostPerOrder:'플랜 비용 / 주문',
    d_netAfterPlan:   '플랜 포함 순이익',
    m_revenue:        '월 매출',
    m_processingFees: '월 결제 수수료',
    m_planCost:       '월 플랜 구독비',
    m_totalFees:      '월 수수료 합계',
    m_netRevenue:     '월 순매출',
    m_grossProfit:    '월 총이익',
    m_margin:         '월 순이익률',
    status_profitable:'✅ 수익성 있음',
    status_tight:     '⚠️ 타이트한 마진',
    status_loss:      '🔴 손실 구간',
  },
  en: {
    title:        'Wix eCommerce Fee Calculator',
    subtitle:     'Instantly calculate Wix payment processing fees, net payout, and monthly profit. Covers all Wix plans and payment methods.',
    inputs:       'Inputs',
    kpi:          'Key Metrics',
    detail:       'Fee Breakdown',
    monthly:      'Monthly Projection',
    productPrice: 'Sale Price (USD)',
    quantity:     'Quantity',
    plan:         'Wix Plan',
    paymentMethod:'Payment Method',
    includeShipping: 'Include Shipping',
    shippingCost: 'Shipping Cost (USD)',
    cogs:         'Cost of Goods (COGS, USD)',
    monthlyOrders:'Est. Monthly Orders',
    copy:         'Copy Summary',
    reset:        'Reset',
    back:         '← Tools Portal',
    lang:         'KO',
    note:         'Uses US Wix fee rates for 2025. Actual fees vary by country, currency, and payment type. Wix does NOT charge an extra transaction fee when using third-party payment processors.',
    k_orderTotal:     'Order Total',
    k_processingFee:  'Processing Fee',
    k_wixTxFee:       'Wix Tx Fee',
    k_totalFees:      'Total Fees',
    k_netPayout:      'Net Payout',
    k_grossProfit:    'Gross Profit',
    k_profitMargin:   'Profit Margin',
    k_breakEven:      'Break-even Price',
    d_subtotal:       'Product Subtotal',
    d_shipping:       'Shipping',
    d_orderTotal:     'Order Total',
    d_processingPct:  'Processing Rate (%)',
    d_processingFixed:'Processing Fixed Fee',
    d_processingTotal:'Total Processing Fee',
    d_wixFee:         'Wix Transaction Fee',
    d_effectiveRate:  'Effective Rate',
    d_netPayout:      'Net Payout',
    d_cogs:           'COGS',
    d_grossProfit:    'Gross Profit',
    d_planCostPerOrder:'Plan Cost / Order',
    d_netAfterPlan:   'Net After Plan Cost',
    m_revenue:        'Monthly Revenue',
    m_processingFees: 'Monthly Processing Fees',
    m_planCost:       'Monthly Plan Cost',
    m_totalFees:      'Monthly Total Fees',
    m_netRevenue:     'Monthly Net Revenue',
    m_grossProfit:    'Monthly Gross Profit',
    m_margin:         'Monthly Net Margin',
    status_profitable:'✅ Profitable',
    status_tight:     '⚠️ Tight Margin',
    status_loss:      '🔴 Loss',
  },
};

let locale = 'ko';

function t(key) {
  return (i18n[locale] || i18n.ko)[key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.title = `${t('title')} | eastsea.monster`;
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const refs = {
  productPrice:    $('productPrice'),
  quantity:        $('quantity'),
  plan:            $('plan'),
  paymentMethod:   $('paymentMethod'),
  includeShipping: $('includeShipping'),
  shippingCost:    $('shippingCost'),
  shippingRow:     $('shippingRow'),
  cogs:            $('cogs'),
  monthlyOrders:   $('monthlyOrders'),

  // KPIs
  kOrderTotal:    $('kOrderTotal'),
  kProcessingFee: $('kProcessingFee'),
  kWixTxFee:      $('kWixTxFee'),
  kTotalFees:     $('kTotalFees'),
  kNetPayout:     $('kNetPayout'),
  kGrossProfit:   $('kGrossProfit'),
  kProfitMargin:  $('kProfitMargin'),
  kBreakEven:     $('kBreakEven'),

  // Detail table
  dSubtotal:         $('dSubtotal'),
  dShipping:         $('dShipping'),
  dOrderTotal:       $('dOrderTotal'),
  dProcessingPct:    $('dProcessingPct'),
  dProcessingFixed:  $('dProcessingFixed'),
  dProcessingTotal:  $('dProcessingTotal'),
  dWixFee:           $('dWixFee'),
  dEffectiveRate:    $('dEffectiveRate'),
  dNetPayout:        $('dNetPayout'),
  dCogs:             $('dCogs'),
  dGrossProfit:      $('dGrossProfit'),
  dPlanCostPerOrder: $('dPlanCostPerOrder'),
  dNetAfterPlan:     $('dNetAfterPlan'),

  // Monthly
  mRevenue:        $('mRevenue'),
  mProcessingFees: $('mProcessingFees'),
  mPlanCost:       $('mPlanCost'),
  mTotalFees:      $('mTotalFees'),
  mNetRevenue:     $('mNetRevenue'),
  mGrossProfit:    $('mGrossProfit'),
  mMargin:         $('mMargin'),

  // UI
  statusBadge: $('statusBadge'),
  error:       $('error'),
  summary:     $('summary'),
  copyBtn:     $('copyBtn'),
  resetBtn:    $('resetBtn'),
  langBtn:     $('langBtn'),
};

// ── Format helpers ─────────────────────────────────────────────────────────────
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const pct  = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

// ── Persist ───────────────────────────────────────────────────────────────────
function saveState() {
  try {
    const state = {
      productPrice:    refs.productPrice.value,
      quantity:        refs.quantity.value,
      plan:            refs.plan.value,
      paymentMethod:   refs.paymentMethod.value,
      includeShipping: refs.includeShipping.checked,
      shippingCost:    refs.shippingCost.value,
      cogs:            refs.cogs.value,
      monthlyOrders:   refs.monthlyOrders.value,
      locale,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function populateFields(state) {
  refs.productPrice.value    = state.productPrice  ?? DEFAULT_INPUT.productPrice;
  refs.quantity.value        = state.quantity       ?? DEFAULT_INPUT.quantity;
  refs.plan.value            = state.plan           ?? DEFAULT_INPUT.plan;
  refs.paymentMethod.value   = state.paymentMethod  ?? DEFAULT_INPUT.paymentMethod;
  refs.includeShipping.checked = !!(state.includeShipping ?? DEFAULT_INPUT.includeShipping);
  refs.shippingCost.value    = state.shippingCost   ?? DEFAULT_INPUT.shippingCost;
  refs.cogs.value            = state.cogs           ?? DEFAULT_INPUT.cogs;
  refs.monthlyOrders.value   = state.monthlyOrders  ?? DEFAULT_INPUT.monthlyOrders;
  toggleShippingRow();
}

// ── Shipping row visibility ────────────────────────────────────────────────────
function toggleShippingRow() {
  refs.shippingRow.style.display = refs.includeShipping.checked ? '' : 'none';
}

// ── Color helper ──────────────────────────────────────────────────────────────
function colorVal(el, value) {
  el.style.color = value > 0 ? 'var(--ok)' : value < 0 ? 'var(--err)' : '';
}

// ── Calculate ─────────────────────────────────────────────────────────────────
let lastResult = null;

function recalc() {
  refs.error.classList.remove('show');

  const input = {
    productPrice:    refs.productPrice.value,
    quantity:        refs.quantity.value,
    plan:            refs.plan.value,
    paymentMethod:   refs.paymentMethod.value,
    includeShipping: refs.includeShipping.checked,
    shippingCost:    refs.shippingCost.value,
    cogs:            refs.cogs.value,
    monthlyOrders:   refs.monthlyOrders.value,
  };

  const validation = validateInputs(input);
  if (!validation.valid) {
    refs.error.textContent = validation.msg;
    refs.error.classList.add('show');
    return;
  }

  let r;
  try { r = calculateWixFees(input); } catch (e) {
    refs.error.textContent = e.message;
    refs.error.classList.add('show');
    return;
  }

  lastResult = r;

  // KPIs
  refs.kOrderTotal.textContent    = usd.format(r.orderTotal);
  refs.kProcessingFee.textContent = `${usd.format(r.processingFeeTotal)} (${pct.format(r.processingFeePct)}% + $${r.processingFeeFixed})`;
  refs.kWixTxFee.textContent      = '$0.00 🎉';
  refs.kTotalFees.textContent     = usd.format(r.totalFees);
  refs.kNetPayout.textContent     = usd.format(r.netPayout);
  refs.kGrossProfit.textContent   = usd.format(r.grossProfit);
  refs.kProfitMargin.textContent  = `${pct.format(r.profitMarginPct)}%`;
  refs.kBreakEven.textContent     = usd.format(r.breakEvenPrice);

  colorVal(refs.kGrossProfit,  r.grossProfit);
  colorVal(refs.kProfitMargin, r.profitMarginPct);
  colorVal(refs.kNetPayout,    r.netPayout);

  // Detail table
  refs.dSubtotal.textContent         = usd.format(r.subtotal);
  refs.dShipping.textContent         = usd.format(r.shippingCost);
  refs.dOrderTotal.textContent       = usd.format(r.orderTotal);
  refs.dProcessingPct.textContent    = `${pct.format(r.processingFeePct)}%`;
  refs.dProcessingFixed.textContent  = `$${pct.format(r.processingFeeFixed)}`;
  refs.dProcessingTotal.textContent  = usd.format(r.processingFeeTotal);
  refs.dWixFee.textContent           = '$0.00';
  refs.dEffectiveRate.textContent    = `${pct.format(r.effectiveRatePct)}%`;
  refs.dNetPayout.textContent        = usd.format(r.netPayout);
  refs.dCogs.textContent             = usd.format(r.cogs);
  refs.dGrossProfit.textContent      = usd.format(r.grossProfit);
  refs.dPlanCostPerOrder.textContent = usd.format(r.planCostPerOrder);
  refs.dNetAfterPlan.textContent     = usd.format(r.netAfterPlanCost);

  // Monthly
  refs.mRevenue.textContent        = usd.format(r.monthlyGrossRevenue);
  refs.mProcessingFees.textContent = usd.format(r.monthlyProcessingFees);
  refs.mPlanCost.textContent       = usd.format(r.monthlyPlanCost);
  refs.mTotalFees.textContent      = usd.format(r.monthlyTotalFees);
  refs.mNetRevenue.textContent     = usd.format(r.monthlyNetRevenue);
  refs.mGrossProfit.textContent    = usd.format(r.monthlyGrossProfit);
  refs.mMargin.textContent         = `${pct.format(r.monthlyNetMarginPct)}%`;

  colorVal(refs.mGrossProfit, r.monthlyGrossProfit);
  colorVal(refs.mMargin,      r.monthlyNetMarginPct);

  // Status badge
  const statusKey = `status_${r.status}`;
  refs.statusBadge.textContent = t(statusKey);
  refs.statusBadge.className = 'status-badge ' + r.status;

  // Summary textarea
  refs.summary.value = buildSummary(r, locale === 'ko' ? 'ko-KR' : 'en-US');

  saveState();
}

// ── Events ────────────────────────────────────────────────────────────────────
[
  'productPrice', 'quantity', 'plan', 'paymentMethod',
  'shippingCost', 'cogs', 'monthlyOrders',
].forEach((key) => {
  refs[key]?.addEventListener('input', recalc);
});

refs.includeShipping.addEventListener('change', () => {
  toggleShippingRow();
  recalc();
});

refs.copyBtn.addEventListener('click', () => {
  if (!lastResult) return;
  const txt = refs.summary.value;
  navigator.clipboard?.writeText(txt).catch(() => {
    refs.summary.select();
    document.execCommand('copy');
  });
});

refs.resetBtn.addEventListener('click', () => {
  populateFields(DEFAULT_INPUT);
  recalc();
});

refs.langBtn.addEventListener('click', () => {
  locale = locale === 'ko' ? 'en' : 'ko';
  refs.langBtn.textContent = t('lang');
  applyI18n();
  recalc();
});

// ── Init ──────────────────────────────────────────────────────────────────────
const savedState = loadState();
if (savedState) {
  locale = savedState.locale === 'en' ? 'en' : 'ko';
}
populateFields(savedState || DEFAULT_INPUT);
applyI18n();
refs.langBtn.textContent = t('lang');
recalc();
