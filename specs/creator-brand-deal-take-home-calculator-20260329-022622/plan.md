# Plan — Creator Brand Deal Take-home Calculator

## Build sequence
1. Create a pure logic module with validation, forward calculation, target-net reverse solver, and summary builder.
2. Build a static HTML page that makes the “gross quote vs creator net” difference obvious at first glance.
3. Add a thin browser app layer for input parsing, formatting, copy/reset actions, and live status.
4. Add deterministic tests for:
   - validation failure paths
   - baseline arithmetic
   - reverse-solver behavior
   - impossible-target handling
   - summary text
   - catalog exact-once wiring
5. Wire the tool into discovery files and regenerate `tools/manifest.json`.
6. Record verification evidence and remaining gaps in the timestamped spec folder.

## Implementation notes
- Use `logic.mjs` + `app.mjs` to keep calculator math testable and reusable.
- Keep money units same-currency and explicit in the UI rather than pretending cross-currency support exists.
- Prefer a quote-review layout over a generic form card so the tool feels negotiation-oriented.

## Risks to manage
- Overlap risk with existing creator-rate pages.
  - Mitigation: keep this page centered on net take-home and reverse solving, not audience-based rate discovery.
- Solver honesty risk when fees approach 100%.
  - Mitigation: validate combined percentage deductions and return unavailable states rather than misleading numbers.
- Catalog drift risk.
  - Mitigation: exact-once test plus manifest rebuild.
