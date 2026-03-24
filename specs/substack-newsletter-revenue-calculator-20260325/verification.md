# Verification — Substack Newsletter Revenue Calculator

## 1) Deterministic unit tests
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/substack-newsletter-revenue-calculator/calculator.test.js
```
Expected:
- All tests pass (baseline math, derive‑paid mode, validation, HTML includes, discovery exact‑once).

## 2) Local HTTP smoke
Commands:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 -m http.server 4173 >/tmp/eastsea-snr-http.log 2>&1 &
echo $! >/tmp/eastsea-snr-http.pid
curl -I http://127.0.0.1:4173/tools/substack-newsletter-revenue-calculator/
curl -s http://127.0.0.1:4173/tools/substack-newsletter-revenue-calculator/ | \
  grep -E 'Substack Newsletter Revenue Calculator|Gross|Net take-home|Effective fee rate|/assets/analytics.js'
kill "$(cat /tmp/eastsea-snr-http.pid)"
```
Observed (example):
- `HTTP/1.0 200 OK`
- HTML contains expected tokens: title, KPI labels, analytics include.

## 3) Catalog guard spot-check
- `tools/manifest.json` now has an entry for `substack-newsletter-revenue-calculator` and `count` increased by 1.
- `_data/tools-list.json` already had the slug (no duplicates introduced).
- `tools/index.html` and `tools/index.md` already contained exactly one card/link (no duplicates introduced).
