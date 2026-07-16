#!/usr/bin/env python3
"""Generate static compatibility projections from the canonical D1 blog API."""

from __future__ import annotations

import argparse
import json
import os
import re
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape as xml_escape
from pathlib import Path


DEFAULT_API_BASE = "https://blog-api.k-jaylee.workers.dev"
DEFAULT_SITE_BASE = "https://eastsea.monster"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ATOM_NS = "http://www.w3.org/2005/Atom"


def fetch_all_posts(api_base, page_size=200, opener=urllib.request.urlopen, timeout=30):
    posts = []
    seen = set()
    declared_total = None
    page = 1

    while declared_total is None or len(posts) < declared_total:
        query = urllib.parse.urlencode({"page": page, "limit": page_size})
        url = f"{api_base.rstrip('/')}/api/posts?{query}"
        request = urllib.request.Request(url, headers={"User-Agent": "eastsea-d1-projection/1.0"})
        with opener(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))

        batch = payload.get("posts")
        total = payload.get("total")
        if not isinstance(batch, list) or not isinstance(total, int) or total < 0:
            raise ValueError(f"invalid API response on page {page}")
        if declared_total is None:
            declared_total = total
            if declared_total == 0:
                raise ValueError("D1 returned an empty post collection")
        elif total != declared_total:
            raise ValueError(f"declared total changed: {declared_total} -> {total}")
        if not batch:
            raise ValueError(f"declared total {declared_total}, collected only {len(posts)}")

        for post in batch:
            slug = str(post.get("slug") or "").strip()
            if not slug:
                raise ValueError(f"missing slug on page {page}")
            if slug in seen:
                raise ValueError(f"duplicate slug: {slug}")
            seen.add(slug)
            posts.append(post)

        page += 1

    if len(posts) != declared_total:
        raise ValueError(f"declared total {declared_total}, collected {len(posts)}")
    return posts


def post_sort_key(post):
    return (str(post.get("date") or ""), str(post.get("slug") or ""))


def normalize_posts(posts):
    return sorted(posts, key=post_sort_key, reverse=True)


def build_posts_projection(posts):
    projection = []
    for post in normalize_posts(posts):
        slug = str(post["slug"]).strip()
        categories = post.get("categories") or []
        category = str(post.get("category") or (categories[0] if categories else "other"))
        projection.append(
            {
                "filename": f"{slug}.md",
                "date": str(post.get("date") or ""),
                "category": category,
                "title": str(post.get("title") or slug),
                "excerpt": str(post.get("excerpt") or "").strip(),
            }
        )
    return projection


def build_sitemap(existing_xml, posts, site_base):
    preserved = [
        block.strip()
        for block in re.findall(r"<url>.*?</url>", existing_xml, flags=re.DOTALL)
        if "/view.html?post=" not in block
    ]
    if not preserved:
        raise ValueError("base sitemap contains no preservable URLs")

    generated = []
    base = site_base.rstrip("/")
    for post in normalize_posts(posts):
        slug = urllib.parse.quote(str(post["slug"]), safe="-._~")
        url = xml_escape(f"{base}/view.html?post={slug}")
        lastmod = xml_escape(str(post.get("date") or "")[:10])
        generated.append(
            "  <url>\n"
            f"    <loc>{url}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            "    <changefreq>monthly</changefreq>\n"
            "    <priority>0.6</priority>\n"
            "  </url>"
        )

    blocks = [f"  {block}" for block in preserved] + generated
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="{SITEMAP_NS}">\n'
        + "\n".join(blocks)
        + "\n</urlset>\n"
    )


def parse_post_datetime(post):
    value = str(post.get("updated_at") or post.get("date") or "").strip()
    if not value:
        return datetime.now(timezone.utc)
    candidate = value.replace("Z", "+00:00")
    if " " in candidate and "T" not in candidate:
        candidate = candidate.replace(" ", "T", 1)
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        parsed = datetime.strptime(value[:10], "%Y-%m-%d")
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def post_url(post, site_base):
    slug = urllib.parse.quote(str(post["slug"]), safe="-._~")
    return f"{site_base.rstrip('/')}/view.html?post={slug}"


def build_rss(posts, site_base, limit=50):
    items = normalize_posts(posts)[:limit]
    base = xml_escape(site_base.rstrip("/") + "/")
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0">',
        "  <channel>",
        "    <title>동해물과 백두산이</title>",
        f"    <link>{base}</link>",
        "    <description>Miss Kim의 기술, 시장, 게임 리서치</description>",
        "    <language>ko-KR</language>",
    ]
    if items:
        lines.append(f"    <lastBuildDate>{format_datetime(parse_post_datetime(items[0]))}</lastBuildDate>")
    for post in items:
        url = xml_escape(post_url(post, site_base))
        title = xml_escape(str(post.get("title") or post["slug"]))
        excerpt = xml_escape(str(post.get("excerpt") or ""))
        published = format_datetime(parse_post_datetime(post))
        lines.extend(
            [
                "    <item>",
                f"      <title>{title}</title>",
                f"      <link>{url}</link>",
                f'      <guid isPermaLink="true">{url}</guid>',
                f"      <pubDate>{published}</pubDate>",
                f"      <description>{excerpt}</description>",
                "    </item>",
            ]
        )
    lines.extend(["  </channel>", "</rss>", ""])
    return "\n".join(lines)


def build_atom(posts, site_base, limit=50):
    items = normalize_posts(posts)[:limit]
    updated = parse_post_datetime(items[0]) if items else datetime.now(timezone.utc)
    home = xml_escape(site_base.rstrip("/") + "/", quote=True)
    self_url = xml_escape(site_base.rstrip("/") + "/atom.xml", quote=True)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<feed xmlns="{ATOM_NS}">',
        "  <title>동해물과 백두산이</title>",
        f"  <id>{home}</id>",
        f'  <link href="{home}"/>',
        f'  <link href="{self_url}" rel="self" type="application/atom+xml"/>',
        f"  <updated>{updated.isoformat().replace('+00:00', 'Z')}</updated>",
    ]
    for post in items:
        url = xml_escape(post_url(post, site_base), quote=True)
        title = xml_escape(str(post.get("title") or post["slug"]))
        excerpt = xml_escape(str(post.get("excerpt") or ""))
        post_updated = parse_post_datetime(post).isoformat().replace("+00:00", "Z")
        lines.extend(
            [
                "  <entry>",
                f"    <title>{title}</title>",
                f"    <id>{url}</id>",
                f'    <link href="{url}"/>',
                f"    <updated>{post_updated}</updated>",
                f"    <summary>{excerpt}</summary>",
                "  </entry>",
            ]
        )
    lines.extend(["</feed>", ""])
    return "\n".join(lines)


def atomic_write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(content)
        temp_path = Path(handle.name)
    os.replace(temp_path, path)


def write_projections(output_dir, posts, site_base):
    output_dir = Path(output_dir)
    sitemap_path = output_dir / "sitemap.xml"
    if not sitemap_path.is_file():
        raise FileNotFoundError(f"base sitemap missing: {sitemap_path}")
    existing_sitemap = sitemap_path.read_text(encoding="utf-8")

    posts_json = json.dumps(build_posts_projection(posts), ensure_ascii=False, indent=2) + "\n"
    sitemap = build_sitemap(existing_sitemap, posts, site_base)
    rss = build_rss(posts, site_base)
    atom = build_atom(posts, site_base)

    atomic_write(output_dir / "posts.json", posts_json)
    atomic_write(sitemap_path, sitemap)
    atomic_write(output_dir / "rss.xml", rss)
    atomic_write(output_dir / "feed.xml", rss)
    atomic_write(output_dir / "atom.xml", atom)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--api-base", default=DEFAULT_API_BASE)
    parser.add_argument("--site-base", default=DEFAULT_SITE_BASE)
    args = parser.parse_args()

    posts = fetch_all_posts(args.api_base)
    write_projections(Path(args.output_dir), posts, args.site_base)


if __name__ == "__main__":
    main()
