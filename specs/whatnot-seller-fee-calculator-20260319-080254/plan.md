# Plan — Whatnot Seller Fee Calculator

## Execution plan
1. Create deterministic calculation module with exported constants, preset map, validation, evaluation, break-even formula, and summary builder.
2. Create static bilingual UI bound to the calculator module.
3. Add node tests for reference cases, validation, summary text, HTML anchors, and discovery exact-once checks.
4. Wire tool into catalog files.
5. Rebuild `tools/manifest.json`.
6. Run verification commands and capture outputs.
7. Score against checklist and auto-fix if score < 90.

## Surgical edit strategy
- Add one new tool folder only.
- Append one markdown index row.
- Insert one HTML tool card.
- Append one `_data/tools-list.json` entry.
- Rebuild only manifest.
- No unrelated refactors.

## Verification commands (planned)
- `node --check tools/whatnot-seller-fee-calculator/calculator.js`
- `node --test tools/whatnot-seller-fee-calculator/calculator.test.js`
- `bash scripts/build-manifests.sh`
- `python3 -m http.server 4173`
- `curl -I http://127.0.0.1:4173/tools/whatnot-seller-fee-calculator/`
- `python3 - <<'PY' ... exact-once checks ... PY`

## 🔴 Red Team
- [공격 1]: Buyer-paid shipping may be misread as seller revenue, which would overstate payout.
- [공격 2]: Official Whatnot docs include temporary category promotions; modeling them as default would make the estimator stale quickly.
- [공격 3]: Duplicate risk is non-trivial because the repo’s list files and directory reality are slightly drifted.
- [방어/완화]: Treat buyer shipping only as processing-fee base, not payout. Limit v1 to the stable US-baseline rules plus explicit category presets. Add anti-dup checks in tests against `tools/`, `tools/manifest.json`, and `tools/index.md/index.html` exact-once wiring.
- [합의]: 🟢극복
