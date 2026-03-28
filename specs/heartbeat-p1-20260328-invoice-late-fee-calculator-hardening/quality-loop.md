# Quality Loop — Invoice Late Fee Calculator Hardening

## Iteration 1
- Score: 78/100
- Missing:
  - no pure calculator module
  - no automated tests
  - discovery missing from tools-list/index.md
  - grace-period fixed-fee bug still present

## Iteration 2
- Score: 95/100
- Fixed:
  - extracted calculator logic to `calculator.js`
  - added `calculator.test.js` with 8 passing checks
  - restored catalog coverage
  - corrected fixed-fee behavior after grace period

## Final
- Pass
- Final score: 95/100
