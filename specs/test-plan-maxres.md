# eastsea-blog Maximum-Resolution Test Plan
Created: 2026-02-24
Target: 0 → 200+ tests

## Project Overview
Static site at eastsea.monster with:
- Blog (220 posts, 8 categories), powered by posts.json + markdown viewer
- 451 tools (standalone HTML SPAs)
- 1 game (cult-tycoon)
- 10 novels (73 episodes total)
- Hotdeal SPA (game deals aggregator)
- Visit counter (API-backed)
- Build scripts: update-posts.sh (Node), build-manifests.sh (Python)

## Test Infrastructure
- **Runner**: Node.js built-in `node:test` + `node:assert` (v25.5.0)
- **No external deps** — pure Node.js
- **Location**: `tests/` directory
- **Setup**: `tests/setup.mjs` — shared helpers, function extraction

## Phase 1: Unit Tests (~80 tests)

### 1A. Front Matter Parsing (12 tests)
File: `tests/unit/front-matter.test.mjs`
- TC-FM-01: Standard front matter with title/date/categories
- TC-FM-02: Front matter with array-format categories
- TC-FM-03: Front matter with quoted values
- TC-FM-04: Missing front matter → empty object + full content
- TC-FM-05: Empty front matter (just ---/---) → empty object
- TC-FM-06: Front matter with extra whitespace
- TC-FM-07: Content with --- in body (not front matter delimiter)
- TC-FM-08: Unicode title in front matter
- TC-FM-09: Multi-line front matter values (first line only)
- TC-FM-10: Front matter with colon in value
- TC-FM-11: Nested front matter (arrays) → first element extracted
- TC-FM-12: Real post file front matter parsing

### 1B. Date Formatting (10 tests)
File: `tests/unit/date-formatting.test.mjs`
- TC-DT-01: ISO date "2026-02-05" → Korean format
- TC-DT-02: Date with time "2026-02-05 18:00:00 +0900" → extracts date
- TC-DT-03: Invalid date string → returns original
- TC-DT-04: null/undefined → returns empty/fallback
- TC-DT-05: NovelsApp.formatDate with Date object
- TC-DT-06: NovelsApp.formatDate with invalid → returns "-"
- TC-DT-07: NovelsApp.formatDate with null → returns "-"
- TC-DT-08: Weekday calculation correctness
- TC-DT-09: Leap year date handling
- TC-DT-10: Edge: year 2000, year 9999

### 1C. NovelsApp Pure Functions (15 tests)
File: `tests/unit/novels-app.test.mjs`
- TC-NA-01: normEp(1) → "001"
- TC-NA-02: normEp("42") → "042"
- TC-NA-03: normEp(undefined) → "000" or equivalent
- TC-NA-04: cleanEpisodeTitle("[웹소설] 카페 사장님은 전생자입니다 - 4화", 4) → "카페 사장님은 전생자입니다"
- TC-NA-05: cleanEpisodeTitle("달빛이 내리는 정원", 1) → "달빛이 내리는 정원"
- TC-NA-06: cleanEpisodeTitle("", 3) → "제3화"
- TC-NA-07: cleanEpisodeTitle(null, 5) → "제5화"
- TC-NA-08: getCoverPath("test-novel") → "covers/test-novel.png"
- TC-NA-09: getCoverPath with Korean slug → URL-encoded
- TC-NA-10: getEpisodePath("my-novel", 3) → "_data/my-novel-003.md"
- TC-NA-11: splitFrontMatter with valid front matter → separates meta and body
- TC-NA-12: splitFrontMatter without front matter → empty meta, full body
- TC-NA-13: extractMeta with all fields → extracts title, episode, date, author, series
- TC-NA-14: extractMeta with missing fields → empty strings
- TC-NA-15: markdownToSynopsis → extracts first 2 paragraphs, strips markdown

### 1D. Category Detection (12 tests)
File: `tests/unit/category-detection.test.mjs`
- TC-CD-01: Front matter "briefing" → "briefing"
- TC-CD-02: Front matter "digest" → "digest"
- TC-CD-03: Front matter "report" → "report"
- TC-CD-04: Front matter "journal" or "diary" → "journal"
- TC-CD-05: Front matter "research" → "research"
- TC-CD-06: Filename "2026-02-05-briefing-topic.md" → "briefing"
- TC-CD-07: Filename "2026-02-05-polish-xyz.md" → "polish"
- TC-CD-08: Filename "2026-02-05-upgrade-abc.md" → "upgrade"
- TC-CD-09: No match → "other"
- TC-CD-10: Front matter takes priority over filename
- TC-CD-11: Case-insensitive matching
- TC-CD-12: Verify all real posts.json categories are valid

### 1E. Visit Counter (8 tests)
File: `tests/unit/visit-counter.test.mjs`
- TC-VC-01: normalizePath("/tools/calc/") → "/tools/calc/"
- TC-VC-02: normalizePath("tools/calc") → "/tools/calc"
- TC-VC-03: normalizePath("") → "/"
- TC-VC-04: normalizePath(null) → "/"
- TC-VC-05: normalizePath("  /path  ") → "/path"
- TC-VC-06: createVisitorId returns non-empty string
- TC-VC-07: createVisitorId returns unique values
- TC-VC-08: Visitor ID format validation (contains timestamp + random)

### 1F. Excerpt Generation (10 tests)
File: `tests/unit/excerpt-gen.test.mjs`
- TC-EX-01: Normal markdown → first meaningful paragraph
- TC-EX-02: Blockquote → extracts blockquote text
- TC-EX-03: Short lines skipped
- TC-EX-04: Headers skipped
- TC-EX-05: Metadata-like lines skipped
- TC-EX-06: Markdown formatting stripped (*bold*, _italic_, `code`)
- TC-EX-07: Links stripped [text](url) → text
- TC-EX-08: Truncated to 120 chars + "..."
- TC-EX-09: Empty content → "더 읽기..."
- TC-EX-10: Real post excerpt extraction matches posts.json

### 1G. HTML Meta Rendering (8 tests)
File: `tests/unit/meta-rendering.test.mjs`
- TC-MR-01: createMetaSection with title → contains <h1>
- TC-MR-02: createMetaSection with date → contains formatted date
- TC-MR-03: createMetaSection with categories → contains tag spans
- TC-MR-04: createMetaSection with tags → contains tag spans
- TC-MR-05: createMetaSection without title → "제목 없음"
- TC-MR-06: createMetaSection with briefing category → correct CSS class
- TC-MR-07: createMetaSection with multiple categories
- TC-MR-08: createMetaSection with empty object → minimal valid HTML

## Phase 2: Use Case Tests (~60 tests)

### 2A. Blog Browsing Scenarios (10 tests)
File: `tests/usecase/blog-browsing.test.mjs`
- TC-UB-01: posts.json loads and contains expected fields
- TC-UB-02: All categories in posts.json are from valid set
- TC-UB-03: Filter "briefing" returns only briefing posts
- TC-UB-04: Filter "all" returns all posts
- TC-UB-05: Posts sorted reverse chronologically
- TC-UB-06: Each post has filename, date, category, title, excerpt
- TC-UB-07: Date format is YYYY-MM-DD for all posts
- TC-UB-08: No duplicate filenames
- TC-UB-09: All filenames match YYYY-MM-DD-*.md pattern
- TC-UB-10: Excerpt length ≤ 124 chars (120 + "...")

### 2B. Post Viewing Scenarios (10 tests)
File: `tests/usecase/post-viewing.test.mjs`
- TC-UV-01: Each post file in _posts/ is valid markdown
- TC-UV-02: Each post has parseable front matter
- TC-UV-03: Front matter title matches posts.json title
- TC-UV-04: Front matter date matches posts.json date
- TC-UV-05: Category detection is consistent between posts.json and view.html logic
- TC-UV-06: No broken markdown (unclosed code blocks, etc.)
- TC-UV-07: Post content has at least one heading or paragraph
- TC-UV-08: Sidebar loads correct category posts
- TC-UV-09: TOC generation from headings
- TC-UV-10: URL parameter handling: ?post=filename.md

### 2C. Hotdeal Scenarios (10 tests)
File: `tests/usecase/hotdeal.test.mjs`
- TC-UH-01: meta.json loads with valid structure
- TC-UH-02: All tab data files exist and parse as JSON
- TC-UH-03: popular.json has required deal fields (title, current_price, store)
- TC-UH-04: free.json deals have price=0 or "Free"
- TC-UH-05: Korean tab data has Korean language indicator
- TC-UH-06: top_rated.json has review_score ≥ threshold
- TC-UH-07: Price history data has timestamp + price arrays
- TC-UH-08: Deal URLs are valid format (https://)
- TC-UH-09: No duplicate deals within a tab
- TC-UH-10: Data freshness: meta.json updated within reasonable timeframe

### 2D. Novel Reading Scenarios (12 tests)
File: `tests/usecase/novel-reading.test.mjs`
- TC-UN-01: novels/manifest.json has valid structure
- TC-UN-02: Each novel has slug, title, episodes array
- TC-UN-03: Episode numbers are sequential (001, 002, ...)
- TC-UN-04: Each episode's markdown file exists
- TC-UN-05: Episode markdown has valid front matter
- TC-UN-06: Episode title extraction works for all formats
- TC-UN-07: Cover images exist for novels with covers
- TC-UN-08: Episode dates are chronologically ordered
- TC-UN-09: No duplicate episode numbers within a novel
- TC-UN-10: Synopsis generation from first episode
- TC-UN-11: Novel count matches manifest
- TC-UN-12: All novel slugs are URL-safe

### 2E. Tool Discovery Scenarios (8 tests)
File: `tests/usecase/tool-discovery.test.mjs`
- TC-UT-01: tools/manifest.json has valid structure
- TC-UT-02: Each tool has slug, title, url, size
- TC-UT-03: Each tool directory has index.html
- TC-UT-04: Tool titles are non-empty
- TC-UT-05: Tool URLs follow /tools/{slug}/ pattern
- TC-UT-06: Tool sizes are positive integers
- TC-UT-07: No duplicate tool slugs
- TC-UT-08: Sample tools have valid HTML structure (<title>, <style> or <link>)

### 2F. Build Script Scenarios (10 tests)
File: `tests/usecase/build-scripts.test.mjs`
- TC-BS-01: update-posts.sh exists and is executable
- TC-BS-02: build-manifests.sh exists and is executable
- TC-BS-03: posts.json matches _posts/ file count
- TC-BS-04: tools manifest count matches directory count
- TC-BS-05: games manifest count matches directory count
- TC-BS-06: All manifest dates are ISO format
- TC-BS-07: Manifest updatedAt field exists
- TC-BS-08: No orphaned posts (in _posts/ but not posts.json)
- TC-BS-09: No phantom posts (in posts.json but not _posts/)
- TC-BS-10: File naming convention compliance across all posts

## Phase 3: Integration Tests (~60 tests)

### 3A. Manifest ↔ Filesystem Integrity (10 tests)
File: `tests/integration/manifest-integrity.test.mjs`
- TC-IM-01: tools/manifest.json count matches actual tool directories
- TC-IM-02: Every tool in manifest has corresponding directory
- TC-IM-03: Every tool directory is listed in manifest
- TC-IM-04: games/manifest.json count matches actual game directories
- TC-IM-05: Every game in manifest has corresponding directory
- TC-IM-06: novels/manifest.json novel count matches
- TC-IM-07: Every novel episode file referenced in manifest exists
- TC-IM-08: posts.json count matches _posts/ .md file count
- TC-IM-09: Every post in posts.json has corresponding .md file
- TC-IM-10: Every .md file in _posts/ is listed in posts.json

### 3B. HTML Validity & Structure (12 tests)
File: `tests/integration/html-validity.test.mjs`
- TC-IH-01: index.html has DOCTYPE, <html>, <head>, <body>
- TC-IH-02: index.html has <title> tag
- TC-IH-03: view.html has DOCTYPE, <html>, <head>, <body>
- TC-IH-04: hotdeal/index.html has valid structure
- TC-IH-05: novels/index.html has valid structure
- TC-IH-06: about.html exists and has valid structure
- TC-IH-07: privacy.html exists and has valid structure
- TC-IH-08: terms.html exists and has valid structure
- TC-IH-09: contact.html exists and has valid structure
- TC-IH-10: All HTML files have charset UTF-8
- TC-IH-11: All HTML files have viewport meta tag
- TC-IH-12: No unclosed <script> tags in main pages

### 3C. SEO Metadata (10 tests)
File: `tests/integration/seo-metadata.test.mjs`
- TC-IS-01: index.html has og:title
- TC-IS-02: index.html has og:description
- TC-IS-03: index.html has og:url
- TC-IS-04: index.html has og:image
- TC-IS-05: index.html has twitter:card
- TC-IS-06: index.html has canonical URL
- TC-IS-07: index.html has structured data (JSON-LD)
- TC-IS-08: robots.txt exists and allows crawling
- TC-IS-09: sitemap.xml exists and is valid XML
- TC-IS-10: CNAME file matches expected domain

### 3D. Cross-Page Link Integrity (10 tests)
File: `tests/integration/link-integrity.test.mjs`
- TC-IL-01: Footer links (about, privacy, terms, contact) → files exist
- TC-IL-02: Hotdeal link from index.html → hotdeal/index.html exists
- TC-IL-03: Post card links → view.html?post=filename format
- TC-IL-04: Back link in view.html → "/" (root)
- TC-IL-05: Logo links → "/" (root)
- TC-IL-06: Tool URLs in manifest → directories exist
- TC-IL-07: Game URLs in manifest → directories exist
- TC-IL-08: Novel cover paths → files exist (or graceful fallback)
- TC-IL-09: Episode paths follow expected pattern
- TC-IL-10: No broken anchor references in static pages

### 3E. Data Consistency (8 tests)
File: `tests/integration/data-consistency.test.mjs`
- TC-DC-01: posts.json dates match filename dates
- TC-DC-02: posts.json categories are consistent with front matter
- TC-DC-03: Novel manifest episode counts match actual files
- TC-DC-04: Hotdeal tab data files all have consistent schema
- TC-DC-05: Tool manifest sizes are within reasonable range (1KB - 500KB)
- TC-DC-06: No encoding issues in any JSON file (valid UTF-8)
- TC-DC-07: All dates across all data files are valid ISO dates
- TC-DC-08: Version numbers in HTML files are consistent

### 3F. Static Asset Verification (10 tests)
File: `tests/integration/static-assets.test.mjs`
- TC-SA-01: favicon.ico exists
- TC-SA-02: favicon.png exists
- TC-SA-03: assets/css/ directory has stylesheets or index.html embeds styles
- TC-SA-04: assets/js/ directory has JS files
- TC-SA-05: .nojekyll file exists (GitHub Pages)
- TC-SA-06: .gitignore exists and has reasonable entries
- TC-SA-07: ads.txt exists (monetization)
- TC-SA-08: No excessively large files (>5MB) in tracked directories
- TC-SA-09: All image references in main pages point to existing files
- TC-SA-10: External CDN references use https://

## Summary
- Phase 1 (Unit): ~75 tests
- Phase 2 (Use Case): ~60 tests
- Phase 3 (Integration): ~60 tests
- **Grand total: ~195 tests**
