#!/bin/bash
# Manifest Generator - games + tools
# Usage: bash scripts/build-manifests.sh

set -e
cd "$(dirname "$0")/.."

python3 -c "
import os, re, json
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
now = datetime.now(KST).strftime('%Y-%m-%dT%H:%M:%S+09:00')

def scan(section):
    base = os.path.join('.', section)
    items = []
    for name in sorted(os.listdir(base)):
        d = os.path.join(base, name)
        idx = os.path.join(d, 'index.html')
        if not os.path.isdir(d) or not os.path.isfile(idx):
            continue
        # parse title
        title = name
        try:
            with open(idx, 'r', encoding='utf-8', errors='replace') as f:
                html = f.read(8192)
            m = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
            if m:
                t = m.group(1).strip()
                # remove suffix after | or – or —
                t = re.split(r'\s*[|–—]\s*', t)[0].strip()
                if t:
                    title = t
        except:
            pass
        # dir size
        size = 0
        for root, dirs, files in os.walk(d):
            for fn in files:
                try:
                    size += os.path.getsize(os.path.join(root, fn))
                except:
                    pass
        items.append({'slug': name, 'title': title, 'url': f'/{section}/{name}/', 'size': size})
    return items

for section in ['games', 'tools']:
    items = scan(section)
    data = {section: items, 'count': len(items), 'updatedAt': now}
    out = os.path.join('.', section, 'manifest.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'{section}/manifest.json: {len(items)}개')
"

echo "완료!"
