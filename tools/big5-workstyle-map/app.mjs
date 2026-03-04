import {
  TRAITS,
  TRAIT_LABELS,
  LIKERT_LABELS,
  QUESTIONS,
  createNeutralResponses,
  validateResponses,
  calculateWorkstyleMap,
  buildSummary,
  formatTierLabel,
} from './logic.mjs';

const STORAGE_KEY = 'big5_workstyle_map_result_v1';
const SHARE_URL = 'https://tools.eastsea.xyz/tools/big5-workstyle-map/';

const $ = (id) => document.getElementById(id);

const refs = {
  introScreen: $('introScreen'),
  quizScreen: $('quizScreen'),
  resultScreen: $('resultScreen'),
  startBtn: $('startBtn'),
  retakeBtn: $('retakeBtn'),
  copySummaryBtn: $('copySummaryBtn'),
  shareBtn: $('shareBtn'),
  questionIndex: $('questionIndex'),
  progressValue: $('progressValue'),
  progressBar: $('progressBar'),
  questionText: $('questionText'),
  answerOptions: $('answerOptions'),
  resultTier: $('resultTier'),
  resultName: $('resultName'),
  resultTagline: $('resultTagline'),
  traitBars: $('traitBars'),
  resultSummary: $('resultSummary'),
  introLastResult: $('introLastResult'),
  premiumTitle: $('premiumTitle'),
  premiumMeta: $('premiumMeta'),
  premiumLink: $('premiumLink'),
  errorBox: $('errorBox'),
};

const state = {
  index: 0,
  responses: createNeutralResponses().map(() => null),
  result: null,
};

function setError(message) {
  refs.errorBox.textContent = message;
  refs.errorBox.classList.toggle('show', Boolean(message));
}

function showScreen(screen) {
  refs.introScreen.classList.toggle('active', screen === 'intro');
  refs.quizScreen.classList.toggle('active', screen === 'quiz');
  refs.resultScreen.classList.toggle('active', screen === 'result');
}

function saveLastResult(result) {
  try {
    const payload = {
      at: Date.now(),
      dominantTrait: result.dominantTrait,
      archetypeName: result.archetype.name.ko,
      tagline: result.archetype.tagline.ko,
      readinessTier: result.readinessTier,
      summary: buildSummary(result, 'ko-KR'),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
  }
}

function loadLastResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderLastResultCard() {
  const cached = loadLastResult();
  if (!cached) {
    refs.introLastResult.classList.remove('show');
    refs.introLastResult.textContent = '';
    return;
  }

  const dateText = new Date(cached.at).toLocaleString('ko-KR');
  refs.introLastResult.classList.add('show');
  refs.introLastResult.innerHTML = [
    '<b>이전 결과</b>',
    `${cached.archetypeName} · ${cached.tagline}`,
    `${cached.readinessTier.toUpperCase()} · ${dateText}`,
  ].join('<br>');
}

function renderQuestion() {
  const question = QUESTIONS[state.index];
  const position = state.index + 1;
  const percent = Math.round((position / QUESTIONS.length) * 100);

  refs.questionIndex.textContent = `문항 ${position} / ${QUESTIONS.length}`;
  refs.progressValue.textContent = `${percent}%`;
  refs.progressBar.style.width = `${percent}%`;
  refs.questionText.textContent = question.text.ko;

  refs.answerOptions.innerHTML = LIKERT_LABELS.ko
    .map((label, index) => `<button class="answer-btn" type="button" data-score="${index + 1}"><span>${label}</span><b>${index + 1}</b></button>`)
    .join('');

  const buttons = refs.answerOptions.querySelectorAll('[data-score]');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const score = Number(button.dataset.score);
      chooseAnswer(score);
    });
  }
}

function renderTraitBars(result) {
  refs.traitBars.innerHTML = TRAITS
    .map((trait) => {
      const label = TRAIT_LABELS[trait].ko;
      const value = result.traits.normalized[trait];
      return [
        '<div class="bar-row">',
        `<span>${label}</span>`,
        `<div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>`,
        `<b>${value}</b>`,
        '</div>',
      ].join('');
    })
    .join('');
}

function renderResult(result) {
  refs.resultTier.textContent = formatTierLabel(result.readinessTier, 'ko-KR');
  refs.resultName.textContent = `${result.archetype.emoji} ${result.archetype.name.ko}`;
  refs.resultTagline.textContent = result.archetype.tagline.ko;
  refs.resultSummary.value = buildSummary(result, 'ko-KR');
  refs.premiumTitle.textContent = result.archetype.premiumOffer.title.ko;
  refs.premiumMeta.textContent = `${result.archetype.premiumOffer.description.ko} · 추천가 $${result.archetype.premiumOffer.priceUsd}`;

  renderTraitBars(result);
}

function completeAssessment() {
  const validation = validateResponses(state.responses);
  if (!validation.valid) {
    setError(`입력 오류: ${validation.message}`);
    return;
  }

  try {
    const result = calculateWorkstyleMap(state.responses);
    state.result = result;
    saveLastResult(result);
    renderResult(result);
    setError('');
    showScreen('result');
  } catch (error) {
    const message = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.';
    setError(message);
  }
}

function chooseAnswer(score) {
  state.responses[state.index] = score;
  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }
  completeAssessment();
}

function resetState() {
  state.index = 0;
  state.responses = createNeutralResponses().map(() => null);
  state.result = null;
}

function startAssessment() {
  resetState();
  setError('');
  showScreen('quiz');
  renderQuestion();
}

function goIntro() {
  resetState();
  setError('');
  renderLastResultCard();
  showScreen('intro');
}

async function copySummary() {
  const text = refs.resultSummary.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    window.alert('요약이 복사되었습니다.');
  } catch {
    window.alert('클립보드 권한이 없어 수동 복사가 필요합니다.');
  }
}

async function shareResult() {
  if (!state.result) return;

  const shareText = `내 워크스타일: ${state.result.archetype.name.ko} ${state.result.archetype.emoji}\n${state.result.archetype.tagline.ko}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Big5 워크스타일 맵 결과',
        text: shareText,
        url: SHARE_URL,
      });
      return;
    } catch {
    }
  }

  const fallbackPayload = `${shareText}\n${SHARE_URL}`;
  try {
    await navigator.clipboard.writeText(fallbackPayload);
    window.alert('공유 문구가 복사되었습니다.');
  } catch {
    window.alert(`아래 링크를 복사해 공유하세요:\n${SHARE_URL}`);
  }
}

function init() {
  refs.startBtn.addEventListener('click', startAssessment);
  refs.retakeBtn.addEventListener('click', goIntro);
  refs.copySummaryBtn.addEventListener('click', copySummary);
  refs.shareBtn.addEventListener('click', shareResult);
  renderLastResultCard();
  showScreen('intro');
}

init();

