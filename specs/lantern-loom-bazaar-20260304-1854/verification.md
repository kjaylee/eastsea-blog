# Verification — lantern-loom-bazaar

## Commands run
```bash
node --check games/lantern-loom-bazaar/logic.mjs && node --check games/lantern-loom-bazaar/app.mjs && echo 'syntax_ok'
node --test tests/unit/lantern-loom-bazaar.test.mjs
bash scripts/build-manifests.sh
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='lantern-loom-bazaar'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
PORT=48341; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/lantern_loom_bazaar_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/lantern-loom-bazaar/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```

## Results
- Syntax: `syntax_ok`
- Unit test: 9 passed, 0 failed
- Manifest: count `356`, entry for `lantern-loom-bazaar` present
- HTTP smoke: `<title>Lantern Loom Bazaar</title>` 확인
