# Test Cases — P1 Business Tools Kickoff (2026-02-19)

## A. Spec Validation

### A1. File/Structure
- [ ] Each tool path exists with `index.html`.
- [ ] Each file contains `<title>`, description meta, and `href="/"` portal link.

### A2. Responsiveness
- [ ] 360px viewport renders without horizontal overflow.
- [ ] KPI cards remain readable at mobile width.

## B. Functional Scenarios

### B1. SaaS Unit Economics
1. Input: customers 1200, ARPA 49, margin 78, churn 3.2, CAC 720.
   - Expect: positive LTV, visible LTV:CAC, payback months > 0.
2. Input churn = 0 or negative.
   - Expect: validation error and no invalid division output.

### B2. Cash Conversion Cycle
1. Input: revenue 4,200,000, COGS 2,700,000, inventory 450,000, AR 510,000, AP 390,000, target 12.
   - Expect: DIO/DSO/DPO and CCC populated; cash release > 0.
2. Input COGS = 0.
   - Expect: validation error.

### B3. Sales Commission Planner
1. Input quota 100,000, achieved 138,000 with default tiers.
   - Expect: tier-by-tier payout rows and positive total commission.
2. Input achieved = 0.
   - Expect: commission 0 and no crash.

## C. Integration/Deployment
- [ ] `tools/manifest.json` includes all 3 slugs.
- [ ] `_data/tools-list.json` includes all 3 URLs.
- [ ] Production URLs return expected titles/content after deployment.
