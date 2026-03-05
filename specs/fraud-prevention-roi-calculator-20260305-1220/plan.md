# Plan — Fraud Prevention ROI Calculator

1. **Scaffold tool**
   - Create `tools/fraud-prevention-roi-calculator/` with `index.html` and `script.js`.
   - Reuse existing calculator layout + styling conventions.

2. **Implement UI**
   - Input card with 10 fields, copy/reset buttons, error banner, summary textarea.
   - KPI card with key metrics and a compact table for secondary metrics.

3. **Implement logic**
   - Parse/validate inputs, compute ROI metrics per spec.
   - Render outputs with KRW and percent formatting.
   - Handle edge cases (0 fraud orders, negative net impact).

4. **Integrate**
   - Add tool card to `tools/index.html`.
   - Add entry to `tools/index.md`.
   - Add manifest entry in `tools/manifest.json` with index size.

5. **Verification**
   - `node --check tools/fraud-prevention-roi-calculator/script.js`
   - Serve locally and confirm HTTP 200.

6. **Documentation**
   - Fill `verification.md` with command outputs.
   - Complete `gap-analysis.md` with quality loop scoring.
