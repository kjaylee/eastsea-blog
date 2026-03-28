# Spec — 2026-03-28 Tool Catalog Sync

## Goal
Upgrade `scripts/tool-catalog-reconciler.py` into a reusable sync utility that keeps tool discovery artifacts aligned with filesystem truth.

## In scope
- Normalize and enrich `_data/tools-list.json` for all tool slugs on disk.
- Regenerate `tools/manifest.json` from filesystem truth.
- Update `tools/index.html` count claims / JSON-LD `numberOfItems`.
- Preserve dry-run mode by default.
- Add automated tests for the new sync behavior.

## Out of scope
- Rebuilding individual tool pages.
- Repairing every tool page’s missing analytics include.
- Copywriting bespoke descriptions for all tools.

## CLI requirements
New reconciler capabilities should support:
- preview merged tools list
- preview manifest output
- preview landing-page output
- write tools list
- write manifest
- write landing count updates
- optional prune-extra mode for stale tools-list rows

## Data rules
- Filesystem tool directories with `tools/<slug>/index.html` are source-of-truth.
- Tools list rows should end up with canonical `slug` and `url`.
- Existing rows should be repaired when title/description/category/tags are blank, generic, or placeholder-like.
- Manifest entries should always use `/tools/<slug>/` URLs and fresh directory sizes.
- Landing page count claims must match filesystem tool count.

## Success criteria
- `tool-catalog-guard.py --fail-on none` shows manifest mismatch fixed and landing-count mismatch fixed.
- missing tools-list entries decrease materially (target: 0 with prune-extra write mode).
- tests for reconciler pass.
