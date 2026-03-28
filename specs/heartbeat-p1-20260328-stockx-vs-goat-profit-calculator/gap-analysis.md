# Gap Analysis — StockX vs GOAT Profit Calculator

## Closed gaps this run
- New slug created and wired into discovery artifacts.
- Comparison math implemented by composing existing StockX + GOAT fee engines instead of duplicating fee logic.
- Deterministic tests now cover default math, low-price floor behavior, GOAT custom override, tie handling, unreachable GOAT match-price state, HTML anchors, and exact-once discovery wiring.
- Localhost smoke proved the page is actually served.

## Remaining deliberate gaps
- No live scraping of current StockX / GOAT policy docs; v1 intentionally relies on the already-shipped public baselines inside the repo.
- No tax / FX / regional fee variants.
- No screenshot evidence; verification is CLI-based in this run.
- English-first UI only.

## Why these gaps are acceptable
- The task target was one surgical, value-creating slice in one run.
- The highest-risk failure mode was formula inconsistency; composition of existing tested modules reduces that risk.
- The remaining gaps are scope extensions, not blockers for v1 usefulness.

## Next obvious slice
If Master wants a follow-up, the clean next move is:
1. add a marketplace selector for region variants (US / CA / custom), or
2. build a second comparator lane with the same composition pattern (e.g. eBay vs Mercari, Grailed vs GOAT, or StockX vs Whatnot).
