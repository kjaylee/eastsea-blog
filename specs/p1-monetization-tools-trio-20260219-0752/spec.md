# Spec — P1 Monetization Tools Trio (2026-02-19 07:52 KST)

## Goal
Ship 3 **new** monetizable business calculators as static tools under `tools/<slug>/index.html` in `eastsea-blog`.

## Scope
Create the following new tools:
1. `sales-capacity-plan-calculator`
2. `subscription-gross-net-retention-calculator`
3. `cash-discount-early-payment-calculator`

## Functional Requirements
Each tool must:
- Be a self-contained static HTML page (`index.html`) with embedded CSS/JS.
- Be mobile-responsive (desktop + phone layouts).
- Enforce robust input validation (range checks + cross-field checks + safe fail states).
- Output actionable business KPI metrics.
- Provide a summary textarea and **summary-copy CTA** (clipboard copy button).
- Include a top portal link with `href='/'` only.

### Tool-specific KPI expectations

#### 1) Sales Capacity Plan Calculator
Must calculate at least:
- Effective rep capacity
- Expected bookings
- Expected won deals
- Required qualified pipeline
- Pipeline health/coverage ratio
- Headcount gap vs target

#### 2) Subscription Gross/Net Retention Calculator
Must calculate at least:
- GRR
- NRR
- Ending existing-base MRR
- Ending total MRR (including new)
- Net MRR growth
- Retention program ROI proxy metric

#### 3) Cash Discount Early Payment Calculator
Must calculate at least:
- Early-pay eligible volume
- Discount + processing cost
- Working-capital financing benefit from accelerated cash
- Bad-debt savings effect
- Net monthly and annual impact
- ROI / payback signal

## Integration Requirements
- Add 3 tool cards to `tools/index.html`.
- Regenerate `tools/manifest.json` using existing script.
- Update `_data/tools-list.json` with metadata entries for all 3 tools.

## Delivery Requirements
- Commit and push only changed files to `master`.
- Validate live URLs return HTTP 200 for all 3 new tool pages.

## Non-Goals
- No backend/API dependency.
- No framework migration.
- No edits outside required files.