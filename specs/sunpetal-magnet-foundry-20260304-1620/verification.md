# Verification — sunpetal-magnet-foundry

## 1) Syntax checks
Command:
```bash
node --check games/sunpetal-magnet-foundry/logic.mjs
node --check games/sunpetal-magnet-foundry/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/sunpetal-magnet-foundry.test.mjs
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
- `games/manifest.json: 353개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='sunpetal-magnet-foundry'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 353,
  "entry": {
    "slug": "sunpetal-magnet-foundry",
    "title": "Sunpetal Magnet Foundry",
    "url": "/games/sunpetal-magnet-foundry/",
    "size": 26612
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/sunpetal-magnet-foundry/logic.mjs').then((m)=>{let s=m.startRun(m.createInitialState()); s.runValue=300; s.runCollectCount=4; s.runPolarityHistory=[1,-1,1,-1]; const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,prismFlip:settled.lastBreakdown.prismFlip,staticDrag:settled.lastBreakdown.staticDrag,patternMultiplier:settled.lastBreakdown.patternMultiplier},null,2));});"
```
Result includes:
- `prismFlip: true`
- `patternMultiplier: 1.29`

## 6) Route/title smoke check
Command:
```bash
PORT=48321; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/sunpetal_magnet_foundry_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/sunpetal-magnet-foundry/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Sunpetal Magnet Foundry</title>`
