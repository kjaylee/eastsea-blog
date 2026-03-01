# Execution Plan — p1x-games-batch-20260301-200211

## Phase 0) Preflight
1. `ls games/`로 slug 중복 최종 확인
2. 현재 `games/manifest.json` count/updatedAt 확인

## Phase 1) Spec/Test 선행
1. spec.md 작성 (완료)
2. test-cases.md 작성 (구현 전 완료 필수)

## Phase 2) Implementation
1. 게임 A(action): plasma-net-defender 구현
2. 게임 B(puzzle): lunar-terrace-irrigator 구현
3. 게임 C(strategy): market-echo-arbitrage 구현
4. 각 게임별 `manifest.webmanifest` 작성

## Phase 3) Verification
1. 파일 존재/크기 검사 (`<500KB`)
2. 정적 품질 체크
   - 터치+키보드 이벤트 코드 존재
   - Web Audio API(`AudioContext`) 존재
   - localStorage read/write 존재
   - `#0a0a1a` 포함
   - viewport 반응형 메타/CSS 확인
3. `games/manifest.json` prepend/count/updatedAt 검증

## Phase 4) Gap Analysis + Auto-fix Loop
- 체크리스트 7항목 점수화 (각 14.3점, 총 100점)
- 90점 미만이면 최대 3회 자동 수정

## Phase 5) Git Delivery
1. 변경 파일 스테이징
2. 커밋 메시지 고정 포맷 사용
3. 원격 push
4. `git log -1 --oneline` / `git status`로 결과 증빙
