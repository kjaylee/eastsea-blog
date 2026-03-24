# Verification — Gumroad Net Revenue Calculator

## 1) Deterministic unit tests
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/gumroad-net-revenue-calculator/calculator.test.js
```

Result:
- `12` tests passed
- `0` failed

Key covered assertions:
- baseline mixed-sales math
- direct-only and discover-only scenarios
- Stripe vs PayPal fee drag difference
- custom processor override
- payout-drag sensitivity
- invalid-input rejection
- HTML scaffold + SEO copy
- exact-once discovery wiring in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, `tools/manifest.json`

## 2) Local HTTP verification
Command used (port 4273 because 4173 was already occupied by another local server):
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 -m http.server 4273 >/tmp/eastsea-gumroad-http.log 2>&1 &
echo $! >/tmp/eastsea-gumroad-http.pid
curl -I http://127.0.0.1:4273/tools/gumroad-net-revenue-calculator/
curl -s http://127.0.0.1:4273/tools/gumroad-net-revenue-calculator/ | grep -E 'Gumroad Net Revenue Calculator|10% \+ \$0\.50|30% Discover|Merchant of Record'
kill "$(cat /tmp/eastsea-gumroad-http.pid)"
```

Observed result:
- `HTTP/1.0 200 OK`
- HTML contains expected title and pricing copy:
  - `Gumroad Net Revenue Calculator`
  - `10% + $0.50`
  - `30% Discover`
  - `Merchant of Record`

## 3) Browser render check
- Opened `http://127.0.0.1:4274/tools/gumroad-net-revenue-calculator/`
- Snapshot confirmed heading and main panels rendered
- Screenshot captured successfully at:
  - `/Users/kjaylee/.openclaw/media/browser/385ff19b-7342-4bd8-b0a7-1f4d0af2c771.jpg`

Visual check passed:
- hero section renders
- inputs/results split layout renders
- KPI cards display baseline numbers
- comparison table and summary box visible

## 4) Metadata check
Confirmed after implementation:
- `tools/index.html` already linked slug exactly once
- `tools/index.md` already linked slug exactly once
- `_data/tools-list.json` now contains exactly one entry for `/tools/gumroad-net-revenue-calculator/`
- `tools/manifest.json` now contains exactly one entry for slug `gumroad-net-revenue-calculator`
