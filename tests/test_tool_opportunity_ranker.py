from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = ROOT / "eastsea-blog" / "scripts" / "tool-opportunity-ranker.py"

spec = importlib.util.spec_from_file_location("tool_opportunity_ranker", SCRIPT_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)


class ToolOpportunityRankerTests(unittest.TestCase):
    def _write_tool(self, root: Path, slug: str, *, html: str, logic: str | None = None) -> None:
        tool_dir = root / "tools" / slug
        tool_dir.mkdir(parents=True, exist_ok=True)
        (tool_dir / "index.html").write_text(html, encoding="utf-8")
        if logic is not None:
            (tool_dir / "logic.mjs").write_text(logic, encoding="utf-8")

    def test_build_report_ranks_manifest_only_fee_gap_above_lower_intent_tools(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            (root / "_data").mkdir()
            (root / "tests" / "unit").mkdir(parents=True)

            paddle_html = """<!doctype html><html><head>
<title>Paddle Fee Calculator</title>
<meta name=\"description\" content=\"Estimate Paddle fees\" />
<script src=\"/assets/analytics.js\"></script>
</head><body><input id=\"price\" /><script>""" + ("a" * 950) + """</script></body></html>"""
            marketing_html = """<!doctype html><html><head>
<title>Marketing ROI Calculator</title>
<meta name=\"description\" content=\"Estimate marketing ROI\" />
<script src=\"/assets/analytics.js\"></script>
</head><body><input id=\"spend\" /></body></html>"""
            stable_html = """<!doctype html><html><head>
<title>Stable Tool</title>
<meta name=\"description\" content=\"Already covered\" />
<script src=\"/assets/analytics.js\"></script>
</head><body><input id=\"value\" /></body></html>"""

            self._write_tool(root, "paddle-fee-calculator", html=paddle_html)
            self._write_tool(root, "marketing-roi-calculator", html=marketing_html)
            self._write_tool(root, "stable-tool", html=stable_html, logic="export const ok = true;\n")

            manifest = {
                "count": 3,
                "tools": [
                    {"slug": "paddle-fee-calculator", "url": "/tools/paddle-fee-calculator/"},
                    {"slug": "marketing-roi-calculator", "url": "/tools/marketing-roi-calculator/"},
                    {"slug": "stable-tool", "url": "/tools/stable-tool/"},
                ],
            }
            (root / "tools" / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")

            tools_list = [
                {"title": "Marketing ROI Calculator", "description": "Estimate marketing ROI", "url": "/tools/marketing-roi-calculator/"},
                {"title": "Stable Tool", "description": "Already covered", "url": "/tools/stable-tool/"},
            ]
            (root / "_data" / "tools-list.json").write_text(json.dumps(tools_list), encoding="utf-8")

            (root / "tests" / "unit" / "stable-tool.test.mjs").write_text("export {};\n", encoding="utf-8")

            report = module.build_report(root, limit=5)
            self.assertEqual(report["topRecommendation"]["slug"], "paddle-fee-calculator")
            self.assertEqual(report["totals"]["missingToolsList"], 1)
            self.assertGreaterEqual(report["topRecommendation"]["inlineScriptChars"], 900)

    def test_render_markdown_mentions_top_recommendation(self) -> None:
        report = {
            "generatedAt": "2026-03-26T00:00:00+00:00",
            "root": "/tmp/repo",
            "totals": {
                "toolCount": 1,
                "manifestCount": 1,
                "toolsListCount": 0,
                "rankedOpportunityCount": 1,
                "missingToolsList": 1,
                "missingLogic": 1,
                "missingTests": 1,
                "withToolConfig": 0,
            },
            "topRecommendation": {
                "slug": "paddle-fee-calculator",
                "score": 99,
                "recommendation": "Backfill tools-list entry now, then externalize logic/tests next.",
                "opportunityTags": ["discoverability-gap", "verification-gap"],
                "reasons": ["Missing from _data/tools-list.json despite existing page."],
            },
            "topCandidates": [
                {
                    "slug": "paddle-fee-calculator",
                    "score": 99,
                    "opportunityTags": ["discoverability-gap", "verification-gap"],
                    "toolsListPresent": False,
                    "hasLogicFile": False,
                    "hasTestCoverage": False,
                }
            ],
        }
        md = module.render_markdown(report)
        self.assertIn("Recommended next opportunity", md)
        self.assertIn("paddle-fee-calculator", md)


if __name__ == "__main__":
    unittest.main()
