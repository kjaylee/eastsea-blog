# P1R Games Batch Spec — 20260301-181708

## Goal
Ship 3 new HTML5 games in `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`, then prepend these 3 entries to `games/manifest.json` and update total count from 131 → 134.

## New Games (Genre Diversification)

### 1) Chrono Loom Defender (`chrono-loom-defender`)
- Genre: Strategy / Lane Defense
- Core loop:
  - 4개의 시간 레인에서 다가오는 균열(Anomaly)을 선택한 위젯으로 봉합한다.
  - 위젯별 쿨다운과 에너지를 관리해 라운드 생존 시간을 늘린다.
  - Keyboard: `1~4` 레인 선택, `Q/W/E` 위젯 선택, `Space` 즉시 배치.
  - Touch: 레인 버튼 + 위젯 버튼 + 배치 버튼.
- Fail condition: Stability(안정도) 0 도달.
- Persistence: 최고 라운드, 최고 점수 localStorage 저장.

### 2) Quantum Koi Courier (`quantum-koi-courier`)
- Genre: Action / Routing Runner
- Core loop:
  - 수로를 좌우로 전환하며 코이 드론을 조종해 에너지 진주를 수집하고 소용돌이를 회피한다.
  - 속도가 점진적으로 상승해 반응성과 경로 예측이 중요해진다.
  - Keyboard: `←/→` 또는 `A/D` 이동, `Space` 대시.
  - Touch: 좌/우/대시 온스크린 버튼.
- Fail condition: 내구도(HP) 0.
- Persistence: 최고 거리, 최고 콤보 localStorage 저장.

### 3) Vault Echo Cartographer (`vault-echo-cartographer`)
- Genre: Puzzle / Audio-Memory Mapping
- Core loop:
  - 매 라운드 제시되는 초음파 에코 시퀀스를 기억해 동일한 격자 경로를 재현한다.
  - 경로 길이가 길어지며 기억/정확도 난이도가 상승한다.
  - Keyboard: 화살표로 커서 이동, `Enter` 확정, `R` 재생.
  - Touch: 격자 탭 입력 + 재생/확정 버튼.
- Fail condition: 3회 오입력.
- Persistence: 최고 단계, 최고 정확도 점수 localStorage 저장.

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
- Update `count` to 134
- Update `updatedAt` to current ISO timestamp
- Ensure slug uniqueness against existing `games/*` directories
