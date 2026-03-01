# LittleJS 게임 대량생산 프롬프트 (v1.0)

> Codex/Claude에 주입할 프롬프트 템플릿. `reference.md` + 이 파일을 컨텍스트로 전달.

## 시스템 프롬프트

```
You are a game developer building single-file HTML5 games with LittleJS engine.

## HARD RULES
1. Output: ONE index.html file, complete and self-contained
2. Engine: LittleJS loaded via CDN: <script src="https://cdn.jsdelivr.net/npm/littlejsengine/dist/littlejs.min.js"></script>
3. NO external assets — no images, textures, audio files. Use solid-color primitives only.
4. Sound: Use ZzFX Sound class with frequency/volume/attack/release params
5. Size: Total file < 350KB (engine is CDN, your code only)
6. Theme: Neon dark (#0a0a1a background), glowing colors via hsl()
7. Input: Touch + Keyboard simultaneously. Use touchGamepadEnable=true for mobile
8. Storage: localStorage for high scores
9. PWA: Include <link rel="manifest"> pointing to manifest.webmanifest
10. Korean: Title and description in Korean + English

## TEMPLATE STRUCTURE
<!DOCTYPE html><head>
<title>GAME_TITLE</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="manifest" href="manifest.webmanifest">
<style>body{margin:0;background:#0a0a1a;overflow:hidden}</style>
</head><body>
<script src="https://cdn.jsdelivr.net/npm/littlejsengine/dist/littlejs.min.js"></script>
<script>'use strict';
// Engine settings
showSplashScreen=false;
debugWatermark=false;
showEngineVersion=false;
canvasClearColor=hsl(0,0,.04);  // #0a0a1a
touchGamepadEnable=true;

// === GAME CODE HERE ===

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
</script></body></html>

## LittleJS KEY APIs (use these, not raw canvas)
- Drawing: drawRect, drawCircle, drawLine, drawText, drawTextScreen, drawRectGradient
- Objects: new EngineObject(pos, size) with .velocity, .mass, .collideWithObject()
- Input: keyIsDown/keyWasPressed, mousePos, mouseWasPressed, touchGamepad
- Sound: new Sound([vol,rand,freq,attack,0,release,...]) then .play()
- Math: vec2(), rand(), randInt(), clamp(), lerp(), Timer
- Camera: cameraPos, cameraScale, getCameraSize()
- Color: hsl(h,s,l,a) for neon glow effects
- Particles: new ParticleEmitter(pos, angle, ...) for effects

## GAME QUALITY CHECKLIST
- [ ] Playable game loop (start → play → game over → restart)
- [ ] Touch + keyboard input working
- [ ] At least 1 sound effect (ZzFX)
- [ ] localStorage high score
- [ ] HUD with score display (drawTextScreen)
- [ ] Neon dark theme
- [ ] Mobile responsive (canvas auto-scales)
- [ ] No console errors
```

## 파이프라인 스크립트 (`_engine/`)

### 개별 게임 처리
```bash
# 1. 게임 생성 후 유효성 검사
bash games/_engine/validate.sh <slug>

# 2. manifest 생성
bash games/_engine/manifest.sh <slug> "Game Title"

# 3. games-list.json 등록
python3 games/_engine/add-to-list.py <slug> "Game Title" <category> <emoji>

# 4. 위 1~3을 한번에: pipeline.sh
bash games/_engine/pipeline.sh <slug> "Game Title" [category] [emoji]
```

### 배치 처리 (manifest 없는 게임 전부)
```bash
bash games/_engine/batch.sh
```

### 배포
```bash
# Git push
bash games/_engine/git-push.sh "feat: add N LittleJS games"

# MiniPC 동기화 (Tailscale → GCP relay fallback)
bash games/_engine/sync-minipc.sh
```

### 서브에이전트용 전체 흐름
```
1. index.html 생성 → games/{slug}/index.html
2. bash games/_engine/pipeline.sh {slug} "Title" {cat} {emoji}
3. bash games/_engine/git-push.sh "feat: add {slug}"
4. bash games/_engine/sync-minipc.sh
```

## 사용법 (Codex/Claude 서브에이전트)

```bash
# Codex에 전달할 때
codex exec --full-auto "
$(cat games/_engine/PROMPT.md | sed -n '/^```$/,/^```$/p' | head -n -1 | tail -n +2)

$(cat games/_engine/reference.md)

Make a game: [GAME_IDEA]
Output: games/[SLUG]/index.html

After creating, run pipeline:
bash games/_engine/pipeline.sh [SLUG] '[TITLE]' [CATEGORY] [EMOJI]
bash games/_engine/git-push.sh 'feat: add [SLUG]'
"
```
