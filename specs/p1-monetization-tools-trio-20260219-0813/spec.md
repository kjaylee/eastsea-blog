# Spec — P1 Monetization Tools Trio (2026-02-19 08:13 KST)

## Goal
`eastsea-blog/tools`에 **신규 수익화 비즈니스 도구 3종**을 구현하고 배포한다.

## Selected Tools
1. Marketplace Take Rate Profit Calculator
2. Dunning Recovery Revenue Calculator
3. Paywall Conversion Lift Calculator

## Scope
- 신규 단일 파일 도구 구현:
  - `tools/marketplace-take-rate-profit-calculator/index.html`
  - `tools/dunning-recovery-revenue-calculator/index.html`
  - `tools/paywall-conversion-lift-calculator/index.html`
- 인덱스/카탈로그 반영:
  - `tools/index.html`
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Git commit/push 후 라이브 URL HTTP 200 검증.

## Functional Requirements
- 각 도구는 인라인 CSS/JS 기반 단일 `index.html`로 동작해야 한다.
- 모바일 반응형(≤430px)에서 가로 스크롤 없이 사용 가능해야 한다.
- 각 페이지 상단 포털 링크는 정확히 `href="/"`여야 한다.
- 입력값 검증(필수/범위/음수/NaN/Infinity 차단)을 제공해야 한다.
- 오류 상태에서 KPI에 `NaN`, `Infinity` 텍스트를 노출하지 않아야 한다.
- 각 도구는 최소 다음 KPI를 제공해야 한다:
  - 월/연 순효과
  - ROI 또는 회수기간
  - 손익분기 임계치(필요 개선율/필요 전환율/필요 회수율)
  - 복사 가능한 텍스트 요약

## Non-Goals
- 기존 게임/기존 도구 폴리싱
- 서버/API 의존 기능 추가

## Acceptance Criteria
- 신규 슬러그 3개 디렉터리와 `index.html`이 생성된다.
- `tools/index.html`에 신규 3개 카드가 노출된다.
- `tools/manifest.json`에 신규 3개 slug가 반영된다.
- `_data/tools-list.json`에 신규 3개 URL이 반영된다.
- 배포 후 3개 라이브 URL이 모두 HTTP 200을 반환한다.
