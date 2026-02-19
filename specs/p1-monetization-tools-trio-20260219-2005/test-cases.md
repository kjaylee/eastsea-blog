# Test Cases — p1-monetization-tools-trio-20260219-2005

## A) Subscription Bundle Migration ROI Calculator

### A-1 정상 시나리오
- 활성 기본 계정: 82,000
- 현재/목표 번들 비중: 9% → 15%
- 기본/번들 가격: 9,900 / 14,900 KRW
- 번들 매출총이익률: 74%
- 번들 추가원가/이관 인센티브: 1,200 / 2,100 KRW
- 월 고정비: 4,500,000 KRW
- 셋업비: 10,000,000 KRW
- 기간: 12개월
- Expected: 순증 번들 계정, 월 순이익, ROI, 손익분기 비중 계산

### A-2 입력 오류
- 목표 비중 < 현재 비중, 혹은 비율 > 100
- Expected: 에러 표시, KPI/요약 리셋

### A-3 손익분기 불가능
- 계정당 순기여액 <= 0
- Expected: 손익분기 목표 비중 불가능 처리

---

## B) Marketplace Buyer Membership Uplift Calculator

### B-1 정상 시나리오
- 월 활성 구매자: 320,000
- 현재/목표 가입률: 4% → 9%
- 멤버십 월구독료: 4,900 KRW
- 비회원 주문수/회원 uplift: 1.1건, +24%
- AOV: 39,000 KRW
- 주문 공헌이익률: 21%
- 결제수수료율: 3.2%
- 혜택원가(회원당 월): 1,300 KRW
- 월 고정비: 5,000,000 KRW
- 셋업비: 8,000,000 KRW
- 기간: 12개월
- Expected: 멤버십 순수익 + 추가 주문 공헌이익 + ROI 계산

### B-2 입력 오류
- 가입률/수수료율/공헌이익률 값이 0~100 범위를 벗어남
- Expected: 계산 차단 + 에러

### B-3 역전 불가
- 순증 회원 1인당 기여가 0 이하
- Expected: 손익분기 가입률 Not feasible

---

## C) B2B Contract Auto-renew Uplift Calculator

### C-1 정상 시나리오
- 월 만료 계약 수: 1,250
- 현재/목표 갱신율: 71% → 79%
- 계약당 월 매출: 520,000 KRW
- 매출총이익률: 68%
- 갱신 할인율: 5%
- 추가운영비/절감액(건당): 48,000 / 22,000 KRW
- 월 고정 프로그램비: 6,500,000 KRW
- 셋업비: 11,000,000 KRW
- 기간: 12개월
- Expected: 순증 갱신건, 월 순증 순이익, ROI, 회수기간 계산

### C-2 입력 오류
- 목표 갱신율 < 현재 갱신율, 혹은 비율 > 100
- Expected: validation 에러 + 계산 중단

### C-3 순기여 불가
- 할인/비용 과다로 갱신 1건당 순기여 <= 0
- Expected: 손익분기 목표 갱신율 불가능 처리

---

## D) Integration checks
1. `tools/index.html`에 3개 카드 링크 존재
2. `_data/tools-list.json`에 3개 URL 존재
3. `tools/manifest.json`에 3개 slug 존재
4. 로컬 `curl` 3개 URL HTTP 200
5. push 후 라이브 URL 3개 HTTP 200
