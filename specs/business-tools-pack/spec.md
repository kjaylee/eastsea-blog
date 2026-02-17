# Spec: Business Tools Pack (5 tools)

## Objective
Ship 5 business-critical tools that directly support EastSea distribution, monetization, and SEO operations.

## Scope
Create self-contained pages at:
- `tools/game-embed-generator/index.html`
- `tools/game-metadata-builder/index.html`
- `tools/novel-char-validator/index.html`
- `tools/adsense-revenue-simulator/index.html`
- `tools/seo-meta-checker/index.html`

Update:
- `tools/manifest.json` (count + entries)

## Functional Requirements

### 1) game-embed-generator
- Input: game URL
- Controls: width, height, responsive toggle
- Output blocks:
  - iframe embed code
  - itch.io widget HTML template
  - CrazyGames submission link template
  - Telegram Mini App webapp URL template
- Real-time iframe preview
- Copy button for each output

### 2) game-metadata-builder
- Inputs: KR title, EN title, slug, genre, description
- Generate in one action:
  - HTML `<head>` metadata block (SEO + OG + Twitter + canonical)
  - JSON-LD VideoGame block
  - manifest.json entry block
  - games-list.json entry block
- Copy button for each block

### 3) novel-char-validator
- Input: chapter text
- Real-time metrics:
  - total chars
  - chars excluding spaces
  - word count
  - paragraph count
  - reading time
- 7,000–9,000 char pass/fail indicator
- Guidance:
  - too short = red
  - too long = yellow

### 4) adsense-revenue-simulator
- Inputs: daily pageviews, CTR%, CPC$, RPM override
- Outputs:
  - estimated daily/monthly/yearly revenue
- Presets:
  - Current (traffic 0)
  - 100 DAU
  - 1K DAU
  - 10K DAU
- Canvas bar chart
- Breakeven calculator (required pageviews for target monthly USD)

### 5) seo-meta-checker
- Input: URL (prefilled with EastSea domains)
- Fetch + parse metadata:
  - title, description, OG tags, canonical, robots, structured data
- Score each element (present/missing/too long/too short)
- Social previews:
  - Google SERP
  - Twitter card
  - Facebook share
- Quick-fix suggestions
- CORS fallback path via HTML paste mode

## Non-Functional
- Mobile responsive
- Polished dark UI
- Fully client-side single-file operation per tool
- No external build step required
