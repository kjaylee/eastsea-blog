const test = require('node:test');
const assert = require('node:assert/strict');

const rules = require('./rules.js');
const presets = require('./presets.js');
const wizard = require('./app.js');

function baseState() {
  return wizard.createDefaultState();
}

function setRow(state, id, patch) {
  state.data[id] = Object.assign({}, state.data[id], patch);
  return state;
}

test('TC-01 no collected data produces empty Apple and Google summaries', () => {
  const state = baseState();
  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, true);
  assert.equal(derived.apple.enabled, true);
  assert.equal(derived.google.enabled, true);
  assert.equal(derived.apple.rows.length, 0);
  assert.equal(derived.google.rows.length, 0);
  assert.match(derived.appleText, /No explicit tracking/i);
  assert.match(derived.googleText, /None/i);
});

test('TC-02 Firebase Analytics + Crashlytics populate Apple and Google outputs', () => {
  let state = baseState();
  state.selectedPresets = ['firebaseAnalytics', 'firebaseCrashlytics'];
  state = presets.applyPresets(state, state.selectedPresets);

  const derived = wizard.computeDerived(state, 'en');
  const appleIds = derived.apple.rows.map((row) => row.id).sort();
  const googleIds = derived.google.rows.map((row) => row.id).sort();

  assert.equal(derived.validation.valid, true);
  assert.deepEqual(appleIds, ['crashDataDiagnostics', 'deviceId', 'performanceData', 'productInteractionUsage']);
  assert.deepEqual(googleIds, ['crashDataDiagnostics', 'deviceId', 'performanceData', 'productInteractionUsage']);
  assert.ok(derived.warnings.some((warning) => /SDK presets are only defaults|SDK 프리셋은 기본 추정치/i.test(warning.message)));
});

test('TC-03 AdMob flow triggers tracking risk and shared Google rows', () => {
  let state = baseState();
  state.selectedPresets = ['adMob'];
  state = presets.applyPresets(state, state.selectedPresets);

  const derived = wizard.computeDerived(state, 'en');
  const deviceId = derived.google.rows.find((row) => row.id === 'deviceId');
  const ads = derived.google.rows.find((row) => row.id === 'advertisingData');

  assert.equal(derived.apple.trackingRisk, 'high');
  assert.equal(deviceId.shared, true);
  assert.equal(ads.shared, true);
  assert.ok(derived.appleText.includes('Tracking'));
});

test('TC-04 login-based app with linked identifiers avoids linked contradiction warning', () => {
  const state = baseState();
  state.appProfile.requiresAccountLogin = true;
  setRow(state, 'emailAddress', {
    collectedByApp: true,
    linkedToUser: true,
    purposes: ['accountManagement', 'appFunctionality'],
  });
  setRow(state, 'userId', {
    collectedByApp: true,
    linkedToUser: true,
    purposes: ['accountManagement'],
  });
  setRow(state, 'purchaseHistory', {
    collectedByApp: true,
    linkedToUser: true,
    purposes: ['accountManagement', 'appFunctionality'],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, true);
  assert.equal(derived.apple.rows.length, 3);
  assert.equal(derived.warnings.some((warning) => /requires login/i.test(warning.message)), false);
});

test('TC-05 optional support messages can move into Apple optional candidates', () => {
  const state = baseState();
  setRow(state, 'customerSupportMessages', {
    collectedByApp: true,
    userCanOmit: true,
    rareOptionalFlowOnly: true,
    explicitUserProvidedEachTime: true,
    purposes: ['appFunctionality'],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, true);
  assert.equal(derived.apple.rows.length, 0);
  assert.equal(derived.apple.optionalCandidates.length, 1);
  assert.equal(derived.google.rows.length, 1);
});

test('TC-06 on-device-only location yields warning instead of false certainty', () => {
  const state = baseState();
  state.appHandling.someProcessingOnDeviceOnly = true;
  setRow(state, 'preciseLocation', {
    onDeviceOnly: true,
    purposes: [],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, true);
  assert.equal(derived.apple.rows.length, 0);
  assert.ok(derived.warnings.some((warning) => /on-device-only/i.test(warning.message)));
});

test('TC-07 SDK-only collection still appears in both store outputs', () => {
  const state = baseState();
  setRow(state, 'deviceId', {
    collectedBySdk: true,
    purposes: ['analytics'],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, true);
  assert.equal(derived.apple.rows.length, 1);
  assert.equal(derived.google.rows.length, 1);
  assert.equal(derived.google.rows[0].id, 'deviceId');
});

test('TC-08 purpose tags without collection block export', () => {
  const state = baseState();
  setRow(state, 'deviceId', {
    purposes: ['analytics'],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, false);
  assert.ok(derived.validation.errors.some((error) => /purpose tags but no app or SDK collection source/i.test(error.message)));
});

test('TC-09 shared-with-third-parties contradiction is caught', () => {
  const state = baseState();
  setRow(state, 'deviceId', {
    sharedWithThirdParties: true,
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.equal(derived.validation.valid, false);
  assert.ok(derived.validation.errors.some((error) => /shared with third parties/i.test(error.message)));
});

test('TC-10 JSON export roundtrip preserves normalized answers', () => {
  let state = baseState();
  state.appProfile.appName = 'Orbit Journal';
  state.appProfile.requiresAccountLogin = true;
  state.appHandling.deletionRequestsSupported = true;
  state.selectedPresets = ['firebaseAnalytics', 'adMob'];
  state = presets.applyPresets(state, state.selectedPresets);
  setRow(state, 'emailAddress', {
    collectedByApp: true,
    linkedToUser: true,
    purposes: ['accountManagement'],
  });
  setRow(state, 'coarseLocation', {
    collectedByApp: true,
    sharedWithThirdParties: false,
    purposes: ['appFunctionality'],
  });

  const derived = wizard.computeDerived(state, 'en');
  const json = JSON.stringify(derived.exportBundle, null, 2);
  const parsed = JSON.parse(json);
  const roundtripState = wizard.sanitizeState(parsed.answers);
  const roundtripDerived = wizard.computeDerived(roundtripState, 'en');

  assert.equal(parsed.answers.appProfile.appName, 'Orbit Journal');
  assert.deepEqual(roundtripState.selectedPresets.sort(), ['adMob', 'firebaseAnalytics']);
  assert.equal(roundtripDerived.appleText, derived.appleText);
  assert.equal(roundtripDerived.googleText, derived.googleText);
});

test('TC-11 markdown export contains both store sections and warnings heading', () => {
  const state = baseState();
  state.appProfile.childrenAudience = true;
  setRow(state, 'deviceId', {
    collectedBySdk: true,
    sharedWithThirdParties: true,
    purposes: ['analytics'],
  });

  const derived = wizard.computeDerived(state, 'en');

  assert.match(derived.markdown, /## App Store summary/);
  assert.match(derived.markdown, /## Google Play summary/);
  assert.match(derived.markdown, /## Warnings \/ manual review/);
});

test('TC-12 sanitizeState safely ignores corrupted / unknown data', () => {
  const state = wizard.sanitizeState({
    lang: 'fr',
    activeStep: 99,
    appProfile: { platforms: ['ios', 'android', 'windows'], appType: 'spaceship' },
    selectedPresets: ['firebaseAnalytics', 'madeUpPreset'],
    data: {
      deviceId: { collectedBySdk: true, purposes: ['analytics', 'fakePurpose'] },
    },
  });

  assert.equal(state.lang, 'en');
  assert.equal(state.activeStep, 4);
  assert.deepEqual(state.appProfile.platforms.sort(), ['android', 'ios']);
  assert.deepEqual(state.selectedPresets, ['firebaseAnalytics']);
  assert.deepEqual(state.data.deviceId.purposes, ['analytics']);
});
