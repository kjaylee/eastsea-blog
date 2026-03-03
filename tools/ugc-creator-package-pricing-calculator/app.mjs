import { DEFAULT_INPUT, validateInputs, calculatePackageQuote, buildSummary } from './logic.mjs';

const STORAGE_KEY = 'ugc_creator_package_pricing_calculator_v1';

const $ = (id) => document.getElementById(id);

const refs = {
  avgVideoViews: $('avgVideoViews'),
  avgStoryViews: $('avgStoryViews'),
  engagementRatePct: $('engagementRatePct'),
  packageVideos: $('packageVideos'),
  packageStories: $('packageStories'),
  benchmarkCpm: $('benchmarkCpm'),
  productionCostPerVideo: $('productionCostPerVideo'),
  revisionCostPerRound: $('revisionCostPerRound'),
  revisionsPerVideo: $('revisionsPerVideo'),
  usageMonths: $('usageMonths'),
  usageFeePerMonthPerVideo: $('usageFeePerMonthPerVideo'),
  whitelistingPct: $('whitelistingPct'),
  agencyFeePct: $('agencyFeePct'),
  targetMarginPct: $('targetMarginPct'),
  expectedSales: $('expectedSales'),
  grossProfitPerSale: $('grossProfitPerSale'),
  error: $('error'),
  summary: $('summary'),
  status: $('status'),
  copyBtn: $('copyBtn'),
  resetBtn: $('resetBtn'),
  quoteToBrand: $('quoteToBrand'),
  creatorTakeHome: $('creatorTakeHome'),
  effectiveCpm: $('effectiveCpm'),
  projectedBrandRoi: $('projectedBrandRoi'),
  totalReachViews: $('totalReachViews'),
  estimatedEngagements: $('estimatedEngagements'),
  reachValue: $('reachValue'),
  creatorHardCost: $('creatorHardCost'),
  usageFee: $('usageFee'),
  whitelistingFee: $('whitelistingFee'),
  agencyFeeAmount: $('agencyFeeAmount'),
};

const numericKeys = Object.keys(DEFAULT_INPUT);

const formatterKRW = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});
const formatterNum = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
});

function parseForm() {
  const data = {};
  for (const key of numericKeys) {
    data[key] = Number(refs[key].value);
  }
  return data;
}

function applyInputs(data) {
  for (const key of numericKeys) {
    refs[key].value = data[key];
  }
}

function saveInputs(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // no-op: storage may be blocked
  }
}

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INPUT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INPUT, ...parsed };
  } catch {
    return { ...DEFAULT_INPUT };
  }
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function renderStatus(result) {
  const statusText =
    result.status === 'strong'
      ? '<span class="dot good">●</span> 브랜드 ROI 관점에서 설득력 높은 패키지'
      : result.status === 'balanced'
        ? '<span class="dot warn">●</span> ROI 밸런스 구간 (조건 협의 권장)'
        : '<span class="dot bad">●</span> ROI 리스크 구간 (단가/구성 재조정 권장)';
  refs.status.innerHTML = statusText;
}

function render() {
  const input = parseForm();
  const validation = validateInputs(input);

  if (!validation.valid) {
    setError(`입력 오류: ${validation.message}`);
    refs.summary.value = '';
    refs.quoteToBrand.textContent = '-';
    refs.creatorTakeHome.textContent = '-';
    refs.effectiveCpm.textContent = '-';
    refs.projectedBrandRoi.textContent = '-';
    refs.totalReachViews.textContent = '-';
    refs.estimatedEngagements.textContent = '-';
    refs.reachValue.textContent = '-';
    refs.creatorHardCost.textContent = '-';
    refs.usageFee.textContent = '-';
    refs.whitelistingFee.textContent = '-';
    refs.agencyFeeAmount.textContent = '-';
    refs.status.innerHTML = '<span class="dot bad">●</span> 입력값을 확인해주세요';
    return;
  }

  setError('');
  const result = calculatePackageQuote(input);

  refs.quoteToBrand.textContent = formatterKRW.format(result.quoteToBrand);
  refs.creatorTakeHome.textContent = formatterKRW.format(result.creatorTakeHome);
  refs.effectiveCpm.textContent = formatterKRW.format(result.effectiveCpm);
  refs.projectedBrandRoi.textContent = `${formatterNum.format(result.projectedBrandRoi)}x`;

  refs.totalReachViews.textContent = formatterNum.format(result.totalReachViews);
  refs.estimatedEngagements.textContent = formatterNum.format(result.estimatedEngagements);
  refs.reachValue.textContent = formatterKRW.format(result.reachValue);
  refs.creatorHardCost.textContent = formatterKRW.format(result.creatorHardCost);
  refs.usageFee.textContent = formatterKRW.format(result.usageFee);
  refs.whitelistingFee.textContent = formatterKRW.format(result.whitelistingFee);
  refs.agencyFeeAmount.textContent = formatterKRW.format(result.quoteToBrand - result.creatorTakeHome);

  refs.summary.value = buildSummary(result, 'ko-KR');
  renderStatus(result);
  saveInputs(input);
}

function resetDefaults() {
  applyInputs(DEFAULT_INPUT);
  render();
}

async function copySummary() {
  const text = refs.summary.value.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    window.alert('요약이 복사되었습니다.');
  } catch {
    window.alert('클립보드 권한이 없어 수동 복사가 필요합니다.');
  }
}

function init() {
  applyInputs(loadInputs());
  for (const key of numericKeys) {
    refs[key].addEventListener('input', render);
    refs[key].addEventListener('change', render);
  }
  refs.copyBtn.addEventListener('click', copySummary);
  refs.resetBtn.addEventListener('click', resetDefaults);
  render();
}

init();
