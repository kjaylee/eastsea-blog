# Execution Plan — p1-games-batch-20260302-000240

## Phase 0) Preflight
1. `ls games/`로 slug 중복 확인 (3개 모두 신규)
2. `games/manifest.json` 현재 count(188) 확인

## Phase 1) Spec/Test 선행
1. spec.md 작성 (완료)
2. plan.md 작성 (완료)
3. test-cases.md 작성 (구현 전 완료 필수)

## Phase 2) Implementation
1. action 게임: `sonar-trench-sweeper` 구현
2. puzzle 게임: `constellation-knot-forge` 구현
3. simulation 게임: `cloud-harvest-director` 구현
4. 각 게임 `manifest.webmanifest` 작성

## Phase 3) Verification
1. 파일 존재/크기 검사 (`<500KB`)
2. 정적 품질 체크
   - 터치+키보드 이벤트 코드
   - Web Audio API(`AudioContext`) 존재
   - localStorage read/write
   - `#0a0a1a` 테마
   - 모바일 반응형 viewport/CSS
   - 외부 의존성 없음(단일 HTML)
3. `games/manifest.json` prepend/count/updatedAt 검증

## Phase 4) Gap Analysis + Auto-fix Loop
- 체크리스트 7항목 점수화 (각 14.3점, 총 100점)
- 90점 미만 시 최대 3회 자동 수정

## Phase 5) Git Delivery
1. 변경 파일만 stage
2. 커밋 메시지 고정 포맷 사용
3. 원격 push
4. `git log -1 --oneline` + `git status --short` 증빙
