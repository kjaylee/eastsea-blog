#!/usr/bin/env python3
"""
adsense-inject.py — AdSense 심사 최적화 일괄 삽입
멱등성 보장: 이미 삽입된 경우 중복 삽입 안 함

Usage: python3 scripts/adsense-inject.py <repo_root>
"""
import os
import sys
import re
import glob

PUB_ID = "ca-pub-7252382819928130"

ADSENSE_META = f'<meta name="google-adsense-account" content="{PUB_ID}">'
ADSENSE_SCRIPT = f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUB_ID}" crossorigin="anonymous"></script>'

FOOTER_HTML = """<footer style="text-align:center;padding:12px 8px;font-size:12px;opacity:0.6;font-family:system-ui,sans-serif">
  <a href="/" style="color:inherit;text-decoration:none">Home</a> ·
  <a href="/about.html" style="color:inherit;text-decoration:none">About</a> ·
  <a href="/privacy.html" style="color:inherit;text-decoration:none">Privacy</a> ·
  <a href="/terms.html" style="color:inherit;text-decoration:none">Terms</a> ·
  <a href="/contact.html" style="color:inherit;text-decoration:none">Contact</a>
  <div style="margin-top:4px">© 2026 eastsea.monster</div>
</footer>"""

ADSENSE_BLOCK = f'{ADSENSE_META}\n{ADSENSE_SCRIPT}'

# Stats
stats = {
    "adsense_inserted": 0,
    "adsense_skipped": 0,
    "footer_inserted": 0,
    "footer_skipped": 0,
    "desc_inserted": 0,
    "desc_skipped": 0,
}


def inject_adsense(content: str) -> tuple[str, bool]:
    """<meta charset> 바로 다음 줄에 AdSense 블록 삽입. 이미 있으면 skip."""
    if PUB_ID in content:
        return content, False

    # Match <meta charset="..."> line (with optional trailing whitespace)
    pattern = r'(<meta\s+charset=["\'][^"\']*["\'][^>]*>)'
    match = re.search(pattern, content, re.IGNORECASE)
    if not match:
        # fallback: try <meta charset without quotes
        pattern = r'(<meta\s+charset=[^\s>]+>)'
        match = re.search(pattern, content, re.IGNORECASE)
    
    if not match:
        print(f"  [WARN] <meta charset> not found, skipping AdSense inject")
        return content, False

    insert_pos = match.end()
    new_content = content[:insert_pos] + "\n" + ADSENSE_BLOCK + content[insert_pos:]
    return new_content, True


def inject_footer(content: str) -> tuple[str, bool]:
    """</body> 바로 앞에 footer 삽입. 이미 있으면 skip."""
    # Check if footer already present (check for eastsea.monster copyright in footer context)
    if "eastsea.monster</div>" in content and "footer" in content:
        # More precise check: our specific footer
        if "© 2026 eastsea.monster" in content:
            return content, False

    # Find </body> (case-insensitive)
    pattern = r'(</body\s*>)'
    match = re.search(pattern, content, re.IGNORECASE)
    if not match:
        print(f"  [WARN] </body> not found, skipping footer inject")
        return content, False

    insert_pos = match.start()
    new_content = content[:insert_pos] + FOOTER_HTML + "\n" + content[insert_pos:]
    return new_content, True


def inject_description(content: str, filepath: str) -> tuple[str, bool]:
    """meta description 없으면 title 기반으로 생성. 이미 있으면 skip."""
    if re.search(r'<meta\s+name=["\']description["\']', content, re.IGNORECASE):
        return content, False

    # Extract title
    title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    if not title_match:
        print(f"  [WARN] <title> not found in {filepath}, skipping description inject")
        return content, False

    raw_title = title_match.group(1).strip()
    # Clean up HTML entities if any
    game_name = raw_title.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    # Limit length for description
    if len(game_name) > 60:
        game_name = game_name[:57] + "..."

    desc_tag = f'<meta name="description" content="Play {game_name} - Free HTML5 browser game on eastsea.monster. No download required.">'

    # Insert after <title> tag
    title_end = title_match.end()
    new_content = content[:title_end] + "\n" + desc_tag + content[title_end:]
    return new_content, True


def process_file(filepath: str, is_game: bool) -> None:
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    original = content
    changed = False

    # 1. Inject AdSense
    content, did_insert = inject_adsense(content)
    if did_insert:
        stats["adsense_inserted"] += 1
        changed = True
    else:
        stats["adsense_skipped"] += 1

    # 2. Inject footer (games only)
    if is_game:
        content, did_insert = inject_footer(content)
        if did_insert:
            stats["footer_inserted"] += 1
            changed = True
        else:
            stats["footer_skipped"] += 1

        # 3. Inject description (games only)
        content, did_insert = inject_description(content, filepath)
        if did_insert:
            stats["desc_inserted"] += 1
            changed = True
        else:
            stats["desc_skipped"] += 1

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)


def main():
    if len(sys.argv) < 2:
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    else:
        repo_root = sys.argv[1]

    print(f"Repository root: {repo_root}")

    # Main pages
    main_pages = [
        "index.html",
        "about.html",
        "contact.html",
        "privacy.html",
        "terms.html",
        "view.html",
    ]

    print("\n[1/2] 메인 페이지 처리...")
    main_count = 0
    for page in main_pages:
        filepath = os.path.join(repo_root, page)
        if os.path.exists(filepath):
            process_file(filepath, is_game=False)
            main_count += 1
            print(f"  ✓ {page}")
        else:
            print(f"  ✗ {page} (not found)")

    # Game pages
    print(f"\n[2/2] 게임 페이지 처리...")
    game_files = glob.glob(os.path.join(repo_root, "games", "*", "index.html"))
    game_files.sort()
    game_count = 0
    for filepath in game_files:
        process_file(filepath, is_game=True)
        game_count += 1

    print(f"  처리 완료: {game_count}개 게임 페이지")

    print("\n=== 결과 리포트 ===")
    print(f"메인 페이지: {main_count}개")
    print(f"게임 페이지: {game_count}개")
    print(f"")
    print(f"AdSense 태그 삽입:  {stats['adsense_inserted']}개 파일")
    print(f"AdSense 태그 스킵:  {stats['adsense_skipped']}개 파일 (이미 존재)")
    print(f"Footer 삽입:        {stats['footer_inserted']}개 게임")
    print(f"Footer 스킵:        {stats['footer_skipped']}개 게임 (이미 존재)")
    print(f"Description 삽입:   {stats['desc_inserted']}개 게임")
    print(f"Description 스킵:   {stats['desc_skipped']}개 게임 (이미 존재)")


if __name__ == "__main__":
    main()
