import {
  STORAGE_KEY,
  CONFIG,
  createInitialState,
  serializeProgress,
  startWave,
  stepWave,
  moveLane,
  mergeBestPair,
  activateSponsorBoost,
  buyPremiumPass,
  getDeckMultiplier,
  getEconomySnapshot,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const refs = {
  canvas: $('gameCanvas'),
  lane: $('lane'),
  shield: $('shield'),
  timer: $('timer'),
  wave: $('wave'),
  coins: $('coins'),
  gems: $('gems'),
  deckMult: $('deckMult'),
  sponsorState: $('sponsorState'),
  premiumState: $('premiumState'),
  outcome: $('outcome'),
  lastRevenue: $('lastRevenue'),
  bestRevenue: $('bestRevenue'),
  totalRevenue: $('totalRevenue'),

  inv1: $('inv1'),
  inv2: $('inv2'),
  inv3: $('inv3'),
  inv4: $('inv4'),
  inv5: $('inv5'),

  btnStart: $('btnStart'),
  btnLeft: $('btnLeft'),
  btnRight: $('btnRight'),
  btnMerge: $('btnMerge'),
  btnSponsor: $('btnSponsor'),
  btnPremium: $('btnPremium'),
};

const ctx = refs.canvas.getContext('2d');
let state = loadState();

let dpr = 1;
let width = 0;
let height = 0;
let rafId = 0;
let lastFrameAt = performance.now();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return createInitialState(JSON.parse(raw));
  } catch {
    return createInitialState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProgress(state)));
  } catch {
    // ignore storage failures
  }
}

function formatTimer(ms) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return `${sec}s`;
}

function laneLabel(lane) {
  return ['Left', 'Center', 'Right'][lane] || 'Center';
}

function updateHud() {
  refs.lane.textContent = laneLabel(state.lane);
  refs.shield.textContent = String(state.shield);
  refs.timer.textContent = state.phase === 'wave' ? formatTimer(state.remainingMs) : '--';
  refs.wave.textContent = String(state.wave);

  refs.coins.textContent = String(state.coins);
  refs.gems.textContent = String(state.gems);
  refs.deckMult.textContent = `${getDeckMultiplier(state).toFixed(2)}x`;
  refs.sponsorState.textContent = state.sponsorActive ? 'Armed' : state.sponsorReady ? 'Ready' : 'Spent';
  refs.premiumState.textContent = state.premiumPass ? 'Owned' : 'Locked';

  refs.lastRevenue.textContent = String(state.lastWaveRevenue);
  refs.bestRevenue.textContent = String(state.bestWaveRevenue);
  refs.totalRevenue.textContent = String(state.totalRevenue);

  refs.outcome.textContent = state.outcome;

  refs.inv1.textContent = String(state.inventory[1]);
  refs.inv2.textContent = String(state.inventory[2]);
  refs.inv3.textContent = String(state.inventory[3]);
  refs.inv4.textContent = String(state.inventory[4]);
  refs.inv5.textContent = String(state.inventory[5]);

  refs.btnStart.disabled = state.phase === 'wave';
  refs.btnMerge.disabled = state.phase !== 'dock';
  refs.btnSponsor.disabled = state.phase !== 'dock';
  refs.btnPremium.disabled = state.phase !== 'dock' || state.premiumPass;
}

function resizeCanvas() {
  const rect = refs.canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  refs.canvas.width = Math.floor(width * dpr);
  refs.canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#111827');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 1; i < CONFIG.laneCount; i += 1) {
    const x = (width / CONFIG.laneCount) * i;
    ctx.strokeStyle = 'rgba(148,163,184,.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function laneCenter(lane) {
  const laneW = width / CONFIG.laneCount;
  return laneW * lane + laneW * 0.5;
}

function drawShip() {
  const x = laneCenter(state.lane);
  const y = height * 0.9;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x - 18, y + 16);
  ctx.lineTo(x + 18, y + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(x, y + 4, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawTokens() {
  for (const token of state.tokens) {
    const x = laneCenter(token.lane);
    const y = token.y * height;

    if (token.kind === 'mine') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.moveTo(x + 8, y - 8);
      ctx.lineTo(x - 8, y + 8);
      ctx.stroke();
      continue;
    }

    const tierColors = {
      1: '#a7f3d0',
      2: '#34d399',
      3: '#10b981',
      4: '#059669',
      5: '#047857',
    };

    ctx.fillStyle = tierColors[token.tier] || '#22c55e';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#052e16';
    ctx.font = 'bold 12px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T${token.tier}`, x, y + 1);
  }
}

function drawDockOverlay() {
  if (state.phase === 'wave') return;

  ctx.fillStyle = 'rgba(2,6,23,.56)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 20px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('Dock Mode', width / 2, height * 0.36);

  ctx.font = '500 14px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('Merge chips, arm sponsor boost, and launch the next wave.', width / 2, height * 0.42);
  ctx.fillText('Hybrid loop: lane dodging + merge economy + monetization decisions.', width / 2, height * 0.47);
}

function render() {
  drawBackground();
  drawTokens();
  drawShip();
  drawDockOverlay();
}

function step(now) {
  const dt = Math.min(80, now - lastFrameAt);
  lastFrameAt = now;

  if (state.phase === 'wave') {
    state = stepWave(state, dt);

    if (state.phase === 'dock') {
      saveState();
    }
  }

  updateHud();
  render();
  rafId = requestAnimationFrame(step);
}

function bindControls() {
  refs.btnStart.addEventListener('click', () => {
    state = startWave(state);
    updateHud();
  });

  refs.btnLeft.addEventListener('click', () => {
    state = moveLane(state, -1);
    updateHud();
  });

  refs.btnRight.addEventListener('click', () => {
    state = moveLane(state, 1);
    updateHud();
  });

  refs.btnMerge.addEventListener('click', () => {
    state = mergeBestPair(state);
    saveState();
    updateHud();
  });

  refs.btnSponsor.addEventListener('click', () => {
    state = activateSponsorBoost(state);
    saveState();
    updateHud();
  });

  refs.btnPremium.addEventListener('click', () => {
    state = buyPremiumPass(state);
    saveState();
    updateHud();
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (key === 'arrowleft' || key === 'a') {
      state = moveLane(state, -1);
      updateHud();
    }

    if (key === 'arrowright' || key === 'd') {
      state = moveLane(state, 1);
      updateHud();
    }

    if (key === ' ' || key === 'enter') {
      if (state.phase !== 'wave') {
        state = startWave(state);
        updateHud();
      }
      event.preventDefault();
    }
  });

  const pointerLane = (clientX) => {
    const rect = refs.canvas.getBoundingClientRect();
    const laneW = rect.width / CONFIG.laneCount;
    const lane = Math.max(0, Math.min(CONFIG.laneCount - 1, Math.floor((clientX - rect.left) / laneW)));
    return lane;
  };

  refs.canvas.addEventListener('pointerdown', (event) => {
    if (state.phase !== 'wave') return;
    const nextLane = pointerLane(event.clientX);
    if (nextLane < state.lane) state = moveLane(state, -1);
    if (nextLane > state.lane) state = moveLane(state, 1);
    updateHud();
  });
}

function init() {
  const snapshot = getEconomySnapshot(state);
  state.outcome = `Dock initialized. Deck ${snapshot.deckMultiplier.toFixed(2)}x. Launch when ready.`;

  bindControls();
  resizeCanvas();
  updateHud();
  render();

  window.addEventListener('resize', resizeCanvas);

  lastFrameAt = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(step);
}

init();
