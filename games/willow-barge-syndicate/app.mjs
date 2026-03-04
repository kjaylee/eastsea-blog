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
  getPatternPreview,
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
const patternStateEl = $('patternState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnToggle = $('btnToggle');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnTrader = $('btnTrader');
const btnConsortium = $('btnConsortium');

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
  return ['Lock A', 'Lock B', 'Lock C'][index] || 'Lock B';
}

function routeLabel(key) {
  return CONFIG.routes[key]?.label || 'Local Locks';
}

function modeLabel(v) {
  return v === 1 ? 'Sun' : 'Shadow';
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
    const preview = getPatternPreview(state);
    patternStateEl.textContent = preview.relayReady
      ? (preview.siltRisk ? 'Relay Ready + Silt Risk' : 'Relay Ready')
      : (preview.siltRisk ? 'Silt Risk' : 'Neutral');
    patternStateEl.style.color = preview.relayReady ? '#2d915f' : '#6f5c4b';
  } else {
    patternStateEl.textContent = state.lastBreakdown.relay
      ? (state.lastBreakdown.silt ? 'Relay+Silt Applied' : 'Relay Bonus Applied')
      : (state.lastBreakdown.silt ? 'Silt Penalty Applied' : 'Neutral');
    patternStateEl.style.color = state.lastBreakdown.relay ? '#2d915f' : '#6f5c4b';
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnStart.disabled = !dock;
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnTrader.disabled = !dock;
  btnConsortium.disabled = !dock;
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
  grad.addColorStop(0, '#fffdf7');
  grad.addColorStop(1, '#f2e6d2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(154, 183, 150, 0.19)' : 'rgba(210, 194, 160, 0.20)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(116, 92, 67, 0.18)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  const bodyColor = state.mode === 1 ? '#d9a45f' : '#7f9076';
  ctx.fillStyle = bodyColor;
  ctx.fillRect(px - 16, py - 6, 32, 14);
  ctx.fillStyle = '#5e4532';
  ctx.fillRect(px - 9, py - 15, 18, 8);

  ctx.fillStyle = '#2e231a';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.mode === 1 ? 'S' : 'N', px, py + 1);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'debris') {
      ctx.fillStyle = '#8b6f58';
      ctx.beginPath();
      ctx.moveTo(x - 11, y + 8);
      ctx.lineTo(x - 5, y - 9);
      ctx.lineTo(x + 2, y - 2);
      ctx.lineTo(x + 10, y - 8);
      ctx.lineTo(x + 12, y + 8);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    ctx.fillStyle = token.mode === 1 ? '#f1cd8a' : '#cad8bf';
    ctx.beginPath();
    ctx.roundRect(x - 11, y - 10, 22, 20, 6);
    ctx.fill();

    ctx.fillStyle = '#4f3f33';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${token.mode === 1 ? 'S' : 'N'}${token.tier}`, x, y + 1);
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
btnTrader.addEventListener('click', () => apply(chooseRoute(state, 'trader')));
btnConsortium.addEventListener('click', () => apply(chooseRoute(state, 'consortium')));

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
