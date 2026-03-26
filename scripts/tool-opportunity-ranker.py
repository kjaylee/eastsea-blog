#!/usr/bin/env python3
"""Rank next-shippable tool opportunities from the existing eastsea-blog corpus."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

KEYWORD_WEIGHTS = {
    "fee": 22,
    "profit": 18,
    "revenue": 16,
    "roi": 16,
    "pricing": 9,
    "price": 7,
    "subscription": 9,
    "checkout": 7,
    "affiliate": 7,
    "payout": 10,
    "seller": 6,
    "marketplace": 5,
    "adsense": 6,
    "ad": 4,
    "iap": 8,
    "fba": 8,
    "play": 4,
    "shop": 4,
    "saas": 6,
    "retention": 6,
    "conversion": 6,
    "churn": 6,
    "paywall": 6,
}
MAX_BUSINESS_SCORE = 60

INLINE_SCRIPT_THRESHOLD = 600


@dataclass
class ToolOpportunity:
    slug: str
    score: int
    businessScore: int
    exposureScore: int
    readinessScore: int
    gapScore: int
    recommendation: str
    keywordHits: list[str]
    opportunityTags: list[str]
    manifestPresent: bool
    toolsListPresent: bool
    hasLogicFile: bool
    hasTestCoverage: bool
    hasToolConfig: bool
    hasAnalyticsInclude: bool
    hasInputControls: bool
    inlineScriptChars: int
    title: str
    metaDescription: str
    reasons: list[str]


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rank high-leverage, shippable tool opportunities")
    parser.add_argument("--root", required=True, help="Repo root to inspect")
    parser.add_argument("--limit", type=int, default=20, help="How many top opportunities to keep")
    parser.add_argument("--json-out", help="Optional path for JSON output")
    parser.add_argument("--md-out", help="Optional path for Markdown output")
    parser.add_argument("--min-score", type=int, default=1, help="Minimum score to include in ranked output")
    args = parser.parse_args(argv)
    if args.limit < 1:
        raise SystemExit("--limit must be >= 1")
    return args


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def load_json(path: Path) -> Any:
    return json.loads(read_text(path))


def normalize_slug(value: Any) -> str | None:
    text = re.sub(r"\s+", " ", "" if value is None else str(value)).strip().strip("/")
    if not text or "/" in text or text in {".", ".."}:
        return None
    return text


def slug_from_url(url: Any) -> str | None:
    value = re.sub(r"\s+", " ", "" if url is None else str(url)).strip()
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


def load_manifest_slugs(root: Path) -> set[str]:
    manifest = load_json(root / "tools" / "manifest.json")
    entries = manifest.get("tools", []) if isinstance(manifest, dict) else []
    slugs: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        slug = normalize_slug(entry.get("slug"))
        if slug:
            slugs.add(slug)
    return slugs


def load_tools_list_lookup(root: Path) -> dict[str, dict[str, Any]]:
    items = load_json(root / "_data" / "tools-list.json")
    lookup: dict[str, dict[str, Any]] = {}
    if not isinstance(items, list):
        return lookup
    for entry in items:
        if not isinstance(entry, dict):
            continue
        slug = normalize_slug(entry.get("slug")) or slug_from_url(entry.get("url"))
        if slug and slug not in lookup:
            lookup[slug] = entry
    return lookup


def list_tool_dirs(root: Path) -> list[Path]:
    tools_dir = root / "tools"
    return sorted(
        child for child in tools_dir.iterdir() if child.is_dir() and (child / "index.html").is_file()
    )


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", match.group(1) if match else "")).strip()


def extract_meta_description(html: str) -> str:
    match = re.search(
        r"<meta[^>]+name=[\"']description[\"'][^>]+content=[\"'](.*?)[\"']",
        html,
        re.I | re.S,
    )
    if match:
        return re.sub(r"\s+", " ", match.group(1)).strip()
    match = re.search(
        r"<meta[^>]+content=[\"'](.*?)[\"'][^>]+name=[\"']description[\"']",
        html,
        re.I | re.S,
    )
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else ""


def inline_script_chars(html: str) -> int:
    total = 0
    for match in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.I | re.S):
        total += len(match.group(1).strip())
    return total


def has_input_controls(html: str) -> bool:
    return bool(re.search(r"<(input|select|textarea)\b", html, re.I))


def logic_files(tool_dir: Path) -> list[Path]:
    result: list[Path] = []
    for path in tool_dir.iterdir():
        if not path.is_file():
            continue
        if path.suffix not in {".js", ".mjs"}:
            continue
        if path.name in {"index.js", "index.mjs"}:
            continue
        if ".test." in path.name:
            continue
        result.append(path)
    return sorted(result)


def has_test_coverage(root: Path, slug: str, tool_dir: Path) -> bool:
    local_tests = list(tool_dir.glob("*.test.js")) + list(tool_dir.glob("*.test.mjs"))
    local_tests += [p for p in tool_dir.rglob("*.test.js") if p.is_file()]
    local_tests += [p for p in tool_dir.rglob("*.test.mjs") if p.is_file()]
    if any(local_tests):
        return True
    tests_dir = root / "tests"
    if not tests_dir.is_dir():
        return False
    patterns = [
        f"**/{slug}.test.js",
        f"**/{slug}.test.mjs",
        f"**/{slug}.spec.js",
        f"**/{slug}.spec.mjs",
    ]
    for pattern in patterns:
        if any(path.is_file() for path in tests_dir.glob(pattern)):
            return True
    return False


def keyword_hits(slug: str) -> tuple[list[str], int]:
    tokens = set(slug.split("-"))
    hits = [keyword for keyword in KEYWORD_WEIGHTS if keyword in tokens]
    score = min(sum(KEYWORD_WEIGHTS[keyword] for keyword in hits), MAX_BUSINESS_SCORE)
    return hits, score


def recommend(opportunity_tags: list[str]) -> str:
    if "discoverability-gap" in opportunity_tags and "verification-gap" in opportunity_tags:
        return "Backfill tools-list entry now, then externalize logic/tests next."
    if "verification-gap" in opportunity_tags:
        return "Externalize logic and add deterministic tests before the next publish cycle."
    if "discoverability-gap" in opportunity_tags:
        return "Repair discovery metadata first; the page already exists on disk."
    return "Monitor only."


def build_tool_opportunity(root: Path, tool_dir: Path, manifest_slugs: set[str], tools_list_lookup: dict[str, dict[str, Any]]) -> ToolOpportunity:
    slug = tool_dir.name
    html = read_text(tool_dir / "index.html")
    title = extract_title(html)
    meta_description = extract_meta_description(html)
    manifest_present = slug in manifest_slugs
    tools_list_present = slug in tools_list_lookup
    logic_present = bool(logic_files(tool_dir))
    test_present = has_test_coverage(root, slug, tool_dir)
    config_present = (tool_dir / "tool.config.json").is_file()
    analytics_present = "/assets/analytics.js" in html
    controls_present = has_input_controls(html)
    inline_chars = inline_script_chars(html)

    hits, business_score = keyword_hits(slug)
    exposure_score = 0
    readiness_score = 0
    gap_score = 0
    reasons: list[str] = []
    opportunity_tags: list[str] = []

    if manifest_present:
        exposure_score += 8
        reasons.append("Already declared in tools/manifest.json.")
    if tools_list_present:
        exposure_score += 10
        reasons.append("Already discoverable in _data/tools-list.json.")
    else:
        gap_score += 14
        opportunity_tags.append("discoverability-gap")
        reasons.append("Missing from _data/tools-list.json despite existing page.")

    if title:
        readiness_score += 3
    if meta_description:
        readiness_score += 4
    if analytics_present:
        readiness_score += 2
    if controls_present:
        readiness_score += 4
    if inline_chars >= INLINE_SCRIPT_THRESHOLD:
        readiness_score += 10
        reasons.append(f"Has {inline_chars} inline script chars, so logic extraction is likely surgical.")

    if not logic_present:
        gap_score += 18
        opportunity_tags.append("logic-gap")
        reasons.append("No external JS/MJS logic module found.")
    if not test_present:
        gap_score += 16
        opportunity_tags.append("verification-gap")
        reasons.append("No deterministic automated test coverage found.")
    if not config_present:
        gap_score += 4
    if hits:
        reasons.append("Monetization intent keywords: " + ", ".join(hits))
    else:
        reasons.append("No monetization-intent keyword hit; lower priority by default.")

    if manifest_present and tools_list_present and (not logic_present or not test_present):
        opportunity_tags.append("promised-but-underverified")
    if manifest_present and not tools_list_present:
        opportunity_tags.append("manifest-only")
    if not opportunity_tags:
        opportunity_tags.append("monitor")

    score = business_score + exposure_score + readiness_score + gap_score

    return ToolOpportunity(
        slug=slug,
        score=score,
        businessScore=business_score,
        exposureScore=exposure_score,
        readinessScore=readiness_score,
        gapScore=gap_score,
        recommendation=recommend(opportunity_tags),
        keywordHits=hits,
        opportunityTags=sorted(set(opportunity_tags)),
        manifestPresent=manifest_present,
        toolsListPresent=tools_list_present,
        hasLogicFile=logic_present,
        hasTestCoverage=test_present,
        hasToolConfig=config_present,
        hasAnalyticsInclude=analytics_present,
        hasInputControls=controls_present,
        inlineScriptChars=inline_chars,
        title=title,
        metaDescription=meta_description,
        reasons=reasons,
    )


def build_report(root: Path, *, limit: int = 20, min_score: int = 1) -> dict[str, Any]:
    manifest_slugs = load_manifest_slugs(root)
    tools_list_lookup = load_tools_list_lookup(root)
    opportunities = [
        build_tool_opportunity(root, tool_dir, manifest_slugs, tools_list_lookup)
        for tool_dir in list_tool_dirs(root)
    ]

    ranked = [
        item
        for item in opportunities
        if item.score >= min_score and (not item.hasLogicFile or not item.hasTestCoverage or not item.toolsListPresent)
    ]
    ranked.sort(key=lambda item: (-item.score, item.slug))
    top = ranked[:limit]

    totals = {
        "toolCount": len(opportunities),
        "manifestCount": len(manifest_slugs),
        "toolsListCount": len(tools_list_lookup),
        "rankedOpportunityCount": len(ranked),
        "missingToolsList": sum(1 for item in opportunities if not item.toolsListPresent),
        "missingLogic": sum(1 for item in opportunities if not item.hasLogicFile),
        "missingTests": sum(1 for item in opportunities if not item.hasTestCoverage),
        "withToolConfig": sum(1 for item in opportunities if item.hasToolConfig),
    }

    recommendation = asdict(top[0]) if top else None
    return {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "root": str(root.resolve()),
        "totals": totals,
        "topRecommendation": recommendation,
        "topCandidates": [asdict(item) for item in top],
    }


def render_markdown(report: dict[str, Any]) -> str:
    totals = report["totals"]
    lines = [
        "# Tool Opportunity Ranker Report",
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        f"Repo root: `{report['root']}`",
        "",
        "## Inventory summary",
        "",
        "| Metric | Value |",
        "| --- | ---: |",
        f"| toolCount | {totals['toolCount']} |",
        f"| manifestCount | {totals['manifestCount']} |",
        f"| toolsListCount | {totals['toolsListCount']} |",
        f"| rankedOpportunityCount | {totals['rankedOpportunityCount']} |",
        f"| missingToolsList | {totals['missingToolsList']} |",
        f"| missingLogic | {totals['missingLogic']} |",
        f"| missingTests | {totals['missingTests']} |",
        f"| withToolConfig | {totals['withToolConfig']} |",
        "",
    ]

    top = report.get("topRecommendation")
    if top:
        lines.extend([
            "## Recommended next opportunity",
            "",
            f"- Slug: `{top['slug']}`",
            f"- Score: **{top['score']}**",
            f"- Recommendation: {top['recommendation']}",
            f"- Tags: {', '.join(top['opportunityTags'])}",
            f"- Reasons: {', '.join(top['reasons'])}",
            "",
        ])

    lines.extend([
        "## Top candidates",
        "",
        "| Rank | Slug | Score | Tags | Key gaps |",
        "| ---: | --- | ---: | --- | --- |",
    ])
    for idx, item in enumerate(report.get("topCandidates", []), start=1):
        gaps = []
        if not item["toolsListPresent"]:
            gaps.append("tools-list")
        if not item["hasLogicFile"]:
            gaps.append("logic")
        if not item["hasTestCoverage"]:
            gaps.append("tests")
        lines.append(
            f"| {idx} | `{item['slug']}` | {item['score']} | {'<br>'.join(item['opportunityTags'])} | {'<br>'.join(gaps) or '—'} |"
        )
    lines.append("")
    return "\n".join(lines)


def write_if_requested(path_value: str | None, content: str) -> None:
    if not path_value:
        return
    path = Path(path_value)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def render_terminal_summary(report: dict[str, Any]) -> str:
    totals = report["totals"]
    top = report.get("topRecommendation")
    lines = [
        "tool-opportunity-ranker",
        (
            "totals "
            f"toolCount={totals['toolCount']} "
            f"manifestCount={totals['manifestCount']} "
            f"toolsListCount={totals['toolsListCount']} "
            f"rankedOpportunityCount={totals['rankedOpportunityCount']} "
            f"missingToolsList={totals['missingToolsList']} "
            f"missingLogic={totals['missingLogic']} "
            f"missingTests={totals['missingTests']}"
        ),
    ]
    if top:
        lines.append(
            f"top slug={top['slug']} score={top['score']} tags={','.join(top['opportunityTags'])} recommendation={top['recommendation']}"
        )
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    root = Path(args.root)
    report = build_report(root, limit=args.limit, min_score=args.min_score)
    json_text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    markdown_text = render_markdown(report)
    write_if_requested(args.json_out, json_text)
    write_if_requested(args.md_out, markdown_text)
    print(render_terminal_summary(report))
    return 0


if __name__ == "__main__":
    sys.exit(main())
