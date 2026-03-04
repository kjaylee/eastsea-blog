# Plan — orchard-signal-caravan

1. **Scaffold**
   - `games/orchard-signal-caravan/` 생성
   - `index.html`, `logic.mjs`, `app.mjs` 작성
2. **Logic first**
   - 상태 생성/직렬화
   - 런 시작/스텝/정산
   - 병합/계약 선택
   - Signal Chain Dividend + 단조 패널티 구현
3. **UI wiring**
   - 캔버스 렌더링 + 키/버튼/터치 입력
   - 도크 패널(병합/계약/보너스 상태)
   - localStorage 저장
4. **Tests**
   - `tests/unit/orchard-signal-caravan.test.mjs`
   - 최소 8개 케이스
5. **Verification**
   - `node --check` + `node --test`
   - `bash scripts/build-manifests.sh`
   - manifest slug 엔트리 확인
   - 로컬 `curl` title smoke
6. **Quality loop**
   - Spec/테스트/제약 준수 점수화
   - 90점 미만 시 보완 후 재검증(최대 3회)
