import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { fileExists, listDir, listSubdirs, readJSON } from '../setup.mjs';

const posts = readJSON('posts.json');
const postFiles = listDir('_posts').filter((name) => name.endsWith('.md'));
const toolsManifest = readJSON('tools/manifest.json');
const gamesManifest = readJSON('games/manifest.json');

const UPDATE_POSTS = 'update-posts.sh';
const BUILD_MANIFESTS = 'scripts/build-manifests.sh';

test('tc_uF_01_update_posts_script_exists', () => {
  assert.ok(fileExists(UPDATE_POSTS));
});

test('tc_uF_02_update_posts_script_is_executable', () => {
  const mode = statSync(UPDATE_POSTS).mode;
  assert.ok((mode & 0o111) !== 0, `${UPDATE_POSTS} is not executable`);
});

test('tc_uF_03_build_manifests_script_exists', () => {
  assert.ok(fileExists(BUILD_MANIFESTS));
});

test('tc_uF_04_build_manifests_script_is_executable', () => {
  const mode = statSync(BUILD_MANIFESTS).mode;
  assert.ok((mode & 0o111) !== 0, `${BUILD_MANIFESTS} is not executable`);
});

test('tc_uF_05_posts_json_count_matches_posts_markdown_count', () => {
  assert.equal(posts.length, postFiles.length);
});

test('tc_uF_06_tools_manifest_count_matches_tool_directory_count', () => {
  const toolDirs = listSubdirs('tools');
  assert.equal(toolsManifest.tools.length, toolDirs.length);
});

test('tc_uF_07_games_manifest_count_matches_game_directory_count', () => {
  const gameDirs = listSubdirs('games');
  assert.equal(gamesManifest.games.length, gameDirs.length);
});

test('tc_uF_08_no_orphaned_posts_in_posts_directory', () => {
  const postSet = new Set(posts.map((post) => post.filename));
  const orphaned = postFiles.filter((filename) => !postSet.has(filename));
  assert.equal(orphaned.length, 0, `orphaned posts: ${orphaned.join(', ')}`);
});

test('tc_uF_09_no_phantom_posts_in_posts_json', () => {
  const fileSet = new Set(postFiles);
  const phantom = posts.filter((post) => !fileSet.has(post.filename)).map((post) => post.filename);
  assert.equal(phantom.length, 0, `phantom posts: ${phantom.join(', ')}`);
});

test('tc_uF_10_all_post_filenames_follow_convention', () => {
  const filenameRe = /^\d{4}-\d{2}-\d{2}-.+\.md$/;

  for (const filename of postFiles) {
    assert.match(filename, filenameRe, `invalid _posts filename: ${filename}`);
  }

  for (const post of posts) {
    assert.match(post.filename, filenameRe, `invalid posts.json filename: ${post.filename}`);
  }
});
