# Plan — Amazon Handmade Fee Calculator

1. Confirm the repo gap and fee assumptions.
   - Verify the slug is missing on disk and in `tools/manifest.json`.
   - Reuse the existing `tools-list` and `tools/index.md` wording as the discovery baseline.

2. Implement the calculation engine.
   - Put pure math + validation in `calculator.js`.
   - Expose Node-compatible exports for tests.
   - Keep browser wiring in the same file to match repo patterns.

3. Build the page.
   - Create `index.html` with compact fee-calculator UI.
   - Add bilingual strings, KPI outputs, breakdown table, and assumptions copy.

4. Add deterministic tests.
   - Formula baseline with standard 15% fee.
   - Low-price scenario where the $1 minimum fee binds.
   - First-month fee scenario.
   - Invalid-input guards.
   - Exact-once discovery assertions.

5. Update exact discovery files only.
   - Add one card to `tools/index.html`.
   - Keep the existing `tools/index.md` and `_data/tools-list.json` exact-once entries intact unless correction is required.
   - Add one manifest entry to `tools/manifest.json`.

6. Verify.
   - `node --check`
   - `node --test`
   - exact-once slug counts
   - localhost smoke if possible

7. Commit and push only task-related files if git metadata and network allow it.
