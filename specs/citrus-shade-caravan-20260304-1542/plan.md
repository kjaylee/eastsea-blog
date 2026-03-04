# Plan — citrus-shade-caravan

1. 상태 기계/경제 로직 구현 (`games/citrus-shade-caravan/logic.mjs`)
   - run/dock 전이, 충돌, 스폰, 정산, 병합, 계약
   - Shade Swap Ledger + crowd penalty 포함
2. 모바일 UI/캔버스 렌더 구현 (`games/citrus-shade-caravan/index.html`, `app.mjs`)
3. 단위 테스트 8개 작성 (`tests/unit/citrus-shade-caravan.test.mjs`)
4. 검증 실행
   - `node --check` 2종
   - `node --test` 1종
   - `bash scripts/build-manifests.sh`
   - route/title `curl` 스모크
   - unique mechanic node 스냅샷
5. 품질 루프 점수화 후 필요 시 보정
