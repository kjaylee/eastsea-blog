# Plan: Business Tools Pack

## Architecture
- Each tool is a standalone `index.html` with inline CSS/JS.
- Shared UX pattern across all tools:
  - dark gradient background
  - card-based layout
  - responsive grid
  - copy-to-clipboard helper

## Data/Logic Strategy
- `game-embed-generator`: derive slug from URL, synthesize templates.
- `game-metadata-builder`: compose blocks from normalized inputs.
- `novel-char-validator`: compute live text statistics via regex splitting.
- `adsense-revenue-simulator`: compute from CTR/CPC unless RPM override is set.
- `seo-meta-checker`: parse HTML with `DOMParser`, attempt direct fetch then proxy fallback, support manual HTML.

## Test Cases (pre-implementation)

### Spec validation tests
1. Each slug path exists with `index.html`.
2. Each page has required input controls and output sections.
3. Each page has at least one working copy button where required.
4. Tools are listed in `tools/manifest.json` and count increments by 5.

### User-scenario tests
1. Embed generator: input `https://games.eastsea.xyz/shadow-legion-idle/` and verify iframe + preview updates.
2. Metadata builder: fill KR/EN/slug and verify all 4 blocks generate valid JSON where applicable.
3. Novel validator: paste 6,500 chars => fail (too short), 8,000 => pass, 9,500 => fail (too long).
4. AdSense simulator: run presets and confirm revenue changes + chart redraws.
5. SEO checker: fetch a page, produce element-level statuses, render social previews; if fetch blocked, manual HTML still works.

## Implementation Order
1. Build HTML for all 5 tools.
2. Run smoke checks by grepping key IDs and quick JS sanity.
3. Rebuild tools manifest.
4. Commit + push.
5. Verify production URL reflects new manifest/tool pages.
