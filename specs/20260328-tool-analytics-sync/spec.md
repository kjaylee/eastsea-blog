# Spec — 2026-03-28 Tool Analytics Sync

## Objective
Create a reusable repo utility that audits and repairs missing `/assets/analytics.js` includes across `eastsea-blog/tools/*/index.html`.

## Deliverables
1. New file: `eastsea-blog/scripts/tool-analytics-sync.py`
2. New file: `eastsea-blog/tests/test_tool_analytics_sync.py`
3. Updated docs: `eastsea-blog/scripts/README.md`
4. Verification artifacts in `eastsea-blog/specs/20260328-tool-analytics-sync/`

## Functional requirements
1. CLI requires `--root` pointing at the repo root.
2. Default mode is **dry-run** and performs no file writes.
3. The script scans `tools/*/index.html` only, excluding `tools/index.html`.
4. The script marks a tool as compliant when its HTML already contains `/assets/analytics.js`.
5. `--write-missing` injects exactly one analytics include into each missing page.
6. Injection target must be inside `<head>`.
7. Preferred insertion point: before the first `<script` tag inside `<head>`; fallback: immediately before `</head>`.
8. Re-running after repair must not duplicate the analytics include.
9. `--slug` filter is repeatable and limits scan/write to explicit tool slugs.
10. `--json-out` writes a machine-readable report.
11. `--md-out` writes a Markdown report.
12. Terminal output must include scanned count, missing count, written count, and per-tool action summary.
13. Exit code is `0` on clean success and `1` on usage or write/parse failure.

## Report shape
Each per-tool record should include:
- `slug`
- `path`
- `hasAnalytics` (bool)
- `action` (`present`, `missing`, `written`, `error`)
- optional `error`

Top-level summary should include at least:
- `scanned`
- `missing`
- `written`
- `errors`
- `mode`

## Safety constraints
- Standard library only.
- No writes unless `--write-missing` is passed.
- Preserve existing page content except for inserting the analytics snippet.
- If `<head>`/`</head>` is missing, treat that page as an error and do not mutate it.

## Verification commands
```bash
python3 -m py_compile eastsea-blog/scripts/tool-analytics-sync.py eastsea-blog/tests/test_tool_analytics_sync.py
python3 -m unittest eastsea-blog/tests/test_tool_analytics_sync.py
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.md
python3 eastsea-blog/scripts/tool-analytics-sync.py --root eastsea-blog --write-missing
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 25 \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.md
```

## Acceptance threshold
- Unit tests pass.
- Dry-run report shows the current missing set.
- After `--write-missing`, `tool_missing_analytics_include` count becomes `0` in guard output.
