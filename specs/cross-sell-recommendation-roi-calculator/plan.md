# Plan — Cross-sell Recommendation ROI Calculator

1. Create new tool folder `tools/cross-sell-recommendation-roi-calculator/` with `index.html`, `app.mjs`, `logic.mjs`.
2. Implement validation + ROI math in `logic.mjs`.
3. Implement DOM wiring, rendering, localStorage, summary copy in `app.mjs`.
4. Build responsive UI and concise copy in `index.html`.
5. Add tool card to `tools/index.html` and bullet to `tools/index.md`.
6. Regenerate `tools/manifest.json` via `scripts/build-manifests.sh`.
7. Verification: `node --check` on new modules, local HTTP 200 check, then record verification + gap analysis.
