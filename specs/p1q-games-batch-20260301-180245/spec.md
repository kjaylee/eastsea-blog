# P1Q Games Batch Spec — 20260301-180245

## Goal
Ship 3 new HTML5 games under `games/{slug}/index.html` with per-game `manifest.webmanifest`, then prepend all 3 into `games/manifest.json` (count from 125 → 128).

## New Game Slice

### 1) Seismograph Scribe (`seismograph-scribe`)
- Genre: Precision Puzzle / Signal Tracing
- Core loop:
  - Input: keyboard (↑/↓, W/S) or touch hold zones (UP/DOWN)
  - Action: keep the tracing cursor aligned with a moving seismic waveform
  - Reward: accuracy combo and score multiplier growth
- Fail condition: timer reaches 0 (75s session), low accuracy reduces gains
- Persistence: best score + best accuracy via localStorage

### 2) Bonsai Windkeeper (`bonsai-windkeeper`)
- Genre: Simulation / Microclimate Management
- Core loop:
  - Input: keyboard (1/2/3 tree select + Q/W/E action keys) or touch buttons
  - Action: apply Mist / Fan / Lamp to stabilize Moisture-Wind-Light across 3 bonsai trees
  - Reward: longer survival increases serenity score and streak
- Fail condition: any tree vitality falls to 0
- Persistence: best survival round + top serenity score via localStorage

### 3) Paper Plane Thermals (`paper-plane-thermals`)
- Genre: Arcade Action (altitude runner)
- Core loop:
  - Input: keyboard (↑/↓ or W/S, Space glide boost) or touch (Climb/Dive/Boost)
  - Action: control plane altitude through thermal rings while avoiding storm clouds
  - Reward: distance + ring combo bonus
- Fail condition: 3 collisions
- Persistence: best distance + best combo via localStorage

## Visual / UX Constraints
- Neon dark baseline color `#0a0a1a` on all games
- Mobile-first responsive layout (390x844 and 360x800 targets)
- Single-file architecture per game (`index.html` includes all CSS/JS)
- No external dependencies
- File size target: each `index.html` < 500 KB

## Technical Constraints Checklist (must pass)
1. Touch + keyboard input both supported
2. Web Audio API used for interaction SFX
3. localStorage persistence for best records
4. Mobile responsive viewport and controls
5. `manifest.webmanifest` exists and valid JSON
6. Neon dark styling with `#0a0a1a`
7. File size under 500 KB

## Manifest Update Rules
- Update `games/manifest.json`
- Prepend 3 new game entries at top of `games` array
- Set `count` to 128
- Refresh `updatedAt` to current ISO timestamp
- Ensure slugs are unique vs existing folders
