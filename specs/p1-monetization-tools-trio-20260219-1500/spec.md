# Spec — p1-monetization-tools-trio-20260219-1500

## 1) Objective
기존 slug와 중복되지 않는 신규 비즈니스/수익화 계산기 3종을 single-page HTML 도구로 제작하고, 카탈로그/manifest/데이터 인덱스까지 동기화한다.

## 2) Scope
### In Scope
1. `tools/saas-usage-overage-revenue-calculator/index.html`
2. `tools/reseller-margin-waterfall-calculator/index.html`
3. `tools/webinar-funnel-revenue-calculator/index.html`
4. 카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of Scope
- 외부 API/서버 연동
- 기존 도구 리팩터링
- 사용자 계정/저장 기능

## 3) Functional Requirements

### FR-A: SaaS Usage Overage Revenue Calculator
**Purpose:** 사용량 기반 과금에서 오버리지(초과 사용) 수익성과 손익분기 사용량을 계산한다.

**Inputs**
- Active accounts
- Included units per account
- Average usage units per account
- Overage price per unit (KRW)
- Overage gross margin (%)
- Overage collection rate (%)
- Support cost per account (KRW)
- Metering cost per 1,000 units (KRW)
- Monthly program cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly overage units
- Monthly billed overage revenue
- Monthly net overage revenue
- Monthly total cost
- Monthly net profit
- Break-even overage units
- Payback period (months)
- Cumulative net impact (period)
- ROI

---

### FR-B: Reseller Margin Waterfall Calculator
**Purpose:** 채널 판매(리셀러/디스트리뷰터)에서 할인·마진·리베이트를 반영한 순매출 워터폴과 ROI를 계산한다.

**Inputs**
- Deals per month
- List price per deal (KRW)
- Average discount (%)
- Reseller margin (%)
- Distributor margin (%)
- Back-end rebate (%)
- Delivery cost per deal (KRW)
- Support cost per deal (KRW)
- Sales incentive per deal (KRW)
- Monthly channel program cost (KRW)
- One-time enablement cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly booked revenue (after discount)
- Reseller payout
- Distributor payout
- Rebate amount
- Net channel revenue
- Monthly total cost
- Monthly net profit
- Break-even max discount (%)
- Payback period (months)
- Cumulative net impact and ROI

---

### FR-C: Webinar Funnel Revenue Calculator
**Purpose:** 웨비나 퍼널(등록→참석→세일즈→결제)의 수익성 및 손익분기 전환율을 계산한다.

**Inputs**
- Monthly registrants
- Show-up rate (%)
- Pitch reach rate (%)
- Pitch-to-order conversion (%)
- Average order value (KRW)
- Refund rate (%)
- Payment fee rate (%)
- Affiliate commission rate (%)
- Delivery cost per buyer (KRW)
- Monthly ad spend (KRW)
- Monthly tools/ops cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly attendees / pitched leads / buyers
- Gross sales and net realized revenue
- Monthly total cost
- Monthly net profit
- Break-even pitch-to-order conversion (%)
- Payback period (months)
- Cumulative net impact (period)
- ROI

## 4) UX / UI Requirements
- 각 도구는 단일 `index.html`
- 반응형(Desktop 2-column / Mobile 1-column)
- KO/EN 언어 토글
- `Copy Summary` 버튼 제공
- 포털 링크는 반드시 `href="/"`
- 입력 오류 시 에러 박스 표시 + 출력 리셋

## 5) Non-Functional Requirements
- 전부 클라이언트 계산(네트워크 호출 없음)
- NaN/Infinity 및 0분모 방어
- `input`/`change` 기반 즉시 재계산
- 라벨/버튼 접근성 텍스트 제공

## 6) Acceptance Criteria
1. 신규 3개 slug가 기존 `tools/manifest.json`에 없고 실제 디렉터리로 생성된다.
2. 각 도구가 반응형 + KO/EN 토글 + copy-summary + `href="/"`를 충족한다.
3. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개가 반영된다.
4. 로컬 HTTP(`python3 -m http.server`)에서 신규 URL/카탈로그 URL이 `200` 응답을 반환한다.
5. 지정 커밋 메시지로 commit/push 완료 후 GitHub Pages 라이브 URL이 2분 내 `200`을 반환한다.
6. 체크포인트가 `.state/p1-monetization-tools-trio/20260219-1500/`에 남는다.
