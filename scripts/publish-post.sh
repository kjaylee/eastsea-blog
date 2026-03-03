#!/bin/bash
# publish-post.sh — 포스트를 posts/ + _posts/ 동기화 후 D1 등록까지 원샷 처리
# 사용법: ./scripts/publish-post.sh <slug>
#   예시: ./scripts/publish-post.sh 2026-03-03-indie-game-trend
#
# 크론/서브에이전트 표준 발행 절차:
#   cd "$WORKSPACE/eastsea-blog"
#   bash scripts/publish-post.sh YYYY-MM-DD-slug

set -euo pipefail

BLOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"

if [ -z "$SLUG" ]; then
  echo "Usage: $0 <slug>" >&2
  exit 1
fi

SLUG="${SLUG%.md}"   # .md 확장자 허용

POSTS_SRC="$BLOG_DIR/posts/${SLUG}.md"
POSTS_DST="$BLOG_DIR/_posts/${SLUG}.md"

# 1) posts/ → _posts/ 미러
if [ -f "$POSTS_SRC" ] && [ ! -f "$POSTS_DST" ]; then
  cp "$POSTS_SRC" "$POSTS_DST"
  echo "✅ Mirrored: posts/ → _posts/"
elif [ -f "$POSTS_DST" ] && [ ! -f "$POSTS_SRC" ]; then
  echo "ℹ️  Only _posts/ exists, skipping mirror"
elif [ ! -f "$POSTS_SRC" ] && [ ! -f "$POSTS_DST" ]; then
  echo "❌ File not found: $SLUG" >&2
  exit 1
else
  echo "ℹ️  Both posts/ and _posts/ exist"
fi

MD_FILE="$POSTS_DST"
[ -f "$POSTS_SRC" ] && MD_FILE="$POSTS_SRC"

# 2) D1 업서트
echo "🔄 Syncing to D1..."
cd "$BLOG_DIR/blog-api"

python3 - "$MD_FILE" "$SLUG" << 'PYEOF'
import re, json, sys

md_path = sys.argv[1]
slug    = sys.argv[2]

with open(md_path) as f:
    content = f.read()

fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
if not fm_match:
    print(f"❌ No front matter in {md_path}", file=sys.stderr)
    sys.exit(1)

fm_text, body = fm_match.groups()

def fm_get(pattern, default=''):
    m = re.search(pattern, fm_text, re.M)
    return m.group(1).strip().strip('"\'') if m else default

title = fm_get(r'title:\s*["\']?(.+?)["\']?\s*$')
date  = fm_get(r'date:\s*(.+)')
cats  = re.search(r'categories:\s*\[(.+?)\]', fm_text)
tags  = re.search(r'tags:\s*\[(.+?)\]', fm_text)
author = fm_get(r'author:\s*(.+)', 'MissKim')

cats_json = json.dumps([c.strip() for c in cats.group(1).split(',')]) if cats else '[]'
tags_json = json.dumps([t.strip() for t in tags.group(1).split(',')]) if tags else '[]'

body_e  = body.strip().replace("'", "''")
title_e = title.replace("'", "''")

sql = f"""INSERT OR REPLACE INTO posts (slug, title, date, content, categories, tags, author, updated_at)
VALUES ('{slug}', '{title_e}', '{date}', '{body_e}', '{cats_json}', '{tags_json}', '{author}', datetime('now'));"""

with open('/tmp/d1-publish.sql', 'w') as f:
    f.write(sql)
print(f"  slug={slug}, title={title[:50]}, body={len(body)}ch")
PYEOF

npx wrangler d1 execute blog-db --remote --file=/tmp/d1-publish.sql 2>&1 \
  | grep -E '"changes"|error|Error' \
  | head -3

echo ""

# 3) Git add + posts.json 업데이트
cd "$BLOG_DIR"

# posts.json 엔트리 추가 (없으면)
python3 - "$MD_FILE" "$SLUG" << 'PYEOF'
import re, json, sys

md_path = sys.argv[1]
slug    = sys.argv[2]

with open(md_path) as f:
    raw = f.read()

fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', raw, re.DOTALL)
if not fm_match:
    sys.exit(0)
fm_text, body = fm_match.groups()

def fm_get(pattern, default=''):
    m = re.search(pattern, fm_text, re.M)
    return m.group(1).strip().strip('"\'') if m else default

title = fm_get(r'title:\s*["\']?(.+?)["\']?\s*$')
date  = fm_get(r'date:\s*(.+)')[:10]  # YYYY-MM-DD only
cats  = re.search(r'categories:\s*\[(.+?)\]', fm_text)
cat   = cats.group(1).split(',')[0].strip() if cats else 'other'
excerpt = body.strip()[:200].replace('\n', ' ')

data = json.load(open('posts.json'))
if not any(p.get('slug') == slug or p.get('filename') == f'{slug}.md' for p in data):
    entry = {"filename": f"{slug}.md", "date": date, "category": cat, "title": title, "excerpt": excerpt}
    # insert sorted by date desc
    inserted = False
    for i, p in enumerate(data):
        if p.get('date', '') < date:
            data.insert(i, entry)
            inserted = True
            break
    if not inserted:
        data.append(entry)
    with open('posts.json', 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f"✅ Added to posts.json: {slug}")
else:
    print(f"ℹ️  Already in posts.json: {slug}")
PYEOF

echo "✅ Done: $SLUG"
