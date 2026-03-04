# Verification — sunlit-buoy-forge

## 1) Syntax checks
Command:
```bash
node --check games/sunlit-buoy-forge/logic.mjs
node --check games/sunlit-buoy-forge/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/sunlit-buoy-forge.test.mjs
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
- `games/manifest.json: 351개`
- `tools/manifest.json: 530개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='sunlit-buoy-forge'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 351,
  "entry": {
    "slug": "sunlit-buoy-forge",
    "title": "Sunlit Buoy Forge",
    "url": "/games/sunlit-buoy-forge/",
    "size": 26129
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/sunlit-buoy-forge/logic.mjs').then((m)=>{let s=m.createInitialState({coins:220,gems:5,inventory:{1:2,2:1,3:1,4:0,5:0}}); s=m.chooseCharter(s,'grand'); s=m.startRun(s); s=m.moveLane(s,1); s=m.moveLane(s,-1); s=m.moveLane(s,1); s=m.moveLane(s,-1); s=m.withInjectedTokens(s,[{lane:s.lane,y:0.88,kind:'core',tier:3}]); s=m.stepRun(s,12,()=>0.9); const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,wakeEcho:settled.lastBreakdown.wakeEcho,dragTax:settled.lastBreakdown.dragTax,chainMultiplier:settled.lastBreakdown.chainMultiplier,charterAfter:settled.charter},null,2));});"
```
Result includes:
- `wakeEcho: true`
- `chainMultiplier: 1.26`
- `charterAfter: "local"`

## 6) Route/title smoke check
Command:
```bash
PORT=48262; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/sunlit_buoy_forge_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/sunlit-buoy-forge/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Sunlit Buoy Forge</title>`
