# P1P Games Batch Spec — 20260301-173812

## Goal
Ship 3 new HTML5 games under `games/{slug}/index.html` with per-game `manifest.webmanifest`, then prepend all 3 into `games/manifest.json` (count from 122 → 125).

## New Game Slice

### 1) Glyph Lantern Keeper (`glyph-lantern-keeper`)
- Genre: Memory + Rhythm Puzzle
- Core loop:
  - Input: keyboard (A/S/D/F) or touch 4 lantern pads
  - Action: repeat flashing glyph sequence before timer expires
  - Reward: score/combo rise, speed scales
- Fail condition: wrong tap or timeout
- Persistence: best score + best combo via localStorage

### 2) Tidal Vault Allocator (`tidal-vault-allocator`)
- Genre: Strategy / Resource Balancing
- Core loop:
  - Input: keyboard (1/2/3 + Q/W/E action keys) or touch panel buttons
  - Action: allocate gates (Drain/Store/Shield) to 3 districts each turn
  - Reward: keep flood/stability/energy balanced for higher rounds
- Fail condition: any district reaches critical flood or global stability collapses
- Persistence: highest survived round + best total points via localStorage

### 3) Comet Kite Harbor (`comet-kite-harbor`)
- Genre: Arcade Action (lane weaving)
- Core loop:
  - Input: keyboard (←/→ or A/D, Space boost) or touch left/right/boost controls
  - Action: steer kite across 4 lanes, collect charge orbs, dodge comet debris
  - Reward: distance score + streak multiplier
- Fail condition: 3 collisions
- Persistence: best distance + max streak via localStorage

## Visual / UX Constraints
- Neon dark theme baseline color `#0a0a1a` on all games
- Mobile-first responsive layout (target: 390x844 and 360x800)
- One-file app architecture per game (`index.html` contains all CSS+JS)
- No external assets or libraries
- File size target: each `index.html` < 500 KB

## Technical Constraints Checklist (must pass)
1. Touch + keyboard input both supported
2. Web Audio API used for interaction SFX
3. localStorage persistence used for best records
4. Mobile responsive viewport and controls
5. `manifest.webmanifest` exists and valid JSON
6. Neon dark styling with `#0a0a1a`
7. File size under 500 KB

## Manifest Update Rules
- Update `games/manifest.json`
- Prepend 3 new game entries at top of `games` array
- Set `count` to 125
- Refresh `updatedAt` to current ISO timestamp
- Ensure slugs are unique vs existing folders
