#!/bin/bash
# eastsea-blog posts.json 자동 생성 스크립트
# 사용법: ./update-posts.sh

set -e

BLOG_DIR="/Users/kjaylee/.openclaw/workspace/eastsea-blog"
cd "$BLOG_DIR"

echo "📝 Generating posts.json..."

node << 'EOF'
const fs = require('fs');
const path = require('path');

const postsDir = '_posts';
const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse();

const posts = files.map(filename => {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (!match) return null;
  
  const [, year, month, day, rest] = match;
  const date = `${year}-${month}-${day}`;
  
  // Read content
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
  let lines = content.split('\n');
  
  // Parse front matter
  let frontMatter = {};
  let inFrontMatter = false;
  let frontMatterEnded = false;
  const contentLines = [];
  
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!frontMatterEnded) {
        inFrontMatter = !inFrontMatter;
        if (!inFrontMatter) frontMatterEnded = true;
      }
      continue;
    }
    
    if (inFrontMatter) {
      // Parse front matter key-value
      const fmMatch = line.match(/^(\w+):\s*(.+)$/);
      if (fmMatch) {
        const [, key, value] = fmMatch;
        frontMatter[key] = value.replace(/^["']|["']$/g, '');
      }
    } else if (frontMatterEnded) {
      contentLines.push(line);
    }
  }
  
  // Detect category
  let category = 'journal'; // default
  if (frontMatter.categories) {
    const cats = frontMatter.categories.toLowerCase();
    if (cats.includes('briefing')) category = 'briefing';
    else if (cats.includes('digest')) category = 'digest';
    else if (cats.includes('report')) category = 'report';
    else if (cats.includes('diary') || cats.includes('journal')) category = 'journal';
  } else {
    // Fallback to filename
    if (rest.includes('briefing')) category = 'briefing';
    else if (rest.includes('digest')) category = 'digest';
    else if (rest.includes('report')) category = 'report';
    else if (rest.includes('diary')) category = 'journal';
  }
  
  // Use front matter title if available, otherwise convert filename
  let title = frontMatter.title || rest.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  // Get first meaningful line for excerpt
  const meaningfulLines = contentLines
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.length > 20);
  
  const excerpt = meaningfulLines[0] 
    ? meaningfulLines[0].substring(0, 120).replace(/[*_`]/g, '').trim() + '...'
    : '더 읽기...';
  
  return { filename, date, category, title, excerpt };
}).filter(p => p !== null);

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
console.log(`✅ Generated posts.json with ${posts.length} posts`);

// Category stats
const stats = posts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
console.log('📊 Categories:', JSON.stringify(stats));
EOF

echo "📦 Git add + commit + push..."
git add posts.json
git commit -m "chore: Update posts.json ($(date +%Y-%m-%d))" || echo "No changes to commit"
git push origin master

echo "✅ Done! Posts updated: $(cat posts.json | grep -c filename)"
