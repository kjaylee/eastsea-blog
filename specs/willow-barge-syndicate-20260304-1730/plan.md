# Plan — willow-barge-syndicate

1. **Scaffold files**
   - `games/willow-barge-syndicate/{index.html,app.mjs,logic.mjs}`
   - `tests/unit/willow-barge-syndicate.test.mjs`
2. **Logic implementation**
   - 상태 생성/저장, run lifecycle, lane/mode 입력, spawn/collision, settle/merge/route.
   - unique pattern evaluator(Canal Relay Bonus / Silt Lock Penalty) 구현.
3. **UI implementation**
   - 모바일 우선 라이트 테마 HUD + canvas + 입력 버튼.
   - pattern state 및 결과 문구 노출.
4. **Test implementation**
   - 초기화/이동/모드/수집/충돌/병합/경제/고유 메카닉 9케이스.
5. **Verification**
   - `node --check`, `node --test`, `build-manifests`, slug 등록 체크, `curl` title 스모크.
6. **Quality loop**
   - 90점 이상 달성 여부 점검 후 gap-analysis 기록.
7. **Commit**
   - 신규 게임 관련 파일만 pathspec add 후 커밋.
