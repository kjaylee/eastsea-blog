# Spec — Creator Brand Deal Take-home Calculator

## Summary
Build a static calculator at `tools/creator-brand-deal-take-home-calculator/` that helps creators and reps price branded-content deals by modeling rights add-ons, rep/platform deductions, hard delivery costs, tax reserve, and target-net reverse solving.

## Users
- creators negotiating brand deals
- managers or agents structuring branded-content packages
- small creator agencies pressure-testing quote math before sending a proposal

## User stories
1. As a creator, I can see how much I keep after manager, agency, platform, and payment deductions.
2. As a creator, I can add paid usage, whitelisting, and exclusivity economics without rebuilding a spreadsheet.
3. As a manager, I can reverse-solve the gross quote required to hit a target creator take-home.
4. As a user, I can copy a concise summary into negotiation notes or a rate-card workflow.
5. As a search visitor, I can immediately see that this tool solves take-home math, not audience-based rate estimation.

## Inputs
- `deliverables`: number of deliverables in the campaign
- `baseFeePerDeliverable`: creative fee per deliverable
- `usageMonths`: number of paid usage months
- `usageFeePerMonth`: paid-usage fee per month
- `whitelistingMonths`: number of whitelisting months
- `whitelistingFeePerMonth`: whitelisting fee per month
- `exclusivityMonths`: number of exclusivity months
- `exclusivityFeePerMonth`: exclusivity fee per month
- `managerFeePct`
- `agencyFeePct`
- `platformFeePct`
- `paymentProcessingFeePct`
- `paymentFixedFee`
- `productionCost`
- `assistantCost`
- `travelCost`
- `taxReservePct`
- `targetNetTakeHome`

## Core formulas
- `contentSubtotal = deliverables × baseFeePerDeliverable`
- `usageRightsFee = usageMonths × usageFeePerMonth`
- `whitelistingFee = whitelistingMonths × whitelistingFeePerMonth`
- `exclusivityFee = exclusivityMonths × exclusivityFeePerMonth`
- `rightsSubtotal = usageRightsFee + whitelistingFee + exclusivityFee`
- `grossQuote = contentSubtotal + rightsSubtotal`
- `managerFeeAmount = grossQuote × managerFeePct`
- `agencyFeeAmount = grossQuote × agencyFeePct`
- `platformFeeAmount = grossQuote × platformFeePct`
- `paymentProcessingPctAmount = grossQuote × paymentProcessingFeePct`
- `totalPercentFeeAmount = managerFeeAmount + agencyFeeAmount + platformFeeAmount + paymentProcessingPctAmount`
- `hardCosts = productionCost + assistantCost + travelCost`
- `preTaxNet = grossQuote - totalPercentFeeAmount - paymentFixedFee - hardCosts`
- `taxReserveAmount = max(preTaxNet, 0) × taxReservePct`
- `creatorNetTakeHome = preTaxNet - taxReserveAmount`
- `effectiveTakeHomeRatePct = creatorNetTakeHome ÷ grossQuote`
- `requiredPreTaxNet = targetNetTakeHome ÷ (1 - taxReservePct)` when target > 0
- `requiredGrossQuote = (requiredPreTaxNet + paymentFixedFee + hardCosts) ÷ (1 - totalPercentFeeRate)`
- `requiredBaseFeePerDeliverable = max(requiredGrossQuote - rightsSubtotal, 0) ÷ deliverables`

## Outputs
### KPIs
- brand quote
- creator net take-home
- required quote for target net
- gap vs target net
- effective take-home rate
- rights add-on total

### Detail breakdown
- content subtotal
- rights subtotal
- manager fee amount
- agency fee amount
- platform fee amount
- payment processing amount
- payment fixed fee
- total hard costs
- pre-tax net
- tax reserve amount
- required base fee per deliverable

## UX requirements
- Fully static, responsive HTML page.
- Title, description, canonical, OG, Twitter, and JSON-LD `WebApplication`.
- `aria-live="polite"` result/status region.
- A clear scope note: “deal take-home math, not audience rate estimation.”
- Copy-summary button.
- Inline validation and solver honesty for impossible target states.
- Link chips to adjacent creator tools already in the repo.

## Validation rules
- numeric inputs must be finite and non-negative
- `deliverables` must be an integer `>= 1`
- month fields must be integers `>= 0`
- percentage inputs must stay in `[0, 95]`
- combined percentage deductions must stay below `100%`
- `taxReservePct` must stay below `100%`

## File plan
- `tools/creator-brand-deal-take-home-calculator/index.html`
- `tools/creator-brand-deal-take-home-calculator/logic.mjs`
- `tools/creator-brand-deal-take-home-calculator/app.mjs`
- `tests/unit/creator-brand-deal-take-home-calculator.test.mjs`
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (generated)

## Acceptance criteria
1. Tool exists and renders at `/tools/creator-brand-deal-take-home-calculator/`.
2. Rights add-ons, deductions, costs, and tax reserve are modeled deterministically.
3. Reverse-solve output returns the required quote for a target net take-home.
4. Impossible target states are surfaced honestly.
5. Deterministic unit tests pass.
6. Catalog wiring exists exactly once across landing/catalog files and manifest.
