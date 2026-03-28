# Plan — SaaS Magic Number Calculator

## Scope
Heartbeat queue task `#95` is docs-only. Do not implement the tool in this task.

## Execution order
1. Research repo coverage and recent heartbeat exclusions.
2. Lock one exact-match monetization gap with conservative opportunity reasoning.
3. Write the future implementation spec.
4. Write this plan with verification commands and Red Team notes.
5. Write future test cases.

## Proposed future implementation slices
### Slice 1 — logic core
- Build `calculator.js` with pure functions for:
  - recurring revenue delta
  - annualized recurring revenue added
  - magic number
  - target-gap planning outputs
  - validation and edge-state handling
- Keep formatting and DOM updates outside the core compute layer.

### Slice 2 — static page
- Create a compact page with:
  - three required monetary inputs
  - one target input
  - KPI row
  - detail section
  - summary export
  - short FAQ

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
- [x] `specs/heartbeat-queue-95-saas-magic-number-calculator-20260327/research.md`
- [x] `specs/heartbeat-queue-95-saas-magic-number-calculator-20260327/spec.md`
- [x] `specs/heartbeat-queue-95-saas-magic-number-calculator-20260327/plan.md`
- [x] `specs/heartbeat-queue-95-saas-magic-number-calculator-20260327/test-cases.md`

## Verification commands
Current-task verification:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog

python3 - <<'PY'
from pathlib import Path
base = Path('specs/heartbeat-queue-95-saas-magic-number-calculator-20260327')
for name in ['research.md', 'spec.md', 'plan.md', 'test-cases.md']:
    print(name, (base / name).exists())
PY

python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'saas-magic-number-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
PY

git status --short -- specs/heartbeat-queue-95-saas-magic-number-calculator-20260327
find specs/heartbeat-queue-95-saas-magic-number-calculator-20260327 -maxdepth 1 -type f | sort
```

Future implementation verification:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/saas-magic-number-calculator/calculator.js
node --test tools/saas-magic-number-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4177 >/tmp/eastsea-saas-magic-http.log 2>&1 &
echo $! >/tmp/eastsea-saas-magic-http.pid
curl -I http://127.0.0.1:4177/tools/saas-magic-number-calculator/
curl -s http://127.0.0.1:4177/tools/saas-magic-number-calculator/ | \
  grep -E 'SaaS Magic Number Calculator|Previous Quarter Recurring Revenue|Current Quarter Recurring Revenue|Sales and Marketing Spend|Target Magic Number'
kill "$(cat /tmp/eastsea-saas-magic-http.pid)"
```

## Red Team
- Attack 1: The metric is niche enough that some users may not know which revenue basis to enter.
  - Mitigation: require quarter-based recurring revenue labels and explain the annualization step directly beside the formula.
- Attack 2: The page could feel too thin because the formula is short.
  - Mitigation: include target-gap planning outputs and interpretation bands so the page supports action, not just arithmetic.
- Attack 3: The concept may overlap with quick ratio or Rule of 40 in users' minds.
  - Mitigation: explicitly position the page as a sales-efficiency metric based on prior-quarter S&M spend, and avoid mixing other SaaS KPIs into v1.

## Decision
Proceed with `saas-magic-number-calculator` as a future exact-match SaaS monetization metric calculator. Keep queue task `#95` limited to artifact docs.
