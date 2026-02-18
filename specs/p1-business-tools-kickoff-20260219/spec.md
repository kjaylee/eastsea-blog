# Spec — P1 Business Tools Kickoff (2026-02-19)

## Objective
Ship 3 **new** high-ROI business web tools end-to-end in `eastsea-blog/tools`.

## In Scope
Create self-contained (single-file) tools:
1. `tools/saas-unit-economics-calculator/index.html`
2. `tools/cash-conversion-cycle-calculator/index.html`
3. `tools/sales-commission-planner/index.html`

Update discovery/listing artifacts:
- `tools/manifest.json`
- `_data/tools-list.json`

## Functional Requirements

### Common
- Korean-first UI with clear KPI cards.
- Desktop + mobile responsive layout.
- `Back to Portal` link with `href="/"`.
- Input validation for invalid/zero/negative denominators.
- Copy/share-friendly summary output.

### Tool-Specific

#### 1) SaaS Unit Economics Calculator
- Inputs: active customers, ARPA, gross margin %, monthly churn %, CAC.
- Outputs: MRR, gross profit MRR, LTV, LTV:CAC ratio, CAC payback months.
- Scenario table: churn sensitivity (e.g., -1pp / baseline / +1pp).

#### 2) Cash Conversion Cycle Calculator
- Inputs: annual revenue, annual COGS, avg inventory, avg AR, avg AP, target CCC improvement days.
- Outputs: DIO, DSO, DPO, CCC, daily COGS, working capital tied in cycle, expected cash release from target improvement.

#### 3) Sales Commission Planner
- Inputs: base salary, quota, achieved sales, tier thresholds/rates.
- Outputs: attainment %, total commission, tier-by-tier payout breakdown, effective commission rate, total monthly compensation.

## Non-Functional Requirements
- No external CDN or backend dependency.
- Modern evergreen browser compatibility.
- Logic and formulas readable in inline JS.
