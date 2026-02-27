#!/usr/bin/env python3
"""Rebuild novels/index.html and novels/series.html from _data/*.md frontmatter."""

import os, re, json, glob
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_data")
OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def parse_frontmatter(path):
    """Parse YAML frontmatter from a markdown file."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not m:
        return None
    fm = {}
    for line in m.group(1).split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        kv = line.split(":", 1)
        if len(kv) != 2:
            continue
        key = kv[0].strip()
        val = kv[1].strip().strip('"').strip("'")
        fm[key] = val
    # Parse tags/genre
    tags_match = re.search(r"tags:\s*\[([^\]]*)\]", m.group(1))
    genre_match = re.search(r"genre:\s*\[([^\]]*)\]", m.group(1))
    if tags_match:
        fm["_tags"] = [t.strip().strip('"').strip("'") for t in tags_match.group(1).split(",") if t.strip()]
    elif genre_match:
        fm["_tags"] = [t.strip().strip('"').strip("'") for t in genre_match.group(1).split(",") if t.strip()]
    else:
        fm["_tags"] = []
    # Normalize
    fm["_episode"] = int(fm.get("episode", 0))
    fm["_date"] = fm.get("date", "")[:10]
    fm["_title"] = fm.get("title", f"제{fm['_episode']}화")
    fm["_author"] = fm.get("author", "")
    fm["_series"] = fm.get("series", "")
    # Derive slug
    fname = os.path.basename(path)
    slug_from_file = re.sub(r"-\d+\.md$", "", fname)
    fm["_slug"] = fm.get("slug", slug_from_file)
    return fm


def main():
    files = sorted(glob.glob(os.path.join(DATA_DIR, "*.md")))
    episodes = []
    for f in files:
        fm = parse_frontmatter(f)
        if fm and fm["_episode"] > 0:
            episodes.append(fm)

    # Group by slug
    series_map = {}
    for ep in episodes:
        slug = ep["_slug"]
        if slug not in series_map:
            series_map[slug] = {
                "slug": slug,
                "title": ep["_series"],
                "author": ep["_author"],
                "tags": ep["_tags"],
                "episodes": []
            }
        series_map[slug]["episodes"].append(ep)
        # Update tags if this episode has more
        if len(ep["_tags"]) > len(series_map[slug]["tags"]):
            series_map[slug]["tags"] = ep["_tags"]
        # Prefer author with parenthetical info
        if "(" in ep["_author"] and "(" not in series_map[slug]["author"]:
            series_map[slug]["author"] = ep["_author"]

    # Sort episodes within each series (newest first)
    for s in series_map.values():
        s["episodes"].sort(key=lambda e: (-e["_episode"],))
        # Use the latest series title (some may have been updated)
        latest = s["episodes"][0]
        if latest["_series"]:
            s["title"] = latest["_series"]

    # Sort series by title
    series_list = sorted(series_map.values(), key=lambda s: s["title"])

    # ─── Generate index.html ───
    cards_html = []
    for s in series_list:
        eps = s["episodes"]
        total = len(eps)
        recent = eps[:3]  # Show latest 3

        tags_html = "".join(f'<span class="genre-tag">{t}</span>' for t in s["tags"][:5])

        episodes_html = ""
        for ep in recent:
            ep_num = str(ep["_episode"]).zfill(3)
            episodes_html += f"""
                        <div class="episode-item" onclick="location.href='read.html?series={s['slug']}&episode={ep_num}'">
                            <span class="episode-title">제{ep['_episode']}화</span>
                            <span class="episode-date">{ep['_date']}</span>
                        </div>"""

        cards_html.append(f"""
            <div class="novel-card">
                <div class="novel-header">
                    <h2>{s['title']}</h2>
                    <p class="author">작가: {s['author']}</p>
                    <div class="genre">
                        {tags_html}
                    </div>
                </div>
                <div class="novel-body">
                    <p class="description"></p>
                    <div class="episodes">
                        <h3 style="font-size: 1em; color: #666; margin-bottom: 10px;">총 {total}화 (최신 {len(recent)}화)</h3>
                        {episodes_html}
                        <div style="margin-top: 15px; text-align: center;">
                            <a href="series.html?series={s['slug']}" 
                               style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; transition: background 0.2s;">
                                전체 {total}화 보기 ▶
                            </a>
                        </div>
                    </div>
                </div>
            </div>""")

    index_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>웹소설 - eastsea</title>
    <meta name="description" content="eastsea 웹소설 연재">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        header {{ text-align: center; color: white; margin-bottom: 40px; }}
        header h1 {{ font-size: 3em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }}
        header p {{ font-size: 1.2em; opacity: 0.9; }}
        .novels-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }}
        .novel-card {{
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }}
        .novel-card:hover {{ transform: translateY(-10px); }}
        .novel-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            color: white;
        }}
        .novel-header h2 {{ font-size: 2em; margin-bottom: 10px; }}
        .novel-header .author {{ opacity: 0.9; font-size: 0.9em; }}
        .novel-header .genre {{ display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap; }}
        .genre-tag {{ background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 15px; font-size: 0.8em; }}
        .novel-body {{ padding: 25px; }}
        .novel-body .description {{ color: #555; line-height: 1.6; margin-bottom: 20px; }}
        .episodes {{ border-top: 1px solid #eee; padding-top: 15px; }}
        .episode-item {{
            padding: 12px;
            margin-bottom: 8px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: background 0.2s;
        }}
        .episode-item:hover {{ background: #e9ecef; }}
        .episode-title {{ font-weight: 600; color: #333; }}
        .episode-date {{ color: #888; font-size: 0.85em; }}
        footer {{ text-align: center; color: white; margin-top: 60px; opacity: 0.8; }}
        @media (max-width: 768px) {{
            header h1 {{ font-size: 2em; }}
            .novels-grid {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 eastsea Novels</h1>
            <p>웹소설 연재 플랫폼 · {len(series_list)}개 시리즈 · 총 {len(episodes)}화</p>
        </header>
        
        <div class="novels-grid">
            {''.join(cards_html)}
        </div>
        
        <footer>
            <p>© 2026 eastsea. All rights reserved.</p>
            <p style="margin-top: 10px;"><a href="https://eastsea.monster" style="color: white;">← 메인으로 돌아가기</a></p>
        </footer>
    </div>
</body>
</html>"""

    # ─── Generate series.html ───
    series_js_entries = []
    for s in series_list:
        eps_json = []
        for ep in s["episodes"]:
            eps_json.append({
                "series": s["title"],
                "slug": s["slug"],
                "episode": ep["_episode"],
                "title": ep["_title"],
                "date": ep["_date"],
                "author": ep["_author"],
                "genre": ep["_tags"]
            })
        entry = f"            '{s['slug']}': {{\n"
        entry += f"                title: {json.dumps(s['title'], ensure_ascii=False)},\n"
        entry += f"                author: {json.dumps(s['author'], ensure_ascii=False)},\n"
        entry += f"                episodes: {json.dumps(eps_json, ensure_ascii=False)}\n"
        entry += f"            }}"
        series_js_entries.append(entry)

    series_js_data = ",\n".join(series_js_entries)

    series_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">시리즈 에피소드 - eastsea</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        .header {{
            background: white;
            border-radius: 15px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }}
        .header h1 {{ font-size: 2.5em; color: #667eea; margin-bottom: 10px; }}
        .header .meta {{ color: #666; font-size: 1em; }}
        .back-btn {{
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
        }}
        .back-btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }}
        .episodes-container {{
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }}
        .episode-item {{
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
        }}
        .episode-item:hover {{
            background: #e9ecef;
            border-left-color: #667eea;
            transform: translateX(5px);
        }}
        .episode-title {{ font-weight: 600; color: #333; font-size: 1.05em; }}
        .episode-date {{ color: #888; font-size: 0.9em; }}
        .loading {{ text-align: center; padding: 60px 20px; color: #666; }}
        @media (max-width: 768px) {{
            .header h1 {{ font-size: 1.8em; }}
            .episodes-container {{ padding: 20px; }}
            .episode-item {{ flex-direction: column; align-items: flex-start; gap: 8px; }}
        }}
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
        
        const seriesData = {{
{series_js_data}
        }};
        
        function loadEpisodes() {{
            try {{
                const seriesInfo = seriesData[series];
                if (!seriesInfo) throw new Error('시리즈를 찾을 수 없습니다: ' + series);
                
                document.getElementById('series-title').textContent = seriesInfo.title;
                document.getElementById('series-author').textContent = '작가: ' + seriesInfo.author;
                document.getElementById('page-title').textContent = seriesInfo.title + ' - eastsea';
                
                renderEpisodes(seriesInfo.episodes);
            }} catch (error) {{
                document.getElementById('episodes-list').innerHTML =
                    '<div class="loading"><p style="color: #d9534f;">❌ ' + error.message + '</p></div>';
            }}
        }}
        
        function renderEpisodes(episodes) {{
            if (episodes.length === 0) {{
                document.getElementById('episodes-list').innerHTML =
                    '<div class="loading"><p style="color: #999;">아직 연재된 에피소드가 없습니다.</p></div>';
                return;
            }}
            
            const html = episodes.map(function(ep) {{
                var epNum = String(ep.episode).padStart(3, '0');
                var title = ep.title.replace(/^\\[웹소설\\]\\s*/, '').replace(/\\s*-\\s*\\d+화$/, '');
                return '<div class="episode-item" onclick="location.href=\\'read.html?series=' + series + '&episode=' + epNum + '\\'">' +
                    '<span class="episode-title">제' + ep.episode + '화: ' + title + '</span>' +
                    '<span class="episode-date">' + ep.date + '</span></div>';
            }}).join('');
            
            document.getElementById('episodes-list').innerHTML = html;
        }}
        
        loadEpisodes();
    </script>
</body>
</html>"""

    # Write outputs
    with open(os.path.join(OUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)
    with open(os.path.join(OUT_DIR, "series.html"), "w", encoding="utf-8") as f:
        f.write(series_html)

    # ─── Generate manifest.json ───
    from datetime import datetime as dt
    manifest = {
        "generatedAt": dt.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "novels": []
    }
    for s in series_list:
        novel_entry = {
            "slug": s["slug"],
            "title": s["title"],
            "author": s["author"],
            "genre": s["tags"],
            "status": "연재중",
            "totalEpisodes": len(s["episodes"]),
            "latestDate": s["episodes"][0]["_date"] if s["episodes"] else "",
            "episodes": []
        }
        # Sort episodes oldest first for manifest
        for ep in sorted(s["episodes"], key=lambda e: e["_episode"]):
            novel_entry["episodes"].append({
                "num": str(ep["_episode"]).zfill(3),
                "title": ep["_title"],
                "date": ep["_date"]
            })
        manifest["novels"].append(novel_entry)

    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"✅ Rebuilt: {len(series_list)} series, {len(episodes)} total episodes")
    for s in series_list:
        print(f"  {s['title']} ({s['slug']}): {len(s['episodes'])}화")


if __name__ == "__main__":
    main()
