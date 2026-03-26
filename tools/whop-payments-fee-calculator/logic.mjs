export const PAYMENT_METHODS = {
  domestic_cards: {
    label: 'Domestic cards',
    rate: 0.027,
    fixed: 0.30,
    cap: null,
    note: '2.7% + $0.30 per successful transaction',
  },
  international_cards: {
    label: 'International cards',
    rate: 0.042,
    fixed: 0.30,
    cap: null,
    note: '2.7% + $0.30 plus 1.5% for international cards',
  },
  international_cards_fx: {
    label: 'International cards + FX conversion',
    rate: 0.052,
    fixed: 0.30,
    cap: null,
    note: '2.7% + $0.30 plus 1.5% international and 1% FX conversion',
  },
  ach_debit: {
    label: 'ACH debit',
    rate: 0.015,
    fixed: 0,
    cap: 5,
    note: '1.5% per successful ACH debit transaction, capped at $5',
  },
  financing: {
    label: 'Financing',
    rate: 0.15,
    fixed: 0,
    cap: null,
    note: '15% per successful financing transaction',
  },
};

export const PAYOUT_METHODS = {
  hold_balance: {
    label: 'Hold in balance / no payout allocation',
    rate: 0,
    fixed: 0,
    note: 'No payout fee allocation applied',
  },
  next_day_ach: {
    label: 'Next-day ACH payout',
    rate: 0,
    fixed: 2.5,
    note: '$2.50 per successful payout',
  },
  instant_bank: {
    label: 'Instant bank deposit (RTP)',
    rate: 0.04,
    fixed: 1,
    note: '4% + $1.00 per successful payout',
  },
  crypto: {
    label: 'Crypto payout',
    rate: 0.05,
    fixed: 1,
    note: '5% + $1.00 per successful payout',
  },
  venmo: {
    label: 'Venmo payout',
    rate: 0.05,
    fixed: 1,
    note: '5% + $1.00 per successful payout',
  },
  bank_wire: {
    label: 'Bank wire payout',
    rate: 0,
    fixed: 23,
    note: '$23.00 per successful payout',
  },
};

export const DEFAULT_INPUT = {
  amount: 100,
  paymentMethod: 'domestic_cards',
  payoutMethod: 'hold_balance',
  transactionsPerPayout: 10,
  transactionsPerMonth: 100,
  targetNet: 100,
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPositiveInteger = (value, fallback = 1) => {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getPaymentMethod = (key) => PAYMENT_METHODS[key] || null;
export const getPayoutMethod = (key) => PAYOUT_METHODS[key] || null;

export const validateInputs = (rawInput) => {
  const input = {
    ...DEFAULT_INPUT,
    ...rawInput,
  };

  if (!getPaymentMethod(input.paymentMethod)) {
    return { valid: false, message: 'paymentMethod must be one of the supported presets' };
  }
  if (!getPayoutMethod(input.payoutMethod)) {
    return { valid: false, message: 'payoutMethod must be one of the supported presets' };
  }
  if (toNumber(input.amount) <= 0) {
    return { valid: false, message: 'amount must be greater than 0' };
  }
  if (toNumber(input.targetNet) < 0) {
    return { valid: false, message: 'targetNet must be non-negative' };
  }
  if (!Number.isInteger(Number(input.transactionsPerPayout)) || Number(input.transactionsPerPayout) < 1) {
    return { valid: false, message: 'transactionsPerPayout must be an integer >= 1' };
  }
  if (!Number.isInteger(Number(input.transactionsPerMonth)) || Number(input.transactionsPerMonth) < 0) {
    return { valid: false, message: 'transactionsPerMonth must be an integer >= 0' };
  }

  return { valid: true, message: 'ok' };
};

export const calculateProcessingFee = (amount, paymentMethodKey) => {
  const method = getPaymentMethod(paymentMethodKey);
  if (!method) return 0;
  const feeBeforeCap = amount * method.rate + method.fixed;
  return method.cap == null ? feeBeforeCap : Math.min(feeBeforeCap, method.cap);
};

export const calculatePayoutFee = (payoutBalance, payoutMethodKey) => {
  const method = getPayoutMethod(payoutMethodKey);
  if (!method) return 0;
  return payoutBalance * method.rate + method.fixed;
};

export const calculatePerTransaction = (amount, paymentMethodKey, payoutMethodKey, transactionsPerPayout) => {
  const processingFee = calculateProcessingFee(amount, paymentMethodKey);
  const balanceAfterProcessing = amount - processingFee;
  const batchSize = toPositiveInteger(transactionsPerPayout, 1);
  const payoutFeeForBatch = calculatePayoutFee(balanceAfterProcessing * batchSize, payoutMethodKey);
  const payoutFeeAllocated = payoutFeeForBatch / batchSize;
  const totalFees = processingFee + payoutFeeAllocated;
  const netTakeHome = amount - totalFees;
  const effectiveFeeRatePct = amount > 0 ? (totalFees / amount) * 100 : 0;

  return {
    amount,
    processingFee,
    balanceAfterProcessing,
    payoutFeeAllocated,
    totalFees,
    netTakeHome,
    effectiveFeeRatePct,
  };
};

export const calculateMonthlyProjection = (amount, paymentMethodKey, payoutMethodKey, transactionsPerPayout, transactionsPerMonth) => {
  const monthlyTransactions = Math.max(0, Math.trunc(toNumber(transactionsPerMonth)));
  const batchSize = toPositiveInteger(transactionsPerPayout, 1);

  if (monthlyTransactions === 0) {
    return {
      transactions: 0,
      payoutCount: 0,
      grossVolume: 0,
      processingFees: 0,
      payoutFees: 0,
      totalFees: 0,
      netTakeHome: 0,
    };
  }

  const processingFee = calculateProcessingFee(amount, paymentMethodKey);
  const balanceAfterProcessing = amount - processingFee;
  const fullBatches = Math.floor(monthlyTransactions / batchSize);
  const remainder = monthlyTransactions % batchSize;

  let payoutFees = 0;
  for (let i = 0; i < fullBatches; i += 1) {
    payoutFees += calculatePayoutFee(balanceAfterProcessing * batchSize, payoutMethodKey);
  }
  if (remainder > 0) {
    payoutFees += calculatePayoutFee(balanceAfterProcessing * remainder, payoutMethodKey);
  }

  const grossVolume = amount * monthlyTransactions;
  const processingFees = processingFee * monthlyTransactions;
  const totalFees = processingFees + payoutFees;
  const netTakeHome = grossVolume - totalFees;
  const payoutCount = fullBatches + (remainder > 0 ? 1 : 0);

  return {
    transactions: monthlyTransactions,
    payoutCount,
    grossVolume,
    processingFees,
    payoutFees,
    totalFees,
    netTakeHome,
  };
};

export const solveRequiredGrossForTargetNet = (targetNet, paymentMethodKey, payoutMethodKey, transactionsPerPayout) => {
  const target = Math.max(0, toNumber(targetNet));
  if (target === 0) return 0;

  let low = 0;
  let high = Math.max(10, target * 2 + 50);
  let highNet = calculatePerTransaction(high, paymentMethodKey, payoutMethodKey, transactionsPerPayout).netTakeHome;
  let guard = 0;
  while (highNet < target && guard < 80) {
    high *= 2;
    highNet = calculatePerTransaction(high, paymentMethodKey, payoutMethodKey, transactionsPerPayout).netTakeHome;
    guard += 1;
  }

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const net = calculatePerTransaction(mid, paymentMethodKey, payoutMethodKey, transactionsPerPayout).netTakeHome;
    if (net >= target) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
};

export const calculateWhopFees = (rawInput = {}) => {
  const input = {
    ...DEFAULT_INPUT,
    ...rawInput,
  };
  const validation = validateInputs(input);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.message,
      result: null,
    };
  }

  const amount = toNumber(input.amount);
  const paymentMethodKey = input.paymentMethod;
  const payoutMethodKey = input.payoutMethod;
  const transactionsPerPayout = toPositiveInteger(input.transactionsPerPayout, 1);
  const transactionsPerMonth = Math.max(0, Math.trunc(toNumber(input.transactionsPerMonth)));
  const targetNet = Math.max(0, toNumber(input.targetNet));

  const perTransaction = calculatePerTransaction(amount, paymentMethodKey, payoutMethodKey, transactionsPerPayout);
  const monthly = calculateMonthlyProjection(amount, paymentMethodKey, payoutMethodKey, transactionsPerPayout, transactionsPerMonth);
  const targetGrossAmount = solveRequiredGrossForTargetNet(targetNet, paymentMethodKey, payoutMethodKey, transactionsPerPayout);

  const summary = [
    '[Whop Payments Fee Calculator Summary]',
    `Payment method: ${getPaymentMethod(paymentMethodKey).label}`,
    `Payout method: ${getPayoutMethod(payoutMethodKey).label}`,
    `Gross sale amount: $${round(amount).toFixed(2)}`,
    `Processing fee: $${round(perTransaction.processingFee).toFixed(2)}`,
    `Allocated payout fee: $${round(perTransaction.payoutFeeAllocated).toFixed(2)}`,
    `Net take-home: $${round(perTransaction.netTakeHome).toFixed(2)}`,
    `Effective fee rate: ${round(perTransaction.effectiveFeeRatePct, 2).toFixed(2)}%`,
    `Required gross for target net: $${round(targetGrossAmount).toFixed(2)}`,
  ].join('\n');

  return {
    ok: true,
    error: '',
    result: {
      input: {
        amount: round(amount),
        paymentMethod: paymentMethodKey,
        payoutMethod: payoutMethodKey,
        transactionsPerPayout,
        transactionsPerMonth,
        targetNet: round(targetNet),
      },
      paymentMethod: getPaymentMethod(paymentMethodKey),
      payoutMethod: getPayoutMethod(payoutMethodKey),
      perTransaction: {
        processingFee: round(perTransaction.processingFee),
        balanceAfterProcessing: round(perTransaction.balanceAfterProcessing),
        payoutFeeAllocated: round(perTransaction.payoutFeeAllocated),
        totalFees: round(perTransaction.totalFees),
        netTakeHome: round(perTransaction.netTakeHome),
        effectiveFeeRatePct: round(perTransaction.effectiveFeeRatePct, 2),
      },
      monthly: {
        transactions: monthly.transactions,
        payoutCount: monthly.payoutCount,
        grossVolume: round(monthly.grossVolume),
        processingFees: round(monthly.processingFees),
        payoutFees: round(monthly.payoutFees),
        totalFees: round(monthly.totalFees),
        netTakeHome: round(monthly.netTakeHome),
      },
      targetGrossAmount: round(targetGrossAmount),
      summary,
    },
  };
};
