# Verification — citrus-shade-caravan

## 1) Syntax checks
Command:
```bash
node --check games/citrus-shade-caravan/logic.mjs
node --check games/citrus-shade-caravan/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/citrus-shade-caravan.test.mjs
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
- `games/manifest.json: 352개`
- `tools/manifest.json: 530개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='citrus-shade-caravan'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 352,
  "entry": {
    "slug": "citrus-shade-caravan",
    "title": "Citrus Shade Caravan",
    "url": "/games/citrus-shade-caravan/",
    "size": 26678
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/citrus-shade-caravan/logic.mjs').then((m)=>{let s=m.createInitialState({coins:240,gems:6,inventory:{1:2,2:1,3:0,4:0,5:0}}); s=m.chooseContract(s,'festival'); s=m.startRun(s); s=m.withInjectedTokens(s,[{lane:s.lane,y:0.88,kind:'crate',tier:1,tone:'sun'},{lane:s.lane,y:0.88,kind:'crate',tier:1,tone:'shade'},{lane:s.lane,y:0.88,kind:'crate',tier:1,tone:'sun'},{lane:s.lane,y:0.88,kind:'crate',tier:1,tone:'shade'}]); s=m.stepRun(s,12,()=>0.9); s=m.withInjectedTokens(s,[{lane:s.lane,y:0.88,kind:'crate',tier:3,tone:'sun'}]); s=m.stepRun(s,12,()=>0.9); const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,shadeSwap:settled.lastBreakdown.shadeSwap,crowdPenalty:settled.lastBreakdown.crowdPenalty,chainMultiplier:settled.lastBreakdown.chainMultiplier,contractAfter:settled.contract},null,2));});"
```
Result includes:
- `shadeSwap: true`
- `chainMultiplier: 1.0416`
- `contractAfter: "stall"`

## 6) Route/title smoke check
Command:
```bash
PORT=48263; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/citrus_shade_caravan_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/citrus-shade-caravan/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Citrus Shade Caravan</title>`
