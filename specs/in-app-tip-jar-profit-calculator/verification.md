# Verification — In-app Tip Jar Profit Calculator

## Node syntax check
- Command: `node --check tools/in-app-tip-jar-profit-calculator/app.mjs`
- Result: OK (no output)

## Local HTTP 200
- Command: `python3 -m http.server 8011`
- Command: `curl -I http://localhost:8011/tools/in-app-tip-jar-profit-calculator/`
- Result: `HTTP/1.0 200 OK`
