# Test Cases — p1-monetization-tools-trio-20260220-0300

## A) Slug / Discovery
- **TC-A1** `_data/tools-list.json` 및 `tools/`에 아래 slug가 없어야 한다.
  - `affiliate-tiered-commission-roi-calculator`
  - `marketplace-take-rate-optimization-calculator`
  - `annual-prepay-discount-cashflow-calculator`

## B) Common UX
- **TC-B1** 각 도구 상단 포털 링크가 `href="/"` 이어야 한다.
- **TC-B2** KO/EN 토글 클릭 시 제목/라벨/버튼 텍스트가 전환되어야 한다.
- **TC-B3** Copy Summary 클릭 시 요약 텍스트 복사 시도 및 피드백이 표시되어야 한다.
- **TC-B4** 모바일(≤900px) 1열, 데스크톱(>900px) 2열 레이아웃이어야 한다.

## C) Calculation Validity
### C-1 Affiliate Tiered Commission ROI
- 목표 전환율 증가 시 Tiered 월 순이익과 월 순효과가 상승해야 한다.
- 티어 가중 커미션율이 높아질수록 월 순효과가 감소 방향이어야 한다(다른 값 고정).
- 비율 입력이 0~100 범위 밖이면 에러 표시 + KPI 초기화.

### C-2 Marketplace Take-rate Optimization
- 목표 take-rate 상승 + GMV 변화율이 양수일 때 개선 후 월 순기여가 증가해야 한다.
- 목표 인센티브율 증가(비용 확대) 시 월 순효과가 감소해야 한다.
- 손익분기 take-rate 계산 불가(분모<=0) 시 `N/A` 표기.

### C-3 Annual Prepay Discount Cashflow
- 선결제 전환율 증가 시 선결제 시나리오 현금유입이 증가해야 한다.
- 할인율이 과도하게 높으면 ROI가 악화될 수 있어야 한다.
- 이탈률/할인율/마진율/전환율 범위 오류 시 에러 표시 + 계산 차단.

## D) Integration
- **TC-D1** `tools/index.html`에 신규 3개 카드가 존재한다.
- **TC-D2** `_data/tools-list.json`에 신규 3개 URL 엔트리가 존재한다.
- **TC-D3** `tools/manifest.json`에 신규 3개 slug가 포함되고 count가 증가한다.

## E) Delivery
- **TC-E1** 로컬 HTTP 서버에서 신규 3개 URL 200.
- **TC-E2** commit/push 성공.
- **TC-E3** GitHub Pages 라이브 URL 200(최대 2분 + 1회 재시도).
- **TC-E4** `.state/p1-monetization-tools-trio/20260220-0300/`에 체크포인트 파일 존재.
