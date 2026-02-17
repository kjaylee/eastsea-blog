# Spec: Business Tools Batch 2 (5 tools)

## Objective
Ship 5 business-critical tools for EastSea operations focused on QA, SEO quality, social distribution preview, and monetization tracking.

## Scope
Create self-contained pages at:
- `tools/game-qa-checklist/index.html`
- `tools/keyword-density-analyzer/index.html`
- `tools/social-share-preview/index.html`
- `tools/revenue-dashboard-calculator/index.html`
- `tools/blog-post-optimizer/index.html`

Update:
- `tools/manifest.json` (count + entries)

## Functional Requirements

### 1) game-qa-checklist
- Interactive QA checklist for pre-publish game verification.
- Includes categories:
  - Mobile touch (tap/swipe)
  - localStorage save/load
  - Responsive layout
  - Performance (FPS)
  - Audio
  - SEO meta tags present
  - Structured data
- URL input performs auto checks where possible:
  - iframe load preview
  - metadata/structured-data detection via fetched HTML (with proxy fallback)
- Export checklist state to Markdown report.

### 2) keyword-density-analyzer
- Input modes:
  - Paste text
  - Fetch by URL
- Analyze keyword frequency and density.
- Show top 20 keywords with density %.
- Word cloud visualization on canvas.
- Highlight over-optimized keywords (density > 3%).

### 3) social-share-preview
- Input URL and parse social metadata.
- Render previews for:
  - Google SERP
  - Twitter/X card
  - Facebook/LinkedIn share card
  - Telegram preview
  - KakaoTalk preview
- Warning engine for missing/truncated elements.
- Fallback mode to analyze pasted HTML source for CORS-blocked URLs.

### 4) revenue-dashboard-calculator
- Multi-source monthly revenue calculator:
  - AdSense (CPM + pageviews)
  - Telegram Stars (count + conversion rate)
  - Direct sales (units × price)
  - itch.io (gross + revenue share %)
- Monthly projection chart on canvas.
- Goal tracker: target monthly amount vs achieved %.
- Save/load data via localStorage.

### 5) blog-post-optimizer
- Analyze pasted blog post Markdown.
- Checks:
  - title length (50–60 chars)
  - meta description length (150–160)
  - heading structure (H1→H2→H3 progression)
  - image alt tags
  - internal links count
  - readability score
  - keyword presence in first paragraph
- Score card (0–100) with letter grade.
- Actionable fix suggestions per issue.

## Non-Functional Requirements
- Single-file implementation per tool (`index.html` with inline CSS/JS).
- Mobile responsive layout.
- Polished dark UI.
- Fully functional features (no placeholder UI-only skeletons).
