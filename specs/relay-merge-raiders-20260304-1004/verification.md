# Verification — relay-merge-raiders

## 1) Syntax checks
Command:
```bash
node --check games/relay-merge-raiders/logic.mjs && echo logic_check_exit:$?
node --check games/relay-merge-raiders/app.mjs && echo app_check_exit:$?
```

Exact output:
- `logic_check_exit:0`
- `app_check_exit:0`

## 2) Unit tests (required)
Command:
```bash
node --test tests/unit/relay-merge-raiders.test.mjs
```

Output summary (exact):
- `ℹ tests 7`
- `ℹ suites 1`
- `ℹ pass 7`
- `ℹ fail 0`

## 3) Games manifest update
Command:
```bash
python3 - <<'PY'
import os,re,json
from datetime import datetime, timezone, timedelta
KST=timezone(timedelta(hours=9))
now=datetime.now(KST).strftime('%Y-%m-%dT%H:%M:%S+09:00')
section='games'
base='games'
items=[]
for name in sorted(os.listdir(base)):
    d=os.path.join(base,name)
    idx=os.path.join(d,'index.html')
    if not os.path.isdir(d) or not os.path.isfile(idx):
        continue
    title=name
    with open(idx,'r',encoding='utf-8',errors='replace') as f:
        html=f.read(8192)
    m=re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if m:
        t=m.group(1).strip()
        t=re.split(r'\s*[|–—]\s*', t)[0].strip()
        if t:
            title=t
    size=0
    for root,dirs,files in os.walk(d):
        for fn in files:
            try:size+=os.path.getsize(os.path.join(root,fn))
            except Exception:pass
    items.append({'slug':name,'title':title,'url':f'/{section}/{name}/','size':size})
with open('games/manifest.json','w',encoding='utf-8') as f:
    json.dump({'games':items,'count':len(items),'updatedAt':now},f,ensure_ascii=False,indent=2)
print(f'games/manifest.json: {len(items)}개')
PY
```

Exact output:
- `games/manifest.json: 345개`

## 4) Route registration check
Command:
```bash
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='relay-merge-raiders'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
```

Exact output:
```json
{
  "count": 345,
  "entry": {
    "slug": "relay-merge-raiders",
    "title": "Relay Merge Raiders",
    "url": "/games/relay-merge-raiders/",
    "size": 24518
  }
}
```

## 5) Logic snapshot smoke test
Command:
```bash
node -e "import('./games/relay-merge-raiders/logic.mjs').then((m)=>{let s=m.createInitialState({gems:8,coins:220,inventory:{1:3,2:2,3:1,4:0,5:0}}); s=m.buyPremiumPass(s); s=m.activateSponsorBoost(s); s=m.startWave(s); s=m.withInjectedTokens(s,[{lane:1,y:0.87,kind:'salvage',tier:2},{lane:1,y:0.87,kind:'salvage',tier:4},{lane:1,y:0.87,kind:'mine',tier:0}]); s=m.stepWave(s,20,()=>0.99); const settled=m.settleWave(s,false); console.log(JSON.stringify({phase:settled.phase,lastWaveRevenue:settled.lastWaveRevenue,coins:settled.coins,gems:settled.gems,deckMultiplier:m.getDeckMultiplier(settled),inventory:settled.inventory},null,2));});"
```

Exact output:
```json
{
  "phase": "dock",
  "lastWaveRevenue": 212,
  "coins": 252,
  "gems": 6,
  "deckMultiplier": 2.3546,
  "inventory": {
    "1": 3,
    "2": 3,
    "3": 1,
    "4": 1,
    "5": 0
  }
}
```

## 6) Route/title smoke check via curl
Command:
```bash
PORT=48211; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/relay_merge_raiders_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/relay-merge-raiders/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```

Exact output:
- `<title>Relay Merge Raiders</title>`
