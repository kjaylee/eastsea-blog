from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

# Mirrors the path resolution pattern from test_tool_formula_scaffold.py.
# When run as: python3 eastsea-blog/tests/test_tool_formula_batch.py
# from the workspace root, parents[2] == /workspace.
ROOT = Path(__file__).resolve().parents[2]
BATCH_SCRIPT = ROOT / "eastsea-blog" / "scripts" / "tool-formula-batch.py"
SCAFFOLD_SCRIPT = ROOT / "eastsea-blog" / "scripts" / "tool-formula-scaffold.py"
FIXTURE_CONFIG = (
    ROOT
    / "eastsea-blog"
    / "tools"
    / "app-store-subscription-proceeds-calculator"
    / "tool.config.json"
)
INVALID_FIXTURE_CONFIG = (
    ROOT
    / "eastsea-blog"
    / "tools"
    / "freelancer-com-fee-calculator"
    / "tool.config.json"
)


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


scaffold_mod = _load("tool_formula_scaffold", SCAFFOLD_SCRIPT)
batch_mod = _load("tool_formula_batch", BATCH_SCRIPT)


def _make_repo(
    tmp: Path,
    slugs: list[str],
    existing_files: dict[str, list[str]] | None = None,
    config_overrides: dict[str, Path] | None = None,
) -> Path:
    """Build a minimal fake-repo under tmp with the given tool slugs.

    existing_files maps slug -> list of filenames to pre-create as placeholder HTML.
    config_overrides maps slug -> alternate tool.config.json fixture path.
    Returns the repo root Path.
    """
    scripts_dir = tmp / "scripts"
    scripts_dir.mkdir(parents=True)
    shutil.copy(SCAFFOLD_SCRIPT, scripts_dir / "tool-formula-scaffold.py")

    for slug in slugs:
        tool_dir = tmp / "tools" / slug
        tool_dir.mkdir(parents=True)
        fixture_path = (config_overrides or {}).get(slug, FIXTURE_CONFIG)
        shutil.copy(fixture_path, tool_dir / "tool.config.json")
        for fname in (existing_files or {}).get(slug, []):
            (tool_dir / fname).write_text(f"<!-- placeholder {fname} -->", encoding="utf-8")

    return tmp


class TestDryRun(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = _make_repo(Path(self._tmp), ["test-tool"])

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_scan_finds_config(self) -> None:
        paths = batch_mod.scan_tools(self.repo / "tools")
        self.assertEqual(len(paths), 1)
        self.assertEqual(paths[0].parent.name, "test-tool")

    def test_audit_tool_no_error(self) -> None:
        config_path = self.repo / "tools" / "test-tool" / "tool.config.json"
        audit = batch_mod.audit_tool(config_path, scaffold_mod)
        self.assertIsNone(audit["error"])
        self.assertEqual(set(audit["files"].keys()), {"index.html", "app.js", "app.test.js"})

    def test_dry_run_does_not_write_files(self) -> None:
        code = batch_mod.main(["--root", str(self.repo)])
        self.assertEqual(code, 0)
        tool_dir = self.repo / "tools" / "test-tool"
        for fname in ("index.html", "app.js", "app.test.js"):
            self.assertFalse((tool_dir / fname).exists(), f"{fname} must not exist in dry-run")

    def test_dry_run_reports_all_missing(self) -> None:
        config_path = self.repo / "tools" / "test-tool" / "tool.config.json"
        audit = batch_mod.audit_tool(config_path, scaffold_mod)
        self.assertTrue(all(not v for v in audit["files"].values()))


class TestWriteMissing(unittest.TestCase):
    PLACEHOLDER = "<!-- original index.html -->"

    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        # Partially scaffolded: index.html already exists, app.js and app.test.js missing.
        self.repo = _make_repo(
            Path(self._tmp),
            ["partial-tool"],
            existing_files={"partial-tool": ["index.html"]},
        )
        # Overwrite with known placeholder so we can detect changes.
        idx = self.repo / "tools" / "partial-tool" / "index.html"
        idx.write_text(self.PLACEHOLDER, encoding="utf-8")

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_write_missing_fills_only_missing_files(self) -> None:
        config_path = self.repo / "tools" / "partial-tool" / "tool.config.json"
        written, skipped = batch_mod.write_missing_files(config_path, scaffold_mod, force=False)
        self.assertIn("app.js", written)
        self.assertIn("app.test.js", written)
        self.assertIn("index.html", skipped)
        self.assertNotIn("index.html", written)

    def test_existing_file_unchanged_without_force(self) -> None:
        config_path = self.repo / "tools" / "partial-tool" / "tool.config.json"
        batch_mod.write_missing_files(config_path, scaffold_mod, force=False)
        actual = (self.repo / "tools" / "partial-tool" / "index.html").read_text("utf-8")
        self.assertEqual(actual, self.PLACEHOLDER)

    def test_main_write_missing_backfills_only_missing(self) -> None:
        code = batch_mod.main(["--root", str(self.repo), "--write-missing"])
        self.assertEqual(code, 0)
        tool_dir = self.repo / "tools" / "partial-tool"
        self.assertTrue((tool_dir / "app.js").exists())
        self.assertTrue((tool_dir / "app.test.js").exists())
        self.assertEqual(
            (tool_dir / "index.html").read_text("utf-8"),
            self.PLACEHOLDER,
        )

    def test_main_write_missing_exit_0_all_complete(self) -> None:
        # Run twice: second run should also exit 0 (nothing to write, nothing fails).
        batch_mod.main(["--root", str(self.repo), "--write-missing"])
        code = batch_mod.main(["--root", str(self.repo), "--write-missing"])
        self.assertEqual(code, 0)


class TestForceOverwrite(unittest.TestCase):
    PLACEHOLDER = "<html>old</html>"

    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = _make_repo(
            Path(self._tmp),
            ["force-tool"],
            existing_files={"force-tool": ["index.html"]},
        )
        idx = self.repo / "tools" / "force-tool" / "index.html"
        idx.write_text(self.PLACEHOLDER, encoding="utf-8")

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_force_overwrites_all_files(self) -> None:
        config_path = self.repo / "tools" / "force-tool" / "tool.config.json"
        written, skipped = batch_mod.write_missing_files(config_path, scaffold_mod, force=True)
        self.assertIn("index.html", written)
        self.assertIn("app.js", written)
        self.assertIn("app.test.js", written)
        self.assertEqual(len(skipped), 0)

    def test_force_replaces_existing_content(self) -> None:
        config_path = self.repo / "tools" / "force-tool" / "tool.config.json"
        batch_mod.write_missing_files(config_path, scaffold_mod, force=True)
        html = (self.repo / "tools" / "force-tool" / "index.html").read_text("utf-8")
        self.assertNotEqual(html, self.PLACEHOLDER)
        self.assertIn("<!doctype html>", html.lower())

    def test_main_force_exit_0(self) -> None:
        code = batch_mod.main(["--root", str(self.repo), "--force"])
        self.assertEqual(code, 0)
        html = (self.repo / "tools" / "force-tool" / "index.html").read_text("utf-8")
        self.assertNotEqual(html, self.PLACEHOLDER)


class TestSlugFilter(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = _make_repo(Path(self._tmp), ["tool-alpha", "tool-beta"])

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_slug_filter_limits_to_matching_tools(self) -> None:
        code = batch_mod.main(["--root", str(self.repo), "--slug", "tool-alpha"])
        self.assertEqual(code, 0)
        # tool-beta must not have had any files written (dry-run with slug filter)
        for fname in ("index.html", "app.js", "app.test.js"):
            self.assertFalse((self.repo / "tools" / "tool-beta" / fname).exists())

    def test_unknown_slug_exits_1(self) -> None:
        code = batch_mod.main(["--root", str(self.repo), "--slug", "nonexistent-tool"])
        self.assertEqual(code, 1)

    def test_multiple_slug_flags(self) -> None:
        code = batch_mod.main([
            "--root", str(self.repo),
            "--slug", "tool-alpha",
            "--slug", "tool-beta",
        ])
        self.assertEqual(code, 0)


class TestInvalidConfig(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = _make_repo(
            Path(self._tmp),
            ["legacy-tool"],
            config_overrides={"legacy-tool": INVALID_FIXTURE_CONFIG},
        )

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_invalid_config_returns_exit_1_and_report(self) -> None:
        json_path = Path(self._tmp) / "report.json"
        code = batch_mod.main([
            "--root", str(self.repo),
            "--json-out", str(json_path),
        ])
        self.assertEqual(code, 1)
        report = json.loads(json_path.read_text("utf-8"))
        self.assertEqual(report["summary"]["errored"], 1)
        self.assertIn("Missing required top-level keys", report["tools"][0]["error"])


class TestReports(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.mkdtemp()
        self.repo = _make_repo(Path(self._tmp), ["report-tool"])
        self.out_dir = Path(self._tmp) / "out"
        self.out_dir.mkdir()

    def tearDown(self) -> None:
        shutil.rmtree(self._tmp)

    def test_json_out_written_and_valid(self) -> None:
        json_path = self.out_dir / "report.json"
        code = batch_mod.main(["--root", str(self.repo), "--json-out", str(json_path)])
        self.assertEqual(code, 0)
        self.assertTrue(json_path.exists())
        data = json.loads(json_path.read_text("utf-8"))
        self.assertIn("summary", data)
        self.assertEqual(data["summary"]["scanned"], 1)

    def test_md_out_written(self) -> None:
        md_path = self.out_dir / "report.md"
        code = batch_mod.main(["--root", str(self.repo), "--md-out", str(md_path)])
        self.assertEqual(code, 0)
        self.assertTrue(md_path.exists())
        md = md_path.read_text("utf-8")
        self.assertIn("tool-formula-batch report", md)
        self.assertIn("report-tool", md)


if __name__ == "__main__":
    unittest.main()
