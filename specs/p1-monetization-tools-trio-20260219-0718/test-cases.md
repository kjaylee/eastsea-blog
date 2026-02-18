# Test Cases — P1 Monetization Tools Trio (2026-02-19 07:18 KST)

## A. SDD/TDD 순서 검증
1. `spec.md` → `plan.md` → `test-cases.md` → `tasks.md`가 생성되어 있어야 한다.

## B. 공통 UI/검증
1. 세 툴 모두 모바일(≤430px)에서 카드가 세로 적층되고 가로 스크롤이 없어야 한다.
2. 상단 포털 링크 마크업이 정확히 `href="/"`를 포함해야 한다.
3. 음수/0/범위초과 입력 시 사용자 친화적 오류 메시지를 표시해야 한다.
4. 오류 상태에서 KPI 영역에 `NaN`, `Infinity`가 노출되지 않아야 한다.

## C. 툴별 계산 검증
### 1) Annual Prepay Revenue Uplift Calculator
- 정상값 입력 시: 연 순효과, ROI, 회수개월, 손익분기 채택률이 계산된다.
- 할인율 과다 또는 채택률 범위초과 시: 계산 차단 + 오류 메시지.

### 2) Payment Gateway Fee Margin Calculator
- 정상값 입력 시: 현재/신규 월 순기여, 월 증분이익, 연 ROI, 손익분기 승인율 상승폭이 계산된다.
- 수수료율/마진율 범위 오류 시: 계산 차단 + 오류 메시지.

### 3) Partner Rebate Break-even Calculator
- 정상값 입력 시: 리베이트 적용 후 순이익 변화, 연 순효과, 회수개월, 손익분기 판매 리프트가 계산된다.
- 리베이트율이 마진율 이상이면: 계산 차단 + 오류 메시지.

## D. 카탈로그/배포 검증
1. `tools/manifest.json`에 신규 3개 slug 존재.
2. `_data/tools-list.json`에 신규 3개 URL 존재.
3. push 후 3개 라이브 URL `curl -I` 결과 HTTP 200.
