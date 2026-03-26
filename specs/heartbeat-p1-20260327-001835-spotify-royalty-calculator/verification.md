# Verification

Executed commands:

```bash
node --check tools/spotify-royalty-calculator/calculator.js
node --test tools/spotify-royalty-calculator/calculator.test.js
node --test tests/usecase/build-scripts.test.mjs
```

Results:

- `node --check tools/spotify-royalty-calculator/calculator.js`
  - Passed.
- `node --test tools/spotify-royalty-calculator/calculator.test.js`
  - Passed all 8 tests, including discovery exact-once assertions.
- `node --test tests/usecase/build-scripts.test.mjs`
  - Partially blocked by an unrelated pre-existing repo issue.
  - `tc_uF_06_tools_manifest_count_matches_tool_directory_count` passed after this change.
  - `tc_uF_07_games_manifest_count_matches_game_directory_count` failed because the current worktree already has `games/manifest.json` count mismatch: actual manifest count `358` vs directory count `359`.

Additional checks:

- Exact-once checks for the new slug passed:
  - `_data/tools-list.json`: 1 matching URL entry
  - `tools/index.html`: 1 slug occurrence
  - `tools/index.md`: 1 slug occurrence
  - `tools/manifest.json`: 1 matching slug + URL entry
- Localhost smoke attempt was blocked by sandbox port binding restrictions.

Localhost blocker:

```text
PermissionError: [Errno 1] Operation not permitted
```

Command that failed:

```bash
python3 -m http.server 4173
```
