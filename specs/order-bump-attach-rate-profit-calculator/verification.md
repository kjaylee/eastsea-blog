# Verification — Order Bump Attach Rate Profit Calculator

## Syntax check
- `node --check tools/order-bump-attach-rate-profit-calculator/app.mjs`
- `node --check tools/order-bump-attach-rate-profit-calculator/logic.mjs`

## Local HTTP
- `python3 -m http.server 8123`
- `curl -I http://localhost:8123/tools/order-bump-attach-rate-profit-calculator/ | head -n 1`
  - Result: `HTTP/1.0 200 OK`
