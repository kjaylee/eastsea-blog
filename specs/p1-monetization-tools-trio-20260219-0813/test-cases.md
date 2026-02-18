# Test Cases — P1 Monetization Tools Trio (2026-02-19 08:13 KST)

## A. SDD/TDD 순서 검증
1. `spec.md` → `plan.md` → `test-cases.md` → `tasks.md` 순서로 문서가 존재해야 한다.

## B. 공통 UI/입력 검증
1. 세 도구 모두 상단 포털 링크가 정확히 `href="/"`를 사용한다.
2. 음수/0/범위초과/NaN 입력 시 계산이 중단되고 오류 메시지가 표시된다.
3. 오류 상태에서 KPI 카드 텍스트에 `NaN`, `Infinity`가 직접 노출되지 않는다.
4. 모바일 폭(≤430px)에서 입력/결과 카드가 단일 열로 적층된다.

## C. 도구별 계산 검증
### 1) Marketplace Take Rate Profit Calculator
- 정상 입력 시 현재/목표 월 이익, 월 순효과, 연 순효과, ROI, 회수기간 계산.
- 목표 Take Rate 조정 시 손익분기 최소 Take Rate(또는 허용 GMV 하락률) 계산.

### 2) Dunning Recovery Revenue Calculator
- 정상 입력 시 추가 회수 건수, 월 순효과, 연 순효과, ROI, 회수기간 계산.
- 목표 회수율이 현재보다 낮거나 범위를 벗어나면 오류 처리.

### 3) Paywall Conversion Lift Calculator
- 정상 입력 시 추가 유료 사용자, 월/연 순효과, ROI, 회수기간 계산.
- 손익분기 필요 전환율/전환율 상승폭 계산.

## D. 인덱스/배포 검증
1. `tools/index.html`에 신규 3개 카드 링크 존재.
2. `tools/manifest.json`에 신규 3개 slug 존재.
3. `_data/tools-list.json`에 신규 3개 URL 존재.
4. push 후 라이브 URL 3개 `curl -I` 결과 HTTP 200 확인.
