# Sundial Shadow Court QA Report

## Local gate — PASS

- Date: 2026-07-17 KST
- Browser: Google Chrome via Playwright, headless
- Viewport: 390×844
- HTTP: 200
- Automated game checks: 13/13 PASS
- JavaScript page errors: 0
- `undefined` / `NaN` rendered text: 0
- Horizontal overflow: 0 (`scrollWidth === innerWidth === 390`)
- Verdict button height: 56px
- Actual pointer drag changed the sundial angle: PASS
- Actual button click sealed a valid verdict: PASS
- Full six-verdict loop, gameover result, retry, deterministic daily seed, localStorage: PASS

## Wow implementation — 5/5

1. Living Gnomon Drag: pointer angle + radial distance both affect live shadow geometry.
2. Solstice Escalation: orbital Eclipse Warden from verdict 3; narrower shadow from verdict 5.
3. Decree Draft: Long Noon, Fine Gnomon, Mercy Seal modify real judgment rules.
4. Goldleaf Verdict Freeze: perfect-seal burst and shareable result card.
5. Daily Almanac Seal: date seed, daily best, streak, rank, and run persistence.

## Static gate — PASS

- Inline JavaScript syntax: `node --check`
- Catalog JSON: `python3 -m json.tool`
- Forbidden palette/name markers absent from runtime HTML
- `git diff --check`: PASS

## Remaining physical-device risk

Real-device finger occlusion and long-session touch precision were not measured. `touch-action:none`, pointer capture, live coverage meters, 56px verdict control, and keyboard fallback reduce this risk.
