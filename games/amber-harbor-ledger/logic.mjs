export const STORAGE_KEY = 'amber_harbor_ledger_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 28000,
  runMsStep: 1300,
  runMsCapBonus: 14000,
  spawnIntervalMs: 530,
  tokenSpeedPerMs: 0.00063,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  parcelValueBase: 12,

  routes: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Pier' },
    fleet: { mult: 1.33, costCoins: 70, costGems: 0, label: 'Fleet Circuit' },
    guild: { mult: 1.58, costCoins: 0, costGems: 2, label: 'Guild Channel' },
  },

  wakeWeaveMult: 1.27,
  congestionMult: 0.74,
  crashMult: 0.56,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyInventory() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function normalizeInventory(input) {
  const inventory = emptyInventory();
  if (!input || typeof input !== 'object') return inventory;

  for (const key of TIER_KEYS) {
    const v = Number(input[key]);
    inventory[key] = Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  return inventory;
}

function clampLane(lane) {
  return Math.max(0, Math.min(CONFIG.laneCount - 1, lane));
}

function holdTierPoints(inventory) {
  return (
    inventory[1] * 0.04 +
    inventory[2] * 0.09 +
    inventory[3] * 0.16 +
    inventory[4] * 0.25 +
    inventory[5] * 0.38
  );
}

export function getHoldMultiplier(state) {
  return Number((1 + holdTierPoints(state.inventory)).toFixed(2));
}

function getRoute(state) {
  return CONFIG.routes[state.route] || CONFIG.routes.local;
}

function hasDistinctTriple(history) {
  if (!Array.isArray(history) || history.length < 3) return false;

  for (let i = 0; i <= history.length - 3; i += 1) {
    const a = history[i];
    const b = history[i + 1];
    const c = history[i + 2];
    if (a !== b && b !== c && a !== c) return true;
  }

  return false;
}

function hasTripleLaneStreak(history) {
  if (!Array.isArray(history) || history.length < 3) return false;

  let streak = 1;
  for (let i = 1; i < history.length; i += 1) {
    if (history[i] === history[i - 1]) {
      streak += 1;
      if (streak >= 3) return true;
    } else {
      streak = 1;
    }
  }

  return false;
}

function evaluateWakePattern(state) {
  const wakeWeave = hasDistinctTriple(state.runLaneHistory);
  const congestion = hasTripleLaneStreak(state.runLaneHistory);

  const weaveMultiplier = wakeWeave ? CONFIG.wakeWeaveMult : 1;
  const congestionMultiplier = congestion ? CONFIG.congestionMult : 1;

  return {
    wakeWeave,
    congestion,
    weaveMultiplier,
    congestionMultiplier,
    patternMultiplier: Number((weaveMultiplier * congestionMultiplier).toFixed(4)),
  };
}

export function createInitialState(saved = {}) {
  return {
    phase: 'dock',
    day: Number.isFinite(Number(saved.day)) ? Math.max(1, Math.floor(Number(saved.day))) : 1,

    lane: 1,
    mode: 1,
    hull: 3,
    remainingMs: 0,
    spawnBankMs: 0,
    tokens: [],

    runValue: 0,
    runCargo: emptyInventory(),
    runCollectCount: 0,
    runHits: 0,
    runLaneHistory: [],

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    route: 'local',

    lastBreakdown: {
      holdMultiplier: 1,
      routeMultiplier: 1,
      weaveMultiplier: 1,
      congestionMultiplier: 1,
      patternMultiplier: 1,
      crashMultiplier: 1,
      wakeWeave: false,
      congestion: false,
    },

    outcome: 'Dock ready. Match sail mode to parcel marks and route clean lanes.',
  };
}

export function serializeProgress(state) {
  return {
    day: state.day,
    coins: state.coins,
    gems: state.gems,
    totalRevenue: state.totalRevenue,
    bestPayout: state.bestPayout,
    inventory: state.inventory,
  };
}

export function startRun(state) {
  if (state.phase === 'run') return state;

  const next = clone(state);
  const bonus = Math.min((next.day - 1) * CONFIG.runMsStep, CONFIG.runMsCapBonus);

  next.phase = 'run';
  next.remainingMs = CONFIG.runMsBase + bonus;
  next.spawnBankMs = 0;
  next.tokens = [];

  next.lane = 1;
  next.mode = 1;
  next.hull = 3;
  next.runValue = 0;
  next.runCargo = emptyInventory();
  next.runCollectCount = 0;
  next.runHits = 0;
  next.runLaneHistory = [];

  next.outcome = `Run active (${getRoute(next).label}). Match mode marks and avoid driftwood.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  next.lane = clampLane(next.lane + delta);
  return next;
}

export function toggleMode(state) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  next.mode = next.mode === 1 ? -1 : 1;
  next.outcome = next.mode === 1 ? 'Sail mode switched to Breeze.' : 'Sail mode switched to Anchor.';
  return next;
}

function randomParcelTier(rng) {
  const roll = rng();
  if (roll < 0.55) return 1;
  if (roll < 0.8) return 2;
  if (roll < 0.93) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.28) {
    state.tokens.push({ lane, y: -0.08, kind: 'drift', tier: 0, mode: 0 });
    return;
  }

  const tier = randomParcelTier(rng);
  const mode = rng() < 0.5 ? 1 : -1;
  state.tokens.push({ lane, y: -0.08, kind: 'parcel', tier, mode });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'drift' ? 'drift' : 'parcel',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      mode: Number(token.mode) === -1 ? -1 : Number(token.mode) === 1 ? 1 : 0,
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'drift') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Hit driftwood. Hull integrity decreased.';
    return;
  }

  if (token.mode !== state.mode) {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Mode mismatch! Parcel cracked against the hull.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const gain = tier * CONFIG.parcelValueBase;

  state.runValue += gain;
  state.runCargo[tier] += 1;
  state.runCollectCount += 1;
  state.runLaneHistory.push(token.lane);
  state.outcome = `Delivered ${state.mode === 1 ? 'Breeze' : 'Anchor'} parcel T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const holdMultiplier = getHoldMultiplier(next);
  const routeMultiplier = getRoute(next).mult;
  const wake = evaluateWakePattern(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * holdMultiplier * routeMultiplier * wake.patternMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runCollectCount / 6) + (crashed ? 0 : 1);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    holdMultiplier: Number(holdMultiplier.toFixed(2)),
    routeMultiplier,
    weaveMultiplier: wake.weaveMultiplier,
    congestionMultiplier: wake.congestionMultiplier,
    patternMultiplier: wake.patternMultiplier,
    crashMultiplier,
    wakeWeave: wake.wakeWeave,
    congestion: wake.congestion,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.route = 'local';

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (wake.wakeWeave && wake.congestion) {
    next.outcome = `Wake Weave triggered but Congestion Toll applied. Payout +${payout}.`;
  } else if (wake.wakeWeave) {
    next.outcome = `Wake Weave Dividend triggered. Payout +${payout}, gems +${gemBonus}.`;
  } else if (wake.congestion) {
    next.outcome = `Congestion Toll applied. Payout +${payout}, gems +${gemBonus}.`;
  } else {
    next.outcome = `Run settled. Payout +${payout}, gems +${gemBonus}.`;
  }

  return next;
}

export function stepRun(state, dtMs, rng = Math.random) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const deltaMs = Math.max(0, Number(dtMs) || 0);

  next.remainingMs -= deltaMs;
  next.spawnBankMs += deltaMs;

  while (next.spawnBankMs >= CONFIG.spawnIntervalMs) {
    next.spawnBankMs -= CONFIG.spawnIntervalMs;
    spawnToken(next, rng);
  }

  const kept = [];
  for (const token of next.tokens) {
    token.y += CONFIG.tokenSpeedPerMs * deltaMs;

    if (token.y >= CONFIG.collisionY && token.lane === next.lane) {
      applyCollision(next, token);
      continue;
    }

    if (token.y <= CONFIG.maxTokenY) kept.push(token);
  }

  next.tokens = kept;

  if (next.hull <= 0) return settleRun(next, true);
  if (next.remainingMs <= 0) return settleRun(next, false);

  return next;
}

export function mergeBestPair(state) {
  if (state.phase !== 'dock') return state;

  const next = clone(state);

  for (let tier = CONFIG.maxTier - 1; tier >= 1; tier -= 1) {
    if (next.inventory[tier] >= 2) {
      next.inventory[tier] -= 2;
      next.inventory[tier + 1] += 1;
      next.outcome = `Merged T${tier}+T${tier} -> T${tier + 1}.`;
      return next;
    }
  }

  next.outcome = 'No merge pair available yet.';
  return next;
}

export function chooseRoute(state, routeKey) {
  if (state.phase !== 'dock') return state;

  const target = CONFIG.routes[routeKey];
  if (!target) {
    const next = clone(state);
    next.outcome = 'Unknown route.';
    return next;
  }

  if (state.route === routeKey) {
    const next = clone(state);
    next.outcome = `${target.label} already selected.`;
    return next;
  }

  const next = clone(state);

  if (target.costCoins > 0 && next.coins < target.costCoins) {
    next.outcome = `Need ${target.costCoins} coins for ${target.label}.`;
    return next;
  }

  if (target.costGems > 0 && next.gems < target.costGems) {
    next.outcome = `Need ${target.costGems} gems for ${target.label}.`;
    return next;
  }

  next.coins -= target.costCoins;
  next.gems -= target.costGems;
  next.route = routeKey;
  next.outcome = `${target.label} route booked.`;
  return next;
}

export function getEconomySnapshot(state) {
  const route = getRoute(state);
  return {
    route: state.route,
    routeLabel: route.label,
    routeMultiplier: route.mult,
    holdMultiplier: Number(getHoldMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getWakePreview(state) {
  if (state.phase !== 'run') {
    return {
      wakeWeaveReady: false,
      congestionRisk: false,
      mode: state.mode,
    };
  }

  return {
    wakeWeaveReady: hasDistinctTriple(state.runLaneHistory),
    congestionRisk: hasTripleLaneStreak(state.runLaneHistory),
    mode: state.mode,
  };
}
