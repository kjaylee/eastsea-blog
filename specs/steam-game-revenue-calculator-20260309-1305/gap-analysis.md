# Gap Analysis — steam-game-revenue-calculator

## Spec checklist
- [x] Single-file static tool implemented at `tools/steam-game-revenue-calculator/index.html`
- [x] Inputs cover units, price, discount, VAT/GST, refund, Steam fee, per-copy support cost, and fixed launch cost
- [x] Outputs cover discounted gross sales, revenue ex tax, refund leakage, Steam fee, net proceeds, total cost, net profit, net margin, take-home per copy, and break-even copies
- [x] KO/EN toggle implemented
- [x] Copy-summary and reset-defaults implemented
- [x] Invalid input shows error and resets outputs
- [x] Live recalculation on `input` / `change`
- [x] `/assets/analytics.js` included
- [x] `TESTABLE_COMPUTE` markers added for deterministic verification
- [x] `tools/index.html` card added
- [x] `tools/manifest.json` regenerated with slug present
- [x] `_data/tools-list.json` entry present and aligned with actual implementation
- [x] Verification artifacts written to `tmp/`

## Remaining issues
1. Repo-wide catalog audit still fails on pre-existing `_data/tools-list.json` coverage gaps (`133` missing entries) outside the scope of this Steam task.
2. `tools/index.html` still has globally stale public tool-count copy unrelated to this change.

## Regression assessment
- No Steam-specific regression found in targeted checks.
- Remaining failures are baseline repository debt, not introduced by this implementation.
