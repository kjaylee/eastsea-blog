# Verification — affiliate-cookie-window-roi-calculator

## 1) Syntax check
```bash
node --check tools/affiliate-cookie-window-roi-calculator/calculator.js; echo check_exit:$?
```
Result: `check_exit:0`

## 2) Unit tests
```bash
node --test tools/affiliate-cookie-window-roi-calculator/calculator.test.js
```
Result: 2 tests passed, 0 failed.

## 3) Local HTTP 200 proof
```bash
python3 -m http.server 4173 >/tmp/aff_cookie_http.log 2>&1 & pid=$!; sleep 1; curl -sI http://127.0.0.1:4173/tools/affiliate-cookie-window-roi-calculator/ | head -n 1; kill $pid 2>/dev/null || true
```
Result: `HTTP/1.0 200 OK`
