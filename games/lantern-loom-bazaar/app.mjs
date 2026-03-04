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
  chooseContract,
  getHoldMultiplier,
  getContractPreview,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const laneEl = $('lane');
const modeEl = $('mode');
const hullEl = $('hull');
const timerEl = $('timer');
const dayEl = $('day');
const routeEl = $('route');
const contractEl = $('contract');
const coinsEl = $('coins');
const gemsEl = $('gems');
const lastPayoutEl = $('lastPayout');
const bestPayoutEl = $('bestPayout');
const totalRevenueEl = $('totalRevenue');
const holdMultEl = $('holdMult');
const contractStateEl = $('contractState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnToggle = $('btnToggle');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnGuild = $('btnGuild');
const btnMoon = $('btnMoon');
const btnContractA = $('btnContractA');
const btnContractB = $('btnContractB');
const btnContractC = $('btnContractC');

const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');

const SYMBOL_LABEL = {
  sun: 'Su',
  leaf: 'Le',
  wave: 'Wa',
};

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
  return ['Stall A', 'Stall B', 'Stall C'][index] || 'Stall B';
}

function routeLabel(key) {
  return CONFIG.routes[key]?.label || 'Local Arcade';
}

function contractLabel(key) {
  return CONFIG.contracts[key]?.label || CONFIG.contracts.sunleafwave.label;
}

function modeLabel(v) {
  return v === 1 ? 'Dawn' : 'Dusk';
}

function renderUI() {
  laneEl.textContent = laneName(state.lane);
  modeEl.textContent = modeLabel(state.mode);
  hullEl.textContent = String(state.hull);
  timerEl.textContent = state.phase === 'run' ? `${(state.remainingMs / 1000).toFixed(1)}s` : '--';
  dayEl.textContent = String(state.day);
  routeEl.textContent = routeLabel(state.route);
  contractEl.textContent = contractLabel(state.contract);

  coinsEl.textContent = String(state.coins);
  gemsEl.textContent = String(state.gems);
  lastPayoutEl.textContent = String(state.lastPayout);
  bestPayoutEl.textContent = String(state.bestPayout);
  totalRevenueEl.textContent = String(state.totalRevenue);
  holdMultEl.textContent = `${getHoldMultiplier(state).toFixed(2)}x`;

  if (state.phase === 'run') {
    const preview = getContractPreview(state);
    contractStateEl.textContent = preview.exactReady
      ? (preview.tangleRisk ? 'Exact Ready + Tangle Risk' : 'Exact Ready')
      : preview.reverseReady
      ? (preview.tangleRisk ? 'Reverse Ready + Tangle Risk' : 'Reverse Ready')
      : preview.tangleRisk
      ? 'Tangle Risk'
      : 'Neutral';
    contractStateEl.style.color = preview.exactReady ? '#2f8d5a' : '#6a5a4d';
  } else {
    contractStateEl.textContent = state.lastBreakdown.exact
      ? (state.lastBreakdown.tangle ? 'Exact + Tangle Applied' : 'Exact Bonus Applied')
      : state.lastBreakdown.reverse
      ? (state.lastBreakdown.tangle ? 'Reverse + Tangle Applied' : 'Reverse Bonus Applied')
      : state.lastBreakdown.tangle
      ? 'Tangle Penalty Applied'
      : 'Neutral';
    contractStateEl.style.color = state.lastBreakdown.exact ? '#2f8d5a' : '#6a5a4d';
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnStart.disabled = !dock;
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnGuild.disabled = !dock;
  btnMoon.disabled = !dock;
  btnContractA.disabled = !dock;
  btnContractB.disabled = !dock;
  btnContractC.disabled = !dock;
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
  grad.addColorStop(1, '#efe3cf');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(163, 188, 149, 0.2)' : 'rgba(219, 197, 163, 0.2)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(114, 92, 70, 0.16)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  const bodyColor = state.mode === 1 ? '#d5a25f' : '#6f8770';
  ctx.fillStyle = bodyColor;
  ctx.fillRect(px - 17, py - 7, 34, 15);
  ctx.fillStyle = '#5a4434';
  ctx.fillRect(px - 10, py - 16, 20, 8);

  ctx.fillStyle = '#2a2218';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.mode === 1 ? 'D' : 'K', px, py + 1);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'hazard') {
      ctx.fillStyle = '#8e6f58';
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

    ctx.fillStyle = token.phase === 1 ? '#f2cc8c' : '#c6d8c2';
    ctx.beginPath();
    ctx.roundRect(x - 12, y - 11, 24, 22, 7);
    ctx.fill();

    ctx.fillStyle = '#4f4033';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const marker = `${token.phase === 1 ? 'D' : 'K'}${SYMBOL_LABEL[token.symbol] || 'Su'}`;
    ctx.fillText(marker, x, y + 1);
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
btnGuild.addEventListener('click', () => apply(chooseRoute(state, 'guild')));
btnMoon.addEventListener('click', () => apply(chooseRoute(state, 'moon')));

btnContractA.addEventListener('click', () => apply(chooseContract(state, 'sunleafwave')));
btnContractB.addEventListener('click', () => apply(chooseContract(state, 'leafwavesun')));
btnContractC.addEventListener('click', () => apply(chooseContract(state, 'wavesunleaf')));

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
