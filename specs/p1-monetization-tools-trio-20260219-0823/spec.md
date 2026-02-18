# Spec — p1-monetization-tools-trio-20260219-0823

## 1) Objective
Ship **3 brand-new monetization/business calculators** as production-ready single-page tools under `tools/`.

## 2) Scope
### In scope
1. `tools/checkout-abandonment-recovery-calculator/index.html`
2. `tools/referral-program-roi-calculator/index.html`
3. `tools/upsell-attach-rate-revenue-calculator/index.html`
4. Catalog/index wiring updates:
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of scope
- Existing game/tool polishing or refactoring
- Backend/APIs
- Browser automation

## 3) Functional Requirements

### FR-A: Checkout Abandonment Recovery Calculator
**Purpose:** quantify net impact from improving abandoned checkout recovery rate.

**Inputs**
- Monthly checkout starts
- Checkout abandonment rate (%)
- Current recovery rate on abandoned checkouts (%)
- Target recovery rate (%)
- Average order value (KRW)
- Gross margin (%)
- Incentive cost per recovered order (KRW)
- Monthly platform/tool cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Incremental recovered orders/month
- Incremental revenue/month
- Incremental gross profit/month
- Monthly net lift
- Net impact over analysis period
- ROI (%)
- Payback period (months or “회수 불가”)
- Break-even target recovery rate (%)

**Core formula constraints**
- `targetRecoveryRate >= currentRecoveryRate`
- `targetRecoveryRate <= 100`
- Deterministic formula, no randomness

### FR-B: Referral Program ROI Calculator
**Purpose:** estimate economic viability of referral program changes.

**Inputs**
- Monthly active customers
- Invite participation rate (%)
- Avg invites per participant
- Invite→signup conversion (%)
- Signup→paid conversion (%)
- Gross profit per successful paid referral (KRW)
- Reward cost per successful paid referral (KRW)
- Fraud/ops cost rate (%)
- Monthly program tool cost (KRW)
- Setup cost (KRW)
- Analysis period (months)

**Outputs**
- New paid referrals/month
- Gross profit from referrals/month
- Reward + ops cost/month
- Monthly net lift
- Net impact over analysis period
- ROI (%)
- Payback period
- Break-even participation rate (%)

### FR-C: Upsell Attach Rate Revenue Calculator
**Purpose:** model revenue/profit lift from attach-rate improvement on upsell item.

**Inputs**
- Monthly base product orders
- Current attach rate (%)
- Target attach rate (%)
- Upsell item list price (KRW)
- Average upsell discount (%)
- Upsell gross margin (%)
- Payment/platform fee rate (%)
- Monthly enablement cost (KRW)
- Setup cost (KRW)
- Analysis period (months)

**Outputs**
- Incremental upsell orders/month
- Incremental upsell revenue/month
- Incremental gross profit/month
- Fee cost/month
- Monthly net lift
- Net impact over analysis period
- ROI (%)
- Break-even target attach rate (%)

## 4) UX / UI Requirements
- Single-file HTML per tool
- Mobile responsive (≤900px one-column layout)
- Clear input labels, sane defaults, immediate recalculation on input/change
- Error messages for invalid ranges
- Copy summary button
- No placeholder text

## 5) Non-Functional Requirements
- Deterministic client-side JS only
- No external dependencies/CDN required
- Semantic HTML and readable formatting
- Production-safe numeric guards (`NaN`, divide-by-zero, impossible break-even)

## 6) Integration Requirements
- Add visible cards in `tools/index.html`
- Include each new tool entry in `_data/tools-list.json`
- Regenerate `tools/manifest.json` to include slugs + metadata

## 7) Acceptance Criteria
- 3 new unique tool slugs exist and open with no JS errors
- Local integrity checks pass for all 3 URLs
- Catalog/index files include all 3 tools
- Changes committed and pushed from `eastsea-blog` repo only
