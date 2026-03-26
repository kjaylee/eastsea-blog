# Plan — tool-opportunity-ranker-20260326

## Execution plan
1. Recover the current corpus truth:
   - manifest count
   - tools-list count
   - catalog-guard debt snapshot
2. Implement `scripts/tool-opportunity-ranker.py`:
   - inventory scan
   - heuristic scoring
   - JSON + Markdown renderers
3. Add temp-fixture unit tests in `tests/test_tool_opportunity_ranker.py`.
4. Document usage in `scripts/README.md`.
5. Generate fresh artifacts under `specs/tool-opportunity-ranker-20260326/artifacts/`.
6. Record verification evidence and gap analysis.

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace
python3 -m py_compile eastsea-blog/scripts/tool-opportunity-ranker.py eastsea-blog/tests/test_tool_opportunity_ranker.py
python3 eastsea-blog/tests/test_tool_opportunity_ranker.py
python3 eastsea-blog/scripts/tool-opportunity-ranker.py \
  --root eastsea-blog \
  --limit 15 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 10 \
  --json-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.json \
  --md-out eastsea-blog/specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md
```

## 🔴 Red Team
- [공격 1]: 점수식이 자의적이면 잘못된 후보를 1위로 올릴 수 있다.
- [공격 2]: 기존 `tool-catalog-guard.py`와 역할이 겹쳐 유지비만 늘어날 수 있다.
- [공격 3]: repo가 이미 dirty 상태라 unrelated 변경과 섞여 보일 수 있다.
- [방어/완화]:
  - 점수 구성요소를 JSON에 전부 노출해 조정 가능하게 한다.
  - `tool-catalog-guard.py`는 무결성, 새 스크립트는 우선순위화로 역할을 분리한다.
  - 변경 파일을 `git status --short`로 국소 확인하고 pycache는 제거한다.
- [합의]: 🟢극복
