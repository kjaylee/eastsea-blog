export const STORAGE_KEY = 'sunlit_kite_mercantile_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1200,
  runMsCapBonus: 14000,
  spawnIntervalMs: 580,
  tokenSpeedPerMs: 0.00062,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  harvestValueBase: 12,

  contracts: {
    market: { mult: 1, costCoins: 0, costGems: 0, label: 'Market' },
    hotel: { mult: 1.28, costCoins: 55, costGems: 0, label: 'Hotel' },
    festival: { mult: 1.52, costCoins: 0, costGems: 3, label: 'Festival' },
  },

  hotelSpoilageMult: 0.72,
  tailwindTaxThreshold: 8,
  tailwindTaxMult: 0.82,
  crashMult: 0.6,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyInventory() {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
}

function clampLane(lane) {
  return Math.max(0, Math.min(CONFIG.laneCount - 1, lane));
}

function normalizeInventory(input) {
  const inventory = emptyInventory();
  if (!input || typeof input !== 'object') return inventory;

  for (const key of TIER_KEYS) {
    const value = Number(input[key]);
    inventory[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  return inventory;
}

function deckTierPoints(inventory) {
  return (
    inventory[1] * 0.04 +
    inventory[2] * 0.09 +
    inventory[3] * 0.16 +
    inventory[4] * 0.27 +
    inventory[5] * 0.4
  );
}

export function getDeckMultiplier(state) {
  return Number((1 + deckTierPoints(state.inventory)).toFixed(2));
}

export function createInitialState(saved = {}) {
  return {
    phase: 'dock',
    day: Number.isFinite(Number(saved.day)) ? Math.max(1, Math.floor(Number(saved.day))) : 1,

    lane: 1,
    hull: 3,
    remainingMs: 0,
    spawnBankMs: 0,
    tokens: [],

    runValue: 0,
    runCargo: emptyInventory(),
    runHarvestCount: 0,
    runHits: 0,
    runMoves: 0,

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    contract: 'market',

    lastBreakdown: {
      deckMultiplier: 1,
      contractMultiplier: 1,
      spoilageMultiplier: 1,
      tailwindMultiplier: 1,
      crashMultiplier: 1,
      taxed: false,
    },

    outcome: 'Dock open. Merge baskets, choose a contract, and launch.',
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
  next.hull = 3;
  next.runValue = 0;
  next.runCargo = emptyInventory();
  next.runHarvestCount = 0;
  next.runHits = 0;
  next.runMoves = 0;

  next.outcome = `Run live (${CONFIG.contracts[next.contract].label} contract). Harvest baskets, avoid crows.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  const prev = next.lane;
  next.lane = clampLane(next.lane + delta);

  if (next.lane !== prev) {
    next.runMoves += 1;
  }

  return next;
}

function randomBasketTier(rng) {
  const roll = rng();
  if (roll < 0.58) return 1;
  if (roll < 0.84) return 2;
  if (roll < 0.96) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.3) {
    state.tokens.push({ lane, y: -0.08, kind: 'crow', tier: 0 });
    return;
  }

  const tier = randomBasketTier(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'basket', tier });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'crow' ? 'crow' : 'basket',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'crow') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Crow strike! Cargo net integrity down.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const value = tier * CONFIG.harvestValueBase;
  state.runValue += value;
  state.runCargo[tier] += 1;
  state.runHarvestCount += 1;
  state.outcome = `Collected Sunfruit T${tier}.`;
}

function getContract(state) {
  return CONFIG.contracts[state.contract] || CONFIG.contracts.market;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const deckMultiplier = getDeckMultiplier(next);
  const contractMultiplier = getContract(next).mult;
  const spoilageMultiplier = next.contract === 'hotel' && next.runHits > 0 ? CONFIG.hotelSpoilageMult : 1;
  const taxed = next.runMoves >= CONFIG.tailwindTaxThreshold;
  const tailwindMultiplier = taxed ? CONFIG.tailwindTaxMult : 1;
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(
      next.runValue * deckMultiplier * contractMultiplier * spoilageMultiplier * tailwindMultiplier * crashMultiplier,
    ),
  );

  const gemBonus = Math.floor(next.runHarvestCount / 7) + (crashed ? 0 : 1);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    deckMultiplier: Number(deckMultiplier.toFixed(2)),
    contractMultiplier,
    spoilageMultiplier,
    tailwindMultiplier,
    crashMultiplier,
    taxed,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.contract = 'market';

  next.outcome = crashed
    ? `Run failed. Emergency payout ${payout} coins.`
    : `Run cleared. Payout +${payout}, gems +${gemBonus}${taxed ? ' (Tailwind Tax applied)' : ''}.`;

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

    if (token.y <= CONFIG.maxTokenY) {
      kept.push(token);
    }
  }

  next.tokens = kept;

  if (next.hull <= 0) {
    return settleRun(next, true);
  }

  if (next.remainingMs <= 0) {
    return settleRun(next, false);
  }

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

  next.outcome = 'No mergeable basket pairs.';
  return next;
}

export function chooseContract(state, contractKey) {
  if (state.phase !== 'dock') return state;

  const target = CONFIG.contracts[contractKey];
  if (!target) {
    const next = clone(state);
    next.outcome = 'Unknown contract.';
    return next;
  }

  if (state.contract === contractKey) {
    const next = clone(state);
    next.outcome = `${target.label} contract already selected.`;
    return next;
  }

  const next = clone(state);

  if (target.costCoins > 0 && next.coins < target.costCoins) {
    next.outcome = `Need ${target.costCoins} coins to reserve ${target.label}.`;
    return next;
  }

  if (target.costGems > 0 && next.gems < target.costGems) {
    next.outcome = `Need ${target.costGems} gems to reserve ${target.label}.`;
    return next;
  }

  next.coins -= target.costCoins;
  next.gems -= target.costGems;
  next.contract = contractKey;
  next.outcome = `${target.label} contract reserved.`;
  return next;
}

export function getEconomySnapshot(state) {
  const c = getContract(state);
  return {
    contract: state.contract,
    contractLabel: c.label,
    contractMultiplier: c.mult,
    deckMultiplier: Number(getDeckMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}
