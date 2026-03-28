# Plan — Heartbeat Queue #103

## Scope
Docs only. Do not create `tools/ecpm-calculator/` in this task. Do not touch catalog files or unrelated repo content.

## Execution order
1. Confirm repo-local gap and recent heartbeat exclusions.
2. Lock one exact-match monetization query that is distinct from existing tools.
3. Write artifact docs under `specs/heartbeat-queue-103-ecpm-calculator-20260327/`.
4. Verify that only spec artifacts changed and no tool implementation was created.

## Deliverables
- `specs/heartbeat-queue-103-ecpm-calculator-20260327/research.md`
- `specs/heartbeat-queue-103-ecpm-calculator-20260327/spec.md`
- `specs/heartbeat-queue-103-ecpm-calculator-20260327/plan.md`
- `specs/heartbeat-queue-103-ecpm-calculator-20260327/test-cases.md`

## Verification commands
Run from `/Users/kjaylee/.openclaw/workspace/eastsea-blog`:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path('.')
base = root / 'specs' / 'heartbeat-queue-103-ecpm-calculator-20260327'
print('artifact_dir_exists', base.exists())
print('artifact_files', sorted(p.name for p in base.iterdir()))
slug = 'ecpm-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
PY

find specs/heartbeat-queue-103-ecpm-calculator-20260327 -maxdepth 1 -type f | sort
git status --short specs/heartbeat-queue-103-ecpm-calculator-20260327
```

Expected verification state:
- artifact folder exists,
- the 4 required docs exist,
- `ecpm-calculator` still has zero references in tool catalog files,
- `tools/ecpm-calculator/` remains absent,
- git status shows only the new spec artifact folder.

## Red Team
- Attack: this is too close to the existing `cpm-calculator`.
  - Mitigation: keep the future page publisher-side and monetization-specific; emphasize gross vs net eCPM and revenue-share drag.
- Attack: this drifts into the broader `ad-rpm-optimizer` lane.
  - Mitigation: avoid pageview, CTR, viewability, and slot modeling in v1.
- Attack: the metric is too thin for a standalone page.
  - Mitigation: include reverse-solve modes and target-gap planning outputs so the page helps decisions, not just arithmetic.

## Decision
Proceed with `ecpm-calculator` as a future exact-match monetization tool. Keep heartbeat queue task `#103` limited to artifact docs.
