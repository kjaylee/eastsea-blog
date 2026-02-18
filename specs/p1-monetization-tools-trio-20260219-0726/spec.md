# Spec — P1 Monetization Tools Trio (2026-02-19 07:26 KST)

## Goal
`eastsea-blog/tools`에 **신규 수익화 비즈니스 도구 3종**을 구현·배포한다.

## Selected Tools
1. Chargeback Loss Impact Calculator
2. Sales Territory Capacity Planner
3. Customer Success Headcount ROI Calculator

## Scope
- 신규 단일 파일 도구 구현:
  - `tools/chargeback-loss-impact-calculator/index.html`
  - `tools/sales-territory-capacity-planner/index.html`
  - `tools/customer-success-headcount-roi-calculator/index.html`
- 카탈로그 반영:
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Git commit/push 후 실서비스 URL HTTP 200 검증.

## Functional Requirements
- 각 도구는 인라인 CSS/JS 기반 단일 `index.html`로 동작해야 한다.
- 모바일 반응형(작은 화면 가로 스크롤 없음)을 지원해야 한다.
- 페이지 상단 포털 링크는 정확히 `href="/"`를 사용해야 한다.
- 강한 입력 검증(필수/범위/0·음수/NaN/Infinity 차단)을 제공해야 한다.
- 결과 영역에서 `NaN`, `Infinity`를 그대로 노출하지 않아야 한다.
- 각 도구는 다음 KPI를 포함해야 한다:
  - 월/연간 순효과
  - ROI 또는 회수기간
  - 손익분기 임계치(필요 개선율/필요 승률 등)
  - 복사 가능한 텍스트 요약

## Non-Goals
- 기존 게임/기존 도구 수정·폴리싱
- 백엔드/API 의존 기능 추가

## Acceptance Criteria
- 신규 슬러그 3개 디렉터리와 `index.html`이 생성된다.
- `tools/manifest.json`에 신규 3개 항목이 반영된다.
- `_data/tools-list.json`에 신규 3개 URL이 반영된다.
- 배포 후 3개 라이브 URL 모두 HTTP 200을 반환한다.
