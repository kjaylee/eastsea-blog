# Implementation Plan — P1z Batch (3 games)

## Phase 1) Preflight
1. `ls games/`로 slug 중복 확인
2. 기존 `games/manifest.json` 구조 확인

## Phase 2) Build
1. 각 게임 디렉토리 생성
2. 각 `manifest.webmanifest` 작성
3. 각 `index.html` 구현
   - HUD + instructions + restart
   - touch/keyboard controls
   - Web Audio API beep/impact tone
   - localStorage best 기록
   - mobile responsive layout

## Phase 3) Verification
1. 파일 크기 측정 (`wc -c`)
2. 정적 체크
   - `rg`로 `AudioContext`, `localStorage`, `touchstart|pointer` 확인
   - `meta viewport`, `theme-color #0a0a1a`, `manifest link` 확인
3. `games/manifest.json` prepend + count/updatedAt 검증
4. Gap Analysis scoring (체크리스트 기반)
   - <90%이면 자동 수정 (최대 3회)

## Phase 4) Git
1. 변경 파일 확인
2. 커밋 `feat: +3 games (vector-vine-swing, prism-port-authority, rune-resonance-smithy) — total 164`
3. push
