#!/usr/bin/env python3
"""Publish a single markdown post to blog-api (Cloudflare Worker + D1).

Flow:
1) Parse markdown front matter/body
2) Try POST /api/posts
3) If conflict (already exists), fallback to PUT /api/posts/:slug
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

DEFAULT_API_URL = 'https://blog-api.k-jaylee.workers.dev'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Publish one markdown post to D1 via Worker API')
    parser.add_argument('markdown_path', help='Path to markdown file')
    parser.add_argument('--api-url', default=DEFAULT_API_URL, help='Worker base URL')
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


def request_json(method: str, url: str, token: str, payload: Dict[str, object], timeout: int) -> Tuple[int, Dict[str, object]]:
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = Request(
        url=url,
        data=data,
        method=method,
        headers={
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': f'Bearer {token}',
            'X-API-Key': token,
            'User-Agent': 'publish-post-to-d1/1.0',
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


def is_conflict(status: int, response_json: Dict[str, object]) -> bool:
    if status == 409:
        return True
    error_text = str(response_json.get('error', '')).lower()
    return status in (400, 422) and ('duplicate' in error_text or 'exists' in error_text)


def main() -> int:
    args = parse_args()
    markdown_path = Path(args.markdown_path).expanduser().resolve()

    if not markdown_path.exists():
        print(f'ERROR: markdown file not found: {markdown_path}')
        return 1

    payload = build_payload(markdown_path)
    slug = str(payload['slug'])

    if args.dry_run:
        print(f'DRY-RUN OK: slug={slug} path={markdown_path}')
        return 0

    token = __import__('os').environ.get('BLOG_API_TOKEN', '').strip()
    if not token:
        print('ERROR: BLOG_API_TOKEN is not set')
        return 2

    base = args.api_url.rstrip('/')
    post_url = f'{base}/api/posts'
    put_url = f'{base}/api/posts/{quote(slug, safe="")}'

    status, response_json = request_json('POST', post_url, token, payload, args.timeout)

    if status in (200, 201):
        print(f'OK: created slug={slug} status={status}')
        return 0

    if is_conflict(status, response_json):
        put_status, put_response = request_json('PUT', put_url, token, payload, args.timeout)
        if put_status in (200, 201):
            print(f'OK: updated slug={slug} status={put_status}')
            return 0
        print(f'ERROR: PUT failed slug={slug} status={put_status} response={json.dumps(put_response, ensure_ascii=False)}')
        return 1

    print(f'ERROR: POST failed slug={slug} status={status} response={json.dumps(response_json, ensure_ascii=False)}')
    return 1


if __name__ == '__main__':
    sys.exit(main())
