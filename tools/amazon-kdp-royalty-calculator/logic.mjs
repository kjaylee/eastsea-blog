export const EBOOK_MARKETS = {
  us: { key: 'us', label: 'Amazon.com (USD)', currency: 'USD', deliveryCostPerMb: 0.15, minDeliveryCost: 0.01 },
  ca: { key: 'ca', label: 'Amazon.ca (CAD)', currency: 'CAD', deliveryCostPerMb: 0.15, minDeliveryCost: 0.01 },
  uk: { key: 'uk', label: 'Amazon.co.uk (GBP)', currency: 'GBP', deliveryCostPerMb: 0.10, minDeliveryCost: 0.01 },
  eu: { key: 'eu', label: 'Amazon Europe (EUR)', currency: 'EUR', deliveryCostPerMb: 0.12, minDeliveryCost: 0.01 },
  in: { key: 'in', label: 'Amazon.in (INR)', currency: 'INR', deliveryCostPerMb: 7, minDeliveryCost: 1 },
  jp: { key: 'jp', label: 'Amazon.co.jp (JPY)', currency: 'JPY', deliveryCostPerMb: 1, minDeliveryCost: 1, waivesLargeFilesAtMb: 10, wholeCurrency: true },
  mx: { key: 'mx', label: 'Amazon.com.mx (MXN)', currency: 'MXN', deliveryCostPerMb: 1, minDeliveryCost: 1 },
  au: { key: 'au', label: 'Amazon.com.au (AUD)', currency: 'AUD', deliveryCostPerMb: 0.15, minDeliveryCost: 0.01 },
  br: { key: 'br', label: 'Amazon.com.br (BRL)', currency: 'BRL', deliveryCostPerMb: 0.30, minDeliveryCost: 0.01 },
};

export const PAPERBACK_MARKETS = {
  us: { key: 'us', label: 'Amazon.com (USD)', currency: 'USD', threshold50: 9.98, threshold60: 9.99 },
  eu: { key: 'eu', label: 'Amazon Europe (EUR)', currency: 'EUR', threshold50: 9.98, threshold60: 9.99 },
  uk: { key: 'uk', label: 'Amazon.co.uk (GBP)', currency: 'GBP', threshold50: 7.98, threshold60: 7.99 },
  ca: { key: 'ca', label: 'Amazon.ca (CAD)', currency: 'CAD', threshold50: 13.98, threshold60: 13.99 },
  au: { key: 'au', label: 'Amazon.com.au (AUD)', currency: 'AUD', threshold50: 13.98, threshold60: 13.99 },
  jp: { key: 'jp', label: 'Amazon.co.jp (JPY)', currency: 'JPY', threshold50: 999, threshold60: 1000 },
  pl: { key: 'pl', label: 'Amazon.pl (PLN)', currency: 'PLN', threshold50: 39, threshold60: 40 },
  se: { key: 'se', label: 'Amazon.se (SEK)', currency: 'SEK', threshold50: 98, threshold60: 99 },
};

export const DEFAULT_INPUT = {
  format: 'ebook',
  ebookMarket: 'us',
  ebookListPrice: 4.99,
  ebookUnitsSold: 500,
  ebookRoyaltyPlan: '70',
  ebookFileSizeMb: 2,
  ebookVatRatePct: 0,
  ebookEligibleSalesPct: 100,
  paperbackMarket: 'us',
  paperbackListPrice: 14.99,
  paperbackPrintingCost: 4.65,
  paperbackAmazonUnits: 120,
  paperbackExpandedUnits: 20,
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const safeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

export function validateInputs(input) {
  const format = input?.format;
  if (!['ebook', 'paperback'].includes(format)) {
    return { valid: false, message: 'format must be ebook or paperback.' };
  }

  if (format === 'ebook') {
    const numericChecks = [
      ['ebookListPrice', 0.01, 1_000_000],
      ['ebookUnitsSold', 0, 10_000_000],
      ['ebookFileSizeMb', 0, 10_000],
      ['ebookVatRatePct', 0, 99.99],
      ['ebookEligibleSalesPct', 0, 100],
    ];

    for (const [key, min, max] of numericChecks) {
      const value = safeNumber(input[key]);
      if (!Number.isFinite(value) || value < min || value > max) {
        return { valid: false, message: `${key} must be between ${min} and ${max}.` };
      }
    }

    if (!EBOOK_MARKETS[input.ebookMarket]) {
      return { valid: false, message: 'ebookMarket is invalid.' };
    }

    if (!['35', '70'].includes(String(input.ebookRoyaltyPlan))) {
      return { valid: false, message: 'ebookRoyaltyPlan must be 35 or 70.' };
    }

    return { valid: true, message: '' };
  }

  const paperbackChecks = [
    ['paperbackListPrice', 0.01, 1_000_000],
    ['paperbackPrintingCost', 0, 1_000_000],
    ['paperbackAmazonUnits', 0, 10_000_000],
    ['paperbackExpandedUnits', 0, 10_000_000],
  ];

  for (const [key, min, max] of paperbackChecks) {
    const value = safeNumber(input[key]);
    if (!Number.isFinite(value) || value < min || value > max) {
      return { valid: false, message: `${key} must be between ${min} and ${max}.` };
    }
  }

  if (!PAPERBACK_MARKETS[input.paperbackMarket]) {
    return { valid: false, message: 'paperbackMarket is invalid.' };
  }

  return { valid: true, message: '' };
}

export function calculateVatExclusive(listPrice, vatRatePct) {
  const rate = clamp(Number(vatRatePct) / 100 || 0, 0, 0.9999);
  const exclusive = rate > 0 ? Number(listPrice) / (1 + rate) : Number(listPrice);
  const vatAmount = Number(listPrice) - exclusive;
  return {
    exclusiveListPrice: round(exclusive, 2),
    applicableVatAmount: round(vatAmount, 2),
  };
}

export function calculateDeliveryCost(marketKey, fileSizeMb) {
  const market = EBOOK_MARKETS[marketKey] || EBOOK_MARKETS.us;
  const size = Math.max(0, Number(fileSizeMb) || 0);

  if (market.waivesLargeFilesAtMb && size >= market.waivesLargeFilesAtMb) {
    return 0;
  }

  const raw = size * market.deliveryCostPerMb;
  const cost = Math.max(market.minDeliveryCost, raw);
  return market.wholeCurrency ? Math.round(cost) : round(cost, 2);
}

export function calculateEbookRoyalty(input) {
  const normalized = { ...DEFAULT_INPUT, ...input, format: 'ebook' };
  const validation = validateInputs(normalized);
  if (!validation.valid) throw new Error(validation.message || 'Invalid ebook input');

  const market = EBOOK_MARKETS[normalized.ebookMarket];
  const listPrice = Number(normalized.ebookListPrice);
  const unitsSold = Number(normalized.ebookUnitsSold);
  const plan = String(normalized.ebookRoyaltyPlan);
  const fileSizeMb = Number(normalized.ebookFileSizeMb);
  const vatRatePct = Number(normalized.ebookVatRatePct);
  const eligibleShare = clamp(Number(normalized.ebookEligibleSalesPct) / 100, 0, 1);

  const { exclusiveListPrice, applicableVatAmount } = calculateVatExclusive(listPrice, vatRatePct);
  const deliveryCostPerSale = calculateDeliveryCost(normalized.ebookMarket, fileSizeMb);
  const royalty35PerSaleRaw = 0.35 * exclusiveListPrice;
  const royalty70EligiblePerSaleRaw = 0.70 * (exclusiveListPrice - deliveryCostPerSale);

  const effectiveRoyaltyPerSaleRaw = plan === '70'
    ? (eligibleShare * royalty70EligiblePerSaleRaw) + ((1 - eligibleShare) * royalty35PerSaleRaw)
    : royalty35PerSaleRaw;

  const monthlyRoyaltyRaw = effectiveRoyaltyPerSaleRaw * unitsSold;
  const monthlyRoyaltyAt35Raw = royalty35PerSaleRaw * unitsSold;
  const monthlyRoyaltyAt70AllEligibleRaw = royalty70EligiblePerSaleRaw * unitsSold;
  const monthlyDeliveryDragRaw = plan === '70' ? deliveryCostPerSale * unitsSold * eligibleShare : 0;
  const effectiveRoyaltyRatePctRaw = listPrice > 0 ? (effectiveRoyaltyPerSaleRaw / listPrice) * 100 : 0;
  const minimumListPriceForPositive70RoyaltyRaw = deliveryCostPerSale * (1 + vatRatePct / 100);

  const warnings = [];
  if (plan === '70') {
    warnings.push('70% royalties also depend on KDP pricing-page compliance, territory eligibility, and other KDP rules. Verify in your KDP dashboard before pricing decisions.');
  }
  if (plan === '70' && eligibleShare < 1) {
    warnings.push('Some sales are modeled at the 35% formula because eligible-sales share is below 100%.');
  }
  if (plan === '70' && royalty70EligiblePerSaleRaw < 0) {
    warnings.push('The current file-size and price combination makes 70%-eligible royalty negative before rounding.');
  }

  return {
    mode: 'ebook',
    currency: market.currency,
    marketKey: market.key,
    marketLabel: market.label,
    plan,
    listPrice: round(listPrice, 2),
    unitsSold: round(unitsSold, 0),
    fileSizeMb: round(fileSizeMb, 2),
    vatRatePct: round(vatRatePct, 2),
    eligibleSalesPct: round(eligibleShare * 100, 2),
    applicableVatAmount,
    exclusiveListPrice,
    deliveryCostPerSale: round(deliveryCostPerSale, 2),
    royalty35PerSale: round(royalty35PerSaleRaw, 2),
    royalty70EligiblePerSale: round(royalty70EligiblePerSaleRaw, 2),
    royaltyPerSale: round(effectiveRoyaltyPerSaleRaw, 2),
    monthlyRoyalty: round(monthlyRoyaltyRaw, 2),
    monthlyRoyaltyAt35: round(monthlyRoyaltyAt35Raw, 2),
    monthlyRoyaltyAt70AllEligible: round(monthlyRoyaltyAt70AllEligibleRaw, 2),
    monthlyDeltaVs35: round(monthlyRoyaltyRaw - monthlyRoyaltyAt35Raw, 2),
    monthlyDeliveryDrag: round(monthlyDeliveryDragRaw, 2),
    effectiveRoyaltyRatePct: round(effectiveRoyaltyRatePctRaw, 2),
    minimumListPriceForPositive70Royalty: round(minimumListPriceForPositive70RoyaltyRaw, 2),
    warnings,
  };
}

export function calculatePaperbackRoyalty(input) {
  const normalized = { ...DEFAULT_INPUT, ...input, format: 'paperback' };
  const validation = validateInputs(normalized);
  if (!validation.valid) throw new Error(validation.message || 'Invalid paperback input');

  const market = PAPERBACK_MARKETS[normalized.paperbackMarket];
  const listPrice = Number(normalized.paperbackListPrice);
  const printingCost = Number(normalized.paperbackPrintingCost);
  const amazonUnits = Number(normalized.paperbackAmazonUnits);
  const expandedUnits = Number(normalized.paperbackExpandedUnits);

  const amazonRate = listPrice >= market.threshold60 ? 0.60 : 0.50;
  const amazonRoyaltyPerSaleRaw = (amazonRate * listPrice) - printingCost;
  const expandedRoyaltyPerSaleRaw = (0.40 * listPrice) - printingCost;
  const amazonMonthlyRoyaltyRaw = amazonUnits * amazonRoyaltyPerSaleRaw;
  const expandedMonthlyRoyaltyRaw = expandedUnits * expandedRoyaltyPerSaleRaw;
  const totalMonthlyRoyaltyRaw = amazonMonthlyRoyaltyRaw + expandedMonthlyRoyaltyRaw;
  const totalUnits = amazonUnits + expandedUnits;
  const totalGrossSalesRaw = totalUnits * listPrice;
  const effectiveBlendedRatePctRaw = totalGrossSalesRaw > 0 ? (totalMonthlyRoyaltyRaw / totalGrossSalesRaw) * 100 : 0;
  const breakEvenListPriceAmazonRaw = amazonRate > 0 ? printingCost / amazonRate : Infinity;
  const breakEvenListPriceExpandedRaw = printingCost / 0.40;
  const priceGapTo60BandRaw = listPrice >= market.threshold60 ? 0 : market.threshold60 - listPrice;
  const royaltyAt60BandPerSaleRaw = (0.60 * market.threshold60) - printingCost;

  const warnings = [];
  if (expandedUnits > 0 && expandedRoyaltyPerSaleRaw < 0) {
    warnings.push('Expanded Distribution is modeled at a negative royalty per copy with the current list price and printing cost.');
  }
  if (amazonRate === 0.50) {
    warnings.push(`This list price is still in the 50% Amazon band. ${market.currency} ${market.threshold60} is the local threshold for the 60% band in this marketplace.`);
  }

  return {
    mode: 'paperback',
    currency: market.currency,
    marketKey: market.key,
    marketLabel: market.label,
    listPrice: round(listPrice, 2),
    printingCost: round(printingCost, 2),
    amazonUnits: round(amazonUnits, 0),
    expandedUnits: round(expandedUnits, 0),
    amazonRatePct: round(amazonRate * 100, 0),
    amazonBandLabel: amazonRate === 0.60 ? '60% band' : '50% band',
    amazonRoyaltyPerSale: round(amazonRoyaltyPerSaleRaw, 2),
    expandedRoyaltyPerSale: round(expandedRoyaltyPerSaleRaw, 2),
    amazonMonthlyRoyalty: round(amazonMonthlyRoyaltyRaw, 2),
    expandedMonthlyRoyalty: round(expandedMonthlyRoyaltyRaw, 2),
    totalMonthlyRoyalty: round(totalMonthlyRoyaltyRaw, 2),
    totalUnits: round(totalUnits, 0),
    totalGrossSales: round(totalGrossSalesRaw, 2),
    effectiveBlendedRatePct: round(effectiveBlendedRatePctRaw, 2),
    breakEvenListPriceAmazon: round(breakEvenListPriceAmazonRaw, 2),
    breakEvenListPriceExpanded: round(breakEvenListPriceExpandedRaw, 2),
    threshold50: market.threshold50,
    threshold60: market.threshold60,
    priceGapTo60Band: round(priceGapTo60BandRaw, 2),
    royaltyAt60BandPerSale: round(royaltyAt60BandPerSaleRaw, 2),
    warnings,
  };
}

export function calculateKdpRoyalty(input) {
  if ((input?.format || DEFAULT_INPUT.format) === 'paperback') {
    return calculatePaperbackRoyalty(input);
  }
  return calculateEbookRoyalty(input);
}

export function buildSummary(result, locale = 'en-US') {
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: result.currency,
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  if (result.mode === 'ebook') {
    return [
      '[Amazon KDP Royalty Summary]',
      `Mode: eBook (${result.plan}% plan)` ,
      `Marketplace: ${result.marketLabel}`,
      `Royalty per sale: ${money.format(result.royaltyPerSale)}`,
      `Monthly royalty: ${money.format(result.monthlyRoyalty)}`,
      `Effective royalty rate: ${num.format(result.effectiveRoyaltyRatePct)}%`,
      `35% baseline monthly royalty: ${money.format(result.monthlyRoyaltyAt35)}`,
      `70% eligible royalty per sale: ${money.format(result.royalty70EligiblePerSale)}`,
      `Monthly delivery drag: ${money.format(result.monthlyDeliveryDrag)}`,
    ].join('\n');
  }

  return [
    '[Amazon KDP Royalty Summary]',
    'Mode: Paperback',
    `Marketplace: ${result.marketLabel}`,
    `Amazon band: ${result.amazonBandLabel}`,
    `Amazon royalty per sale: ${money.format(result.amazonRoyaltyPerSale)}`,
    `Expanded royalty per sale: ${money.format(result.expandedRoyaltyPerSale)}`,
    `Monthly royalty: ${money.format(result.totalMonthlyRoyalty)}`,
    `Effective blended rate: ${num.format(result.effectiveBlendedRatePct)}%`,
    `Amazon break-even list price: ${money.format(result.breakEvenListPriceAmazon)}`,
    `Expanded break-even list price: ${money.format(result.breakEvenListPriceExpanded)}`,
  ].join('\n');
}
