# P1T Games Batch Spec — 20260301-183837

## Goal
Ship 3 new HTML5 games in `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`, then prepend these 3 entries to `games/manifest.json` and update total count from 137 → 140.

## New Games (Genre Diversification)

### 1) Ferrofluid Sculptor Lab (`ferrofluid-sculptor-lab`)
- Genre: Puzzle / Pattern Sculpting
- Core loop:
  - 5x5 자성 격자에서 셀 강도(0~3)를 조절해 목표 실루엣과 일치시킨다.
  - 단계가 올라갈수록 목표 패턴 복잡도와 move budget 압박이 증가한다.
  - Keyboard: `Arrow Keys/WASD` 커서 이동, `Space/Enter` 셀 강도 변경, `R` 리셋.
  - Touch: 셀 직접 탭 + 리셋/다음 버튼.
- Fail condition: move budget 소진 후 미달성.
- Persistence: 최고 stage, 최고 score 저장.

### 2) Cathedral Bell Conductor (`cathedral-bell-conductor`)
- Genre: Rhythm / Timing Arcade
- Core loop:
  - 4개 종 레인으로 떨어지는 신호를 타이밍 구간에서 타격해 콤보를 유지한다.
  - 정확 판정(Perfect/Good)과 연속 유지로 점수 배율이 상승한다.
  - Keyboard: `A/S/D/F` 타격, `Space` 일시정지/재개.
  - Touch: 4개 벨 버튼 탭.
- Fail condition: miss 누적 8 또는 타이머 종료.
- Persistence: best score, best combo 저장.

### 3) Moth Lantern Ascent (`moth-lantern-ascent`)
- Genre: Action / Endless Survival
- Core loop:
  - 나방 글라이더를 좌우 이동 + 부스트로 조종해 랜턴 에너지 수집, 그림자 장애물 회피.
  - 시간이 지날수록 스크롤 속도/장애물 밀도가 상승.
  - Keyboard: `ArrowLeft/ArrowRight` 이동, `Space` 부스트.
  - Touch: 좌/우 패드 + 부스트 버튼.
- Fail condition: 에너지 0 또는 충돌 3회.
- Persistence: best distance, best score 저장.

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
- Update `count` to 140
- Update `updatedAt` to current ISO timestamp
- Ensure slug uniqueness against existing `games/*` directories
