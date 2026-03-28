# Red Team — queue #109 Gumroad vs Payhip Profit Calculator

## Failure mode 1
I add discovery metadata in the wrong shape or multiple times, so the slug appears more than once or appears in the wrong surfaces.

Mitigation:
- Assert exact-once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json` by structure.

## Failure mode 2
I trust the existing tool bundle because it already exists on disk and skip fresh verification.

Mitigation:
- Re-run Node syntax checks, Node tests, manifest rebuild, and localhost smoke in this task.

## Failure mode 3
I accidentally broaden the change by editing unrelated catalog entries in a dirty worktree.

Mitigation:
- Touch only the queue-109 spec folder, the target tool test, and the three discovery surfaces plus manifest rebuild output.

## Failure mode 4
The tool is discoverable in machine-readable metadata but not in the human-facing catalog, or vice versa.

Mitigation:
- Verify both human-facing (`tools/index.html`, `tools/index.md`) and machine-facing (`_data/tools-list.json`, `tools/manifest.json`) surfaces explicitly.
