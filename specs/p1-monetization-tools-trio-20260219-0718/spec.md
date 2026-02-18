# Spec — P1 Monetization Tools Trio (2026-02-19 07:18 KST)

## Goal
`eastsea-blog/tools`에 **신규** 수익화/비즈니스 계산기 3종을 추가 배포한다.

## Selected Tools
1. Annual Prepay Revenue Uplift Calculator
2. Payment Gateway Fee Margin Calculator
3. Partner Rebate Break-even Calculator

## Scope
- 신규 툴(각 1파일) 생성:
  - `tools/annual-prepay-revenue-uplift-calculator/index.html`
  - `tools/payment-gateway-fee-margin-calculator/index.html`
  - `tools/partner-rebate-break-even-calculator/index.html`
- 카탈로그 동기화:
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Git commit/push 후 라이브 URL 3개 HTTP 200 검증.

## Functional Requirements
- 각 툴은 단일 HTML 파일(인라인 CSS/JS)로 동작한다.
- 모바일 반응형이어야 하며 작은 화면에서 가로 스크롤이 없어야 한다.
- 상단 포털 링크는 정확히 `href="/"`를 사용한다.
- 숫자 입력에 대한 강한 유효성 검증(범위, 0/음수, NaN)을 제공한다.
- KPI 출력은 NaN/Infinity 노출 없이 의미 있는 문구를 표시한다.
- 각 툴은 다음 지표를 포함한다:
  - 월/연간 순효과
  - ROI 또는 회수기간
  - 손익분기 임계치(채택률/전환율/리프트 등)
  - 복사 가능한 요약 텍스트

## Non-Goals
- 기존 게임/툴의 리팩터링 또는 폴리싱
- 백엔드/API 연동

## Acceptance Criteria
- 신규 슬러그 3개가 실제 디렉터리와 `index.html`로 존재한다.
- `tools/manifest.json`에 3개 슬러그가 반영된다.
- `_data/tools-list.json`에 3개 URL이 반영된다.
- push 이후 3개 라이브 URL 모두 HTTP 200을 반환한다.
