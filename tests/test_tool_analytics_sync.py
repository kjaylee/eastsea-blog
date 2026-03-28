from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = ROOT / "eastsea-blog" / "scripts" / "tool-analytics-sync.py"

spec = importlib.util.spec_from_file_location("tool_analytics_sync", SCRIPT_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


class ToolAnalyticsSyncUnitTests(unittest.TestCase):
    def test_injects_before_first_script_in_head(self) -> None:
        html = """<!doctype html>
<html><head>
  <meta charset=\"utf-8\" />
  <script type=\"application/ld+json\">{}</script>
</head><body></body></html>"""
        updated = module.inject_analytics(html)
        self.assertIn(module.ANALYTICS_SNIPPET, updated)
        self.assertLess(updated.index(module.ANALYTICS_SNIPPET), updated.index('<script type="application/ld+json">'))
        self.assertEqual(updated.count(module.ANALYTICS_SNIPPET), 1)

    def test_injects_before_closing_head_when_no_script_exists(self) -> None:
        html = """<!doctype html>
<html><head>
  <meta name=\"description\" content=\"demo\" />
</head><body></body></html>"""
        updated = module.inject_analytics(html)
        self.assertIn(module.ANALYTICS_SNIPPET + "\n</head>", updated)
        self.assertEqual(updated.count(module.ANALYTICS_SNIPPET), 1)

    def test_already_present_html_is_unchanged(self) -> None:
        html = f"""<!doctype html>
<html><head>
  {module.ANALYTICS_SNIPPET}
</head><body></body></html>"""
        updated = module.inject_analytics(html)
        self.assertEqual(updated, html)

    def test_missing_head_raises_value_error(self) -> None:
        with self.assertRaises(ValueError):
            module.inject_analytics("<html><body>broken</body></html>")


class ToolAnalyticsSyncCliTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = Path(self._tmp)
        (self.repo / "tools").mkdir()
        self._write_tool(
            "missing-script-first",
            """<!doctype html>
<html><head>
  <meta charset=\"utf-8\" />
  <script type=\"application/ld+json\">{}</script>
</head><body></body></html>""",
        )
        self._write_tool(
            "missing-no-script",
            """<!doctype html>
<html><head>
  <meta name=\"description\" content=\"demo\" />
</head><body></body></html>""",
        )
        self._write_tool(
            "already-present",
            f"""<!doctype html>
<html><head>
  {module.ANALYTICS_SNIPPET}
</head><body></body></html>""",
        )
        self._write_tool(
            "broken-tool",
            "<html><body>broken</body></html>",
        )

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def _write_tool(self, slug: str, html: str) -> None:
        tool_dir = self.repo / "tools" / slug
        tool_dir.mkdir(parents=True, exist_ok=True)
        (tool_dir / "index.html").write_text(html, encoding="utf-8")

    def test_dry_run_does_not_modify_files(self) -> None:
        before = (self.repo / "tools" / "missing-script-first" / "index.html").read_text("utf-8")
        code = module.main(["--root", str(self.repo), "--slug", "missing-script-first"])
        after = (self.repo / "tools" / "missing-script-first" / "index.html").read_text("utf-8")
        self.assertEqual(code, 0)
        self.assertEqual(before, after)
        self.assertNotIn(module.ANALYTICS_SNIPPET, after)

    def test_write_missing_repairs_only_filtered_slug(self) -> None:
        code = module.main([
            "--root", str(self.repo),
            "--write-missing",
            "--slug", "missing-no-script",
        ])
        self.assertEqual(code, 0)
        repaired = (self.repo / "tools" / "missing-no-script" / "index.html").read_text("utf-8")
        untouched = (self.repo / "tools" / "missing-script-first" / "index.html").read_text("utf-8")
        self.assertIn(module.ANALYTICS_SNIPPET, repaired)
        self.assertNotIn(module.ANALYTICS_SNIPPET, untouched)

    def test_write_missing_is_idempotent_for_repeated_runs(self) -> None:
        first = module.main([
            "--root", str(self.repo),
            "--write-missing",
            "--slug", "missing-script-first",
        ])
        second = module.main([
            "--root", str(self.repo),
            "--write-missing",
            "--slug", "missing-script-first",
        ])
        html = (self.repo / "tools" / "missing-script-first" / "index.html").read_text("utf-8")
        self.assertEqual(first, 0)
        self.assertEqual(second, 0)
        self.assertEqual(html.count(module.ANALYTICS_SNIPPET), 1)

    def test_broken_page_returns_exit_1_and_reports_error(self) -> None:
        json_path = self.repo / "report.json"
        code = module.main([
            "--root", str(self.repo),
            "--slug", "broken-tool",
            "--json-out", str(json_path),
        ])
        self.assertEqual(code, 1)
        report = json.loads(json_path.read_text("utf-8"))
        self.assertEqual(report["summary"]["errors"], 1)
        self.assertEqual(report["summary"]["missing"], 1)
        self.assertEqual(report["tools"][0]["action"], "error")
        self.assertIn("Missing <head> section", report["tools"][0]["error"])

    def test_unknown_slug_returns_exit_1(self) -> None:
        code = module.main(["--root", str(self.repo), "--slug", "nope"])
        self.assertEqual(code, 1)


if __name__ == "__main__":
    unittest.main()
