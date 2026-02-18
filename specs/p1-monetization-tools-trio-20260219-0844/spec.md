# Spec — p1-monetization-tools-trio-20260219-0844

## 1) Objective
Ship **3 new production-ready monetization/business calculators** (single-file + mobile responsive) that support pricing, finance, and sales compensation decisions.

## 2) Scope
### In scope
1. `tools/deferred-revenue-recognition-calculator/index.html`
2. `tools/sales-commission-accelerator-calculator/index.html`
3. `tools/price-localization-margin-calculator/index.html`
4. Discovery/crawl updates:
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of scope
- Existing tool/game refactor or polish
- Backend APIs / external SaaS integrations
- User account/session persistence

## 3) Functional Requirements

### FR-A: Deferred Revenue Recognition Calculator
**Purpose:** estimate recognized revenue, deferred balance, and gross profit timing for prepaid contracts.

**Inputs**
- New contracts per month (건)
- ACV per contract (KRW)
- Contract term (months)
- Early cancellation rate (% across booked cohort)
- Service delivery COGS ratio (% of recognized revenue)
- Billing/collection fee ratio (% of billed cash)
- Analysis period (months)
- One-time implementation cost (KRW)

**Outputs**
- Monthly cash billed
- Monthly recognized revenue
- Monthly deferred revenue ending balance
- Monthly recognized gross profit
- Period totals (cash / recognized revenue / gross profit)
- Period net impact (gross profit - one-time cost)
- ROI (%)
- Break-even monthly contract count (건)

**Formula notes**
- `effectiveRecognizedRatio = 1 - cancellationRate`
- `recognizedPerContractPerMonth = (ACV * effectiveRecognizedRatio) / term`
- Recognized revenue in month `m` sums active cohorts up to `term` months.
- Deferred ending balance = cumulative billed − cumulative recognized.

---

### FR-B: Sales Commission Accelerator Calculator
**Purpose:** evaluate whether accelerator plans protect margin while driving over-quota behavior.

**Inputs**
- Team size (명)
- Quota per rep per period (KRW)
- Actual bookings per rep per period (KRW)
- Base commission rate (% up to threshold)
- Accelerator threshold (% of quota)
- Accelerator rate (% above threshold)
- Overachievement cap (% of quota counted for payout)
- Gross margin ratio (% of bookings)
- Additional SPIFF pool per period (KRW)
- Analysis periods (count)

**Outputs**
- Quota attainment (%)
- Eligible bookings for payout (cap applied)
- Total commission payout (base + accelerator + SPIFF)
- Blended commission rate (% of bookings)
- Gross profit before commission
- Gross profit after commission
- Commission-to-gross-profit ratio (%)
- Break-even required bookings per rep (KRW) for non-negative post-commission GP

**Formula notes**
- Bookings below threshold paid at base rate.
- Bookings above threshold paid at accelerator rate.
- Cap limits payout-eligible bookings, not displayed actual attainment.

---

### FR-C: Price Localization Margin Calculator
**Purpose:** compute localized list price and realized margin after FX, VAT, and channel fees.

**Inputs**
- Base domestic ex-VAT price (KRW)
- FX rate (local currency per KRW)
- Desired local rounding unit (e.g., 0.99, 1, 10)
- Local VAT/GST rate (%)
- Marketplace/platform fee (%)
- Payment processing fee (%)
- Refund rate (%)
- Product COGS ratio (%)
- Local support/logistics cost per order (local currency)
- Target operating margin (%)

**Outputs**
- Converted local net price (before local adjustments)
- Recommended local list price (rounded, VAT-inclusive)
- Net revenue after VAT/fees/refunds
- Operating profit per order
- Operating margin (%)
- Margin gap vs target (%p)
- Required list price for target margin (VAT-inclusive)

**Formula notes**
- VAT-inclusive list price converted to VAT-exclusive net before fee deductions.
- Refund loss applied as revenue reduction factor.
- Required price derived from rearranged unit-margin equation.

## 4) UX/UI Requirements
- Single-file HTML with embedded CSS/JS only
- Responsive 2-column desktop / 1-column mobile (<900px)
- Input validation with visible error box
- Live recalculation on `input` + `change`
- KPI card section + details table + copyable summary text

## 5) Non-Functional Requirements
- Deterministic computation only (no random/external dependency)
- Defensive guards for NaN, divide-by-zero, impossible break-even
- Korean-first labels with practical operator wording

## 6) Acceptance Criteria
- 3 new unique tool slugs created and loadable
- Discovery files include all 3 URLs
- Local static serving returns HTTP 200 for all 3 routes
- Live URLs checked after push (record propagation status)
- Checkpoints persisted under `.state/p1-monetization-tools-trio/20260219-0844/`
