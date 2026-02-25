#!/usr/bin/env python3
"""Migrate markdown posts from _posts/ and posts/ into Cloudflare D1 via blog-api."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Migrate markdown posts to D1 via Worker API')
    parser.add_argument('--api-url', required=True, help='Worker base URL (e.g. https://blog-api.xxx.workers.dev)')
    parser.add_argument('--token', required=True, help='API token (Authorization: Bearer <token>)')
    parser.add_argument('--root', default='.', help='Project root directory (default: current directory)')
    parser.add_argument('--limit', type=int, default=0, help='Process only first N posts (0 = all)')
    parser.add_argument('--timeout', type=int, default=30, help='HTTP timeout in seconds')
    parser.add_argument('--dry-run', action='store_true', help='Parse only; do not call API')
    return parser.parse_args()


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def clean_scalar(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def parse_inline_list(value: str) -> List[str]:
    text = value.strip()
    if not (text.startswith('[') and text.endswith(']')):
        return [clean_scalar(text)] if text else []

    inner = text[1:-1].strip()
    if not inner:
        return []
    return [clean_scalar(part) for part in inner.split(',') if clean_scalar(part)]


def parse_front_matter(text: str) -> Tuple[Dict[str, object], str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != '---':
        return {}, text

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_idx = i
            break

    if end_idx is None:
        return {}, text

    fm_lines = lines[1:end_idx]
    body = '\n'.join(lines[end_idx + 1 :])

    data: Dict[str, object] = {}
    current_key = None

    key_pattern = re.compile(r'^([A-Za-z0-9_-]+):\s*(.*)$')
    list_pattern = re.compile(r'^\s*-\s*(.+)$')

    for raw_line in fm_lines:
        if not raw_line.strip() or raw_line.lstrip().startswith('#'):
            continue

        key_match = key_pattern.match(raw_line)
        if key_match:
            key = key_match.group(1)
            raw_value = key_match.group(2).strip()

            if raw_value == '':
                data[key] = []
            elif raw_value.startswith('[') and raw_value.endswith(']'):
                data[key] = parse_inline_list(raw_value)
            else:
                data[key] = clean_scalar(raw_value)

            current_key = key
            continue

        list_match = list_pattern.match(raw_line)
        if list_match and current_key:
            item = clean_scalar(list_match.group(1))
            existing = data.get(current_key)
            if isinstance(existing, list):
                existing.append(item)
            elif existing:
                data[current_key] = [str(existing), item]
            else:
                data[current_key] = [item]

    return data, body


def normalize_array(value: object) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    text = str(value).strip()
    if not text:
        return []
    if text.startswith('[') and text.endswith(']'):
        return parse_inline_list(text)
    if ',' in text:
        return [part.strip() for part in text.split(',') if part.strip()]
    return [text]


def detect_date(front_matter: Dict[str, object], slug: str) -> str:
    raw_date = str(front_matter.get('date', '')).strip()
    if raw_date:
        return raw_date

    match = re.match(r'^(\d{4}-\d{2}-\d{2})', slug)
    if match:
        return match.group(1)

    return ''


def build_payload(path: Path) -> Dict[str, object]:
    text = read_text(path)
    front_matter, body = parse_front_matter(text)
    slug = path.stem

    title = str(front_matter.get('title', '')).strip() or slug
    date = detect_date(front_matter, slug)
    categories = normalize_array(front_matter.get('categories'))
    tags = normalize_array(front_matter.get('tags'))
    author = str(front_matter.get('author', 'Miss Kim')).strip() or 'Miss Kim'

    return {
        'slug': slug,
        'title': title,
        'date': date,
        'content': body.strip() if body.strip() else text,
        'categories': categories,
        'tags': tags,
        'author': author,
    }


def post_json(url: str, token: str, payload: Dict[str, object], timeout: int) -> Tuple[int, Dict[str, object]]:
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = Request(
        url=url,
        data=data,
        method='POST',
        headers={
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': f'Bearer {token}',
            'X-API-Key': token,
            'User-Agent': 'curl/8.7.1',
            'Accept': 'application/json',
        },
    )

    try:
        with urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except HTTPError as exc:
        error_body = exc.read().decode('utf-8', errors='replace')
        try:
            parsed = json.loads(error_body) if error_body else {}
        except Exception:
            parsed = {'raw': error_body}
        return exc.code, parsed


def collect_markdown_files(root: Path) -> Tuple[List[Path], int]:
    paths = sorted((root / '_posts').glob('*.md')) + sorted((root / 'posts').glob('*.md'))

    deduped: List[Path] = []
    seen = set()
    local_duplicates = 0

    for path in paths:
        slug = path.stem
        if slug in seen:
            local_duplicates += 1
            continue
        seen.add(slug)
        deduped.append(path)

    return deduped, local_duplicates


def main() -> int:
    args = parse_args()

    root = Path(args.root).resolve()
    files, local_duplicates = collect_markdown_files(root)

    if args.limit > 0:
        files = files[: args.limit]

    endpoint = args.api_url.rstrip('/') + '/api/posts'

    print(f'Root: {root}')
    print(f'Endpoint: {endpoint}')
    print(f'Files discovered: {len(files)} (local duplicate slugs skipped: {local_duplicates})')

    success = 0
    duplicate = 0
    failed = 0
    failures = []

    for idx, path in enumerate(files, start=1):
        payload = build_payload(path)

        if args.dry_run:
            print(f'[{idx}/{len(files)}] DRY-RUN {payload["slug"]}')
            success += 1
            continue

        status, response_json = post_json(endpoint, args.token, payload, args.timeout)

        if status in (200, 201):
            success += 1
            print(f'[{idx}/{len(files)}] ✅ {payload["slug"]}')
        elif status == 409:
            duplicate += 1
            print(f'[{idx}/{len(files)}] ⚠️  DUPLICATE {payload["slug"]}')
        else:
            failed += 1
            failures.append({'slug': payload['slug'], 'status': status, 'response': response_json})
            print(f'[{idx}/{len(files)}] ❌ {payload["slug"]} (status={status})')

    print('\n=== Migration Summary ===')
    print(f'Total processed: {len(files)}')
    print(f'Success: {success}')
    print(f'Duplicate: {duplicate}')
    print(f'Failed: {failed}')
    print(f'Local duplicate slugs skipped: {local_duplicates}')

    if failures:
        print('\n=== Failure details (up to 20) ===')
        for item in failures[:20]:
            print(json.dumps(item, ensure_ascii=False))

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
