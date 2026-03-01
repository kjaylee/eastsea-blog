# Test Cases — P1z Games Batch (3)

## Common checklist cases (apply to all 3)
- TC-C001: Game loads and start overlay renders.
- TC-C002: Keyboard controls work for all core actions.
- TC-C003: Touch controls work for all core actions.
- TC-C004: Web Audio API SFX plays after first user interaction.
- TC-C005: Best score/stage persists across reload via localStorage.
- TC-C006: Mobile layout remains usable at 390x844.
- TC-C007: Theme includes #0a0a1a neon dark base.
- TC-C008: `manifest.webmanifest` exists and is linked from HTML.
- TC-C009: `index.html` size < 500KB.
- TC-C010: No blocking runtime errors during 1 full play cycle.

## Game-specific functional cases

### 1) glacier-rescue-switchboard
- TC-GR001: Selecting sector buttons routes convoy and updates sector stats.
- TC-GR002: Delayed/incorrect routing increases crisis pressure.
- TC-GR003: Correct routing chain increases score/multiplier.
- TC-GR004: Fail condition triggers game-over and restart works.

### 2) astrofoil-signal-regatta
- TC-AS001: Left/right movement via keyboard and touch lanes works.
- TC-AS002: Buoy collection increases score/chain.
- TC-AS003: Debris collision reduces shield/health.
- TC-AS004: Pulse/boost action affects speed or invuln window.

### 3) saffron-vault-alchemist
- TC-SV001: Channel adjustment controls (3 channels) respond via key/touch.
- TC-SV002: Submit/mix validates distance to target formula.
- TC-SV003: Success advances round; failure consumes life or time budget.
- TC-SV004: Best stage/score persists and restart resets round state.

## Manifest integration
- TC-M001: `games/manifest.json` has 3 new entries prepended at top.
- TC-M002: `count` updated to 158.
- TC-M003: `updatedAt` updated to current run timestamp.
- TC-M004: JSON remains valid (`jq . games/manifest.json`).
