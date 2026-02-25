import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, listDir, listSubdirs, fileExists } from '../setup.mjs';

const toolsManifest = readJSON('tools/manifest.json');
const gamesManifest = readJSON('games/manifest.json');
const novelsManifest = readJSON('novels/manifest.json');
const posts = readJSON('posts.json');

const toolDirsWithIndex = listSubdirs('tools').filter(slug => fileExists(`tools/${slug}/index.html`));
const gameDirsWithIndex = listSubdirs('games').filter(slug => fileExists(`games/${slug}/index.html`));
const postFiles = listDir('_posts').filter(name => name.endsWith('.md'));

const EXPECTED_NOVEL_COUNT = 10;

test('tc_iA_01_tools_manifest_count_matches_tool_directories', () => {
  assert.equal(
    toolsManifest.tools.length,
    toolDirsWithIndex.length,
    `tools/manifest.json has ${toolsManifest.tools.length} entries but tools/*/index.html has ${toolDirsWithIndex.length} directories`,
  );
});

test('tc_iA_02_every_tool_manifest_entry_has_directory_with_index', () => {
  for (const tool of toolsManifest.tools) {
    assert.ok(
      fileExists(`tools/${tool.slug}/index.html`),
      `Missing tools/${tool.slug}/index.html for manifest slug "${tool.slug}"`,
    );
  }
});

test('tc_iA_03_every_tool_directory_with_index_is_in_manifest', () => {
  const manifestSlugs = new Set(toolsManifest.tools.map(tool => tool.slug));

  for (const slug of toolDirsWithIndex) {
    assert.ok(
      manifestSlugs.has(slug),
      `Tool directory "tools/${slug}/index.html" is not listed in tools/manifest.json`,
    );
  }
});

test('tc_iA_04_games_manifest_count_matches_game_directories', () => {
  assert.equal(
    gamesManifest.games.length,
    gameDirsWithIndex.length,
    `games/manifest.json has ${gamesManifest.games.length} entries but games/*/index.html has ${gameDirsWithIndex.length} directories`,
  );
});

test('tc_iA_05_every_game_manifest_entry_has_directory_with_index', () => {
  for (const game of gamesManifest.games) {
    assert.ok(
      fileExists(`games/${game.slug}/index.html`),
      `Missing games/${game.slug}/index.html for manifest slug "${game.slug}"`,
    );
  }
});

test('tc_iA_06_novels_manifest_novel_count_matches_expected', () => {
  assert.equal(
    novelsManifest.novels.length,
    EXPECTED_NOVEL_COUNT,
    `Expected ${EXPECTED_NOVEL_COUNT} novels in novels/manifest.json, found ${novelsManifest.novels.length}`,
  );
});

test('tc_iA_07_every_novel_episode_in_manifest_exists_in_filesystem', () => {
  for (const novel of novelsManifest.novels) {
    for (const episode of novel.episodes) {
      const relPath = `novels/_data/${novel.slug}-${episode.num}.md`;
      assert.ok(fileExists(relPath), `Missing episode file: ${relPath}`);
    }
  }
});

test('tc_iA_08_posts_json_count_matches_posts_markdown_count', () => {
  assert.equal(
    posts.length,
    postFiles.length,
    `posts.json has ${posts.length} entries but _posts has ${postFiles.length} markdown files`,
  );
});

test('tc_iA_09_every_post_in_posts_json_has_corresponding_markdown_file', () => {
  for (const post of posts) {
    assert.ok(
      fileExists(`_posts/${post.filename}`),
      `Missing markdown file for posts.json entry: _posts/${post.filename}`,
    );
  }
});

test('tc_iA_10_every_markdown_file_in_posts_is_listed_in_posts_json', () => {
  const postFilenames = new Set(posts.map(post => post.filename));

  for (const file of postFiles) {
    assert.ok(
      postFilenames.has(file),
      `Markdown file "_posts/${file}" exists but is not listed in posts.json`,
    );
  }
});
