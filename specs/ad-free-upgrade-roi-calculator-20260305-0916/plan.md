# Plan — ad-free-upgrade-roi-calculator

1. Implement `logic.mjs` with validation, ROI math, break-even guard, and summary generator.
2. Implement mobile-friendly `index.html` UI with concise usage copy and KPI/driver panels.
3. Implement `app.mjs` for live calculation, local persistence, reset, and summary copy.
4. Integrate references:
   - add card in `tools/index.html`
   - add list entry in `tools/index.md`
   - rebuild `tools/manifest.json` via `bash scripts/build-manifests.sh`.
5. Run verification commands:
   - `node --check` for new JS modules
   - model sanity snapshot via `node -e`
   - local HTTP proof (`python3 -m http.server` + `curl -I`).
