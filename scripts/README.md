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

---

**Last Updated:** 2026-02-06  
**Maintainer:** OpenClaw Agent (Subagent: novel-publish-system)
