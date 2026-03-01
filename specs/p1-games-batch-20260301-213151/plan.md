# Implementation Plan — P1 Batch (3 Games)

## Phase 1) Preflight
1. `ls games/`로 slug 중복 여부 확인
2. `games/manifest.json`의 현재 count/구조 확인
3. 스펙/테스트 케이스 확정 후 구현 시작

## Phase 2) Build (Single-file games)
1. 각 게임 디렉토리 생성
2. 각 `manifest.webmanifest` 생성 (start_url/theme/background 통일)
3. 각 `index.html` 구현
   - 핵심 루프 + 점수/HUD + 재시작
   - 키보드 입력 매핑 + 터치 버튼 UI
   - Web Audio API SFX 유틸 공통 내장
   - localStorage 최고 기록 저장
   - 반응형 네온 다크 UI

## Phase 3) Verification
1. 파일 크기 검증 (`wc -c`) < 500KB
2. 기능 검증
   - `AudioContext` 사용
   - `localStorage` 저장키 존재
   - 터치 이벤트 및 키보드 이벤트 존재
   - `#0a0a1a`, `manifest` 링크, viewport 존재
3. `games/manifest.json` prepend/count/updatedAt 검증

## Phase 4) Gap Analysis Loop (max 3)
- 체크리스트 기준 정량 평가(총 100점)
  - 터치+키보드 15
  - Web Audio API 15
  - localStorage 15
  - 모바일 반응형 15
  - PWA manifest 15
  - 네온 다크(#0a0a1a) 10
  - 파일 <500KB 15
- 90점 미만 시 결함 수정 후 재측정 (최대 3회)

## Phase 5) Git Delivery
1. 변경 파일 점검
2. 커밋: `feat: +3 games (ion-sail-trench-run, cipher-garden-weaver, tempo-smelter-director) — total 167`
3. 원격 push
