# Test Cases — Cross-sell Recommendation ROI Calculator

## Functional
1. 기본값 로드 시 KPI가 즉시 계산되어 표시된다.
2. 노출률/부착률/환불률을 0으로 변경하면 순매출이 0으로 수렴한다.
3. 가격 대비 원가·처리비가 높아 1건당 공헌이익이 음수일 때 경고 상태가 표시된다.
4. 요약 복사 버튼은 summary 텍스트를 클립보드로 복사한다.

## Validation
- 음수 주문수, 100% 초과 비율 입력 시 오류 메시지 및 KPI 초기화.

## Verification commands
- `node --check tools/cross-sell-recommendation-roi-calculator/app.mjs`
- `node --check tools/cross-sell-recommendation-roi-calculator/logic.mjs`
- `python3 -m http.server 8089` (repo root) → `curl -I http://localhost:8089/tools/cross-sell-recommendation-roi-calculator/` returns 200.
