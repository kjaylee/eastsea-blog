# QA Report — Lantern Longball League

## Current state
- 게임 파일: `games/lantern-longball-league/index.html`
- 카탈로그 반영: `games/games-list.json`
- 스펙/TC: 같은 디렉터리에 작성 완료

## Verification evidence
### 1) 파일 생성 확인
- `games/lantern-longball-league/` 생성 완료
- 포함 파일: `index.html`, `og-image.svg`, `spec.md`, `test-cases.md`, `qa-report.md`, `autotest-pass.png`

### 2) 로컬 HTTP 응답
- `http://127.0.0.1:4173/games/lantern-longball-league/` → `200 OK`
- `http://127.0.0.1:4173/games/lantern-longball-league/?autotest=1` → 자동 테스트 페이지 로드 확인

### 3) 헤드리스 Chrome 자동 검증
- 도구: macOS Google Chrome headless (`--window-size=390,844`, `--virtual-time-budget=7000`)
- 결과 텍스트: `PASS / start/hit/hook/draft/homer/save/restart/mobile/pageerror smoke ok`
- 자동검증 JSON 핵심값:
  - `started`: `true`
  - `hit`: `true`
  - `hook`: `true`
  - `draft`: `true`
  - `homer`: `true`
  - `save`: `true`
  - `restart`: `true`
  - `mobile`: `true`
  - `pageErrors`: `0`

### 4) 시각 검토
- 스크린샷: `games/lantern-longball-league/autotest-pass.png`
- 확인 내용:
  - 상단 HUD와 계약 카드가 모바일 폭 안에 들어온다.
  - 캔버스가 실제로 렌더링되고 링/배경/배트 요소가 보인다.
  - QA 오버레이 기준 자동 테스트 PASS가 화면에 남는다.

## Launch gate
- 로컬 QA: 통과
- 다음 단계: 지정 경로만 `git add` → `git commit` → `git push origin master` → 라이브 URL 검증

## Notes
- Chrome headless 로그의 allocator / mailbox / task policy 메시지는 브라우저 내부 로그였고, 게임 페이지 `pageerror`와는 분리해 판정했다.
