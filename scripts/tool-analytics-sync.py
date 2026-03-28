#!/usr/bin/env python3
"""Dry-run-first audit and repair for missing tool analytics includes."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ANALYTICS_SNIPPET = '<script defer src="/assets/analytics.js"></script>'


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit and repair missing /assets/analytics.js includes on tool pages."
    )
    parser.add_argument("--root", required=True, help="Repo root directory")
    parser.add_argument(
        "--write-missing",
        action="store_true",
        help="Inject analytics into missing tool pages (dry-run by default)",
    )
    parser.add_argument(
        "--slug",
        action="append",
        metavar="SLUG",
        help="Filter to one or more tool slugs (repeatable)",
    )
    parser.add_argument("--json-out", help="Write JSON report to this path")
    parser.add_argument("--md-out", help="Write Markdown report to this path")
    return parser.parse_args(argv)


def detect_newline(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def has_analytics(text: str) -> bool:
    return "/assets/analytics.js" in text


def scan_tool_pages(tools_dir: Path) -> list[Path]:
    return sorted(tools_dir.glob("*/index.html"))


def detect_indent(text: str, index: int, default: str = "  ") -> str:
    line_start = text.rfind("\n", 0, index)
    if line_start == -1:
        candidate = text[:index]
    else:
        candidate = text[line_start + 1 : index]
    return candidate if candidate.isspace() else default


def inject_analytics(html: str) -> str:
    if has_analytics(html):
        return html

    head_open = re.search(r"<head\b[^>]*>", html, re.IGNORECASE)
    if not head_open:
        raise ValueError("Missing <head> section")

    head_close = re.search(r"</head>", html, re.IGNORECASE)
    if not head_close or head_close.start() < head_open.end():
        raise ValueError("Missing </head> section")

    head_inner = html[head_open.end() : head_close.start()]
    script_match = re.search(r"<script\b", head_inner, re.IGNORECASE)
    if script_match:
        insertion_index = head_open.end() + script_match.start()
    else:
        insertion_index = head_close.start()

    newline = detect_newline(html)
    indent = detect_indent(html, insertion_index)
    prefix = "" if insertion_index == 0 or html[insertion_index - 1] in "\r\n" else newline
    snippet = f"{prefix}{indent}{ANALYTICS_SNIPPET}{newline}"
    return html[:insertion_index] + snippet + html[insertion_index:]


def process_tool(path: Path, write_missing: bool) -> dict[str, Any]:
    slug = path.parent.name
    record: dict[str, Any] = {
        "slug": slug,
        "path": str(path),
        "hasAnalytics": False,
        "wasMissing": False,
        "action": "missing",
        "error": None,
    }

    try:
        html = path.read_text(encoding="utf-8")
    except OSError as exc:
        record["action"] = "error"
        record["error"] = f"read error: {exc}"
        return record

    present = has_analytics(html)
    record["hasAnalytics"] = present
    if present:
        record["action"] = "present"
        return record

    record["wasMissing"] = True
    try:
        updated = inject_analytics(html)
    except ValueError as exc:
        record["action"] = "error"
        record["error"] = f"inject error: {exc}"
        return record

    if not write_missing:
        return record

    try:
        path.write_text(updated, encoding="utf-8")
        record["action"] = "written"
        record["hasAnalytics"] = True
    except OSError as exc:
        record["action"] = "error"
        record["error"] = f"write error: {exc}"
    return record


def build_report(records: list[dict[str, Any]], args: argparse.Namespace) -> dict[str, Any]:
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": str(Path(args.root).resolve()),
        "mode": "write_missing" if args.write_missing else "dry_run",
        "slugs_filter": args.slug or [],
        "summary": {
            "scanned": len(records),
            "missing": sum(1 for r in records if r.get("wasMissing")),
            "written": sum(1 for r in records if r["action"] == "written"),
            "errors": sum(1 for r in records if r["action"] == "error"),
        },
        "tools": records,
    }


def render_md_report(report: dict[str, Any]) -> str:
    summary = report["summary"]
    lines = [
        "# tool-analytics-sync report",
        "",
        f"Generated: {report['generated_at']}  ",
        f"Root: `{report['root']}`  ",
        f"Mode: `{report['mode']}`",
        "",
        "## Summary",
        "",
        "| Metric | Count |",
        "|--------|-------|",
        f"| Scanned | {summary['scanned']} |",
        f"| Missing | {summary['missing']} |",
        f"| Written | {summary['written']} |",
        f"| Errors | {summary['errors']} |",
        "",
        "## Per-tool status",
        "",
        "| slug | hasAnalytics | action | error |",
        "|------|--------------|--------|-------|",
    ]
    for item in report["tools"]:
        lines.append(
            f"| {item['slug']} | {'✅' if item['hasAnalytics'] else '❌'} | {item['action']} | {item['error'] or ''} |"
        )
    return "\n".join(lines) + "\n"


def print_summary(report: dict[str, Any]) -> None:
    summary = report["summary"]
    print(f"\n=== tool-analytics-sync [{report['mode']}] ===")
    print(f"Scanned: {summary['scanned']} tools")
    print(f"Missing: {summary['missing']} tools")
    print(f"Written: {summary['written']} tools")
    print(f"Errors:  {summary['errors']} tools")
    print()
    for item in report["tools"]:
        if item["action"] == "present":
            print(f"  [{item['slug']}] present")
        elif item["action"] == "missing":
            print(f"  [{item['slug']}] missing")
        elif item["action"] == "written":
            print(f"  [{item['slug']}] wrote analytics include")
        else:
            print(f"  [{item['slug']}] ERROR: {item['error']}")
    print()


def write_optional_outputs(report: dict[str, Any], args: argparse.Namespace) -> None:
    if args.json_out:
        json_path = Path(args.json_out)
        json_path.parent.mkdir(parents=True, exist_ok=True)
        json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"JSON report: {json_path}")
    if args.md_out:
        md_path = Path(args.md_out)
        md_path.parent.mkdir(parents=True, exist_ok=True)
        md_path.write_text(render_md_report(report), encoding="utf-8")
        print(f"Markdown report: {md_path}")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    root = Path(args.root)
    tools_dir = root / "tools"
    if not tools_dir.is_dir():
        print(f"tool-analytics-sync error: tools/ not found under {root}", file=sys.stderr)
        return 1

    tool_paths = scan_tool_pages(tools_dir)
    if args.slug:
        slug_set = set(args.slug)
        tool_paths = [path for path in tool_paths if path.parent.name in slug_set]
        found = {path.parent.name for path in tool_paths}
        missing_slugs = sorted(slug_set - found)
        if missing_slugs:
            print(
                f"tool-analytics-sync error: slugs not found: {', '.join(missing_slugs)}",
                file=sys.stderr,
            )
            return 1

    records = [process_tool(path, write_missing=args.write_missing) for path in tool_paths]
    report = build_report(records, args)
    print_summary(report)
    write_optional_outputs(report, args)
    return 1 if report["summary"]["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
