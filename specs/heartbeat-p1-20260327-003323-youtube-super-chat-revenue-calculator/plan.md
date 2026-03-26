# Plan — YouTube Super Chat Revenue Calculator

## Execution steps
1. Document the repo-only gap research and final slug choice.
2. Build a standalone calculator module with deterministic math and exportable helpers.
3. Create a bilingual static HTML shell that surfaces KPIs, breakdown, assumptions, and summary copy.
4. Add Node tests for formula correctness, validation, HTML anchors, and exact-once discovery wiring.
5. Update `_data/tools-list.json`, `tools/index.html`, `tools/index.md`, and `tools/manifest.json` exactly once.
6. Run syntax/tests/count checks and local HTTP smoke if possible.
7. Commit task-only files and attempt push.

## Files expected
- `tools/youtube-super-chat-revenue-calculator/index.html`
- `tools/youtube-super-chat-revenue-calculator/calculator.js`
- `tools/youtube-super-chat-revenue-calculator/calculator.test.js`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/*`
- four discovery files only
