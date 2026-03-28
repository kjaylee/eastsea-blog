# Spec — tool-formula-batch-20260327

## Goal
Add a deterministic batch audit/backfill utility for config-driven EastSea tools.

## Deliverables
1. `scripts/tool-formula-batch.py`
2. `tests/test_tool_formula_batch.py`
3. `scripts/README.md` update
4. Verification artifacts in `specs/tool-formula-batch-20260327/`

## Functional requirements
1. Discover `tool.config.json` files under `tools/` from a provided repo root.
2. Reuse `scripts/tool-formula-scaffold.py` validation/rendering logic via import, not copy-paste.
3. For each config-driven tool, compute presence/missing status for:
   - `index.html`
   - `app.js`
   - `app.test.js`
4. Default mode is **dry-run audit** only.
5. `--write-missing` writes only missing generated files into the tool directory.
6. `--force` allows overwriting generated files explicitly.
7. `--slug <slug>` filters execution to one or more specific tools.
8. Optional `--json-out` writes a machine-readable report.
9. Optional `--md-out` writes a concise Markdown report.
10. Terminal output must include:
    - scanned tool count
    - complete tool count
    - partial tool count
    - missing file totals by type
    - per-tool action summary
11. Exit codes:
    - `0` = audit/write completed successfully
    - `1` = invalid usage, config validation failure, or write failure

## Non-goals
- No manifest mutation
- No `_data/tools-list.json` mutation
- No browser automation
- No new front-end tool pages in this slice

## Safety constraints
- Dry-run must not modify files.
- `--write-missing` without `--force` must preserve already-present generated files.
- The wrapper must remain standalone: Python stdlib only.

## Verification commands
```bash
python3 -m py_compile eastsea-blog/scripts/tool-formula-scaffold.py eastsea-blog/scripts/tool-formula-batch.py eastsea-blog/tests/test_tool_formula_scaffold.py eastsea-blog/tests/test_tool_formula_batch.py
python3 eastsea-blog/tests/test_tool_formula_batch.py
python3 eastsea-blog/scripts/tool-formula-batch.py --root eastsea-blog --json-out eastsea-blog/specs/tool-formula-batch-20260327/artifacts/report.json --md-out eastsea-blog/specs/tool-formula-batch-20260327/artifacts/report.md
```
