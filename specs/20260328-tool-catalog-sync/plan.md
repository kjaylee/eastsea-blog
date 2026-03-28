# Plan — 2026-03-28 Tool Catalog Sync

1. Extend `scripts/tool-catalog-reconciler.py`
   - add manifest generation from filesystem
   - add full tools-list merge/repair path
   - add landing count sync helpers
   - keep dry-run default
2. Add/expand tests in `tests/test_tool_catalog_reconciler.py`
3. Run focused Python tests
4. Run reconciler in write mode on repo
5. Verify with `tool-catalog-guard.py` and targeted manifest/catalog tests
6. Record quality loop + gap analysis
