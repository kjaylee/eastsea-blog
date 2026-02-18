# Test Cases — P1 Monetization Tools Trio (2026-02-19 07:09 KST)

## A. SDD/TDD 순서 검증
1. `spec.md` → `plan.md` → `test-cases.md` → `tasks.md`가 구현 전에 존재.
   - Expected: 4개 문서 파일이 모두 생성됨.

## B. 공통 UI/검증
1. 각 도구를 데스크톱/모바일 폭에서 열기.
   - Expected: 반응형 동작, 가로 스크롤 없음.
2. 상단 포털 링크 점검.
   - Expected: 정확히 `href="/"`.
3. 숫자 필드에 빈값/문자/극단값 입력.
   - Expected: 사용자 친화적 오류 메시지, NaN/Infinity 미표시.

## C. 도구별 계산 검증
### 1) SaaS Trial Conversion Revenue Forecast
- 정상값 입력 시:
  - Expected: 종료 활성고객, 월 MRR, 누적 순이익, ROI, 손익분기 변환율 계산.
- churn 100% 또는 months 0 등 비정상 입력 시:
  - Expected: 계산 차단 + 오류 메시지.

### 2) Pricing Tier Mix Revenue Simulator
- 티어 비중 합계가 정확히 100%일 때:
  - Expected: 티어별 고객수/매출/원가, 총 순이익, ARPU, 손익분기 고객수 계산.
- 비중 합계가 100%가 아닐 때:
  - Expected: 오류 메시지와 KPI 초기화.

### 3) Partner Channel Commission Split Calculator
- 정상값 입력 시:
  - Expected: 환불/수수료/파트너 정산/공헌이익/주문당 순이익/손익분기 매출 계산.
- 공제율이 높아 손실 상황일 때:
  - Expected: 손실 상태 메시지와 음수 공헌이익 표시.

## D. 데이터/배포 검증
1. `tools/manifest.json`에 3개 slug 존재 확인.
2. `_data/tools-list.json`에 3개 URL 존재 확인.
3. push 후 3개 라이브 URL `curl -I` 결과 HTTP 200 확인.