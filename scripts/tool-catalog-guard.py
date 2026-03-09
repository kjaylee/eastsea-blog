#!/usr/bin/env python3
"""Read-only audit guard for eastsea-blog tool catalog drift."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ISSUE_ORDER = [
    "manifest_missing_file",
    "manifest_parse_error",
    "manifest_missing_tools_array",
    "manifest_missing_declared_count",
    "manifest_entry_count_mismatch",
    "manifest_declared_count_mismatch",
    "manifest_slug_mismatch",
    "manifest_url_mismatch",
    "tools_list_missing_file",
    "tools_list_parse_error",
    "tools_list_not_array",
    "tools_list_missing_entries",
    "tools_list_extra_entries",
    "tools_list_duplicate_entries",
    "tools_list_malformed_url",
    "tools_list_blank_description",
    "tools_list_generic_title",
    "tools_list_placeholder_text",
    "tools_list_suspicious_description",
    "landing_missing_title",
    "landing_missing_meta_description",
    "landing_stale_count_claims",
    "landing_structured_data_mismatch",
    "tool_missing_title",
    "tool_missing_meta_description",
    "tool_missing_analytics_include",
]

ISSUE_META = {
    "manifest_missing_file": {
        "severity": "error",
        "summary": "Required manifest file is missing.",
    },
    "manifest_parse_error": {
        "severity": "error",
        "summary": "Manifest JSON could not be parsed.",
    },
    "manifest_missing_tools_array": {
        "severity": "error",
        "summary": "Manifest is missing a top-level tools array.",
    },
    "manifest_missing_declared_count": {
        "severity": "error",
        "summary": "Manifest is missing a numeric declared count.",
    },
    "manifest_entry_count_mismatch": {
        "severity": "error",
        "summary": "Manifest entry count does not match filesystem tool count.",
    },
    "manifest_declared_count_mismatch": {
        "severity": "error",
        "summary": "Manifest declared count does not match manifest entry count.",
    },
    "manifest_slug_mismatch": {
        "severity": "error",
        "summary": "Manifest slug set differs from the filesystem truth set.",
    },
    "manifest_url_mismatch": {
        "severity": "warn",
        "summary": "Manifest entry URL is not the canonical /tools/<slug>/ form.",
    },
    "tools_list_missing_file": {
        "severity": "error",
        "summary": "Required _data/tools-list.json file is missing.",
    },
    "tools_list_parse_error": {
        "severity": "error",
        "summary": "Tools list JSON could not be parsed.",
    },
    "tools_list_not_array": {
        "severity": "error",
        "summary": "Tools list root value is not an array.",
    },
    "tools_list_missing_entries": {
        "severity": "error",
        "summary": "Filesystem tools are absent from _data/tools-list.json.",
    },
    "tools_list_extra_entries": {
        "severity": "warn",
        "summary": "Tools list contains slugs that do not exist on disk.",
    },
    "tools_list_duplicate_entries": {
        "severity": "error",
        "summary": "Tools list contains duplicate normalized slugs.",
    },
    "tools_list_malformed_url": {
        "severity": "error",
        "summary": "Tools list entries contain malformed or non-normalizable URLs.",
    },
    "tools_list_blank_description": {
        "severity": "warn",
        "summary": "Tools list entries have blank descriptions.",
    },
    "tools_list_generic_title": {
        "severity": "warn",
        "summary": "Tools list titles still use generic or stale title markers.",
    },
    "tools_list_placeholder_text": {
        "severity": "warn",
        "summary": "Tools list title/description contains obvious template placeholders.",
    },
    "tools_list_suspicious_description": {
        "severity": "warn",
        "summary": "Tools list description looks wrong, stale, or category-mismatched.",
    },
    "landing_missing_title": {
        "severity": "warn",
        "summary": "Landing page lacks a non-empty <title>.",
    },
    "landing_missing_meta_description": {
        "severity": "warn",
        "summary": "Landing page lacks a non-empty meta description.",
    },
    "landing_stale_count_claims": {
        "severity": "warn",
        "summary": "Landing page public count copy undersells the filesystem corpus.",
    },
    "landing_structured_data_mismatch": {
        "severity": "warn",
        "summary": "Landing page JSON-LD numberOfItems undersells the filesystem corpus.",
    },
    "tool_missing_title": {
        "severity": "warn",
        "summary": "Tool page lacks a non-empty <title>.",
    },
    "tool_missing_meta_description": {
        "severity": "warn",
        "summary": "Tool page lacks a non-empty meta description.",
    },
    "tool_missing_analytics_include": {
        "severity": "warn",
        "summary": "Tool page is missing the /assets/analytics.js include.",
    },
}

GENERIC_TITLE_MARKERS = (
    "웹 도구 모음",
    "eastsea tools",
    "tools.eastsea.xyz",
)
PLACEHOLDER_MARKERS = ("${", "{{", "%%")
GLOBAL_SUSPICIOUS_DESCRIPTIONS = {
    "A collection of free, fast browser tools for developers and creators.",
}
SLUG_SUSPICIOUS_DESCRIPTIONS = {
    "seo-meta-checker": {
        "소환과 성장, 자동 전투를 결합한 방치형 RPG. 브라우저에서 바로 플레이하세요.",
    },
}
COUNT_PATTERNS = (
    re.compile(r"(\d+)\+?\s*(?:개(?:\s*이상)?\s*(?:의\s*)?)?(?:무료\s*)?(?:온라인\s*)?(?:웹\s*)?도구(?:\s*모음)?", re.I),
    re.compile(r"(\d+)\+?\s*free(?:\s+[a-z-]+){0,4}\s+tools?(?:\s+[a-z-]+)?", re.I),
    re.compile(r"(\d+)\+?\s+tools?", re.I),
)
SEVERITY_ORDER = {"ok": 0, "warn": 1, "error": 2}


class AuditFatal(Exception):
    """Fatal invocation/read/parse/schema failure."""

    def __init__(self, issue_key: str, message: str):
        super().__init__(message)
        self.issue_key = issue_key
        self.message = message


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit tool catalog integrity and metadata completeness.")
    parser.add_argument("--root", required=True, help="Repo root to audit")
    parser.add_argument("--json-out", help="Optional path to write JSON report")
    parser.add_argument("--md-out", help="Optional path to write Markdown report")
    parser.add_argument("--fail-on", choices=("none", "warn", "error"), default="error")
    parser.add_argument("--max-examples", type=int, default=20, help="Maximum examples per issue type")
    args = parser.parse_args()
    if args.max_examples < 1:
        raise SystemExit("--max-examples must be >= 1")
    return args


def normalize_space(value: Any) -> str:
    return re.sub(r"\s+", " ", "" if value is None else str(value)).strip()


def strip_tags(value: str) -> str:
    return normalize_space(re.sub(r"<[^>]+>", " ", value or ""))


def read_text(path: Path, missing_issue_key: str | None = None) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError as exc:
        key = missing_issue_key or "manifest_missing_file"
        raise AuditFatal(key, f"Required file missing: {path}") from exc
    except OSError as exc:
        key = missing_issue_key or "manifest_missing_file"
        raise AuditFatal(key, f"Required file unreadable: {path} ({exc})") from exc


def load_json(path: Path, *, missing_key: str, parse_key: str) -> Any:
    text = read_text(path, missing_issue_key=missing_key)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise AuditFatal(parse_key, f"Failed to parse JSON at {path}: {exc}") from exc


def normalize_slug(value: Any) -> str | None:
    slug = normalize_space(value)
    if not slug:
        return None
    if "/" in slug or slug in {".", ".."}:
        return None
    return slug.strip("/")


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


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return strip_tags(match.group(1)) if match else ""


def parse_meta_tags(html: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for match in re.finditer(r"<meta\b([^>]+)>", html, re.I | re.S):
        attrs = {
            key.lower(): normalize_space(value)
            for key, _, value in re.findall(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", match.group(1), re.S)
        }
        content = normalize_space(attrs.get("content"))
        if not content:
            continue
        for probe in (attrs.get("name"), attrs.get("property")):
            if probe:
                result.setdefault(probe.lower(), content)
    return result


def strip_nonvisible_html(html: str) -> str:
    text = re.sub(r"<script\b.*?</script>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<style\b.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<noscript\b.*?</noscript>", " ", text, flags=re.I | re.S)
    return strip_tags(text)


def extract_count_claims(text: str) -> list[int]:
    counts: list[int] = []
    for pattern in COUNT_PATTERNS:
        for match in pattern.finditer(text or ""):
            value = int(match.group(1))
            if value not in counts:
                counts.append(value)
    return counts


def canonical_json_value(value: Any) -> str:
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return str(value)


def sort_examples(values: list[Any]) -> list[Any]:
    return sorted(values, key=canonical_json_value)


def dedupe_examples(values: list[Any], limit: int) -> list[Any]:
    seen: set[str] = set()
    result: list[Any] = []
    for value in sort_examples(values):
        marker = canonical_json_value(value)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(value)
        if len(result) >= limit:
            break
    return result


def issue_bucket(max_examples: int) -> dict[str, dict[str, Any]]:
    return {
        key: {
            "severity": ISSUE_META[key]["severity"],
            "count": 0,
            "examples": [],
            "_all": [],
        }
        for key in ISSUE_ORDER
    }


def set_issue(bucket: dict[str, dict[str, Any]], key: str, examples: list[Any]) -> None:
    sorted_examples = sort_examples(examples)
    bucket[key]["count"] = len(sorted_examples)
    bucket[key]["_all"] = sorted_examples


def finalize_issues(bucket: dict[str, dict[str, Any]], limit: int) -> dict[str, dict[str, Any]]:
    issues: dict[str, dict[str, Any]] = {}
    for key in ISSUE_ORDER:
        issues[key] = {
            "severity": bucket[key]["severity"],
            "count": bucket[key]["count"],
            "examples": dedupe_examples(bucket[key]["_all"], limit),
        }
    return issues


def fail_status(issues: dict[str, dict[str, Any]]) -> str:
    status = "ok"
    for key in ISSUE_ORDER:
        issue = issues[key]
        if issue["count"] > 0 and SEVERITY_ORDER[issue["severity"]] > SEVERITY_ORDER[status]:
            status = issue["severity"]
    return status


def should_fail(issues: dict[str, dict[str, Any]], fail_on: str) -> bool:
    if fail_on == "none":
        return False
    if fail_on == "warn":
        return any(issue["count"] > 0 for issue in issues.values())
    return any(issue["severity"] == "error" and issue["count"] > 0 for issue in issues.values())


def is_suspicious_description(slug: str | None, description: str) -> bool:
    if not description:
        return False
    if description in GLOBAL_SUSPICIOUS_DESCRIPTIONS:
        return True
    if slug and description in SLUG_SUSPICIOUS_DESCRIPTIONS.get(slug, set()):
        return True
    lowered = description.casefold()
    if slug and any(token in slug for token in ("seo", "meta")) and any(token in lowered for token in ("rpg", "idle", "소환", "전투", "플레이")):
        return True
    return False


def entry_slug_and_url_status(entry: dict[str, Any]) -> tuple[str | None, bool]:
    explicit_slug = normalize_slug(entry.get("slug"))
    url = normalize_space(entry.get("url"))
    url_slug = slug_from_url(url) if url else None
    malformed_url = bool(url) and url_slug is None
    slug = explicit_slug or url_slug
    return slug, malformed_url


def require_tool_filesystem(root: Path) -> list[str]:
    tools_dir = root / "tools"
    if not tools_dir.is_dir():
        raise AuditFatal("manifest_missing_file", f"Required directory missing: {tools_dir}")
    slugs = sorted(
        child.name
        for child in tools_dir.iterdir()
        if child.is_dir() and (child / "index.html").is_file()
    )
    if not slugs:
        raise AuditFatal("manifest_missing_file", f"No tool pages found under: {tools_dir}")
    return slugs


def audit(root: Path, fail_on: str, max_examples: int) -> dict[str, Any]:
    filesystem_slugs = require_tool_filesystem(root)
    filesystem_set = set(filesystem_slugs)
    tools_dir = root / "tools"
    manifest_path = tools_dir / "manifest.json"
    tools_list_path = root / "_data" / "tools-list.json"
    landing_path = tools_dir / "index.html"
    issues_raw = issue_bucket(max_examples)

    manifest = load_json(manifest_path, missing_key="manifest_missing_file", parse_key="manifest_parse_error")
    if not isinstance(manifest, dict):
        raise AuditFatal("manifest_parse_error", f"Manifest must be a JSON object: {manifest_path}")
    manifest_entries = manifest.get("tools")
    if not isinstance(manifest_entries, list):
        raise AuditFatal("manifest_missing_tools_array", f"Manifest is missing a top-level tools array: {manifest_path}")
    manifest_declared_count = manifest.get("count")
    if not isinstance(manifest_declared_count, int):
        raise AuditFatal("manifest_missing_declared_count", f"Manifest count must be a numeric integer: {manifest_path}")

    tools_list = load_json(tools_list_path, missing_key="tools_list_missing_file", parse_key="tools_list_parse_error")
    if not isinstance(tools_list, list):
        raise AuditFatal("tools_list_not_array", f"Tools list must be a top-level JSON array: {tools_list_path}")

    landing_html = read_text(landing_path, missing_issue_key="manifest_missing_file")

    manifest_normalized_slugs: list[str] = []
    manifest_url_mismatch: list[str] = []
    for idx, item in enumerate(manifest_entries):
        if not isinstance(item, dict):
            manifest_url_mismatch.append(f"index:{idx} invalid-manifest-entry")
            continue
        slug = normalize_slug(item.get("slug"))
        if slug:
            manifest_normalized_slugs.append(slug)
        else:
            manifest_url_mismatch.append(f"index:{idx} missing-slug")
            continue
        expected_url = f"/tools/{slug}/"
        actual_url = normalize_space(item.get("url"))
        if actual_url != expected_url:
            manifest_url_mismatch.append(f"{slug} :: {actual_url or '<missing>'} :: expected {expected_url}")

    manifest_set = set(manifest_normalized_slugs)
    manifest_slug_examples = [
        *[f"missing-in-manifest:{slug}" for slug in sorted(filesystem_set - manifest_set)],
        *[f"extra-in-manifest:{slug}" for slug in sorted(manifest_set - filesystem_set)],
    ]
    set_issue(
        issues_raw,
        "manifest_entry_count_mismatch",
        [f"filesystem={len(filesystem_slugs)} manifestEntries={len(manifest_entries)}"] if len(manifest_entries) != len(filesystem_slugs) else [],
    )
    set_issue(
        issues_raw,
        "manifest_declared_count_mismatch",
        [f"manifest.count={manifest_declared_count} manifestEntries={len(manifest_entries)}"] if manifest_declared_count != len(manifest_entries) else [],
    )
    set_issue(issues_raw, "manifest_slug_mismatch", manifest_slug_examples)
    set_issue(issues_raw, "manifest_url_mismatch", manifest_url_mismatch)

    normalized_tools_list_slugs: list[str] = []
    malformed_urls: list[str] = []
    blank_descriptions: list[str] = []
    generic_titles: list[str] = []
    placeholder_text: list[str] = []
    suspicious_descriptions: list[dict[str, str]] = []

    for idx, entry in enumerate(tools_list):
        if not isinstance(entry, dict):
            malformed_urls.append(f"index:{idx} non-object-entry")
            continue
        slug, malformed_url = entry_slug_and_url_status(entry)
        title = normalize_space(entry.get("title"))
        description = normalize_space(entry.get("description"))
        url = normalize_space(entry.get("url"))
        label = slug or url or title or f"index:{idx}"

        if malformed_url or (slug is None and not url):
            malformed_urls.append(label)
        if slug:
            normalized_tools_list_slugs.append(slug)
        if not description:
            blank_descriptions.append(label)
        if title and any(marker in title.casefold() for marker in GENERIC_TITLE_MARKERS):
            generic_titles.append(label)
        combined_text = f"{title}\n{description}"
        if any(marker in combined_text for marker in PLACEHOLDER_MARKERS):
            placeholder_text.append(label)
        if is_suspicious_description(slug, description):
            suspicious_descriptions.append({"slug": label, "description": description})

    tools_list_counter = Counter(normalized_tools_list_slugs)
    tools_list_slug_set = set(normalized_tools_list_slugs)
    duplicate_entries = [f"{slug} x{count}" for slug, count in sorted(tools_list_counter.items()) if count > 1]
    missing_entries = sorted(filesystem_set - tools_list_slug_set)
    extra_entries = sorted(tools_list_slug_set - filesystem_set)

    set_issue(issues_raw, "tools_list_missing_entries", missing_entries)
    set_issue(issues_raw, "tools_list_extra_entries", extra_entries)
    set_issue(issues_raw, "tools_list_duplicate_entries", duplicate_entries)
    set_issue(issues_raw, "tools_list_malformed_url", malformed_urls)
    set_issue(issues_raw, "tools_list_blank_description", blank_descriptions)
    set_issue(issues_raw, "tools_list_generic_title", generic_titles)
    set_issue(issues_raw, "tools_list_placeholder_text", placeholder_text)
    set_issue(issues_raw, "tools_list_suspicious_description", suspicious_descriptions)

    landing_title = extract_title(landing_html)
    landing_meta = parse_meta_tags(landing_html)
    landing_public_claims: list[dict[str, Any]] = []
    claim_sources = {
        "title": landing_title,
        "meta:description": landing_meta.get("description", ""),
        "og:title": landing_meta.get("og:title", ""),
        "og:description": landing_meta.get("og:description", ""),
        "twitter:title": landing_meta.get("twitter:title", ""),
        "twitter:description": landing_meta.get("twitter:description", ""),
        "body": strip_nonvisible_html(landing_html),
    }
    for source, text in claim_sources.items():
        for count in extract_count_claims(text):
            if count < len(filesystem_slugs):
                landing_public_claims.append({"source": source, "count": count, "text": normalize_space(text)[:160]})

    structured_counts = [
        int(match.group(1))
        for match in re.finditer(r'"numberOfItems"\s*:\s*"?(\d+)"?', landing_html, re.I)
    ]
    structured_issue_examples = [
        {"count": count, "field": "numberOfItems"}
        for count in sorted(set(structured_counts))
        if count < len(filesystem_slugs)
    ]

    set_issue(issues_raw, "landing_missing_title", [str(landing_path)] if not landing_title else [])
    set_issue(
        issues_raw,
        "landing_missing_meta_description",
        [str(landing_path)] if not landing_meta.get("description") else [],
    )
    set_issue(issues_raw, "landing_stale_count_claims", landing_public_claims)
    set_issue(issues_raw, "landing_structured_data_mismatch", structured_issue_examples)

    missing_titles: list[str] = []
    missing_meta_descriptions: list[str] = []
    missing_analytics: list[str] = []
    for slug in filesystem_slugs:
        tool_html = read_text(tools_dir / slug / "index.html", missing_issue_key="manifest_missing_file")
        tool_title = extract_title(tool_html)
        tool_meta = parse_meta_tags(tool_html)
        if not tool_title:
            missing_titles.append(slug)
        if not tool_meta.get("description"):
            missing_meta_descriptions.append(slug)
        if "/assets/analytics.js" not in tool_html:
            missing_analytics.append(slug)

    set_issue(issues_raw, "tool_missing_title", missing_titles)
    set_issue(issues_raw, "tool_missing_meta_description", missing_meta_descriptions)
    set_issue(issues_raw, "tool_missing_analytics_include", missing_analytics)

    issues = finalize_issues(issues_raw, max_examples)
    status = fail_status(issues)
    error_issue_types = sum(1 for issue in issues.values() if issue["severity"] == "error" and issue["count"] > 0)
    warn_issue_types = sum(1 for issue in issues.values() if issue["severity"] == "warn" and issue["count"] > 0)
    error_item_count = sum(issue["count"] for issue in issues.values() if issue["severity"] == "error")
    warn_item_count = sum(issue["count"] for issue in issues.values() if issue["severity"] == "warn")
    landing_claim_min = min((item["count"] for item in issues_raw["landing_stale_count_claims"]["_all"]), default=0)
    landing_structured_data_count = min(structured_counts) if structured_counts else 0

    return {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "root": str(root.resolve()),
        "failOn": fail_on,
        "status": status,
        "counts": {
            "filesystem": len(filesystem_slugs),
            "manifestEntries": len(manifest_entries),
            "manifestDeclaredCount": manifest_declared_count,
            "toolsListEntries": len(tools_list),
            "landingClaimMin": landing_claim_min,
            "landingStructuredDataCount": landing_structured_data_count,
        },
        "summary": {
            "errorIssueTypes": error_issue_types,
            "warnIssueTypes": warn_issue_types,
            "errorItemCount": error_item_count,
            "warnItemCount": warn_item_count,
        },
        "issues": issues,
    }


def render_terminal_summary(report: dict[str, Any]) -> str:
    counts = report["counts"]
    summary = report["summary"]
    lines = [
        (
            f"tool-catalog-guard status={report['status']} failOn={report['failOn']} "
            f"root={report['root']}"
        ),
        (
            "counts "
            f"filesystem={counts['filesystem']} "
            f"manifestEntries={counts['manifestEntries']} "
            f"manifestDeclaredCount={counts['manifestDeclaredCount']} "
            f"toolsListEntries={counts['toolsListEntries']} "
            f"landingClaimMin={counts['landingClaimMin']} "
            f"landingStructuredDataCount={counts['landingStructuredDataCount']}"
        ),
        (
            "summary "
            f"errorIssueTypes={summary['errorIssueTypes']} "
            f"warnIssueTypes={summary['warnIssueTypes']} "
            f"errorItemCount={summary['errorItemCount']} "
            f"warnItemCount={summary['warnItemCount']}"
        ),
    ]
    for key in ISSUE_ORDER:
        issue = report["issues"][key]
        if issue["count"] <= 0:
            continue
        example_text = ", ".join(canonical_json_value(example) for example in issue["examples"][:3])
        suffix = f" examples={example_text}" if example_text else ""
        lines.append(f"- {issue['severity']} {key} count={issue['count']}{suffix}")
    return "\n".join(lines)


def render_markdown(report: dict[str, Any]) -> str:
    counts = report["counts"]
    summary = report["summary"]
    issues = report["issues"]
    lines = [
        "# Tool Catalog Guard Report",
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        f"Audited root: `{report['root']}`",
        "",
        f"Overall status: **{report['status']}**",
        "",
        f"Fail threshold: `{report['failOn']}`",
        "",
        "## Counts",
        "",
        "| Metric | Value |",
        "| --- | ---: |",
        f"| filesystem | {counts['filesystem']} |",
        f"| manifestEntries | {counts['manifestEntries']} |",
        f"| manifestDeclaredCount | {counts['manifestDeclaredCount']} |",
        f"| toolsListEntries | {counts['toolsListEntries']} |",
        f"| landingClaimMin | {counts['landingClaimMin']} |",
        f"| landingStructuredDataCount | {counts['landingStructuredDataCount']} |",
        "",
        "## Issue Summary",
        "",
        "| Severity | Non-zero issue types | Total items |",
        "| --- | ---: | ---: |",
        f"| error | {summary['errorIssueTypes']} | {summary['errorItemCount']} |",
        f"| warn | {summary['warnIssueTypes']} | {summary['warnItemCount']} |",
        "",
    ]

    for key in ISSUE_ORDER:
        issue = issues[key]
        if issue["count"] <= 0:
            continue
        lines.extend(
            [
                f"## {key}",
                "",
                f"- Severity: `{issue['severity']}`",
                f"- Count: **{issue['count']}**",
                f"- Summary: {ISSUE_META[key]['summary']}",
            ]
        )
        if issue["examples"]:
            lines.append("- Examples:")
            for example in issue["examples"]:
                lines.append(f"  - `{canonical_json_value(example)}`")
        lines.append("")

    next_actions: list[str] = []
    if issues["tools_list_missing_entries"]["count"]:
        next_actions.append("Backfill _data/tools-list.json so every filesystem tool slug is discoverable exactly once.")
    if issues["manifest_declared_count_mismatch"]["count"] or issues["manifest_entry_count_mismatch"]["count"]:
        next_actions.append("Regenerate or repair tools/manifest.json so entry count and declared count match the filesystem truth set.")
    if issues["landing_stale_count_claims"]["count"] or issues["landing_structured_data_mismatch"]["count"]:
        next_actions.append("Refresh landing page public counts and JSON-LD numberOfItems to stop underselling the current corpus.")
    if issues["tool_missing_meta_description"]["count"]:
        next_actions.append("Patch missing per-tool meta descriptions in batches; this is the largest page-level SEO debt bucket.")
    if issues["tool_missing_analytics_include"]["count"]:
        next_actions.append("Restore /assets/analytics.js on the affected tool pages before the next publish cycle.")
    if issues["tools_list_placeholder_text"]["count"] or issues["tools_list_suspicious_description"]["count"]:
        next_actions.append("Repair placeholder and obviously wrong catalog copy before using tools-list.json as a discovery source.")
    if not next_actions:
        next_actions.append("No repair actions recommended. The catalog is clean at the selected threshold.")

    lines.extend(["## Recommended next actions", "", *[f"- {item}" for item in next_actions], ""])
    return "\n".join(lines)


def write_if_requested(path_value: str | None, content: str) -> None:
    if not path_value:
        return
    path = Path(path_value)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        report = audit(Path(args.root), fail_on=args.fail_on, max_examples=args.max_examples)
    except AuditFatal as exc:
        print(f"tool-catalog-guard fatal [{exc.issue_key}]: {exc.message}", file=sys.stderr)
        return 2

    json_text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    markdown_text = render_markdown(report)
    write_if_requested(args.json_out, json_text)
    write_if_requested(args.md_out, markdown_text)
    print(render_terminal_summary(report))
    return 1 if should_fail(report["issues"], args.fail_on) else 0


if __name__ == "__main__":
    sys.exit(main())
