# Test Cases — StockX vs GOAT Profit Calculator

## Deterministic math
1. Default baseline returns `ok=true`, `winnerPlatform`, stable fee totals, and stable net-profit delta.
2. StockX minimum seller fee floor remains visible in a low-price scenario.
3. GOAT custom override changes the winner deterministically.
4. Tie scenario returns `winnerPlatform = tie`.
5. `priceNeededOnStockxToMatchGoat` is finite for a reachable target.
6. `priceNeededOnGoatToMatchStockx` is `null` when GOAT contribution margin is non-positive.
7. Invalid `salePrice` is rejected.
8. Invalid GOAT custom fee inputs are rejected.

## HTML / SEO anchors
9. HTML includes:
   - exact-match title copy
   - canonical URL
   - analytics include
   - summary textarea anchor
   - winner section anchor
   - script tags for sibling StockX / GOAT calculators
   - related links to StockX and GOAT single-platform tools

## Discovery wiring
10. `tools/index.html` contains `stockx-vs-goat-profit-calculator` exactly once.
11. `tools/index.md` contains `stockx-vs-goat-profit-calculator` exactly once.
12. `_data/tools-list.json` contains `/tools/stockx-vs-goat-profit-calculator/` exactly once.
13. `tools/manifest.json` contains one structured object with the new slug and URL.

## Localhost smoke
14. `curl -I` to the localhost path returns `200 OK`.
15. Page body contains:
   - `StockX vs GOAT Profit Calculator`
   - `Winner`
   - `StockX payout after fees`
   - `GOAT payout before seller costs`
