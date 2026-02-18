# Spec — P1 Monetization Tools Trio (2026-02-19 07:09 KST)

## Goal
`eastsea-blog/tools`에 신규 수익화/비즈니스 도구 3종을 추가하고 배포한다.

## Selected NEW Tools
1. SaaS Trial Conversion Revenue Forecast
2. Pricing Tier Mix Revenue Simulator
3. Partner Channel Commission Split Calculator

## Scope
- 신규 단일 파일 도구 생성:
  - `tools/saas-trial-conversion-revenue-forecast/index.html`
  - `tools/pricing-tier-mix-revenue-simulator/index.html`
  - `tools/partner-channel-commission-split-calculator/index.html`
- 데이터 카탈로그 반영:
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Git 커밋/푸시 후 라이브 URL HTTP 200 검증

## Functional Requirements
- 각 도구는 단일 `index.html`(inline CSS/JS)로 구현
- 모바일 반응형(좁은 화면에서 카드/입력 스택)
- 상단 포털 링크는 정확히 `href="/"`
- 숫자 입력 강건성 검증(범위, NaN/Infinity, 합계 제약)
- 결과 KPI는 비즈니스 의사결정 가능한 지표 포함:
  - 월/누적 매출 또는 순이익
  - 손익분기 지표(변환율/고객수/매출)
  - ROI 또는 수익성 비율

## Non-Goals
- 기존 게임/도구 리팩터링, 폴리싱, 대규모 구조 변경
- 백엔드/API 연동

## Acceptance Criteria
- 신규 슬러그 3개가 실제 페이지로 동작
- `tools/manifest.json`에 3개 슬러그 추가 및 count/updatedAt 반영
- `_data/tools-list.json`에 3개 URL 추가
- 배포 후 3개 라이브 URL이 모두 HTTP 200