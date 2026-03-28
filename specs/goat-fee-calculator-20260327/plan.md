# Plan — GOAT Fee Calculator

## Sequence
1. Research
   - Confirm repo-local non-overlap across `tools/`, `specs/`, `tools/index.*`, `tools/manifest.json`, and `_data/tools-list.json`.
   - Review adjacent resale marketplace calculators to keep the future page narrow and exact-match.
2. Spec
   - Lock slug, user, scope, inputs, outputs, and formula direction.
   - Keep constants policy conservative: official GOAT baseline must be re-verified when implementation starts.
3. Plan
   - Future implementation should build a static calculator module, single responsive page, summary output, and deterministic tests.
   - Discovery wiring should happen only when the page is actually built.
4. Red Team
   - Challenge overlap, accuracy, and scope before any implementation starts.
5. Test Cases
   - Define deterministic math, validation, content, and discovery checks in advance.

## Execution constraints
- Docs only. Do not create `tools/goat-fee-calculator/` in this task.
- Do not edit discovery files or manifests in this task.
- Do not touch unrelated modified files already in the repo.

## Verification commands
Use these commands to re-check the gap and confirm this artifact-only task stayed isolated:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog

rg -n "goat-fee-calculator|GOAT fee|GOAT seller|goat seller" \
  tools specs _data/tools-list.json tools/index.md tools/index.html tools/manifest.json

python3 - <<'PY'
import pathlib
root = pathlib.Path('.')
print('tools_dir_exists', (root/'tools'/'goat-fee-calculator').exists())
for path in [root/'tools'/'index.html', root/'tools'/'index.md', root/'tools'/'manifest.json', root/'_data'/'tools-list.json']:
    print(path.as_posix(), path.read_text(errors='ignore').count('goat-fee-calculator'))
print('spec_dir_exists', (root/'specs'/'goat-fee-calculator-20260327').exists())
print('artifact_files', sorted(p.name for p in (root/'specs'/'goat-fee-calculator-20260327').iterdir()))
PY

git status --short specs/goat-fee-calculator-20260327
```

Expected:
- no GOAT matches outside the new spec folder,
- `tools/goat-fee-calculator` remains absent,
- discovery counts remain `0`,
- and only the new spec folder appears as this task's change surface.

## Red Team
- Attack: GOAT may be too close to `stockx-fee-profit-calculator`, so the gap could be thinner than it looks.
  - Mitigation: keep the page explicitly GOAT-branded and seller-payout-specific; do not position it as a generic sneaker marketplace calculator.
- Attack: GOAT fee rules can vary by seller path or geography, which can make a naive calculator misleading.
  - Mitigation: future implementation must model one named public baseline, disclose assumptions prominently, and offer custom override inputs.
- Attack: recent heartbeat work already touched marketplace monetization, so this may be hidden overlap.
  - Mitigation: repo inspection showed no GOAT slug, no GOAT discovery entry, and no GOAT spec folder; recent heartbeat topics are different slugs.

## Stop condition
This task is complete once the artifact docs exist and the repo-local non-overlap evidence is recorded. No implementation work should begin here.
