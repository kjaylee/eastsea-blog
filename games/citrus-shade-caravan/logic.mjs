export const STORAGE_KEY = 'citrus_shade_caravan_save_v1';

export const CONFIG = {
  laneCount: 3,
  runMsBase: 30000,
  runMsStep: 1100,
  runMsCapBonus: 12000,
  spawnIntervalMs: 520,
  tokenSpeedPerMs: 0.00066,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  crateValueBase: 13,

  contracts: {
    stall: { mult: 1, costCoins: 0, costGems: 0, label: 'Town Stall' },
    market: { mult: 1.34, costCoins: 80, costGems: 0, label: 'Market Route' },
    festival: { mult: 1.62, costCoins: 0, costGems: 4, label: 'Festival Route' },
  },

  shadeSwapMult: 1.24,
  crowdPenaltyMult: 0.84,
  crashMult: 0.56,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyInventory() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
    inventory[1] * 0.05 +
    inventory[2] * 0.1 +
    inventory[3] * 0.17 +
    inventory[4] * 0.28 +
    inventory[5] * 0.42
  );
}

export function getDeckMultiplier(state) {
  return Number((1 + deckTierPoints(state.inventory)).toFixed(2));
}

function getContract(state) {
  return CONFIG.contracts[state.contract] || CONFIG.contracts.stall;
}

function hasAlternatingToneLast4(history) {
  if (!Array.isArray(history) || history.length < 4) return false;
  const seq = history.slice(-4);
  const tonesOk = seq.every((tone) => tone === 'sun' || tone === 'shade');
  return tonesOk && seq[0] !== seq[1] && seq[1] !== seq[2] && seq[2] !== seq[3] && seq[0] === seq[2] && seq[1] === seq[3];
}

function hasThreeLaneStreak(laneHistory) {
  if (!Array.isArray(laneHistory) || laneHistory.length < 3) return false;
  let streak = 1;
  for (let i = 1; i < laneHistory.length; i += 1) {
    if (laneHistory[i] === laneHistory[i - 1]) {
      streak += 1;
      if (streak >= 3) return true;
    } else {
      streak = 1;
    }
  }
  return false;
}

function evaluateChain(state) {
  const shadeSwap = state.shadeSwapConsumed > 0;
  const crowdPenalty = hasThreeLaneStreak(state.runLaneCollectHistory);

  const shadeMultiplier = shadeSwap ? CONFIG.shadeSwapMult : 1;
  const crowdMultiplier = crowdPenalty ? CONFIG.crowdPenaltyMult : 1;

  return {
    shadeSwap,
    crowdPenalty,
    shadeMultiplier,
    crowdMultiplier,
    chainMultiplier: Number((shadeMultiplier * crowdMultiplier).toFixed(4)),
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
    runLaneCollectHistory: [],
    runToneHistory: [],
    shadeSwapCharge: 0,
    shadeSwapConsumed: 0,

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    contract: 'stall',

    lastBreakdown: {
      deckMultiplier: 1,
      contractMultiplier: 1,
      shadeMultiplier: 1,
      crowdMultiplier: 1,
      chainMultiplier: 1,
      crashMultiplier: 1,
      shadeSwap: false,
      crowdPenalty: false,
    },

    outcome: 'Caravan ready. Merge crates, pick contract, and start run.',
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
  next.runLaneCollectHistory = [];
  next.runToneHistory = [];
  next.shadeSwapCharge = 0;
  next.shadeSwapConsumed = 0;

  next.outcome = `Run active (${getContract(next).label}). Alternate sun/shade pickups to charge Shade Swap.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  next.lane = clampLane(next.lane + delta);
  return next;
}

function randomTier(rng) {
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
    state.tokens.push({ lane, y: -0.08, kind: 'cart', tier: 0, tone: 'neutral' });
    return;
  }

  const tier = randomTier(rng);
  const tone = rng() < 0.5 ? 'sun' : 'shade';
  state.tokens.push({ lane, y: -0.08, kind: 'crate', tier, tone });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'cart' ? 'cart' : 'crate',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
      tone: token.tone === 'shade' ? 'shade' : token.tone === 'sun' ? 'sun' : 'neutral',
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'cart') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Cart impact. Caravan frame damaged.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const tone = token.tone === 'shade' ? 'shade' : 'sun';
  const amplified = state.shadeSwapCharge > 0;
  const units = amplified ? 2 : 1;
  const gain = tier * CONFIG.crateValueBase * units;

  state.runValue += gain;
  state.runCargo[tier] += units;
  state.runHarvestCount += units;
  state.runLaneCollectHistory.push(token.lane);
  state.runToneHistory.push(tone);

  if (amplified) {
    state.shadeSwapCharge = Math.max(0, state.shadeSwapCharge - 1);
    state.shadeSwapConsumed += 1;
    state.outcome = `Shade Swap surge: ${tone} crate T${tier} doubled.`;
    return;
  }

  if (hasAlternatingToneLast4(state.runToneHistory)) {
    state.shadeSwapCharge = Math.min(1, state.shadeSwapCharge + 1);
    state.outcome = 'Shade Swap charged. Next crate pickup is doubled.';
    return;
  }

  state.outcome = `Loaded ${tone} crate T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const deckMultiplier = getDeckMultiplier(next);
  const contractMultiplier = getContract(next).mult;
  const chain = evaluateChain(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * deckMultiplier * contractMultiplier * chain.chainMultiplier * crashMultiplier),
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
    shadeMultiplier: chain.shadeMultiplier,
    crowdMultiplier: chain.crowdMultiplier,
    chainMultiplier: chain.chainMultiplier,
    crashMultiplier,
    shadeSwap: chain.shadeSwap,
    crowdPenalty: chain.crowdPenalty,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.contract = 'stall';
  next.shadeSwapCharge = 0;

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (chain.shadeSwap && chain.crowdPenalty) {
    next.outcome = `Shade Swap hit, but crowd penalty reduced payout to ${payout}.`;
  } else if (chain.shadeSwap) {
    next.outcome = `Shade Swap bonus secured. Payout +${payout}, gems +${gemBonus}.`;
  } else if (chain.crowdPenalty) {
    next.outcome = `Crowd penalty applied. Payout +${payout}, gems +${gemBonus}.`;
  } else {
    next.outcome = `Route cleared. Payout +${payout}, gems +${gemBonus}.`;
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

  next.outcome = 'No merge pair available. Collect more crates first.';
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

export function getShadePreview(state) {
  if (state.phase !== 'run') {
    return {
      shadeReady: false,
      crowdRisk: false,
      charges: 0,
    };
  }

  return {
    shadeReady: state.shadeSwapCharge > 0,
    crowdRisk: hasThreeLaneStreak(state.runLaneCollectHistory),
    charges: state.shadeSwapCharge,
  };
}
