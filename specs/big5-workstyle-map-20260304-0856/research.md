# Research — big5-workstyle-map

## Objective
- Deliver one monetizable vertical slice for `big5-workstyle-map` with separated logic/UI modules and unit-test coverage.

## Existing State Observed
- `tools/big5-workstyle-map/index.html` already existed with a large inline script and no module split.
- `tools/manifest.json` already contained `big5-workstyle-map`, so this is an iteration rather than a brand-new route.
- Recent tool slices in this repo use `index.html` + `app.mjs` + `logic.mjs` + `tests/unit/<slug>.test.mjs`.

## Product Direction
- Keep the quiz style (Big Five/OCEAN, 15 questions) but move all scoring and summary generation into pure functions.
- Add a clear monetization hook: archetype-specific premium offer shown in result card.
- Keep UX static-host friendly: no backend dependencies, browser-only localStorage persistence.

## Technical Constraints
- `app.mjs` must import and use functions from `logic.mjs`.
- Validation should be deterministic and unit-testable.
- Ensure compatibility with existing manifest test (`tests/unit/test-manifest.mjs`).

