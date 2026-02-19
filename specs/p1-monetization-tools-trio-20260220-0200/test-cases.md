# Test Cases — p1-monetization-tools-trio-20260220-0200

## A) Slug / Discovery
- **TC-A1** `_data/tools-list.json` 및 `tools/`에 아래 slug가 없어야 한다.
  - `usage-based-pricing-migration-roi-calculator`
  - `self-serve-upgrade-conversion-roi-calculator`
  - `b2b-discount-approval-roi-calculator`

## B) Common UX
- **TC-B1** 각 도구 상단 포털 링크가 `href="/"` 이어야 한다.
- **TC-B2** KO/EN 토글 클릭 시 제목/라벨/버튼 텍스트가 전환되어야 한다.
- **TC-B3** Copy Summary 클릭 시 요약 텍스트 복사 시도 및 피드백이 표시되어야 한다.
- **TC-B4** 모바일(≤900px) 1열, 데스크톱(>900px) 2열 레이아웃이어야 한다.

## C) Calculation Validity
### C-1 Usage-based Pricing Migration ROI
- 목표 usage 단가/사용량 증가 시 월 순효과가 증가해야 한다.
- 입력값 음수 또는 비율 범위 오류 시 에러 표시 + KPI 초기화.

### C-2 Self-serve Upgrade Conversion ROI
- 목표 전환율 > 현재 전환율일 때 순증 업그레이드가 0 이상.
- 공헌마진율 증가 시 월 순효과 증가.
- 목표 전환율 < 현재 전환율이면 validation 에러.

### C-3 B2B Discount Approval ROI
- 목표 할인율 감소 + 수주율 증가 시 개선 후 월 총이익이 증가해야 한다.
- 할인율/수주율/마진율 범위 오류(0~100 외) 시 에러 표시.
- 손익분기 할인율 계산 불가 시 `N/A` 표시.

## D) Integration
- **TC-D1** `tools/index.html`에 신규 3개 카드가 존재한다.
- **TC-D2** `_data/tools-list.json`에 신규 3개 URL 엔트리가 존재한다.
- **TC-D3** `tools/manifest.json`에 신규 3개 slug가 포함되고 count가 증가한다.

## E) Delivery
- **TC-E1** 로컬 HTTP 서버에서 신규 3개 URL 200.
- **TC-E2** commit/push 성공.
- **TC-E3** GitHub Pages 라이브 URL 200(최대 2분 + 1회 재시도).
- **TC-E4** `.state/p1-monetization-tools-trio/20260220-0200/`에 체크포인트 파일 존재.
