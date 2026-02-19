# Test Cases — p1-monetization-tools-trio-20260219-1801

## A) Subscription Add-on Attach Rate Revenue Calculator

### A-1 정상 시나리오
- subscribers 48,000
- current attach 6.5%
- target attach 9.2%
- add-on price 8,900 KRW
- gross margin 78%
- loss rate 3%
- support/user 1,100 KRW
- monthly fixed 3,500,000 KRW
- setup 14,000,000 KRW
- period 12 months
- Expected: 순증 사용자/월 순효과/ROI/회수기간이 수치로 계산됨

### A-2 잘못된 입력
- target attach < current attach 또는 rate > 100
- Expected: validation 에러 표시, KPI 리셋

### A-3 기여도 음수 케이스
- `price*(1-loss)*margin <= supportCost`
- Expected: 손익분기 attach rate는 불가능 처리

---

## B) Paywall Intro Offer ROI Calculator

### B-1 정상 시나리오
- visitors 260,000
- base conversion 1.8%
- intro conversion 2.6%
- intro price 2,900 KRW
- month2 price 8,900 KRW
- month2 retention 62%
- payment fee 3.4%
- refund 5%
- service cost/subscriber 2,200 KRW
- monthly fixed 6,000,000 KRW
- setup 18,000,000 KRW
- period 12 months
- Expected: 순증 구독자/2개월 기여액/월 순효과/ROI 계산

### B-2 비정상 변환율
- intro conversion <= base conversion 또는 > 100
- Expected: 계산 차단 + 에러

### B-3 단위 경제성 불능
- 높은 fee/refund/service cost로 per-subscriber contribution <= 0
- Expected: 손익분기 intro conversion “불가능 / Not feasible”

---

## C) Coupon Leakage Profit Impact Calculator

### C-1 정상 시나리오
- coupon orders 22,000
- AOV 54,000 KRW
- margin 42%
- valid discount 12%
- leakage share 28%
- extra leak discount 9%
- platform fee 5%
- leak fraud loss 3%
- leakage reduction 45%
- tool monthly cost 4,200,000 KRW
- setup 12,000,000 KRW
- period 12 months
- Expected: 통제 전/후 순이익, 월 순증, ROI 계산

### C-2 비정상 비율
- leakage share > 100 또는 reduction < 0
- Expected: validation 에러 + 계산 중단

### C-3 절감 여지 없음
- extra leak discount + fraud loss == 0
- Expected: 손익분기 감소율 불가능 처리

---

## D) Integration checks
1. `tools/index.html`에 3개 카드 링크 존재
2. `_data/tools-list.json`에 3개 URL 존재
3. `tools/manifest.json`에 3개 slug 존재
4. 로컬 `curl` 3개 경로 HTTP 200
5. push 후 라이브 URL 3개 HTTP 200 (2분 내)
