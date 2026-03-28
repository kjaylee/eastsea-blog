# Quality Loop — ThriveCart vs SamCart Cost Calculator

## Round 1
- **Score:** 93 / 100
- **Why not 100:** public pricing detail is intentionally incomplete for some live plan nuances, so the tool relies on editable assumptions for ThriveCart upfront price and optional SamCart revenue-linked surcharge.
- **Auto-fix performed:** fixed a `normalizeInput()` bug where empty/undefined values could override defaults with `NaN` during direct API usage.
- **Pass criteria:** met. Core spec items shipped, unit tests passed, manifest rebuilt, and local HTTP verification succeeded.

## Final quality decision
- **Status:** PASS
- **Confidence:** High for shipped scope (one-time vs monthly checkout-platform economics with transparent assumptions).