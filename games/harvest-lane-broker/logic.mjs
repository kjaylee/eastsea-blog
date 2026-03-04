export const STORAGE_KEY = 'harvest_lane_broker_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1300,
  runMsCapBonus: 13000,
  spawnIntervalMs: 600,
  tokenSpeedPerMs: 0.0006,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  crateValueBase: 14,

  contracts: {
    street: { mult: 1, costCoins: 0, costGems: 0, label: 'Street Stall' },
    brunch: { mult: 1.25, costCoins: 50, costGems: 0, label: 'Brunch Club' },
    export: { mult: 1.5, costCoins: 0, costGems: 3, label: 'Export Dock' },
  },

  varietyDividendMult: 1.22,
  oversupplyPenaltyMult: 0.78,
  oversupplyThreshold: 0.7,
  oversupplyMinCargo: 4,
  crashMult: 0.58,
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
    inventory[3] * 0.17 +
    inventory[4] * 0.28 +
    inventory[5] * 0.42
  );
}

export function getDeckMultiplier(state) {
  return Number((1 + deckTierPoints(state.inventory)).toFixed(2));
}

function getContract(state) {
  return CONFIG.contracts[state.contract] || CONFIG.contracts.street;
}

function evaluateVariety(runCargo, runHarvestCount) {
  const diverse = runCargo[1] > 0 && runCargo[2] > 0 && runCargo[3] > 0;

  let topShare = 0;
  if (runHarvestCount > 0) {
    for (let tier = 1; tier <= 5; tier += 1) {
      topShare = Math.max(topShare, runCargo[tier] / runHarvestCount);
    }
  }

  const oversupply = runHarvestCount >= CONFIG.oversupplyMinCargo && topShare >= CONFIG.oversupplyThreshold;

  let diversityMultiplier = 1;
  if (diverse) diversityMultiplier *= CONFIG.varietyDividendMult;
  if (oversupply) diversityMultiplier *= CONFIG.oversupplyPenaltyMult;

  return {
    diverse,
    oversupply,
    diversityMultiplier: Number(diversityMultiplier.toFixed(4)),
  };
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

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    contract: 'street',

    lastBreakdown: {
      deckMultiplier: 1,
      contractMultiplier: 1,
      diversityMultiplier: 1,
      crashMultiplier: 1,
      diverse: false,
      oversupply: false,
    },

    outcome: 'Dock is open. Merge crates, pick a contract, then launch.',
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

  next.outcome = `Run live (${getContract(next).label}). Gather crates and avoid storm crows.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  next.lane = clampLane(next.lane + delta);
  return next;
}

function randomCrateTier(rng) {
  const roll = rng();
  if (roll < 0.56) return 1;
  if (roll < 0.82) return 2;
  if (roll < 0.95) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.3) {
    state.tokens.push({ lane, y: -0.08, kind: 'crow', tier: 0 });
    return;
  }

  const tier = randomCrateTier(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'crate', tier });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'crow' ? 'crow' : 'crate',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'crow') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Storm crow collision. Cart durability dropped.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const value = tier * CONFIG.crateValueBase;
  state.runValue += value;
  state.runCargo[tier] += 1;
  state.runHarvestCount += 1;
  state.outcome = `Collected crate T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const deckMultiplier = getDeckMultiplier(next);
  const contractMultiplier = getContract(next).mult;
  const variety = evaluateVariety(next.runCargo, next.runHarvestCount);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * deckMultiplier * contractMultiplier * variety.diversityMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runHarvestCount / 6) + (crashed ? 0 : 1);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    deckMultiplier: Number(deckMultiplier.toFixed(2)),
    contractMultiplier,
    diversityMultiplier: Number(variety.diversityMultiplier.toFixed(4)),
    crashMultiplier,
    diverse: variety.diverse,
    oversupply: variety.oversupply,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.contract = 'street';

  if (crashed) {
    next.outcome = `Run crashed. Emergency payout ${payout} coins.`;
  } else if (variety.diverse && !variety.oversupply) {
    next.outcome = `Variety Dividend secured. Payout +${payout}, gems +${gemBonus}.`;
  } else if (variety.oversupply) {
    next.outcome = `Oversupply penalty applied. Payout +${payout}, gems +${gemBonus}.`;
  } else {
    next.outcome = `Run cleared. Payout +${payout}, gems +${gemBonus}.`;
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

  next.outcome = 'No mergeable pair. Bring more crates from the next run.';
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
  next.contract = contractKey;
  next.outcome = `${target.label} contract reserved.`;
  return next;
}

export function getEconomySnapshot(state) {
  const contract = getContract(state);
  return {
    contract: state.contract,
    contractLabel: contract.label,
    contractMultiplier: contract.mult,
    deckMultiplier: Number(getDeckMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getVarietyPreview(state) {
  return evaluateVariety(state.runCargo, state.runHarvestCount);
}
