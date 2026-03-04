# Verification — orchard-signal-caravan

## 1) Syntax checks
Command:
```bash
node --check games/orchard-signal-caravan/logic.mjs
node --check games/orchard-signal-caravan/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/orchard-signal-caravan.test.mjs
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
- `games/manifest.json: 348개`
- `tools/manifest.json: 530개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='orchard-signal-caravan'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 348,
  "entry": {
    "slug": "orchard-signal-caravan",
    "title": "Orchard Signal Caravan",
    "url": "/games/orchard-signal-caravan/",
    "size": 24292
  }
}
```

## 5) Unique mechanic smoke snapshot
Command:
```bash
node -e "import('./games/orchard-signal-caravan/logic.mjs').then((m)=>{let s=m.createInitialState({coins:150,gems:5,inventory:{1:2,2:1,3:1,4:0,5:0}}); s=m.chooseContract(s,'royal'); s=m.startRun(s); s.runValue=210; s.runHarvestCount=3; s.runTierHistory=[1,2,3]; const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,signalChain:settled.lastBreakdown.signalChain,monotonyPenalty:settled.lastBreakdown.monotonyPenalty,chainMultiplier:settled.lastBreakdown.chainMultiplier,contractAfter:settled.contract},null,2));});"
```
Result includes:
- `signalChain: true`
- `chainMultiplier: 1.24`
- `contractAfter: "village"`

## 6) Route/title smoke check
Command:
```bash
PORT=48251; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/orchard_signal_caravan_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/orchard-signal-caravan/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Orchard Signal Caravan</title>`
