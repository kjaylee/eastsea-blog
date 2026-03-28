# Plan — 2026-03-28 Tool Analytics Sync

1. Inspect the current guard-defined invariant and confirm the missing slug bucket.
2. Implement `scripts/tool-analytics-sync.py` with:
   - repo scan for `tools/*/index.html`
   - dry-run reporting
   - deterministic `<head>` injection
   - repeatable `--slug` filtering
   - JSON/Markdown artifact output
3. Add focused tests covering:
   - inject-before-first-script path
   - inject-before-`</head>` fallback path
   - idempotent already-present path
   - dry-run no-write behavior
   - filtered write behavior
   - malformed page error path
4. Update `scripts/README.md` with usage and safety notes.
5. Run compile + unit tests.
6. Run dry-run against the real repo and capture artifacts.
7. Apply `--write-missing` to repair live pages.
8. Re-run `tool-catalog-guard.py` and capture proof that `tool_missing_analytics_include` is zero.
9. Score against spec, fix gaps if needed, and leave final report.

## Concrete verification commands
```bash
python3 -m py_compile eastsea-blog/scripts/tool-analytics-sync.py eastsea-blog/tests/test_tool_analytics_sync.py
python3 -m unittest eastsea-blog/tests/test_tool_analytics_sync.py
python3 eastsea-blog/scripts/tool-analytics-sync.py --root eastsea-blog --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.json --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.md
python3 eastsea-blog/scripts/tool-analytics-sync.py --root eastsea-blog --write-missing
python3 eastsea-blog/scripts/tool-catalog-guard.py --root eastsea-blog --fail-on none --max-examples 25 --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.json --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.md
```
