const test = require('node:test');
const assert = require('node:assert/strict');
const tool = require('./app.js');

test('validation passes for valid iPhone-only config', () => {
  const result = tool.validateConfig({
    appName: 'Test',
    languagesCount: 3,
    iphoneScreenshots: 5,
    supportsIpad: false,
  });
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test('validation fails when languages are below 1', () => {
  const result = tool.validateConfig({
    languagesCount: 0,
    iphoneScreenshots: 5,
  });
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Languages/);
});

test('validation fails when iPhone screenshots are out of range', () => {
  const result = tool.validateConfig({
    languagesCount: 1,
    iphoneScreenshots: 11,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((msg) => /iPhone screenshots/.test(msg)));
});

test('validation fails when iPad support is enabled without valid iPad count', () => {
  const result = tool.validateConfig({
    languagesCount: 1,
    iphoneScreenshots: 5,
    supportsIpad: true,
    ipadScreenshots: 0,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((msg) => /iPad screenshots/.test(msg)));
});

test('requirement summary returns iPhone only when iPad is off', () => {
  const result = tool.summarizeRequirements({
    languagesCount: 2,
    iphoneScreenshots: 4,
    supportsIpad: false,
  });
  assert.equal(result.requiredSets.length, 1);
  assert.equal(result.totalScreenshots, 8);
});

test('requirement summary returns iPhone and iPad totals correctly', () => {
  const result = tool.summarizeRequirements({
    languagesCount: 3,
    iphoneScreenshots: 5,
    supportsIpad: true,
    ipadScreenshots: 4,
  });
  assert.equal(result.requiredSets.length, 2);
  assert.equal(result.totalScreenshots, 27);
  assert.equal(result.screenshotsPerLocale, 9);
});

test('unchecked critical items generate blockers', () => {
  const result = tool.computeChecklist({
    languagesCount: 1,
    iphoneScreenshots: 5,
    supportsIpad: false,
  }, {
    'first-three-story': true,
    'one-message-per-screen': true,
  });
  assert.ok(result.blockerCount > 0);
  assert.equal(result.verdict, 'Blocked');
});

test('all applicable items checked yields ready verdict', () => {
  const config = {
    appName: 'Ready App',
    languagesCount: 2,
    iphoneScreenshots: 5,
    supportsIpad: true,
    ipadScreenshots: 4,
  };
  const checked = {};
  tool.getApplicableItems(config).forEach((item) => {
    checked[item.id] = true;
  });
  const result = tool.computeChecklist(config, checked);
  assert.equal(result.blockerCount, 0);
  assert.equal(result.verdict, 'Ready to review');
  assert.equal(result.score, 100);
});

test('score can be high-ish but verdict stays blocked with critical misses', () => {
  const config = {
    appName: 'Risky App',
    languagesCount: 1,
    iphoneScreenshots: 5,
    supportsIpad: false,
  };
  const checked = {
    'first-three-story': true,
    'one-message-per-screen': true,
    'text-legible': true,
    'feature-proof': true,
    'source-files-organized': true,
    'upload-order-ready': true,
    'stakeholder-review': true,
  };
  const result = tool.computeChecklist(config, checked);
  assert.equal(result.verdict, 'Blocked');
  assert.ok(result.score > 0);
  assert.ok(result.blockerCount >= 1);
});

test('markdown report contains app name, score, blockers and total screenshots', () => {
  const config = {
    appName: 'FocusFrame Camera',
    languagesCount: 3,
    iphoneScreenshots: 5,
    supportsIpad: true,
    ipadScreenshots: 4,
    notes: 'Ship after caption pass.',
  };
  const checked = {
    'iphone-set-ready': true,
    'counts-valid': true,
    'formats-valid': true,
  };
  const markdown = tool.buildMarkdownReport(config, checked);
  assert.match(markdown, /FocusFrame Camera/);
  assert.match(markdown, /Total screenshots: 27/);
  assert.match(markdown, /Score:/);
  assert.match(markdown, /Blockers:/);
  assert.match(markdown, /Ship after caption pass/);
});
