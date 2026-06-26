# QA Report — Moonbell Madrigal

## Current state
- 게임 파일: `games/moonbell-madrigal/index.html`
- 카탈로그 반영: `games/games-list.json`
- 스펙/TC: 같은 디렉터리에 작성 완료

## Verification evidence

### 1) 파일 생성 확인
- `games/moonbell-madrigal/` 생성 완료
- 포함 파일: `index.html`, `spec.md`, `test-cases.md`, `qa-report.md`, `autotest-pass.png`

### 2) 로컬 HTTP 응답
- `http://127.0.0.1:4173/games/moonbell-madrigal/` → 로컬 서빙 가능
- `http://127.0.0.1:4173/games/moonbell-madrigal/?autotest=1` → 자동 테스트 페이지 로드 확인

### 3) 헤드리스 Chrome 자동 검증
- 도구: macOS Google Chrome headless (`--window-size=390,844`)
- 결과 텍스트: `PASS / start/rotate/route/chorus/decree/save/restart/mobile/pageerror smoke ok`
- 자동검증 JSON 핵심값:
  - `ok`: `true`
  - `pageErrors`: `0`
  - `appWidth`: `340`
  - `offenders`: `[]`
  - `bestScore`: `117`
  - `bestCombo`: `4`
  - `bestTitle`: `별빛 조율사`
- 검증 항목 포함:
  - 시작 진입
  - 타일 회전
  - 경로 성공 판정
  - Moon Chorus 발동
  - Midnight Decree 오버레이 오픈/적용
  - `localStorage` 저장
  - 게임오버/재시작
  - 모바일 레이아웃 스모크
  - `pageerror 0`

### 4) 시각 검토
- 스크린샷: `games/moonbell-madrigal/autotest-pass.png`
- 이미지 검토 결과:
  - 핵심 UI가 모바일 폭 안에 들어옴
  - 이전 오른쪽 잘림 문제는 실질적으로 해소됨

## Launch gate
- 로컬 QA: 통과
- 다음 단계: 지정 경로만 git add → commit → push → Pages 라이브 URL 검증

## Notes
- 헤드리스 Chrome의 `window.innerWidth`가 500으로 잡히는 환경 차이가 있었으므로, 실제 앱 폭(`appWidth`)과 시각 스크린샷 기준으로 모바일 레이아웃 검증을 보강했다.
- GPU mailbox 경고는 Chrome headless 내부 로그였고, 게임 페이지 `pageerror`와 무관함을 확인했다.
