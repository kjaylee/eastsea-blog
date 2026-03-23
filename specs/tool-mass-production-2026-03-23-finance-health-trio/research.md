# Research — Mortgage Extra Payment / BMI+BFP / CAGR Trio

## Goal
Ship three target tools into `eastsea-blog` while respecting the anti-duplication rule and the single-file constraint:
1. `mortgage-extra-payment-calculator` — new
2. `bmi-bfp-calculator` — new
3. `cagr-calculator` — already exists, so **refresh the existing slug instead of creating a duplicate**

## Anti-duplication proof
Catalog surfaces checked before build:

- `tools/` directory names
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`

Results:
- `mortgage-extra-payment-calculator`: no existing directory or catalog entry
- `bmi-bfp-calculator`: no existing directory or catalog entry
- `cagr-calculator`: existing directory + existing `_data/tools-list.json` entry already present

Conclusion:
- We can safely add two new tools.
- For CAGR, creating a second slug would violate the stated rule. The correct move is to upgrade the existing `tools/cagr-calculator/index.html` to the requested quality level and wire it into missing catalog surfaces.

## Existing local patterns reviewed
- `tools/mortgage-calculator/index.html`
  - loan amortization formula pattern
  - payoff schedule rendering
  - multi-card financial UI style
- `tools/bmi-calculator/index.html`
  - compact health-calculator UI pattern
- `tools/body-fat-calculator/index.html`
  - US Navy body-fat formula implementation pattern
- `tools/cagr-calculator/index.html`
  - existing CAGR scope and wording

## Formula / source notes
### Mortgage extra-payment logic
Industry-standard amortization math:
- Scheduled monthly payment for fixed-rate mortgage:
  - `payment = P * r * (1+r)^n / ((1+r)^n - 1)`
  - where `P = principal`, `r = monthly interest rate`, `n = total months`
- Extra payments reduce principal directly after scheduled payment allocation.
- Search review confirms common user intent and feature set around monthly extra, annual lump sum, and payoff-time reduction:
  - U.S. Bank amortization/extra payment calculator
  - Bankrate amortization calculator
  - Ramsey mortgage payoff calculator

### BMI + body-fat percentage
- BMI formula: `weightKg / heightM^2`
- US Navy body-fat estimation formula (inch-based circumference method):
  - Men: `86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76`
  - Women: `163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387`
- Search review matches the standard public formula references:
  - Medicine LibreTexts explanation of the U.S. Navy body-fat formula
  - multiple calculator references citing the same coefficients

### CAGR
- Standard CAGR formula:
  - `CAGR = (ending / beginning)^(1 / years) - 1`
- Search review matches public finance references such as Investopedia / CFI / Wall Street Prep.

## Product decisions
### 1) mortgage-extra-payment-calculator
Inputs:
- loan amount
- annual interest rate
- term in years
- recurring monthly extra payment
- yearly lump-sum prepayment
- extra-payment start month
- lump-sum month

Outputs:
- scheduled monthly payment
- payoff time with and without extra payments
- total interest with and without extra payments
- interest saved
- months/years saved
- balance summary and amortization table preview

### 2) bmi-bfp-calculator
Inputs:
- sex
- unit system (metric / imperial)
- height
- weight
- neck circumference
- waist circumference
- hip circumference (women)
- age (optional display context)

Outputs:
- BMI + BMI category
- body-fat % + category
- fat mass
- lean mass
- healthy-weight range from BMI
- interpretation note when BMI and BFP tell different stories

### 3) cagr-calculator (refresh existing slug)
Inputs / modes:
- beginning value
- ending value
- period in years
- optional inflation
- optional target CAGR / future value scenario

Outputs:
- CAGR
- total return
- absolute gain
- real CAGR after inflation
- doubling time (Rule of 72)
- future value projection table
- reverse-planning summary

## Constraint handling
- All three tools will stay as **single-file standalone** HTML pages with embedded CSS + JS.
- No CDN, no external JS libraries.
- No browser automation will be used on Mac Studio.
- Catalog update path: `_data/tools-list.json` + `tools/index.md` + `tools/index.html` + `bash scripts/build-manifests.sh`.

## Chosen slugs
- `mortgage-extra-payment-calculator`
- `bmi-bfp-calculator`
- `cagr-calculator` (existing slug refreshed, not duplicated)
