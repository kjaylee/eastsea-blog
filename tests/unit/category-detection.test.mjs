import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadPostsJsonGenerator, readJSON } from '../setup.mjs';

const postsGen = loadPostsJsonGenerator();
const validCategories = new Set(['briefing', 'digest', 'report', 'journal', 'research', 'polish', 'upgrade', 'other']);

describe('category detection', () => {
  it('tc_04_01_detect_category_from_front_matter_briefing', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-anything.md', 'briefing'), 'briefing');
  });

  it('tc_04_02_detect_category_from_front_matter_digest', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-anything.md', 'digest'), 'digest');
  });

  it('tc_04_03_detect_category_from_front_matter_report', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-anything.md', 'report'), 'report');
  });

  it('tc_04_04_detect_category_front_matter_diary_maps_to_journal', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-anything.md', 'diary'), 'journal');
  });

  it('tc_04_05_detect_category_from_front_matter_research', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-anything.md', 'research'), 'research');
  });

  it('tc_04_06_detect_category_from_filename_briefing_fallback', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-briefing-topic.md', ''), 'briefing');
  });

  it('tc_04_07_detect_category_from_filename_polish_fallback', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-game-polish.md', null), 'polish');
  });

  it('tc_04_08_detect_category_from_filename_upgrade_fallback', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-engine-upgrade.md', undefined), 'upgrade');
  });

  it('tc_04_09_detect_category_no_match_returns_other', () => {
    assert.equal(postsGen.detectCategory('2026-02-05-random-topic.md', ''), 'other');
  });

  it('tc_04_10_detect_category_front_matter_priority_over_filename', () => {
    const out = postsGen.detectCategory('2026-02-05-briefing-topic.md', 'digest');
    assert.equal(out, 'digest');
  });

  it('tc_04_11_detect_category_case_insensitive_front_matter', () => {
    const out = postsGen.detectCategory('2026-02-05-random.md', 'BrIeFiNg, Something');
    assert.equal(out, 'briefing');
  });

  it('tc_04_12_detect_category_all_real_posts_categories_are_valid', () => {
    const posts = readJSON('posts.json');
    const categories = new Set(posts.map((post) => post.category));

    for (const cat of categories) {
      assert.ok(validCategories.has(cat), `unexpected category found: ${cat}`);
    }
  });
});
