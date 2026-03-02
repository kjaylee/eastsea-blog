# Game Spec — chain-reaction

## Core Loop
- Input: 터치/포인터 지점 지정 또는 키보드 조준(방향키/WASD) 후 Space/Enter.
- Action: 단 1회 폭발 시작점으로 연쇄 반응을 유도해 목표 제거 수 달성.
- Reward: 레벨 클리어, 다음 레벨 해금, 최소 탭(best taps) 기록.

## Systems
- Progression: 12레벨(최소 5레벨 조건 초과 충족), 레벨별 오브 수/목표 비율 상승.
- Economy: 탭 효율(best taps) 기반 성과 추적.
- Save/Load: localStorage(STORAGE_KEY: chain_reaction_progress_v1)에 최고 해금/베스트 저장.

## Constraints
- Single HTML: games/chain-reaction/index.html
- Mobile-first: 반응형 캔버스 + 버튼 UI
- Asset budget: 단일 파일 40,190 bytes
- Theme: Neon dark #0a0a1a
- PWA: rel="manifest" => /games/manifest.json (신규 추가)
