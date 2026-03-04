import {
  STORAGE_KEY,
  CONFIG,
  createInitialState,
  serializeProgress,
  startRun,
  moveLane,
  stepRun,
  mergeBestPair,
  chooseCharter,
  getDeckMultiplier,
  getWakePreview,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const laneEl = $('lane');
const hullEl = $('hull');
const timerEl = $('timer');
const dayEl = $('day');
const deckMultEl = $('deckMult');
const charterEl = $('charter');
const coinsEl = $('coins');
const gemsEl = $('gems');
const lastPayoutEl = $('lastPayout');
const bestPayoutEl = $('bestPayout');
const totalRevenueEl = $('totalRevenue');
const wakeStateEl = $('wakeState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnCoast = $('btnCoast');
const btnGrand = $('btnGrand');

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
  return ['Outer Left', 'Inner Left', 'Inner Right', 'Outer Right'][index] || 'Inner Left';
}

function charterLabel(key) {
  return CONFIG.charters[key]?.label || 'Local Pier';
}

function renderWakeStatus() {
  if (state.phase === 'run') {
    const preview = getWakePreview(state);
    if (preview.wakeReady) {
      wakeStateEl.textContent = `Wake Ready x${preview.wakeCharges}`;
      wakeStateEl.style.color = '#1f9d7a';
      return;
    }

    if (preview.dragRisk) {
      wakeStateEl.textContent = 'Drag Risk';
      wakeStateEl.style.color = '#b45309';
      return;
    }

    wakeStateEl.textContent = 'Building Pattern';
    wakeStateEl.style.color = '#706254';
    return;
  }

  if (state.lastBreakdown?.dragTax) {
    wakeStateEl.textContent = 'Drag Tax Applied';
    wakeStateEl.style.color = '#b45309';
    return;
  }

  if (state.lastBreakdown?.wakeEcho) {
    wakeStateEl.textContent = 'Wake Bonus Applied';
    wakeStateEl.style.color = '#1f9d7a';
    return;
  }

  wakeStateEl.textContent = 'Neutral';
  wakeStateEl.style.color = '#706254';
}

function renderUI() {
  laneEl.textContent = laneName(state.lane);
  hullEl.textContent = String(state.hull);
  timerEl.textContent = state.phase === 'run' ? `${(state.remainingMs / 1000).toFixed(1)}s` : '--';
  dayEl.textContent = String(state.day);
  deckMultEl.textContent = `${getDeckMultiplier(state).toFixed(2)}x`;
  charterEl.textContent = charterLabel(state.charter);

  coinsEl.textContent = String(state.coins);
  gemsEl.textContent = String(state.gems);
  lastPayoutEl.textContent = String(state.lastPayout);
  bestPayoutEl.textContent = String(state.bestPayout);
  totalRevenueEl.textContent = String(state.totalRevenue);

  renderWakeStatus();

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnCoast.disabled = !dock;
  btnGrand.disabled = !dock;
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
  grad.addColorStop(0, '#fffef7');
  grad.addColorStop(1, '#ffe9d2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(173, 220, 239, 0.23)' : 'rgba(245, 198, 155, 0.2)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(136, 115, 90, 0.25)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  ctx.fillStyle = '#ed8f59';
  ctx.fillRect(px - 13, py - 10, 26, 20);
  ctx.fillStyle = '#845540';
  ctx.fillRect(px - 17, py + 8, 34, 7);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'reef') {
      ctx.fillStyle = '#7b6b5d';
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x - 11, y + 9);
      ctx.lineTo(x + 11, y + 9);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    const palette = ['#ffd38c', '#ffbf6a', '#f79f4b', '#e87934', '#cc5d25'];
    const color = palette[Math.max(0, Math.min(4, token.tier - 1))];
    ctx.fillStyle = color;
    ctx.fillRect(x - 11, y - 11, 22, 22);

    ctx.fillStyle = '#5a3e2d';
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

btnLocal.addEventListener('click', () => apply(chooseCharter(state, 'local')));
btnCoast.addEventListener('click', () => apply(chooseCharter(state, 'coast')));
btnGrand.addEventListener('click', () => apply(chooseCharter(state, 'grand')));

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
