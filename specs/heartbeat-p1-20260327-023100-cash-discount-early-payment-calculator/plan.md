# Plan — cash-discount-early-payment-calculator

1. Lock the scope around seller-side ROI, not APR-only math.
2. Create a static tool under `tools/cash-discount-early-payment-calculator/` with:
   - `index.html`
   - `calculator.js`
   - `calculator.test.js`
3. Keep the formulas deterministic and expose them through a CommonJS-friendly export so `node --test` can reuse the exact production logic.
4. Add only the required discovery wiring:
   - add landing card to `tools/index.html`
   - add markdown list entry to `tools/index.md`
   - normalize/update the existing `_data/tools-list.json` entry
   - rebuild `tools/manifest.json`
5. Verify:
   - `node --check tools/cash-discount-early-payment-calculator/calculator.js`
   - `node --test tools/cash-discount-early-payment-calculator/calculator.test.js`
   - exact-once slug checks
   - localhost smoke if a simple static server is available
6. Commit only task files and attempt push. If push or git metadata write is blocked, record the exact blocker.

