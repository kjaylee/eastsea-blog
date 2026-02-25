import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, readText, fileExists } from '../setup.mjs';

const indexHtml = readText('index.html');
const viewHtml = readText('view.html');
const toolsManifest = readJSON('tools/manifest.json');
const gamesManifest = readJSON('games/manifest.json');
const novelsManifest = readJSON('novels/manifest.json');
const posts = readJSON('posts.json');

test('tc_iD_01_footer_links_in_index_exist', () => {
  const footerFiles = ['about.html', 'privacy.html', 'terms.html', 'contact.html'];

  for (const relPath of footerFiles) {
    assert.match(indexHtml, new RegExp(`href=["']${relPath}["']`, 'i'), `index.html footer missing link to ${relPath}`);
    assert.ok(fileExists(relPath), `Linked footer file does not exist: ${relPath}`);
  }
});

test('tc_iD_02_hotdeal_link_points_to_existing_hotdeal_index', () => {
  assert.match(indexHtml, /href=["']hotdeal\/["']/i, 'index.html is missing hotdeal link (href="hotdeal/")');
  assert.ok(fileExists('hotdeal/index.html'), 'hotdeal/index.html does not exist');
});

test('tc_iD_03_tool_manifest_urls_map_to_existing_directories', () => {
  for (const tool of toolsManifest.tools) {
    assert.match(tool.url, /^\/tools\/[^/]+\/$/, `Tool URL has invalid format: ${tool.url}`);
    assert.ok(
      fileExists(`tools/${tool.slug}/index.html`),
      `Tool URL ${tool.url} points to missing directory/index: tools/${tool.slug}/index.html`,
    );
  }
});

test('tc_iD_04_game_manifest_urls_map_to_existing_directories', () => {
  for (const game of gamesManifest.games) {
    assert.match(game.url, /^\/games\/[^/]+\/$/, `Game URL has invalid format: ${game.url}`);
    assert.ok(
      fileExists(`games/${game.slug}/index.html`),
      `Game URL ${game.url} points to missing directory/index: games/${game.slug}/index.html`,
    );
  }
});

test('tc_iD_05_novels_directory_has_index_html', () => {
  assert.ok(fileExists('novels/index.html'), 'novels/index.html does not exist');
});

test('tc_iD_06_view_logo_href_points_to_root', () => {
  const hasLogoRootLink = /<a\b[^>]*href=["']\/["'][^>]*class=["'][^"']*logo[^"']*["'][^>]*>/i.test(viewHtml);
  assert.ok(hasLogoRootLink, 'view.html logo link does not point to root (href="/")');
});

test('tc_iD_07_view_back_link_href_points_to_root', () => {
  const hasBackRootLink = /<a\b[^>]*href=["']\/["'][^>]*class=["'][^"']*back-link[^"']*["'][^>]*>/i.test(viewHtml);
  assert.ok(hasBackRootLink, 'view.html back link does not point to root (href="/")');
});

test('tc_iD_08_external_cdn_urls_use_https_in_index_and_view', () => {
  const htmlFiles = [
    { path: 'index.html', html: indexHtml },
    { path: 'view.html', html: viewHtml },
  ];

  for (const { path, html } of htmlFiles) {
    const matches = html.matchAll(/(?:href|src)=["'](https?:\/\/[^"']+)["']/gi);

    for (const match of matches) {
      const url = match[1];
      if (!/cdn|googleapis|gstatic/i.test(url)) continue;
      assert.ok(url.startsWith('https://'), `${path} has non-HTTPS CDN URL: ${url}`);
    }
  }
});

test('tc_iD_09_posts_json_filenames_end_with_md', () => {
  for (const post of posts) {
    assert.match(post.filename, /\.md$/i, `posts.json filename must end with .md: ${post.filename}`);
  }
});

test('tc_iD_10_novel_episode_paths_follow_expected_pattern', () => {
  for (const novel of novelsManifest.novels) {
    for (const episode of novel.episodes) {
      const path = `_data/${novel.slug}-${episode.num}.md`;
      assert.match(
        path,
        /^_data\/[^/]+-\d{3}\.md$/u,
        `Novel episode path format invalid: ${path}`,
      );
    }
  }
});
