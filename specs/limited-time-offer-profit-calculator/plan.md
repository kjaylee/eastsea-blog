# Plan — Limited-time Offer Profit Calculator

1. Create tool folder with `index.html`, `app.mjs`, `logic.mjs` using ROI calculator pattern and mobile grid.
2. Implement calculations + validation in `logic.mjs`, formatting + UI wiring in `app.mjs` (localStorage + summary copy).
3. Add portal entries in `tools/index.html` and `tools/index.md`.
4. Regenerate `tools/manifest.json` via `bash scripts/build-manifests.sh`.
5. Verification:
   - `node --check tools/limited-time-offer-profit-calculator/logic.mjs`
   - `node --check tools/limited-time-offer-profit-calculator/app.mjs`
   - `python3 -m http.server 8000` then `curl -I http://localhost:8000/tools/limited-time-offer-profit-calculator/` (expect HTTP 200)
