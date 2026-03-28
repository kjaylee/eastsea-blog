# Novel Auto-Publishing System

## Overview
Automated pipeline that transforms markdown novels into a live website with zero manual intervention.

## Architecture

```
📝 Write Novel          →  🔄 Auto-Update        →  🌐 Live Website
_data/*.md                 update-novels.sh         eastsea.monster/novels
(Jekyll markdown)          (scan & generate)        (GitHub Pages)
```

## Components

### 1. Novel Files (`novels/_data/`)
Each novel episode is a markdown file with YAML frontmatter:

```yaml
---
title: "[웹소설] Series Name - 1화"
episode: 1
series: "Series Name"
author: "Author Name"
date: 2026-02-05
genre: ["fantasy", "action"]
---

## Episode Content
Your novel content here...
```

**Naming Convention:** `{series-slug}-{episode}.md`
- Example: `던전에서나만편의점-001.md`

### 2. Update Script (`scripts/update-novels.sh`)
Automatically scans `_data/` and generates:
- **`index.html`**: Grid of novel cards with latest episodes
- **`series.html`**: Episode list viewer with JavaScript data

**Features:**
- Auto-detects new novels and episodes
- Groups by series
- Extracts metadata (author, genre, date)
- Generates URL-safe series slugs
- UTF-8 compatible (Korean text)

**Usage:**
```bash
cd eastsea-blog
./scripts/update-novels.sh
```

**Options:**
- `AUTO_COMMIT=false` - Skip git commit (for testing)

### 3. Cron Job Integration
**Schedule:** Every Friday 10:00 AM KST (Korean Novel Writing Day)
**Cron ID:** `efaadfdb-6603-45b5-99a7-7f9c9adf5aa7`

**Pipeline:**
1. AI writes new novel episodes → `_data/`
2. Run `update-novels.sh`
3. Commit & push to GitHub
4. GitHub Pages deploys (1-2 minutes)

## Adding New Novels

### Option A: Manual
1. Create markdown file in `novels/_data/`
2. Add YAML frontmatter (see template above)
3. Run `./scripts/update-novels.sh`
4. Commit and push

### Option B: Automated (Recommended)
1. AI writes episode via cron job
2. Script auto-detects and adds to website
3. Zero intervention needed

## Testing

### Test Script Only
```bash
cd eastsea-blog
AUTO_COMMIT=false ./scripts/update-novels.sh
# Check novels/index.html and novels/series.html
```

### Test Full Pipeline
```bash
cd eastsea-blog
./scripts/update-novels.sh
git push origin master
# Wait 1-2 minutes
# Visit https://eastsea.monster/novels
```

## Troubleshooting

### Script Fails
- **Check Python 3:** `python3 --version` (requires 3.7+)
- **Check jq:** `jq --version` (for JSON parsing)
- **Encoding errors:** Ensure files are UTF-8 encoded

### Website Not Updating
1. Check GitHub Actions: `https://github.com/kjaylee/eastsea-blog/actions`
2. Verify commit pushed: `git log --oneline -5`
3. Check GitHub Pages deployment status
4. Clear browser cache

### Missing Episodes
- Verify markdown file naming: `{series-slug}-{episode}.md`
- Check YAML frontmatter syntax (proper indentation)
- Ensure `episode` is a number, not string

## Extending the System

### Add New Series
Just create markdown files with a new `series` value. The script auto-detects and adds cards.

### Custom Descriptions
Edit the generated `index.html` and replace:
```html
<p class="description">
    <!-- Auto-generated card -->
</p>
```
with your custom description.

### Add Thumbnails
Extend the script to support `thumbnail` field in frontmatter:
```yaml
thumbnail: "/images/series-name.jpg"
```

Then modify the card generation to include:
```html
<img src="{{ thumbnail }}" alt="{{ series }}">
```

## Maintenance

### Weekly Checks
- [ ] Verify cron job ran: `openclaw cron runs --id efaadfdb... --limit 1`
- [ ] Check website loads: `curl -I https://eastsea.monster/novels`
- [ ] Validate episode count matches files: `ls _data/*.md | wc -l`

### Monthly Tasks
- [ ] Review script logs for errors
- [ ] Update dependencies (jq, python)
- [ ] Backup `_data/` folder

## Performance

- **Script Runtime:** ~2-5 seconds for 50 episodes
- **GitHub Pages Deploy:** 1-2 minutes
- **Total Time (write → live):** ~5 minutes

## Future Enhancements

- [ ] RSS feed generation
- [ ] Search functionality
- [ ] Reader analytics
- [ ] Email notifications for new episodes
- [ ] Mobile app integration
- [ ] Multi-language support

## Formula Calculator Batch

### Purpose
`tool-formula-batch.py` scans every `tools/*/tool.config.json` in the repo, reports which generated files (`index.html`, `app.js`, `app.test.js`) are present or missing, and optionally backfills missing files without touching already-present ones.

### Modes
| Flag | Behaviour |
|------|-----------|
| _(none)_ | **dry-run** audit — report only, no writes |
| `--write-missing` | Write only missing generated files; preserve existing files |
| `--force` | Write all generated files, overwriting any existing content |

### Options
| Option | Description |
|--------|-------------|
| `--root PATH` | Repo root directory (required) |
| `--slug SLUG` | Limit to one tool by slug (repeatable) |
| `--json-out PATH` | Write machine-readable JSON report |
| `--md-out PATH` | Write Markdown report |

### Examples
```bash
# Dry-run audit of all config-driven tools (no writes)
cd /Users/kjaylee/.openclaw/workspace
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog

# Dry-run with JSON and Markdown reports
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog \
  --json-out eastsea-blog/tmp/batch-report.json \
  --md-out eastsea-blog/tmp/batch-report.md

# Safe partial backfill — writes only missing generated files
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog \
  --write-missing

# Backfill a single tool by slug
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog \
  --write-missing \
  --slug kick-subscription-payout-calculator

# Force overwrite all generated files for two tools
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog \
  --force \
  --slug app-store-subscription-proceeds-calculator \
  --slug mercari-fee-calculator
```

### Notes
- Default is always **dry-run**; pass `--write-missing` or `--force` to modify files.
- `--write-missing` without `--force` is safe: existing files are never overwritten.
- Does **not** mutate `manifest.json` or `_data/tools-list.json`.
- Exit 0 on success, 1 on usage/validation/write error.

---

## Formula Calculator Scaffold

### Purpose
`tool-formula-scaffold.py` generates a static calculator bundle from a formula-based `tool.config.json`.

### Output
Given one config, it writes:
- `index.html`
- `app.js`
- `app.test.js`

### Example
```bash
cd /Users/kjaylee/.openclaw/workspace
python3 eastsea-blog/scripts/tool-formula-scaffold.py \
  --config eastsea-blog/tools/app-store-subscription-proceeds-calculator/tool.config.json \
  --outdir tmp/tool-formula-scaffold-smoke/app-store-subscription-proceeds-calculator \
  --force
```

### Notes
- v1 supports **formula-based number inputs only**.
- It does **not** mutate `manifest.json` or `_data/tools-list.json`.
- Safe overwrite requires `--force`.

## Tool Opportunity Ranker

### Purpose
`tool-opportunity-ranker.py` scans the current `tools/` corpus plus `tools/manifest.json` and `_data/tools-list.json`, then ranks the highest-leverage next fixes for mass production.

### What it scores
- monetization-intent slug keywords (`fee`, `profit`, `revenue`, `roi`, etc.)
- exposure already promised in `manifest.json` / `_data/tools-list.json`
- shippability signals such as existing title/meta/inputs/inline script
- missing production layers: external logic modules, automated tests, and tools-list discoverability

### Example
```bash
cd /Users/kjaylee/.openclaw/workspace
python3 eastsea-blog/scripts/tool-opportunity-ranker.py \
  --root eastsea-blog \
  --limit 10 \
  --json-out eastsea-blog/tmp/tool-opportunity-ranker.json \
  --md-out eastsea-blog/tmp/tool-opportunity-ranker.md
```

### Notes
- Read-only: it does **not** mutate any tool pages or catalogs.
- Designed to pick the next P1 slice when the repo already contains hundreds of partially-shipped tool pages.
- Best paired with `tool-catalog-guard.py` for deterministic backlog cleanup.

## Tool Catalog Reconciler

### Purpose
`tool-catalog-reconciler.py` reconciles the three tool-discovery layers from filesystem truth:
- `_data/tools-list.json`
- `tools/manifest.json`
- `tools/index.html` public count claims

### What it does
- enumerates filesystem tool slugs under `tools/`
- repairs or backfills tools-list rows using live page title/meta description
- normalizes canonical `slug` + `url` fields
- optionally prunes stale tools-list rows that no longer exist on disk
- regenerates `tools/manifest.json` with fresh counts, titles, and sizes
- patches landing-page count copy plus JSON-LD `numberOfItems`

### Example
```bash
cd /Users/kjaylee/.openclaw/workspace

# dry-run previews only
python3 eastsea-blog/scripts/tool-catalog-reconciler.py \
  --root eastsea-blog \
  --prune-extra \
  --json-out eastsea-blog/tmp/tool-catalog-candidates.json \
  --merge-out eastsea-blog/tmp/tools-list.merged.preview.json \
  --manifest-out eastsea-blog/tmp/tools.manifest.preview.json \
  --landing-out eastsea-blog/tmp/tools.index.preview.html

# apply all catalog sync writes after review
python3 eastsea-blog/scripts/tool-catalog-reconciler.py \
  --root eastsea-blog \
  --prune-extra \
  --write-all
```

### Notes
- Default mode is **dry-run**.
- `--write-all` is shorthand for `--write-tools-list --write-manifest --write-landing-counts`.
- Use `--prune-extra` when you want `_data/tools-list.json` to match filesystem truth exactly.
- Best paired with `tool-catalog-guard.py` to verify manifest/count/discoverability drift is gone.

## Tool Analytics Sync

### Purpose
`tool-analytics-sync.py` audits `tools/*/index.html` for the standard analytics include and can repair missing pages in one pass.

### What it does
- scans repo tool pages under `tools/*/index.html`
- treats `/assets/analytics.js` as the compliance invariant
- defaults to **dry-run** reporting with optional JSON/Markdown outputs
- injects exactly one analytics include into missing pages when `--write-missing` is passed
- preserves idempotency by skipping already-compliant pages

### Example
```bash
cd /Users/kjaylee/.openclaw/workspace

# dry-run audit
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --json-out eastsea-blog/tmp/tool-analytics-sync.json \
  --md-out eastsea-blog/tmp/tool-analytics-sync.md

# repair only missing pages
python3 eastsea-blog/scripts/tool-analytics-sync.py \
  --root eastsea-blog \
  --write-missing
```

### Notes
- Injection target is inside `<head>`: before the first `<script>` when present, otherwise before `</head>`.
- `--slug <slug>` is repeatable for surgical repair on selected tools.
- If a page has no valid `<head>` section, the tool reports an error and leaves the file untouched.
- Best paired with `tool-catalog-guard.py` to confirm `tool_missing_analytics_include` is zero.

---

**Last Updated:** 2026-03-28  
**Maintainer:** OpenClaw Agent (Subagent: tool-catalog-reconciler, tool-analytics-sync)
