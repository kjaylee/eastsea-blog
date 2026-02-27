#!/usr/bin/env python3
"""Minimal canonical URL checker: flags news.google.com RSS links."""
import sys, re

def main():
    args = sys.argv[1:]
    file_path = None
    for i, a in enumerate(args):
        if a == '--file' and i+1 < len(args):
            file_path = args[i+1]
    if not file_path:
        print("Usage: resolve-canonical.py --file <path>")
        sys.exit(2)
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    google_rss = re.findall(r'news\.google\.com/rss/articles/[^\s)>]+', content)
    if google_rss:
        print(f"BLOCK: Found {len(google_rss)} Google RSS link(s): {google_rss}")
        sys.exit(2)
    
    urls = re.findall(r'https?://[^\s)>\]]+', content)
    domains = set(re.sub(r'^https?://([^/]+).*', r'\1', u) for u in urls)
    if len(domains) < 3:
        print(f"WARN: Only {len(domains)} unique domains found. Minimum is 3.")
        sys.exit(1)
    
    print(f"OK: {len(urls)} URLs across {len(domains)} domains. No Google RSS links.")
    sys.exit(0)

if __name__ == '__main__':
    main()
