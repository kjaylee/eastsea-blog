# Spec — Substack Newsletter Revenue Calculator

Goal
- Static, client‑only tool under `tools/substack-newsletter-revenue-calculator/`.
- Deterministic compute in `calculator.js`; UI in `index.html` with clear EN labels.
- Catalog intact: page includes `/assets/analytics.js`; `tools/manifest.json` updated with size and url; discovery cards already exist (no duplicate edits).

Inputs
- Base
  - `derivePaidFromAudience` (bool; default false)
  - `audienceSize` (int ≥ 0)
  - `paidConversionRatePct` (0–100; used only when derivePaidFromAudience)
  - `paidSubscribers` (int ≥ 0; used when not deriving)
  - `annualSharePct` (0–100; share of paid on annual billing)
- Pricing & counts
  - `monthlyPrice` (money ≥ 0)
  - `annualPrice` (money ≥ 0)
  - `foundingMembers` (int ≥ 0)
  - `foundingPrice` (money ≥ 0)
- Fees
  - `refundRatePct` (0–100; applied to gross)
  - `substackPlatformFeeRatePct` (0–100)
  - `processingFeeRatePct` (0–100)
  - `processingFixedFee` (money ≥ 0 per charge)
  - `recurringBillingFeeRatePct` (0–100; applies only to recurring subs: monthly+annual, not founding)

Validation
- Integers for counts; finite non‑negative money; rates in [0,100].
- When `derivePaidFromAudience`, compute `paidSubscribers = round(audienceSize * paidConversionRatePct/100)`.

Computation (monthly‑equivalent snapshot)
- Split paid base:
  - `monthlyPaid = round(paidSubscribers * (1 - annualSharePct/100))`
  - `annualPaid = paidSubscribers - monthlyPaid`
- Gross (monthly equivalent):
  - `gMonthly = monthlyPaid * monthlyPrice`
  - `gAnnualEq = (annualPaid * annualPrice) / 12`
  - `gFoundingEq = (foundingMembers * foundingPrice) / 12`
  - `grossEq = gMonthly + gAnnualEq + gFoundingEq`
- Refund loss (monthly eq): `refundLossEq = grossEq * (refundRatePct/100)`
- Net after refunds (monthly eq): `netAfterRefundsEq = grossEq - refundLossEq`
- Variable fees (monthly eq):
  - `platformFeeEq = netAfterRefundsEq * (substackPlatformFeeRatePct/100)`
  - `processorVarFeeEq = netAfterRefundsEq * (processingFeeRatePct/100)`
  - `recurringFeeEq = ((gMonthly + gAnnualEq) - (gMonthly + gAnnualEq)*(refundRatePct/100)) * (recurringBillingFeeRatePct/100)`
- Fixed fees (monthly eq):
  - `fixedMonthlyEq = monthlyPaid * processingFixedFee`
  - `fixedAnnualEq = (annualPaid/12) * processingFixedFee`
  - `fixedFoundingEq = (foundingMembers/12) * processingFixedFee`
  - `fixedFeeEq = fixedMonthlyEq + fixedAnnualEq + fixedFoundingEq`
- Totals & KPIs
  - `totalFeesExRefundEq = platformFeeEq + processorVarFeeEq + recurringFeeEq + fixedFeeEq`
  - `netEq = grossEq - refundLossEq - (platformFeeEq + processorVarFeeEq + recurringFeeEq + fixedFeeEq)`
  - `effectiveFeeRatePct = grossEq>0 ? (totalFeesExRefundEq/grossEq)*100 : 0`

Outputs (render)
- KPIs: Gross (eq/mo), Refund loss (eq/mo), Total fees excl refunds (eq/mo), Net take‑home (eq/mo), Effective fee rate (%).
- Mix: monthlyPaid vs annualPaid vs foundingMembers counts.
- Summary text for clipboard.

Files
- `tools/substack-newsletter-revenue-calculator/index.html`
- `tools/substack-newsletter-revenue-calculator/calculator.js`
- `tools/substack-newsletter-revenue-calculator/calculator.test.js`

Catalog/SEO
- `<title>` and meta description present.
- Include `/assets/analytics.js`.
- Do not add duplicate discovery cards (they already exist); update `tools/manifest.json` with `{ slug, title, url, size }` and bump `count` and `updatedAt`.

Non‑goals
- Detailed cash‑timing accounting; payout timing; trials/coupons; taxes.
