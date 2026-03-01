# Execution Plan — p1-games-batch-20260301-214119

## Phase 0) Preflight
1. `ls games/`로 slug 중복 여부 확인
2. `games/manifest.json` 현재 `count: 167` 확인

## Phase 1) Spec/Test 선행
1. spec.md 작성
2. plan.md 작성
3. test-cases.md 작성 (구현 전 완료)

## Phase 2) Implementation
1. `sunken-signal-kite` 구현 (action)
2. `teahouse-rush-director` 구현 (simulation)
3. `parity-lens-workshop` 구현 (puzzle)
4. 각 게임 `manifest.webmanifest` 작성

## Phase 3) Verification
1. 파일 존재/크기 검사 (`<500KB`)
2. 정적 요구사항 검사
   - 키보드 + 터치 이벤트
   - Web Audio API(`AudioContext`)
   - localStorage read/write
   - `#0a0a1a` 테마
   - 반응형 viewport/CSS
   - 외부 의존성 없음
3. `games/manifest.json` prepend/count/updatedAt 검증

## Phase 4) Gap Analysis + Auto-fix Loop
- 체크리스트 7항목(각 14.3점) 총점 산출
- 90점 미만 시 최대 3회 자동 수정

## Phase 5) Git Delivery
1. 변경 파일 선별 stage
2. 커밋 메시지 고정 포맷 사용
3. push 후 `git log -1 --oneline`, `git status --short`로 증빙
