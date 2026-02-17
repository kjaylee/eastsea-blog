# Plan: Business Tools Batch 2

## Architecture
- Build each tool as a standalone HTML page with inline CSS + JavaScript.
- Use a shared dark visual language:
  - gradient background
  - card layout
  - rounded controls
  - responsive grids and mobile-first spacing

## Logic Strategy per Tool
1. **game-qa-checklist**
   - Maintain checklist model (categories/items, auto/manual flags).
   - Fetch target URL HTML with direct request + proxy fallback.
   - Parse metadata with DOMParser and auto-mark matching checklist items.
   - Render iframe preview and export current checklist state to Markdown.

2. **keyword-density-analyzer**
   - Source text from textarea or URL-fetched HTML.
   - Tokenize Korean/English words, filter stopwords, compute density.
   - Render top-20 table and over-optimization warnings (>3%).
   - Draw weighted word cloud on canvas.

3. **social-share-preview**
   - Parse metadata from URL HTML or pasted raw HTML.
   - Build normalized metadata object (title/description/OG/Twitter/canonical).
   - Render 5 share preview cards.
   - Produce warnings for missing fields and common truncation limits.

4. **revenue-dashboard-calculator**
   - Compute revenue by source and total monthly revenue.
   - Project 12 months with configurable monthly growth.
   - Draw projection chart on canvas.
   - Save/load/clear persisted state in localStorage.

5. **blog-post-optimizer**
   - Parse markdown for title, frontmatter description, headings, links, images.
   - Compute readability and keyword checks.
   - Score weighted criteria to 0–100 and map to letter grade.
   - Generate actionable fix list and report summary.

## Test Cases (pre-implementation)

### Spec validation tests
1. All 5 paths exist and contain functional `index.html` files.
2. Each tool has required inputs + output visualization section.
3. URL-based tools support fallback mode when direct fetch fails.
4. Manifest count increments by exactly 5 and includes all new slugs.

### User-scenario tests
1. **game-qa-checklist**
   - Input `https://games.eastsea.xyz/` (or sample URL) and run auto-check.
   - Verify iframe preview updates and Markdown export contains checklist states.
2. **keyword-density-analyzer**
   - Paste SEO paragraph with repeated keyword and verify >3% rows are highlighted.
   - URL mode should extract page text and produce top-20 keywords.
3. **social-share-preview**
   - Analyze URL and ensure all 5 preview cards render.
   - If CORS-blocked, pasted HTML mode should still produce metadata + warnings.
4. **revenue-dashboard-calculator**
   - Enter sample values and verify totals, goal %, and chart change.
   - Save data, reload page, then load saved values correctly.
5. **blog-post-optimizer**
   - Analyze sample markdown with deliberate issues.
   - Verify score generation, grade output, and actionable fixes for each failing rule.

## Implementation Order
1. Create specs/docs (this folder).
2. Build 5 tools.
3. Run local smoke checks (file existence + quick lint-like parse).
4. Rebuild `tools/manifest.json`.
5. Commit and push.
6. Verify production deployment reflects 285 tools.
