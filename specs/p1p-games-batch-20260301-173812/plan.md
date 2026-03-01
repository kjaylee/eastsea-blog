# Implementation Plan — P1P Batch (3 Games)

## Phase 0 — Preflight
1. Verify unique slugs via `ls games/`.
2. Confirm existing manifest count is 122 before edits.

## Phase 1 — Build Game 1 (`glyph-lantern-keeper`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement memory-rhythm loop (4 pads, sequence replay).
3. Add keyboard/touch parity.
4. Add Web Audio click/success/fail tones.
5. Add localStorage best score/combo.
6. Verify responsive UI and size budget.

## Phase 2 — Build Game 2 (`tidal-vault-allocator`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement turn-based 3-district allocation system.
3. Add keyboard/touch parity.
4. Add Web Audio for actions and turn result.
5. Add localStorage best round/score.
6. Verify responsive UI and size budget.

## Phase 3 — Build Game 3 (`comet-kite-harbor`)
1. Create folder + `index.html` + `manifest.webmanifest`.
2. Implement lane weaving arcade loop with collisions and boost.
3. Add keyboard/touch parity.
4. Add Web Audio for collect/hit/boost.
5. Add localStorage best distance/streak.
6. Verify responsive UI and size budget.

## Phase 4 — Integration
1. Compute file sizes for all new `index.html`.
2. Prepend 3 new entries to `games/manifest.json`.
3. Update count/updatedAt.

## Phase 5 — QA + Gap Analysis
1. Run checklist scoring for each game.
2. If any < 90%, patch and rerun (max 3 rounds).
3. Capture final pass evidence.

## Phase 6 — SCM
1. `git status` sanity check.
2. Commit message: `feat: +3 games (glyph-lantern-keeper, tidal-vault-allocator, comet-kite-harbor) — total 125`
3. Push to origin branch.
