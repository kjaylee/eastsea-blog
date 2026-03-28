# Research — 2026-03-28 Tool Analytics Sync

## Decision target
Ship one dry-run-first repo utility that removes a repeated monetization-measurement gap across existing `eastsea-blog` tools.

## Current bottleneck evidence
Command run:

```bash
python3 eastsea-blog/scripts/tool-catalog-guard.py \
  --root eastsea-blog \
  --fail-on none \
  --max-examples 25 \
  --json-out eastsea-blog/tmp/tool-catalog-guard-current.json \
  --md-out eastsea-blog/tmp/tool-catalog-guard-current.md
```

Observed summary:
- filesystem tools: `732`
- `_data/tools-list.json` entries: `731`
- warning bucket: `tool_missing_analytics_include count=21`
- examples: `amazon-kdp-royalty-calculator`, `baking-ingredient-converter`, `body-fat-navy-calculator`

The remaining catalog-sync warning is not cosmetic. It means 21 tool pages are shipping without the standard analytics include, so traffic measurement and conversion attribution are incomplete.

## Files reviewed
- `eastsea-blog/scripts/tool-catalog-guard.py`
- `eastsea-blog/scripts/README.md`
- `eastsea-blog/specs/20260328-tool-catalog-sync/report.md`
- `eastsea-blog/specs/20260328-tool-catalog-sync/gap-analysis.md`
- `eastsea-blog/tools/amazon-kdp-royalty-calculator/index.html`
- `eastsea-blog/tools/stripe-fee-calculator/index.html`

## Key findings
### Guard already defines the exact invariant
`tool-catalog-guard.py` currently treats a tool page as non-compliant when the page HTML does not contain this substring:

```text
/assets/analytics.js
```

Relevant implementation path:
- for each filesystem tool slug, read `tools/<slug>/index.html`
- if `"/assets/analytics.js" not in tool_html`, mark `tool_missing_analytics_include`

So the repair target is deterministic and already enforced by the repo’s existing audit layer.

### Existing compliant pattern is simple
A compliant page such as `tools/stripe-fee-calculator/index.html` includes:

```html
<script defer src="/assets/analytics.js"></script>
```

inside `<head>` before the JSON-LD block.

### Missing pages vary slightly
A missing page such as `tools/amazon-kdp-royalty-calculator/index.html` has:
- full `<head>` metadata
- inline styles
- sometimes one or more `<script>` tags in `<head>`
- but no analytics include

That means a reusable fixer should:
1. scan `tools/*/index.html`
2. skip pages already compliant
3. inject the analytics script in a deterministic `<head>` location
4. stay idempotent
5. default to dry-run

## Why this beats adding one more tool page
Adding a new calculator increases inventory by 1.
Fixing analytics coverage improves measurement across **21 already-shipped tools**. That is broader leverage for monetization, attribution, and future pruning decisions.

## Decision
Build **`scripts/tool-analytics-sync.py`**.

## Success criteria
v1 succeeds if it can:
1. audit current analytics coverage under `tools/*/index.html`
2. report missing slugs in dry-run mode
3. inject `<script defer src="/assets/analytics.js"></script>` into missing pages only when write mode is enabled
4. remain idempotent on repeated runs
5. reduce the guard’s `tool_missing_analytics_include` bucket from `21` to `0` after applying the fixer

## Non-goals
- do not change tool business logic
- do not change `_data/tools-list.json`
- do not change `tools/manifest.json`
- do not fix unrelated guard issues in this slice
