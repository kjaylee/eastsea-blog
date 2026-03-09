# Plan — amazon-fba-profit-calculator

1. Confirm slug uniqueness against existing `tools/`, `_data/tools-list.json`, and `tools/manifest.json`.
2. Implement deterministic business logic in `tools/amazon-fba-profit-calculator/logic.mjs`.
3. Implement browser controller/state persistence in `tools/amazon-fba-profit-calculator/app.mjs`.
4. Build responsive static page in `tools/amazon-fba-profit-calculator/index.html`.
5. Add unit tests for validation, profit sensitivity, break-even outputs, and summary text.
6. Wire discovery surfaces:
   - prepend tool card to `tools/index.html`
   - prepend bullet to `tools/index.md`
   - add entry to `_data/tools-list.json`
7. Regenerate `tools/manifest.json` with `bash scripts/build-manifests.sh`.
8. Run verification commands and save stdout/stderr to `tmp/amazon-fba-profit-calculator-*`.
9. Score quality against spec, fix gaps if score < 90, repeat up to 3 rounds.
10. Commit only repo-local verified changes with a concise git message.
