# Plan — LaunchPass Fee Calculator

1. Create spec package for discovery rationale, formulas, tests, and risks.
2. Build `tools/launchpass-fee-calculator/calculator.js`
   - UMD export
   - defaults, presets, validation, pure `calculate()` logic
3. Build `tools/launchpass-fee-calculator/calculator.test.js`
   - exact arithmetic checks
   - invalid input rejection
   - discovery exact-once checks
4. Build `tools/launchpass-fee-calculator/index.html`
   - bilingual UI
   - KPI cards, detail grid, comparison table, summary copy
5. Patch discovery files surgically
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
6. Verify with `node --check`, `node --test`, exact-once counts, and localhost smoke.
7. Commit only task files and push branch if git metadata writes succeed.

## Boundaries
- exactly one tool
- no unrelated refactors
- no catalog regeneration
- no changes outside the requested tool/spec/discovery surface
