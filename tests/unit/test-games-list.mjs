import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_ROOT } from '../setup.mjs';

const gamesListPath = join(BLOG_ROOT, '..', 'games', 'games-list.json');
const hasGamesList = existsSync(gamesListPath);
const gamesList = hasGamesList ? JSON.parse(readFileSync(gamesListPath, 'utf8')) : [];

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

test('tc_games_list_01_file_exists_when_expected', { skip: !hasGamesList }, () => {
  assert.ok(hasGamesList);
});

test('tc_games_list_02_top_level_is_non_empty_array', { skip: !hasGamesList }, () => {
  assert.ok(Array.isArray(gamesList));
  assert.ok(gamesList.length > 0);
});

test('tc_games_list_03_required_fields_exist', { skip: !hasGamesList }, () => {
  for (const game of gamesList) {
    assert.equal(typeof game.id, 'string');
    assert.equal(typeof game.title, 'string');
    assert.equal(typeof game.desc, 'string');
    assert.equal(typeof game.cat, 'string');
    assert.ok(Array.isArray(game.tags));
    assert.equal(typeof game.added, 'string');
  }
});

test('tc_games_list_04_id_is_unique', { skip: !hasGamesList }, () => {
  const seen = new Set();
  for (const game of gamesList) {
    assert.ok(!seen.has(game.id), `Duplicate game id: ${game.id}`);
    seen.add(game.id);
  }
});

test('tc_games_list_05_added_date_is_valid', { skip: !hasGamesList }, () => {
  for (const game of gamesList) {
    assert.ok(isDate(game.added), `Invalid added date for ${game.id}: ${game.added}`);
  }
});

test('tc_games_list_06_tags_and_polished_type_are_valid', { skip: !hasGamesList }, () => {
  for (const game of gamesList) {
    assert.ok(game.tags.length > 0, `No tags for ${game.id}`);
    for (const tag of game.tags) {
      assert.equal(typeof tag, 'string');
      assert.ok(tag.trim().length > 0);
    }
    assert.equal(typeof game.polished, 'boolean', `polished must be boolean: ${game.id}`);
  }
});
