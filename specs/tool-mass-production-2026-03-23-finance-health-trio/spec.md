# Spec — Mortgage Extra Payment / BMI+BFP / CAGR Trio

## Scope
Ship three target tool pages under `tools/` with pure vanilla JS and embedded CSS.

### Deliverables
1. `tools/mortgage-extra-payment-calculator/index.html` — new
2. `tools/bmi-bfp-calculator/index.html` — new
3. `tools/cagr-calculator/index.html` — refreshed existing slug to avoid duplication
4. `_data/tools-list.json` updates
5. `tools/index.md` updates
6. `tools/index.html` card wiring
7. `tools/manifest.json` rebuild via script

## Shared requirements
- Single-file HTML per tool
- Fully standalone, no CDN
- Responsive layout
- Korean-first copy with clear English terminology where useful
- Back link to `/tools/` or parent tools index
- Analytics include kept consistent with repo pattern
- Deterministic calculator functions separated enough for verification

## Tool-specific requirements
### mortgage-extra-payment-calculator
Must compute:
- base scheduled payment
- base total interest / payoff months
- accelerated total interest / payoff months
- interest saved
- time saved
- amortization preview rows
- handling for zero-interest edge case

### bmi-bfp-calculator
Must compute:
- BMI
- BMI category
- US Navy body-fat percentage
- body-fat category by sex
- fat mass / lean mass
- healthy-weight range
- metric and imperial input support
- clear validation when circumference inputs are impossible

### cagr-calculator
Must support:
- CAGR from start/end/years
- total return, absolute gain, real CAGR, doubling time
- future-value projection from chosen CAGR
- target planning summary
- preserve slug `cagr-calculator`

## Out of scope
- Medical diagnosis claims
- Tax/legal advice
- ARM / variable-rate mortgage modeling
- irregular multi-event mortgage calendars beyond monthly extra + annual lump sum
