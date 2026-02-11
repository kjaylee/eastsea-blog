#!/bin/bash
set -euo pipefail

# Novel Auto-Publishing Script
# Scans novels/_data/*.md and generates index.html + series.html

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOVELS_DIR="$SCRIPT_DIR/../novels"
DATA_DIR="$NOVELS_DIR/_data"

echo "🔍 Scanning novels in $DATA_DIR..."

# Extract metadata using Python
METADATA=$(python3 <<PYTHON
import glob
import json
import re
from pathlib import Path

novels = []
for file in glob.glob("$DATA_DIR/*.md"):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract YAML frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        
        # Simple YAML parser (good enough for our needs)
        metadata = {}
        for line in frontmatter.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                if key in ['tags', 'genre']:
                    # Parse array
                    value = re.findall(r'[\w가-힣]+', value)
                
                metadata[key] = value
        
        novels.append({
            'series': metadata.get('series', ''),
            'episode': int(metadata.get('episode', 0)),
            'title': metadata.get('title', ''),
            'date': str(metadata.get('date', '')).split(' ')[0],
            'author': metadata.get('author', ''),
            'genre': metadata.get('genre', metadata.get('tags', []))
        })

print(json.dumps(novels, ensure_ascii=False))
PYTHON
)

echo "📊 Found $(echo "$METADATA" | jq 'length') episodes"

# Generate index.html
echo "📝 Generating index.html..."

cat > "$NOVELS_DIR/index.html" <<'HTML_HEADER'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>웹소설 - eastsea</title>
    <meta name="description" content="eastsea 웹소설 연재">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .novels-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .novel-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .novel-card:hover {
            transform: translateY(-10px);
        }
        
        .novel-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            color: white;
        }
        
        .novel-header h2 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .novel-header .author {
            opacity: 0.9;
            font-size: 0.9em;
        }
        
        .novel-header .genre {
            display: flex;
            gap: 8px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .genre-tag {
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8em;
        }
        
        .novel-body {
            padding: 25px;
        }
        
        .novel-body .description {
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .episodes {
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        
        .episode-item {
            padding: 12px;
            margin-bottom: 8px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .episode-item:hover {
            background: #e9ecef;
        }
        
        .episode-title {
            font-weight: 600;
            color: #333;
        }
        
        .episode-date {
            color: #888;
            font-size: 0.85em;
        }
        
        footer {
            text-align: center;
            color: white;
            margin-top: 60px;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 2em;
            }
            
            .novels-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 eastsea Novels</h1>
            <p>웹소설 연재 플랫폼</p>
        </header>
        
        <div class="novels-grid">
HTML_HEADER

# Generate novel cards
echo "$METADATA" | jq -c 'group_by(.series) | .[]' | while IFS= read -r group; do
    series=$(echo "$group" | jq -r '.[0].series')
    author=$(echo "$group" | jq -r '.[0].author')
    episodes=$(echo "$group" | jq -c '. | sort_by(.episode) | reverse | .[0:3]')
    episode_count=$(echo "$group" | jq 'length')
    series_slug=$(echo "$series" | sed 's/ //g')
    
    cat >> "$NOVELS_DIR/index.html" <<CARD
            <!-- $series -->
            <div class="novel-card">
                <div class="novel-header">
                    <h2>$series</h2>
                    <p class="author">작가: $author</p>
                    <div class="genre">
CARD

    # Add genre tags
    echo "$group" | jq -r '.[0].genre // [] | .[]' | while read -r tag; do
        echo "                        <span class=\"genre-tag\">$tag</span>" >> "$NOVELS_DIR/index.html"
    done

    cat >> "$NOVELS_DIR/index.html" <<CARD
                    </div>
                </div>
                <div class="novel-body">
                    <p class="description">
                        <!-- Auto-generated card -->
                    </p>
                    <div class="episodes">
                        <h3 style="font-size: 1em; color: #666; margin-bottom: 10px;">최신 ${episode_count}화</h3>
CARD

    # Add episode items (max 3)
    echo "$episodes" | jq -r '.[] | "\(.episode)|\(.date)"' | head -3 | while IFS='|' read -r ep_num ep_date; do
        printf -v ep_padded "%03d" "$ep_num"
        cat >> "$NOVELS_DIR/index.html" <<EPISODE
                        <div class="episode-item" onclick="location.href='view.html?series=$series_slug&episode=$ep_padded'">
                            <span class="episode-title">제${ep_num}화</span>
                            <span class="episode-date">$ep_date</span>
                        </div>
EPISODE
    done

    cat >> "$NOVELS_DIR/index.html" <<CARD
                        <div style="margin-top: 15px; text-align: center;">
                            <a href="series.html?series=$series_slug" 
                               style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; transition: background 0.2s;">
                                전체 에피소드 보기 ▶
                            </a>
                        </div>
                    </div>
                </div>
            </div>

CARD
done

# Close HTML
cat >> "$NOVELS_DIR/index.html" <<'HTML_FOOTER'
        </div>
        
        <footer>
            <p>© 2026 eastsea. All rights reserved.</p>
            <p style="margin-top: 10px;"><a href="https://eastsea.monster" style="color: white;">← 메인으로 돌아가기</a></p>
        </footer>
    </div>
</body>
</html>
HTML_FOOTER

echo "✅ index.html generated"

# Generate series.html
echo "📝 Generating series.html..."

cat > "$NOVELS_DIR/series.html" <<'SERIES_HTML'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">시리즈 에피소드 - eastsea</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .header .meta {
            color: #666;
            font-size: 1em;
        }
        
        .back-btn {
            display: inline-block;
            margin-bottom: 20px;
            padding: 12px 24px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.2s;
        }
        
        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .episodes-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .episode-item {
            padding: 18px;
            margin-bottom: 12px;
            background: #f8f9fa;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 4px solid transparent;
        }
        
        .episode-item:hover {
            background: #e9ecef;
            border-left-color: #667eea;
            transform: translateX(5px);
        }
        
        .episode-title {
            font-weight: 600;
            color: #333;
            font-size: 1.05em;
        }
        
        .episode-date {
            color: #888;
            font-size: 0.9em;
        }
        
        .loading {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .episodes-container {
                padding: 20px;
            }
            
            .episode-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-btn">← 전체 소설 목록</a>
        
        <div class="header">
            <h1 id="series-title">시리즈 에피소드</h1>
            <p class="meta" id="series-author">작가: </p>
        </div>
        
        <div class="episodes-container">
            <div id="episodes-list" class="loading">
                <p>에피소드 목록을 불러오는 중...</p>
            </div>
        </div>
    </div>
    
    <script>
        const params = new URLSearchParams(window.location.search);
        const series = params.get('series');
        
        // Auto-generated series data
        const seriesData = {
SERIES_HTML

# Generate seriesData JavaScript object
first=true
echo "$METADATA" | jq -c 'group_by(.series) | .[]' | while IFS= read -r group; do
    series=$(echo "$group" | jq -r '.[0].series')
    author=$(echo "$group" | jq -r '.[0].author')
    series_slug=$(echo "$series" | sed 's/ //g')
    episodes=$(echo "$group" | jq -c '. | sort_by(.episode)')
    
    [ "$first" = true ] || echo "," >> "$NOVELS_DIR/series.html"
    first=false
    
    # Escape single quotes in series name
    series_escaped=$(echo "$series" | sed "s/'/\\\\'/g")
    author_escaped=$(echo "$author" | sed "s/'/\\\\'/g")
    
    cat >> "$NOVELS_DIR/series.html" <<JSDATA
            '$series_slug': {
                title: '$series_escaped',
                author: '$author_escaped',
                episodes: $episodes
            }
JSDATA
done

cat >> "$NOVELS_DIR/series.html" <<'SERIES_JS'
        };
        
        function loadEpisodes() {
            try {
                const seriesInfo = seriesData[series];
                if (!seriesInfo) throw new Error('시리즈를 찾을 수 없습니다.');
                
                document.getElementById('series-title').textContent = seriesInfo.title;
                document.getElementById('series-author').textContent = '작가: ' + seriesInfo.author;
                document.getElementById('page-title').textContent = `${seriesInfo.title} - eastsea`;
                
                renderEpisodes(seriesInfo.episodes);
                
            } catch (error) {
                document.getElementById('episodes-list').innerHTML = `
                    <div class="loading">
                        <p style="color: #d9534f;">❌ ${error.message}</p>
                    </div>
                `;
            }
        }
        
        function renderEpisodes(episodes) {
            if (episodes.length === 0) {
                document.getElementById('episodes-list').innerHTML = `
                    <div class="loading">
                        <p style="color: #999;">아직 연재된 에피소드가 없습니다.</p>
                    </div>
                `;
                return;
            }
            
            const html = episodes.map(ep => {
                const epNum = String(ep.episode).padStart(3, '0');
                const title = ep.title.replace(/^\[웹소설\]\s*/, '').replace(/\s*-\s*\d+화$/, '');
                return `
                    <div class="episode-item" onclick="location.href='view.html?series=${series}&episode=${epNum}'">
                        <span class="episode-title">제${ep.episode}화${title ? ': ' + title : ''}</span>
                        <span class="episode-date">${ep.date}</span>
                    </div>
                `;
            }).join('');
            
            document.getElementById('episodes-list').innerHTML = html;
        }
        
        // Load on page load
        loadEpisodes();
    </script>
</body>
</html>
SERIES_JS

echo "✅ series.html generated"

# Generate manifest.json (Unified with index/series generation)
echo "📝 Generating manifest.json..."

echo "$METADATA" | python3 -c "
import sys, json

data = json.load(sys.stdin)
novels = {}

# Group by series
for ep in data:
    series = ep['series']
    slug = series.replace(' ', '')  # Consistent slug generation
    
    if slug not in novels:
        novels[slug] = {
            'slug': slug,
            'title': series,
            'author': ep.get('author', 'Unknown'),
            'genre': ep.get('genre', []),
            'episodes': [],
            'totalEpisodes': 0,
            'latestDate': ''
        }
    
    # Add episode (format matches manifest expectations)
    novels[slug]['episodes'].append({
        'num': f\"{ep['episode']:03d}\",  # Pad with zeros for view.html compatibility
        'title': ep.get('title', ''),
        'date': ep.get('date', '')
    })

# Post-process novels
output_list = []
for slug, novel in novels.items():
    # Sort episodes by number
    novel['episodes'].sort(key=lambda x: x['num'])
    
    novel['totalEpisodes'] = len(novel['episodes'])
    if novel['totalEpisodes'] > 0:
        novel['latestDate'] = novel['episodes'][-1]['date']
    
    output_list.append(novel)

manifest = {'novels': output_list}
print(json.dumps(manifest, ensure_ascii=False, indent=2))
" > "$NOVELS_DIR/manifest.json"

echo "✅ manifest.json generated"

# Git auto-commit (optional)
if [ "${AUTO_COMMIT:-true}" = "true" ]; then
    echo "📤 Committing changes..."
    cd "$NOVELS_DIR/.."
    git add novels/index.html novels/series.html novels/manifest.json
    git commit -m "Auto-update: Novel index, series, and manifest [$(date +%Y-%m-%d)]" || echo "✓ No changes to commit"
fi

echo "🎉 Novel publishing system updated successfully!"
