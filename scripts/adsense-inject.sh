#!/usr/bin/env bash
# adsense-inject.sh — AdSense 심사 최적화 일괄 삽입 스크립트
# 멱등성 보장: 이미 삽입된 경우 중복 삽입 안 함
# Usage: bash scripts/adsense-inject.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUB_ID="ca-pub-7252382819928130"

echo "=== AdSense 삽입 시작 ==="
echo "Repo: $REPO_ROOT"
echo "Publisher ID: $PUB_ID"
echo ""

python3 "$REPO_ROOT/scripts/adsense-inject.py" "$REPO_ROOT"

echo ""
echo "=== 완료 ==="
