# Gap Analysis — 2026-03-28 Tool Analytics Sync

## Spec coverage

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | `--root` required | ✅ | argparse enforced |
| 2 | default dry-run | ✅ | no writes unless `--write-missing` |
| 3 | scan `tools/*/index.html` only | ✅ | `glob("*/index.html")` |
| 4 | compliance = contains `/assets/analytics.js` | ✅ | shared invariant with `tool-catalog-guard.py` |
| 5 | `--write-missing` repairs missing pages | ✅ | 21 live pages repaired |
| 6 | inject inside `<head>` | ✅ | insert-before-first-script or before `</head>` |
| 7 | idempotent | ✅ | post-repair dry-run shows `missing=0`, `written=0` |
| 8 | repeatable `--slug` filter | ✅ | covered by tests |
| 9 | `--json-out` output | ✅ | before/after reports captured |
| 10 | `--md-out` output | ✅ | before/after reports captured |
| 11 | terminal summary includes counts | ✅ | scanned/missing/written/errors printed |
| 12 | exit `0` success / `1` failures | ✅ | malformed-page and unknown-slug tests cover failure paths |
| 13 | malformed `<head>` stays untouched and errors | ✅ | dry-run error path added and tested |

## Remaining repo gaps (not caused by this slice)
1. `tool-catalog-guard.py` still reports `tools_list_missing_entries count=1` for `gofundme-fee-calculator`.
2. Landing page public tool counts remain stale in several copy locations and JSON-LD.
3. This utility does not enforce analytics ordering beyond deterministic insertion; it only guarantees presence and idempotency.

## Match rate
**13 / 13 requirements met = 100%**

## Conclusion
The analytics-repair bottleneck is closed. Remaining guard issues are catalog/count sync work, not analytics coverage work.
