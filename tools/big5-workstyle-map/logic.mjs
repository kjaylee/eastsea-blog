export const TRAITS = ['O', 'C', 'E', 'A', 'N'];
export const DOMINANT_TIE_ORDER = ['C', 'O', 'A', 'E', 'N'];

export const TRAIT_LABELS = {
  O: { ko: '개방성', en: 'Openness' },
  C: { ko: '성실성', en: 'Conscientiousness' },
  E: { ko: '외향성', en: 'Extraversion' },
  A: { ko: '친화성', en: 'Agreeableness' },
  N: { ko: '신경성', en: 'Neuroticism' },
};

export const LIKERT_LABELS = {
  ko: ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다'],
  en: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
};

export const ARCHETYPES = {
  O: {
    key: 'vision-catalyst',
    emoji: '🧠',
    name: { ko: 'Vision Catalyst', en: 'Vision Catalyst' },
    tagline: {
      ko: '새로운 가능성을 빠르게 연결해 변화의 출발점을 만드는 혁신형 기획가',
      en: 'An innovation-minded planner who connects new possibilities and sparks change early.',
    },
    focus: {
      ko: '아이디어를 실행 단계로 전환할 때 실험 기준과 리스크 순서를 명확히 제시하세요.',
      en: 'When moving from ideas to execution, define experiment criteria and risk order clearly.',
    },
    premiumOffer: {
      title: {
        ko: 'Innovation Sprint 템플릿 + 실험 우선순위 코칭',
        en: 'Innovation sprint template + experiment prioritization coaching',
      },
      description: {
        ko: '아이디어를 2주 실행 루프로 전환하는 개인 맞춤형 실험 설계 리포트입니다.',
        en: 'A tailored report to convert ideas into a two-week execution loop.',
      },
      priceUsd: 49,
    },
  },
  C: {
    key: 'precision-architect',
    emoji: '🧭',
    name: { ko: 'Precision Architect', en: 'Precision Architect' },
    tagline: {
      ko: '우선순위, 품질, 일정의 균형을 구조화해 팀 실행력을 높이는 운영 설계자',
      en: 'An operations architect who structures priorities, quality, and timelines for team execution.',
    },
    focus: {
      ko: '완성도를 유지하되 속도 저하를 막기 위해 의사결정 타임박스를 먼저 합의하세요.',
      en: 'Keep quality high while agreeing on decision timeboxes to avoid speed loss.',
    },
    premiumOffer: {
      title: {
        ko: 'Execution OS 리포트 + KPI 대시보드 설계',
        en: 'Execution OS report + KPI dashboard design',
      },
      description: {
        ko: '업무 루틴과 우선순위 체계를 표준화하는 1:1 생산성 리포트를 제공합니다.',
        en: 'A 1:1 productivity report to standardize work rhythm and priority systems.',
      },
      priceUsd: 59,
    },
  },
  E: {
    key: 'social-navigator',
    emoji: '🤝',
    name: { ko: 'Social Navigator', en: 'Social Navigator' },
    tagline: {
      ko: '관계와 에너지를 활용해 협업 속도를 끌어올리는 커뮤니케이션 중심 실행가',
      en: 'A communication-driven executor who uses social energy to accelerate collaboration.',
    },
    focus: {
      ko: '관계 확장과 함께 문서화 루틴을 병행하면 실행 누락을 크게 줄일 수 있습니다.',
      en: 'Pair social momentum with lightweight documentation to reduce execution gaps.',
    },
    premiumOffer: {
      title: {
        ko: 'Stakeholder Alignment 스크립트 패키지',
        en: 'Stakeholder alignment script package',
      },
      description: {
        ko: '회의·설득·보고 상황별 스크립트와 후속 액션 템플릿을 제공합니다.',
        en: 'Includes scenario scripts for meetings, persuasion, reporting, and action templates.',
      },
      priceUsd: 39,
    },
  },
  A: {
    key: 'harmony-builder',
    emoji: '🌿',
    name: { ko: 'Harmony Builder', en: 'Harmony Builder' },
    tagline: {
      ko: '신뢰와 배려를 기반으로 팀의 갈등 비용을 낮추는 안정형 협업 조율가',
      en: 'A stable collaborator who lowers conflict costs through trust and empathy.',
    },
    focus: {
      ko: '조율 강점은 크지만 중요한 이슈는 기준선과 마감선을 명확히 그어야 합니다.',
      en: 'Use your mediation strength, but set non-negotiable baselines and deadlines.',
    },
    premiumOffer: {
      title: {
        ko: 'Conflict-light 회의 구조 설계 리포트',
        en: 'Conflict-light meeting structure report',
      },
      description: {
        ko: '갈등 완화와 의사결정 속도를 동시에 높이는 팀 커뮤니케이션 설계를 지원합니다.',
        en: 'Designs communication structures that reduce friction and improve decision speed.',
      },
      priceUsd: 45,
    },
  },
  N: {
    key: 'signal-sentinel',
    emoji: '🛡️',
    name: { ko: 'Signal Sentinel', en: 'Signal Sentinel' },
    tagline: {
      ko: '리스크 신호를 민감하게 감지해 팀의 사전 대비력을 높이는 위험 감시자',
      en: 'A risk sentinel who detects weak signals early and improves team preparedness.',
    },
    focus: {
      ko: '경계심을 문제해결력으로 전환하려면 우려를 우선순위 액션으로 번역하세요.',
      en: 'Convert vigilance into action by translating concerns into prioritized tasks.',
    },
    premiumOffer: {
      title: {
        ko: 'Stress Load 관리 플래너 + 리스크 대응 루틴',
        en: 'Stress-load planner + risk response routine',
      },
      description: {
        ko: '과부하 신호를 조기 탐지하고 회복 루틴을 설계하는 실전형 워크북을 제공합니다.',
        en: 'A practical workbook to detect overload early and build recovery routines.',
      },
      priceUsd: 42,
    },
  },
};

export const QUESTIONS = [
  {
    id: 'q01',
    trait: 'O',
    reverse: false,
    text: {
      ko: '새로운 툴이나 업무 방식을 접하면 먼저 시험해보는 편이다.',
      en: 'When I encounter a new tool or workflow, I tend to try it first.',
    },
  },
  {
    id: 'q02',
    trait: 'C',
    reverse: false,
    text: {
      ko: '업무 시작 전에 우선순위와 마감 순서를 먼저 구조화한다.',
      en: 'Before starting work, I structure priorities and deadlines first.',
    },
  },
  {
    id: 'q03',
    trait: 'E',
    reverse: false,
    text: {
      ko: '협업 중 아이디어를 말로 정리할 때 집중력이 더 올라간다.',
      en: 'During collaboration, I focus better when speaking ideas out loud.',
    },
  },
  {
    id: 'q04',
    trait: 'A',
    reverse: false,
    text: {
      ko: '팀 의견이 엇갈릴 때 상대의 의도를 먼저 확인하려고 한다.',
      en: 'When opinions clash, I first try to understand the other side’s intent.',
    },
  },
  {
    id: 'q05',
    trait: 'N',
    reverse: false,
    text: {
      ko: '작은 이상 신호가 보여도 일정 차질 가능성을 바로 떠올린다.',
      en: 'Even small warning signs make me quickly think about schedule risk.',
    },
  },
  {
    id: 'q06',
    trait: 'O',
    reverse: true,
    text: {
      ko: '익숙한 방식이 있으면 새로운 접근은 굳이 시도하지 않는다.',
      en: 'If a familiar method exists, I rarely test new approaches.',
    },
  },
  {
    id: 'q07',
    trait: 'C',
    reverse: true,
    text: {
      ko: '체계적인 계획 없이도 일단 시작하면 결과가 나온다고 믿는다.',
      en: 'I believe I can still get good outcomes without a structured plan.',
    },
  },
  {
    id: 'q08',
    trait: 'E',
    reverse: true,
    text: {
      ko: '업무 중 다른 사람과 대화하면 오히려 에너지가 빠진다.',
      en: 'Talking to others during work usually drains my energy.',
    },
  },
  {
    id: 'q09',
    trait: 'A',
    reverse: true,
    text: {
      ko: '협업보다 혼자 결정하는 편이 갈등이 적어 더 낫다고 느낀다.',
      en: 'I feel solo decisions are better than collaboration because conflict is lower.',
    },
  },
  {
    id: 'q10',
    trait: 'N',
    reverse: true,
    text: {
      ko: '압박이 커져도 감정 기복 없이 대부분 안정적으로 유지된다.',
      en: 'Even under pressure, I stay mostly stable without emotional swings.',
    },
  },
  {
    id: 'q11',
    trait: 'O',
    reverse: false,
    text: {
      ko: '다른 팀 사례를 참고해 우리 팀 방식으로 재설계하는 것을 즐긴다.',
      en: 'I enjoy adapting external team practices into our own way of working.',
    },
  },
  {
    id: 'q12',
    trait: 'C',
    reverse: false,
    text: {
      ko: '완료 기준(Definition of Done)을 명확히 정해야 마음이 편하다.',
      en: 'I feel more at ease when a clear definition of done is agreed.',
    },
  },
  {
    id: 'q13',
    trait: 'E',
    reverse: false,
    text: {
      ko: '새로운 사람과 빠르게 라포를 만들고 협업을 시작하는 편이다.',
      en: 'I can quickly build rapport and start working with new people.',
    },
  },
  {
    id: 'q14',
    trait: 'A',
    reverse: false,
    text: {
      ko: '성과보다 관계가 무너질 조짐이 보이면 먼저 조율에 나선다.',
      en: 'When relationship strain appears, I prioritize mediation even before output.',
    },
  },
  {
    id: 'q15',
    trait: 'N',
    reverse: false,
    text: {
      ko: '예상치 못한 변화가 생기면 머릿속에서 최악의 시나리오를 먼저 점검한다.',
      en: 'Unexpected change makes me review worst-case scenarios first.',
    },
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function roundInt(value) {
  return Math.round(value);
}

function localeToLang(locale = 'ko-KR') {
  return String(locale).toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

function applyReverse(question, value) {
  return question.reverse ? 6 - value : value;
}

function scoreToNormalized(rawScore) {
  return roundInt(((rawScore - 3) / 12) * 100);
}

function computeReadinessTier(overallScore) {
  if (overallScore >= 70) return 'prime';
  if (overallScore >= 50) return 'growth';
  return 'watch';
}

export function createNeutralResponses() {
  return Array.from({ length: QUESTIONS.length }, () => 3);
}

export function validateResponses(responses) {
  if (!Array.isArray(responses)) {
    return { valid: false, message: 'responses must be an array.' };
  }
  if (responses.length !== QUESTIONS.length) {
    return { valid: false, message: `responses must contain ${QUESTIONS.length} entries.` };
  }

  for (let index = 0; index < responses.length; index += 1) {
    const value = Number(responses[index]);
    if (!Number.isInteger(value)) {
      return { valid: false, message: `response[${index}] must be an integer from 1 to 5.` };
    }
    if (value < 1 || value > 5) {
      return { valid: false, message: `response[${index}] must be between 1 and 5.` };
    }
  }

  return { valid: true, message: '' };
}

export function calculateWorkstyleMap(responses) {
  const validation = validateResponses(responses);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid responses');
  }

  const traitRaw = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  QUESTIONS.forEach((question, index) => {
    const value = Number(responses[index]);
    traitRaw[question.trait] += applyReverse(question, value);
  });

  const traitNormalized = {};
  for (const trait of TRAITS) {
    traitNormalized[trait] = clamp(scoreToNormalized(traitRaw[trait]), 0, 100);
  }

  const rankedTraits = [...TRAITS].sort((left, right) => {
    const diff = traitNormalized[right] - traitNormalized[left];
    if (diff !== 0) return diff;
    return DOMINANT_TIE_ORDER.indexOf(left) - DOMINANT_TIE_ORDER.indexOf(right);
  });

  const dominantTrait = rankedTraits[0];
  const secondaryTrait = rankedTraits[1];

  const innovationIndex = roundInt((traitNormalized.O * 0.7) + (traitNormalized.C * 0.3));
  const collaborationIndex = roundInt((traitNormalized.A * 0.6) + (traitNormalized.E * 0.4));
  const stressLoad = roundInt((traitNormalized.N * 0.55) + ((100 - traitNormalized.C) * 0.45));
  const values = Object.values(traitNormalized);
  const balanceIndex = roundInt(100 - (Math.max(...values) - Math.min(...values)));
  const overallScore = roundInt((innovationIndex * 0.35) + (collaborationIndex * 0.35) + ((100 - stressLoad) * 0.3));
  const readinessTier = computeReadinessTier(overallScore);

  const archetype = ARCHETYPES[dominantTrait];

  return {
    questionCount: QUESTIONS.length,
    dominantTrait,
    secondaryTrait,
    archetype,
    traits: {
      raw: traitRaw,
      normalized: traitNormalized,
      ranked: rankedTraits,
    },
    indices: {
      innovationIndex,
      collaborationIndex,
      stressLoad,
      balanceIndex,
      overallScore,
    },
    readinessTier,
  };
}

export function formatTierLabel(tier, locale = 'ko-KR') {
  const lang = localeToLang(locale);
  if (lang === 'ko') {
    if (tier === 'prime') return '실행 준비도: PRIME';
    if (tier === 'growth') return '실행 준비도: GROWTH';
    return '실행 준비도: WATCH';
  }
  if (tier === 'prime') return 'Readiness: PRIME';
  if (tier === 'growth') return 'Readiness: GROWTH';
  return 'Readiness: WATCH';
}

export function buildSummary(result, locale = 'ko-KR') {
  const lang = localeToLang(locale);
  const archetypeName = result.archetype.name[lang];
  const tagline = result.archetype.tagline[lang];
  const focus = result.archetype.focus[lang];
  const offerTitle = result.archetype.premiumOffer.title[lang];
  const offerDescription = result.archetype.premiumOffer.description[lang];

  if (lang === 'ko') {
    return [
      `Big5 워크스타일 맵 결과: ${archetypeName} ${result.archetype.emoji}`,
      `대표 성향: ${TRAIT_LABELS[result.dominantTrait].ko} (보조: ${TRAIT_LABELS[result.secondaryTrait].ko})`,
      `태그라인: ${tagline}`,
      `핵심 지수: 혁신 ${result.indices.innovationIndex} / 협업 ${result.indices.collaborationIndex} / 스트레스부하 ${result.indices.stressLoad}`,
      `${formatTierLabel(result.readinessTier, locale)} · 종합 ${result.indices.overallScore}`,
      `실전 포인트: ${focus}`,
      `프리미엄 제안: ${offerTitle} ($${result.archetype.premiumOffer.priceUsd})`,
      `내용: ${offerDescription}`,
    ].join('\n');
  }

  return [
    `Big5 Workstyle Map Result: ${archetypeName} ${result.archetype.emoji}`,
    `Dominant trait: ${TRAIT_LABELS[result.dominantTrait].en} (secondary: ${TRAIT_LABELS[result.secondaryTrait].en})`,
    `Tagline: ${tagline}`,
    `Core indexes: Innovation ${result.indices.innovationIndex} / Collaboration ${result.indices.collaborationIndex} / Stress Load ${result.indices.stressLoad}`,
    `${formatTierLabel(result.readinessTier, locale)} · Overall ${result.indices.overallScore}`,
    `Action focus: ${focus}`,
    `Premium offer: ${offerTitle} ($${result.archetype.premiumOffer.priceUsd})`,
    `What you get: ${offerDescription}`,
  ].join('\n');
}

