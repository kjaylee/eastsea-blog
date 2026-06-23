# Launch Report — signal-tea-house

## Delivered slice
- Game: **Signal Tea House — 시그널 티하우스**
- Route: `/games/signal-tea-house/`
- Type: mobile-first HTML5 routing puzzle

## Implemented assets
- `games/signal-tea-house/index.html`
- `games/signal-tea-house/spec.md`
- `games/signal-tea-house/test-cases.md`
- `games/signal-tea-house/qa-report.md`
- `games/games-list.json`

## Core feature checklist
- [x] 타일 회전 기반 핵심 메카닉 구현
- [x] 온도 선택 서브 메카닉 구현
- [x] 와우 팩터 5개 설계 및 반영
- [x] Tea House Decree 3지선다 구현
- [x] Daily Guest Seal 구현
- [x] Ledger Share Card 구현
- [x] localStorage 저장
- [x] 모바일 390x844 검증
- [x] JS pageerror 0 검증
- [x] 게임오버/재시작 검증

## Launch path
### Local
- `http://127.0.0.1:4173/games/signal-tea-house/`

### Production target
- `https://eastsea-blog.pages.dev/games/signal-tea-house/`

## Git scope rule
이번 사이클에서 git 대상은 아래만 유지한다.
- `games/signal-tea-house/*`
- `games/games-list.json`

## Launch gate
- 로컬 QA: 통과
- 커밋 범위 통제: 진행
- 원격 푸시 후 라이브 URL 검증: 진행
