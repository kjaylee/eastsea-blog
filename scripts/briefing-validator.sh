#!/bin/bash
# Minimal briefing validator
FILE="$1"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: briefing-validator.sh <file>"
  exit 2
fi

# Count bold items (headlines)
ITEMS=$(grep -c '^\*\*\[' "$FILE" || true)
echo "Item count: $ITEMS"

if [ "$ITEMS" -lt 12 ]; then
  echo "BLOCK: Too few items ($ITEMS < 12)"
  exit 2
fi

if [ "$ITEMS" -gt 15 ]; then
  echo "WARN: Too many items ($ITEMS > 15)"
  exit 1
fi

# Check for 3-sentence structure (lines starting with non-empty after **[...]**)
echo "OK: Item count $ITEMS within range [12-15]"
exit 0
