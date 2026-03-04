# Verification — harbor-thread-atelier

## 1) Syntax checks
Command:
```bash
node --check games/harbor-thread-atelier/logic.mjs
node --check games/harbor-thread-atelier/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/harbor-thread-atelier.test.mjs
```
Result summary:
- tests: 8
- suites: 1
- pass: 8
- fail: 0

## 3) Manifest refresh
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 349개`
- `tools/manifest.json: 530개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='harbor-thread-atelier'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 349,
  "entry": {
    "slug": "harbor-thread-atelier",
    "title": "Harbor Thread Atelier",
    "url": "/games/harbor-thread-atelier/",
    "size": 24801
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/harbor-thread-atelier/logic.mjs').then((m)=>{let s=m.createInitialState({coins:160,gems:5,inventory:{1:2,2:1,3:0,4:0,5:0}}); s=m.chooseContract(s,'gallery'); s=m.startRun(s); s.runValue=240; s.runHarvestCount=4; s.runTierHistory=[1,2,1,2]; const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,crossStitch:settled.lastBreakdown.crossStitch,monotoneBolt:settled.lastBreakdown.monotoneBolt,patternMultiplier:settled.lastBreakdown.patternMultiplier,contractAfter:settled.contract},null,2));});"
```
Result includes:
- `crossStitch: true`
- `patternMultiplier: 1.26`
- `contractAfter: "local"`

## 6) Route/title smoke check
Command:
```bash
PORT=48261; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/harbor_thread_atelier_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/harbor-thread-atelier/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Harbor Thread Atelier</title>`
