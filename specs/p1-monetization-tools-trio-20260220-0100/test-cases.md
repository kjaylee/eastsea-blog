# Test Cases — p1-monetization-tools-trio-20260220-0100

## A) Subscription Price Increase Retention Calculator

### A-1 정상 시나리오
- 활성 구독자: 24,000
- 현재 가격: 39,000 KRW
- 인상률: 12%
- 추가 이탈률: 2.8%
- 매출총이익률: 82%
- 결제 수수료율: 3.1%
- 구독자당 지원비: 2,400 KRW
- 월 운영비: 8,000,000 KRW
- 셋업비: 14,000,000 KRW
- 기간: 12개월
- Expected: 월 순이익 변화, ROI, 손익분기 추가 이탈률 계산

### A-2 입력 오류
- 비율값 100 초과 또는 기간 1 미만
- Expected: 에러 메시지 표시 + KPI/요약 초기화

### A-3 손익분기 불가
- 인상 후 단위 경제성이 음수(예: 과도한 수수료/지원비)
- Expected: 손익분기 추가 이탈률/회수기간 `N/A`

---

## B) B2B Pilot-to-Contract Conversion ROI Calculator

### B-1 정상 시나리오
- 월 파일럿 수: 120
- 현재/목표 전환율: 18% → 27%
- 계약당 ARR: 48,000,000 KRW
- 매출총이익률: 78%
- 온보딩 비용: 2,400,000 KRW
- 세일즈 커미션율: 7%
- 계약당 월 지원비: 340,000 KRW
- 월 운영비: 11,000,000 KRW
- 셋업비: 17,000,000 KRW
- 기간: 12개월
- Expected: 순증 계약, 월 순이익, ROI, 손익분기 전환율 계산

### B-2 입력 오류
- 목표 전환율 < 현재 전환율, 비율값 100 초과
- Expected: validation 에러 + 계산 중단

### B-3 손익분기 불가
- 계약당 월 순기여 <= 0
- Expected: 손익분기 전환율/회수기간 `N/A`

---

## C) Checkout Express Payment Conversion ROI Calculator

### C-1 정상 시나리오
- 월 체크아웃 세션: 420,000
- 현재/목표 결제완료율: 41% → 47%
- AOV: 58,000 KRW
- 매출총이익률: 36%
- 결제 수수료율: 2.9%
- 사기/손실률: 0.7%
- 주문당 Express 추가비: 1,100 KRW
- 월 운영비: 9,000,000 KRW
- 셋업비: 13,000,000 KRW
- 기간: 12개월
- Expected: 순증 주문, 월 순이익, ROI, 손익분기 결제완료율 계산

### C-2 입력 오류
- 목표 결제완료율 < 현재 결제완료율, 비율값 100 초과
- Expected: validation 에러 + 계산 차단

### C-3 손익분기 불가
- 주문당 순기여 <= 0
- Expected: 손익분기 결제완료율/회수기간 `N/A`

---

## D) Integration Checks
1. `tools/index.html`에 신규 3개 카드 링크 존재
2. `_data/tools-list.json`에 신규 3개 URL 엔트리 존재
3. `tools/manifest.json`에 신규 3개 slug 반영 + count 증가
4. 로컬 HTTP 서버에서 신규 3개 URL HTTP 200
5. push 후 GitHub Pages 신규 3개 URL HTTP 200
