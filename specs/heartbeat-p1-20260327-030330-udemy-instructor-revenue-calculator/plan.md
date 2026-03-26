# Plan

1. Add the required spec bundle for the chosen slug and pin assumptions from official Udemy support docs.
2. Implement calculator logic as a standalone CommonJS module with deterministic exports and no build step.
3. Build one static HTML page with bilingual copy, summary text, channel breakdown, and target-sales helper.
4. Add unit tests for baseline math, validation, target solver, and exact-once discovery wiring.
5. Update `_data/tools-list.json`, `tools/index.html`, `tools/index.md`, and `tools/manifest.json`.
6. Run syntax checks, tests, exact-once slug counts, and localhost smoke if possible.
7. Commit only task files, push the heartbeat branch, and fire the required completion event.
