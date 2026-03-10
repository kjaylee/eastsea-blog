(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./rules.js'));
    return;
  }
  global.AppPrivacyPresets = factory(global.AppPrivacyRules);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (rules) {
  'use strict';

  if (!rules) {
    throw new Error('AppPrivacyRules dependency is required for presets.js');
  }

  const PRESET_DEFINITIONS = [
    {
      id: 'firebaseAnalytics',
      label: { en: 'Firebase Analytics', ko: 'Firebase Analytics' },
      note: {
        en: 'Prechecks common analytics collection and sharing assumptions for Firebase Analytics.',
        ko: 'Firebase Analytics에서 흔한 수집/공유 가정을 기본 체크합니다.',
      },
      patches: [
        { id: 'deviceId', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
        { id: 'productInteractionUsage', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
        { id: 'performanceData', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
      ],
    },
    {
      id: 'firebaseCrashlytics',
      label: { en: 'Firebase Crashlytics', ko: 'Firebase Crashlytics' },
      note: {
        en: 'Prechecks crash and performance diagnostics typically sent to Crashlytics.',
        ko: 'Crashlytics에서 흔한 크래시/성능 진단 데이터를 기본 체크합니다.',
      },
      patches: [
        { id: 'deviceId', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
        { id: 'crashDataDiagnostics', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
        { id: 'performanceData', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics'] } },
      ],
    },
    {
      id: 'adMob',
      label: { en: 'AdMob', ko: 'AdMob' },
      note: {
        en: 'Prechecks common advertising and tracking data that often needs manual confirmation.',
        ko: '광고/트래킹 관련 자주 쓰이는 데이터 항목을 기본 체크합니다.',
      },
      patches: [
        { id: 'deviceId', values: { collectedBySdk: true, sharedWithThirdParties: true, tracking: true, purposes: ['thirdPartyAdvertising', 'analytics'] } },
        { id: 'advertisingData', values: { collectedBySdk: true, sharedWithThirdParties: true, tracking: true, purposes: ['thirdPartyAdvertising'] } },
        { id: 'productInteractionUsage', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics', 'personalization'] } },
      ],
    },
    {
      id: 'revenueCat',
      label: { en: 'RevenueCat', ko: 'RevenueCat' },
      note: {
        en: 'Prechecks subscription/account data frequently involved in RevenueCat setups.',
        ko: 'RevenueCat 구독/계정 플로우에서 자주 쓰이는 데이터 항목을 기본 체크합니다.',
      },
      patches: [
        { id: 'userId', values: { collectedBySdk: true, sharedWithThirdParties: true, linkedToUser: true, purposes: ['accountManagement', 'appFunctionality'] } },
        { id: 'purchaseHistory', values: { collectedBySdk: true, sharedWithThirdParties: true, linkedToUser: true, purposes: ['accountManagement', 'appFunctionality'] } },
        { id: 'paymentInfoFlag', values: { collectedBySdk: true, sharedWithThirdParties: true, linkedToUser: true, purposes: ['appFunctionality', 'accountManagement'] } },
      ],
    },
    {
      id: 'oneSignal',
      label: { en: 'OneSignal', ko: 'OneSignal' },
      note: {
        en: 'Prechecks notification/engagement defaults often seen in OneSignal projects.',
        ko: 'OneSignal 푸시/리인게이지먼트에서 흔한 데이터 항목을 기본 체크합니다.',
      },
      patches: [
        { id: 'deviceId', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics', 'developerMarketing'] } },
        { id: 'productInteractionUsage', values: { collectedBySdk: true, sharedWithThirdParties: true, purposes: ['analytics', 'developerMarketing'] } },
      ],
    },
    {
      id: 'customNone',
      label: { en: 'Custom / none', ko: '직접 입력 / 없음' },
      note: {
        en: 'Leaves the matrix untouched. Useful when you only want manual edits.',
        ko: '매트릭스를 건드리지 않습니다. 직접 입력만 할 때 사용하세요.',
      },
      patches: [],
    },
  ];

  const PRESET_LOOKUP = PRESET_DEFINITIONS.reduce(function (acc, preset) {
    acc[preset.id] = preset;
    return acc;
  }, Object.create(null));

  const BOOLEAN_FIELDS = [
    'collectedByApp',
    'collectedBySdk',
    'sharedWithThirdParties',
    'linkedToUser',
    'tracking',
    'requiredForCoreFunctionality',
    'userCanOmit',
    'rareOptionalFlowOnly',
    'explicitUserProvidedEachTime',
    'onDeviceOnly',
  ];

  function mergeAnswer(currentAnswer, patchValues) {
    const next = Object.assign({}, currentAnswer);
    BOOLEAN_FIELDS.forEach(function (field) {
      if (patchValues[field] === true) {
        next[field] = true;
      }
    });
    if (Array.isArray(patchValues.purposes) && patchValues.purposes.length) {
      next.purposes = rules.uniqueStrings((next.purposes || []).concat(patchValues.purposes));
    }
    if (patchValues.manualReviewNote) {
      const current = rules.normalizeString(next.manualReviewNote);
      next.manualReviewNote = current ? current + '\n' + patchValues.manualReviewNote : patchValues.manualReviewNote;
    }
    return next;
  }

  function applyPresets(state, presetIds) {
    const next = rules.clone(state);
    const ids = rules.uniqueStrings(presetIds);
    ids.forEach(function (presetId) {
      const preset = PRESET_LOOKUP[presetId];
      if (!preset) return;
      preset.patches.forEach(function (patch) {
        const current = next.data[patch.id] || rules.createEmptyDataAnswer(patch.id);
        next.data[patch.id] = mergeAnswer(current, patch.values || {});
      });
    });
    next.selectedPresets = ids;
    next.meta.lastPresetAppliedAt = new Date().toISOString();
    return next;
  }

  return {
    PRESET_DEFINITIONS: PRESET_DEFINITIONS,
    PRESET_LOOKUP: PRESET_LOOKUP,
    applyPresets: applyPresets,
  };
});
