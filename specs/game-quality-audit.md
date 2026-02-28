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
