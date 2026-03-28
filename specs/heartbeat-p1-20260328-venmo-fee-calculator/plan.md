# Plan — Venmo Fee Calculator

## Build slice
Ship one new fee calculator page plus exact-once catalog wiring.

## Steps
1. Implement a reusable calculator module in `calculator.js`
   - presets
   - validation
   - per-mode fee math
   - per-transfer instant transfer math
   - binary-search helpers for target average payment and break-even payment count
2. Build `index.html`
   - EastSea-style hero/panel layout
   - inputs/results/assumptions/summary
   - bilingual text hooks
3. Add Node tests in `calculator.test.js`
   - preset correctness
   - baseline scenario math
   - instant transfer min/max behavior
   - comparison ordering sanity
   - invalid input guards
   - exact-once discovery wiring
4. Update discovery surfaces exactly once
5. Verify with Node tests, JSON validation, local browser render, and screenshot evidence
6. Score against spec and record the quality loop

## Verification evidence to capture
- `node --check`
- `node --test`
- JSON validation pass
- browser screenshot of the local page
- final verification notes with observed numbers
