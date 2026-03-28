# Spec — GOAT Fee Calculator

## Slug
`goat-fee-calculator`

## Title
GOAT Fee Calculator | GOAT Seller Profit Calculator

## Primary user
Resale sellers listing sneakers, apparel, or related inventory on GOAT who need to estimate take-home payout before accepting an offer or setting a listing price.

## Task boundary
This spec is for artifact docs only. No implementation is part of this task.

## Problem
Existing EastSea seller tools cover several resale marketplaces, but there is no GOAT-specific payout calculator. A GOAT seller has a platform-specific economics question:

`What will I actually keep after GOAT fees and my seller-side costs?`

That is exact-match intent and different from generic marketplace-fee pages.

## Scope
Future implementation should build a static calculator that:
1. Estimates payout after the published GOAT baseline seller fee stack.
2. Calculates seller-side net profit after item cost and optional logistics costs.
3. Solves for break-even listing price.
4. Solves for required listing price to reach a target net profit.
5. Supports one public baseline preset plus a custom fee override.
6. Works fully client-side with deterministic tests.

## Inputs
- Sale price or accepted offer price
- Seller fee preset
  - `goat-baseline`
  - `custom`
- Seller fee rate (%)
- Per-order flat fee (if official docs confirm one for the modeled flow)
- Item cost / cost of goods sold
- Seller-paid shipping cost
- Packaging / handling cost
- Other seller cost
- Refund / return loss rate (%), optional planning input
- Desired net profit

## Outputs
- Gross sale amount
- Platform fee total
- Payout before seller costs
- Total seller-side cost
- Net profit
- Effective take rate
- Break-even listing price
- Required listing price for target net profit
- Copyable summary block

## Formula direction
Future implementation should use a transparent model:

- `grossSale = salePrice`
- `platformVariableFee = grossSale * sellerFeeRate`
- `platformFlatFee = flatFeePerOrder`
- `refundLoss = grossSale * refundLossRate`
- `payoutBeforeSellerCosts = grossSale - platformVariableFee - platformFlatFee - refundLoss`
- `sellerCostTotal = itemCost + sellerShippingCost + packagingCost + otherSellerCost`
- `netProfit = payoutBeforeSellerCosts - sellerCostTotal`
- `effectiveTakeRate = (platformVariableFee + platformFlatFee + refundLoss) / grossSale`

Reverse solver:

- `contributionMargin = 1 - sellerFeeRate - refundLossRate`
- `breakEvenListingPrice = (flatFeePerOrder + sellerCostTotal) / contributionMargin`
- `requiredListingPriceForTargetNet = (flatFeePerOrder + sellerCostTotal + desiredNetProfit) / contributionMargin`

Rules:
- If `grossSale <= 0`, outputs depending on division return `0` or `null` as appropriate.
- If `contributionMargin <= 0`, reverse-solver outputs return `null`.
- Future code must round visible currency outputs consistently to cents.

## Constants policy
Do not hard-code GOAT fee constants in docs unless re-verified at implementation time from current public GOAT seller documentation.

Implementation requirement:
- choose one clearly named public baseline seller flow,
- document the exact public assumptions in-page,
- and expose custom override fields for users outside that baseline.

## UX requirements
- Responsive single-page calculator
- Immediate KPI block above fold
- Clear assumption note for the modeled GOAT fee baseline
- Explicit disclaimer for out-of-scope cases such as region-specific or tier-specific fee variants
- Copyable summary for resale decision-making
- Related links to adjacent marketplace tools already in EastSea

## SEO/meta requirements
- Title contains `GOAT Fee Calculator`
- Description includes GOAT seller fees, payout, and break-even price language
- Canonical points to `/tools/goat-fee-calculator/`
- Related links should prefer nearby resale tools:
  - `stockx-fee-profit-calculator`
  - `grailed-fee-profit-calculator`
  - `mercari-fee-calculator`
  - `whatnot-seller-fee-calculator`

## Non-goals
- No implementation in this task
- No international fee matrix in v1
- No consignment / special program modeling unless publicly documented and scoped clearly
- No tax advice
- No market-price recommendation engine
- No inventory forecasting or resale trend analytics

## Deliverables for a future implementation task
- `tools/goat-fee-calculator/index.html`
- `tools/goat-fee-calculator/calculator.js`
- `tools/goat-fee-calculator/calculator.test.js`
- discovery wiring updates only when the tool actually ships
