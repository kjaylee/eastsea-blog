#!/usr/bin/env python3
"""Batch audit and backfill for formula-calculator tool bundles."""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

OUTPUT_FILES = ("index.html", "app.js", "app.test.js")


def load_scaffold_module(scripts_dir: Path) -> Any:
    scaffold_path = scripts_dir / "tool-formula-scaffold.py"
    if not scaffold_path.exists():
        raise FileNotFoundError(f"Scaffold script not found: {scaffold_path}")
    spec = importlib.util.spec_from_file_location("tool_formula_scaffold", scaffold_path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


def scan_tools(tools_dir: Path) -> list[Path]:
    """Return sorted list of tool.config.json paths under tools/*/."""
    return sorted(tools_dir.glob("*/tool.config.json"))


def compute_status(tool_dir: Path) -> dict[str, bool]:
    """Return presence map for all OUTPUT_FILES in tool_dir."""
    return {name: (tool_dir / name).exists() for name in OUTPUT_FILES}


def audit_tool(config_path: Path, scaffold_mod: Any) -> dict[str, Any]:
    """Validate config and compute file-presence status. No writes."""
    tool_dir = config_path.parent
    slug = tool_dir.name
    result: dict[str, Any] = {
        "slug": slug,
        "config": str(config_path),
        "error": None,
        "files": {},
        "actions": {"written": [], "skipped": []},
    }
    try:
        scaffold_mod.validate_config(scaffold_mod.read_json(config_path))
    except ValueError as exc:
        result["error"] = str(exc)
        return result
    result["files"] = compute_status(tool_dir)
    return result


def write_missing_files(
    config_path: Path,
    scaffold_mod: Any,
    force: bool = False,
) -> tuple[list[str], list[str]]:
    """Render bundle and write only missing files (or all when force=True).

    Returns (written_names, skipped_names).
    Raises ValueError on config error, OSError on filesystem error.
    """
    tool_dir = config_path.parent
    config = scaffold_mod.validate_config(scaffold_mod.read_json(config_path))
    bundle: dict[str, str] = scaffold_mod.render_bundle(config)

    tool_dir.mkdir(parents=True, exist_ok=True)
    written: list[str] = []
    skipped: list[str] = []

    for name, content in bundle.items():
        path = tool_dir / name
        if path.exists() and not force:
            skipped.append(name)
        else:
            path.write_text(content, encoding="utf-8")
            written.append(name)

    return written, skipped


def build_report(
    audits: list[dict[str, Any]],
    args: argparse.Namespace,
) -> dict[str, Any]:
    total = len(audits)
    errored = [a for a in audits if a["error"]]
    valid = [a for a in audits if not a["error"]]
    complete = [a for a in valid if all(a["files"].values())]
    partial = [a for a in valid if not all(a["files"].values())]

    missing_counts: dict[str, int] = {f: 0 for f in OUTPUT_FILES}
    for a in valid:
        for fname, present in a["files"].items():
            if not present:
                missing_counts[fname] += 1

    if args.force:
        mode = "force"
    elif args.write_missing:
        mode = "write_missing"
    else:
        mode = "dry_run"

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": str(args.root),
        "mode": mode,
        "slugs_filter": args.slug or [],
        "summary": {
            "scanned": total,
            "errored": len(errored),
            "complete": len(complete),
            "partial": len(partial),
            "missing_by_file": missing_counts,
        },
        "tools": audits,
    }


def render_md_report(report: dict[str, Any]) -> str:
    s = report["summary"]
    lines = [
        "# tool-formula-batch report",
        "",
        f"Generated: {report['generated_at']}  ",
        f"Root: `{report['root']}`  ",
        f"Mode: `{report['mode']}`",
        "",
        "## Summary",
        "",
        "| Metric | Count |",
        "|--------|-------|",
        f"| Scanned | {s['scanned']} |",
        f"| Complete | {s['complete']} |",
        f"| Partial | {s['partial']} |",
        f"| Config errors | {s['errored']} |",
    ]
    for fname, count in s["missing_by_file"].items():
        lines.append(f"| Missing `{fname}` | {count} |")

    lines += ["", "## Per-tool status", ""]
    lines += ["| slug | index.html | app.js | app.test.js | error |"]
    lines += ["|------|-----------|--------|-------------|-------|"]
    for a in report["tools"]:
        if a["error"]:
            lines.append(f"| {a['slug']} | — | — | — | {a['error']} |")
        else:
            cells = " | ".join(
                "✅" if a["files"].get(f) else "❌" for f in OUTPUT_FILES
            )
            lines.append(f"| {a['slug']} | {cells} | |")

    return "\n".join(lines) + "\n"


def print_summary(report: dict[str, Any]) -> None:
    s = report["summary"]
    mode = report["mode"]
    print(f"\n=== tool-formula-batch [{mode}] ===")
    print(f"Scanned:  {s['scanned']} tools")
    print(f"Complete: {s['complete']} tools")
    print(f"Partial:  {s['partial']} tools")
    if s["errored"]:
        print(f"Errors:   {s['errored']} tools")
    missing_str = ", ".join(
        f"{fname}×{cnt}" for fname, cnt in s["missing_by_file"].items() if cnt > 0
    )
    print(f"Missing:  {missing_str or 'none'}")
    print()
    for a in report["tools"]:
        slug = a["slug"]
        if a["error"]:
            print(f"  [{slug}] ERROR: {a['error']}")
            continue
        missing = [f for f, present in a["files"].items() if not present]
        written = a["actions"]["written"]
        skipped = a["actions"]["skipped"]
        if written:
            msg = f"  [{slug}] wrote: {', '.join(written)}"
            if skipped:
                msg += f" | skipped: {', '.join(skipped)}"
            print(msg)
        elif not missing:
            print(f"  [{slug}] complete")
        else:
            print(f"  [{slug}] missing: {', '.join(missing)}")
    print()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch audit and backfill for formula-calculator tool bundles."
    )
    parser.add_argument("--root", required=True, help="Repo root directory")
    parser.add_argument(
        "--write-missing",
        action="store_true",
        help="Write only missing generated files (dry-run by default)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing generated files (implies --write-missing)",
    )
    parser.add_argument(
        "--slug",
        action="append",
        metavar="SLUG",
        help="Filter to specific tool slug (repeatable)",
    )
    parser.add_argument("--json-out", help="Write JSON report to this path")
    parser.add_argument("--md-out", help="Write Markdown report to this path")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    root = Path(args.root)
    tools_dir = root / "tools"
    scripts_dir = root / "scripts"

    if not tools_dir.is_dir():
        print(
            f"tool-formula-batch error: tools/ not found under {root}",
            file=sys.stderr,
        )
        return 1

    try:
        scaffold_mod = load_scaffold_module(scripts_dir)
    except Exception as exc:
        print(f"tool-formula-batch error: {exc}", file=sys.stderr)
        return 1

    config_paths = scan_tools(tools_dir)

    # Apply slug filter
    if args.slug:
        slug_set = set(args.slug)
        config_paths = [p for p in config_paths if p.parent.name in slug_set]
        missing_slugs = slug_set - {p.parent.name for p in config_paths}
        if missing_slugs:
            print(
                f"tool-formula-batch error: slugs not found: {', '.join(sorted(missing_slugs))}",
                file=sys.stderr,
            )
            return 1

    write_mode = args.write_missing or args.force
    exit_code = 0
    audits: list[dict[str, Any]] = []

    for config_path in config_paths:
        audit = audit_tool(config_path, scaffold_mod)

        if audit["error"]:
            exit_code = 1
        elif write_mode:
            try:
                written, skipped = write_missing_files(
                    config_path, scaffold_mod, force=args.force
                )
                audit["actions"] = {"written": written, "skipped": skipped}
                # Refresh file status after write
                audit["files"] = compute_status(config_path.parent)
            except (ValueError, OSError) as exc:
                audit["error"] = f"write error: {exc}"
                exit_code = 1

        audits.append(audit)

    report = build_report(audits, args)
    print_summary(report)

    if args.json_out:
        json_path = Path(args.json_out)
        json_path.parent.mkdir(parents=True, exist_ok=True)
        json_path.write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"JSON report: {json_path}")

    if args.md_out:
        md_path = Path(args.md_out)
        md_path.parent.mkdir(parents=True, exist_ok=True)
        md_path.write_text(render_md_report(report), encoding="utf-8")
        print(f"Markdown report: {md_path}")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
