# Spec — Patreon Net Revenue Calculator

Goal
- Static, client‑only tool under `tools/patreon-net-revenue-calculator/`.
- Deterministic compute in `calculator.js`; UI in `index.html` with EN/KR strings.
- Catalog wired: `_data/tools-list.json` entry and `tools/manifest.json` entry.

Inputs
- Monthly memberships
  - `monthlyMembers` (int ≥ 0)
  - `monthlyPrice` (money ≥ 0)
- Annual memberships billed this period
  - `annualMembersBilled` (int ≥ 0)
  - `annualPrice` (money ≥ 0)
- One‑time purchases billed this period
  - `oneTimeGrossSales` (money ≥ 0)
  - `oneTimeOrders` (int ≥ 0)
- Patreon plan preset
  - `planPreset`: `lite` (5%), `pro` (8%), `premium` (12%), `custom`
  - `customPlanRatePct` (0–100)
- Processing presets (tiered by avg charge)
  - `standardRatePct` (default 2.9), `standardFlat` (0.30)
  - `microRatePct` (5.0), `microFlat` (0.10)
  - `microThreshold` (3.00)
- Refunds/chargebacks
  - `refundRatePct` (default 2)
- Payout drag
  - `payoutFlat` (default 0.25)
  - `payoutPercentPct` (default 0)
  - `payoutsPerMonth` (default 1)
- Other
  - `otherMonthlyCost` (default 0)
  - `currency` (default USD; formatting only)
  - `desiredMonthlyNet` (target net; optional)

Validation
- Money numbers must be finite and ≥ 0.
- Counts must be integers and ≥ 0; when a bucket has positive gross, its order count must be ≥ 1 for per‑order fees.
- Rates: 0 ≤ x < 100.

Computation (monthly)
- Gross
  - `grossMonthly = monthlyMembers * monthlyPrice`
  - `grossAnnual = annualMembersBilled * annualPrice`
  - `grossOneTime = oneTimeGrossSales`
  - `totalGross = grossMonthly + grossAnnual + grossOneTime`
- Platform fee
  - `planRate = {lite:0.05, pro:0.08, premium:0.12, custom:customPlanRatePct/100}`
  - `platformFees = totalGross * planRate`
- Processing fees (per bucket)
  - Decide tier by bucket AOV: `aov = gross/orders` (when orders>0), else for monthly/annual use price directly.
  - Tier fees: `bucket * ratePct + orders * flat`
  - Monthly: orders = `monthlyMembers`, aov = `monthlyPrice`
  - Annual: orders = `annualMembersBilled`, aov = `annualPrice`
  - One‑time: orders = `oneTimeOrders`, aov = `grossOneTime/oneTimeOrders` (if orders>0)
- Refund loss
  - `refundLoss = totalGross * refundRatePct/100`
- Payout drag
  - `payoutBase = totalGross - platformFees - processingFees - refundLoss`
  - `payoutFees = payoutsPerMonth * payoutFlat + payoutBase * (payoutPercentPct/100)`
- Other cost
  - `fixedCost = otherMonthlyCost`
- Net & KPIs
  - `totalFees = platformFees + processingFees + refundLoss + payoutFees + fixedCost`
  - `netRevenue = totalGross - totalFees`
  - `effectiveFeeRatePct = totalGross>0 ? (totalFees/totalGross)*100 : 0`
  - `takeHomePerMonthlyMember = monthlyMembers>0 ? (netRevenue/ (monthlyMembers + annualMembersBilled + oneTimeOrders)) : null` (UI: also show per monthly member using only monthlyMembers)
  - Break‑even price for monthly bucket with other buckets fixed: solve for `monthlyPrice` s.t. `netRevenue=0` via monotonic bisection across [0, 9999]. Also `requiredGrossForTargetNet` when `desiredMonthlyNet` given.

Outputs (render)
- KPIs: Net revenue (money), Total fees (money), Effective fee rate (%), Break‑even monthly price (money or N/A).
- Details: Gross by bucket, Platform fee, Processing fee by bucket + total, Refund loss, Payout fees, Other cost.
- Comparison mini‑table: plan presets vs take‑home (Pro/Lite/Premium/Custom with current custom rate).
- Summary text blob (EN/KR) for clipboard.

Files
- `tools/patreon-net-revenue-calculator/index.html`
- `tools/patreon-net-revenue-calculator/calculator.js`
- `tools/patreon-net-revenue-calculator/calculator.test.js`

Catalog wiring
- `_data/tools-list.json`: append { title, description, url }.
- `tools/manifest.json`: append { slug, title, url, size } where size = `wc -c` of `index.html`.

Non‑goals
- Tier‑by‑tier Patreon pricing, EU VAT handling, creator sales tax remittance, coupons, free trials, pending charge retries.

