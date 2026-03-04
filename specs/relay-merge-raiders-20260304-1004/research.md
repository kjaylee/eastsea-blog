# Research — relay-merge-raiders

## Goal pivot
- Original queue asked for a new monetizable vertical slice.
- Latest direction changed priority to **혼합게임 (2+ mechanics, unique loop)**.
- Decision: ship a new hybrid game slice under `games/` instead of tool work.

## Existing repo patterns reviewed
1. `games/accordion-vault/index.html`
   - Confirms mobile-first single-page game pattern (HUD + canvas + controls + localStorage progression).
2. `tests/unit/*.test.mjs` recent style
   - `node:test` + `assert/strict` conventions for deterministic logic checks.
3. `games/manifest.json` update pattern
   - Route discoverability depends on manifest registration.

## Design choice rationale
- Hybrid mechanics selected:
  1) **Lane-dodge survival** (real-time hazard avoidance + salvage collection)
  2) **Merge economy** (between-wave chip merging to boost multiplier)
  3) Monetization hooks in-loop (**sponsor boost** + **premium pass unlock**)
- Why this fits P1:
  - New build (not polish), self-contained vertical slice, no backend dependency.
  - Deterministic core logic extracted into `logic.mjs` for unit tests.

## Implementation constraints
- Static deploy target: HTML + JS modules only.
- Must run on mobile widths without external assets.
- Persist progression using localStorage only.
