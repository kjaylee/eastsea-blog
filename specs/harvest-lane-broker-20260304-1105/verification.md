# Verification — harvest-lane-broker

## 1) Syntax checks
Command:
```bash
node --check games/harvest-lane-broker/logic.mjs
node --check games/harvest-lane-broker/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/harvest-lane-broker.test.mjs
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
- `games/manifest.json: 347개`
- `tools/manifest.json: 529개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='harvest-lane-broker'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 347,
  "entry": {
    "slug": "harvest-lane-broker",
    "title": "Harvest Lane Broker",
    "url": "/games/harvest-lane-broker/",
    "size": 24712
  }
}
```

## 5) Logic smoke snapshot
Command:
```bash
node -e "import('./games/harvest-lane-broker/logic.mjs').then((m)=>{let s=m.createInitialState({coins:120,gems:5,inventory:{1:2,2:1,3:1,4:0,5:0}}); s=m.chooseContract(s,'export'); s=m.startRun(s); s=m.withInjectedTokens(s,[{lane:1,y:0.87,kind:'crate',tier:1},{lane:1,y:0.87,kind:'crate',tier:2},{lane:1,y:0.87,kind:'crate',tier:3}]); s=m.stepRun(s,30,()=>0.95); const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,diverse:settled.lastBreakdown.diverse,oversupply:settled.lastBreakdown.oversupply,diversityMultiplier:settled.lastBreakdown.diversityMultiplier,contractAfter:settled.contract},null,2));});"
```
Result includes:
- `diverse: true`
- `diversityMultiplier: 1.22`
- `contractAfter: "street"`

## 6) Route/title smoke check
Command:
```bash
PORT=48239; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/harvest_lane_broker_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/harvest-lane-broker/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Harvest Lane Broker</title>`
