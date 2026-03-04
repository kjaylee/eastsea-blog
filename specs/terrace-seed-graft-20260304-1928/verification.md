# Verification — terrace-seed-graft

## Commands run
```bash
node --check games/terrace-seed-graft/logic.mjs && node --check games/terrace-seed-graft/app.mjs && echo 'syntax_ok'
node --test tests/unit/terrace-seed-graft.test.mjs
bash scripts/build-manifests.sh
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='terrace-seed-graft'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
PORT=48379; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/terrace_seed_graft_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/terrace-seed-graft/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```

## Results
- Syntax: `syntax_ok`
- Unit test: 9 passed, 0 failed
- Manifest: count `357`, entry for `terrace-seed-graft` present
- HTTP smoke: `<title>Terrace Seed Graft</title>` 확인
