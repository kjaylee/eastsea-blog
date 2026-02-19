# Test Cases — p1-monetization-tools-trio-20260219-2200

## A) Freemium Paywall Threshold ROI Calculator

### A-1 정상 시나리오
- 월 활성 무료 사용자: 420,000
- 현재/목표 노출률: 18% → 26%
- 노출 대비 유료 전환율: 7.2%
- 월 ARPPU: 12,000 KRW
- 매출총이익률: 82%
- 수수료율: 6%
- 사용자당 지원비: 1,200 KRW
- 월 고정비: 7,500,000 KRW
- 셋업비: 12,000,000 KRW
- 기간: 12개월
- Expected: 순증 유료 사용자, 월 순이익, ROI, 손익분기 노출률 계산

### A-2 입력 오류
- 목표 노출률 < 현재 노출률, 혹은 비율 > 100
- Expected: 에러 표시 + KPI/요약 초기화

### A-3 손익분기 불가
- 순기여액 <= 0
- Expected: 손익분기 노출률/회수기간 `N/A`

---

## B) SaaS Trial-to-Paid Acceleration Calculator

### B-1 정상 시나리오
- 월 trial 가입: 9,500
- 현재/목표 전환율: 14% → 20%
- 월 구독료: 39,000 KRW
- 매출총이익률: 78%
- 첫 달 할인율: 15%
- trial당 온보딩 비용: 1,100 KRW
- 전환당 세일즈/CS 비용: 8,500 KRW
- 월 고정비: 6,000,000 KRW
- 셋업비: 10,000,000 KRW
- 기간: 12개월
- Expected: 순증 유료 계정, 월 순이익, ROI, 손익분기 목표 전환율 계산

### B-2 입력 오류
- 목표 전환율 < 현재 전환율, 혹은 비율 > 100
- Expected: validation 에러 + 계산 차단

### B-3 순기여 불가
- 할인/비용 과다로 순기여 <= 0
- Expected: 손익분기 목표 전환율 `N/A`

---

## C) In-app Purchase Conversion Uplift Calculator

### C-1 정상 시나리오
- 월 활성 사용자: 1,200,000
- 현재/목표 결제 전환율: 2.4% → 3.1%
- payer 월 결제 횟수: 3.2
- 평균 결제금액: 8,900 KRW
- 플랫폼 수수료율: 30%
- 환불률: 4%
- 원가율: 18%
- payer당 라이브옵스 비용: 2,100 KRW
- 월 고정비: 9,000,000 KRW
- 셋업비: 15,000,000 KRW
- 기간: 12개월
- Expected: 순증 payer, 월 순이익, ROI, 손익분기 전환율 계산

### C-2 입력 오류
- 목표 결제 전환율 < 현재 결제 전환율, 혹은 비율 > 100
- Expected: validation 에러 + 계산 중단

### C-3 손익분기 불가
- payer당 순기여 <= 0
- Expected: 손익분기 목표 전환율/회수기간 `N/A`

---

## D) Integration Checks
1. `tools/index.html`에 신규 3개 카드 링크가 존재
2. `_data/tools-list.json`에 신규 3개 URL 엔트리가 존재
3. `tools/manifest.json`에 신규 3개 slug가 존재하고 count 갱신
4. 로컬 HTTP 서버에서 신규 3개 URL HTTP 200
5. push 후 라이브 URL 3개 HTTP 200
