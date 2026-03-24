from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = ROOT / "eastsea-blog" / "scripts" / "tool-formula-scaffold.py"
FIXTURE_CONFIG = ROOT / "eastsea-blog" / "tools" / "app-store-subscription-proceeds-calculator" / "tool.config.json"


spec = importlib.util.spec_from_file_location("tool_formula_scaffold", SCRIPT_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


class ToolFormulaScaffoldTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = json.loads(FIXTURE_CONFIG.read_text(encoding="utf-8"))

    def test_validate_config_rejects_missing_summary_lines(self) -> None:
        broken = dict(self.config)
        broken.pop("summaryLines")
        with self.assertRaises(ValueError):
            module.validate_config(broken)

    def test_render_bundle_contains_required_files_and_strings(self) -> None:
        config = module.validate_config(self.config)
        bundle = module.render_bundle(config)
        self.assertEqual(set(bundle.keys()), {"index.html", "app.js", "app.test.js"})
        self.assertIn("/assets/analytics.js", bundle["index.html"])
        self.assertIn("function compute(raw)", bundle["app.js"])
        self.assertIn("compute(DEFAULTS)", bundle["app.test.js"])

    def test_write_bundle_requires_force_to_overwrite(self) -> None:
        config = module.validate_config(self.config)
        bundle = module.render_bundle(config)
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp) / "generated"
            written = module.write_bundle(bundle, outdir, force=False)
            self.assertEqual(len(written), 3)
            with self.assertRaises(FileExistsError):
                module.write_bundle(bundle, outdir, force=False)
            written_again = module.write_bundle(bundle, outdir, force=True)
            self.assertEqual(len(written_again), 3)


if __name__ == "__main__":
    unittest.main()
