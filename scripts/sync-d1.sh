#!/bin/bash
# sync-d1.sh — _posts/ ↔ D1 자동 동기화
# update-posts.sh 끝에서 호출. wrangler 인증 필요.
set -euo pipefail

BLOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BLOG_API_DIR="$BLOG_DIR/blog-api"
POSTS_DIR="$BLOG_DIR/_posts"
TMP_SQL="/tmp/d1-sync-$(date +%s).sql"

cd "$BLOG_API_DIR"

echo "🔄 D1 sync: checking for missing posts..."

# 1) Get D1 slugs
D1_SLUGS=$(npx wrangler d1 execute blog-db --remote \
  --command "SELECT slug FROM posts;" 2>&1 \
  | grep -o '"slug": "[^"]*"' | sed 's/"slug": "//;s/"$//' | sort)

# 2) Get _posts slugs  
FILE_SLUGS=$(ls "$POSTS_DIR"/*.md 2>/dev/null \
  | xargs -I{} basename {} .md | sort)

# 3) Diff
MISSING=$(comm -23 <(echo "$FILE_SLUGS") <(echo "$D1_SLUGS"))

if [ -z "$MISSING" ]; then
  echo "✅ D1 in sync ($(echo "$D1_SLUGS" | wc -l | tr -d ' ') posts)"
  exit 0
fi

COUNT=$(echo "$MISSING" | wc -l | tr -d ' ')
echo "⚠️  $COUNT posts missing from D1, syncing..."

# 4) Generate SQL via Python
python3 - "$POSTS_DIR" "$TMP_SQL" <<'PYEOF' $MISSING
import re, os, sys

posts_dir = sys.argv[1]
out_path = sys.argv[2]
missing = sys.stdin.read().strip().split('\n')

stmts = []
for slug in missing:
    if not slug.strip():
        continue
    filepath = os.path.join(posts_dir, f'{slug}.md')
    if not os.path.exists(filepath):
        print(f'  ⚠️ File not found: {filepath}')
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if not fm_match:
        print(f'  ⚠️ No front matter: {slug}')
        continue
    
    fm_text, body = fm_match.groups()
    fm = {}
    for line in fm_text.split('\n'):
        m = re.match(r'^(\w[\w-]*):\s*(.+)$', line)
        if m:
            key, val = m.groups()
            val = val.strip().strip('"').strip("'")
            if val.startswith('['):
                val = val.strip('[]').split(',')[0].strip().strip('"').strip("'")
            fm[key] = val
    
    date_match = re.match(r'(\d{4}-\d{2}-\d{2})', slug)
    date_fallback = date_match.group(1) if date_match else '2026-01-01'
    
    title = fm.get('title', slug).replace("'", "''")
    date = fm.get('date', date_fallback).replace("'", "''")
    categories = fm.get('categories', 'other').replace("'", "''")
    tags = fm.get('tags', '').replace("'", "''")
    body_esc = body.replace("'", "''")
    
    stmts.append(
        f"INSERT INTO posts (slug, title, date, content, categories, tags)\n"
        f"VALUES ('{slug}', '{title}', '{date}', '{body_esc}', '{categories}', '{tags}')\n"
        f"ON CONFLICT(slug) DO UPDATE SET title=excluded.title, date=excluded.date, "
        f"content=excluded.content, categories=excluded.categories, tags=excluded.tags, "
        f"updated_at=datetime('now');"
    )
    print(f'  ✅ {slug}')

with open(out_path, 'w') as f:
    f.write('\n\n'.join(stmts))
print(f'\n📦 {len(stmts)} SQL statements → {out_path}')
PYEOF
echo "$MISSING" | python3 - "$POSTS_DIR" "$TMP_SQL"

# 5) Execute
if [ -s "$TMP_SQL" ]; then
  npx wrangler d1 execute blog-db --remote --file "$TMP_SQL" 2>&1 | tail -5
  echo "✅ D1 sync complete (+$COUNT posts)"
fi

rm -f "$TMP_SQL"
