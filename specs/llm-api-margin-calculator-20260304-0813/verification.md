# Verification Evidence — llm-api-margin-calculator

## 1) Unit tests
Command:
```bash
node --test tests/unit/llm-api-margin-calculator.test.mjs
```
Result:
- suites: 1
- tests: 6
- pass: 6
- fail: 0

## 2) Syntax checks
Command:
```bash
node --check tools/llm-api-margin-calculator/logic.mjs && echo 'logic.mjs syntax: OK'
node --check tools/llm-api-margin-calculator/app.mjs && echo 'app.mjs syntax: OK'
```
Result:
- `logic.mjs syntax: OK`
- `app.mjs syntax: OK`

## 3) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 345개`
- `tools/manifest.json: 524개`
- `완료!`

## 4) Tool discovery integrity test
Command:
```bash
node --test tests/usecase/tool-discovery.test.mjs
```
Result:
- tests: 8
- pass: 8
- fail: 0

## 5) Local route availability
Command:
```bash
python3 -m http.server 4185 >/tmp/llm-margin-server.log 2>&1 & SERVER_PID=$!; sleep 1
curl -s http://127.0.0.1:4185/tools/llm-api-margin-calculator/ | grep -E "LLM API Margin Calculator|AI SaaS Unit Economics Tool"
kill $SERVER_PID
```
Result snippet:
- `<title>LLM API Margin Calculator | AI SaaS Unit Economics Tool</title>`
- `<h1>🤖 LLM API Margin Calculator</h1>`

## 6) Deterministic logic sample
Command:
```bash
node -e "import('./tools/llm-api-margin-calculator/logic.mjs').then((m)=>{const r=m.calculateLlmMargin(m.DEFAULT_INPUT); console.log(JSON.stringify({grossRevenue:r.grossRevenue,totalModelCost:r.totalModelCost,variableCostTotal:r.variableCostTotal,operatingProfit:r.operatingProfit,breakEvenPricePerUser:r.breakEvenPricePerUser,status:r.status},null,2));});"
```
Result:
```json
{
  "grossRevenue": 92800,
  "totalModelCost": 1850.4,
  "variableCostTotal": 7732.52,
  "operatingProfit": 64097.88,
  "breakEvenPricePerUser": 8.31,
  "status": "strong"
}
```
