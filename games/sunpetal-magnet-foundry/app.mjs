import {
  STORAGE_KEY,
  CONFIG,
  createInitialState,
  serializeProgress,
  startRun,
  moveLane,
  togglePolarity,
  stepRun,
  mergeBestPair,
  chooseRoute,
  getVaultMultiplier,
  getPrismPreview,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const laneEl = $('lane');
const polarityEl = $('polarity');
const hullEl = $('hull');
const timerEl = $('timer');
const dayEl = $('day');
const routeEl = $('route');
const coinsEl = $('coins');
const gemsEl = $('gems');
const lastPayoutEl = $('lastPayout');
const bestPayoutEl = $('bestPayout');
const totalRevenueEl = $('totalRevenue');
const vaultMultEl = $('vaultMult');
const prismStateEl = $('prismState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnToggle = $('btnToggle');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnBazaar = $('btnBazaar');
const btnRoyal = $('btnRoyal');

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
  return CONFIG.routes[key]?.label || 'Local Loop';
}

function polarityLabel(v) {
  return v === 1 ? 'N' : 'S';
}

function renderUI() {
  laneEl.textContent = laneName(state.lane);
  polarityEl.textContent = polarityLabel(state.polarity);
  hullEl.textContent = String(state.hull);
  timerEl.textContent = state.phase === 'run' ? `${(state.remainingMs / 1000).toFixed(1)}s` : '--';
  dayEl.textContent = String(state.day);
  routeEl.textContent = routeLabel(state.route);

  coinsEl.textContent = String(state.coins);
  gemsEl.textContent = String(state.gems);
  lastPayoutEl.textContent = String(state.lastPayout);
  bestPayoutEl.textContent = String(state.bestPayout);
  totalRevenueEl.textContent = String(state.totalRevenue);
  vaultMultEl.textContent = `${getVaultMultiplier(state).toFixed(2)}x`;

  if (state.phase === 'run') {
    const preview = getPrismPreview(state);
    prismStateEl.textContent = preview.dividendReady
      ? (preview.dragRisk ? 'Dividend + Drag Risk' : 'Dividend Ready')
      : (preview.dragRisk ? 'Drag Risk' : 'Neutral');
    prismStateEl.style.color = preview.dividendReady ? '#d4742e' : '#7d624d';
  } else {
    prismStateEl.textContent = state.lastBreakdown.prismFlip
      ? (state.lastBreakdown.staticDrag ? 'Dividend + Drag Applied' : 'Dividend Applied')
      : (state.lastBreakdown.staticDrag ? 'Drag Applied' : 'Neutral');
    prismStateEl.style.color = state.lastBreakdown.prismFlip ? '#2f9e71' : '#7d624d';
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnStart.disabled = !dock;
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnBazaar.disabled = !dock;
  btnRoyal.disabled = !dock;
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
  grad.addColorStop(1, '#ffe9cb');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(236, 201, 161, 0.32)' : 'rgba(236, 201, 161, 0.17)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(148, 104, 68, 0.22)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  const bodyColor = state.polarity === 1 ? '#f1a44f' : '#f28aa5';
  ctx.fillStyle = bodyColor;
  ctx.fillRect(px - 16, py - 6, 32, 14);
  ctx.fillStyle = '#7f4d30';
  ctx.fillRect(px - 9, py - 15, 18, 8);

  ctx.fillStyle = '#3f2d23';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.polarity === 1 ? 'N' : 'S', px, py + 1);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'slag') {
      ctx.fillStyle = '#806b57';
      ctx.beginPath();
      ctx.moveTo(x - 11, y + 8);
      ctx.lineTo(x - 4, y - 10);
      ctx.lineTo(x + 1, y);
      ctx.lineTo(x + 8, y - 8);
      ctx.lineTo(x + 11, y + 8);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    const coreColor = token.polarity === 1 ? '#ffd07b' : '#ffb1c3';
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a3b2a';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${token.polarity === 1 ? 'N' : 'S'}${token.tier}`, x, y + 0.5);
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
btnToggle.addEventListener('click', () => apply(togglePolarity(state)));
btnStart.addEventListener('click', () => apply(startRun(state)));
btnMerge.addEventListener('click', () => apply(mergeBestPair(state)));

btnLocal.addEventListener('click', () => apply(chooseRoute(state, 'local')));
btnBazaar.addEventListener('click', () => apply(chooseRoute(state, 'bazaar')));
btnRoyal.addEventListener('click', () => apply(chooseRoute(state, 'royal')));

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
      apply(togglePolarity(state));
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

  apply(togglePolarity(state));
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
