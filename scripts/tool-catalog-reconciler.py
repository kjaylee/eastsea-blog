#!/usr/bin/env python3
"""Reconcile eastsea-blog tool discovery artifacts from filesystem truth.

Default mode is dry-run: print a summary and optionally emit preview artifacts.
Explicit flags can overwrite:
- `_data/tools-list.json`
- `tools/manifest.json`
- `tools/index.html` count claims
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from html import unescape as html_unescape
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


GENERIC_TITLE_MARKERS = (
    "웹 도구 모음",
    "eastsea tools",
    "eastsea.monster",
    "free online tools",
)
PLACEHOLDER_MARKERS = ("${", "{{", "%%")
GENERIC_DESCRIPTION_MARKERS = {
    "A collection of free, fast browser tools for developers and creators.",
    "Free web-based utility tools.",
}
SUSPICIOUS_DESCRIPTION_BY_SLUG = {
    "seo-meta-checker": {
        "소환과 성장, 자동 전투를 결합한 방치형 RPG. 브라우저에서 바로 플레이하세요.",
        "브라우저에서 바로 즐기는 방치형 RPG 게임",
    },
    "meta-tag-analyzer": {
        "A collection of free, fast browser tools for developers and creators.",
        "Free web-based utility tools.",
    },
}
TITLE_SPLIT_RE = re.compile(r"\s*[|–—]\s*")
FREE_TOOL_SUFFIX_PATTERNS = (
    re.compile(r"\s*\|\s*Free online tool at eastsea\.monster\b", re.I),
    re.compile(r"\s*무료 온라인 도구\b", re.I),
    re.compile(r"\s*무료 온라인 웹 도구\b", re.I),
    re.compile(r"\s*Free web-based utility tools?\.?", re.I),
)
COUNT_SYNC_PATTERNS = (
    re.compile(r"\d+(?=개의 무료 웹 도구 모음)"),
    re.compile(r"\d+(?=개의 무료 온라인 도구 모음)"),
    re.compile(r"\d+(?=개의 무료 웹 도구를)"),
    re.compile(r"\d+(?=개의 무료 온라인 웹 도구 모음)"),
    re.compile(r"(?<=총\s)\d+(?=개의 도구)"),
)
NUMBER_OF_ITEMS_RE = re.compile(r'("numberOfItems"\s*:\s*)\d+')
KST = timezone(timedelta(hours=9))


@dataclass
class Report:
    root: Path
    filesystem_slugs: list[str]
    existing_entries: list[dict[str, Any]]
    existing_slugs: list[str]
    missing_slugs: list[str]
    extra_slugs: list[str]
    candidate_entries: list[dict[str, Any]]
    repaired_slugs: list[str]
    merged_entries: list[dict[str, Any]]
    manifest: dict[str, Any]
    landing_before: str
    landing_after: str

    @property
    def landing_changed(self) -> bool:
        return self.landing_before != self.landing_after


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reconcile eastsea-blog tool discovery artifacts from tool pages.")
    parser.add_argument("--root", required=True, help="Repo root (e.g. eastsea-blog)")
    parser.add_argument("--json-out", help="Write candidate missing entries JSON here")
    parser.add_argument("--merge-out", help="Write merged tools-list JSON here")
    parser.add_argument("--manifest-out", help="Write manifest preview JSON here")
    parser.add_argument("--landing-out", help="Write landing preview HTML here")
    parser.add_argument("--write-tools-list", action="store_true", help="Overwrite _data/tools-list.json with merged output")
    parser.add_argument("--write-manifest", action="store_true", help="Overwrite tools/manifest.json from filesystem truth")
    parser.add_argument("--write-landing-counts", action="store_true", help="Overwrite tools/index.html count claims to match filesystem truth")
    parser.add_argument("--write-all", action="store_true", help="Convenience flag for writing tools-list, manifest, and landing counts")
    parser.add_argument("--prune-extra", action="store_true", help="Drop tools-list rows whose slug no longer exists on disk")
    return parser.parse_args()


def normalize_space(value: Any) -> str:
    return re.sub(r"\s+", " ", "" if value is None else str(value)).strip()


def strip_tags(value: str) -> str:
    return normalize_space(re.sub(r"<[^>]+>", " ", value or ""))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def write_json(path_value: str | None, payload: Any) -> None:
    if not path_value:
        return
    path = Path(path_value)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_tools_list(path: Path) -> list[dict[str, Any]]:
    data = json.loads(read_text(path))
    if not isinstance(data, list):
        raise ValueError(f"tools-list root must be a JSON array: {path}")
    return [entry for entry in data if isinstance(entry, dict)]


def slug_from_url(url: Any) -> str | None:
    value = normalize_space(url)
    if not value:
        return None
    if value.startswith("/"):
        path = value
    else:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return None
        path = parsed.path or ""
    match = re.fullmatch(r"/tools/([^/]+)/?", path)
    return match.group(1) if match else None


def entry_slug(entry: dict[str, Any]) -> str | None:
    slug = normalize_space(entry.get("slug"))
    if slug:
        return slug.strip("/")
    return slug_from_url(entry.get("url"))


def list_filesystem_slugs(root: Path) -> list[str]:
    tools_dir = root / "tools"
    if not tools_dir.is_dir():
        raise FileNotFoundError(f"Missing tools directory: {tools_dir}")
    slugs = sorted(
        child.name
        for child in tools_dir.iterdir()
        if child.is_dir() and not child.name.startswith(".") and (child / "index.html").is_file()
    )
    if not slugs:
        raise FileNotFoundError(f"No tool pages found under: {tools_dir}")
    return slugs


def extract_meta(html: str, attr: str, value: str) -> str:
    patterns = [
        re.compile(rf'<meta[^>]*{attr}=["\']{re.escape(value)}["\'][^>]*content=["\']([^"\']*)["\'][^>]*>', re.I | re.S),
        re.compile(rf'<meta[^>]*content=["\']([^"\']*)["\'][^>]*{attr}=["\']{re.escape(value)}["\'][^>]*>', re.I | re.S),
    ]
    for pattern in patterns:
        match = pattern.search(html)
        if match:
            return html_unescape(match.group(1).strip())
    return ""


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    if match:
        title = strip_tags(html_unescape(match.group(1)))
        if title:
            return title
    for probe in (("property", "og:title"),):
        title = extract_meta(html, probe[0], probe[1])
        if title:
            return strip_tags(title)
    return ""


def slug_to_title(slug: str) -> str:
    preserve = {"json", "yaml", "html", "css", "csv", "url", "uuid", "seo", "api", "ui", "ux", "qr", "iban", "vat", "bmi", "jwt", "csv", "dns"}
    words: list[str] = []
    for token in slug.split("-"):
        if not token:
            continue
        token_lower = token.lower()
        if token_lower in preserve:
            words.append(token.upper())
        else:
            words.append(token.capitalize())
    return " ".join(words)


def looks_generic_title(title: str) -> bool:
    cleaned = normalize_space(title)
    if not cleaned:
        return True
    lowered = cleaned.casefold()
    return any(marker in lowered for marker in GENERIC_TITLE_MARKERS) or any(marker in cleaned for marker in PLACEHOLDER_MARKERS)


def sanitize_title(slug: str, title: str) -> str:
    cleaned = normalize_space(html_unescape(title))
    if not cleaned:
        return slug_to_title(slug)
    segments = [normalize_space(segment) for segment in TITLE_SPLIT_RE.split(cleaned) if normalize_space(segment)]
    for segment in segments:
        if not looks_generic_title(segment):
            return segment
    if not looks_generic_title(cleaned):
        return cleaned
    return slug_to_title(slug)


def is_suspicious_description(slug: str, description: str) -> bool:
    if not description:
        return False
    if description in GENERIC_DESCRIPTION_MARKERS:
        return True
    if description in SUSPICIOUS_DESCRIPTION_BY_SLUG.get(slug, set()):
        return True
    lowered = description.casefold()
    if any(marker in description for marker in PLACEHOLDER_MARKERS):
        return True
    if slug and any(token in slug for token in ("seo", "meta")) and any(token in lowered for token in ("rpg", "idle", "소환", "전투", "플레이")):
        return True
    return False


def sanitize_description(slug: str, description: str) -> str:
    cleaned = normalize_space(html_unescape(description))
    if not cleaned:
        return ""
    for pattern in FREE_TOOL_SUFFIX_PATTERNS:
        cleaned = normalize_space(pattern.sub("", cleaned))
    cleaned = cleaned.strip(" -|·")
    if not cleaned or is_suspicious_description(slug, cleaned):
        return ""
    return cleaned


def fallback_description(slug: str, title: str) -> str:
    display = normalize_space(title).rstrip(".") or slug_to_title(slug)
    lower = slug.casefold()
    if "calculator" in lower or any(token in lower for token in ("roi", "profit", "fee", "revenue", "margin", "pricing", "payback", "forecast", "simulator", "estimator")):
        return f"Use {display} in your browser to estimate outcomes quickly with no signup required."
    if any(token in lower for token in ("converter", "formatter", "encoder", "decoder", "parser", "transform")):
        return f"Use {display} in your browser to convert and format values quickly."
    if any(token in lower for token in ("generator", "builder", "maker", "composer")):
        return f"Use {display} in your browser to generate results instantly with no signup required."
    if any(token in lower for token in ("checker", "analyzer", "validator", "tester", "inspector", "auditor")):
        return f"Use {display} in your browser to check results quickly with no signup required."
    return f"Use {display} in your browser with no signup required."


def infer_category(slug: str, title: str, description: str) -> str:
    haystack = f"{slug} {title} {description}".lower()
    if any(token in haystack for token in ("json", "yaml", "api", "regex", "uuid", "http", "jwt", "base64", "developer", "code", "curl", "cron", "email auth", "spf", "dmarc")):
        return "developer"
    if any(token in haystack for token in ("seo", "keyword", "meta tag", "marketing", "adsense", "rpm", "campaign", "ctr", "conversion")):
        return "marketing"
    if any(token in haystack for token in ("substack", "patreon", "gumroad", "creator", "newsletter", "membership", "royalty", "pod", "onlyfans")):
        return "creator-income"
    if any(token in haystack for token in ("finance", "tax", "loan", "mortgage", "interest", "cash", "debt", "budget", "revenue", "profit", "fee", "pricing", "salary", "vesting")):
        return "finance"
    if any(token in haystack for token in ("color", "image", "svg", "gradient", "favicon", "palette", "design", "crop", "resize", "icon")):
        return "design"
    if "calculator" in haystack:
        return "calculator"
    return ""


def infer_tags(slug: str, title: str, description: str) -> str:
    stop = {"free", "online", "tool", "tools", "with", "from", "your", "this", "that", "and", "for", "the", "browser", "eastsea", "monster", "use", "instantly", "quickly", "results", "required", "in", "to", "no", "signup"}
    tokens = re.split(r"[^a-z0-9+]+", f"{slug} {title} {description}".lower())
    tags: list[str] = []
    for token in tokens:
        if len(token) < 2 or token in stop:
            continue
        if token not in tags:
            tags.append(token)
        if len(tags) >= 8:
            break
    return ",".join(tags)


def normalize_tags(value: Any) -> str:
    if isinstance(value, list):
        raw_tokens = [normalize_space(item) for item in value]
    else:
        raw_tokens = [normalize_space(item) for item in str(value or "").split(",")]
    tokens: list[str] = []
    for token in raw_tokens:
        if token and token not in tokens:
            tokens.append(token)
    return ",".join(tokens)


def build_candidate_entry(root: Path, slug: str) -> dict[str, Any]:
    html = read_text(root / "tools" / slug / "index.html")
    title = sanitize_title(slug, extract_title(html))
    raw_description = extract_meta(html, "name", "description") or extract_meta(html, "property", "og:description")
    description = sanitize_description(slug, raw_description) or fallback_description(slug, title)
    category = infer_category(slug, title, description)
    tags = infer_tags(slug, title, description)

    entry: dict[str, Any] = {
        "slug": slug,
        "title": title,
        "url": f"/tools/{slug}/",
        "description": description,
        "category": category,
        "tags": tags,
    }
    return entry


def choose_title(existing: dict[str, Any] | None, candidate: dict[str, Any]) -> str:
    if not existing:
        return candidate["title"]
    raw = normalize_space(existing.get("title"))
    cleaned = sanitize_title(candidate["slug"], raw) if raw else ""
    if cleaned and (cleaned != slug_to_title(candidate["slug"]) or candidate["title"] == slug_to_title(candidate["slug"])):
        return cleaned
    return candidate["title"]


def choose_description(existing: dict[str, Any] | None, candidate: dict[str, Any]) -> str:
    if existing:
        cleaned = sanitize_description(candidate["slug"], normalize_space(existing.get("description")))
        if cleaned:
            return cleaned
    candidate_description = sanitize_description(candidate["slug"], candidate.get("description", ""))
    if candidate_description:
        return candidate_description
    return fallback_description(candidate["slug"], candidate["title"])


def merge_entry(existing: dict[str, Any] | None, candidate: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = dict(existing or {})
    merged["slug"] = candidate["slug"]
    merged["url"] = candidate["url"]
    merged["title"] = choose_title(existing, candidate)
    merged["description"] = choose_description(existing, candidate)
    merged["category"] = normalize_space((existing or {}).get("category")) or candidate["category"]
    merged["tags"] = normalize_tags((existing or {}).get("tags")) or candidate["tags"]
    return merged


def entry_changed(existing: dict[str, Any], merged: dict[str, Any]) -> bool:
    keys = {"slug", "url", "title", "description", "category", "tags"}
    for key in keys:
        before = normalize_space(existing.get(key)) if key != "tags" else normalize_tags(existing.get(key))
        after = normalize_space(merged.get(key)) if key != "tags" else normalize_tags(merged.get(key))
        if before != after:
            return True
    return False


def directory_size(path: Path) -> int:
    size = 0
    for child in path.rglob("*"):
        if child.is_file():
            try:
                size += child.stat().st_size
            except OSError:
                continue
    return size


def build_manifest(root: Path, filesystem_slugs: list[str]) -> dict[str, Any]:
    tools_dir = root / "tools"
    items: list[dict[str, Any]] = []
    for slug in filesystem_slugs:
        html = read_text(tools_dir / slug / "index.html")
        items.append(
            {
                "slug": slug,
                "title": sanitize_title(slug, extract_title(html)),
                "url": f"/tools/{slug}/",
                "size": directory_size(tools_dir / slug),
            }
        )
    return {
        "tools": items,
        "count": len(items),
        "updatedAt": datetime.now(KST).strftime("%Y-%m-%dT%H:%M:%S+09:00"),
    }


def sync_landing_counts(html: str, count: int) -> str:
    updated = html
    replacement = str(count)
    for pattern in COUNT_SYNC_PATTERNS:
        updated = pattern.sub(replacement, updated)
    updated = NUMBER_OF_ITEMS_RE.sub(rf"\g<1>{count}", updated)
    return updated


def build_report(root: Path, prune_extra: bool = False) -> Report:
    tools_list_path = root / "_data" / "tools-list.json"
    landing_path = root / "tools" / "index.html"

    existing_entries = load_tools_list(tools_list_path)
    filesystem_slugs = list_filesystem_slugs(root)
    filesystem_set = set(filesystem_slugs)

    existing_map: dict[str, dict[str, Any]] = {}
    existing_slugs: list[str] = []
    for entry in existing_entries:
        slug = entry_slug(entry)
        if not slug:
            continue
        existing_slugs.append(slug)
        existing_map.setdefault(slug, entry)

    existing_set = set(existing_slugs)
    missing_slugs = sorted(filesystem_set - existing_set)
    extra_slugs = sorted(existing_set - filesystem_set)

    candidate_entries: list[dict[str, Any]] = []
    repaired_slugs: list[str] = []
    merged_entries: list[dict[str, Any]] = []

    for slug in filesystem_slugs:
        candidate = build_candidate_entry(root, slug)
        existing = existing_map.get(slug)
        merged = merge_entry(existing, candidate)
        merged_entries.append(merged)
        if slug not in existing_set:
            candidate_entries.append(candidate)
        elif existing and entry_changed(existing, merged):
            repaired_slugs.append(slug)

    if not prune_extra:
        for slug in extra_slugs:
            merged_entries.append(dict(existing_map[slug]))

    merged_entries.sort(key=lambda entry: entry_slug(entry) or normalize_space(entry.get("title")))

    landing_before = read_text(landing_path)
    landing_after = sync_landing_counts(landing_before, len(filesystem_slugs))

    return Report(
        root=root,
        filesystem_slugs=filesystem_slugs,
        existing_entries=existing_entries,
        existing_slugs=existing_slugs,
        missing_slugs=missing_slugs,
        extra_slugs=extra_slugs,
        candidate_entries=candidate_entries,
        repaired_slugs=sorted(repaired_slugs),
        merged_entries=merged_entries,
        manifest=build_manifest(root, filesystem_slugs),
        landing_before=landing_before,
        landing_after=landing_after,
    )


def render_summary(
    report: Report,
    *,
    wrote_tools_list: bool,
    wrote_manifest: bool,
    wrote_landing: bool,
    prune_extra: bool,
) -> str:
    sample_missing = ", ".join(report.missing_slugs[:5]) if report.missing_slugs else "none"
    sample_extra = ", ".join(report.extra_slugs[:5]) if report.extra_slugs else "none"
    sample_repaired = ", ".join(report.repaired_slugs[:5]) if report.repaired_slugs else "none"
    return "\n".join(
        [
            f"tool-catalog-reconciler root={report.root.resolve()}",
            f"filesystem={len(report.filesystem_slugs)} toolsListBefore={len(report.existing_entries)} toolsListAfter={len(report.merged_entries)} manifest={report.manifest['count']}",
            f"missingEntries={len(report.missing_slugs)} sampleMissing={sample_missing}",
            f"extraEntries={len(report.extra_slugs)} sampleExtra={sample_extra} pruneExtra={'yes' if prune_extra else 'no'}",
            f"repairedEntries={len(report.repaired_slugs)} sampleRepaired={sample_repaired}",
            f"landingCountUpdated={'yes' if report.landing_changed else 'no'}",
            f"wroteToolsList={'yes' if wrote_tools_list else 'no'} wroteManifest={'yes' if wrote_manifest else 'no'} wroteLanding={'yes' if wrote_landing else 'no'}",
        ]
    )


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    write_tools_list = args.write_tools_list or args.write_all
    write_manifest = args.write_manifest or args.write_all
    write_landing = args.write_landing_counts or args.write_all

    try:
        report = build_report(root, prune_extra=args.prune_extra)
    except Exception as exc:  # pragma: no cover - CLI guard
        print(f"tool-catalog-reconciler error: {exc}", file=sys.stderr)
        return 1

    write_json(args.json_out, report.candidate_entries)
    write_json(args.merge_out, report.merged_entries)
    write_json(args.manifest_out, report.manifest)
    if args.landing_out:
        write_text(Path(args.landing_out), report.landing_after)

    if write_tools_list:
        write_text(root / "_data" / "tools-list.json", json.dumps(report.merged_entries, ensure_ascii=False, indent=2) + "\n")
    if write_manifest:
        write_text(root / "tools" / "manifest.json", json.dumps(report.manifest, ensure_ascii=False, indent=2) + "\n")
    if write_landing:
        write_text(root / "tools" / "index.html", report.landing_after)

    print(
        render_summary(
            report,
            wrote_tools_list=write_tools_list,
            wrote_manifest=write_manifest,
            wrote_landing=write_landing,
            prune_extra=args.prune_extra,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
