# Test Cases — p1-games-batch-20260301-2147

## Common (All 3 Games)
- TC-C001: `index.html` loads and initial screen renders.
- TC-C002: Neon dark theme includes `#0a0a1a` in CSS.
- TC-C003: Keyboard input path starts and controls core mechanic.
- TC-C004: Touch input path starts and controls core mechanic.
- TC-C005: Web Audio API context initializes after user gesture and plays SFX.
- TC-C006: localStorage key is read/written for best score/progress.
- TC-C007: Mobile viewport (390x844) shows no horizontal overflow and controls are reachable.
- TC-C008: `manifest.webmanifest` exists and contains `start_url`, `display`, `theme_color`.
- TC-C009: `index.html` file size < 500KB.
- TC-C010: No fatal JS errors during 60-second play session.

## Gyrovine Relay Sprint
- TC-A001: Left/right rotates player lane around center.
- TC-A002: Collectible increases score and plays positive SFX.
- TC-A003: Hazard collision decreases life and can trigger game over.

## Lattice Echo Assembler
- TC-B001: Cursor movement works via arrows + touch D-pad.
- TC-B002: Pulse action mutates row/column state and decrements moves.
- TC-B003: Matching target advances stage and updates best stage.

## Biome Shield Director
- TC-S001: Dome metrics tick over time and increase pressure.
- TC-S002: Action buttons/keys apply effects and trigger cooldown.
- TC-S003: Score accumulates while stable; failure state appears when any dome collapses.

## Manifest Integration
- TC-M001: New 3 game objects are prepended to `games[].`
- TC-M002: `count` increments by 3 from previous value.
- TC-M003: `updatedAt` is refreshed to current ISO timestamp.
