# Test Cases — white-label-agency-margin-calculator

## Logic unit tests
- TC-L-01: reject invalid utilization below lower bound.
- TC-L-02: reject invalid combinations where payment fee + target margin is impossible.
- TC-L-03: increasing scope creep increases total cost and recommended retainer.
- TC-L-04: increasing revisions increases revision hours and total monthly cost.
- TC-L-05: increasing utilization decreases effective cost/hour and recommended retainer.
- TC-L-06: break-even retainer is finite and positive for default assumptions.
- TC-L-07: summary contains key fields used in pricing decisions.

## Functional checks
- TC-F-01: page loads and default values render KPIs immediately.
- TC-F-02: changing any input recomputes KPIs without page refresh.
- TC-F-03: copy summary button produces non-empty multi-line summary.
- TC-F-04: reset button restores `DEFAULT_INPUT` values.
- TC-F-05: invalid input surfaces explicit validation error message.

## Manifest checks
- TC-M-01: new slug appears in `tools/manifest.json` after rebuild.
- TC-M-02: `tests/unit/test-manifest.mjs` passes with updated manifest.
