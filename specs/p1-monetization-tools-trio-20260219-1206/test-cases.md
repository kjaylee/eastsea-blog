# Test Cases — p1-monetization-tools-trio-20260219-1206

## A. Discovery / Uniqueness
- **TC-A1** `tools/manifest.json`에서 3개 slug 미존재 확인
  - newsletter-sponsorship-pricing-calculator
  - creator-sponsorship-rate-calculator
  - youtube-ad-revenue-estimator

## B. Tool Rendering
- **TC-B1** 각 페이지가 HTML 200으로 로드된다.
- **TC-B2** 모바일 뷰(<=900px)에서 1열 레이아웃 유지.
- **TC-B3** 데스크탑 뷰(>900px)에서 2열 레이아웃 유지.

## C. i18n / UX
- **TC-C1** Lang 버튼 클릭 시 KO↔EN 텍스트가 전환된다.
- **TC-C2** Back 링크가 `href="/"` 이다.
- **TC-C3** Copy Summary 버튼 클릭 시 요약 텍스트가 클립보드에 복사된다.

## D. Calculation Validity
### D1 Newsletter Sponsorship Pricing
- 정상 입력에서 opens/clicks/권장 단가가 양수로 계산된다.
- openRate/ctr/cost가 비정상 범위를 벗어나면 에러를 표시한다.

### D2 Creator Sponsorship Rate
- posts 증가 시 총 제안가가 증가한다.
- feeRate가 높아질수록 제안가는 증가, 실수령액은 공식대로 계산된다.

### D3 YouTube Ad Revenue
- long/short 조회수 증가 시 총 매출이 증가한다.
- 제작비 증가 시 순이익 감소 및 음수 가능.

## E. Catalog Consistency
- **TC-E1** `tools/index.html`에 3개 카드가 존재한다.
- **TC-E2** `tools/manifest.json`에 3개 slug가 존재한다.
- **TC-E3** `_data/tools-list.json`에 3개 URL이 존재한다.

## F. Verification / Deployment
- **TC-F1** 로컬 `curl` 결과 모두 HTTP 200.
- **TC-F2** git commit/push 성공.
- **TC-F3** 라이브 URL 3개 HTTP 200 (최대 2분 대기).
