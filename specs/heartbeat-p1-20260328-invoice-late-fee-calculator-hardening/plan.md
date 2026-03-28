# Plan — Invoice Late Fee Calculator Hardening

1. Read current page and confirm catalog gaps.
2. Extract formula + validation into `tools/invoice-late-fee-calculator/calculator.js`.
3. Replace inline formula logic in `index.html` with calls to the external calculator module.
4. Add `tools/invoice-late-fee-calculator/calculator.test.js` covering baseline math, grace behavior, invalid input, and summary output.
5. Backfill discovery entries:
   - `_data/tools-list.json`
   - `tools/index.md`
6. Rebuild `tools/manifest.json` with `bash scripts/build-manifests.sh`.
7. Verify with:
   - `node --check tools/invoice-late-fee-calculator/calculator.js`
   - `node --test tools/invoice-late-fee-calculator/calculator.test.js`
   - exact-once catalog check via Python
   - local HTTP smoke via `python3 -m http.server` + `curl`
8. Record verification, gap analysis, and quality loop results.
