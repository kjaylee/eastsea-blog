# Verification — OnlyFans Earnings Calculator

## Syntax checks
- `node --check calculator.js` → ✅ OK
- `node --check calculator.test.js` → ✅ OK

## Unit tests
- `node --test tools/onlyfans-earnings-calculator/calculator.test.js` → **13/13 pass**
  - TC-01 baseline scenario ✅
  - TC-02 required subscribers for target ✅
  - TC-03 break-even subscribers ✅
  - TC-04 required subscription price ✅
  - TC-05 validation rejects bad inputs (13 cases) ✅
  - TC-06 zero subscribers edge case ✅
  - TC-07 promo cost sensitivity ✅
  - TC-08 refund rate sensitivity ✅
  - TC-09 DEFAULTS shape ✅
  - TC-10 summary includes key fields ✅
  - TC-11 Korean language ✅
  - TC-12 HTML scaffold anchors ✅
  - TC-13 catalog exact-once wiring ✅

## Integration test
- `node --test tests/integration/manifest-integrity.test.mjs`
  - tc_iA_02 (every manifest entry has directory) → ✅ pass (our new entry resolves)
  - Pre-existing failures (tiktok-shop-fee-profit-calculator orphan dir, novel episode missing) are unrelated to this change.

## HTTP smoke test
- `python3 -m http.server 4297` → `curl http://127.0.0.1:4297/tools/onlyfans-earnings-calculator/`
  - HTTP status: **200**
  - Title "OnlyFans Earnings Calculator" present: **yes**
  - `<link rel="canonical">` present: **yes**
  - `application/ld+json` present: **yes**
  - `./calculator.js` script ref: **yes**
  - `/assets/analytics.js` script ref: **yes**

## Catalog wiring verified
- `tools/manifest.json` — entry added with slug, title, url, size ✅
- `_data/tools-list.json` — entry added with title, description, url, category, tags ✅
- `tools/index.html` — tool card inserted (exact-once) ✅
- `tools/index.md` — markdown link inserted (exact-once) ✅
