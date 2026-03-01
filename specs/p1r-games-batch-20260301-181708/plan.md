# Implementation Plan — P1R Batch (3 Games)

## Phase 0 — Preflight
1. Verify repo state with `git status`.
2. Verify slug uniqueness with directory existence checks.
3. Snapshot current manifest count (expected 131).

## Phase 1 — Build Chrono Loom Defender
1. Create `games/chrono-loom-defender/`.
2. Implement lane-defense loop (spawn, widget actions, stability/energy).
3. Add keyboard + touch control parity.
4. Add Web Audio cues (deploy/hit/breach/game over).
5. Persist best round/score to localStorage.
6. Add `manifest.webmanifest`.

## Phase 2 — Build Quantum Koi Courier
1. Create `games/quantum-koi-courier/`.
2. Implement runner loop (movement, hazards, pearls, speed scaling, dash).
3. Add keyboard + touch control parity.
4. Add Web Audio cues (collect/dash/hit/game over).
5. Persist best distance/combo to localStorage.
6. Add `manifest.webmanifest`.

## Phase 3 — Build Vault Echo Cartographer
1. Create `games/vault-echo-cartographer/`.
2. Implement sequence memory puzzle with replay and validation.
3. Add keyboard + touch control parity.
4. Add Web Audio cues (cue tones/confirm/error/clear).
5. Persist best stage/score to localStorage.
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
   `feat: +3 games (chrono-loom-defender, quantum-koi-courier, vault-echo-cartographer) — total 134`
3. Push to origin.
