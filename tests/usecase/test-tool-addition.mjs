import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { BLOG_ROOT, readText } from '../setup.mjs';

let tempDir;

function runBuildManifests() {
  execSync('bash scripts/build-manifests.sh', { cwd: tempDir, stdio: 'pipe' });
  const toolsManifest = JSON.parse(readFileSync(join(tempDir, 'tools', 'manifest.json'), 'utf8'));
  const gamesManifest = JSON.parse(readFileSync(join(tempDir, 'games', 'manifest.json'), 'utf8'));
  return { toolsManifest, gamesManifest };
}

before(() => {
  const tmpRoot = join(BLOG_ROOT, 'tests', '.tmp');
  mkdirSync(tmpRoot, { recursive: true });
  tempDir = mkdtempSync(join(tmpRoot, 'usecase-tool-addition-'));

  mkdirSync(join(tempDir, 'scripts'), { recursive: true });
  writeFileSync(join(tempDir, 'scripts', 'build-manifests.sh'), readText('scripts/build-manifests.sh'));
  chmodSync(join(tempDir, 'scripts', 'build-manifests.sh'), 0o755);

  mkdirSync(join(tempDir, 'tools', 'existing-tool'), { recursive: true });
  writeFileSync(join(tempDir, 'tools', 'existing-tool', 'index.html'), '<!doctype html><html><head><title>Existing Tool | Demo</title></head><body></body></html>');

  mkdirSync(join(tempDir, 'games', 'existing-game'), { recursive: true });
  writeFileSync(join(tempDir, 'games', 'existing-game', 'index.html'), '<!doctype html><html><head><title>Existing Game</title></head><body></body></html>');
});

after(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});

test('tc_tool_addition_01_baseline_manifest_contains_existing_tool', () => {
  const { toolsManifest } = runBuildManifests();
  assert.equal(toolsManifest.tools.length, 1);
  assert.equal(toolsManifest.tools[0].slug, 'existing-tool');
});

test('tc_tool_addition_02_new_tool_is_reflected_after_rebuild', () => {
  mkdirSync(join(tempDir, 'tools', 'new-awesome-tool'), { recursive: true });
  writeFileSync(
    join(tempDir, 'tools', 'new-awesome-tool', 'index.html'),
    '<!doctype html><html><head><title>New Awesome Tool – Eastsea</title></head><body>tool</body></html>'
  );

  const { toolsManifest } = runBuildManifests();
  assert.equal(toolsManifest.tools.length, 2);
  assert.ok(toolsManifest.tools.some((t) => t.slug === 'new-awesome-tool'));
});

test('tc_tool_addition_03_new_tool_manifest_fields_are_valid', () => {
  const { toolsManifest, gamesManifest } = runBuildManifests();
  const entry = toolsManifest.tools.find((t) => t.slug === 'new-awesome-tool');

  assert.equal(entry.url, '/tools/new-awesome-tool/');
  assert.equal(typeof entry.title, 'string');
  assert.ok(entry.title.includes('New Awesome Tool'));
  assert.ok(entry.size > 0);

  // same command should keep games manifest healthy too
  assert.equal(gamesManifest.games.length, 1);
  assert.equal(gamesManifest.games[0].slug, 'existing-game');
});
