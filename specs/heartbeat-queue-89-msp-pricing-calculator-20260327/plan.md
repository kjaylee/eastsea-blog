# Plan — MSP Pricing Calculator

## Sequence
1. Research
   - Confirm repo-local non-overlap across `tools/`, `specs/`, `tools/index.*`, `tools/manifest.json`, and `_data/tools-list.json`.
   - Review recent heartbeat topics from 2026-03-26 to 2026-03-27 so this task stays out of the creator/resale fee cluster.
   - Review adjacent service-pricing tools to keep the future page exact-match and MSP-specific.
2. Spec
   - Lock slug, title, user, inputs, outputs, and formula direction.
   - Keep opportunity reasoning conservative and repo-local.
3. Plan
   - Define a future implementation shape: one static page, one pure calculator module, one deterministic test file.
   - Keep discovery wiring out of this docs-only task.
4. Red Team
   - Challenge overlap, accuracy, and over-scope before any implementation starts.
5. Test Cases
   - Predefine deterministic math, content, validation, and docs-only isolation checks.

## Execution constraints
- Docs only. Do not create `tools/msp-pricing-calculator/` in this task.
- Do not edit `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, or `tools/manifest.json`.
- Do not touch unrelated modified files already in the repo.

## Future implementation shape
When implementation starts later, keep the file surface small:
- `tools/msp-pricing-calculator/index.html`
- `tools/msp-pricing-calculator/calculator.js`
- `tools/msp-pricing-calculator/calculator.test.js`

Preferred implementation order:
1. Build and test pure math first in `calculator.js`.
2. Add the static UI and summary output in `index.html`.
3. Wire deterministic tests in `calculator.test.js`.
4. Only after the tool works should discovery files be updated exactly once.

## Verification commands
Use these commands after this docs-only task to confirm the gap is still unimplemented and the change surface stayed isolated:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog

rg -n "msp-pricing-calculator|managed service pricing|MSP pricing" \
  tools specs _posts tests _data

python3 - <<'PY'
import pathlib
root = pathlib.Path('.')
slug = 'msp-pricing-calculator'
print('tools_dir_exists', (root / 'tools' / slug).exists())
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    path = root / rel
    print(rel, path.read_text(errors='ignore').count(slug))
spec_dir = root / 'specs' / 'heartbeat-queue-89-msp-pricing-calculator-20260327'
print('spec_dir_exists', spec_dir.exists())
print('artifact_files', sorted(p.name for p in spec_dir.iterdir()))
PY

git status --short specs/heartbeat-queue-89-msp-pricing-calculator-20260327
find specs/heartbeat-queue-89-msp-pricing-calculator-20260327 -maxdepth 1 -type f | sort
```

Expected:
- no `msp-pricing-calculator` live tool directory,
- discovery counts remain `0`,
- only the new spec folder appears for this task,
- and repo search hits for `msp-pricing-calculator` come only from the new docs.

## Red Team
- Attack: this could overlap too much with `white-label-agency-margin-calculator` or `professional-services-utilization-margin-calculator`.
  - Mitigation: keep v1 anchored on MSP-native variables such as managed users, endpoints, stack cost, after-hours load, and onboarding.
- Attack: MSP pricing varies heavily by service bundle, geography, and support model, so a naive calculator could imply false precision.
  - Mitigation: frame the page as a planning calculator, not a benchmark engine, and expose editable assumptions instead of fixed "market" rates.
- Attack: the scope can bloat into quoting, hardware resale, procurement, tax, and stack licensing analytics.
  - Mitigation: hold v1 to recurring service pricing plus onboarding only; explicitly exclude hardware resale and tax modeling.
- Attack: recent heartbeat work already covered monetization tools on 2026-03-26 and 2026-03-27, so another gap choice may still be too close.
  - Mitigation: this slug stays outside the recent GOAT, Whop, Thinkific, and OnlyFans cluster and has zero repo-local slug collisions.

## Stop condition
This task is complete when the artifact docs exist, the chosen gap is justified conservatively, and repo-local verification shows no implementation or discovery edits.
