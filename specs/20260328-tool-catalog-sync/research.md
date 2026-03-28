# Research — 2026-03-28 Tool Catalog Sync

## Scope
Bring the existing `tool-catalog-reconciler.py` from missing-entry backfill into a practical catalog-sync utility for `eastsea-blog` tool mass production.

## Files inspected
- `scripts/tool-catalog-reconciler.py`
- `scripts/tool-catalog-guard.py`
- `scripts/build-manifests.sh`
- `tests/test_tool_catalog_reconciler.py`
- `tests/integration/manifest-integrity.test.mjs`
- `tests/unit/test-manifest.mjs`
- `tools/index.html`
- `tools/manifest.json`
- `_data/tools-list.json`

## Current behavior
### `tool-catalog-reconciler.py`
- Only backfills missing `_data/tools-list.json` entries.
- Does **not** repair existing stale/generic metadata.
- Does **not** regenerate `tools/manifest.json`.
- Does **not** update landing-page count claims in `tools/index.html`.

### `tool-catalog-guard.py`
Read-only audit already detects the main catalog drift buckets:
- manifest count mismatch
- missing manifest slugs
- missing tools-list entries
- stale landing count claims / JSON-LD count
- generic / blank / suspicious tools-list metadata

## Baseline evidence
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 scripts/tool-catalog-guard.py --root . --fail-on none
```

Observed summary:
- filesystem tools: **727**
- manifest entries: **726**
- tools-list entries: **536**
- landing public count: **709**
- error issue types: **3**
- warn issue types: **8**
- biggest deterministic debt: **195 missing tools-list entries**, **manifest missing `amazon-kdp-royalty-calculator`**, stale landing counts

## Specific data-quality findings
- `tools/index.html` contains multiple hard-coded `709` count claims in:
  - `<title>`
  - meta description / OG / Twitter descriptions
  - JSON-LD `numberOfItems`
  - visible stats badge `총 709개의 도구`
- `tools/manifest.json` is one entry behind filesystem truth.
- `_data/tools-list.json` has mixed shapes (`slug` + `url`, sometimes only `url`), many blank descriptions, and generic titles.

## Opportunity
A single reusable sync script can:
1. regenerate manifest from filesystem truth,
2. enrich / normalize tools-list rows for all filesystem tools,
3. optionally prune extra catalog rows,
4. refresh landing count claims.

This directly supports HEARTBEAT P1 tool mass production because shipping more tools currently increases catalog drift.
