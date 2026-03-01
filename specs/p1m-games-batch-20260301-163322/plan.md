# Implementation Plan — p1m-games-batch-20260301-163322

## Phase 1: Preflight
1. `ls games/`로 slug 충돌 확인
2. `games/manifest.json` 구조/필드 확인

## Phase 2: Build (Spec/Test 이후)
1. 게임 3종 디렉토리 생성
2. 각 `index.html` 구현
   - HUD + 시작/종료 오버레이
   - 키보드/터치 입력
   - Web Audio API SFX
   - localStorage best 기록
   - 모바일 반응형, #0a0a1a 네온 다크
3. 각 `manifest.webmanifest` 작성

## Phase 3: Verify
1. 정적 체크
   - 파일 존재
   - 파일 크기 < 500KB
   - 키보드 이벤트/포인터 이벤트/Web Audio/localStorage 코드 존재
2. 체크리스트 점수화 (100점)
3. 90점 미만 시 자동 수정 (최대 3회)

## Phase 4: Integrate
1. `games/manifest.json`에 3개 엔트리 prepend
2. `count` 116, `updatedAt` 현재 ISO로 갱신

## Phase 5: Git
1. 변경사항 확인
2. 커밋: `feat: +3 games (foglift-freight-signal, lumen-weave-atelier, meteor-noodle-kiosk) — total 116`
3. push
