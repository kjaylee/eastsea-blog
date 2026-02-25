import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readText } from '../setup.mjs';

const scriptPath = 'assets/js/visit-counter.js';
const src = fileExists(scriptPath) ? readText(scriptPath) : '';

test('tc_visit_counter_01_script_exists_and_has_default_api_base', () => {
  assert.ok(fileExists(scriptPath));
  assert.match(src, /const\s+API_BASE\s*=\s*window\.VISIT_COUNTER_API_BASE\s*\|\|\s*'https:\/\/api\.eastsea\.xyz'/);
});

test('tc_visit_counter_02_track_and_stats_endpoints_are_defined', () => {
  assert.match(src, /\/api\/visit\/track\?path=/);
  assert.match(src, /\/api\/visit\/stats\?path=/);
});

test('tc_visit_counter_03_track_request_uses_post_and_visitor_id_payload', () => {
  assert.match(src, /method:\s*'POST'/);
  assert.match(src, /headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}/);
  assert.match(src, /body:\s*JSON\.stringify\(\{\s*visitorId\s*\}\)/);
  assert.match(src, /keepalive:\s*true/);
});

test('tc_visit_counter_04_public_api_exports_are_available', () => {
  assert.match(src, /window\.visitCounter\s*=\s*\{/);
  assert.match(src, /track,/);
  assert.match(src, /getStats,/);
  assert.match(src, /renderCounts,/);
  assert.match(src, /visitorId/);
});
