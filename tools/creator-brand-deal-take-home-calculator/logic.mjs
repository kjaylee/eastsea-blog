export const DEFAULT_INPUT = {
  deliverables: 3,
  baseFeePerDeliverable: 1200,
  usageMonths: 3,
  usageFeePerMonth: 250,
  whitelistingMonths: 2,
  whitelistingFeePerMonth: 300,
  exclusivityMonths: 1,
  exclusivityFeePerMonth: 450,
  managerFeePct: 15,
  agencyFeePct: 0,
  platformFeePct: 3,
  paymentProcessingFeePct: 2.9,
  paymentFixedFee: 0.3,
  productionCost: 450,
  assistantCost: 150,
  travelCost: 100,
  taxReservePct: 25,
  targetNetTakeHome: 3500,
};

const INTEGER_FIELDS = new Set([
  'deliverables',
  'usageMonths',
  'whitelistingMonths',
  'exclusivityMonths',
]);

const RATE_FIELDS = [
  'managerFeePct',
  'agencyFeePct',
  'platformFeePct',
  'paymentProcessingFeePct',
  'taxReservePct',
];

const NON_NEGATIVE_FIELDS = [
  'baseFeePerDeliverable',
  'usageFeePerMonth',
  'whitelistingFeePerMonth',
  'exclusivityFeePerMonth',
  'paymentFixedFee',
  'productionCost',
  'assistantCost',
  'travelCost',
  'targetNetTakeHome',
];

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toNumber(value) {
  return Number(value);
}

export function normalizeInput(input) {
  return {
    deliverables: toNumber(input.deliverables),
    baseFeePerDeliverable: toNumber(input.baseFeePerDeliverable),
    usageMonths: toNumber(input.usageMonths),
    usageFeePerMonth: toNumber(input.usageFeePerMonth),
    whitelistingMonths: toNumber(input.whitelistingMonths),
    whitelistingFeePerMonth: toNumber(input.whitelistingFeePerMonth),
    exclusivityMonths: toNumber(input.exclusivityMonths),
    exclusivityFeePerMonth: toNumber(input.exclusivityFeePerMonth),
    managerFeePct: toNumber(input.managerFeePct),
    agencyFeePct: toNumber(input.agencyFeePct),
    platformFeePct: toNumber(input.platformFeePct),
    paymentProcessingFeePct: toNumber(input.paymentProcessingFeePct),
    paymentFixedFee: toNumber(input.paymentFixedFee),
    productionCost: toNumber(input.productionCost),
    assistantCost: toNumber(input.assistantCost),
    travelCost: toNumber(input.travelCost),
    taxReservePct: toNumber(input.taxReservePct),
    targetNetTakeHome: toNumber(input.targetNetTakeHome),
  };
}

export function validateInputs(input) {
  const values = normalizeInput(input);

  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) {
      return { valid: false, values, message: `${key} must be a finite number.` };
    }
  }

  for (const key of INTEGER_FIELDS) {
    if (!Number.isInteger(values[key]) || values[key] < 0) {
      return { valid: false, values, message: `${key} must be an integer greater than or equal to 0.` };
    }
  }

  if (values.deliverables < 1) {
    return { valid: false, values, message: 'deliverables must be at least 1.' };
  }

  for (const key of NON_NEGATIVE_FIELDS) {
    if (values[key] < 0) {
      return { valid: false, values, message: `${key} must be greater than or equal to 0.` };
    }
  }

  for (const key of RATE_FIELDS) {
    if (values[key] < 0 || values[key] >= 100) {
      return { valid: false, values, message: `${key} must stay between 0 and less than 100.` };
    }
  }

  const totalPercentFeePct =
    values.managerFeePct +
    values.agencyFeePct +
    values.platformFeePct +
    values.paymentProcessingFeePct;

  if (totalPercentFeePct >= 100) {
    return {
      valid: false,
      values,
      message: 'Combined manager + agency + platform + payment-processing percentages must stay below 100.',
    };
  }

  return { valid: true, values, message: '' };
}

function solveRequiredGrossQuote(values, hardCosts, totalPercentFeeRate) {
  if (values.targetNetTakeHome === 0) {
    return 0;
  }

  const netAfterTaxKeep = 1 - (values.taxReservePct / 100);
  const grossAfterFeeKeep = 1 - totalPercentFeeRate;

  if (netAfterTaxKeep <= 0 || grossAfterFeeKeep <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  const requiredPreTaxNet = values.targetNetTakeHome / netAfterTaxKeep;
  return (requiredPreTaxNet + values.paymentFixedFee + hardCosts) / grossAfterFeeKeep;
}

export function calculateBrandDeal(input) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid input');
  }

  const v = validation.values;

  const contentSubtotal = v.deliverables * v.baseFeePerDeliverable;
  const usageRightsFee = v.usageMonths * v.usageFeePerMonth;
  const whitelistingFee = v.whitelistingMonths * v.whitelistingFeePerMonth;
  const exclusivityFee = v.exclusivityMonths * v.exclusivityFeePerMonth;
  const rightsSubtotal = usageRightsFee + whitelistingFee + exclusivityFee;
  const grossQuote = contentSubtotal + rightsSubtotal;

  const managerFeeAmount = grossQuote * (v.managerFeePct / 100);
  const agencyFeeAmount = grossQuote * (v.agencyFeePct / 100);
  const platformFeeAmount = grossQuote * (v.platformFeePct / 100);
  const paymentProcessingPctAmount = grossQuote * (v.paymentProcessingFeePct / 100);
  const totalPercentFeeAmount =
    managerFeeAmount +
    agencyFeeAmount +
    platformFeeAmount +
    paymentProcessingPctAmount;
  const totalPercentFeeRate =
    (v.managerFeePct + v.agencyFeePct + v.platformFeePct + v.paymentProcessingFeePct) / 100;

  const hardCosts = v.productionCost + v.assistantCost + v.travelCost;
  const preTaxNet = grossQuote - totalPercentFeeAmount - v.paymentFixedFee - hardCosts;
  const taxReserveAmount = preTaxNet > 0 ? preTaxNet * (v.taxReservePct / 100) : 0;
  const creatorNetTakeHome = preTaxNet - taxReserveAmount;
  const effectiveTakeHomeRatePct = grossQuote > 0 ? (creatorNetTakeHome / grossQuote) * 100 : 0;
  const effectiveDeductionRatePct = grossQuote > 0 ? 100 - effectiveTakeHomeRatePct : 0;
  const rightsSharePct = grossQuote > 0 ? (rightsSubtotal / grossQuote) * 100 : 0;

  const requiredGrossQuote = solveRequiredGrossQuote(v, hardCosts, totalPercentFeeRate);
  const requiredBaseSubtotal = Number.isFinite(requiredGrossQuote)
    ? Math.max(requiredGrossQuote - rightsSubtotal, 0)
    : Number.POSITIVE_INFINITY;
  const requiredBaseFeePerDeliverable = Number.isFinite(requiredBaseSubtotal)
    ? requiredBaseSubtotal / v.deliverables
    : Number.POSITIVE_INFINITY;
  const gapToTarget = creatorNetTakeHome - v.targetNetTakeHome;

  let status = 'baseline';
  if (v.targetNetTakeHome > 0) {
    if (creatorNetTakeHome >= v.targetNetTakeHome) {
      status = 'on-track';
    } else if (creatorNetTakeHome >= v.targetNetTakeHome * 0.9) {
      status = 'close';
    } else {
      status = 'gap';
    }
  }

  return {
    inputs: { ...v },
    contentSubtotal: round2(contentSubtotal),
    usageRightsFee: round2(usageRightsFee),
    whitelistingFee: round2(whitelistingFee),
    exclusivityFee: round2(exclusivityFee),
    rightsSubtotal: round2(rightsSubtotal),
    rightsSharePct: round2(rightsSharePct),
    grossQuote: round2(grossQuote),
    managerFeeAmount: round2(managerFeeAmount),
    agencyFeeAmount: round2(agencyFeeAmount),
    platformFeeAmount: round2(platformFeeAmount),
    paymentProcessingPctAmount: round2(paymentProcessingPctAmount),
    paymentFixedFee: round2(v.paymentFixedFee),
    totalPercentFeeAmount: round2(totalPercentFeeAmount),
    totalPercentFeeRatePct: round2(totalPercentFeeRate * 100),
    productionCost: round2(v.productionCost),
    assistantCost: round2(v.assistantCost),
    travelCost: round2(v.travelCost),
    hardCosts: round2(hardCosts),
    preTaxNet: round2(preTaxNet),
    taxReserveAmount: round2(taxReserveAmount),
    creatorNetTakeHome: round2(creatorNetTakeHome),
    effectiveTakeHomeRatePct: round2(effectiveTakeHomeRatePct),
    effectiveDeductionRatePct: round2(effectiveDeductionRatePct),
    requiredGrossQuote: Number.isFinite(requiredGrossQuote) ? round2(requiredGrossQuote) : Number.POSITIVE_INFINITY,
    requiredBaseSubtotal: Number.isFinite(requiredBaseSubtotal) ? round2(requiredBaseSubtotal) : Number.POSITIVE_INFINITY,
    requiredBaseFeePerDeliverable: Number.isFinite(requiredBaseFeePerDeliverable)
      ? round2(requiredBaseFeePerDeliverable)
      : Number.POSITIVE_INFINITY,
    gapToTarget: round2(gapToTarget),
    status,
  };
}

export function buildSummary(result, locale = 'en-US', currency = 'USD') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
  const pct = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });

  const requiredQuoteText = Number.isFinite(result.requiredGrossQuote)
    ? money.format(result.requiredGrossQuote)
    : 'Unavailable';
  const requiredBaseText = Number.isFinite(result.requiredBaseFeePerDeliverable)
    ? money.format(result.requiredBaseFeePerDeliverable)
    : 'Unavailable';

  return [
    '[Creator Brand Deal Take-home Summary]',
    `Brand quote: ${money.format(result.grossQuote)}`,
    `Creator net take-home: ${money.format(result.creatorNetTakeHome)}`,
    `Rights add-ons: ${money.format(result.rightsSubtotal)} (${pct.format(result.rightsSharePct)}% of quote)`,
    `Total percent-fee drag: ${money.format(result.totalPercentFeeAmount)} (${pct.format(result.totalPercentFeeRatePct)}%)`,
    `Hard costs: ${money.format(result.hardCosts)}`,
    `Tax reserve: ${money.format(result.taxReserveAmount)}`,
    `Target net: ${money.format(result.inputs.targetNetTakeHome)}`,
    `Required quote for target: ${requiredQuoteText}`,
    `Required base fee / deliverable: ${requiredBaseText}`,
    `Gap vs target: ${money.format(result.gapToTarget)}`,
    `Status: ${result.status}`,
  ].join('\n');
}
