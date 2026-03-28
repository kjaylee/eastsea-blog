# Implementation — eBay vs Poshmark Profit Calculator

## Files added
- `tools/ebay-vs-poshmark-profit-calculator/index.html`
- `tools/ebay-vs-poshmark-profit-calculator/calculator.js`
- `tools/ebay-vs-poshmark-profit-calculator/calculator.test.js`

## Files updated
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (regenerated)

## What changed
1. Created a new resale marketplace comparator that composes the shipped eBay and Poshmark calculation engines.
2. Normalized one shared item scenario into platform-specific inputs.
3. Compared winner platform by final net profit, with tie detection and match-price reverse solvers.
4. Added a responsive static page with seller-focused KPI cards, decision details, related links, and copy-ready summary text.
5. Added deterministic test coverage for baseline, winner flip, tie, reverse solves, HTML anchors, and discovery exact-once wiring.

## Key implementation decisions
- eBay uses the same realized item price as Poshmark for apples-to-apples comparison.
- eBay shipping charged / actual shipping / sales tax / promoted rate remain explicit, because they materially affect payout.
- The shipped eBay module has no separate `otherCost` field, so the comparator folds `otherCost` into eBay's packaging-cost lane while keeping Poshmark's native `otherCost` field intact.
