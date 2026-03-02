# Launch Report — games batch (2026-03-01)

## Build path
- `/games/gravity-dash/index.html`
- `/games/hex-empire/index.html`
- `/games/chain-reaction/index.html`
- `/games/manifest.json` (3개 신규 엔트리 추가)

## QA status
- Iteration 1: **86/100**
  - Gap: Gravity Dash 키보드 입력 미지원, Chain Reaction manifest 링크/키보드 조준 미지원.
- Iteration 2: **98/100 (PASS)**
  - Fix: Gravity Dash keydown 매핑 + #0a0a1a 테마 강화.
  - Fix: Chain Reaction PWA manifest 링크 + keydown 조준/발사 + 커서 시각화.
  - Verification: `qa-summary.json` 전 항목 pass_all=true.

## Known issues
- 브라우저 실기 플레이 스모크는 본 배치에서 정적/문법 검증 위주로 수행.

## URL
- `/games/gravity-dash/`
- `/games/hex-empire/`
- `/games/chain-reaction/`

## Next iteration
- Playwright 실기 자동 플레이 스모크(콘솔 에러 0, 30초 입력 시나리오) 추가 권장.
