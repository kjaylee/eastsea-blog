# Verification — willow-barge-syndicate

## 1) Syntax checks
Command:
```bash
node --check games/willow-barge-syndicate/logic.mjs
node --check games/willow-barge-syndicate/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/willow-barge-syndicate.test.mjs
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
- `games/manifest.json: 355개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='willow-barge-syndicate'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 355,
  "entry": {
    "slug": "willow-barge-syndicate",
    "title": "Willow Barge Syndicate",
    "url": "/games/willow-barge-syndicate/",
    "size": 26461
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/willow-barge-syndicate/logic.mjs').then((m)=>{let s=m.startRun(m.createInitialState()); s.runValue=300; s.runCollectCount=4; s.runPatternLog=[{lane:0,mode:1},{lane:1,mode:-1},{lane:2,mode:1}]; const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,relay:settled.lastBreakdown.relay,silt:settled.lastBreakdown.silt,patternMultiplier:settled.lastBreakdown.patternMultiplier},null,2));});"
```
Result includes:
- `relay: true`
- `patternMultiplier: 1.34`

## 6) Route/title smoke check
Command:
```bash
PORT=48331; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/willow_barge_syndicate_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/willow-barge-syndicate/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Willow Barge Syndicate</title>`
