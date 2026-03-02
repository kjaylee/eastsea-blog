# Game Spec — hex-empire

## Core Loop
- Input: 터치/포인터 선택 + 키보드(방향키/WASD/엔터) 타일 점령.
- Action: 행동 포인트(AP) 내에서 육각 타일을 점령해 AI보다 영토 우세 확보.
- Reward: 라운드 클리어, 점수 누적, 업그레이드/다음 라운드 진행.

## Systems
- Progression: 라운드 기반 무한 진행(보드 반경/AI 강도 증가).
- Economy: 점수 + 업그레이드 비용.
- Save/Load: localStorage에 최고 라운드/점수/업그레이드 상태 저장.

## Constraints
- Single HTML: games/hex-empire/index.html
- Mobile-first: full-screen canvas + touch controls
- Asset budget: 단일 파일 25,369 bytes
- Theme: Neon dark #0a0a1a
- PWA: rel="manifest" => /games/manifest.json
