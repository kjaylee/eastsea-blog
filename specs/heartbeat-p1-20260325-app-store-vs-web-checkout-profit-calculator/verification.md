# Verification — App Store vs Web Checkout Profit Calculator

## Commands run

### 1) Tool unit tests + targeted repo integrity tests
```bash
node --test \
  tools/app-store-vs-web-checkout-profit-calculator/calculator.test.js \
  tests/unit/test-manifest.mjs \
  tests/usecase/tool-discovery.test.mjs \
  tests/integration/link-integrity.test.mjs
```

### Result
- 31 tests passed
- 0 failed

Key assertions covered:
- golden scenario math
- capture-rate sensitivity
- App Store win scenario under heavy web leakage
- break-even threshold behavior
- invalid input rejection
- manifest/discovery/link integrity after surgical manifest patch

### 2) Local HTTP smoke test
```bash
python3 -m http.server 4317
curl -I http://127.0.0.1:4317/tools/app-store-vs-web-checkout-profit-calculator/index.html
curl -s http://127.0.0.1:4317/tools/app-store-vs-web-checkout-profit-calculator/index.html | <title extraction>
```

### Result
- HTTP status: `200 OK`
- Extracted title:
  - `App Store vs Web Checkout Profit Calculator | 앱스토어 vs 웹 체크아웃 손익 계산기`
- HTML confirmed to contain:
  - `./calculator.js`
  - `WebApplication` JSON-LD

## Verification verdict
Pass. The previously broken catalog destination now resolves to a working page with validated calculator logic and manifest presence.
