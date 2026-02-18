# Test Cases — P1 Monetization Tools Trio (2026-02-19 06:31 KST)

## A. SDD/TDD Structure
1. Confirm `spec.md`, `plan.md`, `test-cases.md`, `tasks.md` exist in `specs/p1-monetization-tools-trio-20260219-0631/`.
   - Expected: all four files present before implementation changes.

## B. Shared UI/Validation
1. Open each new tool page at desktop and mobile widths.
   - Expected: responsive layout, no horizontal overflow.
2. Inspect portal button markup.
   - Expected: exact `href="/"` appears once in top navigation.
3. Enter invalid values (negative costs, percentages >100, blanks/non-finite).
   - Expected: validation message shown and KPI outputs are not shown as NaN/Infinity.

## C. Calculator-Specific Logic
### 1) Warehouse Automation CAPEX ROI Calculator
- Given positive labor savings, quality savings, throughput contribution, and costs:
  - Expected KPIs: annual gross benefit, annual net benefit, payback months, year-1 ROI, NPV, break-even labor-savings rate.
- If annual net benefit <= 0:
  - Expected: payback shown as not achievable / no positive payback.

### 2) Dunning Recovery ROI Calculator
- With improved recovery rate > current recovery rate:
  - Expected: incremental recovered MRR and net monthly impact > 0 (for sane defaults).
- With target recovery <= current recovery and non-zero tool cost:
  - Expected: negative or low net impact and warning-like output.
- Break-even recovery uplift:
  - Expected: finite percentage-point requirement when at-risk MRR and margin are >0.

### 3) B2B Proposal Win Rate ROI Calculator
- With target win rate > baseline:
  - Expected: incremental bookings and gross profit increase.
- If monthly tool cost is high:
  - Expected: break-even win rate requirement increases.
- If opportunities/ACV/margin are zero:
  - Expected: validation blocks computation.

## D. Manifest/Data/Deploy
1. `tools/manifest.json` contains:
   - `warehouse-automation-capex-roi-calculator`
   - `dunning-recovery-roi-calculator`
   - `b2b-proposal-win-rate-roi-calculator`
2. `_data/tools-list.json` contains URLs for all three slugs.
3. After push, `curl -I` against each production URL returns HTTP 200.