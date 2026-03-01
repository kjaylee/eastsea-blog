# P1S Games Batch Spec — 20260301-1822

## Goal
Ship 3 new HTML5 games in `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`, then prepend these 3 entries to `games/manifest.json` and update total count from 134 → 137.

## New Games (Genre Diversification)

### 1) Orbital Triage Command (`orbital-triage-command`)
- Genre: Strategy / Real-time Resource Management
- Core loop:
  - 4개 우주 모듈(reactor, oxygen, comms, shield)의 손상도가 시간에 따라 증가한다.
  - 플레이어는 모듈 선택 후 드론 액션으로 긴급 수리/안정화해 전체 station integrity를 지킨다.
  - Keyboard: `1~4` 모듈 선택, `Q/W/E` 액션 선택, `Space` 실행.
  - Touch: 모듈 버튼 + 액션 버튼 + 실행 버튼.
- Fail condition: Station integrity 0.
- Persistence: best wave, best score localStorage 저장.

### 2) Frostbite Freight Fix (`frostbite-freight-fix`)
- Genre: Puzzle / Ice Slide Logistics
- Core loop:
  - 얼음 격자에서 화물 드론을 미끄러뜨려 모든 화물을 목표 도크로 밀어 넣는다.
  - 드론은 입력 방향으로 장애물 전까지 연속 이동하며 경로 계획이 핵심.
  - Keyboard: `Arrow Keys/WASD` 이동, `R` 리셋, `N` 다음 스테이지.
  - Touch: 방향 패드 + 리셋 버튼.
- Fail condition: move cap 초과 시 stage fail (재시도 가능).
- Persistence: highest cleared stage, best efficiency score 저장.

### 3) Mythic Postal Panic (`mythic-postal-panic`)
- Genre: Arcade / Pattern Matching
- Core loop:
  - 컨베이어를 타고 들어오는 소포에 표시된 룬(4종)을 제한 시간 내 같은 룬 스탬프로 처리한다.
  - 연속 정답으로 콤보 배율이 올라가며 시간이 짧아져 난이도 상승.
  - Keyboard: `A/S/D/F` 룬 스탬프, `Space` pause/resume.
  - Touch: 4개 룬 버튼 탭.
- Fail condition: missed parcels 5.
- Persistence: best score, best combo localStorage 저장.

## Mandatory Constraint Checklist
1. Touch + keyboard input support (all 3 games)
2. Web Audio API interaction SFX (all 3)
3. localStorage persistence for records (all 3)
4. Mobile responsive UI (360x800 and 390x844 usable)
5. PWA `manifest.webmanifest` per game
6. Neon dark palette including `#0a0a1a`
7. Single-file implementation for game logic (`index.html` only, no external deps)
8. `index.html` file size < 500KB each

## Manifest Update Requirements
- Update `games/manifest.json`
- Prepend 3 new game entries at the very top of `games` array
- Update `count` to 137
- Update `updatedAt` to current ISO timestamp
- Ensure slug uniqueness against existing `games/*` directories
