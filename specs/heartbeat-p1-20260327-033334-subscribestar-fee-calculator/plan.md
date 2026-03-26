# Plan — SubscribeStar Fee Calculator

## Build steps
1. Implement pure calculation logic in `calculator.js` with presets, validation, scenario evaluation, break-even math, target-gross math, and summary generation.
2. Build a compact static UI in `index.html` with bilingual labels, core inputs, KPI outputs, detail grid, scenario table, FAQ, and summary textarea.
3. Add `calculator.test.js` coverage for:
   - baseline math
   - subscriber-covers preset
   - international surcharge
   - reserve hold behavior
   - target/break-even math
   - validation
   - HTML anchors
   - exact-once catalog wiring
4. Update only the required discovery files:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
5. Verify with syntax checks, targeted tests, exact-once checks, and localhost smoke if possible.
6. Commit only task-related files and push the branch if git metadata writes are allowed.

## Non-goals
- No unrelated refactors.
- No redesign of the tools index.
- No speculative payout defaults that are not exposed as user-editable assumptions.
