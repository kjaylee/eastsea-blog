# Research — tool-formula-batch-20260327

## Objective
Choose one low-risk automation improvement that compounds EastSea tool mass production without adding large assets or polishing existing games.

## Files reviewed
- `scripts/tool-formula-scaffold.py`
- `tests/test_tool_formula_scaffold.py`
- `scripts/README.md`
- `tools/*/tool.config.json`

## Verified current state
### 1) The existing scaffold is single-tool only
`scripts/tool-formula-scaffold.py` accepts exactly one `--config` and one `--outdir`.

Implication: batch backfills still require one manual command per tool.

### 2) Partial output states already exist in the real repo
Command used:
```bash
python3 - <<'PY'
import json
from pathlib import Path
root = Path('/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools')
rows=[]
for cfg in sorted(root.glob('*/tool.config.json')):
    rows.append({
        'slug': cfg.parent.name,
        'app.js': (cfg.parent/'app.js').exists(),
        'app.test.js': (cfg.parent/'app.test.js').exists(),
        'index.html': (cfg.parent/'index.html').exists(),
    })
print(json.dumps(rows, ensure_ascii=False, indent=2))
PY
```

Observed:
- `app-store-subscription-proceeds-calculator`: index only
- `freelancer-com-fee-calculator`: index + `app.js`, but missing `app.test.js`
- `kick-subscription-payout-calculator`: complete generated trio present
- `mercari-fee-calculator`: index only
- `udemy-instructor-revenue-calculator`: index only

Implication: the current repo already has config-driven tools in mixed states, so a safe partial backfill path has immediate value.

### 3) The existing writer is all-or-nothing
`write_bundle()` in `scripts/tool-formula-scaffold.py` raises `FileExistsError` if **any** output file exists and `--force` is not set.

Implication: for a partially scaffolded tool like `freelancer-com-fee-calculator`, the current generator cannot fill only the missing `app.test.js` without forcing an overwrite of existing generated files.

### 4) No batch wrapper exists yet
Workspace search found no existing `tool-formula-batch` utility.

## Decision
Implement **`scripts/tool-formula-batch.py`**.

## Why this is the best next slice
- Low-risk: filesystem-local Python only, no deploy, no API keys, no asset growth.
- Compounding: turns config-based tools into a repeatable mini-pipeline instead of one-off manual commands.
- Immediate payoff: safely backfills missing generated files for the current mixed-state tool set.
- Future payoff: new `tool.config.json` tools can be audited or scaffolded in bulk from one command.

## Proposed behavior
- Scan `tools/**/tool.config.json`
- Validate each config through the existing scaffold module
- Report which generated files are present vs missing
- Default to dry-run audit
- Optional `--write-missing` mode writes only missing generated files
- Optional `--force` mode rewrites generated files when explicitly requested
- Emit terminal summary plus optional JSON/Markdown reports

## 🔴 Red Team
- [공격 1]: config-driven tools are only five today, so a batch helper could be premature.
- [공격 2]: a wrapper around another script can duplicate logic or drift.
- [방어/완화]: partial-state backfill is already a live need, and the wrapper should import the existing scaffold module instead of re-implementing rendering logic.
- [합의]: 🟢극복
