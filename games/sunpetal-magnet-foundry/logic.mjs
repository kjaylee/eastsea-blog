export const STORAGE_KEY = 'sunpetal_magnet_foundry_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1400,
  runMsCapBonus: 15000,
  spawnIntervalMs: 520,
  tokenSpeedPerMs: 0.00064,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  coreValueBase: 13,

  routes: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Loop' },
    bazaar: { mult: 1.34, costCoins: 80, costGems: 0, label: 'Bazaar Belt' },
    royal: { mult: 1.62, costCoins: 0, costGems: 3, label: 'Royal Span' },
  },

  prismFlipMult: 1.29,
  staticDragMult: 0.78,
  crashMult: 0.55,
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

function vaultTierPoints(inventory) {
  return (
    inventory[1] * 0.04 +
    inventory[2] * 0.09 +
    inventory[3] * 0.16 +
    inventory[4] * 0.26 +
    inventory[5] * 0.4
  );
}

export function getVaultMultiplier(state) {
  return Number((1 + vaultTierPoints(state.inventory)).toFixed(2));
}

function getRoute(state) {
  return CONFIG.routes[state.route] || CONFIG.routes.local;
}

function hasAlternatingLast4Polarities(history) {
  if (!Array.isArray(history) || history.length < 4) return false;

  for (let i = 0; i <= history.length - 4; i += 1) {
    const a = history[i];
    const b = history[i + 1];
    const c = history[i + 2];
    const d = history[i + 3];

    if (a !== b && b !== c && c !== d && a === c && b === d) return true;
  }

  return false;
}

function hasThreeSamePolarity(history) {
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

function evaluatePrismFlip(state) {
  const prismFlip = hasAlternatingLast4Polarities(state.runPolarityHistory);
  const staticDrag = hasThreeSamePolarity(state.runPolarityHistory);

  const prismMultiplier = prismFlip ? CONFIG.prismFlipMult : 1;
  const dragMultiplier = staticDrag ? CONFIG.staticDragMult : 1;

  return {
    prismFlip,
    staticDrag,
    prismMultiplier,
    dragMultiplier,
    patternMultiplier: Number((prismMultiplier * dragMultiplier).toFixed(4)),
  };
}

export function createInitialState(saved = {}) {
  return {
    phase: 'dock',
    day: Number.isFinite(Number(saved.day)) ? Math.max(1, Math.floor(Number(saved.day))) : 1,

    lane: 1,
    polarity: 1,
    hull: 3,
    remainingMs: 0,
    spawnBankMs: 0,
    tokens: [],

    runValue: 0,
    runCargo: emptyInventory(),
    runCollectCount: 0,
    runHits: 0,
    runPolarityHistory: [],

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    route: 'local',

    lastBreakdown: {
      vaultMultiplier: 1,
      routeMultiplier: 1,
      prismMultiplier: 1,
      dragMultiplier: 1,
      patternMultiplier: 1,
      crashMultiplier: 1,
      prismFlip: false,
      staticDrag: false,
    },

    outcome: 'Dock ready. Switch polarity, catch matching cores, and refine the foundry.',
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
  next.polarity = 1;
  next.hull = 3;
  next.runValue = 0;
  next.runCargo = emptyInventory();
  next.runCollectCount = 0;
  next.runHits = 0;
  next.runPolarityHistory = [];

  next.outcome = `Run active (${getRoute(next).label}). Match N/S polarity and dodge slag.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  next.lane = clampLane(next.lane + delta);
  return next;
}

export function togglePolarity(state) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  next.polarity = next.polarity === 1 ? -1 : 1;
  next.outcome = next.polarity === 1 ? 'Polarity switched to North.' : 'Polarity switched to South.';
  return next;
}

function randomCoreTier(rng) {
  const roll = rng();
  if (roll < 0.56) return 1;
  if (roll < 0.81) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.3) {
    state.tokens.push({ lane, y: -0.08, kind: 'slag', tier: 0, polarity: 0 });
    return;
  }

  const tier = randomCoreTier(rng);
  const polarity = rng() < 0.5 ? 1 : -1;
  state.tokens.push({ lane, y: -0.08, kind: 'core', tier, polarity });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'slag' ? 'slag' : 'core',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      polarity: Number(token.polarity) === -1 ? -1 : Number(token.polarity) === 1 ? 1 : 0,
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'slag') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Slag collision. Hull integrity decreased.';
    return;
  }

  if (token.polarity !== state.polarity) {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Polarity shock! Core rejected and hull damaged.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const gain = tier * CONFIG.coreValueBase;

  state.runValue += gain;
  state.runCargo[tier] += 1;
  state.runCollectCount += 1;
  state.runPolarityHistory.push(state.polarity);
  state.outcome = `Collected ${state.polarity === 1 ? 'N' : 'S'} core T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const vaultMultiplier = getVaultMultiplier(next);
  const routeMultiplier = getRoute(next).mult;
  const prism = evaluatePrismFlip(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * vaultMultiplier * routeMultiplier * prism.patternMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runCollectCount / 7) + (crashed ? 0 : 1);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    vaultMultiplier: Number(vaultMultiplier.toFixed(2)),
    routeMultiplier,
    prismMultiplier: prism.prismMultiplier,
    dragMultiplier: prism.dragMultiplier,
    patternMultiplier: prism.patternMultiplier,
    crashMultiplier,
    prismFlip: prism.prismFlip,
    staticDrag: prism.staticDrag,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.route = 'local';

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (prism.prismFlip && prism.staticDrag) {
    next.outcome = `Prism Flip landed but Static Drag applied. Payout +${payout}.`;
  } else if (prism.prismFlip) {
    next.outcome = `Prism Flip Dividend triggered. Payout +${payout}, gems +${gemBonus}.`;
  } else if (prism.staticDrag) {
    next.outcome = `Static Drag penalty applied. Payout +${payout}, gems +${gemBonus}.`;
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
    vaultMultiplier: Number(getVaultMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getPrismPreview(state) {
  if (state.phase !== 'run') {
    return {
      dividendReady: false,
      dragRisk: false,
      polarity: state.polarity,
    };
  }

  return {
    dividendReady: hasAlternatingLast4Polarities(state.runPolarityHistory),
    dragRisk: hasThreeSamePolarity(state.runPolarityHistory),
    polarity: state.polarity,
  };
}
