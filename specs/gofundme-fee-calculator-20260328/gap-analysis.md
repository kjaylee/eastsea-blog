# Gap Analysis — GoFundMe Fee Calculator

## What shipped
- New tool page under `tools/gofundme-fee-calculator/`
- Deterministic calculator logic and tests
- Manifest wiring via `scripts/build-manifests.sh`
- Localhost smoke verification

## Intentional gaps
1. **Catalog-surface wiring deferred**
   - Not added to `tools/index.html`, `tools/index.md`, or `_data/tools-list.json` in this slice.
   - Reason: those shared files were already dirty from concurrent repo work; broad edits would increase merge risk.

2. **Geography/product variants deferred**
   - No EU/CAD fixed-fee presets.
   - No GoFundMe Pro custom-pricing mode.
   - No charity-specific pricing mode.

3. **Donor-tip modeling deferred**
   - Optional donor tip to GoFundMe is mentioned but not modeled because it does not affect organizer net in the core scenario.

## Next concrete move
If Master wants the slice promoted from manifest-only to fully discoverable, add exact-once catalog entries in `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`, then rerun the same smoke/test suite.
