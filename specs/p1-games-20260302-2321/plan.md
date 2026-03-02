# Implementation Plan — p1-games-20260302-2321

## Phase 0. Preflight
- [x] 작업 디렉토리 확인: `$WORKSPACE/eastsea-blog`
- [x] 기존 slug 중복 검사 (`ls games/`)
- [x] 신규 slug 확정
  - pulp-route-allocator
  - tether-shield-ward

## Phase 1. Spec/Test 선행
- [x] research.md 작성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] test-cases.md 작성

## Phase 2. 구현
1) `games/pulp-route-allocator/index.html`
- Canvas 2D 전용 렌더/입력
- 펄프 배분 전략 루프 (배분 → 결산 → 다음 날)

2) `games/tether-shield-ward/index.html`
- Canvas 2D 전용 렌더/입력
- 테더 실드 조작 + 적 투사체 반사 디펜스

## Phase 3. 검증
- 기능 검증: 타이틀 → 플레이 → 종료/재시작
- 체크리스트
  - LittleJS `<script>` 포함, engineInit 없음
  - 모바일 레터박스
  - 입력 (터치/키보드)
  - 파일 크기 < 500KB

## Phase 4. 배포
- `scp` 업로드 + `chmod` + `curl` 확인
- MiniPC `/var/www/games/games-list.json`에 2개 추가 후 `index.html` GAMES 배열 동기화 (286 → 288)
- git commit/push
