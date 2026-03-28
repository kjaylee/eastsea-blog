from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = ROOT / "eastsea-blog" / "scripts" / "tool-catalog-reconciler.py"

spec = importlib.util.spec_from_file_location("tool_catalog_reconciler", SCRIPT_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)


class ToolCatalogReconcilerTests(unittest.TestCase):
    def _write_tool(self, root: Path, slug: str, title: str, description: str) -> None:
        tool_dir = root / "tools" / slug
        tool_dir.mkdir(parents=True, exist_ok=True)
        html = f"""<!doctype html><html><head>
<title>{title}</title>
<meta name=\"description\" content=\"{description}\" />
</head><body></body></html>"""
        (tool_dir / "index.html").write_text(html, encoding="utf-8")

    def _write_landing(self, root: Path, count: int) -> None:
        html = f"""<!doctype html><html><head>
<title>{count}개의 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster</title>
<meta name=\"description\" content=\"{count}개의 무료 온라인 도구 모음.\" />
<meta property=\"og:title\" content=\"{count}개의 무료 웹 도구 모음 | Free Online Tools\" />
<meta property=\"og:description\" content=\"{count}개의 무료 온라인 도구 모음.\" />
<meta name=\"twitter:title\" content=\"{count}개의 무료 웹 도구 모음 | Free Online Tools\" />
<meta name=\"twitter:description\" content=\"{count}개의 무료 웹 도구를 카테고리별로 빠르게 검색하고 바로 활용하세요.\" />
<script type=\"application/ld+json\">{{"mainEntity":{{"numberOfItems": {count}}}}}</script>
</head><body><div class=\"stats\">총 {count}개의 도구</div></body></html>"""
        (root / "tools" / "index.html").write_text(html, encoding="utf-8")

    def test_build_report_backfills_missing_entry_from_tool_html(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            (root / "_data").mkdir()

            self._write_tool(root, "email-auth-record-builder", "Email Authentication Record Builder", "Generate SPF and DMARC TXT records.")
            self._write_tool(root, "existing-tool", "Existing Tool", "Already indexed.")
            self._write_landing(root, 1)

            existing = [
                {
                    "slug": "existing-tool",
                    "title": "Existing Tool",
                    "description": "Already indexed.",
                    "category": "developer",
                }
            ]
            (root / "_data" / "tools-list.json").write_text(json.dumps(existing), encoding="utf-8")

            report = module.build_report(root)
            self.assertEqual(report.missing_slugs, ["email-auth-record-builder"])
            self.assertEqual(report.extra_slugs, [])
            self.assertEqual(len(report.candidate_entries), 1)
            candidate = report.candidate_entries[0]
            self.assertEqual(candidate["slug"], "email-auth-record-builder")
            self.assertEqual(candidate["title"], "Email Authentication Record Builder")
            self.assertEqual(candidate["description"], "Generate SPF and DMARC TXT records.")
            self.assertEqual(candidate["category"], "developer")
            self.assertIn("email", candidate["tags"])
            self.assertEqual(candidate["url"], "/tools/email-auth-record-builder/")
            self.assertEqual(len(report.merged_entries), 2)
            self.assertEqual(report.manifest["count"], 2)

    def test_existing_bad_entry_is_repaired_from_tool_html(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            (root / "_data").mkdir()

            self._write_tool(
                root,
                "age-calculator",
                "나이 & D-Day 계산기 | 웹 도구 모음",
                "🎂 나이 &amp; D-Day 계산기. 무료 온라인 도구 | Free online tool at eastsea.monster",
            )
            self._write_landing(root, 1)
            existing = [
                {
                    "slug": "age-calculator",
                    "title": "나이 & D-Day 계산기 | 웹 도구 모음",
                    "description": "",
                    "category": "",
                    "tags": "",
                }
            ]
            (root / "_data" / "tools-list.json").write_text(json.dumps(existing), encoding="utf-8")

            report = module.build_report(root)
            self.assertEqual(report.repaired_slugs, ["age-calculator"])
            merged = report.merged_entries[0]
            self.assertEqual(merged["title"], "나이 & D-Day 계산기")
            self.assertIn("나이 & D-Day 계산기", merged["description"])
            self.assertEqual(merged["url"], "/tools/age-calculator/")
            self.assertNotEqual(merged["tags"], "")

    def test_prune_extra_drops_missing_filesystem_rows(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            (root / "_data").mkdir()

            self._write_tool(root, "real-tool", "Real Tool", "Real description.")
            self._write_landing(root, 1)
            existing = [
                {"slug": "real-tool", "title": "Real Tool", "description": "Real description."},
                {"slug": "ghost-tool", "title": "Ghost Tool", "description": "Old row."},
            ]
            (root / "_data" / "tools-list.json").write_text(json.dumps(existing), encoding="utf-8")

            keep_report = module.build_report(root, prune_extra=False)
            prune_report = module.build_report(root, prune_extra=True)
            self.assertEqual(keep_report.extra_slugs, ["ghost-tool"])
            self.assertEqual(len(keep_report.merged_entries), 2)
            self.assertEqual(len(prune_report.merged_entries), 1)
            self.assertEqual(prune_report.merged_entries[0]["slug"], "real-tool")

    def test_landing_sync_updates_all_count_claims(self) -> None:
        html = """<!doctype html><html><head>
<title>709개의 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster</title>
<meta name=\"description\" content=\"709개의 무료 온라인 도구 모음.\" />
<meta property=\"og:title\" content=\"709개의 무료 웹 도구 모음 | Free Online Tools\" />
<meta property=\"og:description\" content=\"709개의 무료 온라인 도구 모음.\" />
<meta name=\"twitter:title\" content=\"709개의 무료 웹 도구 모음 | Free Online Tools\" />
<meta name=\"twitter:description\" content=\"709개의 무료 웹 도구를 카테고리별로 빠르게 검색하고 바로 활용하세요.\" />
<script type=\"application/ld+json\">{"description":"709개의 무료 온라인 웹 도구 모음","mainEntity":{"numberOfItems": 709}}</script>
</head><body><div class=\"stats\">총 709개의 도구</div></body></html>"""

        updated = module.sync_landing_counts(html, 727)
        self.assertNotIn("709개의 무료 웹 도구 모음", updated)
        self.assertIn("727개의 무료 웹 도구 모음", updated)
        self.assertIn('"numberOfItems": 727', updated)
        self.assertIn("총 727개의 도구", updated)


if __name__ == "__main__":
    unittest.main()
