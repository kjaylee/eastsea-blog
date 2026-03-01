# Spec — P1v Games Batch (3)

## Goal
Ship 3 new HTML5 games under `games/{slug}/` and update `games/manifest.json` from count **143 → 146** with new entries prepended.

## Scope
Create the following new slugs (must be unique vs existing `games/`):
1. `aurora-rail-rescue` (Action)
2. `clockwork-reef-keeper` (Strategy/Simulation)
3. `echo-mosaic-forge` (Puzzle)

Each slug includes:
- `games/{slug}/index.html` (single-file implementation, no external deps)
- `games/{slug}/manifest.webmanifest`

## Gameplay Concepts
### 1) Aurora Rail Rescue (Action)
- Core loop: move between 3 rails, rescue stranded pods, avoid debris, spend charge to pulse-clear hazards.
- Inputs: keyboard (←/→/A/D + Space) and touch buttons.
- Progression: speed increases over time.

### 2) Clockwork Reef Keeper (Strategy)
- Core loop: maintain 3 reef zones by choosing one of multiple actions each tick (clean, seed, shield), balancing oxygen/health/pressure.
- Inputs: keyboard (1/2/3 + Q/W/E actions) and touch UI.
- Progression: rising wave pressure and combo multipliers for stable zones.

### 3) Echo Mosaic Forge (Puzzle)
- Core loop: hear/see target color-tone sequence, then reproduce by selecting mosaic tiles in order under a timer.
- Inputs: keyboard (A/S/D/F or 1/2/3/4) and touch pads.
- Progression: sequence length + playback tempo scale by round.

## Non-Functional Constraints (Mandatory Checklist)
- Touch + keyboard support.
- Use Web Audio API for SFX.
- Persist best score/round/state via `localStorage`.
- Mobile responsive layout (390x844 baseline) + desktop friendly.
- PWA manifest with `#0a0a1a` theme/background.
- Visual style: neon dark based on `#0a0a1a`.
- `index.html` per game must be < 500KB.
- No external scripts, fonts, assets, or network dependencies.

## Manifest Update Rules
- Prepend 3 new game objects at start of `games` array in `games/manifest.json`.
- Update `count` to 146.
- Update `updatedAt` to current ISO time.
- Include `size` as byte size of each `index.html`.

## Done Criteria
- 3 games playable and restartable.
- Checklist compliance >= 90% for each game.
- Gap analysis documented with iteration scores (max 3 iterations).
- `git commit` + `git push` completed with message:
  - `feat: +3 games (aurora-rail-rescue, clockwork-reef-keeper, echo-mosaic-forge) — total 146`
