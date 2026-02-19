# Spec — p1-monetization-tools-trio-20260219-0905

## 1) Objective
Ship **3 new monetizable business calculators** (single-file, mobile responsive) focused on expansion revenue, partner marketing ROI, and services utilization margin.

## 2) Scope
### In scope
1. `tools/enterprise-seat-expansion-roi-calculator/index.html`
2. `tools/partner-mdf-roi-calculator/index.html`
3. `tools/professional-services-utilization-margin-calculator/index.html`
4. Discovery/crawl updates:
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of scope
- Backend APIs / data persistence
- Redesign of existing tools
- Non-business utilities

## 3) Functional Requirements

### FR-A: Enterprise Seat Expansion ROI Calculator
**Purpose:** estimate incremental ARR, gross profit, net impact, ROI, and break-even take rate for enterprise seat expansion/upsell.

**Inputs**
- Target accounts (개)
- Expansion take rate (% of accounts)
- Expansion seats per account (석)
- Price per seat per month (₩)
- Expansion discount (%)
- Gross margin rate (% of revenue)
- Sales commission rate (% of revenue)
- Support cost per expanded account per month (₩)
- Analysis period (months)
- One-time enablement cost (₩)

**Outputs**
- Monthly expansion revenue
- Expansion ARR
- Monthly gross profit
- Monthly net impact
- Period net impact
- ROI (%)
- Payback months
- Break-even take rate (% of accounts)
- Margin per expanded account (per month)

**Formula notes**
- `unitRevenue = seats * price * (1 - discount)`
- `monthlyRevenue = accounts * takeRate * unitRevenue`
- `monthlyGrossProfit = monthlyRevenue * grossMargin`
- `monthlyCommission = monthlyRevenue * commissionRate`
- `monthlySupport = accounts * takeRate * supportCost`
- `monthlyNet = monthlyGrossProfit - monthlyCommission - monthlySupport`
- `totalCost = (monthlyCommission + monthlySupport) * months + enablementCost`
- `totalGrossProfit = monthlyGrossProfit * months`
- `netImpact = totalGrossProfit - totalCost`
- `roi = netImpact / totalCost`
- `payback = enablementCost / monthlyNet`
- `marginPerAccount = unitRevenue * (grossMargin - commissionRate) - supportCost`
- `breakEvenTakeRate = enablementCost / (accounts * marginPerAccount * months)`

---

### FR-B: Partner MDF ROI Calculator
**Purpose:** evaluate partner MDF (Marketing Development Funds) ROI with pipeline conversion, rebates, and internal campaign costs.

**Inputs**
- MDF budget (₩)
- Partner co-invest (₩)
- Internal ops cost (₩)
- Leads generated (건)
- Lead → Opportunity rate (%)
- Win rate (%)
- Average deal size (₩, ACV)
- Gross margin rate (%)
- Rebate rate (% of revenue)
- Sales cycle (months)

**Outputs**
- Expected opportunities
- Expected closed-won deals
- Expected revenue (ARR)
- Gross profit
- Net profit after rebates + costs
- ROI (%)
- Payback months (sales cycle + cost recovery)
- Break-even win rate (%)
- Total campaign spend (MDF + co-invest)

**Formula notes**
- `opps = leads * leadToOppRate`
- `deals = opps * winRate`
- `revenue = deals * avgDealSize`
- `grossProfit = revenue * grossMargin`
- `rebateCost = revenue * rebateRate`
- `ownerCost = mdfBudget + internalOpsCost`
- `netProfit = grossProfit - rebateCost - ownerCost`
- `roi = netProfit / ownerCost`
- `payback = salesCycle + ownerCost / (grossProfit / 12)`
- `breakEvenWinRate = ownerCost / (leads * leadToOppRate * avgDealSize * (grossMargin - rebateRate))`

---

### FR-C: Professional Services Utilization & Margin Calculator
**Purpose:** compute monthly billings, operating margin, break-even utilization, and required rate to hit target margin for professional services teams.

**Inputs**
- Consultant headcount (명)
- Available hours per consultant per month (h)
- Utilization rate (%)
- Billable rate per hour (₩)
- Monthly cost per consultant (₩)
- Subcontractor mix (% of billable hours)
- Subcontractor cost per hour (₩)
- Overhead rate (% of revenue)
- Tooling cost per consultant per month (₩)
- Target operating margin (%)

**Outputs**
- Monthly billings
- Operating profit
- Operating margin (%)
- Profit per consultant (per month)
- Break-even utilization (%)
- Required billable rate for target margin (₩/h)
- Cost breakdown (labor, subcontractor, overhead, tooling)

**Formula notes**
- `billableHours = headcount * hours * utilizationRate`
- `revenue = billableHours * billableRate`
- `internalCost = headcount * monthlyCost`
- `subHours = billableHours * subcontractorMix`
- `subCost = subHours * subcontractorCostPerHour`
- `toolingCost = headcount * toolingCostPerConsultant`
- `overhead = revenue * overheadRate`
- `operatingProfit = revenue - internalCost - subCost - toolingCost - overhead`
- `operatingMargin = operatingProfit / revenue`
- `profitPerConsultant = operatingProfit / headcount`
- `breakEvenUtil = (internalCost + toolingCost) / (headcount * hours * (billableRate*(1-overheadRate) - subcontractorMix*subcontractorCostPerHour))`
- `requiredRate = (billableHours*subcontractorMix*subcontractorCostPerHour + internalCost + toolingCost) / (billableHours*(1-overheadRate-targetMargin))`

## 4) UX/UI Requirements
- Single-file HTML with embedded CSS/JS only
- Responsive 2-column desktop / 1-column mobile (<900px)
- Live recalculation on input/change events
- Input validation with visible error box
- KPI cards + details table + copyable summary text

## 5) Non-Functional Requirements
- Deterministic computation only (no external calls)
- Guard for NaN/Infinity/divide-by-zero
- Korean-first labels and KPI explanations

## 6) Acceptance Criteria
- 3 unique tool slugs created and loadable
- Discovery files updated with all 3 URLs
- Local HTTP 200 checks pass
- Live URLs verified after push
- Checkpoints persisted under `.state/p1-monetization-tools-trio/20260219-0905/`
