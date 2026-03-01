# Implementation Plan — P1Q Batch (3 Games)

## Phase 0 — Preflight
1. Verify target repo and branch health (`git status`).
2. Verify slug uniqueness with `ls games/` / directory existence checks.
3. Snapshot current manifest count (expected 128).

## Phase 1 — Build Lighthouse Lens Labyrinth
1. Create `games/lighthouse-lens-labyrinth/`.
2. Implement puzzle grid, beam tracing, stage progression.
3. Add keyboard + touch controls parity.
4. Add Web Audio cues (rotate, target hit, stage clear).
5. Persist best stage/score to localStorage.
6. Add per-game `manifest.webmanifest`.

## Phase 2 — Build Junkyard Joule Juggler
1. Create `games/junkyard-joule-juggler/`.
2. Implement arcade loop (movement, spawn, collisions, polarity).
3. Add keyboard + touch controls parity.
4. Add Web Audio cues (collect, hit, mode toggle, game over).
5. Persist best score/streak to localStorage.
6. Add per-game `manifest.webmanifest`.

## Phase 3 — Build Relic Auction Rush
1. Create `games/relic-auction-rush/`.
2. Implement round-based lot + bid + resolution system.
3. Add keyboard + touch controls parity.
4. Add Web Audio cues (select, confirm, success/fail).
5. Persist best net-worth/round to localStorage.
6. Add per-game `manifest.webmanifest`.

## Phase 4 — Integration
1. Validate all new folders include `index.html` + `manifest.webmanifest`.
2. Measure file sizes (must be < 500KB each).
3. Prepend 3 entries into `games/manifest.json`.
4. Update count and updatedAt.

## Phase 5 — QA & Gap Analysis Loop
1. Run checklist scoring for each game.
2. If any score < 90%, patch gaps and rerun (max 3 rounds).
3. Produce `gap-analysis.md` with per-iteration scores and evidence.

## Phase 6 — SCM
1. Review diff and run final sanity checks.
2. Commit with message: `feat: +3 games (lighthouse-lens-labyrinth, junkyard-joule-juggler, relic-auction-rush) — total 131`
3. Push to origin.
