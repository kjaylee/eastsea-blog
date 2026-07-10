# QA Report — Set Arc Stadium

## Local verification
- Local URL: `http://127.0.0.1:8765/games/set-arc-stadium/`
- Live URL target: `https://eastsea-blog.pages.dev/games/set-arc-stadium/`
- Date: `2026-07-11 02:27 KST`

## Commands
```bash
python3 -m http.server 8765 --bind 127.0.0.1
curl -I http://127.0.0.1:8765/games/set-arc-stadium/
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom "http://127.0.0.1:8765/games/set-arc-stadium/?autotest=1"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=390,844 --screenshot="/tmp/set-arc-stadium-local.png" --virtual-time-budget=5000 "http://127.0.0.1:8765/games/set-arc-stadium/?autotest=1"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=390,844 --screenshot="/tmp/set-arc-stadium-title.png" --virtual-time-budget=1500 "http://127.0.0.1:8765/games/set-arc-stadium/"
```

## Results
- `curl -I` returned `HTTP/1.0 200 OK`
- autotest DOM report:
  - `PASS start`
  - `PASS score`
  - `PASS draft`
  - `PASS gameover`
  - `PASS save`
  - `PASS viewport`
  - `PASS pageerror`
- title DOM contained:
  - `Set Arc Stadium — 셋아크 스타디움`
  - `랠리 시작`
  - 타이틀 설명 문구
- local screenshots captured:
  - `/tmp/set-arc-stadium-local.png`
  - `/tmp/set-arc-stadium-title.png`

## Notes
- Chrome headless emitted unrelated platform warnings outside page JS.
- In-page `pageerror` remained `0`.
- Live verification and launch commit will be appended after push.
