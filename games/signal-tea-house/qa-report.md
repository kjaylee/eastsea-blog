# QA Report — signal-tea-house

## Current state
- 게임 파일: `games/signal-tea-house/index.html`
- 카탈로그 반영: `games/games-list.json`
- 스펙/TC: 같은 디렉터리에 작성 완료

## Verification evidence

### 1) 정적 검토
- 단일 HTML 파일 크기: **41,151 bytes**
- 외부 런타임 의존 없음
- `Forecast Tray`, `Aroma Bloom`, `Tea House Decree`, `Daily Guest Seal`, `Ledger Share Card`, `localStorage` 문자열 확인
- 인라인 스크립트 `node --check` 통과

### 2) 로컬 HTTP 응답
- `http://127.0.0.1:4173/games/signal-tea-house/` → **200 OK**
- 테스트 서버: `python3 -m http.server 4173`

### 3) 헤드리스 런타임 자동 검증
- 도구: Chrome headless + CDP 스크립트
- viewport: **390x844**
- 자동검증 결과: `PASS / start/rotate/serve/bloom/decree/gameover/restart/save/mobile smoke ok`
- 런타임 스냅샷:
  - `score`: **150**
  - `bestComboRun`: **4**
  - `stats.successes`: **4**
  - `stats.failures`: **4**
  - `stats.decrees`: **1**
  - `stats.blooms`: **1**
  - `daily.done`: **true**
  - `layout.scrollWidth`: **390**
  - `layout.viewportWidth`: **390**
  - `overflowX`: **false**
  - `pageErrors`: **[]**
- 결산 카드 검증:
  - `Signal Tea House — Ledger Share Card`
  - `점수 150`
  - `최대 콤보 4`
  - `칭호 향기 배선사`
  - `칙령 Gilded Tray`
  - `일일 인장 완료`

### 4) 산출물
- 스크린샷: `tmp/signal-tea-house/autotest.png`
- DOM 덤프: `tmp/signal-tea-house/autotest-dom.html`
- CDP 검증 스크립트: `tmp/signal-tea-house/cdp-check.mjs`

## Verdict
- 모바일 390x844: 통과
- 타이틀 → 시작 → 회전 → 온도 조절 → 서빙 → 칙령 → 게임오버 → 재시작: 통과
- `localStorage` 저장: 통과
- JS `pageerror 0`: 통과
- 오늘 1회 런칭 슬라이스 QA: **통과**
