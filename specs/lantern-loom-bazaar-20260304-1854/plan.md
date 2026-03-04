# Plan — lantern-loom-bazaar

1. **Scaffold**
   - `games/lantern-loom-bazaar/`에 `index.html`, `app.mjs`, `logic.mjs` 생성.
   - `tests/unit/lantern-loom-bazaar.test.mjs` 생성.
2. **Implement logic**
   - 상태 머신(dock/run), lane 이동, phase 전환, spawn/충돌/정산 구현.
   - 계약 시퀀스 판정(정순/역순) + 동일문양 3연속 패널티 구현.
3. **Implement UI**
   - 밝은 톤 HUD + 캔버스 + route/contract controls + 모바일 입력 반영.
4. **Run verification**
   - `node --check` (logic/app)
   - `node --test` (unit)
   - `bash scripts/build-manifests.sh` 및 entry 확인
   - 로컬 서버 `curl`로 페이지 title 확인
5. **Quality loop**
   - spec/test-cases 대비 자체 점수화.
   - 90점 미만이면 최대 3회 보완 반복.
6. **Commit**
   - 신규 게임 관련 파일만 add 후 단일 커밋 생성.
