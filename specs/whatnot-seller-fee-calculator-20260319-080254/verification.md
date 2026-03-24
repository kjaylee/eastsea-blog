# Verification — Whatnot Seller Fee Calculator

Date: 2026-03-19 08:09 KST

## Commands run
1. `node --check tools/whatnot-seller-fee-calculator/calculator.js`
2. `node --test tools/whatnot-seller-fee-calculator/calculator.test.js`
3. `bash scripts/build-manifests.sh`
4. `python3 -m http.server 4173`
5. `curl -I http://127.0.0.1:4173/tools/whatnot-seller-fee-calculator/`
6. exact-once verification with Python against `_data/tools-list.json`, `tools/manifest.json`, `tools/index.html`, `tools/index.md`

## Results
- JS syntax: PASS
- Node tests: **11/11 PASS**
- Manifest rebuild: PASS (`tools/manifest.json: 596개`)
- HTTP smoke: **200 OK**
- Discovery exact-once:
  - `_data/tools-list.json`: PASS
  - `tools/manifest.json`: PASS
  - `tools/index.html`: PASS
  - `tools/index.md`: PASS

## Key evidence
- HTTP response: `HTTP/1.0 200 OK`
- Manifest entry:
  - slug: `whatnot-seller-fee-calculator`
  - url: `/tools/whatnot-seller-fee-calculator/`
- Tools list entry:
  - title: `Whatnot Seller Fee Calculator`
  - url: `/tools/whatnot-seller-fee-calculator/`

## Delivered files
- `tools/whatnot-seller-fee-calculator/index.html`
- `tools/whatnot-seller-fee-calculator/calculator.js`
- `tools/whatnot-seller-fee-calculator/calculator.test.js`
