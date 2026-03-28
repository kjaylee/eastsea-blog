# Research — GoFundMe Fee Calculator

## Goal
Pick one truly new, high-ROI tool slice that can be shipped quickly and verified deterministically without relying on backend services.

## Candidate decision
Chosen slug: `gofundme-fee-calculator`

Why this won:
- High-intent query shape: exact-match fee-calculator demand exists (`gofundme fee calculator` returns dedicated competitor pages in fallback search).
- Public official math exists, unlike custom-priced MoR platforms.
- Narrow first slice: organizer take-home math can be modeled with a single public fee baseline.
- Distinct audience from creator-store tools already in the repo; it expands into fundraising economics.

## Official source facts
### GoFundMe pricing page
Source: `https://www.gofundme.com/c/pricing`

Observed facts from web fetch:
- For individual/business fundraising there is **no fee to create or manage a fundraiser**.
- Standard transaction fee is **2.9% + $0.30** per donation in the US.
- Donor contributions to GoFundMe are optional and are not required.
- International transaction/conversion fees may apply depending on payment method.

### GoFundMe fee explainer
Source: `https://www.gofundme.com/c/blog/gofundme-fees`

Observed facts from web fetch:
- GoFundMe states there is no platform fee to start/manage a fundraiser in the US.
- The transaction fee is **2.9% + $0.30 per donation**.
- Recurring monthly donations carry an additional **5% fee per donation**.
- The recurring fee is described as donor-paid feature support, so the conservative v1 model treats it as donor checkout lift rather than organizer revenue loss.

## Product shape
A static calculator focused on organizer take-home for US individual/business fundraisers.

### Inputs
- donation count
- average donation amount
- recurring monthly donation mode toggle
- transaction fee % (default 2.9)
- transaction fixed fee (default 0.30)
- recurring donor fee % (default 5)
- campaign costs
- target net amount
- currency / summary language

### Outputs
- gross donations
- transaction fees
- organizer net before costs
- campaign net after costs
- donor extra recurring fee
- donor checkout total
- effective organizer fee rate
- net per donation after costs
- break-even average donation
- target average donation
- copyable summary block

## Scope boundaries
- Do not model GoFundMe Pro custom pricing.
- Do not model charity-specific pricing in v1.
- Do not model international FX/processor edge cases.
- Do not add catalog-surface wiring in this slice; ship the page + manifest entry first to avoid risky concurrent edits in already-dirty shared catalog files.

## Implementation references
- `tools/buy-me-a-coffee-fee-calculator/` for fee-calculator shell patterns.
- `tools/ko-fi-fee-calculator/` for deterministic calculator.js + test style.

## Decision
`gofundme-fee-calculator` is the safest net-new, high-intent opportunity because the public fee math is documented, the slice is narrow, and it adds a new fundraising economics entry without backend complexity.
