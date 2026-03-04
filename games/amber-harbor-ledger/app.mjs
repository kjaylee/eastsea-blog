import {
  STORAGE_KEY,
  CONFIG,
  createInitialState,
  serializeProgress,
  startRun,
  moveLane,
  toggleMode,
  stepRun,
  mergeBestPair,
  chooseRoute,
  getHoldMultiplier,
  getWakePreview,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const laneEl = $('lane');
const modeEl = $('mode');
const hullEl = $('hull');
const timerEl = $('timer');
const dayEl = $('day');
const routeEl = $('route');
const coinsEl = $('coins');
const gemsEl = $('gems');
const lastPayoutEl = $('lastPayout');
const bestPayoutEl = $('bestPayout');
const totalRevenueEl = $('totalRevenue');
const holdMultEl = $('holdMult');
const wakeStateEl = $('wakeState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnToggle = $('btnToggle');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnFleet = $('btnFleet');
const btnGuild = $('btnGuild');

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
    // ignore storage failures
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
  return ['West', 'Center', 'East'][index] || 'Center';
}

function routeLabel(key) {
  return CONFIG.routes[key]?.label || 'Local Pier';
}

function modeLabel(v) {
  return v === 1 ? 'Breeze' : 'Anchor';
}

function renderUI() {
  laneEl.textContent = laneName(state.lane);
  modeEl.textContent = modeLabel(state.mode);
  hullEl.textContent = String(state.hull);
  timerEl.textContent = state.phase === 'run' ? `${(state.remainingMs / 1000).toFixed(1)}s` : '--';
  dayEl.textContent = String(state.day);
  routeEl.textContent = routeLabel(state.route);

  coinsEl.textContent = String(state.coins);
  gemsEl.textContent = String(state.gems);
  lastPayoutEl.textContent = String(state.lastPayout);
  bestPayoutEl.textContent = String(state.bestPayout);
  totalRevenueEl.textContent = String(state.totalRevenue);
  holdMultEl.textContent = `${getHoldMultiplier(state).toFixed(2)}x`;

  if (state.phase === 'run') {
    const preview = getWakePreview(state);
    wakeStateEl.textContent = preview.wakeWeaveReady
      ? (preview.congestionRisk ? 'Dividend + Toll Risk' : 'Dividend Ready')
      : (preview.congestionRisk ? 'Toll Risk' : 'Neutral');
    wakeStateEl.style.color = preview.wakeWeaveReady ? '#c87026' : '#6f5847';
  } else {
    wakeStateEl.textContent = state.lastBreakdown.wakeWeave
      ? (state.lastBreakdown.congestion ? 'Dividend + Toll Applied' : 'Dividend Applied')
      : (state.lastBreakdown.congestion ? 'Toll Applied' : 'Neutral');
    wakeStateEl.style.color = state.lastBreakdown.wakeWeave ? '#2f9d71' : '#6f5847';
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnStart.disabled = !dock;
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnFleet.disabled = !dock;
  btnGuild.disabled = !dock;
  btnToggle.disabled = dock;
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
  grad.addColorStop(0, '#fffdf8');
  grad.addColorStop(1, '#ffe8cd');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(233, 201, 166, 0.30)' : 'rgba(233, 201, 166, 0.15)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(145, 103, 66, 0.2)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  const bodyColor = state.mode === 1 ? '#efab54' : '#7f95cf';
  ctx.fillStyle = bodyColor;
  ctx.fillRect(px - 16, py - 6, 32, 14);
  ctx.fillStyle = '#66472f';
  ctx.fillRect(px - 9, py - 15, 18, 8);

  ctx.fillStyle = '#2e211a';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.mode === 1 ? 'B' : 'A', px, py + 1);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'drift') {
      ctx.fillStyle = '#826d57';
      ctx.beginPath();
      ctx.moveTo(x - 11, y + 8);
      ctx.lineTo(x - 4, y - 10);
      ctx.lineTo(x + 2, y - 2);
      ctx.lineTo(x + 9, y - 8);
      ctx.lineTo(x + 12, y + 8);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    ctx.fillStyle = token.mode === 1 ? '#ffd188' : '#bfd0ff';
    ctx.beginPath();
    ctx.roundRect(x - 11, y - 10, 22, 20, 6);
    ctx.fill();

    ctx.fillStyle = '#4f3a2c';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${token.mode === 1 ? 'B' : 'A'}${token.tier}`, x, y + 1);
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
btnToggle.addEventListener('click', () => apply(toggleMode(state)));
btnStart.addEventListener('click', () => apply(startRun(state)));
btnMerge.addEventListener('click', () => apply(mergeBestPair(state)));

btnLocal.addEventListener('click', () => apply(chooseRoute(state, 'local')));
btnFleet.addEventListener('click', () => apply(chooseRoute(state, 'fleet')));
btnGuild.addEventListener('click', () => apply(chooseRoute(state, 'guild')));

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (event.key === 'ArrowLeft' || key === 'a') {
    event.preventDefault();
    move(-1);
    return;
  }

  if (event.key === 'ArrowRight' || key === 'd') {
    event.preventDefault();
    move(1);
    return;
  }

  if (event.key === 'ArrowUp' || key === 'w') {
    if (state.phase === 'run') {
      event.preventDefault();
      apply(toggleMode(state));
    }
    return;
  }

  if ((event.key === ' ' || event.key === 'Enter') && state.phase === 'dock') {
    event.preventDefault();
    apply(startRun(state));
  }
});

canvas.addEventListener('pointerdown', (event) => {
  if (state.phase !== 'run') return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;

  if (x < rect.width * 0.38) {
    move(-1);
    return;
  }

  if (x > rect.width * 0.62) {
    move(1);
    return;
  }

  apply(toggleMode(state));
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
