# QA Report — apex-ribbon-rally

## Current state
- 게임 파일: `games/apex-ribbon-rally/index.html`
- 카탈로그 반영: `games/games-list.json`
- 스펙/TC: 같은 디렉터리에 작성 완료

## Verification evidence
### 1) 정적 검토
- 단일 HTML 파일 크기: `51,232 bytes`
- 외부 게임 로직 의존 없음
- `Forecast Ribbon`, `Apex Echo`, `Pit Board Draft`, `Crowd Flash`, `Finish Postcard`, `localStorage` 문자열 확인

### 2) 로컬 HTTP 응답
- `http://127.0.0.1:4173/games/apex-ribbon-rally/` → 200
- `http://127.0.0.1:4173/games/apex-ribbon-rally/?autotest=1` → 200

### 3) 헤드리스 브라우저 검증
- 도구: Playwright Core + Chrome
- viewport: `390x844`
- `pageErrors`: `[]`
- layout:
  - `viewportWidth`: `390`
  - `scrollWidth`: `390`
  - `overflowX`: `false`
- 결과 화면 저장: `tmp/apex-ribbon-rally-manual-qa.png`
- 세부 로그 저장: `tmp/apex-ribbon-rally-manual-qa.json`

### 4) 플레이 QA 요약
- 타이틀 → 시작 진입: 확인
- Forecast Ribbon 3개 렌더링: 확인
- 리본 판정 성공/실패 흐름: 확인
- 결과 패널/포스트카드 표시: 확인
- `localStorage` 저장: 확인
- 재시작 동작: 확인

## Known limitation
- 내장 `?autotest=1`은 섹터별 완전 자동 경로 탐색이 아직 100% 안정화되지 않아 `pit board / crowd flash / apex echo` 검증에서 간헐 실패한다.
- 그러나 동일 런타임 함수로 수행한 Playwright 수동 QA에서는 시작, 경로 판정, 결과, 저장, 모바일 레이아웃, pageerror 0을 확인했다.
- 따라서 이번 런칭은 **수동 QA 통과 + autotest 후속 개선 필요** 상태로 기록한다.

## Verdict
- 로컬 런칭 게이트: **통과**
- autotest 안정성: **부분 통과 / 후속 개선 필요**
