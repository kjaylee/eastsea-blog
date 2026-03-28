# Spec — Fractional CMO Pricing Calculator

## Objective
Create a dedicated web calculator that helps founders and consultants price a fractional CMO engagement using delivery hours, support load, scope buffer, margin target, onboarding work, and contract length.

## User
- Founder hiring a fractional CMO
- Fractional CMO building a proposal
- Agency owner converting to executive-retainer offers

## User stories
1. As a fractional CMO, I can enter my delivery assumptions and get a recommended monthly retainer.
2. As a consultant, I can compare current pricing vs sustainable pricing.
3. As a founder, I can understand what drives a fractional CMO retainer.
4. As a seller, I can copy a clean summary into a proposal or email.

## Scope
### In scope
- Single static tool page at `tools/fractional-cmo-pricing-calculator/index.html`
- Pure calculation logic in `calculator.js`
- UI wiring in `app.js`
- KPI cards + pricing table + tier ladder + summary area
- FAQ / SEO copy
- Catalog wiring in:
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Deterministic unit test file

### Out of scope
- Lead capture forms
- Backend persistence
- PDF export
- AI-generated proposal text
- Multi-currency / locale switching

## Inputs
- Current retainer (USD)
- Strategy hours / month
- Leadership hours / month
- Channel review hours / month
- Support hours / month
- Senior rate / hour
- Support rate / hour
- Tools / data budget / month
- Overhead / month
- Scope buffer (%)
- Payment fee (%)
- Target margin (%)
- Onboarding hours
- Expected contract months

## Outputs
- Total senior hours
- Total support hours
- Total delivery hours
- Monthly delivery cost
- Break-even retainer
- Recommended retainer
- Suggested onboarding fee
- Current operating profit
- Current operating margin
- Margin gap to target
- Contract value estimate
- Package tiers:
  - Advisor
  - Growth
  - Performance
- Copyable text summary

## Validation rules
- Numeric finite values only
- No negative costs or hours where nonsensical
- `paymentFeePct + targetMarginPct < 100`
- `contractMonths >= 1`
- Return user-facing error when impossible pricing state occurs

## Content / SEO requirements
- Title should explicitly include “Fractional CMO Pricing Calculator”
- Meta description should mention retainer, onboarding fee, and monthly pricing
- Include FAQ answering:
  - how much does a fractional CMO cost?
  - hourly vs monthly retainer?
  - should onboarding be billed separately?
- Include canonical URL and WebApplication JSON-LD

## UX requirements
- Premium operator look, optimized for desktop and mobile
- First-screen KPIs visible without scrolling too far
- Inputs grouped logically
- Output numbers formatted as USD or percentages
- Error state clearly visible
- Copy summary button works
- Reset defaults button works

## Non-functional requirements
- No external dependencies beyond current repo conventions
- Client-side only
- Fast initial render
- Deterministic calculations
- Must work from a static HTTP server

## Done criteria
- New tool page renders locally
- Calculator logic passes automated tests
- Catalog/index wiring exact-once in all required files
- Screenshot captured from local render
- Verification evidence recorded
