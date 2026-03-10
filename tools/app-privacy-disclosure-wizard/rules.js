(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.AppPrivacyRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RULES_REVIEWED_AT = '2026-03-10';
  const PLATFORM_OPTIONS = [
    { id: 'ios', label: { en: 'iOS / App Store', ko: 'iOS / 앱스토어' } },
    { id: 'android', label: { en: 'Android / Google Play', ko: 'Android / 구글 플레이' } },
  ];

  const APP_TYPE_OPTIONS = [
    { id: 'consumer', label: { en: 'Consumer app', ko: '소비자 앱' } },
    { id: 'utility', label: { en: 'Utility', ko: '유틸리티' } },
    { id: 'commerce', label: { en: 'Commerce', ko: '커머스' } },
    { id: 'content', label: { en: 'Content', ko: '콘텐츠' } },
    { id: 'game', label: { en: 'Game', ko: '게임' } },
    { id: 'other', label: { en: 'Other', ko: '기타' } },
  ];

  const PURPOSE_OPTIONS = [
    { id: 'appFunctionality', label: { en: 'App functionality', ko: '앱 기능 제공' } },
    { id: 'analytics', label: { en: 'Analytics', ko: '분석' } },
    { id: 'developerMarketing', label: { en: 'Developer marketing', ko: '개발사 마케팅' } },
    { id: 'thirdPartyAdvertising', label: { en: 'Third-party advertising', ko: '제3자 광고' } },
    { id: 'fraudSecurity', label: { en: 'Fraud prevention / security', ko: '사기 방지 / 보안' } },
    { id: 'personalization', label: { en: 'Personalization', ko: '개인화' } },
    { id: 'accountManagement', label: { en: 'Account management', ko: '계정 관리' } },
    { id: 'other', label: { en: 'Other', ko: '기타' } },
  ];

  const DATA_TYPES = [
    { id: 'name', label: { en: 'Name', ko: '이름' } },
    { id: 'emailAddress', label: { en: 'Email address', ko: '이메일 주소' } },
    { id: 'userId', label: { en: 'User ID / account ID', ko: '사용자 ID / 계정 ID' } },
    { id: 'deviceId', label: { en: 'Device ID', ko: '기기 ID' } },
    { id: 'purchaseHistory', label: { en: 'Purchase history', ko: '구매 이력' } },
    { id: 'paymentInfoFlag', label: { en: 'Payment info flag', ko: '결제정보 보유 여부' } },
    { id: 'productInteractionUsage', label: { en: 'Product interaction / usage', ko: '제품 상호작용 / 사용 데이터' } },
    { id: 'crashDataDiagnostics', label: { en: 'Crash data / diagnostics', ko: '크래시 데이터 / 진단' } },
    { id: 'performanceData', label: { en: 'Performance data', ko: '성능 데이터' } },
    { id: 'advertisingData', label: { en: 'Advertising data', ko: '광고 데이터' } },
    { id: 'coarseLocation', label: { en: 'Coarse location', ko: '대략적 위치' } },
    { id: 'preciseLocation', label: { en: 'Precise location', ko: '정확한 위치' } },
    { id: 'contacts', label: { en: 'Contacts', ko: '연락처' } },
    { id: 'photosVideos', label: { en: 'Photos / videos', ko: '사진 / 비디오' } },
    { id: 'audioData', label: { en: 'Audio data', ko: '오디오 데이터' } },
    { id: 'customerSupportMessages', label: { en: 'Customer support messages', ko: '고객지원 메시지' } },
    { id: 'otherUserContent', label: { en: 'Other user content', ko: '기타 사용자 콘텐츠' } },
  ];

  const LIKELY_LINKED_DATA_IDS = new Set([
    'name',
    'emailAddress',
    'userId',
    'purchaseHistory',
    'paymentInfoFlag',
    'customerSupportMessages',
  ]);

  const PURPOSE_LOOKUP = PURPOSE_OPTIONS.reduce(function (acc, item) {
    acc[item.id] = item;
    return acc;
  }, Object.create(null));

  const DATA_TYPE_LOOKUP = DATA_TYPES.reduce(function (acc, item) {
    acc[item.id] = item;
    return acc;
  }, Object.create(null));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getLabel(item, lang) {
    if (!item) return '';
    return item.label && item.label[lang] ? item.label[lang] : item.label.en;
  }

  function getPurposeLabel(id, lang) {
    return getLabel(PURPOSE_LOOKUP[id], lang);
  }

  function getDataTypeLabel(id, lang) {
    return getLabel(DATA_TYPE_LOOKUP[id], lang);
  }

  function createEmptyDataAnswer(id) {
    return {
      id: id,
      collectedByApp: false,
      collectedBySdk: false,
      sharedWithThirdParties: false,
      linkedToUser: false,
      tracking: false,
      purposes: [],
      requiredForCoreFunctionality: false,
      userCanOmit: false,
      rareOptionalFlowOnly: false,
      explicitUserProvidedEachTime: false,
      onDeviceOnly: false,
      manualReviewNote: '',
    };
  }

  function createEmptyDataMap() {
    const map = {};
    DATA_TYPES.forEach(function (item) {
      map[item.id] = createEmptyDataAnswer(item.id);
    });
    return map;
  }

  function normalizeArray(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(Boolean);
  }

  function normalizeString(value) {
    return String(value || '').trim();
  }

  function uniqueStrings(values) {
    return Array.from(new Set(normalizeArray(values).map(function (item) { return String(item); }))).filter(Boolean);
  }

  function isCollected(answer) {
    return Boolean(answer && (answer.collectedByApp || answer.collectedBySdk));
  }

  function hasAdvertisingPurpose(answer) {
    return Boolean(answer && normalizeArray(answer.purposes).some(function (purposeId) {
      return purposeId === 'thirdPartyAdvertising' || purposeId === 'developerMarketing';
    }));
  }

  function optionalDisclosureStatus(answer) {
    if (!answer || !isCollected(answer)) {
      return { status: 'none', note: '' };
    }

    const noTracking = !answer.tracking;
    const noMarketingPurpose = !normalizeArray(answer.purposes).some(function (purposeId) {
      return purposeId === 'developerMarketing' || purposeId === 'thirdPartyAdvertising';
    });
    const optionalFlow = Boolean(answer.rareOptionalFlowOnly);
    const explicitInput = Boolean(answer.explicitUserProvidedEachTime);
    const canOmit = Boolean(answer.userCanOmit);

    if (noTracking && noMarketingPurpose && optionalFlow && explicitInput && canOmit) {
      return {
        status: 'candidate',
        note: 'May qualify for Apple optional disclosure omission. Confirm the real flow before omitting.',
      };
    }

    const partialSignals = [optionalFlow, explicitInput, canOmit].filter(Boolean).length;
    if (partialSignals > 0) {
      return {
        status: 'warning',
        note: 'Optional-disclosure criteria are only partially satisfied. Keep this in scope until manually reviewed.',
      };
    }

    return { status: 'none', note: '' };
  }

  function validateState(state) {
    const errors = [];
    const platforms = normalizeArray(state && state.appProfile && state.appProfile.platforms);
    if (!platforms.length) {
      errors.push({
        code: 'platform-required',
        message: 'Select at least one platform before exporting.',
      });
    }

    DATA_TYPES.forEach(function (type) {
      const answer = state && state.data ? state.data[type.id] : null;
      if (!answer) return;
      const purposes = uniqueStrings(answer.purposes);
      const collected = isCollected(answer);
      if (purposes.length && !collected) {
        errors.push({
          code: 'purpose-without-collection',
          dataTypeId: type.id,
          message: getDataTypeLabel(type.id, 'en') + ' has purpose tags but no app or SDK collection source.',
        });
      }
      if (answer.sharedWithThirdParties && !collected) {
        errors.push({
          code: 'shared-without-collection',
          dataTypeId: type.id,
          message: getDataTypeLabel(type.id, 'en') + ' is marked shared with third parties but no collection source is enabled.',
        });
      }
      if (answer.tracking && !hasAdvertisingPurpose(answer) && !normalizeString(answer.manualReviewNote)) {
        errors.push({
          code: 'tracking-without-ad-purpose',
          dataTypeId: type.id,
          message: getDataTypeLabel(type.id, 'en') + ' is marked for tracking, but no advertising purpose or manual override note is present.',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  function buildAppleSummary(state, lang) {
    const labelsLang = lang || 'en';
    const enabled = normalizeArray(state && state.appProfile && state.appProfile.platforms).indexOf('ios') !== -1;
    if (!enabled) {
      return {
        enabled: false,
        trackingRisk: 'not-selected',
        rows: [],
        optionalCandidates: [],
      };
    }

    const rows = [];
    const optionalCandidates = [];
    let tracking = false;

    DATA_TYPES.forEach(function (type) {
      const answer = state.data[type.id];
      if (!isCollected(answer)) return;
      const optional = optionalDisclosureStatus(answer);
      const row = {
        id: type.id,
        label: getDataTypeLabel(type.id, labelsLang),
        purposes: uniqueStrings(answer.purposes).map(function (purposeId) {
          return getPurposeLabel(purposeId, labelsLang);
        }),
        linkedToUser: Boolean(answer.linkedToUser),
        tracking: Boolean(answer.tracking),
        sources: [answer.collectedByApp ? (labelsLang === 'ko' ? '앱' : 'App') : null, answer.collectedBySdk ? 'SDK' : null].filter(Boolean),
        optionalStatus: optional.status,
        optionalNote: optional.note,
      };
      if (row.tracking) tracking = true;
      if (optional.status === 'candidate') {
        optionalCandidates.push(row);
      } else {
        rows.push(row);
      }
    });

    return {
      enabled: true,
      trackingRisk: tracking ? 'high' : 'clear',
      rows: rows,
      optionalCandidates: optionalCandidates,
    };
  }

  function buildGoogleSummary(state, lang) {
    const labelsLang = lang || 'en';
    const enabled = normalizeArray(state && state.appProfile && state.appProfile.platforms).indexOf('android') !== -1;
    if (!enabled) {
      return {
        enabled: false,
        rows: [],
        encryptedInTransit: Boolean(state && state.appHandling && state.appHandling.encryptedInTransit),
        deletionRequestsSupported: Boolean(state && state.appHandling && state.appHandling.deletionRequestsSupported),
      };
    }

    const rows = [];
    DATA_TYPES.forEach(function (type) {
      const answer = state.data[type.id];
      if (!isCollected(answer)) return;
      rows.push({
        id: type.id,
        label: getDataTypeLabel(type.id, labelsLang),
        collected: true,
        shared: Boolean(answer.sharedWithThirdParties),
        bySdk: Boolean(answer.collectedBySdk),
        purposes: uniqueStrings(answer.purposes).map(function (purposeId) {
          return getPurposeLabel(purposeId, labelsLang);
        }),
      });
    });

    return {
      enabled: true,
      rows: rows,
      encryptedInTransit: Boolean(state.appHandling.encryptedInTransit),
      deletionRequestsSupported: Boolean(state.appHandling.deletionRequestsSupported),
    };
  }

  function deriveReviewWarnings(state, selectedPresetIds, lang) {
    const labelsLang = lang || 'en';
    const warnings = [];
    const presetIds = uniqueStrings(selectedPresetIds);

    if (presetIds.length) {
      warnings.push({
        code: 'preset-review',
        severity: 'info',
        message: labelsLang === 'ko'
          ? 'SDK 프리셋은 기본 추정치입니다. 실제 구현과 콘솔 설정을 반드시 다시 검토하세요.'
          : 'SDK presets are only defaults. Review them against your real implementation and console settings.',
      });
    }

    if (state.appProfile.childrenAudience && !state.appProfile.childrenManualReviewComplete) {
      warnings.push({
        code: 'family-review-needed',
        severity: 'high',
        message: labelsLang === 'ko'
          ? '가족/아동 대상 앱으로 표시했지만 별도 수동 검토 완료가 체크되지 않았습니다.'
          : 'Family / kids audience is enabled, but manual review confirmation is still missing.',
      });
    }

    DATA_TYPES.forEach(function (type) {
      const answer = state.data[type.id];
      const label = getDataTypeLabel(type.id, labelsLang);
      if (!answer) return;

      if (normalizeArray(answer.purposes).indexOf('thirdPartyAdvertising') !== -1 && !answer.tracking) {
        warnings.push({
          code: 'ad-purpose-without-tracking',
          severity: 'high',
          dataTypeId: type.id,
          message: labelsLang === 'ko'
            ? label + '에 제3자 광고 목적이 선택되었지만 tracking은 꺼져 있습니다. Apple 답변을 다시 확인하세요.'
            : label + ' uses a third-party advertising purpose while tracking is still marked false. Re-check the Apple answer.',
        });
      }

      if (state.appProfile.requiresAccountLogin && LIKELY_LINKED_DATA_IDS.has(type.id) && isCollected(answer) && !answer.linkedToUser) {
        warnings.push({
          code: 'linked-contradiction',
          severity: 'medium',
          dataTypeId: type.id,
          message: labelsLang === 'ko'
            ? '로그인 기반 앱인데 ' + label + '이(가) linked to user = 아니오로 되어 있습니다.'
            : 'The app requires login, but ' + label + ' is still marked as not linked to the user.',
        });
      }

      if (state.appHandling.someProcessingOnDeviceOnly && answer.onDeviceOnly && isCollected(answer)) {
        warnings.push({
          code: 'on-device-mixed',
          severity: 'medium',
          dataTypeId: type.id,
          message: labelsLang === 'ko'
            ? label + '은(는) on-device only와 수집/전송 응답이 동시에 선택되어 있습니다. 실제 전송 경로를 다시 점검하세요.'
            : label + ' is marked both on-device-only and collected/transmitted. Check the real data flow.',
        });
      }

      if (state.appHandling.someProcessingOnDeviceOnly && answer.onDeviceOnly && !isCollected(answer)) {
        warnings.push({
          code: 'on-device-review',
          severity: 'info',
          dataTypeId: type.id,
          message: labelsLang === 'ko'
            ? label + '은(는) on-device only로 제외되었습니다. 실제로 기기 밖 전송이 없는지 수동 검토가 필요합니다.'
            : label + ' is currently excluded as on-device-only. Manually confirm that no off-device transmission occurs.',
        });
      }

      const optional = optionalDisclosureStatus(answer);
      if (optional.status === 'warning') {
        warnings.push({
          code: 'optional-partial',
          severity: 'medium',
          dataTypeId: type.id,
          message: labelsLang === 'ko'
            ? label + '은(는) Apple optional disclosure 조건을 일부만 충족합니다. 자동 제외하지 마세요.'
            : label + ' only partially satisfies Apple optional-disclosure criteria. Do not auto-suppress it.',
        });
      }
    });

    return warnings;
  }

  return {
    RULES_REVIEWED_AT: RULES_REVIEWED_AT,
    PLATFORM_OPTIONS: PLATFORM_OPTIONS,
    APP_TYPE_OPTIONS: APP_TYPE_OPTIONS,
    PURPOSE_OPTIONS: PURPOSE_OPTIONS,
    DATA_TYPES: DATA_TYPES,
    DATA_TYPE_LOOKUP: DATA_TYPE_LOOKUP,
    PURPOSE_LOOKUP: PURPOSE_LOOKUP,
    clone: clone,
    getLabel: getLabel,
    getPurposeLabel: getPurposeLabel,
    getDataTypeLabel: getDataTypeLabel,
    createEmptyDataAnswer: createEmptyDataAnswer,
    createEmptyDataMap: createEmptyDataMap,
    normalizeArray: normalizeArray,
    normalizeString: normalizeString,
    uniqueStrings: uniqueStrings,
    isCollected: isCollected,
    hasAdvertisingPurpose: hasAdvertisingPurpose,
    optionalDisclosureStatus: optionalDisclosureStatus,
    validateState: validateState,
    buildAppleSummary: buildAppleSummary,
    buildGoogleSummary: buildGoogleSummary,
    deriveReviewWarnings: deriveReviewWarnings,
  };
});
