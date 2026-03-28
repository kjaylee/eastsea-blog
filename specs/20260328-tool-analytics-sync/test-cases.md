# Test Cases — 2026-03-28 Tool Analytics Sync

## Static validation
```bash
python3 -m py_compile eastsea-blog/scripts/tool-analytics-sync.py eastsea-blog/tests/test_tool_analytics_sync.py
```

## Unit tests
```bash
python3 -m unittest eastsea-blog/tests/test_tool_analytics_sync.py
```

## Real-repo dry-run
```bash
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.md
```
Expected:
- exit `0`
- summary includes non-zero `missing`
- artifacts are written

## Real-repo repair
```bash
python3 eastsea-blog/scripts/tool-analytics-sync.py --root eastsea-blog --write-missing
```
Expected:
- exit `0`
- only missing tool pages are modified
- repeated run reports `written=0`

## Guard verification
```bash
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 25 \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.md
```
Expected:
- `tool_missing_analytics_include count=0`
- any remaining guard issues are unrelated and explicitly noted
