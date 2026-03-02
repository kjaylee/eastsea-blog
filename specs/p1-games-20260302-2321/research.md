# Research — p1-games-20260302-2321

## Source Notes
- `games/rune-forge/index.html`
  - 고정 해상도: `const GAME_W = 1280; const GAME_H = 720;`
  - 레터박스 리사이즈: `scale = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H)` 후 `canvas.style.width/height`와 `left/top`으로 중앙 정렬.
  - DPR: `const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = GAME_W * dpr; canvas.height = GAME_H * dpr;`
  - 렌더는 Canvas 2D `getContext('2d')`만 사용.
- `games/_engine/AI_instructions.md`
  - 외부 라이브러리는 LittleJS만 허용: `Do not include any other libraries, only littlejs.`
  - 단일 HTML 파일 유지.

## Constraints to Apply
- Canvas 2D 단일 파일 구조 유지 (engineInit 금지).
- LittleJS `<script>` 태그 포함하되 실제 렌더/입력은 순수 Canvas.
- 모바일 레터박스 처리: `GAME_W/H` 기준 중앙 정렬, DPR 스케일.
