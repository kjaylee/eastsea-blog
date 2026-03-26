# Verification — tool-opportunity-ranker-20260326

## 1) Python syntax check
```bash
python3 -m py_compile eastsea-blog/scripts/tool-opportunity-ranker.py eastsea-blog/tests/test_tool_opportunity_ranker.py
```
Result: **pass** (`PY_COMPILE_OK` observed during execution)

## 2) Fixture unit tests
```bash
python3 eastsea-blog/tests/test_tool_opportunity_ranker.py
```
Result: **pass**

Observed output:
```text
..
----------------------------------------------------------------------
Ran 2 tests in 0.006s

OK
```

## 3) Real repo opportunity ranking
```bash
python3 eastsea-blog/scripts/tool-opportunity-ranker.py \
  --root eastsea-blog \
  --limit 15 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md
```
Result: **pass**

Observed terminal summary:
```text
tool-opportunity-ranker
totals toolCount=681 manifestCount=681 toolsListCount=498 rankedOpportunityCount=630 missingToolsList=190 missingLogic=585 missingTests=601
top slug=marketplace-fee-profit-calculator score=124 tags=logic-gap,promised-but-underverified,verification-gap recommendation=Externalize logic and add deterministic tests before the next publish cycle.
```

Generated evidence:
- `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json`
- `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md`

## 4) Catalog baseline snapshot
```bash
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 10 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md
```
Result: **pass**

Observed terminal summary:
```text
tool-catalog-guard status=error failOn=none root=/Users/kjaylee/.openclaw/workspace/eastsea-blog
counts filesystem=681 manifestEntries=681 manifestDeclaredCount=681 toolsListEntries=498 landingClaimMin=650 landingStructuredDataCount=664
summary errorIssueTypes=1 warnIssueTypes=8 errorItemCount=190 warnItemCount=319
```

## 5) Targeted diff check
```bash
git -C eastsea-blog status --short scripts/README.md scripts/tool-opportunity-ranker.py tests/test_tool_opportunity_ranker.py specs/tool-opportunity-ranker-20260326
```
Result: **pass**

Observed output:
```text
 M scripts/README.md
?? scripts/tool-opportunity-ranker.py
?? specs/tool-opportunity-ranker-20260326/
?? tests/test_tool_opportunity_ranker.py
```
