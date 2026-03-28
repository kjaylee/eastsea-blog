# Spec — eBay vs Poshmark Profit Calculator

## Objective
Ship a new static comparator at `/tools/ebay-vs-poshmark-profit-calculator/` that helps resale sellers decide which marketplace leaves more net profit for the same item.

## Deliverables
1. `tools/ebay-vs-poshmark-profit-calculator/index.html`
2. `tools/ebay-vs-poshmark-profit-calculator/calculator.js`
3. `tools/ebay-vs-poshmark-profit-calculator/calculator.test.js`
4. Discovery updates:
   - `tools/index.html`
   - `tools/index.md`
   - `_data/tools-list.json`
   - regenerated `tools/manifest.json`
5. Verification artifacts under `specs/heartbeat-p1-20260328-ebay-vs-poshmark-profit-calculator/`

## Functional requirements
1. The page must be fully static with no backend.
2. The calculator must reuse the shipped local platform engines:
   - `../ebay-fee-profit-calculator/calculator.js`
   - `../poshmark-fee-profit-calculator/calculator.js`
3. Inputs must include:
   - `listPrice`
   - `offerDiscountPct`
   - `itemCost`
   - `packagingCost`
   - `otherCost`
   - `ebayShippingCharged`
   - `ebayActualShippingCost`
   - `ebaySalesTaxRatePct`
   - `ebayCategoryPreset`
   - `ebayPromotedRatePct`
   - `poshmarkSellerShippingDiscount`
4. Comparison rule:
   - Poshmark uses `listPrice` and `offerDiscountPct` directly.
   - eBay sold price must use the same realized sale price as Poshmark so the comparison is apples-to-apples on negotiated item price.
5. Outputs must include:
   - `realizedSalePrice`
   - `winnerPlatform`
   - `winnerDelta`
   - eBay fee total / payout / net profit / effective fee rate / break-even sold price
   - Poshmark fee total / payout / net profit / effective fee rate / break-even list price / max offer discount
   - `priceNeededOnEbayToMatchPoshmark`
   - `priceNeededOnPoshmarkToMatchEbay`
   - copy-ready summary text
6. The tool must validate invalid inputs with human-readable errors.
7. UI must be mobile responsive.
8. Metadata must include exact-match title / canonical for the final slug.
9. Related links must point to the shipped single-platform tools.

## Non-goals
- no tax-region overrides beyond the existing eBay percent input
- no monthly sales forecasting
- no marketplace ranking history or sell-through probability
- no seller account / store subscription personalization

## Assumptions
1. eBay comparison uses Poshmark’s realized item price as eBay `soldPrice`.
2. Poshmark shipping cost exposure is represented only by seller shipping discount.
3. Poshmark seller shipping discount and eBay actual shipping cost are intentionally distinct because platform mechanics differ.
4. Both sides reuse shipped public-baseline assumptions already encoded in the repo modules.

## Safety / quality constraints
- Keep logic deterministic and directly testable from Node.
- Keep edits surgical; no unrelated refactors.
- Discovery wiring must include the new slug exactly once in each required surface.

## Verification commands
```bash
node --check eastsea-blog/tools/ebay-vs-poshmark-profit-calculator/calculator.js
node --test eastsea-blog/tools/ebay-vs-poshmark-profit-calculator/calculator.test.js
python3 -m json.tool eastsea-blog/tools/manifest.json >/dev/null
python3 -m json.tool eastsea-blog/_data/tools-list.json >/dev/null
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog && python3 -m http.server 8042
```
