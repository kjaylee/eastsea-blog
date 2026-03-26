# Report — tool-opportunity-ranker-20260326

## Done
Implemented a new backlog-selection utility for the `eastsea-blog` tool corpus:
- `scripts/tool-opportunity-ranker.py`
- `tests/test_tool_opportunity_ranker.py`
- `scripts/README.md` documentation update
- Generated inventory artifacts under `specs/tool-opportunity-ranker-20260326/artifacts/`

## What it found
The repo already contains **681** tool pages, so the mass-production bottleneck is not raw count. The real debt is:
- **190** tools missing from `_data/tools-list.json`
- **585** tools missing external logic files
- **601** tools missing automated tests

Highest-leverage current opportunity identified by the new ranker:
- `marketplace-fee-profit-calculator` (score **124**)
- Why: already exposed in manifest + tools-list, strong monetization intent, rich inline script ready for extraction, but still missing reusable logic and tests.

## Verification evidence
- `python3 -m py_compile ...` → pass
- `python3 eastsea-blog/tests/test_tool_opportunity_ranker.py` → pass
- `python3 eastsea-blog/scripts/tool-opportunity-ranker.py --root eastsea-blog ...` → pass
- `python3 eastsea-blog/scripts/tool-catalog-guard.py --root eastsea-blog --fail-on none ...` → pass

## Relevant paths
- `scripts/tool-opportunity-ranker.py`
- `tests/test_tool_opportunity_ranker.py`
- `scripts/README.md`
- `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json`
- `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md`
- `specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.json`
- `specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md`

## Proposal
Next exact move: take `marketplace-fee-profit-calculator`, extract inline logic into a module, add deterministic tests, and re-run the ranker.

🔴 Red Team:
- [공격 1]: 점수식이 바뀌면 1위 후보가 달라질 수 있다.
- [공격 2]: selector만 있고 auto-fix가 없어 실제 tool debt는 아직 남아 있다.
- [방어/완화]: 현재는 판단 자동화 단계로 충분하며, 점수 근거가 전부 공개되어 있어 다음 사이클에서 쉽게 튜닝 가능하다.
- [합의]: 🟡위험수용
