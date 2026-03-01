# Implementation Plan — P1Q Batch (3 Games)

## Phase 0 — Preflight
1. Verify candidate slugs are unique via `ls games/`.
2. Confirm current manifest count is 125 before edits.

## Phase 1 — Build Game 1 (`seismograph-scribe`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement waveform tracing loop with moving target line and accuracy scoring.
3. Add keyboard/touch parity controls.
4. Add Web Audio cues (good trace, miss, milestone).
5. Persist best score/accuracy via localStorage.
6. Verify responsive layout and size budget.

## Phase 2 — Build Game 2 (`bonsai-windkeeper`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement 3-tree stat simulation (moisture/wind/light + vitality).
3. Add keyboard/touch parity for select + actions.
4. Add Web Audio cues per action and danger state.
5. Persist best round/score via localStorage.
6. Verify responsive layout and size budget.

## Phase 3 — Build Game 3 (`paper-plane-thermals`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement altitude runner with rings, clouds, collision lives, boost.
3. Add keyboard/touch parity controls.
4. Add Web Audio cues (ring collect, hit, boost).
5. Persist best distance/combo via localStorage.
6. Verify responsive layout and size budget.

## Phase 4 — Integration
1. Compute file sizes for all new `index.html` files.
2. Prepend 3 entries to `games/manifest.json`.
3. Update `count` and `updatedAt`.

## Phase 5 — QA + Gap Analysis
1. Execute checklist scoring for each game.
2. If any score < 90, patch and re-run (up to 3 rounds).
3. Save final `gap-analysis.md` and `launch-report.md`.

## Phase 6 — SCM
1. Validate git diff scope.
2. Commit message: `feat: +3 games (seismograph-scribe, bonsai-windkeeper, paper-plane-thermals) — total 128`
3. Push to origin.
