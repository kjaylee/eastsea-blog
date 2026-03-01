# P1z Games Batch Spec (3 titles)

## 1) Scope
Create and ship 3 new HTML5 games under `games/{slug}/` with:
- `index.html` (single-file game: HTML/CSS/JS embedded, no external deps)
- `manifest.webmanifest`

Target repo: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

## 2) New game lineup (unique slugs)
1. `glacier-rescue-switchboard` — **strategy/simulation**
   - Concept: route emergency rescue convoys to 3 icy sectors under time pressure.
2. `astrofoil-signal-regatta` — **action/arcade**
   - Concept: steer a solar sail craft across 3 lanes, collect signal buoys, avoid debris, pulse boost timing.
3. `saffron-vault-alchemist` — **puzzle**
   - Concept: tune 3 reagent channels to match target alchemy formula before move/time budget runs out.

## 3) Non-functional requirements (mandatory checklist)
- Touch + keyboard controls
- Web Audio API feedback SFX
- `localStorage` for best score/stage
- Mobile responsive layout (390x844 baseline)
- PWA manifest (`manifest.webmanifest`) per game
- Visual theme includes `#0a0a1a` neon dark base
- Each `index.html` under 500KB

## 4) UX baseline
- Start overlay with concise control hints
- In-game HUD: score/status + best record
- Restart flow on game over/clear
- Korean-friendly UI copy where needed

## 5) Data & integration
- Update `games/manifest.json`
  - prepend 3 new records at top of `games` array
  - update `count`: 155 -> 158
  - update `updatedAt` to current UTC ISO timestamp

## 6) Acceptance criteria
- All 3 games run directly in browser with no console errors in normal flow
- Keyboard + touch both usable end-to-end
- Web Audio starts upon first user gesture and plays events
- Best record persists via `localStorage`
- `manifest.json` structure remains valid JSON
- Git commit and push completed with:
  - `feat: +3 games (glacier-rescue-switchboard, astrofoil-signal-regatta, saffron-vault-alchemist) — total 158`
