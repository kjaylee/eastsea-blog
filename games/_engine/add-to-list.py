#!/usr/bin/env python3
"""Add a game to games-list.json (idempotent)."""
import json, sys, os
from datetime import date

GAMES_DIR = os.path.join(os.path.dirname(__file__), "..")
LIST = os.path.join(GAMES_DIR, "games-list.json")

slug = sys.argv[1]
title = sys.argv[2]
cat = sys.argv[3] if len(sys.argv) > 3 else "arcade"
emoji = sys.argv[4] if len(sys.argv) > 4 else "🎮"

GRADIENTS = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
]

with open(LIST) as f:
    games = json.load(f)

# Check duplicate
if any(g["id"] == slug for g in games):
    print(f"⚡ {slug} already in list, skipping")
    sys.exit(0)

import hashlib
grad_idx = int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(GRADIENTS)

# Auto-detect tags from category
TAG_MAP = {
    "arcade": ["arcade", "action", "casual"],
    "puzzle": ["puzzle", "thinking", "logic"],
    "strategy": ["strategy", "tactics", "thinking"],
    "action": ["action", "arcade", "combat"],
    "casual": ["casual", "simple", "relaxing"],
    "simulation": ["simulation", "management", "casual"],
    "survival": ["survival", "action", "roguelike"],
    "racing": ["racing", "speed", "arcade"],
    "rpg": ["rpg", "adventure", "combat"],
    "sports": ["sports", "competitive", "arcade"],
}
tags = TAG_MAP.get(cat, [cat, "arcade", "casual"])

entry = {
    "id": slug,
    "title": title,
    "desc": "",
    "cat": cat,
    "tags": tags,
    "emoji": emoji,
    "gradient": GRADIENTS[grad_idx],
    "added": str(date.today()),
    "polished": True,
}

games.append(entry)

with open(LIST, "w") as f:
    json.dump(games, f, ensure_ascii=False, indent=2)

print(f"✓ Added {slug} to games-list.json (total: {len(games)})")
