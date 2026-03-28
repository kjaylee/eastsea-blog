# Spec — StockX vs GOAT Profit Calculator

## Objective
Help sneaker / resale sellers compare the same sale scenario on StockX and GOAT before listing inventory.

## URL
`/tools/stockx-vs-goat-profit-calculator/`

## Inputs
### Shared sale inputs
- `salePrice` (USD, > 0)
- `itemCost` (USD, >= 0)
- `shippingCost` (USD, >= 0)
- `packagingCost` (USD, >= 0)
- `otherCost` (USD, >= 0)

### StockX-specific input
- `stockxSellerLevel` (`level-1`..`level-5`)

### GOAT-specific inputs
- `goatFeePreset` (`goat-baseline` or `custom`)
- `goatCustomFeeRatePct` (0..100, only active for custom)
- `goatCustomFlatFee` (>= 0, only active for custom)
- `goatRefundLossRatePct` (0..100)

## Core calculations
### StockX side
Use `tools/stockx-fee-profit-calculator/calculator.js` with:
- `shippingToStockx = shippingCost`
- `otherCost = otherCost`
- shared inputs for item / packaging

### GOAT side
Use `tools/goat-fee-calculator/calculator.js` with:
- `sellerShippingCost = shippingCost`
- `otherSellerCost = otherCost`
- `desiredNetProfit = 0` for comparison mode

### Comparison outputs
- `stockxNetProfit`
- `goatNetProfit`
- `stockxPayoutAfterFees`
- `goatPayoutBeforeSellerCosts`
- `stockxFeeTotal`
- `goatFeeTotal` (platform fee + refund planning loss)
- `stockxMarginPct`
- `goatMarginPct`
- `winnerPlatform` (`stockx` | `goat` | `tie`)
- `winnerDelta`
- `priceNeededOnStockxToMatchGoat`
- `priceNeededOnGoatToMatchStockx`
- copy-ready summary text

## Winner logic
- Compare `netProfit` values.
- If absolute delta < `0.005`, treat as `tie`.
- Otherwise platform with higher net profit wins.

## Reverse-solve logic
- `priceNeededOnStockxToMatchGoat`: binary-search StockX sale price until StockX net profit ~= current GOAT net profit.
- `priceNeededOnGoatToMatchStockx`: use GOAT reverse solve against current StockX net profit by invoking GOAT calculation with `desiredNetProfit = stockxNetProfit`.
- If the target is mathematically unreachable, return `null`.

## UI requirements
- Single-page responsive layout
- clear assumption note for each platform
- side-by-side KPI cards
- winner banner with human-readable takeaway
- summary textarea + copy button
- related links to:
  - `/tools/stockx-fee-profit-calculator/`
  - `/tools/goat-fee-calculator/`
  - `/tools/grailed-fee-profit-calculator/`
  - `/tools/whatnot-seller-fee-calculator/`

## SEO / metadata
- exact-match title includes `StockX vs GOAT Profit Calculator`
- description emphasizes seller fee / payout / net-profit comparison
- canonical URL uses final slug
- analytics include present

## Discovery wiring
Add the new slug exactly once to:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` via rebuild

## Acceptance criteria
1. Valid input renders both platform results with stable numbers.
2. Low-price StockX scenario still reflects the minimum seller fee floor via the reused module.
3. GOAT custom override affects the comparison deterministically.
4. Summary text includes winner, fee totals, and match-price deltas.
5. Discovery artifacts contain the slug exactly once.
6. Test file passes locally.
