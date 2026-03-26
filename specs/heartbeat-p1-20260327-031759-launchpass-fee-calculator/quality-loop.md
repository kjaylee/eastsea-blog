# Quality Loop — LaunchPass Fee Calculator

## Round 1
Score: 84/100

Expected gaps to pressure-test:
- refund behavior may be implemented incorrectly if LaunchPass fee is refunded in code
- break-even formulas may accidentally ignore processor flat-fee rate
- discovery insertion may create duplicate slug references

Planned action:
- verify formulas against the documented refund rule
- assert break-even and target gross numerically in unit tests
- add exact-once checks in the tool test file

## Round 2
Score: 95/100

Checks:
- syntax checks pass
- node tests pass
- exact-once counts pass
- localhost smoke blocked by sandbox bind permissions; blocker recorded explicitly in `verification.md`

Verdict:
- Pass
