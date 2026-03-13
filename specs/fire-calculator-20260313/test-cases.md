# FIRE Calculator — Test Cases

## TC1: Basic FIRE Number
- Input: Annual expenses = $40,000, SWR = 4%
- Expected: FIRE Number = $1,000,000

## TC2: Years to FIRE
- Input: Current savings = $100,000, monthly contribution = $3,000, annual return = 7%, FIRE number = $1,000,000
- Expected: ~12-13 years (compound growth)

## TC3: Savings Rate
- Input: Annual income = $80,000, annual expenses = $40,000
- Expected: Savings rate = 50%

## TC4: Coast FIRE
- Input: Target FIRE number = $1,000,000, years to FIRE = 20, annual return = 7%
- Expected: Coast FIRE number ≈ $258,419

## TC5: Zero savings start
- Input: Current savings = $0, monthly = $2,000, return = 7%
- Expected: Valid calculation, no NaN/errors

## TC6: Already FIRE'd
- Input: Current savings = $1,500,000, FIRE number = $1,000,000
- Expected: "You've already reached FIRE!" message, 0 years

## TC7: Edge - very high expenses
- Input: Annual expenses = $200,000, SWR = 4%
- Expected: FIRE Number = $5,000,000

## TC8: HTML structure
- analytics.js script tag present
- Back to Portal link present
- Responsive layout (grid collapses on mobile)
- No console errors on load
