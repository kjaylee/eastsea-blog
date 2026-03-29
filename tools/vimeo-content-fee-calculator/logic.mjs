export const DEFAULT_INPUT = {
  contentPrice: 14.99,
  rentalPrice: 4.99,
  monthlySubPrice: 9.99,
  transactionType: 'buy', // buy | rent | subscription
  paymentProcessor: 'stripe', // stripe | paypal
  monthlyTransactions: 200,
  monthlySubscribers: 0,
  vatRatePct: 0,
  monthlyFixedCosts: 0,
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Vimeo On Demand / OTT fee constants
export const VIMEO_REVENUE_SHARE_PCT = 10; // Vimeo takes 10%
export const STRIPE_RATE_PCT = 2.9;
export const STRIPE_FIXED_FEE = 0.30;
export const PAYPAL_RATE_PCT = 5.0;
export const PAYPAL_FIXED_FEE = 0.0;

export function validateInputs(input) {
  if (Number(input.contentPrice) < 0.99 || Number(input.contentPrice) > 500) {
    return { valid: false, message: 'Content price must be between $0.99 and $500.' };
  }
  if (Number(input.rentalPrice) < 0 || Number(input.rentalPrice) > 500) {
    return { valid: false, message: 'Rental price must be between $0 and $500.' };
  }
  if (Number(input.monthlySubPrice) < 0 || Number(input.monthlySubPrice) > 500) {
    return { valid: false, message: 'Monthly subscription price must be between $0 and $500.' };
  }
  if (Number(input.monthlyTransactions) < 0 || Number(input.monthlyTransactions) > 1_000_000) {
    return { valid: false, message: 'Monthly transactions must be between 0 and 1,000,000.' };
  }
  if (Number(input.monthlySubscribers) < 0 || Number(input.monthlySubscribers) > 1_000_000) {
    return { valid: false, message: 'Monthly subscribers must be between 0 and 1,000,000.' };
  }
  if (Number(input.vatRatePct) < 0 || Number(input.vatRatePct) > 30) {
    return { valid: false, message: 'VAT rate must be between 0% and 30%.' };
  }
  if (Number(input.monthlyFixedCosts) < 0 || Number(input.monthlyFixedCosts) > 100_000) {
    return { valid: false, message: 'Monthly fixed costs must be between $0 and $100,000.' };
  }
  if (!['buy', 'rent', 'subscription', 'all'].includes(input.transactionType)) {
    return { valid: false, message: 'Invalid transaction type.' };
  }
  if (!['stripe', 'paypal'].includes(input.paymentProcessor)) {
    return { valid: false, message: 'Invalid payment processor.' };
  }
  return { valid: true, message: '' };
}

function calcPaymentFee(price, processor) {
  if (processor === 'stripe') {
    return round2(price * (STRIPE_RATE_PCT / 100) + STRIPE_FIXED_FEE);
  }
  // paypal
  return round2(price * (PAYPAL_RATE_PCT / 100) + PAYPAL_FIXED_FEE);
}

function calcVimeoFee(price) {
  return round2(price * (VIMEO_REVENUE_SHARE_PCT / 100));
}

function calcCreatorPayout(price, processor) {
  const vimeoFee = calcVimeoFee(price);
  const paymentFee = calcPaymentFee(price, processor);
  return round2(price - vimeoFee - paymentFee);
}

export function calculateVimeoContentFee(input) {
  const validation = validateInputs(input);
  if (!validation.valid) throw new Error(validation.message);

  const contentPrice = Number(input.contentPrice);
  const rentalPrice = Number(input.rentalPrice);
  const monthlySubPrice = Number(input.monthlySubPrice);
  const transactionType = input.transactionType;
  const paymentProcessor = input.paymentProcessor;
  const monthlyTransactions = Number(input.monthlyTransactions);
  const monthlySubscribers = Number(input.monthlySubscribers);
  const vatRatePct = Number(input.vatRatePct);
  const monthlyFixedCosts = Number(input.monthlyFixedCosts);

  // Per-transaction calculations
  const buyVimeoFee = calcVimeoFee(contentPrice);
  const buyPaymentFee = calcPaymentFee(contentPrice, paymentProcessor);
  const buyPayout = calcCreatorPayout(contentPrice, paymentProcessor);
  const buyNetMarginPct = round2((buyPayout / contentPrice) * 100);

  const rentVimeoFee = rentalPrice > 0 ? calcVimeoFee(rentalPrice) : 0;
  const rentPaymentFee = rentalPrice > 0 ? calcPaymentFee(rentalPrice, paymentProcessor) : 0;
  const rentPayout = rentalPrice > 0 ? calcCreatorPayout(rentalPrice, paymentProcessor) : 0;
  const rentNetMarginPct = rentalPrice > 0 ? round2((rentPayout / rentalPrice) * 100) : 0;

  const subVimeoFee = monthlySubPrice > 0 ? calcVimeoFee(monthlySubPrice) : 0;
  const subPaymentFee = monthlySubPrice > 0 ? calcPaymentFee(monthlySubPrice, paymentProcessor) : 0;
  const subPayout = monthlySubPrice > 0 ? calcCreatorPayout(monthlySubPrice, paymentProcessor) : 0;
  const subNetMarginPct = monthlySubPrice > 0 ? round2((subPayout / monthlySubPrice) * 100) : 0;

  // Monthly volume calculations
  let activePrice = contentPrice;
  let activeVimeoFeePerTx = buyVimeoFee;
  let activePaymentFeePerTx = buyPaymentFee;
  let activePayoutPerTx = buyPayout;

  if (transactionType === 'rent') {
    activePrice = rentalPrice;
    activeVimeoFeePerTx = rentVimeoFee;
    activePaymentFeePerTx = rentPaymentFee;
    activePayoutPerTx = rentPayout;
  } else if (transactionType === 'subscription') {
    activePrice = monthlySubPrice;
    activeVimeoFeePerTx = subVimeoFee;
    activePaymentFeePerTx = subPaymentFee;
    activePayoutPerTx = subPayout;
  }

  // Monthly revenue from transactions
  const txGrossRevenue = round2(activePrice * monthlyTransactions);
  const txVimeoFeesTotal = round2(activeVimeoFeePerTx * monthlyTransactions);
  const txPaymentFeesTotal = round2(activePaymentFeePerTx * monthlyTransactions);
  const txCreatorPayoutTotal = round2(activePayoutPerTx * monthlyTransactions);

  // Monthly subscription revenue (additive if transactionType !== subscription)
  const subGrossRevenue = transactionType !== 'subscription'
    ? round2(monthlySubPrice * monthlySubscribers)
    : 0;
  const subVimeoFeesTotal = transactionType !== 'subscription'
    ? round2(subVimeoFee * monthlySubscribers)
    : 0;
  const subPaymentFeesTotal = transactionType !== 'subscription'
    ? round2(subPaymentFee * monthlySubscribers)
    : 0;
  const subPayoutTotal = transactionType !== 'subscription'
    ? round2(subPayout * monthlySubscribers)
    : 0;

  // Combined monthly totals
  const totalGrossRevenue = round2(txGrossRevenue + subGrossRevenue);
  const totalVimeoFees = round2(txVimeoFeesTotal + subVimeoFeesTotal);
  const totalPaymentFees = round2(txPaymentFeesTotal + subPaymentFeesTotal);
  const totalCreatorPayout = round2(txCreatorPayoutTotal + subPayoutTotal);

  // VAT (applied to gross revenue)
  const vatAmount = round2(totalGrossRevenue * (vatRatePct / 100));
  const payoutAfterVat = round2(totalCreatorPayout - vatAmount);

  // Net profit after fixed costs
  const netProfit = round2(payoutAfterVat - monthlyFixedCosts);
  const overallNetMarginPct = totalGrossRevenue > 0
    ? round2((netProfit / totalGrossRevenue) * 100)
    : 0;

  // Total fee rate (Vimeo + payment)
  const totalFeeRatePct = activePrice > 0
    ? round2(((activeVimeoFeePerTx + activePaymentFeePerTx) / activePrice) * 100)
    : 0;

  // Break-even: min transactions/subscribers to cover fixed costs
  const breakEvenTransactions = activePayoutPerTx > 0
    ? Math.ceil(monthlyFixedCosts / activePayoutPerTx)
    : Infinity;

  // Annualized
  const annualGrossRevenue = round2(totalGrossRevenue * 12);
  const annualNetProfit = round2(netProfit * 12);

  // Status
  const status = netProfit > 0 && overallNetMarginPct >= 15
    ? 'profitable'
    : netProfit >= 0
    ? 'tight'
    : 'loss';

  return {
    // Per-transaction
    buy: { price: contentPrice, vimeoFee: buyVimeoFee, paymentFee: buyPaymentFee, payout: buyPayout, netMarginPct: buyNetMarginPct },
    rent: { price: rentalPrice, vimeoFee: rentVimeoFee, paymentFee: rentPaymentFee, payout: rentPayout, netMarginPct: rentNetMarginPct },
    subscription: { price: monthlySubPrice, vimeoFee: subVimeoFee, paymentFee: subPaymentFee, payout: subPayout, netMarginPct: subNetMarginPct },

    // Active mode per-tx
    activePrice,
    activeVimeoFeePerTx,
    activePaymentFeePerTx,
    activePayoutPerTx,
    totalFeeRatePct,

    // Monthly
    totalGrossRevenue,
    totalVimeoFees,
    totalPaymentFees,
    totalCreatorPayout,
    vatAmount,
    payoutAfterVat,
    monthlyFixedCosts,
    netProfit,
    overallNetMarginPct,

    // Break-even
    breakEvenTransactions: Number.isFinite(breakEvenTransactions) ? breakEvenTransactions : null,

    // Annual
    annualGrossRevenue,
    annualNetProfit,

    status,
    transactionType,
    paymentProcessor,
  };
}

export function buildSummary(result) {
  const fmt = (n) => '$' + n.toFixed(2);
  const typeLabel = { buy: '구매', rent: '대여', subscription: '구독' };
  const procLabel = { stripe: 'Stripe', paypal: 'PayPal' };

  const lines = [
    '[Vimeo 컨텐츠 수수료 요약]',
    `거래 유형: ${typeLabel[result.transactionType] || result.transactionType}`,
    `결제 프로세서: ${procLabel[result.paymentProcessor] || result.paymentProcessor}`,
    '',
    '— 거래당 분석 —',
    `콘텐츠 가격: ${fmt(result.activePrice)}`,
    `Vimeo 수수료 (10%): ${fmt(result.activeVimeoFeePerTx)}`,
    `결제 수수료: ${fmt(result.activePaymentFeePerTx)}`,
    `크리에이터 수령액: ${fmt(result.activePayoutPerTx)}`,
    `총 수수료율: ${result.totalFeeRatePct}%`,
    '',
    '— 월간 합계 —',
    `총 매출: ${fmt(result.totalGrossRevenue)}`,
    `Vimeo 수수료 합계: ${fmt(result.totalVimeoFees)}`,
    `결제 수수료 합계: ${fmt(result.totalPaymentFees)}`,
    `크리에이터 수령 합계: ${fmt(result.totalCreatorPayout)}`,
    `VAT/세금: ${fmt(result.vatAmount)}`,
    `순 수익: ${fmt(result.netProfit)}`,
    `순 마진: ${result.overallNetMarginPct}%`,
    `상태: ${result.status}`,
    '',
    '— 연간 예상 —',
    `연간 매출: ${fmt(result.annualGrossRevenue)}`,
    `연간 순 수익: ${fmt(result.annualNetProfit)}`,
  ];
  return lines.join('\n');
}
