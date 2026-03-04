# Verification — sunlit-kite-mercantile

## 1) Syntax checks
Command:
```bash
node --check games/sunlit-kite-mercantile/logic.mjs
node --check games/sunlit-kite-mercantile/app.mjs
```
Result: both exit 0.

## 2) Unit tests
Command:
```bash
node --test tests/unit/sunlit-kite-mercantile.test.mjs
```
Result summary:
- tests: 8
- suites: 1
- pass: 8
- fail: 0

## 3) Manifest refresh
Command: python script to rebuild `games/manifest.json`.
Result:
- `games/manifest.json: 346개`

## 4) Manifest route registration
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='sunlit-kite-mercantile'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```
Result:
```json
{
  "count": 346,
  "entry": {
    "slug": "sunlit-kite-mercantile",
    "title": "Sunlit Kite Mercantile",
    "url": "/games/sunlit-kite-mercantile/",
    "size": 23248
  }
}
```

## 5) Logic smoke snapshot
Command:
```bash
node -e "import('./games/sunlit-kite-mercantile/logic.mjs').then((m)=>{let s=m.createInitialState({coins:120,gems:5,inventory:{1:2,2:2,3:1,4:0,5:0}}); s=m.chooseContract(s,'festival'); s=m.startRun(s); s=m.withInjectedTokens(s,[{lane:1,y:0.87,kind:'basket',tier:2},{lane:1,y:0.87,kind:'crow',tier:0},{lane:1,y:0.87,kind:'basket',tier:4}]); s.runMoves=9; s=m.stepRun(s,30,()=>0.95); const settled=m.settleRun(s,false); console.log(JSON.stringify({phase:settled.phase,lastPayout:settled.lastPayout,coins:settled.coins,gems:settled.gems,taxed:settled.lastBreakdown.taxed,contractAfter:settled.contract,inventory:settled.inventory},null,2));});"
```
Result includes:
- `taxed: true`
- `contractAfter: "market"`
- `lastPayout: 160`

## 6) Route/title smoke check
Command:
```bash
PORT=48231; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/sunlit_kite_mercantile_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/sunlit-kite-mercantile/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
Result:
- `<title>Sunlit Kite Mercantile</title>`
