#!/usr/bin/env bash
# Validate a LittleJS game: file exists, size, required elements
# Usage: ./validate.sh <slug>
set -euo pipefail

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?Usage: validate.sh <slug>}"
FILE="$GAMES_DIR/$SLUG/index.html"
ERRORS=0

check() {
  if ! eval "$1"; then
    echo "  ✗ $2"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✓ $2"
  fi
}

echo "Validating: $SLUG"

# Existence
check "[ -f '$FILE' ]" "index.html exists"
[ -f "$FILE" ] || { echo "❌ Cannot continue without file"; exit 1; }

# Size < 350KB
SIZE=$(wc -c < "$FILE")
check "[ $SIZE -lt 358400 ]" "Size OK (${SIZE} bytes < 350KB)"

# Required patterns
check "grep -q 'engineInit' '$FILE'" "engineInit() call present"
check "grep -q 'gameInit\|gameUpdate' '$FILE'" "Game loop functions present"
check "grep -q 'littlejs' '$FILE'" "LittleJS engine reference"
check "grep -q 'localStorage' '$FILE'" "localStorage for high scores"
check "grep -qi 'sound\|zzfx\|SoundGenerator' '$FILE'" "Sound/ZzFX present"
check "grep -q 'touchGamepadEnable\|touchGamepad\|mousePos\|mouseWasPressed' '$FILE'" "Touch/mouse input"
check "grep -q 'keyIsDown\|keyWasPressed' '$FILE'" "Keyboard input"
check "grep -q '#0a0a1a\|0,0,.04\|0,0,0.04' '$FILE'" "Neon dark theme"
check "grep -q 'drawText\|drawTextScreen' '$FILE'" "Text rendering (HUD)"

# Game over / restart detection
check "grep -qi 'game.over\|gameover\|gameOver\|restart\|GAME_OVER\|isGameOver\|state.*=.*0\|reset' '$FILE'" "Game over/restart logic"

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "⚠️  $ERRORS issue(s) found in $SLUG"
  # Non-fatal: warn but allow pipeline to continue
  [ $ERRORS -gt 3 ] && { echo "❌ Too many issues ($ERRORS), failing."; exit 1; }
  echo "⚡ Proceeding with warnings."
  exit 0
else
  echo "✅ All checks passed"
fi
