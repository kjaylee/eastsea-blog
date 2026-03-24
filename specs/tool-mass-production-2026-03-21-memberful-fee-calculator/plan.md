# Plan — Memberful Fee Calculator

## Build steps
1. Implement pure calculation engine in `calculator.js` with exported constants, processor presets, validation, scenario evaluation, break-even math, target-gross math, comparison table generation, and summary builder.
2. Build a compact static UI in `index.html` with:
   - gross sales / successful charges inputs
   - refund and processor controls
   - KPI cards
   - calculation detail table
   - processor comparison table
   - summary textarea
   - KO/EN toggle
3. Add deterministic `calculator.test.js` coverage for baseline math, international preset, custom processor override, validation, break-even/target gross, summary copy, HTML anchors, and exact-once catalog wiring.
4. Wire the new slug into `_data/tools-list.json`, `tools/index.html`, and `tools/index.md`.
5. Rebuild `tools/manifest.json` using `bash scripts/build-manifests.sh`.
6. Run syntax + tests + manifest rebuild + exact-once checks + HTTP smoke.
7. Score against the spec/checklist, auto-fix if under 90, then record gap analysis.

## Verification commands
- `node --check tools/memberful-fee-calculator/calculator.js`
- `node --test tools/memberful-fee-calculator/calculator.test.js`
- `bash scripts/build-manifests.sh`
- `python3 - <<'PY' ... exact-once checks ... PY`
- `python3 -m http.server 4173 ... && curl -I http://127.0.0.1:4173/tools/memberful-fee-calculator/`

## 🔴 Red Team
- 공격 1: Memberful has only one public standard price, so the tool could feel too thin if it only repeats `$49 + 4.9%`.
- 공격 2: Stripe processing varies by country, so hard-coding one rate could mislead creators outside the US.
- 공격 3: Break-even math can be wrong if transaction count does not scale with the current average charge amount.
- 방어/완화:
  - Add target-net and break-even outputs, plus a processor comparison table, so the tool helps decisions instead of merely restating pricing.
  - Ship processor presets for public Stripe baseline defaults and expose full custom override with an explicit country-variance disclaimer.
  - State clearly that break-even assumes the current average charge amount stays constant and return `null` when margin assumptions become invalid.
- 합의: 🟢극복
