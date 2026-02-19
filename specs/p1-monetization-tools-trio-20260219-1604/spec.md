# Spec — p1-monetization-tools-trio-20260219-1604

## 1) Objective
기존 slug와 중복되지 않는 신규 비즈니스/수익화 계산기 3종을 제작하고, 카탈로그/manifest/데이터 인덱스를 동기화해 배포 가능한 상태로 완성한다.

## 2) Scope
### In Scope
1. `tools/saas-feature-gating-revenue-uplift-calculator/index.html`
2. `tools/marketplace-promoted-listing-roi-calculator/index.html`
3. `tools/api-pricing-tier-shift-revenue-calculator/index.html`
4. 카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of Scope
- 서버/API 연동
- 기존 도구 리팩터링
- 사용자 계정/로그인/DB 저장

## 3) Functional Requirements

### FR-A: SaaS Feature Gating Revenue Uplift Calculator
**Purpose:** 무료 사용자 대상 기능 게이팅(유료 잠금) 도입 시 신규 유료 전환과 순이익 효과를 계산한다.

**Inputs**
- Monthly active free users
- Feature engagement rate (%)
- Gate exposure rate (%)
- Upgrade conversion rate (%)
- Paid ARPU (KRW/month)
- Gross margin (%)
- Support cost per upgraded user (KRW/month)
- Monthly program cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Eligible users (monthly)
- New paid users (monthly)
- Incremental MRR
- Incremental gross profit
- Monthly total cost
- Monthly net profit
- Break-even upgrade conversion rate (%)
- Payback period (months)
- Cumulative net impact (period)
- ROI (%)

---

### FR-B: Marketplace Promoted Listing ROI Calculator
**Purpose:** 프로모티드 리스팅 광고 집행 시 매출/마진/광고비를 반영해 월 순이익과 ROI를 계산한다.

**Inputs**
- Monthly promoted impressions
- CTR (%)
- Conversion rate (%)
- Average order value (KRW)
- Gross margin (%)
- CPC bid (KRW)
- Marketplace fee (%)
- Refund/return rate (%)
- Monthly campaign fixed cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Clicks (monthly)
- Orders (monthly)
- Net sales after refunds
- Contribution profit before ad spend
- Ad spend (monthly)
- Monthly net profit
- Break-even CPC (KRW)
- Payback period (months)
- Cumulative net impact (period)
- ROI (%)

---

### FR-C: API Pricing Tier Shift Revenue Calculator
**Purpose:** API 고객의 상위 요금제 이동 전략에서 가격 상승·리스크·비용을 반영해 순수익 효과를 계산한다.

**Inputs**
- Active API accounts
- Current ARPA (KRW/month)
- Target tier adoption rate (%)
- Tier price uplift (%)
- At-risk downgrade/churn rate (%)
- Infra cost increase per upgraded account (KRW/month)
- Success/support cost per upgraded account (KRW/month)
- Monthly enablement cost (KRW)
- One-time migration cost (KRW)
- Analysis period (months)

**Outputs**
- Upgraded accounts (monthly)
- Gross uplift MRR
- At-risk MRR loss
- Net uplift MRR
- Incremental monthly cost
- Monthly net profit
- Break-even adoption rate (%)
- Payback period (months)
- Cumulative net impact (period)
- ROI (%)

## 4) UX / UI Requirements
- 각 도구는 single `index.html`
- 반응형 레이아웃(Desktop 2-column / Mobile 1-column)
- KO/EN 토글 버튼
- `Copy Summary` 버튼
- 포탈 링크 `href="/"`
- 입력 오류 시 에러 박스 + 출력 리셋

## 5) Non-Functional Requirements
- 100% 클라이언트 계산, 네트워크 호출 없음
- NaN/Infinity/0분모 방어
- 입력 변경 시 즉시 재계산
- 라벨/버튼 텍스트 접근성 확보

## 6) Acceptance Criteria
1. 신규 3개 slug가 기존 `tools/manifest.json`에 없고 실제 디렉터리로 생성된다.
2. 각 도구가 반응형 + KO/EN 토글 + copy-summary + `href="/"`를 충족한다.
3. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개가 반영된다.
4. 로컬 HTTP 검증(`python3 -m http.server` + `curl`)에서 지정 URL이 `200`을 반환한다.
5. 지정 커밋 메시지로 commit/push 완료 후 GitHub Pages 라이브 URL이 2분 내 `200`을 반환한다.
6. 체크포인트가 `.state/p1-monetization-tools-trio/20260219-1604/`에 남는다.
