# Launch Report — lotus-switchboard

## Delivered slice
- Game: **Lotus Switchboard — 연등 분전실**
- Route: `/games/lotus-switchboard/`
- Type: mobile-first HTML5 routing puzzle vertical slice

## Implemented assets
- `games/lotus-switchboard/index.html`
- `games/lotus-switchboard/spec.md`
- `games/lotus-switchboard/test-cases.md`
- `games/lotus-switchboard/qa-report.md`
- `games/games-list.json`

## Core feature checklist
- [x] 1탭 회전 기반 핵심 메카닉 구현
- [x] 와우 팩터 5개 설계
- [x] 와우 팩터 5개 모두 코드/UI/메타에 반영
- [x] Festival Decree 3지선다 구현
- [x] KST Daily Lantern Duty 구현
- [x] Chronicle Share Card 구현
- [x] localStorage 저장
- [x] 모바일 390x844 검증
- [x] JS pageerror 0 검증

## Launch path
### Local
- `http://127.0.0.1:4173/games/lotus-switchboard/`

### Production target
- `https://eastsea-blog.pages.dev/games/lotus-switchboard/`

## Git scope rule
이번 사이클에서 git 대상은 아래만 유지한다.
- `games/lotus-switchboard/*`
- `games/games-list.json`

## Launch gate
- 로컬 QA: 통과
- 배포 커밋/푸시: 필요
- 라이브 URL 검증: 커밋/푸시 후 진행
