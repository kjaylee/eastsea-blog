#!/usr/bin/env python3
"""Fail-closed safety gate for eastsea blog publication.

The gate inspects git status in the provided repo and allows publication only
when dirty paths are limited to the target post pair and explicit helper files
used by the local-only publish workflow.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from typing import List

ROOT_POSTS_JSON = "posts.json"
ALLOWED_BASES = {ROOT_POSTS_JSON}
ALLOWED_EXACT = {
    "scripts/safe-publish-gate.py",
    "scripts/publish-post-to-d1.py",
    "scripts/publish-post.sh",
    "scripts/hermes-premarket-publish.sh",
    "scripts/sync-d1.sh",
    "update-posts.sh",
}
ALLOWED_PROOF_DIRS = (".safe-gate-proofs/",)


def is_root_posts_json(path: str) -> bool:
    return normalize_path(path) == ROOT_POSTS_JSON


def normalize_path(path: str) -> str:
    normalized = path.replace("\\", "/").strip()
    if not normalized:
        return ""
    normalized = os.path.normpath(normalized).replace("\\", "/")
    if normalized == ".":
        return ""
    return normalized


def path_matches_prefix(path: str, prefix: str) -> bool:
    path = normalize_path(path)
    prefix = normalize_path(prefix)
    if not path or not prefix:
        return False
    return path == prefix or path.startswith(f"{prefix}/")


def git_status(repo: str) -> List[str]:
    proc = subprocess.run(
        ["git", "status", "--short", "--untracked-files=all"],
        cwd=repo,
        capture_output=True,
        text=True,
        check=True,
    )
    return [ln.rstrip("\n") for ln in proc.stdout.splitlines() if ln.strip()]


def parse_paths(status_lines: List[str]) -> List[str]:
    paths: List[str] = []
    for line in status_lines:
        if " -> " in line:
            left, right = line.split(" -> ", 1)
            left_path = normalize_path(left[3:] if len(left) > 3 else "")
            right_path = normalize_path(right)
            if left_path:
                paths.append(left_path)
            if right_path:
                paths.append(right_path)
            continue
        path = normalize_path(line[3:] if len(line) > 3 else "")
        if path:
            paths.append(path)
    return paths


def is_allowed(path: str, slug: str, allow_prefixes: List[str]) -> bool:
    path = normalize_path(path)
    if path in ALLOWED_BASES and is_root_posts_json(path):
        return True
    if path in ALLOWED_EXACT:
        return True
    if path in {f"posts/{slug}.md", f"_posts/{slug}.md"}:
        return True
    for prefix in allow_prefixes:
        if path_matches_prefix(path, prefix):
            return True
    if any(path_matches_prefix(path, prefix) for prefix in ALLOWED_PROOF_DIRS):
        return True
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--repo", required=True)
    ap.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="Explicit repo-relative prefix to allow as auxiliary evidence",
    )
    ap.add_argument(
        "--json",
        action="store_true",
        help="Compatibility flag; output is always JSON",
    )
    args = ap.parse_args()

    repo = os.path.abspath(args.repo)
    slug = args.slug.removesuffix(".md")
    allow_prefixes = [p for p in args.allow_prefix if p]

    try:
        status_lines = git_status(repo)
    except subprocess.CalledProcessError as exc:
        out = {
            "safe_to_publish": False,
            "reason": "git status failed",
            "repo": repo,
            "slug": slug,
            "error": exc.stderr.strip() if exc.stderr else str(exc),
        }
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 2

    paths = parse_paths(status_lines)
    allowed = [p for p in paths if is_allowed(p, slug, allow_prefixes)]
    unrelated = [p for p in paths if not is_allowed(p, slug, allow_prefixes)]

    out = {
        "safe_to_publish": len(unrelated) == 0,
        "repo": repo,
        "slug": slug,
        "changed_paths": paths,
        "allowed_paths": allowed,
        "unrelated_changes": unrelated,
        "allowed_prefixes": allow_prefixes,
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0 if not unrelated else 1


if __name__ == "__main__":
    raise SystemExit(main())
