# Research — queue #85 upwork-fee-calculator recovery

Date: 2026-03-27
Repo: /Users/kjaylee/.openclaw/workspace/eastsea-blog

## Scope check
- Existing tool files present:
  - `tools/upwork-fee-calculator/index.html`
  - `tools/upwork-fee-calculator/calculator.js`
  - `tools/upwork-fee-calculator/calculator.test.js`
- External spec bundle reviewed:
  - `specs/heartbeat-p1-20260327-1321-next-tool/{spec,research,test-cases,red-team}.md`

## Discovery gap confirmed
Structured check before edits:
- `tools/index.html`: present once
- `tools/index.md`: missing
- `tools/manifest.json`: one manifest object exists for slug/url
- `_data/tools-list.json`: missing

## Recovery scope
Surgical repair only:
1. Add missing discovery entry to `tools/index.md`
2. Add missing discovery entry to `_data/tools-list.json`
3. Tighten deterministic catalog test to assert exact-once by structure, not raw string count
4. Re-verify tool math + discovery + localhost smoke

## Out of scope
- No calculator UX rewrite
- No unrelated catalog regeneration
- No edits outside this repo
