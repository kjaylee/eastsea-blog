# Plan — TikTok Shop Fee Calculator

1. Create tool folder `tools/tiktok-shop-fee-calculator/` with `index.html` + `logic.mjs` (calculation module).
2. Build UI with inputs + output cards + monthly projection section + notes.
3. Implement calculation + validation in `logic.mjs` and wire to DOM events.
4. Add unit test `tests/unit/tiktok-shop-fee-calculator.test.mjs`.
5. Update catalog wiring:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
6. Run verification commands:
   - `node --check tools/tiktok-shop-fee-calculator/logic.mjs`
   - `node --test tests/unit/tiktok-shop-fee-calculator.test.mjs`
   - `python3 -m http.server` + `curl -I http://localhost:8000/tools/tiktok-shop-fee-calculator/`
7. Fill verification.md, gap-analysis.md, quality-loop.md.
