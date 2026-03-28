# Research — Invoice Late Fee Calculator Hardening

## Candidate source
- Existing page: `tools/invoice-late-fee-calculator/index.html`
- Opportunity ranking evidence: `tmp/subagent-opportunities.json` and `tmp/tool-opportunity-ranker-20260326.json`

## What exists now
- Tool page already exists and renders a working calculator UI.
- `tools/manifest.json` already includes the slug because the page exists on disk.
- `tools/index.html` already references the slug once.
- `_data/tools-list.json` does **not** include the tool, so it is missing from a key discovery surface.
- `tools/index.md` does **not** include the tool, so markdown discovery/indexing coverage is incomplete.
- No external calculator module exists.
- No deterministic automated test coverage exists.

## Business / monetization signal
- Search-intent keywords are explicit: `invoice`, `late fee`, `calculator`.
- User intent is transactional/operational, not entertainment: freelancers, agencies, SMB finance/admin users checking overdue invoice charges.
- This is narrow enough to rank for a specific problem, but close enough to revenue decisions that ad/affiliate/cross-link monetization remains plausible.

## Logic risk found
Current inline logic always applies the fixed late fee (plus fee tax) even when `daysLate = 0` or when the invoice is still inside the grace period.

Current formula snippet effect:
- `billableDays = max(0, daysLate - grace)`
- `feeWithTax = fixedFee * (1 + feeTax / 100)`
- `totalDue = amount + lateInterest + feeWithTax`

Implication:
- A non-late or grace-period invoice still gets charged the fixed late fee.

## Hardening decision
Use a minimal but meaningful shippable slice:
1. Extract invoice late-fee math into `calculator.js`.
2. Add deterministic `calculator.test.js` coverage.
3. Fix the fixed-fee application rule to trigger only when billable days exist after grace.
4. Backfill discovery in `_data/tools-list.json` and `tools/index.md`.

## Why this task is narrow
- Single existing tool page
- Single formula family
- Single repo (`eastsea-blog`)
- No backend, no API, no auth, no deployment automation changes
