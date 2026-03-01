# Implementation Plan — P1z Batch (3 games)

## A. Preflight
1. Verify slug uniqueness with `ls games/` exact match checks.
2. Create spec artifacts first (done): `spec.md`, `plan.md`, `test-cases.md`.

## B. Build order
1. Build `glacier-rescue-switchboard`
   - core loop + HUD + input + SFX + persistence
   - add `manifest.webmanifest`
2. Build `astrofoil-signal-regatta`
   - lane runner mechanics + pulse/boost + SFX + persistence
   - add `manifest.webmanifest`
3. Build `saffron-vault-alchemist`
   - channel tuning puzzle + rounds + SFX + persistence
   - add `manifest.webmanifest`

## C. Verification order
For each game:
1. File size check `<500KB`
2. Static requirement scan:
   - `AudioContext`
   - `localStorage`
   - touch handler (`touchstart`/pointer)
   - keyboard handler (`keydown`)
   - `#0a0a1a` presence
   - manifest linked in `<head>`
3. Quick runtime sanity via headless parse (`node` syntax check) where possible.

## D. Registry update
1. Compute file sizes for 3 new `index.html` files.
2. Prepend 3 entries to `games/manifest.json`.
3. Set `count=158` and refresh `updatedAt` (UTC ISO).

## E. Quality loop (mandatory)
- Gap Analysis Round 1 against checklist, score per game + overall.
- If <90%, patch gaps and rerun (max 3 rounds).

## F. Delivery
1. `git status` review
2. Commit with required message
3. Push to current branch
4. Report evidence (files, checks, commit hash)
