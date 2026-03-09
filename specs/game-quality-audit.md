# Game Quality Audit (Daily Auto-Purge Log)

## 2026-03-01 00:00 KST — Daily Auto-Purge
- Primary ratings API (`https://<INTERNAL_IP>:3100/api/ratings`) unreachable.
- Fallback used: MiniPC DB (`$WORKSPACE/rating-api/data/ratings.db`) aggregated by game.
- Low-star threshold (avg ≤ 2.0) matched:
  - `meme-puzzle` (2.0, 3)
  - `puzzle-2048` (2.0, 2)
- Local deletion attempted: `$WORKSPACE/games/{meme-puzzle,puzzle-2048}` (already absent)
- MiniPC deletion attempted: `/var/www/games/{meme-puzzle,puzzle-2048}` (already absent)
- `games/index.html`: no low-star entries found.
- MiniPC index sync: completed (`/var/www/games/index.html`, SHA-256 matched).

## 2026-03-04 00:00 KST — Daily Auto-Purge
- Primary ratings API (`https://<INTERNAL_IP>:3100/api/ratings`) unreachable (connection refused).
- Fallback used: MiniPC DB (`$WORKSPACE/rating-api/data/ratings.db`) aggregated by game.
- Low-star threshold (avg ≤ 2.0) matched:
  - `meme-puzzle` (2.0, 3)
  - `puzzle-2048` (2.0, 2)
- Local deletion attempted: `$WORKSPACE/games/{meme-puzzle,puzzle-2048}` (already absent)
- MiniPC deletion attempted: `/var/www/games/{meme-puzzle,puzzle-2048}` (already absent)
- `games/index.html` / `games/games-list.json`: no low-star entries found.
- MiniPC index sync: completed (`/var/www/games/index.html`, SHA-256 matched).
- Cache files:
  - `games/_removed/ratings-cache/ratings-20260304-000127.json`
  - `games/_removed/ratings-cache/low-star-20260304-000127.json`

## 2026-03-10 00:06 KST — Daily Auto-Purge
- Primary ratings API reachable: `http://100.80.169.94:3100/api/ratings`.
- Low-star threshold (avg ≤ 2.0) matched:
  - `meme-puzzle` (2.0, 3)
  - `puzzle-2048` (2.0, 2)
- Local deletion attempted: `$WORKSPACE/games/{meme-puzzle,puzzle-2048}` (already absent)
- MiniPC deletion attempted: `/var/www/games/{meme-puzzle,puzzle-2048}` (already absent)
- `games/index.html` / `games/games-list.json`: no low-star entries found.
- MiniPC index sync: completed (`/var/www/games/index.html`, SHA-256 matched).
- Cache files:
  - `games/_removed/ratings-cache/ratings-20260310-000600.json`
  - `games/_removed/ratings-cache/low-star-20260310-000600.json`
- Remote execution note: `nodes.run` prepare unsupported, so `nodes.invoke(system.run)` was used.
