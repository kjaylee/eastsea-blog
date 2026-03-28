// Markup Pricing Calculator — Core Functions (Node.js testable)
'use strict';

function round2(n) { return Math.round(n * 100) / 100; }
function round4(n) { return Math.round(n * 10000) / 10000; }

/**
 * Calculate selling price from cost and markup percentage.
 * markup% = ((price - cost) / cost) × 100
 * price = cost × (1 + markup% / 100)
 */
function priceFromMarkup(cost, markupPct) {
  if (cost < 0 || !isFinite(cost)) return { error: 'Cost must be non-negative' };
  if (!isFinite(markupPct)) return { error: 'Markup % must be a number' };
  const price = cost * (1 + markupPct / 100);
  const profit = price - cost;
  const marginPct = price === 0 ? 0 : (profit / price) * 100;
  return {
    cost: round2(cost),
    markupPct: round4(markupPct),
    sellingPrice: round2(price),
    profit: round2(profit),
    marginPct: round4(marginPct)
  };
}

/**
 * Calculate markup % from cost and selling price.
 */
function markupFromPrice(cost, sellingPrice) {
  if (cost < 0 || !isFinite(cost)) return { error: 'Cost must be non-negative' };
  if (sellingPrice < 0 || !isFinite(sellingPrice)) return { error: 'Selling price must be non-negative' };
  if (cost === 0 && sellingPrice === 0) {
    return { cost: 0, sellingPrice: 0, markupPct: 0, profit: 0, marginPct: 0 };
  }
  if (cost === 0) return { error: 'Cost cannot be zero when price > 0 (infinite markup)' };
  const profit = sellingPrice - cost;
  const markupPct = (profit / cost) * 100;
  const marginPct = sellingPrice === 0 ? 0 : (profit / sellingPrice) * 100;
  return {
    cost: round2(cost),
    sellingPrice: round2(sellingPrice),
    markupPct: round4(markupPct),
    profit: round2(profit),
    marginPct: round4(marginPct)
  };
}

/**
 * Calculate cost from selling price and markup %.
 * cost = price / (1 + markup% / 100)
 */
function costFromMarkup(sellingPrice, markupPct) {
  if (sellingPrice < 0 || !isFinite(sellingPrice)) return { error: 'Selling price must be non-negative' };
  if (!isFinite(markupPct)) return { error: 'Markup % must be a number' };
  if (markupPct <= -100) return { error: 'Markup % must be greater than -100%' };
  const cost = sellingPrice / (1 + markupPct / 100);
  const profit = sellingPrice - cost;
  const marginPct = sellingPrice === 0 ? 0 : (profit / sellingPrice) * 100;
  return {
    cost: round2(cost),
    sellingPrice: round2(sellingPrice),
    markupPct: round4(markupPct),
    profit: round2(profit),
    marginPct: round4(marginPct)
  };
}

/**
 * Convert markup % to margin % and vice versa.
 * margin = markup / (1 + markup/100) * 100  (if markup input)
 * markup = margin / (1 - margin/100) * 100  (if margin input)
 */
function markupToMargin(markupPct) {
  if (!isFinite(markupPct)) return { error: 'Invalid markup %' };
  if (markupPct <= -100) return { error: 'Markup must be > -100%' };
  const marginPct = (markupPct / (100 + markupPct)) * 100;
  return { markupPct: round4(markupPct), marginPct: round4(marginPct) };
}

function marginToMarkup(marginPct) {
  if (!isFinite(marginPct)) return { error: 'Invalid margin %' };
  if (marginPct >= 100) return { error: 'Margin must be < 100%' };
  const markupPct = (marginPct / (100 - marginPct)) * 100;
  return { marginPct: round4(marginPct), markupPct: round4(markupPct) };
}

/**
 * Batch markup table: given cost, generate price/profit/margin for multiple markup %s.
 */
function markupTable(cost, markupPcts) {
  if (cost < 0 || !isFinite(cost)) return { error: 'Cost must be non-negative' };
  return markupPcts.map(pct => priceFromMarkup(cost, pct));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    round2, round4,
    priceFromMarkup, markupFromPrice, costFromMarkup,
    markupToMargin, marginToMarkup, markupTable
  };
}
