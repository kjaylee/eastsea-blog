# Plan — Sellfy Pricing Calculator

## Build steps
1. Implement pure calculation engine in `calculator.js` with exported constants, presets, validation, scenario evaluation, break-even math, comparison table generation, and summary builder.
2. Build a compact static UI in `index.html` with:
   - plan + billing controls
   - processor preset + custom override
   - KPI cards
   - detail table
   - plan comparison table
   - summary textarea
   - KO/EN toggle
3. Add deterministic `calculator.test.js` coverage for baseline, overage, billing cycle, processor preset differences, custom processor override, validation, summary, and catalog wiring.
4. Wire catalog entries into `_data/tools-list.json`, `tools/index.html`, and `tools/index.md`.
5. Rebuild `tools/manifest.json` using `bash scripts/build-manifests.sh`.
6. Run syntax + tests + manifest rebuild + exact-once checks.
7. Score against checklist, fix gaps if under 90.

## Verification commands
- `node --check tools/sellfy-pricing-calculator/calculator.js`
- `node --test tools/sellfy-pricing-calculator/calculator.test.js`
- `bash scripts/build-manifests.sh`
- `python3 - <<'PY' ... exact-once checks ... PY`

## 🔴 Red Team
- 공격 1: Sellfy has no transaction fee, so a "fee calculator" angle could mislead users if the UI behaves like a normal marketplace commission tool.
- 공격 2: Overage wording in Sellfy docs says they "may" start charging 2%, so modeling it as guaranteed could overstate cost.
- 공격 3: Recommendation logic could wrongly imply plan upgrades are feature-equivalent when Starter lacks upsells/affiliate/cart-abandonment.
- 방어/완화:
  - Use “Pricing Calculator” naming, not only “Fee Calculator”.
  - Add explicit assumption note: 2% overage is a deterministic planning model based on docs, not a contractual guarantee.
  - Label recommendation as “cost-based only” and show feature caveat in UI copy.
- 합의: 🟢극복
