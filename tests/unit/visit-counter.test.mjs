import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadVisitCounter } from '../setup.mjs';

const visit = loadVisitCounter();

describe('visit counter pure logic', () => {
  it('tc_05_01_normalize_path_keeps_already_normalized_path', () => {
    assert.equal(visit.normalizePath('/tools/calc/'), '/tools/calc/');
  });

  it('tc_05_02_normalize_path_adds_leading_slash', () => {
    assert.equal(visit.normalizePath('tools/calc'), '/tools/calc');
  });

  it('tc_05_03_normalize_path_empty_string_to_root', () => {
    assert.equal(visit.normalizePath(''), '/');
  });

  it('tc_05_04_normalize_path_null_to_root', () => {
    assert.equal(visit.normalizePath(null), '/');
  });

  it('tc_05_05_normalize_path_trims_whitespace', () => {
    assert.equal(visit.normalizePath('  /path  '), '/path');
  });

  it('tc_05_06_create_visitor_id_returns_non_empty_string', () => {
    const id = visit.createVisitorId();
    assert.equal(typeof id, 'string');
    assert.ok(id.length > 0);
  });

  it('tc_05_07_create_visitor_id_returns_unique_values', () => {
    const ids = Array.from({ length: 100 }, () => visit.createVisitorId());
    assert.equal(new Set(ids).size, ids.length);
  });

  it('tc_05_08_create_visitor_id_matches_expected_format', () => {
    const id = visit.createVisitorId();
    assert.match(id, /^[a-z0-9]+-[a-z0-9]+$/);
  });
});
