# Gap Analysis — ThriveCart vs SamCart Cost Calculator

## What shipped
- A branded comparison calculator targeting `ThriveCart vs SamCart` decision intent.
- Transparent one-time vs monthly platform-cost modeling.
- Break-even month calculation.
- Required SamCart revenue-lift calculation.
- Target-net baseline-gross planner for both scenarios.
- Unit coverage and exact-once discovery checks.

## Remaining gaps
1. **Live pricing drift**
   - ThriveCart’s exact public offer price is not guaranteed by the fetched official HTML snapshot.
   - Mitigation in v1: editable upfront-fee field + explicit disclaimer.

2. **SamCart tier schedule opacity**
   - The fetched public snapshot confirms starting price and the existence of revenue thresholds, but not every step-up fee.
   - Mitigation in v1: editable monthly growth surcharge instead of fake hard-coded tier math.

3. **No feature-value model**
   - The tool does not score funnels, LMS, support, or affiliate features.
   - Accepted: this slice is intentionally economics-first.

4. **Single-currency scope**
   - USD only.
   - Accepted for v1 because the branded query is still useful without FX complexity.

## Follow-up opportunities
- Add annual-billing mode presets for SamCart.
- Add a side-by-side feature checklist only if tied to measurable economic assumptions.
- Add a comparison sibling page for `ThriveCart vs Kajabi` or `ThriveCart vs ClickFunnels` if this query cluster performs.

## Release confidence
High for the current scope because the tool makes its assumptions explicit instead of pretending incomplete public pricing is exhaustive.