# Spec — Gumroad Net Revenue Calculator

## Slug
`gumroad-net-revenue-calculator`

## User story
As a creator selling digital products on Gumroad, I want to compare direct/profile sales and Discover sales so I can estimate take-home revenue after Gumroad fees, estimated payment processing, and payout drag.

## Scope
### Inputs
- Direct/profile gross sales (USD)
- Direct/profile order count
- Discover gross sales (USD)
- Discover order count
- Direct processing preset: Stripe domestic, PayPal standard, custom
- Custom direct processing rate % and flat fee
- Payout delay days
- Annual cash-cost / payout-drag rate %

### Outputs
- Net revenue after Gumroad fees, direct processing, and payout drag
- Blended take-home rate
- Direct take-home before drag
- Discover take-home before drag
- Gumroad platform fees total
- Direct processing fees total
- Payout drag cost
- Direct average order value
- Discover average order value
- Direct take-home per order
- Discover take-home per order
- Comparison table across processor presets
- Copy-ready decision summary

## Rules
### Official pricing math
- Direct Gumroad fee = `directGross * 10% + directOrders * $0.50`
- Discover Gumroad fee = `discoverGross * 30%`
- Gumroad monthly fee = `$0`
- Merchant-of-record tax handling is informational only, not added as a creator fee line

### Assumption math
- Direct processing fee = `directGross * processorRate + directOrders * processorFlat`
- Discover processing is treated as included in the 30% Discover fee
- Payout drag cost = `(directNetBeforeDrag + discoverNetBeforeDrag) * annualCashCostRate * payoutDelayDays / 365`

### Validation
- Gross sales cannot be negative
- At least one of direct or Discover gross must be greater than zero
- If a gross amount is greater than zero, its order count must be greater than zero
- Order counts cannot be negative
- Processing preset must be recognized
- Custom rate must be `>= 0` and `< 100`
- Custom flat fee must be `>= 0`
- Payout delay days must be `>= 0` and `<= 365`
- Annual cash-cost rate must be `>= 0` and `< 100`

## UX requirements
- Single static page under `tools/gumroad-net-revenue-calculator/`
- English/Korean-friendly presentation with a language toggle for dynamic strings
- Transparent formula disclosure and assumptions note
- Results update on button click and reset cleanly
- Mobile-safe responsive layout
- Copy-summary button

## SEO requirements
- Title includes `Gumroad Net Revenue Calculator`
- Description mentions direct sales, Discover fee, payout drag
- Canonical URL set to `/tools/gumroad-net-revenue-calculator/`
- Tool listed exactly once in `_data/tools-list.json`
- Tool listed exactly once in `tools/manifest.json`
- Existing discovery entries in `tools/index.html` and `tools/index.md` remain unchanged and still resolve to a real page

## Files
- `tools/gumroad-net-revenue-calculator/index.html`
- `tools/gumroad-net-revenue-calculator/calculator.js`
- `tools/gumroad-net-revenue-calculator/calculator.test.js`
- `_data/tools-list.json`
- `tools/manifest.json`

## Done definition
- Deterministic tests pass via `node --test tools/gumroad-net-revenue-calculator/calculator.test.js`
- Local HTTP serve returns 200 for `/tools/gumroad-net-revenue-calculator/`
- HTML contains expected SEO/title/form anchors
- Discovery metadata exact-once test passes
