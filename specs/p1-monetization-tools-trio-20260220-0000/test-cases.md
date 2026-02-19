# Test Cases — p1-monetization-tools-trio-20260220-0000

## A) Checkout One-click Upsell Revenue Calculator

### A-1 정상 시나리오
- 월 주문 수: 85,000
- 현재/목표 업셀 채택률: 6.5% → 10.2%
- 업셀 상품 평균가: 24,000 KRW
- 원가율: 34%
- 수수료율: 3.3%
- 환불률: 4.5%
- 업셀 주문당 이행비: 1,500 KRW
- 월 운영비: 7,000,000 KRW
- 셋업비: 11,000,000 KRW
- 기간: 12개월
- Expected: 순증 업셀 주문, 월 순이익, ROI, 손익분기 업셀률 계산

### A-2 입력 오류
- 목표 업셀률 < 현재 업셀률, 또는 비율값 100 초과
- Expected: 에러 메시지 표시 + KPI/요약 초기화

### A-3 손익분기 불가
- 업셀 1건당 순기여액 <= 0
- Expected: 손익분기 업셀률/회수기간 `N/A`

---

## B) SaaS Seat Underutilization Recapture Calculator

### B-1 정상 시나리오
- 계약 좌석 수: 18,000
- 유휴 좌석 비율: 22%
- 현재/목표 회수율: 28% → 44%
- 좌석당 월 요금: 58,000 KRW
- 매출총이익률: 84%
- 좌석당 리스크 완충비: 4,200 KRW
- 좌석당 청구/운영비: 2,000 KRW
- 월 프로그램비: 8,500,000 KRW
- 셋업비: 13,000,000 KRW
- 기간: 12개월
- Expected: 순증 회수 좌석, 월 순이익, ROI, 손익분기 회수율 계산

### B-2 입력 오류
- 목표 회수율 < 현재 회수율, 또는 비율값 100 초과
- Expected: validation 에러 + 계산 중단

### B-3 손익분기 불가
- 좌석당 순기여액 <= 0 또는 유휴 좌석 수가 0
- Expected: 손익분기 회수율/회수기간 `N/A`

---

## C) Loyalty Points Redemption Margin Calculator

### C-1 정상 시나리오
- 활성 멤버 수: 520,000
- 현재/목표 리뎀션율: 14% → 21%
- 멤버당 월 주문 수: 1.9
- AOV: 41,000 KRW
- 매출총이익률: 48%
- 포인트 비용률: 9%
- 수수료율: 2.9%
- 반품률: 6%
- 멤버당 운영비: 1,300 KRW
- 월 고정비: 6,500,000 KRW
- 셋업비: 9,000,000 KRW
- 기간: 12개월
- Expected: 순증 리뎀션 멤버, 월 순이익, ROI, 손익분기 리뎀션율 계산

### C-2 입력 오류
- 목표 리뎀션율 < 현재 리뎀션율, 또는 비율값 100 초과
- Expected: validation 에러 + 계산 차단

### C-3 손익분기 불가
- 멤버당 순기여액 <= 0
- Expected: 손익분기 리뎀션율/회수기간 `N/A`

---

## D) Integration Checks
1. `tools/index.html`에 신규 3개 카드 링크 존재
2. `_data/tools-list.json`에 신규 3개 URL 엔트리 존재
3. `tools/manifest.json`에 신규 3개 slug 반영 + count 증가
4. 로컬 HTTP 서버에서 신규 3개 URL HTTP 200
5. push 후 GitHub Pages 신규 3개 URL HTTP 200
