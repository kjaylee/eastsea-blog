export const DEFAULT_INPUT = {
  itemPrice: 50,
  shipping: 5,
  tax: 5,
  platformDiscount: 0,
  referralMode: 'standard',
  customReferralRate: 6,
  processingRate: 0,
  processingFixed: 0,
  ordersPerMonth: 100,
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const getReferralRate = (mode, customRate) => {
  if (mode === 'promo') return 3;
  if (mode === 'custom') return toNumber(customRate);
  return 6;
};

export const validateInputs = (input) => {
  const fields = ['itemPrice', 'shipping', 'tax', 'platformDiscount', 'processingRate', 'processingFixed', 'ordersPerMonth'];
  for (const field of fields) {
    if (toNumber(input[field]) < 0) {
      return { valid: false, message: `${field} must be non-negative` };
    }
  }
  const referralRate = getReferralRate(input.referralMode, input.customReferralRate);
  if (referralRate < 0 || referralRate > 100) {
    return { valid: false, message: 'referralRate must be between 0 and 100' };
  }
  if (toNumber(input.processingRate) < 0 || toNumber(input.processingRate) > 100) {
    return { valid: false, message: 'processingRate must be between 0 and 100' };
  }
  return { valid: true, message: 'ok' };
};

export const calculateTikTokShopFees = (rawInput) => {
  const input = {
    ...DEFAULT_INPUT,
    ...rawInput,
  };

  const itemPrice = Math.max(0, toNumber(input.itemPrice));
  const shipping = Math.max(0, toNumber(input.shipping));
  const tax = Math.max(0, toNumber(input.tax));
  const platformDiscount = Math.max(0, toNumber(input.platformDiscount));
  const referralRate = getReferralRate(input.referralMode, input.customReferralRate) / 100;
  const processingRate = Math.max(0, toNumber(input.processingRate)) / 100;
  const processingFixed = Math.max(0, toNumber(input.processingFixed));
  const ordersPerMonth = Math.max(0, toNumber(input.ordersPerMonth));

  const customerPayment = Math.max(0, itemPrice + shipping + tax - platformDiscount);
  const referralBase = Math.max(0, customerPayment + platformDiscount - tax);
  const referralFee = referralBase * referralRate;
  const processingFee = customerPayment * processingRate + processingFixed;
  const totalFees = referralFee + processingFee;
  const netPayout = customerPayment - totalFees;
  const effectiveFeeRate = customerPayment > 0 ? (totalFees / customerPayment) * 100 : 0;

  const monthlyGross = customerPayment * ordersPerMonth;
  const monthlyReferralFees = referralFee * ordersPerMonth;
  const monthlyProcessingFees = processingFee * ordersPerMonth;
  const monthlyTotalFees = totalFees * ordersPerMonth;
  const monthlyNet = netPayout * ordersPerMonth;

  return {
    customerPayment: round(customerPayment),
    referralBase: round(referralBase),
    referralFee: round(referralFee),
    processingFee: round(processingFee),
    totalFees: round(totalFees),
    netPayout: round(netPayout),
    effectiveFeeRate: round(effectiveFeeRate, 2),
    monthly: {
      gross: round(monthlyGross),
      referralFees: round(monthlyReferralFees),
      processingFees: round(monthlyProcessingFees),
      totalFees: round(monthlyTotalFees),
      net: round(monthlyNet),
    },
  };
};
