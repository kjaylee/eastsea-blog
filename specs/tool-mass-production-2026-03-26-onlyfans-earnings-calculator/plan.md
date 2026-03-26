# Plan — OnlyFans Earnings Calculator

## Implementation plan
1. Create the research-backed artifact folder for this task.
2. Build a pure `calculator.js` module first:
   - constants
   - defaults
   - input normalization
   - validation
   - calculation engine
   - summary builder
   - DOM rendering hooks
3. Create `index.html` with:
   - bilingual hero
   - input form
   - KPI / detail cards
   - assumption note
   - related creator-tool links
4. Create `calculator.test.js` with:
   - deterministic baseline math
   - net-income sensitivity
   - invalid-input rejection
   - zero-subscriber edge case
   - target-subscriber / break-even math
   - HTML anchor checks
   - exact-once catalog wiring checks
5. Update discovery/catalog files:
   - `tools/manifest.json`
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
6. Run verification:
   - `node --check`
   - `node --test`
   - manifest integration test
   - local HTTP smoke with `python3 -m http.server` + `curl`
7. Score against spec.
8. Fix any gap found and record quality-loop result.

## Files expected to change
- New:
  - `tools/onlyfans-earnings-calculator/index.html`
  - `tools/onlyfans-earnings-calculator/calculator.js`
  - `tools/onlyfans-earnings-calculator/calculator.test.js`
  - `specs/tool-mass-production-2026-03-26-onlyfans-earnings-calculator/*`
- Modified:
  - `tools/manifest.json`
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `/Users/kjaylee/.openclaw/workspace/memory/subagent-log.md`

## Verification commands
- `node --check tools/onlyfans-earnings-calculator/calculator.js`
- `node --check tools/onlyfans-earnings-calculator/calculator.test.js`
- `node --test tools/onlyfans-earnings-calculator/calculator.test.js`
- `node --test tests/integration/manifest-integrity.test.mjs`
- `python3 -m http.server 4173` then `curl http://127.0.0.1:4173/tools/onlyfans-earnings-calculator/`

## Non-goals
- No repo-wide cleanup.
- No redesign of the whole tools index.
- No automation around sitemap generation beyond required wiring.
- No unrelated pricing-model additions to other creator tools.
