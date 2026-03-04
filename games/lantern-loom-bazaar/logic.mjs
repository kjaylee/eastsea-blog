export const STORAGE_KEY = 'lantern_loom_bazaar_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1200,
  runMsCapBonus: 12000,
  spawnIntervalMs: 510,
  tokenSpeedPerMs: 0.00066,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  crateValueBase: 14,

  routes: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Arcade' },
    guild: { mult: 1.33, costCoins: 90, costGems: 0, label: 'Guild Arcade' },
    moon: { mult: 1.59, costCoins: 0, costGems: 2, label: 'Moon Arcade' },
  },

  contracts: {
    sunleafwave: {
      label: 'Sun → Leaf → Wave',
      symbols: ['sun', 'leaf', 'wave'],
    },
    leafwavesun: {
      label: 'Leaf → Wave → Sun',
      symbols: ['leaf', 'wave', 'sun'],
    },
    wavesunleaf: {
      label: 'Wave → Sun → Leaf',
      symbols: ['wave', 'sun', 'leaf'],
    },
  },

  sequenceExactMult: 1.42,
  sequenceReverseMult: 1.18,
  tanglePenaltyMult: 0.74,
  crashMult: 0.57,
};

const TIER_KEYS = [1, 2, 3, 4, 5];
const SYMBOLS = ['sun', 'leaf', 'wave'];

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

function getRoute(state) {
  return CONFIG.routes[state.route] || CONFIG.routes.local;
}

function getContract(state) {
  return CONFIG.contracts[state.contract] || CONFIG.contracts.sunleafwave;
}

export function getHoldMultiplier(state) {
  return Number((1 + holdTierPoints(state.inventory)).toFixed(2));
}

function hasSequence(log, targetSymbols) {
  if (!Array.isArray(log) || !Array.isArray(targetSymbols) || targetSymbols.length === 0) return false;
  if (log.length < targetSymbols.length) return false;

  for (let i = 0; i <= log.length - targetSymbols.length; i += 1) {
    let ok = true;
    for (let j = 0; j < targetSymbols.length; j += 1) {
      if (log[i + j] !== targetSymbols[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  return false;
}

function hasTripleSame(log) {
  if (!Array.isArray(log) || log.length < 3) return false;

  for (let i = 0; i <= log.length - 3; i += 1) {
    if (log[i] === log[i + 1] && log[i + 1] === log[i + 2]) {
      return true;
    }
  }

  return false;
}

function evaluateSequence(state) {
  const symbols = Array.isArray(state.runSymbolLog) ? state.runSymbolLog : [];
  const target = getContract(state).symbols;

  const exact = hasSequence(symbols, target);
  const reverse = !exact && hasSequence(symbols, [...target].reverse());
  const tangle = hasTripleSame(symbols);

  const sequenceMultiplier = exact ? CONFIG.sequenceExactMult : reverse ? CONFIG.sequenceReverseMult : 1;
  const tangleMultiplier = tangle ? CONFIG.tanglePenaltyMult : 1;

  return {
    exact,
    reverse,
    tangle,
    sequenceMultiplier,
    tangleMultiplier,
    patternMultiplier: Number((sequenceMultiplier * tangleMultiplier).toFixed(4)),
  };
}

export function createInitialState(saved = {}) {
  const contract = CONFIG.contracts[saved.contract] ? saved.contract : 'sunleafwave';

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
    runSymbolLog: [],

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    route: 'local',
    contract,

    lastBreakdown: {
      holdMultiplier: 1,
      routeMultiplier: 1,
      sequenceMultiplier: 1,
      tangleMultiplier: 1,
      patternMultiplier: 1,
      crashMultiplier: 1,
      exact: false,
      reverse: false,
      tangle: false,
    },

    outcome: 'Dock ready. Weave contracts, shift lantern phase, and dodge hazards.',
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
    contract: state.contract,
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
  next.runSymbolLog = [];

  next.outcome = `Run active (${getRoute(next).label}) — target ${getContract(next).label}.`;
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
  next.outcome = next.mode === 1 ? 'Lantern phase set to Dawn.' : 'Lantern phase set to Dusk.';
  return next;
}

function randomCrateTier(rng) {
  const roll = rng();
  if (roll < 0.56) return 1;
  if (roll < 0.81) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function randomSymbol(rng) {
  const idx = Math.floor(rng() * SYMBOLS.length) % SYMBOLS.length;
  return SYMBOLS[Math.max(0, idx)];
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.26) {
    state.tokens.push({ lane, y: -0.08, kind: 'hazard', tier: 0, phase: 0, symbol: 'hazard' });
    return;
  }

  const tier = randomCrateTier(rng);
  const phase = rng() < 0.5 ? 1 : -1;
  const symbol = randomSymbol(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'crate', tier, phase, symbol });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    const rawSymbol = typeof token.symbol === 'string' ? token.symbol.toLowerCase() : 'sun';
    const symbol = SYMBOLS.includes(rawSymbol) ? rawSymbol : 'sun';

    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'hazard' ? 'hazard' : 'crate',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      phase: Number(token.phase) === -1 ? -1 : Number(token.phase) === 1 ? 1 : 0,
      symbol,
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'hazard') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Hazard hit. Lantern cart integrity dropped.';
    return;
  }

  if (token.phase !== state.mode) {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Phase mismatch! Crate shattered.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const gain = tier * CONFIG.crateValueBase;

  state.runValue += gain;
  state.runCargo[tier] += 1;
  state.runCollectCount += 1;
  state.runSymbolLog.push(token.symbol);
  state.outcome = `Secured ${token.symbol} crate T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const holdMultiplier = getHoldMultiplier(next);
  const routeMultiplier = getRoute(next).mult;
  const sequence = evaluateSequence(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * holdMultiplier * routeMultiplier * sequence.patternMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runCollectCount / 6) + (crashed ? 0 : 1) + (sequence.exact ? 1 : 0);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    holdMultiplier: Number(holdMultiplier.toFixed(2)),
    routeMultiplier,
    sequenceMultiplier: sequence.sequenceMultiplier,
    tangleMultiplier: sequence.tangleMultiplier,
    patternMultiplier: sequence.patternMultiplier,
    crashMultiplier,
    exact: sequence.exact,
    reverse: sequence.reverse,
    tangle: sequence.tangle,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.route = 'local';

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (sequence.exact && sequence.tangle) {
    next.outcome = `Contract matched but tangle penalty applied. Payout +${payout}.`;
  } else if (sequence.exact) {
    next.outcome = `Exact contract weave! Payout +${payout}, gems +${gemBonus}.`;
  } else if (sequence.reverse && sequence.tangle) {
    next.outcome = `Reverse weave found with tangle penalty. Payout +${payout}.`;
  } else if (sequence.reverse) {
    next.outcome = `Reverse contract weave bonus. Payout +${payout}, gems +${gemBonus}.`;
  } else if (sequence.tangle) {
    next.outcome = `Tangle penalty applied. Payout +${payout}, gems +${gemBonus}.`;
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

export function chooseContract(state, contractKey) {
  if (state.phase !== 'dock') return state;

  const contract = CONFIG.contracts[contractKey];
  if (!contract) {
    const next = clone(state);
    next.outcome = 'Unknown contract.';
    return next;
  }

  if (state.contract === contractKey) {
    const next = clone(state);
    next.outcome = `${contract.label} already selected.`;
    return next;
  }

  const next = clone(state);
  next.contract = contractKey;
  next.outcome = `Contract armed: ${contract.label}.`;
  return next;
}

export function getEconomySnapshot(state) {
  const route = getRoute(state);
  const contract = getContract(state);
  return {
    route: state.route,
    routeLabel: route.label,
    routeMultiplier: route.mult,
    contract: state.contract,
    contractLabel: contract.label,
    holdMultiplier: Number(getHoldMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getContractPreview(state) {
  const target = getContract(state).symbols;
  const symbols = Array.isArray(state.runSymbolLog) ? state.runSymbolLog : [];

  if (state.phase !== 'run') {
    return {
      exactReady: false,
      reverseReady: false,
      tangleRisk: false,
      target,
    };
  }

  return {
    exactReady: hasSequence(symbols, target),
    reverseReady: hasSequence(symbols, [...target].reverse()),
    tangleRisk: hasTripleSame(symbols),
    target,
  };
}
