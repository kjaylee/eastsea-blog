# Spec — tool-opportunity-ranker-20260326

## Goal
Create a deterministic ranking utility that scans the `eastsea-blog` tools corpus and outputs the highest-leverage next opportunities for P1 tool mass production.

## Deliverables
1. `scripts/tool-opportunity-ranker.py`
2. `tests/test_tool_opportunity_ranker.py`
3. `scripts/README.md` update documenting usage
4. Generated artifacts:
   - `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json`
   - `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md`
   - `specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.json`
   - `specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md`

## Functional requirements
- Scan every `tools/<slug>/index.html` under the repo.
- Read `tools/manifest.json` and `_data/tools-list.json`.
- For each tool slug, compute at minimum:
  - manifest presence
  - tools-list presence
  - external logic-module presence (`.js` / `.mjs` excluding test files)
  - automated test presence (local tests or repo-level slug tests)
  - analytics include presence
  - title + meta description presence
  - input-control presence
  - inline script length
  - monetization keyword hits
- Produce a ranked JSON/Markdown report with:
  - inventory totals
  - top recommendation
  - top candidate list with reasons
- Keep implementation read-only.

## Non-goals
- No mutation of `tools/manifest.json` or `_data/tools-list.json`
- No rewriting of tool pages
- No deployment or publish step

## Success criteria
- Running the script on `eastsea-blog` completes successfully.
- The script emits both JSON and Markdown outputs.
- The report identifies one explicit next recommendation with evidence.
- Automated tests cover the core ranking path on a temp fixture repo.

## Verification contract
- `python3 -m py_compile scripts/tool-opportunity-ranker.py tests/test_tool_opportunity_ranker.py`
- `python3 tests/test_tool_opportunity_ranker.py`
- `python3 scripts/tool-opportunity-ranker.py --root . --limit 15 --json-out ... --md-out ...`
