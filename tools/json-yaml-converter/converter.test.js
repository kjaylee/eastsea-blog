/**
 * converter.test.js — Node-runnable tests for JSON ↔ YAML Converter
 * Run with: node converter.test.js
 */
'use strict';

const Converter = require('./converter');
const { jsonToYaml, yamlToJson, detectType } = Converter;

let passed = 0;
let failed = 0;

function assert(label, condition, extra) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${extra ? ' → ' + extra : ''}`);
    failed++;
  }
}

function assertEq(label, actual, expected) {
  assert(label, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

// ── AC1: JSON → YAML ──────────────────────────────────────────────────────
console.log('\n[AC1] Valid JSON → YAML');
{
  const input = JSON.stringify({ name: 'Alice', age: 30 });
  const { result, error } = jsonToYaml(input, 2);
  assert('no error', error === null);
  assert('contains "name: Alice"', result.includes('name: "Alice"') || result.includes("name: Alice"), result);
  assert('contains "age: 30"', result.includes('age: 30'), result);
}

// ── AC2: YAML → JSON ──────────────────────────────────────────────────────
console.log('\n[AC2] Valid YAML → JSON');
{
  const yaml = 'name: Bob\nage: 25\n';
  const { result, error } = yamlToJson(yaml, 2);
  assert('no error', error === null);
  const obj = JSON.parse(result);
  assertEq('name === Bob', obj.name, 'Bob');
  assertEq('age === 25', obj.age, 25);
}

// ── AC3: Invalid input shows error ────────────────────────────────────────
console.log('\n[AC3] Invalid inputs');
{
  const { error } = jsonToYaml('{bad json}', 2);
  assert('JSON error message present', typeof error === 'string' && error.length > 0, error);
}
{
  const { error } = yamlToJson(':\tbad\tyaml\t:::', 2);
  assert('YAML error message present', typeof error === 'string' && error.length > 0, error);
}

// ── AC6: Sample data round-trip ───────────────────────────────────────────
console.log('\n[AC6] Sample data round-trip');
{
  const sample = {
    project: 'EastSea Tools',
    version: '1.0.0',
    features: ['converter', 'formatter', 'validator'],
    meta: { author: 'Jay', active: true }
  };
  const jsonStr = JSON.stringify(sample, null, 2);
  const { result: yaml, error: e1 } = jsonToYaml(jsonStr, 2);
  assert('JSON→YAML no error', e1 === null, e1);

  const { result: jsonBack, error: e2 } = yamlToJson(yaml, 2);
  assert('YAML→JSON no error', e2 === null, e2);

  const roundTrip = JSON.parse(jsonBack);
  assertEq('version round-trip', roundTrip.version, '1.0.0');
  assertEq('meta.author round-trip', roundTrip.meta.author, 'Jay');
  assertEq('features[1]', roundTrip.features[1], 'formatter');
}

// ── AC7: Nested objects 5+ levels deep ───────────────────────────────────
console.log('\n[AC7] Nested objects (5+ levels)');
{
  const deep = { a: { b: { c: { d: { e: { f: 42 } } } } } };
  const { result: yaml, error: e1 } = jsonToYaml(JSON.stringify(deep), 4);
  assert('no error (4-space indent)', e1 === null, e1);

  const { result: jsonBack, error: e2 } = yamlToJson(yaml, 4);
  assert('no YAML→JSON error', e2 === null, e2);

  const parsed = JSON.parse(jsonBack);
  assertEq('nested value preserved', parsed.a.b.c.d.e.f, 42);
}

// ── AC8: Arrays of mixed types ────────────────────────────────────────────
console.log('\n[AC8] Arrays of mixed types');
{
  const mixed = { arr: [1, 'two', true, null, { key: 'val' }] };
  const { result: yaml, error: e1 } = jsonToYaml(JSON.stringify(mixed), 2);
  assert('mixed array JSON→YAML no error', e1 === null, e1);

  const { result: jsonBack, error: e2 } = yamlToJson(yaml, 2);
  assert('mixed array YAML→JSON no error', e2 === null, e2);

  const parsed = JSON.parse(jsonBack);
  assertEq('arr[0] === 1', parsed.arr[0], 1);
  assertEq('arr[1] === "two"', parsed.arr[1], 'two');
  assertEq('arr[2] === true', parsed.arr[2], true);
  assert('arr[3] === null', parsed.arr[3] === null);
  assertEq('arr[4].key', parsed.arr[4].key, 'val');
}

// ── detectType ────────────────────────────────────────────────────────────
console.log('\n[detectType]');
{
  assertEq('JSON object → json', detectType('{"x":1}'), 'json');
  assertEq('JSON array → json', detectType('[1,2,3]'), 'json');
  assertEq('YAML key: val → yaml', detectType('key: value'), 'yaml');
  assertEq('empty → unknown', detectType(''), 'unknown');
}

// ── Indentation 2 vs 4 ───────────────────────────────────────────────────
console.log('\n[Indentation]');
{
  const obj = { a: { b: 1 } };
  const { result: y2 } = jsonToYaml(JSON.stringify(obj), 2);
  const { result: y4 } = jsonToYaml(JSON.stringify(obj), 4);
  // 4-space YAML should have more leading spaces than 2-space
  const leading2 = (y2.match(/^  b:/m) || [''])[0].length;
  const leading4 = (y4.match(/^    b:/m) || [''])[0].length;
  assert('4-space indent wider than 2-space', leading4 > leading2, `2=${leading2} 4=${leading4}`);
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Total: ${passed + failed}  ✅ ${passed}  ❌ ${failed}`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed.');
}
