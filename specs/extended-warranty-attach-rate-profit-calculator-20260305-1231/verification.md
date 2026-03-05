# Verification

- `node --check tools/extended-warranty-attach-rate-profit-calculator/calculator.js`
- `python3 -m http.server 8899`
  - `curl -I http://localhost:8899/tools/extended-warranty-attach-rate-profit-calculator/ | head -n 1`
  - Result: `HTTP/1.0 200 OK`
