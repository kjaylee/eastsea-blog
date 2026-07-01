# Switchhook Speedway QA Report

- Date: 2026-07-02
- Local URL: `http://127.0.0.1:8765/games/switchhook-speedway/`
- Live URL target: `https://eastsea-blog.pages.dev/games/switchhook-speedway/`

## Static Checks
- `grep -n "title\|play\|upgrade\|gameover"`: PASS
- `grep -n "switchhookSpeedwaySave_v1"`: PASS
- `grep -n "littlejs"`: PASS
- `undefined_count = 0`: PASS
- `node -e "JSON.parse(...games-list.json...)"`: PASS

## Browser Smoke
- Viewport: `390x844`
- Runtime page errors: `0`
- Console errors: `0`
- `?autotest=1`: PASS
- `?autoview=upgrade`: PASS
- `?autoview=gameover`: PASS

## Autotest Result
```json
{
  "pass": true,
  "title": true,
  "play": true,
  "whip": true,
  "upgrade": true,
  "gameover": true,
  "localStorage": true,
  "pageerror": true
}
```

## Evidence
- `autotest-pass.png`
- `upgrade-view.png`
- `gameover-view.png`
