# Verification — amber-harbor-ledger

## 1) Syntax checks
Command:
```bash
node --check games/amber-harbor-ledger/logic.mjs
node --check games/amber-harbor-ledger/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/amber-harbor-ledger.test.mjs
```
Result summary:
- tests: 9
- suites: 1
- pass: 9
- fail: 0

## 3) Manifest refresh
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 354개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='amber-harbor-ledger'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 354,
  "entry": {
    "slug": "amber-harbor-ledger",
    "title": "Amber Harbor Ledger",
    "url": "/games/amber-harbor-ledger/",
    "size": 26438
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/amber-harbor-ledger/logic.mjs').then((m)=>{let s=m.startRun(m.createInitialState()); s.runValue=300; s.runCollectCount=4; s.runLaneHistory=[0,1,2]; const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,wakeWeave:settled.lastBreakdown.wakeWeave,congestion:settled.lastBreakdown.congestion,patternMultiplier:settled.lastBreakdown.patternMultiplier},null,2));});"
```
Result includes:
- `wakeWeave: true`
- `patternMultiplier: 1.27`

## 6) Route/title smoke check
Command:
```bash
PORT=48329; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/amber_harbor_ledger_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/amber-harbor-ledger/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Amber Harbor Ledger</title>`
