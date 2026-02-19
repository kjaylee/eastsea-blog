# Test Cases — p1-monetization-tools-trio-20260219-1604

## A. Discovery / Slug Uniqueness
- **TC-A1** `tools/manifest.json`에 아래 slug가 없어야 한다.
  - `saas-feature-gating-revenue-uplift-calculator`
  - `marketplace-promoted-listing-roi-calculator`
  - `api-pricing-tier-shift-revenue-calculator`
- **Expected:** 3개 모두 신규 slug

## B. Tool-Level Functional Tests

### B1) SaaS Feature Gating Revenue Uplift Calculator
- **TC-B1-1 (Happy Path):** 기본값에서 신규 유료전환, MRR uplift, 순이익, ROI 계산.
- **TC-B1-2 (Edge):** engagement/exposure/conversion이 0이면 uplift 0 처리.
- **TC-B1-3 (Validation):** 비율 범위 이탈 시 에러 노출 + 출력 리셋.
- **TC-B1-4 (i18n):** KO↔EN 토글 시 라벨/요약 텍스트 전환.
- **TC-B1-5 (Copy):** Copy Summary 동작.

### B2) Marketplace Promoted Listing ROI Calculator
- **TC-B2-1 (Happy Path):** 노출→클릭→주문, 순매출, 광고비, 월 순이익 계산.
- **TC-B2-2 (Validation):** CTR/CVR/수수료/환불률 범위 검증.
- **TC-B2-3 (Break-even):** 손익분기 CPC 계산.
- **TC-B2-4 (i18n):** KO↔EN 토글 동작.
- **TC-B2-5 (Copy):** summary 복사 동작.

### B3) API Pricing Tier Shift Revenue Calculator
- **TC-B3-1 (Happy Path):** 업그레이드 계정수, 순 MRR uplift, 비용, 순이익 계산.
- **TC-B3-2 (Validation):** adoption/uplift/at-risk 비율 범위 검증.
- **TC-B3-3 (Break-even):** 손익분기 adoption rate 계산.
- **TC-B3-4 (i18n):** KO↔EN 토글 동작.
- **TC-B3-5 (Copy):** summary 복사 동작.

## C. Integration / Catalog Sync
- **TC-C1** `tools/index.html`에 신규 3개 카드 존재.
- **TC-C2** `tools/manifest.json`에 신규 3개 slug + URL + size 존재.
- **TC-C3** `_data/tools-list.json`에 신규 3개 URL 존재.

## D. Local HTTP Validation
- **TC-D1** `/tools/saas-feature-gating-revenue-uplift-calculator/` => 200
- **TC-D2** `/tools/marketplace-promoted-listing-roi-calculator/` => 200
- **TC-D3** `/tools/api-pricing-tier-shift-revenue-calculator/` => 200
- **TC-D4** `/tools/` => 200
- **TC-D5** `/tools/manifest.json` => 200
- **TC-D6** `/_data/tools-list.json` => 200

## E. Release / Live Verification
- **TC-E1** 지정 커밋 메시지 commit 완료.
- **TC-E2** `git push origin master` 성공.
- **TC-E3** 라이브 URL 3개가 최대 2분 내 HTTP 200.
