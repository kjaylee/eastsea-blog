# Test Cases — P1 Monetization Tools Trio (2026-02-19 07:26 KST)

## A. SDD/TDD 순서 검증
1. `spec.md` → `plan.md` → `test-cases.md` → `tasks.md` 순서로 문서가 존재해야 한다.

## B. 공통 UI/검증
1. 세 도구 모두 모바일(≤430px)에서 입력/결과 카드가 세로 적층된다.
2. 세 도구 모두 상단 포털 링크가 정확히 `href="/"`를 사용한다.
3. 음수/0/범위초과 입력 시 계산이 차단되고 오류 메시지가 노출된다.
4. 오류 상태에서 KPI에 `NaN`, `Infinity`가 표시되지 않는다.

## C. 도구별 계산 검증
### 1) Chargeback Loss Impact Calculator
- 정상 입력: 월 순효과, 연 순효과, ROI, 회수기간, 손익분기 개선폭 계산.
- 목표 차지백률이 범위를 벗어나거나 현재 대비 과도하면 오류 처리.

### 2) Sales Territory Capacity Planner
- 정상 입력: 영업 1인당 매출 생산성, 필요 인원, 충원 갭, 연간 순효과 계산.
- 승률/딜 크기/딜 처리량 입력 오류 시 계산 차단.

### 3) Customer Success Headcount ROI Calculator
- 정상 입력: churn 개선 기여, expansion 기여, 연간 순효과, ROI 계산.
- churn 범위/CS 인건비/마진율 입력 오류 시 계산 차단.

## D. 카탈로그/배포 검증
1. `tools/manifest.json`에 신규 3개 slug가 존재한다.
2. `_data/tools-list.json`에 신규 3개 URL이 존재한다.
3. push 후 라이브 URL 3개 `curl -I` 결과가 HTTP 200이다.
