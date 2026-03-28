# Test Cases — 2026-03-28 Tool Catalog Sync

## Focused unit checks
1. Missing tool page becomes a candidate tools-list entry with normalized slug/title/description/category/tags.
2. Existing bad tools-list row gets repaired from tool HTML instead of staying blank/generic.
3. Manifest generation reflects filesystem slugs and canonical `/tools/<slug>/` URLs.
4. Landing-page count sync updates title/meta/JSON-LD/stats count without touching unrelated structure.

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 -m unittest tests.test_tool_catalog_reconciler
python3 scripts/tool-catalog-reconciler.py --root . --write-tools-list --write-manifest --write-landing-counts --prune-extra
python3 scripts/tool-catalog-guard.py --root . --fail-on none
node --test tests/integration/manifest-integrity.test.mjs tests/unit/test-manifest.mjs
```
