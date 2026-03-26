# Test Cases — tool-opportunity-ranker-20260326

## TC-01 — Static syntax check
**Command**
```bash
python3 -m py_compile eastsea-blog/scripts/tool-opportunity-ranker.py eastsea-blog/tests/test_tool_opportunity_ranker.py
```
**Pass condition**
- Command exits 0.

## TC-02 — Fixture ranking behavior
**Command**
```bash
python3 eastsea-blog/tests/test_tool_opportunity_ranker.py
```
**Pass condition**
- Test suite exits 0.
- Temp fixture proves a manifest-only fee calculator outranks a lower-intent listed calculator.

## TC-03 — Real repo report generation
**Command**
```bash
python3 eastsea-blog/scripts/tool-opportunity-ranker.py \
  --root eastsea-blog \
  --limit 15 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md
```
**Pass condition**
- Command exits 0.
- JSON and Markdown files are written.
- `topRecommendation` is populated.

## TC-04 — Baseline catalog debt snapshot
**Command**
```bash
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 10 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md
```
**Pass condition**
- Command exits 0.
- Guard snapshot is captured for the same repo state.

## TC-05 — Surgical diff confirmation
**Command**
```bash
git -C eastsea-blog status --short scripts/README.md scripts/tool-opportunity-ranker.py tests/test_tool_opportunity_ranker.py specs/tool-opportunity-ranker-20260326
```
**Pass condition**
- Only the expected new/modified files appear in the targeted path list.
