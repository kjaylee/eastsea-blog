# Verification — ThriveCart vs SamCart Cost Calculator

## Shipped artifact
- `tools/thrivecart-vs-samcart-cost-calculator/index.html`
- `tools/thrivecart-vs-samcart-cost-calculator/logic.mjs`
- `tools/thrivecart-vs-samcart-cost-calculator/app.mjs`
- `tests/unit/thrivecart-vs-samcart-cost-calculator.test.mjs`
- discovery wiring in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, `tools/manifest.json`

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/thrivecart-vs-samcart-cost-calculator/logic.mjs
node --check tools/thrivecart-vs-samcart-cost-calculator/app.mjs
node --test tests/unit/thrivecart-vs-samcart-cost-calculator.test.mjs
bash scripts/build-manifests.sh
python3 -m http.server 4173 >/tmp/eastsea-thrivecart-http.log 2>&1 &
curl -I http://127.0.0.1:4173/tools/thrivecart-vs-samcart-cost-calculator/
curl -s http://127.0.0.1:4173/tools/thrivecart-vs-samcart-cost-calculator/ | grep -E 'ThriveCart vs SamCart Cost Calculator|one-time|monthly|break-even'
```

## Results
### 1) Static checks
- `node --check tools/thrivecart-vs-samcart-cost-calculator/logic.mjs` — pass
- `node --check tools/thrivecart-vs-samcart-cost-calculator/app.mjs` — pass

### 2) Unit tests
- `node --test tests/unit/thrivecart-vs-samcart-cost-calculator.test.mjs` — **7/7 passing**
- Verified:
  - break-even month = 7 under default assumptions
  - required SamCart lift calculation
  - SamCart win path when user-entered lift is strong enough
  - target gross planner outputs
  - invalid input rejection
  - metadata/discovery exact-once wiring

### 3) Manifest rebuild
- `bash scripts/build-manifests.sh` completed successfully.
- Output observed:
  - `games/manifest.json: 358개`
  - `tools/manifest.json: 738개`

### 4) Local HTTP smoke
Observed response:
- `HTTP/1.0 200 OK`
- `Content-type: text/html`
- `Content-Length: 15716`

Observed content grep included:
- `ThriveCart vs SamCart Cost Calculator | One-Time vs Monthly Break-even`
- `one-time ThriveCart purchase`
- `monthly SamCart subscription`
- `break-even month`

## Unrelated repo-wide check noted
I also ran:
```bash
node --test tests/integration/manifest-integrity.test.mjs
```
It failed on **pre-existing unrelated content-manifest issues** outside this tool:
- missing novel episode file (`novels/_data/카페사장님은전생자입니다-010.md`)
- `posts.json` / `_posts` mismatch

These failures are not caused by `thrivecart-vs-samcart-cost-calculator` and do not block the shipped tool itself.

## Verification verdict
**PASS for shipped scope.** The new tool renders locally, tests cleanly, and discovery wiring is present exactly once for the new slug.