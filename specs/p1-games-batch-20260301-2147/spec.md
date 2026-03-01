# Game Spec — p1-games-batch-20260301-2147

## Scope
Produce 3 new HTML5 mini-games under `games/{slug}/index.html` + `manifest.webmanifest`, then prepend all 3 entries to `games/manifest.json`.

## New Games
1. **Gyrovine Relay Sprint** (`gyrovine-relay-sprint`) — action
   - Circular-lane sprint where player rotates around a core.
   - Collect cyan relays, avoid magenta shards.
   - Difficulty ramps by angular speed and spawn density.

2. **Lattice Echo Assembler** (`lattice-echo-assembler`) — puzzle
   - 5x5 lattice puzzle. Move cursor and trigger row/column pulse to match target grid.
   - Stage progression, move budget pressure, score by clear efficiency.

3. **Biome Shield Director** (`biome-shield-director`) — simulation/strategy
   - Manage 3 domes (A/B/C) and stabilize Temperature / Moisture / Radiation.
   - Apply actions with cooldown pressure; survive timer for score.

## Mandatory Constraints
- Single-file gameplay implementation per game (`index.html`) with zero external dependencies.
- Mobile-first responsive UI.
- Input support: keyboard + touch.
- Web Audio API SFX for interaction/feedback.
- localStorage persistence (best score / best stage).
- Neon dark visual baseline with `#0a0a1a`.
- Individual `manifest.webmanifest` per game.
- Each `index.html` under 500KB.

## Manifest Integration
- Prepend 3 new game objects to `games/manifest.json`.
- Update `count` and `updatedAt`.
- Keep schema compatible with existing entries.

## Acceptance Criteria
- All 3 games boot and play in browser without console errors.
- Touch and keyboard paths both verified for core interactions.
- localStorage read/write confirmed for each game.
- Manifest JSON valid and entries discoverable at array head.
- Git commit + push completed with a single feature commit for this batch.
