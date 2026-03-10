(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./rules.js'), require('./presets.js'));
    return;
  }
  const api = factory(global.AppPrivacyRules, global.AppPrivacyPresets);
  global.AppPrivacyWizard = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      api.initBrowser();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (rules, presets) {
  'use strict';

  if (!rules || !presets) {
    throw new Error('App privacy wizard requires rules.js and presets.js');
  }

  const STORAGE_KEY = 'app-privacy-disclosure-wizard:v1';
  const MAX_STEP = 4;
  const STEP_KEYS = ['profile', 'presets', 'matrix', 'outputs'];
  const LANGUAGES = ['en', 'ko'];

  const UI_TEXT = {
    en: {
      pageTitle: 'App Privacy Disclosure Wizard',
      pageSubtitle: 'One guided questionnaire for App Store Privacy Details and Google Play Data safety preparation.',
      disclaimerTitle: 'Disclosure prep assistant · not legal advice',
      disclaimerBody: 'This tool helps you prepare App Store Privacy Details and Google Play Data safety answers, including third-party SDK disclosures. It is not legal advice, and you remain responsible for the final store submission.',
      draftHint: 'Draft stays in localStorage on this device. Rules reviewed: ',
      backToTools: 'Back to tools',
      stepProfile: '1. App profile',
      stepPresets: '2. SDK presets',
      stepMatrix: '3. Data-type review',
      stepOutputs: '4. Store outputs',
      next: 'Next',
      prev: 'Previous',
      reset: 'Reset',
      exportJson: 'Export JSON',
      exportMarkdown: 'Export Markdown',
      copyApple: 'Copy Apple Summary',
      copyGoogle: 'Copy Google Summary',
      applyPresets: 'Apply Presets',
      languageToggle: '한국어',
      profileHeader: 'App profile',
      profileCopy: 'Set the app-wide answers once. These answers shape both store summaries and warning logic.',
      appName: 'App name',
      platforms: 'Platforms',
      appType: 'App type',
      requiresLogin: 'Requires account login',
      childrenAudience: 'Children / family audience',
      childrenManualReviewComplete: 'Family / kids disclosure manually reviewed',
      handlingHeader: 'App-level handling flags',
      encryptedInTransit: 'Data encrypted in transit',
      deletionRequestsSupported: 'User can request deletion',
      someProcessingOnDeviceOnly: 'Some selected features are on-device only',
      independentSecurityReview: 'Independent security review completed',
      presetsHeader: 'SDK / feature presets',
      presetsCopy: 'Select the SDKs or feature defaults you use, then apply them as editable suggestions.',
      presetsWarning: 'Review SDK defaults against your actual implementation. Presets are not legal truth.',
      matrixHeader: 'Normalized data-type matrix',
      matrixCopy: 'Review only the data types relevant to your app. SDK-only collection still counts for both stores.',
      matrixHelper: 'Each row stays editable after presets. High-risk answers surface review badges immediately.',
      questionCollectedByApp: 'Collected by the app',
      questionCollectedBySdk: 'Collected by a third-party SDK',
      questionShared: 'Shared with third parties',
      questionLinked: 'Linked to user identity / account',
      questionTracking: 'Used for tracking across apps / sites',
      questionPurposes: 'Primary purposes',
      questionRequired: 'Required for core functionality',
      questionCanOmit: 'User can omit it and still use the app',
      questionRareOptional: 'Only collected in rare optional support / feedback flows',
      questionExplicit: 'Explicitly provided by the user each time',
      questionOnDeviceOnly: 'On-device only / not transmitted off-device',
      questionNote: 'Manual review / override note',
      cardIdle: 'Not in scope yet',
      cardCollected: 'Collected',
      cardSdk: 'SDK',
      cardShared: 'Shared',
      cardLinked: 'Linked',
      cardTracking: 'Tracking',
      cardOptional: 'Optional-review',
      cardCandidate: 'Omission candidate',
      outputsHeader: 'Store-specific output + export',
      outputsCopy: 'Once the form is valid, copy or export a deterministic review bundle for handoff.',
      blockingHeader: 'Blocking validation errors',
      blockingEmpty: 'No blocking errors. Export and copy actions are enabled.',
      warningsHeader: 'Review checklist',
      warningsEmpty: 'No review warnings right now. Still verify third-party SDK disclosures manually.',
      appleHeader: 'Apple App Store Privacy Details summary',
      googleHeader: 'Google Play Data safety summary',
      panelNotSelected: 'This platform is not selected in the app profile step.',
      trackingHigh: 'Tracking risk detected',
      trackingClear: 'No explicit tracking answers selected',
      disclosedData: 'Disclosed data types',
      optionalCandidates: 'Optional-disclosure candidates',
      none: 'None',
      linkedMarker: 'Linked to user',
      unlinkedMarker: 'Not linked',
      sourceMarker: 'Source',
      purposeMarker: 'Purpose',
      sharedMarker: 'Shared',
      yes: 'Yes',
      no: 'No',
      encryption: 'Encrypted in transit',
      deletion: 'Deletion request supported',
      sdkCollection: 'Includes third-party SDK collection',
      summaryReady: 'Summary text ready',
      copySuccess: 'Summary copied to clipboard.',
      copyFail: 'Clipboard access failed. Please copy manually.',
      exportBlocked: 'Fix blocking validation errors before exporting.',
      lastApplied: 'Last preset application',
      untouchedPreset: 'No preset has been applied yet.',
      errorsFound: 'errors found',
      warningSeverityHigh: 'High',
      warningSeverityMedium: 'Medium',
      warningSeverityInfo: 'Info',
      stepComplete: 'Complete',
      stepPending: 'Pending',
      appleTextTitle: '[Apple App Store Privacy Details summary]',
      googleTextTitle: '[Google Play Data safety summary]',
      markdownTitle: '# App Privacy Disclosure Wizard export',
      exportAnswers: '## Normalized answers',
      exportApple: '## App Store summary',
      exportGoogle: '## Google Play summary',
      exportWarnings: '## Warnings / manual review',
      exportErrors: '## Blocking errors',
      exportMeta: '## App profile',
      appNameFallback: 'Untitled app',
      validationLabel: 'Validation',
      selectedPresetsLabel: 'Selected presets',
      requiredBadge: 'Core required',
      optionalBadge: 'Optional flow',
      onDeviceBadge: 'On-device only',
      manualReviewBadge: 'Manual review',
      noDataSelected: 'No data types are currently in disclosure scope.',
      resetConfirm: 'Reset the wizard and clear the local draft?',
    },
    ko: {
      pageTitle: '앱 프라이버시 제출 도우미',
      pageSubtitle: '한 번의 질문지로 App Store Privacy Details와 Google Play Data safety 제출 초안을 정리합니다.',
      disclaimerTitle: '제출 준비 도우미 · 법률 자문 아님',
      disclaimerBody: '이 도구는 App Store Privacy Details, Google Play Data safety, 그리고 third-party SDK disclosures 준비를 돕는 정적 도우미입니다. 법률 자문이 아니며 최종 제출 책임은 개발자에게 있습니다.',
      draftHint: '이 기기 localStorage에 임시 저장됩니다. 규칙 검토일: ',
      backToTools: '도구 목록으로',
      stepProfile: '1. 앱 프로필',
      stepPresets: '2. SDK 프리셋',
      stepMatrix: '3. 데이터 유형 검토',
      stepOutputs: '4. 스토어 출력',
      next: '다음',
      prev: '이전',
      reset: '초기화',
      exportJson: 'JSON 내보내기',
      exportMarkdown: 'Markdown 내보내기',
      copyApple: 'Apple 요약 복사',
      copyGoogle: 'Google 요약 복사',
      applyPresets: '프리셋 적용',
      languageToggle: 'English',
      profileHeader: '앱 프로필',
      profileCopy: '앱 전체에 공통으로 적용되는 답변을 먼저 설정하세요. 이후 Apple / Google 요약과 경고 로직에 함께 반영됩니다.',
      appName: '앱 이름',
      platforms: '플랫폼',
      appType: '앱 유형',
      requiresLogin: '계정 로그인 필요',
      childrenAudience: '아동 / 패밀리 대상',
      childrenManualReviewComplete: '아동/패밀리 제출 항목 수동 검토 완료',
      handlingHeader: '앱 레벨 처리 플래그',
      encryptedInTransit: '전송 중 암호화',
      deletionRequestsSupported: '사용자 삭제 요청 지원',
      someProcessingOnDeviceOnly: '일부 기능은 온디바이스 처리만 수행',
      independentSecurityReview: '독립 보안 검토 완료',
      presetsHeader: 'SDK / 기능 프리셋',
      presetsCopy: '사용 중인 SDK/기능 프리셋을 선택한 뒤 editable suggestion으로 적용하세요.',
      presetsWarning: '프리셋은 기본 추정치입니다. 실제 구현과 콘솔 설정을 반드시 대조하세요.',
      matrixHeader: '정규화 데이터 유형 매트릭스',
      matrixCopy: '앱에 해당하는 데이터 유형만 검토하세요. SDK만 수집하는 경우도 두 스토어 모두 공개 범위에 들어갑니다.',
      matrixHelper: '프리셋 적용 후에도 모든 행은 직접 수정 가능합니다. 고위험 응답은 즉시 배지와 체크리스트로 드러납니다.',
      questionCollectedByApp: '앱이 직접 수집',
      questionCollectedBySdk: '서드파티 SDK가 수집',
      questionShared: '제3자와 공유',
      questionLinked: '사용자/계정과 연결됨',
      questionTracking: '앱/사이트 간 추적에 사용',
      questionPurposes: '주요 목적',
      questionRequired: '핵심 기능에 필수',
      questionCanOmit: '사용자가 생략해도 앱 사용 가능',
      questionRareOptional: '드문 선택형 지원/피드백 플로우에서만 수집',
      questionExplicit: '사용자가 매번 명시적으로 제공',
      questionOnDeviceOnly: '온디바이스 전용 / 외부 전송 없음',
      questionNote: '수동 검토 / 오버라이드 메모',
      cardIdle: '아직 범위 밖',
      cardCollected: '수집',
      cardSdk: 'SDK',
      cardShared: '공유',
      cardLinked: '연결됨',
      cardTracking: '트래킹',
      cardOptional: '선택공개 검토',
      cardCandidate: '생략 후보',
      outputsHeader: '스토어별 출력 + 내보내기',
      outputsCopy: '폼이 유효해지면 handoff용 결정적 리뷰 번들을 복사하거나 내보낼 수 있습니다.',
      blockingHeader: '차단 오류',
      blockingEmpty: '차단 오류가 없습니다. 복사/내보내기 버튼이 활성화됩니다.',
      warningsHeader: '리뷰 체크리스트',
      warningsEmpty: '현재 추가 경고는 없습니다. 그래도 third-party SDK disclosures는 수동 검토하세요.',
      appleHeader: 'Apple App Store Privacy Details 요약',
      googleHeader: 'Google Play Data safety 요약',
      panelNotSelected: '앱 프로필 단계에서 이 플랫폼이 선택되지 않았습니다.',
      trackingHigh: '트래킹 리스크 감지',
      trackingClear: '명시적 트래킹 응답 없음',
      disclosedData: '공개 대상 데이터 유형',
      optionalCandidates: '선택공개 생략 후보',
      none: '없음',
      linkedMarker: '사용자 연결',
      unlinkedMarker: '비연결',
      sourceMarker: '수집 주체',
      purposeMarker: '목적',
      sharedMarker: '공유',
      yes: '예',
      no: '아니오',
      encryption: '전송 중 암호화',
      deletion: '삭제 요청 지원',
      sdkCollection: '서드파티 SDK 수집 포함',
      summaryReady: '요약 텍스트 준비 완료',
      copySuccess: '요약을 클립보드에 복사했습니다.',
      copyFail: '클립보드 접근에 실패했습니다. 수동 복사해 주세요.',
      exportBlocked: '차단 오류를 먼저 해결한 뒤 내보내세요.',
      lastApplied: '마지막 프리셋 적용 시각',
      untouchedPreset: '아직 프리셋을 적용하지 않았습니다.',
      errorsFound: '개의 오류 발견',
      warningSeverityHigh: '높음',
      warningSeverityMedium: '중간',
      warningSeverityInfo: '정보',
      stepComplete: '완료',
      stepPending: '대기',
      appleTextTitle: '[Apple App Store Privacy Details 요약]',
      googleTextTitle: '[Google Play Data safety 요약]',
      markdownTitle: '# App Privacy Disclosure Wizard export',
      exportAnswers: '## 정규화 답변',
      exportApple: '## App Store 요약',
      exportGoogle: '## Google Play 요약',
      exportWarnings: '## 경고 / 수동 검토',
      exportErrors: '## 차단 오류',
      exportMeta: '## 앱 프로필',
      appNameFallback: '이름 없는 앱',
      validationLabel: '검증 상태',
      selectedPresetsLabel: '선택된 프리셋',
      requiredBadge: '핵심 필수',
      optionalBadge: '선택 플로우',
      onDeviceBadge: '온디바이스 전용',
      manualReviewBadge: '수동 검토',
      noDataSelected: '현재 공개 범위에 들어간 데이터 유형이 없습니다.',
      resetConfirm: '위저드를 초기화하고 로컬 초안을 삭제할까요?',
    },
  };

  function t(lang, key) {
    return (UI_TEXT[lang] && UI_TEXT[lang][key]) || UI_TEXT.en[key] || key;
  }

  function createDefaultState() {
    return {
      version: 1,
      lang: 'en',
      activeStep: 1,
      meta: {
        rulesReviewedAt: rules.RULES_REVIEWED_AT,
        lastSavedAt: null,
        lastPresetAppliedAt: null,
      },
      appProfile: {
        appName: '',
        platforms: ['ios', 'android'],
        appType: 'consumer',
        requiresAccountLogin: false,
        childrenAudience: false,
        childrenManualReviewComplete: false,
      },
      appHandling: {
        encryptedInTransit: true,
        deletionRequestsSupported: false,
        someProcessingOnDeviceOnly: false,
        independentSecurityReview: false,
      },
      selectedPresets: [],
      data: rules.createEmptyDataMap(),
    };
  }

  function sanitizeState(input) {
    const base = createDefaultState();
    if (!input || typeof input !== 'object') return base;
    const lang = LANGUAGES.indexOf(input.lang) !== -1 ? input.lang : base.lang;
    const activeStep = Number.isFinite(Number(input.activeStep)) ? Math.min(MAX_STEP, Math.max(1, Number(input.activeStep))) : 1;
    const appProfile = Object.assign({}, base.appProfile, input.appProfile || {});
    appProfile.platforms = rules.uniqueStrings(appProfile.platforms).filter(function (platformId) {
      return rules.PLATFORM_OPTIONS.some(function (item) { return item.id === platformId; });
    });
    const appHandling = Object.assign({}, base.appHandling, input.appHandling || {});
    Object.keys(appHandling).forEach(function (key) {
      appHandling[key] = Boolean(appHandling[key]);
    });

    const next = {
      version: 1,
      lang: lang,
      activeStep: activeStep,
      meta: {
        rulesReviewedAt: rules.RULES_REVIEWED_AT,
        lastSavedAt: input.meta && input.meta.lastSavedAt ? String(input.meta.lastSavedAt) : null,
        lastPresetAppliedAt: input.meta && input.meta.lastPresetAppliedAt ? String(input.meta.lastPresetAppliedAt) : null,
      },
      appProfile: {
        appName: rules.normalizeString(appProfile.appName),
        platforms: appProfile.platforms.length ? appProfile.platforms : [],
        appType: rules.APP_TYPE_OPTIONS.some(function (item) { return item.id === appProfile.appType; }) ? appProfile.appType : base.appProfile.appType,
        requiresAccountLogin: Boolean(appProfile.requiresAccountLogin),
        childrenAudience: Boolean(appProfile.childrenAudience),
        childrenManualReviewComplete: Boolean(appProfile.childrenManualReviewComplete),
      },
      appHandling: appHandling,
      selectedPresets: rules.uniqueStrings(input.selectedPresets || []).filter(function (presetId) {
        return Boolean(presets.PRESET_LOOKUP[presetId]);
      }),
      data: rules.createEmptyDataMap(),
    };

    rules.DATA_TYPES.forEach(function (item) {
      const raw = input.data && input.data[item.id] ? input.data[item.id] : {};
      next.data[item.id] = Object.assign(rules.createEmptyDataAnswer(item.id), {
        collectedByApp: Boolean(raw.collectedByApp),
        collectedBySdk: Boolean(raw.collectedBySdk),
        sharedWithThirdParties: Boolean(raw.sharedWithThirdParties),
        linkedToUser: Boolean(raw.linkedToUser),
        tracking: Boolean(raw.tracking),
        purposes: rules.uniqueStrings(raw.purposes || []).filter(function (purposeId) {
          return Boolean(rules.PURPOSE_LOOKUP[purposeId]);
        }),
        requiredForCoreFunctionality: Boolean(raw.requiredForCoreFunctionality),
        userCanOmit: Boolean(raw.userCanOmit),
        rareOptionalFlowOnly: Boolean(raw.rareOptionalFlowOnly),
        explicitUserProvidedEachTime: Boolean(raw.explicitUserProvidedEachTime),
        onDeviceOnly: Boolean(raw.onDeviceOnly),
        manualReviewNote: rules.normalizeString(raw.manualReviewNote),
      });
    });

    return next;
  }

  function formatDateTime(value) {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return String(value);
    }
  }

  function buildAppleText(state, apple, lang) {
    if (!apple.enabled) {
      return t(lang, 'appleTextTitle') + '\n- ' + t(lang, 'panelNotSelected');
    }
    const lines = [
      t(lang, 'appleTextTitle'),
      'App: ' + (state.appProfile.appName || t(lang, 'appNameFallback')),
      'Tracking: ' + (apple.trackingRisk === 'high' ? t(lang, 'trackingHigh') : t(lang, 'trackingClear')),
      t(lang, 'disclosedData') + ':',
    ];
    if (!apple.rows.length) {
      lines.push('- ' + t(lang, 'none'));
    } else {
      apple.rows.forEach(function (row) {
        lines.push('- ' + row.label + ' | ' + (row.linkedToUser ? t(lang, 'linkedMarker') : t(lang, 'unlinkedMarker')) + ' | ' + t(lang, 'sourceMarker') + ': ' + row.sources.join(', ') + ' | ' + t(lang, 'purposeMarker') + ': ' + (row.purposes.length ? row.purposes.join(', ') : t(lang, 'none')));
        if (row.optionalNote) {
          lines.push('  · ' + row.optionalNote);
        }
      });
    }
    if (apple.optionalCandidates.length) {
      lines.push(t(lang, 'optionalCandidates') + ':');
      apple.optionalCandidates.forEach(function (row) {
        lines.push('- ' + row.label + ' | ' + row.optionalNote);
      });
    }
    return lines.join('\n');
  }

  function buildGoogleText(state, google, lang) {
    if (!google.enabled) {
      return t(lang, 'googleTextTitle') + '\n- ' + t(lang, 'panelNotSelected');
    }
    const lines = [
      t(lang, 'googleTextTitle'),
      'App: ' + (state.appProfile.appName || t(lang, 'appNameFallback')),
      t(lang, 'encryption') + ': ' + (google.encryptedInTransit ? t(lang, 'yes') : t(lang, 'no')),
      t(lang, 'deletion') + ': ' + (google.deletionRequestsSupported ? t(lang, 'yes') : t(lang, 'no')),
      t(lang, 'disclosedData') + ':',
    ];
    if (!google.rows.length) {
      lines.push('- ' + t(lang, 'none'));
    } else {
      google.rows.forEach(function (row) {
        lines.push('- ' + row.label + ' | ' + t(lang, 'sharedMarker') + ': ' + (row.shared ? t(lang, 'yes') : t(lang, 'no')) + ' | ' + t(lang, 'sdkCollection') + ': ' + (row.bySdk ? t(lang, 'yes') : t(lang, 'no')) + ' | ' + t(lang, 'purposeMarker') + ': ' + (row.purposes.length ? row.purposes.join(', ') : t(lang, 'none')));
      });
    }
    return lines.join('\n');
  }

  function buildMarkdownExport(state, derived, lang) {
    const lines = [
      t(lang, 'markdownTitle'),
      '',
      t(lang, 'exportMeta'),
      '- App name: ' + (state.appProfile.appName || t(lang, 'appNameFallback')),
      '- Platforms: ' + state.appProfile.platforms.join(', '),
      '- App type: ' + state.appProfile.appType,
      '- Requires account login: ' + state.appProfile.requiresAccountLogin,
      '- Children / family audience: ' + state.appProfile.childrenAudience,
      '- Selected presets: ' + (state.selectedPresets.length ? state.selectedPresets.join(', ') : t(lang, 'none')),
      '',
      t(lang, 'exportApple'),
      '',
      '```text',
      derived.appleText,
      '```',
      '',
      t(lang, 'exportGoogle'),
      '',
      '```text',
      derived.googleText,
      '```',
      '',
      t(lang, 'exportWarnings'),
    ];

    if (!derived.warnings.length) {
      lines.push('- ' + t(lang, 'none'));
    } else {
      derived.warnings.forEach(function (warning) {
        lines.push('- [' + warning.severity + '] ' + warning.message);
      });
    }

    lines.push('', t(lang, 'exportErrors'));
    if (!derived.validation.errors.length) {
      lines.push('- ' + t(lang, 'none'));
    } else {
      derived.validation.errors.forEach(function (error) {
        lines.push('- ' + error.message);
      });
    }

    lines.push('', t(lang, 'exportAnswers'), '', '```json', JSON.stringify(state, null, 2), '```');
    return lines.join('\n');
  }

  function buildExportBundle(state, derived) {
    return {
      generatedAt: new Date().toISOString(),
      rulesReviewedAt: rules.RULES_REVIEWED_AT,
      answers: state,
      validation: derived.validation,
      warnings: derived.warnings,
      apple: derived.apple,
      google: derived.google,
      appleText: derived.appleText,
      googleText: derived.googleText,
      markdown: derived.markdown,
    };
  }

  function computeStepStatus(state) {
    const validation = rules.validateState(state);
    const step1Complete = state.appProfile.platforms.length > 0;
    const step2Complete = true;
    const step3Complete = validation.valid;
    const step4Complete = validation.valid;
    return [step1Complete, step2Complete, step3Complete, step4Complete];
  }

  function derivePresetCoverageWarnings(state, lang) {
    return state.selectedPresets.map(function (presetId) {
      return presets.PRESET_LOOKUP[presetId];
    }).filter(Boolean).filter(function (preset) {
      return preset.patches && preset.patches.length;
    }).filter(function (preset) {
      return !preset.patches.some(function (patch) {
        return rules.isCollected(state.data[patch.id]);
      });
    }).map(function (preset) {
      const label = rules.getLabel(preset, lang);
      return {
        code: 'preset-no-reviewed-data',
        severity: 'medium',
        message: lang === 'ko'
          ? label + ' 프리셋이 선택됐지만 해당 데이터 유형이 아직 하나도 검토되지 않았습니다.'
          : label + ' is selected, but none of its mapped data types are currently reviewed as collected.',
      };
    });
  }

  function computeDerived(state, lang) {
    const activeLang = lang || state.lang || 'en';
    const validation = rules.validateState(state);
    const apple = rules.buildAppleSummary(state, activeLang);
    const google = rules.buildGoogleSummary(state, activeLang);
    const warnings = rules.deriveReviewWarnings(state, state.selectedPresets, activeLang).concat(derivePresetCoverageWarnings(state, activeLang));
    const appleText = buildAppleText(state, apple, activeLang);
    const googleText = buildGoogleText(state, google, activeLang);
    const derived = {
      validation: validation,
      warnings: warnings,
      apple: apple,
      google: google,
      appleText: appleText,
      googleText: googleText,
    };
    derived.markdown = buildMarkdownExport(state, derived, activeLang);
    derived.exportBundle = buildExportBundle(state, derived);
    derived.stepStatus = computeStepStatus(state);
    return derived;
  }

  function downloadText(filename, content, mimeType) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function initBrowser() {
    const refs = {
      langToggle: document.getElementById('langToggle'),
      resetBtn: document.getElementById('resetBtn'),
      stepper: document.getElementById('stepper'),
      stepPanels: Array.from(document.querySelectorAll('[data-step-panel]')),
      appName: document.getElementById('appName'),
      platforms: document.getElementById('platforms'),
      appType: document.getElementById('appType'),
      requiresAccountLogin: document.getElementById('requiresAccountLogin'),
      childrenAudience: document.getElementById('childrenAudience'),
      childrenManualReviewComplete: document.getElementById('childrenManualReviewComplete'),
      encryptedInTransit: document.getElementById('encryptedInTransit'),
      deletionRequestsSupported: document.getElementById('deletionRequestsSupported'),
      someProcessingOnDeviceOnly: document.getElementById('someProcessingOnDeviceOnly'),
      independentSecurityReview: document.getElementById('independentSecurityReview'),
      presetsList: document.getElementById('presetsList'),
      applyPresetsBtn: document.getElementById('applyPresetsBtn'),
      presetMeta: document.getElementById('presetMeta'),
      matrixList: document.getElementById('matrixList'),
      blockingList: document.getElementById('blockingList'),
      warningsList: document.getElementById('warningsList'),
      appleStatus: document.getElementById('appleStatus'),
      googleStatus: document.getElementById('googleStatus'),
      appleList: document.getElementById('appleList'),
      appleOptionalList: document.getElementById('appleOptionalList'),
      googleList: document.getElementById('googleList'),
      appleText: document.getElementById('appleText'),
      googleText: document.getElementById('googleText'),
      copyAppleBtn: document.getElementById('copyAppleBtn'),
      copyGoogleBtn: document.getElementById('copyGoogleBtn'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),
      nextBtns: Array.from(document.querySelectorAll('[data-step-next]')),
      prevBtns: Array.from(document.querySelectorAll('[data-step-prev]')),
      title: document.getElementById('pageTitle'),
      subtitle: document.getElementById('pageSubtitle'),
      disclaimerTitle: document.getElementById('disclaimerTitle'),
      disclaimerBody: document.getElementById('disclaimerBody'),
      draftHint: document.getElementById('draftHint'),
      backToTools: document.getElementById('backToTools'),
      profileHeader: document.getElementById('profileHeader'),
      profileCopy: document.getElementById('profileCopy'),
      labelAppName: document.getElementById('labelAppName'),
      labelPlatforms: document.getElementById('labelPlatforms'),
      labelAppType: document.getElementById('labelAppType'),
      labelRequiresLogin: document.getElementById('labelRequiresLogin'),
      labelChildrenAudience: document.getElementById('labelChildrenAudience'),
      labelChildrenManualReviewComplete: document.getElementById('labelChildrenManualReviewComplete'),
      handlingHeader: document.getElementById('handlingHeader'),
      labelEncryptedInTransit: document.getElementById('labelEncryptedInTransit'),
      labelDeletionRequestsSupported: document.getElementById('labelDeletionRequestsSupported'),
      labelSomeProcessingOnDeviceOnly: document.getElementById('labelSomeProcessingOnDeviceOnly'),
      labelIndependentSecurityReview: document.getElementById('labelIndependentSecurityReview'),
      presetsHeader: document.getElementById('presetsHeader'),
      presetsCopy: document.getElementById('presetsCopy'),
      presetsWarning: document.getElementById('presetsWarning'),
      matrixHeader: document.getElementById('matrixHeader'),
      matrixCopy: document.getElementById('matrixCopy'),
      matrixHelper: document.getElementById('matrixHelper'),
      outputsHeader: document.getElementById('outputsHeader'),
      outputsCopy: document.getElementById('outputsCopy'),
      blockingHeader: document.getElementById('blockingHeader'),
      warningsHeader: document.getElementById('warningsHeader'),
      appleHeader: document.getElementById('appleHeader'),
      googleHeader: document.getElementById('googleHeader'),
      appleOptionalHeader: document.getElementById('appleOptionalHeader'),
    };

    if (!refs.stepper || !refs.matrixList) {
      return;
    }

    let state = createDefaultState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = sanitizeState(JSON.parse(saved));
      }
    } catch (error) {
      state = createDefaultState();
    }

    function persist() {
      state.meta.lastSavedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        // ignore storage failures
      }
    }

    function setStep(step) {
      state.activeStep = Math.max(1, Math.min(MAX_STEP, Number(step) || 1));
      persist();
      render();
    }

    function updatePlatform(platformId, checked) {
      const current = new Set(state.appProfile.platforms);
      if (checked) current.add(platformId); else current.delete(platformId);
      state.appProfile.platforms = Array.from(current);
      persist();
      render();
    }

    function updatePreset(presetId, checked) {
      const current = new Set(state.selectedPresets);
      if (checked) current.add(presetId); else current.delete(presetId);
      state.selectedPresets = Array.from(current);
      persist();
      render();
    }

    function updateDataRow(rowId, field, value, mode) {
      const current = Object.assign({}, state.data[rowId]);
      if (mode === 'togglePurpose') {
        const nextPurposes = new Set(current.purposes || []);
        if (value.checked) nextPurposes.add(field); else nextPurposes.delete(field);
        current.purposes = Array.from(nextPurposes);
      } else if (mode === 'boolean') {
        current[field] = Boolean(value);
      } else {
        current[field] = value;
      }
      state.data[rowId] = current;
      persist();
      render();
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        window.alert(t(state.lang, 'copySuccess'));
      } catch (error) {
        window.alert(t(state.lang, 'copyFail'));
      }
    }

    function renderStepButtons(derived) {
      const stepKeys = [
        t(state.lang, 'stepProfile'),
        t(state.lang, 'stepPresets'),
        t(state.lang, 'stepMatrix'),
        t(state.lang, 'stepOutputs')
      ];
      refs.stepper.innerHTML = stepKeys.map(function (label, index) {
        const stepNumber = index + 1;
        const complete = derived.stepStatus[index];
        const active = state.activeStep === stepNumber;
        return '<button type="button" class="step-chip' + (active ? ' is-active' : '') + '" data-jump-step="' + stepNumber + '">' +
          '<span class="step-index">' + stepNumber + '</span>' +
          '<span class="step-copy"><strong>' + label + '</strong><small>' + (complete ? t(state.lang, 'stepComplete') : t(state.lang, 'stepPending')) + '</small></span>' +
          '</button>';
      }).join('');
    }

    function renderProfileOptions() {
      refs.platforms.innerHTML = rules.PLATFORM_OPTIONS.map(function (platform) {
        const checked = state.appProfile.platforms.indexOf(platform.id) !== -1;
        return '<label class="toggle"><input type="checkbox" data-platform-id="' + platform.id + '" ' + (checked ? 'checked' : '') + ' /><span>' + rules.getLabel(platform, state.lang) + '</span></label>';
      }).join('');

      refs.appType.innerHTML = rules.APP_TYPE_OPTIONS.map(function (item) {
        return '<option value="' + item.id + '" ' + (state.appProfile.appType === item.id ? 'selected' : '') + '>' + rules.getLabel(item, state.lang) + '</option>';
      }).join('');

      refs.appName.value = state.appProfile.appName;
      refs.requiresAccountLogin.checked = state.appProfile.requiresAccountLogin;
      refs.childrenAudience.checked = state.appProfile.childrenAudience;
      refs.childrenManualReviewComplete.checked = state.appProfile.childrenManualReviewComplete;
      refs.encryptedInTransit.checked = state.appHandling.encryptedInTransit;
      refs.deletionRequestsSupported.checked = state.appHandling.deletionRequestsSupported;
      refs.someProcessingOnDeviceOnly.checked = state.appHandling.someProcessingOnDeviceOnly;
      refs.independentSecurityReview.checked = state.appHandling.independentSecurityReview;
    }

    function renderPresets() {
      refs.presetsList.innerHTML = presets.PRESET_DEFINITIONS.map(function (preset) {
        const checked = state.selectedPresets.indexOf(preset.id) !== -1;
        return '<label class="preset-card">' +
          '<input type="checkbox" data-preset-id="' + preset.id + '" ' + (checked ? 'checked' : '') + ' />' +
          '<span class="preset-copy"><strong>' + rules.getLabel(preset, state.lang) + '</strong><small>' + rules.getLabel({ label: preset.note }, state.lang) + '</small></span>' +
          '</label>';
      }).join('');

      refs.presetMeta.textContent = state.meta.lastPresetAppliedAt
        ? t(state.lang, 'lastApplied') + ': ' + formatDateTime(state.meta.lastPresetAppliedAt)
        : t(state.lang, 'untouchedPreset');
    }

    function renderMatrix() {
      refs.matrixList.innerHTML = rules.DATA_TYPES.map(function (type) {
        const answer = state.data[type.id];
        const optional = rules.optionalDisclosureStatus(answer);
        const chips = [];
        if (rules.isCollected(answer)) chips.push(t(state.lang, 'cardCollected'));
        if (answer.collectedBySdk) chips.push(t(state.lang, 'cardSdk'));
        if (answer.sharedWithThirdParties) chips.push(t(state.lang, 'cardShared'));
        if (answer.linkedToUser) chips.push(t(state.lang, 'cardLinked'));
        if (answer.tracking) chips.push(t(state.lang, 'cardTracking'));
        if (answer.requiredForCoreFunctionality) chips.push(t(state.lang, 'requiredBadge'));
        if (answer.onDeviceOnly) chips.push(t(state.lang, 'onDeviceBadge'));
        if (optional.status === 'warning') chips.push(t(state.lang, 'cardOptional'));
        if (optional.status === 'candidate') chips.push(t(state.lang, 'cardCandidate'));
        const chipHtml = chips.length ? chips.map(function (chip) {
          return '<span class="mini-chip">' + chip + '</span>';
        }).join('') : '<span class="mini-chip muted">' + t(state.lang, 'cardIdle') + '</span>';

        const purposeOptions = rules.PURPOSE_OPTIONS.map(function (purpose) {
          const checked = answer.purposes.indexOf(purpose.id) !== -1;
          return '<label class="pill-check"><input type="checkbox" data-row-id="' + type.id + '" data-purpose-id="' + purpose.id + '" ' + (checked ? 'checked' : '') + ' /><span>' + rules.getLabel(purpose, state.lang) + '</span></label>';
        }).join('');

        return '<details class="matrix-card" ' + (chips.length ? 'open' : '') + '>' +
          '<summary><span><strong>' + rules.getDataTypeLabel(type.id, state.lang) + '</strong><small>' + chipHtml + '</small></span></summary>' +
          '<div class="matrix-body">' +
            '<div class="question-grid">' +
              booleanField(type.id, 'collectedByApp', answer.collectedByApp, t(state.lang, 'questionCollectedByApp')) +
              booleanField(type.id, 'collectedBySdk', answer.collectedBySdk, t(state.lang, 'questionCollectedBySdk')) +
              booleanField(type.id, 'sharedWithThirdParties', answer.sharedWithThirdParties, t(state.lang, 'questionShared')) +
              booleanField(type.id, 'linkedToUser', answer.linkedToUser, t(state.lang, 'questionLinked')) +
              booleanField(type.id, 'tracking', answer.tracking, t(state.lang, 'questionTracking')) +
              booleanField(type.id, 'requiredForCoreFunctionality', answer.requiredForCoreFunctionality, t(state.lang, 'questionRequired')) +
              booleanField(type.id, 'userCanOmit', answer.userCanOmit, t(state.lang, 'questionCanOmit')) +
              booleanField(type.id, 'rareOptionalFlowOnly', answer.rareOptionalFlowOnly, t(state.lang, 'questionRareOptional')) +
              booleanField(type.id, 'explicitUserProvidedEachTime', answer.explicitUserProvidedEachTime, t(state.lang, 'questionExplicit')) +
              booleanField(type.id, 'onDeviceOnly', answer.onDeviceOnly, t(state.lang, 'questionOnDeviceOnly')) +
            '</div>' +
            '<div class="subsection"><div class="subhead">' + t(state.lang, 'questionPurposes') + '</div><div class="purpose-wrap">' + purposeOptions + '</div></div>' +
            '<div class="subsection"><label class="subhead" for="note-' + type.id + '">' + t(state.lang, 'questionNote') + '</label><textarea id="note-' + type.id + '" data-row-id="' + type.id + '" data-text-field="manualReviewNote" placeholder="Apple / Google manual-review context, SDK caveats, or override note">' + escapeHtml(answer.manualReviewNote) + '</textarea></div>' +
          '</div>' +
        '</details>';
      }).join('');
    }

    function booleanField(rowId, field, checked, label) {
      return '<label class="toggle"><input type="checkbox" data-row-id="' + rowId + '" data-bool-field="' + field + '" ' + (checked ? 'checked' : '') + ' /><span>' + label + '</span></label>';
    }

    function renderErrorsAndWarnings(derived) {
      refs.blockingList.innerHTML = derived.validation.errors.length
        ? derived.validation.errors.map(function (error) {
            return '<li class="issue issue-error"><span class="severity">' + t(state.lang, 'validationLabel') + '</span><div>' + escapeHtml(error.message) + '</div></li>';
          }).join('')
        : '<li class="issue issue-ok">' + t(state.lang, 'blockingEmpty') + '</li>';

      refs.warningsList.innerHTML = derived.warnings.length
        ? derived.warnings.map(function (warning) {
            return '<li class="issue issue-' + warning.severity + '"><span class="severity">' + severityLabel(warning.severity) + '</span><div>' + escapeHtml(warning.message) + '</div></li>';
          }).join('')
        : '<li class="issue issue-ok">' + t(state.lang, 'warningsEmpty') + '</li>';
    }

    function severityLabel(severity) {
      if (severity === 'high') return t(state.lang, 'warningSeverityHigh');
      if (severity === 'medium') return t(state.lang, 'warningSeverityMedium');
      return t(state.lang, 'warningSeverityInfo');
    }

    function renderApplePanel(derived) {
      const apple = derived.apple;
      refs.appleStatus.textContent = apple.enabled
        ? (apple.trackingRisk === 'high' ? t(state.lang, 'trackingHigh') : t(state.lang, 'trackingClear'))
        : t(state.lang, 'panelNotSelected');
      refs.appleList.innerHTML = apple.enabled
        ? (apple.rows.length ? apple.rows.map(function (row) {
            return '<li><strong>' + row.label + '</strong><div class="row-meta">' +
              (row.linkedToUser ? t(state.lang, 'linkedMarker') : t(state.lang, 'unlinkedMarker')) + ' · ' +
              t(state.lang, 'sourceMarker') + ': ' + row.sources.join(', ') + ' · ' +
              t(state.lang, 'purposeMarker') + ': ' + (row.purposes.length ? row.purposes.join(', ') : t(state.lang, 'none')) +
            '</div>' + (row.optionalNote ? '<div class="row-note">' + escapeHtml(row.optionalNote) + '</div>' : '') + '</li>';
          }).join('') : '<li>' + t(state.lang, 'noDataSelected') + '</li>')
        : '<li>' + t(state.lang, 'panelNotSelected') + '</li>';
      refs.appleOptionalList.innerHTML = apple.enabled
        ? (apple.optionalCandidates.length ? apple.optionalCandidates.map(function (row) {
            return '<li><strong>' + row.label + '</strong><div class="row-note">' + escapeHtml(row.optionalNote) + '</div></li>';
          }).join('') : '<li>' + t(state.lang, 'none') + '</li>')
        : '<li>' + t(state.lang, 'panelNotSelected') + '</li>';
      refs.appleText.value = derived.appleText;
    }

    function renderGooglePanel(derived) {
      const google = derived.google;
      refs.googleStatus.textContent = google.enabled
        ? t(state.lang, 'summaryReady') + ' · ' + t(state.lang, 'encryption') + ': ' + (google.encryptedInTransit ? t(state.lang, 'yes') : t(state.lang, 'no')) + ' · ' + t(state.lang, 'deletion') + ': ' + (google.deletionRequestsSupported ? t(state.lang, 'yes') : t(state.lang, 'no'))
        : t(state.lang, 'panelNotSelected');
      refs.googleList.innerHTML = google.enabled
        ? (google.rows.length ? google.rows.map(function (row) {
            return '<li><strong>' + row.label + '</strong><div class="row-meta">' + t(state.lang, 'sharedMarker') + ': ' + (row.shared ? t(state.lang, 'yes') : t(state.lang, 'no')) + ' · ' + t(state.lang, 'sdkCollection') + ': ' + (row.bySdk ? t(state.lang, 'yes') : t(state.lang, 'no')) + ' · ' + t(state.lang, 'purposeMarker') + ': ' + (row.purposes.length ? row.purposes.join(', ') : t(state.lang, 'none')) + '</div></li>';
          }).join('') : '<li>' + t(state.lang, 'noDataSelected') + '</li>')
        : '<li>' + t(state.lang, 'panelNotSelected') + '</li>';
      refs.googleText.value = derived.googleText;
    }

    function renderButtons(derived) {
      const enabled = derived.validation.valid;
      refs.copyAppleBtn.disabled = !enabled;
      refs.copyGoogleBtn.disabled = !enabled;
      refs.exportJsonBtn.disabled = !enabled;
      refs.exportMarkdownBtn.disabled = !enabled;
    }

    function renderChrome() {
      document.documentElement.lang = state.lang;
      refs.title.textContent = t(state.lang, 'pageTitle');
      refs.subtitle.textContent = t(state.lang, 'pageSubtitle');
      refs.disclaimerTitle.textContent = t(state.lang, 'disclaimerTitle');
      refs.disclaimerBody.textContent = t(state.lang, 'disclaimerBody');
      refs.draftHint.textContent = t(state.lang, 'draftHint') + state.meta.rulesReviewedAt;
      refs.backToTools.textContent = t(state.lang, 'backToTools');
      refs.profileHeader.textContent = t(state.lang, 'profileHeader');
      refs.profileCopy.textContent = t(state.lang, 'profileCopy');
      refs.labelAppName.textContent = t(state.lang, 'appName');
      refs.labelPlatforms.textContent = t(state.lang, 'platforms');
      refs.labelAppType.textContent = t(state.lang, 'appType');
      refs.labelRequiresLogin.textContent = t(state.lang, 'requiresLogin');
      refs.labelChildrenAudience.textContent = t(state.lang, 'childrenAudience');
      refs.labelChildrenManualReviewComplete.textContent = t(state.lang, 'childrenManualReviewComplete');
      refs.handlingHeader.textContent = t(state.lang, 'handlingHeader');
      refs.labelEncryptedInTransit.textContent = t(state.lang, 'encryptedInTransit');
      refs.labelDeletionRequestsSupported.textContent = t(state.lang, 'deletionRequestsSupported');
      refs.labelSomeProcessingOnDeviceOnly.textContent = t(state.lang, 'someProcessingOnDeviceOnly');
      refs.labelIndependentSecurityReview.textContent = t(state.lang, 'independentSecurityReview');
      refs.presetsHeader.textContent = t(state.lang, 'presetsHeader');
      refs.presetsCopy.textContent = t(state.lang, 'presetsCopy');
      refs.presetsWarning.textContent = t(state.lang, 'presetsWarning');
      refs.matrixHeader.textContent = t(state.lang, 'matrixHeader');
      refs.matrixCopy.textContent = t(state.lang, 'matrixCopy');
      refs.matrixHelper.textContent = t(state.lang, 'matrixHelper');
      refs.outputsHeader.textContent = t(state.lang, 'outputsHeader');
      refs.outputsCopy.textContent = t(state.lang, 'outputsCopy');
      refs.blockingHeader.textContent = t(state.lang, 'blockingHeader');
      refs.warningsHeader.textContent = t(state.lang, 'warningsHeader');
      refs.appleHeader.textContent = t(state.lang, 'appleHeader');
      refs.googleHeader.textContent = t(state.lang, 'googleHeader');
      refs.appleOptionalHeader.textContent = t(state.lang, 'appleOptionalCandidates');
      refs.appleOptionalHeader.textContent = t(state.lang, 'optionalCandidates');
      refs.copyAppleBtn.textContent = t(state.lang, 'copyApple');
      refs.copyGoogleBtn.textContent = t(state.lang, 'copyGoogle');
      refs.exportJsonBtn.textContent = t(state.lang, 'exportJson');
      refs.exportMarkdownBtn.textContent = t(state.lang, 'exportMarkdown');
      refs.applyPresetsBtn.textContent = t(state.lang, 'applyPresets');
      refs.resetBtn.textContent = t(state.lang, 'reset');
      refs.langToggle.textContent = t(state.lang, 'languageToggle');
      refs.nextBtns.forEach(function (button) { button.textContent = t(state.lang, 'next'); });
      refs.prevBtns.forEach(function (button) { button.textContent = t(state.lang, 'prev'); });
    }

    function renderPanels() {
      refs.stepPanels.forEach(function (panel) {
        const step = Number(panel.getAttribute('data-step-panel'));
        panel.hidden = step !== state.activeStep;
      });
    }

    function render() {
      const derived = computeDerived(state, state.lang);
      renderChrome();
      renderStepButtons(derived);
      renderProfileOptions();
      renderPresets();
      renderMatrix();
      renderErrorsAndWarnings(derived);
      renderApplePanel(derived);
      renderGooglePanel(derived);
      renderButtons(derived);
      renderPanels();
    }

    refs.langToggle.addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'ko' : 'en';
      persist();
      render();
    });

    refs.resetBtn.addEventListener('click', function () {
      if (!window.confirm(t(state.lang, 'resetConfirm'))) return;
      state = createDefaultState();
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
      persist();
      render();
    });

    refs.stepper.addEventListener('click', function (event) {
      const button = event.target.closest('[data-jump-step]');
      if (!button) return;
      setStep(button.getAttribute('data-jump-step'));
    });

    refs.nextBtns.forEach(function (button) {
      button.addEventListener('click', function () {
        setStep(state.activeStep + 1);
      });
    });
    refs.prevBtns.forEach(function (button) {
      button.addEventListener('click', function () {
        setStep(state.activeStep - 1);
      });
    });

    refs.appName.addEventListener('change', function () {
      state.appProfile.appName = refs.appName.value.trim();
      persist();
      render();
    });
    refs.appType.addEventListener('change', function () {
      state.appProfile.appType = refs.appType.value;
      persist();
      render();
    });
    refs.requiresAccountLogin.addEventListener('change', function () {
      state.appProfile.requiresAccountLogin = refs.requiresAccountLogin.checked;
      persist();
      render();
    });
    refs.childrenAudience.addEventListener('change', function () {
      state.appProfile.childrenAudience = refs.childrenAudience.checked;
      persist();
      render();
    });
    refs.childrenManualReviewComplete.addEventListener('change', function () {
      state.appProfile.childrenManualReviewComplete = refs.childrenManualReviewComplete.checked;
      persist();
      render();
    });
    refs.encryptedInTransit.addEventListener('change', function () {
      state.appHandling.encryptedInTransit = refs.encryptedInTransit.checked;
      persist();
      render();
    });
    refs.deletionRequestsSupported.addEventListener('change', function () {
      state.appHandling.deletionRequestsSupported = refs.deletionRequestsSupported.checked;
      persist();
      render();
    });
    refs.someProcessingOnDeviceOnly.addEventListener('change', function () {
      state.appHandling.someProcessingOnDeviceOnly = refs.someProcessingOnDeviceOnly.checked;
      persist();
      render();
    });
    refs.independentSecurityReview.addEventListener('change', function () {
      state.appHandling.independentSecurityReview = refs.independentSecurityReview.checked;
      persist();
      render();
    });

    refs.platforms.addEventListener('change', function (event) {
      const input = event.target.closest('input[data-platform-id]');
      if (!input) return;
      updatePlatform(input.getAttribute('data-platform-id'), input.checked);
    });

    refs.presetsList.addEventListener('change', function (event) {
      const input = event.target.closest('input[data-preset-id]');
      if (!input) return;
      updatePreset(input.getAttribute('data-preset-id'), input.checked);
    });

    refs.applyPresetsBtn.addEventListener('click', function () {
      state = presets.applyPresets(state, state.selectedPresets);
      persist();
      render();
      setStep(3);
    });

    refs.matrixList.addEventListener('change', function (event) {
      const boolInput = event.target.closest('input[data-bool-field]');
      if (boolInput) {
        updateDataRow(boolInput.getAttribute('data-row-id'), boolInput.getAttribute('data-bool-field'), boolInput.checked, 'boolean');
        return;
      }
      const purposeInput = event.target.closest('input[data-purpose-id]');
      if (purposeInput) {
        updateDataRow(purposeInput.getAttribute('data-row-id'), purposeInput.getAttribute('data-purpose-id'), { checked: purposeInput.checked }, 'togglePurpose');
        return;
      }
      const noteInput = event.target.closest('textarea[data-text-field]');
      if (noteInput) {
        updateDataRow(noteInput.getAttribute('data-row-id'), noteInput.getAttribute('data-text-field'), noteInput.value.trim(), 'text');
      }
    });

    refs.copyAppleBtn.addEventListener('click', function () {
      const derived = computeDerived(state, state.lang);
      if (!derived.validation.valid) {
        window.alert(t(state.lang, 'exportBlocked'));
        return;
      }
      copyText(derived.appleText);
    });
    refs.copyGoogleBtn.addEventListener('click', function () {
      const derived = computeDerived(state, state.lang);
      if (!derived.validation.valid) {
        window.alert(t(state.lang, 'exportBlocked'));
        return;
      }
      copyText(derived.googleText);
    });
    refs.exportJsonBtn.addEventListener('click', function () {
      const derived = computeDerived(state, state.lang);
      if (!derived.validation.valid) {
        window.alert(t(state.lang, 'exportBlocked'));
        return;
      }
      downloadText('app-privacy-disclosure-wizard-export.json', JSON.stringify(derived.exportBundle, null, 2), 'application/json');
    });
    refs.exportMarkdownBtn.addEventListener('click', function () {
      const derived = computeDerived(state, state.lang);
      if (!derived.validation.valid) {
        window.alert(t(state.lang, 'exportBlocked'));
        return;
      }
      downloadText('app-privacy-disclosure-wizard-export.md', derived.markdown, 'text/markdown;charset=utf-8');
    });

    render();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    UI_TEXT: UI_TEXT,
    createDefaultState: createDefaultState,
    sanitizeState: sanitizeState,
    computeDerived: computeDerived,
    buildAppleText: buildAppleText,
    buildGoogleText: buildGoogleText,
    buildMarkdownExport: buildMarkdownExport,
    buildExportBundle: buildExportBundle,
    initBrowser: initBrowser,
  };
});
