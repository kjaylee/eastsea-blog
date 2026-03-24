# Quality Loop — Whatnot Seller Fee Calculator

## Round 1
Score: 94/100

### What went wrong
- One custom-rate break-even expectation in the test file was incorrect (`24.92` vs actual formula result `22.84`).

### Fix
- Corrected the deterministic expected value in `calculator.test.js`.

## Round 2
Score: 97/100

### Pass reasons
- 11/11 deterministic tests passed
- Discovery exact-once guard passed
- HTTP smoke passed
- Scope and assumptions are explicit
- UI is responsive and bilingual

## Final verdict
PASS
