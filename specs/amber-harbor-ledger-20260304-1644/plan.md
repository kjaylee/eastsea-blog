# Plan — amber-harbor-ledger

1. `logic.mjs` 구현
   - 상태 모델, 이동/모드전환, 토큰 스폰/충돌, 정산, 병합, 계약 선택 함수 작성
2. `test-cases.md` 기준 단위테스트 작성
   - 충돌/경제/고유메카닉 포함 8개+ 케이스
3. `index.html` + `app.mjs` 구현
   - HUD, 캔버스 렌더, 모바일/키보드 조작, localStorage 연결
4. 검증 실행
   - `node --check` 2개
   - `node --test` 1개
   - manifest 재생성 + 엔트리 점검
   - local server + `curl` title 확인
5. 품질 루프
   - 스펙 점수화(<90 시 보완) 최대 3회
6. 커밋
   - 게임/테스트/스펙 산출물만 스테이징하여 단일 커밋
