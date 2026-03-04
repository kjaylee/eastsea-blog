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
  getVarietyPreview,
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
const varietyStateEl = $('varietyState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnStreet = $('btnStreet');
const btnBrunch = $('btnBrunch');
const btnExport = $('btnExport');

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
  return ['Left', 'Center', 'Right'][index] || 'Center';
}

function contractLabel(key) {
  return CONFIG.contracts[key]?.label || 'Street Stall';
}

function renderVarietyStatus() {
  if (state.phase === 'run') {
    const preview = getVarietyPreview(state);
    if (preview.oversupply) {
      varietyStateEl.textContent = 'Oversupply Risk';
      varietyStateEl.style.color = '#b45309';
      return;
    }
    if (preview.diverse) {
      varietyStateEl.textContent = 'Dividend Ready';
      varietyStateEl.style.color = '#2f9e71';
      return;
    }
    varietyStateEl.textContent = 'Building Variety';
    varietyStateEl.style.color = '#7a6657';
    return;
  }

  if (state.lastBreakdown?.oversupply) {
    varietyStateEl.textContent = 'Penalty Applied';
    varietyStateEl.style.color = '#b45309';
    return;
  }

  if (state.lastBreakdown?.diverse) {
    varietyStateEl.textContent = 'Dividend Applied';
    varietyStateEl.style.color = '#2f9e71';
    return;
  }

  varietyStateEl.textContent = 'Neutral';
  varietyStateEl.style.color = '#7a6657';
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

  renderVarietyStatus();

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnMerge.disabled = !dock;
  btnStreet.disabled = !dock;
  btnBrunch.disabled = !dock;
  btnExport.disabled = !dock;
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
  grad.addColorStop(0, '#fffdf5');
  grad.addColorStop(1, '#ffe9cc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 204, 160, 0.3)' : 'rgba(245, 204, 160, 0.16)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(150, 114, 82, 0.24)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  // player cart
  const px = laneX(state.lane, w);
  const py = h * 0.9;

  ctx.fillStyle = '#d97745';
  ctx.fillRect(px - 14, py - 10, 28, 20);
  ctx.fillStyle = '#8b5c3f';
  ctx.fillRect(px - 18, py + 8, 36, 7);

  // tokens
  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'crow') {
      ctx.fillStyle = '#7a604b';
      ctx.beginPath();
      ctx.moveTo(x, y - 11);
      ctx.lineTo(x - 12, y + 9);
      ctx.lineTo(x + 12, y + 9);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    const palette = ['#ffd38a', '#ffbf66', '#f59f43', '#e6772d', '#cc5c22'];
    const color = palette[Math.max(0, Math.min(4, token.tier - 1))];
    ctx.fillStyle = color;
    ctx.fillRect(x - 11, y - 11, 22, 22);

    ctx.fillStyle = '#5f3d29';
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

btnStreet.addEventListener('click', () => apply(chooseContract(state, 'street')));
btnBrunch.addEventListener('click', () => apply(chooseContract(state, 'brunch')));
btnExport.addEventListener('click', () => apply(chooseContract(state, 'export')));

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
