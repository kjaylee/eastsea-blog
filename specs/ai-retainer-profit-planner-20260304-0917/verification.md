# Verification — ai-retainer-profit-planner

## Command evidence

1) Syntax check
```bash
node --check tools/ai-retainer-profit-planner/app.mjs && echo 'node-check:PASS'
```
Output:
```text
node-check:PASS
```

2) Unit tests
```bash
node --test tests/unit/ai-retainer-profit-planner.test.mjs
```
Output (summary):
```text
✔ ai retainer profit planner logic
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

3) Manifest rebuild
```bash
bash scripts/build-manifests.sh
```
Output:
```text
games/manifest.json: 344개
tools/manifest.json: 526개
완료!
```

4) Manifest contains new slug
```bash
node -e "const m=require('./tools/manifest.json');const x=m.tools.find(t=>t.slug==='ai-retainer-profit-planner');if(!x){process.exit(2)};console.log(JSON.stringify(x,null,2));"
```
Output:
```json
{
  "slug": "ai-retainer-profit-planner",
  "title": "AI Retainer Profit Planner",
  "url": "/tools/ai-retainer-profit-planner/",
  "size": 20431
}
```

5) Local HTTP smoke
```bash
python3 -m http.server 8134 >/tmp/ai-retainer-http.log 2>&1 & SERVER_PID=$!; sleep 1;
curl -I http://127.0.0.1:8134/tools/ai-retainer-profit-planner/ | head -n 1;
curl -s http://127.0.0.1:8134/tools/ai-retainer-profit-planner/ | grep -n "AI Retainer Profit Planner" | head -n 2;
kill $SERVER_PID
```
Output:
```text
HTTP/1.0 200 OK
6:  <title>AI Retainer Profit Planner | Monetizable Offer Calculator</title>
168:        <h1>💼 AI Retainer Profit Planner</h1>
```

6) Manifest integrity regression
```bash
node --test tests/integration/manifest-integrity.test.mjs
```
Output (summary):
```text
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

## Result
PASS — core logic, unit tests, manifest integrity, discoverability manifest, and HTTP smoke all verified.
