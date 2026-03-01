# Implementation Plan — P1S Batch (3 Games)

## Phase 0 — Preflight
1. Verify repo state with `git status`.
2. Verify slug uniqueness with directory checks.
3. Snapshot current manifest count (expected 134).

## Phase 1 — Build Orbital Triage Command
1. Create `games/orbital-triage-command/`.
2. Implement real-time module deterioration + repair action loop.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (repair/critical/fail/recover).
5. Persist best wave/score to localStorage.
6. Add `manifest.webmanifest`.

## Phase 2 — Build Frostbite Freight Fix
1. Create `games/frostbite-freight-fix/`.
2. Implement ice-slide puzzle stages with move cap and reset.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (slide/success/fail/reset).
5. Persist highest stage/efficiency to localStorage.
6. Add `manifest.webmanifest`.

## Phase 3 — Build Mythic Postal Panic
1. Create `games/mythic-postal-panic/`.
2. Implement conveyor parcel stream + rune matching combo loop.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (hit/miss/combo/game over).
5. Persist best score/combo to localStorage.
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
   `feat: +3 games (orbital-triage-command, frostbite-freight-fix, mythic-postal-panic) — total 137`
3. Push to origin.
