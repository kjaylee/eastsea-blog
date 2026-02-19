# Spec — P1 Monetization Tools Trio (2026-02-19 16:17 KST)

## 1) Goal
기존 `tools/manifest.json`에 없는 신규 수익화 계산기 3개를 추가해, 즉시 사용 가능한 단일 HTML 툴을 배포한다.

## 2) New Tools (non-existing slugs verified)
1. `lifetime-deal-vs-subscription-revenue-calculator`
   - SaaS Lifetime Deal(LTD) vs Subscription 수익성 비교
2. `subscription-winback-campaign-roi-calculator`
   - 해지 고객 윈백 캠페인 ROI 계산
3. `marketplace-seller-subscription-uplift-calculator`
   - 마켓플레이스 셀러 유료 플랜 전환 수익 상승 계산

## 3) Functional Requirements
- 각 도구는 `tools/<slug>/index.html` 단일 파일로 구현
- 반응형 레이아웃(모바일 1열)
- KO/EN 토글 제공
- 요약 텍스트 생성 + Copy Summary 기능 제공
- 포탈 링크는 반드시 `href="/"`
- 유효성 검증 및 오류 메시지 표시
- KPI 카드 + 세부 지표 + 상태 메시지 제공

## 4) Data/Index Updates
- `tools/index.html`에 3개 카드 추가
- `tools/manifest.json`에 3개 엔트리 추가
- `_data/tools-list.json`에 3개 엔트리 추가

## 5) Non-Functional Requirements
- 외부 라이브러리 없이 동작
- 최신 Chromium/Safari에서 즉시 실행
- 접근 가능한 기본 폼 라벨/버튼 구성

## 6) Acceptance Criteria
- 세 도구 URL이 로컬 HTTP에서 `200` 응답
- 각 페이지에 KO/EN 전환, 계산 결과, summary 복사 동작
- 포탈 링크가 `/`로 고정
- manifest / tools-list / tools index에 신규 3개 반영
- Git commit + push 완료, GitHub Pages 라이브 URL 200 확인
