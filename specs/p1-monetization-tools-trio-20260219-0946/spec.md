# Spec — P1 Monetization Tools Trio (20260219-0946)

## 1) Objective
Launch **3 brand-new business/monetization calculators** as single-page tools under `/tools/`, each with:
- bilingual UI (Korean + English)
- mobile-responsive layout
- deterministic in-browser calculation logic
- clear KPI output + copyable summary

Also integrate them into tool discovery surfaces:
- `tools/index.html` card list
- `tools/manifest.json`
- `_data/tools-list.json`

---

## 2) New Tools

### Tool A: SaaS Expansion MRR Waterfall Calculator
- **Slug:** `saas-expansion-mrr-waterfall-calculator`
- **Purpose:** quantify monthly MRR movement and retention quality.
- **Core inputs:** starting MRR, new logo MRR, expansion rate, contraction rate, churn rate, reactivation MRR.
- **Core outputs:** expansion/contraction/churn MRR, ending MRR, net new MRR, NRR, GRR, ARR run-rate delta.

### Tool B: E-commerce Contribution Margin Stack Calculator
- **Slug:** `ecommerce-contribution-margin-stack-calculator`
- **Purpose:** model profitability stack from GMV to contribution margin.
- **Core inputs:** monthly orders, AOV, COGS %, payment fee %, fulfillment/order, shipping subsidy/order, return rate %, return processing/order, ad spend, fixed OPEX.
- **Core outputs:** GMV, net sales, gross profit, variable cost total, contribution profit, contribution margin %, break-even AOV.

### Tool C: Revenue-based Financing Cost Calculator
- **Slug:** `revenue-based-financing-cost-calculator`
- **Purpose:** estimate cost and payoff speed for revenue-based financing.
- **Core inputs:** financing amount, factor rate, revenue share %, current monthly revenue, monthly revenue growth %, minimum payment.
- **Core outputs:** total payback, expected repayment months, average payment, estimated effective APR (IRR approximation), first 12-month payment preview.

---

## 3) Formula Requirements

### A) SaaS Waterfall
- `expansionMRR = startingMRR * expansionRate`
- `contractionMRR = startingMRR * contractionRate`
- `churnMRR = startingMRR * churnRate`
- `endingMRR = startingMRR + newLogoMRR + expansionMRR + reactivationMRR - contractionMRR - churnMRR`
- `netNewMRR = endingMRR - startingMRR`
- `NRR = (startingMRR + expansionMRR - contractionMRR - churnMRR) / startingMRR`
- `GRR = (startingMRR - contractionMRR - churnMRR) / startingMRR`

### B) E-commerce Margin Stack
- `gmv = orders * aov`
- `returnsValue = gmv * returnRate`
- `netSales = gmv - returnsValue`
- `cogs = gmv * cogsRate`
- `paymentFees = netSales * paymentFeeRate`
- `fulfillment = orders * fulfillmentPerOrder`
- `shippingSubsidy = orders * shippingSubsidyPerOrder`
- `returnProcessing = (orders * returnRate) * returnProcessingPerReturn`
- `variableCost = cogs + paymentFees + fulfillment + shippingSubsidy + returnProcessing`
- `contributionProfit = netSales - variableCost - adSpend - fixedOpex`
- `contributionMargin = contributionProfit / netSales`

### C) Revenue-based Financing
- `totalPayback = financingAmount * factorRate`
- Monthly payment simulation:
  - `monthRevenue_t = monthRevenue_(t-1) * (1 + growthRate)`
  - `payment_t = max(monthRevenue_t * revenueShareRate, minPayment)`
  - stop when cumulative payment reaches `totalPayback`
- `estimatedAPR`: IRR of cashflows `[+financingAmount, -payment_1, -payment_2, ...]` converted to annual.

---

## 4) UX / Content Requirements
- Top-right portal button must be `href="/"` (tools.eastsea.xyz routing compatibility).
- Input validation with human-readable KR messages.
- Results update live on input change.
- Summary textarea + “copy summary” button.
- Dark, card-based responsive layout (`@media` for <= 860px).

---

## 5) Acceptance Criteria
1. 3 new tool pages exist and render without JS errors.
2. Every tool returns numeric outputs for default sample values.
3. Each tool supports mobile layout and bilingual labels/headings.
4. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json` include all 3 tools.
5. Local HTTP serving returns `200` for each new tool URL.
6. Changes are committed and pushed with required commit message.
7. Public live URLs return `200` post deployment.
