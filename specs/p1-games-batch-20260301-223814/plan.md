# Execution Plan — 20260301-223814

## Phase 0) Preflight
1. `ls games/`로 slug 중복 여부 확인
2. `games/manifest.json`의 현재 count(176) 확인

## Phase 1) Spec/Test 선행 (구현 전 완료)
1. `spec.md` 작성
2. `plan.md` 작성
3. `test-cases.md` 작성

## Phase 2) Implementation
1. action 게임 `emberline-skyhook-run` 구현
2. puzzle 게임 `glyph-vat-calibrator` 구현
3. simulation 게임 `harbor-harmonics-dispatch` 구현
4. 각 게임별 `manifest.webmanifest` 작성

## Phase 3) Verification
1. 파일 존재 및 크기 확인 (`<500KB`)
2. 정적 검증
   - touch + keyboard 이벤트 코드
   - Web Audio API (`AudioContext`) 사용
   - localStorage read/write
   - `#0a0a1a` 테마
   - viewport + 반응형 CSS
   - 외부 의존성 없음
3. `games/manifest.json` prepend/count/updatedAt 확인

## Phase 4) Gap Analysis + Auto-fix Loop
- 체크리스트 8개 항목 점수화(각 12.5점, 총 100점)
- 90점 미달 시 최대 3회 자동 수정

## Phase 5) Git Delivery
1. 변경 파일 stage
2. 고정 커밋 메시지로 commit
3. push 후 `git log -1 --oneline`, `git status --short` 검증
