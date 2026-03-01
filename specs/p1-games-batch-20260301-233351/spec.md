# P1 Games Batch Spec — 20260301-233351

## Objective
신규 HTML5 게임 3종을 `games/{slug}/`에 제작하고, `games/manifest.json`에 prepend 등록한다.

## New Game Slugs (unique)
1. `neon-kite-telegraph` — Action / reflex
2. `quantum-kimchi-courier` — Strategy / management
3. `tidal-signal-cartographer` — Puzzle / memory-navigation

## Global Constraints
- 각 게임은 **단일 `index.html`** (외부 JS/CSS/asset 의존성 없음)
- `manifest.webmanifest` 포함
- 모바일 우선 반응형, 배경 톤 `#0a0a1a` 기반 네온 다크
- 입력: 터치 + 키보드 모두 지원
- 사운드: Web Audio API 기반 효과음
- 저장: `localStorage` 최고 점수/기록 저장
- 파일 크기: 각 `index.html` 500KB 미만

## Game Specs

### 1) Neon Kite Telegraph
- Core loop: 바람 방향이 바뀌는 하늘에서 연(kite)을 좌우 조종해 신호 비콘을 연속 수집, 드론 장애물 회피
- Input:
  - Keyboard: `←/→` 이동, `Space` dash
  - Touch: 좌/우 패드 + Dash 버튼
- Reward:
  - 비콘 수집 시 점수 및 combo 상승
  - near-miss 회피 시 보너스
- Fail state:
  - 내구도 0 또는 시간 종료
- Persistence:
  - 최고 점수 localStorage 저장

### 2) Quantum Kimchi Courier
- Core loop: 3개 구역(발효/포장/배송)의 수요를 실시간 배분으로 안정화
- Input:
  - Keyboard: `1/2/3` 구역 선택, `Q/W/E` 액션(Boost/Cool/Ship)
  - Touch: 구역 버튼 + 액션 버튼
- Reward:
  - 주문 처리 성공 시 수익/신뢰 증가
  - 콤보 처리 시 보너스 수익
- Fail state:
  - 신뢰도 0 또는 폐기율 임계치 초과
- Persistence:
  - 최고 웨이브(shift) 또는 최고 수익 localStorage 저장

### 3) Tidal Signal Cartographer
- Core loop: 5x5 해도 격자에서 시작점→도착점 신호 경로를 제한 턴 내 완성
- Input:
  - Keyboard: 화살표 이동, `Enter` 타일 확정, `R` 리셋
  - Touch: 타일 탭으로 경로 확정, 리셋 버튼
- Reward:
  - 스테이지 클리어 시 다음 라운드(난이도 증가)
- Fail state:
  - 허용 턴 소진 또는 잘못된 연결 3회
- Persistence:
  - 최고 라운드 localStorage 저장

## Manifest Update Rules
- `games/manifest.json`
  - `count`: 185 → 188
  - `updatedAt`: 현재 UTC ISO timestamp
  - 신규 3개 게임 객체를 `games` 배열 맨 앞에 prepend
