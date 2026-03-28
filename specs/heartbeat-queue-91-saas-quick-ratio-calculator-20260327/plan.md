# Plan — SaaS Quick Ratio Calculator

## Scope
Queue task `#91` is docs-only. Do not implement the tool in this task.

## Execution order
1. Research the repo and recent heartbeat exclusions.
2. Lock one exact-match gap with conservative commercial reasoning.
3. Write the future implementation spec.
4. Write the implementation plan with verification commands and a short Red Team section.
5. Write future test cases.

## Proposed future implementation slices
### Slice 1 — logic core
- Build `calculator.js` or `logic.mjs` with pure functions for:
  - base MRR math
  - quick ratio
  - target-gap outputs
  - edge-state handling
- Keep formatting outside the core logic.

### Slice 2 — static page
- Create a compact page with:
  - four core inputs
  - target quick ratio input
  - KPI row
  - detail section
  - copyable summary
  - short FAQ clarifying the SaaS metric vs liquidity quick ratio

### Slice 3 — discovery wiring
- Add the tool to:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
- Rebuild `tools/manifest.json`

### Slice 4 — verification
- Run deterministic logic tests.
- Run exact-once discovery checks.
- Run a local HTTP smoke test for the page.

## Artifact checklist for this task
- [x] `specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327/research.md`
- [x] `specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327/spec.md`
- [x] `specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327/plan.md`
- [x] `specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327/test-cases.md`

## Verification commands
Current-task verification:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog

python3 - <<'PY'
from pathlib import Path
base = Path('specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327')
for name in ['research.md', 'spec.md', 'plan.md', 'test-cases.md']:
    print(name, (base / name).exists())
PY

python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'saas-quick-ratio-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
PY

git diff --name-only -- specs/heartbeat-queue-91-saas-quick-ratio-calculator-20260327
git diff --name-only
```

Future implementation verification:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/saas-quick-ratio-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4175 >/tmp/eastsea-saas-quick-ratio.log 2>&1 &
echo $! >/tmp/eastsea-saas-quick-ratio.pid
curl -I http://127.0.0.1:4175/tools/saas-quick-ratio-calculator/
curl -s http://127.0.0.1:4175/tools/saas-quick-ratio-calculator/ | grep -E 'SaaS Quick Ratio Calculator|New MRR|Expansion MRR|Churned MRR|Contraction MRR'
kill "$(cat /tmp/eastsea-saas-quick-ratio.pid)"
```

## Red Team
- Attack 1: The term `quick ratio` could pull the wrong audience looking for the accounting liquidity ratio.
  - Mitigation: keep `SaaS` in the title, H1, metadata, and FAQ, and explicitly contrast the two meanings.
- Attack 2: The page could feel too thin because the formula is simple.
  - Mitigation: add planning outputs such as additional gain needed and max allowable loss so the tool is decision-useful, not just a formula shell.
- Attack 3: This may overlap with existing SaaS retention or unit-economics pages.
  - Mitigation: anchor the page to the exact-match query and the specific four-part quick-ratio formula, which existing tools do not cover.

## Decision
Proceed with `saas-quick-ratio-calculator` as a future exact-match SaaS KPI calculator. Keep task `#91` limited to artifact docs.
