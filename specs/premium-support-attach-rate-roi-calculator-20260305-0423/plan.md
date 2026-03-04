# Plan — premium-support-attach-rate-roi-calculator

1. Build calculator logic module with validation + ROI formulas + summary builder.
2. Build responsive UI with concise usage copy and KPI/result table.
3. Wire DOM controller (`app.mjs`) for live updates, local persistence, reset, copy summary.
4. Add unit test suite for validation, monotonic economic behavior, edge guards, summary content.
5. Wire discoverability references:
   - add card to `tools/index.html`
   - rebuild `tools/manifest.json` using repo script.
6. Run verification commands:
   - syntax checks (`node --check`)
   - test run (`node --test`)
   - manifest build script
   - local HTTP 200 proof via temporary server + `curl`.
7. Record verification + gap analysis and commit with required prefix.
