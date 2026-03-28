# Test Cases — MSP Pricing Calculator

These are future implementation tests only. This task does not create code.

## Pure-calculation tests
1. **TC-MSP-01 baseline model computes monthly cost**
   - Inputs: valid managed users, endpoints, support hours, tool stack cost, and margin assumptions.
   - Expect variable monthly cost, fixed monthly cost, and total delivery cost to compute deterministically.

2. **TC-MSP-02 higher tool stack cost raises required MRR**
   - Hold labor assumptions constant and increase per-user or per-endpoint stack cost.
   - Expect monthly delivery cost, break-even MRR, and recommended MRR to increase.

3. **TC-MSP-03 more after-hours load compresses margin**
   - Hold quote price constant and increase after-hours incident hours or multiplier.
   - Expect monthly delivery cost to rise and gross margin at current quote to fall.

4. **TC-MSP-04 onboarding fee grows with implementation work**
   - Increase onboarding hours with other variables unchanged.
   - Expect suggested onboarding fee to increase proportionally.

5. **TC-MSP-05 higher target margin raises recommended MRR**
   - Hold cost assumptions constant and increase target operating margin.
   - Expect recommended monthly MRR to rise while break-even MRR stays lower than recommended MRR.

6. **TC-MSP-06 break-even user solver returns null when invalid**
   - Use a scenario where the per-user unit contribution is non-positive.
   - Expect `breakEvenManagedUsers` to return `null`.

7. **TC-MSP-07 zero managed users blocks per-user outputs**
   - Set `managedUsers = 0`.
   - Expect `effectivePricePerUser` and user-based reverse-solver outputs to return `null` or a validation error, not divide by zero.

8. **TC-MSP-08 validation rejects invalid inputs**
   - Negative users, negative hours, negative cost, payment fee outside valid range, or margin that makes the denominator non-positive.
   - Expect validation errors instead of silent math.

9. **TC-MSP-09 summary contains quote-ready lines**
   - Summary should include monthly delivery cost, break-even MRR, recommended MRR, onboarding fee, and 12-month contract value.

## UI/content tests
10. **TC-MSP-10 page contains required planning disclaimer**
    - HTML should include canonical, analytics include, visible planning-model disclaimer, summary output, and related-links section.

11. **TC-MSP-11 related links favor nearby B2B pricing tools**
    - Related links should reference live adjacent tools such as `white-label-agency-margin-calculator`, `professional-services-utilization-margin-calculator`, `ai-retainer-profit-planner`, and `fractional-cmo-pricing-calculator`.

12. **TC-MSP-12 title and description match exact intent**
    - Title includes `MSP Pricing Calculator`.
    - Description includes managed service pricing, monthly contract, and margin language.

## Discovery tests for the future ship task
13. **TC-MSP-13 exact-once discovery wiring**
    - After implementation, `tools/index.html` should contain `msp-pricing-calculator` exactly once.
    - `tools/index.md` should contain `msp-pricing-calculator` exactly once.
    - `_data/tools-list.json` should contain `/tools/msp-pricing-calculator/` exactly once.
    - `tools/manifest.json` should contain `msp-pricing-calculator` exactly once after rebuild.

14. **TC-MSP-14 docs-only task left discovery untouched**
    - For this task specifically, discovery counts for `msp-pricing-calculator` should remain `0` because no implementation shipped.
