import importlib.util
import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "generate-d1-projections.py"
SPEC = importlib.util.spec_from_file_location("generate_d1_projections", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


POSTS = [
    {
        "slug": "2026-07-17-new-post",
        "title": "New & Better",
        "date": "2026-07-17T00:10:00+09:00",
        "category": "research",
        "categories": ["research"],
        "tags": ["D1"],
        "author": "Miss Kim",
        "excerpt": "First <excerpt>",
        "updated_at": "2026-07-16 15:10:00",
    },
    {
        "slug": "2026-07-16-old-post",
        "title": "Old Post",
        "date": "2026-07-16",
        "category": "briefing",
        "categories": ["briefing"],
        "tags": [],
        "author": "Miss Kim",
        "excerpt": "Second excerpt",
        "updated_at": "2026-07-16 01:00:00",
    },
]


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class ProjectionTests(unittest.TestCase):
    @staticmethod
    def page_from_request(request):
        url = request.full_url if hasattr(request, "full_url") else str(request)
        return int(url.split("page=")[1].split("&")[0])

    def test_fetch_all_posts_follows_pages_and_validates_total(self):
        pages = {
            1: {"page": 1, "limit": 1, "total": 2, "posts": POSTS[:1]},
            2: {"page": 2, "limit": 1, "total": 2, "posts": POSTS[1:]},
        }

        def opener(request, timeout):
            page = self.page_from_request(request)
            return FakeResponse(pages[page])

        result = module.fetch_all_posts("https://example.test", page_size=1, opener=opener)
        self.assertEqual([post["slug"] for post in result], [post["slug"] for post in POSTS])

    def test_fetch_all_posts_rejects_duplicate_slugs(self):
        payload = {"page": 1, "limit": 200, "total": 2, "posts": [POSTS[0], POSTS[0]]}

        with self.assertRaisesRegex(ValueError, "duplicate slug"):
            module.fetch_all_posts(
                "https://example.test",
                opener=lambda url, timeout: FakeResponse(payload),
            )

    def test_fetch_all_posts_rejects_declared_total_mismatch(self):
        pages = {
            1: {"page": 1, "limit": 200, "total": 3, "posts": POSTS},
            2: {"page": 2, "limit": 200, "total": 3, "posts": []},
        }

        def opener(request, timeout):
            page = self.page_from_request(request)
            return FakeResponse(pages[page])

        with self.assertRaisesRegex(ValueError, "declared total"):
            module.fetch_all_posts("https://example.test", opener=opener)

    def test_build_sitemap_preserves_non_post_urls_and_replaces_posts(self):
        existing = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://eastsea.monster/</loc></url>
  <url><loc>https://eastsea.monster/tools/example/</loc></url>
  <url><loc>https://eastsea.monster/view.html?post=stale-post</loc></url>
</urlset>"""
        output = module.build_sitemap(existing, POSTS, "https://eastsea.monster")
        root = ET.fromstring(output)
        locs = [node.text for node in root.findall("{*}url/{*}loc")]

        self.assertIn("https://eastsea.monster/", locs)
        self.assertIn("https://eastsea.monster/tools/example/", locs)
        self.assertNotIn("https://eastsea.monster/view.html?post=stale-post", locs)
        self.assertIn("https://eastsea.monster/view.html?post=2026-07-17-new-post", locs)
        self.assertEqual(sum("view.html?post=" in loc for loc in locs), len(POSTS))

    def test_write_projections_emits_compatible_json_and_valid_feeds(self):
        existing = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://eastsea.monster/</loc></url>
</urlset>"""
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            (output_dir / "sitemap.xml").write_text(existing, encoding="utf-8")
            module.write_projections(output_dir, POSTS, "https://eastsea.monster")

            posts = json.loads((output_dir / "posts.json").read_text(encoding="utf-8"))
            self.assertEqual(posts[0]["filename"], "2026-07-17-new-post.md")
            self.assertEqual(posts[0]["category"], "research")
            self.assertNotIn("content", posts[0])

            rss = ET.parse(output_dir / "rss.xml").getroot()
            atom = ET.parse(output_dir / "atom.xml").getroot()
            feed = ET.parse(output_dir / "feed.xml").getroot()
            self.assertEqual(len(rss.findall("./channel/item")), 2)
            self.assertEqual(len(atom.findall("{*}entry")), 2)
            self.assertEqual(feed.tag, rss.tag)


if __name__ == "__main__":
    unittest.main()
