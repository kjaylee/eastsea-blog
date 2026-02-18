# Spec — p1-monetization-tools-trio-20260219-0834

## 1) Objective
Ship **3 new production-ready monetization/business calculators** (single-file, mobile responsive) with practical decision impact.

## 2) Scope
### In scope
1. `tools/free-shipping-threshold-profit-calculator/index.html`
2. `tools/sales-onboarding-ramp-roi-calculator/index.html`
3. `tools/early-payment-discount-apr-calculator/index.html`
4. Discovery updates:
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of scope
- Existing game/tool polishing
- Backend/API dependencies
- Non-deterministic logic

## 3) Functional Requirements

### FR-A: Free Shipping Threshold Profit Calculator
**Purpose:** quantify margin impact when changing free-shipping threshold.

**Inputs**
- Monthly order count
- Current AOV (KRW)
- Current free-shipping eligible share (%)
- Expected eligible share after threshold change (%)
- Expected order conversion impact (%)
- Expected AOV uplift (%)
- Gross margin (%)
- Shipping fee charged to non-eligible orders (KRW)
- Actual shipping cost per shipped order (KRW)
- Monthly campaign/tool cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Baseline monthly contribution margin
- Scenario monthly contribution margin
- Monthly net lift
- Period net impact (after setup cost)
- ROI (%)
- Payback period (months / 회수 불가)
- Break-even required AOV uplift (%)

---

### FR-B: Sales Onboarding Ramp ROI Calculator
**Purpose:** estimate economic return from reducing sales rep ramp time.

**Inputs**
- New reps in cohort (명)
- Current full-ramp time (months)
- Target full-ramp time (months)
- Fully ramped monthly quota per rep (KRW)
- Quota attainment at full productivity (%)
- Gross margin (%)
- Commission rate on bookings (%)
- Additional onboarding investment per rep (KRW)
- Monthly enablement platform cost (KRW)
- Analysis period (months)

**Outputs**
- Incremental booked revenue over analysis period
- Incremental gross profit
- Incremental commission cost
- Total additional investment
- Monthly net lift
- Period net impact
- ROI (%)
- Payback period
- Break-even target ramp time (months)

Formula note: productivity is modeled as **linear ramp** from month 1 to full-ramp month.

---

### FR-C: Early Payment Discount APR Calculator
**Purpose:** evaluate whether early payment discount terms improve cash economics.

**Inputs**
- Monthly invoice volume (KRW)
- Current DSO (days)
- Target DSO for early-pay invoices (days)
- Early payment discount rate (%)
- Customer adoption rate (%)
- Bad debt reduction rate on adopted invoices (%)
- Annual financing/capital cost rate (%)
- Monthly A/R operations savings (KRW)
- Monthly program/tool cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly discount cost
- Monthly financing cost savings
- Monthly bad debt savings
- Monthly net lift
- Period net impact
- ROI (%)
- Effective annualized discount APR (term-based)
- Break-even adoption rate (%)
- Payback period

## 4) UX/UI Requirements
- Single-file HTML + embedded CSS/JS
- Mobile responsive layout (one-column under 900px)
- Clear labels, KRW formatting, deterministic outputs
- Live recalculation on input/change
- Validation errors with actionable text
- “요약 복사” support

## 5) Non-Functional Requirements
- No external CDN dependency
- Defensive numeric guards (NaN, divide-by-zero, impossible break-even)
- Accessible semantic sections and readable table KPIs

## 6) Acceptance Criteria
- 3 unique new slugs created and functional
- Discovery files updated with all 3 URLs
- Local URL checks return HTTP 200
- Live URL checks attempted after push (record status)
- Checkpoints recorded under `.state/p1-monetization-tools-trio/20260219-0834/`
