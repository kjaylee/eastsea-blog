# Test Cases — p1-monetization-tools-trio-20260219-1900

## A) Subscription Family Plan Upgrade Revenue Calculator

### A-1 정상 시나리오
- 활성 개인 플랜 계정: 62,000
- 현재/목표 패밀리 비중: 11% → 16%
- 개인/패밀리 가격: 7,900 / 12,900 KRW
- 패밀리 매출총이익률: 76%
- 인센티브/추가지원비: 1,500 / 900 KRW
- 월 고정비: 4,200,000 KRW
- 셋업비: 12,000,000 KRW
- 기간: 12개월
- Expected: 월 순증 순이익, ROI, 회수기간 계산

### A-2 입력 오류
- 목표 비중 < 현재 비중, 혹은 비율 > 100
- Expected: 에러 표시, KPI/요약 리셋

### A-3 손익분기 불가능
- 계정당 순기여액 <= 0
- Expected: 손익분기 목표 비중 불가능 처리

---

## B) Podcast Dynamic Ad Insertion ROI Calculator

### B-1 정상 시나리오
- 월 다운로드: 1,400,000
- 슬롯 수: 2
- 현재 fill/eCPM: 58%, 19,000 KRW
- fill 개선폭/eCPM 개선폭: +18%p, +12%
- 매출 쉐어: 25%
- 광고 운영비: 2,800,000 KRW
- 툴 월비용: 3,600,000 KRW
- 셋업비: 9,000,000 KRW
- 기간: 12개월
- Expected: 도입 전후 총매출, 월 순증, ROI 계산

### B-2 입력 오류
- fill 개선폭으로 100% 초과, 혹은 음수 비율
- Expected: 계산 차단 + 에러

### B-3 역전 불가
- 개선폭이 0이거나 수수료/비용 과다로 월 순증 <= 0
- Expected: 손익분기 개선폭 Not feasible

---

## C) Creator Affiliate Commission Profit Calculator

### C-1 정상 시나리오
- 월 클릭 유입: 240,000
- 구매 전환율: 2.4%
- AOV: 48,000 KRW
- 매출총이익률: 43%
- 커미션율: 14%
- 환불/취소율: 6%
- 결제/플랫폼 수수료: 4.5%
- 제작비: 5,000,000 KRW
- 운영 고정비: 3,200,000 KRW
- 셋업비: 7,000,000 KRW
- 기간: 12개월
- Expected: 주문수/순매출/월 순이익/ROI 계산

### C-2 입력 오류
- 전환율 > 100 또는 음수
- Expected: validation 에러 + 계산 중단

### C-3 순기여 불가
- 커미션+환불+수수료 과다로 주문당 순기여액 <= 0
- Expected: 손익분기 전환율 불가능 처리

---

## D) Integration checks
1. `tools/index.html`에 3개 카드 링크 존재
2. `_data/tools-list.json`에 3개 URL 존재
3. `tools/manifest.json`에 3개 slug 존재
4. 로컬 `curl` 3개 URL HTTP 200
5. push 후 라이브 URL 3개 HTTP 200
