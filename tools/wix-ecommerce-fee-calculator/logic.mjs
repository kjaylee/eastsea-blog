// Wix eCommerce Fee Calculator — logic.mjs
// Fee schedule: Wix Payments US 2025 (updated 2025-Q1)
// Source: https://support.wix.com/en/article/wix-payments-service-fees

/** @type {Record<string, {pct: number, fixed: number, label: string, labelKo: string}>} */
export const PAYMENT_METHODS = {
  wix_credit:       { pct: 0.029,  fixed: 0.30, label: 'Wix Payments (Credit/Debit)', labelKo: 'Wix Payments (신용/체크카드)' },
  wix_international:{ pct: 0.039,  fixed: 0.30, label: 'Wix Payments (International Card)', labelKo: 'Wix Payments (해외 카드)' },
  wix_amex:         { pct: 0.035,  fixed: 0.30, label: 'Wix Payments (AmEx)', labelKo: 'Wix Payments (아메리칸 익스프레스)' },
  paypal:           { pct: 0.0349, fixed: 0.49, label: 'PayPal', labelKo: 'PayPal' },
  stripe:           { pct: 0.029,  fixed: 0.30, label: 'Stripe', labelKo: 'Stripe' },
  manual:           { pct: 0.0,    fixed: 0.00, label: 'Manual Payment (Cash/Check)', labelKo: '수동 결제 (현금/수표)' },
};

/** Wix eCommerce plans (billed annually, US pricing 2025)
 *  No Wix-level transaction fees — only payment processor fees apply.
 */
export const PLANS = {
  core:          { monthlyPrice: 29,  label: 'Core',          labelKo: 'Core',          transactionFeePct: 0 },
  business:      { monthlyPrice: 36,  label: 'Business',      labelKo: 'Business',      transactionFeePct: 0 },
  business_elite:{ monthlyPrice: 159, label: 'Business Elite',labelKo: 'Business Elite',transactionFeePct: 0 },
};

export const DEFAULT_INPUT = {
  productPrice: 49.99,
  quantity: 1,
  plan: 'business',
  paymentMethod: 'wix_credit',
  includeShipping: false,
  shippingCost: 0,
  cogs: 0,
  monthlyOrders: 100,
  currency: 'USD',
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const productPrice = Number(input.productPrice);
  const quantity     = Number(input.quantity);
  const shippingCost = Number(input.shippingCost ?? 0);
  const cogs         = Number(input.cogs ?? 0);
  const monthlyOrders= Number(input.monthlyOrders ?? 1);

  if (!Number.isFinite(productPrice) || productPrice < 0)   return { valid: false, msg: 'Product price must be ≥ 0.' };
  if (!Number.isFinite(quantity)     || quantity < 1)        return { valid: false, msg: 'Quantity must be ≥ 1.' };
  if (!Number.isFinite(shippingCost) || shippingCost < 0)   return { valid: false, msg: 'Shipping cost must be ≥ 0.' };
  if (!Number.isFinite(cogs)         || cogs < 0)            return { valid: false, msg: 'COGS must be ≥ 0.' };
  if (!Number.isFinite(monthlyOrders)|| monthlyOrders < 1)  return { valid: false, msg: 'Monthly orders must be ≥ 1.' };
  if (!PLANS[input.plan])                                    return { valid: false, msg: 'Invalid plan selected.' };
  if (!PAYMENT_METHODS[input.paymentMethod])                 return { valid: false, msg: 'Invalid payment method.' };

  return { valid: true, msg: '' };
}

/**
 * Core fee calculation.
 * Wix does NOT charge an additional transaction fee on top of payment processing.
 * The plan monthly cost is amortized per order for transparency.
 */
export function calculateWixFees(input) {
  const v = validateInputs(input);
  if (!v.valid) throw new Error(v.msg);

  const productPrice   = Number(input.productPrice);
  const quantity       = Number(input.quantity);
  const includeShipping= !!input.includeShipping;
  const shippingCost   = includeShipping ? Number(input.shippingCost ?? 0) : 0;
  const cogs           = Number(input.cogs ?? 0) * quantity;
  const monthlyOrders  = Number(input.monthlyOrders ?? 1);

  const plan    = PLANS[input.plan];
  const pm      = PAYMENT_METHODS[input.paymentMethod];

  // Revenue basis
  const subtotal         = round2(productPrice * quantity);
  const orderTotal       = round2(subtotal + shippingCost);

  // Processing fee (applied to full order total including shipping)
  const processingFeePct = round2(orderTotal * pm.pct);
  const processingFeeFixed = pm.fixed;
  const processingFeeTotal = round2(processingFeePct + processingFeeFixed);

  // Wix transaction fee = 0% (no extra Wix fee for any plan)
  const wixTransactionFee = 0;

  // Total fees for this order
  const totalFees = round2(processingFeeTotal + wixTransactionFee);

  // Effective processing rate
  const effectiveRatePct = orderTotal > 0 ? round2((totalFees / orderTotal) * 100) : 0;

  // Net payout
  const netPayout = round2(orderTotal - totalFees);

  // Gross profit (net payout − COGS)
  const grossProfit = round2(netPayout - cogs);

  // Profit margin
  const profitMarginPct = subtotal > 0 ? round2((grossProfit / subtotal) * 100) : 0;

  // Monthly plan cost amortized per order
  const planCostPerOrder = round2(plan.monthlyPrice / monthlyOrders);

  // Net after plan cost
  const netAfterPlanCost = round2(netPayout - planCostPerOrder);

  // Monthly totals (at monthlyOrders volume)
  const monthlyGrossRevenue  = round2(orderTotal * monthlyOrders);
  const monthlyProcessingFees= round2(processingFeeTotal * monthlyOrders);
  const monthlyPlanCost      = plan.monthlyPrice;
  const monthlyTotalFees     = round2(monthlyProcessingFees + monthlyPlanCost);
  const monthlyNetRevenue    = round2(monthlyGrossRevenue - monthlyTotalFees);
  const monthlyCogsTotal     = round2(cogs * monthlyOrders);
  const monthlyGrossProfit   = round2(monthlyNetRevenue - monthlyCogsTotal);
  const monthlyNetMarginPct  = monthlyGrossRevenue > 0
    ? round2((monthlyGrossProfit / monthlyGrossRevenue) * 100)
    : 0;

  // Break-even price (to recover COGS + fees + plan cost)
  const costPerUnit = cogs / quantity;
  const bepDenominator = 1 - pm.pct;
  const bepNumerator   = (costPerUnit * quantity) + pm.fixed + planCostPerOrder;
  const breakEvenPrice = bepDenominator > 0
    ? round2(bepNumerator / (bepDenominator * quantity))
    : 0;

  const status =
    grossProfit > 0 && profitMarginPct >= 15 ? 'profitable' :
    grossProfit >= 0                          ? 'tight'      :
                                               'loss';

  return {
    // per-order
    productPrice, quantity, subtotal, shippingCost, orderTotal,
    processingFeePct: round2(pm.pct * 100),
    processingFeeFixed,
    processingFeeTotal,
    wixTransactionFee,
    totalFees,
    effectiveRatePct,
    netPayout,
    cogs: round2(cogs),
    grossProfit,
    profitMarginPct,
    planCostPerOrder,
    netAfterPlanCost,
    breakEvenPrice,
    // monthly
    monthlyOrders,
    monthlyGrossRevenue,
    monthlyProcessingFees,
    monthlyPlanCost,
    monthlyTotalFees,
    monthlyNetRevenue,
    monthlyCogsTotal,
    monthlyGrossProfit,
    monthlyNetMarginPct,
    // meta
    planLabel: plan.label,
    paymentLabel: pm.label,
    status,
  };
}

export function buildSummary(r, locale = 'ko-KR') {
  const usd = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const pct  = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const lines = [
    `[Wix eCommerce 수수료 요약]`,
    `플랜: ${r.planLabel} ($${r.monthlyPlanCost}/mo)`,
    `결제 방법: ${r.paymentLabel}`,
    `주문 합계: ${usd.format(r.orderTotal)}`,
    `결제 수수료: ${usd.format(r.processingFeeTotal)} (${pct.format(r.processingFeePct)}% + $${r.processingFeeFixed})`,
    `Wix 거래 수수료: $0.00 (없음)`,
    `총 수수료: ${usd.format(r.totalFees)} (실효율 ${pct.format(r.effectiveRatePct)}%)`,
    `순 수령액: ${usd.format(r.netPayout)}`,
    `총이익: ${usd.format(r.grossProfit)} (마진 ${pct.format(r.profitMarginPct)}%)`,
    `손익분기 판매가: ${usd.format(r.breakEvenPrice)}`,
    `─── 월간 예측 (${r.monthlyOrders}건 기준) ───`,
    `월 매출: ${usd.format(r.monthlyGrossRevenue)}`,
    `월 수수료 합계: ${usd.format(r.monthlyTotalFees)}`,
    `월 순수익: ${usd.format(r.monthlyNetRevenue)}`,
    `월 총이익: ${usd.format(r.monthlyGrossProfit)} (마진 ${pct.format(r.monthlyNetMarginPct)}%)`,
  ];
  return lines.join('\n');
}
