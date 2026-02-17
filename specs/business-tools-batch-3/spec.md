# Spec: Business Tools Batch 3 (Operations Critical)

## Objective
Ship 5 business-critical tools for EastSea operations with immediate utility in Telegram mini app publishing, game promo asset creation, sitemap health monitoring, page performance estimation, and editorial planning.

## Scope
Create/replace self-contained pages:
- `tools/telegram-miniapp-tester/index.html`
- `tools/game-screenshot-generator/index.html`
- `tools/sitemap-analyzer/index.html`
- `tools/page-speed-estimator/index.html`
- `tools/content-calendar-planner/index.html` (upgrade)

Update:
- `tools/manifest.json`

## Functional Requirements

### 1) telegram-miniapp-tester
- Input web app URL.
- Device preview iframe sizes: iPhone SE, iPhone 14, Android.
- Validation checks:
  - HTTPS
  - viewport meta presence/content
  - touch/pointer support hints
  - responsive hints
- Generate BotFather `/newapp` template text.
- Provide ready-to-copy `WebApp.ready()` and `WebApp.close()` snippets.

### 2) game-screenshot-generator
- Input game URL and preview in iframe.
- 4 capture presets: 16:9, 9:16, 1:1, 3:1.
- Overlay text (title), font size, color, and position controls.
- PNG download per preset.
- Batch mode producing 4 screenshots in one action.

### 3) sitemap-analyzer
- Input sitemap URL with EastSea defaults.
- Parse XML sitemap and show:
  - total URL count
  - lastmod range/timeline
  - changefreq distribution
- Highlight:
  - stale URLs (`lastmod` older than 30 days)
  - missing URLs (non-200 status)
  - orphan candidates (sitemap URLs not found in homepage links)
- CSV export.

### 4) page-speed-estimator
- Input URL and analyze client-side estimations.
- CORS fallback by allowing pasted HTML source.
- Metrics:
  - resource count
  - estimated total transfer weight
  - render-blocking resources
- Scoring:
  - estimated FCP
  - resource weight score
  - compression opportunity score
- Comparison mode for 2 URLs side-by-side.

### 5) content-calendar-planner
- Monthly calendar UI.
- Add/edit/delete items with fields:
  - title
  - type (blog/game/tool/novel)
  - status (planned/draft/published)
  - date
- Type color coding.
- localStorage persistence.
- Markdown table export.
- Publishing streak + gap detection summary.

## Non-Functional Requirements
- Single `index.html` file per tool with inline CSS/JS.
- Mobile responsive and polished dark UI.
- Functional behavior (no placeholder-only UI).
