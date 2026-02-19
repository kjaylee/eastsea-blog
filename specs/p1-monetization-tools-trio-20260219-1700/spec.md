# Spec — p1-monetization-tools-trio-20260219-1700

## 1) Objective
Ship **3 new monetization/business calculators** that are not already in `tools/manifest.json`, each as a single-file responsive page with Korean/English toggle and copyable summary.

## 2) Scope
### In scope
1. `tools/youtube-membership-break-even-calculator/index.html`
2. `tools/creator-course-launch-profit-calculator/index.html`
3. `tools/affiliate-network-vs-inhouse-profit-calculator/index.html`
4. Discovery updates:
   - `tools/index.html` (card additions)
   - `tools/manifest.json` (slug/index refresh)
   - `_data/tools-list.json` (search/discovery entries)

### Out of scope
- Refactoring existing tools
- Backend/API integration
- Design system migration

## 3) Functional Requirements

### FR-A: YouTube Membership Break-even Calculator
**Purpose:** estimate monthly/period creator profit from channel memberships and identify break-even member count.

**Inputs**
- Subscriber base
- Monthly new-member conversion rate (%)
- Membership price (KRW)
- Creator revenue share (%)
- Monthly member churn (%)
- Per-member perk/support cost (KRW)
- Fixed monthly membership ops cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Estimated new members/month
- Ending active members (period end)
- Monthly net profit (latest month)
- Period total net profit (after setup)
- ROI (%)
- Payback period (months)
- Break-even active members (monthly)

**Formula notes**
- Active members follow recurrence: `active_m = active_(m-1) * (1 - churn) + newMembers`
- Monthly revenue: `active_m * price * revenueShare`
- Monthly net: revenue − perkCost − fixedCost
- Break-even members: `fixedCost / (price*share - perkCost)` when denominator > 0

---

### FR-B: Creator Course Launch Profit Calculator
**Purpose:** evaluate profitability of cohort/launch-based digital course monetization.

**Inputs**
- Audience size
- Opt-in rate (%)
- Lead-to-student conversion rate (%)
- Course price (KRW)
- Payment fee (%)
- Refund rate (%)
- Affiliate payout (%)
- Support cost per student (KRW)
- Ad spend per launch (KRW)
- One-time production cost (KRW)
- Number of launch cycles

**Outputs**
- Leads per launch
- Students per launch
- Gross sales per launch
- Net profit per launch
- Total net profit (cycles, after production cost)
- ROI (%)
- Break-even conversion rate (% of leads)

**Formula notes**
- `leads = audience * optInRate`
- `students = leads * conversionRate`
- `keptRevenue = grossSales * (1 - refundRate)`
- Deduct payment fee, affiliate payout, support cost, ad spend
- Break-even conversion derived from per-student contribution

---

### FR-C: Affiliate Network vs In-house Profit Calculator
**Purpose:** compare monthly/period profit between affiliate network model and in-house program model.

**Inputs**
- Monthly referred orders
- Average order value (KRW)
- Gross margin rate (%)
- Network commission rate (%)
- Network platform fee rate (%)
- Network invalid/refund loss rate (%)
- In-house commission rate (%)
- In-house fraud/refund loss rate (%)
- In-house software monthly cost (KRW)
- In-house manager monthly cost (KRW)
- Transition setup cost (KRW)
- Analysis period (months)

**Outputs**
- Monthly net profit (network)
- Monthly net profit (in-house)
- Monthly net uplift (in-house vs network)
- Period net impact (after setup)
- ROI (%)
- Payback period (months)
- Break-even monthly orders for in-house advantage

**Formula notes**
- Gross profit pool: `orders * AOV * marginRate`
- Subtract channel payouts/fees/losses and in-house fixed costs
- Break-even orders from linear delta equation

## 4) UX/UI Requirements
- Single `index.html` per tool (embedded CSS/JS)
- Responsive layout (desktop 2-column, mobile 1-column)
- Korean/English toggle button
- `Copy Summary` button + readonly summary textarea
- Portal back link must be `href="/"`
- Validation errors shown inline and block calculations on invalid input

## 5) Non-functional Requirements
- Deterministic client-side calculations only
- Guard against NaN/divide-by-zero/impossible break-even
- No external libraries/CDN dependency

## 6) Acceptance Criteria
- 3 new unique slugs created and render correctly
- `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json` all include the 3 tools
- Local static serving + `curl` returns HTTP 200 for all 3 routes
- Git commit/push completed with requested message
- Live GitHub Pages endpoints return HTTP 200 within 2-minute window (or recorded timeout result)
- Checkpoint artifacts saved under `.state/p1-monetization-tools-trio/20260219-1700/`
