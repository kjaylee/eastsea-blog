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
const patternStateEl = $('patternState');
const outcomeEl = $('outcome');

const invEls = [null, $('inv1'), $('inv2'), $('inv3'), $('inv4'), $('inv5')];

const btnLeft = $('btnLeft');
const btnRight = $('btnRight');
const btnStart = $('btnStart');
const btnMerge = $('btnMerge');
const btnLocal = $('btnLocal');
const btnBoutique = $('btnBoutique');
const btnGallery = $('btnGallery');

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
  if (state.phase === 'dock') {
    saveState(state);
  }
  renderUI();
}

function laneName(index) {
  return ['West', 'Center', 'East'][index] || 'Center';
}

function contractLabel(key) {
  return CONFIG.contracts[key]?.label || 'Local';
}

function runPatternState() {
  const h = state.runTierHistory || [];

  let crossStitch = false;
  for (let i = 0; i <= h.length - 4; i += 1) {
    if (
      (h[i] % 2) !== (h[i + 1] % 2) &&
      (h[i + 1] % 2) !== (h[i + 2] % 2) &&
      (h[i + 2] % 2) !== (h[i + 3] % 2)
    ) {
      crossStitch = true;
      break;
    }
  }

  let monotone = false;
  for (let i = 0; i <= h.length - 3; i += 1) {
    if (h[i] === h[i + 1] && h[i + 1] === h[i + 2]) {
      monotone = true;
      break;
    }
  }

  if (crossStitch && monotone) return 'Dividend + Penalty';
  if (crossStitch) return 'Dividend Ready';
  if (monotone) return 'Penalty Risk';
  return 'Neutral';
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

  if (state.phase === 'run') {
    patternStateEl.textContent = runPatternState();
    patternStateEl.style.color = '#cc6f2d';
  } else {
    patternStateEl.textContent = state.lastBreakdown.crossStitch
      ? (state.lastBreakdown.monotoneBolt ? 'Dividend + Penalty' : 'Dividend Applied')
      : (state.lastBreakdown.monotoneBolt ? 'Penalty Applied' : 'Neutral');
    patternStateEl.style.color = state.lastBreakdown.crossStitch ? '#2f9e71' : '#7d624d';
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    invEls[tier].textContent = String(state.inventory[tier]);
  }

  outcomeEl.textContent = state.outcome;

  const dock = state.phase === 'dock';
  btnMerge.disabled = !dock;
  btnLocal.disabled = !dock;
  btnBoutique.disabled = !dock;
  btnGallery.disabled = !dock;
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
  grad.addColorStop(0, '#fffdf7');
  grad.addColorStop(1, '#ffe8cb');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const laneWidth = w / CONFIG.laneCount;
  for (let i = 0; i < CONFIG.laneCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(234, 194, 153, 0.30)' : 'rgba(234, 194, 153, 0.16)';
    ctx.fillRect(i * laneWidth, 0, laneWidth, h);

    ctx.strokeStyle = 'rgba(147, 101, 63, 0.22)';
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, h);
    ctx.stroke();
  }

  const px = laneX(state.lane, w);
  const py = h * 0.9;

  ctx.fillStyle = '#e98041';
  ctx.fillRect(px - 18, py - 6, 36, 14);
  ctx.fillStyle = '#7f4d30';
  ctx.fillRect(px - 10, py - 14, 20, 8);

  for (const token of state.tokens) {
    const x = laneX(token.lane, w);
    const y = token.y * h;

    if (token.kind === 'reef') {
      ctx.fillStyle = '#7d6a58';
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 8);
      ctx.lineTo(x - 4, y - 11);
      ctx.lineTo(x + 2, y + 1);
      ctx.lineTo(x + 10, y - 9);
      ctx.lineTo(x + 12, y + 8);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    const palette = ['#ffd79f', '#ffbf76', '#f6a75a', '#eb8b3f', '#d8742c'];
    const color = palette[Math.max(0, Math.min(4, token.tier - 1))];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a3b2a';
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
    if (state.phase === 'dock') {
      saveState(state);
    }
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

btnLocal.addEventListener('click', () => apply(chooseContract(state, 'local')));
btnBoutique.addEventListener('click', () => apply(chooseContract(state, 'boutique')));
btnGallery.addEventListener('click', () => apply(chooseContract(state, 'gallery')));

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
