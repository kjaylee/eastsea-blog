# Spec — P1 Monetization Tools Trio (2026-02-19 07:37 KST)

## Goal
SMB/SaaS/ecommerce 운영자가 바로 의사결정에 활용할 수 있는 수익·이익 최적화 계산기 3종을 신규 배포한다.

## Scope
Create exactly 3 new tools under `tools/<slug>/index.html`:
1. `saas-seat-expansion-revenue-calculator`
2. `free-shipping-threshold-profit-calculator`
3. `repeat-purchase-lift-profit-calculator`

## Functional Requirements
- 각 도구는 단일 HTML 파일로 동작한다 (외부 빌드 불필요).
- 모바일 반응형(최소 360px) 레이아웃 제공.
- 숫자 입력 검증(음수/범위 초과/0 division 방지) 포함.
- 실무형 KPI(월/연 증분이익, ROI, 회수기간, 손익분기 기준값) 표시.
- “요약 복사” CTA 제공 (결재/공유용 텍스트).
- 상단에 포털 복귀 링크(`href="/"`) 제공.

## Catalog / Portal Requirements
- `tools/index.html` 카드 목록에 3개 툴 추가.
- `tools/manifest.json`에 3개 slug 포함.
- `_data/tools-list.json`에 3개 URL/메타 포함.

## Deployment Requirements
- `eastsea-blog` repo에서만 commit/push.
- 변경 있을 때만 commit.
- 배포 후 live URL 3개 HTTP 200 확인.

## Non-Goals
- 기존 게임/툴 리팩토링 또는 UI 폴리싱.
- 백엔드/DB 연동.
