# Verification — 2026-03-28 Tool Analytics Sync

## 1) Static validation
Command:

```bash
python3 -m py_compile eastsea-blog/scripts/tool-analytics-sync.py eastsea-blog/tests/test_tool_analytics_sync.py
```

Result:
- pass

## 2) Unit tests
Command:

```bash
python3 -m unittest eastsea-blog/tests/test_tool_analytics_sync.py
```

Result:
- `Ran 9 tests`
- `OK`

Covered paths:
- inject before first `<script>`
- inject before `</head>` fallback
- idempotent already-present path
- dry-run no-write path
- filtered write path
- malformed `<head>` error path
- unknown slug exit path

## 3) Real repo dry-run baseline
Command:

```bash
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-before.md
```

Observed summary:
- scanned: `732`
- missing: `21`
- written: `0`
- errors: `0`

Artifacts:
- `artifacts/report-before.json`
- `artifacts/report-before.md`

## 4) Live repair
Command:

```bash
python3 eastsea-blog/scripts/tool-analytics-sync.py --root eastsea-blog --write-missing
```

Observed summary:
- scanned: `732`
- missing: `21`
- written: `21`
- errors: `0`

Examples repaired:
- `amazon-kdp-royalty-calculator`
- `baking-ingredient-converter`
- `email-auth-record-builder`
- `printful-profit-calculator`
- `upwork-fee-calculator`

Spot checks:

```bash
grep -n "/assets/analytics.js" eastsea-blog/tools/amazon-kdp-royalty-calculator/index.html
grep -n "/assets/analytics.js" eastsea-blog/tools/baking-ingredient-converter/index.html
grep -n "/assets/analytics.js" eastsea-blog/tools/upwork-fee-calculator/index.html
```

Observed:
- `amazon-kdp-royalty-calculator` line `19`
- `baking-ingredient-converter` line `142`
- `upwork-fee-calculator` line `19`

## 5) Guard verification
Command:

```bash
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 25 \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/guard-after.md
```

Observed summary:
- `errorIssueTypes=1`
- `warnIssueTypes=2`
- remaining error: `tools_list_missing_entries count=1` (`gofundme-fee-calculator`)
- remaining warnings:
  - `landing_stale_count_claims count=7`
  - `landing_structured_data_mismatch count=1`
- **`tool_missing_analytics_include` no longer appears**

Artifacts:
- `artifacts/guard-after.json`
- `artifacts/guard-after.md`

## 6) Idempotency proof
Command:

```bash
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --json-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-after.json \
  --md-out eastsea-blog/specs/20260328-tool-analytics-sync/artifacts/report-after.md
```

Observed summary:
- scanned: `732`
- missing: `0`
- written: `0`
- errors: `0`

Artifacts:
- `artifacts/report-after.json`
- `artifacts/report-after.md`
