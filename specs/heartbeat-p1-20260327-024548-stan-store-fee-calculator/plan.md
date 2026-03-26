# Plan — Stan Store Fee Calculator

1. Document the discovery-gap decision and Stan fee assumptions.
2. Implement `tools/stan-store-fee-calculator/` with:
   - `index.html`
   - `calculator.js`
   - `calculator.test.js`
3. Model Creator vs Creator Pro with processor presets and optional Pro uplift.
4. Update only the required discovery files:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
5. Verify with:
   - `node --check`
   - `node --test`
   - exact-once slug counts
   - localhost smoke if available
6. Commit only task-related files, then attempt push.

## Implementation notes
- Prefer the existing UMD-style calculator module pattern for testability.
- Keep the page in the current utility-first visual language instead of inventing a new aesthetic.
- Build deterministic tests for baseline math, break-even math, invalid inputs, HTML anchors, and discovery exact-once wiring.
