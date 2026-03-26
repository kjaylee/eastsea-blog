# Plan

1. Confirm the slug is absent and verify Skool’s current official fee rules.
2. Create the required spec bundle for this heartbeat task.
3. Implement `tools/skool-fee-calculator/` with extracted logic and deterministic tests.
4. Update only:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
5. Verify with `node --check`, `node --test`, exact-once slug checks, and localhost smoke if possible.
6. Commit only task files, push the branch, and run the required completion command.
