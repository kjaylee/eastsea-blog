# Test Cases — p1-monetization-tools-trio-20260219-1300

## A. Discovery / Slug Uniqueness
- **TC-A1** `tools/manifest.json`에 아래 slug가 모두 미존재여야 한다.
  - freemium-to-paid-conversion-revenue-calculator
  - creator-membership-tier-revenue-calculator
  - wholesale-vs-dtc-margin-calculator

## B. Rendering / Responsiveness
- **TC-B1** 각 신규 도구 URL 로컬 서버에서 HTTP 200.
- **TC-B2** 900px 이하에서 1열 레이아웃.
- **TC-B3** 900px 초과에서 2열 레이아웃.

## C. UX Requirements
- **TC-C1** KO/EN 토글 버튼 클릭 시 주요 라벨/버튼/상태 문구 전환.
- **TC-C2** 포탈 링크가 `href="/"`.
- **TC-C3** Copy Summary 클릭 시 결과 텍스트 복사 시도 및 피드백 표시.

## D. Calculation Validity
### D1 Freemium to Paid Conversion Revenue
- 목표 전환율이 현재 전환율 이상일 때 추가 유료 사용자 수가 0 이상.
- ARPU/마진 증가 시 월 순효과가 증가.
- 비정상 입력(음수, 범위 초과)에서 에러 표시.

### D2 Creator Membership Tier Revenue
- 월 신규 멤버 증가 시 최종 활성 멤버 수 및 누적 순효과 증가.
- 플랫폼 수수료율 증가 시 순이익 감소.
- 티어 비중 합계가 100이 아닐 때 에러 표시.

### D3 Wholesale vs DTC Margin
- 목표 DTC 비중 증가 시 단위 채널 이익 차이에 맞춰 월 순효과 변화.
- 추가 월 운영비 증가 시 월 순효과 감소.
- 원가/변동비가 과도해 단위 이익이 음수인 경우 경고/에러 처리.

## E. Catalog Consistency
- **TC-E1** `tools/index.html`에 신규 3개 카드 존재.
- **TC-E2** `tools/manifest.json`에 신규 3개 slug 존재.
- **TC-E3** `_data/tools-list.json`에 신규 3개 URL 존재.

## F. Release / Live
- **TC-F1** git commit/push 성공.
- **TC-F2** GitHub Pages 라이브 URL 3개가 2분 내 HTTP 200.
- **TC-F3** 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260219-1300/`에 생성.
