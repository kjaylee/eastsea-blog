# Plan — ugc-whitelisting-attach-rate-roi-calculator

1. Implement `logic.mjs`
   - defaults, validation, ROI equations, summary builder.
2. Implement `index.html`
   - concise copy, input form, KPI cards, responsive CSS.
3. Implement `app.mjs`
   - DOM bindings, render loop, storage, reset/copy, status messaging.
4. Add unit test in `tests/unit/ugc-whitelisting-attach-rate-roi-calculator.test.mjs`.
5. Wire into discovery pages
   - add tool card to `tools/index.html`
   - add bullet to `tools/index.md`
   - regenerate manifests via `bash scripts/build-manifests.sh`.
6. Run verification commands and record evidence.
7. Commit with prefix: `Add monetization tool:`.
