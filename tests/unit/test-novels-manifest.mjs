import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readJSON } from '../setup.mjs';

const manifest = readJSON('novels/manifest.json');
const novels = manifest.novels;

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

test('tc_novels_manifest_01_has_valid_root_shape', () => {
  assert.equal(typeof manifest, 'object');
  assert.equal(typeof manifest.generatedAt, 'string');
  assert.ok(Array.isArray(novels));
  assert.ok(novels.length > 0);
});

test('tc_novels_manifest_02_novel_required_fields_exist', () => {
  for (const novel of novels) {
    assert.equal(typeof novel.slug, 'string');
    assert.equal(typeof novel.title, 'string');
    assert.equal(typeof novel.author, 'string');
    assert.ok(Array.isArray(novel.genre));
    assert.equal(typeof novel.status, 'string');
    assert.equal(typeof novel.totalEpisodes, 'number');
    assert.equal(typeof novel.latestDate, 'string');
    assert.ok(Array.isArray(novel.episodes));
  }
});

test('tc_novels_manifest_03_slug_is_unique', () => {
  const seen = new Set();
  for (const novel of novels) {
    assert.ok(!seen.has(novel.slug), `Duplicate novel slug: ${novel.slug}`);
    seen.add(novel.slug);
  }
});

test('tc_novels_manifest_04_total_episodes_matches_length', () => {
  for (const novel of novels) {
    assert.equal(novel.totalEpisodes, novel.episodes.length, `Episode count mismatch: ${novel.slug}`);
  }
});

test('tc_novels_manifest_05_episode_fields_are_valid', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      assert.match(String(episode.num), /^\d{3}$/);
      assert.ok(isDate(String(episode.date)), `Invalid episode date: ${novel.slug}#${episode.num}`);
    }
  }
});

test('tc_novels_manifest_06_episode_files_exist', () => {
  for (const novel of novels) {
    for (const episode of novel.episodes) {
      const path = `novels/_data/${novel.slug}-${episode.num}.md`;
      assert.ok(fileExists(path), `Missing novel file: ${path}`);
    }
  }
});

test('tc_novels_manifest_07_latest_date_is_max_episode_date', () => {
  for (const novel of novels) {
    const maxDate = novel.episodes
      .map((ep) => String(ep.date))
      .sort()
      .at(-1);
    assert.equal(novel.latestDate, maxDate, `latestDate mismatch: ${novel.slug}`);
  }
});
