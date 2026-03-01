# P1 Games Batch Plan — 20260301-231947

## Phase 1 — Precheck
1. `ls games/`로 slug 중복 검사
2. 장르 겹침 최소화 (리듬/액션/시뮬레이션)

## Phase 2 — Build (Spec-driven)
1. `games/neon-nocturne-switchboard/`
   - 4레인 신호 라우팅 리듬 루프 구현
   - 키보드(A/S/D/F) + 터치(4버튼)
2. `games/chrono-sandglass-smuggler/`
   - 레인 이동 + freeze 에너지 기반 회피 루프
   - 키보드(←/→/Space) + 터치(좌/정지/우)
3. `games/auric-pollen-panic/`
   - 3구역 운영(수분/꽃가루/병해) triage 루프
   - 키보드(1/2/3 + Q/W/E) + 터치 액션 버튼

## Phase 3 — PWA
- 각 게임별 `manifest.webmanifest` 생성
- `background_color`, `theme_color`를 `#0a0a1a`로 고정

## Phase 4 — Verification + Gap Analysis
1. 파일 크기 측정 (`<500KB`)
2. 정적 점검(키보드/터치/WebAudio/localStorage/반응형/PWA/테마)
3. Gap Analysis 스코어링(100점 만점)
4. 90점 미만 항목 자동 수정 (최대 3회)

## Phase 5 — Registry + Git
1. `games/manifest.json`에 3개 prepend
2. `count`/`updatedAt` 갱신
3. 변경 파일만 stage
4. commit message: `feat: +3 games (slugs) — total 185`
5. `git push origin master`
