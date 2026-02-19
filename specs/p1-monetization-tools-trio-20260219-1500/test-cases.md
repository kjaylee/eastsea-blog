# Test Cases — p1-monetization-tools-trio-20260219-1500

## A. Discovery / Slug Uniqueness
- **TC-A1** `tools/manifest.json`에 아래 slug가 없어야 한다.
  - `saas-usage-overage-revenue-calculator`
  - `reseller-margin-waterfall-calculator`
  - `webinar-funnel-revenue-calculator`
- **Expected:** 3개 모두 미존재(new)

## B. Tool-Level Functional Tests

### B1) SaaS Usage Overage Revenue Calculator
- **TC-B1-1 (Happy Path):** 기본값으로 월 오버리지 수익/비용/순이익/ROI가 계산된다.
- **TC-B1-2 (Edge):** 평균 사용량이 포함 사용량 이하일 때 오버리지 매출이 0으로 표시된다.
- **TC-B1-3 (Validation):** 비율값(0~100) 범위 이탈 시 에러 표시 + 출력 리셋.
- **TC-B1-4 (i18n):** KO↔EN 토글 시 텍스트 전환.
- **TC-B1-5 (Copy):** Copy Summary로 요약 복사 동작.

### B2) Reseller Margin Waterfall Calculator
- **TC-B2-1 (Happy Path):** 매출 워터폴(할인후 매출→채널 지급→순매출)과 월 순이익 계산.
- **TC-B2-2 (Validation):** 할인/마진/리베이트 비율 입력 가드 동작.
- **TC-B2-3 (Break-even):** 손익분기 최대 할인율(%) 계산 또는 불가 표기.
- **TC-B2-4 (i18n):** KO↔EN 토글 동작.
- **TC-B2-5 (Copy):** summary 복사 동작.

### B3) Webinar Funnel Revenue Calculator
- **TC-B3-1 (Happy Path):** 등록→참석→세일즈→구매 퍼널 수치와 순이익/ROI 계산.
- **TC-B3-2 (Validation):** 비율 범위 이탈 시 에러 표시.
- **TC-B3-3 (Break-even):** 손익분기 pitch-to-order 전환율 계산.
- **TC-B3-4 (i18n):** KO↔EN 토글 동작.
- **TC-B3-5 (Copy):** summary 복사 동작.

## C. Integration / Catalog Sync
- **TC-C1** `tools/index.html`에 신규 3개 카드 존재.
- **TC-C2** `tools/manifest.json`에 신규 3개 slug와 URL 존재.
- **TC-C3** `_data/tools-list.json`에 신규 3개 URL 존재.

## D. Local HTTP Validation
- **TC-D1** `/tools/saas-usage-overage-revenue-calculator/` => 200
- **TC-D2** `/tools/reseller-margin-waterfall-calculator/` => 200
- **TC-D3** `/tools/webinar-funnel-revenue-calculator/` => 200
- **TC-D4** `/tools/` => 200
- **TC-D5** `/tools/manifest.json` => 200
- **TC-D6** `/_data/tools-list.json` => 200

## E. Release / Live Verification
- **TC-E1** 지정 커밋 메시지 commit 완료.
- **TC-E2** `git push origin master` 성공.
- **TC-E3** 라이브 URL 3개 2분 내 HTTP 200 확인.
