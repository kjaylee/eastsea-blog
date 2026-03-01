# P1Q Games Batch Spec — 20260301-180945

## Goal
Ship 3 new HTML5 games in `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`, then prepend these 3 entries to `games/manifest.json` and update total count from 128 → 131.

## New Games (Genre Diversification)

### 1) Lighthouse Lens Labyrinth (`lighthouse-lens-labyrinth`)
- Genre: Puzzle (optics routing)
- Core loop:
  - Rotate mirror/lens tiles to route beam from source to all target buoys.
  - Keyboard: Arrow keys move cursor, Space/Enter rotate tile.
  - Touch: tap tile to rotate.
- Win condition: all targets lit in current stage.
- Progression: 5 handcrafted stages with increased complexity.
- Persistence: highest cleared stage, best total score via localStorage.

### 2) Junkyard Joule Juggler (`junkyard-joule-juggler`)
- Genre: Arcade (sorting + reflex)
- Core loop:
  - Move catcher horizontally, collect falling batteries, avoid scrap bombs.
  - Toggle polarity mode to bank caught batteries in matching side bins.
  - Keyboard: A/D or ←/→ move, Space toggle polarity.
  - Touch: on-screen left/right/toggle buttons.
- Fail condition: lives reach 0.
- Persistence: best score + best streak via localStorage.

### 3) Relic Auction Rush (`relic-auction-rush`)
- Genre: Strategy (risk/reward bidding)
- Core loop:
  - Every round presents 3 relic lots with hidden authenticity risk.
  - Choose one lot and one bid level to maximize reputation + profit.
  - Keyboard: 1/2/3 lot select, Q/W/E bid select, Enter confirm.
  - Touch: lot buttons + bid buttons + confirm.
- Fail condition: reputation collapses to 0.
- Persistence: best net worth + best round via localStorage.

## Mandatory Constraint Checklist
1. Touch + keyboard input support (all 3 games)
2. Web Audio API interaction SFX (all 3)
3. localStorage persistence for records (all 3)
4. Mobile responsive UI (360x800 and 390x844 usable)
5. PWA `manifest.webmanifest` per game
6. Neon dark palette including `#0a0a1a`
7. Single-file implementation for game logic (`index.html` only, no external deps)
8. `index.html` file size < 500KB each

## Manifest Update Requirements
- Update `games/manifest.json`
- Prepend 3 new game entries at the very top of `games` array
- Update `count` to 131
- Update `updatedAt` to current ISO timestamp
- Ensure slug uniqueness against existing `games/*` directories
