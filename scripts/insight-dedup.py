#!/usr/bin/env python3
"""Minimal dedup checker: check against recent briefing files."""
import sys, os, re
from pathlib import Path

def extract_headlines(content):
    return set(re.findall(r'\*\*\[(.+?)\]', content))

def main():
    if len(sys.argv) < 2:
        print("Usage: insight-dedup.py <file>")
        sys.exit(2)
    
    file_path = sys.argv[1]
    posts_dir = Path(file_path).parent
    
    with open(file_path, 'r') as f:
        current = f.read()
    current_headlines = extract_headlines(current)
    
    # Check last 3 days of briefings
    all_past = set()
    today_stem = Path(file_path).stem
    for past_file in sorted(posts_dir.glob('*-daily-briefing.md'), reverse=True)[:4]:
        if past_file.stem == today_stem:
            continue
        with open(past_file, 'r') as f:
            all_past.update(extract_headlines(f.read()))
    
    if not all_past:
        print("OK: No past briefings to compare.")
        sys.exit(0)
    
    overlap = current_headlines & all_past
    ratio = len(overlap) / len(current_headlines) if current_headlines else 0
    print(f"Overlap: {len(overlap)}/{len(current_headlines)} ({ratio:.0%})")
    
    if ratio >= 0.4:
        print(f"BLOCK: {ratio:.0%} overlap >= 40%. Rewrite needed.")
        sys.exit(2)
    
    print("OK: Dedup check passed.")
    sys.exit(0)

if __name__ == '__main__':
    main()
