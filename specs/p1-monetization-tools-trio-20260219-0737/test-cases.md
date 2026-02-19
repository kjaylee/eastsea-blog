# Test Cases — P1 Monetization Tools Trio (2026-02-19 07:37 KST)

## A. Process
1. `spec.md -> plan.md -> test-cases.md -> tasks.md` 순서 파일 존재 확인.

## B. Common UX/Validation
1. 3개 툴 모두 모바일(<=430px)에서 1열 레이아웃.
2. 상단 포털 링크가 `href="/"`로 설정.
3. 잘못된 입력에서 오류 메시지 노출 + KPI에 `NaN/Infinity` 미노출.
4. 요약 복사 CTA 클릭 시 요약 텍스트 생성.

## C. Tool-specific math
### 1) SaaS Seat Expansion Revenue Calculator
- 확장 채택 계정, 추가 MRR/ARR, 순연간효과, ROI, 회수기간 계산.
- 채택률/마진율/비용 입력 오류 시 계산 차단.

### 2) Free Shipping Threshold Profit Calculator
- 기준 전/후 주문수·매출·순이익 및 증분이익 계산.
- 무료배송 비율/전환율/마진율 범위 오류 시 계산 차단.

### 3) Repeat Purchase Lift Profit Calculator
- 반복구매 증대에 따른 월/연 매출 및 순이익 uplift 계산.
- 재구매율/마진율 범위 오류 시 계산 차단.

## D. Catalog + Deploy
1. `tools/index.html`에 신규 3개 카드 존재.
2. `tools/manifest.json`에 신규 3개 slug 존재.
3. `_data/tools-list.json`에 신규 3개 URL 존재.
4. 배포 후 3개 live URL HTTP 200.
