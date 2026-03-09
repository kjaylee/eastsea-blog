# Verification — steam-game-revenue-calculator

## Commands run
1. `bash scripts/build-manifests.sh`
2. Node compute extraction test → `tmp/steam-game-revenue-calculator-compute.json`
3. Local HTTP smoke test → `tmp/steam-game-revenue-calculator-http.txt`
4. Targeted catalog integrity check → `tmp/steam-game-revenue-calculator-integrity.json`
5. Page audit → `tmp/steam-game-revenue-calculator-page-audit.txt`
6. Repo-wide catalog audit (informational) → `tmp/steam-game-revenue-calculator-catalog-guard.{txt,json,md}`

## Result summary
- Steam tool page exists and responds `200` locally.
- Extracted `compute(v)` passed baseline, impossible break-even, and zero-fixed-cost assertions.
- Manifest, tools-list, and landing card all include the new slug.
- Page-level title, meta description, analytics include, language toggle, copy/reset buttons, and compute markers are present.
- Repo-wide `tool-catalog-guard.py --fail-on error` still reports a pre-existing catalog debt (`tools_list_missing_entries=133`) unrelated to this specific Steam tool.

## Evidence files
- `tmp/steam-game-revenue-calculator-compute.json`
- `tmp/steam-game-revenue-calculator-http.txt`
- `tmp/steam-game-revenue-calculator-integrity.json`
- `tmp/steam-game-revenue-calculator-page-audit.txt`
- `tmp/steam-game-revenue-calculator-catalog-guard.txt`
- `tmp/steam-game-revenue-calculator-catalog-guard.json`
- `tmp/steam-game-revenue-calculator-catalog-guard.md`
