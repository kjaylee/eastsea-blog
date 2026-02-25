import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readJSON, readText, loadNovelsApp } from '../setup.mjs';

const manifest = readJSON('novels/manifest.json');
const novels = Array.isArray(manifest.novels) ? manifest.novels : [];
const novelsApp = loadNovelsApp();

function episodeFilePath(slug, num) {
  return `novels/_data/${slug}-${num}.md`;
}

function parseSimpleFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontMatter: {}, body: markdown };

  const frontMatter = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    frontMatter[key] = value;
  }

  return { frontMatter, body: match[2] };
}

test('tc_uD_01_manifest_has_valid_novels_array_structure', () => {
  assert.ok(manifest && typeof manifest === 'object');
  assert.ok(Array.isArray(manifest.novels));
  assert.ok(novels.length > 0);
});

test('tc_uD_02_each_novel_has_slug_title_and_episodes_keys', () => {
  for (const novel of novels) {
    assert.ok(typeof novel.slug === 'string' && novel.slug.length > 0);
    assert.ok(typeof novel.title === 'string');
    assert.ok(Array.isArray(novel.episodes));
  }
});

test('tc_uD_03_episode_numbers_are_sequential_per_novel', () => {
  for (const novel of novels) {
    for (let i = 0; i < novel.episodes.length; i += 1) {
      const expected = String(i + 1).padStart(3, '0');
      assert.equal(novel.episodes[i].num, expected, `${novel.slug} episode sequence broken at ${i + 1}`);
    }
  }
});

test('tc_uD_04_all_episode_markdown_files_exist', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      assert.ok(fileExists(episodeFilePath(novel.slug, episode.num)), `missing: ${novel.slug}-${episode.num}.md`);
    }
  }
});

test('tc_uD_05_all_episode_markdown_files_are_readable', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      const text = readText(episodeFilePath(novel.slug, episode.num));
      assert.ok(typeof text === 'string' && text.length > 0);
    }
  }
});

test('tc_uD_06_episode_front_matter_is_parseable', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      const markdown = readText(episodeFilePath(novel.slug, episode.num));
      const parsed = parseSimpleFrontMatter(markdown);
      assert.ok(Object.keys(parsed.frontMatter).length > 0, `empty front matter: ${novel.slug}-${episode.num}`);
      assert.ok(parsed.body.trim().length > 0, `empty body: ${novel.slug}-${episode.num}`);
    }
  }
});

test('tc_uD_07_episode_dates_are_chronologically_ordered', () => {
  for (const novel of novels) {
    for (let i = 1; i < novel.episodes.length; i += 1) {
      const prev = novel.episodes[i - 1].date;
      const curr = novel.episodes[i].date;
      assert.ok(prev <= curr, `${novel.slug} has out-of-order dates: ${prev} > ${curr}`);
    }
  }
});

test('tc_uD_08_no_duplicate_episode_numbers_within_each_novel', () => {
  for (const novel of novels) {
    const nums = novel.episodes.map((ep) => ep.num);
    const unique = new Set(nums);
    assert.equal(unique.size, nums.length, `duplicate episode num in ${novel.slug}`);
  }
});

test('tc_uD_09_novel_slugs_are_url_safe', () => {
  const unsafePattern = /[\s/?#\\]/u;
  for (const novel of novels) {
    assert.ok(!unsafePattern.test(novel.slug), `unsafe slug: ${novel.slug}`);
    assert.equal(decodeURIComponent(encodeURIComponent(novel.slug)), novel.slug);
  }
});

test('tc_uD_10_cover_path_generation_resolves_to_existing_cover_files', () => {
  for (const novel of novels) {
    const generated = novelsApp.getCoverPath(novel.slug);
    assert.match(generated, /^covers\/.+\.png$/);

    const decoded = decodeURIComponent(generated);
    assert.ok(fileExists(`novels/${decoded}`), `cover not found: ${decoded}`);
  }
});

test('tc_uD_11_episode_titles_are_non_empty_after_cleaning', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      const cleaned = novelsApp.cleanEpisodeTitle(episode.title, episode.num);
      assert.ok(typeof cleaned === 'string' && cleaned.trim().length > 0, `empty cleaned title: ${novel.slug}-${episode.num}`);
    }
  }
});

test('tc_uD_12_manifest_totalEpisodes_matches_episode_array_length', () => {
  for (const novel of novels) {
    assert.equal(novel.totalEpisodes, novel.episodes.length, `totalEpisodes mismatch: ${novel.slug}`);
  }
});
