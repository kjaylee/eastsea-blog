# Test Cases — p1-monetization-tools-trio-20260219-1414

## A. Discovery / Slug Uniqueness
- **TC-A1** `tools/manifest.json`에 아래 slug가 없어야 한다.
  - `mobile-game-iap-ad-mix-revenue-calculator`
  - `b2b-renewal-uplift-roi-calculator`
  - `social-commerce-live-selling-profit-calculator`
- **Expected:** 모두 미존재(new)

## B. Tool-Level Functional Tests

### B1) Mobile Game IAP + Ad Mix Revenue Calculator
- **TC-B1-1 (Happy Path):** 기본값 입력 시 KPI와 summary가 정상 계산된다.
- **TC-B1-2 (Edge):** 비율 입력을 100 초과로 넣으면 에러 노출 + 결과 리셋.
- **TC-B1-3 (Break-even):** 유효 비용/수익 구조에서 손익분기 paying conversion이 `%`로 표시.
- **TC-B1-4 (i18n):** KO↔EN 토글 시 제목/라벨/버튼/상태 문구가 전환.
- **TC-B1-5 (Copy):** Copy Summary 클릭 시 요약 텍스트 클립보드 복사 시도.

### B2) B2B Renewal Uplift ROI Calculator
- **TC-B2-1 (Happy Path):** 추가 갱신건수, 보존 ARR, 월 순효과, ROI 계산.
- **TC-B2-2 (Range Guard):** 갱신율/마진/할인/커버리지 값이 0~100 범위를 벗어나면 에러.
- **TC-B2-3 (Break-even):** Break-even uplift(%p) 값이 계산되어 표시.
- **TC-B2-4 (i18n):** KO↔EN 전환 정상.
- **TC-B2-5 (Copy):** summary 복사 동작.

### B3) Social Commerce Live Selling Profit Calculator
- **TC-B3-1 (Happy Path):** 주문수/GMV/순이익/ROI 계산 정상.
- **TC-B3-2 (Edge):** COGS + fee가 과도하여 주문당 기여이익≤0이면 손익분기 전환율 `N/A` 허용.
- **TC-B3-3 (Range Guard):** 비율 입력 범위 검증(0~100).
- **TC-B3-4 (i18n):** KO↔EN 전환 정상.
- **TC-B3-5 (Copy):** summary 복사 동작.

## C. Integration / Catalog Sync
- **TC-C1** `tools/index.html`에 신규 3개 카드(아이콘/설명/태그) 존재.
- **TC-C2** `tools/manifest.json`에 신규 3개 slug 및 URL 존재, `count=383`.
- **TC-C3** `_data/tools-list.json`에 신규 3개 URL 존재.

## D. Local HTTP Validation
- **TC-D1** `curl -I http://127.0.0.1:<port>/tools/mobile-game-iap-ad-mix-revenue-calculator/` => 200
- **TC-D2** `curl -I http://127.0.0.1:<port>/tools/b2b-renewal-uplift-roi-calculator/` => 200
- **TC-D3** `curl -I http://127.0.0.1:<port>/tools/social-commerce-live-selling-profit-calculator/` => 200
- **TC-D4** `curl -I http://127.0.0.1:<port>/tools/` => 200
- **TC-D5** `curl -I http://127.0.0.1:<port>/tools/manifest.json` => 200

## E. Release / Live Verification
- **TC-E1** 지정 커밋 메시지로 commit 완료.
- **TC-E2** `git push origin master` 성공.
- **TC-E3** 라이브 URL 3개에 대해 2분 내 HTTP 200 확인.
