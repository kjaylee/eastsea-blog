import {
  STORAGE_KEY,
  CONFIG,
  createInitialState,
  serializeProgress,
  startRun,
  moveLane,
  stepRun,
  mergeBestPair,
  chooseContract,
  getDeckMultiplier,
  getShadePreview,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const laneEl = $('lane');
const hullEl = $('hull');
const timerEl = $('timer');
const dayEl = $('day');
const deckMultEl = $('deckMult');
const contractEl = $('contract');
const coinsEl = $('coins');
const gemsEl = $('gems');
const lastPayoutEl = $('lastPayout');
const bestPayoutEl = $('bestPayout');
const totalRevenueEl = $('totalRevenue');
const shadeStateEl = $('shadeState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnStall = $('btnStall');
const btnMarket = $('btnMarket');
const btnFestival = $('btnFestival');

const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProgress(state)));
  } catch {
    // ignore
  }
}

let state = createInitialState(loadSaved());
let lastTs = performance.now();

function apply(next) {
  state = next;
  if (state.phase === 'dock') saveState(state);
  renderUI();
}

function laneName(index) {
  return ['West Lane', 'Center Lane', 'East Lane'][index] || 'Center Lane';
}

function contractLabel(key) {
  return CONFIG.contracts[key]?.label || 'Town Stall';
}

function renderShadeStatus() {
  if (state.phase === 'run') {
    const preview = getShadePreview(state);
    if (preview.shadeReady) {
      shadeStateEl.textContent = `Shade Ready x${preview.charges}`;
      shadeStateEl.style.color = '#2f8f6b';
      return;
    }

    if (preview.crowdRisk) {
      shadeStateEl.textContent = 'Crowd Risk';
      shadeStateEl.style.color = '#b26b16';
      return;
    }

    shadeStateEl.textContent = 'Collecting Pattern';
    shadeStateEl.style.color = '#6f5b48';
    return;
  }

  if (state.lastBreakdown?.crowdPenalty) {
    shadeStateEl.textContent = 'Crowd Penalty Applied';
    shadeStateEl.style.color = '#b26b16';
    return;
  }

  if (state.lastBreakdown?.shadeSwap) {
    shadeStateEl.textContent = 'Shade Swap Applied';
    shadeStateEl.style.color = '#2f8f6b';
    return;
  }

  shadeStateEl.textContent = 'Neutral';
  shadeStateEl.style.color = '#6f5b48';
}

function renderUI() {
  laneEl.textContent = laneName(state.lane);
  hullEl.textContent = String(state.hull);
  timerEl.textContent = state.phase === 'run' ? `${(state.remainingMs / 1000).toFixed(1)}s` : '--';
  dayEl.textContent = String(state.day);
  deckMultEl.textContent = `${getDeckMultiplier(state).toFixed(2)}x`;
  contractEl.textContent = contractLabel(state.contract);

  coinsEl.textContent = String(state.coins);
  gemsEl.textContent = String(state.gems);
  lastPayoutEl.textContent = String(state.lastPayout);
  bestPayoutEl.textContent = String(state.bestPayout);
  totalRevenueEl.textContent = String(state.totalRevenue);

  renderShadeStatus();

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnMerge.disabled = !dock;
  btnStall.disabled = !dock;
  btnMarket.disabled = !dock;
  btnFestival.disabled = !dock;
  btnStart.disabled = !dock;
}

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function laneX(lane, width) {
  const laneWidth = width / CONFIG.laneCount;
  return laneWidth * lane + laneWidth / 2;
}

function drawArena() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#fffcf4');
  grad.addColorStop(1, '#ffe8c8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 220, 142, 0.26)' : 'rgba(182, 231, 191, 0.24)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(140, 116, 89, 0.24)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  ctx.fillStyle = '#e7864f';
  ctx.fillRect(px - 14, py - 10, 28, 20);
  ctx.fillStyle = '#7f5237';
  ctx.fillRect(px - 18, py + 8, 36, 7);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'cart') {
      ctx.fillStyle = '#836a54';
      ctx.fillRect(x - 12, y - 9, 24, 18);
      ctx.fillStyle = '#5f4d3c';
      ctx.fillRect(x - 14, y + 7, 28, 4);
      continue;
    }

    const sunPalette = ['#ffe09a', '#ffc971', '#f5ab4c', '#e78a2f', '#cb6e1f'];
    const shadePalette = ['#d4f1c7', '#b9e8ab', '#91d989', '#67be72', '#4ca55e'];
    const palette = token.tone === 'shade' ? shadePalette : sunPalette;
    const color = palette[Math.max(0, Math.min(4, token.tier - 1))];

    ctx.fillStyle = color;
    ctx.fillRect(x - 11, y - 11, 22, 22);

    ctx.fillStyle = '#5a3f2e';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T${token.tier}`, x, y + 0.5);
  }
}

function stepFrame(ts) {
  const dt = Math.min(64, ts - lastTs);
  lastTs = ts;

  if (state.phase === 'run') {
    state = stepRun(state, dt);
    if (state.phase === 'dock') saveState(state);
    renderUI();
  }

  drawArena();
  requestAnimationFrame(stepFrame);
}

function move(dir) {
  apply(moveLane(state, dir));
}

btnLeft.addEventListener('click', () => move(-1));
btnRight.addEventListener('click', () => move(1));
btnStart.addEventListener('click', () => apply(startRun(state)));
btnMerge.addEventListener('click', () => apply(mergeBestPair(state)));

btnStall.addEventListener('click', () => apply(chooseContract(state, 'stall')));
btnMarket.addEventListener('click', () => apply(chooseContract(state, 'market')));
btnFestival.addEventListener('click', () => apply(chooseContract(state, 'festival')));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    event.preventDefault();
    move(-1);
    return;
  }

  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    event.preventDefault();
    move(1);
    return;
  }

  if (event.key === ' ' || event.key === 'Enter') {
    if (state.phase === 'dock') {
      event.preventDefault();
      apply(startRun(state));
    }
  }
});

canvas.addEventListener('pointerdown', (event) => {
  if (state.phase !== 'run') return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  if (x < rect.width / 2) move(-1);
  else move(1);
});

window.addEventListener('resize', () => {
  fitCanvas();
  drawArena();
});

fitCanvas();
renderUI();
requestAnimationFrame((ts) => {
  lastTs = ts;
  requestAnimationFrame(stepFrame);
});
