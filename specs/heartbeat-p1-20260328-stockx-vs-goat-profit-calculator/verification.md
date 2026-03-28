# Verification — StockX vs GOAT Profit Calculator

## Commands run
```bash
node --check tools/stockx-vs-goat-profit-calculator/calculator.js
node --check tools/stockx-vs-goat-profit-calculator/calculator.test.js
node --test tools/stockx-vs-goat-profit-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 43128 --bind 127.0.0.1
curl -I http://127.0.0.1:43128/tools/stockx-vs-goat-profit-calculator/
curl -s http://127.0.0.1:43128/tools/stockx-vs-goat-profit-calculator/ | grep -E 'StockX vs GOAT Profit Calculator|Winner|StockX payout after fees|GOAT payout before seller costs'
```

## Results
### Node checks + tests
- `node --check` passed for both JS files.
- `node --test tools/stockx-vs-goat-profit-calculator/calculator.test.js` passed.
- Test totals:
  - `pass 10`
  - `fail 0`

### Manifest rebuild
- `tools/manifest.json: 730개`

### Localhost smoke
`curl -I` returned:
```http
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.3
Content-type: text/html
```

`curl -s ... | grep -E ...` matched:
- `StockX vs GOAT Profit Calculator`
- `Winner`
- `StockX payout after fees`
- `GOAT payout before seller costs`

## Deterministic default reference case
From the shipped comparison module defaults:
- StockX net profit: `$44.60`
- GOAT net profit: `$39.60`
- Winner: `StockX`
- Winner delta: `$5.00`
- Price needed on StockX to match GOAT: `$254.34`
- Price needed on GOAT to match StockX: `$265.64`
