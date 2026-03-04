export const STORAGE_KEY = 'terrace_seed_graft_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1100,
  runMsCapBonus: 12000,
  spawnIntervalMs: 500,
  tokenSpeedPerMs: 0.00066,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  crateValueBase: 13,

  routes: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Terrace' },
    canal: { mult: 1.3, costCoins: 100, costGems: 0, label: 'Canal Market' },
    summit: { mult: 1.56, costCoins: 0, costGems: 2, label: 'Summit Exchange' },
  },

  plans: {
    reedplum: {
      label: 'Reed → Plum',
      pair: ['reed', 'plum'],
    },
    plumtea: {
      label: 'Plum → Tea',
      pair: ['plum', 'tea'],
    },
    teareed: {
      label: 'Tea → Reed',
      pair: ['tea', 'reed'],
    },
  },

  exactPairStep: 0.12,
  reversePairStep: 0.05,
  pairBonusCap: 0.45,
  wiltPenaltyMult: 0.76,
  crashMult: 0.58,
};

const TIER_KEYS = [1, 2, 3, 4, 5];
const SPECIES = ['reed', 'plum', 'tea'];

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

function getPlan(state) {
  return CONFIG.plans[state.plan] || CONFIG.plans.reedplum;
}

export function getHoldMultiplier(state) {
  return Number((1 + holdTierPoints(state.inventory)).toFixed(2));
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

function evaluateGraft(state) {
  const species = Array.isArray(state.runSpeciesLog) ? state.runSpeciesLog : [];
  const target = getPlan(state).pair;

  let exactPairs = 0;
  let reversePairs = 0;

  for (let i = 0; i < species.length - 1; i += 1) {
    const a = species[i];
    const b = species[i + 1];

    if (a === target[0] && b === target[1]) {
      exactPairs += 1;
      continue;
    }

    if (a === target[1] && b === target[0]) {
      reversePairs += 1;
    }
  }

  const pairBonus = Math.min(
    CONFIG.pairBonusCap,
    exactPairs * CONFIG.exactPairStep + reversePairs * CONFIG.reversePairStep,
  );

  const pairMultiplier = Number((1 + pairBonus).toFixed(4));
  const wilt = hasTripleSame(species);
  const wiltMultiplier = wilt ? CONFIG.wiltPenaltyMult : 1;

  return {
    exactPairs,
    reversePairs,
    wilt,
    pairMultiplier,
    wiltMultiplier,
    patternMultiplier: Number((pairMultiplier * wiltMultiplier).toFixed(4)),
  };
}

export function createInitialState(saved = {}) {
  const plan = CONFIG.plans[saved.plan] ? saved.plan : 'reedplum';

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
    runSpeciesLog: [],

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    route: 'local',
    plan,

    lastBreakdown: {
      holdMultiplier: 1,
      routeMultiplier: 1,
      pairMultiplier: 1,
      wiltMultiplier: 1,
      patternMultiplier: 1,
      crashMultiplier: 1,
      exactPairs: 0,
      reversePairs: 0,
      wilt: false,
    },

    outcome: 'Dock ready. Collect seedlings with the right stance and stitch graft pairs.',
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
    plan: state.plan,
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
  next.runSpeciesLog = [];

  next.outcome = `Run active (${getRoute(next).label}) — target graft ${getPlan(next).label}.`;
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
  next.outcome = next.mode === 1 ? 'Tool stance: Clip.' : 'Tool stance: Bind.';
  return next;
}

function randomCrateTier(rng) {
  const roll = rng();
  if (roll < 0.56) return 1;
  if (roll < 0.82) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function randomSpecies(rng) {
  const idx = Math.floor(rng() * SPECIES.length) % SPECIES.length;
  return SPECIES[Math.max(0, idx)];
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.26) {
    state.tokens.push({ lane, y: -0.08, kind: 'hazard', tier: 0, phase: 0, species: 'hazard' });
    return;
  }

  const tier = randomCrateTier(rng);
  const phase = rng() < 0.5 ? 1 : -1;
  const species = randomSpecies(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'crate', tier, phase, species });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    const rawSpecies = typeof token.species === 'string' ? token.species.toLowerCase() : 'reed';
    const species = SPECIES.includes(rawSpecies) ? rawSpecies : 'reed';

    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'hazard' ? 'hazard' : 'crate',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      phase: Number(token.phase) === -1 ? -1 : Number(token.phase) === 1 ? 1 : 0,
      species,
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'hazard') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Pest strike. Terrace hull dropped.';
    return;
  }

  if (token.phase !== state.mode) {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Stance mismatch. Seed pod spoiled.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const gain = tier * CONFIG.crateValueBase;

  state.runValue += gain;
  state.runCargo[tier] += 1;
  state.runCollectCount += 1;
  state.runSpeciesLog.push(token.species);
  state.outcome = `Secured ${token.species} pod T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const holdMultiplier = getHoldMultiplier(next);
  const routeMultiplier = getRoute(next).mult;
  const graft = evaluateGraft(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * holdMultiplier * routeMultiplier * graft.patternMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runCollectCount / 6) + (crashed ? 0 : 1) + Math.min(2, graft.exactPairs);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    holdMultiplier: Number(holdMultiplier.toFixed(2)),
    routeMultiplier,
    pairMultiplier: graft.pairMultiplier,
    wiltMultiplier: graft.wiltMultiplier,
    patternMultiplier: graft.patternMultiplier,
    crashMultiplier,
    exactPairs: graft.exactPairs,
    reversePairs: graft.reversePairs,
    wilt: graft.wilt,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.route = 'local';

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (graft.exactPairs > 0 && graft.wilt) {
    next.outcome = `Graft matches found, but wilt penalty applied. Payout +${payout}.`;
  } else if (graft.exactPairs > 0) {
    next.outcome = `Exact graft chain! Payout +${payout}, gems +${gemBonus}.`;
  } else if (graft.reversePairs > 0 && graft.wilt) {
    next.outcome = `Reverse graft chain with wilt penalty. Payout +${payout}.`;
  } else if (graft.reversePairs > 0) {
    next.outcome = `Reverse graft bonus. Payout +${payout}, gems +${gemBonus}.`;
  } else if (graft.wilt) {
    next.outcome = `Wilt penalty applied. Payout +${payout}, gems +${gemBonus}.`;
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
  next.outcome = `${route.label} booked.`;
  return next;
}

export function choosePlan(state, planKey) {
  if (state.phase !== 'dock') return state;

  const plan = CONFIG.plans[planKey];
  if (!plan) {
    const next = clone(state);
    next.outcome = 'Unknown graft plan.';
    return next;
  }

  if (state.plan === planKey) {
    const next = clone(state);
    next.outcome = `${plan.label} already selected.`;
    return next;
  }

  const next = clone(state);
  next.plan = planKey;
  next.outcome = `Graft plan armed: ${plan.label}.`;
  return next;
}

export function getEconomySnapshot(state) {
  const route = getRoute(state);
  const plan = getPlan(state);
  return {
    route: state.route,
    routeLabel: route.label,
    routeMultiplier: route.mult,
    plan: state.plan,
    planLabel: plan.label,
    holdMultiplier: Number(getHoldMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getPlanPreview(state) {
  const target = getPlan(state).pair;
  const species = Array.isArray(state.runSpeciesLog) ? state.runSpeciesLog : [];

  if (state.phase !== 'run') {
    return {
      exactPairs: 0,
      reversePairs: 0,
      wiltRisk: false,
      target,
    };
  }

  let exactPairs = 0;
  let reversePairs = 0;

  for (let i = 0; i < species.length - 1; i += 1) {
    const a = species[i];
    const b = species[i + 1];

    if (a === target[0] && b === target[1]) {
      exactPairs += 1;
      continue;
    }

    if (a === target[1] && b === target[0]) {
      reversePairs += 1;
    }
  }

  return {
    exactPairs,
    reversePairs,
    wiltRisk: hasTripleSame(species),
    target,
  };
}
