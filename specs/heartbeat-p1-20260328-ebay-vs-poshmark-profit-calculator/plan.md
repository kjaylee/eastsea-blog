# Plan — eBay vs Poshmark Profit Calculator

## Files to create
- `tools/ebay-vs-poshmark-profit-calculator/index.html`
- `tools/ebay-vs-poshmark-profit-calculator/calculator.js`
- `tools/ebay-vs-poshmark-profit-calculator/calculator.test.js`

## Files to update
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (via `bash scripts/build-manifests.sh`)

## Implementation steps
1. Build a composition-layer calculator that imports the eBay and Poshmark modules.
2. Normalize one shared resale scenario into platform-specific inputs.
3. Compute winner logic and reverse-solve price parity for both sides.
4. Create a single responsive comparison page using the established resale-comparator layout pattern.
5. Add deterministic test coverage for baseline, edge cases, summary coverage, HTML anchors, and exact-once discovery wiring.
6. Update discovery surfaces and regenerate the manifest.
7. Run verification commands and record evidence.

## Risks to watch
- eBay and Poshmark input models are not identical; normalization must stay explicit.
- Reverse-solve logic can drift if platform assumptions are not held constant.
- Discovery surfaces are large; exact-once updates matter more than pretty ordering.
