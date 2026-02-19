# Spec — p1-monetization-tools-trio-20260219-1714

## 1) Objective
Launch **3 new monetization calculators** for creator/media/subscription operators with production-ready single-page UX and bilingual (KO/EN) support.

## 2) Scope
### In scope
1. `tools/newsletter-paid-upgrade-revenue-calculator/index.html`
2. `tools/creator-merch-profit-calculator/index.html`
3. `tools/subscription-pause-save-revenue-calculator/index.html`
4. Discovery updates:
   - `tools/index.html`
   - `tools/manifest.json` (regenerated)
   - `_data/tools-list.json`

### Out of scope
- Backend integration, DB, login/session
- Refactor of unrelated tools
- Analytics pipeline changes

## 3) Functional Requirements

### FR-A: Newsletter Paid Upgrade Revenue Calculator
**Purpose:** estimate monthly/period net uplift when free newsletter subscribers convert to paid tiers.

**Inputs**
- Active free subscribers
- Current paid conversion rate (%)
- Target paid conversion rate (%)
- Monthly paid subscription price (KRW)
- Monthly paid churn (%)
- Payment/platform fee (%)
- Content + support cost per paid subscriber (KRW/month)
- Monthly campaign/tool cost (KRW)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Incremental paid subscribers
- Incremental MRR (gross)
- Net incremental MRR (after churn-adjusted retention + fees + variable cost)
- Monthly net impact
- Period net impact
- ROI (%)
- Payback period (months)
- Break-even target conversion rate (%)

---

### FR-B: Creator Merch Profit Calculator
**Purpose:** evaluate merch launch profitability with channel fee, COGS, return, and fulfillment assumptions.

**Inputs**
- Monthly audience size
- Purchase conversion rate (%)
- Average order value (KRW)
- Product COGS ratio (%)
- Fulfillment + packaging cost per order (KRW)
- Platform/payment fee (%)
- Return/refund rate (%)
- Marketing spend (KRW/month)
- Fixed operating cost (KRW/month)
- Analysis period (months)

**Outputs**
- Expected monthly orders
- Gross merchandise sales
- Net recognized sales (after returns)
- Total variable cost
- Contribution profit
- Monthly net profit
- Period net profit
- ROI (%)
- Break-even conversion rate (%)

---

### FR-C: Subscription Pause Save Revenue Calculator
**Purpose:** quantify value of pause-save flow that recovers would-churn subscribers.

**Inputs**
- At-risk subscribers per month
- Baseline churn rate (%)
- Pause offer accept rate (%)
- Reactivation after pause rate (%)
- Monthly ARPU (KRW)
- Gross margin (%)
- Incentive cost per saved user (KRW)
- Program/tool cost (KRW/month)
- One-time setup cost (KRW)
- Analysis period (months)

**Outputs**
- Churned users without pause flow
- Saved users (pause + reactivation)
- Preserved MRR
- Net preserved gross profit (after incentive)
- Monthly net impact
- Period net impact
- ROI (%)
- Break-even accept rate (%)

## 4) UX/UI Requirements
- Single `index.html` per tool (embedded CSS/JS)
- Mobile responsive (2-column desktop / 1-column mobile)
- KO/EN toggle
- Summary textarea + copy-summary button
- Portal backlink with `href="/"`
- Validation error box and deterministic real-time calculation

## 5) Acceptance Criteria
- New 3 slugs are unique and loadable
- `tools/index.html` has 3 new cards
- `_data/tools-list.json` has 3 entries
- `tools/manifest.json` regenerated and includes 3 slugs
- Local HTTP verification returns 200 for all 3 routes
- GitHub Pages live URL verification returns HTTP 200 (<=2 min wait)
- Checkpoints saved under `.state/p1-monetization-tools-trio/20260219-1714/`
