# Spec — Invoice Late Fee Calculator Hardening

## Goal
Ship a safer, verifiable v1 of `invoice-late-fee-calculator` by externalizing the formula, adding tests, and restoring discovery coverage.

## Scope
- Tool: `tools/invoice-late-fee-calculator/`
- Repo: `eastsea-blog`

## Functional requirements
1. The calculator must accept:
   - original invoice amount
   - days late
   - annual late-interest rate
   - grace period
   - fixed late fee
   - fee VAT/tax rate
2. The calculator must output:
   - billable late days
   - daily late interest
   - accrued late interest
   - fixed late fee including fee tax
   - total due
   - burden rate vs original amount
   - scenario table for 7/14/30/60/90 days
   - copy-ready summary text
3. Validation errors must block result rendering.
4. Fixed late fee assumption for v1:
   - applies **once** only when `daysLate > grace`
   - does **not** apply when the invoice is not late or still inside grace

## Non-functional requirements
- No dependencies
- Static browser-only tool
- Node-testable pure calculation module
- Preserve current UX tone and layout with only surgical UI changes

## Discovery requirements
- Tool must exist exactly once in `_data/tools-list.json`
- Tool must exist exactly once in `tools/index.md`

## SEO / monetization framing
- Keep existing title/description intent centered on “invoice late fee calculator”.
- Maintain a business/finance-oriented description for discovery surfaces.
