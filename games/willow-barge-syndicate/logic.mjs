export const STORAGE_KEY = 'willow_barge_syndicate_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 29000,
  runMsStep: 1250,
  runMsCapBonus: 13000,
  spawnIntervalMs: 520,
  tokenSpeedPerMs: 0.00064,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  crateValueBase: 13,

  routes: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Locks' },
    trader: { mult: 1.36, costCoins: 80, costGems: 0, label: 'Trader Canal' },
    consortium: { mult: 1.62, costCoins: 0, costGems: 2, label: 'Consortium Drift' },
  },

  relayBonusMult: 1.34,
  siltPenaltyMult: 0.72,
  crashMult: 0.58,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function emptyInventory() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function normalizeInventory(input) {
  const out = emptyInventory();
  if (!input || typeof input !== 'object') return out;

  for (const key of TIER_KEYS) {
    const n = Number(input[key]);
    out[key] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  return out;
}

function clampLane(lane) {
  return Math.max(0, Math.min(CONFIG.laneCount - 1, lane));
}

function holdTierPoints(inv) {
  return inv[1] * 0.04 + inv[2] * 0.09 + inv[3] * 0.17 + inv[4] * 0.26 + inv[5] * 0.39;
}

export function getHoldMultiplier(state) {
  return Number((1 + holdTierPoints(state.inventory)).toFixed(2));
}

function getRoute(state) {
  return CONFIG.routes[state.route] || CONFIG.routes.local;
}

function hasRelayTriple(log) {
  if (!Array.isArray(log) || log.length < 3) return false;

  for (let i = 0; i <= log.length - 3; i += 1) {
    const a = log[i];
    const b = log[i + 1];
    const c = log[i + 2];

    const laneDistinct = a.lane !== b.lane && b.lane !== c.lane && a.lane !== c.lane;
    const modeAlternating = a.mode !== b.mode && b.mode !== c.mode && a.mode === c.mode;

    if (laneDistinct && modeAlternating) return true;
  }

  return false;
}

function hasSiltTriple(log) {
  if (!Array.isArray(log) || log.length < 3) return false;

  for (let i = 0; i <= log.length - 3; i += 1) {
    const a = log[i];
    const b = log[i + 1];
    const c = log[i + 2];

    const sameLane = a.lane === b.lane && b.lane === c.lane;
    const sameMode = a.mode === b.mode && b.mode === c.mode;
    if (sameLane || sameMode) return true;
  }

  return false;
}

function evaluatePattern(state) {
  const relay = hasRelayTriple(state.runPatternLog);
  const silt = hasSiltTriple(state.runPatternLog);

  const relayMultiplier = relay ? CONFIG.relayBonusMult : 1;
  const siltMultiplier = silt ? CONFIG.siltPenaltyMult : 1;

  return {
    relay,
    silt,
    relayMultiplier,
    siltMultiplier,
    patternMultiplier: Number((relayMultiplier * siltMultiplier).toFixed(4)),
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
    runPatternLog: [],

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
      relayMultiplier: 1,
      siltMultiplier: 1,
      patternMultiplier: 1,
      crashMultiplier: 1,
      relay: false,
      silt: false,
    },

    outcome: 'Dock ready. Match tide marks, keep moving, and avoid debris.',
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
  next.runPatternLog = [];

  next.outcome = `Run active (${getRoute(next).label}). Relay clean crates and dodge debris.`;
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
  next.outcome = next.mode === 1 ? 'Tide mode set to Sun.' : 'Tide mode set to Shadow.';
  return next;
}

function randomCrateTier(rng) {
  const roll = rng();
  if (roll < 0.56) return 1;
  if (roll < 0.81) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.27) {
    state.tokens.push({ lane, y: -0.08, kind: 'debris', tier: 0, mode: 0 });
    return;
  }

  const tier = randomCrateTier(rng);
  const mode = rng() < 0.5 ? 1 : -1;
  state.tokens.push({ lane, y: -0.08, kind: 'crate', tier, mode });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'debris' ? 'debris' : 'crate',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      mode: Number(token.mode) === -1 ? -1 : Number(token.mode) === 1 ? 1 : 0,
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'debris') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Debris impact. Hull integrity dropped.';
    return;
  }

  if (token.mode !== state.mode) {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Mark mismatch! Crate cracked at the bow.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const gain = tier * CONFIG.crateValueBase;

  state.runValue += gain;
  state.runCargo[tier] += 1;
  state.runCollectCount += 1;
  state.runPatternLog.push({ lane: token.lane, mode: token.mode });
  state.outcome = `Secured ${token.mode === 1 ? 'Sun' : 'Shadow'} crate T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const holdMultiplier = getHoldMultiplier(next);
  const routeMultiplier = getRoute(next).mult;
  const pattern = evaluatePattern(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * holdMultiplier * routeMultiplier * pattern.patternMultiplier * crashMultiplier),
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
    relayMultiplier: pattern.relayMultiplier,
    siltMultiplier: pattern.siltMultiplier,
    patternMultiplier: pattern.patternMultiplier,
    crashMultiplier,
    relay: pattern.relay,
    silt: pattern.silt,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.route = 'local';

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (pattern.relay && pattern.silt) {
    next.outcome = `Relay bonus met but Silt Lock also triggered. Payout +${payout}.`;
  } else if (pattern.relay) {
    next.outcome = `Canal Relay Bonus triggered. Payout +${payout}, gems +${gemBonus}.`;
  } else if (pattern.silt) {
    next.outcome = `Silt Lock penalty applied. Payout +${payout}, gems +${gemBonus}.`;
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

  const route = CONFIG.routes[routeKey];
  if (!route) {
    const next = clone(state);
    next.outcome = 'Unknown route.';
    return next;
  }

  if (state.route === routeKey) {
    const next = clone(state);
    next.outcome = `${route.label} already selected.`;
    return next;
  }

  const next = clone(state);

  if (route.costCoins > 0 && next.coins < route.costCoins) {
    next.outcome = `Need ${route.costCoins} coins for ${route.label}.`;
    return next;
  }

  if (route.costGems > 0 && next.gems < route.costGems) {
    next.outcome = `Need ${route.costGems} gems for ${route.label}.`;
    return next;
  }

  next.coins -= route.costCoins;
  next.gems -= route.costGems;
  next.route = routeKey;
  next.outcome = `${route.label} route booked.`;
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

export function getPatternPreview(state) {
  if (state.phase !== 'run') {
    return {
      relayReady: false,
      siltRisk: false,
      mode: state.mode,
    };
  }

  return {
    relayReady: hasRelayTriple(state.runPatternLog),
    siltRisk: hasSiltTriple(state.runPatternLog),
    mode: state.mode,
  };
}
