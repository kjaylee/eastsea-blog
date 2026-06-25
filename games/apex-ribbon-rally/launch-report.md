# Launch Report — apex-ribbon-rally

## Delivered slice
- Game: **Apex Ribbon Rally — 에이펙스 리본 랠리**
- Route: `/games/apex-ribbon-rally/`
- Type: mobile-first HTML5 drawing racing slice

## Implemented assets
- `games/apex-ribbon-rally/index.html`
- `games/apex-ribbon-rally/spec.md`
- `games/apex-ribbon-rally/test-cases.md`
- `games/apex-ribbon-rally/qa-report.md`
- `games/apex-ribbon-rally/launch-report.md`
- `games/games-list.json`

## Core feature checklist
- [x] 리본 드로우 기반 핵심 메카닉 구현
- [x] 와우 팩터 5개 설계
- [x] Forecast Ribbon 구현
- [x] Apex Echo 구현
- [x] Pit Board Draft 구현
- [x] Crowd Flash 구현
- [x] Finish Postcard 구현
- [x] `localStorage` 저장
- [x] 모바일 390x844 검증
- [x] JS `pageerror 0` 검증

## Launch path
### Local
- `http://127.0.0.1:4173/games/apex-ribbon-rally/`

### Production target
- `https://eastsea-blog.pages.dev/games/apex-ribbon-rally/`

## Git scope rule
이번 사이클 git 대상은 아래만 유지한다.
- `games/apex-ribbon-rally/*`
- `games/games-list.json`

## Launch gate
- 로컬 QA: 통과
- 프로덕션 배포: 필요
- 라이브 URL 검증: 배포 후 수행
