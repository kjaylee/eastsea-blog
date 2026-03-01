# Plan — P1v Games Batch

1. **Precheck**
   - Verify working repo path is `eastsea-blog`.
   - Confirm slug uniqueness with `ls games/` and directory checks.

2. **Implement game files**
   - Create directories for 3 slugs.
   - Build single-file `index.html` for each game with:
     - neon dark UI (`#0a0a1a`)
     - keyboard + touch controls
     - Web Audio API SFX
     - `localStorage` best record
     - responsive CSS
   - Add `manifest.webmanifest` for each game.

3. **Verification**
   - Static checks:
     - file sizes < 500KB
     - manifest presence
     - `localStorage` keys present in code
     - AudioContext usage present
     - key and touch handlers present
   - Manual smoke logic review for each game loop.

4. **Manifest integration**
   - Compute index.html byte size.
   - Prepend 3 entries to `games/manifest.json`.
   - Set `count=146`, refresh `updatedAt`.

5. **Gap analysis loop**
   - Score checklist compliance per game.
   - If any score < 90, patch and re-verify (up to 3 rounds).

6. **Git delivery**
   - `git status` review.
   - Commit with required message.
   - Push to remote branch.
