# Verification — eBay vs Poshmark Profit Calculator

## Commands run
```bash
node --check tools/ebay-vs-poshmark-profit-calculator/calculator.js
node --test tools/ebay-vs-poshmark-profit-calculator/calculator.test.js
python3 -m json.tool tools/manifest.json >/dev/null
python3 -m json.tool _data/tools-list.json >/dev/null
python3 -m http.server 8042
curl -I http://127.0.0.1:8042/tools/ebay-vs-poshmark-profit-calculator/
```

## Results
- `node --check` — pass
- `node --test` — 9 / 9 tests passed
- `python3 -m json.tool` on both JSON files — pass
- local HTTP render — `HTTP/1.0 200 OK`
- fetched HTML contained:
  - `eBay vs Poshmark Profit Calculator`
  - `eBay payout after fees`
  - `Poshmark payout after fee`
  - `../ebay-fee-profit-calculator/calculator.js`
  - `../poshmark-fee-profit-calculator/calculator.js`

## Verification evidence snapshot
- Default baseline: eBay wins by `$0.82`
- Reverse-solved parity prices:
  - eBay sold price needed to match Poshmark: `$42.19`
  - Poshmark list price needed to match eBay: `$49.13`
