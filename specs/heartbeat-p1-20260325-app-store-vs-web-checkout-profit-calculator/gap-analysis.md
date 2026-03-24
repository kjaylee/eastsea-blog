# Gap Analysis — App Store vs Web Checkout Profit Calculator

## What was closed
- Broken discovery gap closed: catalog/index pointed to a missing page.
- Tool now has:
  - real user-facing page
  - tested pure logic module
  - surgical manifest entry
  - local smoke verification

## Remaining intentional limitations (v1)
- No VAT/GST/tax remittance modeling
- No reader-link / DMA / alternative billing policy branching
- No chargeback dispute fee modeling
- No country-specific processor fee schedules
- No coupon / annual-plan / family-plan logic

## Why these were deferred
They increase decision-surface complexity and data-maintenance burden without blocking the core user question: “Does web checkout beat App Store once I include conversion leakage and fees?”

## Next adjacent gap candidate
`merchant-of-record-vs-direct-billing-profit-calculator`

Reason:
- already linked in discovery
- adjacent to the just-shipped tool
- same monetization audience and formula family
- good follow-on page to deepen the app/payments cluster without context switching
