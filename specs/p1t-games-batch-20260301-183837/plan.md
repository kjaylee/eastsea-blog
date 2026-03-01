# Implementation Plan — P1T Batch (3 Games)

## Phase 0 — Preflight
1. Verify repo state with `git status`.
2. Verify slug uniqueness with directory checks.
3. Snapshot current manifest count (expected 137).

## Phase 1 — Build Ferrofluid Sculptor Lab
1. Create `games/ferrofluid-sculptor-lab/`.
2. Implement 5x5 magnet intensity puzzle loop with stage progression.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (toggle/success/fail/reset).
5. Persist best stage/score to localStorage.
6. Add `manifest.webmanifest`.

## Phase 2 — Build Cathedral Bell Conductor
1. Create `games/cathedral-bell-conductor/`.
2. Implement 4-lane rhythm timing loop with combo and miss logic.
3. Add keyboard + touch control parity.
4. Add Web Audio bell cues + result tones.
5. Persist best score/combo to localStorage.
6. Add `manifest.webmanifest`.

## Phase 3 — Build Moth Lantern Ascent
1. Create `games/moth-lantern-ascent/`.
2. Implement endless vertical survival with obstacle spawn and pickup scoring.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (collect/hit/boost/game over).
5. Persist best distance/score to localStorage.
6. Add `manifest.webmanifest`.

## Phase 4 — Integration
1. Validate all game folders contain both required files.
2. Validate each `index.html` size < 500KB.
3. Prepend 3 entries in `games/manifest.json`.
4. Update `count` and `updatedAt`.

## Phase 5 — QA & Gap Analysis Loop
1. Score each game against mandatory checklist.
2. If score <90%, patch and rerun (max 3 rounds).
3. Record iteration scores and evidence in `gap-analysis.md`.

## Phase 6 — SCM
1. Review diff and sanity checks.
2. Commit:
   `feat: +3 games (ferrofluid-sculptor-lab, cathedral-bell-conductor, moth-lantern-ascent) — total 140`
3. Push to origin.
