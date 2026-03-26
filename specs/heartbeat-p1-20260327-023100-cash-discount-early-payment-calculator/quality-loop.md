# Quality Loop — cash-discount-early-payment-calculator

## Pass 1 target
- Distinct from APR sibling tool
- Formula sanity for financing benefit, processing drag, and break-even adoption
- Deterministic tests for core scenarios
- Exact-once discovery wiring

## Outcome
- Distinction preserved by centering v1 on eligible-share + adoption + processing-drag + break-even-adoption planning.
- `calculator.js` exported deterministic logic reused by browser UI and `node --test`.
- Test suite passed:
  - baseline scenario
  - zero-adoption edge case
  - discount sensitivity
  - financing sensitivity
  - impossible break-even state
  - validation guards
  - summary text
  - HTML hooks
  - discovery exact-once

## Open items
- Localhost bind is sandbox-blocked, so browser-route smoke remains recorded as an environment limitation rather than a product bug.
