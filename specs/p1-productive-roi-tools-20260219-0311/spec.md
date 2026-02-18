# Spec — P1 Productive ROI Tools Trio (2026-02-19 03:11 KST)

## Objective
`eastsea-blog`에 **신규 비즈니스 ROI 계산기 3종**을 추가 배포한다.

## In Scope
1. `tools/employee-training-roi-calculator/index.html`
2. `tools/lead-response-time-roi-calculator/index.html`
3. `tools/customer-support-ai-roi-calculator/index.html`

그리고 아래 메타 목록 반영:
- `tools/manifest.json`
- `_data/tools-list.json`

## Mandatory Constraints
- 단일 파일 HTML(인라인 CSS/JS)
- 모바일 반응형
- 실제 계산/검증 로직 포함
- 상단에 `Back to Portal` 링크 (`href='/'`) 포함
- 게임/기존 게임 폴리싱 작업 금지
- Git 작업은 `eastsea-blog` repo에서만 수행

## Functional Requirements

### Common
- 숫자 입력값 validation 및 오류 메시지 표시
- 입력 변경 시 결과 즉시 재계산
- 핵심 KPI 카드 4개 이상
- 결과 요약 텍스트(복사용) 제공

### 1) Employee Training ROI Calculator
- Inputs: 직원 수, 직원당 교육시간, 시간당 인건비, 연 매출(직원당), 생산성 향상률(%), 실현율(%), 프로그램 비용, 연 운영비
- Outputs: 총 투자비, 연간 기대효익, 연간 순효익, ROI(%), 회수기간(개월), 손익분기 생산성 향상률

### 2) Lead Response Time ROI Calculator
- Inputs: 월 리드 수, 현재 응답시간(분), 목표 응답시간(분), 현재 전환율(%), 10분 단축당 전환율 개선(%), 평균 계약금액, 이익률(%), 초기 도입비, 월 운영비
- Outputs: 현재/개선 후 전환율, 추가 수주 건수, 추가 월/연 이익, ROI(%), 회수기간(개월)

### 3) Customer Support AI ROI Calculator
- Inputs: 월 티켓 수, 사람 처리 단가, AI 처리 단가, AI 처리비율(%), 월 플랫폼 비용, 초기 구축비, 월 추가 매출/유지효과
- Outputs: 현재 월 비용, AI 적용 후 월 비용, 월 순효익, 연 순효익, ROI(%), 회수기간, 손익분기 AI 처리비율

## Non-Functional Requirements
- 외부 라이브러리/백엔드 없이 동작
- 최신 모바일/데스크톱 브라우저 지원
- 계산식이 코드에서 명확히 추적 가능
