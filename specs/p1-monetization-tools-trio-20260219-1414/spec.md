# Spec — p1-monetization-tools-trio-20260219-1414

## 1) Objective
기존 slug와 중복되지 않는 신규 비즈니스/수익화 계산기 3종을 single-page HTML 도구로 제작하고, 카탈로그/manifest/데이터 인덱스까지 배포 단위로 반영한다.

## 2) Scope
### In Scope
1. `tools/mobile-game-iap-ad-mix-revenue-calculator/index.html`
2. `tools/b2b-renewal-uplift-roi-calculator/index.html`
3. `tools/social-commerce-live-selling-profit-calculator/index.html`
4. 카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of Scope
- 기존 계산기 로직 변경
- 서버/API 연동
- 사용자 계정/DB 저장

## 3) Functional Requirements

### FR-A: Mobile Game IAP + Ad Mix Revenue Calculator
**Purpose:** 모바일 게임의 IAP/광고 믹스 수익 구조를 통합 계산한다.

**Inputs**
- MAU
- Paying conversion (%)
- ARPPU (KRW)
- DAU/MAU ratio (%)
- Ad ARPDAU (KRW)
- Ad fill rate (%)
- Platform fee on IAP (%)
- Payment fee on IAP (%)
- Ad mediation fee (%)
- Server cost per MAU (KRW)
- Monthly UA spend (KRW)
- Monthly LiveOps cost (KRW)
- One-time feature cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly IAP net revenue
- Monthly ad net revenue
- Monthly total net revenue
- Monthly total cost
- Monthly net profit
- Blended ARPU
- Break-even paying conversion (%)
- Payback period (months)
- Cumulative net impact (period)
- ROI

---

### FR-B: B2B Renewal Uplift ROI Calculator
**Purpose:** B2B 갱신율 개선 프로그램의 보존 매출/이익/ROI를 계산한다.

**Inputs**
- Monthly expiring contracts
- Baseline renewal rate (%)
- Renewal uplift (percentage points)
- Average ARR per contract (KRW)
- Gross margin (%)
- Save-offer discount (%)
- At-risk coverage rate (%)
- Touch cost per targeted account (KRW)
- Monthly enablement/tool cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Additional renewed contracts (monthly)
- Incremental retained ARR
- Incremental retained gross profit
- Monthly program cost
- Monthly net impact
- Cumulative net impact (period)
- ROI
- Break-even uplift (%p)
- Payback period (months)

---

### FR-C: Social Commerce Live Selling Profit Calculator
**Purpose:** 라이브 커머스 세션 운영의 매출/비용/손익분기 전환율을 계산한다.

**Inputs**
- Live sessions per month
- Average viewers per session
- Viewer-to-buyer conversion (%)
- Average order value (KRW)
- Return/cancel rate (%)
- COGS rate (%)
- Platform + payment fee rate (%)
- Logistics cost per order (KRW)
- Host payout per session (KRW)
- Monthly promo spend (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly orders
- Monthly GMV
- Net realized revenue
- Monthly contribution before fixed costs
- Monthly net profit
- Break-even conversion rate (%)
- Payback period (months)
- Cumulative net impact (period)
- ROI

## 4) UX / UI Requirements
- 각 도구는 단일 `index.html`
- 반응형(Desktop 2-column / Mobile 1-column)
- KO/EN 언어 토글
- `Copy Summary` 버튼으로 계산 요약 복사
- 포털 링크 `href="/"` 고정
- 입력 오류 시 에러 박스 표시 + 출력 리셋

## 5) Non-Functional Requirements
- 클라이언트 단 계산(외부 API 없음)
- 0분모/NaN/Infinity 방어
- `input` 이벤트 기반 실시간 재계산
- 접근 가능한 라벨/버튼 텍스트 제공

## 6) Acceptance Criteria
1. 신규 3개 slug가 기존 `tools/manifest.json`에 존재하지 않고 실제 디렉터리로 생성된다.
2. 각 도구가 반응형 + KO/EN 토글 + copy-summary + `href="/"`를 충족한다.
3. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개 도구가 반영된다.
4. 로컬 HTTP(`python3 -m http.server`)에서 신규 3개 URL 및 카탈로그 URL이 `200`을 반환한다.
5. git commit/push 완료 후 GitHub Pages 라이브 URL이 2분 내 `200`을 반환한다.
6. 체크포인트가 `.state/p1-monetization-tools-trio/20260219-1414/`에 남는다.
