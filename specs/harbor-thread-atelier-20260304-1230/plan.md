# Plan — harbor-thread-atelier

1. **Scaffold**
   - `games/harbor-thread-atelier/` 생성
   - `index.html`, `logic.mjs`, `app.mjs` 작성
2. **Logic first**
   - 상태 생성/직렬화
   - 런 시작/스텝/정산
   - 병합/계약 선택/Cross-Stitch Dividend 구현
3. **UI wiring**
   - 캔버스 렌더링 + 키/버튼/터치 입력
   - 부두 패널(병합/계약)
   - localStorage 저장
4. **Tests**
   - `tests/unit/harbor-thread-atelier.test.mjs`
   - 최소 8개 케이스
5. **Verification**
   - `node --check` + `node --test`
   - `games/manifest.json` 갱신 및 엔트리 체크
   - 로컬 `curl` 타이틀 스모크
6. **Quality loop**
   - 체크리스트 점수화
   - 90점 미만 시 보완 후 재검증
